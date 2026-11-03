import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { fetchApi } from './api';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import Storefront from './pages/Storefront';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';

const Navbar = () => {
  const { user, logoutUser, cart } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  const handleLogout = async () => {
    try {
      await fetchApi('/auth/logout', { method: 'POST' });
      logoutUser();
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-40 border-b border-white/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight text-slate-900">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200">◆</span>
          <span className="hidden sm:inline">Nexa Store</span>
        </Link>

        {!isLoginPage && (
        <div className="flex items-center gap-1.5 sm:gap-3">
          <Link to="/" className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-violet-50 hover:text-violet-700">
            Store
          </Link>
          <Link to="/cart" className="relative rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-violet-50 hover:text-violet-700">
            Cart
            {totalCartItems > 0 && (
              <span className="ml-1.5 inline-flex min-w-5 justify-center rounded-full bg-violet-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {totalCartItems}
              </span>
            )}
          </Link>

          {user?.isAdmin && (
            <Link to="/admin" className="hidden rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100 sm:block">
              Admin
            </Link>
          )}

          {user ? (
            <button
              onClick={handleLogout}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              Logout
            </button>
          ) : (
            <Link to="/login" className="primary-button !px-4 !py-2 text-sm">
              Login
            </Link>
          )}
        </div>
        )}
      </div>
    </nav>
  );
};

// Protected Route Wrapper
const ProtectedRoute = ({ children, requireAdmin }) => {
  const user = useStore((state) => state.user);
  const authLoading = useStore((state) => state.authLoading);

  if (authLoading) {
    return <div className="p-8 text-center text-gray-600">Verifying session...</div>;
  }

  // If not logged in, force redirect to /login
  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && !user.isAdmin) return <Navigate to="/" replace />;

  return children;
};

function App() {
  const setUser = useStore((state) => state.setUser);
  const setAuthLoading = useStore((state) => state.setAuthLoading);

  // Check HTTP-only cookie on application start
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const userData = await fetchApi('/auth/me');
        setUser(userData);
      } catch {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    restoreSession();
  }, [setUser, setAuthLoading]);

  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <main>
          <Routes>
            {/* Unprotected Login Route */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Store & Shopping Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Storefront />
              </ProtectedRoute>
            } />

            <Route path="/product/:id" element={
              <ProtectedRoute>
                <ProductPage />
              </ProtectedRoute>
            } />

            <Route path="/cart" element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            } />

            <Route path="/checkout" element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            } />

            {/* Admin-only Route */}
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
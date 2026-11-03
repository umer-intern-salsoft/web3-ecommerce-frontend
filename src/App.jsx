import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
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
    <nav className="p-4 bg-gray-800 text-white flex justify-between items-center shadow-md">
      <Link to="/" className="font-bold text-xl hover:text-gray-300">
        Web3 Shop
      </Link>
      
      <div className="flex items-center gap-6">
        <Link to="/" className="hover:text-gray-300">Store</Link>
        <Link to="/cart" className="hover:text-gray-300">
          Cart ({totalCartItems})
        </Link>
        
        {user?.isAdmin && (
          <Link to="/admin" className="bg-yellow-600 px-3 py-1 rounded text-sm font-semibold hover:bg-yellow-500">
            Admin Panel
          </Link>
        )}

        {user ? (
          <button 
            onClick={handleLogout} 
            className="bg-red-600 px-3 py-1 rounded text-sm hover:bg-red-500"
          >
            Logout
          </button>
        ) : (
          <Link to="/login" className="bg-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-500">
            Login
          </Link>
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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto">
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
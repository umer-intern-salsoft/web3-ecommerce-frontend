import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';

// Placeholder Components (To be built in Step 4 and 5)
const Navbar = () => <nav className="p-4 bg-gray-800 text-white font-bold">Web3 Shop</nav>;
const Storefront = () => <div className="p-8">Storefront / Landing Page</div>;
const ProductPage = () => <div className="p-8">Product Details</div>;
const CartPage = () => <div className="p-8">Shopping Cart</div>;
const CheckoutPage = () => <div className="p-8">Checkout & Web3 Payment</div>;
const LoginPage = () => <div className="p-8">Login / Register</div>;
const AdminDashboard = () => <div className="p-8">Admin Dashboard</div>;

// Protected Route Wrapper
const ProtectedRoute = ({ children, requireAdmin }) => {
  const user = useStore((state) => state.user);
  
  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && !user.isAdmin) return <Navigate to="/" replace />;
  
  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto">
          <Routes>
            <Route path="/" element={<Storefront />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected User Route */}
            <Route path="/checkout" element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            } />

            {/* Protected Admin Route */}
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
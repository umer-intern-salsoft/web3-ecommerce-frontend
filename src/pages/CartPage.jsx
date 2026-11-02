import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function CartPage() {
  const { cart, removeFromCart, clearCart, getCartTotal, user } = useStore();
  const navigate = useNavigate();

  const totalEth = getCartTotal();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {cart.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-500 mb-4">Your cart is currently empty.</p>
          <Link to="/" className="inline-block bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow divide-y">
            {cart.map((item) => (
              <div key={item.product.id} className="p-4 flex items-center justify-between gap-4">
                <img 
                  src={item.product.imageUrl} 
                  alt={item.product.name} 
                  className="w-16 h-16 object-cover rounded" 
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                  }}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.product.name}</h3>
                  <p className="text-sm text-gray-500">{item.product.priceEth} ETH each</p>
                </div>
                <div className="text-sm font-medium text-gray-700">
                  Qty: {item.quantity}
                </div>
                <div className="font-bold text-indigo-600">
                  {(item.product.priceEth * item.quantity).toFixed(4)} ETH
                </div>
                <button 
                  onClick={() => removeFromCart(item.product.id)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-lg shadow flex flex-col md:flex-row justify-between items-center gap-4">
            <button 
              onClick={clearCart} 
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear Cart
            </button>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <span className="text-sm text-gray-500 block">Total Price:</span>
                <span className="text-2xl font-extrabold text-indigo-600">{totalEth.toFixed(4)} ETH</span>
              </div>
              <button
                onClick={() => navigate(user ? '/checkout' : '/login')}
                className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 shadow"
              >
                {user ? 'Proceed to Checkout' : 'Log in to Checkout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
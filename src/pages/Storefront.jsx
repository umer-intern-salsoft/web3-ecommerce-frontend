import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchApi } from '../api';
import { useStore } from '../store/useStore';

export default function Storefront() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const addToCart = useStore((state) => state.addToCart);

  useEffect(() => {
    let isMounted = true;

    fetchApi('/products')
      .then((data) => {
        if (isMounted) setProducts(data);
      })
      .catch(console.error)
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-600">Loading shop inventory...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Featured Products</h1>
      
      {products.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
          No products available in the shop yet. Add some in the Admin Panel!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col justify-between hover:shadow-lg transition-shadow"
            >
              <div>
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                  }}
                />
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2 text-gray-900">{product.name}</h2>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">{product.description}</p>
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-indigo-600 text-lg font-bold">{product.priceEth} ETH</span>
                    <span className={product.stockQuantity > 0 ? 'text-green-600' : 'text-red-500'}>
                      {product.stockQuantity > 0 ? `${product.stockQuantity} available` : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0 space-y-2">
                <Link 
                  to={`/product/${product.id}`} 
                  className="block text-center w-full bg-gray-100 text-gray-700 py-2 rounded font-medium hover:bg-gray-200"
                >
                  View Details
                </Link>
                <button
                  disabled={product.stockQuantity <= 0}
                  onClick={() => addToCart(product)}
                  className={`w-full py-2 rounded font-medium text-white transition ${
                    product.stockQuantity > 0 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
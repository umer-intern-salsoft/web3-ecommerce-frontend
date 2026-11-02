import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchApi } from '../api';
import { useStore } from '../store/useStore';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const addToCart = useStore((state) => state.addToCart);

  useEffect(() => {
    let isMounted = true;

    fetchApi(`/products/${id}`)
      .then((data) => {
        if (isMounted) setProduct(data);
      })
      .catch(() => {
        if (isMounted) setProduct(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-600">Loading product details...</div>;
  if (!product) return <div className="p-8 text-center text-red-500">Product not found.</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button 
        onClick={() => navigate('/')} 
        className="mb-6 text-sm font-medium text-indigo-600 hover:underline"
      >
        &larr; Back to Store
      </button>

      <div className="bg-white rounded-lg shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-2">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-80 object-cover" 
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
          }}
        />
        <div className="p-6 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>
            <div className="mb-6">
              <span className="text-3xl font-extrabold text-indigo-600">{product.priceEth} ETH</span>
              <p className={`mt-2 text-sm font-medium ${product.stockQuantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
              </p>
            </div>
          </div>

          <button
            disabled={product.stockQuantity <= 0}
            onClick={() => addToCart(product)}
            className={`w-full py-3 rounded-lg text-white font-semibold shadow transition ${
              product.stockQuantity > 0 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
}
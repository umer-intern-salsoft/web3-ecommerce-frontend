import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchApi } from '../api';
import { useStore } from '../store/useStore';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ethUsd, setEthUsd] = useState(null);
  const [priceError, setPriceError] = useState('');
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

  useEffect(() => {
    fetchApi('/pricing/eth-usd')
      .then((data) => setEthUsd(data.ethUsd))
      .catch(() => setPriceError('Live ETH conversion is temporarily unavailable.'));
  }, []);

  if (loading) return <div className="p-16 text-center font-medium text-slate-500">Loading product details...</div>;
  if (!product) return <div className="p-16 text-center text-red-500">Product not found.</div>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <button 
        onClick={() => navigate('/')} 
        className="mb-6 rounded-xl px-1 py-2 text-sm font-bold text-violet-600 hover:text-violet-800"
      >
        &larr; Back to store
      </button>

      <div className="surface-card grid overflow-hidden md:grid-cols-2">
        <div className="min-h-80 bg-slate-100 md:min-h-[34rem]">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="h-full w-full object-cover" 
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/700x700?text=No+Image';
            }}
          />
        </div>
        <div className="flex flex-col justify-between p-6 sm:p-10">
          <div>
            <span className="eyebrow">Featured product</span>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-slate-900">{product.name}</h1>
            <p className="my-6 leading-7 text-slate-500">{product.description}</p>
            <div className="mb-8 rounded-2xl bg-slate-50 p-5">
              <span className="text-3xl font-black text-violet-600">
                ${Number(product.priceUsd).toFixed(2)}
              </span>
              {ethUsd ? (
                <p className="mt-2 text-sm font-semibold text-slate-600">
                  ≈ {(product.priceUsd / ethUsd).toFixed(6)} ETH
                  <span className="ml-2 font-normal text-slate-400">
                    at ${ethUsd.toLocaleString()} / ETH
                  </span>
                </p>
              ) : (
                <p className="mt-2 text-xs text-slate-400">
                  {priceError || 'Loading live ETH equivalent...'}
                </p>
              )}
              <p className={`mt-2 text-sm font-bold ${product.stockQuantity > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
              </p>
            </div>
          </div>

          <button
            disabled={product.stockQuantity <= 0}
            onClick={() => addToCart(product)}
            className={`w-full rounded-xl py-3.5 font-bold text-white transition ${
              product.stockQuantity > 0 
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-200 hover:-translate-y-0.5' 
                : 'cursor-not-allowed bg-slate-300'
            }`}
          >
            {product.stockQuantity > 0 ? 'Add to cart' : 'Out of stock'}
          </button>
        </div>
      </div>
    </div>
  );
}
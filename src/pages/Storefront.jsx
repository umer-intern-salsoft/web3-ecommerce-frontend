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
    return <div className="p-16 text-center font-medium text-slate-500">Loading the collection...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <section className="relative mb-12 overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-12 text-white shadow-2xl shadow-slate-300 sm:px-12 sm:py-16">
        <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full bg-violet-500/30 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative max-w-2xl">
          <span className="eyebrow !text-violet-300">Curated for you</span>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] sm:text-6xl">Digital shopping, powered by crypto.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
            Discover our latest products and check out securely with your favorite wallet.
          </p>
        </div>
      </section>

      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <span className="eyebrow">The collection</span>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Featured products</h2>
        </div>
        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-500 shadow-sm">{products.length} items</span>
      </div>
      
      {products.length === 0 ? (
        <div className="surface-card p-10 text-center text-slate-500">
          No products available in the shop yet. Add some in the Admin Panel!
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200"
            >
              <div>
                <div className="relative overflow-hidden bg-slate-100">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/600x450?text=No+Image';
                    }}
                  />
                  <span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold backdrop-blur ${
                    product.stockQuantity > 0 ? 'bg-white/90 text-emerald-700' : 'bg-red-50/90 text-red-600'
                  }`}>
                      {product.stockQuantity > 0 ? `${product.stockQuantity} available` : 'Out of Stock'}
                  </span>
                </div>
                <div className="p-5">
                  <h2 className="text-lg font-bold text-slate-900">{product.name}</h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{product.description}</p>
                  <span className="mt-4 block text-xl font-black text-violet-600">
                    ${Number(product.priceUsd).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-5 pt-0">
                <Link 
                  to={`/product/${product.id}`} 
                  className="secondary-button text-sm"
                >
                  Details
                </Link>
                <button
                  disabled={product.stockQuantity <= 0}
                  onClick={() => addToCart(product)}
                  className={`rounded-xl px-3 py-2.5 text-sm font-bold text-white transition ${
                    product.stockQuantity > 0 
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-lg hover:shadow-violet-200' 
                      : 'cursor-not-allowed bg-slate-300'
                  }`}
                >
                  {product.stockQuantity > 0 ? 'Add to cart' : 'Sold out'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
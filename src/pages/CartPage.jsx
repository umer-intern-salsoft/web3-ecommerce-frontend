import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    clearCart,
    getCartTotalUsd,
    increaseQuantity,
    decreaseQuantity,
    user
  } = useStore();
  const navigate = useNavigate();

  const totalUsd = getCartTotalUsd();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <span className="eyebrow">Your selection</span>
        <h1 className="page-title mt-2">Shopping cart</h1>
      </div>

      {cart.length === 0 ? (
        <div className="surface-card px-6 py-16 text-center">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-violet-50 text-2xl">◇</div>
          <h2 className="text-xl font-bold text-slate-900">Your cart is empty</h2>
          <p className="mb-6 mt-2 text-slate-500">Find something you love in our collection.</p>
          <Link to="/" className="primary-button">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
          <div className="surface-card divide-y divide-slate-100 overflow-hidden">
            {cart.map((item) => (
              <div key={item.product.id} className="grid grid-cols-[80px_1fr] gap-4 p-4 sm:grid-cols-[96px_1fr_auto] sm:items-center sm:p-5">
                <img 
                  src={item.product.imageUrl} 
                  alt={item.product.name} 
                  className="h-20 w-20 rounded-2xl object-cover sm:h-24 sm:w-24"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                  }}
                />
                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold text-slate-900 sm:text-lg">{item.product.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">${Number(item.product.priceUsd).toFixed(2)} each</p>
                  <button 
                    onClick={() => removeFromCart(item.product.id)}
                    className="mt-3 text-xs font-bold text-red-500 transition hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                <div className="col-span-2 flex items-center justify-between gap-4 sm:col-span-1 sm:flex-col sm:items-end">
                  <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                    <button
                      type="button"
                      aria-label={`Decrease ${item.product.name} quantity`}
                      onClick={() => decreaseQuantity(item.product.id)}
                      className="grid h-8 w-8 place-items-center rounded-lg text-lg font-bold text-slate-600 transition hover:bg-white hover:text-violet-700"
                    >
                      −
                    </button>
                    <span className="min-w-9 text-center text-sm font-extrabold text-slate-900">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label={`Increase ${item.product.name} quantity`}
                      disabled={item.quantity >= item.product.stockQuantity}
                      onClick={() => increaseQuantity(item.product.id)}
                      className="grid h-8 w-8 place-items-center rounded-lg text-lg font-bold text-slate-600 transition hover:bg-white hover:text-violet-700 disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                  <div className="font-extrabold text-violet-600">
                    ${(item.product.priceUsd * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="surface-card p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-bold text-slate-900">Order summary</h2>
            <div className="my-5 space-y-3 border-y border-slate-100 py-5 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Items</span>
                <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="font-semibold text-slate-700">Total</span>
                <span className="text-2xl font-black text-violet-600">${totalUsd.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={() => navigate(user ? '/checkout' : '/login')}
              className="primary-button w-full"
            >
              {user ? 'Proceed to checkout' : 'Log in to checkout'}
            </button>
            <button 
              onClick={clearCart} 
              className="mt-4 w-full text-center text-xs font-bold text-slate-400 transition hover:text-red-500"
            >
              Clear cart
            </button>
          </aside>
          </div>
      )}
    </div>
  );
}
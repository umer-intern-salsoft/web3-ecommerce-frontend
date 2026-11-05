import { create } from 'zustand';

const getCartStorageKey = (user) => {
  const userId = user?.id ?? user?.email;
  return userId ? `web3-shop-cart:${userId}` : null;
};

const loadUserCart = (user) => {
  const key = getCartStorageKey(user);
  if (!key) return [];

  try {
    const cart = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(cart)
      ? cart.filter((item) => Number.isFinite(Number(item?.product?.priceUsd)))
      : [];
  } catch {
    return [];
  }
};

const saveUserCart = (user, cart) => {
  const key = getCartStorageKey(user);
  if (key) localStorage.setItem(key, JSON.stringify(cart));
};

const updateCart = (state, updater) => {
  const cart = updater(state.cart);
  saveUserCart(state.user, cart);
  return { cart };
};

export const useStore = create((set, get) => ({
  // --- Auth State ---
  user: null, // { id, email, isAdmin }
  authLoading: true, // Tracks initial session load
  setUser: (userData) => set({
    user: userData,
    cart: userData ? loadUserCart(userData) : []
  }),
  setAuthLoading: (loading) => set({ authLoading: loading }),
  logoutUser: () => set({ user: null, cart: [] }),

  // --- Cart State ---
  cart: [],
  
  addToCart: (product) => set((state) => updateCart(state, (cart) => {
    const existingItem = state.cart.find(item => item.product.id === product.id);
    if (existingItem) {
      return cart.map(item =>
        item.product.id === product.id
          ? {
              ...item,
              quantity: Math.min(item.quantity + 1, product.stockQuantity)
            }
          : item
      );
    }
    return [...cart, { product, quantity: 1 }];
  })),

  increaseQuantity: (productId) => set((state) => updateCart(state, (cart) =>
    cart.map((item) =>
      item.product.id === productId
        ? {
            ...item,
            quantity: Math.min(item.quantity + 1, item.product.stockQuantity)
          }
        : item
    )
  )),

  decreaseQuantity: (productId) => set((state) => updateCart(state, (cart) =>
    cart
      .map((item) =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter((item) => item.quantity > 0)
  )),

  removeFromCart: (productId) => set((state) => updateCart(
    state,
    (cart) => cart.filter(item => item.product.id !== productId)
  )),

  clearCart: () => {
    const { user } = get();
    saveUserCart(user, []);
    set({ cart: [] });
  },

  getCartTotalUsd: () => {
    const { cart } = get();
    return cart.reduce((total, item) => total + (item.product.priceUsd * item.quantity), 0);
  }
}));
import { create } from 'zustand';

export const useStore = create((set, get) => ({
  // --- Auth State ---
  user: null, // { id, email, isAdmin }
  authLoading: true, // Tracks initial session load
  setUser: (userData) => set({ user: userData }),
  setAuthLoading: (loading) => set({ authLoading: loading }),
  logoutUser: () => set({ user: null }),

  // --- Cart State ---
  cart: [],
  
  addToCart: (product) => set((state) => {
    const existingItem = state.cart.find(item => item.product.id === product.id);
    if (existingItem) {
      return {
        cart: state.cart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      };
    }
    return { cart: [...state.cart, { product, quantity: 1 }] };
  }),

  removeFromCart: (productId) => set((state) => ({
    cart: state.cart.filter(item => item.product.id !== productId)
  })),

  clearCart: () => set({ cart: [] }),

  getCartTotal: () => {
    const { cart } = get();
    return cart.reduce((total, item) => total + (item.product.priceEth * item.quantity), 0);
  }
}));
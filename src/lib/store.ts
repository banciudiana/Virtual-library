import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  _id: string;
  title: string;
  price: number;
  image: any;
  quantity: number;
  format?: string;
}

interface CartStore {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  totalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: [],
      
      addToCart: (item) => set((state) => {
        const existingItem = state.cart.find((i) => i._id === item._id);
        if (existingItem) {
          return {
            cart: state.cart.map((i) =>
              i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          };
        }
        return { cart: [...state.cart, { ...item, quantity: 1 }] };
      }),

      removeFromCart: (id) => set((state) => ({
        cart: state.cart.filter((i) => i._id !== id),
      })),

      clearCart: () => set({ cart: [] }),

      totalItems: () => {
        const cart = get().cart;
        return cart.reduce((acc, item) => acc + item.quantity, 0);
      },
    }),
    { name: 'virtual-lib-cart' }
  )
);
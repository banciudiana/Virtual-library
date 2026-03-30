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
  reduceQuantity: (id: string) => void; // Funcție nouă
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

      reduceQuantity: (id) => set((state) => ({
        cart: state.cart.map((i) => 
          i._id === id && i.quantity > 1 
            ? { ...i, quantity: i.quantity - 1 } 
            : i
        )
      })),

      removeFromCart: (id) => set((state) => ({
        cart: state.cart.filter((i) => i._id !== id),
      })),

      clearCart: () => set({ cart: [] }),

      totalItems: () => get().cart.reduce((acc, item) => acc + item.quantity, 0),
    }),
    { name: 'virtual-lib-cart' }
  )
);
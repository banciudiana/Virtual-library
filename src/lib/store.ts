import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  _id: string;
  title: string;
  price: number;
  image: any;
  quantity: number;
  format: string; // Îl facem obligatoriu pentru a evita erorile
}

interface CartStore {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  reduceQuantity: (id: string, format: string) => void; // Adăugăm format
  removeFromCart: (id: string, format: string) => void; // Adăugăm format
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number; // Funcție utilă în plus
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: [],
      
      addToCart: (item) => set((state) => {
        // Căutăm dacă există deja combinația ACEST ID + ACEST FORMAT
        const existingItem = state.cart.find(
          (i) => i._id === item._id && i.format === item.format
        );

        if (existingItem) {
          return {
            cart: state.cart.map((i) =>
              (i._id === item._id && i.format === item.format) 
                ? { ...i, quantity: i.quantity + 1 } 
                : i
            ),
          };
        }
        // Dacă e format nou sau carte nouă, o adăugăm normal
        return { cart: [...state.cart, { ...item }] };
      }),

      reduceQuantity: (id, format) => set((state) => ({
        cart: state.cart.map((i) => 
          (i._id === id && i.format === format && i.quantity > 1) 
            ? { ...i, quantity: i.quantity - 1 } 
            : i
        )
      })),

      removeFromCart: (id, format) => set((state) => ({
        cart: state.cart.filter((i) => !(i._id === id && i.format === format)),
      })),

      clearCart: () => set({ cart: [] }),

      totalItems: () => get().cart.reduce((acc, item) => acc + item.quantity, 0),

      totalPrice: () => get().cart.reduce((acc, item) => acc + (item.price * item.quantity), 0),
    }),
    { name: 'virtual-lib-cart' }
  )
);
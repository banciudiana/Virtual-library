import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  _id: string;
  title: string;
  price: number;
  image: any;
  quantity: number;
  format: string; 
}

interface CartStore {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  reduceQuantity: (id: string, format: string) => void;
  removeFromCart: (id: string, format: string) => void;
  clearCart: () => void;
  // Folosim proprietăți simple în loc de funcții apelabile pentru a fi mai ușor de folosit în componente
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: [],
      
      addToCart: (item) => set((state) => {
        // Logica de identificare unică: ID + Format
        const existingItemIndex = state.cart.findIndex(
          (i) => i._id === item._id && i.format === item.format
        );

        if (existingItemIndex > -1) {
          const newCart = [...state.cart];
          newCart[existingItemIndex] = {
            ...newCart[existingItemIndex],
            quantity: newCart[existingItemIndex].quantity + (item.quantity || 1)
          };
          return { cart: newCart };
        }

        // Adăugăm produsul nou (ne asigurăm că are cantitate minim 1)
        return { cart: [...state.cart, { ...item, quantity: item.quantity || 1 }] };
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

      // Calculăm valorile în timp real folosind get()
      getTotalItems: () => get().cart.reduce((acc, item) => acc + (item.quantity || 0), 0),

      getTotalPrice: () => get().cart.reduce((acc, item) => acc + (item.price * (item.quantity || 0)), 0),
    }),
    { 
      name: 'virtual-lib-cart',
      // Opțional: poți adăuga un storage personalizat dacă vrei, dar default e localStorage
    }
  )
);
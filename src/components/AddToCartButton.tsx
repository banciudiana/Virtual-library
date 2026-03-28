'use client'

import { ShoppingBag } from 'lucide-react';
import { useCartStore, CartItem } from '@/lib/store';

export default function AddToCartButton({ item, disabled }: { item: any, disabled: boolean }) {
  const addToCart = useCartStore((state) => state.addToCart);

  return (
    <button 
      disabled={disabled}
      onClick={() => !disabled && addToCart(item)}
      className={`w-full md:w-fit px-16 py-5 flex items-center justify-center space-x-3 transition-all uppercase tracking-[0.3em] font-bold text-[10px] 
        ${disabled 
          ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' 
          : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-xl'
        }`}
    >
      <ShoppingBag size={18} />
      <span>{disabled ? 'Selectează Formatul' : 'Adaugă în Coș'}</span>
    </button>
  );
}
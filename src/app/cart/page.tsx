'use client'

import { useCartStore } from '@/lib/store';
import { urlFor } from '@/lib/image';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

export default function CartPage() {
  // Am extras funcțiile din store conform noii logici (id + format)
  const { cart, addToCart, reduceQuantity, removeFromCart, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
  const isAllDigital = cart.every(item => 
    item.format?.toLowerCase() === 'ebook' || 
    item.format?.toLowerCase() === 'audiobook'
  );

  const shipping = isAllDigital ? 0 : (subtotal > 150 ? 0 : 20);
  const total = subtotal + shipping;

  const handleCheckout = async () => {
    const userEmail = localStorage.getItem('userEmail');
    
    if (!userEmail) {
      alert("Te rugăm să te loghezi pentru a finaliza comanda.");
      window.location.href = "/login";
      return;
    }

    setIsProcessing(true);
    
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          cartItems: cart, 
          shippingFee: shipping,
          userEmail: userEmail 
        }),
      });

      const data = await response.json();

      if (data.error) {
        alert("Eroare la checkout: " + data.error);
        setIsProcessing(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }

    } catch (err) {
      console.error("Checkout error:", err);
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-24 text-center font-sans">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="p-8 bg-zinc-100 rounded-full text-zinc-900">
            <ShoppingBag size={48} strokeWidth={1} />
          </div>
          <h1 className="font-playfair text-4xl font-bold text-zinc-900 italic">Coșul tău este gol</h1>
          <p className="text-zinc-400 font-medium italic max-w-xs mx-auto">
            Biblioteca ta personală așteaptă prima poveste.
          </p>
          <Link 
            href="/" 
            className="mt-8 px-14 py-5 bg-zinc-900 text-white text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-black transition-all shadow-xl"
          >
            Explorează colecția
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-12 md:py-20 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
        <div className="text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-2 italic text-left">Your Selection</p>
          <h1 className="font-playfair text-5xl md:text-6xl font-bold tracking-tighter text-zinc-900 italic text-left">
            Coș de cumpărături
          </h1>
        </div>
        <button 
          onClick={clearCart}
          className="text-[9px] uppercase tracking-widest text-zinc-300 hover:text-red-600 font-bold transition-colors pb-2"
        >
          Golește tot coșul
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        <div className="lg:col-span-8 space-y-8">
          {cart.map((item) => (
            <div 
              key={`${item._id}-${item.format}`} 
              className="flex flex-col sm:flex-row gap-8 pb-8 border-b border-zinc-100 items-start sm:items-center group"
            >
              {/* Imagine */}
              <div className="relative w-24 h-36 bg-zinc-50 flex-shrink-0 shadow-sm overflow-hidden group-hover:shadow-xl transition-shadow">
                <Image 
                  src={urlFor(item.image).url()} 
                  alt={item.title} 
                  fill 
                  className="object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-grow space-y-1 text-left">
                <h3 className="font-playfair text-2xl font-bold text-zinc-900 leading-tight">
                  {item.title}
                </h3>
                <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-black italic">
                  Format: <span className="text-zinc-900">{item.format}</span>
                </p>
                <p className="text-base font-black text-zinc-900 pt-3 italic">{item.price} RON</p>
              </div>

              {/* Controale - REPARATE CU ID + FORMAT */}
              <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center border border-zinc-200 bg-white">
                  <button 
                    onClick={() => reduceQuantity(item._id, item.format)}
                    className="p-3 hover:bg-zinc-50 text-zinc-900 transition disabled:opacity-20"
                    disabled={item.quantity <= 1}
                  >
                    <Minus size={14} strokeWidth={2} />
                  </button>
                  <span className="px-4 text-[12px] font-black text-zinc-900 min-w-[35px] text-center">
                    {item.quantity}
                  </span>
                  <button 
                    onClick={() => addToCart(item)}
                    className="p-3 hover:bg-zinc-50 text-zinc-900 transition"
                  >
                    <Plus size={14} strokeWidth={2} />
                  </button>
                </div>
                
                <button 
                  onClick={() => removeFromCart(item._id, item.format)}
                  className="text-zinc-200 hover:text-red-600 transition-colors p-2"
                >
                  <Trash2 size={20} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Rezumat Comandă */}
        <div className="lg:col-span-4">
          <div className="bg-zinc-50 p-10 sticky top-32 border border-zinc-100">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-900 mb-10 border-b border-zinc-200 pb-4 italic text-left">
              Sumar comandă
            </h2>
            
            <div className="space-y-4 font-sans text-[13px] text-left">
              <div className="flex justify-between text-zinc-500 font-medium">
                <span className="italic">Subtotal</span>
                <span className="font-bold text-zinc-900">{subtotal} RON</span>
              </div>
              <div className="flex justify-between text-zinc-500 font-medium">
                <span className="italic">{isAllDigital ? 'Procesare digitală' : 'Transport'}</span>
                <span className="font-bold text-zinc-900 tracking-tighter">
                  {shipping === 0 ? 'GRATUIT' : `${shipping} RON`}
                </span>
              </div>
              
              {!isAllDigital && shipping > 0 && (
                <div className="bg-white/50 p-4 border border-zinc-100 mt-6 italic">
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Mai adaugă produse de <span className="text-zinc-900 font-bold italic">{(150 - subtotal)} RON</span> pentru a debloca <span className="text-zinc-900 font-bold uppercase tracking-widest text-[9px]">transport gratuit</span>.
                  </p>
                </div>
              )}

              <div className="pt-8 mt-4 border-t border-zinc-200 flex justify-between items-baseline">
                <span className="text-base font-black uppercase tracking-tighter text-zinc-900">Total</span>
                <span className="text-3xl font-black tracking-tighter text-zinc-900 italic">{total} RON</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={isProcessing}
              className={`w-full bg-zinc-900 text-white py-6 mt-12 flex items-center justify-center space-x-4 hover:bg-black uppercase tracking-[0.4em] font-bold text-[10px] shadow-2xl active:scale-[0.98] transition-all ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span>{isProcessing ? 'Se procesează...' : 'Finalizează Comanda'}</span>
              {!isProcessing && <ArrowRight size={16} />}
            </button>
            
            <div className="mt-10 space-y-3 text-[9px] text-zinc-400 uppercase tracking-[0.1em] font-bold text-center italic opacity-60">
              <p>● Plată securizată prin Stripe ●</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
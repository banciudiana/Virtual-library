'use client'

import { useCartStore } from '@/lib/store';
import { urlFor } from '@/lib/image';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

export default function CartPage() {
  const { cart, addToCart, reduceQuantity, removeFromCart, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);

  // Calcule
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const isAllDigital = cart.every(item => 
    item.format?.toLowerCase() === 'ebook' || 
    item.format?.toLowerCase() === 'audiobook'
  );

  const shipping = isAllDigital ? 5 : (subtotal > 150 ? 0 : 20);
  const total = subtotal + shipping;

  const handleCheckout = async () => {
  // 1. Verificăm dacă user-ul este logat
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
        userEmail: userEmail // Trimitem email-ul pentru a-l stoca în metadata Stripe
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
    } else {
      alert("Eroare: Nu s-a putut genera link-ul de plată.");
      setIsProcessing(false);
    }

  } catch (err) {
    console.error("Checkout error:", err);
    setIsProcessing(false);
    alert("A apărut o eroare neprevăzută.");
  }
};

  if (cart.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-24 text-center font-sans">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="p-8 bg-zinc-100 rounded-full text-zinc-900">
            <ShoppingBag size={48} strokeWidth={1} />
          </div>
          <h1 className="font-playfair text-4xl font-bold text-zinc-900">Coșul tău este gol</h1>
          <p className="text-zinc-600 font-medium italic max-w-xs mx-auto">
            Biblioteca ta așteaptă prima poveste.
          </p>
          <Link 
            href="/" 
            className="mt-8 px-14 py-5 bg-zinc-900 text-white text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-black transition-all shadow-xl"
          >
            Explorează cărțile
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-12 md:py-20 font-sans">
      <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-16 tracking-tight text-zinc-900">
        Coș de cumpărături
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* LISTA PRODUSE */}
        <div className="lg:col-span-8 space-y-10">
          {cart.map((item) => (
            <div key={item._id} className="flex flex-col sm:flex-row gap-8 pb-10 border-b border-zinc-200 items-start sm:items-center">
              <div className="relative w-28 h-40 bg-zinc-100 flex-shrink-0 shadow-md">
                <Image 
                  src={urlFor(item.image).url()} 
                  alt={item.title} 
                  fill 
                  className="object-cover"
                />
              </div>

              <div className="flex-grow space-y-2">
                <h3 className="font-playfair text-2xl font-bold text-zinc-900 leading-tight">
                  {item.title}
                </h3>
                <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-900 font-black">
                  Format: <span className="bg-zinc-100 px-2 py-0.5 rounded-sm ml-1">{item.format}</span>
                </p>
                <p className="text-lg font-bold text-zinc-900 pt-2">{item.price} RON</p>
              </div>

              <div className="flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center border-2 border-zinc-900">
                  <button 
                    onClick={() => reduceQuantity(item._id)}
                    className="p-3 hover:bg-zinc-100 text-zinc-900 transition disabled:opacity-30"
                    disabled={item.quantity <= 1}
                  >
                    <Minus size={16} strokeWidth={3} />
                  </button>
                  <span className="px-5 text-sm font-black text-zinc-900 min-w-[45px] text-center">
                    {item.quantity}
                  </span>
                  <button 
                    onClick={() => addToCart(item)}
                    className="p-3 hover:bg-zinc-100 text-zinc-900 transition"
                  >
                    <Plus size={16} strokeWidth={3} />
                  </button>
                </div>
                
                <button 
                  onClick={() => removeFromCart(item._id)}
                  className="text-zinc-400 hover:text-red-600 transition-colors p-2"
                >
                  <Trash2 size={22} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
          
          <button 
            onClick={clearCart}
            className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-red-600 font-bold transition-colors underline underline-offset-4"
          >
            Golește complet coșul
          </button>
        </div>

        {/* REZUMAT COMANDĂ */}
        <div className="lg:col-span-4">
          <div className="bg-zinc-50 p-10 sticky top-32 border border-zinc-100 shadow-sm">
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-900 mb-10 border-b-2 border-zinc-900 pb-4">
              Sumar comandă
            </h2>
            
            <div className="space-y-5 font-sans text-[13px]">
              <div className="flex justify-between text-zinc-700 font-medium">
                <span>Subtotal produse</span>
                <span className="font-bold text-zinc-900">{subtotal} RON</span>
              </div>
              <div className="flex justify-between text-zinc-700 font-medium">
                <span>{isAllDigital ? 'Taxă procesare' : 'Cost livrare'}</span>
                <span className="font-bold text-zinc-900">
                  {shipping === 0 ? 'GRATUIT' : `${shipping} RON`}
                </span>
              </div>
              
              {!isAllDigital && shipping > 0 && (
                <div className="bg-white p-4 border border-zinc-200 mt-4">
                  <p className="text-[10px] text-zinc-800 font-bold uppercase tracking-tight">
                    Transport gratuit?
                  </p>
                  <p className="text-[11px] text-zinc-500 italic mt-1 leading-relaxed">
                    Mai adaugă produse de <span className="text-zinc-900 font-bold">{150 - subtotal} RON</span> pentru livrare gratuită.
                  </p>
                </div>
              )}

              <div className="pt-8 border-t-2 border-zinc-200 flex justify-between items-center text-2xl font-black tracking-tighter text-zinc-900">
                <span>Total</span>
                <span>{total} RON</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={isProcessing}
              className={`w-full bg-zinc-900 text-white py-6 mt-12 flex items-center justify-center space-x-4 hover:bg-black uppercase tracking-[0.3em] font-bold text-[11px] shadow-2xl active:scale-[0.98] transition-all ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span>{isProcessing ? 'Se procesează...' : 'Finalizează Comanda'}</span>
              {!isProcessing && <ArrowRight size={18} />}
            </button>
            
            <div className="mt-10 space-y-3 text-[10px] text-zinc-500 uppercase tracking-[0.15em] font-bold text-center">
              <p>🛡️ Plată 100% securizată prin Stripe</p>
              <p className="italic text-zinc-400 font-medium normal-case">Suport GPay & Apple Pay activ</p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
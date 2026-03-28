'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, Check, Star, X } from 'lucide-react'
import AddToCartButton from './AddToCartButton'

export default function ProductDetailsClient({ book }: { book: any }) {
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Stare pentru Pop-up

  const calculatePrice = (basePrice: number, format: string | null) => {
    if (!format || format === 'paperback') return basePrice;
    if (format === 'hardback') return Math.round(basePrice * 1.1);
    if (format === 'ebook') return Math.round(basePrice * 0.75);
    if (format === 'audiobook') return Math.round(basePrice * 0.85);
    return basePrice;
  };

  const currentPrice = calculatePrice(book.price, selectedFormat);
  return (
    <div className="flex flex-col justify-center">
      <Link href={`/autori/${book.authorSlug}`} className="block mb-4">
        <p className="font-sans text-zinc-400 uppercase tracking-[0.4em] text-[10px] font-bold hover:text-black transition-colors">
          {book.authorName}
        </p>
      </Link>

      <h1 className="font-playfair text-4xl md:text-6xl font-bold leading-tight mb-8 tracking-tighter text-zinc-900">
        {book.title}
      </h1>
      
      <div className="flex items-center gap-8 mb-10">
        {/* Afișăm prețul calculat în timp real */}
        <span className="text-4xl font-sans font-bold tracking-tighter text-zinc-900">
          {currentPrice} RON
        </span>
        <div className="flex items-center gap-2 text-zinc-400 border-l border-zinc-200 pl-8 font-sans">
          <Star size={16} className="text-yellow-500" fill="currentColor" />
          <span className="text-sm font-bold text-zinc-800">{book.rating || '5.0'}</span>
        </div>
      </div>

      <div className="mb-10">
        <h3 className="text-[9px] font-bold font-sans uppercase tracking-[0.2em] text-zinc-300 mb-4">
          Selectează Formatul (Obligatoriu)
        </h3>
        <div className="flex flex-wrap gap-2">
          {book.format?.map((fmt: string) => (
            <button 
              key={fmt} 
              onClick={() => setSelectedFormat(fmt)}
              className={`border px-6 py-2 text-[10px] font-sans font-bold uppercase tracking-widest transition-all
                ${selectedFormat === fmt 
                  ? 'border-black bg-black text-white shadow-md' 
                  : 'border-zinc-200 text-zinc-400 hover:border-zinc-400'
                }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      <p className="text-zinc-500 leading-relaxed text-lg mb-12 italic font-serif max-w-xl">
        {book.shortDescription}
      </p>

        {/* Butonul de Coș declanșează acum Modalul la succes */}
        <div onClick={() => selectedFormat && setIsModalOpen(true)}>
            <AddToCartButton 
            disabled={!selectedFormat}
            item={{
                _id: `${book._id}-${selectedFormat}`,
                title: book.title,
                price: currentPrice,
                image: book.image,
                quantity: 1,
                format: selectedFormat
            }} 
            />
        </div>

        {/* POP-UP MODAL (Overlay) */}
        {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
                
                {/* Buton Închidere (X) */}
                <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-black transition"
                >
                <X size={20} />
                </button>

                <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-zinc-900 text-white rounded-full flex items-center justify-center mb-6">
                    <Check size={24} strokeWidth={3} />
                </div>
                
                <h3 className="font-playfair text-2xl font-bold mb-2">Adăugat în coș!</h3>
                <p className="font-sans text-zinc-500 text-sm mb-8 italic">
                    {book.title} ({selectedFormat}) a fost adăugată cu succes.
                </p>

                <div className="flex flex-col gap-3">
                    <Link 
                    href="/cart"
                    className="w-full bg-zinc-900 text-white py-4 font-sans font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-zinc-800 transition"
                    >
                    Vezi Coșul de Cumpărături
                    </Link>
                    
                    <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-full bg-white border border-zinc-200 text-zinc-900 py-4 font-sans font-bold text-[10px] uppercase tracking-[0.2em] hover:border-black transition"
                    >
                    Continuă Cumpărăturile
                    </button>
                </div>
                </div>
            </div>
            </div>
        )}

        {!selectedFormat && (
            <p className="text-[9px] text-red-400 uppercase tracking-widest mt-3 font-bold italic">
            * Te rugăm să alegi formatul înainte de adăugare
            </p>
        )}
        </div>
    );
    }
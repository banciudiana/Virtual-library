'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Check, Star, X, AlertCircle, Heart, Loader2 } from 'lucide-react'
import AddToCartButton from './AddToCartButton'
import { adminClient } from '@/sanity/lib/adminClient'

export default function ProductDetailsClient({ book }: { book: any }) {
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [favLoading, setFavLoading] = useState(false)

  const calculatePrice = (basePrice: number, format: string | null) => {
    if (!format || format === 'paperback') return basePrice
    if (format === 'hardback') return Math.round(basePrice * 1.1)
    if (format === 'ebook') return Math.round(basePrice * 0.75)
    if (format === 'audiobook') return Math.round(basePrice * 0.85)
    return basePrice
  }

  // Verificăm statusul de favorit la încărcare
  useEffect(() => {
    const checkStatus = async () => {
      const email = localStorage.getItem('userEmail')
      if (!email) return

      const user = await adminClient.fetch(
        `*[_type == "user" && email == $email][0]`,
        { email }
      )
      
      const exists = user?.favorites?.some((fav: any) => fav._ref === book._id)
      setIsFavorite(!!exists)
    }

    checkStatus()
  }, [book._id])

  const toggleFavorite = async () => {
    const email = localStorage.getItem('userEmail')
    if (!email) {
      alert("Trebuie să fii logat pentru a salva favorite!")
      return
    }

    setFavLoading(true)
    try {
      const user = await adminClient.fetch(`*[_type == "user" && email == $email][0]`, { email })

      if (isFavorite) {
        await adminClient
          .patch(user._id)
          .unset([`favorites[_ref == "${book._id}"]`])
          .commit()
        setIsFavorite(false)
      } else {
        await adminClient
          .patch(user._id)
          .setIfMissing({ favorites: [] })
          .insert('after', 'favorites[-1]', [{ _type: 'reference', _ref: book._id }])
          .commit()
        setIsFavorite(true)
      }
    } catch (error) {
      console.error("Eroare favorite:", error)
    } finally {
      setFavLoading(false)
    }
  }

  const isPhysical = selectedFormat === 'paperback' || selectedFormat === 'hardback'
  const isOutOfStock = isPhysical && book.stock <= 0
  const showLowStockAlert = isPhysical && book.stock > 0 && book.stock <= 10
  const currentPrice = calculatePrice(book.price, selectedFormat)

  return (
    <div className="flex flex-col justify-center">
      <Link href={`/autori/${book.authorSlug}`} className="block mb-4">
        <p className="font-sans text-zinc-500 uppercase tracking-[0.4em] text-[10px] font-bold hover:text-black transition-colors">
          {book.authorName}
        </p>
      </Link>

      <h1 className="font-playfair text-4xl md:text-6xl font-bold leading-tight mb-8 tracking-tighter text-zinc-900">
        {book.title}
      </h1>
      
      <div className="flex items-center gap-8 mb-10">
        <span className="text-4xl font-sans font-bold tracking-tighter text-zinc-900">
          {currentPrice} RON
        </span>
        <div className="flex items-center gap-2 text-zinc-500 border-l border-zinc-200 pl-8 font-sans">
          <Star size={16} className="text-yellow-500" fill="currentColor" />
          <span className="text-sm font-bold text-zinc-800">{book.rating || '5.0'}</span>
        </div>
      </div>

      {showLowStockAlert && (
        <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-100 p-4 animate-pulse">
          <AlertCircle size={18} className="text-amber-600" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">
            Grăbește-te! Au mai rămas doar {book.stock} exemplare în stoc
          </p>
        </div>
      )}

      {isOutOfStock && (
        <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-100 p-4">
          <X size={18} className="text-red-600" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-700">
            Acest format nu mai este disponibil în stoc
          </p>
        </div>
      )}

      <div className="mb-10">
        <h3 className="text-[9px] font-bold font-sans uppercase tracking-[0.2em] text-zinc-500 mb-4">
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
                  : 'border-zinc-200 text-zinc-500 hover:border-zinc-400'
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

      {/* Butoane Acțiune */}
      <div className="flex gap-4 items-stretch">
        <div className="flex-1" onClick={() => (selectedFormat && !isOutOfStock) && setIsModalOpen(true)}>
          <AddToCartButton 
            disabled={!selectedFormat || isOutOfStock}
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

        <button 
          onClick={toggleFavorite}
          disabled={favLoading}
          className={`px-6 border transition-all flex items-center justify-center ${
            isFavorite 
            ? 'bg-red-50 border-red-100 text-red-800' 
            : 'bg-zinc-50 border-zinc-100 text-zinc-500 hover:text-black hover:border-zinc-300'
          }`}
        >
          {favLoading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
          )}
        </button>
      </div>

      {!selectedFormat && (
        <p className="text-[9px] text-red-400 uppercase tracking-widest mt-3 font-bold italic">
          * Te rugăm să alegi formatul înainte de adăugare
        </p>
      )}

      {/* POP-UP MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-black transition">
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
                <Link href="/cart" className="w-full bg-zinc-900 text-white py-4 font-sans font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-zinc-800 transition text-center">
                  Vezi Coșul de Cumpărături
                </Link>
                <button onClick={() => setIsModalOpen(false)} className="w-full bg-white border border-zinc-200 text-zinc-900 py-4 font-sans font-bold text-[10px] uppercase tracking-[0.2em] hover:border-black transition">
                  Continuă Cumpărăturile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
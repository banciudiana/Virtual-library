'use client'

import { useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';
import { ShoppingBag, User, Search, Menu, X, ChevronRight, ArrowLeft } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  // Acestea vor veni ulterior din categoryType (Sanity)
  // Momentan le listăm simplu, stratificat în meniu
  const categoriiExemplu = [
    "Ficțiune", "Dezvoltare Personală", "Istorie", "Artă & Design", "Psihologie", "Copii"
  ];
   const totalItems = useCartStore((state) => state.totalItems());
  return (
    <nav className="border-b border-zinc-100 bg-white sticky top-0 z-50 overflow-x-hidden font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          
          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button 
              onClick={() => {
                setIsOpen(!isOpen);
                setShowCategories(false);
              }}
              className="p-2 text-zinc-600 hover:bg-zinc-50 rounded-md"
            >
              {isOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
            <Link href="/" className="font-playfair text-xl md:text-2xl font-bold tracking-tight">
              VIRTUAL<span className="text-zinc-500 font-light italic">LIB</span>
            </Link>
          </div>

          {/* Navigație Desktop - Culori corectate pentru vizibilitate */}
          <div className="hidden md:flex space-x-10 items-center text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-800">
            <Link href="/categorii" className="hover:text-black transition-colors">Categorii</Link>
            <Link href="/noutati" className="hover:text-black transition-colors">Noutăți</Link>
            <Link href="/autori" className="hover:text-black transition-colors">Autori</Link>
          </div>

          {/* Acțiuni (Icons) */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <button className="p-2 hover:bg-zinc-50 rounded-full transition hidden sm:block text-zinc-700">
              <Search size={20} strokeWidth={1.2} />
            </button>
            <Link href="/login" className="p-2 hover:bg-zinc-50 rounded-full transition text-zinc-700">
              <User size={20} strokeWidth={1.2} />
            </Link>
            <Link href="/cart" className="p-2 hover:bg-zinc-50 rounded-full transition relative text-zinc-700">
              <ShoppingBag size={20} strokeWidth={1.2} />
              <span className="absolute top-1 right-1 bg-black text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold">
                {totalItems}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`
        fixed inset-0 top-16 bg-white z-40 transition-transform duration-300 ease-in-out md:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="relative h-full p-8 overflow-hidden">
          
          {/* Stratul 1: Meniul Principal */}
          <div className={`flex flex-col space-y-6 transition-all duration-300 ${showCategories ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}>
            <Link href="/search" onClick={() => setIsOpen(false)} className="flex items-center gap-2 pt-4 text-zinc-500 text-sm font-sans uppercase tracking-[0.2em] font-bold">
              <Search size={18} /> Caută o carte
            </Link>
            
            <button 
              onClick={() => setShowCategories(true)}
              className="flex items-center justify-between border-b border-zinc-50 pb-4 font-playfair text-2xl font-medium text-left"
            >
              Categorii <ChevronRight size={20} className="text-zinc-300" />
            </button>
            
            <Link href="/noutati" onClick={() => setIsOpen(false)} className="border-b border-zinc-50 pb-4 font-playfair text-2xl font-medium">Noutăți</Link>
            <Link href="/autori" onClick={() => setIsOpen(false)} className="border-b border-zinc-50 pb-4 font-playfair text-2xl font-medium">Autori</Link>
          </div>

          {/* Stratul 2: Sub-meniul Categorii (Apare peste) */}
          <div className={`absolute inset-0 p-8 bg-white transition-all duration-300 ${showCategories ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
            <button 
              onClick={() => setShowCategories(false)}
              className="flex items-center gap-2 text-zinc-400 text-[10px] uppercase tracking-[0.3em] font-bold mb-10"
            >
              <ArrowLeft size={14} /> Înapoi
            </button>
            
            <div className="flex flex-col space-y-6">
              <h3 className="font-playfair text-3xl font-bold mb-4">Categorii</h3>
              {categoriiExemplu.map((cat) => (
                <Link 
                  key={cat} 
                  href={`/categorii/${cat.toLowerCase()}`}
                  onClick={() => setIsOpen(false)}
                  className="border-b border-zinc-50 pb-4 font-sans text-lg text-zinc-700 hover:text-black transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}
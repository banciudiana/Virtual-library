'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';
import { client } from '@/sanity/lib/client';
import { ShoppingBag, User, Search, Menu, X, ChevronRight, ArrowLeft } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  
  const totalItems = useCartStore((state) => state.totalItems());

  const closeMenu = () => {
    setIsOpen(false);
    setShowCategories(false);
  };

  useEffect(() => {
    setMounted(true);
    const fetchCategories = async () => {
      const data = await client.fetch(`*[_type == "category" && !defined(parent)]{
        title, "slug": slug.current,
        "subcategories": *[_type == "category" && references(^._id)]{ title, "slug": slug.current }
      }`);
      setCategories(data);
    };
    fetchCategories();
  }, []);

  return (
    <nav className="border-b border-zinc-100 bg-white sticky top-0 z-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          
          {/* LOGO */}
          <Link href="/" onClick={closeMenu} className="font-playfair text-xl md:text-2xl font-bold tracking-tight text-zinc-900">
            VIRTUAL<span className="text-zinc-500 font-light italic">LIB</span>
          </Link>

          {/* NAV DESKTOP */}
          <div className="hidden md:flex space-x-10 items-center text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-800 h-full">
            <div className="group h-full flex items-center">
              <Link href="/categorii/toate" onClick={closeMenu} className="hover:text-zinc-500 transition-colors py-8">Categorii</Link>
              {mounted && categories.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-white shadow-[0_20px_40px_rgba(0,0,0,0.05)] border-t border-zinc-100 hidden group-hover:block animate-in fade-in slide-in-from-top-1">
                  <div className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-4 gap-12 text-left">
                    {categories.map((cat) => (
                      <div key={cat.slug} className="space-y-4">
                        <Link href={`/categorii/${cat.slug}`} onClick={closeMenu} className="block text-[12px] font-black uppercase tracking-[0.2em] text-zinc-900 border-b border-zinc-100 pb-2 hover:text-zinc-500">{cat.title}</Link>
                        <div className="flex flex-col space-y-2">
                          {cat.subcategories?.map((sub: any) => (
                            <Link key={sub.slug} href={`/categorii/${sub.slug}`} onClick={closeMenu} className="text-[13px] text-zinc-500 hover:text-black font-medium normal-case tracking-normal">{sub.title}</Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Link href="/noutati" onClick={closeMenu} className="hover:text-zinc-500 transition-colors">Noutăți</Link>
            <Link href="/autori" onClick={closeMenu} className="hover:text-zinc-500 transition-colors">Autori</Link>
          </div>

          {/* ACTIONS (Include Search pe ambele) */}
          <div className="flex items-center space-x-2 md:space-x-5">
            <Link href="/search" onClick={closeMenu} className="p-2 text-zinc-700 hover:bg-zinc-50 rounded-full transition-colors">
              <Search size={20} strokeWidth={1.2} />
            </Link>
            
            <Link href={mounted && localStorage.getItem('userEmail') ? "/account" : "/login"} onClick={closeMenu} className="p-2 text-zinc-700">
              <User size={20} strokeWidth={1.2} />
            </Link>

            <Link href="/cart" onClick={closeMenu} className="p-2 relative text-zinc-700">
              <ShoppingBag size={20} strokeWidth={1.2} />
              {mounted && totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-black text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold">{totalItems}</span>
              )}
            </Link>

            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-zinc-600">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* MENIU MOBIL - SINCRONIZAT STILISTIC CU DESKTOP */}
      {/* MENIU MOBIL - REPARAT TOTAL PENTRU ALINIERE ȘI PADDING */}
{isOpen && (
  <div className="fixed inset-0 top-0 bg-white z-[60] md:hidden animate-in fade-in duration-300">
    {/* Header-ul din interiorul meniului (Logo + X) */}
    <div className="h-16 flex justify-between items-center px-4 border-b border-zinc-50">
      <Link href="/" onClick={closeMenu} className="font-playfair text-xl font-bold tracking-tight text-zinc-900">
        VIRTUAL<span className="text-zinc-500 font-light italic">LIB</span>
      </Link>
      <button onClick={closeMenu} className="p-2 text-zinc-900">
        <X size={24} strokeWidth={1.5} />
      </button>
    </div>

    <div className="p-8 h-full flex flex-col bg-white">
      {!showCategories ? (
        <div className="flex flex-col text-zinc-900 w-full">
          
          {/* CĂUTARE - Gri, tracking mare */}
          <Link 
            href="/search" 
            onClick={closeMenu} 
            className="flex items-center gap-3 py-8 border-b border-zinc-100 text-zinc-500 text-[11px] font-bold uppercase tracking-[0.3em] w-full"
          >
            <Search size={18} strokeWidth={1.2} /> CĂUTARE
          </Link>

          {/* CATEGORII */}
          <button 
            onClick={() => setShowCategories(true)} 
            className="w-full flex justify-between items-center py-10 border-b border-zinc-100 text-left text-[13px] font-black uppercase tracking-[0.2em]"
          >
            CATEGORII <ChevronRight size={18} strokeWidth={1.5} className="text-zinc-300" />
          </button>

          {/* NOUTĂȚI */}
          <Link 
            href="/noutati" 
            onClick={closeMenu} 
            className="py-10 border-b border-zinc-100 text-[13px] font-black uppercase tracking-[0.2em] text-left w-full"
          >
            NOUTĂȚI
          </Link>

          {/* AUTORI */}
          <Link 
            href="/autori" 
            onClick={closeMenu} 
            className="py-10 border-b border-zinc-100 text-[13px] font-black uppercase tracking-[0.2em] text-left w-full"
          >
            AUTORI
          </Link>
          
        </div>
      ) : (
        /* Ecranul de Subcategorii */
        <div className="flex flex-col h-full animate-in slide-in-from-right duration-300 w-full">
          <button 
            onClick={() => setShowCategories(false)} 
            className="flex items-center gap-2 text-zinc-400 uppercase tracking-[0.3em] text-[10px] font-bold mb-10"
          >
            <ArrowLeft size={14}/> ÎNAPOI
          </button>
          
          <div className="space-y-10 overflow-y-auto pb-20">
            {categories.map(cat => (
              <div key={cat.slug} className="space-y-4">
                <Link 
                  href={`/categorii/${cat.slug}`} 
                  onClick={closeMenu} 
                  className="block text-[12px] font-black uppercase tracking-[0.2em] text-zinc-900 border-b border-zinc-50 pb-2"
                >
                  {cat.title}
                </Link>
                <div className="flex flex-col space-y-4 pl-4 border-l border-zinc-100">
                  {cat.subcategories?.map((sub: any) => (
                    <Link 
                      key={sub.slug} 
                      href={`/categorii/${sub.slug}`} 
                      onClick={closeMenu} 
                      className="text-zinc-500 text-[14px] font-medium normal-case tracking-tight italic"
                    >
                      {sub.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
)}
    </nav>
  );
}
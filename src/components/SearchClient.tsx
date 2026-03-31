'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { urlFor } from '@/lib/image';
import { Search, X } from 'lucide-react';

export default function SearchClient({ initialBooks }: { initialBooks: any[] }) {
  const [query, setQuery] = useState('');

  // Filtrare inteligentă: caută în Titlu, Autor sau Categorie
  const filteredBooks = useMemo(() => {
    return initialBooks.filter((book) => {
      const searchTerm = query.toLowerCase();
      return (
        book.title.toLowerCase().includes(searchTerm) ||
        book.authorName?.toLowerCase().includes(searchTerm) ||
        book.categoryName?.toLowerCase().includes(searchTerm)
      );
    });
  }, [query, initialBooks]);

  return (
    <div className="space-y-20">
      {/* Input de Căutare Gigant */}
      <div className="relative border-b-2 border-zinc-900 pb-4 group">
        <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-zinc-900 transition-colors" size={32} strokeWidth={1} />
        <input
          type="text"
          placeholder="Caută titlu, autor sau gen..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 text-2xl md:text-4xl font-playfair italic bg-transparent outline-none placeholder:text-zinc-100 text-zinc-900"
          autoFocus
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900">
            <X size={24} />
          </button>
        )}
      </div>

      {/* Rezultate */}
      {query.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-12">
            Am găsit {filteredBooks.length} {filteredBooks.length === 1 ? 'rezultat' : 'rezultate'}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-16">
            {filteredBooks.map((book) => (
              <Link href={`/product/${book.slug}`} key={book._id} className="group flex flex-col">
                <div className="relative aspect-[2/3] w-full mb-6 overflow-hidden bg-zinc-50 shadow-sm transition-all duration-700 group-hover:shadow-2xl">
                  <Image
                    src={urlFor(book.image).url()}
                    alt={book.title}
                    fill
                    sizes="20vw"
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                </div>
                <div className="text-left">
                  <h4 className="font-playfair font-bold text-sm leading-tight line-clamp-2 min-h-[2.5rem]">
                    {book.title}
                  </h4>
                  <p className="text-[9px] uppercase tracking-widest text-zinc-400 mt-2 font-bold italic">
                    {book.authorName}
                  </p>
                  <p className="text-sm font-black text-zinc-900 mt-2">
                    {book.price} RON
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* State: Empty Search */}
      {query.length === 0 && (
        <div className="py-20 text-center opacity-20">
          <p className="font-playfair text-2xl italic">Începe să tastezi pentru a explora biblioteca...</p>
        </div>
      )}

      {/* State: No Results */}
      {query.length > 0 && filteredBooks.length === 0 && (
        <div className="py-20 text-center">
          <p className="font-playfair text-xl italic text-zinc-400">Nu am găsit nicio potrivire pentru "{query}"</p>
        </div>
      )}
    </div>
  );
}
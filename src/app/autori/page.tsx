'use client'

import { useEffect, useState } from 'react'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/lib/image'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpDown, User, ArrowLeft } from 'lucide-react'

interface Author {
  _id: string;
  name: string;
  slug: { current: string };
  image: any;
  shortBio: string;
  bookCount: number;
}

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchAuthors = async () => {
      try {
        const data = await client.fetch(`*[_type == "author"]{
          _id,
          name,
          slug,
          image,
          shortBio,
          "bookCount": count(*[_type == "book" && references(^._id)])
        }`);
        setAuthors(data);
      } catch (error) {
        console.error("Eroare Sanity:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAuthors();
  }, []);

  const sortedAuthors = [...authors].sort((a, b) => {
    return sortOrder === 'asc' 
      ? a.name.localeCompare(b.name) 
      : b.name.localeCompare(a.name);
  });

  // Prevenim eroarea de Hydration
  if (!mounted) return null;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-playfair italic text-zinc-400 tracking-widest text-[10px] uppercase">
      Explorăm arhivele...
    </div>
  );

  return (
    <main className="max-w-7xl mx-auto px-6 py-12 md:py-20 font-sans">
      
      {/* Navigare - Consistentă cu pagina de profil */}
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-zinc-400 hover:text-black transition-colors mb-16 group font-bold"
      >
        <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
        Acasă
      </Link>

      {/* Header & Sortare */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8 border-b border-zinc-50 pb-12">
        <div className="max-w-2xl text-left">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-300 mb-4">
            Comunitatea Noastră
          </p>
          <h1 className="font-playfair text-5xl md:text-7xl font-bold leading-tight tracking-tighter text-zinc-900">
            Autori
          </h1>
        </div>

        <button 
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="flex items-center gap-4 px-8 py-4 border border-zinc-100 hover:border-black transition-all text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-900 shadow-sm"
        >
          <ArrowUpDown size={14} className="text-zinc-400" />
          <span>Sortare: {sortOrder === 'asc' ? 'A — Z' : 'Z — A'}</span>
        </button>
      </div>

      {/* Grid Autori - Design "Medalion" similar cu pagina de profil */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-24">
        {sortedAuthors.map((author) => (
          <Link 
            key={author._id} 
            href={`/autori/${author.slug?.current}`} 
            className="group flex flex-col items-center text-center"
          >
            {/* Imagine Circulară (Consistentă cu medalionul din profil) */}
            <div className="relative w-48 h-48 md:w-56 md:h-56 mb-8 overflow-hidden rounded-full border border-zinc-100 grayscale group-hover:grayscale-0 transition-all duration-700 shadow-sm bg-zinc-50">
              {author.image ? (
                <Image 
                  src={urlFor(author.image).url()} 
                  alt={author.name}
                  fill
                  sizes="(max-width: 768px) 192px, 224px"
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-200">
                  <User size={60} strokeWidth={0.5} />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-300">
                {author.bookCount} {author.bookCount === 1 ? 'Titlu' : 'Titluri'}
              </p>
              <h2 className="font-playfair text-3xl font-bold text-zinc-900 transition-colors group-hover:text-zinc-500">
                {author.name}
              </h2>
              <p className="text-zinc-500 text-sm leading-relaxed italic font-serif line-clamp-2 px-6">
                {author.shortBio || "Biografia urmează să fie adăugată."}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
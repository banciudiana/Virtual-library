import { client } from '@/sanity/lib/client';
import { urlFor } from '@/lib/image';
import Image from 'next/image';
import Link from 'next/link';
import { PortableText } from '@portabletext/react';
import { ChevronRight } from 'lucide-react';

export default async function HomePage() {
  const data = await client.fetch(`{
    "sale": *[_type == "sale" && isActive == true][0] {
      discountValue,
      title,
      "books": appliedBooks[]-> {
        _id, title, price, image, "slug": slug.current, "authorName": author->name
      }
    },
    "newArrivals": *[_type == "book"] | order(_createdAt desc)[0...5] {
      _id, title, price, image, "slug": slug.current, "authorName": author->name
    },
    "topTen": *[_type == "book"] | order(salesCount desc)[0...10] {
      _id, title, price, image, "slug": slug.current, "authorName": author->name
    }
  }`);

  const { sale, topTen } = data;
  const topThree = topTen.slice(0, 3);
  const restOfTop = topTen.slice(3);

  return (
    <main className="min-h-screen bg-white font-sans overflow-x-hidden">
      
      {/* 1. REDUCERI */}
      {sale && (
        <section className="py-12 md:py-20 bg-zinc-50 border-b border-zinc-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col mb-10 md:mb-16 text-left">
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.5em] text-red-800 mb-4 italic">Limited Event</p>
              <h2 className="text-4xl md:text-7xl font-playfair font-bold italic tracking-tighter text-zinc-900 leading-none">
                {sale.title}
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
              {sale.books.map((book: any) => {
                const finalPrice = (book.price * (1 - sale.discountValue)).toFixed(2);
                return (
                  <Link href={`/product/${book.slug}`} key={book._id} className="group flex flex-col">
                    <div className="relative aspect-[2/3] overflow-hidden bg-white shadow-sm transition-all duration-700 group-hover:shadow-2xl">
                      <div className="absolute top-2 left-2 md:top-4 md:left-4 z-20 bg-red-600 text-white text-[8px] md:text-[9px] font-black px-2 py-1 uppercase tracking-widest italic">
                        -{Math.round(sale.discountValue * 100)}%
                      </div>
                      <Image src={urlFor(book.image).url()} alt={book.title} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                    </div>
                    <h3 className="font-playfair text-base md:text-lg font-bold mt-4 md:mt-6 leading-tight line-clamp-2">{book.title}</h3>
                    <div className="flex items-center gap-2 md:gap-3 mt-2">
                      <span className="text-red-600 font-black text-xs md:text-sm">{finalPrice} RON</span>
                      <span className="text-zinc-500 line-through text-[10px] md:text-xs">{book.price} RON</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 2. PODIUM VIZUAL (Ajustat Mobil) */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 md:mb-32">
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.6em] text-zinc-500 mb-6">Cele mai citite</p>
            <h2 className="text-5xl md:text-9xl font-playfair font-bold italic tracking-tighter text-zinc-900 leading-[0.8]">
              Podium <span className="text-zinc-500 italic">V-LIB</span>
            </h2>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-20 md:gap-12 lg:gap-20 mb-40">
             {/* Ordinea pe mobil: 1, 2, 3 vertical | Pe desktop: 2, 1, 3 horizontal */}
            <div className="order-2 md:order-1 w-full max-w-[280px] md:w-1/4">
              <TopRankCard book={topThree[1]} rank={2} isMain={false} />
            </div>
            
            <div className="order-1 md:order-2 w-full max-w-[320px] md:w-1/3 md:pb-12">
              <TopRankCard book={topThree[0]} rank={1} isMain={true} />
            </div>

            <div className="order-3 md:order-3 w-full max-w-[280px] md:w-1/4">
              <TopRankCard book={topThree[2]} rank={3} isMain={false} />
            </div>
          </div>

          {/* LISTA 4-10 */}
          {/* LISTA 4-10 REPARATĂ */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-12 border-t border-zinc-100 pt-16 md:pt-20">
  {restOfTop.map((book: any, index: number) => (
    <Link href={`/product/${book.slug}`} key={book._id} className="group flex gap-6 items-center text-left relative">
      
      {/* NUMĂRUL DE RANK (4, 5, 6...) - ACUM VIZIBIL */}
      <span className="text-5xl md:text-6xl font-playfair font-black text-zinc-200 group-hover:text-zinc-900 transition-colors duration-500 min-w-[50px] md:min-w-[70px] select-none">
        {index + 4}
      </span>
      
      {/* IMAGINEA CĂRȚII */}
      <div className="relative w-16 h-24 flex-shrink-0 bg-zinc-50 shadow-md overflow-hidden border border-zinc-100 transition-transform duration-500 group-hover:-translate-y-1">
        <Image src={urlFor(book.image).url()} alt={book.title} fill sizes="100px" className="object-cover" />
      </div>
      
      {/* TITLU ȘI AUTOR */}
      <div className="flex flex-col justify-center">
        <h4 className="font-playfair font-bold text-sm leading-tight line-clamp-2 text-zinc-900 group-hover:text-zinc-600 transition-colors">
          {book.title}
        </h4>
        <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 mt-1 font-bold italic">
          {book.authorName}
        </p>
      </div>
    </Link>
  ))}
</div>
        </div>
      </section>

      {/* 3. NOUTĂȚI (Ajustat Mobil 2 Col) */}
      <section className="py-16 md:py-24 border-t border-zinc-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-6">
            <div className="text-left">
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-2 italic">Proaspăt tipărite</p>
              <h2 className="text-3xl md:text-5xl font-playfair font-bold italic tracking-tighter text-zinc-900">
                Noutățile <span className="font-light text-zinc-500 underline decoration-zinc-100 underline-offset-8">Lunii</span>
              </h2>
            </div>
            <Link href="/noutati" className="flex items-center gap-3 text-zinc-500 uppercase tracking-[0.3em] text-[9px] md:text-[10px] font-bold hover:text-zinc-900 transition-all group">
              Explorează Tot <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-10">
            {data.newArrivals.map((book: any) => (
              <Link href={`/product/${book.slug}`} key={book._id} className="group flex flex-col">
                <div className="relative aspect-[2/3] w-full mb-4 md:mb-6 overflow-hidden bg-zinc-50 shadow-sm transition-all duration-700 group-hover:shadow-xl">
                  <Image src={urlFor(book.image).url()} alt={book.title} fill sizes="(max-width: 768px) 50vw, 20vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                </div>
                <div className="text-left">
                  <h4 className="font-playfair font-bold text-sm leading-tight line-clamp-2 min-h-[2.5rem] text-zinc-900">{book.title}</h4>
                  <p className="text-[8px] md:text-[9px] uppercase tracking-widest text-zinc-500 mt-2 font-bold italic">{book.authorName}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FOOTER */}
      <section className="py-16 md:py-20 text-center border-t border-zinc-50">
        <Link href="/categorii/toate" className="inline-block border border-zinc-900 px-10 md:px-16 py-4 md:py-6 text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] hover:bg-zinc-900 hover:text-white transition-all">
          Toate Cărțile
        </Link>
      </section>
    </main>
  );
}

function TopRankCard({ book, rank, isMain }: { book: any; rank: number; isMain: boolean }) {
  if (!book) return null;
  return (
    <Link href={`/product/${book.slug}`} className="group relative block text-center">
      <div className={`
        relative z-10 mx-auto bg-white shadow-2xl overflow-hidden transition-all duration-1000 
        group-hover:translate-y-[-10px] group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.15)]
        ${isMain ? 'w-full aspect-[2/3]' : 'w-full aspect-[2/3] md:w-[90%]'}`
      }>
        <Image 
          src={urlFor(book.image).url()} 
          alt={book.title} 
          fill 
          sizes="(max-width: 768px) 80vw, 30vw" 
          className="object-cover transition-transform duration-1000 group-hover:scale-105" 
        />
        
        {/* ETICHETĂ NEAGRĂ PENTRU TOATE CELE 3 LOCURI */}
        <div className="absolute bottom-0 left-0 right-0 bg-zinc-900/90 backdrop-blur-md text-white py-4 text-[9px] font-black uppercase tracking-[0.5em] z-30">
          Bestseller #{rank}
        </div>
      </div>

      <div className="mt-10 px-2 text-left md:text-center">
        <h3 className={`font-playfair font-bold italic leading-tight text-zinc-900 ${isMain ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
          {book.title}
        </h3>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mt-3 italic">
          {book.authorName}
        </p>
      </div>
    </Link>
  );
}
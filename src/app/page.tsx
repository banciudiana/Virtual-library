import { client } from '@/sanity/lib/client';
import { urlFor } from '@/lib/image';
import Image from 'next/image';
import Link from 'next/link';
import { PortableText } from '@portabletext/react';
import { ChevronRight } from 'lucide-react';


export default async function HomePage() {
  // QUERY de Nota 20: Aduce campania activă ȘI cele mai vândute 10 cărți
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
    <main className="min-h-screen bg-white font-sans">
      
      {/* 1. SECȚIUNEA REDUCERI (Dacă există campanie activă) */}
      {sale && (
        <section className="py-20 bg-zinc-50 border-b border-zinc-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col mb-16 text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-red-500 mb-4 italic">Limited Event</p>
              <h2 className="text-5xl md:text-7xl font-playfair font-bold italic tracking-tighter text-zinc-900 leading-none">
                {sale.title}
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
              {sale.books.map((book: any) => {
                const finalPrice = (book.price * (1 - sale.discountValue)).toFixed(2);
                return (
                  <Link href={`/product/${book.slug}`} key={book._id} className="group">
                    <div className="relative aspect-[2/3] overflow-hidden bg-white shadow-sm transition-all duration-700 group-hover:shadow-2xl">
                      <div className="absolute top-4 left-4 z-20 bg-red-600 text-white text-[9px] font-black px-2 py-1 uppercase tracking-widest italic">
                        -{Math.round(sale.discountValue * 100)}%
                      </div>
                      <Image src={urlFor(book.image).url()} alt={book.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                    </div>
                    <h3 className="font-playfair text-lg font-bold mt-6 leading-tight line-clamp-1">{book.title}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-red-600 font-black text-sm">{finalPrice} RON</span>
                      <span className="text-zinc-300 line-through text-xs">{book.price} RON</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 2. SECȚIUNEA TOP 10 (PODIUM + LISTĂ) */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-32">
            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-400 mb-6">Cele mai citite</p>
            <h2 className="text-6xl md:text-9xl font-playfair font-bold italic tracking-tighter text-zinc-900 leading-[0.8]">
              Podium <span className="text-zinc-100 italic">V-LIB</span>
            </h2>
          </div>

          {/* PODIUM VIZUAL */}
          <div className="flex flex-col md:flex-row items-end justify-center gap-12 lg:gap-20 mb-40">
            {/* LOCUL 2 */}
            <div className="order-2 md:order-1 w-full md:w-1/4">
              <TopRankCard book={topThree[1]} rank={2} isMain={false} />
            </div>
            
            {/* LOCUL 1 (Center & Large) */}
            <div className="order-1 md:order-2 w-full md:w-1/3 pb-12">
              <TopRankCard book={topThree[0]} rank={1} isMain={true} />
            </div>

            {/* LOCUL 3 */}
            <div className="order-3 md:order-3 w-full md:w-1/4">
              <TopRankCard book={topThree[2]} rank={3} isMain={false} />
            </div>
          </div>

          {/* LISTA EDITORIALĂ (4-10) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-16 border-t border-zinc-100 pt-20">
            {restOfTop.map((book: any, index: number) => (
              <Link href={`/product/${book.slug}`} key={book._id} className="group flex gap-6 items-center text-left">
                <span className="text-5xl font-playfair font-black text-zinc-50 group-hover:text-zinc-900 transition-colors duration-500">
                  {index + 4}
                </span>
                <div className="relative w-16 h-24 flex-shrink-0 bg-zinc-50 shadow-sm overflow-hidden border border-zinc-100">
                  <Image src={urlFor(book.image).url()} alt={book.title} fill className="object-cover" />
                </div>
                <div>
                  <h4 className="font-playfair font-bold text-sm leading-tight line-clamp-2 text-zinc-900">{book.title}</h4>
                  <p className="text-[9px] uppercase tracking-widest text-zinc-400 mt-1 font-bold italic">{book.authorName}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SECȚIUNEA NOUTĂȚI */}
<section className="py-24 border-t border-zinc-50">
  <div className="max-w-7xl mx-auto px-6">
    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
      <div className="text-left">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-2 italic">Proaspăt Ieșite din Tipar</p>
        <h2 className="text-4xl md:text-5xl font-playfair font-bold italic tracking-tighter text-zinc-900">
          Noutățile <span className="font-light text-zinc-300 underline decoration-zinc-100 underline-offset-8">Lunii</span>
        </h2>
      </div>

      {/* Butonul care arată ca cel de "Înapoi" */}
      <Link 
        href="/noutati" 
        className="flex items-center gap-3 text-zinc-400 uppercase tracking-[0.3em] text-[10px] font-bold hover:text-zinc-900 transition-all group pb-2"
      >
        Vezi Toate Noutățile 
        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-10">
      {data.newArrivals.map((book: any) => (
        <Link href={`/product/${book.slug}`} key={book._id} className="group flex flex-col">
          <div className="relative aspect-[2/3] w-full mb-6 overflow-hidden bg-zinc-50 shadow-sm transition-all duration-700 group-hover:shadow-xl">
            <Image 
              src={urlFor(book.image).url()} 
              alt={book.title} 
              fill 
              sizes="20vw"
              className="object-cover transition-transform duration-1000 group-hover:scale-105" 
            />
          </div>
          <div className="text-left">
            <h4 className="font-playfair font-bold text-sm leading-tight line-clamp-2 min-h-[2.5rem] text-zinc-900">
              {book.title}
            </h4>
            <p className="text-[9px] uppercase tracking-widest text-zinc-400 mt-2 font-bold italic">
              {book.authorName}
            </p>
            <p className="text-xs font-black text-zinc-900 mt-2">
              {book.price} RON
            </p>
          </div>
        </Link>
      ))}
    </div>
  </div>
</section>

      {/* FOOTER CALL TO ACTION */}
      <section className="py-20 text-center border-t border-zinc-50">
        <Link href="/categorii/toate" className="inline-block border border-zinc-900 px-16 py-6 text-[11px] font-black uppercase tracking-[0.4em] hover:bg-zinc-900 hover:text-white transition-all">
          Explorează Tot Catalogul
        </Link>
      </section>
    </main>
  );
}

// COMPONENTA INTERNĂ PENTRU PODIUM
function TopRankCard({ book, rank, isMain }: { book: any; rank: number; isMain: boolean }) {
  if (!book) return null;
  return (
    <Link href={`/product/${book.slug}`} className="group relative block text-center">
      {/* Cifra de fundal */}
      <div className={`absolute -top-16 left-1/2 -translate-x-1/2 font-playfair font-black italic opacity-[0.03] group-hover:opacity-10 transition-all duration-700 select-none
        ${isMain ? 'text-[250px]' : 'text-[180px]'}`}>
        {rank}
      </div>

      <div className={`relative mx-auto bg-zinc-100 shadow-2xl overflow-hidden transition-all duration-1000 group-hover:translate-y-[-10px]
        ${isMain ? 'w-full aspect-[2/3]' : 'w-full aspect-[2/3] md:w-[90%]'}`}>
        <Image src={urlFor(book.image).url()} alt={book.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
        
        {rank === 1 && (
          <div className="absolute bottom-0 left-0 right-0 bg-zinc-900/90 backdrop-blur-md text-white py-4 text-[9px] font-black uppercase tracking-[0.5em]">
            Bestsellerul Lunii
          </div>
        )}
      </div>

      <div className="mt-10 px-2">
        <h3 className={`font-playfair font-bold italic leading-tight text-zinc-900 ${isMain ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
          {book.title}
        </h3>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mt-3">{book.authorName}</p>
      </div>
    </Link>
  );
}
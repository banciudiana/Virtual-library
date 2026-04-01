import { client } from '@/sanity/lib/client'
import { urlFor } from '@/lib/image'
import Image from 'next/image'
import Link from 'next/link'

export default async function NoutatiPage() {
  const books = await client.fetch(`*[_type == "book"] | order(_createdAt desc) [0...10] {
    _id,
    title,
    price,
    "slug": slug.current,
    image,
    "authorName": author->name,
    "categoryName": categories[0]->title,
    format
  }`);

  return (
    <main className="max-w-7xl mx-auto px-6 py-16 md:py-24">
      {/* Header - Am păstrat Serif pentru titlul mare de pagină, conform stilului Blackwell's */}
      <div className="max-w-3xl mb-16">
        <h1 className="text-5xl font-serif italic mb-6">
          Noutăți <span className="italic font-light">Literare</span>
        </h1>
        <div className="h-px w-20 bg-zinc-900 mb-6"></div>
        <p className="font-sans text-zinc-500 uppercase tracking-[0.3em] text-[10px] font-bold">
          Descoperă cele mai recente apariții în biblioteca noastră
        </p>
      </div>

      {/* Grid-ul rafinat */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-20">
        {books.map((book: any) => (
          <Link href={`/product/${book.slug}`} key={book._id} className="group flex flex-col h-full">
            
            {/* Imaginea */}
            <div className="relative aspect-[2/3] w-full mb-8 overflow-hidden bg-zinc-50 transition-all duration-700 group-hover:shadow-2xl">
              {book.image && (
                <Image 
                    src={urlFor(book.image).url()} 
                    alt={book.title}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
              )}
            </div>

            {/* Info Carte - Aliniere fixă */}
            <div className="flex flex-col flex-grow">
              {/* Titlu: Font Sans (ca în Navbar), Bold, limitat la 2 rânduri */}
              <h3 className="font-playfair text-xl font-bold leading-tight text-zinc-900 group-hover:text-zinc-500 transition-colors duration-300 min-h-[3rem] line-clamp-2">
                {book.title}
                </h3>
              
              {/* Autor: Font Sans (Inter), Drept (nu italic), Nebolduit */}
           
              <p className="font-sans text-zinc-500 uppercase tracking-[0.3em] text-[10px] font-bold">
                {book.authorName}
              </p>

              {/* Preț & Format - Împinse mereu jos pentru aliniere perfectă */}
              <div className="pt-4 mt-auto border-t border-zinc-100 flex justify-between items-center">
                <span className="font-sans font-bold text-sm tracking-tighter text-zinc-900">
                  {book.price} RON
                </span>
                <span className="font-sans text-[9px] uppercase tracking-widest text-zinc-500 font-bold">
                  {book.format?.[0] || 'Fizică'}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
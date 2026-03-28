import { client } from '@/sanity/lib/client'
import { urlFor } from '@/lib/image'
import Image from 'next/image'
import Link from 'next/link'

export default async function Home() {
  // Interogarea GROQ: aducem tot ce ne trebuie pentru un card elegant
  const books = await client.fetch(`*[_type == "book"]{
    _id,
    title,
    price,
    "slug": slug.current,
    image,
    "authorName": author->name,
    "categoryName": categories[0]->title,
    "formats": formats
  }`);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Secțiune - Stil Blackwell's */}
      <div className="flex flex-col mb-12 border-b border-zinc-100 pb-8">
        <h1 className="font-playfair text-4xl md:text-5xl font-bold italic text-zinc-900">
          Noutăți Literare
        </h1>
        <p className="text-zinc-500 text-sm mt-4 font-medium uppercase tracking-[0.3em]">
          Selecția noastră de astăzi
        </p>
      </div>
      
      {/* Grid-ul de Cărți */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-16">
        {books.map((book: any) => (
          <Link href={`/product/${book.slug}`} key={book._id} className="group cursor-pointer flex flex-col h-full">
            
            {/* Imaginea Cărții cu Aspect Ratio fix */}
            <div className="relative aspect-[2/3] w-full mb-6 overflow-hidden bg-zinc-50 shadow-sm transition-all duration-500 group-hover:shadow-xl">
              {book.image && (
                <Image 
                  src={urlFor(book.image).url()} 
                  alt={book.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
              
              {/* Badge discret pentru primul format găsit */}
              {book.formats && book.formats[0] && (
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-2 py-1 shadow-sm">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-800">
                    {book.formats[0]}
                  </span>
                </div>
              )}
            </div>

            {/* Detalii Carte */}
            <div className="flex flex-col flex-grow space-y-2">
              <div className="space-y-1">
                <h3 className="font-playfair text-xl font-bold leading-tight text-zinc-900 group-hover:text-zinc-600 transition tracking-tight">
                  {book.title}
                </h3>
                <p className="text-zinc-500 text-sm font-medium italic">
                  {book.authorName}
                </p>
              </div>

              <div className="pt-2 mt-auto">
                <p className="text-zinc-400 text-[10px] uppercase tracking-widest font-bold mb-2">
                  {book.categoryName || 'General'}
                </p>
                <p className="font-sans font-bold text-base text-black border-t border-zinc-50 pt-3">
                  {book.price} <span className="text-xs font-normal">RON</span>
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Mesaj în caz că nu sunt cărți */}
      {books.length === 0 && (
        <div className="text-center py-20">
          <p className="text-zinc-400 italic">Nu am găsit nicio carte în baza de date.</p>
        </div>
      )}
    </main>
  )
}
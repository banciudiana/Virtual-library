import { client } from '@/sanity/lib/client'
import { urlFor } from '@/lib/image'
import Image from 'next/image'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import { ArrowLeft, BookOpen } from 'lucide-react'

// Interogarea GROQ actualizată cu numele câmpurilor din schema ta
async function getAuthorData(slug: string) {
  return await client.fetch(`{
    "author": *[_type == "author" && slug.current == $slug][0]{
      _id,
      name,
      "bio": fullBio, 
      image
    },
    "books": *[_type == "book" && author->slug.current == $slug] | order(title asc) {
      _id,
      title,
      price,
      "slug": slug.current,
      image,
      format
    }
  }`, { slug });
}

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { author, books } = await getAuthorData(slug);

  if (!author) {
    return (
      <div className="p-20 text-center font-playfair italic uppercase tracking-widest text-[10px] text-zinc-500">
        Autorul nu a fost găsit în bibliotecă.
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-12 md:py-20 font-sans">
      
      {/* Navigare Înapoi */}
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-zinc-500 hover:text-black transition-colors mb-16 group font-bold"
      >
        <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
        Înapoi
      </Link>

      {/* Profil Autor */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-12 border-b border-zinc-50 pb-20 mb-20 text-center md:text-left">
        
        {/* Imagine - Stil Medalion */}
        {author.image && (
          <div className="relative w-40 h-40 md:w-56 md:h-56 flex-shrink-0 rounded-full overflow-hidden border border-zinc-100 shadow-sm">
            <Image 
              src={urlFor(author.image).url()} 
              alt={author.name}
              fill
              priority
              sizes="(max-width: 768px) 160px, 224px"
              className="object-cover"
            />
          </div>
        )}

        <div className="flex-grow max-w-2xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500 mb-4 font-sans">
            Profil Literar
          </p>
          <h1 className="font-playfair text-5xl md:text-7xl font-bold leading-tight mb-8 tracking-tighter text-zinc-900">
            {author.name}
          </h1>
          
          <div className="prose prose-zinc prose-sm max-w-none font-sans leading-relaxed text-zinc-500 italic">
            {author.bio ? (
              <PortableText value={author.bio} />
            ) : (
              <p>Biografia completă urmează să fie adăugată.</p>
            )}
          </div>
        </div>
      </div>

      {/* Grid Cărți */}
      <div className="text-left">
        <div className="flex items-center justify-between mb-16 border-b border-zinc-50 pb-6">
           <h2 className="font-playfair text-3xl font-bold text-zinc-900 tracking-tight">
             Titluri disponibile <span className="text-zinc-500 font-light italic ml-2">({books.length})</span>
           </h2>
           <BookOpen size={20} className="text-zinc-200" strokeWidth={1} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-20">
          {books.map((book: any) => (
            <Link href={`/product/${book.slug}`} key={book._id} className="group flex flex-col h-full">
              <div className="relative aspect-[2/3] w-full mb-8 overflow-hidden bg-zinc-50 transition-all duration-700 group-hover:shadow-xl border border-zinc-50">
                {book.image && (
                  <Image 
                    src={urlFor(book.image).url()} 
                    alt={book.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                )}
              </div>
              
              <div className="flex flex-col flex-grow">
                <h3 className="font-playfair text-xl font-bold leading-tight text-zinc-900 group-hover:text-zinc-500 transition-colors duration-300 min-h-[3rem] line-clamp-2 tracking-tight">
                  {book.title}
                </h3>
                
                <p className="font-sans text-xs text-zinc-500 mt-2 font-medium uppercase tracking-widest">
                  {author.name}
                </p>

                <div className="pt-4 mt-auto border-t border-zinc-50 flex justify-between items-center">
                  <span className="font-sans font-bold text-sm text-zinc-900">
                    {book.price} RON
                  </span>
                  <span className="font-sans text-[8px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
                    {book.format?.[0] || 'Standard'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
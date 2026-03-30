import { client } from '@/sanity/lib/client'
import { urlFor } from '@/lib/image'
import Image from 'next/image'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import { ArrowLeft } from 'lucide-react'
import ProductDetailsClient from '@/components/ProductDetailClient'

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const book = await client.fetch(`*[_type == "book" && slug.current == $slug][0]{
    _id,
    title,
    price,
    shortDescription,
    longDescription,
    rating,
    image,
    stock,
    "authorName": author->name,
    "authorSlug": author->slug.current,
    "authorShortBio": author->shortBio,
    "authorImage": author->image,
    "categoryName": categories[0]->title,
    format
  }`, { slug });

  if (!book) return <div className="p-20 text-center font-playfair italic uppercase tracking-widest text-xs">Cartea nu a fost găsită...</div>;

  return (
    <main className="max-w-7xl mx-auto px-6 py-8 md:py-16">
      {/* Buton Înapoi */}
      <Link href="/" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-zinc-400 hover:text-black transition-colors mb-12 group font-sans font-bold">
        <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
        Înapoi
      </Link>

      {/* Grid-ul Principal (Imagine + Client Component pentru Detalii) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-24 items-center mb-24">
        <div className="md:col-span-5">
          <div className="relative aspect-[2/3] w-full max-w-[400px] md:max-w-none mx-auto bg-white shadow-sm overflow-hidden border border-zinc-50">
            {book.image && (
              <Image 
                src={urlFor(book.image).url()} 
                alt={book.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
            )}
          </div>
        </div>

        {/* Partea interactivă: Titlu, Preț, Formate, Buton Coș */}
        <div className="md:col-span-7">
          <ProductDetailsClient book={book} />
        </div>
      </div>

      {/* Secțiunea de jos rămâne neschimbată */}
      <div className="border-t border-zinc-100 pt-20">
        <div className="flex flex-col md:flex-row gap-10 items-start mb-24 p-10 bg-zinc-50/40 rounded-sm">
           {book.authorImage && (
             <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border border-zinc-100 grayscale">
                <Image src={urlFor(book.authorImage).url()} alt={book.authorName} fill className="object-cover" />
             </div>
           )}
           <div className="max-w-3xl">
              <p className="font-sans text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-3">Despre autor</p>
              <h4 className="font-playfair text-2xl font-bold mb-4 italic">{book.authorName}</h4>
              <p className="font-sans text-sm text-zinc-500 leading-relaxed italic">{book.authorShortBio}</p>
              <Link href={`/autori/${book.authorSlug}`} className="inline-block mt-6 text-[9px] font-bold uppercase tracking-widest border-b border-zinc-200 hover:text-black transition-all">Vezi profil complet</Link>
           </div>
        </div>
        <div className="max-w-4xl">
          <h3 className="text-[10px] font-bold font-sans uppercase tracking-[0.4em] text-zinc-900 mb-12 opacity-80">Rezumat Detaliat</h3>
          <div className="prose prose-zinc prose-lg max-w-none font-sans leading-relaxed text-zinc-600">
            {book.longDescription ? <PortableText value={book.longDescription} /> : <p className="italic text-zinc-400">Descrierea urmează să fie actualizată.</p>}
          </div>
        </div>
        <div className="mt-32 pt-12 border-t border-zinc-100 text-[9px] text-zinc-400 uppercase tracking-[0.3em] space-y-4 font-sans font-bold text-center">
          <p className="flex items-center justify-center gap-3">● Livrare gratuită peste 150 RON</p>
          <p className="flex items-center justify-center gap-3">● Livrare în 24-48h lucrătoare</p>
        </div>
      </div>
    </main>
  );
}
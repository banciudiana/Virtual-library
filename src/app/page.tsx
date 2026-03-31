import { client } from '@/sanity/lib/client';
import { urlFor } from '@/lib/image';
import Image from 'next/image';
import Link from 'next/link';

export default async function HomePage() {
  // Luăm campania ACTIVĂ și datele cărților din ea
  const saleData = await client.fetch(`
    *[_type == "sale" && isActive == true][0] {
      discountValue,
      title,
      "books": appliedBooks[]-> {
        _id,
        title,
        price,
        image,
        "slug": slug.current,
        "authorName": author->name
      }
    }
  `);

  // Dacă nu avem nicio campanie activă sau nu are cărți, afișăm un mesaj discret
  if (!saleData || !saleData.books) {
    return (
      <div className="py-40 text-center">
        <p className="font-playfair italic text-zinc-400">Momentan nu sunt campanii active.</p>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-20 font-sans">
      {/* Header Secțiune Reduceri */}
      <div className="mb-16 text-left">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500 mb-4 italic">
          Oferte Exclusive
        </p>
        <h1 className="text-5xl md:text-7xl font-playfair font-bold italic tracking-tighter text-zinc-900">
          {saleData.title}
        </h1>
        <div className="w-24 h-1 bg-red-500 mt-6"></div>
      </div>

      {/* Grid-ul de Produse la Reducere */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-20">
        {saleData.books.map((book: any) => {
          // Calculăm prețul redus: Preț - (Preț * Procent)
          const finalPrice = (book.price * (1 - saleData.discountValue)).toFixed(2);
          const percentLabel = Math.round(saleData.discountValue * 100);

          return (
            <Link href={`/product/${book.slug}`} key={book._id} className="group flex flex-col h-full text-left">
              {/* Imagine cu Badge */}
              <div className="relative aspect-[2/3] w-full mb-8 overflow-hidden bg-zinc-50 transition-all duration-700 group-hover:shadow-2xl">
                <div className="absolute top-4 left-4 z-20 bg-red-600 text-white text-[10px] font-black px-3 py-1.5 uppercase tracking-widest shadow-xl">
                  -{percentLabel}%
                </div>
                {book.image && (
                  <Image 
                    src={urlFor(book.image).url()} 
                    alt={book.title} 
                    fill 
                    className="object-cover transition-transform duration-1000 group-hover:scale-105" 
                  />
                )}
              </div>

              {/* Detalii */}
              <div className="flex flex-col flex-grow">
                <h3 className="font-playfair text-xl font-bold leading-tight line-clamp-2 min-h-[3rem] text-zinc-900">
                  {book.title}
                </h3>
                <p className="font-sans text-zinc-400 uppercase tracking-[0.3em] text-[10px] font-bold mt-2">
                  {book.authorName}
                </p>

                {/* Prețuri Sincronizate */}
                <div className="pt-4 mt-auto border-t border-zinc-100 flex items-baseline gap-3">
                  <span className="font-sans font-black text-lg text-red-600 tracking-tighter">
                    {finalPrice} RON
                  </span>
                  <span className="font-sans text-xs text-zinc-300 line-through font-bold">
                    {book.price} RON
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
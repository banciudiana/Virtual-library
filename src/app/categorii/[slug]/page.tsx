import { client } from '@/sanity/lib/client';
import { urlFor } from '@/lib/image';
import Image from 'next/image';
import Link from 'next/link';
import FilterControls from '@/components/FilterControls';

export default async function CategoryPage(props: { 
  params: Promise<{ slug: string }>,
  searchParams: Promise<{ sort?: string; min?: string; max?: string; author?: string; format?: string }> 
}) {
  const resolvedParams = await props.params;
  const resolvedSearchParams = await props.searchParams;

  const slug = resolvedParams?.slug || "toate";
  const sort = resolvedSearchParams?.sort || "";
  const minPrice = Number(resolvedSearchParams?.min) || 0;
  const maxPrice = Number(resolvedSearchParams?.max) || 2000;
  
  const selectedAuthor = resolvedSearchParams?.author || "";
  const authorsList = selectedAuthor ? selectedAuthor.split(',') : [];
  const selectedFormat = resolvedSearchParams?.format || "";

  let orderClause = '_createdAt desc'; 
  if (sort === 'price-asc') orderClause = 'price asc';
  if (sort === 'price-desc') orderClause = 'price desc';
  if (sort === 'title-asc') orderClause = 'title asc';
  if (sort === 'title-desc') orderClause = 'title desc';

  // QUERY: Aduce cărțile filtrate ȘI campania de reduceri activă
  const data = await client.fetch(`
    {
      "activeSale": *[_type == "sale" && isActive == true][0] {
        discountValue,
        "appliedBookIds": appliedBooks[]._ref
      },
      "currentCategory": *[_type == "category" && slug.current == $slug][0]{
        _id, title
      },
      "authors": *[_type == "author"] | order(name asc) { _id, name },
      "books": *[_type == "book" && (
        $slug == "toate" || 
        references(*[_type == "category" && slug.current == $slug]._id) ||
        categories[]->parent->slug.current == $slug
      ) 
      && price >= $minPrice && price <= $maxPrice
      && (count($authorsList) == 0 || author._ref in $authorsList)
      && ($format == "" || format == $format || $format in format)
      ] | order(${orderClause}) {
        _id, title, price, image, format,
        "slug": slug.current,
        "authorName": author->name
      }
    }
  `, { 
    slug, 
    minPrice, 
    maxPrice, 
    authorsList, 
    format: selectedFormat 
  });

  const { books, activeSale, authors, currentCategory } = data;

  return (
    <main className="max-w-7xl mx-auto px-6 py-16 font-sans">
      <header className="mb-16 text-left">
        <div className="max-w-4xl">
          <h1 className="font-playfair text-4xl md:text-6xl font-bold italic text-zinc-900 tracking-tighter capitalize leading-[0.9]">
            {currentCategory?.title || "Toate cărțile"}
          </h1>
          <div className="w-20 h-px bg-zinc-900 mt-8 opacity-20"></div>
        </div>
      </header>

      <FilterControls 
        min={minPrice} 
        max={maxPrice} 
        currentSort={sort} 
        authors={authors || []}
        selectedAuthor={selectedAuthor}
        selectedFormat={selectedFormat}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-20">
        {books.length > 0 ? (
          books.map((book: any) => {
            // Logica de reducere pentru fiecare carte
            const isReduced = activeSale?.appliedBookIds?.includes(book._id);
            const finalPrice = isReduced 
              ? (book.price * (1 - activeSale.discountValue)).toFixed(2) 
              : book.price;
            const discountPercent = activeSale ? Math.round(activeSale.discountValue * 100) : 0;

            return (
              <Link href={`/product/${book.slug}`} key={book._id} className="group flex flex-col h-full">
                <div className="relative aspect-[2/3] w-full mb-8 overflow-hidden bg-zinc-50 transition-all duration-700 group-hover:shadow-2xl">
                  
                  {/* BADGE REDUCERE */}
                  {isReduced && (
                    <div className="absolute top-4 left-4 z-20 bg-red-600 text-white text-[9px] font-black px-2 py-1 uppercase tracking-widest italic shadow-xl">
                      -{discountPercent}%
                    </div>
                  )}

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

                <div className="flex flex-col flex-grow text-left">
                  <h3 className="font-playfair text-xl font-bold leading-tight line-clamp-2 min-h-[3rem] text-zinc-900 group-hover:text-zinc-600 transition-colors">
                    {book.title}
                  </h3>
                  <p className="font-sans text-zinc-500 uppercase tracking-[0.3em] text-[10px] font-bold mt-2 italic">
                    {book.authorName}
                  </p>
                  
                  <div className="pt-4 mt-auto border-t border-zinc-100 flex justify-between items-center">
                    {/* PREȚ DINAMIC (ROȘU DACĂ E REDUS) */}
                    <div className="flex items-center gap-2">
                      <span className={`font-sans font-black text-sm tracking-tighter ${isReduced ? 'text-red-600' : 'text-zinc-900'}`}>
                        {finalPrice} RON
                      </span>
                      {isReduced && (
                        <span className="text-[10px] text-zinc-500 line-through font-bold">
                          {book.price} RON
                        </span>
                      )}
                    </div>

                    <span className="font-sans text-[9px] uppercase tracking-widest text-zinc-500 font-bold italic opacity-60">
                      {Array.isArray(book.format) ? book.format[0] : (book.format || 'Fizică')}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full py-40 text-center">
            <p className="font-playfair text-2xl italic text-zinc-500">
              Nicio carte nu se potrivește filtrelor selectate...
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
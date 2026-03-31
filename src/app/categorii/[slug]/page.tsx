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
  
  // 1. Transformăm string-ul de autori din URL ("id1,id2") într-un Array pentru Sanity
  const selectedAuthor = resolvedSearchParams?.author || "";
  const authorsList = selectedAuthor ? selectedAuthor.split(',') : [];
  
  const selectedFormat = resolvedSearchParams?.format || "";

  let orderClause = '_createdAt desc'; 
  if (sort === 'price-asc') orderClause = 'price asc';
  if (sort === 'price-desc') orderClause = 'price desc';
  if (sort === 'title-asc') orderClause = 'title asc';
  if (sort === 'title-desc') orderClause = 'title desc';

  // 2. QUERY OPTIMIZAT: Suportă selecție multiplă autori (OR logic) și Categorii Mamă
  const data = await client.fetch(`
    {
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
    authorsList, // Pasăm array-ul de ID-uri
    format: selectedFormat 
  });

  return (
    <main className="max-w-7xl mx-auto px-6 py-16 font-sans">
      {/* Header Editorial - Stil Blackwell's */}
      <header className="mb-16 text-left">
        <div className="max-w-4xl">
       
          <h1 className="font-playfair text-4xl md:text-6xl font-bold italic text-zinc-900 tracking-tighter capitalize leading-[0.9]">
            {data.currentCategory?.title || "Toate cărțile"}
          </h1>
          <div className="w-20 h-px bg-zinc-900 mt-8 opacity-20"></div>
        </div>
      </header>

      {/* Controler Filtre (Client Component) */}
      <FilterControls 
        min={minPrice} 
        max={maxPrice} 
        currentSort={sort} 
        authors={data.authors || []}
        selectedAuthor={selectedAuthor} // Trimitem string-ul brut pentru URL sync
        selectedFormat={selectedFormat}
      />

      {/* Grid Produse */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-20">
        {data.books.length > 0 ? (
          data.books.map((book: any) => (
            <Link href={`/product/${book.slug}`} key={book._id} className="group flex flex-col h-full">
              {/* Imagine Copertă */}
              <div className="relative aspect-[2/3] w-full mb-8 overflow-hidden bg-zinc-50 transition-all duration-700 group-hover:shadow-2xl">
                {book.image && (
                  <Image 
                    src={urlFor(book.image).url()} 
                    alt={book.title} 
                    fill 
                    priority
                    sizes="(max-width: 768px) 100vw, 25vw" 
                    className="object-cover transition-transform duration-1000 group-hover:scale-105" 
                  />
                )}
              </div>

              {/* Detalii Carte */}
              <div className="flex flex-col flex-grow text-left">
                <h3 className="font-playfair text-xl font-bold leading-tight line-clamp-2 min-h-[3rem] text-zinc-900 group-hover:text-zinc-600 transition-colors">
                  {book.title}
                </h3>
                <p className="font-sans text-zinc-500 uppercase tracking-[0.3em] text-[10px] font-bold mt-2">
                  {book.authorName}
                </p>
                
                {/* Footer Card: Preț & Format */}
                <div className="pt-4 mt-auto border-t border-zinc-100 flex justify-between items-center">
                  <span className="font-sans font-bold text-sm tracking-tighter text-zinc-900">
                    {book.price} RON
                  </span>
                  <span className="font-sans text-[9px] uppercase tracking-widest text-zinc-400 font-bold">
                    {book.format?.[0] || 'Fizică'}
                  </span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-40 text-center">
            <p className="font-playfair text-2xl italic text-zinc-300">
              Nicio carte nu se potrivește filtrelor selectate...
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
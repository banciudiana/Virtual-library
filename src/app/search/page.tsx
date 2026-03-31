import { client } from '@/sanity/lib/client';
import SearchClient from '@/components/SearchClient';

export default async function SearchPage() {
  // Aduce toate cărțile pentru a permite căutarea instantanee pe client
  // Sau poți limita la noutăți dacă ai mii de produse
  const books = await client.fetch(`*[_type == "book"] | order(_createdAt desc) {
    _id,
    title,
    price,
    "slug": slug.current,
    image,
    "authorName": author->name,
    "categoryName": categories[0]->title
  }`);

  return (
    <main className="max-w-7xl mx-auto px-6 py-16 md:py-24 font-sans">
      <header className="mb-16 text-left">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-4 italic">
          Căutare în Bibliotecă
        </p>
        <h1 className="text-5xl md:text-7xl font-playfair font-bold italic tracking-tighter text-zinc-900 leading-none">
          Găsește <span className="font-light text-zinc-300 italic">Inspirație</span>
        </h1>
      </header>

      <SearchClient initialBooks={books} />
    </main>
  );
}
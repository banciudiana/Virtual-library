import { client } from '@/sanity/lib/client'

export default async function Home() {
  // Aceasta este "interogarea" care cere datele de la Sanity
  const books = await client.fetch(`*[_type == "book"]{title, _id}`);

  return (
    <main className="p-20">
      <h1 className="text-2xl font-bold mb-5">Test Conexiune: Cărțile Mele</h1>
      
      {/* Dacă lista e goală, afișăm un mesaj de ajutor */}
      {books.length === 0 && <p>Nu am găsit cărți. Verifică dacă ai apăsat "Publish" în Studio!</p>}
      
      <ul className="list-disc pl-5">
        {books.map((book: any) => (
          <li key={book._id} className="text-lg">
            {book.title}
          </li>
        ))}
      </ul>
    </main>
  )
}
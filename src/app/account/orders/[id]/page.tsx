'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { client } from '@/sanity/lib/client'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function OrderDetailPage() {
  const params = useParams()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // QUERY OPTIMIZAT: Folosim coalesce pentru a preveni "Produs indisponibil"
        // Chiar dacă referința e parțial coruptă, căutăm cartea după ID-ul din _ref
        const data = await client.fetch(`
          *[_type == "order" && _id == $id][0]{
            orderNumber,
            orderDate,
            totalAmount,
            status,
            items[]{
              quantity,
              format,
              priceAtPurchase,
              "bookData": coalesce(
                book->{
                  title,
                  "slug": slug.current
                },
                *[_type == "book" && _id == ^.book._ref][0]{
                  title,
                  "slug": slug.current
                }
              )
            }
          }
        `, { id: params.id })
        
        setOrder(data)
      } catch (error) {
        console.error("Eroare la preluarea comenzii:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) fetchOrder()
  }, [params.id])

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-zinc-900" size={30} />
      <p className="font-playfair italic text-zinc-500">Se încarcă detaliile comenzii...</p>
    </div>
  )

  if (!order) return (
    <div className="p-20 text-center space-y-6">
      <p className="uppercase tracking-[0.3em] text-[10px] font-bold text-zinc-500">Comanda nu a fost găsită.</p>
      <Link href="/account" className="inline-block border-b border-black pb-1 text-xs font-bold uppercase tracking-widest">Înapoi la cont</Link>
    </div>
  )

  return (
    <main className="max-w-4xl mx-auto px-6 py-16 font-sans">
      <Link href="/account" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-zinc-500 hover:text-black transition-colors mb-12 font-bold group">
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Înapoi la cont
      </Link>

      <div className="border-b border-zinc-100 pb-12 mb-12 text-left">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-2 italic">Rezumat Comandă</p>
        <h1 className="font-playfair text-4xl md:text-5xl font-bold text-zinc-900 mb-8 italic tracking-tighter">
          #{order.orderNumber}
        </h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Data</p>
            <p className="text-sm font-bold text-zinc-800">{new Date(order.orderDate).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Status</p>
            <span className="inline-block text-[9px] font-black uppercase px-2 py-1 bg-zinc-900 text-white tracking-widest">
              {order.status}
            </span>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Metodă Plată</p>
            <p className="text-sm font-bold text-zinc-800 italic font-playfair">Card Online</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Total</p>
            <p className="text-sm font-black text-zinc-900">{order.totalAmount} RON</p>
          </div>
        </div>
      </div>

      <div className="space-y-8 text-left">
        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-900 mb-8 italic">Produse achiziționate</h3>
        <div className="divide-y divide-zinc-100 border-t border-zinc-100">
          {order.items?.map((item: any, idx: number) => (
            <div key={idx} className="py-8 flex justify-between items-center group">
              <div className="space-y-2">
                {item.bookData ? (
                  <Link href={`/product/${item.bookData.slug}`} className="font-playfair text-xl font-bold text-zinc-900 hover:text-zinc-500 transition-all block italic tracking-tight">
                    {item.bookData.title}
                  </Link>
                ) : (
                  <span className="font-playfair text-xl font-bold text-zinc-500 italic">Produs indisponibil</span>
                )}
                
                <div className="flex items-center gap-4 text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold italic">
                  <span>Format: {item.format || 'Fizic'}</span>
                  <span className="w-1.5 h-1.5 bg-zinc-100 rounded-full"></span>
                  <span>Cantitate: {item.quantity}</span>
                </div>
              </div>
              <p className="font-sans font-black text-zinc-900 tracking-tighter italic text-right text-lg">
                {item.priceAtPurchase} <span className="text-[10px] font-normal not-italic">RON</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER TOTAL */}
      <div className="mt-16 p-10 bg-zinc-50/50 border border-zinc-100 space-y-6">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500 italic font-medium font-playfair">Subtotal produse</span>
          <span className="font-bold text-zinc-900">{order.totalAmount} RON</span>
        </div>
        <div className="flex justify-between items-center border-t border-zinc-200 pt-8">
          <div>
            <span className="font-black uppercase tracking-[0.3em] text-[10px] text-zinc-900 block mb-1">Suma Totală</span>
            <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">TVA inclus</span>
          </div>
          <span className="font-black text-3xl text-zinc-900 tracking-tighter italic">{order.totalAmount} RON</span>
        </div>
      </div>
    </main>
  )
}
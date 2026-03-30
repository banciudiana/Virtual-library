'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { client } from '@/sanity/lib/client'
import Link from 'next/link'
import { ArrowLeft, Package, Calendar, Tag, CreditCard } from 'lucide-react'

export default function OrderDetailPage() {
  const params = useParams()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      // Luăm detaliile comenzii și facem "join" cu datele cărților
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
            "book": book->{
              title,
              "slug": slug.current
            }
          }
        }
      `, { id: params.id })
      
      setOrder(data)
      setLoading(false)
    }

    fetchOrder()
  }, [params.id])

  if (loading) return <div className="p-20 text-center font-serif italic">Se încarcă detaliile comenzii...</div>
  if (!order) return <div className="p-20 text-center uppercase tracking-widest text-xs font-bold">Comanda nu a fost găsită.</div>

  return (
    <main className="max-w-4xl mx-auto px-6 py-16 font-sans">
      <Link href="/account" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-zinc-400 hover:text-black transition-colors mb-12 font-bold">
        <ArrowLeft size={14} /> Înapoi la cont
      </Link>

      <div className="border-b border-zinc-100 pb-12 mb-12">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-2">Rezumat Comandă</p>
        <h1 className="font-playfair text-4xl md:text-5xl font-bold text-zinc-900 mb-6">
          #{order.orderNumber}
        </h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold mb-1">Data</p>
            <p className="text-sm font-bold text-zinc-800">{new Date(order.orderDate).toLocaleDateString('ro-RO')}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold mb-1">Status</p>
            <span className="text-[10px] font-black uppercase px-2 py-1 bg-emerald-50 text-emerald-600 rounded-sm">
              {order.status}
            </span>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold mb-1">Metodă Plată</p>
            <p className="text-sm font-bold text-zinc-800">Card Online</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold mb-1">Total</p>
            <p className="text-sm font-black text-zinc-900">{order.totalAmount} RON</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-900 mb-6">Produse achiziționate</h3>
        <div className="divide-y divide-zinc-100">
          {order.items?.map((item: any, idx: number) => (
            <div key={idx} className="py-6 flex justify-between items-center group">
              <div className="space-y-1">
                <Link href={`/product/${item.book?.slug}`} className="font-playfair text-xl font-bold hover:italic transition-all">
                  {item.book?.title}
                </Link>
                <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                  <span>Format: {item.format}</span>
                  <span>Cantitate: {item.quantity}</span>
                </div>
              </div>
              <p className="font-bold text-zinc-900">{item.priceAtPurchase} RON</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 p-8 bg-zinc-50 border border-zinc-100 space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500 italic">Subtotal</span>
          <span className="font-bold text-zinc-900">{order.totalAmount} RON</span>
        </div>
        <div className="flex justify-between text-sm border-t border-zinc-200 pt-4">
          <span className="font-black uppercase tracking-widest text-[11px]">Total de Plată</span>
          <span className="font-black text-lg text-zinc-900">{order.totalAmount} RON</span>
        </div>
      </div>
    </main>
  )
}
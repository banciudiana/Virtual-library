'use client'

import { useEffect, useState } from 'react';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/lib/image';
import Image from 'next/image';
import Link from 'next/link';
import { Package, Heart, LogOut, ChevronRight } from 'lucide-react';

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const email = localStorage.getItem('userEmail');
      if (!email) {
        window.location.href = '/login';
        return;
      }

      try {
        // QUERY REPARAT: Luăm datele userului și comenzile separat pentru siguranță maximă
        const result = await client.fetch(`{
          "profile": *[_type == "user" && email == $email][0]{
            name,
            email,
            image,
            "favorites": favorites[]->{
              _id, title, price, image, "slug": slug.current
            }
          },
          "userOrders": *[_type == "order" && email == $email] | order(orderDate desc){
            _id,
            orderNumber,
            orderDate,
            totalAmount,
            status,
            items[]{
              quantity,
              format,
              "bookTitle": book->title
            }
          }
        }`, { email },{ useCdn: false });

        setUser(result.profile);
        setOrders(result.userOrders);
      } catch (error) {
        console.error("Eroare la preluarea datelor:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) return <div className="p-20 text-center font-playfair italic text-zinc-500">Se încarcă profilul tău...</div>;

  return (
    <main className="max-w-7xl mx-auto px-6 py-16 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-8 lg:border-r lg:border-zinc-100 lg:pr-12">
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20 bg-zinc-50 rounded-full overflow-hidden border border-zinc-100 flex-shrink-0">
              {user?.image ? (
                <Image src={urlFor(user.image).url()} alt={user.name} fill className="object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-300 font-bold text-2xl uppercase font-playfair">
                  {user?.name?.charAt(0)}
                </div>
              )}
            </div>
            <div className="overflow-hidden">
              <h1 className="font-playfair text-3xl font-bold truncate">{user?.name || 'Utilizator'}</h1>
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-black mt-1 truncate">{user?.email}</p>
            </div>
          </div>

          <nav className="flex flex-col space-y-2 pt-10">
            <div className="flex items-center justify-between p-4 bg-zinc-900 text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-lg">
              <span className="flex items-center gap-3"><Package size={16} strokeWidth={2.5} /> Contul Meu</span>
            </div>
            <button 
              onClick={() => { localStorage.removeItem('userEmail'); window.location.href = '/'; }}
              className="flex items-center gap-3 p-4 text-zinc-400 hover:text-red-500 text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:bg-red-50/50 group"
            >
              <LogOut size={16} className="group-hover:rotate-12 transition-transform" /> Ieșire Cont
            </button>
          </nav>
        </aside>

        {/* Content principal */}
        <div className="lg:col-span-8 space-y-24">
          
          {/* FAVORITE */}
          <section>
            <div className="flex items-baseline gap-4 mb-10 border-b border-zinc-50 pb-4">
              <h2 className="font-playfair text-3xl font-bold italic tracking-tighter">Favorite</h2>
              <span className="text-[10px] uppercase font-black tracking-widest text-zinc-300">{user?.favorites?.length || 0} titluri</span>
            </div>
            
            {user?.favorites?.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                {user.favorites.map((book: any) => (
                  <Link key={book._id} href={`/product/${book.slug}`} className="group">
                    <div className="relative aspect-[3/4] bg-zinc-50 mb-4 overflow-hidden border border-zinc-100 shadow-sm transition-shadow group-hover:shadow-md">
                      <Image src={urlFor(book.image).url()} alt={book.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                    </div>
                    <h3 className="font-playfair text-base font-bold text-zinc-900 line-clamp-1 group-hover:text-zinc-600 transition-colors">{book.title}</h3>
                    <p className="text-zinc-400 text-[11px] font-black uppercase tracking-widest mt-1">{book.price} RON</p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-12 px-8 border-2 border-dashed border-zinc-50 text-center">
                <p className="text-zinc-400 text-sm italic font-serif">Nu ai adăugat încă nicio carte la lista de dorințe.</p>
              </div>
            )}
          </section>

          {/* ISTORIC COMENZI */}
          <section>
            <div className="flex items-baseline gap-4 mb-10 border-b border-zinc-50 pb-4">
              <h2 className="font-playfair text-3xl font-bold italic tracking-tighter">Comenzi</h2>
              <span className="text-[10px] uppercase font-black tracking-widest text-zinc-300">{orders.length} înregistrate</span>
            </div>

            <div className="space-y-6">
              {orders.length > 0 ? (
                orders.map((order: any) => (
                  <Link 
                    key={order._id} 
                    href={`/account/orders/${order._id}`} 
                    className="group block"
                  >
                    <div className="border border-zinc-100 p-8 flex flex-col md:flex-row justify-between items-center gap-8 hover:border-zinc-900 transition-all duration-500 bg-white hover:shadow-xl hover:-translate-y-1">
                      <div className="space-y-1 text-center md:text-left">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300 group-hover:text-zinc-900 transition-colors">
                          #{order.orderNumber}
                        </p>
                        <p className="text-sm font-bold text-zinc-900 font-playfair italic">
                          {new Date(order.orderDate).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full ${
                          order.status === 'Plătit' ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-50 text-zinc-500'
                        }`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="text-xs text-zinc-400 font-black uppercase tracking-widest mb-1">Suma Totală</p>
                          <p className="text-xl font-black text-zinc-900 tracking-tighter italic">{order.totalAmount} <span className="text-xs font-normal">RON</span></p>
                        </div>
                        <ChevronRight size={18} className="text-zinc-200 group-hover:text-black group-hover:translate-x-2 transition-all duration-300" />
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="py-20 bg-zinc-50/50 text-center">
                   <p className="text-zinc-400 text-sm italic font-serif">Nu am găsit nicio comandă asociată acestui cont.</p>
                   <Link href="/" className="inline-block mt-6 text-[10px] font-black uppercase tracking-widest border-b-2 border-black pb-1 hover:text-zinc-500 hover:border-zinc-300 transition-all">Începe Cumpărăturile</Link>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
'use client'

import { useEffect, useState } from 'react';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/lib/image';
import Image from 'next/image';
import Link from 'next/link';
import { Package, Heart, LogOut, ChevronRight } from 'lucide-react';

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const email = localStorage.getItem('userEmail');
      if (!email) {
        window.location.href = '/login';
        return;
      }

      // AM ADĂUGAT _id în query-ul pentru orders
      const data = await client.fetch(`
        *[_type == "user" && email == $email][0]{
          name,
          email,
          image,
          "favorites": favorites[]->{
            _id, title, price, image, "slug": slug.current
          },
          "orders": orders[]->{
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
        }
      `, { email });

      setUser(data);
      setLoading(false);
    };

    fetchUserData();
  }, []);

  if (loading) return <div className="p-20 text-center font-serif italic">Se încarcă profilul...</div>;

  return (
    <main className="max-w-7xl mx-auto px-6 py-16 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-8 border-r border-zinc-100 pr-12">
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
              {user?.image ? (
                <Image src={urlFor(user.image).url()} alt={user.name} fill className="object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-400 font-bold text-2xl uppercase">
                  {user?.name?.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h1 className="font-playfair text-3xl font-bold">{user?.name}</h1>
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mt-1">{user?.email}</p>
            </div>
          </div>

          <nav className="flex flex-col space-y-1 pt-10">
            <button className="flex items-center justify-between p-4 bg-zinc-900 text-white text-[11px] font-bold uppercase tracking-widest transition-all">
              <span className="flex items-center gap-3"><Package size={16} /> Panou Control</span>
            </button>
            <button 
              onClick={() => { localStorage.removeItem('userEmail'); window.location.href = '/'; }}
              className="flex items-center gap-3 p-4 text-red-400 text-[11px] font-bold uppercase tracking-widest hover:bg-red-50 transition-all"
            >
              <LogOut size={16} /> Ieșire Cont
            </button>
          </nav>
        </aside>

        {/* Content principal */}
        <div className="lg:col-span-8 space-y-20">
          
          {/* FAVORITE */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Heart size={20} className="text-zinc-900" />
              <h2 className="font-playfair text-2xl font-bold">Cărți Favorite</h2>
            </div>
            
            {user?.favorites?.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {user.favorites.map((book: any) => (
                  <Link key={book._id} href={`/product/${book.slug}`} className="group">
                    <div className="relative aspect-[2/3] bg-zinc-100 mb-3 overflow-hidden border border-zinc-100">
                      <Image src={urlFor(book.image).url()} alt={book.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <h3 className="font-bold text-[11px] uppercase tracking-wider line-clamp-1">{book.title}</h3>
                    <p className="text-zinc-400 text-[10px] font-serif italic">{book.price} RON</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-zinc-400 text-sm italic font-serif">Nu ai adăugat încă nicio carte la favorite.</p>
            )}
          </section>

          {/* ISTORIC COMENZI */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Package size={20} className="text-zinc-900" />
              <h2 className="font-playfair text-2xl font-bold">Istoric Comenzi</h2>
            </div>

            <div className="space-y-4">
              {user?.orders?.length > 0 ? (
                user.orders.map((order: any) => (
                  <Link 
                    key={order._id} 
                    href={`/account/orders/${order._id}`} 
                    className="group block"
                  >
                    <div className="border border-zinc-100 p-6 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-zinc-900 hover:shadow-md transition-all duration-300 bg-white">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-zinc-900 mb-1 transition-colors">
                          Comanda #{order.orderNumber}
                        </p>
                        <p className="text-sm font-bold text-zinc-900">
                          {new Date(order.orderDate).toLocaleDateString('ro-RO')}
                        </p>
                      </div>
                      <div className="text-center md:text-left">
                         <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-1">
                           {order.status}
                         </span>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <p className="text-lg font-black text-zinc-900">{order.totalAmount} RON</p>
                        <ChevronRight size={16} className="text-zinc-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-zinc-400 text-sm italic font-serif">Nu ai nicio comandă plasată încă.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
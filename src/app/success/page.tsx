'use client'

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import { adminClient } from '@/sanity/lib/adminClient';
import Link from 'next/link';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { cart, clearCart } = useCartStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  // FUNCȚIE REPARATĂ: Extrage ID-ul corect indiferent dacă e UUID sau ID simplu
  const getCleanId = (itemId: string) => {
    const formats = ['-paperback', '-hardback', '-ebook', '-audiobook'];
    let cleanId = itemId;
    
    formats.forEach(f => {
      if (cleanId.endsWith(f)) {
        cleanId = cleanId.replace(f, '');
      }
    });
    
    return cleanId;
  };

  useEffect(() => {
    const finalizeTransaction = async () => {
      if (!sessionId || cart.length === 0) {
        setStatus('success');
        return;
      }

      try {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) throw new Error("Utilizator nelogat");

        const user = await adminClient.fetch(
          `*[_type == "user" && email == $email][0]`, 
          { email: userEmail }
        );

        if (!user) throw new Error("Userul nu a fost găsit");

        const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
        const isAllDigital = cart.every(item => 
          item.format?.toLowerCase() === 'ebook' || item.format?.toLowerCase() === 'audiobook'
        );
        const shipping = isAllDigital ? 5 : (subtotal > 150 ? 0 : 20);
        const total = subtotal + shipping;

        // 3. Creăm comanda cu ID-ul curat
        const orderDoc = {
          _type: 'order',
          orderNumber: `ORD-${Math.random().toString(36).toUpperCase().substring(2, 9)}`,
          orderDate: new Date().toISOString(),
          user: { _type: 'reference', _ref: user._id },
          totalAmount: total,
          status: 'Plătit',
          items: cart.map(item => ({
            _key: Math.random().toString(36).substring(2, 9),
           
            quantity: item.quantity,
            priceAtPurchase: item.price,
            format: item.format
          }))
        };

        const createdOrder = await adminClient.create(orderDoc);

        await adminClient
          .patch(user._id)
          .setIfMissing({ orders: [] })
          .insert('after', 'orders[-1]', [{ _type: 'reference', _ref: createdOrder._id }])
          .commit();

        // 5. Scădem stocul folosind ID-ul curat
        for (const item of cart) {
          const isPhysical = item.format === 'paperback' || item.format === 'hardback';
          if (isPhysical) {
            const cleanId = getCleanId(item._id); // FOLOSIM FUNCȚIA NOUĂ
            
            await adminClient
              .patch(cleanId)
              .dec({ stock: item.quantity })
              .commit();
          }
        }

        clearCart();
        setStatus('success');
      } catch (error) {
        console.error("Finalization error:", error);
        setStatus('error');
      }
    };

    finalizeTransaction();
  }, [sessionId, cart, clearCart]);

  // UI-ul rămâne neschimbat (loading, error, success)
  if (status === 'loading') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-zinc-900" size={40} />
        <p className="font-serif italic text-zinc-500">Confirmăm plata și pregătim comanda...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-6">
        <h1 className="font-playfair text-3xl font-bold text-red-600">Ceva nu a mers bine</h1>
        <p className="text-zinc-500 max-w-xs text-center">Plata a fost procesată, dar am întâmpinat o eroare la salvarea comenzii.</p>
        <Link href="/" className="px-8 py-3 bg-zinc-900 text-white text-xs font-bold uppercase tracking-widest">Înapoi la magazin</Link>
      </div>
    );
  }

  return (
    <main className="min-h-[85vh] flex items-center justify-center px-6 bg-white">
      <div className="max-w-2xl w-full text-center space-y-10 py-16 border-y border-zinc-100">
        <div className="flex justify-center text-emerald-500">
            <CheckCircle size={80} strokeWidth={1} />
        </div>
        <div className="space-y-4">
          <h1 className="font-playfair text-5xl font-bold tracking-tight text-zinc-900">Comandă Confirmată</h1>
          <p className="text-zinc-500 font-serif italic text-lg max-w-md mx-auto">Mulțumim! Comanda ta a fost înregistrată, iar stocul a fost actualizat.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 font-sans">
          <Link href="/account" className="flex items-center justify-center border-2 border-zinc-900 py-5 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-50 transition-all">Vezi Istoric Comenzi</Link>
          <Link href="/" className="flex items-center justify-center bg-zinc-900 text-white py-5 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-all">Continuă Cumpărăturile</Link>
        </div>
      </div>
    </main>
  );
}
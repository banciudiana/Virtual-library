'use client'

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import { adminClient } from '@/sanity/lib/adminClient';
import Link from 'next/link';
import { CheckCircle, Loader2 } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { cart, clearCart } = useCartStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  const getCleanId = (itemId: string) => {
    const formats = ['-paperback', '-hardback', '-ebook', '-audiobook'];
    let cleanId = itemId;
    formats.forEach(f => {
      if (cleanId.endsWith(f)) cleanId = cleanId.replace(f, '');
    });
    return cleanId;
  };

  useEffect(() => {
    const finalizeTransaction = async () => {
      // Dacă nu există sesiune sau coșul e gol, considerăm tranzacția deja procesată
      if (!sessionId || cart.length === 0) {
        setStatus('success');
        return;
      }

      try {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) throw new Error("Utilizator nelogat (email lipsă)");

        // 1. Căutăm user-ul în Sanity
        const user = await adminClient.fetch(
          `*[_type == "user" && email == $email][0]`, 
          { email: userEmail }
        );

        // 2. Calcule financiare
        const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
        const isAllDigital = cart.every(item => 
          item.format?.toLowerCase() === 'ebook' || item.format?.toLowerCase() === 'audiobook'
        );
        const shipping = isAllDigital ? 0 : (subtotal > 150 ? 0 : 20);
        const total = subtotal + shipping;

        // 3. CONSTRUCȚIE DOCUMENT COMANDĂ (Aliniat cu noua schemă)
        const orderDoc = {
          _type: 'order',
          orderNumber: Math.random().toString(36).toUpperCase().substring(2, 10),
          orderDate: new Date().toISOString(),
          email: userEmail, // CÂMP CRITIC pentru backup
          // Adăugăm referința de user doar dacă acesta a fost găsit în bază
          user: user ? { _type: 'reference', _ref: user._id } : undefined,
          totalAmount: total,
          status: 'Plătit',
          items: cart.map(item => ({
            _key: Math.random().toString(36).substring(2, 9),
            book: { 
              _type: 'reference', 
              _ref: getCleanId(item._id) 
            },
            quantity: item.quantity,
            priceAtPurchase: item.price,
            format: item.format
          }))
        };

        // 4. Salvare comandă în Sanity
        const createdOrder = await adminClient.create(orderDoc);

        // 5. Dacă avem user, actualizăm și array-ul de comenzi din documentul de User
        if (user) {
          await adminClient
            .patch(user._id)
            .setIfMissing({ orders: [] })
            .insert('after', 'orders[-1]', [{ _type: 'reference', _ref: createdOrder._id }])
            .commit();
        }

        // 6. Actualizare STOC și SALES COUNT (Top Vânzări)
        for (const item of cart) {
          const cleanId = getCleanId(item._id);
          const isPhysical = item.format?.toLowerCase() === 'paperback' || item.format?.toLowerCase() === 'hardback';
          
          let patch = adminClient.patch(cleanId)
            .setIfMissing({ salesCount: 0 })
            .inc({ salesCount: item.quantity });
          
          if (isPhysical) {
            patch = patch.dec({ stock: item.quantity });
          }

          await patch.commit();
        }

        // Finalizare proces
        clearCart();
        setStatus('success');
      } catch (error) {
        console.error("Finalization error:", error);
        setStatus('error');
      }
    };

    finalizeTransaction();
  }, [sessionId, cart, clearCart]);

  if (status === 'loading') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-zinc-900" size={40} />
        <p className="font-serif italic text-zinc-500">Se procesează comanda dumneavoastră...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-6">
        <h1 className="font-playfair text-3xl font-bold text-red-600">Eroare la procesare</h1>
        <p className="text-zinc-500 max-w-xs text-center font-serif italic">
          Plata a fost efectuată, dar am întâmpinat o problemă la înregistrarea datelor. Vă rugăm să contactați suportul.
        </p>
        <Link href="/" className="px-8 py-3 bg-zinc-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors">
          Înapoi la prima pagină
        </Link>
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
          <h1 className="font-playfair text-5xl font-bold tracking-tight text-zinc-900 italic">Mulțumim!</h1>
          <p className="text-zinc-500 font-serif italic text-lg max-w-md mx-auto">
            Comanda dumneavoastră a fost înregistrată cu succes. Detaliile pot fi găsite în secțiunea Contul Meu.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 font-sans">
          <Link href="/account" className="flex items-center justify-center border-2 border-zinc-900 py-5 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-50 transition-all shadow-sm">
            Vezi Istoric Comenzi
          </Link>
          <Link href="/" className="flex items-center justify-center bg-zinc-900 text-white py-5 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-all shadow-lg">
            Continuă Cumpărăturile
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-zinc-900" size={40} />
        <p className="font-serif italic text-zinc-500">Încărcare...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
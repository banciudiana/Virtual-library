import Link from 'next/link';
import { XCircle, RefreshCw } from 'lucide-react';

export default function CancelPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-8 p-12 bg-red-50/50 border border-red-100 shadow-sm">
        <div className="flex justify-center text-red-800">
          <XCircle size={64} strokeWidth={1} />
        </div>
        
        <div className="space-y-4">
          <h1 className="font-playfair text-4xl font-bold text-zinc-900">Plată Anulată</h1>
          <p className="text-zinc-600 font-serif italic text-sm">
            Tranzacția nu a fost finalizată. Nu-ți face griji, nicio sumă nu a fost retrasă și produsele au rămas în coș.
          </p>
        </div>

        <div className="pt-8 space-y-4">
          <Link 
            href="/cart" 
            className="flex items-center justify-center gap-3 w-full bg-zinc-900 text-white py-5 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-black transition-all"
          >
            <RefreshCw size={14} /> Reîncearcă Plata
          </Link>
        </div>
      </div>
    </main>
  );
}
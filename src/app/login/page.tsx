'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminClient } from '@/sanity/lib/adminClient'; // Folosim clientul cu drept de scriere
import { Mail, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Email, 2: Nume (dacă e cont nou)
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Verificăm dacă utilizatorul există deja
      const existingUser = await adminClient.fetch(
        `*[_type == "user" && email == $email][0]`,
        { email }
      );

      if (existingUser) {
        // Logăm utilizatorul existent
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', existingUser.name);
        router.push('/account');
        router.refresh(); // Refresh la Navbar
      } else {
        // Dacă nu există, mergem la pasul 2 pentru nume
        setStep(2);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("A intervenit o eroare. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Creăm user-ul în Sanity
      const newUser = {
        _type: 'user',
        name: name,
        email: email,
        role: 'customer',
        favorites: [],
        orders: []
      };

      await adminClient.create(newUser);

      localStorage.setItem('userEmail', email);
      localStorage.setItem('userName', name);
      router.push('/account');
      router.refresh();
    } catch (error) {
      console.error("Create account error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-6 bg-white">
      <div className="max-w-md w-full space-y-12 py-12 border-y border-zinc-100">
        
        <div className="text-center space-y-4">
          <h1 className="font-playfair text-4xl font-bold tracking-tight text-zinc-900">
            {step === 1 ? 'Bine ai venit' : 'Creează Cont'}
          </h1>
          <p className="text-zinc-500 font-serif italic text-sm">
            {step === 1 
              ? 'Introdu adresa de email pentru a accesa biblioteca ta personală.' 
              : 'Se pare că ești nou aici. Cum te numești?'}
          </p>
        </div>

        <form onSubmit={step === 1 ? handleLogin : handleCreateAccount} className="space-y-6">
          <div className="space-y-4">
            {step === 1 ? (
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-zinc-900 transition-colors" size={18} />
                <input
                  type="email"
                  required
                  placeholder="email@exemplu.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 focus:border-zinc-900 focus:bg-white outline-none transition-all font-sans text-sm"
                />
              </div>
            ) : (
              <input
                type="text"
                required
                placeholder="Numele tău complet"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-4 bg-zinc-50 border border-zinc-100 focus:border-zinc-900 focus:bg-white outline-none transition-all font-sans text-sm"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-900 text-white py-5 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-black transition-all flex items-center justify-center gap-3 disabled:bg-zinc-400"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <>
                {step === 1 ? 'Continuă' : 'Finalizează Înregistrarea'}
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {step === 2 && (
          <button 
            onClick={() => setStep(1)}
            className="w-full text-[10px] uppercase tracking-widest text-zinc-500 font-bold hover:text-zinc-900 transition-colors"
          >
            Folosește alt email
          </button>
        )}
      </div>
    </main>
  );
}
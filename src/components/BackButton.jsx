'use client'; // OBLIGATORIU: Spune Next.js că acest fișier rulează în browser

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
  const router = useRouter(); // Aici avem voie să folosim hook-ul

  return (
    <button 
      onClick={() => router.back()} 
      className="flex items-center gap-2 text-zinc-500 uppercase tracking-[0.3em] text-[10px] font-bold hover:text-zinc-900 transition-all mb-8 group"
    >
      <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
      Înapoi
    </button>
  );
}
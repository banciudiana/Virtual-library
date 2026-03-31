'use client'

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, SlidersHorizontal, ChevronDown, Check } from 'lucide-react';

export default function FilterControls({ 
  min, max, currentSort, authors, selectedAuthor, selectedFormat 
}: any) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isOpen, setIsOpen] = useState(false);
  
  // Stări locale pentru selecție multiplă și format
  const [tempAuthors, setTempAuthors] = useState<string[]>(
    selectedAuthor ? selectedAuthor.split(',') : []
  );
  const [tempFormat, setTempFormat] = useState(selectedFormat || "");

  // Sincronizăm starea când se schimbă URL-ul (ex: la reset sau navigare)
  useEffect(() => {
    setTempAuthors(selectedAuthor ? selectedAuthor.split(',') : []);
    setTempFormat(selectedFormat || "");
  }, [selectedAuthor, selectedFormat]);

  const toggleAuthor = (id: string) => {
    setTempAuthors(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const applyFilters = (newSort?: string, newMin?: number, newMax?: number) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // 1. Gestionare Preț
    if (newMin !== undefined) params.set('min', newMin.toString());
    if (newMax !== undefined) params.set('max', newMax.toString());
    // Dacă nu trimitem prețuri noi, dar ele există deja în URL, URLSearchParams le păstrează automat

    // 2. Gestionare Autori (Multi-select)
    if (tempAuthors.length > 0) {
      params.set('author', tempAuthors.join(','));
    } else {
      params.delete('author');
    }

    // 3. Gestionare Format
    if (tempFormat) {
      params.set('format', tempFormat);
    } else {
      params.delete('format');
    }

    // 4. Gestionare Sortare
    if (newSort !== undefined) {
      params.set('sort', newSort);
    } else if (currentSort) {
      params.set('sort', currentSort);
    }
    
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const formats = [
    { label: 'Paperback', val: 'paperback' },
    { label: 'Hardback', val: 'hardback' },
    { label: 'Ebook', val: 'ebook' },
    { label: 'Audiobook', val: 'audiobook' },
  ];

  const sortOptions = [
    { label: 'Noutăți', val: '' },
    { label: 'Preț: Mic la Mare', val: 'price-asc' },
    { label: 'Preț: Mare la Mic', val: 'price-desc' },
    { label: 'Alfabetic: A - Z', val: 'title-asc' },
    { label: 'Alfabetic: Z - A', val: 'title-desc' },
  ];

  const priceIntervals = [
    { label: 'Sub 50 RON', min: 0, max: 50 },
    { label: '50 - 100 RON', min: 50, max: 100 },
    { label: '100 - 200 RON', min: 100, max: 200 },
    { label: 'Peste 200 RON', min: 200, max: 2000 },
  ];

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-12 py-6 border-y border-zinc-100">
      
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] px-8 py-4 border border-zinc-900 hover:bg-zinc-900 hover:text-white transition-all shadow-sm"
      >
        <SlidersHorizontal size={14} /> Filtrează Colecția
      </button>

      <div className="relative group">
        <button className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] py-4 px-2">
          Sortează: {sortOptions.find(o => o.val === currentSort)?.label || 'Noutăți'}
          <ChevronDown size={14} className="group-hover:rotate-180 transition-transform" />
        </button>
        
        <div className="absolute top-full right-0 w-48 bg-white border border-zinc-100 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
          {sortOptions.map((opt) => (
            <button
              key={opt.val}
              onClick={() => applyFilters(opt.val)}
              className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-50 transition-colors border-b border-zinc-50 last:border-0"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-12 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-500">
            <div className="flex justify-between items-center mb-16 text-left">
              <h2 className="font-playfair text-4xl font-bold italic text-zinc-900 tracking-tighter leading-none">Filtre</h2>
              <button onClick={() => setIsOpen(false)}><X size={28} /></button>
            </div>

            <div className="space-y-12 text-left">
              {/* INTERVALE PREȚ */}
              <div className="space-y-6">
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-900 border-b border-zinc-100 pb-2">Interval Preț</h3>
                <div className="flex flex-col gap-3">
                  {priceIntervals.map((interval) => {
                    const isActive = Number(min) === interval.min && Number(max) === interval.max;
                    return (
                      <button
                        key={interval.label}
                        onClick={() => applyFilters(undefined, interval.min, interval.max)}
                        className={`flex justify-between items-center py-2 text-xs transition-colors ${isActive ? 'text-zinc-900 font-bold' : 'text-zinc-500 hover:text-zinc-900'}`}
                      >
                        {interval.label}
                        {isActive && <div className="w-1.5 h-1.5 bg-zinc-900 rounded-full" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* FORMAT */}
              <div className="space-y-6">
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-900 border-b border-zinc-100 pb-2">Format</h3>
                <div className="flex flex-wrap gap-2">
                  {formats.map(f => (
                    <button 
                      key={f.val} 
                      onClick={() => setTempFormat(tempFormat === f.val ? "" : f.val)} 
                      className={`px-4 py-2 text-[10px] font-bold uppercase border transition-all ${tempFormat === f.val ? 'bg-zinc-900 text-white border-zinc-900' : 'border-zinc-200 text-zinc-400 hover:border-zinc-900'}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* AUTORI (MULTI-SELECT) */}
              <div className="space-y-6">
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-900 border-b border-zinc-100 pb-2">Autori</h3>
                <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {authors?.map((auth: any) => {
                    const isSelected = tempAuthors.includes(auth._id);
                    return (
                      <div 
                        key={auth._id} 
                        onClick={() => toggleAuthor(auth._id)}
                        className="flex items-center justify-between cursor-pointer group py-1"
                      >
                        <span className={`text-xs transition-colors ${isSelected ? 'text-zinc-900 font-bold' : 'text-zinc-500 group-hover:text-zinc-900'}`}>
                          {auth.name}
                        </span>
                        <div className={`w-4 h-4 border flex items-center justify-center transition-all ${isSelected ? 'bg-zinc-900 border-zinc-900' : 'border-zinc-200'}`}>
                          {isSelected && <Check size={10} className="text-white" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* BUTOANE ACȚIUNE */}
            <div className="mt-auto pt-10 flex flex-col gap-4">
              <button 
                onClick={() => { applyFilters(); setIsOpen(false); }} 
                className="w-full bg-zinc-900 text-white py-6 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-black transition-all shadow-lg"
              >
                Aplică Filtrele
              </button>
              <button 
                onClick={() => { router.push('?'); setIsOpen(false); }} 
                className="w-full text-zinc-400 text-[9px] font-bold uppercase tracking-[0.2em] hover:text-red-500 transition-colors"
              >
                Șterge toate filtrele
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
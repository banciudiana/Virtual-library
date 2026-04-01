'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, SlidersHorizontal, ChevronDown, Check } from 'lucide-react';

export default function FilterControls({ 
  min, max, currentSort, authors, selectedAuthor, selectedFormat 
}: any) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State pentru Drawer-ul de filtre lateral
  const [isOpen, setIsOpen] = useState(false);
  // State pentru Dropdown-ul de sortare (Reparat pentru Mobil)
  const [isSortOpen, setIsSortOpen] = useState(false);
  
  const sortRef = useRef<HTMLDivElement>(null);

  // Stări locale pentru selecție
  const [tempAuthors, setTempAuthors] = useState<string[]>(
    selectedAuthor ? selectedAuthor.split(',') : []
  );
  const [tempFormat, setTempFormat] = useState(selectedFormat || "");

  // Închide dropdown-ul de sortare dacă dai click în exteriorul lui
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sincronizăm starea locală când se schimbă URL-ul
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
    
    if (newMin !== undefined) params.set('min', newMin.toString());
    if (newMax !== undefined) params.set('max', newMax.toString());

    if (tempAuthors.length > 0) {
      params.set('author', tempAuthors.join(','));
    } else {
      params.delete('author');
    }

    if (tempFormat) {
      params.set('format', tempFormat);
    } else {
      params.delete('format');
    }

    if (newSort !== undefined) {
      params.set('sort', newSort);
    } else if (currentSort) {
      params.set('sort', currentSort);
    }
    
    router.push(`?${params.toString()}`, { scroll: false });
    setIsSortOpen(false); // Închidem meniul după ce selectăm o opțiune
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
    <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-12 py-6 border-y border-zinc-100 relative">
      
      {/* BUTON FILTRE */}
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] px-8 py-4 border border-zinc-900 hover:bg-zinc-900 hover:text-white transition-all shadow-sm"
      >
        <SlidersHorizontal size={14} /> Filtrează Colecția
      </button>

      {/* DROPDOWN SORTARE (FĂRĂ HOVER - DOAR CLICK) */}
      <div className="relative" ref={sortRef}>
        <button 
          onClick={() => setIsSortOpen(!isSortOpen)}
          className="flex items-center justify-between md:justify-start w-full md:w-auto gap-4 text-[10px] font-black uppercase tracking-[0.2em] py-4 px-2 border md:border-none border-zinc-100"
        >
          <span>Sortează: {sortOptions.find(o => o.val === currentSort)?.label || 'Noutăți'}</span>
          <ChevronDown size={14} className={`transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isSortOpen && (
          <div className="absolute top-full right-0 w-full md:w-56 bg-white border border-zinc-100 shadow-2xl z-[60] animate-in fade-in slide-in-from-top-2 duration-200 mt-1">
            {sortOptions.map((opt) => (
              <button
                key={opt.val}
                onClick={() => applyFilters(opt.val)}
                className={`w-full text-left px-5 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-50 transition-colors border-b border-zinc-50 last:border-0 ${currentSort === opt.val ? 'text-zinc-900 bg-zinc-50' : 'text-zinc-400'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* DRAWER FILTRE LATERAL */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsOpen(false)} />
          
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-8 md:p-12 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-500">
            <div className="flex justify-between items-center mb-16">
              <h2 className="font-playfair text-4xl font-bold italic text-zinc-900 tracking-tighter leading-none">Filtre</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-zinc-50 rounded-full transition-colors">
                <X size={28} strokeWidth={1.5} />
              </button>
            </div>

            <div className="space-y-12 text-left">
              {/* PREȚ */}
              <div className="space-y-6">
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-900 border-b border-zinc-100 pb-2 italic text-left">Interval Preț</h3>
                <div className="flex flex-col gap-3">
                  {priceIntervals.map((interval) => {
                    const isActive = Number(min) === interval.min && Number(max) === interval.max;
                    return (
                      <button
                        key={interval.label}
                        onClick={() => applyFilters(undefined, interval.min, interval.max)}
                        className={`flex justify-between items-center py-2 text-xs tracking-tight transition-colors ${isActive ? 'text-zinc-900 font-bold' : 'text-zinc-500 hover:text-zinc-900'}`}
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
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-900 border-b border-zinc-100 pb-2 italic text-left">Format</h3>
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

              {/* AUTORI */}
              <div className="space-y-6">
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-900 border-b border-zinc-100 pb-2 italic text-left">Autori</h3>
                <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-4 custom-scrollbar">
                  {authors?.map((auth: any) => {
                    const isSelected = tempAuthors.includes(auth._id);
                    return (
                      <div 
                        key={auth._id} 
                        onClick={() => toggleAuthor(auth._id)}
                        className="flex items-center justify-between cursor-pointer group py-1.5 border-b border-zinc-50 last:border-0"
                      >
                        <span className={`text-xs transition-colors ${isSelected ? 'text-zinc-900 font-bold' : 'text-zinc-500 group-hover:text-zinc-900'}`}>
                          {auth.name}
                        </span>
                        <div className={`w-4 h-4 border flex items-center justify-center transition-all ${isSelected ? 'bg-zinc-900 border-zinc-900' : 'border-zinc-200 group-hover:border-zinc-900'}`}>
                          {isSelected && <Check size={10} className="text-white" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* BUTOANE FINALE */}
            <div className="mt-auto pt-12 flex flex-col gap-4">
              <button 
                onClick={() => { applyFilters(); setIsOpen(false); }} 
                className="w-full bg-zinc-900 text-white py-6 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-black transition-all shadow-xl active:scale-[0.98]"
              >
                Aplică Selecția
              </button>
              <button 
                onClick={() => { router.push('?'); setIsOpen(false); }} 
                className="w-full text-zinc-400 text-[9px] font-bold uppercase tracking-[0.2em] hover:text-red-500 transition-colors py-2"
              >
                Resetare completă
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
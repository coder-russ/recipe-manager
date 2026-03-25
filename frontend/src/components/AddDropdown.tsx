import { useEffect, useRef, useState } from 'react';

interface AddDropdownProps {
  onImportUrl: () => void;
  onManualCreate: () => void;
}

export default function AddDropdown({ onImportUrl, onManualCreate }: AddDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="bg-terracotta hover:bg-terracotta-dark text-white px-5 py-2.5 rounded-lg font-medium transition-colors duration-150 cursor-pointer flex items-center gap-1.5 min-h-[44px]"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add Recipe
        <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 bg-surface border border-border rounded-xl shadow-lg overflow-hidden w-56 z-50">
          <button
            onClick={() => { onImportUrl(); setOpen(false); }}
            className="w-full text-left px-4 py-3 text-sm text-text-primary hover:bg-warm-gray transition-colors cursor-pointer flex items-center gap-3 min-h-[48px]"
          >
            <svg className="w-5 h-5 text-terracotta shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
            </svg>
            <div>
              <div className="font-medium">Import from URL</div>
              <div className="text-text-secondary text-xs">Paste a recipe link</div>
            </div>
          </button>
          <button
            onClick={() => { onManualCreate(); setOpen(false); }}
            className="w-full text-left px-4 py-3 text-sm text-text-primary hover:bg-warm-gray transition-colors cursor-pointer flex items-center gap-3 border-t border-border min-h-[48px]"
          >
            <svg className="w-5 h-5 text-terracotta shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <div>
              <div className="font-medium">Create manually</div>
              <div className="text-text-secondary text-xs">Type in your recipe</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

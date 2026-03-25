import { useEffect, useRef, useState } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
}

export default function SearchBar({ value, onChange, resultCount }: SearchBarProps) {
  const [local, setLocal] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const handleChange = (v: string) => {
    setLocal(v);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(v), 300);
  };

  const clear = () => {
    setLocal('');
    clearTimeout(timerRef.current);
    onChange('');
  };

  return (
    <div className="relative">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary/50"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={local}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search recipes... ( / )"
          data-search-input
          className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-surface text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta text-sm min-h-[44px]"
        />
        {local && (
          <button
            onClick={clear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary/50 hover:text-text-primary cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      {value && (
        <p className="text-xs text-text-secondary mt-1.5">
          {resultCount} {resultCount === 1 ? 'result' : 'results'} for "{value}"
        </p>
      )}
    </div>
  );
}

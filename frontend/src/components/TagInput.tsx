import { useEffect, useRef, useState } from 'react';
import type { TagCount } from '../types';

interface TagInputProps {
  allTags: TagCount[];
  onAdd: (tag: string) => void;
  placeholder?: string;
}

export default function TagInput({ allTags, onAdd, placeholder = 'Add tag...' }: TagInputProps) {
  const [value, setValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = value.trim()
    ? allTags.filter(
        (t) =>
          t.name.toLowerCase().includes(value.toLowerCase()) &&
          t.name.toLowerCase() !== value.toLowerCase()
      )
    : allTags;

  const submit = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue('');
    setShowSuggestions(false);
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            submit(value);
          }
        }}
        placeholder={placeholder}
        className="w-full px-3 py-1.5 rounded-lg border border-border bg-cream text-text-primary text-sm placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta"
      />
      {showSuggestions && filtered.length > 0 && (
        <div className="absolute z-10 top-full mt-1 w-full bg-surface border border-border rounded-lg shadow-lg max-h-40 overflow-y-auto">
          {filtered.slice(0, 10).map((tag) => (
            <button
              key={tag.name}
              onClick={() => submit(tag.name)}
              className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-warm-gray transition-colors cursor-pointer flex justify-between"
            >
              <span>{tag.name}</span>
              <span className="text-text-secondary/50 text-xs">{tag.count}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

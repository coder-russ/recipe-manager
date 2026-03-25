import { useState } from 'react';
import { parseServings } from '../utils/scaling';

interface ServingsScalerProps {
  servings: string | null;
  onScale: (ratio: number) => void;
}

export default function ServingsScaler({ servings, onScale }: ServingsScalerProps) {
  const originalServings = parseServings(servings);
  const [currentServings, setCurrentServings] = useState(originalServings || 4);

  if (originalServings === null) return null;

  const decrease = () => {
    const next = Math.max(1, currentServings - 1);
    setCurrentServings(next);
    onScale(next / originalServings);
  };

  const increase = () => {
    const next = currentServings + 1;
    setCurrentServings(next);
    onScale(next / originalServings);
  };

  const reset = () => {
    setCurrentServings(originalServings);
    onScale(1);
  };

  const isScaled = currentServings !== originalServings;

  return (
    <div className="inline-flex items-center gap-2 bg-warm-gray rounded-full px-3 py-1.5">
      <span className="text-sm text-text-secondary font-medium">Servings</span>
      <button
        onClick={decrease}
        disabled={currentServings <= 1}
        className="w-8 h-8 rounded-full bg-surface border border-border text-text-primary hover:border-terracotta disabled:opacity-30 transition-colors cursor-pointer flex items-center justify-center text-lg font-bold"
      >
        -
      </button>
      <span className={`text-sm font-bold min-w-[2ch] text-center ${isScaled ? 'text-terracotta' : 'text-text-primary'}`}>
        {currentServings}
      </span>
      <button
        onClick={increase}
        className="w-8 h-8 rounded-full bg-surface border border-border text-text-primary hover:border-terracotta transition-colors cursor-pointer flex items-center justify-center text-lg font-bold"
      >
        +
      </button>
      {isScaled && (
        <button
          onClick={reset}
          className="text-xs text-terracotta hover:text-terracotta-dark font-medium cursor-pointer ml-1"
        >
          Reset
        </button>
      )}
    </div>
  );
}

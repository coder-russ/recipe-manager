import type { TagCount } from '../types';

interface FilterBarProps {
  allTags: TagCount[];
  activeTags: string[];
  onToggleTag: (tag: string) => void;
  maxCookTime: number | null;
  onCookTimeChange: (value: number | null) => void;
  minRating: number | null;
  onRatingChange: (value: number | null) => void;
  hasActiveFilters: boolean;
  onClearAll: () => void;
}

const COOK_TIME_OPTIONS = [
  { label: 'Any time', value: null },
  { label: 'Under 30 min', value: 30 },
  { label: 'Under 1 hour', value: 60 },
  { label: '1-2 hours', value: 120 },
];

export default function FilterBar({
  allTags,
  activeTags,
  onToggleTag,
  maxCookTime,
  onCookTimeChange,
  minRating,
  onRatingChange,
  hasActiveFilters,
  onClearAll,
}: FilterBarProps) {
  return (
    <div className="space-y-3">
      {/* Tag chips */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => {
            const active = activeTags.includes(tag.name);
            return (
              <button
                key={tag.name}
                onClick={() => onToggleTag(tag.name)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 cursor-pointer ${
                  active
                    ? 'bg-sage text-white'
                    : 'bg-sage-light text-sage hover:bg-sage/20'
                }`}
              >
                {tag.name}
                <span className={`text-xs ${active ? 'text-white/70' : 'text-sage/60'}`}>
                  {tag.count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Cook time + Rating row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Cook time */}
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" strokeLinecap="round" />
          </svg>
          <select
            value={maxCookTime ?? ''}
            onChange={(e) => onCookTimeChange(e.target.value ? Number(e.target.value) : null)}
            className="px-2 py-1.5 rounded-lg border border-border bg-surface text-text-primary text-xs focus:outline-none focus:ring-2 focus:ring-terracotta/40 cursor-pointer"
          >
            {COOK_TIME_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.value ?? ''}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Rating filter */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => onRatingChange(minRating === star ? null : star)}
              className="cursor-pointer p-0.5"
              title={`${star}+ stars`}
            >
              <svg
                className={`w-5 h-5 transition-colors ${
                  minRating !== null && star <= minRating
                    ? 'text-terracotta'
                    : 'text-border hover:text-terracotta/50'
                }`}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          ))}
          {minRating && (
            <span className="text-xs text-text-secondary ml-1">{minRating}+</span>
          )}
        </div>

        {/* Clear all */}
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="text-xs text-terracotta hover:text-terracotta-dark font-medium cursor-pointer ml-auto"
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
}

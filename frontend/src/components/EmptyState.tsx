interface EmptyStateProps {
  onAddRecipe: () => void;
}

export default function EmptyState({ onAddRecipe }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4">
      <svg
        className="w-28 h-28 text-border mb-6"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="20" y="15" width="80" height="95" rx="8" stroke="currentColor" strokeWidth="3" />
        <line x1="35" y1="40" x2="85" y2="40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="35" y1="55" x2="75" y2="55" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="35" y1="70" x2="80" y2="70" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="35" y1="85" x2="60" y2="85" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="90" cy="90" r="22" fill="#FFFAF5" stroke="currentColor" strokeWidth="3" />
        <line x1="82" y1="90" x2="98" y2="90" stroke="#C2704E" strokeWidth="3" strokeLinecap="round" />
        <line x1="90" y1="82" x2="90" y2="98" stroke="#C2704E" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <h2 className="font-serif text-2xl font-bold text-text-primary mb-2">
        No recipes yet
      </h2>
      <p className="text-text-secondary mb-8 text-center max-w-md">
        Import your first recipe from any URL. Just paste a link from your
        favorite cooking site and we'll extract all the details.
      </p>
      <button
        onClick={onAddRecipe}
        className="bg-terracotta hover:bg-terracotta-dark text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors duration-150 cursor-pointer"
      >
        + Add Your First Recipe
      </button>
    </div>
  );
}

import type { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
}

export default function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  const maxTags = 3;
  const visibleTags = recipe.tags.slice(0, maxTags);
  const extraTags = recipe.tags.length - maxTags;

  return (
    <button
      onClick={onClick}
      className="bg-surface rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden text-left w-full cursor-pointer group"
    >
      <div className="aspect-[4/3] overflow-hidden bg-warm-gray">
        {recipe.image_path ? (
          <img
            src={recipe.image_path}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-terracotta/20 to-sage/20 flex items-center justify-center">
            <svg className="w-16 h-16 text-border" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 6v12M6 12h12" strokeLinecap="round" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-text-primary text-base leading-snug line-clamp-2 mb-2">
          {recipe.title}
        </h3>
        {recipe.cook_time && (
          <span className="inline-flex items-center gap-1 text-xs text-text-secondary bg-warm-gray rounded-full px-2.5 py-1 mb-2">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" strokeLinecap="round" />
            </svg>
            {recipe.cook_time}
          </span>
        )}
        {visibleTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {visibleTags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-sage-light text-sage rounded-full px-2.5 py-0.5 font-medium"
              >
                {tag}
              </span>
            ))}
            {extraTags > 0 && (
              <span className="text-xs text-text-secondary px-1">
                +{extraTags} more
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}

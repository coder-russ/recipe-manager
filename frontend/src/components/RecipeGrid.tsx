import type { Recipe } from '../types';
import RecipeCard from './RecipeCard';
import SkeletonCard from './SkeletonCard';
import EmptyState from './EmptyState';

interface RecipeGridProps {
  recipes: Recipe[];
  loading: boolean;
  onRecipeClick: (id: number) => void;
  onAddRecipe: () => void;
}

export default function RecipeGrid({ recipes, loading, onRecipeClick, onAddRecipe }: RecipeGridProps) {
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (recipes.length === 0) {
    return <EmptyState onAddRecipe={onAddRecipe} />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onClick={() => onRecipeClick(recipe.id)}
          />
        ))}
      </div>
    </div>
  );
}

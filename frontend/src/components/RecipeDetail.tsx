import { useEffect, useState } from 'react';
import type { Recipe } from '../types';
import SkeletonDetail from './SkeletonDetail';

interface RecipeDetailProps {
  recipe: Recipe | null;
  loading: boolean;
  onBack: () => void;
}

export default function RecipeDetail({ recipe, loading, onBack }: RecipeDetailProps) {
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [highlightedStep, setHighlightedStep] = useState<number | null>(null);

  useEffect(() => {
    setCheckedIngredients(new Set());
    setHighlightedStep(null);
  }, [recipe?.id]);

  if (loading) return <SkeletonDetail />;
  if (!recipe) return null;

  const toggleIngredient = (idx: number) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const toggleStep = (idx: number) => {
    setHighlightedStep((prev) => (prev === idx ? null : idx));
  };

  const metaBadges = [
    recipe.prep_time && { label: 'Prep', value: recipe.prep_time },
    recipe.cook_time && { label: 'Cook', value: recipe.cook_time },
    recipe.total_time && { label: 'Total', value: recipe.total_time },
    recipe.servings && { label: 'Servings', value: recipe.servings },
  ].filter(Boolean) as { label: string; value: string }[];

  const stars = recipe.rating
    ? Array.from({ length: 5 }, (_, i) => i < recipe.rating!)
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 pb-16">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-text-secondary hover:text-terracotta transition-colors mb-6 cursor-pointer font-medium"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back to recipes
      </button>

      {/* Hero image */}
      {recipe.image_path && (
        <div className="relative rounded-xl overflow-hidden mb-6 max-h-[400px]">
          <img
            src={recipe.image_path}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <h1 className="absolute bottom-4 left-4 right-4 font-serif text-2xl md:text-4xl font-bold text-white drop-shadow-lg">
            {recipe.title}
          </h1>
        </div>
      )}

      {!recipe.image_path && (
        <h1 className="font-serif text-2xl md:text-4xl font-bold text-text-primary mb-4">
          {recipe.title}
        </h1>
      )}

      {/* Meta badges */}
      {metaBadges.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {metaBadges.map(({ label, value }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 bg-warm-gray text-text-secondary rounded-full px-3 py-1.5 text-sm font-medium"
            >
              <span className="text-terracotta font-semibold">{label}</span>
              {value}
            </span>
          ))}
        </div>
      )}

      {/* Rating */}
      {stars && (
        <div className="flex gap-1 mb-4">
          {stars.map((filled, i) => (
            <svg
              key={i}
              className={`w-5 h-5 ${filled ? 'text-terracotta' : 'text-border'}`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>
      )}

      {/* Tags */}
      {recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {recipe.tags.map((tag) => (
            <span
              key={tag}
              className="bg-sage-light text-sage rounded-full px-3 py-1 text-sm font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Source link */}
      {recipe.source_url && (
        <a
          href={recipe.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-terracotta hover:text-terracotta-dark text-sm font-medium mb-8 transition-colors"
        >
          View original recipe
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
          </svg>
        </a>
      )}

      {/* Ingredients */}
      <section className="mb-10">
        <h2 className="font-serif text-xl font-bold text-text-primary mb-4 border-b border-border pb-2">
          Ingredients
        </h2>
        <ul className="space-y-2">
          {recipe.ingredients.map((ingredient, idx) => (
            <li key={idx}>
              <label className="flex items-start gap-3 cursor-pointer group py-1">
                <input
                  type="checkbox"
                  checked={checkedIngredients.has(idx)}
                  onChange={() => toggleIngredient(idx)}
                  className="mt-1 w-5 h-5 rounded border-border text-terracotta focus:ring-terracotta shrink-0 accent-terracotta"
                />
                <span
                  className={`text-lg leading-relaxed transition-all duration-150 ${
                    checkedIngredients.has(idx)
                      ? 'line-through text-text-secondary/50'
                      : 'text-text-primary'
                  }`}
                >
                  {ingredient}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      {/* Steps */}
      <section className="mb-10">
        <h2 className="font-serif text-xl font-bold text-text-primary mb-4 border-b border-border pb-2">
          Instructions
        </h2>
        <ol className="space-y-3">
          {recipe.steps.map((step, idx) => (
            <li
              key={idx}
              onClick={() => toggleStep(idx)}
              className={`flex gap-4 p-4 rounded-lg cursor-pointer transition-colors duration-150 ${
                highlightedStep === idx
                  ? 'bg-terracotta/10 border border-terracotta/20'
                  : 'hover:bg-warm-gray border border-transparent'
              }`}
            >
              <span className="font-serif text-2xl font-bold text-terracotta shrink-0 w-8 text-center">
                {idx + 1}
              </span>
              <p className="text-lg leading-relaxed text-text-primary pt-1">
                {step}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Notes */}
      {recipe.notes && (
        <section className="mb-10">
          <h2 className="font-serif text-xl font-bold text-text-primary mb-4 border-b border-border pb-2">
            Notes
          </h2>
          <div className="bg-warm-gray rounded-lg p-4 text-text-secondary leading-relaxed">
            {recipe.notes}
          </div>
        </section>
      )}
    </div>
  );
}

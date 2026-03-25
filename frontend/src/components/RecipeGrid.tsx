import { useMemo, useState } from 'react';
import type { Filters, Recipe, TagCount } from '../types';
import RecipeCard from './RecipeCard';
import SkeletonCard from './SkeletonCard';
import EmptyState from './EmptyState';
import SearchBar from './SearchBar';
import FilterBar from './FilterBar';
import SortDropdown from './SortDropdown';
import BulkActionBar from './BulkActionBar';

interface RecipeGridProps {
  recipes: Recipe[];
  loading: boolean;
  allTags: TagCount[];
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onRecipeClick: (id: number) => void;
  onAddRecipe: () => void;
  onBulkAddTag: (ids: number[], tag: string) => void;
  onBulkRemoveTag: (ids: number[], tag: string) => void;
}

export default function RecipeGrid({
  recipes,
  loading,
  allTags,
  filters,
  onFiltersChange,
  onRecipeClick,
  onAddRecipe,
  onBulkAddTag,
  onBulkRemoveTag,
}: RecipeGridProps) {
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const hasActiveFilters =
    filters.search !== '' ||
    filters.tags.length > 0 ||
    filters.minRating !== null ||
    filters.maxCookTime !== null;

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const selectedRecipeTags = useMemo(() => {
    if (selectedIds.size === 0) return [];
    const selected = recipes.filter((r) => selectedIds.has(r.id));
    if (selected.length === 0) return [];
    const tagSets = selected.map((r) => new Set(r.tags));
    const common = [...tagSets[0]].filter((tag) => tagSets.every((s) => s.has(tag)));
    return common;
  }, [selectedIds, recipes]);

  const isEmptyCollection = !loading && recipes.length === 0 && !hasActiveFilters;

  if (isEmptyCollection) {
    return <EmptyState onAddRecipe={onAddRecipe} />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
      {/* Search + Sort row */}
      <div className="flex gap-3 items-start mb-4">
        <div className="flex-1">
          <SearchBar
            value={filters.search}
            onChange={(search) => onFiltersChange({ ...filters, search })}
            resultCount={recipes.length}
          />
        </div>
        <SortDropdown
          value={filters.sort}
          onChange={(sort) => onFiltersChange({ ...filters, sort })}
        />
        <button
          onClick={() => selectMode ? exitSelectMode() : setSelectMode(true)}
          className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors cursor-pointer shrink-0 ${
            selectMode
              ? 'border-terracotta bg-terracotta/10 text-terracotta'
              : 'border-border text-text-secondary hover:bg-warm-gray'
          }`}
        >
          {selectMode ? 'Exit Select' : 'Select'}
        </button>
      </div>

      {/* Filter bar */}
      <div className="mb-6">
        <FilterBar
          allTags={allTags}
          activeTags={filters.tags}
          onToggleTag={(tag) => {
            const next = filters.tags.includes(tag)
              ? filters.tags.filter((t) => t !== tag)
              : [...filters.tags, tag];
            onFiltersChange({ ...filters, tags: next });
          }}
          maxCookTime={filters.maxCookTime}
          onCookTimeChange={(maxCookTime) => onFiltersChange({ ...filters, maxCookTime })}
          minRating={filters.minRating}
          onRatingChange={(minRating) => onFiltersChange({ ...filters, minRating })}
          hasActiveFilters={hasActiveFilters}
          onClearAll={() =>
            onFiltersChange({ search: '', tags: [], minRating: null, maxCookTime: null, sort: filters.sort })
          }
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-text-secondary text-lg">No recipes match your filters</p>
          <button
            onClick={() =>
              onFiltersChange({ search: '', tags: [], minRating: null, maxCookTime: null, sort: 'created_at' })
            }
            className="mt-3 text-terracotta hover:text-terracotta-dark font-medium cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={() => onRecipeClick(recipe.id)}
              selectMode={selectMode}
              selected={selectedIds.has(recipe.id)}
              onToggleSelect={() => toggleSelect(recipe.id)}
            />
          ))}
        </div>
      )}

      {/* Bulk action bar */}
      {selectMode && (
        <BulkActionBar
          selectedCount={selectedIds.size}
          allTags={allTags}
          selectedRecipeTags={selectedRecipeTags}
          onAddTag={(tag) => {
            onBulkAddTag([...selectedIds], tag);
            exitSelectMode();
          }}
          onRemoveTag={(tag) => {
            onBulkRemoveTag([...selectedIds], tag);
            exitSelectMode();
          }}
          onCancel={exitSelectMode}
        />
      )}
    </div>
  );
}

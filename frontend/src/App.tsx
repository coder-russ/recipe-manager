import { useCallback, useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import RecipeGrid from './components/RecipeGrid';
import RecipeDetail from './components/RecipeDetail';
import AddRecipeModal from './components/AddRecipeModal';
import { useRecipeDetail, useRecipeList, useTags } from './hooks/useRecipes';
import { bulkUpdateTags, updateRecipe } from './api';
import type { Filters, View } from './types';

const DEFAULT_FILTERS: Filters = {
  search: '',
  tags: [],
  minRating: null,
  maxCookTime: null,
  sort: 'created_at',
};

export default function App() {
  const [view, setView] = useState<View>({ type: 'grid' });
  const [modalOpen, setModalOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const { recipes, loading: listLoading, reload } = useRecipeList(filters);
  const { tags: allTags, reloadTags } = useTags();

  const detailId = view.type === 'detail' ? view.recipeId : null;
  const { recipe, loading: detailLoading, reload: reloadDetail } = useRecipeDetail(detailId);

  const reloadAll = useCallback(() => {
    reload();
    reloadTags();
  }, [reload, reloadTags]);

  const navigate = useCallback((v: View) => {
    setView(v);
    if (v.type === 'grid') {
      window.history.pushState(null, '', '/');
    } else {
      window.history.pushState(null, '', `/recipe/${v.recipeId}`);
    }
  }, []);

  const handleBack = useCallback(() => {
    navigate({ type: 'grid' });
  }, [navigate]);

  // Tag click from detail view: go back to grid with tag filter
  const handleTagClick = useCallback(
    (tag: string) => {
      setFilters({ ...DEFAULT_FILTERS, tags: [tag] });
      navigate({ type: 'grid' });
    },
    [navigate]
  );

  // Add tag on detail view
  const handleAddTagOnDetail = useCallback(
    async (recipeId: number, tag: string) => {
      if (!recipe) return;
      const newTags = [...recipe.tags, tag];
      await updateRecipe(recipeId, { tags: newTags });
      reloadDetail();
      reloadTags();
    },
    [recipe, reloadDetail, reloadTags]
  );

  // Remove tag on detail view
  const handleRemoveTagOnDetail = useCallback(
    async (recipeId: number, tag: string) => {
      if (!recipe) return;
      const newTags = recipe.tags.filter((t) => t !== tag);
      await updateRecipe(recipeId, { tags: newTags });
      reloadDetail();
      reloadTags();
    },
    [recipe, reloadDetail, reloadTags]
  );

  // Bulk add tag
  const handleBulkAddTag = useCallback(
    async (ids: number[], tag: string) => {
      await bulkUpdateTags(ids, [tag], []);
      reloadAll();
    },
    [reloadAll]
  );

  // Bulk remove tag
  const handleBulkRemoveTag = useCallback(
    async (ids: number[], tag: string) => {
      await bulkUpdateTags(ids, [], [tag]);
      reloadAll();
    },
    [reloadAll]
  );

  // Handle browser back/forward
  useEffect(() => {
    const onPopState = () => {
      const path = window.location.pathname;
      const match = path.match(/^\/recipe\/(\d+)$/);
      if (match) {
        setView({ type: 'detail', recipeId: parseInt(match[1], 10) });
      } else {
        setView({ type: 'grid' });
      }
    };

    window.addEventListener('popstate', onPopState);

    // Handle initial URL
    const path = window.location.pathname;
    const match = path.match(/^\/recipe\/(\d+)$/);
    if (match) {
      setView({ type: 'detail', recipeId: parseInt(match[1], 10) });
    }

    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar
        onAddRecipe={() => setModalOpen(true)}
        onLogoClick={handleBack}
      />

      {view.type === 'grid' && (
        <RecipeGrid
          recipes={recipes}
          loading={listLoading}
          allTags={allTags}
          filters={filters}
          onFiltersChange={setFilters}
          onRecipeClick={(id) => navigate({ type: 'detail', recipeId: id })}
          onAddRecipe={() => setModalOpen(true)}
          onBulkAddTag={handleBulkAddTag}
          onBulkRemoveTag={handleBulkRemoveTag}
        />
      )}

      {view.type === 'detail' && (
        <RecipeDetail
          recipe={recipe}
          loading={detailLoading}
          allTags={allTags}
          onBack={handleBack}
          onTagClick={handleTagClick}
          onAddTag={handleAddTagOnDetail}
          onRemoveTag={handleRemoveTagOnDetail}
        />
      )}

      <AddRecipeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={reloadAll}
      />
    </div>
  );
}

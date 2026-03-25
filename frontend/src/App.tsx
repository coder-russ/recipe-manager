import { useCallback, useEffect, useRef, useState } from 'react';
import Navbar from './components/Navbar';
import RecipeGrid from './components/RecipeGrid';
import RecipeDetail from './components/RecipeDetail';
import AddRecipeModal from './components/AddRecipeModal';
import ManualRecipeModal from './components/ManualRecipeModal';
import EditRecipeModal from './components/EditRecipeModal';
import DeleteConfirmDialog from './components/DeleteConfirmDialog';
import Toast from './components/Toast';
import { useRecipeDetail, useRecipeList, useTags } from './hooks/useRecipes';
import { bulkUpdateTags, createRecipe, deleteRecipe, updateRecipe } from './api';
import type { Filters, Recipe, View } from './types';

const DEFAULT_FILTERS: Filters = {
  search: '',
  tags: [],
  minRating: null,
  maxCookTime: null,
  sort: 'created_at',
};

interface ToastState {
  message: string;
  action?: { label: string; onClick: () => void };
}

export default function App() {
  const [view, setView] = useState<View>({ type: 'grid' });
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Recipe | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Recipe | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
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

  const handleTagClick = useCallback(
    (tag: string) => {
      setFilters({ ...DEFAULT_FILTERS, tags: [tag] });
      navigate({ type: 'grid' });
    },
    [navigate]
  );

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

  const handleBulkAddTag = useCallback(
    async (ids: number[], tag: string) => {
      await bulkUpdateTags(ids, [tag], []);
      reloadAll();
    },
    [reloadAll]
  );

  const handleBulkRemoveTag = useCallback(
    async (ids: number[], tag: string) => {
      await bulkUpdateTags(ids, [], [tag]);
      reloadAll();
    },
    [reloadAll]
  );

  // Edit flow
  const handleEdit = useCallback((r: Recipe) => {
    setEditTarget(r);
    setEditModalOpen(true);
  }, []);

  const handleEditSaved = useCallback(() => {
    reloadDetail();
    reloadAll();
  }, [reloadDetail, reloadAll]);

  // Delete flow with undo
  const deletedRecipeRef = useRef<{ recipe: Recipe; timeout: ReturnType<typeof setTimeout> } | null>(null);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    const toDelete = deleteTarget;
    setDeleteTarget(null);

    // Optimistically navigate back
    navigate({ type: 'grid' });

    try {
      await deleteRecipe(toDelete.id);
      reloadAll();

      // Show undo toast — re-create the recipe if user clicks undo
      const undoTimeout = setTimeout(() => {
        deletedRecipeRef.current = null;
      }, 5000);

      deletedRecipeRef.current = { recipe: toDelete, timeout: undoTimeout };

      setToast({
        message: `"${toDelete.title}" deleted`,
        action: {
          label: 'Undo',
          onClick: async () => {
            if (deletedRecipeRef.current) {
              clearTimeout(deletedRecipeRef.current.timeout);
              deletedRecipeRef.current = null;
            }
            try {
              await createRecipe({
                title: toDelete.title,
                ingredients: toDelete.ingredients,
                steps: toDelete.steps,
                cook_time: toDelete.cook_time,
                prep_time: toDelete.prep_time,
                total_time: toDelete.total_time,
                servings: toDelete.servings,
                recipe_yield: toDelete.recipe_yield,
                source_url: toDelete.source_url,
                tags: toDelete.tags,
                notes: toDelete.notes,
                rating: toDelete.rating,
              });
              reloadAll();
            } catch {
              setToast({ message: 'Failed to undo delete' });
            }
          },
        },
      });
    } catch {
      setToast({ message: 'Failed to delete recipe' });
    }
  }, [deleteTarget, navigate, reloadAll]);

  // Browser back/forward
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
    const path = window.location.pathname;
    const match = path.match(/^\/recipe\/(\d+)$/);
    if (match) {
      setView({ type: 'detail', recipeId: parseInt(match[1], 10) });
    }
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // Escape closes modals
      if (e.key === 'Escape') {
        if (importModalOpen) { setImportModalOpen(false); return; }
        if (manualModalOpen) { setManualModalOpen(false); return; }
        if (editModalOpen) { setEditModalOpen(false); return; }
        if (deleteTarget) { setDeleteTarget(null); return; }
      }

      // Don't trigger shortcuts when typing in inputs
      if (isInput) return;

      // Ctrl+N or Cmd+N: open import modal
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setImportModalOpen(true);
        return;
      }

      // "/" focuses search
      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
        if (searchInput) {
          searchInput.focus();
        }
        return;
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [importModalOpen, manualModalOpen, editModalOpen, deleteTarget]);

  return (
    <div className="min-h-screen">
      <Navbar
        onImportUrl={() => setImportModalOpen(true)}
        onManualCreate={() => setManualModalOpen(true)}
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
          onAddRecipe={() => setImportModalOpen(true)}
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
          onEdit={handleEdit}
          onDelete={(r) => setDeleteTarget(r)}
        />
      )}

      <AddRecipeModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSaved={reloadAll}
      />

      <ManualRecipeModal
        open={manualModalOpen}
        onClose={() => setManualModalOpen(false)}
        onSaved={reloadAll}
        allTags={allTags}
      />

      <EditRecipeModal
        recipe={editTarget}
        open={editModalOpen}
        onClose={() => { setEditModalOpen(false); setEditTarget(null); }}
        onSaved={handleEditSaved}
        allTags={allTags}
      />

      <DeleteConfirmDialog
        recipeName={deleteTarget?.title || ''}
        open={deleteTarget !== null}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {toast && (
        <Toast
          message={toast.message}
          action={toast.action}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}

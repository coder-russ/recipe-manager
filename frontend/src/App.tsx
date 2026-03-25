import { useCallback, useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import RecipeGrid from './components/RecipeGrid';
import RecipeDetail from './components/RecipeDetail';
import AddRecipeModal from './components/AddRecipeModal';
import { useRecipeDetail, useRecipeList } from './hooks/useRecipes';
import type { View } from './types';

export default function App() {
  const [view, setView] = useState<View>({ type: 'grid' });
  const [modalOpen, setModalOpen] = useState(false);
  const { recipes, loading: listLoading, reload } = useRecipeList();

  const detailId = view.type === 'detail' ? view.recipeId : null;
  const { recipe, loading: detailLoading } = useRecipeDetail(detailId);

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
          onRecipeClick={(id) => navigate({ type: 'detail', recipeId: id })}
          onAddRecipe={() => setModalOpen(true)}
        />
      )}

      {view.type === 'detail' && (
        <RecipeDetail
          recipe={recipe}
          loading={detailLoading}
          onBack={handleBack}
        />
      )}

      <AddRecipeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={reload}
      />
    </div>
  );
}

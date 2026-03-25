import { useCallback, useEffect, useState } from 'react';
import { fetchRecipe, fetchRecipes } from '../api';
import type { Recipe } from '../types';

export function useRecipeList() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRecipes();
      setRecipes(data.recipes);
      setTotal(data.total);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { recipes, total, loading, error, reload: load };
}

export function useRecipeDetail(id: number | null) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id === null) {
      setRecipe(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetchRecipe(id)
      .then(setRecipe)
      .catch((e: any) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { recipe, loading, error };
}

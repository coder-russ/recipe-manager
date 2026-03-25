import { useCallback, useEffect, useState } from 'react';
import { fetchRecipe, fetchRecipes, fetchTags } from '../api';
import type { Filters, Recipe, TagCount } from '../types';

export function useRecipeList(filters: Filters) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRecipes({
        search: filters.search || undefined,
        tags: filters.tags.length > 0 ? filters.tags : undefined,
        sort: filters.sort,
        min_rating: filters.minRating ?? undefined,
        max_cook_time: filters.maxCookTime ?? undefined,
      });
      setRecipes(data.recipes);
      setTotal(data.total);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.tags.join(','), filters.sort, filters.minRating, filters.maxCookTime]);

  useEffect(() => { load(); }, [load]);

  return { recipes, total, loading, error, reload: load };
}

export function useRecipeDetail(id: number | null) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (id === null) {
      setRecipe(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRecipe(id);
      setRecipe(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  return { recipe, loading, error, reload: load };
}

export function useTags() {
  const [tags, setTags] = useState<TagCount[]>([]);

  const load = useCallback(async () => {
    try {
      const data = await fetchTags();
      setTags(data.tags);
    } catch {
      // silently ignore tag load failures
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { tags, reloadTags: load };
}

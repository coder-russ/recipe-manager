import type { Recipe, RecipeListResponse, TagListResponse } from './types';

const BASE = '/api';

async function request<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...opts?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(body.detail || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function fetchRecipes(params?: {
  search?: string;
  tag?: string;
  tags?: string[];
  sort?: string;
  min_rating?: number;
  max_cook_time?: number;
}): Promise<RecipeListResponse> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  if (params?.tag) qs.set('tag', params.tag);
  if (params?.tags && params.tags.length > 0) qs.set('tags', params.tags.join(','));
  if (params?.sort) qs.set('sort', params.sort);
  if (params?.min_rating) qs.set('min_rating', String(params.min_rating));
  if (params?.max_cook_time) qs.set('max_cook_time', String(params.max_cook_time));
  const query = qs.toString();
  return request<RecipeListResponse>(`${BASE}/recipes${query ? `?${query}` : ''}`);
}

export async function fetchRecipe(id: number): Promise<Recipe> {
  return request<Recipe>(`${BASE}/recipes/${id}`);
}

export async function importRecipe(url: string): Promise<Recipe> {
  return request<Recipe>(`${BASE}/recipes/import`, {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
}

export async function updateRecipe(
  id: number,
  data: Partial<Omit<Recipe, 'id' | 'created_at' | 'updated_at'>>
): Promise<Recipe> {
  return request<Recipe>(`${BASE}/recipes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteRecipe(id: number): Promise<void> {
  return request<void>(`${BASE}/recipes/${id}`, { method: 'DELETE' });
}

export async function fetchTags(): Promise<TagListResponse> {
  return request<TagListResponse>(`${BASE}/tags`);
}

export async function bulkUpdateTags(
  recipeIds: number[],
  addTags: string[],
  removeTags: string[]
): Promise<{ updated: number }> {
  return request<{ updated: number }>(`${BASE}/recipes/bulk/tags`, {
    method: 'POST',
    body: JSON.stringify({
      recipe_ids: recipeIds,
      add_tags: addTags,
      remove_tags: removeTags,
    }),
  });
}

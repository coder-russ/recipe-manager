import type { Recipe, RecipeListResponse } from './types';

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
  sort?: string;
}): Promise<RecipeListResponse> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  if (params?.tag) qs.set('tag', params.tag);
  if (params?.sort) qs.set('sort', params.sort);
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

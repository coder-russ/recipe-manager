export interface Recipe {
  id: number;
  title: string;
  ingredients: string[];
  steps: string[];
  cook_time: string | null;
  prep_time: string | null;
  total_time: string | null;
  servings: string | null;
  recipe_yield: string | null;
  source_url: string | null;
  image_path: string | null;
  tags: string[];
  notes: string | null;
  rating: number | null;
  created_at: string;
  updated_at: string;
}

export interface RecipeListResponse {
  recipes: Recipe[];
  total: number;
}

export interface ImportRequest {
  url: string;
}

export type View =
  | { type: 'grid' }
  | { type: 'detail'; recipeId: number };

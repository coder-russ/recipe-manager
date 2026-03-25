# Build Log

## Phase 1: Core — Recipe Extraction & Storage

**Date:** 2026-03-25
**Status:** Complete

### What was built
- FastAPI backend with full recipe CRUD API
- Multi-strategy recipe extraction pipeline (recipe-scrapers → JSON-LD → heuristic HTML)
- SQLite database with FTS5 full-text search indexing
- Local image download and static file serving
- Docker setup (Dockerfile, docker-compose.yml) with persistent volumes

### Project structure
```
2026-03-25_recipe-manager/
├── docker-compose.yml
├── Dockerfile
├── .dockerignore
├── .gitignore
├── requirements.txt
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── routers/
│   │   ├── __init__.py
│   │   └── recipes.py
│   └── services/
│       ├── __init__.py
│       ├── extractor.py
│       └── image.py
├── data/
└── images/
```

### API endpoints
- `GET /api/health` — health check
- `POST /api/recipes/import` — import recipe from URL
- `GET /api/recipes` — list/search/filter recipes
- `GET /api/recipes/{id}` — get single recipe
- `PUT /api/recipes/{id}` — update recipe
- `DELETE /api/recipes/{id}` — delete recipe

### Test results
- Health check: PASS
- Import from loveandlemons.com (Banana Bread): PASS — 11 ingredients, 6 steps, image downloaded
- Import from cookieandkate.com (Guacamole): PASS — 7 ingredients, 4 steps, image downloaded
- GET by ID: PASS
- PUT update (tags + rating): PASS
- LIST all recipes: PASS
- FTS5 search: PASS
- DELETE + verify 404: PASS
- Image serving: PASS (both images served correctly)
- Non-recipe URL error handling: PASS (returns 400/422 with human-readable message)
- 403 blocked site error handling: PASS (AllRecipes, SimplyRecipes returned clear error)

### Notes
- Some recipe sites (AllRecipes, SimplyRecipes) actively block scraping with 403 responses — error handling works correctly for these
- recipe-scrapers + JSON-LD fallback successfully covers sites that respond
- FTS5 triggers are set up for automatic index sync on insert/update/delete
- Images stored with recipe_id + URL hash naming to avoid collisions

### Git commits
- `f9250b5` — feat: Phase 1 — recipe extraction backend with FastAPI, SQLite, and Docker

---

## Phase 2: UI — Browse & Read

**Date:** 2026-03-25
**Status:** Complete

### What was built
- React 18 + Vite + TypeScript frontend with Tailwind CSS v4
- Warm cookbook design system: cream background (#FFFAF5), terracotta (#C2704E) accents, sage green (#7A9A6D) tags, Inter + Playfair Display typography
- Responsive recipe card grid (1 col mobile, 2 col tablet, 3 col desktop)
- Recipe detail view with ingredient checkboxes (strikethrough) and step highlighting
- Add Recipe modal with URL import and full editable preview form (title, ingredients, steps, times, servings all editable before save)
- Empty state with SVG icon and CTA button
- Skeleton loaders for both grid and detail views
- State-based client-side routing with browser back/forward support
- Backend updated to serve frontend static files with SPA fallback
- Multi-stage Dockerfile (Node build + Python serve)

### Components
- `Navbar.tsx` — sticky top nav with logo and Add Recipe button
- `RecipeGrid.tsx` + `RecipeCard.tsx` — responsive card grid with image, title, cook time, tags
- `RecipeDetail.tsx` — full recipe view with hero image, meta badges, ingredient checkboxes, numbered steps with click-to-highlight
- `AddRecipeModal.tsx` — URL input → editable preview → save flow
- `EmptyState.tsx` — friendly empty collection state
- `SkeletonCard.tsx` + `SkeletonDetail.tsx` — animated loading placeholders

### Test results
- Frontend served at `/`: PASS
- API health check still works: PASS
- SPA fallback (`/recipe/1` → index.html): PASS
- Recipe import via API: PASS
- Editable preview flow (import → edit title + remove ingredients → save): PASS — title changed, ingredient count reduced from 11 to 5
- Frontend build (Vite): PASS — clean build, no errors

### Notes
- Used Tailwind CSS v4 with `@theme` directive for custom design tokens
- `verbatimModuleSyntax` required `import type` for all type-only imports
- No React Router needed — simple state + history.pushState handles navigation
- Recipe images served from backend `/images/` mount

### Git commits
- `f0fa71d` — feat: Phase 2 — React frontend with warm cookbook UI

---

## Phase 3: Organization — Search, Tags & Filters

**Date:** 2026-03-25
**Status:** Complete

### What was built

**Backend:**
- `GET /api/tags` — returns all unique tags with usage counts
- `POST /api/recipes/bulk/tags` — bulk add/remove tags on multiple recipes
- Extended `GET /api/recipes` with `tags` (multi-tag AND filter), `min_rating`, `max_cook_time` params
- Cook time string parser (`app/utils.py`) — handles "1 hour 30 minutes", "45 min", etc.

**Frontend:**
- `SearchBar.tsx` — debounced (300ms) search with clear button and result count
- `FilterBar.tsx` — tag chips with counts, cook time dropdown, star rating filter, clear all
- `SortDropdown.tsx` — newest, A-Z, cook time, highest rated
- `TagInput.tsx` — autocomplete from existing tags (shared by detail view + bulk actions)
- `BulkActionBar.tsx` — floating bar for bulk add/remove tags on selected recipes
- `RecipeCard.tsx` — updated with selection checkbox overlay
- `RecipeGrid.tsx` — updated with search, filter, sort, select mode
- `RecipeDetail.tsx` — interactive tags: click to filter, X to remove, "+ Add tag" with autocomplete
- `App.tsx` — filters state management, tag CRUD wiring, bulk operations

### Test results
- Multi-tag AND filter (breakfast+baking): PASS — returns 1 of 2
- Rating filter (4+ stars): PASS — returns 1 of 2
- Cook time filter (under 30 min): PASS — returns 1 of 2
- Cook time filter (under 60 min): PASS — returns 2 of 2
- Bulk add tag to 2 recipes: PASS — 2 updated
- Bulk remove tag from 1 recipe: PASS — correctly leaves 1
- Sort A-Z: PASS — alphabetical order verified
- Tags endpoint: PASS — returns 4 tags with counts
- Frontend build: PASS — clean, no warnings
- Frontend served: PASS

### Git commits
- `024c7cb` — feat: Phase 3 backend — tags endpoint, bulk tags, extended filters
- `68e55fd` — feat: Phase 3 — search, tags, filters, sort, and bulk tag management UI

---

## Phase 4: Polish & Manual Entry

**Date:** 2026-03-25
**Status:** Complete

### What was built

**Backend:**
- `POST /api/recipes` — manual recipe creation endpoint with validation (title required, at least 1 ingredient, at least 1 step)
- `RecipeCreate` Pydantic schema with all recipe fields

**Frontend — New Components:**
- `ManualRecipeModal.tsx` — full recipe creation form (title, times, ingredients, steps, tags, notes, rating)
- `EditRecipeModal.tsx` — edit any field of existing recipes, pre-populated from recipe data
- `DeleteConfirmDialog.tsx` — confirmation dialog before deleting
- `Toast.tsx` — auto-dismissing toast with optional undo action button
- `ServingsScaler.tsx` — +/- buttons to adjust servings count, triggers ingredient scaling
- `AddDropdown.tsx` — dropdown replacing single button with "Import from URL" and "Create manually" options
- `utils/scaling.ts` — ingredient quantity parser and scaler

**Frontend — Updated Components:**
- `Navbar.tsx` — now uses AddDropdown with two options
- `RecipeDetail.tsx` — added Edit/Delete buttons, ServingsScaler next to Ingredients heading, scaled ingredient display
- `SearchBar.tsx` — shows "/" shortcut hint in placeholder, 44px min-height touch target
- `App.tsx` — wired all new modals, delete-with-undo flow (re-creates recipe), keyboard shortcuts

**Keyboard Shortcuts:**
- `Ctrl+N` / `Cmd+N` — open import modal
- `/` — focus search input
- `Escape` — close any open modal/dialog

**Ingredient Scaling:**
- Handles: integers ("2"), decimals ("1.5"), fractions ("1/2"), mixed fractions ("2 1/2"), unicode fractions
- Formats output with human-friendly fractions (1/4, 1/3, 1/2, 2/3, 3/4)
- Gracefully skips unscalable ingredients ("a pinch of pepper", "juice of 2 lemons")

**Mobile Optimization:**
- All interactive elements have 44px minimum touch targets
- Modals use full viewport height on mobile with scroll
- No horizontal scroll at 375px width

### Test results
- Manual recipe creation: PASS — 201 response, all fields persisted
- Validation (empty title): PASS — 422
- Validation (no ingredients): PASS — 422
- Update recipe: PASS — 200, fields updated
- Delete recipe: PASS — 204, verified 404 after
- Undo (re-create after delete): PASS — 201
- Ingredient scaling ("2 cups flour" x2): PASS — "4 cups flour"
- Fraction scaling ("1/2 tsp salt" x2): PASS — "1 teaspoon salt"
- Mixed fraction scaling ("2 1/2 cups" x2): PASS — "5 cups sugar"
- Unscalable ingredient ("a pinch of pepper"): PASS — unchanged
- Frontend build: PASS — clean, no errors
- Frontend served: PASS

### Git commits
- `3bff2f8` — feat: Phase 4 — manual entry, edit, delete, servings scaler, keyboard shortcuts, mobile polish

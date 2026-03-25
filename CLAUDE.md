# Recipe Manager

A self-hosted recipe manager that lets you save recipes from any URL on the web. Paste a link from sites like NYT Cooking, AllRecipes, Serious Eats, or any food blog, and it extracts the structured recipe — title, ingredients, steps, cook time, servings, and photo. Recipes are stored in a local SQLite database and organized through tags, search, and filtering. You can also create recipes manually, edit any field, scale servings, and manage your collection with bulk tag operations.

## How to Run

```bash
docker compose up
```

Access the app at **http://localhost:8000**

For development without Docker:

```bash
# Backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

## Architecture

### Tech Stack

- **Backend:** Python 3.12 + FastAPI
- **Database:** SQLite via SQLAlchemy, with FTS5 for full-text search
- **Recipe Extraction:** `recipe-scrapers` library with JSON-LD Schema.org fallback and BeautifulSoup heuristic HTML parsing
- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS v4
- **Containerization:** Docker Compose (multi-stage build: Node for frontend, Python for backend)

### File Structure

```
2026-03-25_recipe-manager/
├── docker-compose.yml          # Single service, port 8000, persistent volumes
├── Dockerfile                  # Multi-stage: Node 22 builds frontend, Python 3.12 serves
├── requirements.txt
├── app/
│   ├── main.py                 # FastAPI app, lifespan DB init, static file serving
│   ├── config.py               # DATABASE_URL, IMAGES_DIR settings
│   ├── database.py             # SQLAlchemy engine, session, WAL mode
│   ├── models.py               # Recipe model, FTS5 triggers, init_db()
│   ├── schemas.py              # Pydantic models (ImportRequest, RecipeCreate, RecipeUpdate, etc.)
│   ├── utils.py                # cook_time string → minutes parser
│   ├── routers/
│   │   └── recipes.py          # All API endpoints (CRUD, import, search, tags, bulk)
│   └── services/
│       ├── extractor.py        # 3-strategy extraction pipeline
│       └── image.py            # Image download and deletion
├── frontend/
│   ├── src/
│   │   ├── App.tsx             # Root component, routing, state management, keyboard shortcuts
│   │   ├── api.ts              # API client functions
│   │   ├── types.ts            # TypeScript interfaces
│   │   ├── index.css           # Tailwind v4 theme tokens, design system
│   │   ├── hooks/
│   │   │   └── useRecipes.ts   # Data fetching hooks
│   │   ├── components/
│   │   │   ├── Navbar.tsx          # Sticky top nav with AddDropdown
│   │   │   ├── AddDropdown.tsx     # Import URL / Create Manually dropdown
│   │   │   ├── RecipeGrid.tsx      # Card grid with search, filters, sort, bulk select
│   │   │   ├── RecipeCard.tsx      # Recipe card with image, title, tags, cook time
│   │   │   ├── RecipeDetail.tsx    # Full recipe view with scaler, edit/delete, tags
│   │   │   ├── AddRecipeModal.tsx  # URL import → editable preview → save
│   │   │   ├── ManualRecipeModal.tsx # Manual recipe creation form
│   │   │   ├── EditRecipeModal.tsx # Edit existing recipe fields
│   │   │   ├── DeleteConfirmDialog.tsx # Delete confirmation
│   │   │   ├── Toast.tsx           # Auto-dismissing toast with undo action
│   │   │   ├── ServingsScaler.tsx  # +/- servings adjustment
│   │   │   ├── SearchBar.tsx       # Debounced search with / shortcut
│   │   │   ├── FilterBar.tsx       # Tag, cook time, rating filters
│   │   │   ├── SortDropdown.tsx    # Sort by date, title, cook time, rating
│   │   │   ├── TagInput.tsx        # Autocomplete tag input
│   │   │   ├── BulkActionBar.tsx   # Floating bulk tag add/remove bar
│   │   │   ├── EmptyState.tsx      # Empty collection state
│   │   │   ├── SkeletonCard.tsx    # Loading placeholder for cards
│   │   │   └── SkeletonDetail.tsx  # Loading placeholder for detail view
│   │   └── utils/
│   │       └── scaling.ts         # Ingredient quantity parser and scaler
│   └── vite.config.ts
├── data/                       # SQLite database (Docker volume)
└── images/                     # Downloaded recipe images (Docker volume)
```

### How Components Connect

1. **Request flow:** Browser → FastAPI (serves frontend static files + API) → SQLAlchemy → SQLite
2. **Recipe import:** Frontend sends URL → `/api/recipes/import` → `extractor.py` tries recipe-scrapers, then JSON-LD, then heuristic HTML → saves to DB → downloads image → returns recipe
3. **Search:** Frontend sends query → `/api/recipes?search=...` → FTS5 virtual table MATCH → returns matching recipe IDs → filtered by SQLAlchemy
4. **Routing:** No React Router — App.tsx uses `useState` + `history.pushState` + `popstate` listener
5. **Ingredient scaling:** Client-side only — `ServingsScaler` calculates ratio, `scaleIngredient()` parses and reformats quantities

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/recipes/import` | Import recipe from URL |
| POST | `/api/recipes` | Create recipe manually |
| GET | `/api/recipes` | List/search/filter recipes |
| GET | `/api/recipes/{id}` | Get single recipe |
| PUT | `/api/recipes/{id}` | Update recipe |
| DELETE | `/api/recipes/{id}` | Delete recipe |
| GET | `/api/tags` | List all tags with counts |
| POST | `/api/recipes/bulk/tags` | Bulk add/remove tags |

Query params for `GET /api/recipes`: `search`, `tag`, `tags` (comma-separated, AND logic), `min_rating`, `max_cook_time`, `sort` (created_at, title, cook_time, rating), `limit`, `offset`

## Key Decisions

- **recipe-scrapers + JSON-LD fallback:** `recipe-scrapers` covers 400+ sites with site-specific parsers. For sites not covered, we fall back to JSON-LD Schema.org Recipe structured data, which most modern recipe sites embed. Last resort is heuristic HTML parsing with BeautifulSoup.
- **SQLite FTS5:** Full-text search without an external search engine. Fast enough for personal collections. FTS5 virtual table with triggers that auto-sync on INSERT/UPDATE/DELETE.
- **No React Router:** Simple state-based routing with `history.pushState` keeps the bundle small and avoids an extra dependency. Works well for a 2-view app (grid + detail).
- **Tailwind CSS v4:** Uses `@theme` directive for custom design tokens. The warm cookbook aesthetic (cream, terracotta, sage green) is defined as CSS custom properties.
- **Client-side ingredient scaling:** Avoids backend round-trips. The parser handles integers, decimals, fractions, mixed fractions, and unicode fractions. Unscalable ingredients (no leading number) are returned unchanged.
- **Delete with undo:** Instead of a soft-delete, we actually delete and re-create the recipe if the user clicks Undo within 5 seconds. Simpler than managing soft-delete state.

## Known Limitations

- **Some sites block scraping:** AllRecipes, SimplyRecipes, and other sites may return 403 errors. The app handles this gracefully with clear error messages.
- **JS-heavy sites:** Sites that render recipe content via JavaScript (some newer recipe platforms) may not be scrapable without a headless browser. Adding Playwright/Puppeteer support would address this.
- **Image storage grows over time:** Downloaded recipe images are stored locally. For a personal tool this is fine, but there's no built-in cleanup for orphaned images.
- **Ingredient scaling is heuristic:** "juice of 2 lemons" won't scale the "2" because "juice" appears before the number. Common formats (leading number + unit + ingredient) work well.
- **Single user:** No authentication. Designed as a personal tool.

## Common Maintenance Tasks

### Adding support for a new recipe site
The `recipe-scrapers` library handles most sites. If a site isn't supported:
1. Check if the site has JSON-LD Schema.org Recipe data (view page source, search for `"@type": "Recipe"`)
2. If yes, the JSON-LD fallback should handle it automatically
3. If no, you'd need to add a heuristic parser in `app/services/extractor.py`

### Updating dependencies
```bash
pip install --upgrade -r requirements.txt  # Backend
cd frontend && npm update                   # Frontend
```

### Backing up the database
```bash
# Copy the SQLite database file
docker compose cp backend:/app/data/recipes.db ./backup-recipes.db

# Or if running without Docker
cp data/recipes.db ./backup-recipes.db
```

### Rebuilding the frontend
```bash
cd frontend && npm run build
# The backend serves the built files from frontend/dist/
```

### Adding a new API endpoint
1. Add the Pydantic schema to `app/schemas.py`
2. Add the route handler to `app/routers/recipes.py`
3. Update `frontend/src/api.ts` with the new API function
4. Update `frontend/src/types.ts` if new types are needed

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` / `Cmd+N` | Open import recipe modal |
| `/` | Focus search input |
| `Escape` | Close any open modal or dialog |

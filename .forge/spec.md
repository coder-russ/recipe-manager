# Recipe Manager

## Overview
A self-hosted recipe manager that lets you save recipes from any URL on the web. Paste a link from sites like NYT Cooking, AllRecipes, Serious Eats, or any food blog, and it extracts the structured recipe — title, ingredients, steps, cook time, servings, and photo. Recipes are stored in a local database and organized through tags, search, and filtering. The UI is clean and fast, designed to be genuinely useful in a kitchen: easy to read on a phone, easy to search, and pleasant to browse.

This is a practical daily-use tool, not a demo. It should feel like a product you'd actually open when you're deciding what to cook.

## Project Type
full-stack-app

## Output Strategy
- **Location type:** docker
- **Path:** ~/forge-projects/2026-03-25_recipe-manager/
- **Justification:** Requires a backend server for URL fetching/parsing, a persistent database for recipe storage, and a web UI. Docker bundles all of this cleanly with a single `docker compose up`.

## Tech Stack
- **Backend:** Python 3.12 + FastAPI
  - Lightweight, fast, excellent for async URL fetching
  - Built-in OpenAPI docs for easy debugging
- **Recipe Extraction:** `recipe-scrapers` library (covers 400+ recipe sites) with fallback to raw HTML parsing via BeautifulSoup + JSON-LD/microdata extraction
  - `recipe-scrapers` handles the long tail of recipe site formats
  - Fallback parser catches sites not in the library by looking for Schema.org Recipe structured data
- **Database:** SQLite via SQLAlchemy
  - Zero-config, file-based, perfect for a single-user app
  - Stored as a Docker volume for persistence
- **Search:** SQLite FTS5 (full-text search)
  - No external search engine needed, fast enough for personal collections
- **Frontend:** React 18 + Vite + TailwindCSS
  - Fast dev builds, modern tooling, utility-first CSS for rapid UI work
- **Containerization:** Docker Compose (backend + frontend served via the backend in production)

## Features

### Phase 1: Core — Recipe Extraction & Storage
- **URL Import:** Paste a URL, backend fetches and extracts structured recipe data (title, ingredients, steps, cook time, prep time, servings, yield, source URL, image URL)
- **Multi-strategy extraction:** Primary: `recipe-scrapers` library. Fallback: JSON-LD Schema.org Recipe parsing. Last resort: heuristic HTML parsing with BeautifulSoup
- **Image handling:** Download and store recipe images locally so they persist even if the source site changes
- **Recipe model:** Full data model with all extracted fields plus user-added metadata (tags, notes, rating)
- **Database schema:** SQLite with FTS5 virtual table for search indexing
- **API endpoints:** CRUD for recipes, import endpoint, search endpoint

### Phase 2: UI — Browse & Read
- **Recipe list view:** Card grid showing recipe photo, title, cook time, tags. Responsive — works on desktop and mobile
- **Recipe detail view:** Clean reading layout optimized for kitchen use. Large text for ingredients and steps, checkboxes for ingredients, step highlighting
- **Add recipe flow:** Simple form with URL input, shows extracted preview, lets user edit before saving
- **Empty states & loading:** Skeleton loaders, helpful empty state when collection is empty
- **Design system:** Warm, appetizing color palette. Clean typography. No clutter

### Phase 3: Organization — Search, Tags & Filters
- **Full-text search:** Search across recipe titles, ingredients, and notes via FTS5
- **Tagging system:** Add/remove tags on recipes. Autocomplete from existing tags
- **Filter bar:** Filter by tags, cook time ranges, rating
- **Sort options:** By date added, title, cook time, rating
- **Bulk tag management:** Multi-select recipes and apply/remove tags

### Phase 4: Polish & Manual Entry
- **Manual recipe entry:** Full form to add a recipe by hand (no URL needed)
- **Edit recipes:** Edit any field of a saved recipe
- **Delete with confirmation:** Remove recipes with undo option
- **Servings scaler:** Adjust servings and see ingredient quantities recalculate
- **Mobile optimization:** Touch-friendly, readable at arm's length, no pinch-zooming needed
- **Keyboard shortcuts:** Quick add (Ctrl+N), search focus (/)

## Success Criteria
1. Successfully extract recipes from at least 5 major sites: NYT Cooking, AllRecipes, Serious Eats, Food Network, Bon Appetit
2. Extracted data includes at minimum: title, ingredients list, steps, and at least one of (cook time, servings)
3. Recipes persist across container restarts (database volume)
4. Full-text search returns relevant results within 200ms for a collection of 100+ recipes
5. UI is usable on mobile viewport (375px width) without horizontal scrolling
6. Manual recipe creation works end-to-end
7. Tags can be created, applied, filtered, and removed
8. Servings scaler correctly adjusts ingredient quantities
9. App starts with a single `docker compose up` command

## Grading Criteria

| Criterion | Weight | What it measures | Pass threshold |
|---|---|---|---|
| Functionality | high | Core workflow works end-to-end: paste URL → extract → save → browse → search → filter. All CRUD operations work | 7/10 |
| Product Depth | high | Real product feel — not a thin wrapper. Tags, search, filtering, editing, scaling all wired up and working. No dead buttons or stubbed features | 7/10 |
| Extraction Reliability | high | URL import works across diverse recipe sites. Graceful fallback when primary extraction fails. Clear error messages when a site truly can't be parsed | 7/10 |
| Design Quality | medium | Warm, clean, appetizing UI. Good typography and spacing. Feels like a tool you'd want to use, not a bootstrap demo. Mobile-friendly | 6/10 |
| Code Quality | medium | Clean project structure, error handling on network requests and parsing, reasonable separation of concerns | 6/10 |

## Design Direction
- **Aesthetic:** Warm and inviting. Think cookbook meets modern web app. Not sterile/corporate
- **Color palette:** Warm neutrals (cream, soft white) with an earthy accent color (terracotta, sage green, or warm amber). Dark text for readability
- **Typography:** Clean sans-serif for UI, slightly larger than typical for kitchen readability. Consider a subtle serif for recipe titles to add warmth
- **Cards:** Rounded corners, subtle shadows, generous whitespace. Recipe photos are the visual anchor
- **Layout:** Single-column on mobile, 2-3 column card grid on desktop. Generous padding. No cramming
- **Interactions:** Smooth transitions, no jarring page reloads. Optimistic UI updates where possible

## Risks & Complexity Notes
- **Recipe extraction is inherently fragile.** Sites change their markup, some use heavy JavaScript rendering (NYT Cooking), and paywalled content may not be scrapable. The `recipe-scrapers` library handles most of this but isn't perfect. The fallback JSON-LD parser is the safety net — most modern recipe sites embed Schema.org structured data even when the HTML is messy.
- **Ingredient parsing for scaling** is a known hard problem. "2 1/2 cups flour" vs "a pinch of salt" vs "juice of 2 lemons" — the scaler should handle common fraction/decimal formats and gracefully skip unscalable ingredients rather than producing garbage.
- **Image storage** adds disk usage over time. For a personal tool this is fine, but the volume should be clearly documented.
- **CORS:** The backend must handle recipe fetching server-side (not from the browser) since target recipe sites won't have permissive CORS headers.
- **Some recipe sites aggressively block scraping.** The backend should use a reasonable User-Agent header and handle 403/429 responses gracefully with clear user feedback.

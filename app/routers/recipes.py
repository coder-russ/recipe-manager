"""Recipe API endpoints: CRUD, import, search, tags, bulk operations."""

import json
import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, text
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Recipe
from app.schemas import (
    BulkTagRequest,
    BulkTagResponse,
    ImportRequest,
    RecipeListResponse,
    RecipeResponse,
    RecipeUpdate,
    TagListResponse,
)
from app.services.extractor import ExtractionError, FetchError, extract_recipe
from app.services.image import delete_image, download_image
from app.utils import parse_cook_time_minutes

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api")


@router.get("/health")
async def health_check():
    return {"status": "ok"}


@router.get("/tags", response_model=TagListResponse)
async def list_tags(db: Session = Depends(get_db)):
    """Return all unique tags with usage counts."""
    recipes = db.query(Recipe).all()
    tag_counts: dict[str, int] = {}
    for recipe in recipes:
        if recipe.tags:
            for tag in recipe.tags:
                tag_counts[tag] = tag_counts.get(tag, 0) + 1

    tags = sorted(
        [{"name": name, "count": count} for name, count in tag_counts.items()],
        key=lambda t: t["count"],
        reverse=True,
    )
    return TagListResponse(tags=tags)


@router.post("/recipes/import", response_model=RecipeResponse, status_code=201)
async def import_recipe(req: ImportRequest, db: Session = Depends(get_db)):
    """Import a recipe from a URL."""
    url = str(req.url)

    try:
        data = await extract_recipe(url)
    except FetchError as e:
        status = 400
        if e.status_code and e.status_code == 403:
            status = 400
        raise HTTPException(status_code=status, detail=str(e))
    except ExtractionError as e:
        raise HTTPException(status_code=422, detail=str(e))

    recipe = Recipe(
        title=data["title"],
        ingredients=data["ingredients"],
        steps=data["steps"],
        cook_time=data.get("cook_time"),
        prep_time=data.get("prep_time"),
        total_time=data.get("total_time"),
        servings=data.get("servings"),
        recipe_yield=data.get("recipe_yield"),
        source_url=url,
        tags=[],
        notes=None,
        rating=None,
    )
    db.add(recipe)
    db.commit()
    db.refresh(recipe)

    image_url = data.get("image_url")
    if image_url:
        image_path = await download_image(image_url, recipe.id)
        if image_path:
            recipe.image_path = image_path
            db.commit()
            db.refresh(recipe)

    return recipe


@router.post("/recipes/bulk/tags", response_model=BulkTagResponse)
async def bulk_update_tags(req: BulkTagRequest, db: Session = Depends(get_db)):
    """Add or remove tags on multiple recipes at once."""
    recipes = db.query(Recipe).filter(Recipe.id.in_(req.recipe_ids)).all()
    updated = 0

    for recipe in recipes:
        current_tags = list(recipe.tags) if recipe.tags else []
        changed = False

        for tag in req.add_tags:
            if tag not in current_tags:
                current_tags.append(tag)
                changed = True

        for tag in req.remove_tags:
            if tag in current_tags:
                current_tags.remove(tag)
                changed = True

        if changed:
            recipe.tags = current_tags
            updated += 1

    db.commit()
    return BulkTagResponse(updated=updated)


@router.get("/recipes", response_model=RecipeListResponse)
async def list_recipes(
    search: str | None = Query(None),
    tag: str | None = Query(None),
    tags: str | None = Query(None),
    min_rating: int | None = Query(None, ge=1, le=5),
    max_cook_time: int | None = Query(None, ge=1),
    sort: str = Query("created_at"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """List recipes with search, tag filter, rating filter, cook time filter, sort, and pagination."""
    query = db.query(Recipe)

    # Full-text search via FTS5
    if search:
        search_term = search.replace('"', '""')
        fts_query = text(
            "SELECT rowid FROM recipes_fts WHERE recipes_fts MATCH :term"
        ).bindparams(term=f'"{search_term}"')
        matching_ids = [row[0] for row in db.execute(fts_query).fetchall()]
        if not matching_ids:
            return RecipeListResponse(recipes=[], total=0)
        query = query.filter(Recipe.id.in_(matching_ids))

    # Single tag filter (backwards compatible)
    if tag:
        query = query.filter(
            Recipe.tags.op("LIKE")(f'%"{tag}"%')
        )

    # Multi-tag filter (AND logic)
    if tags:
        tag_list = [t.strip() for t in tags.split(",") if t.strip()]
        for t in tag_list:
            query = query.filter(
                Recipe.tags.op("LIKE")(f'%"{t}"%')
            )

    # Rating filter
    if min_rating is not None:
        query = query.filter(Recipe.rating.isnot(None), Recipe.rating >= min_rating)

    # Cook time filter — need to do in-memory since cook_time is a string
    if max_cook_time is not None:
        all_matching = query.all()
        filtered_ids = []
        for r in all_matching:
            minutes = parse_cook_time_minutes(r.cook_time)
            if minutes is not None and minutes <= max_cook_time:
                filtered_ids.append(r.id)
        if not filtered_ids:
            return RecipeListResponse(recipes=[], total=0)
        query = db.query(Recipe).filter(Recipe.id.in_(filtered_ids))
        # Re-apply other filters that may have been on the query
        if search:
            query = query.filter(Recipe.id.in_(matching_ids))
        if tag:
            query = query.filter(Recipe.tags.op("LIKE")(f'%"{tag}"%'))
        if tags:
            for t in tag_list:
                query = query.filter(Recipe.tags.op("LIKE")(f'%"{t}"%'))
        if min_rating is not None:
            query = query.filter(Recipe.rating.isnot(None), Recipe.rating >= min_rating)

    # Get total count before pagination
    total = query.count()

    # Sort
    sort_map = {
        "created_at": Recipe.created_at.desc(),
        "title": Recipe.title.asc(),
        "cook_time": Recipe.cook_time.asc(),
        "rating": Recipe.rating.desc().nulls_last(),
    }
    order = sort_map.get(sort, Recipe.created_at.desc())
    query = query.order_by(order)

    # Pagination
    recipes = query.offset(offset).limit(limit).all()

    return RecipeListResponse(recipes=recipes, total=total)


@router.get("/recipes/{recipe_id}", response_model=RecipeResponse)
async def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    """Get a single recipe by ID."""
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe


@router.put("/recipes/{recipe_id}", response_model=RecipeResponse)
async def update_recipe(
    recipe_id: int, update: RecipeUpdate, db: Session = Depends(get_db)
):
    """Update a recipe's fields."""
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    update_data = update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(recipe, field, value)

    db.commit()
    db.refresh(recipe)
    return recipe


@router.delete("/recipes/{recipe_id}", status_code=204)
async def delete_recipe(recipe_id: int, db: Session = Depends(get_db)):
    """Delete a recipe and its associated image."""
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    delete_image(recipe.image_path)
    db.delete(recipe)
    db.commit()

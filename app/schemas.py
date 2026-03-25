from datetime import datetime
from typing import Optional

from pydantic import BaseModel, HttpUrl


class ImportRequest(BaseModel):
    url: HttpUrl


class RecipeCreate(BaseModel):
    title: str
    ingredients: list[str]
    steps: list[str]
    cook_time: Optional[str] = None
    prep_time: Optional[str] = None
    total_time: Optional[str] = None
    servings: Optional[str] = None
    recipe_yield: Optional[str] = None
    source_url: Optional[str] = None
    tags: list[str] = []
    notes: Optional[str] = None
    rating: Optional[int] = None


class RecipeUpdate(BaseModel):
    title: Optional[str] = None
    ingredients: Optional[list[str]] = None
    steps: Optional[list[str]] = None
    cook_time: Optional[str] = None
    prep_time: Optional[str] = None
    total_time: Optional[str] = None
    servings: Optional[str] = None
    recipe_yield: Optional[str] = None
    tags: Optional[list[str]] = None
    notes: Optional[str] = None
    rating: Optional[int] = None


class RecipeResponse(BaseModel):
    id: int
    title: str
    ingredients: list[str]
    steps: list[str]
    cook_time: Optional[str] = None
    prep_time: Optional[str] = None
    total_time: Optional[str] = None
    servings: Optional[str] = None
    recipe_yield: Optional[str] = None
    source_url: Optional[str] = None
    image_path: Optional[str] = None
    tags: list[str]
    notes: Optional[str] = None
    rating: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class RecipeListResponse(BaseModel):
    recipes: list[RecipeResponse]
    total: int


class TagCount(BaseModel):
    name: str
    count: int


class TagListResponse(BaseModel):
    tags: list[TagCount]


class BulkTagRequest(BaseModel):
    recipe_ids: list[int]
    add_tags: list[str] = []
    remove_tags: list[str] = []


class BulkTagResponse(BaseModel):
    updated: int

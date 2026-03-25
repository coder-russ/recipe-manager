"""Multi-strategy recipe extraction: recipe-scrapers → JSON-LD → heuristic HTML."""

import json
import logging
import re

import httpx
from bs4 import BeautifulSoup
from recipe_scrapers import scrape_html

from app.config import FETCH_TIMEOUT, USER_AGENT

logger = logging.getLogger(__name__)


class ExtractionError(Exception):
    """Raised when no strategy can extract a recipe."""
    pass


class FetchError(Exception):
    """Raised when the URL cannot be fetched."""
    def __init__(self, message: str, status_code: int | None = None):
        super().__init__(message)
        self.status_code = status_code


async def fetch_url(url: str) -> str:
    """Fetch a URL and return its HTML content."""
    async with httpx.AsyncClient(
        follow_redirects=True,
        timeout=FETCH_TIMEOUT,
        headers={"User-Agent": USER_AGENT},
    ) as client:
        try:
            resp = await client.get(url)
        except httpx.TimeoutException:
            raise FetchError(f"Request timed out after {FETCH_TIMEOUT}s")
        except httpx.RequestError as e:
            raise FetchError(f"Could not connect to the URL: {e}")

        if resp.status_code == 403:
            raise FetchError(
                "Could not fetch the URL. The site returned HTTP 403 (Forbidden).",
                status_code=403,
            )
        if resp.status_code == 429:
            raise FetchError(
                "Could not fetch the URL. The site returned HTTP 429 (Too Many Requests).",
                status_code=429,
            )
        if resp.status_code >= 400:
            raise FetchError(
                f"Could not fetch the URL. The site returned HTTP {resp.status_code}.",
                status_code=resp.status_code,
            )

        return resp.text


def _to_list(val) -> list[str]:
    """Normalize a value to a list of strings."""
    if isinstance(val, list):
        return [str(v).strip() for v in val if str(v).strip()]
    if isinstance(val, str):
        lines = [l.strip() for l in val.split("\n") if l.strip()]
        return lines if lines else []
    return []


def _extract_with_scrapers(html: str, url: str) -> dict | None:
    """Strategy 1: Use recipe-scrapers library."""
    try:
        scraper = scrape_html(html, org_url=url)
        title = scraper.title()
        if not title:
            return None

        ingredients = _to_list(scraper.ingredients())
        steps_raw = scraper.instructions_list() if hasattr(scraper, "instructions_list") else []
        if not steps_raw:
            instructions = scraper.instructions()
            steps_raw = _to_list(instructions)
        steps = _to_list(steps_raw)

        if not ingredients and not steps:
            return None

        result = {
            "title": title,
            "ingredients": ingredients,
            "steps": steps,
        }

        # Optional fields
        try:
            result["cook_time"] = str(scraper.cook_time()) if scraper.cook_time() else None
        except Exception:
            result["cook_time"] = None
        try:
            result["prep_time"] = str(scraper.prep_time()) if scraper.prep_time() else None
        except Exception:
            result["prep_time"] = None
        try:
            result["total_time"] = str(scraper.total_time()) if scraper.total_time() else None
        except Exception:
            result["total_time"] = None
        try:
            result["servings"] = str(scraper.yields()) if scraper.yields() else None
        except Exception:
            result["servings"] = None
        try:
            result["recipe_yield"] = str(scraper.yields()) if scraper.yields() else None
        except Exception:
            result["recipe_yield"] = None
        try:
            result["image_url"] = scraper.image() if scraper.image() else None
        except Exception:
            result["image_url"] = None

        return result

    except Exception as e:
        logger.debug(f"recipe-scrapers failed: {e}")
        return None


def _extract_with_jsonld(html: str) -> dict | None:
    """Strategy 2: Parse JSON-LD Schema.org Recipe data."""
    soup = BeautifulSoup(html, "html.parser")
    scripts = soup.find_all("script", type="application/ld+json")

    for script in scripts:
        try:
            data = json.loads(script.string or "")
        except (json.JSONDecodeError, TypeError):
            continue

        recipes = _find_recipe_objects(data)
        for recipe in recipes:
            result = _parse_jsonld_recipe(recipe)
            if result:
                return result

    return None


def _find_recipe_objects(data) -> list[dict]:
    """Recursively find Recipe objects in JSON-LD data."""
    results = []
    if isinstance(data, dict):
        rtype = data.get("@type", "")
        if isinstance(rtype, list):
            type_match = "Recipe" in rtype
        else:
            type_match = rtype == "Recipe"

        if type_match:
            results.append(data)
        elif "@graph" in data:
            results.extend(_find_recipe_objects(data["@graph"]))
    elif isinstance(data, list):
        for item in data:
            results.extend(_find_recipe_objects(item))
    return results


def _parse_duration(iso_str: str | None) -> str | None:
    """Convert ISO 8601 duration (PT1H30M) to human-readable string."""
    if not iso_str or not isinstance(iso_str, str):
        return None
    match = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", iso_str)
    if not match:
        # Maybe it's already human-readable
        return iso_str if not iso_str.startswith("P") else None
    hours, minutes, seconds = match.groups()
    parts = []
    if hours:
        parts.append(f"{hours} hour{'s' if int(hours) != 1 else ''}")
    if minutes:
        parts.append(f"{minutes} minute{'s' if int(minutes) != 1 else ''}")
    if seconds:
        parts.append(f"{seconds} second{'s' if int(seconds) != 1 else ''}")
    return " ".join(parts) if parts else None


def _jsonld_instructions_to_list(instructions) -> list[str]:
    """Normalize JSON-LD recipeInstructions to a list of strings."""
    if isinstance(instructions, str):
        return _to_list(instructions)
    if isinstance(instructions, list):
        result = []
        for item in instructions:
            if isinstance(item, str):
                result.append(item.strip())
            elif isinstance(item, dict):
                if item.get("@type") == "HowToStep":
                    text = item.get("text", "")
                    if text:
                        result.append(text.strip())
                elif item.get("@type") == "HowToSection":
                    sub_items = item.get("itemListElement", [])
                    result.extend(_jsonld_instructions_to_list(sub_items))
        return [r for r in result if r]
    return []


def _parse_jsonld_recipe(recipe: dict) -> dict | None:
    """Parse a JSON-LD Recipe object into our normalized format."""
    title = recipe.get("name", "").strip()
    if not title:
        return None

    ingredients = recipe.get("recipeIngredient", [])
    if isinstance(ingredients, str):
        ingredients = [ingredients]
    ingredients = [str(i).strip() for i in ingredients if str(i).strip()]

    steps = _jsonld_instructions_to_list(recipe.get("recipeInstructions", []))

    if not ingredients and not steps:
        return None

    servings = recipe.get("recipeYield")
    if isinstance(servings, list):
        servings = servings[0] if servings else None
    servings = str(servings) if servings else None

    image = recipe.get("image")
    if isinstance(image, list):
        image = image[0] if image else None
    if isinstance(image, dict):
        image = image.get("url")

    return {
        "title": title,
        "ingredients": ingredients,
        "steps": steps,
        "cook_time": _parse_duration(recipe.get("cookTime")),
        "prep_time": _parse_duration(recipe.get("prepTime")),
        "total_time": _parse_duration(recipe.get("totalTime")),
        "servings": servings,
        "recipe_yield": servings,
        "image_url": image,
    }


def _extract_with_heuristic(html: str) -> dict | None:
    """Strategy 3: Heuristic HTML parsing as last resort."""
    soup = BeautifulSoup(html, "html.parser")

    # Try to find recipe title
    title = None
    for selector in ["h1", "[class*='title']", "[class*='recipe-name']"]:
        el = soup.select_one(selector)
        if el and el.get_text(strip=True):
            title = el.get_text(strip=True)
            break

    if not title:
        return None

    # Try to find ingredients
    ingredients = []
    ingredient_containers = soup.select(
        "[class*='ingredient'], [itemprop='recipeIngredient'], "
        "[itemprop='ingredients'], li[class*='ingredient']"
    )
    for el in ingredient_containers:
        text = el.get_text(strip=True)
        if text and len(text) < 500:
            ingredients.append(text)

    # Try to find steps
    steps = []
    step_containers = soup.select(
        "[class*='instruction'] li, [class*='step'] li, "
        "[class*='direction'] li, [itemprop='recipeInstructions'] li, "
        "[class*='instruction'] p, [class*='step'] p, [class*='direction'] p"
    )
    for el in step_containers:
        text = el.get_text(strip=True)
        if text and len(text) < 2000:
            steps.append(text)

    if not ingredients and not steps:
        return None

    # Try to find image
    image_url = None
    img = soup.select_one(
        "[class*='recipe'] img, [itemprop='image'], article img"
    )
    if img:
        image_url = img.get("src") or img.get("data-src")

    return {
        "title": title,
        "ingredients": ingredients,
        "steps": steps,
        "cook_time": None,
        "prep_time": None,
        "total_time": None,
        "servings": None,
        "recipe_yield": None,
        "image_url": image_url,
    }


async def extract_recipe(url: str) -> dict:
    """
    Extract recipe data from a URL using a three-strategy pipeline.
    Returns a normalized dict with recipe fields.
    Raises ExtractionError if no strategy succeeds.
    Raises FetchError if the URL cannot be fetched.
    """
    html = await fetch_url(url)

    # Strategy 1: recipe-scrapers
    result = _extract_with_scrapers(html, url)
    if result:
        logger.info(f"Extracted via recipe-scrapers: {result['title']}")
        return result

    # Strategy 2: JSON-LD
    result = _extract_with_jsonld(html)
    if result:
        logger.info(f"Extracted via JSON-LD: {result['title']}")
        return result

    # Strategy 3: Heuristic
    result = _extract_with_heuristic(html)
    if result:
        logger.info(f"Extracted via heuristic: {result['title']}")
        return result

    raise ExtractionError(
        "Could not extract a recipe from this URL. "
        "The site may not contain structured recipe data."
    )

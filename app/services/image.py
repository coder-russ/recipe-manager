"""Download and store recipe images locally."""

import hashlib
import logging
from pathlib import Path
from urllib.parse import urlparse

import httpx

from app.config import FETCH_TIMEOUT, IMAGES_DIR, USER_AGENT

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"}
DEFAULT_EXT = ".jpg"


async def download_image(image_url: str, recipe_id: int) -> str | None:
    """
    Download an image from a URL and save it locally.
    Returns the URL path to serve the image (e.g., /images/1_abc123.jpg),
    or None if download fails.
    """
    if not image_url:
        return None

    try:
        async with httpx.AsyncClient(
            follow_redirects=True,
            timeout=FETCH_TIMEOUT,
            headers={"User-Agent": USER_AGENT},
        ) as client:
            resp = await client.get(image_url)
            if resp.status_code >= 400:
                logger.warning(f"Image download returned {resp.status_code}: {image_url}")
                return None

            content = resp.content
            if not content or len(content) < 100:
                logger.warning(f"Image too small or empty: {image_url}")
                return None

            # Determine file extension
            content_type = resp.headers.get("content-type", "")
            ext = _ext_from_content_type(content_type)
            if not ext:
                ext = _ext_from_url(image_url)

            # Generate filename
            url_hash = hashlib.md5(image_url.encode()).hexdigest()[:10]
            filename = f"{recipe_id}_{url_hash}{ext}"
            filepath = IMAGES_DIR / filename

            filepath.write_bytes(content)
            logger.info(f"Saved image: {filepath}")

            return f"/images/{filename}"

    except Exception as e:
        logger.warning(f"Failed to download image {image_url}: {e}")
        return None


def _ext_from_content_type(content_type: str) -> str | None:
    """Get file extension from Content-Type header."""
    ct_map = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/gif": ".gif",
        "image/webp": ".webp",
        "image/avif": ".avif",
    }
    for ct, ext in ct_map.items():
        if ct in content_type:
            return ext
    return None


def _ext_from_url(url: str) -> str:
    """Get file extension from URL path."""
    parsed = urlparse(url)
    path = Path(parsed.path)
    ext = path.suffix.lower()
    if ext in ALLOWED_EXTENSIONS:
        return ext
    return DEFAULT_EXT


def delete_image(image_path: str | None) -> None:
    """Delete a local image file given its URL path."""
    if not image_path:
        return
    # image_path looks like /images/1_abc123.jpg
    filename = image_path.split("/")[-1]
    filepath = IMAGES_DIR / filename
    if filepath.exists():
        filepath.unlink()
        logger.info(f"Deleted image: {filepath}")

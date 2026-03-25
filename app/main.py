"""FastAPI application entry point."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import IMAGES_DIR
from app.models import init_db
from app.routers.recipes import router as recipes_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing database...")
    init_db()
    logger.info("Database ready.")
    yield


app = FastAPI(
    title="Recipe Manager",
    description="Self-hosted recipe manager — paste a URL, extract and store recipes.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve downloaded recipe images as static files
app.mount("/images", StaticFiles(directory=str(IMAGES_DIR)), name="images")

app.include_router(recipes_router)

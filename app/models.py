import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text, event, text
from sqlalchemy.types import JSON

from app.database import Base, engine


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String, nullable=False)
    ingredients = Column(JSON, nullable=False, default=list)
    steps = Column(JSON, nullable=False, default=list)
    cook_time = Column(String, nullable=True)
    prep_time = Column(String, nullable=True)
    total_time = Column(String, nullable=True)
    servings = Column(String, nullable=True)
    recipe_yield = Column(String, nullable=True)
    source_url = Column(String, nullable=True)
    image_path = Column(String, nullable=True)
    tags = Column(JSON, nullable=False, default=list)
    notes = Column(Text, nullable=True)
    rating = Column(Integer, nullable=True)
    created_at = Column(
        DateTime, nullable=False, default=lambda: datetime.datetime.now(datetime.timezone.utc)
    )
    updated_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        onupdate=lambda: datetime.datetime.now(datetime.timezone.utc),
    )


def init_db():
    """Create all tables and the FTS5 virtual table."""
    Base.metadata.create_all(bind=engine)

    with engine.connect() as conn:
        # Create FTS5 virtual table if it doesn't exist
        conn.execute(
            text(
                """
                CREATE VIRTUAL TABLE IF NOT EXISTS recipes_fts USING fts5(
                    title,
                    ingredients,
                    notes,
                    content='recipes',
                    content_rowid='id'
                )
                """
            )
        )
        # Create triggers for keeping FTS in sync
        conn.execute(
            text(
                """
                CREATE TRIGGER IF NOT EXISTS recipes_ai AFTER INSERT ON recipes BEGIN
                    INSERT INTO recipes_fts(rowid, title, ingredients, notes)
                    VALUES (new.id, new.title, new.ingredients, new.notes);
                END
                """
            )
        )
        conn.execute(
            text(
                """
                CREATE TRIGGER IF NOT EXISTS recipes_ad AFTER DELETE ON recipes BEGIN
                    INSERT INTO recipes_fts(recipes_fts, rowid, title, ingredients, notes)
                    VALUES ('delete', old.id, old.title, old.ingredients, old.notes);
                END
                """
            )
        )
        conn.execute(
            text(
                """
                CREATE TRIGGER IF NOT EXISTS recipes_au AFTER UPDATE ON recipes BEGIN
                    INSERT INTO recipes_fts(recipes_fts, rowid, title, ingredients, notes)
                    VALUES ('delete', old.id, old.title, old.ingredients, old.notes);
                    INSERT INTO recipes_fts(rowid, title, ingredients, notes)
                    VALUES (new.id, new.title, new.ingredients, new.notes);
                END
                """
            )
        )
        conn.commit()

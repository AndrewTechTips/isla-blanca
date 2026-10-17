from alembic.autogenerate import compare_metadata
from alembic.migration import MigrationContext
from sqlalchemy import Engine

from app.db.base import Base


def test_migrations_match_the_models(engine: Engine) -> None:
    """Fails when a model changes without a new Alembic migration."""
    with engine.connect() as connection:
        context = MigrationContext.configure(connection, opts={"compare_type": True})
        assert compare_metadata(context, Base.metadata) == []

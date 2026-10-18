import pytest

from app.core.config import Settings

SECRET = "x" * 32


@pytest.mark.parametrize(
    "url",
    [
        "postgres://user:pa%40ss@db.example.com/isla?sslmode=require",
        "postgresql://user:pa%40ss@db.example.com/isla?sslmode=require",
        "postgresql+psycopg://user:pa%40ss@db.example.com/isla?sslmode=require",
    ],
)
def test_hosted_database_urls_use_psycopg(url: str) -> None:
    settings = Settings(_env_file=None, database_url=url, jwt_secret_key=SECRET)

    assert str(settings.database_url) == (
        "postgresql+psycopg://user:pa%40ss@db.example.com/isla?sslmode=require"
    )


def test_cors_origins_come_from_a_json_list(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("CORS_ORIGINS", '["https://andrewtechtips.github.io"]')

    settings = Settings(_env_file=None, database_url="postgresql://u@h/d", jwt_secret_key=SECRET)

    assert settings.cors_origins == ["https://andrewtechtips.github.io"]

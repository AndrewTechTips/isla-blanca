from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import PostgresDsn
from pydantic_settings import BaseSettings, SettingsConfigDict

# The .env file lives at the repository root and is shared with docker-compose.
ROOT_DIR = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=ROOT_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    project_name: str = "Isla Blanca API"
    environment: Literal["development", "test", "production"] = "development"
    api_v1_prefix: str = "/api/v1"

    database_url: PostgresDsn
    test_database_url: PostgresDsn | None = None

    cors_origins: list[str] = ["http://localhost:5173"]

    seed_admin_email: str = "admin@islablanca.test"
    seed_admin_password: str | None = None
    seed_guest_password: str | None = None


@lru_cache
def get_settings() -> Settings:
    return Settings()

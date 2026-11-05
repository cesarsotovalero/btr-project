"""Application configuration using pydantic-settings."""

from enum import StrEnum

from pydantic_settings import BaseSettings


class LLMBackend(StrEnum):
    MOCK = "mock"
    GEMINI = "gemini"


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database (overridden via DATABASE_URL env var in all environments)
    database_url: str = "sqlite+aiosqlite://"
    database_url_sync: str = "sqlite://"

    # LLM
    llm_backend: LLMBackend = LLMBackend.MOCK
    vertex_ai_project: str = ""
    vertex_ai_location: str = "europe-west1"

    # File storage
    upload_dir: str = "/app/uploads"

    # App
    app_name: str = "BTR Risk Assessment"
    debug: bool = False

    # Auth / JWT
    secret_key: str = "btr-dev-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 480  # 8-hour analyst shift

    model_config = {"env_prefix": "", "case_sensitive": False}


settings = Settings()

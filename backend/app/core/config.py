from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator, model_validator
from typing import List, Optional

_DATABASE_URL_DEFAULT = "postgresql+asyncpg://nexus_admin:nexus_secure_pass@db:5432/nexus_db"

class Settings(BaseSettings):
    PROJECT_NAME: str = "Nexus Enterprise"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "super-secret-key-change-it"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days

    # Database
    # Optional so that an empty string set by an unresolved Railway reference
    # variable does not override the default — the validator below normalises
    # empty strings to None, and model_validator then applies the fallback.
    DATABASE_URL: Optional[str] = _DATABASE_URL_DEFAULT

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def _reject_empty_database_url(cls, v: object) -> Optional[str]:
        """Treat an empty (or whitespace-only) DATABASE_URL as unset."""
        if isinstance(v, str) and not v.strip():
            return None
        return v  # type: ignore[return-value]

    @model_validator(mode="after")
    def _ensure_database_url(self) -> "Settings":
        """
        Fall back to the default URL when DATABASE_URL resolved to None, and
        raise a clear error if the final value is still empty so that the
        service fails fast with a meaningful message instead of letting
        SQLAlchemy crash with 'Could not parse SQLAlchemy URL from string \"\"'.
        """
        if not self.DATABASE_URL:
            self.DATABASE_URL = _DATABASE_URL_DEFAULT
        if not self.DATABASE_URL.strip():
            raise ValueError(
                "DATABASE_URL is empty. "
                "Ensure the DATABASE_URL environment variable (or the "
                "${{nexus-db-prod.DATABASE_URL}} reference variable) resolves "
                "to a valid PostgreSQL connection string before starting the service."
            )
        return self

    @property
    def ASYNC_DATABASE_URL(self) -> str:
        """
        Ensures the DATABASE_URL is compatible with asyncpg.
        Railway / Render may provide 'postgres://' or plain 'postgresql://',
        but SQLAlchemy async requires 'postgresql+asyncpg://'.
        """
        url = self.DATABASE_URL  # type: ignore[assignment]
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgresql://") and "+asyncpg" not in url:
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url

    # Redis
    REDIS_URL: str = "redis://redis:6379/0"

    # Security
    ALLOWED_HOSTS: List[str] = ["*"]

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env")

settings = Settings()

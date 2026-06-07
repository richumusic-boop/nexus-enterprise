from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Nexus Enterprise"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "super-secret-key-change-it"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://nexus_admin:nexus_secure_pass@db:5432/nexus_db"
    
    @property
    def ASYNC_DATABASE_URL(self) -> str:
        """
        Ensures the DATABASE_URL is compatible with asyncpg.
        Render provides 'postgres://', but SQLAlchemy async needs 'postgresql+asyncpg://'.
        """
        url = self.DATABASE_URL
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

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
    
    # Redis
    REDIS_URL: str = "redis://redis:6379/0"
    
    # Security
    ALLOWED_HOSTS: List[str] = ["*"]
    
    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env")

settings = Settings()

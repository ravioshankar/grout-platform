from pydantic_settings import BaseSettings, SettingsConfigDict
import os
import logging  # Import logging early for settings validation

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    # Application settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "RoadReady API"
    VERSION: str = "1.0.0"
    
    # Database settings
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://roadready:roadready@localhost:5433/roadready"
    )
    
    # JWT Security - MUST be set in .env for production!
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    if not SECRET_KEY:
        print("⚠️ WARNING: SECRET_KEY not found in environment variables!")
        print("   Generate one with: python -c \"import secrets; print(secrets.token_urlsafe(32))\"")
        SECRET_KEY = "change-me-in-production-please-use-env-var"
    
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    SESSION_INACTIVITY_HOURS: int = 168  # 7 days
    
    # OAuth Settings - Set these in .env file
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    FACEBOOK_CLIENT_ID: str = os.getenv("FACEBOOK_CLIENT_ID", "")
    FACEBOOK_CLIENT_SECRET: str = os.getenv("FACEBOOK_CLIENT_SECRET", "")
    OAUTH_REDIRECT_URI: str = os.getenv(
        "OAUTH_REDIRECT_URI",
        "http://localhost:8888/api/v1/auth/callback"
    )
    
    # CORS Settings - PRODUCTION: Only allow specific origins!
    CORS_ORIGINS: list = os.getenv("CORS_ORIGINS", "*").split(",") if os.getenv("CORS_ORIGINS") else ["*"]
    CORS_ALLOW_CREDENTIALS: bool = os.getenv("CORS_ALLOW_CREDENTIALS", "false").lower() == "true"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()

# Import logging here to avoid circular import issues
import logging

# Validate required secrets on startup
if settings.SECRET_KEY == "change-me-in-production-please-use-env-var":
    logger.warning(
        "⚠️ CRITICAL: SECRET_KEY using default fallback! "
        "Set it in .env before deploying to production."
    )

if settings.GOOGLE_CLIENT_ID == "" or settings.GOOGLE_CLIENT_SECRET == "":
    logger.warning("⚠️ OAuth credentials not configured for Google. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env")

if settings.FACEBOOK_CLIENT_ID == "" or settings.FACEBOOK_CLIENT_SECRET == "":
    logger.warning("⚠️ OAuth credentials not configured for Facebook. Set FACEBOOK_CLIENT_ID and FACEBOOK_CLIENT_SECRET in .env")

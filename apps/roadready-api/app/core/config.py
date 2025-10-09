from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "RoadReady API"
    VERSION: str = "1.0.0"
    
    DATABASE_URL: str = "postgresql+psycopg://roadready:roadready@localhost:5433/roadready"
    
    class Config:
        env_file = ".env"

settings = Settings()

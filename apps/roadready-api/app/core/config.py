from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "RoadReady API"
    VERSION: str = "1.0.0"
    
    class Config:
        env_file = ".env"

settings = Settings()

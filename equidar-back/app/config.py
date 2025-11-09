from pydantic import Field
from pydantic_settings import BaseSettings
from typing import List
import os

def _split_csv(value: str | None) -> List[str]:
    return [v.strip() for v in (value or "").split(",") if v.strip()]

class Settings(BaseSettings):
    app_name: str = Field(default=os.getenv("APP_NAME", "Municipal Data Platform"))
    debug: bool = Field(default=os.getenv("DEBUG", "false").lower() == "true")
    cors_origins: List[str] = Field(default_factory=lambda: _split_csv(os.getenv("CORS_ORIGINS")))
    llm_provider: str = Field(default=os.getenv("LLM_PROVIDER", "echo"))
    data_file: str = Field(default=os.getenv("DATA_FILE", "data/municipalities.sample.json"))
    polygon_file: str = Field(default=os.getenv("POLYGON_FILE", "data/municipalities.polygons.json"))

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

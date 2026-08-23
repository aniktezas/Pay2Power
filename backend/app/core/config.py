from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    supabase_url: str = ""
    supabase_service_key: str = ""  # NEVER expose to frontend
    supabase_anon_key: str = ""
    cors_origins: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    demo_mode: bool = True

    class Config:
        env_file = ".env"
        env_prefix = ""
        case_sensitive = False


settings = Settings()

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Jan-Setu API"
    ENV: str = "development"
    
    # Firebase
    FIREBASE_PROJECT_ID: str = ""
    FIREBASE_PRIVATE_KEY: str = ""
    FIREBASE_CLIENT_EMAIL: str = ""
    
    # Gemini AI
    GEMINI_API_KEY: str = ""
    
    # Budget Constraints (MPLADS defaults)
    TOTAL_BUDGET_INR: int = 50_000_000 # 5 Crore
    WARD_MAX_PERCENTAGE: float = 0.45
    
    # Category Caps
    CAP_ROADS: float = 0.40
    CAP_HEALTHCARE: float = 0.25
    CAP_EDUCATION: float = 0.20
    CAP_WATER_SANITATION: float = 0.25
    CAP_OTHERS: float = 0.15
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()

import os
from pathlib import Path

# Base directory of the project
BASE_DIR = Path(__file__).resolve().parent.parent

# Read .env manually to ensure zero dependency friction
def load_env_file():
    env_path = BASE_DIR / ".env"
    if env_path.exists():
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip().strip('"').strip("'")
                    if key not in os.environ:
                        os.environ[key] = val

load_env_file()

class Settings:
    PROJECT_NAME: str = "SKILL PASSPORT"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/skill_passport.db")
    
    # Owner & Admin
    OWNER_EMAIL: str = os.getenv("OWNER_EMAIL", "owner@skillpassport.ai").lower().strip()
    OWNER_BOOTSTRAP_SECRET: str = os.getenv("OWNER_BOOTSTRAP_SECRET", "SkillPassportOwner2026!Bootstrap")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-skill-passport-2026-super-secure-jwt-token")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    
    # AI Service
    AI_API_KEY: str = os.getenv("AI_API_KEY", "").strip()
    AI_MODEL: str = os.getenv("AI_MODEL", "gemini-1.5-flash")
    AI_BASE_URL: str = os.getenv("AI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta")
    
    # Storage
    STORAGE_PROVIDER: str = os.getenv("STORAGE_PROVIDER", "local")
    STORAGE_DIR: Path = BASE_DIR / os.getenv("STORAGE_DIR", "storage/resumes")
    MAX_FILE_SIZE_MB: int = 10
    ALLOWED_EXTENSIONS: set = {".pdf", ".docx"}
    
    # Server URLs
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:8000")
    BACKEND_URL: str = os.getenv("BACKEND_URL", "http://localhost:8000")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

settings = Settings()
settings.STORAGE_DIR.mkdir(parents=True, exist_ok=True)

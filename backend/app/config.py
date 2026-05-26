import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load env file explicitly
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

class Settings(BaseSettings):
    PORT: int = 8000
    JWT_SECRET: str = "super-secret-key-study-assistant-987654321-ai-app"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    MONGODB_URI: str = "mongodb://localhost:27017"
    DB_NAME: str = "ai_study_assistant"
    GROQ_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""
    FIREBASE_PROJECT_ID: str = "ai-study-assistant-app"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()

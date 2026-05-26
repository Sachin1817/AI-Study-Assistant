import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.routers import auth, pdfs, summaries, quizzes, chats, notes, stats

# Set up logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("main")

app = FastAPI(
    title="AI Study Assistant API",
    description="Backend services for PDF text OCR, summarization, quizzes, and RAG chatbot.",
    version="1.0.0"
)

# Configure CORS Middleware for React + Vite access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits all local dev ports to connect seamlessly
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Establish local static folders for PDFs and gTTS Audio uploads
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")
os.makedirs(os.path.join(STATIC_DIR, "uploads"), exist_ok=True)
os.makedirs(os.path.join(STATIC_DIR, "audios"), exist_ok=True)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Register APIRouters
app.include_router(auth.router)
app.include_router(pdfs.router)
app.include_router(summaries.router)
app.include_router(quizzes.router)
app.include_router(chats.router)
app.include_router(notes.router)
app.include_router(stats.router)

@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "AI Study Assistant Backend is running.",
        "docs_url": "/docs"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "api"
    }

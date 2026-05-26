import uvicorn
from app.config import settings

if __name__ == "__main__":
    print(f"[Backend] Launching AI Study Assistant Backend server at: http://localhost:{settings.PORT}")
    print(f"[Backend] Swaggers API docs will be active at: http://localhost:{settings.PORT}/docs")
    uvicorn.run("app.main:app", host="127.0.0.1", port=settings.PORT, reload=True)

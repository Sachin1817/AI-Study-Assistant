from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

class ChunkSchema(BaseModel):
    chunk_id: int
    text: str

class PDFResponse(BaseModel):
    id: str
    title: str
    file_url: str
    created_at: datetime

    class Config:
        from_attributes = True

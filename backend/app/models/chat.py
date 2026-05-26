from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class MessageItem(BaseModel):
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str
    audio_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ChatQueryRequest(BaseModel):
    query: str
    pdf_id: Optional[str] = None
    generate_voice: bool = False

class ChatSessionResponse(BaseModel):
    id: str
    pdf_id: Optional[str] = None
    session_name: str
    messages: List[MessageItem]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

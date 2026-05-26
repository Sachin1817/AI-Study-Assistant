from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

class ImportantQuestion(BaseModel):
    question: str
    answer: str

class NotesGenerateRequest(BaseModel):
    pdf_id: str
    include_formulas: bool = True
    include_exam_questions: bool = True

class NotesResponse(BaseModel):
    id: str
    pdf_id: str
    title: str
    bullet_notes: str
    formulas: List[str]
    important_questions: List[ImportantQuestion]
    created_at: datetime

    class Config:
        from_attributes = True

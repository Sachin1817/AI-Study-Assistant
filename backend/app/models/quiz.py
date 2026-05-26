from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: str
    explanation: Optional[str] = ""

class QuizGenerateRequest(BaseModel):
    pdf_id: str
    difficulty: str = Field("medium", pattern="^(easy|medium|hard)$")
    num_questions: int = Field(5, ge=3, le=15)
    question_type: str = Field("MCQs", pattern="^(MCQs|True/False|Short Answer)$")

class QuizResponse(BaseModel):
    id: str
    pdf_id: str
    title: str
    difficulty: str
    questions: List[QuizQuestion]
    created_at: datetime

    class Config:
        from_attributes = True

class QuizSubmitRequest(BaseModel):
    answers: List[str]

class QuizAttemptResponse(BaseModel):
    attempt_id: str
    score: int
    total_questions: int
    answers: List[str]
    created_at: datetime

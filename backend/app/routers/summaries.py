from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List
from app.database import get_collection
from app.auth.dependencies import get_current_user
from app.services.ai_service import generate_summary
from app.services.voice_service import text_to_speech

router = APIRouter(prefix="/summaries", tags=["AI Summarization"])

class SummaryGenerateRequest(BaseModel):
    pdf_id: str
    summary_type: str

@router.post("/generate")
async def generate_summary_endpoint(
    req: SummaryGenerateRequest, 
    current_user: dict = Depends(get_current_user)
):
    summaries_col = get_collection("summaries")
    
    # Check if a summary has already been generated
    cached_summary = summaries_col.find_one({"pdf_id": req.pdf_id})
    
    if not cached_summary:
        # Fetch document from pdfs collection
        pdfs_col = get_collection("pdfs")
        pdf = pdfs_col.find_one({"_id": req.pdf_id, "user_id": current_user["id"]})
        if not pdf:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Study PDF not found or access denied."
            )
            
        # Synthesize new AI summary
        try:
            summary_data = generate_summary(pdf["extracted_text"])
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate document summary: {str(e)}"
            )
            
        # Save summary to cache collection
        cached_summary = {
            "user_id": current_user["id"],
            "pdf_id": req.pdf_id,
            "title": pdf["title"],
            "short_summary": summary_data["short_summary"],
            "detailed_summary": summary_data["detailed_summary"],
            "key_points": summary_data["key_points"],
            "exam_notes": summary_data.get("exam_notes", ""),
            "created_at": datetime.utcnow()
        }
        summaries_col.insert_one(cached_summary)
        
        # Record activity in history
        activities_col = get_collection("activities")
        activities_col.insert_one({
            "user_id": current_user["id"],
            "type": "summary",
            "description": f"Generated study summary for: {pdf['title']}",
            "timestamp": datetime.utcnow()
        })

    # Prepare content based on summary_type
    content = ""
    if req.summary_type == "concise":
        content = f"{cached_summary['short_summary']}\n\n{cached_summary['detailed_summary']}"
    elif req.summary_type == "bullets":
        bullets = cached_summary.get("key_points", [])
        if isinstance(bullets, list):
            content = "\n".join([f"* {b}" for b in bullets])
        else:
            content = str(bullets)
    elif req.summary_type == "flashcards":
        content = cached_summary.get("exam_notes", "")

    return {
        "pdf_id": req.pdf_id,
        "summary_type": req.summary_type,
        "content": content
    }

class VoiceGenerateRequest(BaseModel):
    pdf_id: str
    summary_type: str

@router.post("/voice")
async def generate_summary_voice(
    req: VoiceGenerateRequest, 
    current_user: dict = Depends(get_current_user)
):
    # Retrieve cached summary
    summaries_col = get_collection("summaries")
    cached_summary = summaries_col.find_one({"pdf_id": req.pdf_id})
    if not cached_summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Summary must be generated before voice explanation can be synthesized."
        )
        
    # Pick content to read based on summary_type
    text_to_read = ""
    if req.summary_type == "concise":
        text_to_read = cached_summary.get("short_summary", "")
    elif req.summary_type == "bullets":
        bullets = cached_summary.get("key_points", [])
        if isinstance(bullets, list):
            text_to_read = "Key bullet points: " + ", ".join(bullets)
        else:
            text_to_read = str(bullets)
    elif req.summary_type == "flashcards":
        text_to_read = cached_summary.get("exam_notes", "")
        
    if not text_to_read:
        text_to_read = "No summary content available to read."
        
    try:
        audio_url = text_to_speech(text_to_read)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Speech synthesis failed: {str(e)}"
        )
        
    return {"audio_url": audio_url}

@router.post("/{pdf_id}")
async def get_or_generate_summary(pdf_id: str, current_user: dict = Depends(get_current_user)):
    summaries_col = get_collection("summaries")
    
    # Check if a summary has already been generated
    cached_summary = summaries_col.find_one({"pdf_id": pdf_id})
    if cached_summary:
        return {
            "pdf_id": pdf_id,
            "short_summary": cached_summary["short_summary"],
            "detailed_summary": cached_summary["detailed_summary"],
            "key_points": cached_summary["key_points"],
            "exam_notes": cached_summary.get("exam_notes", "")
        }

    # Fetch document from pdfs collection
    pdfs_col = get_collection("pdfs")
    pdf = pdfs_col.find_one({"_id": pdf_id, "user_id": current_user["id"]})
    if not pdf:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study PDF not found or access denied."
        )

    # Synthesize new AI summary
    try:
        summary_data = generate_summary(pdf["extracted_text"])
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate document summary: {str(e)}"
        )

    # Save summary to cache collection
    summary_doc = {
        "user_id": current_user["id"],
        "pdf_id": pdf_id,
        "title": pdf["title"],
        "short_summary": summary_data["short_summary"],
        "detailed_summary": summary_data["detailed_summary"],
        "key_points": summary_data["key_points"],
        "exam_notes": summary_data.get("exam_notes", ""),
        "created_at": datetime.utcnow()
    }
    
    summaries_col.insert_one(summary_doc)

    # Record activity in history
    activities_col = get_collection("activities")
    activities_col.insert_one({
        "user_id": current_user["id"],
        "type": "summary",
        "description": f"Generated study summary for: {pdf['title']}",
        "timestamp": datetime.utcnow()
    })

    return {
        "pdf_id": pdf_id,
        "short_summary": summary_doc["short_summary"],
        "detailed_summary": summary_doc["detailed_summary"],
        "key_points": summary_doc["key_points"],
        "exam_notes": summary_doc["exam_notes"]
    }

@router.get("/{pdf_id}")
async def get_cached_summary(pdf_id: str, current_user: dict = Depends(get_current_user)):
    summaries_col = get_collection("summaries")
    cached_summary = summaries_col.find_one({"pdf_id": pdf_id})
    
    if not cached_summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Summary not generated for this PDF yet. Please submit a request to generate one."
        )
        
    return {
        "pdf_id": pdf_id,
        "short_summary": cached_summary["short_summary"],
        "detailed_summary": cached_summary["detailed_summary"],
        "key_points": cached_summary["key_points"],
        "exam_notes": cached_summary.get("exam_notes", "")
    }

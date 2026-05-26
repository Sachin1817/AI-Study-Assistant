from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime
from typing import List
from app.database import get_collection
from app.auth.dependencies import get_current_user
from app.models.notes import NotesGenerateRequest, NotesResponse
from app.services.ai_service import generate_notes

router = APIRouter(prefix="/notes", tags=["Smart Notes Generator"])

@router.post("/generate", response_model=NotesResponse)
async def generate_study_notes(req: NotesGenerateRequest, current_user: dict = Depends(get_current_user)):
    # Check if notes have already been created for this PDF
    notes_col = get_collection("notes")
    cached_notes = notes_col.find_one({"pdf_id": req.pdf_id})
    if cached_notes:
        return {
            "id": str(cached_notes["_id"]),
            "pdf_id": cached_notes["pdf_id"],
            "title": cached_notes["title"],
            "bullet_notes": cached_notes["bullet_notes"],
            "formulas": cached_notes["formulas"],
            "important_questions": cached_notes["important_questions"],
            "created_at": cached_notes["created_at"]
        }

    # Fetch source PDF text
    pdfs_col = get_collection("pdfs")
    pdf = pdfs_col.find_one({"_id": req.pdf_id, "user_id": current_user["id"]})
    if not pdf:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study PDF not found or access denied."
        )

    # Synthesize AI-generated study guides
    try:
        notes_data = generate_notes(
            pdf["extracted_text"], 
            req.include_formulas, 
            req.include_exam_questions
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate study notes: {str(e)}"
        )

    # Save compile notebook document
    notes_doc = {
        "user_id": current_user["id"],
        "pdf_id": req.pdf_id,
        "title": f"Notes on {pdf['title']}",
        "bullet_notes": notes_data.get("bullet_notes", ""),
        "formulas": notes_data.get("formulas", []) if req.include_formulas else [],
        "important_questions": notes_data.get("important_questions", []) if req.include_exam_questions else [],
        "created_at": datetime.utcnow()
    }
    
    result = notes_col.insert_one(notes_doc)
    notes_doc["id"] = str(result.inserted_id)

    # Record generation activity
    activities_col = get_collection("activities")
    activities_col.insert_one({
        "user_id": current_user["id"],
        "type": "note",
        "description": f"Generated revision notes on: {pdf['title']}",
        "timestamp": datetime.utcnow()
    })

    return {
        "id": notes_doc["id"],
        "pdf_id": notes_doc["pdf_id"],
        "title": notes_doc["title"],
        "bullet_notes": notes_doc["bullet_notes"],
        "formulas": notes_doc["formulas"],
        "important_questions": notes_doc["important_questions"],
        "created_at": notes_doc["created_at"]
    }

@router.get("/pdf/{pdf_id}", response_model=NotesResponse)
async def get_pdf_notes(pdf_id: str, current_user: dict = Depends(get_current_user)):
    notes_col = get_collection("notes")
    notes = notes_col.find_one({"pdf_id": pdf_id})
    
    if not notes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study notes not found for this PDF yet."
        )
        
    return {
        "id": str(notes["_id"]),
        "pdf_id": notes["pdf_id"],
        "title": notes["title"],
        "bullet_notes": notes["bullet_notes"],
        "formulas": notes["formulas"],
        "important_questions": notes["important_questions"],
        "created_at": notes["created_at"]
    }

@router.get("/", response_model=List[NotesResponse])
async def list_all_notes(current_user: dict = Depends(get_current_user)):
    notes_col = get_collection("notes")
    cursor = notes_col.find({"user_id": current_user["id"]})
    notes_list = list(cursor)
    
    results = []
    for item in notes_list:
        results.append({
            "id": str(item["_id"]),
            "pdf_id": item["pdf_id"],
            "title": item["title"],
            "bullet_notes": item["bullet_notes"],
            "formulas": item.get("formulas", []),
            "important_questions": item.get("important_questions", []),
            "created_at": item["created_at"]
        })
    results.sort(key=lambda x: x["created_at"], reverse=True)
    return results

@router.delete("/{note_id}")
async def delete_study_notes(note_id: str, current_user: dict = Depends(get_current_user)):
    notes_col = get_collection("notes")
    note = notes_col.find_one({"_id": note_id, "user_id": current_user["id"]})
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notes not found or access denied."
        )
        
    notes_col.delete_one({"_id": note_id})
    return {"detail": "Revision notes successfully deleted."}

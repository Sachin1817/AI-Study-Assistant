import os
import uuid
import logging
from datetime import datetime
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status, BackgroundTasks
from typing import List
from app.database import get_collection
from app.auth.dependencies import get_current_user
from app.models.pdf import PDFResponse
from app.services.pdf_processor import extract_text_from_pdf, chunk_text
from app.services.vector_store import store_pdf_embeddings

router = APIRouter(prefix="/pdfs", tags=["PDF Processing"])
logger = logging.getLogger("pdfs_router")

# Define folder path for storing user uploads
STATIC_UPLOADS_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
    "static", 
    "uploads"
)

@router.post("/upload", response_model=PDFResponse, status_code=status.HTTP_201_CREATED)
async def upload_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    use_ocr: bool = Form(False),
    current_user: dict = Depends(get_current_user)
):
    # Verify file is a PDF
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload a PDF file."
        )

    # Ensure uploads directory exists
    os.makedirs(STATIC_UPLOADS_DIR, exist_ok=True)
    
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    local_file_path = os.path.join(STATIC_UPLOADS_DIR, unique_filename)
    
    try:
        # Save file to server disk
        with open(local_file_path, "wb") as f:
            content = await file.read()
            f.write(content)
    except Exception as save_err:
        logger.error(f"Failed to write file to disk: {save_err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save uploaded file."
        )

    # Process and extract text
    logger.info(f"Processing text extraction for {file.filename} (OCR={use_ocr})...")
    extracted_text = extract_text_from_pdf(local_file_path, use_ocr=use_ocr)
    
    if not extracted_text.strip():
        # Clean up empty file
        try:
            os.remove(local_file_path)
        except Exception:
            pass
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Could not extract text from this PDF file. Please ensure it contains readable text or images."
        )

    # Split text into overlapping semantical segments
    text_chunks = chunk_text(extracted_text, chunk_size=800, overlap=150)
    
    # Save PDF metadata record
    pdfs_col = get_collection("pdfs")
    pdf_doc = {
        "user_id": current_user["id"],
        "title": file.filename,
        "file_url": f"/static/uploads/{unique_filename}",
        "extracted_text": extracted_text,
        "chunks": text_chunks,
        "created_at": datetime.utcnow()
    }
    
    result = pdfs_col.insert_one(pdf_doc)
    pdf_id = str(result.inserted_id)
    
    # Proactively calculate and store chunk embeddings for semantic retrieval QA
    logger.info("Triggering vector embeddings calculation and indexing in the background...")
    try:
        background_tasks.add_task(store_pdf_embeddings, pdf_id, text_chunks)
    except Exception as vec_err:
        logger.error(f"Vector embeddings generation failed: {vec_err}. RAG queries will fall back to text similarity matching.")

    # Record upload activity
    activities_col = get_collection("activities")
    activities_col.insert_one({
        "user_id": current_user["id"],
        "type": "upload",
        "description": f"Uploaded a new PDF: {file.filename}",
        "timestamp": datetime.utcnow()
    })

    return {
        "id": pdf_id,
        "title": file.filename,
        "file_url": pdf_doc["file_url"],
        "created_at": pdf_doc["created_at"]
    }

@router.get("/", response_model=List[PDFResponse])
async def list_pdfs(current_user: dict = Depends(get_current_user)):
    pdfs_col = get_collection("pdfs")
    cursor = pdfs_col.find({"user_id": current_user["id"]})
    pdf_items = list(cursor)
    
    results = []
    for item in pdf_items:
        results.append({
            "id": str(item["_id"]),
            "title": item["title"],
            "file_url": item["file_url"],
            "created_at": item["created_at"]
        })
    # Return items sorted by creation date (newest first)
    results.sort(key=lambda x: x["created_at"], reverse=True)
    return results

@router.delete("/{pdf_id}", status_code=status.HTTP_200_OK)
async def delete_pdf(pdf_id: str, current_user: dict = Depends(get_current_user)):
    pdfs_col = get_collection("pdfs")
    
    # Confirm PDF ownership
    pdf = pdfs_col.find_one({"_id": pdf_id, "user_id": current_user["id"]})
    if not pdf:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PDF not found or access denied."
        )
        
    # Delete PDF file from server disk if possible
    try:
        filename = os.path.basename(pdf["file_url"])
        full_disk_path = os.path.join(STATIC_UPLOADS_DIR, filename)
        if os.path.exists(full_disk_path):
            os.remove(full_disk_path)
    except Exception as e:
        logger.error(f"Failed to delete PDF from local disk: {e}")

    # Remove document metadata and vector records
    pdfs_col.delete_one({"_id": pdf_id})
    
    try:
        embeddings_col = get_collection("embeddings")
        embeddings_col.delete_one({"pdf_id": pdf_id})
    except Exception:
        pass
        
    return {"detail": "PDF and associated vector indices successfully deleted."}

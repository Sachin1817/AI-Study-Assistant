from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime
from typing import List, Optional
from app.database import get_collection
from app.auth.dependencies import get_current_user
from app.models.chat import ChatQueryRequest, ChatSessionResponse
from app.services.ai_service import ask_chatbot
from app.services.vector_store import search_similar_chunks
from app.services.voice_service import text_to_speech

router = APIRouter(prefix="/chats", tags=["AI Chatbot"])

@router.get("/sessions", response_model=List[ChatSessionResponse])
async def list_chat_sessions(current_user: dict = Depends(get_current_user)):
    chats_col = get_collection("chats")
    cursor = chats_col.find({"user_id": current_user["id"]})
    sessions = list(cursor)
    
    results = []
    for item in sessions:
        results.append({
            "id": str(item["_id"]),
            "pdf_id": item.get("pdf_id"),
            "session_name": item["session_name"],
            "messages": item.get("messages", []),
            "created_at": item["created_at"],
            "updated_at": item.get("updated_at", item["created_at"])
        })
    results.sort(key=lambda x: x["updated_at"], reverse=True)
    return results

@router.post("/sessions", response_model=ChatSessionResponse)
async def create_chat_session(
    session_name: str,
    pdf_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    chats_col = get_collection("chats")
    
    # Save a fresh chat session template
    session_doc = {
        "user_id": current_user["id"],
        "pdf_id": pdf_id,
        "session_name": session_name,
        "messages": [
            {
                "role": "assistant",
                "content": f"Hello! I am your AI Study Assistant. Ask me any doubts about '{session_name}'!",
                "audio_url": None,
                "created_at": datetime.utcnow()
            }
        ],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = chats_col.insert_one(session_doc)
    session_doc["id"] = str(result.inserted_id)
    return session_doc

@router.get("/sessions/{session_id}", response_model=ChatSessionResponse)
async def get_chat_session_details(session_id: str, current_user: dict = Depends(get_current_user)):
    chats_col = get_collection("chats")
    session = chats_col.find_one({"_id": session_id, "user_id": current_user["id"]})
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found or access denied."
        )
        
    session["id"] = str(session["_id"])
    return session

@router.post("/sessions/{session_id}/query")
async def ask_question_in_session(
    session_id: str,
    req: ChatQueryRequest,
    current_user: dict = Depends(get_current_user)
):
    chats_col = get_collection("chats")
    session = chats_col.find_one({"_id": session_id, "user_id": current_user["id"]})
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found or access denied."
        )

    # Detect active document context
    context_text = None
    pdf_id = req.pdf_id or session.get("pdf_id")
    
    if pdf_id:
        # Search relevant parts from PDF chunks using vector embeddings
        try:
            context_text = search_similar_chunks(pdf_id, req.query, top_k=3)
        except Exception:
            context_text = None

    # Retrieve response from Chatbot reasoning core
    bot_response = ask_chatbot(req.query, context=context_text)
    
    # Synthesize clean voice explainers if toggled
    audio_url = None
    if req.generate_voice:
        try:
            audio_url = text_to_speech(bot_response)
        except Exception:
            audio_url = None

    # Construct chat items
    user_message = {
        "role": "user",
        "content": req.query,
        "audio_url": None,
        "created_at": datetime.utcnow()
    }
    
    assistant_message = {
        "role": "assistant",
        "content": bot_response,
        "audio_url": audio_url,
        "created_at": datetime.utcnow()
    }
    
    # Add messages to log
    chats_col.update_one(
        {"_id": session_id},
        {
            "$push": {"messages": {"$each": [user_message, assistant_message]}},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )

    # Save to user activity log
    activities_col = get_collection("activities")
    activities_col.insert_one({
        "user_id": current_user["id"],
        "type": "chat",
        "description": f"Asked chatbot a query in session: '{session['session_name']}'",
        "timestamp": datetime.utcnow()
    })

    return {
        "user_message": user_message,
        "assistant_message": assistant_message
    }

@router.post("/query")
async def stateless_chat_query(
    req: ChatQueryRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Stateless endpoint for querying active document context.
    Matches standard frontend call format API.post('/chats/query').
    """
    # Detect active document context
    context_text = None
    if req.pdf_id:
        try:
            context_text = search_similar_chunks(req.pdf_id, req.query, top_k=3)
        except Exception as e:
            # Fallback to None if embedding similarity search fails
            context_text = None

    # Retrieve response from Chatbot reasoning core
    bot_response = ask_chatbot(req.query, context=context_text)

    # Save to user activity log
    activities_col = get_collection("activities")
    activities_col.insert_one({
        "user_id": current_user["id"],
        "type": "chat_stateless",
        "description": f"Asked stateless chatbot a query on PDF ID: {req.pdf_id}",
        "timestamp": datetime.utcnow()
    })

    return {
        "answer": bot_response
    }

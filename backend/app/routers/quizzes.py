import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime
from typing import List
from app.database import get_collection
from app.auth.dependencies import get_current_user
from app.models.quiz import QuizGenerateRequest, QuizSubmitRequest, QuizResponse, QuizAttemptResponse
from app.services.ai_service import generate_quiz

router = APIRouter(prefix="/quizzes", tags=["AI Quiz Generator"])

@router.post("/generate")
async def create_new_quiz(req: QuizGenerateRequest, current_user: dict = Depends(get_current_user)):
    # Retrieve PDF details
    pdfs_col = get_collection("pdfs")
    pdf = pdfs_col.find_one({"_id": req.pdf_id, "user_id": current_user["id"]})
    if not pdf:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study PDF not found or access denied."
        )

    # Trigger Groq AI Quiz builder
    try:
        raw_questions = generate_quiz(
            text=pdf["extracted_text"],
            difficulty=req.difficulty,
            num_questions=req.num_questions,
            question_type=req.question_type
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate study quiz: {str(e)}"
        )

    # Format questions to ensure standard structure
    questions_list = []
    for q in raw_questions:
        questions_list.append({
            "question": q.get("question", "Invalid Question"),
            "options": q.get("options", ["A", "B", "C", "D"]),
            "correct_answer": str(q.get("correct_answer", "")),
            "explanation": q.get("explanation", "")
        })

    # Save complete quiz properties
    quizzes_col = get_collection("quizzes")
    quiz_doc = {
        "user_id": current_user["id"],
        "pdf_id": req.pdf_id,
        "title": f"Quiz on {pdf['title']}",
        "difficulty": req.difficulty,
        "questions": questions_list,
        "attempts": [],
        "created_at": datetime.utcnow()
    }
    
    result = quizzes_col.insert_one(quiz_doc)
    quiz_id = str(result.inserted_id)

    # Record activity log
    activities_col = get_collection("activities")
    activities_col.insert_one({
        "user_id": current_user["id"],
        "type": "quiz",
        "description": f"Generated a new quiz on: {pdf['title']}",
        "timestamp": datetime.utcnow()
    })

    return {
        "id": quiz_id,
        "title": quiz_doc["title"],
        "difficulty": req.difficulty,
        "questions": questions_list,
        "created_at": quiz_doc["created_at"]
    }

@router.post("/{quiz_id}/submit")
async def submit_quiz_answers(
    quiz_id: str,
    submission: QuizSubmitRequest,
    current_user: dict = Depends(get_current_user)
):
    quizzes_col = get_collection("quizzes")
    quiz = quizzes_col.find_one({"_id": quiz_id, "user_id": current_user["id"]})
    
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz paper not found or access denied."
        )

    questions = quiz["questions"]
    user_answers = submission.answers
    
    # Pad answer list if incomplete
    if len(user_answers) < len(questions):
        user_answers.extend([""] * (len(questions) - len(user_answers)))
        
    correct_count = 0
    detailed_results = []
    
    # Calculate score server-side
    for idx, question in enumerate(questions):
        correct_ans = str(question["correct_answer"]).strip().lower()
        user_ans = str(user_answers[idx]).strip().lower()
        
        is_correct = (user_ans == correct_ans)
        if is_correct:
            correct_count += 1
            
        detailed_results.append({
            "question": question["question"],
            "options": question["options"],
            "correct_answer": question["correct_answer"],
            "user_answer": user_answers[idx],
            "is_correct": is_correct,
            "explanation": question["explanation"]
        })
        
    score = int((correct_count / len(questions)) * 100)
    attempt_id = str(uuid.uuid4())
    
    attempt_doc = {
        "attempt_id": attempt_id,
        "score": score,
        "correct_count": correct_count,
        "total_questions": len(questions),
        "answers": user_answers,
        "created_at": datetime.utcnow()
    }
    
    # Append attempt to cache array
    quizzes_col.update_one(
        {"_id": quiz_id},
        {"$push": {"attempts": attempt_doc}}
    )

    # Save to user activity log
    activities_col = get_collection("activities")
    activities_col.insert_one({
        "user_id": current_user["id"],
        "type": "quiz_attempt",
        "description": f"Completed quiz: '{quiz['title']}' with score {score}%",
        "timestamp": datetime.utcnow()
    })

    return {
        "attempt_id": attempt_id,
        "score": score,
        "correct_count": correct_count,
        "total_questions": len(questions),
        "results": detailed_results,
        "created_at": attempt_doc["created_at"]
    }

@router.get("/history")
async def get_quizzes_history(current_user: dict = Depends(get_current_user)):
    quizzes_col = get_collection("quizzes")
    cursor = quizzes_col.find({"user_id": current_user["id"]})
    quiz_items = list(cursor)
    
    history = []
    for item in quiz_items:
        # Pull each stored attempt
        for attempt in item.get("attempts", []):
            history.append({
                "quiz_id": str(item["_id"]),
                "title": item["title"],
                "difficulty": item["difficulty"],
                "attempt_id": attempt["attempt_id"],
                "score": attempt["score"],
                "correct_count": attempt.get("correct_count", 0),
                "total_questions": attempt["total_questions"],
                "created_at": attempt["created_at"]
            })
            
    # Sort history by attempt date (newest first)
    history.sort(key=lambda x: x["created_at"], reverse=True)
    return history

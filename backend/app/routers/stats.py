from fastapi import APIRouter, Depends
from datetime import datetime, timedelta
from typing import List, Dict, Any
from app.database import get_collection
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/stats", tags=["Dashboard Statistics"])

@router.get("/")
async def get_dashboard_statistics(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    
    # 1. Total PDFs Uploaded
    pdfs_col = get_collection("pdfs")
    pdf_count = pdfs_col.count_documents({"user_id": user_id})
    
    # 2. Total Quizzes Completed & Average Score
    quizzes_col = get_collection("quizzes")
    cursor = quizzes_col.find({"user_id": user_id})
    user_quizzes = list(cursor)
    
    total_quiz_attempts = 0
    scores_list = []
    
    for quiz in user_quizzes:
        attempts = quiz.get("attempts", [])
        total_quiz_attempts += len(attempts)
        for att in attempts:
            scores_list.append(att["score"])
            
    average_score = int(sum(scores_list) / len(scores_list)) if scores_list else 0
    
    # 3. Active Study Streak Calculation
    activities_col = get_collection("activities")
    act_cursor = activities_col.find({"user_id": user_id})
    activities = list(act_cursor)
    
    # Extract unique dates of activity
    activity_dates = set()
    for act in activities:
        timestamp = act.get("timestamp")
        if isinstance(timestamp, str):
            try:
                dt = datetime.fromisoformat(timestamp)
                activity_dates.add(dt.date())
            except Exception:
                pass
        elif isinstance(timestamp, datetime):
            activity_dates.add(timestamp.date())
            
    streak = 0
    today = datetime.utcnow().date()
    yesterday = today - timedelta(days=1)
    
    # Compute streak backwards from today or yesterday
    check_date = today if today in activity_dates else yesterday
    
    while check_date in activity_dates:
        streak += 1
        check_date -= timedelta(days=1)

    # 4. Recent Activity Log (top 8 entries)
    recent_activities = []
    # Sort activities chronologically reversed
    try:
        activities.sort(key=lambda x: x.get("timestamp", datetime.min), reverse=True)
    except Exception:
        pass
        
    for act in activities[:8]:
        recent_activities.append({
            "type": act.get("type", "study"),
            "description": act.get("description", ""),
            "timestamp": act.get("timestamp", datetime.utcnow())
        })

    # Return standard analytics dashboard schema
    return {
        "total_pdfs": pdf_count,
        "quizzes_completed": total_quiz_attempts,
        "average_score": average_score,
        "study_streak": max(streak, 1) if activities else 0, # minimum 1 day if any activity exists
        "recent_activities": recent_activities
    }

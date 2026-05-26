from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any
from datetime import datetime
from app.database import get_collection
from app.auth.security import get_password_hash, verify_password, create_access_token
from app.auth.dependencies import get_current_user
from app.models.user import UserRegister, UserLogin, UserResponse, UserProfileUpdate

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Dict[str, Any] if not globals().get('Dict') else dict, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserRegister):
    users_collection = get_collection("users")
    
    # Check if email is already taken
    existing_user = users_collection.find_one({"email": user_in.email})
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="A user with this email is already registered."
        )
        
    hashed_password = get_password_hash(user_in.password)
    user_doc = {
        "username": user_in.username,
        "email": user_in.email,
        "hashed_password": hashed_password,
        "profile_pic": f"https://api.dicebear.com/7.x/adventurer/svg?seed={user_in.username}",
        "created_at": datetime.utcnow()
    }
    
    result = users_collection.insert_one(user_doc)
    inserted_id = str(result.inserted_id)
    
    # Track registration activity
    activities_col = get_collection("activities")
    activities_col.insert_one({
        "user_id": inserted_id,
        "type": "register",
        "description": "Registered new account.",
        "timestamp": datetime.utcnow()
    })
    
    token = create_access_token(inserted_id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": inserted_id,
            "username": user_in.username,
            "email": user_in.email,
            "profile_pic": user_doc["profile_pic"]
        }
    }

@router.post("/login")
async def login(user_in: UserLogin):
    users_collection = get_collection("users")
    user = users_collection.find_one({"email": user_in.email})
    
    if not user or not verify_password(user_in.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password."
        )
        
    user_id = str(user["_id"])
    
    # Track login activity
    activities_col = get_collection("activities")
    activities_col.insert_one({
        "user_id": user_id,
        "type": "login",
        "description": "User logged in.",
        "timestamp": datetime.utcnow()
    })
    
    token = create_access_token(user_id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "username": user["username"],
            "email": user["email"],
            "profile_pic": user.get("profile_pic")
        }
    }

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_profile(profile_in: UserProfileUpdate, current_user: dict = Depends(get_current_user)):
    users_collection = get_collection("users")
    update_data = {}
    
    if profile_in.username is not None:
        update_data["username"] = profile_in.username
    if profile_in.profile_pic is not None:
        update_data["profile_pic"] = profile_in.profile_pic
        
    if update_data:
        # Convert string ID back to ObjectId safely
        from bson import ObjectId
        users_collection.update_one(
            {"_id": ObjectId(current_user["id"])},
            {"$set": update_data}
        )
        for k, v in update_data.items():
            current_user[k] = v
            
    return current_user

from pydantic import BaseModel

class FirebaseLoginRequest(BaseModel):
    id_token: str

@router.post("/firebase-login")
async def firebase_login(login_in: FirebaseLoginRequest):
    from app.auth.dependencies import decode_firebase_token
    
    decoded = decode_firebase_token(login_in.id_token)
    email = decoded.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token does not contain verified email address"
        )
        
    users_collection = get_collection("users")
    user = users_collection.find_one({"email": email})
    
    is_new = False
    if not user:
        is_new = True
        username = decoded.get("name") or decoded.get("username") or email.split("@")[0]
        profile_pic = decoded.get("picture") or f"https://api.dicebear.com/7.x/adventurer/svg?seed={username}"
        
        user_doc = {
            "username": username,
            "email": email,
            "profile_pic": profile_pic,
            "created_at": datetime.utcnow()
        }
        res = users_collection.insert_one(user_doc)
        user = users_collection.find_one({"_id": res.inserted_id})
        
        # Log register activity
        activities_col = get_collection("activities")
        activities_col.insert_one({
            "user_id": str(user["_id"]),
            "type": "register",
            "description": "User auto-synchronized via Firebase login API.",
            "timestamp": datetime.utcnow()
        })
    else:
        # Log login activity
        activities_col = get_collection("activities")
        activities_col.insert_one({
            "user_id": str(user["_id"]),
            "type": "login",
            "description": "User logged in via Firebase Auth popup.",
            "timestamp": datetime.utcnow()
        })
        
    return {
        "access_token": login_in.id_token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "username": user["username"],
            "email": user["email"],
            "profile_pic": user.get("profile_pic"),
            "is_new": is_new
        }
    }


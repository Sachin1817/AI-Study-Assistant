from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfileUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    profile_pic: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    username: str
    email: EmailStr
    profile_pic: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

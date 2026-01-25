from sqlmodel import SQLModel, Field
from datetime import datetime, date
from typing import Optional

class User(SQLModel, table=True):
    # Primary Key
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # User Identity
    email: str = Field(unique=True, index=True, max_length=255)
    first_name: Optional[str] = Field(default=None, max_length=100)
    last_name: Optional[str] = Field(default=None, max_length=100)
    phone_number: Optional[str] = Field(default=None, max_length=20)
    date_of_birth: Optional[date] = Field(default=None)
    
    # Authentication
    hashed_password: Optional[str] = Field(default=None, max_length=255)
    oauth_provider: Optional[str] = Field(default=None, max_length=50)
    oauth_provider_id: Optional[str] = Field(default=None, max_length=255)
    
    # Profile Information
    avatar_url: Optional[str] = Field(default=None, max_length=500)
    state: Optional[str] = Field(default=None, max_length=2)
    test_type: Optional[str] = Field(default=None, max_length=50)
    license_number: Optional[str] = Field(default=None, max_length=50)
    
    # Account Status
    is_active: bool = Field(default=True)
    email_verified: bool = Field(default=False)
    verification_token: Optional[str] = Field(default=None, max_length=255)
    verification_token_expires: Optional[datetime] = Field(default=None)
    
    # Gamification
    current_streak: int = Field(default=0)
    longest_streak: int = Field(default=0)
    total_xp: int = Field(default=0)
    last_activity_date: Optional[date] = Field(default=None)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Achievement(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    achievement_type: str = Field(max_length=50)
    earned_at: datetime = Field(default_factory=datetime.utcnow)
    xp_earned: int = Field(default=0)

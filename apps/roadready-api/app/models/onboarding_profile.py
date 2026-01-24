from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class OnboardingProfile(SQLModel, table=True):
    __tablename__ = "onboarding_profiles"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    profile_name: str = Field(max_length=100)
    state: str = Field(max_length=2)
    test_type: str = Field(max_length=50)
    is_active: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

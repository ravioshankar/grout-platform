from pydantic import BaseModel
from datetime import datetime

class OnboardingProfileCreate(BaseModel):
    profile_name: str
    state: str
    test_type: str

class OnboardingProfileUpdate(BaseModel):
    profile_name: str | None = None
    state: str | None = None
    test_type: str | None = None
    is_active: bool | None = None

class OnboardingProfileRead(BaseModel):
    id: int
    user_id: int
    profile_name: str
    state: str
    test_type: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

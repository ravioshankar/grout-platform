from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    hashed_password: Optional[str] = Field(default=None, max_length=255)
    oauth_provider: Optional[str] = Field(default=None, max_length=50)
    oauth_provider_id: Optional[str] = Field(default=None, max_length=255)
    state: Optional[str] = Field(default=None, max_length=2)
    test_type: Optional[str] = Field(default=None, max_length=50)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

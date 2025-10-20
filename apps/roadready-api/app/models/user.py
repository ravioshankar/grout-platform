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
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

from sqlmodel import SQLModel, Field
from datetime import datetime, date
from typing import Optional
from pydantic import field_validator

class UserCreate(SQLModel):
    email: str = Field(description="User's email address")
    password: Optional[str] = Field(default=None, description="User password (required for email signup)", min_length=8)
    state: Optional[str] = Field(default=None, description="US state code", max_length=2)
    test_type: Optional[str] = Field(default=None, description="Type of DMV test")
    
    model_config = {
        "json_schema_extra": {
            "examples": [{
                "email": "john.doe@example.com",
                "password": "SecurePass123!",
                "state": "CA",
                "test_type": "car"
            }]
        }
    }

class UserRead(SQLModel):
    # Identity
    id: int = Field(description="Unique user identifier")
    email: str = Field(description="User's email address")
    first_name: Optional[str] = Field(description="User's first name")
    last_name: Optional[str] = Field(description="User's last name")
    phone_number: Optional[str] = Field(description="Phone number")
    date_of_birth: Optional[date] = Field(description="Date of birth")
    
    # Profile
    avatar_url: Optional[str] = Field(description="Profile picture URL")
    state: Optional[str] = Field(description="US state code")
    test_type: Optional[str] = Field(description="Type of DMV test (car, motorcycle, cdl)")
    license_number: Optional[str] = Field(description="Driver's license number")
    
    # Status & Timestamps
    is_active: bool = Field(description="Account active status")
    email_verified: bool = Field(description="Email verification status")
    created_at: datetime = Field(description="Account creation timestamp")
    updated_at: datetime = Field(description="Last update timestamp")

class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"

class LoginRequest(SQLModel):
    email: str = Field(description="Valid email address")
    password: str = Field(min_length=1, description="User password")
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        if '@' not in v:
            raise ValueError('Invalid email format')
        return v

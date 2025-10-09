from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

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
    
    # Profile
    state: Optional[str] = Field(description="US state code")
    test_type: Optional[str] = Field(description="Type of DMV test (car, motorcycle, cdl)")
    
    # Status & Timestamps
    is_active: bool = Field(description="Account active status")
    created_at: datetime = Field(description="Account creation timestamp")
    updated_at: datetime = Field(description="Last update timestamp")

class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"

class LoginRequest(SQLModel):
    email: str
    password: str

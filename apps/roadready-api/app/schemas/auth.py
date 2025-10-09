from sqlmodel import SQLModel, Field
from typing import Optional

class SignupRequest(SQLModel):
    email: str = Field(description="User's email address")
    password: str = Field(description="User password", min_length=8)
    
    model_config = {
        "json_schema_extra": {
            "examples": [{
                "email": "user@example.com",
                "password": "SecurePass123!"
            }]
        }
    }

class UserProfileUpdate(SQLModel):
    first_name: Optional[str] = Field(default=None, description="User's first name", max_length=100)
    last_name: Optional[str] = Field(default=None, description="User's last name", max_length=100)
    state: Optional[str] = Field(default=None, description="US state code", max_length=2)
    test_type: Optional[str] = Field(default=None, description="Type of DMV test")
    
    model_config = {
        "json_schema_extra": {
            "examples": [{
                "first_name": "John",
                "last_name": "Doe",
                "state": "CA",
                "test_type": "car"
            }]
        }
    }

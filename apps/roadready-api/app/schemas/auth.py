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
    state: Optional[str] = Field(default=None, description="US state code", max_length=2)
    test_type: Optional[str] = Field(default=None, description="Type of DMV test")
    
    model_config = {
        "json_schema_extra": {
            "examples": [{
                "state": "CA",
                "test_type": "car"
            }]
        }
    }

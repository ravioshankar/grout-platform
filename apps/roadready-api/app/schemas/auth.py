from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import date
from pydantic import field_validator

class SignupRequest(SQLModel):
    email: str = Field(description="Valid email address")
    password: str = Field(description="User password", min_length=8)
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        if '@' not in v:
            raise ValueError('Invalid email format')
        return v
    
    model_config = {
        "json_schema_extra": {
            "examples": [{
                "email": "user@example.com",
                "password": "SecurePass123!"
            }]
        }
    }

class TokenResponse(SQLModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class UserProfileUpdate(SQLModel):
    first_name: Optional[str] = Field(default=None, description="User's first name", max_length=100)
    last_name: Optional[str] = Field(default=None, description="User's last name", max_length=100)
    phone_number: Optional[str] = Field(default=None, description="Phone number", max_length=20)
    date_of_birth: Optional[date] = Field(default=None, description="Date of birth")
    avatar_url: Optional[str] = Field(default=None, description="Profile picture URL", max_length=500)
    state: Optional[str] = Field(default=None, description="US state code", max_length=2)
    test_type: Optional[str] = Field(default=None, description="Type of DMV test")
    license_number: Optional[str] = Field(default=None, description="Driver's license number", max_length=50)
    
    model_config = {
        "json_schema_extra": {
            "examples": [{
                "first_name": "John",
                "last_name": "Doe",
                "phone_number": "+1234567890",
                "date_of_birth": "1990-01-01",
                "state": "CA",
                "test_type": "car",
                "license_number": "D1234567"
            }]
        }
    }

class ChangePasswordRequest(SQLModel):
    current_password: str = Field(description="Current password")
    new_password: str = Field(description="New password", min_length=8)
    
class ChangeEmailRequest(SQLModel):
    new_email: str = Field(description="New email address")
    password: str = Field(description="Current password for verification")

class RefreshTokenRequest(SQLModel):
    refresh_token: str

from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional
import secrets

class EmailVerification(SQLModel, table=True):
    __tablename__ = "email_verifications"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    token: str = Field(unique=True, index=True, max_length=255)
    email: str = Field(max_length=255)
    expires_at: datetime
    verified_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    @staticmethod
    def generate_token() -> str:
        return secrets.token_urlsafe(32)

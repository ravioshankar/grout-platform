from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional
import secrets

class PasswordReset(SQLModel, table=True):
    __tablename__ = "password_resets"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    token: str = Field(unique=True, index=True, max_length=255)
    expires_at: datetime
    used_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    @staticmethod
    def generate_token() -> str:
        return secrets.token_urlsafe(32)

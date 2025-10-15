from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional
import secrets

class Session(SQLModel, table=True):
    __tablename__ = "sessions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    session_id: str = Field(unique=True, index=True, max_length=64)
    token_hash: str = Field(index=True, max_length=128)
    refresh_token_hash: Optional[str] = Field(default=None, max_length=128)
    expires_at: datetime
    last_activity: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    ip_address: Optional[str] = Field(default=None, max_length=45)
    user_agent: Optional[str] = Field(default=None, max_length=500)
    is_active: bool = Field(default=True)
    revoked_at: Optional[datetime] = Field(default=None)
    
    @staticmethod
    def generate_session_id() -> str:
        return secrets.token_urlsafe(32)

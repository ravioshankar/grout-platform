from sqlmodel import SQLModel
from datetime import datetime
from typing import Optional

class SessionRead(SQLModel):
    session_id: str
    ip_address: Optional[str]
    user_agent: Optional[str]
    created_at: datetime
    last_activity: datetime
    expires_at: datetime

class SessionRevoke(SQLModel):
    session_id: str

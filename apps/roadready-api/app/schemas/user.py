from sqlmodel import SQLModel
from datetime import datetime

class UserCreate(SQLModel):
    email: str
    state: str
    test_type: str

class UserRead(SQLModel):
    id: int
    email: str
    state: str
    test_type: str
    created_at: datetime
    updated_at: datetime

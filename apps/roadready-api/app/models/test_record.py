from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class TestRecord(SQLModel, table=True):
    __tablename__ = "test_records"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    
    # Test Details
    state_code: str = Field(max_length=2)
    test_type: str = Field(max_length=50)
    category: str = Field(max_length=50)
    
    # Results
    score: int
    total_questions: int
    correct_answers: int
    time_spent: int  # in seconds
    
    # Test Data (JSON stored as text)
    questions: str  # JSON string
    user_answers: str  # JSON string
    is_correct: str  # JSON string
    
    # Metadata
    completed_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

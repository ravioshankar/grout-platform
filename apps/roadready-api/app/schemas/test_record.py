from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TestRecordCreate(BaseModel):
    state_code: str
    test_type: str
    category: str
    score: int
    total_questions: int
    correct_answers: int
    time_spent: int
    questions: str
    user_answers: str
    is_correct: str

class TestRecordRead(BaseModel):
    id: int
    user_id: int
    state_code: str
    test_type: str
    category: str
    score: int
    total_questions: int
    correct_answers: int
    time_spent: int
    questions: str
    user_answers: str
    is_correct: str
    completed_at: datetime
    created_at: datetime

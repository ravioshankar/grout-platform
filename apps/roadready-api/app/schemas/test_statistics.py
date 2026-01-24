from sqlmodel import SQLModel
from typing import List, Optional
from datetime import datetime

class CategoryPerformance(SQLModel):
    category: str
    total_attempts: int
    average_score: float
    best_score: int
    worst_score: int

class TestStatistics(SQLModel):
    total_tests: int
    average_score: float
    best_score: int
    worst_score: int
    pass_rate: float
    total_time_spent: int  # in seconds
    average_time_per_test: int
    improvement_rate: Optional[float] = None  # percentage improvement
    category_performance: List[CategoryPerformance]
    recent_trend: str  # "improving", "declining", "stable"

class TestRecordPaginated(SQLModel):
    items: List[dict]
    total: int
    page: int
    page_size: int
    total_pages: int

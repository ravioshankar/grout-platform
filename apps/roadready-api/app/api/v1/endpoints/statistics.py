from fastapi import APIRouter, Depends
from sqlmodel import Session
from typing import Dict, List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.test_statistics import TestStatistics, WeakArea
from app.services.statistics_service import StatisticsService

router = APIRouter()

@router.get(
    "/",
    response_model=TestStatistics,
    summary="Get test statistics",
    description="Get comprehensive test statistics for the current user"
)
async def get_statistics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive test statistics including scores, trends, and category performance"""
    return StatisticsService.calculate_user_statistics(current_user.id, db)

@router.get(
    "/weak-areas",
    summary="Get weak areas",
    description="Identify categories where user needs improvement"
)
async def get_weak_areas(
    threshold: float = 70.0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, List[WeakArea]]:
    """Get list of categories where user is performing below threshold"""
    return StatisticsService.get_weak_areas(current_user.id, db, threshold)

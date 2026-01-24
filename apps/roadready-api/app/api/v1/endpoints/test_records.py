from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, func
from typing import List, Optional
from datetime import datetime, date
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.test_record import TestRecord
from app.schemas.test_record import TestRecordCreate, TestRecordRead
from app.schemas.test_statistics import TestRecordPaginated

router = APIRouter()

@router.post("/", response_model=TestRecordRead, status_code=201)
async def create_test_record(
    test_data: TestRecordCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    test_record = TestRecord(
        user_id=current_user.id,
        **test_data.model_dump()
    )
    db.add(test_record)
    db.commit()
    db.refresh(test_record)
    return test_record

@router.get("/", response_model=TestRecordPaginated)
async def get_user_test_records(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    state_code: Optional[str] = Query(None, description="Filter by state code"),
    test_type: Optional[str] = Query(None, description="Filter by test type"),
    category: Optional[str] = Query(None, description="Filter by category"),
    min_score: Optional[int] = Query(None, ge=0, le=100, description="Minimum score"),
    max_score: Optional[int] = Query(None, ge=0, le=100, description="Maximum score"),
    start_date: Optional[date] = Query(None, description="Start date filter"),
    end_date: Optional[date] = Query(None, description="End date filter"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get paginated test records with optional filters"""
    
    # Build query
    statement = select(TestRecord).where(TestRecord.user_id == current_user.id)
    
    # Apply filters
    if state_code:
        statement = statement.where(TestRecord.state_code == state_code)
    if test_type:
        statement = statement.where(TestRecord.test_type == test_type)
    if category:
        statement = statement.where(TestRecord.category == category)
    if min_score is not None:
        statement = statement.where(TestRecord.score >= min_score)
    if max_score is not None:
        statement = statement.where(TestRecord.score <= max_score)
    if start_date:
        statement = statement.where(TestRecord.completed_at >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        statement = statement.where(TestRecord.completed_at <= datetime.combine(end_date, datetime.max.time()))
    
    # Get total count
    count_statement = select(func.count()).select_from(statement.subquery())
    total = db.exec(count_statement).one()
    
    # Apply pagination
    statement = statement.order_by(TestRecord.completed_at.desc())
    statement = statement.offset((page - 1) * page_size).limit(page_size)
    
    results = db.exec(statement).all()
    
    # Calculate total pages
    total_pages = (total + page_size - 1) // page_size
    
    return TestRecordPaginated(
        items=[record.model_dump() for record in results],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.get("/{test_id}", response_model=TestRecordRead)
async def get_test_record(
    test_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    test_record = db.get(TestRecord, test_id)
    if not test_record or test_record.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Test record not found")
    return test_record

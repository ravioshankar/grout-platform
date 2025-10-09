from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.core.database import get_db
from app.core.security import get_password_hash, get_current_user
from app.models.user import User
from app.schemas.user import UserCreate, UserRead
from datetime import datetime

router = APIRouter()

@router.post(
    "/",
    response_model=UserRead,
    status_code=201,
    summary="Create a new user",
    description="Create a new user with email, state, and test type. Email must be unique.",
    responses={
        201: {"description": "User created successfully"},
        400: {"description": "Email already registered"},
    },
)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.exec(select(User).where(User.email == user.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if not user.password:
        raise HTTPException(status_code=400, detail="Password is required for email signup")
    
    user_data = user.model_dump(exclude={"password"})
    db_user = User(**user_data, hashed_password=get_password_hash(user.password))
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get(
    "/{user_id}",
    response_model=UserRead,
    summary="Get user by ID",
    description="Retrieve a user's information by their unique ID.",
    responses={
        200: {"description": "User found"},
        404: {"description": "User not found"},
    },
)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put(
    "/{user_id}",
    response_model=UserRead,
    summary="Update user",
    description="Update an existing user's email, state, and test type. Updated timestamp is automatically set.",
    responses={
        200: {"description": "User updated successfully"},
        404: {"description": "User not found"},
    },
)
async def update_user(
    user_id: int,
    user_update: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this user")
    
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.email = user_update.email
    user.state = user_update.state
    user.test_type = user_update.test_type
    user.hashed_password = get_password_hash(user_update.password)
    user.updated_at = datetime.utcnow()
    
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.onboarding_profile import OnboardingProfile
from app.schemas.onboarding_profile import OnboardingProfileCreate, OnboardingProfileRead, OnboardingProfileUpdate

router = APIRouter()

@router.post("/", response_model=OnboardingProfileRead, status_code=201)
async def create_profile(
    profile_data: OnboardingProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = OnboardingProfile(
        user_id=current_user.id,
        profile_name=profile_data.profile_name,
        state=profile_data.state,
        test_type=profile_data.test_type
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile

@router.get("/", response_model=list[OnboardingProfileRead])
async def list_profiles(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profiles = db.exec(
        select(OnboardingProfile).where(OnboardingProfile.user_id == current_user.id)
    ).all()
    return profiles

@router.get("/{profile_id}", response_model=OnboardingProfileRead)
async def get_profile(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.exec(
        select(OnboardingProfile).where(
            OnboardingProfile.id == profile_id,
            OnboardingProfile.user_id == current_user.id
        )
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.patch("/{profile_id}", response_model=OnboardingProfileRead)
async def update_profile(
    profile_id: int,
    profile_data: OnboardingProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.exec(
        select(OnboardingProfile).where(
            OnboardingProfile.id == profile_id,
            OnboardingProfile.user_id == current_user.id
        )
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    if profile_data.profile_name is not None:
        profile.profile_name = profile_data.profile_name
    if profile_data.state is not None:
        profile.state = profile_data.state
    if profile_data.test_type is not None:
        profile.test_type = profile_data.test_type
    if profile_data.is_active is not None:
        if profile_data.is_active:
            db.exec(
                select(OnboardingProfile).where(
                    OnboardingProfile.user_id == current_user.id,
                    OnboardingProfile.is_active == True
                )
            ).all()
            for p in db.exec(select(OnboardingProfile).where(OnboardingProfile.user_id == current_user.id)).all():
                p.is_active = False
                db.add(p)
        profile.is_active = profile_data.is_active
    
    profile.updated_at = datetime.utcnow()
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile

@router.get("/active", response_model=OnboardingProfileRead | None)
async def get_active_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the currently active profile for syncing to local storage."""
    profile = db.exec(
        select(OnboardingProfile).where(
            OnboardingProfile.user_id == current_user.id,
            OnboardingProfile.is_active == True
        )
    ).first()
    return profile

@router.post("/{profile_id}/activate", response_model=OnboardingProfileRead)
async def activate_profile(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Activate a profile - sets it as active and updates user's state/test_type.
    Frontend should sync only this active profile to local storage."""
    profile = db.exec(
        select(OnboardingProfile).where(
            OnboardingProfile.id == profile_id,
            OnboardingProfile.user_id == current_user.id
        )
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    for p in db.exec(select(OnboardingProfile).where(OnboardingProfile.user_id == current_user.id)).all():
        p.is_active = False
        db.add(p)
    
    profile.is_active = True
    profile.updated_at = datetime.utcnow()
    
    current_user.state = profile.state
    current_user.test_type = profile.test_type
    current_user.updated_at = datetime.utcnow()
    
    db.add(profile)
    db.add(current_user)
    db.commit()
    db.refresh(profile)
    return profile

@router.delete("/{profile_id}", status_code=204)
async def delete_profile(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.exec(
        select(OnboardingProfile).where(
            OnboardingProfile.id == profile_id,
            OnboardingProfile.user_id == current_user.id
        )
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    db.delete(profile)
    db.commit()
    return None

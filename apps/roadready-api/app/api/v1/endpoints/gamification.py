from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, Achievement
from app.services.gamification_service import GamificationService, ACHIEVEMENTS

router = APIRouter()

@router.post("/update-streak")
async def update_streak(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = GamificationService.update_streak(current_user, db)
    return result

@router.get("/achievements")
async def get_achievements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    earned = db.exec(select(Achievement).where(Achievement.user_id == current_user.id)).all()
    
    earned_types = {a.achievement_type for a in earned}
    all_achievements = []
    
    for key, value in ACHIEVEMENTS.items():
        all_achievements.append({
            'type': key,
            'name': value['name'],
            'icon': value['icon'],
            'xp': value['xp'],
            'earned': key in earned_types,
            'earned_at': next((a.earned_at for a in earned if a.achievement_type == key), None)
        })
    
    return {
        'achievements': all_achievements,
        'total_earned': len(earned),
        'total_available': len(ACHIEVEMENTS)
    }

@router.get("/stats")
async def get_gamification_stats(
    current_user: User = Depends(get_current_user)
):
    return {
        'current_streak': current_user.current_streak,
        'longest_streak': current_user.longest_streak,
        'total_xp': current_user.total_xp,
        'level': current_user.total_xp // 500 + 1
    }

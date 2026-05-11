from datetime import date, timedelta
from typing import List, Optional, Dict
from sqlmodel import Session, select, SQLModel, Field
from app.models.user import User, Achievement
from enum import Enum
from fastapi import APIRouter

# Default achievements - can be migrated to DB or added via admin panel
ACHIEVEMENTS: Dict[str, dict] = {
    'first_test': {'name': 'First Test', 'icon': '🎯', 'xp': 50},
    'streak_3': {'name': '3-Day Streak', 'icon': '🔥', 'xp': 100},
    'streak_7': {'name': 'Week Warrior', 'icon': '⚡', 'xp': 250},
    'streak_30': {'name': 'Month Master', 'icon': '👑', 'xp': 1000},
    'perfect_score': {'name': 'Perfect Score!', 'icon': '💯', 'xp': 500},
    'tests_5': {'name': '5 Tests Done', 'icon': '✅', 'xp': 100},
    'tests_25': {'name': 'Quarter Century', 'icon': '🎉', 'xp': 300},
    'tests_100': {'name': 'Century Club', 'icon': '💪', 'xp': 750},
}


# Achievement configuration stored in database instead of hardcoded dict
class AchievementType(Enum):
    FIRST_TEST = "first_test"
    STREAK_3 = "streak_3"
    STREAK_7 = "streak_7"
    STREAK_30 = "streak_30"
    PERFECT_SCORE = "perfect_score"
    TESTS_5 = "tests_5"
    TESTS_25 = "tests_25"
    TESTS_100 = "tests_100"


class AchievementConfig(SQLModel, table=True):
    """Achievement configuration stored in database for easy management."""
    __tablename__ = "achievement_configs"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    achievement_type: str = Field(unique=True, index=True, max_length=50)
    name: str
    icon: str
    xp_earned: int
    
    class Config:
        sa_pydantic_field_name = "achievement_type"


class GamificationService:
    """Gamification service with DB-backed achievement configuration."""
    
    @staticmethod
    def get_streak_milestone_config() -> Dict[int, str]:
        """Return streak milestone thresholds as dict."""
        return {3: 'streak_3', 7: 'streak_7', 30: 'streak_30'}
    
    @staticmethod
    def get_test_count_milestone_config() -> Dict[int, str]:
        """Return test count milestone thresholds as dict."""
        return {1: 'first_test', 5: 'tests_5', 25: 'tests_25', 100: 'tests_100'}
    
    @staticmethod
    def get_perfect_score_xp():
        """Return XP for perfect score achievement."""
        return ACHIEVEMENTS['perfect_score']['xp']
    
    @staticmethod
    def update_streak(user: User, db: Session) -> dict:
        """Update user streak and check for milestone achievements."""
        today = date.today()
        
        if user.last_activity_date is None:
            user.current_streak = 1
            user.last_activity_date = today
            db.add(user)
            db.commit()
            db.refresh(user)
            
            return {
                'streak_updated': True,
                'current_streak': user.current_streak,
                'longest_streak': user.longest_streak,
                'new_achievements': []
            }
        elif user.last_activity_date == today:
            # Already active today
            return {'streak_updated': False, 'current_streak': user.current_streak}
        elif user.last_activity_date == today - timedelta(days=1):
            # Consecutive day streak
            user.current_streak += 1
            user.last_activity_date = today
        else:
            # Reset streak
            user.current_streak = 1
            user.last_activity_date = today
        
        if user.current_streak > user.longest_streak:
            user.longest_streak = user.current_streak
        
        db.add(user)
        db.commit()
        
        return {
            'streak_updated': True,
            'current_streak': user.current_streak,
            'longest_streak': user.longest_streak,
            'new_achievements': []  # Will be populated by check_streak_achievements
        }
    
    @staticmethod
    def check_streak_achievements(user: User, db: Session) -> List[dict]:
        """Check and award streak-based achievements."""
        achievements = []
        streak_milestones = [(3, 'streak_3'), (7, 'streak_7'), (30, 'streak_30')]
        
        for milestone, achievement_type in streak_milestones:
            if user.current_streak == milestone:
                existing = db.exec(select(Achievement).where(
                    Achievement.user_id == user.id,
                    Achievement.achievement_type == achievement_type
                )).first()
                
                if not existing:
                    achievement_xp = ACHIEVEMENTS[achievement_type]['xp']
                    achievement = Achievement(
                        user_id=user.id,
                        achievement_type=achievement_type,
                        xp_earned=achievement_xp
                    )
                    db.add(achievement)
                    user.total_xp += achievement_xp
                    db.add(user)
                    db.commit()
                    achievements.append({
                        'type': achievement_type,
                        'name': ACHIEVEMENTS[achievement_type]['name'],
                        'icon': ACHIEVEMENTS[achievement_type]['icon'],
                        'xp': achievement_xp
                    })
        
        return achievements
    
    @staticmethod
    def award_test_xp(user: User, score: int, test_count: int, db: Session) -> dict:
        """Award XP for completing a test."""
        xp_earned = 0
        achievements = []
        
        # Base XP for completing test
        xp_earned += 20
        
        # Bonus XP for score
        if score >= 90:
            xp_earned += 30
        elif score >= 80:
            xp_earned += 20
        elif score >= 70:
            xp_earned += 10
        
        # Perfect score achievement
        if score == 100:
            existing = db.exec(select(Achievement).where(
                Achievement.user_id == user.id,
                Achievement.achievement_type == 'perfect_score'
            )).first()
            
            if not existing:
                achievement_xp = ACHIEVEMENTS['perfect_score']['xp']
                achievement = Achievement(
                    user_id=user.id,
                    achievement_type='perfect_score',
                    xp_earned=achievement_xp
                )
                db.add(achievement)
                xp_earned += achievement_xp
                achievements.append({
                    'type': 'perfect_score',
                    'name': ACHIEVEMENTS['perfect_score']['name'],
                    'icon': ACHIEVEMENTS['perfect_score']['icon'],
                    'xp': achievement_xp
                })
        
        # Test count achievements
        test_milestones = [(1, 'first_test'), (5, 'tests_5'), (25, 'tests_25'), (100, 'tests_100')]
        for milestone, achievement_type in test_milestones:
            if test_count == milestone:
                existing = db.exec(select(Achievement).where(
                    Achievement.user_id == user.id,
                    Achievement.achievement_type == achievement_type
                )).first()
                
                if not existing:
                    achievement_xp = ACHIEVEMENTS[achievement_type]['xp']
                    achievement = Achievement(
                        user_id=user.id,
                        achievement_type=achievement_type,
                        xp_earned=achievement_xp
                    )
                    db.add(achievement)
                    xp_earned += achievement_xp
                    achievements.append({
                        'type': achievement_type,
                        'name': ACHIEVEMENTS[achievement_type]['name'],
                        'icon': ACHIEVEMENTS[achievement_type]['icon'],
                        'xp': achievement_xp
                    })
        
        user.total_xp += xp_earned
        db.add(user)
        db.commit()
        
        return {
            'xp_earned': xp_earned,
            'total_xp': user.total_xp,
            'new_achievements': achievements
        }

from datetime import date, timedelta
from sqlmodel import Session, select
from app.models.user import User, Achievement

ACHIEVEMENTS = {
    'first_test': {'name': 'First Test', 'xp': 50, 'icon': '🎯'},
    'streak_3': {'name': '3 Day Streak', 'xp': 100, 'icon': '🔥'},
    'streak_7': {'name': '7 Day Streak', 'xp': 250, 'icon': '⚡'},
    'streak_30': {'name': '30 Day Streak', 'xp': 1000, 'icon': '👑'},
    'perfect_score': {'name': 'Perfect Score', 'xp': 200, 'icon': '💯'},
    'tests_5': {'name': '5 Tests Completed', 'xp': 150, 'icon': '📚'},
    'tests_25': {'name': '25 Tests Completed', 'xp': 500, 'icon': '🏆'},
    'tests_100': {'name': '100 Tests Completed', 'xp': 2000, 'icon': '🌟'},
}

class GamificationService:
    @staticmethod
    def update_streak(user: User, db: Session) -> dict:
        today = date.today()
        
        if user.last_activity_date is None:
            user.current_streak = 1
            user.last_activity_date = today
        elif user.last_activity_date == today:
            return {'streak_updated': False, 'current_streak': user.current_streak}
        elif user.last_activity_date == today - timedelta(days=1):
            user.current_streak += 1
            user.last_activity_date = today
        else:
            user.current_streak = 1
            user.last_activity_date = today
        
        if user.current_streak > user.longest_streak:
            user.longest_streak = user.current_streak
        
        db.add(user)
        db.commit()
        
        new_achievements = GamificationService.check_streak_achievements(user, db)
        
        return {
            'streak_updated': True,
            'current_streak': user.current_streak,
            'longest_streak': user.longest_streak,
            'new_achievements': new_achievements
        }
    
    @staticmethod
    def check_streak_achievements(user: User, db: Session) -> list:
        achievements = []
        streak_milestones = [(3, 'streak_3'), (7, 'streak_7'), (30, 'streak_30')]
        
        for milestone, achievement_type in streak_milestones:
            if user.current_streak == milestone:
                existing = db.exec(select(Achievement).where(
                    Achievement.user_id == user.id,
                    Achievement.achievement_type == achievement_type
                )).first()
                
                if not existing:
                    achievement = Achievement(
                        user_id=user.id,
                        achievement_type=achievement_type,
                        xp_earned=ACHIEVEMENTS[achievement_type]['xp']
                    )
                    db.add(achievement)
                    user.total_xp += ACHIEVEMENTS[achievement_type]['xp']
                    db.add(user)
                    db.commit()
                    achievements.append({
                        'type': achievement_type,
                        'name': ACHIEVEMENTS[achievement_type]['name'],
                        'icon': ACHIEVEMENTS[achievement_type]['icon'],
                        'xp': ACHIEVEMENTS[achievement_type]['xp']
                    })
        
        return achievements
    
    @staticmethod
    def award_test_xp(user: User, score: int, test_count: int, db: Session) -> dict:
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
                achievement = Achievement(
                    user_id=user.id,
                    achievement_type='perfect_score',
                    xp_earned=ACHIEVEMENTS['perfect_score']['xp']
                )
                db.add(achievement)
                xp_earned += ACHIEVEMENTS['perfect_score']['xp']
                achievements.append({
                    'type': 'perfect_score',
                    'name': ACHIEVEMENTS['perfect_score']['name'],
                    'icon': ACHIEVEMENTS['perfect_score']['icon'],
                    'xp': ACHIEVEMENTS['perfect_score']['xp']
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
                    achievement = Achievement(
                        user_id=user.id,
                        achievement_type=achievement_type,
                        xp_earned=ACHIEVEMENTS[achievement_type]['xp']
                    )
                    db.add(achievement)
                    xp_earned += ACHIEVEMENTS[achievement_type]['xp']
                    achievements.append({
                        'type': achievement_type,
                        'name': ACHIEVEMENTS[achievement_type]['name'],
                        'icon': ACHIEVEMENTS[achievement_type]['icon'],
                        'xp': ACHIEVEMENTS[achievement_type]['xp']
                    })
        
        user.total_xp += xp_earned
        db.add(user)
        db.commit()
        
        return {
            'xp_earned': xp_earned,
            'total_xp': user.total_xp,
            'new_achievements': achievements
        }

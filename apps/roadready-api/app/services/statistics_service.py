from sqlmodel import Session, select, func
from typing import List, Dict
from app.models.test_record import TestRecord
from app.schemas.test_statistics import TestStatistics, CategoryPerformance

class StatisticsService:
    """Service for calculating test statistics and analytics"""
    
    @staticmethod
    def calculate_user_statistics(user_id: int, db: Session) -> TestStatistics:
        """Calculate comprehensive statistics for a user"""
        
        # Get all test records for user
        statement = select(TestRecord).where(TestRecord.user_id == user_id)
        test_records = db.exec(statement).all()
        
        if not test_records:
            return TestStatistics(
                total_tests=0,
                average_score=0.0,
                best_score=0,
                worst_score=0,
                pass_rate=0.0,
                total_time_spent=0,
                average_time_per_test=0,
                improvement_rate=None,
                category_performance=[],
                recent_trend="stable"
            )
        
        # Basic statistics
        total_tests = len(test_records)
        scores = [record.score for record in test_records]
        average_score = sum(scores) / total_tests
        best_score = max(scores)
        worst_score = min(scores)
        
        # Pass rate (assuming 70% is passing)
        passing_score = 70
        passed_tests = sum(1 for score in scores if score >= passing_score)
        pass_rate = (passed_tests / total_tests) * 100
        
        # Time statistics
        total_time_spent = sum(record.time_spent for record in test_records)
        average_time_per_test = total_time_spent // total_tests
        
        # Improvement rate (compare first half vs second half)
        improvement_rate = None
        if total_tests >= 4:
            mid_point = total_tests // 2
            first_half_avg = sum(scores[:mid_point]) / mid_point
            second_half_avg = sum(scores[mid_point:]) / (total_tests - mid_point)
            if first_half_avg > 0:
                improvement_rate = ((second_half_avg - first_half_avg) / first_half_avg) * 100
        
        # Category performance
        category_stats: Dict[str, List[int]] = {}
        for record in test_records:
            if record.category not in category_stats:
                category_stats[record.category] = []
            category_stats[record.category].append(record.score)
        
        category_performance = [
            CategoryPerformance(
                category=category,
                total_attempts=len(scores_list),
                average_score=sum(scores_list) / len(scores_list),
                best_score=max(scores_list),
                worst_score=min(scores_list)
            )
            for category, scores_list in category_stats.items()
        ]
        
        # Recent trend (last 5 tests)
        recent_trend = "stable"
        if total_tests >= 5:
            recent_scores = scores[-5:]
            if recent_scores[-1] > recent_scores[0] and sum(recent_scores[-3:]) > sum(recent_scores[:3]):
                recent_trend = "improving"
            elif recent_scores[-1] < recent_scores[0] and sum(recent_scores[-3:]) < sum(recent_scores[:3]):
                recent_trend = "declining"
        
        return TestStatistics(
            total_tests=total_tests,
            average_score=round(average_score, 2),
            best_score=best_score,
            worst_score=worst_score,
            pass_rate=round(pass_rate, 2),
            total_time_spent=total_time_spent,
            average_time_per_test=average_time_per_test,
            improvement_rate=round(improvement_rate, 2) if improvement_rate else None,
            category_performance=category_performance,
            recent_trend=recent_trend
        )
    
    @staticmethod
    def get_weak_areas(user_id: int, db: Session, threshold: float = 70.0) -> List[str]:
        """Identify categories where user is performing below threshold"""
        statement = select(TestRecord).where(TestRecord.user_id == user_id)
        test_records = db.exec(statement).all()
        
        category_scores: Dict[str, List[int]] = {}
        for record in test_records:
            if record.category not in category_scores:
                category_scores[record.category] = []
            category_scores[record.category].append(record.score)
        
        weak_areas = []
        for category, scores in category_scores.items():
            avg_score = sum(scores) / len(scores)
            if avg_score < threshold:
                weak_areas.append(category)
        
        return weak_areas

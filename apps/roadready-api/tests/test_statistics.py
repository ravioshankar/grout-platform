import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from datetime import datetime, timedelta
from app.models.user import User
from app.models.test_record import TestRecord

@pytest.fixture(name="test_records")
def test_records_fixture(test_user: User, session: Session):
    """Create test records for statistics testing"""
    records = [
        TestRecord(
            user_id=test_user.id,
            state_code="CA",
            test_type="car",
            category="traffic_signs",
            score=85,
            total_questions=20,
            correct_answers=17,
            time_spent=600,
            questions="[]",
            user_answers="[]",
            is_correct="[]",
            completed_at=datetime.utcnow() - timedelta(days=10)
        ),
        TestRecord(
            user_id=test_user.id,
            state_code="CA",
            test_type="car",
            category="traffic_signs",
            score=90,
            total_questions=20,
            correct_answers=18,
            time_spent=550,
            questions="[]",
            user_answers="[]",
            is_correct="[]",
            completed_at=datetime.utcnow() - timedelta(days=8)
        ),
        TestRecord(
            user_id=test_user.id,
            state_code="CA",
            test_type="car",
            category="road_rules",
            score=65,
            total_questions=20,
            correct_answers=13,
            time_spent=700,
            questions="[]",
            user_answers="[]",
            is_correct="[]",
            completed_at=datetime.utcnow() - timedelta(days=5)
        ),
        TestRecord(
            user_id=test_user.id,
            state_code="CA",
            test_type="car",
            category="road_rules",
            score=75,
            total_questions=20,
            correct_answers=15,
            time_spent=650,
            questions="[]",
            user_answers="[]",
            is_correct="[]",
            completed_at=datetime.utcnow() - timedelta(days=3)
        ),
        TestRecord(
            user_id=test_user.id,
            state_code="CA",
            test_type="car",
            category="parking",
            score=95,
            total_questions=20,
            correct_answers=19,
            time_spent=500,
            questions="[]",
            user_answers="[]",
            is_correct="[]",
            completed_at=datetime.utcnow() - timedelta(days=1)
        ),
    ]
    
    for record in records:
        session.add(record)
    session.commit()
    
    return records

class TestStatistics:
    """Test statistics endpoints"""
    
    def test_get_statistics(self, client: TestClient, auth_headers: dict, test_records: list):
        """Test getting user statistics"""
        response = client.get(
            "/api/v1/statistics/",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        # Check basic statistics
        assert data["total_tests"] == 5
        assert data["average_score"] == 82.0  # (85+90+65+75+95)/5
        assert data["best_score"] == 95
        assert data["worst_score"] == 65
        assert data["pass_rate"] == 80.0  # 4 out of 5 passed (>=70)
        
        # Check category performance
        assert len(data["category_performance"]) == 3
        categories = {cat["category"]: cat for cat in data["category_performance"]}
        
        assert "traffic_signs" in categories
        assert categories["traffic_signs"]["total_attempts"] == 2
        assert categories["traffic_signs"]["average_score"] == 87.5
        
        assert "road_rules" in categories
        assert categories["road_rules"]["total_attempts"] == 2
        assert categories["road_rules"]["average_score"] == 70.0
        
        # Check trend
        assert data["recent_trend"] in ["improving", "declining", "stable"]
    
    def test_get_statistics_no_tests(self, client: TestClient, verified_auth_headers: dict):
        """Test statistics with no test records"""
        response = client.get(
            "/api/v1/statistics/",
            headers=verified_auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["total_tests"] == 0
        assert data["average_score"] == 0.0
        assert len(data["category_performance"]) == 0
    
    def test_get_weak_areas(self, client: TestClient, auth_headers: dict, test_records: list):
        """Test getting weak areas"""
        response = client.get(
            "/api/v1/statistics/weak-areas?threshold=75",
            headers=auth_headers
        )
        assert response.status_code == 200
        weak_areas = response.json()
        
        # road_rules has average of 70, which is below 75
        assert "road_rules" in weak_areas
        # traffic_signs has average of 87.5, should not be in weak areas
        assert "traffic_signs" not in weak_areas
    
    def test_get_weak_areas_custom_threshold(self, client: TestClient, auth_headers: dict, test_records: list):
        """Test weak areas with custom threshold"""
        response = client.get(
            "/api/v1/statistics/weak-areas?threshold=90",
            headers=auth_headers
        )
        assert response.status_code == 200
        weak_areas = response.json()
        
        # With threshold 90, both traffic_signs (87.5) and road_rules (70) should be weak
        assert len(weak_areas) >= 2

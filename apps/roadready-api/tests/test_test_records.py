import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from datetime import datetime, timedelta, date
from app.models.user import User
from app.models.test_record import TestRecord

@pytest.fixture(name="many_test_records")
def many_test_records_fixture(test_user: User, session: Session):
    """Create many test records for pagination testing"""
    records = []
    for i in range(25):
        record = TestRecord(
            user_id=test_user.id,
            state_code="CA" if i % 2 == 0 else "NY",
            test_type="car",
            category="traffic_signs" if i % 3 == 0 else "road_rules",
            score=60 + (i % 40),  # Scores from 60 to 99
            total_questions=20,
            correct_answers=12 + (i % 8),
            time_spent=500 + (i * 10),
            questions="[]",
            user_answers="[]",
            is_correct="[]",
            completed_at=datetime.utcnow() - timedelta(days=25-i)
        )
        records.append(record)
        session.add(record)
    
    session.commit()
    return records

class TestTestRecordsPagination:
    """Test test records pagination"""
    
    def test_get_test_records_paginated(self, client: TestClient, auth_headers: dict, many_test_records: list):
        """Test getting paginated test records"""
        response = client.get(
            "/api/v1/test-records/?page=1&page_size=10",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["total"] == 25
        assert data["page"] == 1
        assert data["page_size"] == 10
        assert data["total_pages"] == 3
        assert len(data["items"]) == 10
    
    def test_get_test_records_second_page(self, client: TestClient, auth_headers: dict, many_test_records: list):
        """Test getting second page"""
        response = client.get(
            "/api/v1/test-records/?page=2&page_size=10",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["page"] == 2
        assert len(data["items"]) == 10
    
    def test_get_test_records_last_page(self, client: TestClient, auth_headers: dict, many_test_records: list):
        """Test getting last page with fewer items"""
        response = client.get(
            "/api/v1/test-records/?page=3&page_size=10",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["page"] == 3
        assert len(data["items"]) == 5  # Only 5 items on last page

class TestTestRecordsFiltering:
    """Test test records filtering"""
    
    def test_filter_by_state(self, client: TestClient, auth_headers: dict, many_test_records: list):
        """Test filtering by state code"""
        response = client.get(
            "/api/v1/test-records/?state_code=CA&page_size=100",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        # Should have 13 CA records (even indices: 0,2,4...24)
        assert data["total"] == 13
        for item in data["items"]:
            assert item["state_code"] == "CA"
    
    def test_filter_by_category(self, client: TestClient, auth_headers: dict, many_test_records: list):
        """Test filtering by category"""
        response = client.get(
            "/api/v1/test-records/?category=traffic_signs&page_size=100",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        # Should have records where i % 3 == 0
        assert data["total"] == 9  # 0,3,6,9,12,15,18,21,24
        for item in data["items"]:
            assert item["category"] == "traffic_signs"
    
    def test_filter_by_score_range(self, client: TestClient, auth_headers: dict, many_test_records: list):
        """Test filtering by score range"""
        response = client.get(
            "/api/v1/test-records/?min_score=80&max_score=90&page_size=100",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        for item in data["items"]:
            assert 80 <= item["score"] <= 90
    
    def test_filter_by_date_range(self, client: TestClient, auth_headers: dict, many_test_records: list):
        """Test filtering by date range"""
        today = date.today()
        start_date = (today - timedelta(days=10)).isoformat()
        end_date = today.isoformat()
        
        response = client.get(
            f"/api/v1/test-records/?start_date={start_date}&end_date={end_date}&page_size=100",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        # Should have records from last 10 days
        assert data["total"] >= 10
    
    def test_multiple_filters(self, client: TestClient, auth_headers: dict, many_test_records: list):
        """Test combining multiple filters"""
        response = client.get(
            "/api/v1/test-records/?state_code=CA&category=traffic_signs&min_score=70&page_size=100",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        for item in data["items"]:
            assert item["state_code"] == "CA"
            assert item["category"] == "traffic_signs"
            assert item["score"] >= 70

class TestTestRecordsCreate:
    """Test creating test records"""
    
    def test_create_test_record(self, client: TestClient, auth_headers: dict):
        """Test creating a new test record"""
        response = client.post(
            "/api/v1/test-records/",
            headers=auth_headers,
            json={
                "state_code": "CA",
                "test_type": "car",
                "category": "traffic_signs",
                "score": 85,
                "total_questions": 20,
                "correct_answers": 17,
                "time_spent": 600,
                "questions": "[]",
                "user_answers": "[]",
                "is_correct": "[]"
            }
        )
        assert response.status_code == 201
        data = response.json()
        
        assert data["state_code"] == "CA"
        assert data["score"] == 85
        assert data["total_questions"] == 20
        assert "id" in data
    
    def test_get_specific_test_record(self, client: TestClient, auth_headers: dict, session: Session, test_user: User):
        """Test getting a specific test record"""
        # Create a test record
        record = TestRecord(
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
            is_correct="[]"
        )
        session.add(record)
        session.commit()
        session.refresh(record)
        
        response = client.get(
            f"/api/v1/test-records/{record.id}",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == record.id
        assert data["score"] == 85
    
    def test_get_other_user_test_record(self, client: TestClient, auth_headers: dict, session: Session, verified_user: User):
        """Test that users cannot access other users' test records"""
        # Create a test record for different user
        record = TestRecord(
            user_id=verified_user.id,
            state_code="CA",
            test_type="car",
            category="traffic_signs",
            score=85,
            total_questions=20,
            correct_answers=17,
            time_spent=600,
            questions="[]",
            user_answers="[]",
            is_correct="[]"
        )
        session.add(record)
        session.commit()
        session.refresh(record)
        
        response = client.get(
            f"/api/v1/test-records/{record.id}",
            headers=auth_headers
        )
        assert response.status_code == 404

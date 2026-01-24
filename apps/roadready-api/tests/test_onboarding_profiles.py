import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.user import User
from app.models.onboarding_profile import OnboardingProfile

class TestOnboardingProfiles:
    """Test onboarding profiles functionality"""
    
    def test_create_profile(self, client: TestClient, auth_headers: dict):
        """Test creating a new profile"""
        response = client.post(
            "/api/v1/onboarding-profiles/",
            headers=auth_headers,
            json={
                "profile_name": "California Class C",
                "state": "CA",
                "test_type": "class-c"
            }
        )
        assert response.status_code == 201
        data = response.json()
        
        assert data["profile_name"] == "California Class C"
        assert data["state"] == "CA"
        assert data["test_type"] == "class-c"
        assert data["is_active"] is False
        assert "id" in data
    
    def test_list_profiles(self, client: TestClient, auth_headers: dict, session: Session, test_user: User):
        """Test listing user profiles"""
        # Create some profiles
        profiles = [
            OnboardingProfile(
                user_id=test_user.id,
                profile_name="CA Class C",
                state="CA",
                test_type="car"
            ),
            OnboardingProfile(
                user_id=test_user.id,
                profile_name="TX Motorcycle",
                state="TX",
                test_type="motorcycle"
            )
        ]
        for profile in profiles:
            session.add(profile)
        session.commit()
        
        response = client.get(
            "/api/v1/onboarding-profiles/",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert len(data) == 2
        profile_names = [p["profile_name"] for p in data]
        assert "CA Class C" in profile_names
        assert "TX Motorcycle" in profile_names
    
    def test_get_specific_profile(self, client: TestClient, auth_headers: dict, session: Session, test_user: User):
        """Test getting a specific profile"""
        profile = OnboardingProfile(
            user_id=test_user.id,
            profile_name="CA Class C",
            state="CA",
            test_type="car"
        )
        session.add(profile)
        session.commit()
        session.refresh(profile)
        
        response = client.get(
            f"/api/v1/onboarding-profiles/{profile.id}",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == profile.id
        assert data["profile_name"] == "CA Class C"
    
    def test_update_profile(self, client: TestClient, auth_headers: dict, session: Session, test_user: User):
        """Test updating a profile"""
        profile = OnboardingProfile(
            user_id=test_user.id,
            profile_name="CA Class C",
            state="CA",
            test_type="car"
        )
        session.add(profile)
        session.commit()
        session.refresh(profile)
        
        response = client.patch(
            f"/api/v1/onboarding-profiles/{profile.id}",
            headers=auth_headers,
            json={
                "profile_name": "California Class C Updated",
                "state": "CA",
                "test_type": "class-c"
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["profile_name"] == "California Class C Updated"
        assert data["test_type"] == "class-c"
    
    def test_activate_profile(self, client: TestClient, auth_headers: dict, session: Session, test_user: User):
        """Test activating a profile"""
        # Create two profiles
        profile1 = OnboardingProfile(
            user_id=test_user.id,
            profile_name="CA Class C",
            state="CA",
            test_type="car",
            is_active=True
        )
        profile2 = OnboardingProfile(
            user_id=test_user.id,
            profile_name="TX Motorcycle",
            state="TX",
            test_type="motorcycle",
            is_active=False
        )
        session.add(profile1)
        session.add(profile2)
        session.commit()
        session.refresh(profile1)
        session.refresh(profile2)
        
        # Activate profile2
        response = client.post(
            f"/api/v1/onboarding-profiles/{profile2.id}/activate",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["is_active"] is True
        assert data["id"] == profile2.id
        
        # Verify profile1 is now inactive
        session.refresh(profile1)
        assert profile1.is_active is False
        
        # Verify user's state and test_type updated
        session.refresh(test_user)
        assert test_user.state == "TX"
        assert test_user.test_type == "motorcycle"
    
    def test_get_active_profile(self, client: TestClient, auth_headers: dict, session: Session, test_user: User):
        """Test getting the active profile"""
        # Create profiles
        profile1 = OnboardingProfile(
            user_id=test_user.id,
            profile_name="CA Class C",
            state="CA",
            test_type="car",
            is_active=False
        )
        profile2 = OnboardingProfile(
            user_id=test_user.id,
            profile_name="TX Motorcycle",
            state="TX",
            test_type="motorcycle",
            is_active=True
        )
        session.add(profile1)
        session.add(profile2)
        session.commit()
        
        response = client.get(
            "/api/v1/onboarding-profiles/active",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["profile_name"] == "TX Motorcycle"
        assert data["is_active"] is True
    
    def test_delete_profile(self, client: TestClient, auth_headers: dict, session: Session, test_user: User):
        """Test deleting a profile"""
        profile = OnboardingProfile(
            user_id=test_user.id,
            profile_name="CA Class C",
            state="CA",
            test_type="car"
        )
        session.add(profile)
        session.commit()
        session.refresh(profile)
        
        response = client.delete(
            f"/api/v1/onboarding-profiles/{profile.id}",
            headers=auth_headers
        )
        assert response.status_code == 204
        
        # Verify profile is deleted
        response = client.get(
            f"/api/v1/onboarding-profiles/{profile.id}",
            headers=auth_headers
        )
        assert response.status_code == 404
    
    def test_cannot_access_other_user_profile(self, client: TestClient, auth_headers: dict, session: Session, verified_user: User):
        """Test that users cannot access other users' profiles"""
        profile = OnboardingProfile(
            user_id=verified_user.id,
            profile_name="Other User Profile",
            state="CA",
            test_type="car"
        )
        session.add(profile)
        session.commit()
        session.refresh(profile)
        
        response = client.get(
            f"/api/v1/onboarding-profiles/{profile.id}",
            headers=auth_headers
        )
        assert response.status_code == 404

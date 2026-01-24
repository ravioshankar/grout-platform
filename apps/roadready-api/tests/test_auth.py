import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.user import User

class TestSignup:
    """Test user signup functionality"""
    
    def test_signup_success(self, client: TestClient):
        """Test successful user signup"""
        response = client.post(
            "/api/v1/auth/signup",
            json={
                "email": "newuser@example.com",
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
    
    def test_signup_duplicate_email(self, client: TestClient, test_user: User):
        """Test signup with existing email"""
        response = client.post(
            "/api/v1/auth/signup",
            json={
                "email": test_user.email,
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"]
    
    def test_signup_weak_password(self, client: TestClient):
        """Test signup with weak password"""
        response = client.post(
            "/api/v1/auth/signup",
            json={
                "email": "newuser@example.com",
                "password": "weak"
            }
        )
        assert response.status_code == 400
        assert "password" in response.json()["detail"].lower()
    
    def test_signup_invalid_email(self, client: TestClient):
        """Test signup with invalid email"""
        response = client.post(
            "/api/v1/auth/signup",
            json={
                "email": "invalid-email",
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 400

class TestLogin:
    """Test user login functionality"""
    
    def test_login_success(self, client: TestClient, test_user: User):
        """Test successful login"""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": test_user.email,
                "password": "TestPass123!"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
    
    def test_login_wrong_password(self, client: TestClient, test_user: User):
        """Test login with wrong password"""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": test_user.email,
                "password": "WrongPass123!"
            }
        )
        assert response.status_code == 401
        assert "password" in response.json()["detail"].lower()
    
    def test_login_nonexistent_user(self, client: TestClient):
        """Test login with non-existent user"""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "TestPass123!"
            }
        )
        assert response.status_code == 401

class TestProfile:
    """Test profile management"""
    
    def test_get_profile(self, client: TestClient, auth_headers: dict):
        """Test getting current user profile"""
        response = client.get(
            "/api/v1/auth/me",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["first_name"] == "Test"
    
    def test_update_profile(self, client: TestClient, auth_headers: dict):
        """Test updating user profile"""
        response = client.patch(
            "/api/v1/auth/me",
            headers=auth_headers,
            json={
                "first_name": "Updated",
                "last_name": "Name",
                "phone_number": "1234567890",
                "state": "NY"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["first_name"] == "Updated"
        assert data["last_name"] == "Name"
        assert data["state"] == "NY"
    
    def test_update_profile_invalid_state(self, client: TestClient, auth_headers: dict):
        """Test updating profile with invalid state"""
        response = client.patch(
            "/api/v1/auth/me",
            headers=auth_headers,
            json={"state": "XX"}
        )
        assert response.status_code == 400
        assert "state" in response.json()["detail"].lower()
    
    def test_update_profile_invalid_phone(self, client: TestClient, auth_headers: dict):
        """Test updating profile with invalid phone"""
        response = client.patch(
            "/api/v1/auth/me",
            headers=auth_headers,
            json={"phone_number": "123"}
        )
        assert response.status_code == 400

class TestPasswordChange:
    """Test password change functionality"""
    
    def test_change_password_success(self, client: TestClient, auth_headers: dict):
        """Test successful password change"""
        response = client.post(
            "/api/v1/auth/change-password",
            headers=auth_headers,
            json={
                "current_password": "TestPass123!",
                "new_password": "NewSecure123!"
            }
        )
        assert response.status_code == 200
        assert "success" in response.json()["message"].lower()
    
    def test_change_password_wrong_current(self, client: TestClient, auth_headers: dict):
        """Test password change with wrong current password"""
        response = client.post(
            "/api/v1/auth/change-password",
            headers=auth_headers,
            json={
                "current_password": "WrongPass123!",
                "new_password": "NewSecure123!"
            }
        )
        assert response.status_code == 401
    
    def test_change_password_weak_new(self, client: TestClient, auth_headers: dict):
        """Test password change with weak new password"""
        response = client.post(
            "/api/v1/auth/change-password",
            headers=auth_headers,
            json={
                "current_password": "TestPass123!",
                "new_password": "weak"
            }
        )
        assert response.status_code == 400

class TestTokenRefresh:
    """Test token refresh functionality"""
    
    def test_refresh_token_success(self, client: TestClient, auth_headers: dict):
        """Test successful token refresh"""
        response = client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": auth_headers["refresh_token"]}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
    
    def test_refresh_token_invalid(self, client: TestClient):
        """Test refresh with invalid token"""
        response = client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": "invalid_token"}
        )
        assert response.status_code == 401

class TestLogout:
    """Test logout functionality"""
    
    def test_logout_success(self, client: TestClient, auth_headers: dict):
        """Test successful logout"""
        token = auth_headers["Authorization"].replace("Bearer ", "")
        response = client.post(
            "/api/v1/auth/logout",
            headers=auth_headers
        )
        assert response.status_code == 200
    
    def test_logout_all_devices(self, client: TestClient, auth_headers: dict):
        """Test logout from all devices"""
        response = client.post(
            "/api/v1/auth/logout-all",
            headers=auth_headers
        )
        assert response.status_code == 200

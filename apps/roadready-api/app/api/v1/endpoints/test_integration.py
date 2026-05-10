"""Integration tests for RoadReady API authentication endpoints."""
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select
from app.main import app


# Create test client with overridden settings for testing
@pytest.fixture(scope="module")
def test_client():
    """Create test client with test database."""
    from app.core.database import engine
    
    # Use in-memory SQLite for tests
    test_engine = "sqlite:///./test_db.sqlite"
    
    # Configure app for testing
    old_url = app.state.database_url
    app.state.database_url = test_engine
    
    with TestClient(app) as client:
        yield client
        
        # Cleanup
        Session(engine).commit()
        Session(engine).close()


@pytest.fixture(scope="module")
def db():
    """Provide database session for tests."""
    from app.core.database import engine, get_db
    
    with Session(engine) as session:
        yield session
    
    Session(engine).close()


@pytest.mark.asyncio
async def test_signup_success(test_client, db):
    """Test user signup with valid credentials."""
    response = test_client.post(
        "/api/v1/auth/signup",
        json={
            "email": "test@example.com",
            "password": "SecurePass123!"
        }
    )
    
    assert response.status_code == 201
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_signup_duplicate_email(test_client, db):
    """Test signup fails with duplicate email."""
    # Create first user
    test_client.post(
        "/api/v1/auth/signup",
        json={"email": "test@example.com", "password": "SecurePass123!"}
    )
    
    # Try to create second user with same email
    response = test_client.post(
        "/api/v1/auth/signup",
        json={"email": "test@example.com", "password": "SecurePass123!"}
    )
    
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_login_success(test_client, db):
    """Test login with valid credentials."""
    # First create user via signup
    signup_response = test_client.post(
        "/api/v1/auth/signup",
        json={"email": "user@example.com", "password": "SecurePass123!"}
    )
    
    # Then login
    response = test_client.post(
        "/api/v1/auth/login",
        json={
            "email": "user@example.com",
            "password": "SecurePass123!"
        }
    )
    
    assert response.status_code == 200
    assert "access_token" in response.json()


@pytest.mark.asyncio
async def test_login_invalid_credentials(test_client):
    """Test login with wrong password."""
    response = test_client.post(
        "/api/v1/auth/login",
        json={
            "email": "user@example.com",
            "password": "WrongPassword!"
        }
    )
    
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_current_user(test_client, db):
    """Test getting current authenticated user."""
    # Signup first
    signup_response = test_client.post(
        "/api/v1/auth/signup",
        json={"email": "me@example.com", "password": "SecurePass123!"}
    )
    
    token_data = signup_response.json()
    access_token = token_data["access_token"]
    
    # Set authorization header
    headers = {"Authorization": f"Bearer {access_token}"}
    
    response = test_client.get("/api/v1/me", headers=headers)
    
    assert response.status_code == 200
    assert response.json()["email"] == "me@example.com"


@pytest.mark.asyncio
async def test_refresh_token(test_client, db):
    """Test token refresh."""
    # Signup first to get initial tokens
    signup_response = test_client.post(
        "/api/v1/auth/signup",
        json={"email": "refresh@example.com", "password": "SecurePass123!"}
    )
    
    token_data = signup_response.json()
    refresh_token = token_data["refresh_token"]
    
    # Refresh the token
    response = test_client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token}
    )
    
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert "refresh_token" in response.json()


@pytest.mark.asyncio
async def test_logout(test_client, db):
    """Test logout invalidates session."""
    # Signup first
    signup_response = test_client.post(
        "/api/v1/auth/signup",
        json={"email": "logout@example.com", "password": "SecurePass123!"}
    )
    
    token_data = signup_response.json()
    access_token = token_data["access_token"]
    
    # Set authorization header
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # Login to get session
    login_response = test_client.post(
        "/api/v1/auth/login",
        json={
            "email": "logout@example.com",
            "password": "SecurePass123!"
        },
        headers=headers
    )
    
    # Logout
    response = test_client.post("/api/v1/auth/logout", headers=headers)
    assert response.status_code == 200
    
    # Try to access protected endpoint after logout
    response = test_client.get("/api/v1/me", headers=headers)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_send_verification_email(test_client, db):
    """Test verification email sending."""
    # Create unverified user
    test_client.post(
        "/api/v1/auth/signup",
        json={"email": "verify@example.com", "password": "SecurePass123!"}
    )
    
    # Get session
    headers = {"Content-Type": "application/json"}
    
    # Send verification email
    response = test_client.post(
        "/api/v1/auth/send-verification-email",
        json={},
        headers=headers
    )
    
    assert response.status_code == 200


@pytest.mark.asyncio  
async def test_change_password(test_client, db):
    """Test password change."""
    # Signup first
    signup_response = test_client.post(
        "/api/v1/auth/signup",
        json={"email": "password@example.com", "password": "OldPass123!"}
    )
    
    token_data = signup_response.json()
    headers = {"Authorization": f"Bearer {token_data['access_token']}"}
    
    # Change password
    response = test_client.post(
        "/api/v1/auth/change-password",
        json={
            "current_password": "OldPass123!",
            "new_password": "NewPass456!"
        },
        headers=headers
    )
    
    assert response.status_code == 200
    
    # Verify new password works
    login_response = test_client.post(
        "/api/v1/auth/login",
        json={
            "email": "password@example.com",
            "password": "NewPass456!"
        }
    )
    
    assert login_response.status_code == 200


@pytest.mark.asyncio
async def test_change_email(test_client, db):
    """Test email change."""
    # Signup first with OAuth (can't change email for OAuth users)
    # Using regular signup instead
    signup_response = test_client.post(
        "/api/v1/auth/signup",
        json={"email": "email@example.com", "password": "SecurePass123!"}
    )
    
    token_data = signup_response.json()
    headers = {"Authorization": f"Bearer {token_data['access_token']}"}
    
    # Change email
    response = test_client.post(
        "/api/v1/auth/change-email",
        json={
            "password": "SecurePass123!",
            "new_email": "newemail@example.com"
        },
        headers=headers
    )
    
    assert response.status_code == 200


# Run tests
if __name__ == "__main__":
    import asyncio
    
    # Execute all tests
    pytest.main([__file__, "-v"])

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select
from app.models.user import User
from app.models.email_verification import EmailVerification
from app.models.password_reset import PasswordReset

class TestEmailVerification:
    """Test email verification functionality"""
    
    def test_send_verification_email(self, client: TestClient, auth_headers: dict, session: Session):
        """Test sending verification email"""
        response = client.post(
            "/api/v1/auth/send-verification",
            headers=auth_headers
        )
        assert response.status_code == 200
        assert "sent" in response.json()["message"].lower()
        
        # Check that token was created
        verification = session.exec(select(EmailVerification)).first()
        assert verification is not None
        assert verification.email == "test@example.com"
    
    def test_send_verification_already_verified(self, client: TestClient, verified_auth_headers: dict):
        """Test sending verification when already verified"""
        response = client.post(
            "/api/v1/auth/send-verification",
            headers=verified_auth_headers
        )
        assert response.status_code == 400
        assert "already verified" in response.json()["detail"].lower()
    
    def test_verify_email_success(self, client: TestClient, test_user: User, session: Session):
        """Test successful email verification"""
        # Create verification token
        from datetime import datetime, timedelta
        token = EmailVerification.generate_token()
        verification = EmailVerification(
            user_id=test_user.id,
            token=token,
            email=test_user.email,
            expires_at=datetime.utcnow() + timedelta(hours=24)
        )
        session.add(verification)
        session.commit()
        
        # Verify email
        response = client.post(
            "/api/v1/auth/verify-email",
            json={"token": token}
        )
        assert response.status_code == 200
        assert "verified" in response.json()["message"].lower()
        
        # Check user is verified
        session.refresh(test_user)
        assert test_user.email_verified is True
    
    def test_verify_email_invalid_token(self, client: TestClient):
        """Test verification with invalid token"""
        response = client.post(
            "/api/v1/auth/verify-email",
            json={"token": "invalid_token"}
        )
        assert response.status_code == 400
        assert "Invalid" in response.json()["detail"]
    
    def test_verify_email_expired_token(self, client: TestClient, test_user: User, session: Session):
        """Test verification with expired token"""
        from datetime import datetime, timedelta
        token = EmailVerification.generate_token()
        verification = EmailVerification(
            user_id=test_user.id,
            token=token,
            email=test_user.email,
            expires_at=datetime.utcnow() - timedelta(hours=1)  # Expired
        )
        session.add(verification)
        session.commit()
        
        response = client.post(
            "/api/v1/auth/verify-email",
            json={"token": token}
        )
        assert response.status_code == 400
        assert "expired" in response.json()["detail"].lower()

class TestPasswordReset:
    """Test password reset functionality"""
    
    def test_request_password_reset(self, client: TestClient, test_user: User, session: Session):
        """Test requesting password reset"""
        response = client.post(
            "/api/v1/auth/request-password-reset",
            json={"email": test_user.email}
        )
        assert response.status_code == 200
        
        # Check that token was created
        reset = session.exec(select(PasswordReset)).first()
        assert reset is not None
        assert reset.user_id == test_user.id
    
    def test_request_password_reset_nonexistent_email(self, client: TestClient):
        """Test requesting reset for non-existent email (should not reveal)"""
        response = client.post(
            "/api/v1/auth/request-password-reset",
            json={"email": "nonexistent@example.com"}
        )
        # Should return success to not reveal if email exists
        assert response.status_code == 200
    
    def test_request_password_reset_oauth_user(self, client: TestClient, oauth_user: User):
        """Test requesting reset for OAuth user"""
        response = client.post(
            "/api/v1/auth/request-password-reset",
            json={"email": oauth_user.email}
        )
        assert response.status_code == 400
        assert "OAuth" in response.json()["detail"]
    
    def test_reset_password_success(self, client: TestClient, test_user: User, session: Session):
        """Test successful password reset"""
        from datetime import datetime, timedelta
        
        # Create reset token
        token = PasswordReset.generate_token()
        reset = PasswordReset(
            user_id=test_user.id,
            token=token,
            expires_at=datetime.utcnow() + timedelta(hours=1)
        )
        session.add(reset)
        session.commit()
        
        # Reset password
        response = client.post(
            "/api/v1/auth/reset-password",
            json={
                "token": token,
                "new_password": "NewSecure123!"
            }
        )
        assert response.status_code == 200
        assert "reset" in response.json()["message"].lower()
        
        # Verify can login with new password
        login_response = client.post(
            "/api/v1/auth/login",
            json={
                "email": test_user.email,
                "password": "NewSecure123!"
            }
        )
        assert login_response.status_code == 200
    
    def test_reset_password_invalid_token(self, client: TestClient):
        """Test reset with invalid token"""
        response = client.post(
            "/api/v1/auth/reset-password",
            json={
                "token": "invalid_token",
                "new_password": "NewSecure123!"
            }
        )
        assert response.status_code == 400
    
    def test_reset_password_weak_password(self, client: TestClient, test_user: User, session: Session):
        """Test reset with weak password"""
        from datetime import datetime, timedelta
        
        token = PasswordReset.generate_token()
        reset = PasswordReset(
            user_id=test_user.id,
            token=token,
            expires_at=datetime.utcnow() + timedelta(hours=1)
        )
        session.add(reset)
        session.commit()
        
        response = client.post(
            "/api/v1/auth/reset-password",
            json={
                "token": token,
                "new_password": "weak"
            }
        )
        assert response.status_code == 400
        assert "password" in response.json()["detail"].lower()

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.user import User
from app.models.session import Session as SessionModel

class TestSessionManagement:
    """Test session management endpoints"""
    
    def test_list_sessions(self, client: TestClient, auth_headers: dict, session: Session, test_user: User):
        """Test listing active sessions"""
        response = client.get(
            "/api/v1/sessions/",
            headers=auth_headers
        )
        assert response.status_code == 200
        sessions = response.json()
        
        assert len(sessions) >= 1
        assert "session_id" in sessions[0]
        assert "ip_address" in sessions[0]
        assert "user_agent" in sessions[0]
        assert "last_activity" in sessions[0]
    
    def test_revoke_specific_session(self, client: TestClient, test_user: User, session: Session):
        """Test revoking a specific session"""
        from unittest.mock import Mock
        from app.core.security import create_tokens
        
        # Create two sessions
        mock_request = Mock()
        mock_request.client.host = "127.0.0.1"
        mock_request.headers.get.return_value = "test-agent"
        
        token1, refresh1 = create_tokens(test_user.id, session, mock_request)
        token2, refresh2 = create_tokens(test_user.id, session, mock_request)
        
        headers1 = {"Authorization": f"Bearer {token1}"}
        headers2 = {"Authorization": f"Bearer {token2}"}
        
        # List sessions with first token
        response = client.get("/api/v1/sessions/", headers=headers1)
        assert response.status_code == 200
        sessions = response.json()
        assert len(sessions) == 2
        
        # Revoke second session using first token
        session_id_to_revoke = sessions[1]["session_id"]
        response = client.delete(
            f"/api/v1/sessions/{session_id_to_revoke}",
            headers=headers1
        )
        assert response.status_code == 200
        
        # Verify second token no longer works
        response = client.get("/api/v1/auth/me", headers=headers2)
        assert response.status_code == 401
        
        # Verify first token still works
        response = client.get("/api/v1/auth/me", headers=headers1)
        assert response.status_code == 200
    
    def test_revoke_nonexistent_session(self, client: TestClient, auth_headers: dict):
        """Test revoking a non-existent session"""
        response = client.delete(
            "/api/v1/sessions/nonexistent_session_id",
            headers=auth_headers
        )
        assert response.status_code == 404
    
    def test_session_device_info(self, client: TestClient, auth_headers: dict):
        """Test that session contains device information"""
        response = client.get(
            "/api/v1/sessions/",
            headers=auth_headers
        )
        assert response.status_code == 200
        sessions = response.json()
        
        # Check that device info is present
        session = sessions[0]
        assert session["ip_address"] is not None
        assert session["user_agent"] is not None

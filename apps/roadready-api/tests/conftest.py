import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
from app.main import app
from app.core.database import get_db
from app.models.user import User
from app.models.test_record import TestRecord
from app.models.onboarding_profile import OnboardingProfile
from app.models.session import Session as SessionModel
from app.models.email_verification import EmailVerification
from app.models.password_reset import PasswordReset
from app.core.security import get_password_hash, create_tokens

@pytest.fixture(name="session")
def session_fixture():
    """Create a test database session"""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session

@pytest.fixture(name="client")
def client_fixture(session: Session):
    """Create a test client"""
    def get_session_override():
        return session

    app.dependency_overrides[get_db] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()

@pytest.fixture(name="test_user")
def test_user_fixture(session: Session):
    """Create a test user"""
    user = User(
        email="test@example.com",
        hashed_password=get_password_hash("TestPass123!"),
        first_name="Test",
        last_name="User",
        state="CA",
        test_type="car",
        is_active=True,
        email_verified=False
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@pytest.fixture(name="verified_user")
def verified_user_fixture(session: Session):
    """Create a verified test user"""
    user = User(
        email="verified@example.com",
        hashed_password=get_password_hash("TestPass123!"),
        first_name="Verified",
        last_name="User",
        state="CA",
        test_type="car",
        is_active=True,
        email_verified=True
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@pytest.fixture(name="oauth_user")
def oauth_user_fixture(session: Session):
    """Create an OAuth user"""
    user = User(
        email="oauth@example.com",
        oauth_provider="google",
        oauth_provider_id="google123",
        first_name="OAuth",
        last_name="User",
        state="CA",
        test_type="car",
        is_active=True,
        email_verified=True
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@pytest.fixture(name="auth_headers")
def auth_headers_fixture(test_user: User, session: Session):
    """Create authentication headers for test user"""
    from unittest.mock import Mock
    
    # Create mock request
    mock_request = Mock()
    mock_request.client.host = "127.0.0.1"
    mock_request.headers.get.return_value = "test-agent"
    
    access_token, refresh_token = create_tokens(test_user.id, session, mock_request)
    return {
        "Authorization": f"Bearer {access_token}",
        "refresh_token": refresh_token
    }

@pytest.fixture(name="verified_auth_headers")
def verified_auth_headers_fixture(verified_user: User, session: Session):
    """Create authentication headers for verified user"""
    from unittest.mock import Mock
    
    mock_request = Mock()
    mock_request.client.host = "127.0.0.1"
    mock_request.headers.get.return_value = "test-agent"
    
    access_token, refresh_token = create_tokens(verified_user.id, session, mock_request)
    return {
        "Authorization": f"Bearer {access_token}",
        "refresh_token": refresh_token
    }

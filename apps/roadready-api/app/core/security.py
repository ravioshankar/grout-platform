from datetime import datetime, timedelta
from typing import Optional, Tuple
from jose import JWTError, jwt
import bcrypt
import hashlib
import secrets
import logging
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select
from app.core.config import settings
from app.core.database import get_db
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
logger = logging.getLogger(__name__)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash."""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


def get_password_hash(password: str) -> str:
    """Hash password using bcrypt."""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def hash_token(token: str) -> str:
    """Hash token for storage (SHA256)."""
    return hashlib.sha256(token.encode()).hexdigest()


async def create_tokens(user_id: int, db: Session, request: Request = None) -> Tuple[str, str]:
    """Create access and refresh tokens with session tracking."""
    from app.models.session import Session as SessionModel
    
    session_id = SessionModel.generate_session_id()
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    access_expire = datetime.utcnow() + access_token_expires
    refresh_expire = datetime.utcnow() + refresh_token_expires
    
    access_token = jwt.encode(
        {"sub": str(user_id), "session_id": session_id, "exp": access_expire, "type": "access"},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    
    refresh_token = jwt.encode(
        {"sub": str(user_id), "session_id": session_id, "exp": refresh_expire, "type": "refresh"},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    
    ip_address = None
    user_agent = None
    if request:
        from fastapi.requests import Request as FastAPIRequest
        try:
            ip_address = getattr(request, 'client', None) and getattr(request.client, 'host', None) if hasattr(request, 'client') else None
            user_agent = getattr(request, 'headers', None) and request.headers.get('user-agent') if hasattr(request, 'headers') else None
        except Exception as e:
            logger.warning(f"Could not extract request info: {e}")
    
    session = SessionModel(
        user_id=user_id,
        session_id=session_id,
        token_hash=hash_token(access_token),
        refresh_token_hash=hash_token(refresh_token),
        expires_at=access_expire,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    
    db.add(session)
    db.commit()
    db.refresh(session)
    
    logger.info(f"SESSION_CREATED | user_id={user_id} | session_id={session_id[:8]}...")
    
    return access_token, refresh_token


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """Validate JWT token and return current user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        session_id: str = payload.get("session_id")
        token_type: str = payload.get("type")
        
        if not user_id or not session_id or token_type != "access":
            logger.warning(f"Token validation failed: user_id={user_id}, session_id={session_id}, type={token_type}")
            raise credentials_exception
        
        # Validate user_id is numeric
        try:
            int(user_id)
        except (ValueError, TypeError):
            logger.warning(f"Invalid user_id format: {user_id}")
            raise credentials_exception
            
    except JWTError as e:
        logger.error(f"JWT decode error: {e}")
        raise credentials_exception
    
    token_hash = hash_token(token)
    session = db.exec(select(SessionModel).where(
        SessionModel.session_id == session_id,
        SessionModel.token_hash == token_hash,
        SessionModel.user_id == int(user_id),
        SessionModel.is_active == True,
        SessionModel.revoked_at == None,
        SessionModel.expires_at > datetime.utcnow()
    )).first()
    
    if not session:
        logger.warning(f"Session not found for token | user_id={user_id} | session_id={session_id}")
        raise credentials_exception
    
    inactivity_limit = datetime.utcnow() - timedelta(hours=settings.SESSION_INACTIVITY_HOURS)
    if session.last_activity < inactivity_limit:
        logger.warning(f"Session expired due to inactivity | session_id={session_id} | last_activity={session.last_activity}")
        session.is_active = False
        session.revoked_at = datetime.utcnow()
        db.add(session)
        db.flush()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired due to inactivity"
        )
    
    session.last_activity = datetime.utcnow()
    db.add(session)
    
    user = db.get(User, int(user_id))
    if not user or not user.is_active:
        logger.warning(f"Inactive user found for token | user_id={user_id}")
        raise credentials_exception
    
    return user


def revoke_session(session_id: str, db: Session):
    """Revoke a specific session."""
    from app.models.session import Session as SessionModel
    session = db.exec(select(SessionModel).where(
        SessionModel.session_id == session_id,
        SessionModel.is_active == True
    )).first()
    
    if session:
        logger.info(f"SESSION_REVOKED | session_id={session_id}")
        session.is_active = False
        session.revoked_at = datetime.utcnow()
        db.add(session)


def revoke_all_user_sessions(user_id: int, db: Session, except_session_id: str = None):
    """Revoke all sessions for a user except one (for current session)."""
    from app.models.session import Session as SessionModel
    sessions = db.exec(select(SessionModel).where(
        SessionModel.user_id == user_id,
        SessionModel.is_active == True
    )).all()
    
    for session in sessions:
        if except_session_id and session.session_id == except_session_id:
            continue
        
        logger.info(f"SESSION_REVOKED (ALL) | user_id={user_id} | session_id={session.session_id[:8]}...")
        session.is_active = False
        session.revoked_at = datetime.utcnow()
        db.add(session)

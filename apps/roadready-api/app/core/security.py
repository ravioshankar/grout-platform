from datetime import datetime, timedelta
from typing import Optional, Tuple
from jose import JWTError, jwt
import bcrypt
import hashlib
import secrets
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select
from app.core.config import settings
from app.core.database import get_db
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()

def create_tokens(user_id: int, db: Session, request: Request = None) -> Tuple[str, str]:
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
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent")
    
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
    
    return access_token, refresh_token

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
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
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    from app.models.session import Session as SessionModel
    
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
        raise credentials_exception
    
    inactivity_limit = datetime.utcnow() - timedelta(hours=settings.SESSION_INACTIVITY_HOURS)
    if session.last_activity < inactivity_limit:
        session.is_active = False
        session.revoked_at = datetime.utcnow()
        db.add(session)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired due to inactivity"
        )
    
    session.last_activity = datetime.utcnow()
    db.add(session)
    db.commit()
    
    user = db.get(User, int(user_id))
    if not user or not user.is_active:
        raise credentials_exception
    
    return user

def revoke_session(session_id: str, db: Session):
    from app.models.session import Session as SessionModel
    session = db.exec(select(SessionModel).where(
        SessionModel.session_id == session_id,
        SessionModel.is_active == True
    )).first()
    
    if session:
        session.is_active = False
        session.revoked_at = datetime.utcnow()
        db.add(session)
        db.commit()

def revoke_all_user_sessions(user_id: int, db: Session, except_session_id: str = None):
    from app.models.session import Session as SessionModel
    sessions = db.exec(select(SessionModel).where(
        SessionModel.user_id == user_id,
        SessionModel.is_active == True
    )).all()
    
    for session in sessions:
        if except_session_id and session.session_id == except_session_id:
            continue
        session.is_active = False
        session.revoked_at = datetime.utcnow()
        db.add(session)
    
    db.commit()

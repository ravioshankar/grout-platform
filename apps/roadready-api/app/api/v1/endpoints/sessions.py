from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.core.security import get_current_user, revoke_session
from app.models.user import User
from app.models.session import Session as SessionModel
from app.schemas.session import SessionRead, SessionRevoke
from app.schemas.email_verification import MessageResponse

router = APIRouter()

@router.get(
    "/",
    response_model=List[SessionRead],
    summary="List active sessions",
    description="Get all active sessions for the current user"
)
async def list_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all active sessions with device information"""
    sessions = db.exec(
        select(SessionModel).where(
            SessionModel.user_id == current_user.id,
            SessionModel.is_active == True
        ).order_by(SessionModel.last_activity.desc())
    ).all()
    
    return [
        SessionRead(
            session_id=session.session_id,
            ip_address=session.ip_address,
            user_agent=session.user_agent,
            created_at=session.created_at,
            last_activity=session.last_activity,
            expires_at=session.expires_at
        )
        for session in sessions
    ]

@router.delete(
    "/{session_id}",
    response_model=MessageResponse,
    summary="Revoke session",
    description="Revoke a specific session"
)
async def revoke_specific_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Revoke a specific session by session ID"""
    session = db.exec(
        select(SessionModel).where(
            SessionModel.session_id == session_id,
            SessionModel.user_id == current_user.id,
            SessionModel.is_active == True
        )
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    revoke_session(session_id, db)
    
    return MessageResponse(message="Session revoked successfully")

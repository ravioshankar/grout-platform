from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime, timedelta
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.email_verification import EmailVerification
from app.models.password_reset import PasswordReset
from app.schemas.email_verification import (
    EmailVerificationRequest, EmailVerificationConfirm,
    PasswordResetRequest, PasswordResetConfirm, MessageResponse
)
from app.services.email_service import EmailService
from app.core.security import get_password_hash
from app.core.validation import validate_password_strength

router = APIRouter()

@router.post(
    "/send-verification",
    response_model=MessageResponse,
    summary="Send email verification",
    description="Send verification email to user's email address"
)
async def send_verification_email(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.email_verified:
        raise HTTPException(status_code=400, detail="Email already verified")
    
    # Invalidate old tokens
    old_tokens = db.exec(
        select(EmailVerification).where(
            EmailVerification.user_id == current_user.id,
            EmailVerification.verified_at == None
        )
    ).all()
    for token in old_tokens:
        db.delete(token)
    
    # Create new verification token
    token = EmailVerification.generate_token()
    expires_at = datetime.utcnow() + timedelta(hours=24)
    
    verification = EmailVerification(
        user_id=current_user.id,
        token=token,
        email=current_user.email,
        expires_at=expires_at
    )
    db.add(verification)
    db.commit()
    
    # Send email
    await EmailService.send_verification_email(current_user.email, token)
    
    return MessageResponse(message="Verification email sent successfully")

@router.post(
    "/verify-email",
    response_model=MessageResponse,
    summary="Verify email",
    description="Verify email using token from email"
)
async def verify_email(
    verification_data: EmailVerificationConfirm,
    db: Session = Depends(get_db)
):
    verification = db.exec(
        select(EmailVerification).where(
            EmailVerification.token == verification_data.token,
            EmailVerification.verified_at == None
        )
    ).first()
    
    if not verification:
        raise HTTPException(status_code=400, detail="Invalid or already used verification token")
    
    if verification.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Verification token has expired")
    
    # Mark as verified
    verification.verified_at = datetime.utcnow()
    db.add(verification)
    
    # Update user
    user = db.get(User, verification.user_id)
    if user:
        user.email_verified = True
        user.updated_at = datetime.utcnow()
        db.add(user)
    
    db.commit()
    
    return MessageResponse(message="Email verified successfully")

@router.post(
    "/request-password-reset",
    response_model=MessageResponse,
    summary="Request password reset",
    description="Send password reset email"
)
async def request_password_reset(
    reset_request: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    user = db.exec(select(User).where(User.email == reset_request.email)).first()
    
    # Don't reveal if user exists or not (security best practice)
    if not user:
        return MessageResponse(message="If the email exists, a password reset link has been sent")
    
    if user.oauth_provider:
        raise HTTPException(status_code=400, detail="OAuth users cannot reset password")
    
    # Invalidate old tokens
    old_tokens = db.exec(
        select(PasswordReset).where(
            PasswordReset.user_id == user.id,
            PasswordReset.used_at == None
        )
    ).all()
    for token in old_tokens:
        db.delete(token)
    
    # Create new reset token
    token = PasswordReset.generate_token()
    expires_at = datetime.utcnow() + timedelta(hours=1)
    
    reset = PasswordReset(
        user_id=user.id,
        token=token,
        expires_at=expires_at
    )
    db.add(reset)
    db.commit()
    
    # Send email
    await EmailService.send_password_reset_email(user.email, token)
    
    return MessageResponse(message="If the email exists, a password reset link has been sent")

@router.post(
    "/reset-password",
    response_model=MessageResponse,
    summary="Reset password",
    description="Reset password using token from email"
)
async def reset_password(
    reset_data: PasswordResetConfirm,
    db: Session = Depends(get_db)
):
    reset = db.exec(
        select(PasswordReset).where(
            PasswordReset.token == reset_data.token,
            PasswordReset.used_at == None
        )
    ).first()
    
    if not reset:
        raise HTTPException(status_code=400, detail="Invalid or already used reset token")
    
    if reset.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Reset token has expired")
    
    # Validate password strength
    validate_password_strength(reset_data.new_password)
    
    # Update password
    user = db.get(User, reset.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.hashed_password = get_password_hash(reset_data.new_password)
    user.updated_at = datetime.utcnow()
    
    # Mark token as used
    reset.used_at = datetime.utcnow()
    
    db.add(user)
    db.add(reset)
    db.commit()
    
    return MessageResponse(message="Password reset successfully")

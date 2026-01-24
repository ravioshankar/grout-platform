from typing import Optional
import logging

logger = logging.getLogger(__name__)

class EmailService:
    """Email service for sending verification and notification emails"""
    
    @staticmethod
    async def send_verification_email(email: str, token: str, base_url: str = "http://localhost:8888") -> bool:
        """Send email verification link"""
        verification_link = f"{base_url}/api/v1/auth/verify-email?token={token}"
        
        # TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
        logger.info(f"Sending verification email to {email}")
        logger.info(f"Verification link: {verification_link}")
        
        # For now, just log the link (in production, send actual email)
        print(f"\n{'='*60}")
        print(f"EMAIL VERIFICATION")
        print(f"To: {email}")
        print(f"Link: {verification_link}")
        print(f"{'='*60}\n")
        
        return True
    
    @staticmethod
    async def send_password_reset_email(email: str, token: str, base_url: str = "http://localhost:8888") -> bool:
        """Send password reset link"""
        reset_link = f"{base_url}/api/v1/auth/reset-password?token={token}"
        
        # TODO: Integrate with actual email service
        logger.info(f"Sending password reset email to {email}")
        logger.info(f"Reset link: {reset_link}")
        
        print(f"\n{'='*60}")
        print(f"PASSWORD RESET")
        print(f"To: {email}")
        print(f"Link: {reset_link}")
        print(f"{'='*60}\n")
        
        return True
    
    @staticmethod
    async def send_welcome_email(email: str, first_name: Optional[str] = None) -> bool:
        """Send welcome email to new users"""
        logger.info(f"Sending welcome email to {email}")
        
        print(f"\n{'='*60}")
        print(f"WELCOME EMAIL")
        print(f"To: {email}")
        print(f"Welcome {'to RoadReady' if not first_name else first_name + ' to RoadReady'}!")
        print(f"{'='*60}\n")
        
        return True

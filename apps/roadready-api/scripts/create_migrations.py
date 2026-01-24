#!/usr/bin/env python3
"""
Script to create database migrations for new features
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import SQLModel, create_engine
from app.core.config import settings
from app.models.user import User
from app.models.test_record import TestRecord
from app.models.onboarding_profile import OnboardingProfile
from app.models.session import Session as SessionModel
from app.models.email_verification import EmailVerification
from app.models.password_reset import PasswordReset

def create_tables():
    """Create all tables in the database"""
    engine = create_engine(settings.DATABASE_URL, echo=True)
    
    print("Creating tables...")
    SQLModel.metadata.create_all(engine)
    print("✓ All tables created successfully!")
    
    print("\nTables created:")
    print("- users")
    print("- test_records")
    print("- onboarding_profiles")
    print("- session")
    print("- email_verifications (NEW)")
    print("- password_resets (NEW)")

if __name__ == "__main__":
    create_tables()

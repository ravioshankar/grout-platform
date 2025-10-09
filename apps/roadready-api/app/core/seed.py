from sqlmodel import Session, select
from app.core.database import engine
from app.models.user import User
from datetime import datetime

def seed_users():
    """Seed user data for local development"""
    users_data = [
        {"email": "john.doe@example.com", "state": "CA", "test_type": "car"},
        {"email": "jane.smith@example.com", "state": "NY", "test_type": "motorcycle"},
        {"email": "bob.wilson@example.com", "state": "TX", "test_type": "car"},
        {"email": "alice.brown@example.com", "state": "FL", "test_type": "cdl"},
        {"email": "charlie.davis@example.com", "state": "CA", "test_type": "motorcycle"},
    ]
    
    with Session(engine) as session:
        for user_data in users_data:
            existing = session.exec(
                select(User).where(User.email == user_data["email"])
            ).first()
            
            if not existing:
                user = User(**user_data)
                session.add(user)
                print(f"✓ Created user: {user_data['email']}")
            else:
                print(f"⊘ User already exists: {user_data['email']}")
        
        session.commit()
    print(f"\n✓ Seeding completed!")

def clear_users():
    """Clear all user data"""
    with Session(engine) as session:
        users = session.exec(select(User)).all()
        for user in users:
            session.delete(user)
        session.commit()
    print("✓ All users cleared!")

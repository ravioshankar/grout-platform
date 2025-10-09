from sqlmodel import Session, select
from app.core.database import engine
from app.core.security import get_password_hash
from app.models.user import User
from datetime import datetime

def seed_users():
    """Seed user data for local development"""
    default_password = get_password_hash("Password123!")
    users_data = [
        {"email": "john.doe@example.com", "first_name": "John", "last_name": "Doe", "state": "CA", "test_type": "car", "hashed_password": default_password},
        {"email": "jane.smith@example.com", "first_name": "Jane", "last_name": "Smith", "state": "NY", "test_type": "motorcycle", "hashed_password": default_password},
        {"email": "bob.wilson@example.com", "first_name": "Bob", "last_name": "Wilson", "state": "TX", "test_type": "car", "hashed_password": default_password},
        {"email": "alice.brown@example.com", "first_name": "Alice", "last_name": "Brown", "state": "FL", "test_type": "cdl", "hashed_password": default_password},
        {"email": "charlie.davis@example.com", "first_name": "Charlie", "last_name": "Davis", "state": "CA", "test_type": "motorcycle", "hashed_password": default_password},
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
    print(f"\n✓ Seeding completed! Default password: Password123!")

def clear_users():
    """Clear all user data"""
    with Session(engine) as session:
        users = session.exec(select(User)).all()
        for user in users:
            session.delete(user)
        session.commit()
    print("✓ All users cleared!")

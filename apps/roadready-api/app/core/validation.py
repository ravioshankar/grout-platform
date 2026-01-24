import re
from typing import Optional
from datetime import date, datetime
from fastapi import HTTPException

# US State codes
US_STATES = {
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"
}

# Valid test types
TEST_TYPES = {
    "car", "class-c", "motorcycle", "class-m", "cdl", "commercial"
}

def validate_password_strength(password: str) -> None:
    """Validate password meets security requirements"""
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
    
    if not re.search(r"[A-Z]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one uppercase letter")
    
    if not re.search(r"[a-z]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one lowercase letter")
    
    if not re.search(r"\d", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one number")
    
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one special character")

def validate_phone_number(phone: str) -> str:
    """Validate and format phone number"""
    # Remove all non-digit characters
    digits = re.sub(r'\D', '', phone)
    
    # Check if it's a valid US phone number (10 or 11 digits)
    if len(digits) == 10:
        return f"+1{digits}"
    elif len(digits) == 11 and digits[0] == '1':
        return f"+{digits}"
    else:
        raise HTTPException(status_code=400, detail="Invalid phone number format. Use US format: (XXX) XXX-XXXX")

def validate_state_code(state: str) -> str:
    """Validate US state code"""
    state_upper = state.upper()
    if state_upper not in US_STATES:
        raise HTTPException(status_code=400, detail=f"Invalid state code. Must be one of: {', '.join(sorted(US_STATES))}")
    return state_upper

def validate_test_type(test_type: str) -> str:
    """Validate test type"""
    test_type_lower = test_type.lower()
    if test_type_lower not in TEST_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid test type. Must be one of: {', '.join(sorted(TEST_TYPES))}")
    return test_type_lower

def validate_date_of_birth(dob: date) -> date:
    """Validate date of birth (must be at least 15 years old)"""
    today = datetime.now().date()
    age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    
    if age < 15:
        raise HTTPException(status_code=400, detail="Must be at least 15 years old")
    
    if age > 120:
        raise HTTPException(status_code=400, detail="Invalid date of birth")
    
    return dob

def validate_email(email: str) -> str:
    """Validate email format"""
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_regex, email):
        raise HTTPException(status_code=400, detail="Invalid email format")
    return email.lower()

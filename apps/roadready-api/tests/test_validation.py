import pytest
from fastapi import HTTPException
from datetime import date
from app.core.validation import (
    validate_password_strength,
    validate_phone_number,
    validate_state_code,
    validate_test_type,
    validate_date_of_birth,
    validate_email
)

class TestPasswordValidation:
    """Test password strength validation"""
    
    def test_valid_password(self):
        """Test that valid passwords pass validation"""
        validate_password_strength("TestPass123!")
        validate_password_strength("MySecure@Pass1")
        validate_password_strength("Complex#Pass99")
    
    def test_password_too_short(self):
        """Test that short passwords are rejected"""
        with pytest.raises(HTTPException) as exc:
            validate_password_strength("Short1!")
        assert "at least 8 characters" in str(exc.value.detail)
    
    def test_password_no_uppercase(self):
        """Test that passwords without uppercase are rejected"""
        with pytest.raises(HTTPException) as exc:
            validate_password_strength("testpass123!")
        assert "uppercase letter" in str(exc.value.detail)
    
    def test_password_no_lowercase(self):
        """Test that passwords without lowercase are rejected"""
        with pytest.raises(HTTPException) as exc:
            validate_password_strength("TESTPASS123!")
        assert "lowercase letter" in str(exc.value.detail)
    
    def test_password_no_number(self):
        """Test that passwords without numbers are rejected"""
        with pytest.raises(HTTPException) as exc:
            validate_password_strength("TestPassword!")
        assert "number" in str(exc.value.detail)
    
    def test_password_no_special_char(self):
        """Test that passwords without special characters are rejected"""
        with pytest.raises(HTTPException) as exc:
            validate_password_strength("TestPass123")
        assert "special character" in str(exc.value.detail)

class TestPhoneValidation:
    """Test phone number validation"""
    
    def test_valid_phone_formats(self):
        """Test various valid phone formats"""
        assert validate_phone_number("1234567890") == "+11234567890"
        assert validate_phone_number("(123) 456-7890") == "+11234567890"
        assert validate_phone_number("+1-123-456-7890") == "+11234567890"
        assert validate_phone_number("123.456.7890") == "+11234567890"
    
    def test_invalid_phone(self):
        """Test invalid phone numbers"""
        with pytest.raises(HTTPException) as exc:
            validate_phone_number("123")
        assert "Invalid phone number" in str(exc.value.detail)
        
        with pytest.raises(HTTPException):
            validate_phone_number("12345")

class TestStateValidation:
    """Test state code validation"""
    
    def test_valid_states(self):
        """Test valid state codes"""
        assert validate_state_code("CA") == "CA"
        assert validate_state_code("ca") == "CA"
        assert validate_state_code("NY") == "NY"
        assert validate_state_code("tx") == "TX"
    
    def test_invalid_state(self):
        """Test invalid state codes"""
        with pytest.raises(HTTPException) as exc:
            validate_state_code("XX")
        assert "Invalid state code" in str(exc.value.detail)
        
        with pytest.raises(HTTPException):
            validate_state_code("ZZ")

class TestTestTypeValidation:
    """Test test type validation"""
    
    def test_valid_test_types(self):
        """Test valid test types"""
        assert validate_test_type("car") == "car"
        assert validate_test_type("CAR") == "car"
        assert validate_test_type("motorcycle") == "motorcycle"
        assert validate_test_type("class-c") == "class-c"
        assert validate_test_type("CDL") == "cdl"
    
    def test_invalid_test_type(self):
        """Test invalid test types"""
        with pytest.raises(HTTPException) as exc:
            validate_test_type("invalid")
        assert "Invalid test type" in str(exc.value.detail)

class TestDateOfBirthValidation:
    """Test date of birth validation"""
    
    def test_valid_age(self):
        """Test valid ages (15-120)"""
        from datetime import datetime
        current_year = datetime.now().year
        
        # 20 years old
        dob = date(current_year - 20, 1, 1)
        assert validate_date_of_birth(dob) == dob
        
        # 15 years old (minimum)
        dob = date(current_year - 15, 1, 1)
        assert validate_date_of_birth(dob) == dob
    
    def test_too_young(self):
        """Test that users under 15 are rejected"""
        from datetime import datetime
        current_year = datetime.now().year
        
        dob = date(current_year - 14, 1, 1)
        with pytest.raises(HTTPException) as exc:
            validate_date_of_birth(dob)
        assert "at least 15 years old" in str(exc.value.detail)
    
    def test_too_old(self):
        """Test that unrealistic ages are rejected"""
        from datetime import datetime
        current_year = datetime.now().year
        
        dob = date(current_year - 121, 1, 1)
        with pytest.raises(HTTPException) as exc:
            validate_date_of_birth(dob)
        assert "Invalid date of birth" in str(exc.value.detail)

class TestEmailValidation:
    """Test email validation"""
    
    def test_valid_emails(self):
        """Test valid email formats"""
        assert validate_email("test@example.com") == "test@example.com"
        assert validate_email("USER@EXAMPLE.COM") == "user@example.com"
        assert validate_email("test.user@example.co.uk") == "test.user@example.co.uk"
        assert validate_email("test+tag@example.com") == "test+tag@example.com"
    
    def test_invalid_emails(self):
        """Test invalid email formats"""
        with pytest.raises(HTTPException) as exc:
            validate_email("invalid")
        assert "Invalid email" in str(exc.value.detail)
        
        with pytest.raises(HTTPException):
            validate_email("@example.com")
        
        with pytest.raises(HTTPException):
            validate_email("test@")

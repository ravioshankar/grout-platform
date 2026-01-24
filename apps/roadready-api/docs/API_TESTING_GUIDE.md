# API Testing Guide

Complete guide for testing the RoadReady API enhanced features.

## Setup

### 1. Install Dependencies
```bash
cd apps/roadready-api
pip install -r requirements.txt
```

### 2. Run Tests
```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run with coverage report
pytest --cov=app --cov-report=html --cov-report=term

# Run specific test file
pytest tests/test_auth.py

# Run tests matching pattern
pytest -k "password"
```

## Test Categories

### Authentication Tests (`test_auth.py`)

**Test Signup:**
```bash
pytest tests/test_auth.py::TestSignup -v
```

Tests:
- ✓ Successful signup with valid credentials
- ✓ Duplicate email rejection
- ✓ Weak password rejection
- ✓ Invalid email format rejection

**Test Login:**
```bash
pytest tests/test_auth.py::TestLogin -v
```

Tests:
- ✓ Successful login
- ✓ Wrong password rejection
- ✓ Non-existent user rejection

**Test Profile Management:**
```bash
pytest tests/test_auth.py::TestProfile -v
```

Tests:
- ✓ Get current user profile
- ✓ Update profile information
- ✓ Invalid state code rejection
- ✓ Invalid phone number rejection

**Test Password Change:**
```bash
pytest tests/test_auth.py::TestPasswordChange -v
```

Tests:
- ✓ Successful password change
- ✓ Wrong current password rejection
- ✓ Weak new password rejection

---

### Validation Tests (`test_validation.py`)

```bash
pytest tests/test_validation.py -v
```

Tests all validation functions:
- ✓ Password strength (8+ chars, uppercase, lowercase, number, special char)
- ✓ Phone number formatting (various formats → E.164)
- ✓ State code validation (50 states + DC)
- ✓ Test type validation
- ✓ Date of birth validation (15-120 years old)
- ✓ Email format validation

---

### Email Verification Tests (`test_email_verification.py`)

```bash
pytest tests/test_email_verification.py -v
```

**Email Verification:**
- ✓ Send verification email
- ✓ Verify email with valid token
- ✓ Reject invalid token
- ✓ Reject expired token
- ✓ Prevent re-verification

**Password Reset:**
- ✓ Request password reset
- ✓ Reset password with valid token
- ✓ Reject invalid token
- ✓ Reject expired token
- ✓ Validate new password strength
- ✓ Prevent OAuth users from resetting

---

### Statistics Tests (`test_statistics.py`)

```bash
pytest tests/test_statistics.py -v
```

Tests:
- ✓ Calculate comprehensive statistics
- ✓ Average score calculation
- ✓ Pass rate calculation (≥70%)
- ✓ Category performance breakdown
- ✓ Improvement rate calculation
- ✓ Recent trend detection
- ✓ Weak areas identification
- ✓ Custom threshold support

---

### Pagination Tests (`test_test_records.py`)

```bash
pytest tests/test_test_records.py -v
```

**Pagination:**
- ✓ First page retrieval
- ✓ Second page retrieval
- ✓ Last page with fewer items
- ✓ Correct total count
- ✓ Correct page metadata

**Filtering:**
- ✓ Filter by state code
- ✓ Filter by test type
- ✓ Filter by category
- ✓ Filter by score range
- ✓ Filter by date range
- ✓ Combine multiple filters

---

### Session Management Tests (`test_sessions.py`)

```bash
pytest tests/test_sessions.py -v
```

Tests:
- ✓ List active sessions
- ✓ Session device information
- ✓ Revoke specific session
- ✓ Verify revoked session is invalid
- ✓ Verify other sessions still work
- ✓ Handle non-existent session

---

### Onboarding Profiles Tests (`test_onboarding_profiles.py`)

```bash
pytest tests/test_onboarding_profiles.py -v
```

Tests:
- ✓ Create profile
- ✓ List user profiles
- ✓ Get specific profile
- ✓ Update profile
- ✓ Activate profile
- ✓ Deactivate other profiles on activation
- ✓ Update user state/test_type on activation
- ✓ Get active profile
- ✓ Delete profile
- ✓ Prevent access to other users' profiles

---

## Manual Testing with cURL

### 1. Signup
```bash
curl -X POST http://localhost:8888/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8888/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

Save the access_token from response.

### 3. Get Profile
```bash
curl -X GET http://localhost:8888/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Update Profile with Validation
```bash
curl -X PATCH http://localhost:8888/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "(555) 123-4567",
    "state": "CA",
    "test_type": "car"
  }'
```

### 5. Send Email Verification
```bash
curl -X POST http://localhost:8888/api/v1/auth/send-verification \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 6. Request Password Reset
```bash
curl -X POST http://localhost:8888/api/v1/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

### 7. Create Test Record
```bash
curl -X POST http://localhost:8888/api/v1/test-records/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "state_code": "CA",
    "test_type": "car",
    "category": "traffic_signs",
    "score": 85,
    "total_questions": 20,
    "correct_answers": 17,
    "time_spent": 600,
    "questions": "[]",
    "user_answers": "[]",
    "is_correct": "[]"
  }'
```

### 8. Get Statistics
```bash
curl -X GET http://localhost:8888/api/v1/statistics/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 9. Get Test Records with Pagination
```bash
curl -X GET "http://localhost:8888/api/v1/test-records/?page=1&page_size=10&state_code=CA&min_score=70" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 10. List Active Sessions
```bash
curl -X GET http://localhost:8888/api/v1/sessions/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 11. Create Onboarding Profile
```bash
curl -X POST http://localhost:8888/api/v1/onboarding-profiles/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "profile_name": "California Class C",
    "state": "CA",
    "test_type": "class-c"
  }'
```

---

## Testing with Swagger UI

1. Start the server:
```bash
./roadready start
```

2. Open browser: http://localhost:8888/docs

3. Test endpoints interactively:
   - Click "Authorize" button
   - Enter your access token
   - Try different endpoints
   - View request/response examples

---

## Coverage Report

Generate HTML coverage report:
```bash
pytest --cov=app --cov-report=html
open htmlcov/index.html
```

Expected coverage:
- Overall: >85%
- Core modules: >90%
- Endpoints: >95%
- Validation: 100%

---

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: '3.11'
    
    - name: Install dependencies
      run: |
        cd apps/roadready-api
        pip install -r requirements.txt
    
    - name: Run tests
      run: |
        cd apps/roadready-api
        pytest --cov=app --cov-report=xml
    
    - name: Upload coverage
      uses: codecov/codecov-action@v2
```

---

## Troubleshooting

### Tests Failing

1. **Database connection errors:**
   - Tests use in-memory SQLite
   - No PostgreSQL required for tests

2. **Import errors:**
   - Ensure you're in the correct directory
   - Run: `pip install -r requirements.txt`

3. **Token errors:**
   - Check that fixtures are properly loaded
   - Verify conftest.py is in tests directory

### Slow Tests

```bash
# Run only fast tests
pytest -m "not slow"

# Run with parallel execution
pytest -n auto
```

---

## Best Practices

1. **Run tests before committing:**
   ```bash
   pytest
   ```

2. **Check coverage:**
   ```bash
   pytest --cov=app --cov-report=term-missing
   ```

3. **Test new features:**
   - Write tests first (TDD)
   - Aim for >90% coverage
   - Test edge cases

4. **Keep tests fast:**
   - Use in-memory database
   - Mock external services
   - Avoid unnecessary setup

5. **Organize tests:**
   - One test file per module
   - Group related tests in classes
   - Use descriptive test names

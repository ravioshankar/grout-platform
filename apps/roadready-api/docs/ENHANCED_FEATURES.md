# Enhanced Features Documentation

This document describes the newly added features to the RoadReady API.

## Table of Contents
1. [Email Verification](#email-verification)
2. [Password Reset](#password-reset)
3. [Enhanced Validation](#enhanced-validation)
4. [Test Statistics](#test-statistics)
5. [Pagination & Filtering](#pagination--filtering)
6. [Session Management](#session-management)

---

## Email Verification

### Overview
Users can verify their email addresses to ensure account security and enable email-based features.

### Endpoints

#### Send Verification Email
```http
POST /api/v1/auth/send-verification
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Verification email sent successfully"
}
```

#### Verify Email
```http
POST /api/v1/auth/verify-email
Content-Type: application/json

{
  "token": "verification_token_from_email"
}
```

**Response:**
```json
{
  "message": "Email verified successfully"
}
```

### Features
- 24-hour token expiration
- Automatic token invalidation after use
- Old tokens are invalidated when new ones are requested
- Email verification status tracked in user profile

---

## Password Reset

### Overview
Secure password reset flow via email for users who forgot their password.

### Endpoints

#### Request Password Reset
```http
POST /api/v1/auth/request-password-reset
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If the email exists, a password reset link has been sent"
}
```

**Note:** Response is the same whether email exists or not (security best practice).

#### Reset Password
```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "new_password": "NewSecure123!"
}
```

**Response:**
```json
{
  "message": "Password reset successfully"
}
```

### Features
- 1-hour token expiration
- One-time use tokens
- Password strength validation
- OAuth users cannot reset password
- Old tokens invalidated when new ones are requested

---

## Enhanced Validation

### Password Strength Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*(),.?":{}|<>)

### Phone Number Validation
- Accepts various formats: (123) 456-7890, 123-456-7890, 1234567890
- Automatically formats to E.164: +11234567890
- Validates US phone numbers (10 or 11 digits)

### State Code Validation
- Validates against all 50 US states + DC
- Case-insensitive (converts to uppercase)
- Returns error with list of valid states

### Test Type Validation
- Valid types: car, class-c, motorcycle, class-m, cdl, commercial
- Case-insensitive (converts to lowercase)

### Date of Birth Validation
- Minimum age: 15 years
- Maximum age: 120 years
- Validates realistic dates

### Email Validation
- RFC-compliant email format
- Converts to lowercase
- Validates domain structure

---

## Test Statistics

### Overview
Comprehensive analytics and insights about user test performance.

### Endpoints

#### Get Statistics
```http
GET /api/v1/statistics/
Authorization: Bearer <token>
```

**Response:**
```json
{
  "total_tests": 10,
  "average_score": 82.5,
  "best_score": 95,
  "worst_score": 65,
  "pass_rate": 80.0,
  "total_time_spent": 6000,
  "average_time_per_test": 600,
  "improvement_rate": 15.5,
  "category_performance": [
    {
      "category": "traffic_signs",
      "total_attempts": 5,
      "average_score": 87.5,
      "best_score": 95,
      "worst_score": 75
    }
  ],
  "recent_trend": "improving"
}
```

#### Get Weak Areas
```http
GET /api/v1/statistics/weak-areas?threshold=70
Authorization: Bearer <token>
```

**Response:**
```json
["road_rules", "parking"]
```

### Metrics Explained

- **total_tests**: Total number of tests taken
- **average_score**: Mean score across all tests
- **best_score**: Highest score achieved
- **worst_score**: Lowest score achieved
- **pass_rate**: Percentage of tests passed (≥70%)
- **total_time_spent**: Total time in seconds
- **average_time_per_test**: Average time per test in seconds
- **improvement_rate**: Percentage improvement (first half vs second half)
- **category_performance**: Breakdown by test category
- **recent_trend**: "improving", "declining", or "stable" (based on last 5 tests)

---

## Pagination & Filtering

### Overview
Efficient retrieval of test records with pagination and multiple filter options.

### Endpoint

```http
GET /api/v1/test-records/
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| page | integer | Page number (default: 1) | `page=2` |
| page_size | integer | Items per page (1-100, default: 10) | `page_size=20` |
| state_code | string | Filter by state | `state_code=CA` |
| test_type | string | Filter by test type | `test_type=car` |
| category | string | Filter by category | `category=traffic_signs` |
| min_score | integer | Minimum score (0-100) | `min_score=70` |
| max_score | integer | Maximum score (0-100) | `max_score=90` |
| start_date | date | Start date (YYYY-MM-DD) | `start_date=2024-01-01` |
| end_date | date | End date (YYYY-MM-DD) | `end_date=2024-12-31` |

### Example Request

```http
GET /api/v1/test-records/?page=1&page_size=10&state_code=CA&min_score=70&start_date=2024-01-01
Authorization: Bearer <token>
```

### Response

```json
{
  "items": [
    {
      "id": 1,
      "state_code": "CA",
      "test_type": "car",
      "category": "traffic_signs",
      "score": 85,
      "total_questions": 20,
      "correct_answers": 17,
      "time_spent": 600,
      "completed_at": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "page_size": 10,
  "total_pages": 3
}
```

### Features
- Efficient database queries with proper indexing
- Multiple filters can be combined
- Results sorted by completion date (newest first)
- Pagination metadata included in response

---

## Session Management

### Overview
View and manage active login sessions across different devices.

### Endpoints

#### List Active Sessions
```http
GET /api/v1/sessions/
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "session_id": "abc123...",
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0...",
    "created_at": "2024-01-15T10:00:00Z",
    "last_activity": "2024-01-15T12:30:00Z",
    "expires_at": "2024-01-15T22:00:00Z"
  }
]
```

#### Revoke Specific Session
```http
DELETE /api/v1/sessions/{session_id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Session revoked successfully"
}
```

### Features
- View all active sessions with device information
- IP address and user agent tracking
- Last activity timestamp
- Revoke specific sessions (e.g., logout from other devices)
- Session inactivity timeout (2 hours)
- Automatic session cleanup

### Use Cases
- User sees suspicious login from unknown location
- User wants to logout from all devices except current
- User wants to see where they're logged in
- Security audit of active sessions

---

## Testing

### Running Tests

```bash
# Install test dependencies
pip install -r requirements.txt

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py

# Run specific test class
pytest tests/test_auth.py::TestSignup

# Run specific test
pytest tests/test_auth.py::TestSignup::test_signup_success
```

### Test Coverage

The test suite includes:
- **Authentication Tests**: Signup, login, logout, token refresh
- **Validation Tests**: Password, phone, email, state, test type, date of birth
- **Email Verification Tests**: Send, verify, expiration, invalid tokens
- **Password Reset Tests**: Request, reset, validation, OAuth users
- **Statistics Tests**: Calculations, weak areas, trends
- **Pagination Tests**: Multiple pages, filtering, sorting
- **Session Management Tests**: List, revoke, device info
- **Onboarding Profiles Tests**: CRUD operations, activation

### Test Structure

```
tests/
├── conftest.py                    # Fixtures and test configuration
├── test_auth.py                   # Authentication tests
├── test_validation.py             # Validation tests
├── test_email_verification.py     # Email verification tests
├── test_statistics.py             # Statistics tests
├── test_test_records.py           # Test records pagination tests
├── test_sessions.py               # Session management tests
└── test_onboarding_profiles.py    # Onboarding profiles tests
```

---

## Database Migrations

### New Tables

#### email_verifications
```sql
CREATE TABLE email_verifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### password_resets
```sql
CREATE TABLE password_resets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Running Migrations

```bash
# Create migration
./roadready db:revision "add email verification and password reset"

# Apply migrations
./roadready db:migrate
```

---

## Security Considerations

1. **Password Strength**: Enforced at API level with comprehensive validation
2. **Token Expiration**: All tokens have expiration times
3. **One-Time Tokens**: Email verification and password reset tokens are single-use
4. **Rate Limiting**: Consider implementing rate limiting for sensitive endpoints
5. **HTTPS**: Always use HTTPS in production
6. **Session Security**: Sessions track device info and have inactivity timeouts
7. **Email Privacy**: Password reset doesn't reveal if email exists

---

## Future Enhancements

1. **Email Service Integration**: Integrate with SendGrid, AWS SES, or similar
2. **Rate Limiting**: Add rate limiting middleware
3. **2FA**: Two-factor authentication support
4. **Email Templates**: HTML email templates for better UX
5. **Notification Preferences**: User preferences for email notifications
6. **Advanced Analytics**: More detailed performance insights
7. **Export Data**: Allow users to export their data (GDPR compliance)
8. **Account Deletion**: Implement account deletion endpoint

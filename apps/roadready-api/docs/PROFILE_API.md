# Profile Management API

Complete guide for user profile management endpoints.

## Authentication Required

All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <access_token>
```

## Endpoints

### 1. Get Current User Profile

**GET** `/api/v1/auth/me`

Returns the authenticated user's complete profile.

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+1234567890",
  "date_of_birth": "1990-01-01",
  "avatar_url": "https://example.com/avatar.jpg",
  "state": "CA",
  "test_type": "car",
  "license_number": "D1234567",
  "is_active": true,
  "email_verified": false,
  "created_at": "2025-01-01T00:00:00",
  "updated_at": "2025-01-01T00:00:00"
}
```

---

### 2. Update Profile

**PATCH** `/api/v1/auth/me`

Update user profile information. All fields are optional.

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+1234567890",
  "date_of_birth": "1990-01-01",
  "avatar_url": "https://example.com/avatar.jpg",
  "state": "CA",
  "test_type": "car",
  "license_number": "D1234567"
}
```

**Response:** Returns updated user profile (same as GET /me)

---

### 3. Change Password

**POST** `/api/v1/auth/change-password`

Change user password. Requires current password for verification.

**Request Body:**
```json
{
  "current_password": "OldPassword123!",
  "new_password": "NewPassword123!"
}
```

**Response:**
```json
{
  "message": "Password changed successfully"
}
```

**Notes:**
- OAuth users (Google/Facebook) cannot change password
- New password must be at least 8 characters
- Current password must be correct

---

### 4. Change Email

**POST** `/api/v1/auth/change-email`

Change user email address. Requires password verification.

**Request Body:**
```json
{
  "new_email": "newemail@example.com",
  "password": "CurrentPassword123!"
}
```

**Response:** Returns updated user profile with new email

**Notes:**
- OAuth users cannot change email
- New email must not be already registered
- Email verification status is reset to false
- Password must be correct

---

## Profile Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `first_name` | string | No | User's first name (max 100 chars) |
| `last_name` | string | No | User's last name (max 100 chars) |
| `phone_number` | string | No | Phone number (max 20 chars) |
| `date_of_birth` | date | No | Date of birth (YYYY-MM-DD) |
| `avatar_url` | string | No | Profile picture URL (max 500 chars) |
| `state` | string | No | US state code (2 chars, e.g., "CA") |
| `test_type` | string | No | DMV test type (car, motorcycle, cdl) |
| `license_number` | string | No | Driver's license number (max 50 chars) |

---

## Example Usage

### Update Profile with cURL

```bash
curl -X PATCH http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "+1234567890",
    "state": "CA",
    "test_type": "car"
  }'
```

### Change Password with cURL

```bash
curl -X POST http://localhost:8000/api/v1/auth/change-password \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "OldPassword123!",
    "new_password": "NewPassword123!"
  }'
```

### Change Email with cURL

```bash
curl -X POST http://localhost:8000/api/v1/auth/change-email \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "new_email": "newemail@example.com",
    "password": "CurrentPassword123!"
  }'
```

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Email already in use"
}
```

### 401 Unauthorized
```json
{
  "detail": "Invalid current password"
}
```

### 403 Forbidden
```json
{
  "detail": "OAuth users cannot change password"
}
```

---

## Best Practices

1. **Partial Updates**: Only send fields you want to update in PATCH requests
2. **Password Security**: Enforce strong password requirements on client side
3. **Email Verification**: Implement email verification flow after email change
4. **Avatar Upload**: Use separate file upload endpoint for avatar images
5. **Phone Validation**: Validate phone number format on client side
6. **Date Format**: Use ISO 8601 format (YYYY-MM-DD) for dates

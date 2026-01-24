# Onboarding Profiles Feature

## Overview
Users can create and manage multiple onboarding profiles to quickly switch between different test preparation scenarios (e.g., different states, test types).

## Database Schema

### Table: `onboarding_profiles`
```sql
CREATE TABLE onboarding_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_name VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    test_type VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ix_onboarding_profiles_user_id ON onboarding_profiles(user_id);
```

## API Endpoints

### Create Profile
```
POST /api/v1/onboarding-profiles/
Authorization: Bearer <token>

Request Body:
{
  "profile_name": "California Class C",
  "state": "CA",
  "test_type": "class-c"
}

Response: 201 Created
{
  "id": 1,
  "user_id": 123,
  "profile_name": "California Class C",
  "state": "CA",
  "test_type": "class-c",
  "is_active": false,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

### List Profiles
```
GET /api/v1/onboarding-profiles/
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": 1,
    "user_id": 123,
    "profile_name": "California Class C",
    "state": "CA",
    "test_type": "class-c",
    "is_active": true,
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  },
  {
    "id": 2,
    "user_id": 123,
    "profile_name": "Texas Motorcycle",
    "state": "TX",
    "test_type": "class-m",
    "is_active": false,
    "created_at": "2024-01-15T11:00:00Z",
    "updated_at": "2024-01-15T11:00:00Z"
  }
]
```

### Get Profile
```
GET /api/v1/onboarding-profiles/{profile_id}
Authorization: Bearer <token>

Response: 200 OK
{
  "id": 1,
  "user_id": 123,
  "profile_name": "California Class C",
  "state": "CA",
  "test_type": "class-c",
  "is_active": true,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

### Update Profile
```
PATCH /api/v1/onboarding-profiles/{profile_id}
Authorization: Bearer <token>

Request Body:
{
  "profile_name": "California Class C Updated",
  "state": "CA",
  "test_type": "class-c"
}

Response: 200 OK
{
  "id": 1,
  "user_id": 123,
  "profile_name": "California Class C Updated",
  "state": "CA",
  "test_type": "class-c",
  "is_active": true,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T12:00:00Z"
}
```

### Get Active Profile
```
GET /api/v1/onboarding-profiles/active
Authorization: Bearer <token>

Response: 200 OK
{
  "id": 1,
  "user_id": 123,
  "profile_name": "California Class C",
  "state": "CA",
  "test_type": "class-c",
  "is_active": true,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}

Note: Returns null if no profile is active.
Frontend should sync this profile to local storage.
```

### Activate Profile
```
POST /api/v1/onboarding-profiles/{profile_id}/activate
Authorization: Bearer <token>

Response: 200 OK
{
  "id": 2,
  "user_id": 123,
  "profile_name": "Texas Motorcycle",
  "state": "TX",
  "test_type": "class-m",
  "is_active": true,
  "created_at": "2024-01-15T11:00:00Z",
  "updated_at": "2024-01-15T12:30:00Z"
}

Note: Activating a profile:
1. Deactivates all other profiles for the user
2. Sets this profile as active
3. Updates user's state and test_type fields
4. Frontend should sync this profile to local storage
```

### Delete Profile
```
DELETE /api/v1/onboarding-profiles/{profile_id}
Authorization: Bearer <token>

Response: 204 No Content
```

## Migration

Run the migration to create the table:
```bash
cd apps/roadready-api
alembic upgrade head
```

## Usage Example

1. **Create multiple profiles:**
```bash
# California Class C
curl -X POST http://localhost:8888/api/v1/onboarding-profiles/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"profile_name": "CA Class C", "state": "CA", "test_type": "class-c"}'

# Texas Motorcycle
curl -X POST http://localhost:8888/api/v1/onboarding-profiles/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"profile_name": "TX Motorcycle", "state": "TX", "test_type": "class-m"}'
```

2. **Switch between profiles:**
```bash
# Activate Texas Motorcycle profile
curl -X POST http://localhost:8888/api/v1/onboarding-profiles/2/activate \
  -H "Authorization: Bearer <token>"
```

3. **List all profiles:**
```bash
curl -X GET http://localhost:8888/api/v1/onboarding-profiles/ \
  -H "Authorization: Bearer <token>"
```

## Frontend Integration

### Local Storage Strategy

**Only the active profile is stored in local IndexedDB/SQLite:**
- When user activates a profile, frontend syncs it to local storage
- Local storage contains: `selectedState`, `selectedTestType`, `profileId`, `profileName`
- All other profiles remain only in PostgreSQL backend

### Implementation Steps

1. **Profile Management Screen:**
   - Fetch all profiles from backend: `GET /api/v1/onboarding-profiles/`
   - Display profiles with active one highlighted
   - Allow create, edit, delete operations

2. **Profile Activation:**
   - Call: `POST /api/v1/onboarding-profiles/{id}/activate`
   - Sync active profile to local storage
   - Clear any previously cached profile data

3. **App Initialization:**
   - Fetch active profile: `GET /api/v1/onboarding-profiles/active`
   - Store only active profile locally
   - Use local profile for offline access

4. **Profile Switching:**
   - User selects different profile
   - Backend activates new profile
   - Frontend replaces local storage with new active profile
   - App reloads with new profile settings

### Storage Architecture

```
PostgreSQL (Backend):
├── Profile 1: "CA Class C" (active)
├── Profile 2: "TX Motorcycle"
└── Profile 3: "NY Commercial"

Local Storage (IndexedDB/SQLite):
└── Active Profile Only: "CA Class C"
    ├── selectedState: "CA"
    ├── selectedTestType: "class-c"
    ├── profileId: 1
    └── profileName: "CA Class C"
```

### Benefits

- Minimal local storage usage
- All profiles backed up in cloud
- Fast offline access to active profile
- Easy profile switching across devices
- Test records remain associated with the user, not the profile

## Benefits

- Quick switching between different test scenarios
- No need to re-enter state and test type repeatedly
- Useful for users preparing for multiple license types
- Useful for users moving between states

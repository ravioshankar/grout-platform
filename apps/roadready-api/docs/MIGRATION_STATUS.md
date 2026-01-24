# Migration Status

## Onboarding Profiles Table

### Status: ✅ CREATED

The `onboarding_profiles` table has been successfully created in PostgreSQL.

### Table Structure
```sql
CREATE TABLE onboarding_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    profile_name VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    test_type VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ix_onboarding_profiles_user_id ON onboarding_profiles(user_id);
```

### Verification
```bash
# Check table exists
docker exec roadready-postgres psql -U roadready -d roadready -c "\dt"

# View table structure
docker exec roadready-postgres psql -U roadready -d roadready -c "\d onboarding_profiles"
```

### Current Tables
- alembic_version
- onboarding_profiles ✅ NEW
- sessions
- test_records
- user

### Alembic Version
Current: `991c39fd7158` (onboarding_profiles migration)

### API Endpoints Available
- `POST /api/v1/onboarding-profiles/` - Create profile
- `GET /api/v1/onboarding-profiles/` - List profiles
- `GET /api/v1/onboarding-profiles/active` - Get active profile
- `GET /api/v1/onboarding-profiles/{id}` - Get specific profile
- `PATCH /api/v1/onboarding-profiles/{id}` - Update profile
- `POST /api/v1/onboarding-profiles/{id}/activate` - Activate profile
- `DELETE /api/v1/onboarding-profiles/{id}` - Delete profile

### Testing
```bash
# Start the API server
cd apps/roadready-api
uvicorn app.main:app --reload

# Test endpoints
curl http://localhost:8888/api/v1/onboarding-profiles/ \
  -H "Authorization: Bearer <token>"
```

# Quick Start Guide - Enhanced Features

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies (30 seconds)
```bash
cd apps/roadready-api
pip install -r requirements.txt
```

### Step 2: Setup Database (30 seconds)
```bash
# Start PostgreSQL
docker-compose up -d

# Create tables
python scripts/create_migrations.py
```

### Step 3: Run Tests (1 minute)
```bash
pytest -v
```

Expected output: **60+ tests passing** ✅

### Step 4: Start Server (10 seconds)
```bash
./roadready start
```

### Step 5: Try It Out! (3 minutes)

Open http://localhost:8888/docs

#### Test Signup with Validation
```bash
curl -X POST http://localhost:8888/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

Save the `access_token` from response.

#### Get Statistics
```bash
curl -X GET http://localhost:8888/api/v1/statistics/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### List Sessions
```bash
curl -X GET http://localhost:8888/api/v1/sessions/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## ✨ What You Get

### 1. Email Verification ✉️
```bash
# Send verification
curl -X POST http://localhost:8888/api/v1/auth/send-verification \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check console for verification link
```

### 2. Password Reset 🔐
```bash
curl -X POST http://localhost:8888/api/v1/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Check console for reset link
```

### 3. Enhanced Validation ✅
Try these and see validation in action:
```bash
# Weak password (will fail)
curl -X POST http://localhost:8888/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "weak"}'

# Invalid state (will fail)
curl -X PATCH http://localhost:8888/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"state": "XX"}'

# Valid update (will succeed)
curl -X PATCH http://localhost:8888/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "phone_number": "(555) 123-4567",
    "state": "CA"
  }'
```

### 4. Test Statistics 📊
```bash
# Create some test records first
for i in {1..5}; do
  curl -X POST http://localhost:8888/api/v1/test-records/ \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"state_code\": \"CA\",
      \"test_type\": \"car\",
      \"category\": \"traffic_signs\",
      \"score\": $((60 + RANDOM % 40)),
      \"total_questions\": 20,
      \"correct_answers\": 15,
      \"time_spent\": 600,
      \"questions\": \"[]\",
      \"user_answers\": \"[]\",
      \"is_correct\": \"[]\"
    }"
done

# Get statistics
curl -X GET http://localhost:8888/api/v1/statistics/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get weak areas
curl -X GET http://localhost:8888/api/v1/statistics/weak-areas \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Pagination & Filtering 📄
```bash
# Get paginated results
curl -X GET "http://localhost:8888/api/v1/test-records/?page=1&page_size=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filter by state and score
curl -X GET "http://localhost:8888/api/v1/test-records/?state_code=CA&min_score=70" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. Session Management 🔒
```bash
# List all sessions
curl -X GET http://localhost:8888/api/v1/sessions/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# Revoke a session
curl -X DELETE http://localhost:8888/api/v1/sessions/SESSION_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🧪 Run Tests

```bash
# All tests
pytest

# With coverage
pytest --cov=app --cov-report=term

# Specific feature
pytest tests/test_statistics.py -v

# Watch mode (requires pytest-watch)
ptw
```

## 📚 Learn More

- **[ENHANCED_FEATURES.md](docs/ENHANCED_FEATURES.md)** - Full feature docs
- **[API_TESTING_GUIDE.md](docs/API_TESTING_GUIDE.md)** - Testing guide
- **[Swagger UI](http://localhost:8888/docs)** - Interactive docs

## 🎯 Next Steps

1. ✅ Explore Swagger UI: http://localhost:8888/docs
2. ✅ Run the test suite: `pytest -v`
3. ✅ Try all new endpoints
4. ✅ Check test coverage: `pytest --cov=app --cov-report=html`
5. ✅ Read full documentation

## 💡 Tips

- Use Swagger UI for interactive testing
- Check console output for email verification/reset links
- All validation errors return helpful messages
- Tests use in-memory SQLite (no PostgreSQL needed)
- Coverage report: `open htmlcov/index.html`

## ❓ Troubleshooting

**Tests failing?**
```bash
pip install -r requirements.txt
pytest -v
```

**Database errors?**
```bash
docker-compose up -d
python scripts/create_migrations.py
```

**Import errors?**
```bash
cd apps/roadready-api
export PYTHONPATH=$PYTHONPATH:$(pwd)
```

---

**You're all set!** 🎉 Start building with the enhanced RoadReady API.

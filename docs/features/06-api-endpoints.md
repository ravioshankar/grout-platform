# RoadReady API - Complete Endpoint Reference

## 📡 API Overview

**Base URL:** `/api/v1/`  
**Total Endpoints:** 30+  
**Documentation Available:** Swagger UI at `http://localhost:8888/docs`

---

## 🔐 Authentication Endpoints (10)

### User Management
```bash
POST   /api/v1/auth/signup                     ✅ Enhanced
POST   /api/v1/auth/login                      ✅
GET    /api/v1/auth/me                         ✅
PATCH  /api/v1/auth/me                         ✅ Enhanced
POST   /api/v1/auth/change-password            ✅ Enhanced
POST   /api/v1/auth/change-email               ✅
POST   /api/v1/auth/refresh                    ✅
POST   /api/v1/auth/logout                     ✅
POST   /api/v1/auth/logout-all                 ✅
GET    /api/v1/auth/login/{provider}           ✅ OAuth
```

### Enhanced Authentication (2 new) 🆕
```bash
POST   /api/v1/auth/send-verification          🆕 Email verification
POST   /api/v1/auth/verify-email               🆕 Verify email token
POST   /api/v1/auth/request-password-reset     🆕 Password reset request
POST   /api/v1/auth/reset-password             🆕 Reset password with token
```

### OAuth Callbacks (2)
```bash
GET    /api/v1/auth/callback/{provider}        ✅ OAuth callback handler
```

---

## 👤 User Endpoints (2)
```bash
POST   /api/v1/users/                           ✅ Create user profile
GET    /api/v1/users/{user_id}                  ✅ Get user by ID
PUT    /api/v1/users/{user_id}                  ✅ Update user profile
```

---

## 📝 Test Records Endpoints (3)

### CRUD Operations
```bash
POST   /api/v1/test-records/                    ✅ Create test record
GET    /api/v1/test-records/                    ✅ Enhanced with pagination
GET    /api/v1/test-records/{test_id}           ✅ Get specific test
```

### Query Parameters (Enhanced)
```
?page=1&page_size=10&state_code=CA&min_score=70&start_date=2024-01-01
```

---

## 🎯 Onboarding Profiles Endpoints (7)

### Profile Management
```bash
POST   /api/v1/onboarding-profiles/             ✅ Create multiple profiles
GET    /api/v1/onboarding-profiles/             ✅ List user profiles
GET    /api/v1/onboarding-profiles/{id}         ✅ Get specific profile
PATCH  /api/v1/onboarding-profiles/{id}         ✅ Update profile
POST   /api/v1/onboarding-profiles/{id}/activate ✅ Activate profile
GET    /api/v1/onboarding-profiles/active       ✅ Get active profile
DELETE /api/v1/onboarding-profiles/{id}         ✅ Delete profile
```

**Use Case:** Create profiles for different states/test types (e.g., "CA Class C", "TX Motorcycle")

---

## 📊 Statistics Endpoints (2 NEW) 🆕

### Comprehensive Analytics
```bash
GET    /api/v1/statistics/                      🆕 Complete statistics
GET    /api/v1/statistics/weak-areas            🆕 Identify weak areas?threshold=70
```

**Statistics Include:**
- Total tests taken
- Average, best, worst scores
- Pass rate (≥70%)
- Time spent analysis
- Improvement rate
- Recent trend detection
- Category breakdowns
- Weak areas identification

---

## 🔒 Sessions Endpoints (2 NEW) 🆕

### Device & Session Management
```bash
GET    /api/v1/sessions/                        🆕 List active sessions
DELETE /api/v1/sessions/{session_id}            🆕 Revoke specific session
```

**Session Info Provided:**
- IP address tracking
- User agent (browser/device)
- Last activity timestamp
- Session expiration time

---

## 🏥 Health Endpoints (2)

```bash
GET    /api/v1/health                           ✅ Health check
GET    /api/v1/                                 ✅ Root endpoint
```

---

## 🔍 Endpoint Enhancement Legend

- ✅ **Standard** - Core functionality
- ✅ Enhanced - Improved with better validation/error handling
- 🆕 **New** - Recently added feature

**Total Breakdown:**
- New Endpoints: 6
- Enhanced Endpoints: 4
- Total Categories: 7

---
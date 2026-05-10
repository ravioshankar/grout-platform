"""API Router for RoadReady API v1."""
from app.api.v1.endpoints.health import health as health_endpoint
from app.api.v1.endpoints.auth import auth as auth_endpoint
from app.api.v1.endpoints.email_verification import email_verification as email_verification_endpoint
from app.api.v1.endpoints.tests import tests as tests_endpoint
from app.api.v1.endpoints.users import users as users_endpoint
from app.api.v1.endpoints.test_records import test_records as test_records_endpoint
from app.api.v1.endpoints.onboarding_profiles import onboarding_profiles as onboarding_profiles_endpoint
from app.api.v1.endpoints.statistics import statistics as statistics_endpoint
from app.api.v1.endpoints.sessions import sessions as sessions_endpoint
from app.api.v1.endpoints.gamification import gamification as gamification_endpoint
from app.api.v1.endpoints.marketplace import marketplace as marketplace_endpoint

api_router = APIRouter()

# Health checks
api_router.include_router(health_endpoint, tags=["health"])

# Authentication endpoints
api_router.include_router(auth_endpoint, prefix="/auth", tags=["auth"])

# OAuth email verification (separate from auth router)
api_router.include_router(email_verification_endpoint, prefix="/auth", tags=["auth"])

# Tests and test records
api_router.include_router(tests_endpoint, prefix="/tests", tags=["tests"])
api_router.include_router(test_records_endpoint, prefix="/test-records", tags=["test-records"])

# User management (separate from auth for better organization)
api_router.include_router(users_endpoint, prefix="/users", tags=["users"])

# Onboarding profiles
api_router.include_router(onboarding_profiles_endpoint, prefix="/onboarding-profiles", tags=["onboarding-profiles"])

# Statistics and analytics
api_router.include_router(statistics_endpoint, prefix="/statistics", tags=["statistics"])

# User sessions
api_router.include_router(sessions_endpoint, prefix="/sessions", tags=["sessions"])

# Gamification system
api_router.include_router(gamification_endpoint, prefix="/gamification", tags=["gamification"])

# Marketplace items/features
api_router.include_router(marketplace_endpoint, prefix="/marketplace", tags=["marketplace"])

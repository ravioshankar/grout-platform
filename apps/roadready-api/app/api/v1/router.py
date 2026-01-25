from fastapi import APIRouter
from app.api.v1.endpoints import (
    health, tests, users, auth, test_records, 
    onboarding_profiles, email_verification, statistics, sessions, gamification
)

api_router = APIRouter()

api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(email_verification.router, prefix="/auth", tags=["auth"])
api_router.include_router(tests.router, prefix="/tests", tags=["tests"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(test_records.router, prefix="/test-records", tags=["test-records"])
api_router.include_router(onboarding_profiles.router, prefix="/onboarding-profiles", tags=["onboarding-profiles"])
api_router.include_router(statistics.router, prefix="/statistics", tags=["statistics"])
api_router.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
api_router.include_router(gamification.router, prefix="/gamification", tags=["gamification"])

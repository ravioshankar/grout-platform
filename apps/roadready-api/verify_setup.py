#!/usr/bin/env python3
"""
Comprehensive setup verification script
"""
import sys
import os

sys.path.insert(0, '.')

def check_imports():
    """Check that all required modules can be imported"""
    print("🔍 Checking imports...")
    
    try:
        from app.main import app
        print("  ✓ Main app")
    except Exception as e:
        print(f"  ✗ Main app: {e}")
        return False
    
    try:
        from app.api.v1.router import api_router
        print("  ✓ API router")
    except Exception as e:
        print(f"  ✗ API router: {e}")
        return False
    
    try:
        from app.api.v1.endpoints import (
            auth, email_verification, statistics, 
            sessions, test_records, onboarding_profiles
        )
        print("  ✓ All endpoints")
    except Exception as e:
        print(f"  ✗ Endpoints: {e}")
        return False
    
    try:
        from app.core import validation, security, database
        print("  ✓ Core modules")
    except Exception as e:
        print(f"  ✗ Core modules: {e}")
        return False
    
    try:
        from app.services import email_service, statistics_service
        print("  ✓ Services")
    except Exception as e:
        print(f"  ✗ Services: {e}")
        return False
    
    try:
        from app.models import (
            user, test_record, onboarding_profile, 
            session, email_verification, password_reset
        )
        print("  ✓ Models")
    except Exception as e:
        print(f"  ✗ Models: {e}")
        return False
    
    return True

def check_config():
    """Check configuration"""
    print("\n🔍 Checking configuration...")
    
    try:
        from app.core.config import settings
        print(f"  ✓ Config loaded")
        print(f"    - Project: {settings.PROJECT_NAME}")
        print(f"    - Version: {settings.VERSION}")
        print(f"    - API Prefix: {settings.API_V1_STR}")
        return True
    except Exception as e:
        print(f"  ✗ Config: {e}")
        return False

def check_env():
    """Check environment file"""
    print("\n🔍 Checking environment...")
    
    if os.path.exists('.env'):
        print("  ✓ .env file exists")
        return True
    else:
        print("  ⚠ .env file not found (using defaults)")
        return True

def check_endpoints():
    """Check that endpoints are registered"""
    print("\n🔍 Checking endpoints...")
    
    try:
        from app.main import app
        routes = [route.path for route in app.routes]
        
        expected_paths = [
            "/",
            "/api/v1/health",
            "/api/v1/auth/signup",
            "/api/v1/auth/login",
            "/api/v1/auth/me",
            "/api/v1/auth/send-verification",
            "/api/v1/auth/verify-email",
            "/api/v1/auth/request-password-reset",
            "/api/v1/auth/reset-password",
            "/api/v1/statistics/",
            "/api/v1/sessions/",
            "/api/v1/test-records/",
            "/api/v1/onboarding-profiles/",
        ]
        
        missing = []
        for path in expected_paths:
            if path not in routes:
                missing.append(path)
        
        if missing:
            print(f"  ⚠ Missing endpoints: {missing}")
        else:
            print(f"  ✓ All key endpoints registered ({len(routes)} total)")
        
        return len(missing) == 0
    except Exception as e:
        print(f"  ✗ Error checking endpoints: {e}")
        return False

def check_test_client():
    """Check that test client works"""
    print("\n🔍 Checking test client...")
    
    try:
        from fastapi.testclient import TestClient
        from app.main import app
        
        client = TestClient(app)
        
        # Test root
        response = client.get("/")
        if response.status_code == 200:
            print("  ✓ Root endpoint responds")
        else:
            print(f"  ✗ Root endpoint failed: {response.status_code}")
            return False
        
        # Test health
        response = client.get("/api/v1/health")
        if response.status_code == 200:
            print("  ✓ Health endpoint responds")
        else:
            print(f"  ✗ Health endpoint failed: {response.status_code}")
            return False
        
        # Test docs
        response = client.get("/docs")
        if response.status_code == 200:
            print("  ✓ Swagger UI accessible")
        else:
            print(f"  ✗ Swagger UI failed: {response.status_code}")
            return False
        
        return True
    except Exception as e:
        print(f"  ✗ Test client error: {e}")
        return False

def main():
    """Run all checks"""
    print("=" * 60)
    print("RoadReady API - Setup Verification")
    print("=" * 60)
    
    checks = [
        ("Imports", check_imports),
        ("Configuration", check_config),
        ("Environment", check_env),
        ("Endpoints", check_endpoints),
        ("Test Client", check_test_client),
    ]
    
    results = []
    for name, check_func in checks:
        try:
            result = check_func()
            results.append((name, result))
        except Exception as e:
            print(f"\n❌ {name} check failed with exception: {e}")
            results.append((name, False))
    
    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    
    all_passed = True
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {name}")
        if not result:
            all_passed = False
    
    print("=" * 60)
    
    if all_passed:
        print("\n🎉 All checks passed! The API is ready to run.")
        print("\nTo start the server:")
        print("  ./roadready start")
        print("\nOr:")
        print("  uvicorn app.main:app --reload --host 0.0.0.0 --port 8888")
        print("\nThen visit:")
        print("  http://localhost:8888/docs")
        return 0
    else:
        print("\n⚠️  Some checks failed. Please review the errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())

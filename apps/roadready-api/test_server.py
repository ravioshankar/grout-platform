#!/usr/bin/env python3
"""
Quick test script to verify the server can start
"""
import sys
sys.path.insert(0, '.')

from app.main import app
from fastapi.testclient import TestClient

def test_server():
    """Test that the server can start and respond to basic requests"""
    client = TestClient(app)
    
    # Test root endpoint
    response = client.get("/")
    assert response.status_code == 200, f"Root endpoint failed: {response.text}"
    print("✓ Root endpoint working")
    
    # Test health endpoint
    response = client.get("/api/v1/health")
    assert response.status_code == 200, f"Health endpoint failed: {response.text}"
    print("✓ Health endpoint working")
    
    # Test docs endpoint
    response = client.get("/docs")
    assert response.status_code == 200, f"Docs endpoint failed: {response.text}"
    print("✓ Swagger UI working")
    
    # Test OpenAPI schema
    response = client.get("/openapi.json")
    assert response.status_code == 200, f"OpenAPI schema failed: {response.text}"
    schema = response.json()
    print(f"✓ OpenAPI schema working ({len(schema.get('paths', {}))} paths)")
    
    print("\n✅ All basic tests passed! Server is ready to run.")
    print("\nTo start the server, run:")
    print("  uvicorn app.main:app --reload --host 0.0.0.0 --port 8888")
    print("\nOr use the roadready script:")
    print("  ./roadready start")

if __name__ == "__main__":
    try:
        test_server()
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

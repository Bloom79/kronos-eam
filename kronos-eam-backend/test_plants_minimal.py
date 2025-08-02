#!/usr/bin/env python3
"""
Minimal test to isolate the plants API issue
"""

import sys
sys.path.insert(0, '/home/bloom/sentrics/kronos-eam-backend')

from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.api.v1.endpoints.plants import router
from app.core.database import SessionLocal
from app.models.user import User

# Create minimal app with just plants router
app = FastAPI()
app.include_router(router, prefix="/api/v1/plants")

client = TestClient(app)

# Mock authentication
def mock_get_current_active_user():
    return type('TokenData', (), {
        'sub': '2',
        'tenant_id': 'demo',
        'email': 'test@test.com',
        'role': 'Admin',
        'permissions': []
    })

def mock_get_tenant_db():
    return SessionLocal()

# Override dependencies
from app.api.v1.endpoints import plants
plants.get_current_active_user = mock_get_current_active_user
plants.get_tenant_db = mock_get_tenant_db

# Test the endpoint
response = client.get("/api/v1/plants/?skip=0&limit=20")
print(f"Status: {response.status_code}")
print(f"Response: {response.text}")

if response.status_code != 200:
    print("\nTrying to get the actual error...")
    
    # Try calling the function directly
    from app.api.v1.endpoints.plants import list_plants
    from app.api.deps import PaginationParams, FilterParams
    
    try:
        result = list_plants(
            current_user=mock_get_current_active_user(),
            db=SessionLocal(),
            pagination=PaginationParams(skip=0, limit=20),
            filters=FilterParams(),
            plant_type=None,
            integration_status=None
        )
        print("Direct call succeeded!")
    except Exception as e:
        print(f"Direct call error: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
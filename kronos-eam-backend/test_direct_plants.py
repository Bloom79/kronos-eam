#!/usr/bin/env python3
"""
Direct test of plants endpoint function
"""

import sys
sys.path.insert(0, '/home/bloom/sentrics/kronos-eam-backend')

import asyncio
from app.api.v1.endpoints.plants import list_plants
from app.api.deps import PaginationParams, FilterParams
from app.core.database import SessionLocal

# Mock user
class MockUser:
    sub = '2'
    tenant_id = 'demo'
    email = 'test@test.com'
    role = 'Admin'
    permissions = []

async def test_plants():
    db = SessionLocal()
    try:
        result = await list_plants(
            current_user=MockUser(),
            db=db,
            pagination=PaginationParams(skip=0, limit=20),
            filters=FilterParams(),
            plant_type=None,
            integration_status=None
        )
        print(f"Success! Got {len(result.items)} plants")
        return result
    except Exception as e:
        print(f"Error: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

# Run the test
result = asyncio.run(test_plants())
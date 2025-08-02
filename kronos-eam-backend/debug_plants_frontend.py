#!/usr/bin/env python3
"""
Debug plants frontend loading issue
"""

import sys
sys.path.insert(0, '/home/bloom/sentrics/kronos-eam-backend')

import requests
import json

# Test the API directly
base_url = "http://localhost:8000/api/v1"

print("=== Testing Plants API Directly ===\n")

# First, get a token
login_data = {
    "username": "demo@kronos-eam.local",
    "password": "Demo123!"
}

print("1. Getting authentication token...")
try:
    login_response = requests.post(f"{base_url}/auth/login", data=login_data)
    print(f"   Status: {login_response.status_code}")
    
    if login_response.status_code == 200:
        token_data = login_response.json()
        access_token = token_data['access_token']
        print(f"   ✓ Got token: {access_token[:20]}...")
        
        # Test plants endpoint
        print("\n2. Testing /plants endpoint...")
        headers = {"Authorization": f"Bearer {access_token}"}
        
        # Try with pagination params that frontend uses
        params = {
            "skip": 0,
            "limit": 20,
            "sort_by": "name",
            "sort_order": "asc"
        }
        
        plants_response = requests.get(f"{base_url}/plants/", headers=headers, params=params)
        print(f"   Status: {plants_response.status_code}")
        print(f"   Headers: {dict(plants_response.headers)}")
        
        if plants_response.status_code == 200:
            data = plants_response.json()
            print(f"\n   Response structure:")
            print(f"   - Type: {type(data)}")
            print(f"   - Keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
            
            if isinstance(data, dict):
                print(f"   - items type: {type(data.get('items', []))}")
                print(f"   - items count: {len(data.get('items', []))}")
                print(f"   - total: {data.get('total', 'N/A')}")
                print(f"   - skip: {data.get('skip', 'N/A')}")
                print(f"   - limit: {data.get('limit', 'N/A')}")
                
                # Show first plant structure
                if data.get('items'):
                    print(f"\n   First plant structure:")
                    first_plant = data['items'][0]
                    for key, value in first_plant.items():
                        print(f"     - {key}: {type(value).__name__} = {value}")
            
            print(f"\n   Full response:")
            print(json.dumps(data, indent=2))
        else:
            print(f"   Error: {plants_response.text}")
            
    else:
        print(f"   Login failed: {login_response.text}")
        
except Exception as e:
    print(f"   Error: {e}")
    import traceback
    traceback.print_exc()

print("\n=== Frontend Expected Structure ===")
print("PlantListResponse interface expects:")
print("  - items: Plant[]")
print("  - total: number")
print("  - skip: number")
print("  - limit: number")

print("\nPlant interface expects:")
print("  - id: number")
print("  - name: string")
print("  - code: string")
print("  - power: string")
print("  - power_kw: number")
print("  - status: string")
print("  - type: string")
print("  - location: string")
print("  - etc...")
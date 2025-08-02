#!/usr/bin/env python3
"""
Simulate the exact browser login flow to help debug frontend issues
This mimics what the React app does when logging in
"""

import requests
import json

# URLs
API_URL = "http://localhost:8000/api/v1"
FRONTEND_URL = "http://localhost:3000"

print("=== Simulating Browser Login Flow ===\n")

# Step 1: Login (exactly as frontend does it)
print("1. Logging in...")
login_data = {
    "username": "mario.rossi@energysolutions.it",
    "password": "Demo123!"
}

login_response = requests.post(
    f"{API_URL}/auth/login",
    headers={
        "Content-Type": "application/x-www-form-urlencoded",
        "Origin": FRONTEND_URL,
        "Referer": f"{FRONTEND_URL}/login"
    },
    data=f"username={login_data['username']}&password={login_data['password']}"
)

print(f"   Status: {login_response.status_code}")

if login_response.status_code == 200:
    auth_data = login_response.json()
    print(f"   ✓ Login successful!")
    print(f"   User: {auth_data['user']['name']} ({auth_data['user']['role']})")
    print(f"   Token expires in: {auth_data['expires_in']} seconds")
    
    # This is what the frontend stores in localStorage
    print("\n2. Frontend would store in localStorage:")
    print(f"   kronos_access_token: {auth_data['access_token'][:50]}...")
    print(f"   kronos_refresh_token: {auth_data['refresh_token'][:50]}...")
    print(f"   kronos_user_data: {json.dumps(auth_data['user'], indent=2)}")
    
    # Step 2: Test authenticated request
    print("\n3. Testing authenticated request to plants endpoint...")
    
    plants_response = requests.get(
        f"{API_URL}/plants/",
        headers={
            "Authorization": f"Bearer {auth_data['access_token']}",
            "Accept": "application/json",
            "Origin": FRONTEND_URL,
            "Referer": f"{FRONTEND_URL}/plants"
        },
        params={"skip": 0, "limit": 20}
    )
    
    print(f"   Status: {plants_response.status_code}")
    
    if plants_response.status_code == 200:
        plants_data = plants_response.json()
        print(f"   ✓ Plants loaded successfully!")
        print(f"   Found {len(plants_data['items'])} plants")
        print(f"   Total: {plants_data['total']}")
    else:
        print(f"   ✗ Error: {plants_response.text}")
    
    print("\n4. Instructions for manual browser testing:")
    print("   a. Open browser console (F12)")
    print("   b. Check localStorage:")
    print("      localStorage.getItem('kronos_access_token')")
    print("   c. If token is missing, try logging out and back in")
    print("   d. Check Network tab for failed requests")
    print("   e. Look for CORS errors in console")
    
else:
    print(f"   ✗ Login failed: {login_response.text}")
    print("\n   Check that backend is running on port 8000")
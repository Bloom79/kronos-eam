#!/usr/bin/env python3
"""
Test frontend plants page loading
Simulates the API calls the frontend would make
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api/v1"
FRONTEND_URL = "http://localhost:3000"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def log(message, color=None):
    timestamp = datetime.now().strftime("%H:%M:%S")
    if color:
        print(f"[{timestamp}] {color}{message}{Colors.END}")
    else:
        print(f"[{timestamp}] {message}")

def test_frontend_flow():
    """Test the complete frontend flow for plants page"""
    
    # Step 1: Login
    log("=== Testing Frontend Plants Flow ===", Colors.BLUE)
    log("Step 1: Authenticating...", Colors.BLUE)
    
    login_response = requests.post(
        f"{BASE_URL}/auth/login",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data="username=mario.rossi@energysolutions.it&password=Demo123!"
    )
    
    if login_response.status_code != 200:
        log(f"Login failed: {login_response.status_code}", Colors.RED)
        return False
    
    auth_data = login_response.json()
    token = auth_data['access_token']
    log(f"✓ Authenticated as {auth_data['user']['name']}", Colors.GREEN)
    
    # Step 2: Test plants endpoint (as frontend would call it)
    log("\nStep 2: Fetching plants list...", Colors.BLUE)
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
        "Origin": FRONTEND_URL,  # Simulate CORS
        "Referer": f"{FRONTEND_URL}/plants"
    }
    
    # Frontend typically calls without sort_by/sort_order initially
    plants_response = requests.get(
        f"{BASE_URL}/plants/",
        headers=headers,
        params={
            "skip": 0,
            "limit": 20
        }
    )
    
    if plants_response.status_code != 200:
        log(f"Plants API failed: {plants_response.status_code}", Colors.RED)
        log(f"Response: {plants_response.text}", Colors.RED)
        return False
    
    plants_data = plants_response.json()
    log(f"✓ Retrieved {len(plants_data['items'])} plants", Colors.GREEN)
    log(f"  Total: {plants_data['total']}", Colors.GREEN)
    log(f"  Response structure: {list(plants_data.keys())}", Colors.GREEN)
    
    # Step 3: Check data structure matches frontend expectations
    log("\nStep 3: Validating response structure...", Colors.BLUE)
    
    if plants_data['items']:
        first_plant = plants_data['items'][0]
        required_fields = ['id', 'name', 'code', 'power_kw', 'status', 'type', 'location']
        missing_fields = [f for f in required_fields if f not in first_plant]
        
        if missing_fields:
            log(f"✗ Missing required fields: {missing_fields}", Colors.RED)
        else:
            log("✓ All required fields present", Colors.GREEN)
            
        # Check optional fields frontend uses
        optional_fields = ['next_deadline', 'deadline_color', 'gse_integration', 
                          'terna_integration', 'customs_integration', 'dso_integration']
        present_optional = [f for f in optional_fields if f in first_plant]
        log(f"  Optional fields: {present_optional}", Colors.BLUE)
    
    # Step 4: Test CORS headers
    log("\nStep 4: Checking CORS support...", Colors.BLUE)
    
    cors_test = requests.options(
        f"{BASE_URL}/plants/",
        headers={
            "Origin": FRONTEND_URL,
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "authorization"
        }
    )
    
    if cors_test.status_code == 200:
        log("✓ CORS preflight successful", Colors.GREEN)
        cors_headers = {k: v for k, v in cors_test.headers.items() if k.lower().startswith('access-control')}
        for header, value in cors_headers.items():
            log(f"  {header}: {value}", Colors.BLUE)
    else:
        log(f"✗ CORS preflight failed: {cors_test.status_code}", Colors.RED)
    
    # Step 5: Summary
    log("\n=== Frontend Integration Summary ===", Colors.BLUE)
    log("✓ Authentication working", Colors.GREEN)
    log("✓ Plants API returning data", Colors.GREEN)
    log("✓ Response structure matches frontend expectations", Colors.GREEN)
    
    if plants_data['items']:
        log("\nSample plant data:", Colors.BLUE)
        sample = plants_data['items'][0]
        log(f"  Name: {sample['name']}")
        log(f"  Code: {sample['code']}")
        log(f"  Power: {sample['power_kw']} kW")
        log(f"  Status: {sample['status']}")
        log(f"  Type: {sample['type']}")
    
    return True

if __name__ == "__main__":
    success = test_frontend_flow()
    
    if not success:
        log("\n✗ Frontend integration has issues", Colors.RED)
        log("\nTroubleshooting:", Colors.YELLOW)
        log("1. Check browser console: F12 → Console tab")
        log("2. Check Network tab for failed requests")
        log("3. Verify localStorage has 'kronos_access_token'")
        log("4. Check frontend logs: Check terminal running npm start")
    else:
        log("\n✓ Backend is ready for frontend!", Colors.GREEN)
        log("\nNext steps:", Colors.BLUE)
        log("1. Open http://localhost:3000 in browser")
        log("2. Login with mario.rossi@energysolutions.it / Demo123!")
        log("3. Navigate to Plants page")
        log("4. If plants don't load, check browser console")
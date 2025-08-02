#!/usr/bin/env python3
"""
Automated test script for plants API endpoint
Tests authentication, API responses, and common issues
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000/api/v1"
TEST_USER = {
    "username": "mario.rossi@energysolutions.it",
    "password": "Demo123!"
}

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

def test_auth():
    """Test authentication and get access token"""
    log("Testing authentication...", Colors.BLUE)
    
    # Test login
    response = requests.post(
        f"{BASE_URL}/auth/login",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data=f"username={TEST_USER['username']}&password={TEST_USER['password']}"
    )
    
    if response.status_code != 200:
        log(f"Login failed: {response.status_code} - {response.text}", Colors.RED)
        return None
    
    data = response.json()
    access_token = data.get("access_token")
    
    if not access_token:
        log("No access token in response", Colors.RED)
        return None
    
    log("Authentication successful", Colors.GREEN)
    log(f"User: {data['user']['name']} ({data['user']['role']})")
    log(f"Tenant: {data['user']['tenant_id']}")
    
    return access_token

def test_plants_endpoint(token):
    """Test plants list endpoint"""
    log("\nTesting plants endpoint...", Colors.BLUE)
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json"
    }
    
    # Test basic plants list
    response = requests.get(
        f"{BASE_URL}/plants/",
        headers=headers,
        params={
            "skip": 0,
            "limit": 20,
            "sort_by": "name",
            "sort_order": "asc"
        }
    )
    
    log(f"Response status: {response.status_code}")
    
    if response.status_code != 200:
        log(f"Plants API failed: {response.text}", Colors.RED)
        
        # Try to parse error details
        try:
            error_data = response.json()
            if "detail" in error_data:
                log(f"Error detail: {error_data['detail']}", Colors.RED)
            if "request_id" in error_data:
                log(f"Request ID: {error_data['request_id']}", Colors.YELLOW)
                log("Check logs with: grep '{request_id}' logs/api.log", Colors.YELLOW)
        except:
            pass
        
        return False
    
    data = response.json()
    log(f"Plants retrieved: {len(data.get('items', []))}", Colors.GREEN)
    log(f"Total plants: {data.get('total', 0)}")
    
    # Display plant summary
    if data.get('items'):
        log("\nPlant summary:", Colors.BLUE)
        for plant in data['items'][:3]:  # Show first 3
            log(f"  - {plant['name']} ({plant['code']}) - {plant['power_kw']} kW")
    
    return True

def test_plant_detail(token, plant_id):
    """Test single plant detail endpoint"""
    log(f"\nTesting plant detail for ID {plant_id}...", Colors.BLUE)
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json"
    }
    
    response = requests.get(
        f"{BASE_URL}/plants/{plant_id}",
        headers=headers
    )
    
    if response.status_code != 200:
        log(f"Plant detail failed: {response.status_code} - {response.text}", Colors.RED)
        return False
    
    data = response.json()
    log(f"Plant details retrieved: {data['name']}", Colors.GREEN)
    
    return True

def check_database_connection():
    """Check if database is accessible"""
    log("\nChecking database connection...", Colors.BLUE)
    
    try:
        # Use full URL for health endpoint (it's at root, not under /api/v1)
        response = requests.get("http://localhost:8000/health")
        if response.status_code == 200:
            log("API health check passed", Colors.GREEN)
            health_data = response.json()
            log(f"Database: {health_data['services']['database']}")
            log(f"Environment: {health_data['environment']}")
            return True
    except Exception as e:
        log(f"API not reachable: {e}", Colors.RED)
        return False
    
    return False

def main():
    log("=== Plants API Test Suite ===", Colors.BLUE)
    
    # Check API is running
    if not check_database_connection():
        log("\nAPI is not running. Start it with:", Colors.YELLOW)
        log("cd /home/bloom/sentrics/kronos-eam-backend")
        log("source venv/bin/activate")
        log("export PYTHONPATH=/home/bloom/sentrics/kronos-eam-backend")
        log("python app/main.py")
        sys.exit(1)
    
    # Test authentication
    token = test_auth()
    if not token:
        log("\nAuthentication failed. Cannot proceed with tests.", Colors.RED)
        sys.exit(1)
    
    # Test plants endpoint
    if test_plants_endpoint(token):
        log("\n✓ Plants API is working correctly", Colors.GREEN)
        
        # Try to get first plant for detail test
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/plants/", headers=headers, params={"limit": 1})
        if response.status_code == 200 and response.json().get('items'):
            plant_id = response.json()['items'][0]['id']
            test_plant_detail(token, plant_id)
    else:
        log("\n✗ Plants API has issues", Colors.RED)
        log("\nTroubleshooting steps:", Colors.YELLOW)
        log("1. Check backend logs: tail -f logs/api.log")
        log("2. Check database: psql -U kronos_user -d kronos_db")
        log("3. Verify plants exist: SELECT * FROM plants WHERE tenant_id = 'demo';")
    
    log("\n=== Test Complete ===", Colors.BLUE)

if __name__ == "__main__":
    main()
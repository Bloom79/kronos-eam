#!/usr/bin/env python3
"""
Test API login endpoint
"""

import requests
import json

def test_api_login():
    """Test login via API"""
    url = "http://localhost:8000/api/v1/auth/login"
    
    # Test with form data
    data = {
        "username": "mario.rossi@energysolutions.it",
        "password": "Demo123!"
    }
    
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Tenant-ID": "demo"
    }
    
    print(f"Testing login to: {url}")
    print(f"Headers: {headers}")
    print(f"Data: {data}")
    
    try:
        response = requests.post(url, data=data, headers=headers)
        print(f"\nStatus Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Text: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print("\n✅ Login successful!")
            print(f"Access Token: {result.get('access_token', '')[:20]}...")
            print(f"User: {result.get('user', {})}")
        else:
            print("\n❌ Login failed!")
            
    except Exception as e:
        print(f"\nError: {e}")

if __name__ == "__main__":
    test_api_login()
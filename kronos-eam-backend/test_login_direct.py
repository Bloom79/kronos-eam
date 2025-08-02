#!/usr/bin/env python3
"""
Test login directly
"""

import sys
sys.path.insert(0, '/home/bloom/sentrics/kronos-eam-backend')

from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import verify_password

def test_login(email, password):
    db = SessionLocal()
    
    try:
        # Find user
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            print(f"User not found: {email}")
            return False
            
        print(f"Found user: {user.name} (Tenant: {user.tenant_id})")
        
        # Verify password
        if verify_password(password, user.password_hash):
            print("✓ Password is correct!")
            return True
        else:
            print("✗ Password is incorrect")
            return False
            
    except Exception as e:
        print(f"Error: {e}")
        return False
    finally:
        db.close()

if __name__ == "__main__":
    print("Testing login credentials...\n")
    
    # Test both users
    test_login("demo@kronos-eam.local", "Demo123!")
    print("-" * 40)
    test_login("mario.rossi@energysolutions.it", "Demo123!")
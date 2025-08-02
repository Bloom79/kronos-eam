#!/usr/bin/env python3
"""
Complete fix for login issues
"""

import sys
sys.path.insert(0, '/home/bloom/sentrics/kronos-eam-backend')

from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash
from datetime import datetime

def fix_login():
    db = SessionLocal()
    
    try:
        print("=== Fixing Login Issues ===\n")
        
        # Get all demo tenant users
        users = db.query(User).filter(User.tenant_id == "demo").all()
        
        print(f"Found {len(users)} users in demo tenant:\n")
        
        for user in users:
            print(f"Fixing user: {user.email}")
            print(f"  Name: {user.name}")
            print(f"  Role: {user.role}")
            print(f"  Status: {user.status}")
            
            # Clear login attempts
            user.failed_login_attempts = 0
            user.locked_until = None
            
            # Set password using the model's setter
            user.password = "Demo123!"
            
            # Ensure user is active
            from app.models.user import UserStatusEnum
            user.status = UserStatusEnum.ACTIVE
            
            print(f"  ✓ Password set to: Demo123!")
            print(f"  ✓ Login attempts cleared")
            print(f"  ✓ Account unlocked")
            print()
        
        db.commit()
        print("=== All users fixed! ===\n")
        
        print("You can now login with:")
        print("------------------------")
        for user in users:
            print(f"Email: {user.email}")
            print(f"Password: Demo123!")
            print()
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_login()
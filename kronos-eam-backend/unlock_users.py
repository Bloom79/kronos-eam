#!/usr/bin/env python3
"""
Unlock user accounts that have been locked due to failed login attempts
"""

import sys
sys.path.insert(0, '/home/bloom/sentrics/kronos-eam-backend')

from app.core.database import SessionLocal
from app.models.user import User
from datetime import datetime

def unlock_users():
    db = SessionLocal()
    
    try:
        # Find all locked users
        locked_users = db.query(User).filter(User.is_locked == True).all()
        
        if not locked_users:
            print("No locked users found.")
            return
            
        print(f"Found {len(locked_users)} locked users:")
        
        for user in locked_users:
            print(f"\nUnlocking: {user.email}")
            print(f"  Name: {user.name}")
            print(f"  Tenant: {user.tenant_id}")
            print(f"  Failed attempts: {user.failed_attempts}")
            
            # Unlock the user
            user.is_locked = False
            user.failed_attempts = 0
            user.locked_until = None
            
        db.commit()
        print(f"\n✓ Unlocked {len(locked_users)} users")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    unlock_users()
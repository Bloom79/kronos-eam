#!/usr/bin/env python3
"""
Update passwords for all demo users
"""

import sys
sys.path.insert(0, '/home/bloom/sentrics/kronos-eam-backend')

from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

def update_passwords():
    db = SessionLocal()
    
    try:
        # Update all demo tenant users
        users = db.query(User).filter(User.tenant_id == "demo").all()
        
        for user in users:
            print(f"Updating password for: {user.email}")
            user.password_hash = get_password_hash("Demo123!")
            
        db.commit()
        print(f"\n✓ Updated passwords for {len(users)} users")
        print("\nYou can now login with:")
        for user in users:
            print(f"  Email: {user.email}")
            print(f"  Password: Demo123!")
            print(f"  Role: {user.role}")
            print()
            
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_passwords()
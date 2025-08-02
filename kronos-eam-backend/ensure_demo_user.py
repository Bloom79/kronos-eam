#!/usr/bin/env python3
"""
Ensure demo user exists with correct password
"""

import sys
sys.path.insert(0, '/home/bloom/sentrics/kronos-eam-backend')

from app.core.database import SessionLocal
from app.models.user import User, UserRoleEnum, UserStatusEnum
from app.core.security import get_password_hash
from datetime import datetime

def ensure_demo_user():
    db = SessionLocal()
    
    try:
        # Check if user exists
        user = db.query(User).filter(
            User.email == "mario.rossi@energysolutions.it",
            User.tenant_id == "demo"
        ).first()
        
        if user:
            print(f"User found: {user.name} ({user.email})")
            print(f"Status: {user.status}")
            print(f"Role: {user.role}")
            
            # Update password
            user.password_hash = get_password_hash("Demo123!")
            user.status = UserStatusEnum.ACTIVE
            db.commit()
            print("✓ Password updated to: Demo123!")
            
        else:
            print("User not found. Creating demo user...")
            
            # Create new user
            new_user = User(
                email="mario.rossi@energysolutions.it",
                name="Mario Rossi",
                password_hash=get_password_hash("Demo123!"),
                role=UserRoleEnum.ADMIN,
                status=UserStatusEnum.ACTIVE,
                tenant_id="demo",
                created_by="system",
                updated_by="system"
            )
            
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            
            print(f"✓ Created user: {new_user.name} ({new_user.email})")
            print(f"  Role: {new_user.role}")
            print(f"  Password: Demo123!")
            
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    ensure_demo_user()
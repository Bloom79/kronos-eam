#!/usr/bin/env python3
"""
Check existing users in the database
"""

import sys
sys.path.insert(0, '/home/bloom/sentrics/kronos-eam-backend')

from app.core.database import SessionLocal
from app.models.user import User

def check_users():
    db = SessionLocal()
    
    try:
        # Get all users
        users = db.query(User).all()
        
        print(f"Found {len(users)} users:\n")
        
        for user in users:
            print(f"ID: {user.id}")
            print(f"Email: {user.email}")
            print(f"Name: {user.name}")
            print(f"Tenant: {user.tenant_id}")
            print(f"Role: {user.role}")
            print(f"Status: {user.status}")
            print(f"Created: {user.created_at}")
            print("-" * 40)
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_users()
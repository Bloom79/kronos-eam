#!/usr/bin/env python3
"""
Clear failed login attempts from Redis and database
"""

import sys
sys.path.insert(0, '/home/bloom/sentrics/kronos-eam-backend')

from app.core.database import SessionLocal
from app.models.user import User
from app.api.deps import get_redis_client
import redis

def clear_login_attempts():
    db = SessionLocal()
    
    try:
        # Clear from database
        print("Clearing failed login attempts from database...")
        users = db.query(User).filter(
            (User.failed_login_attempts > 0) | (User.locked_until != None)
        ).all()
        
        for user in users:
            print(f"  Clearing {user.failed_login_attempts} attempts for {user.email}")
            user.failed_login_attempts = 0
            user.locked_until = None
            
        db.commit()
        print(f"✓ Cleared attempts for {len(users)} users")
        
        # Clear from Redis
        print("\nClearing failed login attempts from Redis...")
        try:
            r = redis.from_url("redis://localhost:6379/0", decode_responses=True)
            r.auth("redis_password")
            
            # Find all failed_login keys
            keys = r.keys("failed_login:*")
            if keys:
                for key in keys:
                    r.delete(key)
                print(f"✓ Cleared {len(keys)} Redis entries")
            else:
                print("✓ No Redis entries to clear")
        except Exception as e:
            print(f"Redis error (this is okay if Redis is disabled): {e}")
            
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    clear_login_attempts()
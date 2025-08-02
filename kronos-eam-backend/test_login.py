#!/usr/bin/env python3
"""
Test login functionality
"""

import os
import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# Set environment variables
os.environ.setdefault('ENVIRONMENT', 'development')
os.environ.setdefault('DEBUG', 'true')

from app.core.database import get_db_context
from app.models.user import User
from app.core.security import verify_password
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_login():
    """Test login with demo user"""
    email = "mario.rossi@energysolutions.it"
    password = "Demo123!"
    
    try:
        with get_db_context() as db:
            # Find user
            user = db.query(User).filter(
                User.email == email,
                User.tenant_id == "demo"
            ).first()
            
            if not user:
                logger.error(f"User {email} not found")
                return
            
            logger.info(f"Found user: {user.email}")
            logger.info(f"User status: {user.status}")
            logger.info(f"User role: {user.role}")
            logger.info(f"Has password hash: {bool(user.password_hash)}")
            
            # Test password verification
            if user.verify_password(password):
                logger.info("✅ Password verification successful!")
            else:
                logger.error("❌ Password verification failed!")
                
                # Try manual verification
                from app.core.security import verify_password
                manual_verify = verify_password(password, user.password_hash)
                logger.info(f"Manual verification: {manual_verify}")
            
    except Exception as e:
        logger.error(f"Error testing login: {e}")
        raise

if __name__ == "__main__":
    test_login()
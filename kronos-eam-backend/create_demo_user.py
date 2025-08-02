#!/usr/bin/env python3
"""
Create a demo user with proper password hash
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
from app.models.user import User, UserRoleEnum, UserStatusEnum
from app.core.security import get_password_hash
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_demo_user():
    """Create demo user with proper password"""
    email = "mario.rossi@energysolutions.it"
    password = "Demo123!"
    
    try:
        with get_db_context() as db:
            # Check if user already exists
            existing_user = db.query(User).filter(
                User.email == email,
                User.tenant_id == "demo"
            ).first()
            
            if existing_user:
                logger.info(f"User {email} already exists, updating password...")
                existing_user.password = password  # This will automatically hash it
                existing_user.status = UserStatusEnum.ACTIVE
                existing_user.email_verified = True
                db.commit()
                logger.info(f"Password updated for user: {email}")
            else:
                # Create new user
                user = User(
                    tenant_id="demo",
                    email=email,
                    name="Mario Rossi",
                    password=password,  # The setter will hash this
                    role=UserRoleEnum.ADMIN,
                    status=UserStatusEnum.ACTIVE,
                    email_verified=True,
                    language="it",
                    timezone="Europe/Rome"
                )
                db.add(user)
                db.commit()
                logger.info(f"Created user: {email}")
            
            logger.info(f"Demo user ready: {email} / {password}")
            
    except Exception as e:
        logger.error(f"Error creating demo user: {e}")
        raise

if __name__ == "__main__":
    create_demo_user()
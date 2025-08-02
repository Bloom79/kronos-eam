#!/usr/bin/env python3
"""
Check existing plants in the database
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
from app.models.plant import Plant
from app.models.user import User
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_plants():
    """Check existing plants in database"""
    
    try:
        with get_db_context() as db:
            # Count total plants
            total_plants = db.query(Plant).count()
            logger.info(f"Total plants in database: {total_plants}")
            
            # Count by tenant
            tenant_counts = {}
            plants = db.query(Plant).all()
            for plant in plants:
                tenant_counts[plant.tenant_id] = tenant_counts.get(plant.tenant_id, 0) + 1
            
            logger.info("Plants by tenant:")
            for tenant_id, count in tenant_counts.items():
                logger.info(f"  {tenant_id}: {count} plants")
            
            # List demo tenant plants
            demo_plants = db.query(Plant).filter(Plant.tenant_id == "demo").all()
            if demo_plants:
                logger.info("\nDemo tenant plants:")
                for plant in demo_plants:
                    logger.info(f"  - {plant.name} ({plant.code}) - Status: {plant.status} - Power: {plant.power}")
            else:
                logger.info("\nNo plants found for demo tenant")
            
            # Check users
            demo_users = db.query(User).filter(User.tenant_id == "demo").all()
            logger.info(f"\nDemo tenant users: {len(demo_users)}")
            for user in demo_users:
                logger.info(f"  - {user.email} - Role: {user.role}")
                
    except Exception as e:
        logger.error(f"Error checking plants: {e}")
        raise

if __name__ == "__main__":
    check_plants()
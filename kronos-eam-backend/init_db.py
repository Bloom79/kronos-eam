#!/usr/bin/env python3
"""
Initialize the Kronos EAM database with proper PostgreSQL setup
Creates all tables and sets up multi-tenant structure
"""

import os
import sys
import asyncio
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# Set environment variables
os.environ.setdefault('ENVIRONMENT', 'development')
os.environ.setdefault('DEBUG', 'true')

from app.core.database import init_db, get_engine, Base
from app.core.config import settings
from app.models import tenant, user, plant, workflow, document, chat, notification, integration
from app.models.tenant import Tenant, TenantPlanEnum, TenantStatusEnum
from app.models.user import User, UserRoleEnum, UserStatusEnum
from app.models.plant import Plant, PlantStatusEnum, PlantTypeEnum
import logging
from datetime import datetime, timedelta

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def wait_for_db():
    """Wait for database to be ready"""
    import time
    import psycopg2
    
    max_retries = 30
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            # Extract connection details from DATABASE_URL
            db_url = str(settings.DATABASE_URL)
            if "postgresql://" in db_url:
                import sqlalchemy
                from sqlalchemy import create_engine
                
                engine = create_engine(db_url)
                connection = engine.connect()
                connection.close()
                engine.dispose()
                logger.info("Database connection successful!")
                return True
                
        except Exception as e:
            logger.info(f"Database not ready yet (attempt {retry_count + 1}): {e}")
            time.sleep(2)
            retry_count += 1
    
    logger.error("Could not connect to database after 30 attempts")
    return False

def create_demo_data():
    """Create demo data for testing"""
    from app.core.database import get_db_context
    from app.models.tenant import Tenant
    from app.models.user import User
    from app.models.plant import Plant
    from datetime import datetime
    
    logger.info("Creating demo data...")
    
    try:
        with get_db_context() as db:
            # Create demo tenant
            demo_tenant = Tenant(
                id="demo",
                name="Demo Tenant",
                status=TenantStatusEnum.ACTIVE,
                plan=TenantPlanEnum.ENTERPRISE,
                plan_expiry=datetime.utcnow() + timedelta(days=365),
                features_enabled={"ai_assistant": True, "voice_features": True, "rpa_automation": True, "advanced_analytics": True},
                max_users=100,
                max_plants=100,
                created_at=datetime.utcnow()
            )
            db.add(demo_tenant)
            db.flush()  # Ensure tenant is created first
            
            # Create demo user
            demo_user = User(
                tenant_id="demo",
                email="demo@kronos-eam.local",
                name="Demo Admin",
                password_hash="$2b$12$dummy_hash_for_local_user",  # This is just for init
                role=UserRoleEnum.ADMIN,
                status=UserStatusEnum.ACTIVE,
                email_verified=True,
                created_at=datetime.utcnow()
            )
            db.add(demo_user)
            db.flush()  # Ensure user is created
            
            # Create demo impianto
            demo_impianto = Plant(
                tenant_id="demo",
                name="Plant Solare Demo",
                code="IT001E00123456",
                power="50 kW",
                power_kw=50.0,
                status=PlantStatusEnum.IN_OPERATION,
                type=PlantTypeEnum.PHOTOVOLTAIC,
                location="Roma",
                address="Via Roma 123",
                municipality="Roma",
                province="RM",
                region="Lazio",
                created_at=datetime.utcnow(),
                created_by=demo_user.id  # Reference the created user
            )
            db.add(demo_impianto)
            
            db.commit()
            logger.info("Demo data created successfully!")
            
    except Exception as e:
        logger.error(f"Error creating demo data: {e}")
        raise

def main():
    """Main initialization function"""
    logger.info("🚀 Starting Kronos EAM Database Initialization")
    logger.info("=" * 50)
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Database URL: {settings.DATABASE_URL}")
    logger.info(f"Tenant Mode: {settings.TENANT_ISOLATION_MODE}")
    logger.info("=" * 50)
    
    # Wait for database to be ready
    if not wait_for_db():
        logger.error("Database initialization failed - could not connect")
        sys.exit(1)
    
    try:
        # Initialize database for default tenant
        logger.info("Initializing main database tables...")
        init_db()
        
        # Initialize database for demo tenant (if strict mode)
        if settings.TENANT_ISOLATION_MODE == "strict":
            logger.info("Initializing demo tenant database...")
            init_db(tenant_id="demo")
        
        # Create demo data
        create_demo_data()
        
        logger.info("=" * 50)
        logger.info("✅ Database initialization completed successfully!")
        logger.info("Demo tenant: demo")
        logger.info("Demo user: local_user@local.test")
        logger.info("Demo impianto: Plant Solare Demo (ID: 1)")
        logger.info("=" * 50)
        
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
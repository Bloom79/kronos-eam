#!/usr/bin/env python3
"""
Initialize Cloud SQL database with all tables
This script runs locally and will be deployed to Cloud Run to initialize the database
"""
import os
import sys
from sqlalchemy import create_engine
from app.core.database import Base

# Import all models to register them with Base
from app.models import tenant, user, plant, workflow, document, chat, notification, integration

def init_database():
    # Get password from environment
    db_password = os.getenv("DB_PASSWORD", "")
    if not db_password:
        print("ERROR: DB_PASSWORD environment variable not set")
        sys.exit(1)

    # Use Cloud SQL socket path (same as backend)
    connection_name = "kronos-eam-prod-20250802:europe-west1:kronos-db"
    database_url = f"postgresql://postgres:{db_password}@/kronos_eam?host=/cloudsql/{connection_name}"

    print(f"Connecting to database via Cloud SQL socket: {connection_name}")

    try:
        engine = create_engine(database_url, echo=True)

        print("\nCreating all tables...")
        Base.metadata.create_all(bind=engine)

        print("\n✅ Database initialized successfully!")
        print(f"Created tables: {', '.join(Base.metadata.tables.keys())}")

    except Exception as e:
        print(f"\n❌ Error initializing database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    init_database()

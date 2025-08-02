#!/usr/bin/env python3
"""
Database Initialization Script for Kronos EAM
Creates all required tables with correct schema for production deployment
"""

import os
import sys
import logging
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, text
from sqlalchemy.exc import ProgrammingError
from app.core.config import settings
from app.core.database import Base, init_db
from app.models import (
    tenant, user, impianto, workflow, document, 
    integration, notification, chat
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_database_if_not_exists():
    """Create the database if it doesn't exist"""
    # Parse database URL to get database name
    db_url = str(settings.DATABASE_URL)
    if 'postgresql' in db_url:
        # Extract database name
        db_name = db_url.split('/')[-1].split('?')[0]
        
        # Connect to postgres database to create the target database
        postgres_url = db_url.rsplit('/', 1)[0] + '/postgres'
        engine = create_engine(postgres_url, isolation_level='AUTOCOMMIT')
        
        try:
            with engine.connect() as conn:
                # Check if database exists
                result = conn.execute(
                    text("SELECT 1 FROM pg_database WHERE datname = :dbname"),
                    {"dbname": db_name}
                ).fetchone()
                
                if not result:
                    conn.execute(text(f'CREATE DATABASE "{db_name}"'))
                    logger.info(f"Created database: {db_name}")
                else:
                    logger.info(f"Database already exists: {db_name}")
        except Exception as e:
            logger.error(f"Error creating database: {e}")
            raise
        finally:
            engine.dispose()


def create_extensions():
    """Create required PostgreSQL extensions"""
    engine = create_engine(str(settings.DATABASE_URL))
    
    extensions = [
        "pgcrypto",  # For UUID generation
        "pg_trgm",   # For text search
    ]
    
    with engine.connect() as conn:
        for ext in extensions:
            try:
                conn.execute(text(f"CREATE EXTENSION IF NOT EXISTS {ext}"))
                conn.commit()
                logger.info(f"Created extension: {ext}")
            except Exception as e:
                logger.warning(f"Could not create extension {ext}: {e}")
                conn.rollback()


def create_custom_types():
    """Create custom database types and enums"""
    engine = create_engine(str(settings.DATABASE_URL))
    
    with engine.connect() as conn:
        # Create ENUMs for workflow types
        enums = [
            ("workflow_status_enum", ["Draft", "Active", "Paused", "Completed", "Cancelled"]),
            ("task_status_enum", ["To Start", "In Progress", "Completed", "Delayed", "Blocked"]),
            ("task_priority_enum", ["High", "Medium", "Low"]),
            ("workflow_category_enum", ["Activation", "Fiscal", "Incentives", "Changes", "Maintenance", "Compliance"]),
            ("entity_enum", ["DSO", "Terna", "GSE", "Customs", "Municipality", "Region", "Superintendence"]),
        ]
        
        for enum_name, values in enums:
            try:
                # Check if type exists
                result = conn.execute(
                    text("SELECT 1 FROM pg_type WHERE typname = :name"),
                    {"name": enum_name}
                ).fetchone()
                
                if not result:
                    values_str = ", ".join([f"'{v}'" for v in values])
                    conn.execute(text(f"CREATE TYPE {enum_name} AS ENUM ({values_str})"))
                    conn.commit()
                    logger.info(f"Created enum type: {enum_name}")
                else:
                    logger.info(f"Enum type already exists: {enum_name}")
            except Exception as e:
                logger.warning(f"Could not create enum {enum_name}: {e}")
                conn.rollback()


def create_workflow_tables():
    """Create workflow-related tables with correct schema"""
    engine = create_engine(str(settings.DATABASE_URL))
    
    with engine.connect() as conn:
        # Create workflow_templates table
        try:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS workflow_templates (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(200) NOT NULL,
                    description TEXT,
                    category VARCHAR(50),
                    plant_type VARCHAR(50),
                    min_power FLOAT,
                    max_power FLOAT,
                    estimated_duration_days INTEGER,
                    recurrence VARCHAR(50),
                    stages JSON NOT NULL DEFAULT '[]'::json,
                    tasks JSON NOT NULL DEFAULT '[]'::json,
                    required_entities JSON DEFAULT '[]'::json,
                    base_documents JSON DEFAULT '[]'::json,
                    activation_conditions JSON DEFAULT '{}'::json,
                    deadline_config JSON DEFAULT '{}'::json,
                    active BOOLEAN DEFAULT TRUE,
                    tenant_id VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_by INTEGER,
                    updated_by INTEGER,
                    is_deleted BOOLEAN DEFAULT FALSE,
                    deleted_at TIMESTAMP,
                    deleted_by INTEGER
                )
            """))
            conn.commit()
            logger.info("Created workflow_templates table")
        except ProgrammingError as e:
            if "already exists" in str(e):
                logger.info("Table workflow_templates already exists")
            else:
                logger.error(f"Error creating workflow_templates: {e}")
            conn.rollback()
        
        # Create task_templates table
        try:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS task_templates (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(200) NOT NULL,
                    description TEXT,
                    default_responsible VARCHAR(100),
                    estimated_duration_hours FLOAT,
                    required_documents JSON DEFAULT '[]'::json,
                    checkpoints JSON DEFAULT '[]'::json,
                    integration VARCHAR(50),
                    automation_available BOOLEAN DEFAULT FALSE,
                    tenant_id VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_by INTEGER,
                    updated_by INTEGER,
                    is_deleted BOOLEAN DEFAULT FALSE,
                    deleted_at TIMESTAMP,
                    deleted_by INTEGER
                )
            """))
            conn.commit()
            logger.info("Created task_templates table")
        except ProgrammingError as e:
            if "already exists" in str(e):
                logger.info("Table task_templates already exists")
            else:
                logger.error(f"Error creating task_templates: {e}")
            conn.rollback()
        
        # Create indexes
        indexes = [
            ("idx_workflow_templates_tenant", "workflow_templates", "tenant_id"),
            ("idx_workflow_templates_category", "workflow_templates", "category"),
            ("idx_workflow_templates_active", "workflow_templates", "active"),
            ("idx_task_templates_tenant", "task_templates", "tenant_id"),
        ]
        
        for idx_name, table_name, column_name in indexes:
            try:
                conn.execute(text(f"CREATE INDEX IF NOT EXISTS {idx_name} ON {table_name} ({column_name})"))
                conn.commit()
                logger.info(f"Created index: {idx_name}")
            except Exception as e:
                logger.warning(f"Could not create index {idx_name}: {e}")
                conn.rollback()


def insert_default_workflow_templates():
    """Insert default workflow templates for renewable energy"""
    engine = create_engine(str(settings.DATABASE_URL))
    
    # Import the workflow data
    from app.data.renewable_energy_workflow import RENEWABLE_ENERGY_WORKFLOWS
    import json
    
    with engine.connect() as conn:
        # Check if templates already exist
        result = conn.execute(text("SELECT COUNT(*) FROM workflow_templates")).scalar()
        
        if result == 0:
            logger.info("Inserting default workflow templates...")
            
            for workflow in RENEWABLE_ENERGY_WORKFLOWS:
                try:
                    # Extract all tasks from stages
                    all_tasks = []
                    if "stages" in workflow:
                        for stage in workflow["stages"]:
                            if "tasks" in stage:
                                all_tasks.extend(stage["tasks"])
                    
                    conn.execute(text("""
                        INSERT INTO workflow_templates (
                            name, description, category, plant_type,
                            min_power, max_power, estimated_duration_days,
                            recurrence, stages, tasks, required_entities,
                            base_documents, activation_conditions, deadline_config,
                            active
                        ) VALUES (
                            :name, :description, :category, :plant_type,
                            :min_power, :max_power, :estimated_duration_days,
                            :recurrence, :stages, :tasks, :required_entities,
                            :base_documents, :activation_conditions, 
                            :deadline_config, :active
                        )
                    """), {
                        "name": workflow["nome"],
                        "description": workflow["descrizione"],
                        "category": workflow["categoria"].value if hasattr(workflow["categoria"], 'value') else workflow["categoria"],
                        "plant_type": workflow["tipo_impianto"],
                        "min_power": workflow.get("potenza_minima", 0),
                        "max_power": workflow.get("potenza_massima"),
                        "estimated_duration_days": workflow["durata_stimata_giorni"],
                        "recurrence": workflow["ricorrenza"],
                        "stages": json.dumps(workflow.get("stages", [])),
                        "tasks": json.dumps(all_tasks),
                        "required_entities": json.dumps(workflow.get("enti_richiesti", [])),
                        "base_documents": json.dumps(workflow.get("documenti_base", [])),
                        "activation_conditions": json.dumps(workflow.get("condizioni_attivazione", {})),
                        "deadline_config": json.dumps(workflow.get("scadenza_config", {})),
                        "active": workflow.get("attivo", True)
                    })
                    logger.info(f"Inserted workflow template: {workflow['nome']}")
                except Exception as e:
                    logger.error(f"Error inserting template {workflow['nome']}: {e}")
                    conn.rollback()
                    continue
            
            conn.commit()
            logger.info("Default workflow templates inserted successfully")
        else:
            logger.info(f"Workflow templates already exist ({result} templates found)")


def create_initial_data():
    """Create initial data for demo tenant"""
    engine = create_engine(str(settings.DATABASE_URL))
    
    with engine.connect() as conn:
        # Create demo tenant if not exists
        try:
            result = conn.execute(
                text("SELECT 1 FROM tenants WHERE id = :id"),
                {"id": "demo"}
            ).fetchone()
            
            if not result:
                # Get the actual enum value from the model
                from app.models.tenant import TenantStatusEnum
                conn.execute(text("""
                    INSERT INTO tenants (id, name, status, configuration, plan_expiry)
                    VALUES ('demo', 'Demo Tenant', :status, '{}', CURRENT_DATE + INTERVAL '30 days')
                """), {"status": TenantStatusEnum.ACTIVE.value})
                conn.commit()
                logger.info("Created demo tenant")
        except Exception as e:
            logger.warning(f"Could not create demo tenant: {e}")
            conn.rollback()
        
        # Create demo user if not exists
        try:
            result = conn.execute(
                text("SELECT 1 FROM users WHERE email = :email"),
                {"email": "demo@kronos-eam.local"}
            ).fetchone()
            
            if not result:
                # Hash password 'demo123'
                from app.core.security import get_password_hash
                hashed_password = get_password_hash("demo123")
                
                conn.execute(text("""
                    INSERT INTO users (
                        email, name, surname, role, status, 
                        password_hash, tenant_id
                    ) VALUES (
                        'demo@kronos-eam.local', 'Demo', 'User', 'Admin', 
                        'Active', :password, 'demo'
                    )
                """), {"password": hashed_password})
                conn.commit()
                logger.info("Created admin user")
        except Exception as e:
            logger.warning(f"Could not create admin user: {e}")
            conn.rollback()


def main():
    """Main initialization function"""
    logger.info("Starting database initialization...")
    
    try:
        # Step 1: Create database if needed
        create_database_if_not_exists()
        
        # Step 2: Create extensions
        create_extensions()
        
        # Step 3: Create custom types
        create_custom_types()
        
        # Step 4: Initialize base tables
        logger.info("Creating base tables...")
        init_db()
        
        # Step 5: Create workflow tables
        create_workflow_tables()
        
        # Step 6: Insert default workflow templates
        insert_default_workflow_templates()
        
        # Step 7: Create initial data
        create_initial_data()
        
        logger.info("Database initialization completed successfully!")
        
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise


if __name__ == "__main__":
    main()
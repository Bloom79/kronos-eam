#!/usr/bin/env python3
"""
Data Initialization Script for Kronos EAM
Loads initial data after schema creation
Separate from schema migrations for better maintainability
"""

import os
import sys
import logging
from pathlib import Path
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import get_password_hash
from app.models.tenant import Tenant, TenantStatusEnum
from app.models.user import User, UserRoleEnum, UserStatusEnum
from app.models.plant import Plant, PlantStatusEnum, PlantTypeEnum
from app.data.renewable_energy_workflow import RENEWABLE_ENERGY_WORKFLOWS

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init_demo_data(engine):
    """Initialize demo data for the application"""
    with Session(engine) as session:
        try:
            # Create demo tenant
            demo_tenant = session.query(Tenant).filter_by(id="demo").first()
            if not demo_tenant:
                demo_tenant = Tenant(
                    id="demo",
                    name="Demo Tenant",
                    status=TenantStatusEnum.ACTIVE,
                    plan_expiry=datetime.now().date() + timedelta(days=30),
                    configuration={}
                )
                session.add(demo_tenant)
                session.commit()
                logger.info("Created demo tenant")
            else:
                logger.info("Demo tenant already exists")

            # Create demo user
            demo_user = session.query(User).filter_by(email="demo@kronos-eam.local").first()
            if not demo_user:
                demo_user = User(
                    email="demo@kronos-eam.local",
                    password_hash=get_password_hash("demo123"),
                    name="Demo",
                    surname="User",
                    role=UserRoleEnum.ADMIN,
                    status=UserStatusEnum.ACTIVE,
                    tenant_id="demo"
                )
                session.add(demo_user)
                session.commit()
                logger.info("Created demo user")
            else:
                logger.info("Demo user already exists")

            # Create sample plants
            plants_data = [
                {
                    "name": "Impianto Solare Milano",
                    "code": "SOL-MI-001",
                    "power": "100 kW",
                    "power_kw": 100,
                    "status": "In Operation",  # Use string values directly
                    "type": "Photovoltaic",
                    "location": "Via Roma 1",
                    "municipality": "Milano",
                    "province": "MI",
                    "region": "Lombardia"
                },
                {
                    "name": "Parco Eolico Sardegna",
                    "code": "EOL-CA-001",
                    "power": "2.5 MW",
                    "power_kw": 2500,
                    "status": "In Operation",
                    "type": "Wind",
                    "location": "Località Ventosa",
                    "municipality": "Cagliari",
                    "province": "CA",
                    "region": "Sardegna"
                },
                {
                    "name": "Centrale Idroelettrica Trento",
                    "code": "IDR-TN-001",
                    "power": "500 kW",
                    "power_kw": 500,
                    "status": "Under Construction",
                    "type": "Hydroelectric",
                    "location": "Valle del Fiume",
                    "municipality": "Trento",
                    "province": "TN",
                    "region": "Trentino-Alto Adige"
                }
            ]

            for plant_data in plants_data:
                existing_plant = session.query(Plant).filter_by(code=plant_data["code"]).first()
                if not existing_plant:
                    plant = Plant(**plant_data, tenant_id="demo")
                    session.add(plant)
                    logger.info(f"Created plant: {plant_data['name']}")
                else:
                    logger.info(f"Plant already exists: {plant_data['code']}")

            session.commit()

            # Load workflow templates
            load_workflow_templates(session)

        except Exception as e:
            logger.error(f"Error initializing demo data: {e}")
            session.rollback()
            raise


def load_workflow_templates(session: Session):
    """Load workflow templates from data files"""
    # Check if templates already exist
    existing_count = session.execute(
        text("SELECT COUNT(*) FROM workflow_templates")
    ).scalar()
    
    if existing_count > 0:
        logger.info(f"Workflow templates already exist ({existing_count} templates)")
        return
    
    logger.info("Loading workflow templates...")
    
    import json
    for workflow in RENEWABLE_ENERGY_WORKFLOWS:
        try:
            # Extract all tasks from stages
            all_tasks = []
            if "stages" in workflow:
                for stage in workflow["stages"]:
                    if "tasks" in stage:
                        all_tasks.extend(stage["tasks"])
            
            # Insert template
            session.execute(text("""
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
            logger.info(f"Loaded workflow template: {workflow['nome']}")
            
        except Exception as e:
            logger.error(f"Error loading template {workflow['nome']}: {e}")
            raise
    
    session.commit()
    logger.info("Workflow templates loaded successfully")


def main():
    """Main initialization function"""
    logger.info("Starting data initialization...")
    
    try:
        # Create engine
        engine = create_engine(str(settings.DATABASE_URL))
        
        # Initialize demo data
        init_demo_data(engine)
        
        logger.info("Data initialization completed successfully!")
        
    except Exception as e:
        logger.error(f"Data initialization failed: {e}")
        raise


if __name__ == "__main__":
    main()
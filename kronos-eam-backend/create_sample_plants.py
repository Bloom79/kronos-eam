#!/usr/bin/env python3
"""
Create sample plants for demo tenant
"""

import os
import sys
from pathlib import Path
from datetime import datetime, timedelta, timezone
import random

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# Set environment variables
os.environ.setdefault('ENVIRONMENT', 'development')
os.environ.setdefault('DEBUG', 'true')

from app.core.database import get_db_context
from app.models.plant import Plant, PlantRegistry, ComplianceChecklist, PlantStatusEnum, PlantTypeEnum
from app.models.user import User
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_sample_plants():
    """Create sample plants for demo tenant"""
    
    sample_plants = [
        {
            "name": "Solar Park Milano Nord",
            "code": "PV-MI-001",
            "power": "1.5 MW",
            "power_kw": 1500,
            "status": PlantStatusEnum.IN_OPERATION,
            "type": PlantTypeEnum.PHOTOVOLTAIC,
            "location": "Via dell'Energia 15, Milano",
            "municipality": "Milano",
            "province": "MI",
            "region": "Lombardia",
            "gse_integration": True,
            "terna_integration": True,
            "customs_integration": True,
            "dso_integration": True,
        },
        {
            "name": "Wind Farm Apulia 1",
            "code": "WF-BA-001",
            "power": "10 MW",
            "power_kw": 10000,
            "status": PlantStatusEnum.IN_OPERATION,
            "type": PlantTypeEnum.WIND,
            "location": "SP 123 km 45, Bari",
            "municipality": "Bari",
            "province": "BA",
            "region": "Puglia",
            "gse_integration": True,
            "terna_integration": True,
            "customs_integration": True,
            "dso_integration": False,
        },
        {
            "name": "Photovoltaic Roma Est",
            "code": "PV-RM-002",
            "power": "500 kW",
            "power_kw": 500,
            "status": PlantStatusEnum.UNDER_CONSTRUCTION,
            "type": PlantTypeEnum.PHOTOVOLTAIC,
            "location": "Via Solare 88, Roma",
            "municipality": "Roma",
            "province": "RM",
            "region": "Lazio",
            "gse_integration": False,
            "terna_integration": False,
            "customs_integration": False,
            "dso_integration": True,
        },
        {
            "name": "Biomass Plant Toscana",
            "code": "BM-FI-001",
            "power": "2 MW",
            "power_kw": 2000,
            "status": PlantStatusEnum.IN_OPERATION,
            "type": PlantTypeEnum.BIOMASS,
            "location": "Zona Industriale 12, Firenze",
            "municipality": "Firenze",
            "province": "FI",
            "region": "Toscana",
            "gse_integration": True,
            "terna_integration": True,
            "customs_integration": True,
            "dso_integration": True,
        },
        {
            "name": "Small Solar Verona",
            "code": "PV-VR-003",
            "power": "20 kW",
            "power_kw": 20,
            "status": PlantStatusEnum.IN_OPERATION,
            "type": PlantTypeEnum.PHOTOVOLTAIC,
            "location": "Via Industria 5, Verona",
            "municipality": "Verona",
            "province": "VR",
            "region": "Veneto",
            "gse_integration": True,
            "terna_integration": False,
            "customs_integration": False,
            "dso_integration": True,
        }
    ]
    
    try:
        with get_db_context() as db:
            # Get demo user
            demo_user = db.query(User).filter(
                User.email == "mario.rossi@energysolutions.it",
                User.tenant_id == "demo"
            ).first()
            
            if not demo_user:
                logger.error("Demo user not found. Please run create_demo_user.py first")
                return
            
            for plant_data in sample_plants:
                # Check if plant already exists
                existing = db.query(Plant).filter(
                    Plant.code == plant_data["code"],
                    Plant.tenant_id == "demo"
                ).first()
                
                if existing:
                    logger.info(f"Plant {plant_data['code']} already exists, skipping...")
                    continue
                
                # Create plant
                plant = Plant(
                    tenant_id="demo",
                    **plant_data
                )
                
                # Add random next deadline
                deadline_days = random.randint(30, 365)
                plant.next_deadline = datetime.now(timezone.utc) + timedelta(days=deadline_days)
                plant.next_deadline_type = random.choice([
                    "Annual Declaration",
                    "Meter Calibration",
                    "Safety Inspection",
                    "License Renewal"
                ])
                
                # Set deadline color based on days
                if deadline_days < 30:
                    plant.deadline_color = "red"
                elif deadline_days < 90:
                    plant.deadline_color = "yellow"
                else:
                    plant.deadline_color = "green"
                
                db.add(plant)
                db.flush()
                
                # Create registry
                registry = PlantRegistry(
                    tenant_id="demo",
                    pod=f"IT001E{plant.code.replace('-', '')}",
                    gaudi=f"GAU{random.randint(100000, 999999)}",
                    censimp=f"CEN{random.randint(100000, 999999)}",
                    owner="Energy Solutions S.r.l.",
                    tax_code="IT12345678901",
                    pec="info@energysolutions.it",
                    phone="+39 02 1234567",
                    address=plant.location,
                    municipality=plant.municipality,
                    province=plant.province,
                    region=plant.region,
                    technology=plant.type.value,
                    connection_type="BT" if plant.power_kw < 100 else "MT",
                    grid_operator="E-Distribuzione"
                )
                db.add(registry)
                db.flush()
                
                # Update plant with registry ID
                plant.registry_id = registry.id
                
                # Set registry's plant_id
                registry.plant_id = plant.id
                
                # Create compliance checklist
                checklist = ComplianceChecklist(
                    tenant_id="demo",
                    plant_id=plant.id,
                    dso_connection=plant.dso_integration,
                    terna_registration=plant.terna_integration,
                    gse_activation=plant.gse_integration,
                    customs_license=plant.customs_integration,
                    spi_verification=random.choice([True, False]),
                    consumption_declaration=random.choice([True, False]),
                    compliance_score=random.randint(60, 100)
                )
                db.add(checklist)
                
                logger.info(f"Created plant: {plant.name} ({plant.code})")
            
            db.commit()
            logger.info("Sample plants created successfully!")
            
    except Exception as e:
        logger.error(f"Error creating sample plants: {e}")
        raise

if __name__ == "__main__":
    create_sample_plants()
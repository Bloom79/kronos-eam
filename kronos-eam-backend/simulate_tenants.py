#!/usr/bin/env python3
"""
Simulate multi-tenant environment for testing
Creates multiple tenants with isolated data
"""

import os
import sys
import asyncio
from pathlib import Path
from datetime import datetime, timedelta

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# Set environment variables
os.environ.setdefault('ENVIRONMENT', 'development')
os.environ.setdefault('DEBUG', 'true')
os.environ.setdefault('OPENAI_API_KEY', 'dummy')
os.environ.setdefault('GOOGLE_CLOUD_PROJECT', 'dummy')
os.environ.setdefault('GOOGLE_APPLICATION_CREDENTIALS', 'dummy')

from app.core.database import get_db_context, init_db
from app.core.config import settings
from app.models.tenant import Tenant, TenantPlanEnum, TenantStatusEnum
from app.models.user import User, UserRoleEnum, UserStatusEnum
from app.models.plant import Plant, PlantTypeEnum, PlantStatusEnum, PlantRegistry
from app.core.security import get_password_hash
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_tenant_data():
    """Create multiple tenants with different configurations"""
    tenants_data = [
        {
            "id": "demo",
            "name": "Demo Energy Solutions",
            "plan": TenantPlanEnum.PROFESSIONAL,
            "status": TenantStatusEnum.ACTIVE,
            "plan_expiry_date": datetime.now() + timedelta(days=365),
            "max_users": 10,
            "max_plants": 50,
            "max_storage_gb": 100,
            "contact_email": "demo@energysolutions.it",
            "contact_phone": "06-12345678",
            "address": "Via Roma 123, Roma",
            "vat_number": "IT12345678901",
            "features_enabled": {
                "ai_assistant": True,
                "voice_features": True,
                "rpa_automation": True,
                "advanced_analytics": True
            },
            "configuration": {
                "default_portal": "gse",
                "auto_notifications": True,
                "backup_frequency": "daily"
            }
        },
        {
            "id": "greencorp",
            "name": "Green Corporation S.p.A.",
            "plan": TenantPlanEnum.ENTERPRISE,
            "status": TenantStatusEnum.ACTIVE,
            "plan_expiry_date": datetime.now() + timedelta(days=365),
            "max_users": 50,
            "max_plants": 500,
            "max_storage_gb": 1000,
            "contact_email": "admin@greencorp.it",
            "contact_phone": "02-87654321",
            "address": "Via Milano 456, Milano",
            "vat_number": "IT98765432109",
            "features_enabled": {
                "ai_assistant": True,
                "voice_features": True,
                "rpa_automation": True,
                "advanced_analytics": True
            },
            "configuration": {
                "default_portal": "terna",
                "auto_notifications": True,
                "backup_frequency": "hourly",
                "custom_branding": True
            }
        },
        {
            "id": "solarpro",
            "name": "Solar Pro Italia",
            "plan": TenantPlanEnum.BUSINESS,
            "status": TenantStatusEnum.ACTIVE,
            "plan_expiry_date": datetime.now() + timedelta(days=180),
            "max_users": 25,
            "max_plants": 200,
            "max_storage_gb": 500,
            "contact_email": "info@solarpro.it",
            "contact_phone": "011-9876543",
            "address": "Via Torino 789, Torino",
            "vat_number": "IT11223344556",
            "features_enabled": {
                "ai_assistant": True,
                "voice_features": False,
                "rpa_automation": True,
                "advanced_analytics": False
            },
            "configuration": {
                "default_portal": "dso",
                "auto_notifications": False,
                "backup_frequency": "weekly"
            }
        }
    ]
    
    hashed_password = get_password_hash("password")

    users_data = [
        # Demo tenant users
        {
            "id": 1,
            "tenant_id": "demo",
            "name": "Mario Rossi",
            "email": "mario.rossi@energysolutions.it",
            "role": UserRoleEnum.ADMIN,
            "status": UserStatusEnum.ACTIVE,
            "password_hash": hashed_password,
            "email_verified": True,
            "permissions": ["read", "write", "admin", "ai_assistant"]
        },
        {
            "id": 2,
            "tenant_id": "demo",
            "name": "Luigi Bianchi",
            "email": "luigi.bianchi@energysolutions.it",
            "role": UserRoleEnum.OPERATOR,
            "status": UserStatusEnum.ACTIVE,
            "password_hash": hashed_password,
            "email_verified": True,
            "permissions": ["read", "write"]
        },
        
        # Green Corp users
        {
            "id": 3,
            "tenant_id": "greencorp",
            "name": "Anna Verdi",
            "email": "anna.verdi@greencorp.it",
            "role": UserRoleEnum.ADMIN,
            "status": UserStatusEnum.ACTIVE,
            "password_hash": hashed_password,
            "email_verified": True,
            "permissions": ["read", "write", "admin", "ai_assistant", "advanced_analytics"]
        },
        {
            "id": 4,
            "tenant_id": "greencorp",
            "name": "Paolo Neri",
            "email": "paolo.neri@greencorp.it",
            "role": UserRoleEnum.ASSET_MANAGER,
            "status": UserStatusEnum.ACTIVE,
            "password_hash": hashed_password,
            "email_verified": True,
            "permissions": ["read", "write", "ai_assistant"]
        },
        
        # Solar Pro users
        {
            "id": 5,
            "tenant_id": "solarpro",
            "name": "Giulia Gialli",
            "email": "giulia.gialli@solarpro.it",
            "role": UserRoleEnum.ADMIN,
            "status": UserStatusEnum.ACTIVE,
            "password_hash": hashed_password,
            "email_verified": True,
            "permissions": ["read", "write", "admin", "ai_assistant"]
        }
    ]
    
    plants_data = [
        # Demo tenant plants
        {
            "id": 1,
            "tenant_id": "demo",
            "name": "Demo Solar Plant Rome",
            "code": "IT001E00123456",
            "power": "50.0 kW",
            "power_kw": 50.0,
            "status": PlantStatusEnum.IN_OPERATION,
            "type": PlantTypeEnum.PHOTOVOLTAIC,
            "location": "Rome",
            "municipality": "Rome",
            "province": "RM",
            "region": "Lazio",
            "address": "Via Roma 123"
        },
        {
            "id": 2,
            "tenant_id": "demo",
            "name": "Demo Wind Plant Lazio",
            "code": "IT001E00654321",
            "power": "100.0 kW",
            "power_kw": 100.0,
            "status": PlantStatusEnum.IN_OPERATION,
            "type": PlantTypeEnum.WIND,
            "location": "Viterbo",
            "municipality": "Viterbo",
            "province": "VT",
            "region": "Lazio",
            "address": "Via del Vento 45"
        },
        
        # Green Corp plants
        {
            "id": 3,
            "tenant_id": "greencorp",
            "name": "Milan North Solar Park",
            "code": "IT002E00111111",
            "power": "500.0 kW",
            "power_kw": 500.0,
            "status": PlantStatusEnum.IN_OPERATION,
            "type": PlantTypeEnum.PHOTOVOLTAIC,
            "location": "Milan",
            "municipality": "Milan",
            "province": "MI",
            "region": "Lombardia",
            "address": "Via Industriale 100"
        },
        {
            "id": 4,
            "tenant_id": "greencorp",
            "name": "Bergamo Hydro Plant",
            "code": "IT002E00222222",
            "power": "1000.0 kW",
            "power_kw": 1000.0,
            "status": PlantStatusEnum.IN_OPERATION,
            "type": PlantTypeEnum.HYDROELECTRIC,
            "location": "Bergamo",
            "municipality": "Bergamo",
            "province": "BG",
            "region": "Lombardia",
            "address": "Via del Fiume 22"
        },
        
        # Solar Pro plants
        {
            "id": 5,
            "tenant_id": "solarpro",
            "name": "Turin Photovoltaic Plant",
            "code": "IT003E00333333",
            "power": "75.0 kW",
            "power_kw": 75.0,
            "status": PlantStatusEnum.IN_OPERATION,
            "type": PlantTypeEnum.PHOTOVOLTAIC,
            "location": "Turin",
            "municipality": "Turin",
            "province": "TO",
            "region": "Piemonte",
            "address": "Via Torino 789"
        }
    ]
    
    # Create registry_data data for each plant
    registry_data_data = [
        # Demo tenant registry_data
        {
            "id": 1,
            "tenant_id": "demo",
            "pod": "IT001E99999999",
            "pod_code": "IT001E99999999",
            "censimp": "00000001",
            "censimp_code": "00000001",
            "owner": "Demo Energy Solutions S.r.l.",
            "tax_code": "12345678901",
            "pec": "demo@pec.energy.it",
            "phone": "+39 06 12345678",
            "address": "Via del Sole 123",
            "municipality": "Rome",
            "province": "RM",
            "region": "Lazio",
            "latitude": 41.9028,
            "longitude": 12.4964,
            "technology": "Photovoltaic",
            "connection_type": "Three-phase",
            "connection_voltage": "0.4 kV",
            "grid_operator": "E-Distribuzione",
            "regime": "Ritiro Dedicato",
            "installed_power": 99.9
        },
        {
            "id": 2,
            "tenant_id": "demo",
            "pod": "IT001E88888888",
            "pod_code": "IT001E88888888",
            "censimp": "00000002",
            "censimp_code": "00000002",
            "owner": "Demo Energy Solutions S.r.l.",
            "tax_code": "12345678901",
            "pec": "demo@pec.energy.it",
            "phone": "+39 06 12345678",
            "address": "Via del Vento 45",
            "municipality": "Viterbo",
            "province": "VT",
            "region": "Lazio",
            "latitude": 42.4173,
            "longitude": 12.1076,
            "technology": "Wind",
            "connection_type": "Medium Voltage",
            "connection_voltage": "15 kV",
            "grid_operator": "E-Distribuzione",
            "regime": "Ritiro Dedicato",
            "installed_power": 2500.0
        },
        # Green Corp registry_data
        {
            "id": 3,
            "tenant_id": "greencorp",
            "pod": "IT002E00111111",
            "pod_code": "IT002E00111111",
            "censimp": "00000003",
            "censimp_code": "00000003",
            "owner": "Green Corp S.p.A.",
            "tax_code": "98765432109",
            "pec": "greencorp@pec.it",
            "phone": "+39 02 87654321",
            "address": "Via Industriale 100",
            "municipality": "Milan",
            "province": "MI",
            "region": "Lombardia",
            "latitude": 45.4642,
            "longitude": 9.1900,
            "technology": "Photovoltaic",
            "connection_type": "Medium Voltage",
            "connection_voltage": "15 kV",
            "grid_operator": "E-Distribuzione",
            "regime": "Scambio Sul Posto",
            "installed_power": 500.0
        },
        {
            "id": 4,
            "tenant_id": "greencorp",
            "pod": "IT002E00222222",
            "pod_code": "IT002E00222222",
            "censimp": "00000004",
            "censimp_code": "00000004",
            "owner": "Green Corp S.p.A.",
            "tax_code": "98765432109",
            "pec": "greencorp@pec.it",
            "phone": "+39 02 87654321",
            "address": "Via del Fiume 22",
            "municipality": "Bergamo",
            "province": "BG",
            "region": "Lombardia",
            "latitude": 45.6983,
            "longitude": 9.6773,
            "technology": "Hydroelectric",
            "connection_type": "Medium Voltage",
            "connection_voltage": "15 kV",
            "grid_operator": "E-Distribuzione",
            "regime": "Ritiro Dedicato",
            "installed_power": 1000.0
        },
        # Solar Pro registry_data
        {
            "id": 5,
            "tenant_id": "solarpro",
            "pod": "IT003E00333333",
            "pod_code": "IT003E00333333",
            "censimp": "00000005",
            "censimp_code": "00000005",
            "owner": "Solar Pro S.r.l.",
            "tax_code": "11223344556",
            "pec": "solarpro@pec.it",
            "phone": "+39 011 11223344",
            "address": "Via Torino 789",
            "municipality": "Turin",
            "province": "TO",
            "region": "Piemonte",
            "latitude": 45.0703,
            "longitude": 7.6869,
            "technology": "Photovoltaic",
            "connection_type": "Three-phase",
            "connection_voltage": "0.4 kV",
            "grid_operator": "E-Distribuzione",
            "regime": "Scambio Sul Posto",
            "installed_power": 75.0
        }
    ]
    
    return tenants_data, users_data, plants_data, registry_data_data

def create_multi_tenant_data():
    """Create multi-tenant demo data"""
    logger.info("Creating multi-tenant demo data...")
    
    tenants_data, users_data, plants_data, registry_data_data = create_tenant_data()
    
    try:
        with get_db_context() as db:
            # Create tenants
            logger.info("Creating tenants...")
            for tenant_data in tenants_data:
                tenant = Tenant(**tenant_data)
                db.merge(tenant)
                logger.info(f"Created tenant: {tenant.id} - {tenant.name}")
            
            # Create users
            logger.info("Creating users...")
            for user_data in users_data:
                user = User(**user_data)
                db.merge(user)
                logger.info(f"Created user: {user.id} - {user.name} ({user.tenant_id})")
            
            # Create registry_data first
            logger.info("Creating registry_data records...")
            registry_data_map = {}
            for reg_data in registry_data_data:
                registry_data = PlantRegistry(**reg_data)
                db.merge(registry_data)
                registry_data_map[reg_data['id']] = registry_data
                logger.info(f"Created registry_data: {registry_data.id} - POD: {registry_data.pod}")
            
            db.commit()
            
            # Create plants and link to registry_data
            logger.info("Creating plants...")
            for plant_data in plants_data:
                # Set the registry_data_id to link the records
                plant_data['registry_data_id'] = plant_data['id']  # Same ID for simplicity
                plant = Plant(**plant_data)
                db.merge(plant)
                logger.info(f"Created plant: {plant.id} - {plant.name} ({plant.tenant_id})")
            
            db.commit()
            logger.info("Multi-tenant demo data created successfully!")
            
    except Exception as e:
        logger.error(f"Error creating multi-tenant data: {e}")
        raise

def test_tenant_isolation():
    """Test that tenant isolation works correctly"""
    logger.info("Testing tenant isolation...")
    
    try:
        # Test data isolation for each tenant
        tenants = ["demo", "greencorp", "solarpro"]
        
        for tenant_id in tenants:
            with get_db_context(tenant_id) as db:
                # Query users for this tenant
                users = db.query(User).filter_by(tenant_id=tenant_id).all()
                plants = db.query(Plant).filter_by(tenant_id=tenant_id).all()
                
                logger.info(f"Tenant '{tenant_id}': {len(users)} users, {len(plants)} plants")
                
                for user in users:
                    logger.info(f"  User: {user.name} ({user.email}) - {user.role}")
                
                for plant in plants:
                    logger.info(f"  Plant: {plant.name} - {plant.installed_power} kW")
        
        logger.info("Tenant isolation test completed successfully!")
        
    except Exception as e:
        logger.error(f"Error testing tenant isolation: {e}")
        raise

def generate_api_test_data():
    """Generate test data for API testing"""
    logger.info("Generating API test scenarios...")
    
    test_scenarios = {
        "demo": {
            "tenant_id": "demo",
            "user_id": 1,
            "test_plant_id": 1,
            "api_key": "demo_api_key_12345",
            "features": ["ai_assistant", "voice_features", "rpa_automation", "advanced_analytics"]
        },
        "greencorp": {
            "tenant_id": "greencorp",
            "user_id": 3,
            "test_plant_id": 3,
            "api_key": "green_api_key_67890",
            "features": ["ai_assistant", "voice_features", "rpa_automation", "advanced_analytics"]
        },
        "solarpro": {
            "tenant_id": "solarpro",
            "user_id": 5,
            "test_plant_id": 5,
            "api_key": "solar_api_key_54321",
            "features": ["ai_assistant", "rpa_automation"]
        }
    }
    
    # Save test scenarios to file
    import json
    with open("tenant_test_scenarios.json", "w") as f:
        json.dump(test_scenarios, f, indent=2)
    
    logger.info("API test scenarios saved to tenant_test_scenarios.json")
    return test_scenarios

def main():
    """Main function to set up multi-tenant simulation"""
    logger.info("🚀 Starting Multi-Tenant Simulation Setup")
    logger.info("=" * 60)
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Database URL: {settings.DATABASE_URL}")
    logger.info(f"Tenant Mode: {settings.TENANT_ISOLATION_MODE}")
    logger.info("=" * 60)
    
    try:
        # Initialize database
        logger.info("Initializing database...")
        init_db()
        
        # Create multi-tenant data
        create_multi_tenant_data()
        
        # Test tenant isolation
        test_tenant_isolation()
        
        # Generate API test data
        test_scenarios = generate_api_test_data()
        
        logger.info("=" * 60)
        logger.info("✅ Multi-Tenant Simulation Setup Complete!")
        logger.info("=" * 60)
        logger.info("Available Tenants:")
        logger.info("1. demo - Demo Energy Solutions (Professional)")
        logger.info("   - Users: Mario Rossi (Admin), Luigi Bianchi (Operator)")
        logger.info("   - Plants: 2 (Solar + Wind)")
        logger.info("   - Features: All enabled")
        logger.info("")
        logger.info("2. greencorp - Green Corporation (Enterprise)")
        logger.info("   - Users: Anna Verdi (Admin), Paolo Neri (Manager)")
        logger.info("   - Plants: 2 (Large Solar + Hydro)")
        logger.info("   - Features: All enabled")
        logger.info("")
        logger.info("3. solarpro - Solar Pro Italia (Business)")
        logger.info("   - Users: Giulia Gialli (Admin)")
        logger.info("   - Plants: 1 (Medium Solar)")
        logger.info("   - Features: Limited (no voice, no advanced analytics)")
        logger.info("")
        logger.info("🧪 Test with different tenant IDs:")
        logger.info("curl -H 'X-Tenant-ID: demo' http://localhost:8000/api/v1/smart-assistant/health")
        logger.info("curl -H 'X-Tenant-ID: greencorp' http://localhost:8000/api/v1/smart-assistant/health")
        logger.info("curl -H 'X-Tenant-ID: solarpro' http://localhost:8000/api/v1/smart-assistant/health")
        logger.info("=" * 60)
        
    except Exception as e:
        logger.error(f"Multi-tenant simulation setup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
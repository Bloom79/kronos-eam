#!/usr/bin/env python3
"""
Debug script to identify the exact error in plants API
"""

import sys
sys.path.insert(0, '/home/bloom/sentrics/kronos-eam-backend')

from app.core.database import SessionLocal
from app.models.plant import Plant, PlantRegistry, ComplianceChecklist
from app.schemas.plant import PlantResponse
from sqlalchemy.orm import joinedload

def debug_plants():
    db = SessionLocal()
    
    try:
        # Test 1: Check if we can query plants
        print("=== Test 1: Basic Query ===")
        plants = db.query(Plant).filter(Plant.tenant_id == "demo").all()
        print(f"Found {len(plants)} plants")
        
        if plants:
            plant = plants[0]
            print(f"\nFirst plant: {plant.name} (ID: {plant.id})")
            print(f"Registry ID: {plant.registry_id}")
            print(f"Has registry relationship: {plant.registry is not None}")
            print(f"Has checklist relationship: {plant.checklist is not None}")
            
            # Test 2: Try loading with relationships
            print("\n=== Test 2: Query with Relationships ===")
            plant_with_rels = db.query(Plant).options(
                joinedload(Plant.registry),
                joinedload(Plant.checklist)
            ).filter(Plant.id == plant.id).first()
            
            print(f"Loaded with relationships: {plant_with_rels is not None}")
            
            # Test 3: Try converting to Pydantic
            print("\n=== Test 3: Convert to Pydantic ===")
            try:
                # First try direct conversion
                response = PlantResponse.from_orm(plant_with_rels)
                print("✓ Direct conversion successful")
            except Exception as e:
                print(f"✗ Direct conversion failed: {type(e).__name__}: {e}")
                
                # Try manual conversion
                print("\nTrying manual field mapping...")
                try:
                    plant_dict = {
                        "id": plant.id,
                        "tenant_id": plant.tenant_id,
                        "name": plant.name,
                        "code": plant.code,
                        "power": plant.power,
                        "power_kw": plant.power_kw,
                        "status": plant.status,
                        "type": plant.type,
                        "location": plant.location,
                        "address": plant.address,
                        "municipality": plant.municipality,
                        "province": plant.province,
                        "region": plant.region,
                        "latitude": plant.latitude,
                        "longitude": plant.longitude,
                        "tags": plant.tags or [],
                        "notes": plant.notes,
                        "custom_fields": plant.custom_fields or {},
                        "next_deadline": plant.next_deadline,
                        "next_deadline_type": plant.next_deadline_type,
                        "deadline_color": plant.deadline_color,
                        "gse_integration": plant.gse_integration,
                        "terna_integration": plant.terna_integration,
                        "customs_integration": plant.customs_integration,
                        "dso_integration": plant.dso_integration,
                        "registry": plant.registry,
                        "checklist": plant.checklist,
                        "maintenances_count": 0,
                        "documents_count": 0,
                        "active_workflows": 0,
                        "created_at": plant.created_at,
                        "updated_at": plant.updated_at
                    }
                    
                    response = PlantResponse(**plant_dict)
                    print("✓ Manual conversion successful")
                except Exception as e2:
                    print(f"✗ Manual conversion failed: {type(e2).__name__}: {e2}")
                    
                    # Print actual values to debug
                    print("\nActual field values:")
                    for field in ["status", "type"]:
                        value = getattr(plant, field, None)
                        print(f"  {field}: {value} (type: {type(value)})")
                    
    except Exception as e:
        print(f"\nDatabase error: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    debug_plants()
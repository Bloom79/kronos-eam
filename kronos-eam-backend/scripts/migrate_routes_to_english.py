#!/usr/bin/env python3
"""
Migration script to update Italian API routes to English
"""

# Route mappings from Italian to English
ROUTE_MAPPINGS = {
    # Main routes
    "/plants": "/plants",
    
    # Sub-routes
    "/manutenzioni": "/maintenance",
    
    # Tags
    "impianti": "plants",
    
    # Function names (for reference)
    "list_impianti": "list_plants",
    "get_impianti_summary": "get_plants_summary", 
    "get_impianto": "get_plant",
    "create_impianto": "create_plant",
    "update_impianto": "update_plant",
    "delete_impianto": "delete_plant",
    "get_impianto_performance": "get_plant_performance",
    "get_impianto_maintenance": "get_plant_maintenance",
    "get_impianto_metrics": "get_plant_metrics",
    "bulk_update_impianti": "bulk_update_plants",
    
    # Parameter names
    "impianto_id": "plant_id",
    "impianti_autorizzati": "authorized_plants"
}

# Schema mappings (already aliased in schemas/plant.py)
SCHEMA_ALIASES = {
    "PlantStatusEnum": "PlantStatusEnum",
    "PlantTypeEnum": "PlantTypeEnum",
    "MaintenanceTypeEnum": "MaintenanceTypeEnum",
    "MaintenanceStatusEnum": "MaintenanceStatusEnum",
    "PlantRegistryBase": "PlantRegistryBase",
    "PlantBase": "PlantBase",
    "PlantCreate": "PlantCreate",
    "PlantUpdate": "PlantUpdate",
    "MaintenanceCreate": "MaintenanceCreate",
    "MaintenanceUpdate": "MaintenanceUpdate",
    "PlantRegistryResponse": "PlantRegistryResponse",
    "MaintenanceResponse": "MaintenanceResponse",
    "PlantResponse": "PlantResponse",
    "PlantList": "PlantList",
    "PlantSummary": "PlantSummary",
    "PlantMetrics": "PlantMetrics"
}

# Files to update
FILES_TO_UPDATE = [
    "app/api/v1/endpoints/plants.py",  # Rename to plants.py
    "app/api/v1/api.py",
    "run_full_backend.py"
]

if __name__ == "__main__":
    print("Route Migration Plan:")
    print("\n1. Rename file:")
    print("   - app/api/v1/endpoints/plants.py -> app/api/v1/endpoints/plants.py")
    
    print("\n2. Update routes:")
    for italian, english in ROUTE_MAPPINGS.items():
        if italian.startswith("/"):
            print(f"   - {italian} -> {english}")
    
    print("\n3. Update imports and references in:")
    for file in FILES_TO_UPDATE:
        print(f"   - {file}")
    
    print("\n4. Update function names and parameters")
    print("\n5. Update schema imports to use English names instead of aliases")
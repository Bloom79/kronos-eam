#!/usr/bin/env python3
"""
Debug script to find the recursion issue
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

import traceback
from app.core.database import get_db_context
from app.models.plant import Plant

def test_impianto_retrieval():
    """Test retrieving an impianto to find recursion issue"""
    try:
        print("Testing impianto retrieval...")
        
        with get_db_context("demo") as db:
            # Try to get impianto with ID 1
            impianto = db.query(Plant).filter(
                Plant.id == 1,
                Plant.tenant_id == "demo"
            ).first()
            
            if impianto:
                print(f"Found impianto: {impianto.nome}")
                
                # Test accessing attributes
                print(f"ID: {impianto.id}")
                print(f"Codice: {impianto.codice}")
                print(f"Tipo: {impianto.tipo}")
                
                # Test accessing relationship - this might cause recursion
                print("Testing tenant relationship...")
                if hasattr(impianto, 'tenant'):
                    try:
                        tenant = impianto.tenant
                        print(f"Tenant: {tenant.nome if tenant else 'None'}")
                    except Exception as e:
                        print(f"Error accessing tenant: {e}")
                        traceback.print_exc()
                
                # Test string representation
                print("Testing __repr__...")
                try:
                    repr_str = repr(impianto)
                    print(f"Repr: {repr_str}")
                except Exception as e:
                    print(f"Error in __repr__: {e}")
                    traceback.print_exc()
                    
            else:
                print("Plant not found")
                
    except Exception as e:
        print(f"Error: {e}")
        traceback.print_exc()

def test_circular_reference():
    """Test for circular reference in relationships"""
    try:
        print("\nTesting circular references...")
        
        with get_db_context("demo") as db:
            # Get impianto
            impianto = db.query(Plant).filter(Plant.id == 1).first()
            
            if impianto and impianto.tenant:
                print("Plant -> Tenant")
                tenant = impianto.tenant
                
                # Try to access tenant's impianti
                print("Tenant -> Impianti")
                try:
                    impianti = tenant.impianti
                    print(f"Tenant has {len(impianti) if impianti else 0} impianti")
                    
                    # This might cause infinite loop
                    for imp in impianti[:1]:  # Only check first one
                        print(f"  Plant: {imp.nome}")
                        # Accessing tenant again might cause recursion
                        if imp.tenant:
                            print(f"    Back to tenant: {imp.tenant.nome}")
                            
                except Exception as e:
                    print(f"Error in circular reference: {e}")
                    traceback.print_exc()
                    
    except Exception as e:
        print(f"Error: {e}")
        traceback.print_exc()

def check_model_definitions():
    """Check model definitions for issues"""
    print("\nChecking model definitions...")
    
    # Check Plant model
    print("Plant relationships:")
    for rel in Plant.__mapper__.relationships:
        print(f"  - {rel.key}: {rel.entity}")
        
    # Check for circular imports
    print("\nChecking imports...")
    import app.models.tenant
    import app.models.user
    import app.models.plant
    print("All models imported successfully")

if __name__ == "__main__":
    print("=== Debugging Recursion Issue ===")
    print("Database URL:", os.environ.get("DATABASE_URL"))
    print()
    
    # Run tests
    test_impianto_retrieval()
    test_circular_reference()
    check_model_definitions()
    
    print("\n=== Debug Complete ===")
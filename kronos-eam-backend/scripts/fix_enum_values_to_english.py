#!/usr/bin/env python3
"""
Fix enum values in database from Italian to English
This script updates the actual data values to match the English enums
"""

import sys
from pathlib import Path
from sqlalchemy import create_engine, text

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.config import settings

# Data value mappings for each table
ENUM_DATA_MAPPINGS = {
    "workflows": {
        "current_status": {
            "Bozza": "Draft",
            "Attivo": "Active", 
            "In Pausa": "Paused",
            "Completato": "Completed",
            "Annullato": "Cancelled"
        },
        "category": {
            "Attivazione": "Activation",
            "Fiscale": "Fiscal",
            "Incentivi": "Incentives",
            "Variazioni": "Changes",
            "Maintenance": "Maintenance",
            "Compliance": "Compliance"
        }
    },
    "workflow_tasks": {
        "status": {
            "Da Iniziare": "To Start",
            "In Corso": "In Progress",
            "Completato": "Completed",
            "In Ritardo": "Delayed",
            "Bloccato": "Blocked"
        },
        "priority": {
            "Alta": "High",
            "Media": "Medium",
            "Bassa": "Low"
        }
    },
    "workflow_templates": {
        "purpose": {
            "Attivazione Completa": "Complete Activation",
            "Processo Specifico": "Specific Process",
            "Compliance Ricorrente": "Recurring Compliance",
            "Personalizzato": "Custom",
            "Componente Fase": "Phase Component"
        },
        "phase": {
            "Progettazione": "Design",
            "Connessione": "Connection",
            "Registrazione": "Registration",
            "Fiscale": "Fiscal"
        }
    },
    "plants": {
        "status": {
            "In Esercizio": "In Operation",
            "In Autorizzazione": "In Authorization",
            "In Costruzione": "Under Construction",
            "Dismesso": "Decommissioned"
        },
        "type": {
            "Fotovoltaico": "Photovoltaic",
            "Eolico": "Wind",
            "Idroelettrico": "Hydroelectric",
            "Biomasse": "Biomass",
            "Geotermico": "Geothermal"
        }
    },
    "maintenances": {
        "type": {
            "Ordinaria": "Ordinary",
            "Straordinaria": "Extraordinary",
            "Predittiva": "Predictive",
            "Correttiva": "Corrective"
        },
        "status": {
            "Completato": "Completed",
            "Pianificato": "Planned",
            "In Corso": "In Progress",
            "Annullato": "Cancelled"
        }
    },
    "users": {
        "role": {
            "Admin": "Admin",
            "Asset Manager": "Asset Manager",
            "Operativo": "Operator",
            "Viewer": "Viewer"
        },
        "status": {
            "Attivo": "Active",
            "Sospeso": "Suspended",
            "Invitato": "Invited"
        }
    },
    "tenants": {
        "status": {
            "Attivo": "Active",
            "Sospeso": "Suspended",
            "Trial": "Trial",
            "Scaduto": "Expired"
        }
    },
    "workflow_tasks": {
        "action_status": {
            "In Attesa": "Waiting",
            "In Corso": "In Progress",
            "Completata": "Completed",
            "Annullata": "Cancelled",
            "In Ritardo": "Delayed"
        }
    }
}

def update_enum_values(engine):
    """Update enum values in all tables"""
    
    for table_name, columns in ENUM_DATA_MAPPINGS.items():
        print(f"\nUpdating table: {table_name}")
        
        for column_name, mappings in columns.items():
            print(f"  Column: {column_name}")
            
            for old_value, new_value in mappings.items():
                try:
                    with engine.connect() as conn:
                        # Update the values
                        query = text(f"""
                            UPDATE {table_name}
                            SET {column_name} = :new_value
                            WHERE {column_name} = :old_value
                        """)
                        
                        result = conn.execute(query, {
                            "new_value": new_value,
                            "old_value": old_value
                        })
                        
                        if result.rowcount > 0:
                            print(f"    ✓ Updated {result.rowcount} rows: '{old_value}' → '{new_value}'")
                        
                        conn.commit()
                        
                except Exception as e:
                    print(f"    ✗ Error updating '{old_value}' → '{new_value}': {e}")

def main():
    """Main function"""
    print("=" * 60)
    print("Fixing Enum Values: Italian to English")
    print("=" * 60)
    
    engine = create_engine(str(settings.DATABASE_URL))
    
    update_enum_values(engine)
    
    print("\n" + "=" * 60)
    print("Enum value update completed!")
    print("=" * 60)

if __name__ == "__main__":
    response = input("This will update enum values in your database. Continue? (yes/no): ")
    if response.lower() == "yes":
        main()
    else:
        print("Operation cancelled.")
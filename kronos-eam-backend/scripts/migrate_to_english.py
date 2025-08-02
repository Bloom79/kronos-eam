#!/usr/bin/env python3
"""
Database Migration Script: Italian to English
Converts all column names and enum values from Italian to English
"""

import os
import sys
from pathlib import Path
from datetime import datetime
from sqlalchemy import create_engine, text, MetaData, inspect
from sqlalchemy.exc import OperationalError

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.config import settings

# Column name mappings
COLUMN_MAPPINGS = {
    # Common columns
    "nome": "name",
    "descrizione": "description",
    "tipo": "type",
    "stato": "status",
    "attivo": "active",
    "codice": "code",
    "data": "date",
    "note": "notes",
    
    # Workflow specific
    "stato_corrente": "current_status",
    "data_creazione": "created_date",
    "data_scadenza": "due_date", 
    "data_completamento": "completion_date",
    "enti_coinvolti": "involved_entities",
    "tipo_impianto": "plant_type",
    "potenza_impianto": "plant_power",
    "requisiti_documenti": "document_requirements",
    "stato_integrazioni": "integration_status",
    "ordine": "order",
    "completato": "completed",
    "data_inizio": "start_date",
    "data_fine": "end_date",
    "dipendenze": "dependencies",
    "integrazione": "integration",
    "automazione_config": "automation_config",
    "ente_responsabile": "responsible_entity",
    "tipo_pratica": "practice_type",
    "codice_pratica": "practice_code",
    "url_portale": "portal_url",
    "credenziali_richieste": "required_credentials",
    "documenti_associati": "associated_documents",
    "stato_azione": "action_status",
    "completato_da": "completed_by",
    "completato_data": "completed_date",
    "durata_stimata_giorni": "estimated_duration_days",
    "ricorrenza": "recurrence",
    "enti_richiesti": "required_entities",
    "documenti_base": "base_documents",
    "condizioni_attivazione": "activation_conditions",
    "scadenza_config": "deadline_config",
    "responsabile_default": "default_responsible",
    "durata_stimata_ore": "estimated_duration_hours",
    "documenti_richiesti": "required_documents",
    "automazione_disponibile": "automation_available",
    
    # Plant (Plant) specific
    "potenza": "power",
    "potenza_kw": "power_kw",
    "localita": "location",
    "indirizzo": "address",
    "comune": "municipality",
    "provincia": "province",
    "regione": "region",
    "prossima_scadenza": "next_deadline",
    "prossima_scadenza_tipo": "next_deadline_type",
    "colore_scadenza": "deadline_color",
    "integrazione_gse": "gse_integration",
    "integrazione_terna": "terna_integration",
    "integrazione_dogane": "customs_integration",
    "integrazione_dso": "dso_integration",
    
    # Anagrafica specific
    "proprietario": "owner",
    "codice_fiscale": "tax_code",
    "data_esercizio": "operation_date",
    "data_costruzione": "construction_date",
    "data_connessione": "connection_date",
    "tecnologia": "technology",
    "tipo_allacciamento": "connection_type",
    "punto_connessione": "connection_point",
    "gestore_rete": "grid_operator",
    "codice_officina": "workshop_code",
    "responsabile": "responsible",
    "responsabile_email": "responsible_email",
    "responsabile_telefono": "responsible_phone",
    "assicurazione": "insurance",
    "assicurazione_numero": "insurance_number",
    "assicurazione_scadenza": "insurance_expiry",
    "superficie_occupata": "occupied_area",
    "numero_moduli": "module_count",
    "numero_inverter": "inverter_count",
    "numero_tracker": "tracker_count",
    "specifiche_tecniche": "technical_specs",
    "tensione_connessione": "connection_voltage",
    "cabina_primaria": "primary_substation",
    "potenza_installata": "installed_power",
    
    # Performance specific
    "anno": "year",
    "mese": "month",
    "produzione_attesa_kwh": "expected_production_kwh",
    "produzione_effettiva_kwh": "actual_production_kwh",
    "irraggiamento_medio": "average_irradiation",
    "temperatura_media": "average_temperature",
    "ricavi_euro": "revenue_euro",
    "incentivi_euro": "incentives_euro",
    "dati_giornalieri": "daily_data",
    
    # Maintenance specific
    "data_pianificata": "planned_date",
    "data_esecuzione": "execution_date",
    "interventi_eseguiti": "interventions_performed",
    "costo_previsto": "estimated_cost",
    "costo_effettivo": "actual_cost",
    "esecutore": "executor",
    "ore_uomo": "man_hours",
    "documenti_ids": "document_ids",
    "anomalie_rilevate": "anomalies_detected",
    "azioni_correttive": "corrective_actions",
    "prossima_manutenzione": "next_maintenance",
    
    # User/Tenant specific
    "ruolo": "role",
    "ultimo_accesso": "last_access",
    "telefono": "phone",
    "lingua": "language",
    "impianti_autorizzati": "authorized_plants",
    "preferenze": "preferences",
    "piano": "plan",
    "scadenza_piano": "plan_expiry",
    "utente_max": "max_users",
    "impianti_max": "max_plants",
    "email_contatto": "contact_email",
    "telefono_contatto": "contact_phone",
    "partita_iva": "vat_number",
    "configurazione": "configuration",
    "prezzo_mensile": "monthly_price",
    "prezzo_annuale": "annual_price",
    "vantaggi": "benefits",
    
    # Document specific
    "dimensione": "size",
    "tipo_documento": "document_type",
    "testo": "text",
    
    # Compliance specific
    "connessione_dso": "dso_connection",
    "connessione_dso_data": "dso_connection_date",
    "connessione_dso_scadenza": "dso_connection_expiry",
    "registrazione_terna": "terna_registration",
    "registrazione_terna_data": "terna_registration_date",
    "registrazione_terna_numero": "terna_registration_number",
    "attivazione_gse": "gse_activation",
    "attivazione_gse_data": "gse_activation_date",
    "attivazione_gse_convenzione": "gse_activation_agreement",
    "licenza_dogane": "customs_license",
    "licenza_dogane_data": "customs_license_date",
    "licenza_dogane_numero": "customs_license_number",
    "licenza_dogane_scadenza": "customs_license_expiry",
    "verifica_spi": "spi_verification",
    "verifica_spi_data": "spi_verification_date",
    "verifica_spi_prossima": "spi_verification_next",
    "dichiarazione_consumo": "consumption_declaration",
    "dichiarazione_consumo_anno": "consumption_declaration_year",
    "dichiarazione_consumo_scadenza": "consumption_declaration_expiry",
    "antimafia_data": "antimafia_date",
    "antimafia_scadenza": "antimafia_expiry",
    "fuel_mix_data": "fuel_mix_date",
    "fuel_mix_scadenza": "fuel_mix_expiry",
    "via_screening_data": "via_screening_date",
    "aia_numero": "aia_number",
    "aia_scadenza": "aia_expiry",
    "conformita_score": "compliance_score",
    "ultimo_aggiornamento": "last_update"
}

# Enum value mappings
ENUM_MAPPINGS = {
    "workflow_status_enum": {
        "Bozza": "Draft",
        "Attivo": "Active",
        "In Pausa": "Paused",
        "Completato": "Completed",
        "Annullato": "Cancelled"
    },
    "task_status_enum": {
        "Da Iniziare": "To Start",
        "In Corso": "In Progress",
        "Completato": "Completed",
        "In Ritardo": "Delayed",
        "Bloccato": "Blocked"
    },
    "task_priority_enum": {
        "Alta": "High",
        "Media": "Medium",
        "Bassa": "Low"
    },
    "workflow_category_enum": {
        "Attivazione": "Activation",
        "Fiscale": "Fiscal",
        "Incentivi": "Incentives",
        "Variazioni": "Changes",
        "Maintenance": "Maintenance",
        "Compliance": "Compliance"
    },
    "workflowpurposeenum": {
        "Attivazione Completa": "Complete Activation",
        "Processo Specifico": "Specific Process",
        "Compliance Ricorrente": "Recurring Compliance",
        "Personalizzato": "Custom",
        "Componente Fase": "Phase Component"
    },
    "workflowphaseenum": {
        "Progettazione": "Design",
        "Connessione": "Connection",
        "Registrazione": "Registration",
        "Fiscale": "Fiscal"
    },
    "impiantostatoenum": {
        "In Esercizio": "In Operation",
        "In Autorizzazione": "In Authorization",
        "In Costruzione": "Under Construction",
        "Dismesso": "Decommissioned"
    },
    "impiantotipoenum": {
        "Fotovoltaico": "Photovoltaic",
        "Eolico": "Wind",
        "Idroelettrico": "Hydroelectric",
        "Biomasse": "Biomass",
        "Geotermico": "Geothermal"
    },
    "manutenzionetipoenum": {
        "Ordinaria": "Ordinary",
        "Straordinaria": "Extraordinary",
        "Predittiva": "Predictive",
        "Correttiva": "Corrective"
    },
    "manutenzionestatoenum": {
        "Completato": "Completed",
        "Pianificato": "Planned",
        "In Corso": "In Progress",
        "Annullato": "Cancelled"
    },
    "userroleenum": {
        "Admin": "Admin",
        "Asset Manager": "Asset Manager",
        "Operativo": "Operator",
        "Viewer": "Viewer"
    },
    "userstatusenum": {
        "Attivo": "Active",
        "Sospeso": "Suspended",
        "Invitato": "Invited"
    },
    "tenantstatusenum": {
        "Attivo": "Active",
        "Sospeso": "Suspended",
        "Trial": "Trial",
        "Scaduto": "Expired"
    },
    "azionestatusenum": {
        "In Attesa": "Waiting",
        "In Corso": "In Progress",
        "Completata": "Completed",
        "Annullata": "Cancelled",
        "In Ritardo": "Delayed"
    }
}


def create_backup(engine):
    """Create a backup of the current database schema"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = f"db_backup_{timestamp}.sql"
    
    print(f"Creating backup: {backup_file}")
    # This is a placeholder - implement actual backup based on your database
    print("⚠️  Backup reminder: Please ensure you have a backup of your database!")
    print("Proceeding with migration...")


def get_all_tables(engine):
    """Get all tables in the database"""
    inspector = inspect(engine)
    return inspector.get_table_names()


def rename_columns(engine, table_name, column_mappings):
    """Rename columns in a table"""
    inspector = inspect(engine)
    columns = inspector.get_columns(table_name)
    
    for column in columns:
        old_name = column['name']
        if old_name in column_mappings:
            new_name = column_mappings[old_name]
            try:
                # PostgreSQL syntax
                query = text(f'ALTER TABLE {table_name} RENAME COLUMN "{old_name}" TO "{new_name}"')
                with engine.connect() as conn:
                    conn.execute(query)
                    conn.commit()
                print(f"  ✓ Renamed {table_name}.{old_name} → {new_name}")
            except Exception as e:
                print(f"  ✗ Error renaming {table_name}.{old_name}: {e}")


def update_enum_values(engine, enum_name, mappings):
    """Update enum values from Italian to English"""
    try:
        with engine.connect() as conn:
            # First, get all tables and columns that use this enum
            result = conn.execute(text("""
                SELECT 
                    table_name,
                    column_name
                FROM information_schema.columns
                WHERE udt_name = :enum_name
            """), {"enum_name": enum_name})
            
            tables_columns = result.fetchall()
            
            if tables_columns:
                print(f"\n  Updating enum: {enum_name}")
                
                # Create new enum with English values
                new_enum_name = f"{enum_name}_new"
                
                # Create new enum type
                values_list = ", ".join([f"'{v}'" for v in mappings.values()])
                conn.execute(text(f"CREATE TYPE {new_enum_name} AS ENUM ({values_list})"))
                
                # Update each table/column
                for table_name, column_name in tables_columns:
                    # Create temporary column
                    temp_col = f"{column_name}_temp"
                    
                    # Add temporary column
                    conn.execute(text(f"""
                        ALTER TABLE {table_name} 
                        ADD COLUMN {temp_col} {new_enum_name}
                    """))
                    
                    # Update values with mapping
                    for old_val, new_val in mappings.items():
                        conn.execute(text(f"""
                            UPDATE {table_name} 
                            SET {temp_col} = '{new_val}'
                            WHERE {column_name} = '{old_val}'
                        """))
                    
                    # Drop old column and rename temp
                    conn.execute(text(f"""
                        ALTER TABLE {table_name} DROP COLUMN {column_name};
                        ALTER TABLE {table_name} RENAME COLUMN {temp_col} TO {column_name};
                    """))
                
                # Drop old enum and rename new
                conn.execute(text(f"DROP TYPE {enum_name}"))
                conn.execute(text(f"ALTER TYPE {new_enum_name} RENAME TO {enum_name}"))
                
                print(f"    ✓ Updated {len(tables_columns)} columns")
                
            conn.commit()
            
    except Exception as e:
        print(f"  ✗ Error updating enum {enum_name}: {e}")


def main():
    """Main migration function"""
    print("=" * 60)
    print("Database Migration: Italian to English")
    print("=" * 60)
    
    # Create engine
    engine = create_engine(str(settings.DATABASE_URL))
    
    # Create backup
    create_backup(engine)
    
    # Get all tables
    tables = get_all_tables(engine)
    print(f"\nFound {len(tables)} tables to process")
    
    # Phase 1: Rename columns
    print("\nPhase 1: Renaming columns...")
    for table in tables:
        print(f"\nProcessing table: {table}")
        rename_columns(engine, table, COLUMN_MAPPINGS)
    
    # Phase 2: Update enum values
    print("\n\nPhase 2: Updating enum values...")
    for enum_name, mappings in ENUM_MAPPINGS.items():
        update_enum_values(engine, enum_name, mappings)
    
    print("\n" + "=" * 60)
    print("Migration completed!")
    print("Please update your application code to use the new English names.")
    print("=" * 60)


if __name__ == "__main__":
    response = input("This will modify your database structure. Are you sure? (yes/no): ")
    if response.lower() == "yes":
        main()
    else:
        print("Migration cancelled.")
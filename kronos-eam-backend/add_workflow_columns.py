#!/usr/bin/env python3
"""
Script to add missing columns to workflow tables for renewable energy features
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.exc import ProgrammingError
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://kronos:kronos_password@localhost:5432/kronos_eam")

def add_workflow_columns():
    """Add missing columns to workflow tables"""
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        # Add columns to workflows table
        workflow_columns = [
            ("categoria", "VARCHAR(50)"),
            ("enti_coinvolti", "JSON DEFAULT '[]'::json"),
            ("potenza_impianto", "FLOAT"),
            ("tipo_impianto", "VARCHAR(50)"),
            ("requisiti_documenti", "JSON DEFAULT '{}'::json"),
            ("stato_integrazioni", "JSON DEFAULT '{}'::json"),
            ("model_metadata", "JSON DEFAULT '{}'::json"),
            ("template_id", "INTEGER"),
        ]
        
        print("Adding columns to workflows table...")
        for column_name, column_type in workflow_columns:
            try:
                conn.execute(text(f"ALTER TABLE workflows ADD COLUMN IF NOT EXISTS {column_name} {column_type}"))
                conn.commit()
                print(f"  ✓ Added column: {column_name}")
            except ProgrammingError as e:
                if "already exists" in str(e):
                    print(f"  - Column {column_name} already exists")
                else:
                    print(f"  ✗ Error adding column {column_name}: {e}")
                conn.rollback()
        
        # Add columns to workflow_stages table
        stage_columns = [
            ("durata_giorni", "INTEGER"),
            ("data_inizio", "TIMESTAMP"),
            ("data_fine", "TIMESTAMP"),
        ]
        
        print("\nAdding columns to workflow_stages table...")
        for column_name, column_type in stage_columns:
            try:
                conn.execute(text(f"ALTER TABLE workflow_stages ADD COLUMN IF NOT EXISTS {column_name} {column_type}"))
                conn.commit()
                print(f"  ✓ Added column: {column_name}")
            except ProgrammingError as e:
                if "already exists" in str(e):
                    print(f"  - Column {column_name} already exists")
                else:
                    print(f"  ✗ Error adding column {column_name}: {e}")
                conn.rollback()
        
        # Add columns to workflow_tasks table
        task_columns = [
            ("descrizione", "TEXT"),
            ("dipendenze", "JSON DEFAULT '[]'::json"),
            ("ente_responsabile", "VARCHAR(50)"),
            ("tipo_pratica", "VARCHAR(100)"),
            ("codice_pratica", "VARCHAR(100)"),
            ("url_portale", "VARCHAR(500)"),
            ("credenziali_richieste", "VARCHAR(50)"),
            ("integrazione", "VARCHAR(50)"),
            ("automazione_config", "JSON DEFAULT '{}'::json"),
            ("completato_da", "VARCHAR(255)"),
            ("completato_data", "TIMESTAMP"),
        ]
        
        print("\nAdding columns to workflow_tasks table...")
        for column_name, column_type in task_columns:
            try:
                conn.execute(text(f"ALTER TABLE workflow_tasks ADD COLUMN IF NOT EXISTS {column_name} {column_type}"))
                conn.commit()
                print(f"  ✓ Added column: {column_name}")
            except ProgrammingError as e:
                if "already exists" in str(e):
                    print(f"  - Column {column_name} already exists")
                else:
                    print(f"  ✗ Error adding column {column_name}: {e}")
                conn.rollback()
        
        # Create workflow_templates table if it doesn't exist
        print("\nCreating workflow_templates table...")
        try:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS workflow_templates (
                    id SERIAL PRIMARY KEY,
                    nome VARCHAR(200) NOT NULL,
                    descrizione TEXT,
                    categoria VARCHAR(50),
                    tipo_impianto VARCHAR(50),
                    potenza_minima FLOAT,
                    potenza_massima FLOAT,
                    durata_stimata_giorni INTEGER,
                    ricorrenza VARCHAR(50),
                    stages JSON NOT NULL DEFAULT '[]'::json,
                    tasks JSON NOT NULL DEFAULT '[]'::json,
                    enti_richiesti JSON DEFAULT '[]'::json,
                    documenti_base JSON DEFAULT '[]'::json,
                    condizioni_attivazione JSON DEFAULT '{}'::json,
                    scadenza_config JSON DEFAULT '{}'::json,
                    attivo BOOLEAN DEFAULT TRUE,
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
            print("  ✓ Created workflow_templates table")
        except ProgrammingError as e:
            if "already exists" in str(e):
                print("  - Table workflow_templates already exists")
            else:
                print(f"  ✗ Error creating table: {e}")
            conn.rollback()
        
        # Create task_templates table if it doesn't exist
        print("\nCreating task_templates table...")
        try:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS task_templates (
                    id SERIAL PRIMARY KEY,
                    nome VARCHAR(200) NOT NULL,
                    descrizione TEXT,
                    responsabile_default VARCHAR(100),
                    durata_stimata_ore FLOAT,
                    documenti_richiesti JSON DEFAULT '[]'::json,
                    checkpoints JSON DEFAULT '[]'::json,
                    integrazione VARCHAR(50),
                    automazione_disponibile BOOLEAN DEFAULT FALSE,
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
            print("  ✓ Created task_templates table")
        except ProgrammingError as e:
            if "already exists" in str(e):
                print("  - Table task_templates already exists")
            else:
                print(f"  ✗ Error creating table: {e}")
            conn.rollback()
        
        # Create task_documents table if it doesn't exist
        print("\nCreating task_documents table...")
        try:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS task_documents (
                    id SERIAL PRIMARY KEY,
                    task_id INTEGER NOT NULL REFERENCES workflow_tasks(id) ON DELETE CASCADE,
                    nome VARCHAR(255) NOT NULL,
                    tipo VARCHAR(10),
                    dimensione INTEGER,
                    url VARCHAR(500),
                    document_id INTEGER REFERENCES documents(id),
                    tipo_documento VARCHAR(50),
                    tenant_id VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_by INTEGER,
                    updated_by INTEGER
                )
            """))
            conn.commit()
            print("  ✓ Created task_documents table")
        except ProgrammingError as e:
            if "already exists" in str(e):
                print("  - Table task_documents already exists")
            else:
                print(f"  ✗ Error creating table: {e}")
            conn.rollback()
        
        # Create task_comments table if it doesn't exist
        print("\nCreating task_comments table...")
        try:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS task_comments (
                    id SERIAL PRIMARY KEY,
                    task_id INTEGER NOT NULL REFERENCES workflow_tasks(id) ON DELETE CASCADE,
                    user_id INTEGER NOT NULL REFERENCES users(id),
                    testo TEXT NOT NULL,
                    tenant_id VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_by INTEGER,
                    updated_by INTEGER
                )
            """))
            conn.commit()
            print("  ✓ Created task_comments table")
        except ProgrammingError as e:
            if "already exists" in str(e):
                print("  - Table task_comments already exists")
            else:
                print(f"  ✗ Error creating table: {e}")
            conn.rollback()
        
        print("\n✅ Database schema update completed!")


if __name__ == "__main__":
    print("Updating workflow tables for renewable energy features...")
    print(f"Database: {DATABASE_URL}")
    add_workflow_columns()
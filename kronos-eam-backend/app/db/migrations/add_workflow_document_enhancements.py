"""
Add workflow and document management enhancements
- Enhanced workflow support (parent/child, copying)
- Enhanced document support (standard docs, copying)
- Audit logging infrastructure
- Enhanced task/action support
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))

from sqlalchemy import text
from datetime import datetime
from app.core.database import engine

def upgrade():
    """Apply database schema enhancements"""
    
    with engine.connect() as conn:
        try:
            # Start transaction
            trans = conn.begin()
            
            # 1. Enhanced workflow support
            print("Adding workflow enhancements...")
            conn.execute(text("""
                ALTER TABLE workflows 
                ADD COLUMN IF NOT EXISTS parent_workflow_id INTEGER REFERENCES workflows(id),
                ADD COLUMN IF NOT EXISTS workflow_originale_id INTEGER REFERENCES workflows(id),
                ADD COLUMN IF NOT EXISTS is_standard BOOLEAN DEFAULT FALSE,
                ADD COLUMN IF NOT EXISTS tipo_workflow VARCHAR(50)
            """))
            
            # 2. Enhanced task/action support
            print("Adding task/action enhancements...")
            conn.execute(text("""
                ALTER TABLE workflow_tasks
                ADD COLUMN IF NOT EXISTS timeline JSON,
                ADD COLUMN IF NOT EXISTS audit_enabled BOOLEAN DEFAULT TRUE,
                ADD COLUMN IF NOT EXISTS documenti_associati JSON,
                ADD COLUMN IF NOT EXISTS stato_azione VARCHAR(50)
            """))
            
            # 3. Enhanced document support
            print("Adding document enhancements...")
            conn.execute(text("""
                ALTER TABLE documents
                ADD COLUMN IF NOT EXISTS is_standard BOOLEAN DEFAULT FALSE,
                ADD COLUMN IF NOT EXISTS riferimenti_normativi JSON,
                ADD COLUMN IF NOT EXISTS link_esterni JSON,
                ADD COLUMN IF NOT EXISTS abilita_notifiche BOOLEAN DEFAULT TRUE
            """))
            
            # 4. Create document copies table
            print("Creating document_copies table...")
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS document_copies (
                    id SERIAL PRIMARY KEY,
                    documento_originale_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
                    utente_creazione_id INTEGER REFERENCES users(id),
                    contenuto_customizzato TEXT,
                    data_copia TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    ultima_modifica_copia TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    nome_copia VARCHAR(255),
                    tenant_id INTEGER NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_by VARCHAR(255),
                    updated_by VARCHAR(255)
                )
            """))
            
            # 5. Create audit logs table
            print("Creating audit_logs table...")
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS audit_logs (
                    id SERIAL PRIMARY KEY,
                    entity_type VARCHAR(50) NOT NULL,
                    entity_id INTEGER NOT NULL,
                    tipo_modifica VARCHAR(50) NOT NULL,
                    dettaglio_modifica JSON,
                    utente_id INTEGER REFERENCES users(id),
                    tenant_id INTEGER NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            
            # 6. Create indexes for performance
            print("Creating indexes...")
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_workflows_parent ON workflows(parent_workflow_id);
                CREATE INDEX IF NOT EXISTS idx_workflows_originale ON workflows(workflow_originale_id);
                CREATE INDEX IF NOT EXISTS idx_workflows_standard ON workflows(is_standard);
                CREATE INDEX IF NOT EXISTS idx_workflows_tipo ON workflows(tipo_workflow);
                
                CREATE INDEX IF NOT EXISTS idx_documents_standard ON documents(is_standard);
                CREATE INDEX IF NOT EXISTS idx_document_copies_originale ON document_copies(documento_originale_id);
                CREATE INDEX IF NOT EXISTS idx_document_copies_utente ON document_copies(utente_creazione_id);
                CREATE INDEX IF NOT EXISTS idx_document_copies_tenant ON document_copies(tenant_id);
                
                CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
                CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(utente_id);
                CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
                CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON audit_logs(tenant_id);
            """))
            
            # 7. Update existing workflows to set is_standard = FALSE
            print("Updating existing workflows...")
            conn.execute(text("""
                UPDATE workflows 
                SET is_standard = FALSE 
                WHERE is_standard IS NULL
            """))
            
            # 8. Update existing documents to set is_standard = FALSE
            print("Updating existing documents...")
            conn.execute(text("""
                UPDATE documents 
                SET is_standard = FALSE 
                WHERE is_standard IS NULL
            """))
            
            # 9. Add standard workflow types
            print("Adding workflow type enum check constraint...")
            conn.execute(text("""
                ALTER TABLE workflows 
                ADD CONSTRAINT check_workflow_tipo 
                CHECK (tipo_workflow IN ('REGISTRAZIONE_STANDARD', 'REGISTRAZIONE_SEMPLIFICATA', 
                                        'COMUNITA_ENERGETICA', 'CUSTOM', 'COMPOSTO') 
                       OR tipo_workflow IS NULL)
            """))
            
            # 10. Add action status enum check constraint
            print("Adding action status enum check constraint...")
            conn.execute(text("""
                ALTER TABLE workflow_tasks 
                ADD CONSTRAINT check_stato_azione 
                CHECK (stato_azione IN ('In Attesa', 'In Corso', 'Completata', 
                                       'Annullata', 'In Ritardo') 
                       OR stato_azione IS NULL)
            """))
            
            # 11. Add audit log type enum check constraint
            print("Adding audit log type enum check constraint...")
            conn.execute(text("""
                ALTER TABLE audit_logs 
                ADD CONSTRAINT check_tipo_modifica 
                CHECK (tipo_modifica IN ('Creazione', 'Aggiornamento', 'Stato_Cambio', 
                                        'Responsabile_Cambio', 'Eliminazione'))
            """))
            
            # Commit transaction
            trans.commit()
            print("✅ Database migration completed successfully!")
            
        except Exception as e:
            print(f"❌ Error during migration: {e}")
            if 'trans' in locals():
                trans.rollback()
            raise

def downgrade():
    """Rollback database schema changes"""
    
    with engine.connect() as conn:
        try:
            trans = conn.begin()
            
            # Drop constraints first
            conn.execute(text("ALTER TABLE workflows DROP CONSTRAINT IF EXISTS check_workflow_tipo"))
            conn.execute(text("ALTER TABLE workflow_tasks DROP CONSTRAINT IF EXISTS check_stato_azione"))
            conn.execute(text("ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS check_tipo_modifica"))
            
            # Drop indexes
            conn.execute(text("DROP INDEX IF EXISTS idx_workflows_parent"))
            conn.execute(text("DROP INDEX IF EXISTS idx_workflows_originale"))
            conn.execute(text("DROP INDEX IF EXISTS idx_workflows_standard"))
            conn.execute(text("DROP INDEX IF EXISTS idx_workflows_tipo"))
            conn.execute(text("DROP INDEX IF EXISTS idx_documents_standard"))
            conn.execute(text("DROP INDEX IF EXISTS idx_document_copies_originale"))
            conn.execute(text("DROP INDEX IF EXISTS idx_document_copies_utente"))
            conn.execute(text("DROP INDEX IF EXISTS idx_document_copies_tenant"))
            conn.execute(text("DROP INDEX IF EXISTS idx_audit_logs_entity"))
            conn.execute(text("DROP INDEX IF EXISTS idx_audit_logs_user"))
            conn.execute(text("DROP INDEX IF EXISTS idx_audit_logs_created"))
            conn.execute(text("DROP INDEX IF EXISTS idx_audit_logs_tenant"))
            
            # Drop tables
            conn.execute(text("DROP TABLE IF EXISTS audit_logs"))
            conn.execute(text("DROP TABLE IF EXISTS document_copies"))
            
            # Drop columns
            conn.execute(text("""
                ALTER TABLE workflows 
                DROP COLUMN IF EXISTS parent_workflow_id,
                DROP COLUMN IF EXISTS workflow_originale_id,
                DROP COLUMN IF EXISTS is_standard,
                DROP COLUMN IF EXISTS tipo_workflow
            """))
            
            conn.execute(text("""
                ALTER TABLE workflow_tasks
                DROP COLUMN IF EXISTS timeline,
                DROP COLUMN IF EXISTS audit_enabled,
                DROP COLUMN IF EXISTS documenti_associati,
                DROP COLUMN IF EXISTS stato_azione
            """))
            
            conn.execute(text("""
                ALTER TABLE documents
                DROP COLUMN IF EXISTS is_standard,
                DROP COLUMN IF EXISTS riferimenti_normativi,
                DROP COLUMN IF EXISTS link_esterni,
                DROP COLUMN IF EXISTS abilita_notifiche
            """))
            
            trans.commit()
            print("✅ Database rollback completed successfully!")
            
        except Exception as e:
            print(f"❌ Error during rollback: {e}")
            if 'trans' in locals():
                trans.rollback()
            raise

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "down":
        print("Rolling back database changes...")
        downgrade()
    else:
        print("Applying database changes...")
        upgrade()
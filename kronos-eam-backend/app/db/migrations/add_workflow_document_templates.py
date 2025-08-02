"""
Database migration to add workflow document template functionality
"""

from sqlalchemy import text
from app.core.database import engine

def add_workflow_document_templates():
    """Add workflow document template tables and relationships"""
    
    with engine.connect() as conn:
        try:
            # Start transaction
            trans = conn.begin()
            
            # 1. Create workflow_document_templates table
            print("Creating workflow_document_templates table...")
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS workflow_document_templates (
                    id SERIAL PRIMARY KEY,
                    workflow_template_id INTEGER NOT NULL REFERENCES workflow_templates(id),
                    document_template_id INTEGER NOT NULL REFERENCES document_templates(id),
                    task_nome VARCHAR(255),
                    is_required BOOLEAN DEFAULT TRUE,
                    ordine INTEGER DEFAULT 0,
                    placeholders JSONB DEFAULT '{}',
                    output_formats JSONB DEFAULT '[]',
                    auto_generate BOOLEAN DEFAULT FALSE,
                    condizioni JSONB DEFAULT '{}',
                    tenant_id INTEGER NOT NULL,
                    created_by VARCHAR(255),
                    updated_by VARCHAR(255),
                    is_deleted BOOLEAN DEFAULT FALSE,
                    deleted_at TIMESTAMP,
                    deleted_by VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(workflow_template_id, document_template_id, task_nome)
                )
            """))
            
            # 2. Add template_path to documents table for generated documents
            print("Adding template reference to documents table...")
            conn.execute(text("""
                ALTER TABLE documents
                ADD COLUMN IF NOT EXISTS generated_from_template_id INTEGER REFERENCES document_templates(id),
                ADD COLUMN IF NOT EXISTS template_data JSONB DEFAULT '{}'
            """))
            
            # 3. Add template_documenti to workflow_templates table
            print("Adding template_documenti to workflow_templates...")
            conn.execute(text("""
                ALTER TABLE workflow_templates
                ADD COLUMN IF NOT EXISTS template_documenti JSONB DEFAULT '[]'
            """))
            
            # 4. Create indexes for performance
            print("Creating indexes...")
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_workflow_doc_templates_workflow_id 
                ON workflow_document_templates(workflow_template_id);
                
                CREATE INDEX IF NOT EXISTS idx_workflow_doc_templates_document_id 
                ON workflow_document_templates(document_template_id);
                
                CREATE INDEX IF NOT EXISTS idx_workflow_doc_templates_task 
                ON workflow_document_templates(task_nome);
                
                CREATE INDEX IF NOT EXISTS idx_documents_template_id 
                ON documents(generated_from_template_id);
            """))
            
            # Commit transaction
            trans.commit()
            print("✅ Successfully added workflow document template support")
            
        except Exception as e:
            trans.rollback()
            print(f"❌ Error during migration: {e}")
            raise

def rollback():
    """Rollback the migration"""
    with engine.connect() as conn:
        try:
            trans = conn.begin()
            
            # Drop indexes
            conn.execute(text("""
                DROP INDEX IF EXISTS idx_workflow_doc_templates_workflow_id;
                DROP INDEX IF EXISTS idx_workflow_doc_templates_document_id;
                DROP INDEX IF EXISTS idx_workflow_doc_templates_task;
                DROP INDEX IF EXISTS idx_documents_template_id;
            """))
            
            # Drop columns
            conn.execute(text("""
                ALTER TABLE documents
                DROP COLUMN IF EXISTS generated_from_template_id,
                DROP COLUMN IF EXISTS template_data;
                
                ALTER TABLE workflow_templates
                DROP COLUMN IF EXISTS template_documenti;
            """))
            
            # Drop table
            conn.execute(text("DROP TABLE IF EXISTS workflow_document_templates"))
            
            trans.commit()
            print("✅ Successfully rolled back workflow document template migration")
            
        except Exception as e:
            trans.rollback()
            print(f"❌ Error during rollback: {e}")
            raise

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "rollback":
        rollback()
    else:
        add_workflow_document_templates()
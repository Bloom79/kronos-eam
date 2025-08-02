"""
Add workflow categorization fields to workflow_templates
"""

from sqlalchemy import text
from app.core.database import engine

def add_workflow_categorization():
    """Add workflow_purpose and is_complete_workflow fields"""
    
    with engine.connect() as conn:
        try:
            # Start transaction
            trans = conn.begin()
            
            print("Adding workflow categorization fields...")
            
            # 1. Create new enum type for workflow purpose
            print("Creating workflow_purpose enum...")
            # Check if enum already exists
            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT 1 FROM pg_type WHERE typname = 'workflowpurposeenum'
                )
            """))
            enum_exists = result.scalar()
            
            if not enum_exists:
                conn.execute(text("""
                    CREATE TYPE workflowpurposeenum AS ENUM (
                        'Attivazione Completa',
                        'Processo Specifico', 
                        'Compliance Ricorrente',
                        'Personalizzato',
                        'Componente Fase'
                    )
                """))
            else:
                print("workflowpurposeenum already exists, skipping creation")
            
            # 2. Add new columns to workflow_templates
            print("Adding new columns to workflow_templates...")
            conn.execute(text("""
                ALTER TABLE workflow_templates
                ADD COLUMN IF NOT EXISTS workflow_purpose workflowpurposeenum,
                ADD COLUMN IF NOT EXISTS is_complete_workflow BOOLEAN DEFAULT TRUE
            """))
            
            # 3. Update existing templates with appropriate categories
            print("Categorizing existing templates...")
            
            # Attivazione Plant Rinnovabile Completa
            conn.execute(text("""
                UPDATE workflow_templates 
                SET workflow_purpose = 'Attivazione Completa'::workflowpurposeenum,
                    is_complete_workflow = TRUE
                WHERE nome = 'Attivazione Plant Rinnovabile Completa'
            """))
            
            # Domanda di Connessione E-Distribuzione (complete)
            conn.execute(text("""
                UPDATE workflow_templates 
                SET workflow_purpose = 'Processo Specifico'::workflowpurposeenum,
                    is_complete_workflow = TRUE
                WHERE nome = 'Domanda di Connessione E-Distribuzione'
                AND phase IS NULL
            """))
            
            # Phase templates
            conn.execute(text("""
                UPDATE workflow_templates 
                SET workflow_purpose = 'Componente Fase'::workflowpurposeenum,
                    is_complete_workflow = FALSE
                WHERE nome LIKE '%- Fase %'
            """))
            
            # Fiscal/compliance templates
            conn.execute(text("""
                UPDATE workflow_templates 
                SET workflow_purpose = 'Compliance Ricorrente'::workflowpurposeenum,
                    is_complete_workflow = TRUE
                WHERE categoria = 'Fiscale' 
                OR nome LIKE '%Annuale%'
                OR ricorrenza != 'Una tantum'
            """))
            
            # Maintenance templates
            conn.execute(text("""
                UPDATE workflow_templates 
                SET workflow_purpose = 'Processo Specifico'::workflowpurposeenum,
                    is_complete_workflow = TRUE
                WHERE categoria = 'Maintenance'
                AND workflow_purpose IS NULL
            """))
            
            # 4. Create indexes for better performance
            print("Creating indexes...")
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_workflow_templates_purpose 
                ON workflow_templates(workflow_purpose);
                
                CREATE INDEX IF NOT EXISTS idx_workflow_templates_complete 
                ON workflow_templates(is_complete_workflow);
            """))
            
            # Commit transaction
            trans.commit()
            print("✅ Successfully added workflow categorization")
            
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
                DROP INDEX IF EXISTS idx_workflow_templates_purpose;
                DROP INDEX IF EXISTS idx_workflow_templates_complete;
            """))
            
            # Drop columns
            conn.execute(text("""
                ALTER TABLE workflow_templates
                DROP COLUMN IF EXISTS workflow_purpose,
                DROP COLUMN IF EXISTS is_complete_workflow;
            """))
            
            # Drop enum type
            conn.execute(text("DROP TYPE IF EXISTS workflowpurposeenum"))
            
            trans.commit()
            print("✅ Successfully rolled back workflow categorization migration")
            
        except Exception as e:
            trans.rollback()
            print(f"❌ Error during rollback: {e}")
            raise

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "rollback":
        rollback()
    else:
        add_workflow_categorization()
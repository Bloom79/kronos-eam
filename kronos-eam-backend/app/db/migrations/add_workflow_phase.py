"""
Database migration to add phase field to workflow_templates
"""

from sqlalchemy import text
from app.core.database import engine

def add_workflow_phase_column():
    """Add phase column to workflow_templates table"""
    
    with engine.connect() as conn:
        try:
            # Add the phase column with the enum type
            conn.execute(text("""
                ALTER TABLE workflow_templates 
                ADD COLUMN phase VARCHAR(20) NULL
            """))
            
            # Add check constraint for enum values
            conn.execute(text("""
                ALTER TABLE workflow_templates 
                ADD CONSTRAINT check_workflow_phase 
                CHECK (phase IN ('Progettazione', 'Connessione', 'Registrazione', 'Fiscale') OR phase IS NULL)
            """))
            
            conn.commit()
            print("✅ Successfully added phase column to workflow_templates")
            
        except Exception as e:
            conn.rollback()
            print(f"❌ Error adding phase column: {e}")
            raise

if __name__ == "__main__":
    add_workflow_phase_column()
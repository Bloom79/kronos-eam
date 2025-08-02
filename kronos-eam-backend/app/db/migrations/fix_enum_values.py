"""
Fix enum values in database to match Python enum values
"""

from sqlalchemy import text
from app.core.database import engine

def fix_enum_values():
    """Update enum types to use values instead of names"""
    
    with engine.connect() as conn:
        try:
            # Start transaction
            trans = conn.begin()
            
            print("Fixing enum values in database...")
            
            # 1. Create new enum types with correct values
            print("Creating new enum types with correct values...")
            
            # TaskStatusEnum
            conn.execute(text("""
                CREATE TYPE taskstatusenum_new AS ENUM (
                    'Da Iniziare', 'In Corso', 'Completato', 'In Ritardo', 'Bloccato'
                )
            """))
            
            # WorkflowStatusEnum  
            conn.execute(text("""
                CREATE TYPE workflowstatusenum_new AS ENUM (
                    'Bozza', 'Attivo', 'In Pausa', 'Completato', 'Annullato'
                )
            """))
            
            # AzioneStatusEnum
            conn.execute(text("""
                CREATE TYPE azionestatusenum_new AS ENUM (
                    'In Attesa', 'In Corso', 'Completata', 'Annullata', 'In Ritardo'
                )
            """))
            
            # TaskPriorityEnum
            conn.execute(text("""
                CREATE TYPE taskpriorityenum_new AS ENUM (
                    'High', 'Medium', 'Low'
                )
            """))
            
            # 2. Update columns to use new types
            print("Updating columns to use new enum types...")
            
            # Update workflow_tasks.status
            conn.execute(text("""
                ALTER TABLE workflow_tasks 
                ALTER COLUMN status TYPE taskstatusenum_new 
                USING CASE status::text
                    WHEN 'DA_INIZIARE' THEN 'Da Iniziare'::taskstatusenum_new
                    WHEN 'IN_CORSO' THEN 'In Corso'::taskstatusenum_new
                    WHEN 'COMPLETATO' THEN 'Completato'::taskstatusenum_new
                    WHEN 'IN_RITARDO' THEN 'In Ritardo'::taskstatusenum_new
                    WHEN 'BLOCCATO' THEN 'Bloccato'::taskstatusenum_new
                    ELSE 'Da Iniziare'::taskstatusenum_new
                END
            """))
            
            # Update workflow_tasks.priority
            conn.execute(text("""
                ALTER TABLE workflow_tasks 
                ALTER COLUMN priority TYPE taskpriorityenum_new 
                USING CASE priority::text
                    WHEN 'ALTA' THEN 'High'::taskpriorityenum_new
                    WHEN 'HIGH' THEN 'High'::taskpriorityenum_new
                    WHEN 'MEDIA' THEN 'Medium'::taskpriorityenum_new
                    WHEN 'MEDIUM' THEN 'Medium'::taskpriorityenum_new
                    WHEN 'BASSA' THEN 'Low'::taskpriorityenum_new
                    WHEN 'LOW' THEN 'Low'::taskpriorityenum_new
                    ELSE 'Medium'::taskpriorityenum_new
                END
            """))
            
            # Update workflow_tasks.stato_azione if it exists
            conn.execute(text("""
                DO $$ 
                BEGIN
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'workflow_tasks' 
                        AND column_name = 'stato_azione'
                        AND data_type = 'USER-DEFINED'
                    ) THEN
                        ALTER TABLE workflow_tasks 
                        ALTER COLUMN stato_azione TYPE azionestatusenum_new 
                        USING CASE stato_azione::text
                            WHEN 'IN_ATTESA' THEN 'In Attesa'::azionestatusenum_new
                            WHEN 'IN_CORSO' THEN 'In Corso'::azionestatusenum_new
                            WHEN 'COMPLETATA' THEN 'Completata'::azionestatusenum_new
                            WHEN 'ANNULLATA' THEN 'Annullata'::azionestatusenum_new
                            WHEN 'IN_RITARDO' THEN 'In Ritardo'::azionestatusenum_new
                            ELSE NULL
                        END;
                    END IF;
                END $$;
            """))
            
            # 3. Drop old enum types and rename new ones
            print("Dropping old enum types and renaming new ones...")
            
            conn.execute(text("DROP TYPE IF EXISTS taskstatusenum CASCADE"))
            conn.execute(text("ALTER TYPE taskstatusenum_new RENAME TO taskstatusenum"))
            
            conn.execute(text("DROP TYPE IF EXISTS workflowstatusenum CASCADE"))
            conn.execute(text("ALTER TYPE workflowstatusenum_new RENAME TO workflowstatusenum"))
            
            conn.execute(text("DROP TYPE IF EXISTS azionestatusenum CASCADE"))
            conn.execute(text("ALTER TYPE azionestatusenum_new RENAME TO azionestatusenum"))
            
            conn.execute(text("DROP TYPE IF EXISTS taskpriorityenum CASCADE"))
            conn.execute(text("ALTER TYPE taskpriorityenum_new RENAME TO taskpriorityenum"))
            
            # Commit transaction
            trans.commit()
            print("✅ Successfully fixed enum values")
            
        except Exception as e:
            trans.rollback()
            print(f"❌ Error during migration: {e}")
            raise

def rollback():
    """Rollback to use enum names instead of values"""
    print("⚠️ Rollback not implemented for this migration")
    print("Manual intervention may be required")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "rollback":
        rollback()
    else:
        fix_enum_values()
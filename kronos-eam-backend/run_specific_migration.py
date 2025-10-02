#!/usr/bin/env python3
"""
Direct database migration script to fix workflow_stages table
"""
import os
import sys
import psycopg2
from sqlalchemy import create_engine, text

# Add the app directory to the Python path
sys.path.insert(0, '/home/bloom/sentrics/kronos-eam-backend')

def fix_workflow_stages_table():
    """Fix workflow_stages table by adding missing columns"""
    
    # Database connection string - using default local PostgreSQL
    DATABASE_URL = "postgresql://postgres:password@localhost:5432/kronos_eam"
    
    try:
        # Create engine and connect
        engine = create_engine(DATABASE_URL)
        
        with engine.connect() as connection:
            # Start transaction
            trans = connection.begin()
            
            try:
                print("Checking workflow_stages table schema...")
                
                # Check existing columns
                result = connection.execute(text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'workflow_stages'
                    ORDER BY ordinal_position
                """)).fetchall()
                
                existing_columns = [row[0] for row in result]
                print(f"Existing columns: {existing_columns}")
                
                # Required columns that should exist
                required_columns = {
                    'entity_responsible': "VARCHAR(50)",
                    'document_templates': "JSON", 
                    'template_requirements': "JSON",
                    'completed': "BOOLEAN DEFAULT FALSE",
                    'duration_days': "INTEGER"
                }
                
                # Add missing columns
                for col_name, col_type in required_columns.items():
                    if col_name not in existing_columns:
                        print(f"Adding missing column: {col_name}")
                        connection.execute(text(f"""
                            ALTER TABLE workflow_stages 
                            ADD COLUMN {col_name} {col_type}
                        """))
                    else:
                        print(f"Column {col_name} already exists")
                
                # Check if we need to rename order_index to order
                if 'order_index' in existing_columns and 'order' not in existing_columns:
                    print("Renaming order_index to order")
                    connection.execute(text("""
                        ALTER TABLE workflow_stages 
                        RENAME COLUMN order_index TO "order"
                    """))
                elif 'order' in existing_columns:
                    print("Column 'order' already exists")
                
                # Commit transaction
                trans.commit()
                print("✅ workflow_stages table schema fixed successfully!")
                
            except Exception as e:
                trans.rollback()
                print(f"❌ Error during migration: {e}")
                raise
                
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        print("Make sure PostgreSQL is running and database exists")
        return False
        
    return True

if __name__ == "__main__":
    if fix_workflow_stages_table():
        print("Migration completed successfully!")
    else:
        print("Migration failed!")
        sys.exit(1)
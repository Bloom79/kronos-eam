"""Add missing columns to workflow tables

Revision ID: add_missing_workflow_columns
Revises: fix_workflow_stages_columns
Create Date: 2025-01-09 14:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy import text

# revision identifiers
revision = 'add_missing_workflow_columns'
down_revision = 'fix_workflow_stages_columns'
branch_labels = None
depends_on = None


def upgrade():
    """
    Add all missing columns to workflow_stages and related tables based on model definitions
    """
    connection = op.get_bind()
    
    # First, check and add missing columns to workflow_stages table
    print("Checking and adding missing columns to workflow_stages table...")
    
    # 1. Entity responsible column
    result = connection.execute(text("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'workflow_stages' 
        AND column_name = 'entity_responsible'
    """)).fetchone()
    
    if not result:
        print("Adding entity_responsible column")
        # Create the enum type first if it doesn't exist
        connection.execute(text("""
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'entityenum') THEN
                    CREATE TYPE entityenum AS ENUM ('DSO', 'Terna', 'GSE', 'Customs', 'Municipality', 'Region', 'Superintendence');
                END IF;
            END $$;
        """))
        
        op.add_column('workflow_stages', 
            sa.Column('entity_responsible', 
                     postgresql.ENUM('DSO', 'Terna', 'GSE', 'Customs', 'Municipality', 'Region', 'Superintendence', 
                                   name='entityenum', create_type=False), 
                     nullable=True))
    
    # 2. Document templates columns
    result = connection.execute(text("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'workflow_stages' 
        AND column_name = 'document_templates'
    """)).fetchone()
    
    if not result:
        print("Adding document_templates column")
        op.add_column('workflow_stages', 
            sa.Column('document_templates', sa.JSON(), nullable=True, server_default='[]'))
    
    # 3. Template requirements column
    result = connection.execute(text("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'workflow_stages' 
        AND column_name = 'template_requirements'
    """)).fetchone()
    
    if not result:
        print("Adding template_requirements column")
        op.add_column('workflow_stages', 
            sa.Column('template_requirements', sa.JSON(), nullable=True, server_default='{}'))
    
    # 4. Duration days column
    result = connection.execute(text("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'workflow_stages' 
        AND column_name = 'duration_days'
    """)).fetchone()
    
    if not result:
        print("Adding duration_days column")
        op.add_column('workflow_stages', 
            sa.Column('duration_days', sa.Integer(), nullable=True))
    
    # 5. Completed column
    result = connection.execute(text("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'workflow_stages' 
        AND column_name = 'completed'
    """)).fetchone()
    
    if not result:
        print("Adding completed column")
        op.add_column('workflow_stages', 
            sa.Column('completed', sa.Boolean(), nullable=False, server_default='false'))
    
    # 6. Start date column
    result = connection.execute(text("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'workflow_stages' 
        AND column_name = 'start_date'
    """)).fetchone()
    
    if not result:
        print("Adding start_date column")
        op.add_column('workflow_stages', 
            sa.Column('start_date', sa.DateTime(), nullable=True))
    
    # 7. End date column
    result = connection.execute(text("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'workflow_stages' 
        AND column_name = 'end_date'
    """)).fetchone()
    
    if not result:
        print("Adding end_date column")
        op.add_column('workflow_stages', 
            sa.Column('end_date', sa.DateTime(), nullable=True))
    
    # 8. Check if 'order' column exists or if we need to rename 'order_index'
    result_order = connection.execute(text("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'workflow_stages' 
        AND column_name = 'order'
    """)).fetchone()
    
    result_order_index = connection.execute(text("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'workflow_stages' 
        AND column_name = 'order_index'
    """)).fetchone()
    
    if result_order_index and not result_order:
        print("Renaming order_index to order")
        op.alter_column('workflow_stages', 'order_index', new_column_name='order')
    elif not result_order_index and not result_order:
        print("Adding order column")
        op.add_column('workflow_stages', 
            sa.Column('order', sa.Integer(), nullable=False, server_default='0'))
    
    # Now check workflow_tasks table for missing columns
    print("\nChecking workflow_tasks table for missing columns...")
    
    # Check for responsible_entity in workflow_tasks
    result = connection.execute(text("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'workflow_tasks' 
        AND column_name = 'responsible_entity'
    """)).fetchone()
    
    if not result:
        print("Adding responsible_entity column to workflow_tasks")
        op.add_column('workflow_tasks', 
            sa.Column('responsible_entity', 
                     postgresql.ENUM('DSO', 'Terna', 'GSE', 'Customs', 'Municipality', 'Region', 'Superintendence', 
                                   name='entityenum', create_type=False), 
                     nullable=True))
    
    # Check for practice_type
    result = connection.execute(text("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'workflow_tasks' 
        AND column_name = 'practice_type'
    """)).fetchone()
    
    if not result:
        print("Adding practice_type column to workflow_tasks")
        op.add_column('workflow_tasks', 
            sa.Column('practice_type', sa.String(100), nullable=True))
    
    # Check for practice_code
    result = connection.execute(text("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'workflow_tasks' 
        AND column_name = 'practice_code'
    """)).fetchone()
    
    if not result:
        print("Adding practice_code column to workflow_tasks")
        op.add_column('workflow_tasks', 
            sa.Column('practice_code', sa.String(100), nullable=True))
    
    # Check for portal_url
    result = connection.execute(text("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'workflow_tasks' 
        AND column_name = 'portal_url'
    """)).fetchone()
    
    if not result:
        print("Adding portal_url column to workflow_tasks")
        op.add_column('workflow_tasks', 
            sa.Column('portal_url', sa.String(500), nullable=True))
    
    # Check for integration column
    result = connection.execute(text("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'workflow_tasks' 
        AND column_name = 'integration'
    """)).fetchone()
    
    if not result:
        print("Adding integration column to workflow_tasks")
        op.add_column('workflow_tasks', 
            sa.Column('integration', 
                     postgresql.ENUM('DSO', 'Terna', 'GSE', 'Customs', 'Municipality', 'Region', 'Superintendence', 
                                   name='entityenum', create_type=False), 
                     nullable=True))
    
    # Check for guide_config
    result = connection.execute(text("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'workflow_tasks' 
        AND column_name = 'guide_config'
    """)).fetchone()
    
    if not result:
        print("Adding guide_config column to workflow_tasks")
        op.add_column('workflow_tasks', 
            sa.Column('guide_config', sa.JSON(), nullable=True, server_default='{}'))
    
    print("\nAll missing columns have been added successfully!")


def downgrade():
    """
    Remove added columns (use with caution)
    """
    # Remove columns from workflow_stages
    op.drop_column('workflow_stages', 'entity_responsible')
    op.drop_column('workflow_stages', 'document_templates')
    op.drop_column('workflow_stages', 'template_requirements')
    op.drop_column('workflow_stages', 'duration_days')
    op.drop_column('workflow_stages', 'completed')
    op.drop_column('workflow_stages', 'start_date')
    op.drop_column('workflow_stages', 'end_date')
    
    # Remove columns from workflow_tasks
    op.drop_column('workflow_tasks', 'responsible_entity')
    op.drop_column('workflow_tasks', 'practice_type')
    op.drop_column('workflow_tasks', 'practice_code')
    op.drop_column('workflow_tasks', 'portal_url')
    op.drop_column('workflow_tasks', 'integration')
    op.drop_column('workflow_tasks', 'guide_config')
"""Fix workflow_stages table columns

Revision ID: fix_workflow_stages_columns
Revises: rename_italian_columns_to_english
Create Date: 2025-01-09 13:54:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import text

# revision identifiers
revision = 'fix_workflow_stages_columns'
down_revision = 'rename_italian_columns_001'
branch_labels = None
depends_on = None

def upgrade():
    """
    Ensure workflow_stages table has all required columns with correct names
    """
    # Check current columns and add missing ones
    
    # Bind to connection
    connection = op.get_bind()
    
    # Check if entity_responsible column exists
    result = connection.execute(text("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'workflow_stages' 
        AND column_name = 'entity_responsible'
    """)).fetchone()
    
    if not result:
        print("Adding missing entity_responsible column")
        op.add_column('workflow_stages', sa.Column('entity_responsible', sa.String(50), nullable=True))
    
    # Check if document_templates column exists
    result = connection.execute(text("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'workflow_stages' 
        AND column_name = 'document_templates'
    """)).fetchone()
    
    if not result:
        print("Adding missing document_templates column")
        op.add_column('workflow_stages', sa.Column('document_templates', sa.JSON(), nullable=True))
    
    # Check if template_requirements column exists
    result = connection.execute(text("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'workflow_stages' 
        AND column_name = 'template_requirements'
    """)).fetchone()
    
    if not result:
        print("Adding missing template_requirements column")
        op.add_column('workflow_stages', sa.Column('template_requirements', sa.JSON(), nullable=True))
    
    # Check if completed column exists
    result = connection.execute(text("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'workflow_stages' 
        AND column_name = 'completed'
    """)).fetchone()
    
    if not result:
        print("Adding missing completed column")
        op.add_column('workflow_stages', sa.Column('completed', sa.Boolean(), nullable=False, server_default='false'))
    
    # Check if we need to rename order_index to order
    result = connection.execute(text("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'workflow_stages' 
        AND column_name = 'order_index'
    """)).fetchone()
    
    if result:
        result2 = connection.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'workflow_stages' 
            AND column_name = 'order'
        """)).fetchone()
        
        if not result2:
            print("Renaming order_index to order")
            op.alter_column('workflow_stages', 'order_index', new_column_name='order')


def downgrade():
    """
    Revert the changes
    """
    # This would remove the added columns, but we'll keep them for safety
    pass
"""Add guide and role fields to workflow models

Revision ID: 545f380f9bd0
Revises: 001
Create Date: 2025-07-31 16:45:18.011949

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '545f380f9bd0'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade():
    # Rename automation_config to guide_config in workflow_tasks
    op.alter_column('workflow_tasks', 'automation_config', 
                    new_column_name='guide_config',
                    existing_type=sa.JSON())
    
    # Add new fields to workflow_tasks
    op.add_column('workflow_tasks', sa.Column('instructions', sa.Text(), nullable=True))
    op.add_column('workflow_tasks', sa.Column('checklist_items', sa.JSON(), nullable=True))
    op.add_column('workflow_tasks', sa.Column('external_resources', sa.JSON(), nullable=True))
    op.add_column('workflow_tasks', sa.Column('allowed_roles', sa.JSON(), nullable=True))
    op.add_column('workflow_tasks', sa.Column('suggested_assignee_role', sa.String(50), nullable=True))
    
    # Add created_by_role to workflows
    op.add_column('workflows', sa.Column('created_by_role', sa.String(50), nullable=True))
    
    # Rename automation_available to has_guide in task_templates
    op.alter_column('task_templates', 'automation_available',
                    new_column_name='has_guide',
                    existing_type=sa.Boolean())


def downgrade():
    # Rename guide_config back to automation_config
    op.alter_column('workflow_tasks', 'guide_config',
                    new_column_name='automation_config',
                    existing_type=sa.JSON())
    
    # Remove new fields from workflow_tasks
    op.drop_column('workflow_tasks', 'instructions')
    op.drop_column('workflow_tasks', 'checklist_items')
    op.drop_column('workflow_tasks', 'external_resources')
    op.drop_column('workflow_tasks', 'allowed_roles')
    op.drop_column('workflow_tasks', 'suggested_assignee_role')
    
    # Remove created_by_role from workflows
    op.drop_column('workflows', 'created_by_role')
    
    # Rename has_guide back to automation_available
    op.alter_column('task_templates', 'has_guide',
                    new_column_name='automation_available',
                    existing_type=sa.Boolean())
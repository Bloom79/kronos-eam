"""add_stage_document_templates

Revision ID: 14929e5630b6
Revises: 83fea0373fe2
Create Date: 2025-09-04 19:29:27.253401

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '14929e5630b6'
down_revision = '83fea0373fe2'
branch_labels = None
depends_on = None


def upgrade():
    # Add entity_responsible and document management fields to workflow_stages
    op.add_column('workflow_stages', sa.Column('entity_responsible', sa.String(50), nullable=True))
    op.add_column('workflow_stages', sa.Column('document_templates', sa.JSON(), nullable=True))
    op.add_column('workflow_stages', sa.Column('template_requirements', sa.JSON(), nullable=True))
    
    # Create stage_document_templates table
    op.create_table('stage_document_templates',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('tenant_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('stage_id', sa.Integer(), nullable=False),
        sa.Column('template_id', sa.Integer(), nullable=True),
        sa.Column('template_name', sa.String(200), nullable=False),
        sa.Column('template_category', sa.String(100), nullable=True),
        sa.Column('entity_responsible', sa.String(50), nullable=True),
        sa.Column('file_path', sa.String(500), nullable=True),
        sa.Column('template_url', sa.String(500), nullable=True),
        sa.Column('is_required', sa.Boolean(), nullable=True),
        sa.Column('upload_deadline_days', sa.Integer(), nullable=True),
        sa.Column('version', sa.String(50), nullable=True),
        sa.Column('last_updated', sa.DateTime(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['stage_id'], ['workflow_stages.id'], ),
        sa.ForeignKeyConstraint(['template_id'], ['document_templates.id'], ),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_stage_document_templates_id'), 'stage_document_templates', ['id'], unique=False)
    op.create_index(op.f('ix_stage_document_templates_tenant_id'), 'stage_document_templates', ['tenant_id'], unique=False)


def downgrade():
    # Drop stage_document_templates table
    op.drop_index(op.f('ix_stage_document_templates_tenant_id'), table_name='stage_document_templates')
    op.drop_index(op.f('ix_stage_document_templates_id'), table_name='stage_document_templates')
    op.drop_table('stage_document_templates')
    
    # Drop columns from workflow_stages
    op.drop_column('workflow_stages', 'template_requirements')
    op.drop_column('workflow_stages', 'document_templates')
    op.drop_column('workflow_stages', 'entity_responsible')
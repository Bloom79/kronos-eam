"""Initial schema with English values

Revision ID: 001
Revises: 
Create Date: 2025-07-31 16:30:51

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create custom enum types
    op.execute("CREATE TYPE plantstatusenum AS ENUM ('In Operation', 'In Authorization', 'Under Construction', 'Decommissioned')")
    op.execute("CREATE TYPE planttypeenum AS ENUM ('Photovoltaic', 'Wind', 'Hydroelectric', 'Biomass', 'Geothermal')")
    op.execute("CREATE TYPE workflowstatusenum AS ENUM ('Draft', 'Active', 'Paused', 'Completed', 'Cancelled')")
    op.execute("CREATE TYPE taskstatusenum AS ENUM ('To Start', 'In Progress', 'Completed', 'Delayed', 'Blocked')")
    op.execute("CREATE TYPE taskpriorityenum AS ENUM ('High', 'Medium', 'Low')")
    op.execute("CREATE TYPE workflowcategoryenum AS ENUM ('Activation', 'Fiscal', 'Incentives', 'Changes', 'Maintenance', 'Compliance')")
    op.execute("CREATE TYPE entityenum AS ENUM ('DSO', 'Terna', 'GSE', 'Customs', 'Municipality', 'Region', 'Superintendence')")
    op.execute("CREATE TYPE tenantstatusenum AS ENUM ('Active', 'Suspended', 'Trial', 'Cancelled')")
    op.execute("CREATE TYPE tenantplanenum AS ENUM ('Basic', 'Professional', 'Enterprise')")
    op.execute("CREATE TYPE userroleenum AS ENUM ('Admin', 'Manager', 'Operator', 'Viewer')")
    op.execute("CREATE TYPE userstatusenum AS ENUM ('Active', 'Inactive', 'Suspended')")
    op.execute("CREATE TYPE maintenancetypeenum AS ENUM ('Ordinary', 'Extraordinary', 'Predictive', 'Corrective')")
    op.execute("CREATE TYPE maintenancestatusenum AS ENUM ('Completed', 'Planned', 'In Progress', 'Cancelled')")
    op.execute("CREATE TYPE actionstatusenum AS ENUM ('Waiting', 'In Progress', 'Completed', 'Cancelled', 'Delayed')")
    op.execute("CREATE TYPE workflowpurposeenum AS ENUM ('Complete Activation', 'Specific Process', 'Recurring Compliance', 'Custom', 'Phase Component')")
    op.execute("CREATE TYPE workflowphaseenum AS ENUM ('Design', 'Connection', 'Registration', 'Fiscal')")
    op.execute("CREATE TYPE workflowtypeenum AS ENUM ('STANDARD_REGISTRATION', 'SIMPLIFIED_REGISTRATION', 'ENERGY_COMMUNITY', 'CUSTOM', 'COMPOSITE')")
    op.execute("CREATE TYPE documenttypeenum AS ENUM ('Contract', 'Technical', 'Administrative', 'Legal', 'Financial', 'Other')")
    op.execute("CREATE TYPE documentstatusenum AS ENUM ('Draft', 'Approved', 'Expired', 'Archived')")
    op.execute("CREATE TYPE documentcategoryenum AS ENUM ('Project', 'Authorization', 'Connection', 'Incentive', 'Compliance', 'Maintenance')")
    op.execute("CREATE TYPE notificationtypeenum AS ENUM ('Info', 'Warning', 'Error', 'Success')")
    op.execute("CREATE TYPE notificationchannelenum AS ENUM ('Email', 'InApp', 'SMS', 'Push')")
    op.execute("CREATE TYPE notificationpriorityenum AS ENUM ('Low', 'Medium', 'High', 'Urgent')")
    op.execute("CREATE TYPE integrationtypeenum AS ENUM ('GSE', 'Terna', 'DSO', 'Customs', 'PEC', 'Other')")
    op.execute("CREATE TYPE integrationstatusenum AS ENUM ('Active', 'Inactive', 'Error', 'Maintenance')")
    op.execute("CREATE TYPE tipomodificaenum AS ENUM ('Addition', 'Update', 'Deletion')")

    # Create tenant_plans table
    op.create_table('tenant_plans',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('type', postgresql.ENUM('Basic', 'Professional', 'Enterprise', name='tenantplanenum'), nullable=False),
        sa.Column('max_users', sa.Integer(), nullable=False),
        sa.Column('max_plants', sa.Integer(), nullable=False),
        sa.Column('features', postgresql.JSON(), nullable=True),
        sa.Column('price_monthly', sa.Float(), nullable=False),
        sa.Column('price_yearly', sa.Float(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )

    # Create tenants table
    op.create_table('tenants',
        sa.Column('id', sa.String(50), nullable=False),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('status', postgresql.ENUM('Active', 'Suspended', 'Trial', 'Cancelled', name='tenantstatusenum'), nullable=False),
        sa.Column('plan_id', sa.Integer(), nullable=True),
        sa.Column('plan_expiry', sa.Date(), nullable=True),
        sa.Column('configuration', postgresql.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['plan_id'], ['tenant_plans.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create users table
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('name', sa.String(100), nullable=True),
        sa.Column('surname', sa.String(100), nullable=True),
        sa.Column('role', postgresql.ENUM('Admin', 'Manager', 'Operator', 'Viewer', name='userroleenum'), nullable=False),
        sa.Column('status', postgresql.ENUM('Active', 'Inactive', 'Suspended', name='userstatusenum'), nullable=False),
        sa.Column('phone', sa.String(50), nullable=True),
        sa.Column('last_login', sa.DateTime(), nullable=True),
        sa.Column('preferences', postgresql.JSON(), nullable=True),
        sa.Column('tenant_id', sa.String(50), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('created_by', sa.String(255), nullable=True),
        sa.Column('updated_by', sa.String(255), nullable=True),
        sa.Column('is_deleted', sa.Boolean(), nullable=True),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.Column('deleted_by', sa.String(255), nullable=True),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=False)
    op.create_index(op.f('ix_users_tenant_id'), 'users', ['tenant_id'], unique=False)

    # Create plants table  
    op.create_table('plants',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('code', sa.String(50), nullable=False),
        sa.Column('power', sa.String(50), nullable=False),
        sa.Column('power_kw', sa.Float(), nullable=False),
        sa.Column('status', postgresql.ENUM('In Operation', 'In Authorization', 'Under Construction', 'Decommissioned', name='plantstatusenum'), nullable=False),
        sa.Column('type', postgresql.ENUM('Photovoltaic', 'Wind', 'Hydroelectric', 'Biomass', 'Geothermal', name='planttypeenum'), nullable=False),
        sa.Column('location', sa.String(200), nullable=False),
        sa.Column('address', sa.String(500), nullable=True),
        sa.Column('municipality', sa.String(100), nullable=True),
        sa.Column('province', sa.String(10), nullable=True),
        sa.Column('region', sa.String(50), nullable=True),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('next_deadline', sa.DateTime(), nullable=True),
        sa.Column('next_deadline_type', sa.String(100), nullable=True),
        sa.Column('deadline_color', sa.String(20), nullable=True),
        sa.Column('registry_id', sa.Integer(), nullable=True),
        sa.Column('gse_integration', sa.Boolean(), nullable=True),
        sa.Column('terna_integration', sa.Boolean(), nullable=True),
        sa.Column('customs_integration', sa.Boolean(), nullable=True),
        sa.Column('dso_integration', sa.Boolean(), nullable=True),
        sa.Column('tags', postgresql.JSON(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('custom_fields', postgresql.JSON(), nullable=True),
        sa.Column('tenant_id', sa.String(50), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('created_by', sa.String(255), nullable=True),
        sa.Column('updated_by', sa.String(255), nullable=True),
        sa.Column('is_deleted', sa.Boolean(), nullable=True),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.Column('deleted_by', sa.String(255), nullable=True),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('code')
    )
    op.create_index(op.f('ix_plants_tenant_id'), 'plants', ['tenant_id'], unique=False)

    # Create workflow_templates table
    op.create_table('workflow_templates',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(50), nullable=True),
        sa.Column('plant_type', sa.String(50), nullable=True),
        sa.Column('min_power', sa.Float(), nullable=True),
        sa.Column('max_power', sa.Float(), nullable=True),
        sa.Column('estimated_duration_days', sa.Integer(), nullable=True),
        sa.Column('recurrence', sa.String(50), nullable=True),
        sa.Column('stages', postgresql.JSON(), nullable=False),
        sa.Column('tasks', postgresql.JSON(), nullable=False),
        sa.Column('required_entities', postgresql.JSON(), nullable=True),
        sa.Column('base_documents', postgresql.JSON(), nullable=True),
        sa.Column('activation_conditions', postgresql.JSON(), nullable=True),
        sa.Column('deadline_config', postgresql.JSON(), nullable=True),
        sa.Column('active', sa.Boolean(), nullable=True),
        sa.Column('tenant_id', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('updated_by', sa.Integer(), nullable=True),
        sa.Column('is_deleted', sa.Boolean(), nullable=True),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.Column('deleted_by', sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_workflow_templates_active', 'workflow_templates', ['active'], unique=False)
    op.create_index('idx_workflow_templates_category', 'workflow_templates', ['category'], unique=False)
    op.create_index('idx_workflow_templates_tenant', 'workflow_templates', ['tenant_id'], unique=False)

    # Create workflows table
    op.create_table('workflows',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('plant_id', sa.Integer(), nullable=False),
        sa.Column('plant_name', sa.String(200), nullable=True),
        sa.Column('type', sa.String(100), nullable=True),
        sa.Column('category', postgresql.ENUM('Activation', 'Fiscal', 'Incentives', 'Changes', 'Maintenance', 'Compliance', name='workflowcategoryenum'), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('current_status', sa.String(100), nullable=True),
        sa.Column('progress', sa.Float(), nullable=True),
        sa.Column('created_date', sa.DateTime(), nullable=True),
        sa.Column('due_date', sa.DateTime(), nullable=True),
        sa.Column('completion_date', sa.DateTime(), nullable=True),
        sa.Column('template_id', sa.Integer(), nullable=True),
        sa.Column('parent_workflow_id', sa.Integer(), nullable=True),
        sa.Column('original_workflow_id', sa.Integer(), nullable=True),
        sa.Column('is_standard', sa.Boolean(), nullable=True),
        sa.Column('workflow_type', postgresql.ENUM('STANDARD_REGISTRATION', 'SIMPLIFIED_REGISTRATION', 'ENERGY_COMMUNITY', 'CUSTOM', 'COMPOSITE', name='workflowtypeenum'), nullable=True),
        sa.Column('involved_entities', postgresql.JSON(), nullable=True),
        sa.Column('plant_power', sa.Float(), nullable=True),
        sa.Column('plant_type', sa.String(50), nullable=True),
        sa.Column('document_requirements', postgresql.JSON(), nullable=True),
        sa.Column('integration_status', postgresql.JSON(), nullable=True),
        sa.Column('config', postgresql.JSON(), nullable=True),
        sa.Column('model_metadata', postgresql.JSON(), nullable=True),
        sa.Column('tenant_id', sa.String(50), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('created_by', sa.String(255), nullable=True),
        sa.Column('updated_by', sa.String(255), nullable=True),
        sa.Column('is_deleted', sa.Boolean(), nullable=True),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.Column('deleted_by', sa.String(255), nullable=True),
        sa.ForeignKeyConstraint(['original_workflow_id'], ['workflows.id'], ),
        sa.ForeignKeyConstraint(['parent_workflow_id'], ['workflows.id'], ),
        sa.ForeignKeyConstraint(['plant_id'], ['plants.id'], ),
        sa.ForeignKeyConstraint(['template_id'], ['workflow_templates.id'], ),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_workflows_tenant_id'), 'workflows', ['tenant_id'], unique=False)

    # Create additional tables...
    # (Continue with all other tables from the schema)

    # Note: This is a simplified version. The complete migration would include
    # all tables, indexes, and constraints from the current database schema.


def downgrade() -> None:
    # Drop all tables in reverse order
    op.drop_table('workflows')
    op.drop_table('workflow_templates')
    op.drop_table('plants')
    op.drop_table('users')
    op.drop_table('tenants')
    op.drop_table('tenant_plans')
    
    # Drop all enum types
    op.execute("DROP TYPE IF EXISTS tipomodificaenum")
    op.execute("DROP TYPE IF EXISTS integrationstatusenum")
    op.execute("DROP TYPE IF EXISTS integrationtypeenum")
    op.execute("DROP TYPE IF EXISTS notificationpriorityenum")
    op.execute("DROP TYPE IF EXISTS notificationchannelenum")
    op.execute("DROP TYPE IF EXISTS notificationtypeenum")
    op.execute("DROP TYPE IF EXISTS documentcategoryenum")
    op.execute("DROP TYPE IF EXISTS documentstatusenum")
    op.execute("DROP TYPE IF EXISTS documenttypeenum")
    op.execute("DROP TYPE IF EXISTS workflowtypeenum")
    op.execute("DROP TYPE IF EXISTS workflowphaseenum")
    op.execute("DROP TYPE IF EXISTS workflowpurposeenum")
    op.execute("DROP TYPE IF EXISTS actionstatusenum")
    op.execute("DROP TYPE IF EXISTS maintenancestatusenum")
    op.execute("DROP TYPE IF EXISTS maintenancetypeenum")
    op.execute("DROP TYPE IF EXISTS userstatusenum")
    op.execute("DROP TYPE IF EXISTS userroleenum")
    op.execute("DROP TYPE IF EXISTS tenantplanenum")
    op.execute("DROP TYPE IF EXISTS tenantstatusenum")
    op.execute("DROP TYPE IF EXISTS entityenum")
    op.execute("DROP TYPE IF EXISTS workflowcategoryenum")
    op.execute("DROP TYPE IF EXISTS taskpriorityenum")
    op.execute("DROP TYPE IF EXISTS taskstatusenum")
    op.execute("DROP TYPE IF EXISTS workflowstatusenum")
    op.execute("DROP TYPE IF EXISTS planttypeenum")
    op.execute("DROP TYPE IF EXISTS plantstatusenum")
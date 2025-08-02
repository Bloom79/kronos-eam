"""Add entity specific data tables and task data collection fields

Revision ID: f2d81f9341a6
Revises: 545f380f9bd0
Create Date: 2025-07-31 16:55:51.675648

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f2d81f9341a6'
down_revision = '545f380f9bd0'
branch_labels = None
depends_on = None


def upgrade():
    # Create plant_dso_data table
    op.create_table('plant_dso_data',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('plant_id', sa.Integer(), nullable=False),
        sa.Column('tica_code', sa.String(100)),
        sa.Column('tica_request_date', sa.DateTime()),
        sa.Column('tica_approval_date', sa.DateTime()),
        sa.Column('tica_expiry_date', sa.DateTime()),
        sa.Column('connection_request_code', sa.String(100)),
        sa.Column('connection_power_kw', sa.Float()),
        sa.Column('connection_voltage', sa.String(50)),
        sa.Column('connection_point', sa.String(200)),
        sa.Column('pod_code', sa.String(50)),
        sa.Column('pod_activation_date', sa.DateTime()),
        sa.Column('meter_serial', sa.String(100)),
        sa.Column('meter_type', sa.String(100)),
        sa.Column('meter_installation_date', sa.DateTime()),
        sa.Column('contract_number', sa.String(100)),
        sa.Column('contract_type', sa.String(100)),
        sa.Column('transport_tariff', sa.String(50)),
        sa.Column('primary_substation', sa.String(100)),
        sa.Column('feeder_name', sa.String(100)),
        sa.Column('transformer_cabin', sa.String(100)),
        sa.Column('work_start_date', sa.DateTime()),
        sa.Column('work_completion_date', sa.DateTime()),
        sa.Column('connection_test_date', sa.DateTime()),
        sa.Column('portal_username', sa.String(100)),
        sa.Column('portal_last_access', sa.DateTime()),
        sa.Column('notes', sa.Text()),
        sa.Column('documents', sa.JSON()),
        sa.Column('updated_by', sa.Integer()),
        sa.Column('updated_from_workflow', sa.Integer()),
        sa.Column('updated_from_task', sa.Integer()),
        sa.Column('last_update', sa.DateTime()),
        sa.Column('tenant_id', sa.String(50), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('created_by', sa.String(255)),
        sa.Column('updated_by_user', sa.String(255)),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['plant_id'], ['plants.id'], ),
        sa.ForeignKeyConstraint(['updated_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['updated_from_workflow'], ['workflows.id'], ),
        sa.ForeignKeyConstraint(['updated_from_task'], ['workflow_tasks.id'], ),
        sa.UniqueConstraint('plant_id')
    )
    
    # Create plant_terna_data table
    op.create_table('plant_terna_data',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('plant_id', sa.Integer(), nullable=False),
        sa.Column('gaudi_code', sa.String(100)),
        sa.Column('gaudi_registration_date', sa.DateTime()),
        sa.Column('gaudi_practice_number', sa.String(100)),
        sa.Column('gaudi_up_code', sa.String(100)),
        sa.Column('censimp_code', sa.String(100)),
        sa.Column('censimp_section', sa.String(50)),
        sa.Column('censimp_registration_date', sa.DateTime()),
        sa.Column('terna_plant_code', sa.String(100)),
        sa.Column('terna_connection_code', sa.String(100)),
        sa.Column('nominal_power_mw', sa.Float()),
        sa.Column('active_power_mw', sa.Float()),
        sa.Column('reactive_power_mvar', sa.Float()),
        sa.Column('connection_level', sa.String(50)),
        sa.Column('grid_code_compliance', sa.Boolean()),
        sa.Column('grid_code_version', sa.String(50)),
        sa.Column('utf_meter_code', sa.String(100)),
        sa.Column('utf_validation_date', sa.DateTime()),
        sa.Column('dispatching_point_code', sa.String(100)),
        sa.Column('market_zone', sa.String(50)),
        sa.Column('anti_islanding_cert', sa.Boolean()),
        sa.Column('anti_islanding_cert_date', sa.DateTime()),
        sa.Column('myterna_username', sa.String(100)),
        sa.Column('myterna_profile', sa.String(50)),
        sa.Column('notes', sa.Text()),
        sa.Column('documents', sa.JSON()),
        sa.Column('updated_by', sa.Integer()),
        sa.Column('updated_from_workflow', sa.Integer()),
        sa.Column('updated_from_task', sa.Integer()),
        sa.Column('last_update', sa.DateTime()),
        sa.Column('tenant_id', sa.String(50), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('created_by', sa.String(255)),
        sa.Column('updated_by_user', sa.String(255)),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['plant_id'], ['plants.id'], ),
        sa.ForeignKeyConstraint(['updated_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['updated_from_workflow'], ['workflows.id'], ),
        sa.ForeignKeyConstraint(['updated_from_task'], ['workflow_tasks.id'], ),
        sa.UniqueConstraint('plant_id')
    )
    
    # Create plant_gse_data table
    op.create_table('plant_gse_data',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('plant_id', sa.Integer(), nullable=False),
        sa.Column('convention_number', sa.String(100)),
        sa.Column('convention_type', sa.String(100)),
        sa.Column('convention_date', sa.DateTime()),
        sa.Column('convention_expiry', sa.DateTime()),
        sa.Column('gse_practice_code', sa.String(100)),
        sa.Column('gse_plant_code', sa.String(100)),
        sa.Column('sapr_code', sa.String(100)),
        sa.Column('incentive_type', sa.String(100)),
        sa.Column('incentive_rate_euro_mwh', sa.Float()),
        sa.Column('incentive_duration_years', sa.Integer()),
        sa.Column('incentive_start_date', sa.DateTime()),
        sa.Column('incentive_end_date', sa.DateTime()),
        sa.Column('energy_account_number', sa.String(100)),
        sa.Column('bank_iban', sa.String(100)),
        sa.Column('payment_frequency', sa.String(50)),
        sa.Column('estimated_annual_production_mwh', sa.Float()),
        sa.Column('incentivized_production_cap_mwh', sa.Float()),
        sa.Column('antimafia_protocol', sa.String(100)),
        sa.Column('antimafia_date', sa.DateTime()),
        sa.Column('antimafia_expiry', sa.DateTime()),
        sa.Column('antimafia_status', sa.String(50)),
        sa.Column('fuel_mix_declaration', sa.Boolean()),
        sa.Column('fuel_mix_year', sa.Integer()),
        sa.Column('fuel_mix_deadline', sa.DateTime()),
        sa.Column('go_enabled', sa.Boolean()),
        sa.Column('go_account_number', sa.String(100)),
        sa.Column('gse_username', sa.String(100)),
        sa.Column('gse_profile_type', sa.String(50)),
        sa.Column('notes', sa.Text()),
        sa.Column('documents', sa.JSON()),
        sa.Column('updated_by', sa.Integer()),
        sa.Column('updated_from_workflow', sa.Integer()),
        sa.Column('updated_from_task', sa.Integer()),
        sa.Column('last_update', sa.DateTime()),
        sa.Column('tenant_id', sa.String(50), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('created_by', sa.String(255)),
        sa.Column('updated_by_user', sa.String(255)),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['plant_id'], ['plants.id'], ),
        sa.ForeignKeyConstraint(['updated_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['updated_from_workflow'], ['workflows.id'], ),
        sa.ForeignKeyConstraint(['updated_from_task'], ['workflow_tasks.id'], ),
        sa.UniqueConstraint('plant_id')
    )
    
    # Create plant_customs_data table
    op.create_table('plant_customs_data',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('plant_id', sa.Integer(), nullable=False),
        sa.Column('license_code', sa.String(100)),
        sa.Column('license_type', sa.String(100)),
        sa.Column('license_issue_date', sa.DateTime()),
        sa.Column('license_expiry_date', sa.DateTime()),
        sa.Column('workshop_code', sa.String(100)),
        sa.Column('workshop_authorization_date', sa.DateTime()),
        sa.Column('fiscal_warehouse', sa.Boolean()),
        sa.Column('annual_consumption_kwh', sa.Float()),
        sa.Column('declaration_year', sa.Integer()),
        sa.Column('declaration_submission_date', sa.DateTime()),
        sa.Column('declaration_protocol', sa.String(100)),
        sa.Column('license_fee_amount', sa.Float()),
        sa.Column('license_fee_deadline', sa.DateTime()),
        sa.Column('payment_date', sa.DateTime()),
        sa.Column('payment_receipt', sa.String(100)),
        sa.Column('telematic_code', sa.String(100)),
        sa.Column('edi_enabled', sa.Boolean()),
        sa.Column('pudm_username', sa.String(100)),
        sa.Column('seal_number', sa.String(100)),
        sa.Column('seal_date', sa.DateTime()),
        sa.Column('seal_verification_date', sa.DateTime()),
        sa.Column('next_verification_date', sa.DateTime()),
        sa.Column('utf_office', sa.String(100)),
        sa.Column('utf_inspector', sa.String(100)),
        sa.Column('last_inspection_date', sa.DateTime()),
        sa.Column('notes', sa.Text()),
        sa.Column('documents', sa.JSON()),
        sa.Column('updated_by', sa.Integer()),
        sa.Column('updated_from_workflow', sa.Integer()),
        sa.Column('updated_from_task', sa.Integer()),
        sa.Column('last_update', sa.DateTime()),
        sa.Column('tenant_id', sa.String(50), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('created_by', sa.String(255)),
        sa.Column('updated_by_user', sa.String(255)),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['plant_id'], ['plants.id'], ),
        sa.ForeignKeyConstraint(['updated_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['updated_from_workflow'], ['workflows.id'], ),
        sa.ForeignKeyConstraint(['updated_from_task'], ['workflow_tasks.id'], ),
        sa.UniqueConstraint('plant_id')
    )
    
    # Add new columns to workflow_tasks
    op.add_column('workflow_tasks', sa.Column('data_fields', sa.JSON(), nullable=True))
    op.add_column('workflow_tasks', sa.Column('target_table', sa.String(100), nullable=True))
    op.add_column('workflow_tasks', sa.Column('target_fields', sa.JSON(), nullable=True))
    op.add_column('workflow_tasks', sa.Column('completed_data', sa.JSON(), nullable=True))


def downgrade():
    # Remove columns from workflow_tasks
    op.drop_column('workflow_tasks', 'data_fields')
    op.drop_column('workflow_tasks', 'target_table')
    op.drop_column('workflow_tasks', 'target_fields')
    op.drop_column('workflow_tasks', 'completed_data')
    
    # Drop tables
    op.drop_table('plant_customs_data')
    op.drop_table('plant_gse_data')
    op.drop_table('plant_terna_data')
    op.drop_table('plant_dso_data')
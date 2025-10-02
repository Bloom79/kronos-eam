"""Add detailed technical fields for bureaucratic process

Revision ID: 83fea0373fe2
Revises: 001_complete_initial
Create Date: 2025-09-04 17:26:54.130602

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '83fea0373fe2'
down_revision = '001_complete_initial'
branch_labels = None
depends_on = None


def upgrade():
    # Add new fields to plant_registries table
    op.add_column('plant_registries', sa.Column('module_manufacturer', sa.String(length=200), nullable=True))
    op.add_column('plant_registries', sa.Column('module_model', sa.String(length=200), nullable=True))
    op.add_column('plant_registries', sa.Column('module_power_wp', sa.Float(), nullable=True))
    op.add_column('plant_registries', sa.Column('module_serial_numbers', sa.JSON(), nullable=True))
    op.add_column('plant_registries', sa.Column('module_total_area', sa.Float(), nullable=True))
    
    # Inverter details
    op.add_column('plant_registries', sa.Column('inverter_manufacturer', sa.String(length=200), nullable=True))
    op.add_column('plant_registries', sa.Column('inverter_model', sa.String(length=200), nullable=True))
    op.add_column('plant_registries', sa.Column('inverter_serial_numbers', sa.JSON(), nullable=True))
    op.add_column('plant_registries', sa.Column('inverter_firmware_version', sa.String(length=50), nullable=True))
    op.add_column('plant_registries', sa.Column('inverter_cei_certification', sa.String(length=100), nullable=True))
    
    # Protection system details
    op.add_column('plant_registries', sa.Column('spi_manufacturer', sa.String(length=200), nullable=True))
    op.add_column('plant_registries', sa.Column('spi_model', sa.String(length=200), nullable=True))
    op.add_column('plant_registries', sa.Column('spi_serial_number', sa.String(length=100), nullable=True))
    op.add_column('plant_registries', sa.Column('spi_calibration_date', sa.DateTime(), nullable=True))
    op.add_column('plant_registries', sa.Column('spi_calibration_parameters', sa.JSON(), nullable=True))
    op.add_column('plant_registries', sa.Column('spi_test_report_number', sa.String(length=100), nullable=True))
    op.add_column('plant_registries', sa.Column('spi_next_verification', sa.DateTime(), nullable=True))
    
    # Installer company details
    op.add_column('plant_registries', sa.Column('installer_company_name', sa.String(length=200), nullable=True))
    op.add_column('plant_registries', sa.Column('installer_company_vat', sa.String(length=20), nullable=True))
    op.add_column('plant_registries', sa.Column('installer_chamber_commerce_reg', sa.String(length=100), nullable=True))
    op.add_column('plant_registries', sa.Column('installer_dm3708_license', sa.String(length=100), nullable=True))
    op.add_column('plant_registries', sa.Column('installer_technical_manager', sa.String(length=200), nullable=True))
    op.add_column('plant_registries', sa.Column('installer_technical_manager_license', sa.String(length=100), nullable=True))
    
    # Connection process tracking
    op.add_column('plant_registries', sa.Column('tica_code', sa.String(length=100), nullable=True))
    op.add_column('plant_registries', sa.Column('tica_request_date', sa.DateTime(), nullable=True))
    op.add_column('plant_registries', sa.Column('tica_acceptance_date', sa.DateTime(), nullable=True))
    op.add_column('plant_registries', sa.Column('tica_expiry_date', sa.DateTime(), nullable=True))
    op.add_column('plant_registries', sa.Column('connection_cost_euro', sa.Float(), nullable=True))
    
    # Additional regulatory codes
    op.add_column('plant_registries', sa.Column('gse_contract_number', sa.String(length=100), nullable=True))
    op.add_column('plant_registries', sa.Column('customs_workshop_license', sa.String(length=100), nullable=True))
    op.add_column('plant_registries', sa.Column('antimafia_protocol', sa.String(length=100), nullable=True))
    op.add_column('plant_registries', sa.Column('antimafia_last_declaration', sa.DateTime(), nullable=True))
    
    # Fiscal metering
    op.add_column('plant_registries', sa.Column('fiscal_meter_model', sa.String(length=100), nullable=True))
    op.add_column('plant_registries', sa.Column('fiscal_meter_serial', sa.String(length=100), nullable=True))
    op.add_column('plant_registries', sa.Column('fiscal_meter_last_calibration', sa.DateTime(), nullable=True))
    op.add_column('plant_registries', sa.Column('fiscal_meter_mf_code', sa.String(length=50), nullable=True))
    
    # Add new fields to workflow_tasks table
    op.add_column('workflow_tasks', sa.Column('portal_login_url', sa.String(length=500), nullable=True))
    op.add_column('workflow_tasks', sa.Column('required_documents', sa.JSON(), nullable=True))
    op.add_column('workflow_tasks', sa.Column('document_templates', sa.JSON(), nullable=True))
    op.add_column('workflow_tasks', sa.Column('documents_to_generate', sa.JSON(), nullable=True))
    op.add_column('workflow_tasks', sa.Column('official_form_fields', sa.JSON(), nullable=True))
    op.add_column('workflow_tasks', sa.Column('submission_method', sa.String(length=100), nullable=True))
    op.add_column('workflow_tasks', sa.Column('external_protocol_number', sa.String(length=200), nullable=True))
    op.add_column('workflow_tasks', sa.Column('submission_date', sa.DateTime(), nullable=True))
    op.add_column('workflow_tasks', sa.Column('response_date', sa.DateTime(), nullable=True))
    op.add_column('workflow_tasks', sa.Column('cost_amount', sa.Float(), nullable=True))
    op.add_column('workflow_tasks', sa.Column('cost_description', sa.String(length=500), nullable=True))
    op.add_column('workflow_tasks', sa.Column('payment_method', sa.String(length=100), nullable=True))
    op.add_column('workflow_tasks', sa.Column('payment_reference', sa.String(length=200), nullable=True))
    op.add_column('workflow_tasks', sa.Column('regulatory_deadline', sa.DateTime(), nullable=True))
    op.add_column('workflow_tasks', sa.Column('deadline_type', sa.String(length=50), nullable=True))
    op.add_column('workflow_tasks', sa.Column('deadline_consequences', sa.Text(), nullable=True))
    op.add_column('workflow_tasks', sa.Column('requires_human_auth', sa.Boolean(), nullable=True))
    op.add_column('workflow_tasks', sa.Column('requires_physical_signature', sa.Boolean(), nullable=True))
    op.add_column('workflow_tasks', sa.Column('requires_site_inspection', sa.Boolean(), nullable=True))
    op.add_column('workflow_tasks', sa.Column('human_checkpoint_notes', sa.Text(), nullable=True))


def downgrade():
    # Remove fields from workflow_tasks table
    op.drop_column('workflow_tasks', 'human_checkpoint_notes')
    op.drop_column('workflow_tasks', 'requires_site_inspection')
    op.drop_column('workflow_tasks', 'requires_physical_signature')
    op.drop_column('workflow_tasks', 'requires_human_auth')
    op.drop_column('workflow_tasks', 'deadline_consequences')
    op.drop_column('workflow_tasks', 'deadline_type')
    op.drop_column('workflow_tasks', 'regulatory_deadline')
    op.drop_column('workflow_tasks', 'payment_reference')
    op.drop_column('workflow_tasks', 'payment_method')
    op.drop_column('workflow_tasks', 'cost_description')
    op.drop_column('workflow_tasks', 'cost_amount')
    op.drop_column('workflow_tasks', 'response_date')
    op.drop_column('workflow_tasks', 'submission_date')
    op.drop_column('workflow_tasks', 'external_protocol_number')
    op.drop_column('workflow_tasks', 'submission_method')
    op.drop_column('workflow_tasks', 'official_form_fields')
    op.drop_column('workflow_tasks', 'documents_to_generate')
    op.drop_column('workflow_tasks', 'document_templates')
    op.drop_column('workflow_tasks', 'required_documents')
    op.drop_column('workflow_tasks', 'portal_login_url')
    
    # Remove fields from plant_registries table
    op.drop_column('plant_registries', 'fiscal_meter_mf_code')
    op.drop_column('plant_registries', 'fiscal_meter_last_calibration')
    op.drop_column('plant_registries', 'fiscal_meter_serial')
    op.drop_column('plant_registries', 'fiscal_meter_model')
    op.drop_column('plant_registries', 'antimafia_last_declaration')
    op.drop_column('plant_registries', 'antimafia_protocol')
    op.drop_column('plant_registries', 'customs_workshop_license')
    op.drop_column('plant_registries', 'gse_contract_number')
    op.drop_column('plant_registries', 'connection_cost_euro')
    op.drop_column('plant_registries', 'tica_expiry_date')
    op.drop_column('plant_registries', 'tica_acceptance_date')
    op.drop_column('plant_registries', 'tica_request_date')
    op.drop_column('plant_registries', 'tica_code')
    op.drop_column('plant_registries', 'installer_technical_manager_license')
    op.drop_column('plant_registries', 'installer_technical_manager')
    op.drop_column('plant_registries', 'installer_dm3708_license')
    op.drop_column('plant_registries', 'installer_chamber_commerce_reg')
    op.drop_column('plant_registries', 'installer_company_vat')
    op.drop_column('plant_registries', 'installer_company_name')
    op.drop_column('plant_registries', 'spi_next_verification')
    op.drop_column('plant_registries', 'spi_test_report_number')
    op.drop_column('plant_registries', 'spi_calibration_parameters')
    op.drop_column('plant_registries', 'spi_calibration_date')
    op.drop_column('plant_registries', 'spi_serial_number')
    op.drop_column('plant_registries', 'spi_model')
    op.drop_column('plant_registries', 'spi_manufacturer')
    op.drop_column('plant_registries', 'inverter_cei_certification')
    op.drop_column('plant_registries', 'inverter_firmware_version')
    op.drop_column('plant_registries', 'inverter_serial_numbers')
    op.drop_column('plant_registries', 'inverter_model')
    op.drop_column('plant_registries', 'inverter_manufacturer')
    op.drop_column('plant_registries', 'module_total_area')
    op.drop_column('plant_registries', 'module_serial_numbers')
    op.drop_column('plant_registries', 'module_power_wp')
    op.drop_column('plant_registries', 'module_model')
    op.drop_column('plant_registries', 'module_manufacturer')
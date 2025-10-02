"""Rename Italian columns in documents table to English

Revision ID: rename_documents_italian_columns
Revises: rename_italian_columns_001
Create Date: 2025-09-05 11:00:00

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'rename_documents_italian_columns'
down_revision = 'rename_italian_columns_001'
branch_labels = None
depends_on = None


def upgrade():
    """Rename Italian column names in documents table to English"""
    
    # Define column renames for documents table
    column_renames = [
        ('nome', 'name'),
        ('descrizione', 'description'),
        ('tipo', 'type'),
        ('categoria', 'category'),
        ('impianto_id', 'plant_id'),
        ('data_caricamento', 'upload_date'),
        ('data_scadenza', 'expiry_date'),
        ('data_ultima_modifica', 'last_modified_date'),
        ('versione', 'version'),
        ('stato', 'status'),
        ('riferimenti_normativi', 'regulatory_references'),
        ('link_esterni', 'external_links'),
        ('abilita_notifiche', 'enable_notifications'),
    ]
    
    # Apply column renames
    for old_name, new_name in column_renames:
        try:
            op.alter_column('documents', old_name, new_column_name=new_name)
            print(f"Renamed documents.{old_name} -> {new_name}")
        except Exception as e:
            print(f"Skipping documents.{old_name}: {str(e)}")


def downgrade():
    """Revert column names back to Italian"""
    
    # Define column renames for rollback (English to Italian)
    column_renames = [
        ('name', 'nome'),
        ('description', 'descrizione'),
        ('type', 'tipo'),
        ('category', 'categoria'),
        ('plant_id', 'impianto_id'),
        ('upload_date', 'data_caricamento'),
        ('expiry_date', 'data_scadenza'),
        ('last_modified_date', 'data_ultima_modifica'),
        ('version', 'versione'),
        ('status', 'stato'),
        ('regulatory_references', 'riferimenti_normativi'),
        ('external_links', 'link_esterni'),
        ('enable_notifications', 'abilita_notifiche'),
    ]
    
    # Apply column renames in reverse
    for old_name, new_name in column_renames:
        try:
            op.alter_column('documents', old_name, new_column_name=new_name)
        except Exception as e:
            print(f"Skipping documents.{old_name}: {str(e)}")
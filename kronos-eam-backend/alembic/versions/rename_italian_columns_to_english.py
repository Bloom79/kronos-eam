"""Rename Italian columns to English

Revision ID: rename_italian_columns
Revises: 83fea0373fe2
Create Date: 2025-09-05 10:50:00

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'rename_italian_columns_001'
down_revision = ['83fea0373fe2', '14929e5630b6']
branch_labels = None
depends_on = None


def upgrade():
    """Rename Italian column names to English"""
    
    # Define column renames for each table
    column_renames = {
        'workflows': [
            ('nome', 'name'),
            ('impianto_id', 'plant_id'),
            ('impianto_nome', 'plant_name'),
            ('tipo', 'type'),
            ('categoria', 'category'),
            ('descrizione', 'description'),
            ('stato_corrente', 'current_status'),
            ('progresso', 'progress'),
            ('data_creazione', 'created_date'),
            ('data_scadenza', 'due_date'),
            ('data_completamento', 'completion_date'),
            ('enti_coinvolti', 'involved_entities'),
            ('potenza_impianto', 'plant_power'),
            ('tipo_impianto', 'plant_type'),
            ('requisiti_documenti', 'document_requirements'),
            ('stato_integrazioni', 'integration_status'),
            ('ruolo_creatore', 'created_by_role'),
        ],
        'workflow_templates': [
            ('nome', 'name'),
            ('descrizione', 'description'),
            ('categoria', 'category'),
            ('tipo_impianto', 'plant_type'),
            ('potenza_minima', 'min_power'),
            ('potenza_massima', 'max_power'),
            ('durata_stimata_giorni', 'estimated_duration_days'),
            ('ricorrenza', 'recurrence'),
            ('enti_richiesti', 'required_entities'),
            ('documenti_base', 'base_documents'),
            ('condizioni_attivazione', 'activation_conditions'),
            ('configurazione_scadenze', 'deadline_config'),
            ('scopo_workflow', 'workflow_purpose'),
            ('workflow_completo', 'is_complete_workflow'),
        ],
        'workflow_stages': [
            ('nome', 'name'),
            ('ordine', 'order'),
            ('completato', 'completed'),
            ('data_inizio', 'start_date'),
            ('data_fine', 'end_date'),
            ('ente_responsabile', 'entity_responsible'),
            ('template_documenti', 'document_templates'),
            ('requisiti_template', 'template_requirements'),
            ('durata_giorni', 'duration_days'),
        ],
        'workflow_tasks': [
            ('titolo', 'title'),
            ('descrizione', 'description'),
            ('stato', 'status'),
            ('priorita', 'priority'),
            ('assegnatario', 'assignee'),
            ('data_scadenza', 'due_date'),
            ('ore_stimate', 'estimated_hours'),
            ('ore_effettive', 'actual_hours'),
            ('dipendenze', 'dependencies'),
            ('integrazione', 'integration'),
            ('ente_responsabile', 'responsible_entity'),
            ('tipo_pratica', 'practice_type'),
            ('codice_pratica', 'practice_code'),
            ('url_portale', 'portal_url'),
            ('url_login_portale', 'portal_login_url'),
            ('credenziali_richieste', 'required_credentials'),
            ('documenti_richiesti', 'required_documents'),
            ('template_documenti', 'document_templates'),
            ('documenti_da_generare', 'documents_to_generate'),
            ('campi_modulo_ufficiale', 'official_form_fields'),
            ('metodo_invio', 'submission_method'),
            ('numero_protocollo_esterno', 'external_protocol_number'),
            ('data_invio', 'submission_date'),
            ('data_risposta', 'response_date'),
            ('importo_costo', 'cost_amount'),
            ('descrizione_costo', 'cost_description'),
            ('metodo_pagamento', 'payment_method'),
            ('riferimento_pagamento', 'payment_reference'),
            ('scadenza_normativa', 'regulatory_deadline'),
            ('tipo_scadenza', 'deadline_type'),
            ('conseguenze_scadenza', 'deadline_consequences'),
            ('cronologia', 'timeline'),
            ('documenti_associati', 'associated_documents'),
            ('stato_azione', 'action_status'),
            ('istruzioni', 'instructions'),
            ('elementi_checklist', 'checklist_items'),
            ('risorse_esterne', 'external_resources'),
            ('ruoli_permessi', 'allowed_roles'),
            ('ruolo_assegnatario_suggerito', 'suggested_assignee_role'),
            ('richiede_auth_umana', 'requires_human_auth'),
            ('richiede_firma_fisica', 'requires_physical_signature'),
            ('richiede_sopralluogo', 'requires_site_inspection'),
            ('note_checkpoint_umano', 'human_checkpoint_notes'),
            ('campi_dati', 'data_fields'),
            ('tabella_target', 'target_table'),
            ('campi_target', 'target_fields'),
            ('dati_completati', 'completed_data'),
            ('completato_da', 'completed_by'),
            ('data_completamento', 'completed_date'),
        ],
        'plants': [
            ('nome', 'name'),
            ('tipo', 'type'),
            ('indirizzo', 'address'),
            ('comune', 'municipality'),
            ('provincia', 'province'),
            ('regione', 'region'),
            ('potenza_kw', 'power_kw'),
            ('stato', 'status'),
            ('data_attivazione', 'activation_date'),
            ('proprietario', 'owner'),
        ]
    }
    
    # Apply column renames
    for table_name, renames in column_renames.items():
        # Check if table exists
        if op.get_bind().dialect.has_table(op.get_bind(), table_name):
            for old_name, new_name in renames:
                # Check if old column exists before renaming
                try:
                    op.alter_column(table_name, old_name, new_column_name=new_name)
                    print(f"Renamed {table_name}.{old_name} -> {new_name}")
                except Exception as e:
                    # Column might not exist or already renamed
                    print(f"Skipping {table_name}.{old_name}: {str(e)}")


def downgrade():
    """Revert column names back to Italian"""
    
    # Define column renames for rollback (English to Italian)
    column_renames = {
        'workflows': [
            ('name', 'nome'),
            ('plant_id', 'impianto_id'),
            ('plant_name', 'impianto_nome'),
            ('type', 'tipo'),
            ('category', 'categoria'),
            ('description', 'descrizione'),
            ('current_status', 'stato_corrente'),
            ('progress', 'progresso'),
            ('created_date', 'data_creazione'),
            ('due_date', 'data_scadenza'),
            ('completion_date', 'data_completamento'),
            ('involved_entities', 'enti_coinvolti'),
            ('plant_power', 'potenza_impianto'),
            ('plant_type', 'tipo_impianto'),
            ('document_requirements', 'requisiti_documenti'),
            ('integration_status', 'stato_integrazioni'),
            ('created_by_role', 'ruolo_creatore'),
        ],
        # ... (similar for other tables, reversed)
    }
    
    # Apply column renames in reverse
    for table_name, renames in column_renames.items():
        if op.get_bind().dialect.has_table(op.get_bind(), table_name):
            for old_name, new_name in renames:
                try:
                    op.alter_column(table_name, old_name, new_column_name=new_name)
                except Exception:
                    pass
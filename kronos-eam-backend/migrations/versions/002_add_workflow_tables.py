"""Add workflow tables with renewable energy fields

Revision ID: 002
Revises: 001
Create Date: 2025-07-18

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade():
    # Create ENUM types
    op.execute("CREATE TYPE IF NOT EXISTS workflow_status_enum AS ENUM ('Bozza', 'Attivo', 'In Pausa', 'Completato', 'Annullato')")
    op.execute("CREATE TYPE IF NOT EXISTS task_status_enum AS ENUM ('Da Iniziare', 'In Corso', 'Completato', 'In Ritardo', 'Bloccato')")
    op.execute("CREATE TYPE IF NOT EXISTS task_priority_enum AS ENUM ('Alta', 'Media', 'Bassa')")
    op.execute("CREATE TYPE IF NOT EXISTS workflow_category_enum AS ENUM ('Attivazione', 'Fiscale', 'Incentivi', 'Variazioni', 'Maintenance', 'Compliance')")
    op.execute("CREATE TYPE IF NOT EXISTS entity_enum AS ENUM ('DSO', 'Terna', 'GSE', 'Dogane', 'Comune', 'Regione', 'Soprintendenza')")
    
    # Add columns to workflows table if it exists
    try:
        op.add_column('workflows', sa.Column('categoria', sa.Enum('Attivazione', 'Fiscale', 'Incentivi', 'Variazioni', 'Maintenance', 'Compliance', name='workflow_category_enum'), nullable=True))
        op.add_column('workflows', sa.Column('enti_coinvolti', sa.JSON(), nullable=True))
        op.add_column('workflows', sa.Column('potenza_impianto', sa.Float(), nullable=True))
        op.add_column('workflows', sa.Column('tipo_impianto', sa.String(50), nullable=True))
        op.add_column('workflows', sa.Column('requisiti_documenti', sa.JSON(), nullable=True))
        op.add_column('workflows', sa.Column('stato_integrazioni', sa.JSON(), nullable=True))
        op.add_column('workflows', sa.Column('model_metadata', sa.JSON(), nullable=True))
        op.add_column('workflows', sa.Column('template_id', sa.Integer(), nullable=True))
    except:
        pass  # Table might not exist yet
    
    # Add columns to workflow_stages table if it exists
    try:
        op.add_column('workflow_stages', sa.Column('durata_giorni', sa.Integer(), nullable=True))
        op.add_column('workflow_stages', sa.Column('data_inizio', sa.DateTime(), nullable=True))
        op.add_column('workflow_stages', sa.Column('data_fine', sa.DateTime(), nullable=True))
    except:
        pass
    
    # Add columns to workflow_tasks table if it exists
    try:
        op.add_column('workflow_tasks', sa.Column('descrizione', sa.Text(), nullable=True))
        op.add_column('workflow_tasks', sa.Column('dipendenze', sa.JSON(), nullable=True))
        op.add_column('workflow_tasks', sa.Column('ente_responsabile', sa.Enum('DSO', 'Terna', 'GSE', 'Dogane', 'Comune', 'Regione', 'Soprintendenza', name='entity_enum'), nullable=True))
        op.add_column('workflow_tasks', sa.Column('tipo_pratica', sa.String(100), nullable=True))
        op.add_column('workflow_tasks', sa.Column('codice_pratica', sa.String(100), nullable=True))
        op.add_column('workflow_tasks', sa.Column('url_portale', sa.String(500), nullable=True))
        op.add_column('workflow_tasks', sa.Column('credenziali_richieste', sa.String(50), nullable=True))
        op.add_column('workflow_tasks', sa.Column('integrazione', sa.Enum('DSO', 'Terna', 'GSE', 'Dogane', 'Comune', 'Regione', 'Soprintendenza', name='entity_enum'), nullable=True))
        op.add_column('workflow_tasks', sa.Column('automazione_config', sa.JSON(), nullable=True))
        op.add_column('workflow_tasks', sa.Column('completato_da', sa.String(255), nullable=True))
        op.add_column('workflow_tasks', sa.Column('completato_data', sa.DateTime(), nullable=True))
    except:
        pass
    
    # Create workflow_templates table
    op.create_table('workflow_templates',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('nome', sa.String(200), nullable=False),
        sa.Column('descrizione', sa.Text(), nullable=True),
        sa.Column('categoria', sa.Enum('Attivazione', 'Fiscale', 'Incentivi', 'Variazioni', 'Maintenance', 'Compliance', name='workflow_category_enum'), nullable=True),
        sa.Column('tipo_impianto', sa.String(50), nullable=True),
        sa.Column('potenza_minima', sa.Float(), nullable=True),
        sa.Column('potenza_massima', sa.Float(), nullable=True),
        sa.Column('durata_stimata_giorni', sa.Integer(), nullable=True),
        sa.Column('ricorrenza', sa.String(50), nullable=True),
        sa.Column('stages', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('tasks', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('enti_richiesti', sa.JSON(), nullable=True, server_default='[]'),
        sa.Column('documenti_base', sa.JSON(), nullable=True, server_default='[]'),
        sa.Column('condizioni_attivazione', sa.JSON(), nullable=True, server_default='{}'),
        sa.Column('scadenza_config', sa.JSON(), nullable=True, server_default='{}'),
        sa.Column('attivo', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('tenant_id', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('updated_by', sa.Integer(), nullable=True),
        sa.Column('is_deleted', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.Column('deleted_by', sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_workflow_templates_tenant', 'workflow_templates', ['tenant_id'])
    op.create_index('idx_workflow_templates_categoria', 'workflow_templates', ['categoria'])
    op.create_index('idx_workflow_templates_attivo', 'workflow_templates', ['attivo'])
    
    # Create task_templates table
    op.create_table('task_templates',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('nome', sa.String(200), nullable=False),
        sa.Column('descrizione', sa.Text(), nullable=True),
        sa.Column('responsabile_default', sa.String(100), nullable=True),
        sa.Column('durata_stimata_ore', sa.Float(), nullable=True),
        sa.Column('documenti_richiesti', sa.JSON(), nullable=True, server_default='[]'),
        sa.Column('checkpoints', sa.JSON(), nullable=True, server_default='[]'),
        sa.Column('integrazione', sa.String(50), nullable=True),
        sa.Column('automazione_disponibile', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('tenant_id', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('updated_by', sa.Integer(), nullable=True),
        sa.Column('is_deleted', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.Column('deleted_by', sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_task_templates_tenant', 'task_templates', ['tenant_id'])
    
    # Create task_documents table
    op.create_table('task_documents',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('task_id', sa.Integer(), nullable=False),
        sa.Column('nome', sa.String(255), nullable=False),
        sa.Column('tipo', sa.String(10), nullable=True),
        sa.Column('dimensione', sa.Integer(), nullable=True),
        sa.Column('url', sa.String(500), nullable=True),
        sa.Column('document_id', sa.Integer(), nullable=True),
        sa.Column('tipo_documento', sa.String(50), nullable=True),
        sa.Column('tenant_id', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('updated_by', sa.Integer(), nullable=True),
        sa.Column('is_deleted', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.Column('deleted_by', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['task_id'], ['workflow_tasks.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['document_id'], ['documents.id']),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create task_comments table
    op.create_table('task_comments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('task_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('testo', sa.Text(), nullable=False),
        sa.Column('tenant_id', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('updated_by', sa.Integer(), nullable=True),
        sa.Column('is_deleted', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.Column('deleted_by', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['task_id'], ['workflow_tasks.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade():
    # Drop tables
    op.drop_table('task_comments')
    op.drop_table('task_documents')
    op.drop_table('task_templates')
    op.drop_table('workflow_templates')
    
    # Drop columns from existing tables
    try:
        op.drop_column('workflow_tasks', 'completato_data')
        op.drop_column('workflow_tasks', 'completato_da')
        op.drop_column('workflow_tasks', 'automazione_config')
        op.drop_column('workflow_tasks', 'integrazione')
        op.drop_column('workflow_tasks', 'credenziali_richieste')
        op.drop_column('workflow_tasks', 'url_portale')
        op.drop_column('workflow_tasks', 'codice_pratica')
        op.drop_column('workflow_tasks', 'tipo_pratica')
        op.drop_column('workflow_tasks', 'ente_responsabile')
        op.drop_column('workflow_tasks', 'dipendenze')
        op.drop_column('workflow_tasks', 'descrizione')
    except:
        pass
    
    try:
        op.drop_column('workflow_stages', 'data_fine')
        op.drop_column('workflow_stages', 'data_inizio')
        op.drop_column('workflow_stages', 'durata_giorni')
    except:
        pass
    
    try:
        op.drop_column('workflows', 'template_id')
        op.drop_column('workflows', 'model_metadata')
        op.drop_column('workflows', 'stato_integrazioni')
        op.drop_column('workflows', 'requisiti_documenti')
        op.drop_column('workflows', 'tipo_impianto')
        op.drop_column('workflows', 'potenza_impianto')
        op.drop_column('workflows', 'enti_coinvolti')
        op.drop_column('workflows', 'categoria')
    except:
        pass
    
    # Drop ENUM types
    op.execute("DROP TYPE IF EXISTS entity_enum")
    op.execute("DROP TYPE IF EXISTS workflow_category_enum")
    op.execute("DROP TYPE IF EXISTS task_priority_enum")
    op.execute("DROP TYPE IF EXISTS task_status_enum")
    op.execute("DROP TYPE IF EXISTS workflow_status_enum")
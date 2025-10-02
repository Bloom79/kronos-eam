#!/usr/bin/env python3
"""
Comprehensive script to replace ALL Italian field names with English in backend
"""
import os
import re
from pathlib import Path

# Extended field mappings including database fields
FIELD_MAPPINGS = {
    # Basic fields
    'nome': 'name',
    'descrizione': 'description',
    'categoria': 'category',
    'tipo': 'type',
    'stato': 'status',
    'titolo': 'title',
    'contenuto': 'content',
    'autore': 'author',
    'note': 'notes',
    
    # Plant-specific fields
    'tipo_impianto': 'plant_type',
    'potenza_minima': 'min_power',
    'potenza_massima': 'max_power',
    'potenza_impianto': 'plant_power',
    'impianto_id': 'plant_id',
    'impianto_nome': 'plant_name',
    'impiantoNome': 'plant_name',  # Camelcase variant
    
    # Workflow fields
    'durata_stimata_giorni': 'estimated_duration_days',
    'ricorrenza': 'recurrence',
    'enti_richiesti': 'required_entities',
    'enti_coinvolti': 'involved_entities',
    'documenti_base': 'base_documents',
    'condizioni_attivazione': 'activation_conditions',
    'configurazione_scadenze': 'deadline_config',
    'scadenza_config': 'deadline_config',
    'scopo_workflow': 'workflow_purpose',
    'workflow_completo': 'is_complete_workflow',
    
    # Stage/Task fields
    'durata_giorni': 'duration_days',
    'ordine': 'order',
    'ente_responsabile': 'responsible_entity',
    'priorita': 'priority',
    'assegnatario': 'assignee',
    'ore_stimate': 'estimated_hours',
    'data_scadenza': 'due_date',
    'scadenza': 'due_date',
    
    # Status/Progress fields
    'progresso': 'progress',
    'completato': 'completed',
    'bloccato': 'blocked',
    'in_ritardo': 'delayed',
    
    # Date fields
    'data_creazione': 'created_at',
    'data_aggiornamento': 'updated_at',
    'data_inizio': 'start_date',
    'data_fine': 'end_date',
    'data_completamento': 'completion_date',
    'completato_data': 'completed_date',
    'completato_da': 'completed_by',
    
    # Document fields
    'documenti': 'documents',
    'documenti_richiesti': 'required_documents',
    'template_documenti': 'document_templates',
    'documenti_da_generare': 'documents_to_generate',
    'requisiti_documenti': 'document_requirements',
    
    # Integration fields
    'integrazione': 'integration',
    'tipo_integrazione': 'integration_type',
    'stato_integrazioni': 'integration_status',
    'credenziali_richieste': 'required_credentials',
    'url_portale': 'portal_url',
    'url_login_portale': 'portal_login_url',
    'metodo_invio': 'submission_method',
    
    # Task-specific
    'checkpoints': 'checklist_items',
    'dipendenze': 'dependencies',
    'tipo_pratica': 'practice_type',
    'codice_pratica': 'practice_code',
    'numero_protocollo_esterno': 'external_protocol_number',
    'istruzioni': 'instructions',
    'risorse_esterne': 'external_resources',
    'campi_modulo_ufficiale': 'official_form_fields',
    
    # Cost fields
    'importo_costo': 'cost_amount',
    'descrizione_costo': 'cost_description',
    'metodo_pagamento': 'payment_method',
    'riferimento_pagamento': 'payment_reference',
    
    # Regulatory fields
    'scadenza_normativa': 'regulatory_deadline',
    'tipo_scadenza': 'deadline_type',
    'conseguenze_scadenza': 'deadline_consequences',
    
    # Role management
    'ruoli_permessi': 'allowed_roles',
    'ruolo_suggerito': 'suggested_assignee_role',
    
    # Human checkpoint fields
    'richiede_auth_umana': 'requires_human_auth',
    'richiede_firma_fisica': 'requires_physical_signature',
    'richiede_sopralluogo': 'requires_site_inspection',
    'note_checkpoint_umano': 'human_checkpoint_notes',
    
    # Data collection fields
    'campi_dati': 'data_fields',
    'tabella_target': 'target_table',
    'campi_target': 'target_fields',
    
    # Comments and attachments
    'commenti': 'comments',
    'allegati': 'attachments',
    
    # Misc
    'task_nome': 'task_name',
    'stage_nome': 'stage_name',
    'compito_descrizione': 'task_description',
    'estimatedHours': 'estimated_hours',
    'dueDate': 'due_date',
}

# Enum value mappings
ENUM_MAPPINGS = {
    'ATTIVAZIONE': 'ACTIVATION',
    'FISCALE': 'FISCAL',
    'INCENTIVI': 'INCENTIVES',
    'VARIAZIONI': 'CHANGES',
    'MANUTENZIONE': 'MAINTENANCE',
    'CONFORMITA': 'COMPLIANCE',
    'PROGETTAZIONE': 'DESIGN',
    'CONNESSIONE': 'CONNECTION',
    'REGISTRAZIONE': 'REGISTRATION',
}

def fix_field_assignments(content):
    """Fix field assignments in Python code"""
    for italian, english in FIELD_MAPPINGS.items():
        # Fix dictionary key assignments like nome="value"
        pattern1 = rf'\b{italian}='
        replacement1 = f'{english}='
        content = re.sub(pattern1, replacement1, content)
        
        # Fix dictionary access like data["nome"]
        pattern2 = rf'\["{italian}"\]'
        replacement2 = f'["{english}"]'
        content = re.sub(pattern2, replacement2, content)
        
        # Fix dictionary access like data['nome']
        pattern3 = rf"\['{italian}'\]"
        replacement3 = f"['{english}']"
        content = re.sub(pattern3, replacement3, content)
        
        # Fix .get("nome")
        pattern4 = rf'\.get\("{italian}"'
        replacement4 = f'.get("{english}"'
        content = re.sub(pattern4, replacement4, content)
        
        # Fix .get('nome')
        pattern5 = rf"\.get\('{italian}'"
        replacement5 = f".get('{english}'"
        content = re.sub(pattern5, replacement5, content)
        
        # Fix attribute access like .nome (be careful with word boundaries)
        pattern6 = rf'\.{italian}\b(?!\w)'
        replacement6 = f'.{english}'
        content = re.sub(pattern6, replacement6, content)
        
        # Fix filter conditions like Workflow.nome
        pattern7 = rf'\b(\w+)\.{italian}\b'
        replacement7 = rf'\1.{english}'
        content = re.sub(pattern7, replacement7, content)
    
    # Fix enum values
    for italian, english in ENUM_MAPPINGS.items():
        content = re.sub(rf'WorkflowCategoryEnum\.{italian}\b', f'WorkflowCategoryEnum.{english}', content)
        content = re.sub(rf'WorkflowPhaseEnum\.{italian}\b', f'WorkflowPhaseEnum.{english}', content)
    
    # Fix specific patterns that were missed
    content = re.sub(r'scadenza_config', 'deadline_config', content)
    
    return content

def fix_schema_fields(content):
    """Fix Pydantic schema field definitions"""
    for italian, english in FIELD_MAPPINGS.items():
        # Fix field definitions like nome: str
        pattern = rf'^(\s*){italian}:\s*'
        replacement = rf'\1{english}: '
        content = re.sub(pattern, replacement, content, flags=re.MULTILINE)
    
    return content

def fix_sqlalchemy_columns(content):
    """Fix SQLAlchemy column definitions"""
    for italian, english in FIELD_MAPPINGS.items():
        # Fix column definitions like nome = Column(String)
        pattern = rf'^(\s*){italian}\s*=\s*Column\('
        replacement = rf'\1{english} = Column('
        content = re.sub(pattern, replacement, content, flags=re.MULTILINE)
    
    return content

def process_file(file_path):
    """Process a single file"""
    print(f"Processing {file_path.relative_to(Path(__file__).parent.parent)}...")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Apply different fixes based on file type
        if file_path.name.endswith('.py'):
            content = fix_field_assignments(content)
            
            # Apply specific fixes for different types of files
            if '/schemas/' in str(file_path):
                content = fix_schema_fields(content)
            elif '/models/' in str(file_path):
                content = fix_sqlalchemy_columns(content)
        
        # Only write if changes were made
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"  ✓ Updated {file_path.name}")
        else:
            print(f"  - No changes needed in {file_path.name}")
            
    except Exception as e:
        print(f"  ✗ Error processing {file_path.name}: {e}")

def main():
    """Main function"""
    backend_dir = Path(__file__).parent.parent
    
    # Directories to process
    directories = [
        backend_dir / "app" / "api" / "v1" / "endpoints",
        backend_dir / "app" / "schemas",
        backend_dir / "app" / "models",
        backend_dir / "app" / "services",
        backend_dir / "app" / "data",
        backend_dir / "app" / "agents",
        backend_dir / "app" / "db",
    ]
    
    print("Starting comprehensive Italian to English field name conversion...\n")
    
    files_processed = 0
    files_updated = 0
    
    for directory in directories:
        if not directory.exists():
            continue
            
        print(f"\nProcessing {directory.relative_to(backend_dir)}...")
        
        for py_file in directory.rglob("*.py"):
            if py_file.name != "__init__.py":
                process_file(py_file)
                files_processed += 1
    
    print(f"\nConversion complete!")
    print(f"Files processed: {files_processed}")
    print("\nNext steps:")
    print("1. Run alembic to generate database migration")
    print("2. Review and apply the migration")
    print("3. Test all API endpoints")

if __name__ == "__main__":
    main()
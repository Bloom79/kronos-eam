#!/usr/bin/env python3
"""
Script to replace Italian field names with English in backend API endpoints
"""
import os
import re
from pathlib import Path

# Define field mappings from Italian to English
FIELD_MAPPINGS = {
    'nome': 'name',
    'descrizione': 'description',
    'categoria': 'category',
    'tipo_impianto': 'plant_type',
    'potenza_minima': 'min_power',
    'potenza_massima': 'max_power',
    'durata_stimata_giorni': 'estimated_duration_days',
    'ricorrenza': 'recurrence',
    'enti_richiesti': 'required_entities',
    'documenti_base': 'base_documents',
    'condizioni_attivazione': 'activation_conditions',
    'configurazione_scadenze': 'deadline_config',
    'scopo_workflow': 'workflow_purpose',
    'workflow_completo': 'is_complete_workflow',
    'durata_giorni': 'duration_days',
    'ordine': 'order',
    'ente_responsabile': 'responsible_entity',
    'priorita': 'priority',
    'tipo': 'type',
    'stato': 'status',
    'data_creazione': 'created_at',
    'data_aggiornamento': 'updated_at',
    'data_inizio': 'start_date',
    'data_fine': 'end_date',
    'data_scadenza': 'due_date',
    'completato': 'completed',
    'bloccato': 'blocked',
    'in_ritardo': 'delayed',
    'assegnatario': 'assignee',
    'ore_stimate': 'estimated_hours',
    'checkpoints': 'checkpoints',  # Already English
    'documenti': 'documents',
    'commenti': 'comments',
    'allegati': 'attachments',
    'note': 'notes',
    'titolo': 'title',
    'contenuto': 'content',
    'autore': 'author',
    'task_nome': 'task_name',
    'compito_descrizione': 'task_description',
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
        
        # Fix attribute access like .nome
        pattern6 = rf'\.{italian}\b'
        replacement6 = f'.{english}'
        content = re.sub(pattern6, replacement6, content)
    
    return content

def fix_specific_workflow_endpoint(content):
    """Fix the specific workflow template endpoint that's causing the error"""
    # Fix the WorkflowTemplateResponse construction
    content = re.sub(
        r'return WorkflowTemplateResponse\(\s*id=template_id,\s*nome=',
        'return WorkflowTemplateResponse(\n                id=template_id,\n                name=',
        content
    )
    
    # Fix workflow_data access patterns
    content = re.sub(
        r'workflow_data\["name"\]',
        'workflow_data.get("name", "")',
        content
    )
    
    return content

def process_file(file_path):
    """Process a single file"""
    print(f"Processing {file_path}...")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Apply fixes
        content = fix_field_assignments(content)
        content = fix_specific_workflow_endpoint(content)
        
        # Only write if changes were made
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"  ✓ Updated {file_path}")
        else:
            print(f"  - No changes needed in {file_path}")
            
    except Exception as e:
        print(f"  ✗ Error processing {file_path}: {e}")

def main():
    """Main function"""
    # Get the backend directory
    backend_dir = Path(__file__).parent.parent
    
    # Files to process
    files_to_process = [
        backend_dir / "app" / "api" / "v1" / "endpoints" / "workflow.py",
        backend_dir / "app" / "api" / "v1" / "endpoints" / "documents.py",
        backend_dir / "app" / "api" / "v1" / "endpoints" / "tasks.py",
        backend_dir / "app" / "api" / "v1" / "endpoints" / "plants.py",
    ]
    
    # Add any other Python files in the API endpoints directory
    api_dir = backend_dir / "app" / "api" / "v1" / "endpoints"
    if api_dir.exists():
        for py_file in api_dir.glob("*.py"):
            if py_file not in files_to_process and py_file.name != "__init__.py":
                files_to_process.append(py_file)
    
    print("Starting Italian to English field name conversion...\n")
    
    for file_path in files_to_process:
        if file_path.exists():
            process_file(file_path)
    
    print("\nConversion complete!")
    print("\nNext steps:")
    print("1. Check if database columns need migration")
    print("2. Update any data initialization scripts")
    print("3. Test the API endpoints")

if __name__ == "__main__":
    main()
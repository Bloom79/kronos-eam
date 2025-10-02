#!/usr/bin/env python3
"""Fix Italian field names in document-related backend files"""

import os
import re
from pathlib import Path

# Define field mappings for documents
DOCUMENT_FIELD_MAPPINGS = {
    # Document model fields
    'data_caricamento': 'upload_date',
    'data_ultima_modifica': 'last_modified_date',
    'data_scadenza': 'expiry_date',
    'versione': 'version',
    'riferimenti_normativi': 'regulatory_references',
    'link_esterni': 'external_links',
    'abilita_notifiche': 'enable_notifications',
    'dimensione': 'size_display',
    
    # DocumentVersion fields
    'modifiche': 'changes',
    'modificato_da': 'modified_by',
    
    # DocumentCopy fields
    'documento_originale_id': 'original_document_id',
    'utente_creazione_id': 'created_by_user_id',
    'nome_copia': 'copy_name',
    'contenuto_customizzato': 'customized_content',
    'data_copia': 'copy_date',
    'ultima_modifica_copia': 'last_modified_copy',
    'modifiche_applicate': 'applied_changes',
    'note_personalizzazione': 'customization_notes',
    'documento_originale': 'original_document',
    
    # DocumentTemplate fields
    'uso': 'usage_type',
    'attivo': 'active',
    'condizioni': 'conditions',
    
    # Other common document-related terms
    'impianto_id': 'plant_id',
    'riferimento_normativo': 'regulatory_reference',
}

def fix_file(file_path):
    """Fix Italian field names in a single file"""
    print(f"Processing {file_path}...")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        replacements_made = []
        
        # Apply each mapping
        for italian, english in DOCUMENT_FIELD_MAPPINGS.items():
            # Count occurrences before replacement
            count_before = len(re.findall(rf'\b{italian}\b', content))
            
            if count_before > 0:
                # Replace field names in various contexts
                patterns = [
                    # As property/attribute
                    (rf'\.{italian}\b', f'.{english}'),
                    # As dictionary key
                    (rf'"({italian})"', f'"{english}"'),
                    (rf"'({italian})'", f"'{english}'"),
                    # As variable/parameter
                    (rf'\b{italian}(?=\s*=)', english),
                    # In function parameters
                    (rf'\({italian}:', f'({english}:'),
                    (rf',\s*{italian}:', f', {english}:'),
                    (rf'\s{italian}:', f' {english}:'),
                    # Column references
                    (rf'Column\("{italian}"\)', f'Column("{english}")'),
                    (rf"Column\('{italian}'\)", f"Column('{english}')"),
                    # In comparisons
                    (rf'=\s*{italian}\b', f'= {english}'),
                    # As standalone identifier
                    (rf'\b{italian}\b', english),
                ]
                
                for pattern, replacement in patterns:
                    content = re.sub(pattern, replacement, content)
                
                # Count occurrences after replacement
                count_after = len(re.findall(rf'\b{italian}\b', content))
                
                if count_before != count_after:
                    replacements_made.append(f"{italian} -> {english} ({count_before - count_after} replacements)")
        
        # Save if changes were made
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"  Fixed {file_path}:")
            for replacement in replacements_made:
                print(f"    - {replacement}")
        else:
            print(f"  No changes needed in {file_path}")
            
    except Exception as e:
        print(f"  Error processing {file_path}: {e}")

def main():
    """Main function to fix Italian field names in document-related files"""
    base_dir = Path(__file__).parent.parent / 'app'
    
    # Files to process
    target_files = [
        'schemas/document.py',
        'api/v1/endpoints/documents.py',
        'services/document_service.py',
        'services/document_indexing.py',
        'data/connection_request_workflow.py',
        'data/gaudi_registration_workflow.py',
    ]
    
    for file_path in target_files:
        full_path = base_dir / file_path
        if full_path.exists():
            fix_file(full_path)
        else:
            print(f"File not found: {full_path}")
    
    print("\nDocument field name fixes completed!")

if __name__ == "__main__":
    main()
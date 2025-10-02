#!/usr/bin/env python3
"""Update init script to use English field names"""

import re

def update_init_script(file_path):
    """Update init script to use English field names"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Field replacements
    replacements = [
        (r'"nome":', '"name":'),
        (r'"descrizione":', '"description":'),
        (r'"categoria":', '"category":'),
        (r'"tipo_impianto":', '"plant_type":'),
        (r'"potenza_minima":', '"min_power":'),
        (r'"potenza_massima":', '"max_power":'),
        (r'"durata_stimata_giorni":', '"estimated_duration_days":'),
        (r'"ricorrenza":', '"recurrence":'),
        (r'"enti_richiesti":', '"required_entities":'),
        (r'"documenti_base":', '"base_documents":'),
        (r'"ordine":', '"order":'),
        (r'"durata_giorni":', '"duration_days":'),
        (r'"responsabile":', '"assignee":'),
        (r'"priorita":', '"priority":'),
        (r'"ente_responsabile":', '"responsible_entity":'),
        (r'"documenti_richiesti":', '"required_documents":'),
        (r'"checkpoints":', '"checklist_items":'),
        (r'"tipo_pratica":', '"practice_type":'),
        (r'"codice_pratica":', '"practice_code":'),
        (r'"url_portale":', '"portal_url":'),
        (r'"url_login_portale":', '"portal_login_url":'),
        (r'"credenziali_richieste":', '"required_credentials":'),
        (r'"documenti_da_generare":', '"documents_to_generate":'),
        (r'"campi_modulo_ufficiale":', '"official_form_fields":'),
        (r'"importo_costo":', '"cost_amount":'),
        (r'"descrizione_costo":', '"cost_description":'),
        (r'"metodo_pagamento":', '"payment_method":'),
        (r'"riferimento_pagamento":', '"payment_reference":'),
        (r'"scadenza_normativa":', '"regulatory_deadline":'),
        (r'"tipo_scadenza":', '"deadline_type":'),
        (r'"conseguenze_scadenza":', '"deadline_consequences":'),
        (r'"richiede_sopralluogo":', '"requires_site_inspection":'),
        (r'"note_checkpoint_umano":', '"human_checkpoint_notes":'),
        (r'"richiede_auth_umana":', '"requires_human_auth":'),
        (r'"richiede_firma_fisica":', '"requires_physical_signature":'),
        (r'"condizioni":', '"conditions":'),
        (r'"se":', '"if":'),
        (r'"allora":', '"then":'),
        # Also update enum references
        (r'WorkflowCategoryEnum\.ATTIVAZIONE', 'WorkflowCategoryEnum.ACTIVATION'),
        (r'WorkflowCategoryEnum\.FISCALE', 'WorkflowCategoryEnum.FISCAL'),
        (r'WorkflowPurposeEnum\.ACTIVATION_COMPLETE', 'WorkflowPurposeEnum.COMPLETE_ACTIVATION'),
    ]
    
    # Apply replacements
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)
    
    # Write back the updated content
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Updated {file_path}")

if __name__ == "__main__":
    update_init_script("/home/bloom/sentrics/kronos-eam-backend/app/db/init_workflow_templates.py")
#!/usr/bin/env python3
"""Script to update workflow template field names from Italian to English"""

import json
import re

def update_dict_keys(data):
    """Recursively update dictionary keys from Italian to English"""
    
    # Mapping of Italian field names to English
    field_mapping = {
        "nome": "name",
        "descrizione": "description",
        "categoria": "category",
        "tipo_impianto": "plant_type",
        "potenza_minima": "min_power",
        "potenza_massima": "max_power",
        "durata_stimata_giorni": "estimated_duration_days",
        "ricorrenza": "recurrence",
        "enti_richiesti": "required_entities",
        "documenti_base": "base_documents",
        "ordine": "order",
        "durata_giorni": "duration_days",
        "responsabile": "assignee",
        "priorita": "priority",
        "ente_responsabile": "responsible_entity",
        "documenti_richiesti": "required_documents",
        "checkpoints": "checklist_items",
        "tipo_pratica": "practice_type",
        "codice_pratica": "practice_code",
        "url_portale": "portal_url",
        "url_login_portale": "portal_login_url",
        "credenziali_richieste": "required_credentials",
        "documenti_da_generare": "documents_to_generate",
        "campi_modulo_ufficiale": "official_form_fields",
        "importo_costo": "cost_amount",
        "descrizione_costo": "cost_description",
        "metodo_pagamento": "payment_method",
        "riferimento_pagamento": "payment_reference",
        "scadenza_normativa": "regulatory_deadline",
        "tipo_scadenza": "deadline_type",
        "conseguenze_scadenza": "deadline_consequences",
        "richiede_sopralluogo": "requires_site_inspection",
        "note_checkpoint_umano": "human_checkpoint_notes",
        "richiede_auth_umana": "requires_human_auth",
        "richiede_firma_fisica": "requires_physical_signature",
        "condizioni": "conditions",
        "se": "if",
        "allora": "then"
    }
    
    if isinstance(data, dict):
        new_dict = {}
        for key, value in data.items():
            # Update the key if it's in our mapping
            new_key = field_mapping.get(key, key)
            # Recursively update the value
            new_dict[new_key] = update_dict_keys(value)
        return new_dict
    elif isinstance(data, list):
        return [update_dict_keys(item) for item in data]
    else:
        return data

def update_workflow_file(file_path):
    """Update a workflow Python file to use English field names"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Simple field replacements in strings
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
    ]
    
    # Apply replacements
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)
    
    # Write back the updated content
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Updated {file_path}")

if __name__ == "__main__":
    import sys
    import os
    
    # Files to update
    files = [
        "/home/bloom/sentrics/kronos-eam-backend/app/data/solar_installation_complete.py",
        "/home/bloom/sentrics/kronos-eam-backend/app/data/renewable_energy_workflow.py",
        "/home/bloom/sentrics/kronos-eam-backend/app/data/connection_request_workflow.py",
        "/home/bloom/sentrics/kronos-eam-backend/app/data/gaudi_registration_workflow.py",
        "/home/bloom/sentrics/kronos-eam-backend/app/data/gse_activation_workflow.py",
        "/home/bloom/sentrics/kronos-eam-backend/app/data/customs_agency_workflow.py"
    ]
    
    for file_path in files:
        if os.path.exists(file_path):
            update_workflow_file(file_path)
        else:
            print(f"File not found: {file_path}")
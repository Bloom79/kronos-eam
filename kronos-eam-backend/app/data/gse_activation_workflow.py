"""
GSE Activation Workflow for Energy Services
Gestore dei Servizi Energetici - Energy valorization and incentives
Updated for 2025 regulations with RID (Ritiro Dedicato) focus
"""

from app.models.workflow import WorkflowCategoryEnum, EntityEnum
from datetime import datetime

GSE_ACTIVATION_WORKFLOW = {
    "name": "Attivazione Servizi GSE",
    "description": "Processo di attivazione servizi GSE per valorizzazione energia e gestione incentivi",
    "category": WorkflowCategoryEnum.ACTIVATION,
    "plant_type": "Fotovoltaico",
    "min_power": 0,
    "max_power": None,
    "estimated_duration_days": 20,
    "recurrence": "Una tantum con adempimenti annuali",
    "required_entities": [EntityEnum.GSE.value],
    "base_documents": [
        "CENSIMP da GAUDÌ",
        "Documento identità titolare",
        "IBAN per accrediti",
        "Documentazione fiscale"
    ],
    "note_importanti": [
        "Dal 31/12/2024 lo Scambio sul Posto (SSP) non è più attivabile",
        "Il Ritiro Dedicato (RID) è il regime principale per nuovi impianti",
        "Dal 05/03/2025 è obbligatoria l'autenticazione MFA per l'accesso",
        "La dichiarazione antimafia è obbligatoria per incentivi > 150.000€/anno"
    ],
    "stages": [
        {
            "name": "FASE 1 - REGISTRAZIONE E ACCESSO",
            "order": 1,
            "duration_days": 3,
            "tasks": [
                {
                    "name": "Registrazione Area Clienti GSE",
                    "description": "Creazione account nell'area clienti GSE",
                    "assignee": "Asset Manager",
                    "duration_days": 1,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.GSE.value,
                    "portal_url": "https://areaclienti.gse.it/",
                    "portal_login_url": "https://auth.gse.it/",
                    "required_credentials": "SPID/CIE/CNS",
                    "checklist_items": [
                        "Accesso con SPID/CIE/CNS",
                        "Compilazione dati anagrafici",
                        "Attivazione account",
                        "Configurazione MFA (dal 05/03/2025)"
                    ],
                    "official_form_fields": {
                        "dati_utente": {
                            "name": "Nome",
                            "cognome": "Cognome",
                            "cf": "Codice fiscale",
                            "email": "Email",
                            "telefono": "Telefono cellulare per MFA"
                        }
                    },
                    "requires_human_auth": True,
                    "human_checkpoint_notes": "Richiede autenticazione SPID/CIE/CNS e configurazione MFA"
                },
                {
                    "name": "Verifica Integrazione GAUDÌ-GSE",
                    "description": "Verifica corretta trasmissione dati da GAUDÌ a GSE",
                    "assignee": "Asset Manager",
                    "duration_days": 1,
                    "priority": "Alta",
                    "checklist_items": [
                        "Verifica presenza CENSIMP in area clienti",
                        "Controllo dati impianto ricevuti",
                        "Verifica coerenza dati tecnici",
                        "Segnalazione eventuali discrepanze"
                    ],
                    "note": "I dati GAUDÌ sono trasmessi automaticamente ma vanno verificati"
                },
                {
                    "name": "Mandato/Procura per Gestione Terzi",
                    "description": "Caricamento mandato se la pratica è gestita da terzi",
                    "assignee": "Produttore",
                    "duration_days": 1,
                    "priority": "Alta",
                    "conditions": {
                        "if": "gestore != produttore",
                        "then": "obbligatorio = true"
                    },
                    "required_documents": [
                        "Mandato/procura firmata dal produttore",
                        "Documento identità mandante",
                        "Documento identità mandatario"
                    ],
                    "requires_physical_signature": True,
                    "submission_method": "Upload su portale GSE"
                }
            ]
        },
        {
            "name": "FASE 2 - ATTIVAZIONE RITIRO DEDICATO",
            "order": 2,
            "duration_days": 10,
            "tasks": [
                {
                    "name": "Richiesta Attivazione RID",
                    "description": "Compilazione e invio richiesta Ritiro Dedicato",
                    "assignee": "Asset Manager",
                    "duration_days": 2,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.GSE.value,
                    "portal_url": "https://areaclienti.gse.it/",
                    "practice_type": "RID - Ritiro Dedicato",
                    "checklist_items": [
                        "Selezione servizio RID",
                        "Compilazione dati contrattuali",
                        "Upload documentazione",
                        "Invio richiesta"
                    ],
                    "official_form_fields": {
                        "dati_contratto": {
                            "censimp": "Codice CENSIMP da GAUDÌ",
                            "pod": "Codice POD",
                            "regime_cessione": "Totale/Eccedenze",
                            "data_entrata_esercizio": "Data connessione"
                        },
                        "dati_fiscali": {
                            "regime_fiscale": "Impresa/Persona fisica",
                            "partita_iva": "P.IVA (se impresa)",
                            "codice_ateco": "Codice ATECO attività"
                        },
                        "modalita_pagamento": {
                            "iban": "Codice IBAN",
                            "intestatario_conto": "Intestatario conto"
                        }
                    },
                    "documents_to_generate": ["Richiesta RID protocollata"]
                },
                {
                    "name": "Dichiarazione IVA 10%",
                    "description": "Dichiarazione per applicazione IVA agevolata (se applicabile)",
                    "assignee": "Amministrazione",
                    "duration_days": 1,
                    "priority": "Media",
                    "conditions": {
                        "if": "settore == 'agricolo' OR 'uso_prevalente_abitazione'",
                        "then": "applicabile = true"
                    },
                    "required_documents": [
                        "Dichiarazione sostitutiva IVA 10%",
                        "Documentazione comprovante diritto"
                    ],
                    "official_form_fields": {
                        "tipo_agevolazione": "Agricolo/Abitazione principale",
                        "dichiarazioni": "Conferma requisiti per IVA 10%"
                    }
                },
                {
                    "name": "Configurazione Prezzi Minimi Garantiti",
                    "description": "Richiesta prezzi minimi garantiti per impianti < 1MW",
                    "assignee": "Asset Manager",
                    "duration_days": 1,
                    "priority": "Media",
                    "conditions": {
                        "if": "potenza < 1000",
                        "then": "disponibile = true"
                    },
                    "checklist_items": [
                        "Verifica eleggibilità PMG",
                        "Selezione opzione PMG",
                        "Conferma modalità"
                    ],
                    "note": "PMG disponibili per i primi 2.000.000 kWh/anno"
                },
                {
                    "name": "Verifica e Accettazione Contratto",
                    "description": "Ricezione e accettazione contratto RID da GSE",
                    "assignee": "Asset Manager",
                    "duration_days": 5,
                    "priority": "Alta",
                    "checklist_items": [
                        "Attesa elaborazione pratica GSE",
                        "Ricezione bozza contratto",
                        "Verifica termini contrattuali",
                        "Accettazione online contratto"
                    ],
                    "regulatory_deadline": "30 giorni per accettazione",
                    "deadline_type": "ordinario",
                    "external_protocol_number": "Numero contratto RID",
                    "documents_to_generate": ["Contratto RID firmato digitalmente"]
                },
                {
                    "name": "Comunicazione Dati Misuratori",
                    "description": "Comunicazione configurazione misuratori per fatturazione",
                    "assignee": "Tecnico",
                    "duration_days": 1,
                    "priority": "Alta",
                    "required_documents": [
                        "Schema misuratori UTF",
                        "Certificati taratura contatori"
                    ],
                    "official_form_fields": {
                        "misuratore_produzione": {
                            "matricola": "Matricola contatore produzione",
                            "tipo": "Tipo contatore",
                            "costante_lettura": "Costante di lettura"
                        },
                        "misuratore_scambio": {
                            "matricola": "Matricola contatore scambio",
                            "configurazione": "Monodirezionale/Bidirezionale"
                        }
                    }
                }
            ]
        },
        {
            "name": "FASE 3 - ADEMPIMENTI COMPLIANCE",
            "order": 3,
            "duration_days": 7,
            "tasks": [
                {
                    "name": "Dichiarazione Antimafia",
                    "description": "Presentazione dichiarazione antimafia per incentivi > 150k€",
                    "assignee": "Legale Rappresentante",
                    "duration_days": 3,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.GSE.value,
                    "conditions": {
                        "if": "incentivi_annui > 150000",
                        "then": "obbligatorio = true"
                    },
                    "portal_url": "https://areaclienti.gse.it/",
                    "required_documents": [
                        "Modulo dichiarazione antimafia",
                        "Visura camerale aggiornata",
                        "Documenti soci e amministratori"
                    ],
                    "official_form_fields": {
                        "societa": {
                            "denominazione": "Ragione sociale",
                            "cf_piva": "CF/P.IVA",
                            "cciaa": "Numero REA"
                        },
                        "soggetti": {
                            "amministratori": "Lista amministratori con CF",
                            "soci": "Lista soci > 25% con CF",
                            "familiari": "Familiari conviventi maggiorenni"
                        }
                    },
                    "regulatory_deadline": "Annuale",
                    "deadline_type": "recurring",
                    "deadline_consequences": "Sospensione pagamenti incentivi",
                    "requires_physical_signature": True
                },
                {
                    "name": "Attivazione Alert Scadenze",
                    "description": "Configurazione notifiche per scadenze ricorrenti",
                    "assignee": "Asset Manager",
                    "duration_days": 1,
                    "priority": "Media",
                    "checklist_items": [
                        "Attivazione alert dichiarazione antimafia",
                        "Attivazione alert Fuel Mix",
                        "Configurazione email/SMS notifiche",
                        "Test ricezione notifiche"
                    ],
                    "note": "Fondamentale per non perdere scadenze critiche"
                },
                {
                    "name": "Prima Fatturazione Energia",
                    "description": "Configurazione e verifica prima fatturazione energia ceduta",
                    "assignee": "Amministrazione",
                    "duration_days": 2,
                    "priority": "Media",
                    "checklist_items": [
                        "Verifica dati fatturazione",
                        "Controllo regime fiscale applicato",
                        "Verifica IBAN accredito",
                        "Monitoraggio primo pagamento"
                    ],
                    "note": "Pagamenti mensili entro il 15 del mese successivo"
                },
                {
                    "name": "Registrazione Fuel Mix Disclosure",
                    "description": "Registrazione per comunicazione annuale Fuel Mix",
                    "assignee": "Asset Manager",
                    "duration_days": 1,
                    "priority": "Bassa",
                    "checklist_items": [
                        "Registrazione servizio Fuel Mix",
                        "Memorizzazione scadenza 31 marzo",
                        "Download template comunicazione"
                    ],
                    "regulatory_deadline": "31 marzo di ogni anno",
                    "deadline_type": "recurring"
                }
            ]
        }
    ],
    "scadenze_ricorrenti": [
        {
            "name": "Dichiarazione Antimafia",
            "scadenza": "Annuale dalla data di prima presentazione",
            "conseguenze": "Sospensione erogazione incentivi",
            "condizione": "Per incentivi > 150.000€/anno"
        },
        {
            "name": "Fuel Mix Disclosure",
            "scadenza": "31 marzo di ogni anno",
            "conseguenze": "Sanzioni amministrative",
            "condizione": "Per tutti gli impianti"
        },
        {
            "name": "Aggiornamento MFA",
            "scadenza": "Obbligatorio dal 05/03/2025",
            "conseguenze": "Impossibilità accesso area clienti",
            "condizione": "Per tutti gli utenti"
        }
    ],
    "template_documenti": [
        {
            "name": "Richiesta RID",
            "tipo": "compilabile",
            "fonte": "Area clienti GSE",
            "formato": ["online"],
            "campi_richiesti": ["dati_impianto", "dati_fiscali", "modalita_pagamento"]
        },
        {
            "name": "Dichiarazione Antimafia",
            "tipo": "scaricabile",
            "fonte": "Area clienti GSE",
            "formato": ["pdf"],
            "firma_richiesta": True
        },
        {
            "name": "Dichiarazione IVA 10%",
            "tipo": "template",
            "fonte": "GSE",
            "formato": ["pdf", "docx"],
            "conditions": "Solo per aventi diritto"
        }
    ]
}

def calculate_annual_gse_revenue(power_kw: float, production_kwh: float) -> dict:
    """
    Calculate estimated annual revenue from GSE RID
    Based on 2025 average prices
    """
    # Prezzi medi 2025 (€/MWh)
    if power_kw < 1000:  # Prezzi minimi garantiti per piccoli impianti
        price_per_mwh = 95  # Media PMG 2025
    else:
        price_per_mwh = 75  # Prezzo zonale medio
    
    revenue = (production_kwh / 1000) * price_per_mwh
    
    return {
        "production_mwh": production_kwh / 1000,
        "price_per_mwh": price_per_mwh,
        "gross_revenue": revenue,
        "vat_rate": 10 if power_kw < 20 else 22,  # IVA agevolata per piccoli impianti
        "payment_schedule": "Monthly by 15th of following month"
    }

def get_ssp_transition_info() -> dict:
    """
    Info about SSP (Scambio sul Posto) transition for existing plants
    """
    return {
        "ssp_end_date": "31/12/2024",
        "transition_rules": {
            "plants_before_2024": "Can continue SSP until contract expiry",
            "plants_after_15_years": "Automatic closure and transition to RID",
            "new_plants_2025": "Only RID available"
        },
        "final_deadline": "26/09/2025 for last SSP applications",
        "settlement": "GSE will settle surpluses by 30/06/2025"
    }
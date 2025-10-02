"""
Customs Agency (ADM) Workflow for Electric Workshop License
Agenzia delle Dogane e dei Monopoli - Officina Elettrica
Required for plants > 20 kW with self-consumption
Updated for 2025 regulations
"""

from app.models.workflow import WorkflowCategoryEnum, EntityEnum

CUSTOMS_AGENCY_WORKFLOW = {
    "name": "Licenza Officina Elettrica ADM",
    "description": "Processo per ottenimento e gestione licenza officina elettrica per impianti > 20 kW",
    "category": WorkflowCategoryEnum.FISCAL,
    "plant_type": "Fotovoltaico",
    "min_power": 20,
    "max_power": None,
    "estimated_duration_days": 30,
    "recurrence": "Una tantum con adempimenti annuali",
    "required_entities": [EntityEnum.CUSTOMS.value],
    "base_documents": [
        "Dati tecnici impianto completi",
        "Schema elettrico con contatori fiscali",
        "Documento identità legale rappresentante",
        "Visura camerale (se società)"
    ],
    "note_importanti": [
        "Obbligatorio per TUTTI gli impianti > 20 kW che autoconsumano",
        "Non ci sono soglie minime di autoconsumo: anche 1% richiede licenza",
        "La dichiarazione annuale va presentata entro il 31 marzo",
        "Pagamento diritto annuale dal 1 al 16 dicembre",
        "Le sanzioni vanno da 1 a 3 volte l'imposta evasa"
    ],
    "stages": [
        {
            "name": "FASE 1 - PREPARAZIONE DENUNCIA",
            "order": 1,
            "duration_days": 5,
            "tasks": [
                {
                    "name": "Verifica Obbligo Officina Elettrica",
                    "description": "Verifica necessità licenza officina elettrica",
                    "assignee": "Consulente Fiscale",
                    "duration_days": 1,
                    "priority": "Alta",
                    "checklist_items": [
                        "Verifica potenza impianto > 20 kW",
                        "Verifica presenza autoconsumo",
                        "Calcolo stima autoconsumo annuo",
                        "Conferma obbligo denuncia"
                    ],
                    "note": "Obbligo sussiste anche per autoconsumo minimo (es. servizi ausiliari)",
                    "official_form_fields": {
                        "potenza_installata_kw": "Potenza nominale impianto",
                        "modalita_utilizzo": "Cessione totale/Autoconsumo parziale",
                        "stima_autoconsumo_kwh": "Stima autoconsumo annuo"
                    }
                },
                {
                    "name": "Individuazione Ufficio ADM Competente",
                    "description": "Identificazione ufficio territoriale competente",
                    "assignee": "Asset Manager",
                    "duration_days": 1,
                    "priority": "Alta",
                    "portal_url": "https://www.adm.gov.it/portale/dogane/operatore/gli-uffici-delle-dogane",
                    "checklist_items": [
                        "Ricerca ufficio per provincia impianto",
                        "Verifica indirizzo e contatti",
                        "Identificazione referente energie",
                        "Raccolta PEC ufficio"
                    ],
                    "documents_to_generate": ["Elenco contatti ufficio ADM"]
                },
                {
                    "name": "Preparazione Schema Contatori Fiscali",
                    "description": "Preparazione documentazione tecnica contatori UTF",
                    "assignee": "Tecnico",
                    "duration_days": 2,
                    "priority": "Alta",
                    "required_documents": [
                        "Schema unifilare con posizione contatori",
                        "Schede tecniche contatori UTF",
                        "Certificati taratura contatori"
                    ],
                    "official_form_fields": {
                        "contatore_produzione": {
                            "marca": "Marca contatore",
                            "modello": "Modello",
                            "matricola": "Numero matricola",
                            "mf_code": "Codice MF (se presente)",
                            "costante": "Costante di lettura",
                            "classe": "Classe di precisione"
                        },
                        "contatore_immissione": {
                            "marca": "Marca contatore scambio",
                            "matricola": "Matricola",
                            "tipo": "Bidirezionale/Monodirezionale"
                        }
                    },
                    "note": "I contatori devono essere UTF (Unità di Telelettura Fiscale) compatibili"
                },
                {
                    "name": "Raccolta Documentazione Societaria",
                    "description": "Raccolta documenti per soggetti giuridici",
                    "assignee": "Amministrazione",
                    "duration_days": 1,
                    "priority": "Media",
                    "conditions": {
                        "if": "tipo_soggetto == 'societa'",
                        "then": "obbligatorio = true"
                    },
                    "required_documents": [
                        "Visura camerale aggiornata",
                        "Atto costitutivo e statuto",
                        "Verbale nomina rappresentante legale",
                        "Documenti identità amministratori"
                    ]
                }
            ]
        },
        {
            "name": "FASE 2 - PRESENTAZIONE DENUNCIA",
            "order": 2,
            "duration_days": 10,
            "tasks": [
                {
                    "name": "Compilazione Denuncia Officina Elettrica",
                    "description": "Compilazione modulo denuncia esercizio officina elettrica",
                    "assignee": "Consulente Fiscale",
                    "duration_days": 2,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.CUSTOMS.value,
                    "required_documents": [
                        "Modello denuncia officina elettrica",
                        "Planimetria con schema impianto",
                        "Relazione tecnica impianto"
                    ],
                    "official_form_fields": {
                        "dati_denunciante": {
                            "denominazione": "Ragione sociale/Nome",
                            "cf_piva": "Codice fiscale/P.IVA",
                            "indirizzo_sede": "Sede legale",
                            "pec": "PEC per comunicazioni"
                        },
                        "dati_impianto": {
                            "ubicazione": "Indirizzo impianto",
                            "foglio_particella": "Dati catastali",
                            "tipo_fonte": "Solare fotovoltaico",
                            "potenza_installata_kw": "Potenza nominale",
                            "data_entrata_esercizio": "Data connessione",
                            "pod": "Codice POD"
                        },
                        "dati_produzione": {
                            "produzione_annua_stimata": "kWh/anno stimati",
                            "autoconsumo_stimato": "kWh autoconsumo",
                            "cessione_rete_stimata": "kWh ceduti"
                        }
                    },
                    "documents_to_generate": ["Denuncia protocollata"]
                },
                {
                    "name": "Invio Denuncia a ADM",
                    "description": "Trasmissione denuncia all'ufficio ADM competente",
                    "assignee": "Asset Manager",
                    "duration_days": 1,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.CUSTOMS.value,
                    "submission_method": "PEC",
                    "checklist_items": [
                        "Preparazione PEC con allegati",
                        "Invio a ufficio territoriale",
                        "Verifica ricevuta consegna PEC",
                        "Protocollazione pratica"
                    ],
                    "documents_to_generate": ["Ricevuta PEC protocollata"]
                },
                {
                    "name": "Sopralluogo Verifica ADM",
                    "description": "Gestione eventuale sopralluogo verifica da ADM",
                    "assignee": "Responsabile Impianto",
                    "duration_days": 5,
                    "priority": "Alta",
                    "conditions": {
                        "if": "richiesto_da_ADM",
                        "then": "obbligatorio = true"
                    },
                    "checklist_items": [
                        "Ricezione comunicazione sopralluogo",
                        "Preparazione documentazione",
                        "Presenza durante sopralluogo",
                        "Firma verbale sopralluogo"
                    ],
                    "requires_site_inspection": True,
                    "human_checkpoint_notes": "Richiede presenza fisica del responsabile impianto"
                },
                {
                    "name": "Rilascio Licenza Officina Elettrica",
                    "description": "Ricezione licenza di esercizio da ADM",
                    "assignee": "Sistema",
                    "duration_days": 2,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.CUSTOMS.value,
                    "checklist_items": [
                        "Attesa elaborazione pratica",
                        "Ricezione licenza via PEC",
                        "Verifica numero licenza",
                        "Archiviazione licenza"
                    ],
                    "external_protocol_number": "Numero Licenza UTF",
                    "documents_to_generate": [
                        "Licenza esercizio officina elettrica",
                        "Codice ditta assegnato"
                    ]
                }
            ]
        },
        {
            "name": "FASE 3 - CONFIGURAZIONE TELEMATICA",
            "order": 3,
            "duration_days": 10,
            "tasks": [
                {
                    "name": "Registrazione Servizio Telematico Doganale",
                    "description": "Registrazione al STD per invii telematici",
                    "assignee": "Asset Manager",
                    "duration_days": 2,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.CUSTOMS.value,
                    "portal_url": "https://www.adm.gov.it/portale/dogane/operatore/servizio-telematico-doganale-e-assistenza-online",
                    "required_credentials": "CNS o SPID Livello 2",
                    "checklist_items": [
                        "Richiesta credenziali STD",
                        "Installazione software/certificati",
                        "Test connessione",
                        "Abilitazione servizi energia"
                    ],
                    "requires_human_auth": True,
                    "note": "Necessario per dichiarazioni annuali telematiche"
                },
                {
                    "name": "Accesso Portale PUDM",
                    "description": "Configurazione accesso Portale Unico Dogane",
                    "assignee": "Asset Manager",
                    "duration_days": 1,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.CUSTOMS.value,
                    "portal_url": "https://pudm.adm.gov.it/",
                    "portal_login_url": "https://pudm.adm.gov.it/pudm/login",
                    "required_credentials": "SPID L2/CNS/CIE",
                    "checklist_items": [
                        "Primo accesso con SPID/CNS",
                        "Associazione codice ditta",
                        "Verifica servizi disponibili",
                        "Test dichiarazione prova"
                    ],
                    "official_form_fields": {
                        "codice_ditta": "Codice assegnato con licenza",
                        "deleghe": "Eventuale delega consulente"
                    }
                },
                {
                    "name": "Configurazione Modalità Dichiarazione",
                    "description": "Scelta modalità invio dichiarazioni (U2S o S2S)",
                    "assignee": "Consulente Fiscale",
                    "duration_days": 1,
                    "priority": "Media",
                    "checklist_items": [
                        "Valutazione modalità U2S (web)",
                        "Valutazione modalità S2S (software)",
                        "Scelta modalità ottimale",
                        "Configurazione scelta"
                    ],
                    "note": "U2S più semplice per singolo impianto, S2S per portafogli"
                },
                {
                    "name": "Memorizzazione Scadenze Ricorrenti",
                    "description": "Impostazione reminder per adempimenti annuali",
                    "assignee": "Asset Manager",
                    "duration_days": 1,
                    "priority": "Alta",
                    "checklist_items": [
                        "Alert dichiarazione consumo (31/03)",
                        "Alert pagamento diritto (01-16/12)",
                        "Alert taratura contatori (3 anni)",
                        "Configurazione notifiche"
                    ],
                    "regulatory_deadline": "Multiple scadenze annuali",
                    "deadline_type": "recurring"
                }
            ]
        },
        {
            "name": "FASE 4 - ADEMPIMENTI RICORRENTI",
            "order": 4,
            "duration_days": 5,
            "tasks": [
                {
                    "name": "Prima Dichiarazione Consumo Test",
                    "description": "Preparazione prima dichiarazione consumo di prova",
                    "assignee": "Consulente Fiscale",
                    "duration_days": 2,
                    "priority": "Media",
                    "portal_url": "https://pudm.adm.gov.it/",
                    "checklist_items": [
                        "Raccolta letture contatori",
                        "Calcolo produzione/autoconsumo",
                        "Compilazione dichiarazione test",
                        "Verifica calcoli accisa"
                    ],
                    "official_form_fields": {
                        "periodo": "Anno solare di riferimento",
                        "produzione": {
                            "totale_kwh": "Produzione totale annua",
                            "autoconsumo_kwh": "Energia autoconsumata",
                            "ceduta_kwh": "Energia ceduta in rete"
                        },
                        "letture": {
                            "iniziale": "Lettura contatore 01/01",
                            "finale": "Lettura contatore 31/12"
                        }
                    }
                },
                {
                    "name": "Preparazione Pagamento F24",
                    "description": "Preparazione primo F24 diritto annuale",
                    "assignee": "Amministrazione",
                    "duration_days": 1,
                    "priority": "Media",
                    "checklist_items": [
                        "Verifica importo dovuto",
                        "Compilazione F24 con codice 2813",
                        "Memorizzazione scadenza dicembre",
                        "Preparazione delega bancaria"
                    ],
                    "cost_amount": 23.24,  # Per impianti fino a 100 kW
                    "payment_method": "F24",
                    "payment_reference": "Codice tributo 2813",
                    "documents_to_generate": ["Modello F24 precompilato"]
                },
                {
                    "name": "Archiviazione Documentazione",
                    "description": "Organizzazione archivio officina elettrica",
                    "assignee": "Asset Manager",
                    "duration_days": 1,
                    "priority": "Bassa",
                    "checklist_items": [
                        "Creazione fascicolo officina",
                        "Archiviazione licenza",
                        "Registro letture mensili",
                        "Scadenzario adempimenti"
                    ],
                    "documents_to_generate": [
                        "Registro officina elettrica",
                        "Scadenzario annuale"
                    ]
                }
            ]
        }
    ],
    "costi_diritti_annuali": {
        "fino_100_kw": {"importo": 23.24, "description": "Impianti fino a 100 kW"},
        "da_100_a_500_kw": {"importo": 58.10, "description": "Impianti da 100 a 500 kW"},
        "da_500_a_1000_kw": {"importo": 116.20, "description": "Impianti da 500 a 1000 kW"},
        "oltre_1000_kw": {"importo": 232.41, "description": "Impianti oltre 1000 kW"}
    },
    "sanzioni": {
        "mancata_denuncia": "Sanzione penale + recupero accisa evasa",
        "dichiarazione_tardiva": "Da 1 a 3 volte l'imposta dovuta",
        "pagamento_tardivo": "Sanzione 30% + interessi",
        "dichiarazione_infedele": "Da 1 a 3 volte la differenza di imposta"
    },
    "template_documenti": [
        {
            "name": "Denuncia Officina Elettrica",
            "tipo": "scaricabile",
            "fonte": "Sito ADM",
            "formato": ["pdf"],
            "compilazione": "Manuale"
        },
        {
            "name": "Dichiarazione Consumo Annuale",
            "tipo": "online",
            "fonte": "PUDM",
            "formato": ["web", "xml"],
            "modalita": ["U2S", "S2S"]
        },
        {
            "name": "Modello F24",
            "tipo": "generabile",
            "fonte": "Sistema",
            "formato": ["pdf"],
            "codice_tributo": "2813"
        }
    ]
}

def calculate_accisa_exemption(production_kwh: float, autoconsumo_kwh: float) -> dict:
    """
    Calculate excise duty exemption for self-consumed renewable energy
    """
    # L'energia da fonti rinnovabili autoconsumata è esente da accisa
    return {
        "produzione_totale_kwh": production_kwh,
        "autoconsumo_esente_kwh": autoconsumo_kwh,
        "base_imponibile_kwh": 0,  # Tutto esente per rinnovabili
        "accisa_dovuta_euro": 0,
        "note": "Energia da fonti rinnovabili autoconsumata esente da accisa"
    }

def get_declaration_format(year: int) -> dict:
    """
    Get the declaration format requirements for a specific year
    """
    if year >= 2025:
        return {
            "formato": "Telematico obbligatorio",
            "modalita": ["U2S via PUDM", "S2S via software"],
            "scadenza": "31 marzo anno successivo",
            "autenticazione": "SPID L2/CNS/CIE"
        }
    else:
        return {
            "formato": "Transizione al telematico",
            "modalita": ["Cartaceo ancora accettato", "Telematico preferito"],
            "scadenza": "31 marzo anno successivo"
        }
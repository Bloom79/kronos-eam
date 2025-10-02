"""
GAUDÌ Registration Workflow for Terna
Gestione Anagrafica Unica Degli Impianti
Required for all electricity production plants in Italy
"""

from app.models.workflow import WorkflowCategoryEnum, EntityEnum

GAUDI_REGISTRATION_WORKFLOW = {
    "name": "Registrazione GAUDÌ Terna",
    "description": "Processo di registrazione dell'impianto nel sistema GAUDÌ di Terna per il censimento nazionale",
    "category": WorkflowCategoryEnum.ACTIVATION,
    "plant_type": "Fotovoltaico",
    "min_power": 0,
    "max_power": None,
    "estimated_duration_days": 10,
    "recurrence": "Una tantum",
    "required_entities": [EntityEnum.TERNA.value],
    "base_documents": [
        "Codice POD da DSO",
        "Dati tecnici impianto completi",
        "Schede tecniche componenti",
        "Schema unifilare definitivo"
    ],
    "note_importanti": [
        "La registrazione GAUDÌ è obbligatoria per tutti gli impianti di produzione",
        "Senza registrazione GAUDÌ non è possibile procedere con l'attivazione GSE",
        "Il CENSIMP code ottenuto è necessario per tutte le pratiche successive"
    ],
    "stages": [
        {
            "name": "FASE 1 - PREPARAZIONE REGISTRAZIONE",
            "order": 1,
            "duration_days": 3,
            "tasks": [
                {
                    "name": "Verifica Prerequisiti GAUDÌ",
                    "description": "Verifica completamento connessione DSO e disponibilità codice POD",
                    "assignee": "Asset Manager",
                    "duration_days": 1,
                    "priority": "Alta",
                    "checklist_items": [
                        "Verifica disponibilità POD da DSO",
                        "Controllo completezza dati tecnici impianto",
                        "Verifica potenza impianto per tipo accesso"
                    ],
                    "required_documents": [
                        "Comunicazione POD da DSO",
                        "TICA accettato con codice pratica"
                    ],
                    "note": "Il POD è prerequisito essenziale per la registrazione"
                },
                {
                    "name": "Richiesta Certificato Digitale (solo >10MW)",
                    "description": "Richiesta certificato digitale a Terna per impianti superiori a 10MW",
                    "assignee": "Produttore",
                    "duration_days": 2,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.TERNA.value,
                    "conditions": {
                        "if": "potenza > 10000",
                        "then": "obbligatorio = true"
                    },
                    "portal_url": "https://www.terna.it/it/sistema-elettrico/gaudi",
                    "required_documents": [
                        "Modulo richiesta certificato digitale",
                        "Documento identità produttore",
                        "Visura camerale aggiornata"
                    ],
                    "checklist_items": [
                        "Compilazione modulo richiesta",
                        "Invio documentazione a Terna",
                        "Ricezione certificato digitale"
                    ],
                    "submission_method": "Email certificata a Terna",
                    "note": "Solo il produttore può richiedere il certificato"
                },
                {
                    "name": "Raccolta Dati Tecnici Componenti",
                    "description": "Raccolta completa dei dati tecnici di tutti i componenti",
                    "assignee": "Installatore",
                    "duration_days": 1,
                    "priority": "Alta",
                    "required_documents": [
                        "Schede tecniche moduli fotovoltaici",
                        "Schede tecniche inverter",
                        "Certificazioni CEI componenti",
                        "Numeri seriali tutti i componenti"
                    ],
                    "official_form_fields": {
                        "moduli": {
                            "marca": "Marca moduli FV",
                            "modello": "Modello moduli FV",
                            "potenza_modulo_wp": "Potenza singolo modulo (Wp)",
                            "quantita": "Numero totale moduli",
                            "tecnologia": "Tecnologia (mono/poli/film sottile)"
                        },
                        "inverter": {
                            "marca": "Marca inverter",
                            "modello": "Modello inverter",
                            "potenza_nominale_kw": "Potenza nominale AC (kW)",
                            "quantita": "Numero inverter",
                            "seriali": "Numeri di serie"
                        }
                    }
                }
            ]
        },
        {
            "name": "FASE 2 - REGISTRAZIONE IMPIANTO",
            "order": 2,
            "duration_days": 5,
            "tasks": [
                {
                    "name": "Creazione Account GAUDÌ (<10MW)",
                    "description": "Creazione nuovo account sul portale GAUDÌ per impianti fino a 10MW",
                    "assignee": "Asset Manager",
                    "duration_days": 1,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.TERNA.value,
                    "conditions": {
                        "if": "potenza <= 10000",
                        "then": "obbligatorio = true"
                    },
                    "portal_url": "https://mercato.terna.it/gaudi/",
                    "portal_login_url": "https://mercato.terna.it/gaudi/login",
                    "required_credentials": "Email registration",
                    "checklist_items": [
                        "Accesso portale GAUDÌ",
                        "Creazione nuovo account",
                        "Verifica email",
                        "Ricezione UserId e password automatici"
                    ],
                    "official_form_fields": {
                        "email": "Email valida per registrazione",
                        "dati_utente": "Dati anagrafici utente"
                    },
                    "note": "Verificare correttezza email: credenziali inviate automaticamente"
                },
                {
                    "name": "Accesso GAUDÌ con Certificato (>10MW)",
                    "description": "Accesso al portale GAUDÌ con certificato digitale",
                    "assignee": "Produttore",
                    "duration_days": 1,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.TERNA.value,
                    "conditions": {
                        "if": "potenza > 10000",
                        "then": "obbligatorio = true"
                    },
                    "portal_url": "https://mercato.terna.it/gaudi/",
                    "required_credentials": "Certificato Digitale Terna",
                    "checklist_items": [
                        "Installazione certificato digitale",
                        "Accesso con certificato",
                        "Verifica permessi produttore"
                    ],
                    "requires_human_auth": True,
                    "human_checkpoint_notes": "Richiede certificato digitale su smart card o token USB"
                },
                {
                    "name": "Inserimento Anagrafica Impianto",
                    "description": "Inserimento completo dei dati anagrafici dell'impianto",
                    "assignee": "Asset Manager",
                    "duration_days": 2,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.TERNA.value,
                    "portal_url": "https://mercato.terna.it/gaudi/",
                    "required_documents": [
                        "POD assegnato da DSO",
                        "Coordinate geografiche WGS84",
                        "Dati catastali impianto"
                    ],
                    "official_form_fields": {
                        "anagrafica": {
                            "denominazione_impianto": "Nome impianto",
                            "pod": "Codice POD",
                            "indirizzo": "Indirizzo completo",
                            "comune": "Comune",
                            "provincia": "Provincia",
                            "cap": "CAP",
                            "latitudine": "Latitudine WGS84",
                            "longitudine": "Longitudine WGS84",
                            "foglio_catastale": "Foglio",
                            "particella": "Particella",
                            "subalterno": "Subalterno (se presente)"
                        },
                        "dati_produttore": {
                            "ragione_sociale": "Denominazione produttore",
                            "cf_piva": "CF/P.IVA",
                            "indirizzo_sede": "Indirizzo sede legale",
                            "rappresentante_legale": "Nome rappresentante legale"
                        }
                    },
                    "submission_method": "Compilazione diretta su portale"
                },
                {
                    "name": "Inserimento Dati Tecnici Dettagliati",
                    "description": "Inserimento di tutti i dati tecnici dell'impianto nel sistema GAUDÌ",
                    "assignee": "Tecnico",
                    "duration_days": 2,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.TERNA.value,
                    "checklist_items": [
                        "Inserimento dati moduli FV",
                        "Inserimento dati inverter",
                        "Inserimento potenze nominali",
                        "Inserimento dati connessione"
                    ],
                    "official_form_fields": {
                        "sezione_generazione": {
                            "tipo_fonte": "Solare fotovoltaico",
                            "sottotipo": "Su edificio/A terra",
                            "potenza_cc_kwp": "Potenza lato CC (kWp)",
                            "n_moduli": "Numero totale moduli",
                            "superficie_totale_mq": "Superficie totale moduli (mq)"
                        },
                        "sezione_conversione": {
                            "potenza_ca_kw": "Potenza nominale lato CA (kW)",
                            "n_inverter": "Numero inverter",
                            "marca_inverter": "Marca inverter",
                            "modello_inverter": "Modello inverter"
                        },
                        "sezione_connessione": {
                            "livello_tensione": "BT/MT/AT",
                            "tensione_nominale_kv": "Tensione nominale (kV)",
                            "potenza_immissione_kw": "Potenza in immissione (kW)",
                            "potenza_prelievo_kw": "Potenza in prelievo (kW)"
                        }
                    },
                    "documents_to_generate": ["Riepilogo dati tecnici inseriti"]
                }
            ]
        },
        {
            "name": "FASE 3 - VALIDAZIONE E ATTIVAZIONE",
            "order": 3,
            "duration_days": 2,
            "tasks": [
                {
                    "name": "Validazione Dati e Generazione CENSIMP",
                    "description": "Validazione dei dati inseriti e generazione codice CENSIMP",
                    "assignee": "Sistema",
                    "duration_days": 1,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.TERNA.value,
                    "checklist_items": [
                        "Controllo completezza dati",
                        "Validazione coerenza tecnica",
                        "Generazione codice CENSIMP",
                        "Conferma registrazione"
                    ],
                    "external_protocol_number": "Codice CENSIMP",
                    "documents_to_generate": [
                        "Certificato registrazione GAUDÌ",
                        "Riepilogo dati impianto con CENSIMP"
                    ],
                    "note": "Il CENSIMP è il codice univoco nazionale dell'impianto"
                },
                {
                    "name": "Comunicazione Automatica a GSE",
                    "description": "Trasmissione automatica dei dati a GSE tramite web service",
                    "assignee": "Sistema",
                    "duration_days": 1,
                    "priority": "Media",
                    "responsible_entity": EntityEnum.TERNA.value,
                    "integrazione": EntityEnum.GSE.value,
                    "checklist_items": [
                        "Invio automatico dati a GSE",
                        "Conferma ricezione GSE",
                        "Sincronizzazione codici"
                    ],
                    "note": "Integrazione automatica GAUDÌ-GSE per velocizzare le pratiche"
                },
                {
                    "name": "Download Documentazione GAUDÌ",
                    "description": "Download di tutta la documentazione di registrazione",
                    "assignee": "Asset Manager",
                    "duration_days": 1,
                    "priority": "Media",
                    "required_documents": [],
                    "checklist_items": [
                        "Download certificato GAUDÌ",
                        "Download scheda tecnica impianto",
                        "Archiviazione documentazione"
                    ],
                    "documents_to_generate": [
                        "Certificato GAUDÌ con CENSIMP",
                        "Scheda tecnica completa impianto",
                        "Report dati per GSE"
                    ]
                }
            ]
        }
    ],
    "flussi_dati": {
        "DSO_to_GAUDI": {
            "description": "Il POD ricevuto dal DSO è necessario per la registrazione",
            "dati": ["POD", "Codice pratica connessione"]
        },
        "GAUDI_to_GSE": {
            "description": "GAUDÌ trasmette automaticamente i dati a GSE",
            "dati": ["CENSIMP", "Dati tecnici impianto", "Anagrafica produttore"]
        }
    },
    "template_documenti": [
        {
            "name": "Richiesta Certificato Digitale",
            "tipo": "scaricabile",
            "fonte": "Sito Terna",
            "formato": ["pdf"],
            "quando": "Solo per impianti > 10MW"
        },
        {
            "name": "Scheda Tecnica GAUDÌ",
            "tipo": "generato",
            "fonte": "Portale GAUDÌ",
            "formato": ["pdf"],
            "contenuto": "Tutti i dati tecnici registrati"
        }
    ]
}

# Helper function for CENSIMP validation
def validate_censimp(censimp: str) -> bool:
    """Validate CENSIMP code format"""
    # CENSIMP format: alphanumeric code assigned by Terna
    import re
    pattern = r'^[A-Z0-9]{6,15}$'
    return bool(re.match(pattern, censimp))

# Access requirements based on plant power
def get_gaudi_access_method(power_kw: float) -> dict:
    """Determine GAUDÌ access method based on plant power"""
    if power_kw <= 10000:  # <= 10 MW
        return {
            "method": "Self-registration",
            "credentials": "Email verification",
            "who_can_register": "Anyone with authorization",
            "documents_needed": ["Email address", "Basic user data"]
        }
    else:  # > 10 MW
        return {
            "method": "Digital Certificate",
            "credentials": "Terna Digital Certificate",
            "who_can_register": "Only the producer",
            "documents_needed": [
                "Certificate request form",
                "Producer ID document",
                "Chamber of commerce registration"
            ]
        }
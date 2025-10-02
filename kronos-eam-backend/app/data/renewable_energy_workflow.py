"""
Renewable Energy Plant Activation Workflow Templates
Based on Italian regulatory requirements for DSO, Terna, GSE, and Agenzia delle Dogane
"""

from app.models.workflow import WorkflowCategoryEnum, EntityEnum
from app.data.connection_request_workflow import CONNECTION_REQUEST_WORKFLOW
from app.data.solar_installation_complete import SOLAR_INSTALLATION_COMPLETE

RENEWABLE_ENERGY_WORKFLOW = {
    "name": "Attivazione Plant Rinnovabile Completa",
    "description": "Processo completo per l'attivazione di un impianto a fonti rinnovabili alla rete elettrica italiana",
    "category": WorkflowCategoryEnum.ACTIVATION,
    "plant_type": "Tutti",
    "min_power": 0,
    "max_power": None,
    "estimated_duration_days": 180,
    "recurrence": "Una tantum",
    "required_entities": [
        EntityEnum.MUNICIPALITY.value,
        EntityEnum.DSO.value,
        EntityEnum.TERNA.value,
        EntityEnum.GSE.value,
        EntityEnum.CUSTOMS.value
    ],
    "base_documents": [
        "Documento identità titolare",
        "Visura camerale",
        "Titolo disponibilità sito",
        "Progetto definitivo impianto"
    ],
    "stages": [
        {
            "name": "Fase 1: Progettazione e Autorizzazione",
            "order": 1,
            "duration_days": 45,
            "tasks": [
                {
                    "name": "Progettazione Plant e Autorizzazioni",
                    "description": "Sviluppo del progetto esecutivo e ottenimento autorizzazioni comunali/regionali",
                    "assignee": "Progettista",
                    "duration_days": 15,
                    "priority": "Alta",
                    "required_documents": [
                        "Progetto esecutivo firmato da tecnico abilitato",
                        "Relazione tecnica impianto",
                        "Schema unifilare preliminare",
                        "Studio di fattibilità economica"
                    ],
                    "documents_to_generate": [
                        "Relazione tecnica di progetto",
                        "Computo metrico estimativo",
                        "Cronoprogramma lavori"
                    ],
                    "official_form_fields": {
                        "progettista_nome": "Nome e cognome progettista",
                        "progettista_albo": "Iscrizione albo professionale",
                        "potenza_impianto": "Potenza nominale (kWp)",
                        "superficie_occupata": "Superficie totale (mq)"
                    },
                    "checklist_items": [
                        "Valutazione fattibilità tecnica",
                        "Valutazione fattibilità economica",
                        "Approvazione progetto"
                    ]
                },
                {
                    "name": "Richiesta Titolo Autorizzativo (SCIA/AU)",
                    "description": "Ottenimento titolo abilitativo per costruzione impianto",
                    "assignee": "Asset Manager",
                    "duration_days": 30,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.MUNICIPALITY.value,
                    "practice_type": "SCIA/Permesso Costruire",
                    "portal_url": "Portale SUAP comunale",
                    "portal_login_url": "https://suap.comune.it",
                    "required_credentials": "SPID/CIE",
                    "required_documents": [
                        "Progetto architettonico firmato",
                        "Relazione tecnica ex L.10/91",
                        "Elaborati grafici quotati"
                    ],
                    "documents_to_generate": [
                        "Ricevuta protocollazione SCIA",
                        "Numero pratica edilizia"
                    ],
                    "regulatory_deadline": "30 giorni per SCIA, 90 per PC",
                    "deadline_type": "ordinario",
                    "submission_method": "Portale SUAP",
                    "checklist_items": [
                        "Accesso portale SUAP",
                        "Compilazione moduli online",
                        "Upload allegati tecnici",
                        "Protocollazione pratica"
                    ],
                    "conditions": {
                        "if": "potenza > 1000 kW",
                        "then": "Autorizzazione Unica Regionale obbligatoria"
                    },
                    "requires_human_auth": True
                },
                {
                    "name": "Autorizzazione Paesaggistica",
                    "description": "Ottenimento nulla osta per aree vincolate",
                    "assignee": "Asset Manager",
                    "duration_days": 30,
                    "priority": "Media",
                    "responsible_entity": EntityEnum.SUPERINTENDENCE.value,
                    "practice_type": "Autorizzazione Paesaggistica",
                    "portal_url": "Sistema informativo vincoli",
                    "required_documents": [
                        "Relazione paesaggistica DPCM 12/2005",
                        "Fotoinserimenti e render",
                        "Tavole stato di fatto e progetto"
                    ],
                    "documents_to_generate": [
                        "Parere Soprintendenza",
                        "Autorizzazione paesaggistica"
                    ],
                    "regulatory_deadline": "105 giorni procedimento",
                    "deadline_consequences": "Diniego per silenzio-rifiuto",
                    "conditions": {
                        "if": "area con vincolo paesaggistico",
                        "then": "autorizzazione obbligatoria"
                    },
                    "requires_physical_signature": True
                }
            ]
        },
        {
            "name": "Fase 2: Connessione alla Rete DSO",
            "order": 2,
            "duration_days": 60,
            "tasks": [
                {
                    "name": "Richiesta di Connessione DSO",
                    "description": "Presentazione domanda connessione a E-Distribuzione o altro DSO",
                    "assignee": "Asset Manager",
                    "duration_days": 5,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.DSO.value,
                    "integrazione": EntityEnum.DSO.value,
                    "practice_type": "Domanda Connessione",
                    "portal_url": "https://www.e-distribuzione.it/a-chi-ci-rivolgiamo/produttori.html",
                    "portal_login_url": "https://areaclienti.e-distribuzione.it",
                    "required_credentials": "Registrazione email",
                    "required_documents": [
                        "Schema unifilare firmato",
                        "Documento identità valido",
                        "Mappa catastale (max 6 mesi)",
                        "Ultima bolletta elettrica"
                    ],
                    "documents_to_generate": [
                        "Codice pratica connessione",
                        "Ricevuta protocollazione"
                    ],
                    "cost_amount": 36.60,
                    "cost_description": "Corrispettivo preventivo fino 6kW (30€+IVA)",
                    "payment_method": "Bonifico bancario",
                    "checklist_items": [
                        "Registrazione portale produttori",
                        "Inserimento anagrafica",
                        "Upload documentazione tecnica",
                        "Pagamento corrispettivo"
                    ],
                    "conditions": {
                        "if": "potenza <= 200 kW",
                        "then": "Modello Unico disponibile"
                    }
                },
                {
                    "name": "Ricezione e Analisi TICA",
                    "description": "Attesa e valutazione preventivo TICA dal DSO",
                    "assignee": "Tecnico",
                    "duration_days": 45,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.DSO.value,
                    "practice_type": "TICA - Testo Integrato Connessioni Attive",
                    "required_documents": [],
                    "documents_to_generate": [
                        "TICA con codice univoco",
                        "Soluzione tecnica connessione",
                        "Preventivo economico dettagliato"
                    ],
                    "external_protocol_number": "Codice TICA",
                    "regulatory_deadline": "20-30 giorni lavorativi per emissione",
                    "checklist_items": [
                        "Monitor portale per TICA",
                        "Download preventivo TICA",
                        "Analisi costi connessione",
                        "Valutazione soluzione tecnica"
                    ],
                    "scadenza": {
                        "giorni": 45,
                        "tipo": "perentoria",
                        "nota": "Preventivo decade automaticamente"
                    }
                },
                {
                    "name": "Accettazione TICA e Pagamento",
                    "description": "Accettazione formale preventivo TICA e pagamento opere",
                    "assignee": "Amministrazione",
                    "duration_days": 5,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.DSO.value,
                    "regulatory_deadline": "45 giorni lavorativi",
                    "deadline_type": "peremptory",
                    "deadline_consequences": "Decadenza automatica preventivo - restart procedura",
                    "required_documents": [
                        "Modulo accettazione TICA firmato",
                        "Ricevuta bonifico corrispettivi"
                    ],
                    "documents_to_generate": [
                        "Accettazione TICA protocollata"
                    ],
                    "payment_method": "Bonifico con causale TICA",
                    "submission_method": "Portale o PEC",
                    "requires_physical_signature": True,
                    "checklist_items": [
                        "Firma modulo accettazione",
                        "Esecuzione bonifico",
                        "Upload ricevuta pagamento",
                        "Conferma ricezione DSO"
                    ]
                },
                {
                    "name": "Fine Lavori e Modello Unico Parte II",
                    "description": "Comunicazione fine lavori con documentazione as-built",
                    "assignee": "Tecnico",
                    "duration_days": 10,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.DSO.value,
                    "portal_url": "Portale E-Distribuzione",
                    "required_documents": [
                        "Regolamento di Esercizio firmato",
                        "Dichiarazione conformità DM 37/08",
                        "Test report SPI con cassetta prova",
                        "Certificazioni inverter CEI 0-21"
                    ],
                    "documents_to_generate": [
                        "Modello Unico Parte II compilato",
                        "Comunicazione fine lavori protocollata"
                    ],
                    "official_form_fields": {
                        "dati_as_built": "Dati tecnici reali installati",
                        "seriali_componenti": "Numeri serie moduli e inverter",
                        "test_spi": "Risultati verifica protezioni"
                    },
                    "checklist_items": [
                        "Verifica documentazione completa",
                        "Compilazione Modello Unico II",
                        "Upload portale DSO",
                        "Conferma ricezione"
                    ]
                },
                {
                    "name": "Attivazione Connessione e POD",
                    "description": "Allaccio fisico impianto e attivazione contatori UTF",
                    "assignee": "DSO",
                    "duration_days": 10,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.DSO.value,
                    "external_protocol_number": "Codice POD",
                    "documents_to_generate": [
                        "Verbale attivazione",
                        "Comunicazione POD assegnato",
                        "Configurazione contatori UTF"
                    ],
                    "requires_site_inspection": True,
                    "human_checkpoint_notes": "Presenza obbligatoria responsabile impianto",
                    "checklist_items": [
                        "Programmazione sopralluogo DSO",
                        "Verifica impianto e protezioni",
                        "Installazione/configurazione contatori",
                        "Rilascio POD definitivo"
                    ]
                }
            ]
        },
        {
            "name": "Fase 3: Registrazione GAUDÌ (Terna)",
            "order": 3,
            "duration_days": 20,
            "tasks": [
                {
                    "name": "Registrazione Portale GAUDÌ",
                    "description": "Registrazione impianto nel sistema GAUDÌ di Terna",
                    "assignee": "Asset Manager",
                    "duration_days": 2,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.TERNA.value,
                    "integrazione": EntityEnum.TERNA.value,
                    "practice_type": "Censimento GAUDÌ",
                    "portal_url": "https://mercato.terna.it/gaudi/",
                    "portal_login_url": "https://mercato.terna.it/gaudi/login",
                    "required_credentials": "Email (< 10MW) o Certificato Digitale (> 10MW)",
                    "required_documents": [
                        "POD assegnato da DSO",
                        "Dati tecnici completi impianto",
                        "Certificato digitale Terna (se > 10MW)"
                    ],
                    "documents_to_generate": [
                        "Credenziali accesso GAUDÌ",
                        "Codice impianto temporaneo"
                    ],
                    "requires_human_auth": True,
                    "checklist_items": [
                        "Creazione account GAUDÌ",
                        "Verifica email automatica",
                        "Ricezione UserId e password",
                        "Primo accesso portale"
                    ]
                },
                {
                    "name": "Inserimento Dati Tecnici GAUDÌ",
                    "description": "Compilazione completa anagrafica tecnica impianto",
                    "assignee": "Asset Manager",
                    "duration_days": 3,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.TERNA.value,
                    "integrazione": EntityEnum.TERNA.value,
                    "practice_type": "Censimento Impianto",
                    "required_documents": [
                        "POD definitivo da DSO",
                        "Codice pratica connessione",
                        "Schede tecniche moduli e inverter"
                    ],
                    "official_form_fields": {
                        "dati_impianto": {
                            "pod": "Codice POD",
                            "potenza_cc_kwp": "Potenza lato DC",
                            "potenza_ca_kw": "Potenza lato AC",
                            "marca_moduli": "Produttore moduli FV",
                            "modello_moduli": "Modello moduli",
                            "numero_moduli": "Quantità moduli",
                            "marca_inverter": "Produttore inverter",
                            "modello_inverter": "Modello inverter"
                        }
                    },
                    "external_protocol_number": "CENSIMP",
                    "documents_to_generate": [
                        "Codice CENSIMP univoco",
                        "Scheda tecnica GAUDÌ"
                    ],
                    "checklist_items": [
                        "Inserimento anagrafica produttore",
                        "Inserimento dati tecnici dettagliati",
                        "Validazione e generazione CENSIMP",
                        "Download scheda impianto"
                    ],
                    "dipendenze": ["Attivazione POD"]
                },
                {
                    "name": "Sincronizzazione GAUDÌ-GSE",
                    "description": "Trasmissione automatica dati da GAUDÌ a GSE",
                    "assignee": "Sistema",
                    "duration_days": 15,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.TERNA.value,
                    "integrazione": EntityEnum.GSE.value,
                    "documents_to_generate": [
                        "Conferma trasmissione dati GSE",
                        "Report sincronizzazione"
                    ],
                    "checklist_items": [
                        "Invio automatico dati a GSE",
                        "Verifica ricezione GSE",
                        "Conferma CENSIMP su GSE",
                        "Abilitazione servizi GSE"
                    ],
                    "note": "Processo automatico via web service GAUDÌ-GSE",
                    "dipendenze": ["Inserimento Dati Tecnici GAUDÌ"]
                }
            ]
        },
        {
            "name": "Fase 4: Attivazione Servizi GSE",
            "order": 4,
            "duration_days": 30,
            "tasks": [
                {
                    "name": "Accesso Area Clienti GSE",
                    "description": "Login con SPID o credenziali + MFA",
                    "assignee": "Asset Manager",
                    "duration_days": 1,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.GSE.value,
                    "integrazione": EntityEnum.GSE.value,
                    "practice_type": "Accesso Portale",
                    "portal_url": "https://areaclienti.gse.it",
                    "portal_login_url": "https://areaclienti.gse.it/login",
                    "required_credentials": "SPID/CIE + MFA",
                    "documents_to_generate": [
                        "Screenshot configurazione MFA",
                        "Credenziali accesso salvate"
                    ],
                    "regulatory_deadline": "Immediato per attivazione",
                    "deadline_type": "propedeutico",
                    "deadline_consequences": "Impossibile procedere con RID/SSP",
                    "requires_human_auth": True,
                    "human_checkpoint_notes": "MFA richiede telefono personale",
                    "checklist_items": [
                        "Verifica credenziali SPID",
                        "Configurazione MFA",
                        "Test accesso"
                    ]
                },
                {
                    "name": "Attivazione Ritiro Dedicato (RID)",
                    "description": "Richiesta convenzione Ritiro Dedicato per vendita energia",
                    "assignee": "Asset Manager",
                    "duration_days": 10,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.GSE.value,
                    "integrazione": EntityEnum.GSE.value,
                    "practice_type": "RID",
                    "portal_url": "https://areaclienti.gse.it/RID",
                    "portal_login_url": "https://areaclienti.gse.it/login",
                    "required_credentials": "SPID/CIE + MFA",
                    "required_documents": [
                        "Dati impianto da GAUDÌ",
                        "Coordinate bancarie",
                        "Documentazione societaria"
                    ],
                    "documents_to_generate": [
                        "Convenzione RID firmata",
                        "Codice convenzione GSE",
                        "Calendario pagamenti energia"
                    ],
                    "official_form_fields": {
                        "codice_censimp": "Da GAUDÌ",
                        "iban": "Coordinate bancarie",
                        "prezzi_minimi_garantiti": "Sì/No",
                        "tariffa_omnicomprensiva": "Solo se incentivato"
                    },
                    "regulatory_deadline": "30 giorni per attivazione",
                    "deadline_type": "ordinario",
                    "submission_method": "Portale GSE online",
                    "external_protocol_number": "Numero convenzione RID",
                    "checklist_items": [
                        "Compilazione moduli RID",
                        "Upload documenti",
                        "Invio richiesta"
                    ],
                    "dipendenze": ["Sincronizzazione GAUDÌ-GSE"],
                    "conditions": {
                        "if": "modalita_vendita == 'RID'",
                        "then": "obbligatorio = True"
                    }
                },
                {
                    "name": "Attivazione Scambio sul Posto (SSP)",
                    "description": "Richiesta convenzione Scambio sul Posto (fino al 2024)",
                    "assignee": "Asset Manager",
                    "duration_days": 10,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.GSE.value,
                    "integrazione": EntityEnum.GSE.value,
                    "practice_type": "SSP",
                    "portal_url": "https://areaclienti.gse.it/SSP",
                    "portal_login_url": "https://areaclienti.gse.it/login",
                    "required_credentials": "SPID/CIE + MFA",
                    "required_documents": [
                        "Dati impianto da GAUDÌ",
                        "Dati punto di prelievo",
                        "Documentazione tecnica"
                    ],
                    "documents_to_generate": [
                        "Convenzione SSP firmata",
                        "Codice convenzione SSP",
                        "Schema conguagli annuali"
                    ],
                    "official_form_fields": {
                        "pod_prelievo": "POD punto consumo",
                        "pod_immissione": "POD produzione",
                        "stesso_sito": "Sì/No",
                        "tipologia_utente": "Domestico/Altri usi"
                    },
                    "regulatory_deadline": "60 giorni per attivazione",
                    "deadline_type": "ordinario",
                    "submission_method": "Portale GSE online",
                    "checklist_items": [
                        "Compilazione moduli SSP",
                        "Verifica requisiti",
                        "Invio richiesta"
                    ],
                    "dipendenze": ["Sincronizzazione GAUDÌ-GSE"],
                    "conditions": {
                        "if": "potenza <= 500 AND modalita_vendita == 'SSP' AND anno < 2025",
                        "then": "obbligatorio = True"
                    },
                    "note": "SSP termina per nuovi impianti dal 2025"
                },
                {
                    "name": "Dichiarazione Antimafia",
                    "description": "Presentazione documentazione antimafia per incentivi > 150k€",
                    "assignee": "Legale",
                    "duration_days": 15,
                    "priority": "Media",
                    "responsible_entity": EntityEnum.GSE.value,
                    "practice_type": "Antimafia",
                    "portal_url": "https://areaclienti.gse.it/antimafia",
                    "required_credentials": "SPID/CIE + MFA",
                    "required_documents": [
                        "Visura camerale aggiornata",
                        "Documenti identità soci",
                        "Dichiarazioni sostitutive antimafia"
                    ],
                    "documents_to_generate": [
                        "Modello autocertificazione antimafia",
                        "Elenco soci e quote",
                        "Dichiarazione familiari conviventi"
                    ],
                    "official_form_fields": {
                        "societa_dati": "Ragione sociale e P.IVA",
                        "soci_elenco": "Nome, CF, quota % per ogni socio",
                        "familiari_conviventi": "Per soci > 25%",
                        "white_list": "Iscrizione se disponibile"
                    },
                    "regulatory_deadline": "30 giorni per verifica",
                    "deadline_type": "sospensivo",
                    "deadline_consequences": "Blocco erogazione incentivi",
                    "requires_physical_signature": True,
                    "checklist_items": [
                        "Verifica soglia incentivi",
                        "Raccolta documentazione",
                        "Invio dichiarazione"
                    ],
                    "conditions": {
                        "if": "valore_incentivi_annuo > 150000",
                        "then": "obbligatorio = True"
                    }
                }
            ]
        },
        {
            "name": "Fase 5: Denuncia Officina Elettrica (Dogane)",
            "order": 5,
            "duration_days": 25,
            "tasks": [
                {
                    "name": "Preparazione Denuncia Officina",
                    "description": "Compilazione moduli denuncia officina elettrica",
                    "assignee": "Fiscalista",
                    "duration_days": 5,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.CUSTOMS.value,
                    "practice_type": "Denuncia Officina",
                    "portal_url": "https://www.adm.gov.it/portale/dogane/operatore/accise/energia-elettrica",
                    "required_documents": [
                        "Dati tecnici impianto",
                        "Planimetria con contatori UTF",
                        "Schema unifilare fiscale"
                    ],
                    "documents_to_generate": [
                        "Modello AD-1 compilato",
                        "Planimetria UTF quotata",
                        "Schema contatori fiscali",
                        "Relazione tecnica officina"
                    ],
                    "official_form_fields": {
                        "dati_officina": {
                            "denominazione": "Nome impianto",
                            "ubicazione": "Indirizzo completo",
                            "potenza_nominale": "kW installati",
                            "potenza_efficiente": "kW netti"
                        },
                        "contatori_utf": {
                            "matricola_produzione": "Seriale UTF produzione",
                            "matricola_consumo": "Seriale UTF autoconsumo",
                            "matricola_immissione": "Seriale UTF immissione"
                        }
                    },
                    "checklist_items": [
                        "Verifica potenza > 20kW",
                        "Compilazione modello AD-1",
                        "Preparazione allegati tecnici"
                    ],
                    "conditions": {
                        "if": "potenza > 20",
                        "then": "obbligatorio = True"
                    }
                },
                {
                    "name": "Invio Telematico PUDM",
                    "description": "Trasmissione denuncia tramite portale PUDM o EDI",
                    "assignee": "Fiscalista",
                    "duration_days": 2,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.CUSTOMS.value,
                    "integrazione": EntityEnum.CUSTOMS.value,
                    "practice_type": "PUDM",
                    "portal_url": "https://pudm.adm.gov.it",
                    "portal_login_url": "https://pudm.adm.gov.it/pudm/login",
                    "required_credentials": "SPID/CNS/CIE",
                    "documents_to_generate": [
                        "Ricevuta protocollazione PUDM",
                        "Numero pratica doganale"
                    ],
                    "regulatory_deadline": "30 giorni da attivazione POD",
                    "deadline_type": "peremptory",
                    "deadline_consequences": "Sanzione amministrativa €500-€3000",
                    "submission_method": "PUDM o EDI per grandi operatori",
                    "requires_human_auth": True,
                    "checklist_items": [
                        "Accesso PUDM",
                        "Upload documentazione",
                        "Protocollazione pratica"
                    ],
                    "dipendenze": ["Preparazione Denuncia Officina"],
                    "conditions": {
                        "if": "potenza > 20",
                        "then": "obbligatorio = True"
                    }
                },
                {
                    "name": "Ottenimento Licenza Esercizio",
                    "description": "Ricezione licenza officina elettrica da Agenzia Dogane",
                    "assignee": "Sistema",
                    "duration_days": 20,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.CUSTOMS.value,
                    "portal_url": "https://pudm.adm.gov.it",
                    "documents_to_generate": [
                        "Licenza officina elettrica UTF",
                        "Codice ditta assegnato",
                        "Codice officina"
                    ],
                    "external_protocol_number": "Codice Ditta/Officina",
                    "regulatory_deadline": "60 giorni da denuncia",
                    "deadline_type": "ordinatorio",
                    "requires_site_inspection": True,
                    "human_checkpoint_notes": "Possibile sopralluogo UTF",
                    "guide_config": {
                        "tipo": "monitoraggio",
                        "check_status": "daily",
                        "alert_giorni_ritardo": 5
                    },
                    "checklist_items": [
                        "Monitoraggio stato pratica",
                        "Eventuale sopralluogo",
                        "Ricezione licenza"
                    ],
                    "dipendenze": ["Invio Telematico PUDM"],
                    "conditions": {
                        "if": "potenza > 20",
                        "then": "obbligatorio = True"
                    }
                }
            ]
        }
    ],
    "condizioni_attivazione": {
        "tipo_workflow": "nuovo_impianto",
        "stato_impianto": "non_connesso"
    },
    "deadline_config": {
        "calcolo": "data_inizio + 180 giorni",
        "alert_giorni": [30, 15, 7, 1]
    }
}

# Recurring workflows
DICHIARAZIONE_ANNUALE_CONSUMO = {
    "name": "Dichiarazione Annuale Consumo Energia",
    "description": "Dichiarazione annuale di produzione e consumo energia per Agenzia Dogane",
    "category": WorkflowCategoryEnum.FISCAL,
    "plant_type": "Tutti",
    "min_power": 20,
    "max_power": None,
    "estimated_duration_days": 10,
    "recurrence": "Annuale",
    "required_entities": [EntityEnum.CUSTOMS.value],
    "base_documents": ["Letture mensili contatori"],
    "stages": [
        {
            "name": "Preparazione Dichiarazione",
            "order": 1,
            "duration_days": 10,
            "tasks": [
                {
                    "name": "Raccolta Dati Produzione",
                    "description": "Lettura contatori e calcolo produzioni annuali",
                    "assignee": "Tecnico",
                    "duration_days": 3,
                    "priority": "Alta",
                    "required_documents": ["Letture mensili contatori UTF"],
                    "documents_to_generate": [
                        "Registro letture UTF annuale",
                        "Riepilogo produzione/consumo/cessione",
                        "Calcolo energia soggetta ad accisa"
                    ],
                    "official_form_fields": {
                        "energia_prodotta_kwh": "Totale annuo produzione",
                        "energia_autoconsumata_kwh": "Totale autoconsumo",
                        "energia_ceduta_kwh": "Totale cessione rete",
                        "energia_accisa_kwh": "Soggetta ad accisa (>200.000 kWh)"
                    },
                    "regulatory_deadline": "31 marzo di ogni anno",
                    "deadline_type": "peremptory",
                    "deadline_consequences": "Sanzione da €500 a €3.000 + accertamento",
                    "checklist_items": [
                        "Verifica letture mensili",
                        "Calcolo totali annuali",
                        "Validazione dati"
                    ]
                },
                {
                    "name": "Generazione File EDI",
                    "description": "Creazione file formato Idoc per invio telematico",
                    "assignee": "Sistema",
                    "duration_days": 1,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.CUSTOMS.value,
                    "portal_url": "https://www.adm.gov.it/portale/documents/20182/5356938/Tracciati+EDI.pdf",
                    "documents_to_generate": [
                        "File IDOC formato XML",
                        "File firmato digitalmente .p7m",
                        "Report validazione tracciato"
                    ],
                    "official_form_fields": {
                        "codice_ditta": "Da licenza officina",
                        "anno_riferimento": "Anno dichiarazione",
                        "dati_produzione": "Array mensile produzioni",
                        "firma_digitale": "CNS titolare/delegato"
                    },
                    "guide_config": {
                        "tipo": "generazione_edi",
                        "formato": "IDOC",
                        "template": "dichiarazione_annuale"
                    },
                    "checklist_items": [
                        "Formattazione dati Idoc",
                        "Generazione firma digitale",
                        "Validazione tracciato"
                    ],
                    "dipendenze": ["Raccolta Dati Produzione"]
                },
                {
                    "name": "Invio System-to-System",
                    "description": "Trasmissione file EDI tramite canale S2S",
                    "assignee": "Sistema",
                    "duration_days": 1,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.CUSTOMS.value,
                    "integrazione": EntityEnum.CUSTOMS.value,
                    "practice_type": "S2S",
                    "portal_url": "https://www.adm.gov.it/portale/ee/trader/servizi-online/servizi-doganali/edi",
                    "required_credentials": "Certificato S2S Dogane",
                    "documents_to_generate": [
                        "Ricevuta telematica RT",
                        "Esito elaborazione",
                        "Protocollo dichiarazione"
                    ],
                    "submission_method": "Web Service SOAP/REST",
                    "guide_config": {
                        "tipo": "invio_s2s",
                        "canale": "EDI",
                        "retry_max": 3
                    },
                    "checklist_items": [
                        "Connessione canale S2S",
                        "Upload file firmato",
                        "Conferma ricezione"
                    ],
                    "dipendenze": ["Generazione File EDI"]
                },
                {
                    "name": "Pagamento Accise",
                    "description": "Calcolo e pagamento accise su energia consumata",
                    "assignee": "Amministrazione",
                    "duration_days": 5,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.CUSTOMS.value,
                    "required_documents": ["F24 accise"],
                    "documents_to_generate": [
                        "F24 ACCISE compilato",
                        "Calcolo dettaglio accise",
                        "Ricevuta pagamento F24"
                    ],
                    "official_form_fields": {
                        "codice_tributo": "3811 (accisa energia elettrica)",
                        "periodo_riferimento": "MM/AAAA",
                        "codice_ufficio": "Da licenza officina",
                        "aliquota_accisa": "€0,0125/kWh (2025)"
                    },
                    "cost_description": "Accisa su autoconsumo > 200.000 kWh/anno",
                    "payment_method": "F24 telematico",
                    "regulatory_deadline": "16 del mese successivo",
                    "deadline_type": "peremptory",
                    "deadline_consequences": "Sanzione 30% + interessi",
                    "checklist_items": [
                        "Calcolo accise dovute",
                        "Generazione F24",
                        "Pagamento e ricevuta"
                    ],
                    "dipendenze": ["Invio System-to-System"]
                }
            ]
        }
    ],
    "condizioni_attivazione": {
        "min_power": 20,
        "licenza_officina": "attiva"
    },
    "deadline_config": {
        "scadenza_fissa": {
            "giorno": 31,
            "mese": 3
        },
        "alert_giorni": [30, 15, 7, 1],
        "penale_ritardo": True
    }
}

PAGAMENTO_CANONE_LICENZA = {
    "name": "Pagamento Canone Annuale Licenza",
    "description": "Pagamento canone annuale licenza officina elettrica",
    "category": WorkflowCategoryEnum.FISCAL,
    "plant_type": "Tutti",
    "min_power": 20,
    "max_power": None,
    "estimated_duration_days": 5,
    "recurrence": "Annuale",
    "required_entities": [EntityEnum.CUSTOMS.value],
    "stages": [
        {
            "name": "Pagamento Canone",
            "order": 1,
            "duration_days": 5,
            "tasks": [
                {
                    "name": "Calcolo Canone Dovuto",
                    "description": "Determinazione importo canone annuale",
                    "assignee": "Amministrazione",
                    "duration_days": 2,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.CUSTOMS.value,
                    "documents_to_generate": [
                        "Calcolo canone annuale",
                        "F24 precompilato"
                    ],
                    "official_form_fields": {
                        "codice_tributo": "2810 (canone licenza officina)",
                        "importo_base": "€77,47 (fino a 100kW)",
                        "importo_maggiorato": "€154,94 (oltre 100kW)",
                        "anno_riferimento": "Anno solare"
                    },
                    "cost_amount": 77.47,
                    "cost_description": "Canone base fino 100kW (€154,94 oltre)",
                    "regulatory_deadline": "16 dicembre di ogni anno",
                    "deadline_type": "peremptory",
                    "deadline_consequences": "Sospensione licenza + sanzioni",
                    "checklist_items": [
                        "Verifica potenza impianto",
                        "Calcolo importo",
                        "Generazione F24"
                    ]
                },
                {
                    "name": "Pagamento F24",
                    "description": "Esecuzione pagamento tramite F24",
                    "assignee": "Amministrazione",
                    "duration_days": 3,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.CUSTOMS.value,
                    "portal_url": "https://www.agenziaentrate.gov.it/portale/web/guest/servizi/servizitrasversali/f24",
                    "required_documents": ["Ricevuta pagamento F24"],
                    "documents_to_generate": [
                        "F24 quietanzato",
                        "Ricevuta telematica RT",
                        "CRO/TRN bancario"
                    ],
                    "payment_method": "F24 web/telematico",
                    "submission_method": "Home banking o Entratel",
                    "checklist_items": [
                        "Compilazione F24",
                        "Pagamento bancario",
                        "Archiviazione ricevuta"
                    ],
                    "dipendenze": ["Calcolo Canone Dovuto"]
                }
            ]
        }
    ],
    "condizioni_attivazione": {
        "min_power": 20,
        "licenza_officina": "attiva"
    },
    "deadline_config": {
        "scadenza_fissa": {
            "giorno": 16,
            "mese": 12
        },
        "alert_giorni": [30, 15, 7, 1],
        "penale_ritardo": True
    }
}

VERIFICA_PERIODICA_SPI = {
    "name": "Verifica Periodica Sistema Protezione Interfaccia",
    "description": "Verifica quinquennale del Sistema di Protezione di Interfaccia",
    "category": WorkflowCategoryEnum.MAINTENANCE,
    "plant_type": "Tutti",
    "min_power": 0,
    "max_power": None,
    "estimated_duration_days": 30,
    "recurrence": "Quinquennale",
    "required_entities": [EntityEnum.DSO.value],
    "stages": [
        {
            "name": "Verifica SPI",
            "order": 1,
            "duration_days": 30,
            "tasks": [
                {
                    "name": "Pianificazione Verifica",
                    "description": "Pianificazione intervento con tecnico qualificato",
                    "assignee": "Asset Manager",
                    "duration_days": 10,
                    "priority": "Media",
                    "responsible_entity": EntityEnum.DSO.value,
                    "portal_url": "Portale DSO locale",
                    "documents_to_generate": [
                        "Comunicazione data verifica",
                        "Nomina tecnico verificatore"
                    ],
                    "official_form_fields": {
                        "data_prevista": "Data pianificata verifica",
                        "tecnico_nome": "Nome tecnico abilitato",
                        "tecnico_qualifica": "N. iscrizione albo",
                        "pod_impianto": "POD da verificare"
                    },
                    "regulatory_deadline": "Entro 5 anni da ultima verifica",
                    "deadline_type": "peremptory",
                    "deadline_consequences": "Distacco impianto da rete",
                    "checklist_items": [
                        "Selezione tecnico qualificato",
                        "Pianificazione data",
                        "Notifica DSO"
                    ]
                },
                {
                    "name": "Esecuzione Verifica",
                    "description": "Verifica funzionale del Sistema di Protezione",
                    "assignee": "Tecnico",
                    "duration_days": 5,
                    "priority": "Alta",
                    "required_documents": [
                        "Report verifica SPI",
                        "Certificato conformità"
                    ],
                    "documents_to_generate": [
                        "Verbale prova SPI con cassetta",
                        "Report tempi intervento protezioni",
                        "Certificato conformità CEI 0-21",
                        "Scheda taratura protezioni"
                    ],
                    "official_form_fields": {
                        "test_27": "Minima tensione (soglia e tempo)",
                        "test_59": "Massima tensione (soglia e tempo)",
                        "test_81": "Frequenza min/max (soglie e tempi)",
                        "test_interfaccia": "Apertura DDI comando esterno"
                    },
                    "requires_site_inspection": True,
                    "human_checkpoint_notes": "Presenza tecnico con cassetta prova relè",
                    "checklist_items": [
                        "Test funzionali",
                        "Compilazione report",
                        "Rilascio certificato"
                    ],
                    "dipendenze": ["Pianificazione Verifica"]
                },
                {
                    "name": "Comunicazione Esito DSO",
                    "description": "Invio certificazione verifica al DSO",
                    "assignee": "Asset Manager",
                    "duration_days": 5,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.DSO.value,
                    "portal_url": "Portale produttori DSO",
                    "required_credentials": "Credenziali produttore",
                    "required_documents": ["Certificato verifica SPI"],
                    "documents_to_generate": [
                        "Comunicazione esito verifica",
                        "Upload certificato su portale",
                        "Conferma ricezione DSO"
                    ],
                    "submission_method": "Upload portale o PEC",
                    "regulatory_deadline": "30 giorni da verifica",
                    "deadline_type": "ordinatorio",
                    "checklist_items": [
                        "Upload certificato",
                        "Conferma ricezione DSO"
                    ],
                    "dipendenze": ["Esecuzione Verifica"]
                }
            ]
        }
    ],
    "condizioni_attivazione": {
        "anni_da_attivazione": 5,
        "recurrence": "ogni 5 anni"
    },
    "deadline_config": {
        "calcolo": "data_ultima_verifica + 5 anni",
        "alert_giorni": [90, 60, 30, 15],
        "blocco_impianto": True
    }
}

# List of all renewable energy workflow templates
RENEWABLE_ENERGY_WORKFLOWS = [
    SOLAR_INSTALLATION_COMPLETE,  # Comprehensive 9-phase workflow
    RENEWABLE_ENERGY_WORKFLOW,
    DICHIARAZIONE_ANNUALE_CONSUMO,
    PAGAMENTO_CANONE_LICENZA,
    VERIFICA_PERIODICA_SPI,
    CONNECTION_REQUEST_WORKFLOW
]

def get_applicable_workflows(potenza_kw: float, tipo_impianto: str, stato_impianto: str) -> list:
    """
    Returns list of applicable workflow templates based on plant characteristics
    """
    applicable = []
    
    for workflow in RENEWABLE_ENERGY_WORKFLOWS:
        # Check power requirements
        if workflow.get("min_power") and potenza_kw < workflow["min_power"]:
            continue
        if workflow.get("max_power") and potenza_kw > workflow["max_power"]:
            continue
            
        # Check plant type
        if workflow.get("plant_type") != "Tutti" and workflow.get("plant_type") != tipo_impianto:
            continue
            
        # Check activation conditions
        conditions = workflow.get("activation_conditions", {})
        if conditions.get("stato_impianto") and conditions["stato_impianto"] != stato_impianto:
            continue
            
        applicable.append(workflow)
    
    return applicable
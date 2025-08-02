"""
Renewable Energy Plant Activation Workflow Templates
Based on Italian regulatory requirements for DSO, Terna, GSE, and Agenzia delle Dogane
"""

from app.models.workflow import WorkflowCategoryEnum, EntityEnum
from app.data.connection_request_workflow import CONNECTION_REQUEST_WORKFLOW

RENEWABLE_ENERGY_WORKFLOW = {
    "nome": "Attivazione Plant Rinnovabile Completa",
    "descrizione": "Processo completo per l'attivazione di un impianto a fonti rinnovabili alla rete elettrica italiana",
    "categoria": WorkflowCategoryEnum.ACTIVATION,
    "tipo_impianto": "Tutti",
    "potenza_minima": 0,
    "potenza_massima": None,
    "durata_stimata_giorni": 180,
    "ricorrenza": "Una tantum",
    "enti_richiesti": [
        EntityEnum.MUNICIPALITY.value,
        EntityEnum.DSO.value,
        EntityEnum.TERNA.value,
        EntityEnum.GSE.value,
        EntityEnum.CUSTOMS.value
    ],
    "documenti_base": [
        "Documento identità titolare",
        "Visura camerale",
        "Titolo disponibilità sito",
        "Progetto definitivo impianto"
    ],
    "stages": [
        {
            "nome": "Fase 1: Progettazione e Autorizzazione",
            "ordine": 1,
            "durata_giorni": 45,
            "tasks": [
                {
                    "nome": "Progettazione Plant",
                    "descrizione": "Sviluppo del progetto esecutivo da parte di un tecnico abilitato",
                    "responsabile": "Progettista",
                    "durata_giorni": 15,
                    "priorita": "Alta",
                    "documenti_richiesti": [
                        "Dimensionamento impianto",
                        "Scelta componenti",
                        "Schemi elettrici",
                        "Calcoli di produzione"
                    ],
                    "checkpoints": [
                        "Valutazione fattibilità tecnica",
                        "Valutazione fattibilità economica",
                        "Approvazione progetto"
                    ]
                },
                {
                    "nome": "Richiesta Titolo Autorizzativo",
                    "descrizione": "Ottenimento permesso di costruire/SCIA dal Comune",
                    "responsabile": "Asset Manager",
                    "durata_giorni": 30,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.MUNICIPALITY.value,
                    "tipo_pratica": "Permesso Costruire/SCIA",
                    "documenti_richiesti": [
                        "Progetto architettonico",
                        "Relazione tecnica",
                        "Elaborati grafici"
                    ],
                    "checkpoints": [
                        "Presentazione istanza",
                        "Integrazione documentale",
                        "Rilascio autorizzazione"
                    ],
                    "condizioni": {
                        "se": "potenza > 1000",
                        "allora": "tipo_pratica = 'Autorizzazione Unica Regionale'"
                    }
                },
                {
                    "nome": "Parere Soprintendenza",
                    "descrizione": "Ottenimento parere per vincoli paesaggistici/storico-artistici",
                    "responsabile": "Asset Manager",
                    "durata_giorni": 30,
                    "priorita": "Media",
                    "ente_responsabile": EntityEnum.SUPERINTENDENCE.value,
                    "tipo_pratica": "Autorizzazione Paesaggistica",
                    "documenti_richiesti": [
                        "Relazione paesaggistica",
                        "Fotoinserimenti",
                        "Tavole di progetto"
                    ],
                    "condizioni": {
                        "se": "area_vincolata == true",
                        "allora": "obbligatorio = true"
                    }
                }
            ]
        },
        {
            "nome": "Fase 2: Connessione alla Rete DSO",
            "ordine": 2,
            "durata_giorni": 60,
            "tasks": [
                {
                    "nome": "Richiesta di Connessione",
                    "descrizione": "Invio richiesta di connessione al Distributore territorialmente competente",
                    "responsabile": "Asset Manager",
                    "durata_giorni": 5,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.DSO.value,
                    "integrazione": EntityEnum.DSO.value,
                    "tipo_pratica": "TICA",
                    "url_portale": "https://www.e-distribuzione.it/",
                    "documenti_richiesti": [
                        "Dati impianto",
                        "Potenza richiesta",
                        "Schema unifilare preliminare",
                        "Planimetria catastale"
                    ],
                    "checkpoints": [
                        "Compilazione portale",
                        "Upload documentazione",
                        "Protocollazione pratica"
                    ],
                    "condizioni": {
                        "se": "potenza <= 50 AND tipo == 'Fotovoltaico'",
                        "allora": "iter = 'Semplificato'"
                    }
                },
                {
                    "nome": "Gestione TICA/STMC",
                    "descrizione": "Ricezione e valutazione Soluzione Tecnica Minima di Connessione",
                    "responsabile": "Tecnico",
                    "durata_giorni": 45,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.DSO.value,
                    "tipo_pratica": "TICA",
                    "documenti_richiesti": [],
                    "checkpoints": [
                        "Ricezione TICA da DSO",
                        "Analisi tecnico-economica",
                        "Decisione accettazione"
                    ],
                    "scadenza": {
                        "giorni": 45,
                        "tipo": "perentoria",
                        "azione_default": "rifiuto automatico"
                    }
                },
                {
                    "nome": "Accettazione e Pagamento TICA",
                    "descrizione": "Accettazione preventivo e pagamento corrispettivi",
                    "responsabile": "Amministrazione",
                    "durata_giorni": 5,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.DSO.value,
                    "documenti_richiesti": [
                        "Accettazione TICA firmata",
                        "Bonifico corrispettivi"
                    ],
                    "checkpoints": [
                        "Firma accettazione",
                        "Pagamento prima rata",
                        "Conferma DSO"
                    ]
                },
                {
                    "nome": "Comunicazione Fine Lavori",
                    "descrizione": "Invio documentazione di fine lavori per attivazione",
                    "responsabile": "Tecnico",
                    "durata_giorni": 10,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.DSO.value,
                    "documenti_richiesti": [
                        "Regolamento di Esercizio",
                        "Dichiarazione conformità impianto",
                        "Dichiarazione conformità SPI",
                        "Certificato collaudo"
                    ],
                    "checkpoints": [
                        "Raccolta certificazioni",
                        "Verifica completezza",
                        "Invio al DSO"
                    ]
                },
                {
                    "nome": "Attivazione POD",
                    "descrizione": "Allaccio fisico e attivazione contatori",
                    "responsabile": "DSO",
                    "durata_giorni": 10,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.DSO.value,
                    "guide_config": {
                        "tipo": "monitoraggio",
                        "check_status": "daily"
                    },
                    "checkpoints": [
                        "Sopralluogo DSO",
                        "Installazione contatori",
                        "Assegnazione POD"
                    ]
                }
            ]
        },
        {
            "nome": "Fase 3: Registrazione GAUDÌ (Terna)",
            "ordine": 3,
            "durata_giorni": 20,
            "tasks": [
                {
                    "nome": "Registrazione Operatore GAUDÌ",
                    "descrizione": "Creazione account operatore/mandatario su portale GAUDÌ",
                    "responsabile": "Asset Manager",
                    "durata_giorni": 2,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.TERNA.value,
                    "integrazione": EntityEnum.TERNA.value,
                    "tipo_pratica": "GAUDÌ",
                    "url_portale": "https://www.terna.it/gaudi",
                    "credenziali_richieste": "User ID + Password",
                    "documenti_richiesti": [
                        "Documento identità",
                        "Dati aziendali",
                        "Mandato (se delegato)"
                    ],
                    "checkpoints": [
                        "Registrazione portale",
                        "Verifica email",
                        "Attivazione account"
                    ]
                },
                {
                    "nome": "Inserimento Anagrafica Plant",
                    "descrizione": "Compilazione dati tecnici impianto su GAUDÌ",
                    "responsabile": "Asset Manager",
                    "durata_giorni": 3,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.TERNA.value,
                    "integrazione": EntityEnum.TERNA.value,
                    "tipo_pratica": "GAUDÌ - Anagrafica",
                    "documenti_richiesti": [
                        "Codice POD",
                        "Codice rintracciabilità DSO",
                        "Schede tecniche componenti"
                    ],
                    "checkpoints": [
                        "Inserimento dati produttore",
                        "Inserimento dati tecnici",
                        "Validazione anagrafica"
                    ],
                    "dipendenze": ["Attivazione POD"]
                },
                {
                    "nome": "Monitoraggio Flussi Validazione",
                    "descrizione": "Verifica stato flussi G01, G02, G04 tra DSO e Terna",
                    "responsabile": "Sistema",
                    "durata_giorni": 15,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.TERNA.value,
                    "guide_config": {
                        "tipo": "polling",
                        "frequenza": "daily",
                        "api_endpoint": "/gaudi/status"
                    },
                    "checkpoints": [
                        "Ricezione flusso G01 da DSO",
                        "Conferma G02 da Terna",
                        "Attivazione G04"
                    ],
                    "dipendenze": ["Inserimento Anagrafica Plant"]
                }
            ]
        },
        {
            "nome": "Fase 4: Attivazione Servizi GSE",
            "ordine": 4,
            "durata_giorni": 30,
            "tasks": [
                {
                    "nome": "Accesso Area Clienti GSE",
                    "descrizione": "Login con SPID o credenziali + MFA",
                    "responsabile": "Asset Manager",
                    "durata_giorni": 1,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.GSE.value,
                    "integrazione": EntityEnum.GSE.value,
                    "tipo_pratica": "Accesso Portale",
                    "url_portale": "https://areaclienti.gse.it",
                    "credenziali_richieste": "SPID/CIE + MFA",
                    "checkpoints": [
                        "Verifica credenziali SPID",
                        "Configurazione MFA",
                        "Test accesso"
                    ]
                },
                {
                    "nome": "Attivazione Ritiro Dedicato (RID)",
                    "descrizione": "Richiesta convenzione Ritiro Dedicato per vendita energia",
                    "responsabile": "Asset Manager",
                    "durata_giorni": 10,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.GSE.value,
                    "integrazione": EntityEnum.GSE.value,
                    "tipo_pratica": "RID",
                    "documenti_richiesti": [
                        "Dati impianto da GAUDÌ",
                        "Coordinate bancarie",
                        "Documentazione societaria"
                    ],
                    "checkpoints": [
                        "Compilazione moduli RID",
                        "Upload documenti",
                        "Invio richiesta"
                    ],
                    "dipendenze": ["Monitoraggio Flussi Validazione"],
                    "condizioni": {
                        "se": "modalita_vendita == 'RID'",
                        "allora": "obbligatorio = true"
                    }
                },
                {
                    "nome": "Attivazione Scambio sul Posto (SSP)",
                    "descrizione": "Richiesta convenzione Scambio sul Posto",
                    "responsabile": "Asset Manager",
                    "durata_giorni": 10,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.GSE.value,
                    "integrazione": EntityEnum.GSE.value,
                    "tipo_pratica": "SSP",
                    "documenti_richiesti": [
                        "Dati impianto da GAUDÌ",
                        "Dati punto di prelievo",
                        "Documentazione tecnica"
                    ],
                    "checkpoints": [
                        "Compilazione moduli SSP",
                        "Verifica requisiti",
                        "Invio richiesta"
                    ],
                    "dipendenze": ["Monitoraggio Flussi Validazione"],
                    "condizioni": {
                        "se": "potenza <= 500 AND modalita_vendita == 'SSP'",
                        "allora": "obbligatorio = true"
                    }
                },
                {
                    "nome": "Dichiarazione Antimafia",
                    "descrizione": "Presentazione documentazione antimafia per incentivi > 150k€",
                    "responsabile": "Legale",
                    "durata_giorni": 15,
                    "priorita": "Media",
                    "ente_responsabile": EntityEnum.GSE.value,
                    "tipo_pratica": "Antimafia",
                    "documenti_richiesti": [
                        "Visura camerale aggiornata",
                        "Documenti identità soci",
                        "Dichiarazioni sostitutive antimafia"
                    ],
                    "checkpoints": [
                        "Verifica soglia incentivi",
                        "Raccolta documentazione",
                        "Invio dichiarazione"
                    ],
                    "condizioni": {
                        "se": "valore_incentivi_annuo > 150000",
                        "allora": "obbligatorio = true"
                    }
                }
            ]
        },
        {
            "nome": "Fase 5: Denuncia Officina Elettrica (Dogane)",
            "ordine": 5,
            "durata_giorni": 25,
            "tasks": [
                {
                    "nome": "Preparazione Denuncia Officina",
                    "descrizione": "Compilazione moduli denuncia officina elettrica",
                    "responsabile": "Fiscalista",
                    "durata_giorni": 5,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.CUSTOMS.value,
                    "tipo_pratica": "Denuncia Officina",
                    "documenti_richiesti": [
                        "Dati tecnici impianto",
                        "Planimetria con contatori UTF",
                        "Schema unifilare fiscale"
                    ],
                    "checkpoints": [
                        "Verifica potenza > 20kW",
                        "Compilazione modello AD-1",
                        "Preparazione allegati tecnici"
                    ],
                    "condizioni": {
                        "se": "potenza > 20",
                        "allora": "obbligatorio = true"
                    }
                },
                {
                    "nome": "Invio Telematico PUDM",
                    "descrizione": "Trasmissione denuncia tramite portale PUDM o EDI",
                    "responsabile": "Fiscalista",
                    "durata_giorni": 2,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.CUSTOMS.value,
                    "integrazione": EntityEnum.CUSTOMS.value,
                    "tipo_pratica": "PUDM",
                    "url_portale": "https://pudm.adm.gov.it",
                    "credenziali_richieste": "SPID/CNS/CIE",
                    "checkpoints": [
                        "Accesso PUDM",
                        "Upload documentazione",
                        "Protocollazione pratica"
                    ],
                    "dipendenze": ["Preparazione Denuncia Officina"],
                    "condizioni": {
                        "se": "potenza > 20",
                        "allora": "obbligatorio = true"
                    }
                },
                {
                    "nome": "Ottenimento Licenza Esercizio",
                    "descrizione": "Ricezione licenza officina elettrica da Agenzia Dogane",
                    "responsabile": "Sistema",
                    "durata_giorni": 20,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.CUSTOMS.value,
                    "guide_config": {
                        "tipo": "monitoraggio",
                        "check_status": "daily",
                        "alert_giorni_ritardo": 5
                    },
                    "checkpoints": [
                        "Monitoraggio stato pratica",
                        "Eventuale sopralluogo",
                        "Ricezione licenza"
                    ],
                    "dipendenze": ["Invio Telematico PUDM"],
                    "condizioni": {
                        "se": "potenza > 20",
                        "allora": "obbligatorio = true"
                    }
                }
            ]
        }
    ],
    "condizioni_attivazione": {
        "tipo_workflow": "nuovo_impianto",
        "stato_impianto": "non_connesso"
    },
    "scadenza_config": {
        "calcolo": "data_inizio + 180 giorni",
        "alert_giorni": [30, 15, 7, 1]
    }
}

# Recurring workflows
DICHIARAZIONE_ANNUALE_CONSUMO = {
    "nome": "Dichiarazione Annuale Consumo Energia",
    "descrizione": "Dichiarazione annuale di produzione e consumo energia per Agenzia Dogane",
    "categoria": WorkflowCategoryEnum.FISCAL,
    "tipo_impianto": "Tutti",
    "potenza_minima": 20,
    "potenza_massima": None,
    "durata_stimata_giorni": 10,
    "ricorrenza": "Annuale",
    "enti_richiesti": [EntityEnum.CUSTOMS.value],
    "documenti_base": ["Letture mensili contatori"],
    "stages": [
        {
            "nome": "Preparazione Dichiarazione",
            "ordine": 1,
            "durata_giorni": 10,
            "tasks": [
                {
                    "nome": "Raccolta Dati Produzione",
                    "descrizione": "Lettura contatori e calcolo produzioni annuali",
                    "responsabile": "Tecnico",
                    "durata_giorni": 3,
                    "priorita": "Alta",
                    "documenti_richiesti": ["Letture mensili contatori UTF"],
                    "checkpoints": [
                        "Verifica letture mensili",
                        "Calcolo totali annuali",
                        "Validazione dati"
                    ]
                },
                {
                    "nome": "Generazione File EDI",
                    "descrizione": "Creazione file formato Idoc per invio telematico",
                    "responsabile": "Sistema",
                    "durata_giorni": 1,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.CUSTOMS.value,
                    "guide_config": {
                        "tipo": "generazione_edi",
                        "formato": "IDOC",
                        "template": "dichiarazione_annuale"
                    },
                    "checkpoints": [
                        "Formattazione dati Idoc",
                        "Generazione firma digitale",
                        "Validazione tracciato"
                    ],
                    "dipendenze": ["Raccolta Dati Produzione"]
                },
                {
                    "nome": "Invio System-to-System",
                    "descrizione": "Trasmissione file EDI tramite canale S2S",
                    "responsabile": "Sistema",
                    "durata_giorni": 1,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.CUSTOMS.value,
                    "integrazione": EntityEnum.CUSTOMS.value,
                    "tipo_pratica": "S2S",
                    "guide_config": {
                        "tipo": "invio_s2s",
                        "canale": "EDI",
                        "retry_max": 3
                    },
                    "checkpoints": [
                        "Connessione canale S2S",
                        "Upload file firmato",
                        "Conferma ricezione"
                    ],
                    "dipendenze": ["Generazione File EDI"]
                },
                {
                    "nome": "Pagamento Accise",
                    "descrizione": "Calcolo e pagamento accise su energia consumata",
                    "responsabile": "Amministrazione",
                    "durata_giorni": 5,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.CUSTOMS.value,
                    "documenti_richiesti": ["F24 accise"],
                    "checkpoints": [
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
        "potenza_minima": 20,
        "licenza_officina": "attiva"
    },
    "scadenza_config": {
        "scadenza_fissa": {
            "giorno": 31,
            "mese": 3
        },
        "alert_giorni": [30, 15, 7, 1],
        "penale_ritardo": True
    }
}

PAGAMENTO_CANONE_LICENZA = {
    "nome": "Pagamento Canone Annuale Licenza",
    "descrizione": "Pagamento canone annuale licenza officina elettrica",
    "categoria": WorkflowCategoryEnum.FISCAL,
    "tipo_impianto": "Tutti",
    "potenza_minima": 20,
    "potenza_massima": None,
    "durata_stimata_giorni": 5,
    "ricorrenza": "Annuale",
    "enti_richiesti": [EntityEnum.CUSTOMS.value],
    "stages": [
        {
            "nome": "Pagamento Canone",
            "ordine": 1,
            "durata_giorni": 5,
            "tasks": [
                {
                    "nome": "Calcolo Canone Dovuto",
                    "descrizione": "Determinazione importo canone annuale",
                    "responsabile": "Amministrazione",
                    "durata_giorni": 2,
                    "priorita": "Alta",
                    "checkpoints": [
                        "Verifica potenza impianto",
                        "Calcolo importo",
                        "Generazione F24"
                    ]
                },
                {
                    "nome": "Pagamento F24",
                    "descrizione": "Esecuzione pagamento tramite F24",
                    "responsabile": "Amministrazione",
                    "durata_giorni": 3,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.CUSTOMS.value,
                    "documenti_richiesti": ["Ricevuta pagamento F24"],
                    "checkpoints": [
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
        "potenza_minima": 20,
        "licenza_officina": "attiva"
    },
    "scadenza_config": {
        "scadenza_fissa": {
            "giorno": 16,
            "mese": 12
        },
        "alert_giorni": [30, 15, 7, 1],
        "penale_ritardo": True
    }
}

VERIFICA_PERIODICA_SPI = {
    "nome": "Verifica Periodica Sistema Protezione Interfaccia",
    "descrizione": "Verifica quinquennale del Sistema di Protezione di Interfaccia",
    "categoria": WorkflowCategoryEnum.MAINTENANCE,
    "tipo_impianto": "Tutti",
    "potenza_minima": 0,
    "potenza_massima": None,
    "durata_stimata_giorni": 30,
    "ricorrenza": "Quinquennale",
    "enti_richiesti": [EntityEnum.DSO.value],
    "stages": [
        {
            "nome": "Verifica SPI",
            "ordine": 1,
            "durata_giorni": 30,
            "tasks": [
                {
                    "nome": "Pianificazione Verifica",
                    "descrizione": "Pianificazione intervento con tecnico qualificato",
                    "responsabile": "Asset Manager",
                    "durata_giorni": 10,
                    "priorita": "Media",
                    "checkpoints": [
                        "Selezione tecnico qualificato",
                        "Pianificazione data",
                        "Notifica DSO"
                    ]
                },
                {
                    "nome": "Esecuzione Verifica",
                    "descrizione": "Verifica funzionale del Sistema di Protezione",
                    "responsabile": "Tecnico",
                    "durata_giorni": 5,
                    "priorita": "Alta",
                    "documenti_richiesti": [
                        "Report verifica SPI",
                        "Certificato conformità"
                    ],
                    "checkpoints": [
                        "Test funzionali",
                        "Compilazione report",
                        "Rilascio certificato"
                    ],
                    "dipendenze": ["Pianificazione Verifica"]
                },
                {
                    "nome": "Comunicazione Esito DSO",
                    "descrizione": "Invio certificazione verifica al DSO",
                    "responsabile": "Asset Manager",
                    "durata_giorni": 5,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.DSO.value,
                    "documenti_richiesti": ["Certificato verifica SPI"],
                    "checkpoints": [
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
        "ricorrenza": "ogni 5 anni"
    },
    "scadenza_config": {
        "calcolo": "data_ultima_verifica + 5 anni",
        "alert_giorni": [90, 60, 30, 15],
        "blocco_impianto": True
    }
}

# List of all renewable energy workflow templates
RENEWABLE_ENERGY_WORKFLOWS = [
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
        if workflow.get("potenza_minima") and potenza_kw < workflow["potenza_minima"]:
            continue
        if workflow.get("potenza_massima") and potenza_kw > workflow["potenza_massima"]:
            continue
            
        # Check plant type
        if workflow.get("tipo_impianto") != "Tutti" and workflow.get("tipo_impianto") != tipo_impianto:
            continue
            
        # Check activation conditions
        conditions = workflow.get("condizioni_attivazione", {})
        if conditions.get("stato_impianto") and conditions["stato_impianto"] != stato_impianto:
            continue
            
        applicable.append(workflow)
    
    return applicable
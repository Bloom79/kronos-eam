"""
Phase-based Workflow Templates for Renewable Energy Plants
Breaking down the monolithic workflow into modular phase-specific templates
"""

from app.models.workflow import WorkflowCategoryEnum, WorkflowPhaseEnum, EntityEnum

# Import connection request workflow templates
from app.data.connection_request_workflow import CONNECTION_REQUEST_WORKFLOW

# PHASE 1: PROGETTAZIONE TEMPLATES
PROGETTAZIONE_STANDARD = {
    "nome": "Progettazione Standard",
    "descrizione": "Percorso standard per progettazione e autorizzazione impianto",
    "categoria": WorkflowCategoryEnum.ACTIVATION,
    "phase": WorkflowPhaseEnum.DESIGN,
    "tipo_impianto": "Tutti",
    "potenza_minima": 0,
    "potenza_massima": None,
    "durata_stimata_giorni": 45,
    "enti_richiesti": [EntityEnum.MUNICIPALITY.value],
    "documenti_base": [
        "Documento identità titolare",
        "Titolo disponibilità sito",
        "Progetto definitivo impianto"
    ],
    "stages": [
        {
            "nome": "Progettazione e Autorizzazione",
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
                    ]
                }
            ]
        }
    ]
}

PROGETTAZIONE_CON_VINCOLI = {
    "nome": "Progettazione con Vincoli Paesaggistici",
    "descrizione": "Percorso completo incluso parere Soprintendenza per aree vincolate",
    "categoria": WorkflowCategoryEnum.ACTIVATION,
    "phase": WorkflowPhaseEnum.DESIGN,
    "tipo_impianto": "Tutti",
    "potenza_minima": 0,
    "potenza_massima": None,
    "durata_stimata_giorni": 75,
    "enti_richiesti": [EntityEnum.MUNICIPALITY.value, EntityEnum.SUPERINTENDENCE.value],
    "documenti_base": [
        "Documento identità titolare",
        "Titolo disponibilità sito",
        "Progetto definitivo impianto",
        "Relazione paesaggistica"
    ],
    "stages": [
        {
            "nome": "Progettazione e Autorizzazione con Vincoli",
            "ordine": 1,
            "durata_giorni": 75,
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
                    ]
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
                        "Elaborati grafici",
                        "Parere Soprintendenza"
                    ],
                    "dipendenze": ["Parere Soprintendenza"]
                }
            ]
        }
    ]
}

PROGETTAZIONE_SEMPLIFICATA = {
    "nome": "Progettazione Semplificata",
    "descrizione": "Percorso semplificato per piccoli impianti residenziali",
    "categoria": WorkflowCategoryEnum.ACTIVATION,
    "phase": WorkflowPhaseEnum.DESIGN,
    "tipo_impianto": "Fotovoltaico",
    "potenza_minima": 0,
    "potenza_massima": 20,
    "durata_stimata_giorni": 20,
    "enti_richiesti": [],
    "documenti_base": [
        "Documento identità titolare",
        "Titolo disponibilità sito"
    ],
    "stages": [
        {
            "nome": "Progettazione Semplificata",
            "ordine": 1,
            "durata_giorni": 20,
            "tasks": [
                {
                    "nome": "Progettazione Semplificata",
                    "descrizione": "Progetto semplificato per impianto residenziale",
                    "responsabile": "Progettista",
                    "durata_giorni": 10,
                    "priorita": "Media",
                    "documenti_richiesti": [
                        "Dimensionamento base",
                        "Schema unifilare semplificato"
                    ]
                },
                {
                    "nome": "Comunicazione Inizio Lavori",
                    "descrizione": "Semplice comunicazione per piccoli impianti",
                    "responsabile": "Asset Manager",
                    "durata_giorni": 10,
                    "priorita": "Media",
                    "documenti_richiesti": [
                        "Comunicazione inizio lavori"
                    ]
                }
            ]
        }
    ]
}

# PHASE 2: CONNESSIONE TEMPLATES
CONNESSIONE_DSO_STANDARD = {
    "nome": "Connessione DSO Standard",
    "descrizione": "Processo standard di connessione alla rete del distributore",
    "categoria": WorkflowCategoryEnum.ACTIVATION,
    "phase": WorkflowPhaseEnum.CONNECTION,
    "tipo_impianto": "Tutti",
    "potenza_minima": 0,
    "potenza_massima": None,
    "durata_stimata_giorni": 60,
    "enti_richiesti": [EntityEnum.DSO.value],
    "documenti_base": [
        "Progetto definitivo",
        "Autorizzazioni comunali"
    ],
    "stages": [
        {
            "nome": "Connessione alla Rete DSO",
            "ordine": 1,
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
                    ]
                },
                {
                    "nome": "Gestione TICA/STMC",
                    "descrizione": "Ricezione e valutazione Soluzione Tecnica Minima di Connessione",
                    "responsabile": "Tecnico",
                    "durata_giorni": 45,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.DSO.value,
                    "tipo_pratica": "TICA"
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
                    }
                }
            ]
        }
    ]
}

CONNESSIONE_SEMPLIFICATA = {
    "nome": "Connessione Semplificata",
    "descrizione": "Iter semplificato per impianti fotovoltaici ≤ 50kW",
    "categoria": WorkflowCategoryEnum.ACTIVATION,
    "phase": WorkflowPhaseEnum.CONNECTION,
    "tipo_impianto": "Fotovoltaico",
    "potenza_minima": 0,
    "potenza_massima": 50,
    "durata_stimata_giorni": 30,
    "enti_richiesti": [EntityEnum.DSO.value],
    "documenti_base": [
        "Progetto semplificato",
        "Comunicazione inizio lavori"
    ],
    "stages": [
        {
            "nome": "Connessione Semplificata",
            "ordine": 1,
            "durata_giorni": 30,
            "tasks": [
                {
                    "nome": "Richiesta Connessione Semplificata",
                    "descrizione": "Procedura accelerata per piccoli impianti",
                    "responsabile": "Asset Manager",
                    "durata_giorni": 3,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.DSO.value,
                    "tipo_pratica": "TICA Semplificata"
                },
                {
                    "nome": "Autoriz. Immediata DSO",
                    "descrizione": "Autorizzazione automatica per impianti standard",
                    "responsabile": "DSO",
                    "durata_giorni": 15,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.DSO.value
                },
                {
                    "nome": "Attivazione Rapida",
                    "descrizione": "Attivazione contatori in tempi ridotti",
                    "responsabile": "DSO",
                    "durata_giorni": 12,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.DSO.value
                }
            ]
        }
    ]
}

# E-DISTRIBUZIONE CONNECTION REQUEST TEMPLATES
# Extract phase 1 and 2 from CONNECTION_REQUEST_WORKFLOW
CONNESSIONE_EDIST_FASE1 = {
    "nome": "Domanda Connessione E-Distribuzione - Fase 1",
    "descrizione": "Fase 1: Raccolta documenti e richiesta connessione E-Distribuzione",
    "categoria": WorkflowCategoryEnum.ACTIVATION,
    "phase": WorkflowPhaseEnum.CONNECTION,
    "tipo_impianto": "Fotovoltaico",
    "potenza_minima": 0,
    "potenza_massima": None,
    "durata_stimata_giorni": 45,
    "enti_richiesti": [EntityEnum.DSO.value],
    "documenti_base": CONNECTION_REQUEST_WORKFLOW["documenti_base"],
    "stages": [CONNECTION_REQUEST_WORKFLOW["stages"][0]],  # FASE 1 only
    "template_documenti": CONNECTION_REQUEST_WORKFLOW.get("template_documenti", [])
}

CONNESSIONE_EDIST_FASE2 = {
    "nome": "Domanda Connessione E-Distribuzione - Fase 2",
    "descrizione": "Fase 2: Accettazione preventivo e documentazione tecnica",
    "categoria": WorkflowCategoryEnum.ACTIVATION,
    "phase": WorkflowPhaseEnum.CONNECTION,
    "tipo_impianto": "Fotovoltaico",
    "potenza_minima": 0,
    "potenza_massima": None,
    "durata_stimata_giorni": 45,
    "enti_richiesti": [EntityEnum.DSO.value],
    "documenti_base": [
        "Scheda Test Inverter",
        "Certificazione CEI 0-21",
        "Schema AS-BUILT",
        "Dichiarazione conformità"
    ],
    "stages": [CONNECTION_REQUEST_WORKFLOW["stages"][1]],  # FASE 2 only
    "condizioni": {
        "se": "iter != 'Semplificato'",
        "allora": "obbligatorio = true"
    }
}

# PHASE 3: REGISTRAZIONE TEMPLATES
REGISTRAZIONE_GAUDI_GSE = {
    "nome": "Registrazione GAUDÌ + GSE Completa",
    "descrizione": "Registrazione completa su GAUDÌ e attivazione servizi GSE",
    "categoria": WorkflowCategoryEnum.ACTIVATION,
    "phase": WorkflowPhaseEnum.REGISTRATION,
    "tipo_impianto": "Tutti",
    "potenza_minima": 0,
    "potenza_massima": None,
    "durata_stimata_giorni": 50,
    "enti_richiesti": [EntityEnum.TERNA.value, EntityEnum.GSE.value],
    "documenti_base": [
        "Codice POD attivo",
        "Dati tecnici impianto"
    ],
    "stages": [
        {
            "nome": "Registrazione GAUDÌ (Terna)",
            "ordine": 1,
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
                    "url_portale": "https://www.terna.it/gaudi"
                },
                {
                    "nome": "Inserimento Anagrafica Plant",
                    "descrizione": "Compilazione dati tecnici impianto su GAUDÌ",
                    "responsabile": "Asset Manager",
                    "durata_giorni": 3,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.TERNA.value,
                    "tipo_pratica": "GAUDÌ - Anagrafica"
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
                        "frequenza": "daily"
                    }
                }
            ]
        },
        {
            "nome": "Attivazione Servizi GSE",
            "ordine": 2,
            "durata_giorni": 30,
            "tasks": [
                {
                    "nome": "Accesso Area Clienti GSE",
                    "descrizione": "Login con SPID o credenziali + MFA",
                    "responsabile": "Asset Manager",
                    "durata_giorni": 1,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.GSE.value,
                    "url_portale": "https://areaclienti.gse.it"
                },
                {
                    "nome": "Attivazione Ritiro Dedicato (RID)",
                    "descrizione": "Richiesta convenzione Ritiro Dedicato per vendita energia",
                    "responsabile": "Asset Manager",
                    "durata_giorni": 10,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.GSE.value,
                    "tipo_pratica": "RID"
                },
                {
                    "nome": "Attivazione Scambio sul Posto (SSP)",
                    "descrizione": "Richiesta convenzione Scambio sul Posto",
                    "responsabile": "Asset Manager",
                    "durata_giorni": 10,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.GSE.value,
                    "tipo_pratica": "SSP",
                    "condizioni": {
                        "se": "potenza <= 500",
                        "allora": "disponibile = true"
                    }
                },
                {
                    "nome": "Dichiarazione Antimafia",
                    "descrizione": "Presentazione documentazione antimafia per incentivi > 150k€",
                    "responsabile": "Legale",
                    "durata_giorni": 15,
                    "priorita": "Media",
                    "ente_responsabile": EntityEnum.GSE.value,
                    "condizioni": {
                        "se": "valore_incentivi_annuo > 150000",
                        "allora": "obbligatorio = true"
                    }
                }
            ]
        }
    ]
}

REGISTRAZIONE_SOLO_GAUDI = {
    "nome": "Solo Registrazione GAUDÌ",
    "descrizione": "Registrazione solo su GAUDÌ senza servizi GSE",
    "categoria": WorkflowCategoryEnum.ACTIVATION,
    "phase": WorkflowPhaseEnum.REGISTRATION,
    "tipo_impianto": "Tutti",
    "potenza_minima": 0,
    "potenza_massima": None,
    "durata_stimata_giorni": 20,
    "enti_richiesti": [EntityEnum.TERNA.value],
    "stages": [
        {
            "nome": "Registrazione GAUDÌ",
            "ordine": 1,
            "durata_giorni": 20,
            "tasks": [
                {
                    "nome": "Registrazione Operatore GAUDÌ",
                    "descrizione": "Creazione account operatore/mandatario su portale GAUDÌ",
                    "responsabile": "Asset Manager",
                    "durata_giorni": 2,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.TERNA.value,
                    "url_portale": "https://www.terna.it/gaudi"
                },
                {
                    "nome": "Inserimento Anagrafica Plant",
                    "descrizione": "Compilazione dati tecnici impianto su GAUDÌ",
                    "responsabile": "Asset Manager",
                    "durata_giorni": 3,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.TERNA.value
                },
                {
                    "nome": "Monitoraggio Flussi Validazione",
                    "descrizione": "Verifica stato flussi G01, G02, G04 tra DSO e Terna",
                    "responsabile": "Sistema",
                    "durata_giorni": 15,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.TERNA.value
                }
            ]
        }
    ]
}

# PHASE 4: FISCALE TEMPLATES
FISCALE_COMPLETO = {
    "nome": "Denuncia Officina > 20kW",
    "descrizione": "Processo completo per denuncia officina elettrica (impianti > 20kW)",
    "categoria": WorkflowCategoryEnum.FISCAL,
    "phase": WorkflowPhaseEnum.FISCAL,
    "tipo_impianto": "Tutti",
    "potenza_minima": 20,
    "potenza_massima": None,
    "durata_stimata_giorni": 25,
    "enti_richiesti": [EntityEnum.CUSTOMS.value],
    "stages": [
        {
            "nome": "Denuncia Officina Elettrica",
            "ordine": 1,
            "durata_giorni": 25,
            "tasks": [
                {
                    "nome": "Preparazione Denuncia Officina",
                    "descrizione": "Compilazione moduli denuncia officina elettrica",
                    "responsabile": "Fiscalista",
                    "durata_giorni": 5,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.CUSTOMS.value,
                    "documenti_richiesti": [
                        "Dati tecnici impianto",
                        "Planimetria con contatori UTF",
                        "Schema unifilare fiscale"
                    ]
                },
                {
                    "nome": "Invio Telematico PUDM",
                    "descrizione": "Trasmissione denuncia tramite portale PUDM o EDI",
                    "responsabile": "Fiscalista",
                    "durata_giorni": 2,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.CUSTOMS.value,
                    "url_portale": "https://pudm.adm.gov.it"
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
                        "check_status": "daily"
                    }
                }
            ]
        }
    ]
}

FISCALE_COMPLIANCE_ANNUALE = {
    "nome": "Compliance Annuale",
    "descrizione": "Adempimenti fiscali ricorrenti per impianti in esercizio",
    "categoria": WorkflowCategoryEnum.FISCAL,
    "phase": WorkflowPhaseEnum.FISCAL,
    "tipo_impianto": "Tutti",
    "potenza_minima": 20,
    "potenza_massima": None,
    "durata_stimata_giorni": 15,
    "ricorrenza": "Annuale",
    "enti_richiesti": [EntityEnum.CUSTOMS.value],
    "stages": [
        {
            "nome": "Dichiarazioni e Pagamenti Annuali",
            "ordine": 1,
            "durata_giorni": 15,
            "tasks": [
                {
                    "nome": "Dichiarazione Annuale Consumo",
                    "descrizione": "Dichiarazione annuale di produzione e consumo energia",
                    "responsabile": "Fiscalista",
                    "durata_giorni": 10,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.CUSTOMS.value,
                    "scadenza_config": {
                        "scadenza_fissa": {"giorno": 31, "mese": 3}
                    }
                },
                {
                    "nome": "Pagamento Canone Licenza",
                    "descrizione": "Pagamento canone annuale licenza officina",
                    "responsabile": "Amministrazione",
                    "durata_giorni": 5,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.CUSTOMS.value,
                    "scadenza_config": {
                        "scadenza_fissa": {"giorno": 16, "mese": 12}
                    }
                }
            ]
        }
    ]
}

# Collect all phase-based templates
PHASE_BASED_TEMPLATES = {
    WorkflowPhaseEnum.DESIGN: [
        PROGETTAZIONE_STANDARD,
        PROGETTAZIONE_CON_VINCOLI,
        PROGETTAZIONE_SEMPLIFICATA
    ],
    WorkflowPhaseEnum.CONNECTION: [
        CONNESSIONE_DSO_STANDARD,
        CONNESSIONE_SEMPLIFICATA,
        CONNESSIONE_EDIST_FASE1,
        CONNESSIONE_EDIST_FASE2
    ],
    WorkflowPhaseEnum.REGISTRATION: [
        REGISTRAZIONE_GAUDI_GSE,
        REGISTRAZIONE_SOLO_GAUDI
    ],
    WorkflowPhaseEnum.FISCAL: [
        FISCALE_COMPLETO,
        FISCALE_COMPLIANCE_ANNUALE
    ]
}

# All templates in a flat list for compatibility
ALL_PHASE_TEMPLATES = []
for phase_templates in PHASE_BASED_TEMPLATES.values():
    ALL_PHASE_TEMPLATES.extend(phase_templates)

def get_templates_by_phase(phase: WorkflowPhaseEnum) -> list:
    """Get all templates for a specific phase"""
    return PHASE_BASED_TEMPLATES.get(phase, [])

def get_applicable_phase_templates(
    phase: WorkflowPhaseEnum,
    potenza_kw: float,
    tipo_impianto: str,
    area_vincolata: bool = False
) -> list:
    """Get applicable templates for a phase based on plant characteristics"""
    phase_templates = get_templates_by_phase(phase)
    applicable = []
    
    for template in phase_templates:
        # Check power requirements
        if template.get("potenza_minima") and potenza_kw < template["potenza_minima"]:
            continue
        if template.get("potenza_massima") and potenza_kw > template["potenza_massima"]:
            continue
            
        # Check plant type
        if template.get("tipo_impianto") != "Tutti" and template.get("tipo_impianto") != tipo_impianto:
            continue
            
        # Special logic for phase-specific requirements
        if phase == WorkflowPhaseEnum.DESIGN:
            # Suggest vincoli template for protected areas
            if area_vincolata and "Vincoli" in template["nome"]:
                applicable.insert(0, template)  # Priority
            elif not area_vincolata and "Vincoli" not in template["nome"]:
                applicable.append(template)
        else:
            applicable.append(template)
    
    return applicable
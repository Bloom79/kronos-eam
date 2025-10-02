"""
Phase-based Workflow Templates for Renewable Energy Plants
Breaking down the monolithic workflow into modular phase-specific templates
"""

from app.models.workflow import WorkflowCategoryEnum, WorkflowPhaseEnum, EntityEnum

# Import connection request workflow templates
from app.data.connection_request_workflow import CONNECTION_REQUEST_WORKFLOW

# PHASE 1: PROGETTAZIONE TEMPLATES
PROGETTAZIONE_STANDARD = {
    "name": "Progettazione Standard",
    "description": "Percorso standard per progettazione e autorizzazione impianto",
    "category": WorkflowCategoryEnum.ACTIVATION,
    "phase": WorkflowPhaseEnum.DESIGN,
    "plant_type": "Tutti",
    "min_power": 0,
    "max_power": None,
    "estimated_duration_days": 45,
    "required_entities": [EntityEnum.MUNICIPALITY.value],
    "base_documents": [
        "Documento identità titolare",
        "Titolo disponibilità sito",
        "Progetto definitivo impianto"
    ],
    "stages": [
        {
            "name": "Progettazione e Autorizzazione",
            "order": 1,
            "duration_days": 45,
            "tasks": [
                {
                    "name": "Progettazione Plant",
                    "description": "Sviluppo del progetto esecutivo da parte di un tecnico abilitato",
                    "assignee": "Progettista",
                    "duration_days": 15,
                    "priority": "Alta",
                    "required_documents": [
                        "Dimensionamento impianto",
                        "Scelta componenti",
                        "Schemi elettrici",
                        "Calcoli di produzione"
                    ]
                },
                {
                    "name": "Richiesta Titolo Autorizzativo",
                    "description": "Ottenimento permesso di costruire/SCIA dal Comune",
                    "assignee": "Asset Manager",
                    "duration_days": 30,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.MUNICIPALITY.value,
                    "practice_type": "Permesso Costruire/SCIA",
                    "required_documents": [
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
    "name": "Progettazione con Vincoli Paesaggistici",
    "description": "Percorso completo incluso parere Soprintendenza per aree vincolate",
    "category": WorkflowCategoryEnum.ACTIVATION,
    "phase": WorkflowPhaseEnum.DESIGN,
    "plant_type": "Tutti",
    "min_power": 0,
    "max_power": None,
    "estimated_duration_days": 75,
    "required_entities": [EntityEnum.MUNICIPALITY.value, EntityEnum.SUPERINTENDENCE.value],
    "base_documents": [
        "Documento identità titolare",
        "Titolo disponibilità sito",
        "Progetto definitivo impianto",
        "Relazione paesaggistica"
    ],
    "stages": [
        {
            "name": "Progettazione e Autorizzazione con Vincoli",
            "order": 1,
            "duration_days": 75,
            "tasks": [
                {
                    "name": "Progettazione Plant",
                    "description": "Sviluppo del progetto esecutivo da parte di un tecnico abilitato",
                    "assignee": "Progettista",
                    "duration_days": 15,
                    "priority": "Alta",
                    "required_documents": [
                        "Dimensionamento impianto",
                        "Scelta componenti",
                        "Schemi elettrici",
                        "Calcoli di produzione"
                    ]
                },
                {
                    "name": "Parere Soprintendenza",
                    "description": "Ottenimento parere per vincoli paesaggistici/storico-artistici",
                    "assignee": "Asset Manager",
                    "duration_days": 30,
                    "priority": "Media",
                    "responsible_entity": EntityEnum.SUPERINTENDENCE.value,
                    "practice_type": "Autorizzazione Paesaggistica",
                    "required_documents": [
                        "Relazione paesaggistica",
                        "Fotoinserimenti",
                        "Tavole di progetto"
                    ]
                },
                {
                    "name": "Richiesta Titolo Autorizzativo",
                    "description": "Ottenimento permesso di costruire/SCIA dal Comune",
                    "assignee": "Asset Manager",
                    "duration_days": 30,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.MUNICIPALITY.value,
                    "practice_type": "Permesso Costruire/SCIA",
                    "required_documents": [
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
    "name": "Progettazione Semplificata",
    "description": "Percorso semplificato per piccoli impianti residenziali",
    "category": WorkflowCategoryEnum.ACTIVATION,
    "phase": WorkflowPhaseEnum.DESIGN,
    "plant_type": "Fotovoltaico",
    "min_power": 0,
    "max_power": 20,
    "estimated_duration_days": 20,
    "required_entities": [],
    "base_documents": [
        "Documento identità titolare",
        "Titolo disponibilità sito"
    ],
    "stages": [
        {
            "name": "Progettazione Semplificata",
            "order": 1,
            "duration_days": 20,
            "tasks": [
                {
                    "name": "Progettazione Semplificata",
                    "description": "Progetto semplificato per impianto residenziale",
                    "assignee": "Progettista",
                    "duration_days": 10,
                    "priority": "Media",
                    "required_documents": [
                        "Dimensionamento base",
                        "Schema unifilare semplificato"
                    ]
                },
                {
                    "name": "Comunicazione Inizio Lavori",
                    "description": "Semplice comunicazione per piccoli impianti",
                    "assignee": "Asset Manager",
                    "duration_days": 10,
                    "priority": "Media",
                    "required_documents": [
                        "Comunicazione inizio lavori"
                    ]
                }
            ]
        }
    ]
}

# PHASE 2: CONNESSIONE TEMPLATES
CONNESSIONE_DSO_STANDARD = {
    "name": "Connessione DSO Standard",
    "description": "Processo standard di connessione alla rete del distributore",
    "category": WorkflowCategoryEnum.ACTIVATION,
    "phase": WorkflowPhaseEnum.CONNECTION,
    "plant_type": "Tutti",
    "min_power": 0,
    "max_power": None,
    "estimated_duration_days": 60,
    "required_entities": [EntityEnum.DSO.value],
    "base_documents": [
        "Progetto definitivo",
        "Autorizzazioni comunali"
    ],
    "stages": [
        {
            "name": "Connessione alla Rete DSO",
            "order": 1,
            "duration_days": 60,
            "tasks": [
                {
                    "name": "Richiesta di Connessione",
                    "description": "Invio richiesta di connessione al Distributore territorialmente competente",
                    "assignee": "Asset Manager",
                    "duration_days": 5,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.DSO.value,
                    "integrazione": EntityEnum.DSO.value,
                    "practice_type": "TICA",
                    "portal_url": "https://www.e-distribuzione.it/",
                    "required_documents": [
                        "Dati impianto",
                        "Potenza richiesta",
                        "Schema unifilare preliminare",
                        "Planimetria catastale"
                    ]
                },
                {
                    "name": "Gestione TICA/STMC",
                    "description": "Ricezione e valutazione Soluzione Tecnica Minima di Connessione",
                    "assignee": "Tecnico",
                    "duration_days": 45,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.DSO.value,
                    "practice_type": "TICA"
                },
                {
                    "name": "Accettazione e Pagamento TICA",
                    "description": "Accettazione preventivo e pagamento corrispettivi",
                    "assignee": "Amministrazione",
                    "duration_days": 5,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.DSO.value,
                    "required_documents": [
                        "Accettazione TICA firmata",
                        "Bonifico corrispettivi"
                    ]
                },
                {
                    "name": "Comunicazione Fine Lavori",
                    "description": "Invio documentazione di fine lavori per attivazione",
                    "assignee": "Tecnico",
                    "duration_days": 10,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.DSO.value,
                    "required_documents": [
                        "Regolamento di Esercizio",
                        "Dichiarazione conformità impianto",
                        "Dichiarazione conformità SPI",
                        "Certificato collaudo"
                    ]
                },
                {
                    "name": "Attivazione POD",
                    "description": "Allaccio fisico e attivazione contatori",
                    "assignee": "DSO",
                    "duration_days": 10,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.DSO.value,
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
    "name": "Connessione Semplificata",
    "description": "Iter semplificato per impianti fotovoltaici ≤ 50kW",
    "category": WorkflowCategoryEnum.ACTIVATION,
    "phase": WorkflowPhaseEnum.CONNECTION,
    "plant_type": "Fotovoltaico",
    "min_power": 0,
    "max_power": 50,
    "estimated_duration_days": 30,
    "required_entities": [EntityEnum.DSO.value],
    "base_documents": [
        "Progetto semplificato",
        "Comunicazione inizio lavori"
    ],
    "stages": [
        {
            "name": "Connessione Semplificata",
            "order": 1,
            "duration_days": 30,
            "tasks": [
                {
                    "name": "Richiesta Connessione Semplificata",
                    "description": "Procedura accelerata per piccoli impianti",
                    "assignee": "Asset Manager",
                    "duration_days": 3,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.DSO.value,
                    "practice_type": "TICA Semplificata"
                },
                {
                    "name": "Autoriz. Immediata DSO",
                    "description": "Autorizzazione automatica per impianti standard",
                    "assignee": "DSO",
                    "duration_days": 15,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.DSO.value
                },
                {
                    "name": "Attivazione Rapida",
                    "description": "Attivazione contatori in tempi ridotti",
                    "assignee": "DSO",
                    "duration_days": 12,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.DSO.value
                }
            ]
        }
    ]
}

# E-DISTRIBUZIONE CONNECTION REQUEST TEMPLATES
# Extract phase 1 and 2 from CONNECTION_REQUEST_WORKFLOW
CONNESSIONE_EDIST_FASE1 = {
    "name": "Domanda Connessione E-Distribuzione - Fase 1",
    "description": "Fase 1: Raccolta documenti e richiesta connessione E-Distribuzione",
    "category": WorkflowCategoryEnum.ACTIVATION,
    "phase": WorkflowPhaseEnum.CONNECTION,
    "plant_type": "Fotovoltaico",
    "min_power": 0,
    "max_power": None,
    "estimated_duration_days": 45,
    "required_entities": [EntityEnum.DSO.value],
    "base_documents": CONNECTION_REQUEST_WORKFLOW["base_documents"],
    "stages": [CONNECTION_REQUEST_WORKFLOW["stages"][0]],  # FASE 1 only
    "document_templates": CONNECTION_REQUEST_WORKFLOW.get("document_templates", [])
}

CONNESSIONE_EDIST_FASE2 = {
    "name": "Domanda Connessione E-Distribuzione - Fase 2",
    "description": "Fase 2: Accettazione preventivo e documentazione tecnica",
    "category": WorkflowCategoryEnum.ACTIVATION,
    "phase": WorkflowPhaseEnum.CONNECTION,
    "plant_type": "Fotovoltaico",
    "min_power": 0,
    "max_power": None,
    "estimated_duration_days": 45,
    "required_entities": [EntityEnum.DSO.value],
    "base_documents": [
        "Scheda Test Inverter",
        "Certificazione CEI 0-21",
        "Schema AS-BUILT",
        "Dichiarazione conformità"
    ],
    "stages": [CONNECTION_REQUEST_WORKFLOW["stages"][1]],  # FASE 2 only
    "conditions": {
        "se": "iter != 'Semplificato'",
        "allora": "obbligatorio = true"
    }
}

# PHASE 3: REGISTRAZIONE TEMPLATES
REGISTRAZIONE_GAUDI_GSE = {
    "name": "Registrazione GAUDÌ + GSE Completa",
    "description": "Registrazione completa su GAUDÌ e attivazione servizi GSE",
    "category": WorkflowCategoryEnum.ACTIVATION,
    "phase": WorkflowPhaseEnum.REGISTRATION,
    "plant_type": "Tutti",
    "min_power": 0,
    "max_power": None,
    "estimated_duration_days": 50,
    "required_entities": [EntityEnum.TERNA.value, EntityEnum.GSE.value],
    "base_documents": [
        "Codice POD attivo",
        "Dati tecnici impianto"
    ],
    "stages": [
        {
            "name": "Registrazione GAUDÌ (Terna)",
            "order": 1,
            "duration_days": 20,
            "tasks": [
                {
                    "name": "Registrazione Operatore GAUDÌ",
                    "description": "Creazione account operatore/mandatario su portale GAUDÌ",
                    "assignee": "Asset Manager",
                    "duration_days": 2,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.TERNA.value,
                    "integrazione": EntityEnum.TERNA.value,
                    "practice_type": "GAUDÌ",
                    "portal_url": "https://www.terna.it/gaudi"
                },
                {
                    "name": "Inserimento Anagrafica Plant",
                    "description": "Compilazione dati tecnici impianto su GAUDÌ",
                    "assignee": "Asset Manager",
                    "duration_days": 3,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.TERNA.value,
                    "practice_type": "GAUDÌ - Anagrafica"
                },
                {
                    "name": "Monitoraggio Flussi Validazione",
                    "description": "Verifica stato flussi G01, G02, G04 tra DSO e Terna",
                    "assignee": "Sistema",
                    "duration_days": 15,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.TERNA.value,
                    "guide_config": {
                        "tipo": "polling",
                        "frequenza": "daily"
                    }
                }
            ]
        },
        {
            "name": "Attivazione Servizi GSE",
            "order": 2,
            "duration_days": 30,
            "tasks": [
                {
                    "name": "Accesso Area Clienti GSE",
                    "description": "Login con SPID o credenziali + MFA",
                    "assignee": "Asset Manager",
                    "duration_days": 1,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.GSE.value,
                    "portal_url": "https://areaclienti.gse.it"
                },
                {
                    "name": "Attivazione Ritiro Dedicato (RID)",
                    "description": "Richiesta convenzione Ritiro Dedicato per vendita energia",
                    "assignee": "Asset Manager",
                    "duration_days": 10,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.GSE.value,
                    "practice_type": "RID"
                },
                {
                    "name": "Attivazione Scambio sul Posto (SSP)",
                    "description": "Richiesta convenzione Scambio sul Posto",
                    "assignee": "Asset Manager",
                    "duration_days": 10,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.GSE.value,
                    "practice_type": "SSP",
                    "conditions": {
                        "se": "potenza <= 500",
                        "allora": "disponibile = true"
                    }
                },
                {
                    "name": "Dichiarazione Antimafia",
                    "description": "Presentazione documentazione antimafia per incentivi > 150k€",
                    "assignee": "Legale",
                    "duration_days": 15,
                    "priority": "Media",
                    "responsible_entity": EntityEnum.GSE.value,
                    "conditions": {
                        "se": "valore_incentivi_annuo > 150000",
                        "allora": "obbligatorio = true"
                    }
                }
            ]
        }
    ]
}

REGISTRAZIONE_SOLO_GAUDI = {
    "name": "Solo Registrazione GAUDÌ",
    "description": "Registrazione solo su GAUDÌ senza servizi GSE",
    "category": WorkflowCategoryEnum.ACTIVATION,
    "phase": WorkflowPhaseEnum.REGISTRATION,
    "plant_type": "Tutti",
    "min_power": 0,
    "max_power": None,
    "estimated_duration_days": 20,
    "required_entities": [EntityEnum.TERNA.value],
    "stages": [
        {
            "name": "Registrazione GAUDÌ",
            "order": 1,
            "duration_days": 20,
            "tasks": [
                {
                    "name": "Registrazione Operatore GAUDÌ",
                    "description": "Creazione account operatore/mandatario su portale GAUDÌ",
                    "assignee": "Asset Manager",
                    "duration_days": 2,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.TERNA.value,
                    "portal_url": "https://www.terna.it/gaudi"
                },
                {
                    "name": "Inserimento Anagrafica Plant",
                    "description": "Compilazione dati tecnici impianto su GAUDÌ",
                    "assignee": "Asset Manager",
                    "duration_days": 3,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.TERNA.value
                },
                {
                    "name": "Monitoraggio Flussi Validazione",
                    "description": "Verifica stato flussi G01, G02, G04 tra DSO e Terna",
                    "assignee": "Sistema",
                    "duration_days": 15,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.TERNA.value
                }
            ]
        }
    ]
}

# PHASE 4: FISCALE TEMPLATES
FISCALE_COMPLETO = {
    "name": "Denuncia Officina > 20kW",
    "description": "Processo completo per denuncia officina elettrica (impianti > 20kW)",
    "category": WorkflowCategoryEnum.FISCAL,
    "phase": WorkflowPhaseEnum.FISCAL,
    "plant_type": "Tutti",
    "min_power": 20,
    "max_power": None,
    "estimated_duration_days": 25,
    "required_entities": [EntityEnum.CUSTOMS.value],
    "stages": [
        {
            "name": "Denuncia Officina Elettrica",
            "order": 1,
            "duration_days": 25,
            "tasks": [
                {
                    "name": "Preparazione Denuncia Officina",
                    "description": "Compilazione moduli denuncia officina elettrica",
                    "assignee": "Fiscalista",
                    "duration_days": 5,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.CUSTOMS.value,
                    "required_documents": [
                        "Dati tecnici impianto",
                        "Planimetria con contatori UTF",
                        "Schema unifilare fiscale"
                    ]
                },
                {
                    "name": "Invio Telematico PUDM",
                    "description": "Trasmissione denuncia tramite portale PUDM o EDI",
                    "assignee": "Fiscalista",
                    "duration_days": 2,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.CUSTOMS.value,
                    "portal_url": "https://pudm.adm.gov.it"
                },
                {
                    "name": "Ottenimento Licenza Esercizio",
                    "description": "Ricezione licenza officina elettrica da Agenzia Dogane",
                    "assignee": "Sistema",
                    "duration_days": 20,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.CUSTOMS.value,
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
    "name": "Compliance Annuale",
    "description": "Adempimenti fiscali ricorrenti per impianti in esercizio",
    "category": WorkflowCategoryEnum.FISCAL,
    "phase": WorkflowPhaseEnum.FISCAL,
    "plant_type": "Tutti",
    "min_power": 20,
    "max_power": None,
    "estimated_duration_days": 15,
    "recurrence": "Annuale",
    "required_entities": [EntityEnum.CUSTOMS.value],
    "stages": [
        {
            "name": "Dichiarazioni e Pagamenti Annuali",
            "order": 1,
            "duration_days": 15,
            "tasks": [
                {
                    "name": "Dichiarazione Annuale Consumo",
                    "description": "Dichiarazione annuale di produzione e consumo energia",
                    "assignee": "Fiscalista",
                    "duration_days": 10,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.CUSTOMS.value,
                    "deadline_config": {
                        "fixed_deadline": {"day": 31, "month": 3}
                    }
                },
                {
                    "name": "Pagamento Canone Licenza",
                    "description": "Pagamento canone annuale licenza officina",
                    "assignee": "Amministrazione",
                    "duration_days": 5,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.CUSTOMS.value,
                    "deadline_config": {
                        "fixed_deadline": {"day": 16, "month": 12}
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
        if template.get("min_power") and potenza_kw < template["min_power"]:
            continue
        if template.get("max_power") and potenza_kw > template["max_power"]:
            continue
            
        # Check plant type
        if template.get("plant_type") != "Tutti" and template.get("plant_type") != tipo_impianto:
            continue
            
        # Special logic for phase-specific requirements
        if phase == WorkflowPhaseEnum.DESIGN:
            # Suggest vincoli template for protected areas
            if area_vincolata and "Vincoli" in template["name"]:
                applicable.insert(0, template)  # Priority
            elif not area_vincolata and "Vincoli" not in template["name"]:
                applicable.append(template)
        else:
            applicable.append(template)
    
    return applicable
"""
Complete Solar Installation Workflow with all 9 phases
Based on 2025 Italian regulations and process guide
"""

from app.models.workflow import WorkflowCategoryEnum, EntityEnum

SOLAR_INSTALLATION_COMPLETE = {
    "name": "Installazione Completa Impianto Fotovoltaico",
    "description": "Processo completo dall'analisi iniziale all'attivazione finale, conforme alle normative italiane 2025",
    "category": WorkflowCategoryEnum.ACTIVATION,
    "workflow_purpose": "Complete Activation",
    "is_complete_workflow": True,
    "plant_type": "Fotovoltaico",
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
        "Visura camerale o codice fiscale",
        "Titolo disponibilità sito",
        "Planimetria catastale",
        "Preventivo installatore qualificato"
    ],
    "stages": [
        {
            "name": "Fase 1: Valutazione Preliminare e Preventivo",
            "order": 1,
            "duration_days": 10,
            "tasks": [
                {
                    "name": "Sopralluogo Tecnico",
                    "description": "Valutazione fattibilità tecnica e strutturale del sito",
                    "assignee": "Progettista",
                    "duration_days": 2,
                    "priority": "Alta",
                    "responsible_entity": "Interno",
                    "required_documents": [
                        "Planimetria tetto/terreno",
                        "Foto del sito",
                        "Dati catastali"
                    ],
                    "documents_to_generate": [
                        "Report sopralluogo tecnico",
                        "Valutazione ombreggiamenti",
                        "Verifica portata strutturale"
                    ],
                    "checklist_items": [
                        "Analisi esposizione e ombreggiamenti",
                        "Verifica portata minima 25 kg/m²",
                        "Rilievo fotografico completo",
                        "Identificazione punto consegna energia"
                    ],
                    "cost_amount": 150,
                    "cost_description": "Costo sopralluogo tecnico professionale"
                },
                {
                    "name": "Studio Producibilità",
                    "description": "Calcolo produzione attesa e analisi economica investimento",
                    "assignee": "Progettista",
                    "duration_days": 2,
                    "priority": "Alta",
                    "required_documents": [
                        "Bollette elettriche ultimi 12 mesi",
                        "Report sopralluogo"
                    ],
                    "documents_to_generate": [
                        "Studio producibilità con PVGIS",
                        "Analisi economica ROI",
                        "Piano ammortamento investimento"
                    ],
                    "checklist_items": [
                        "Calcolo producibilità annua (kWh/kWp)",
                        "Dimensionamento ottimale impianto",
                        "Calcolo tempo ritorno investimento",
                        "Verifica incentivi applicabili"
                    ]
                },
                {
                    "name": "Verifica Vincoli Urbanistici",
                    "description": "Controllo vincoli paesaggistici, storici o ambientali sull'immobile",
                    "assignee": "Asset Manager",
                    "duration_days": 3,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.MUNICIPALITY.value,
                    "portal_url": "http://vincoliinrete.beniculturali.it",
                    "required_documents": [
                        "Visura catastale aggiornata",
                        "Certificato destinazione urbanistica"
                    ],
                    "documents_to_generate": [
                        "Report verifica vincoli",
                        "Estratto cartografico vincoli",
                        "Determinazione iter autorizzativo"
                    ],
                    "checklist_items": [
                        "Consultazione Vincoli in Rete",
                        "Verifica PRG comunale",
                        "Check aree protette/SIC/ZPS",
                        "Definizione percorso autorizzativo (CILA/PAS/AU)"
                    ],
                    "conditions": {
                        "if": "presenza vincoli paesaggistici",
                        "then": "necessaria autorizzazione paesaggistica"
                    }
                },
                {
                    "name": "Preventivo Dettagliato",
                    "description": "Elaborazione preventivo tecnico-economico completo",
                    "assignee": "Installatore",
                    "duration_days": 3,
                    "priority": "Alta",
                    "required_documents": [
                        "Studio producibilità",
                        "Report vincoli"
                    ],
                    "documents_to_generate": [
                        "Preventivo dettagliato con voci separate",
                        "Schede tecniche componenti",
                        "Cronoprogramma installazione"
                    ],
                    "official_form_fields": {
                        "potenza_impianto_kwp": "Potenza totale in kWp",
                        "numero_moduli": "Quantità pannelli FV", 
                        "marca_moduli": "Produttore e modello moduli",
                        "numero_inverter": "Quantità e taglia inverter",
                        "costo_totale": "Importo complessivo €"
                    },
                    "checklist_items": [
                        "Dettaglio costi per componente",
                        "Inclusione oneri sicurezza",
                        "Definizione tempi realizzazione",
                        "Calcolo incentivi applicabili"
                    ]
                }
            ]
        },
        {
            "name": "Fase 2: Progettazione Esecutiva",
            "order": 2,
            "duration_days": 15,
            "tasks": [
                {
                    "name": "Progetto Elettrico Definitivo",
                    "description": "Redazione progetto elettrico completo firmato da professionista",
                    "assignee": "Progettista Elettrico",
                    "duration_days": 5,
                    "priority": "Alta",
                    "required_documents": [
                        "Preventivo approvato",
                        "Rilievo tecnico sito"
                    ],
                    "documents_to_generate": [
                        "Schema elettrico unifilare",
                        "Planimetria disposizione moduli",
                        "Relazione tecnica specialistica",
                        "Calcoli elettrici di dimensionamento"
                    ],
                    "checklist_items": [
                        "Schema unifilare quadri elettrici",
                        "Dimensionamento cavi e protezioni",
                        "Calcolo cadute tensione",
                        "Verifica selettività protezioni"
                    ],
                    "cost_amount": 800,
                    "cost_description": "Progettazione elettrica professionale"
                },
                {
                    "name": "Progetto Strutturale",
                    "description": "Verifica e progetto sistema ancoraggio moduli",
                    "assignee": "Ingegnere Strutturista",
                    "duration_days": 5,
                    "priority": "Media",
                    "required_documents": [
                        "Relazione portata copertura",
                        "Scheda tecnica strutture sostegno"
                    ],
                    "documents_to_generate": [
                        "Relazione calcolo strutturale",
                        "Elaborati grafici ancoraggi",
                        "Verifica azione vento/neve"
                    ],
                    "checklist_items": [
                        "Calcolo carichi permanenti",
                        "Verifica azione vento",
                        "Calcolo azione neve",
                        "Dimensionamento ancoraggi"
                    ],
                    "conditions": {
                        "if": "potenza > 50 kWp o installazione su tetto piano",
                        "then": "progetto strutturale obbligatorio"
                    }
                },
                {
                    "name": "Pratiche Sicurezza Cantiere",
                    "description": "Predisposizione documentazione sicurezza per cantiere",
                    "assignee": "Coordinatore Sicurezza",
                    "duration_days": 5,
                    "priority": "Alta",
                    "required_documents": [
                        "Progetto definitivo",
                        "Cronoprogramma lavori"
                    ],
                    "documents_to_generate": [
                        "POS - Piano Operativo Sicurezza",
                        "PSC se più imprese",
                        "Notifica preliminare ASL"
                    ],
                    "checklist_items": [
                        "Valutazione rischi specifici",
                        "Piano gestione emergenze",
                        "Formazione lavoratori",
                        "DPI necessari"
                    ],
                    "conditions": {
                        "if": "cantiere > 200 uomini-giorno",
                        "then": "PSC e CSE obbligatori"
                    }
                }
            ]
        },
        {
            "name": "Fase 3: Connessione Rete DSO",
            "order": 3,
            "duration_days": 60,
            "tasks": [
                {
                    "name": "Compilazione Modello Unico - Parte I",
                    "description": "Richiesta preventivo connessione tramite portale E-distribuzione",
                    "assignee": "Asset Manager",
                    "duration_days": 2,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.DSO.value,
                    "practice_type": "TICA",
                    "portal_url": "https://www.e-distribuzione.it/it/te-la-facciamo-semplice.html",
                    "portal_login_url": "https://private.e-distribuzione.it/",
                    "required_credentials": "Account E-distribuzione + OTP cellulare",
                    "required_documents": [
                        "Documento identità richiedente",
                        "Titolo disponibilità immobile",
                        "Schema unifilare preliminare",
                        "Planimetria con punto connessione"
                    ],
                    "documents_to_generate": [
                        "Codice pratica TICA",
                        "Ricevuta protocollazione",
                        "Preventivo TICA (entro 20gg lav)"
                    ],
                    "guide_config": {
                        "tipo": "step_by_step",
                        "portale": "e-distribuzione",
                        "sezione": "nuova_connessione"
                    },
                    "checklist_items": [
                        "Registrazione portale produttori",
                        "Compilazione dati impianto",
                        "Upload allegati tecnici",
                        "Invio e protocollazione pratica"
                    ],
                    "cost_amount": 122.50,
                    "cost_description": "Oneri istruttoria TICA 2025"
                },
                {
                    "name": "Simulatore Tecnico-Economico TICA",
                    "description": "Utilizzo simulatore online per stima costi connessione",
                    "assignee": "Progettista",
                    "duration_days": 1,
                    "priority": "Media",
                    "responsible_entity": EntityEnum.DSO.value,
                    "portal_url": "https://www.e-distribuzione.it/it/servizi/produttori/simulatore-di-connessione.html",
                    "required_documents": [],
                    "documents_to_generate": [
                        "Report simulazione TICA",
                        "Stima costi connessione",
                        "Configurazione ottimale connessione"
                    ],
                    "checklist_items": [
                        "Inserimento coordinate geografiche",
                        "Selezione potenza e tensione",
                        "Analisi risultati simulazione",
                        "Screenshot stima economica"
                    ]
                },
                {
                    "name": "Accettazione Preventivo TICA",
                    "description": "Valutazione e accettazione formale preventivo connessione",
                    "assignee": "Asset Manager",
                    "duration_days": 30,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.DSO.value,
                    "portal_url": "https://private.e-distribuzione.it/",
                    "required_documents": [
                        "Preventivo TICA ricevuto",
                        "Bonifico 30% corrispettivo"
                    ],
                    "documents_to_generate": [
                        "Accettazione TICA firmata",
                        "CRO bonifico acconto 30%",
                        "Modello Unico Parte II compilata"
                    ],
                    "checklist_items": [
                        "Analisi soluzione tecnica",
                        "Verifica costi connessione",
                        "Pagamento acconto 30%",
                        "Caricamento accettazione"
                    ],
                    "regulatory_deadline": "60 giorni da emissione",
                    "deadline_type": "peremptory",
                    "deadline_consequences": "Decadenza preventivo",
                    "cost_description": "Corrispettivo connessione (variabile)"
                },
                {
                    "name": "Comunicazione Inizio Lavori",
                    "description": "Notifica DSO per inizio lavori impianto",
                    "assignee": "Installatore",
                    "duration_days": 1,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.DSO.value,
                    "required_documents": [
                        "TICA accettato",
                        "Dichiarazione conformità impianto"
                    ],
                    "documents_to_generate": [
                        "Comunicazione inizio lavori",
                        "Nomina referente impianto"
                    ],
                    "checklist_items": [
                        "Data prevista inizio",
                        "Impresa esecutrice",
                        "Referente tecnico"
                    ]
                }
            ]
        },
        {
            "name": "Fase 4: Registrazione GAUDÌ Terna",
            "order": 4,
            "duration_days": 10,
            "tasks": [
                {
                    "name": "Registrazione Anagrafica GAUDÌ",
                    "description": "Censimento impianto nel sistema GAUDÌ di Terna",
                    "assignee": "Asset Manager",
                    "duration_days": 3,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.TERNA.value,
                    "practice_type": "GAUDÌ",
                    "portal_url": "https://myterna.terna.it/portal/portal/myterna/gaudi",
                    "portal_login_url": "https://myterna.terna.it/",
                    "required_credentials": "Account MyTerna (Certificato digitale o SPID)",
                    "required_documents": [
                        "Codice TICA/STMG",
                        "Dati tecnici impianto",
                        "Schema unifilare"
                    ],
                    "documents_to_generate": [
                        "Codice CENSIMP",
                        "UP (Unità di Produzione)",
                        "Scheda tecnica GAUDÌ"
                    ],
                    "official_form_fields": {
                        "sezione_impianto": "Sezione A per FV < 1MW",
                        "tecnologia": "Solare fotovoltaico",
                        "tipo_installazione": "Su edificio/A terra",
                        "data_entrata_esercizio": "Prevista attivazione"
                    },
                    "checklist_items": [
                        "Creazione impianto",
                        "Inserimento sezioni",
                        "Validazione dati tecnici",
                        "Ottenimento CENSIMP"
                    ]
                },
                {
                    "name": "Qualifica IAFR se Applicabile",
                    "description": "Richiesta qualifica IAFR per impianti in convenzione",
                    "assignee": "Asset Manager",
                    "duration_days": 7,
                    "priority": "Media",
                    "responsible_entity": EntityEnum.GSE.value,
                    "portal_url": "https://areaclienti.gse.it",
                    "required_documents": [
                        "CENSIMP attivo",
                        "Progetto definitivo"
                    ],
                    "documents_to_generate": [
                        "Certificato IAFR",
                        "Numero qualifica"
                    ],
                    "conditions": {
                        "if": "impianto accede a incentivi FER",
                        "then": "qualifica IAFR necessaria"
                    },
                    "checklist_items": [
                        "Verifica requisiti",
                        "Upload documentazione",
                        "Ottenimento qualifica"
                    ]
                }
            ]
        },
        {
            "name": "Fase 5: Autorizzazioni Edilizie",
            "order": 5,
            "duration_days": 45,
            "tasks": [
                {
                    "name": "Preparazione Pratica Edilizia",
                    "description": "Predisposizione documentazione per CILA/PAS/AU secondo caso",
                    "assignee": "Progettista",
                    "duration_days": 5,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.MUNICIPALITY.value,
                    "required_documents": [
                        "Progetto architettonico",
                        "Relazione tecnica",
                        "Elaborati grafici"
                    ],
                    "documents_to_generate": [
                        "Modulo CILA/PAS compilato",
                        "Asseverazione tecnico",
                        "Ricevuta diritti segreteria"
                    ],
                    "checklist_items": [
                        "Scelta procedura corretta",
                        "Completezza documentale",
                        "Asseverazioni necessarie",
                        "Calcolo oneri"
                    ],
                    "cost_amount": 150,
                    "cost_description": "Diritti segreteria comunali"
                },
                {
                    "name": "Presentazione Pratica Edilizia",
                    "description": "Invio pratica attraverso portale SUAP o SUE comunale",
                    "assignee": "Asset Manager",
                    "duration_days": 2,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.MUNICIPALITY.value,
                    "practice_type": "CILA/PAS/AU",
                    "portal_url": "Portale SUAP comunale",
                    "required_credentials": "SPID/CIE/CNS",
                    "required_documents": [
                        "Pratica completa",
                        "Marche bollo virtuali"
                    ],
                    "documents_to_generate": [
                        "Protocollo pratica",
                        "Ricevuta presentazione"
                    ],
                    "checklist_items": [
                        "Accesso portale SUAP",
                        "Upload documentazione",
                        "Pagamento oneri",
                        "Protocollazione"
                    ],
                    "regulatory_deadline": "CILA: immediata, PAS: 30gg silenzio assenso",
                    "cost_amount": 32,
                    "cost_description": "Marche bollo (2x16€)"
                },
                {
                    "name": "Comunicazione Fine Lavori",
                    "description": "Dichiarazione completamento opere al Comune",
                    "assignee": "Direttore Lavori",
                    "duration_days": 1,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.MUNICIPALITY.value,
                    "required_documents": [
                        "Certificato collaudo",
                        "As-built impianto"
                    ],
                    "documents_to_generate": [
                        "Comunicazione fine lavori",
                        "Certificato conformità edilizia"
                    ],
                    "checklist_items": [
                        "Completamento opere",
                        "Conformità al progetto",
                        "Comunicazione entro termini"
                    ],
                    "regulatory_deadline": "Entro validità titolo",
                    "deadline_consequences": "Sanzioni e sanatoria"
                }
            ]
        },
        {
            "name": "Fase 6: Installazione e Collaudo",
            "order": 6,
            "duration_days": 20,
            "tasks": [
                {
                    "name": "Installazione Impianto FV",
                    "description": "Esecuzione lavori installazione secondo progetto",
                    "assignee": "Installatore Qualificato",
                    "duration_days": 10,
                    "priority": "Alta",
                    "required_documents": [
                        "Progetto esecutivo",
                        "POS sicurezza"
                    ],
                    "documents_to_generate": [
                        "Registro presenze cantiere",
                        "Report avanzamento",
                        "Foto fasi installazione"
                    ],
                    "checklist_items": [
                        "Montaggio strutture sostegno",
                        "Posa moduli fotovoltaici",
                        "Cablaggio DC lato continua",
                        "Installazione inverter e quadri",
                        "Collegamenti AC lato alternata",
                        "Sistema monitoraggio"
                    ]
                },
                {
                    "name": "Prima Verifica e Test",
                    "description": "Verifiche funzionali pre-connessione",
                    "assignee": "Tecnico Verificatore",
                    "duration_days": 2,
                    "priority": "Alta",
                    "required_documents": [
                        "Schema as-built"
                    ],
                    "documents_to_generate": [
                        "Report verifiche elettriche",
                        "Test isolamento",
                        "Verifica continuità terre"
                    ],
                    "checklist_items": [
                        "Test isolamento DC > 1MΩ",
                        "Continuità conduttori protezione",
                        "Funzionalità protezioni interfaccia",
                        "Test comunicazione inverter"
                    ]
                },
                {
                    "name": "Dichiarazione Conformità",
                    "description": "Rilascio DiCo secondo DM 37/08",
                    "assignee": "Installatore Abilitato",
                    "duration_days": 1,
                    "priority": "Alta",
                    "required_documents": [
                        "Verifiche completate",
                        "Certificati componenti"
                    ],
                    "documents_to_generate": [
                        "Dichiarazione Conformità DM37/08",
                        "Allegati obbligatori DiCo",
                        "Registro apparecchiature"
                    ],
                    "checklist_items": [
                        "Compilazione modulo ministeriale",
                        "Allegati tecnici completi",
                        "Firma installatore abilitato",
                        "Consegna a committente"
                    ]
                }
            ]
        },
        {
            "name": "Fase 7: Attivazione e Connessione",
            "order": 7,
            "duration_days": 15,
            "tasks": [
                {
                    "name": "Richiesta Attivazione Connessione",
                    "description": "Comunicazione fine lavori e richiesta attivazione a DSO",
                    "assignee": "Asset Manager",
                    "duration_days": 2,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.DSO.value,
                    "portal_url": "https://private.e-distribuzione.it/",
                    "required_documents": [
                        "Modello Unico Parte II",
                        "Dichiarazione Conformità",
                        "Certificato collaudo",
                        "Regolamento esercizio firmato"
                    ],
                    "documents_to_generate": [
                        "Richiesta attivazione",
                        "Data proposta collaudo"
                    ],
                    "checklist_items": [
                        "Upload documentazione tecnica",
                        "Firma digitale regolamento",
                        "Proposta date collaudo",
                        "Pagamento saldo connessione"
                    ],
                    "cost_description": "Saldo 70% corrispettivo connessione"
                },
                {
                    "name": "Collaudo DSO e Installazione Contatore",
                    "description": "Verifica tecnica DSO e installazione contatore bidirezionale",
                    "assignee": "Tecnico DSO + Installatore",
                    "duration_days": 10,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.DSO.value,
                    "required_documents": [
                        "Presenza documentazione in sito"
                    ],
                    "documents_to_generate": [
                        "Verbale collaudo DSO",
                        "Configurazione contatore",
                        "Codice POD definitivo"
                    ],
                    "checklist_items": [
                        "Verifica protezione interfaccia",
                        "Test apertura DDI",
                        "Installazione contatore 2G",
                        "Configurazione misura bidirezionale",
                        "Sigillatura contatore"
                    ],
                    "requires_site_inspection": True,
                    "human_checkpoint_notes": "Presenza obbligatoria installatore"
                },
                {
                    "name": "Attivazione Fornitura Energia",
                    "description": "Attivazione contratto fornitura/scambio con trader",
                    "assignee": "Asset Manager",
                    "duration_days": 3,
                    "priority": "Alta",
                    "required_documents": [
                        "POD attivo",
                        "Verbale attivazione"
                    ],
                    "documents_to_generate": [
                        "Contratto fornitura energia",
                        "Attivazione servizio scambio"
                    ],
                    "checklist_items": [
                        "Scelta regime (SSP/RID)",
                        "Sottoscrizione contratto",
                        "Comunicazione POD a trader"
                    ]
                }
            ]
        },
        {
            "name": "Fase 8: Convenzioni GSE",
            "order": 8,
            "duration_days": 30,
            "tasks": [
                {
                    "name": "Scelta Regime Commerciale",
                    "description": "Valutazione e scelta tra Scambio Sul Posto o Ritiro Dedicato",
                    "assignee": "Asset Manager",
                    "duration_days": 3,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.GSE.value,
                    "required_documents": [
                        "Analisi consumi",
                        "Producibilità attesa"
                    ],
                    "documents_to_generate": [
                        "Analisi comparativa SSP vs RID",
                        "Raccomandazione regime ottimale"
                    ],
                    "checklist_items": [
                        "Analisi autoconsumo previsto",
                        "Valutazione economica regimi",
                        "Scelta regime più conveniente"
                    ],
                    "conditions": {
                        "if": "autoconsumo > 70%",
                        "then": "SSP generalmente più conveniente"
                    }
                },
                {
                    "name": "Richiesta Convenzione SSP/RID",
                    "description": "Presentazione istanza convenzione scelta con GSE",
                    "assignee": "Asset Manager",
                    "duration_days": 5,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.GSE.value,
                    "practice_type": "SSP o RID",
                    "portal_url": "https://areaclienti.gse.it",
                    "portal_login_url": "https://areaclienti.gse.it",
                    "required_credentials": "SPID Azienda/Persona + Delega",
                    "required_documents": [
                        "CENSIMP validato",
                        "POD attivo",
                        "Dichiarazione Conformità",
                        "Schema unifilare as-built"
                    ],
                    "documents_to_generate": [
                        "Numero pratica GSE",
                        "Convenzione sottoscritta",
                        "Codice contratto GSE"
                    ],
                    "checklist_items": [
                        "Compilazione istanza online",
                        "Upload allegati richiesti",
                        "Firma digitale convenzione",
                        "Invio e protocollazione"
                    ],
                    "regulatory_deadline": "90 giorni da connessione",
                    "deadline_consequences": "Perdita diritto convenzione"
                },
                {
                    "name": "Comunicazione Dati Bancari",
                    "description": "Registrazione IBAN per pagamenti GSE",
                    "assignee": "Amministrazione",
                    "duration_days": 2,
                    "priority": "Media",
                    "responsible_entity": EntityEnum.GSE.value,
                    "portal_url": "https://areaclienti.gse.it",
                    "required_documents": [
                        "Documento attestazione IBAN"
                    ],
                    "documents_to_generate": [
                        "Conferma registrazione IBAN"
                    ],
                    "checklist_items": [
                        "Verifica intestazione conto",
                        "Upload attestazione banca",
                        "Validazione GSE"
                    ]
                },
                {
                    "name": "Dichiarazione Antimafia (se richiesta)",
                    "description": "Presentazione documentazione antimafia per incentivi > 150k€",
                    "assignee": "Legale Rappresentante",
                    "duration_days": 20,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.GSE.value,
                    "required_documents": [
                        "Visura camerale aggiornata",
                        "Dichiarazione sostitutiva familiari"
                    ],
                    "documents_to_generate": [
                        "White list prefettura",
                        "Comunicazione antimafia"
                    ],
                    "conditions": {
                        "if": "valore incentivi totali > 150.000€",
                        "then": "documentazione antimafia obbligatoria"
                    },
                    "checklist_items": [
                        "Raccolta dati familiari conviventi",
                        "Compilazione modulistica",
                        "Richiesta white list",
                        "Invio a GSE"
                    ]
                }
            ]
        },
        {
            "name": "Fase 9: Adempimenti Fiscali",
            "order": 9,
            "duration_days": 30,
            "tasks": [
                {
                    "name": "Denuncia Officina Elettrica (> 20 kW)",
                    "description": "Apertura officina elettrica presso Agenzia Dogane",
                    "assignee": "Asset Manager",
                    "duration_days": 20,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.CUSTOMS.value,
                    "practice_type": "Licenza officina",
                    "portal_url": "https://www.adm.gov.it/portale/lagenzia/amministrazione-trasparente/servizi-online",
                    "portal_login_url": "https://telematici.adm.gov.it/",
                    "required_credentials": "SPID/CNS + Firma Digitale",
                    "required_documents": [
                        "Planimetria officina elettrica",
                        "Schema unifilare timbrato",
                        "Verbale attivazione DSO"
                    ],
                    "documents_to_generate": [
                        "Codice ditta assegnato",
                        "Licenza officina elettrica",
                        "Registro UTF vidimato"
                    ],
                    "conditions": {
                        "if": "potenza impianto > 20 kWp",
                        "then": "denuncia officina obbligatoria"
                    },
                    "checklist_items": [
                        "Compilazione modello AD-1",
                        "Predisposizione planimetria UTF",
                        "Vidimazione registro UTF",
                        "Ottenimento licenza"
                    ],
                    "cost_amount": 77.47,
                    "cost_description": "Diritti annuali officina < 100kW"
                },
                {
                    "name": "Variazione Catastale",
                    "description": "Aggiornamento rendita catastale per impianto FV",
                    "assignee": "Tecnico Catastale",
                    "duration_days": 10,
                    "priority": "Media",
                    "responsible_entity": "Agenzia Entrate",
                    "portal_url": "https://sister.agenziaentrate.gov.it",
                    "required_documents": [
                        "DOCFA aggiornato"
                    ],
                    "documents_to_generate": [
                        "Ricevuta variazione catastale",
                        "Nuova rendita"
                    ],
                    "checklist_items": [
                        "Predisposizione DOCFA",
                        "Invio telematico",
                        "Aggiornamento rendita"
                    ],
                    "regulatory_deadline": "30 giorni da fine lavori",
                    "cost_amount": 50,
                    "cost_description": "Diritti catastali"
                },
                {
                    "name": "Comunicazione Enea (Bonus Casa)",
                    "description": "Invio pratica ENEA per detrazioni fiscali 50%",
                    "assignee": "Asset Manager",
                    "duration_days": 2,
                    "priority": "Alta",
                    "portal_url": "https://bonusfiscali.enea.it",
                    "required_documents": [
                        "Scheda tecnica impianto",
                        "Fatture e bonifici"
                    ],
                    "documents_to_generate": [
                        "Ricevuta invio ENEA",
                        "Codice CPID pratica"
                    ],
                    "conditions": {
                        "if": "persona fisica con bonus ristrutturazione",
                        "then": "comunicazione ENEA obbligatoria"
                    },
                    "checklist_items": [
                        "Compilazione scheda tecnica",
                        "Upload documentazione",
                        "Invio entro 90gg"
                    ],
                    "regulatory_deadline": "90 giorni da fine lavori",
                    "deadline_consequences": "Perdita detrazione fiscale"
                }
            ]
        }
    ]
}

# Export for use in workflow system
COMPLETE_SOLAR_WORKFLOWS = [
    SOLAR_INSTALLATION_COMPLETE
]
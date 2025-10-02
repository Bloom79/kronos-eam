"""
Connection Request Workflow Template for E-Distribuzione
Based on Italian DSO connection procedures for renewable energy plants
"""

from app.models.workflow import WorkflowCategoryEnum, EntityEnum

CONNECTION_REQUEST_WORKFLOW = {
    "name": "Domanda di Connessione E-Distribuzione",
    "description": "Processo completo per la richiesta di connessione alla rete E-Distribuzione",
    "category": WorkflowCategoryEnum.ACTIVATION,
    "plant_type": "Fotovoltaico",
    "min_power": 0,
    "max_power": None,
    "estimated_duration_days": 90,
    "recurrence": "Una tantum",
    "required_entities": [EntityEnum.DSO.value],
    "base_documents": [
        "Progetto e Schema Unifilare",
        "Documento identità intestatario",
        "Ultima bolletta elettrica",
        "Mappa catastale",
        "Codice IBAN"
    ],
    "stages": [
        {
            "name": "FASE 1 - DOMANDA DI CONNESSIONE",
            "order": 1,
            "duration_days": 45,
            "tasks": [
                {
                    "name": "Raccolta Documenti Tecnici",
                    "description": "Raccolta della documentazione tecnica dell'impianto",
                    "assignee": "Progettista",
                    "duration_days": 5,
                    "priority": "Alta",
                    "required_documents": [
                        "Progetto e Schema Unifilare dell'impianto (firmato da tecnico abilitato)",
                        "Disposizione moduli fotovoltaici",
                        "Schema inverter e quadri elettrici",
                        "Schema collegamenti elettrici"
                    ],
                    "checklist_items": [
                        "Verifica firma tecnico abilitato",
                        "Controllo completezza progetto",
                        "Validazione schema unifilare"
                    ],
                    "note": "Tutti i documenti tecnici devono essere firmati da professionista abilitato",
                    "official_form_fields": {
                        "progettista_nome": "Nome e cognome progettista",
                        "progettista_albo": "Numero iscrizione albo professionale",
                        "progettista_provincia": "Provincia albo",
                        "potenza_impianto_kwp": "Potenza nominale impianto",
                        "n_moduli": "Numero moduli fotovoltaici",
                        "n_inverter": "Numero inverter"
                    },
                    "requires_physical_signature": True
                },
                {
                    "name": "Raccolta Documentazione Anagrafica e Catastale",
                    "description": "Raccolta documenti anagrafici e catastali del richiedente",
                    "assignee": "Asset Manager",
                    "duration_days": 3,
                    "priority": "Alta",
                    "required_documents": [
                        "Copia ultima bolletta elettrica",
                        "Documento identità intestatario (fronte/retro)",
                        "Mappa catastale (rilascio non anteriore a 6 mesi)",
                        "Codice IBAN per accrediti"
                    ],
                    "checklist_items": [
                        "Verifica validità documento identità",
                        "Controllo data rilascio mappa catastale",
                        "Validazione IBAN"
                    ],
                    "validazioni": {
                        "mappa_catastale_max_giorni": 180
                    }
                },
                {
                    "name": "Inserimento Anagrafica Produttore su Portale E-Dist",
                    "description": "Registrazione anagrafica del produttore sul portale E-Distribuzione",
                    "assignee": "Asset Manager",
                    "duration_days": 2,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.DSO.value,
                    "integrazione": EntityEnum.DSO.value,
                    "practice_type": "Anagrafica Produttore",
                    "portal_url": "https://www.e-distribuzione.it/a-chi-ci-rivolgiamo/produttori.html",
                    "portal_login_url": "https://www.e-distribuzione.it/area-riservata",
                    "required_credentials": "Email registration",
                    "required_documents": [
                        "Copia ultima bolletta elettrica",
                        "Documento identità intestatario",
                        "Mappa catastale",
                        "Codice IBAN"
                    ],
                    "checklist_items": [
                        "Accesso portale E-Distribuzione",
                        "Inserimento dati anagrafici",
                        "Upload documentazione",
                        "Conferma registrazione"
                    ],
                    "submission_method": "Portal upload",
                    "official_form_fields": {
                        "produttore_denominazione": "Denominazione/Ragione sociale",
                        "produttore_cf_piva": "Codice fiscale/P.IVA",
                        "produttore_indirizzo": "Indirizzo sede legale",
                        "produttore_pec": "Indirizzo PEC",
                        "produttore_telefono": "Telefono",
                        "rappresentante_legale": "Nome rappresentante legale"
                    }
                },
                {
                    "name": "Inserimento Anagrafica Plant",
                    "description": "Inserimento dati tecnici dell'impianto sul portale",
                    "assignee": "Asset Manager",
                    "duration_days": 2,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.DSO.value,
                    "integrazione": EntityEnum.DSO.value,
                    "practice_type": "Anagrafica Plant",
                    "required_documents": [
                        "Dati tecnici impianto",
                        "Coordinate geografiche",
                        "POD di riferimento (se esistente)"
                    ],
                    "checklist_items": [
                        "Inserimento potenza nominale",
                        "Inserimento dati ubicazione",
                        "Selezione tipologia connessione"
                    ],
                    "dipendenze": ["Inserimento Anagrafica Produttore su Portale E-Dist"]
                },
                {
                    "name": "Generazione e Gestione Mandato di Rappresentanza",
                    "description": "Generazione del mandato dal portale e invio per firma",
                    "assignee": "Asset Manager",
                    "duration_days": 5,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.DSO.value,
                    "required_documents": [
                        "Mandato di Rappresentanza (template da portale)"
                    ],
                    "checklist_items": [
                        "Download mandato dal portale E-Distribuzione",
                        "Invio mandato per firma (EPC o Proprietario)",
                        "Ricezione mandato firmato",
                        "Caricamento mandato firmato su piattaforma"
                    ],
                    "note": "Il mandato è obbligatorio se la pratica è gestita da terzi",
                    "dipendenze": ["Inserimento Anagrafica Plant"]
                },
                {
                    "name": "Generazione Modello Unico Parte 1",
                    "description": "Generazione e compilazione del Modello Unico Parte 1",
                    "assignee": "Asset Manager",
                    "duration_days": 3,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.DSO.value,
                    "practice_type": "Modello Unico",
                    "checklist_items": [
                        "Compilazione sezione anagrafica",
                        "Compilazione sezione tecnica",
                        "Verifica completezza",
                        "Invio tramite portale"
                    ],
                    "dipendenze": ["Generazione e Gestione Mandato di Rappresentanza"],
                    "documenti_generati": ["Modello_Unico_Parte_1.pdf"]
                },
                {
                    "name": "Pagamento Corrispettivo Preventivo",
                    "description": "Pagamento del corrispettivo per ottenimento preventivo",
                    "assignee": "Amministrazione",
                    "duration_days": 2,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.DSO.value,
                    "required_documents": [
                        "Ricevuta pagamento corrispettivo"
                    ],
                    "costi": {
                        "fino_6_kw": {"importo": 30, "iva": 22, "totale": 36.60},
                        "da_6_a_10_kw": {"importo": 50, "iva": 22, "totale": 61.00},
                        "da_10_a_50_kw": {"importo": 100, "iva": 22, "totale": 122.00},
                        "da_50_a_100_kw": {"importo": 200, "iva": 22, "totale": 244.00},
                        "da_100_a_500_kw": {"importo": 500, "iva": 22, "totale": 610.00},
                        "da_500_a_1000_kw": {"importo": 1500, "iva": 22, "totale": 1830.00},
                        "oltre_1000_kw": {"importo": 2500, "iva": 22, "totale": 3050.00}
                    },
                    "checklist_items": [
                        "Calcolo importo in base alla potenza",
                        "Esecuzione bonifico",
                        "Upload ricevuta pagamento"
                    ],
                    "payment_method": "Bonifico bancario",
                    "payment_reference": "Codice pratica connessione",
                    "documents_to_generate": ["Ricevuta pagamento con causale specifica"]
                },
                {
                    "name": "Attesa e Ricezione Preventivo TICA",
                    "description": "Attesa preventivo di connessione dal DSO",
                    "assignee": "Sistema",
                    "duration_days": 20,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.DSO.value,
                    "automazione_config": {
                        "tipo": "monitoraggio",
                        "check_status": "daily",
                        "alert_giorni_rimanenti": [10, 5, 1]
                    },
                    "checklist_items": [
                        "Monitoraggio stato pratica",
                        "Ricezione notifica preventivo",
                        "Download preventivo TICA"
                    ],
                    "scadenza": {
                        "giorni": 30,
                        "tipo": "lavorativi",
                        "nota": "Tempo massimo per ricezione preventivo da DSO"
                    },
                    "regulatory_deadline": "30 giorni lavorativi dalla richiesta",
                    "deadline_type": "ordinario",
                    "documents_to_generate": [
                        "TICA preventivo con codice univoco",
                        "Dettaglio costi connessione",
                        "Soluzione tecnica di connessione"
                    ],
                    "external_protocol_number": "Codice TICA"
                }
            ]
        },
        {
            "name": "FASE 2 - ACCETTAZIONE PREVENTIVO",
            "order": 2,
            "duration_days": 45,
            "conditions": {
                "if": "iter != 'Semplificato'",
                "then": "obbligatorio = true"
            },
            "tasks": [
                {
                    "name": "Raccolta Documentazione Tecnica Inverter",
                    "description": "Raccolta schede tecniche e certificazioni inverter",
                    "assignee": "Installatore",
                    "duration_days": 5,
                    "priority": "Alta",
                    "required_documents": [
                        "Scheda Test Inverter",
                        "Test report con parametri di funzionamento",
                        "Numero matricola e version firmware",
                        "Certificazione conformità CEI 0-21"
                    ],
                    "checklist_items": [
                        "Verifica completezza test report",
                        "Controllo validità certificazione CEI",
                        "Registrazione numeri seriali"
                    ]
                },
                {
                    "name": "Compilazione Regolamento di Esercizio",
                    "description": "Compilazione del regolamento di esercizio con DSO",
                    "assignee": "Tecnico",
                    "duration_days": 5,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.DSO.value,
                    "required_documents": [
                        "Dati tecnici impianto completi",
                        "Parametri di protezione interfaccia",
                        "Schema unifilare AS-BUILT aggiornato"
                    ],
                    "checklist_items": [
                        "Download template regolamento",
                        "Compilazione sezioni tecniche",
                        "Verifica parametri protezione",
                        "Validazione schema AS-BUILT"
                    ],
                    "template_documento": "regolamento_esercizio_template.docx",
                    "portal_url": "Scaricabile da portale dopo accettazione TICA",
                    "official_form_fields": {
                        "parametri_protezione": {
                            "tensione_max_V": "Soglia massima tensione (V)",
                            "tensione_min_V": "Soglia minima tensione (V)",
                            "frequenza_max_Hz": "Soglia massima frequenza (Hz)",
                            "frequenza_min_Hz": "Soglia minima frequenza (Hz)",
                            "tempo_intervento_ms": "Tempo intervento (ms)"
                        },
                        "responsabile_esercizio": "Nome responsabile esercizio impianto",
                        "telefono_emergenza": "Telefono reperibilità H24"
                    },
                    "requires_physical_signature": True
                },
                {
                    "name": "Raccolta Dati Installatore",
                    "description": "Compilazione dati azienda installatrice",
                    "assignee": "Installatore",
                    "duration_days": 3,
                    "priority": "Media",
                    "required_documents": [
                        "Dati azienda installatrice",
                        "Abilitazioni e certificazioni",
                        "Riferimenti tecnico responsabile",
                        "Procura gestore pratiche"
                    ],
                    "checklist_items": [
                        "Verifica abilitazioni DM 37/08",
                        "Controllo validità certificazioni",
                        "Compilazione modulo dati"
                    ],
                    "template_documento": "dati_installatore_template.pdf"
                },
                {
                    "name": "Dichiarazione di Conformità Plant",
                    "description": "Emissione dichiarazione di conformità DM 37/08",
                    "assignee": "Installatore",
                    "duration_days": 2,
                    "priority": "Alta",
                    "required_documents": [
                        "Dichiarazione di conformità impianto (DM 37/08)",
                        "Allegati obbligatori dichiarazione"
                    ],
                    "checklist_items": [
                        "Compilazione dichiarazione",
                        "Preparazione allegati tecnici",
                        "Firma e timbro installatore",
                        "Verifica completezza"
                    ],
                    "regulatory_references": ["DM 37/08"]
                },
                {
                    "name": "Documentazione Fotografica Plant",
                    "description": "Raccolta foto dettagliate dell'impianto realizzato",
                    "assignee": "Installatore",
                    "duration_days": 1,
                    "priority": "Media",
                    "required_documents": [
                        "Foto moduli fotovoltaici installati",
                        "Foto inverter con targhetta visibile",
                        "Foto quadri elettrici e protezioni",
                        "Foto sistema di accumulo (se presente)",
                        "Foto contatore di produzione"
                    ],
                    "checklist_items": [
                        "Verifica qualità immagini",
                        "Controllo visibilità targhette",
                        "Completezza documentazione",
                        "Organizzazione per tipologia"
                    ],
                    "specifiche_foto": {
                        "risoluzione_minima": "1920x1080",
                        "formato": "JPG/PNG",
                        "dimensione_max_mb": 5
                    }
                },
                {
                    "name": "Accettazione Preventivo TICA",
                    "description": "Accettazione formale del preventivo di connessione",
                    "assignee": "Asset Manager",
                    "duration_days": 5,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.DSO.value,
                    "required_documents": [
                        "Modulo accettazione TICA firmato",
                        "Ricevuta pagamento accettazione"
                    ],
                    "checklist_items": [
                        "Analisi economica preventivo",
                        "Firma accettazione",
                        "Pagamento corrispettivo",
                        "Invio accettazione al DSO"
                    ],
                    "scadenza": {
                        "giorni": 45,
                        "tipo": "perentoria",
                        "azione_default": "decadenza preventivo"
                    },
                    "regulatory_deadline": "45 giorni lavorativi dal ricevimento",
                    "deadline_type": "peremptory",
                    "deadline_consequences": "Decadenza automatica del preventivo TICA. Necessario riavviare la procedura di connessione",
                    "requires_physical_signature": True,
                    "payment_method": "Bonifico con causale specifica",
                    "documents_to_generate": ["Modulo accettazione TICA compilato"],
                    "submission_method": "PEC o portale"
                },
                {
                    "name": "Caricamento Documentazione Completa",
                    "description": "Upload di tutta la documentazione sul portale DSO",
                    "assignee": "Asset Manager",
                    "duration_days": 2,
                    "priority": "Alta",
                    "responsible_entity": EntityEnum.DSO.value,
                    "checklist_items": [
                        "Verifica completezza documenti",
                        "Conversione formato PDF",
                        "Upload sul portale",
                        "Conferma ricezione DSO"
                    ],
                    "note": "La documentazione deve essere caricata in formato PDF"
                }
            ]
        }
    ],
    "note_importanti": [
        "Tutti i documenti tecnici devono essere firmati da professionista abilitato",
        "La documentazione deve essere caricata in formato PDF",
        "Conservare ricevute di pagamento corrispettivi",
        "Il mandato di rappresentanza è obbligatorio se la pratica è gestita da terzi"
    ],
    "template_documenti": [
        {
            "name": "Modulo Richiesta Connessione",
            "tipo": "compilabile",
            "formato": ["pdf", "docx"],
            "campi_richiesti": ["dati_richiedente", "dati_impianto", "dati_tecnici"]
        },
        {
            "name": "Mandato di Rappresentanza",
            "tipo": "scaricabile",
            "fonte": "Portale E-Distribuzione",
            "formato": ["pdf"]
        },
        {
            "name": "Regolamento di Esercizio",
            "tipo": "template",
            "formato": ["docx"],
            "sezioni": ["dati_impianto", "parametri_protezione", "schema_elettrico"]
        }
    ]
}

# Cost calculation helper
def calcola_corrispettivo_preventivo(potenza_kw):
    """Calcola il corrispettivo per la richiesta di preventivo in base alla potenza"""
    if potenza_kw <= 6:
        return {"importo": 30, "iva": 22, "totale": 36.60}
    elif potenza_kw <= 10:
        return {"importo": 50, "iva": 22, "totale": 61.00}
    elif potenza_kw <= 50:
        return {"importo": 100, "iva": 22, "totale": 122.00}
    elif potenza_kw <= 100:
        return {"importo": 200, "iva": 22, "totale": 244.00}
    elif potenza_kw <= 500:
        return {"importo": 500, "iva": 22, "totale": 610.00}
    elif potenza_kw <= 1000:
        return {"importo": 1500, "iva": 22, "totale": 1830.00}
    else:
        return {"importo": 2500, "iva": 22, "totale": 3050.00}
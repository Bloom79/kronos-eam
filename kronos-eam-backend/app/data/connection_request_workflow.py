"""
Connection Request Workflow Template for E-Distribuzione
Based on Italian DSO connection procedures for renewable energy plants
"""

from app.models.workflow import WorkflowCategoryEnum, EntityEnum

CONNECTION_REQUEST_WORKFLOW = {
    "nome": "Domanda di Connessione E-Distribuzione",
    "descrizione": "Processo completo per la richiesta di connessione alla rete E-Distribuzione",
    "categoria": WorkflowCategoryEnum.ACTIVATION,
    "tipo_impianto": "Fotovoltaico",
    "potenza_minima": 0,
    "potenza_massima": None,
    "durata_stimata_giorni": 90,
    "ricorrenza": "Una tantum",
    "enti_richiesti": [EntityEnum.DSO.value],
    "documenti_base": [
        "Progetto e Schema Unifilare",
        "Documento identità intestatario",
        "Ultima bolletta elettrica",
        "Mappa catastale",
        "Codice IBAN"
    ],
    "stages": [
        {
            "nome": "FASE 1 - DOMANDA DI CONNESSIONE",
            "ordine": 1,
            "durata_giorni": 45,
            "tasks": [
                {
                    "nome": "Raccolta Documenti Tecnici",
                    "descrizione": "Raccolta della documentazione tecnica dell'impianto",
                    "responsabile": "Progettista",
                    "durata_giorni": 5,
                    "priorita": "Alta",
                    "documenti_richiesti": [
                        "Progetto e Schema Unifilare dell'impianto (firmato da tecnico abilitato)",
                        "Disposizione moduli fotovoltaici",
                        "Schema inverter e quadri elettrici",
                        "Schema collegamenti elettrici"
                    ],
                    "checkpoints": [
                        "Verifica firma tecnico abilitato",
                        "Controllo completezza progetto",
                        "Validazione schema unifilare"
                    ],
                    "note": "Tutti i documenti tecnici devono essere firmati da professionista abilitato"
                },
                {
                    "nome": "Raccolta Documentazione Anagrafica e Catastale",
                    "descrizione": "Raccolta documenti anagrafici e catastali del richiedente",
                    "responsabile": "Asset Manager",
                    "durata_giorni": 3,
                    "priorita": "Alta",
                    "documenti_richiesti": [
                        "Copia ultima bolletta elettrica",
                        "Documento identità intestatario (fronte/retro)",
                        "Mappa catastale (rilascio non anteriore a 6 mesi)",
                        "Codice IBAN per accrediti"
                    ],
                    "checkpoints": [
                        "Verifica validità documento identità",
                        "Controllo data rilascio mappa catastale",
                        "Validazione IBAN"
                    ],
                    "validazioni": {
                        "mappa_catastale_max_giorni": 180
                    }
                },
                {
                    "nome": "Inserimento Anagrafica Produttore su Portale E-Dist",
                    "descrizione": "Registrazione anagrafica del produttore sul portale E-Distribuzione",
                    "responsabile": "Asset Manager",
                    "durata_giorni": 2,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.DSO.value,
                    "integrazione": EntityEnum.DSO.value,
                    "tipo_pratica": "Anagrafica Produttore",
                    "url_portale": "https://www.e-distribuzione.it/",
                    "documenti_richiesti": [
                        "Copia ultima bolletta elettrica",
                        "Documento identità intestatario",
                        "Mappa catastale",
                        "Codice IBAN"
                    ],
                    "checkpoints": [
                        "Accesso portale E-Distribuzione",
                        "Inserimento dati anagrafici",
                        "Upload documentazione",
                        "Conferma registrazione"
                    ]
                },
                {
                    "nome": "Inserimento Anagrafica Plant",
                    "descrizione": "Inserimento dati tecnici dell'impianto sul portale",
                    "responsabile": "Asset Manager",
                    "durata_giorni": 2,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.DSO.value,
                    "integrazione": EntityEnum.DSO.value,
                    "tipo_pratica": "Anagrafica Plant",
                    "documenti_richiesti": [
                        "Dati tecnici impianto",
                        "Coordinate geografiche",
                        "POD di riferimento (se esistente)"
                    ],
                    "checkpoints": [
                        "Inserimento potenza nominale",
                        "Inserimento dati ubicazione",
                        "Selezione tipologia connessione"
                    ],
                    "dipendenze": ["Inserimento Anagrafica Produttore su Portale E-Dist"]
                },
                {
                    "nome": "Generazione e Gestione Mandato di Rappresentanza",
                    "descrizione": "Generazione del mandato dal portale e invio per firma",
                    "responsabile": "Asset Manager",
                    "durata_giorni": 5,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.DSO.value,
                    "documenti_richiesti": [
                        "Mandato di Rappresentanza (template da portale)"
                    ],
                    "checkpoints": [
                        "Download mandato dal portale E-Distribuzione",
                        "Invio mandato per firma (EPC o Proprietario)",
                        "Ricezione mandato firmato",
                        "Caricamento mandato firmato su piattaforma"
                    ],
                    "note": "Il mandato è obbligatorio se la pratica è gestita da terzi",
                    "dipendenze": ["Inserimento Anagrafica Plant"]
                },
                {
                    "nome": "Generazione Modello Unico Parte 1",
                    "descrizione": "Generazione e compilazione del Modello Unico Parte 1",
                    "responsabile": "Asset Manager",
                    "durata_giorni": 3,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.DSO.value,
                    "tipo_pratica": "Modello Unico",
                    "checkpoints": [
                        "Compilazione sezione anagrafica",
                        "Compilazione sezione tecnica",
                        "Verifica completezza",
                        "Invio tramite portale"
                    ],
                    "dipendenze": ["Generazione e Gestione Mandato di Rappresentanza"],
                    "documenti_generati": ["Modello_Unico_Parte_1.pdf"]
                },
                {
                    "nome": "Pagamento Corrispettivo Preventivo",
                    "descrizione": "Pagamento del corrispettivo per ottenimento preventivo",
                    "responsabile": "Amministrazione",
                    "durata_giorni": 2,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.DSO.value,
                    "documenti_richiesti": [
                        "Ricevuta pagamento corrispettivo"
                    ],
                    "costi": {
                        "fino_6_kw": {"importo": 30, "iva": 22},
                        "da_6_a_10_kw": {"importo": 50, "iva": 22},
                        "da_10_a_50_kw": {"importo": 100, "iva": 22},
                        "da_50_a_100_kw": {"importo": 200, "iva": 22},
                        "da_100_a_500_kw": {"importo": 500, "iva": 22},
                        "da_500_a_1000_kw": {"importo": 1500, "iva": 22},
                        "oltre_1000_kw": {"importo": 2500, "iva": 22}
                    },
                    "checkpoints": [
                        "Calcolo importo in base alla potenza",
                        "Esecuzione bonifico",
                        "Upload ricevuta pagamento"
                    ]
                },
                {
                    "nome": "Attesa e Ricezione Preventivo TICA",
                    "descrizione": "Attesa preventivo di connessione dal DSO",
                    "responsabile": "Sistema",
                    "durata_giorni": 20,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.DSO.value,
                    "automazione_config": {
                        "tipo": "monitoraggio",
                        "check_status": "daily",
                        "alert_giorni_rimanenti": [10, 5, 1]
                    },
                    "checkpoints": [
                        "Monitoraggio stato pratica",
                        "Ricezione notifica preventivo",
                        "Download preventivo TICA"
                    ],
                    "scadenza": {
                        "giorni": 30,
                        "tipo": "lavorativi",
                        "nota": "Tempo massimo per ricezione preventivo da DSO"
                    }
                }
            ]
        },
        {
            "nome": "FASE 2 - ACCETTAZIONE PREVENTIVO",
            "ordine": 2,
            "durata_giorni": 45,
            "condizioni": {
                "se": "iter != 'Semplificato'",
                "allora": "obbligatorio = true"
            },
            "tasks": [
                {
                    "nome": "Raccolta Documentazione Tecnica Inverter",
                    "descrizione": "Raccolta schede tecniche e certificazioni inverter",
                    "responsabile": "Installatore",
                    "durata_giorni": 5,
                    "priorita": "Alta",
                    "documenti_richiesti": [
                        "Scheda Test Inverter",
                        "Test report con parametri di funzionamento",
                        "Numero matricola e versione firmware",
                        "Certificazione conformità CEI 0-21"
                    ],
                    "checkpoints": [
                        "Verifica completezza test report",
                        "Controllo validità certificazione CEI",
                        "Registrazione numeri seriali"
                    ]
                },
                {
                    "nome": "Compilazione Regolamento di Esercizio",
                    "descrizione": "Compilazione del regolamento di esercizio con DSO",
                    "responsabile": "Tecnico",
                    "durata_giorni": 5,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.DSO.value,
                    "documenti_richiesti": [
                        "Dati tecnici impianto completi",
                        "Parametri di protezione interfaccia",
                        "Schema unifilare AS-BUILT aggiornato"
                    ],
                    "checkpoints": [
                        "Download template regolamento",
                        "Compilazione sezioni tecniche",
                        "Verifica parametri protezione",
                        "Validazione schema AS-BUILT"
                    ],
                    "template_documento": "regolamento_esercizio_template.docx"
                },
                {
                    "nome": "Raccolta Dati Installatore",
                    "descrizione": "Compilazione dati azienda installatrice",
                    "responsabile": "Installatore",
                    "durata_giorni": 3,
                    "priorita": "Media",
                    "documenti_richiesti": [
                        "Dati azienda installatrice",
                        "Abilitazioni e certificazioni",
                        "Riferimenti tecnico responsabile",
                        "Procura gestore pratiche"
                    ],
                    "checkpoints": [
                        "Verifica abilitazioni DM 37/08",
                        "Controllo validità certificazioni",
                        "Compilazione modulo dati"
                    ],
                    "template_documento": "dati_installatore_template.pdf"
                },
                {
                    "nome": "Dichiarazione di Conformità Plant",
                    "descrizione": "Emissione dichiarazione di conformità DM 37/08",
                    "responsabile": "Installatore",
                    "durata_giorni": 2,
                    "priorita": "Alta",
                    "documenti_richiesti": [
                        "Dichiarazione di conformità impianto (DM 37/08)",
                        "Allegati obbligatori dichiarazione"
                    ],
                    "checkpoints": [
                        "Compilazione dichiarazione",
                        "Preparazione allegati tecnici",
                        "Firma e timbro installatore",
                        "Verifica completezza"
                    ],
                    "riferimenti_normativi": ["DM 37/08"]
                },
                {
                    "nome": "Documentazione Fotografica Plant",
                    "descrizione": "Raccolta foto dettagliate dell'impianto realizzato",
                    "responsabile": "Installatore",
                    "durata_giorni": 1,
                    "priorita": "Media",
                    "documenti_richiesti": [
                        "Foto moduli fotovoltaici installati",
                        "Foto inverter con targhetta visibile",
                        "Foto quadri elettrici e protezioni",
                        "Foto sistema di accumulo (se presente)",
                        "Foto contatore di produzione"
                    ],
                    "checkpoints": [
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
                    "nome": "Accettazione Preventivo TICA",
                    "descrizione": "Accettazione formale del preventivo di connessione",
                    "responsabile": "Asset Manager",
                    "durata_giorni": 5,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.DSO.value,
                    "documenti_richiesti": [
                        "Modulo accettazione TICA firmato",
                        "Ricevuta pagamento accettazione"
                    ],
                    "checkpoints": [
                        "Analisi economica preventivo",
                        "Firma accettazione",
                        "Pagamento corrispettivo",
                        "Invio accettazione al DSO"
                    ],
                    "scadenza": {
                        "giorni": 45,
                        "tipo": "perentoria",
                        "azione_default": "decadenza preventivo"
                    }
                },
                {
                    "nome": "Caricamento Documentazione Completa",
                    "descrizione": "Upload di tutta la documentazione sul portale DSO",
                    "responsabile": "Asset Manager",
                    "durata_giorni": 2,
                    "priorita": "Alta",
                    "ente_responsabile": EntityEnum.DSO.value,
                    "checkpoints": [
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
            "nome": "Modulo Richiesta Connessione",
            "tipo": "compilabile",
            "formato": ["pdf", "docx"],
            "campi_richiesti": ["dati_richiedente", "dati_impianto", "dati_tecnici"]
        },
        {
            "nome": "Mandato di Rappresentanza",
            "tipo": "scaricabile",
            "fonte": "Portale E-Distribuzione",
            "formato": ["pdf"]
        },
        {
            "nome": "Regolamento di Esercizio",
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
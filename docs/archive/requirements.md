Azioni e Workflow.
Requisiti Funzionali
1. Gestione Documenti
 * FR-DOC-001 - Visualizzazione Documenti: Il sistema deve permettere agli utenti di visualizzare i documenti standard come "card" nel frontend, inclusi riferimenti normativi e link esterni.
 Un esempio di documenti da allegare sono Schema unifilare impianto fotovoltaico, foto moduli impianto come inverter etc.
 * FR-DOC-002 - Gestione Documenti Standard (Admin): L'Amministratore deve essere in grado di creare, modificare, eliminare e gestire le versioni dei documenti standard.
 * FR-DOC-003 - Copia e Customizzazione Documenti: Gli utilizzatori del modulo devono poter copiare un documento standard e personalizzarne il contenuto e/o i riferimenti, creando una versione customizzata.
 * FR-DOC-004 - Notifiche di Aggiornamento: Il sistema deve notificare gli utilizzatori quando un documento standard (o una sua copia customizzata) che è in uso in un loro workflow viene aggiornato o modificato dall'Amministratore. La notifica dovrà indicare che la versione originale è stata aggiornata e suggerire una revisione della copia.
 * FR-DOC-005 - Riferimenti Normativi e Link Esterni: Ogni documento deve poter contenere riferimenti normativi espliciti e link diretti a risorse esterne.
 * FR-DOC-006 - Ricerca Documenti: Il sistema deve consentire la ricerca di documenti (standard e customizzati) per parole chiave, riferimenti normativi o stato.
2. Gestione Azioni
 * FR-AZN-001 - Creazione Azione: Il sistema deve permettere la creazione di nuove azioni, definendo il responsabile, la possibile timeline (data di inizio/fine, scadenza), e l'associazione a uno o più documenti esistenti.
   * Esempio Azione: "Caricare su Gaudi documento X per impianto Y".
 * FR-AZN-002 - Dettagli Azione: Ogni azione deve includere campi per:
   * Descrizione: Testo libero per descrivere l'attività.
   * Responsabile: Utente o ruolo a cui è assegnata l'azione.
   * Timeline: Date di inizio e fine previste, data di scadenza.
   * Documenti Associati: Riferimenti a documenti specifici (standard o customizzati) pertinenti all'azione.
 * FR-AZN-003 - Audit Trail Azioni: Il sistema deve registrare un audit trail completo per ogni azione, includendo:
   * Data e ora di creazione.
   * Data e ora di ogni modifica.
   * L'utente che ha effettuato la modifica.
   * Dettagli della modifica (es. cambio responsabile, modifica data, completamento).
 * FR-AZN-004 - Stato Azione: Ogni azione deve avere uno stato (es. In Attesa, In Corso, Completata, Annullata, In Ritardo).
 * FR-AZN-005 - Integrazione in Workflow: Le azioni devono poter essere inserite e riordinate all'interno di un workflow.
3. Gestione Workflow
 * FR-WFL-001 - Visualizzazione Workflow Standard (Admin): L'Amministratore deve poter visualizzare, creare, modificare ed eliminare i workflow standard, inclusa la definizione di sotto-workflow.
 * FR-WFL-002 - Copia e Customizzazione Workflow: Gli utilizzatori devono poter copiare un workflow standard, creando una versione customizzata che mantenga un riferimento al workflow standard originale.
 * FR-WFL-003 - Modifica Workflow Customizzati: Gli utilizzatori devono poter aggiungere, eliminare o riordinare le azioni all'interno dei loro workflow customizzati.
 * FR-WFL-004 - Associazione Azioni a Workflow: Il sistema deve consentire l'associazione di azioni preesistenti (o la creazione di nuove azioni direttamente nel contesto del workflow) a specifici passi del workflow.
 * FR-WFL-005 - Stato Workflow: Ogni workflow deve avere uno stato (es. Bozza, Attivo, Completato, Sospeso, Annullato). Lo stato di un workflow dovrebbe riflettere lo stato delle sue azioni componenti.
 * FR-WFL-006 - Esecuzione Workflow: Il sistema deve permettere l'avvio e la gestione dell'esecuzione di un workflow, tracciando il progresso delle azioni.
 * FR-WFL-007 - Notifiche Workflow: Il sistema deve notificare gli utilizzatori o i responsabili di azioni specifiche riguardo al progresso del workflow, alle scadenze imminenti o a eventuali ritardi.
 * FR-WFL-008 - Tipi di Workflow Standard: Il sistema deve prevedere almeno i seguenti workflow standard (e i loro eventuali sotto-workflow):
   * Registrazione Impianto Standard
   * Registrazione Impianto Semplificato
   * Inserimento Membro in Comunità Energetica
Requisiti di Modellazione (Modello Dati Concettuale/Logico)
Qui delineiamo come le entità potrebbero essere strutturate e collegate.
erDiagram
    ENTE_ESTERNO {
        string ID
        string Nome
    }

    DOCUMENTO {
        string ID_Documento PK
        string Nome
        text Contenuto
        string Versione
        boolean IsStandard
        datetime DataCreazione
        datetime UltimaModifica
        string Autore
        string URL_RiferimentoNormativo
        string URL_LinkEsterno
        boolean AbilitaNotifiche
    }

    VERSIONE_DOCUMENTO_STANDARD {
        string ID_Versione PK
        string ID_Documento FK
        string VersioneNumero
        datetime DataRilascio
        text NoteModifica
    }

    COPIA_DOCUMENTO_UTENTE {
        string ID_CopiaDocumento PK
        string ID_DocumentoOriginale FK
        string ID_UtenteCreazione FK
        text ContenutoCustomizzato
        datetime DataCopia
        datetime UltimaModificaCopia
        string NomeCopia
    }

    AZIONE {
        string ID_Azione PK
        string Descrizione
        string ResponsabileID FK "Utente o Ruolo"
        datetime DataInizioPrevista
        datetime DataFinePrevista
        datetime DataScadenza
        datetime DataCompletamentoEffettivo
        string StatoAzione ENUM("In Attesa", "In Corso", "Completata", "Annullata", "In Ritardo")
    }

    AUDIT_LOG_AZIONE {
        string ID_Log PK
        string ID_Azione FK
        datetime Timestamp
        string UtenteModificaID FK
        string TipoModifica ENUM("Creazione", "Aggiornamento", "Stato_Cambio", "Responsabile_Cambio")
        text DettaglioModifica
    }

    WORKFLOW {
        string ID_Workflow PK
        string Nome
        string Descrizione
        string TipoWorkflow ENUM("Standard", "Custom")
        string StatoWorkflow ENUM("Bozza", "Attivo", "Completato", "Sospeso", "Annullato")
        boolean IsStandard
        string ID_WorkflowStandardOriginale FK "Solo se custom"
        datetime DataCreazione
        datetime UltimaModifica
        string Autore
    }

    FASE_WORKFLOW_AZIONE {
        string ID_Fase PK
        string ID_Workflow FK
        string ID_Azione FK
        int OrdineSequenza
        boolean EseguitoInSequenza
        string NomeFase
    }

    UTENTE {
        string ID_Utente PK
        string NomeUtente
        string Ruolo ENUM("Amministratore", "Utilizzatore")
        string Email
    }

    // Relazioni

    DOCUMENTO ||--o{ VERSIONE_DOCUMENTO_STANDARD : "ha versioni"
    DOCUMENTO ||--o{ COPIA_DOCUMENTO_UTENTE : "è copiato da"
    COPIA_DOCUMENTO_UTENTE }o--|| UTENTE : "creata da"

    AZIONE ||--o{ AUDIT_LOG_AZIONE : "ha log"
    AZIONE ||--o{ DOCUMENTO : "riferisce a"
    AZIONE ||--o{ COPIA_DOCUMENTO_UTENTE : "riferisce a"
    AZIONE }o--|| UTENTE : "assegnata a"

    WORKFLOW ||--o{ FASE_WORKFLOW_AZIONE : "contiene azioni in fasi"
    FASE_WORKFLOW_AZIONE }o--|| AZIONE : "include"

    WORKFLOW ||--o{ WORKFLOW : "ha sotto-workflow"
    WORKFLOW ||--o{ NOTIFICA : "genera notifiche"
    
    UTENTE ||--o{ NOTIFICA : "riceve notifiche"

    NOTIFICA {
        string ID_Notifica PK
        string TipoNotifica ENUM("Aggiornamento Documento", "Workflow Avviato", "Azione Scaduta", "Workflow Completato")
        text Messaggio
        datetime DataNotifica
        boolean Letta
        string ID_UtenteDestinatario FK
        string ID_DocumentoRiferimento FK
        string ID_WorkflowRiferimento FK
        string ID_AzioneRiferimento FK
    }

    DOCUMENTO ||--o{ NOTIFICA : "genera (aggiornamenti)"
    WORKFLOW ||--o{ NOTIFICA : "genera (stato/azioni)"
    AZIONE ||--o{ NOTIFICA : "genera (stato/scadenze)"

Spiegazione del Modello Dati:
 * DOCUMENTO: Entità centrale per i documenti. IsStandard boolean per distinguere. Versione e VERSIONE_DOCUMENTO_STANDARD per gestire lo storico delle modifiche dei documenti standard. AbilitaNotifiche per gestire le notifiche sugli aggiornamenti.
 * COPIA_DOCUMENTO_UTENTE: Permette agli utenti di personalizzare i documenti standard. Mantiene un riferimento a ID_DocumentoOriginale per le notifiche di aggiornamento.
 * AZIONE: Dettaglio di ogni singola attività. Include campi per la gestione del responsabile, timeline e stato.
 * AUDIT_LOG_AZIONE: Tabella di log per tracciare ogni modifica apportata alle azioni, fondamentale per l'auditing.
 * WORKFLOW: Rappresenta il flusso di attività. IsStandard e ID_WorkflowStandardOriginale permettono la distinzione e il riferimento tra workflow standard e customizzati.
 * FASE_WORKFLOW_AZIONE: Tabella di giunzione che definisce quali azioni fanno parte di un workflow e in quale sequenza. Una Azione può essere inclusa in più workflow.
 * UTENTE: Gestisce gli utenti e i loro ruoli (Amministratore/Utilizzatore).
 * NOTIFICA: Tabella per gestire tutte le notifiche generate dal sistema verso gli utenti.
Considerazioni Aggiuntive per la Modellazione:
 * Sotto-workflow: Nel modello WORKFLOW, la relazione ricorsiva WORKFLOW ||--o{ WORKFLOW : "ha sotto-workflow" indica che un workflow può essere composto da altri workflow, permettendo la modularità.
 * Polimorfismo Documenti: La relazione tra AZIONE e DOCUMENTO / COPIA_DOCUMENTO_UTENTE può essere gestita con una FK generica e un campo TipoDocumentoRiferimento oppure gestendo due FK opzionali e verificando quale delle due è popolata. Nel modello ER, ho mostrato due relazioni separate per chiarezza.
 * Responsabile: Il campo ResponsabileID nell'entità AZIONE può fare riferimento all'ID di un UTENTE o a un codice che identifica un RUOLO, a seconda di come vuoi gestire l'assegnazione.
 * Stati: Gli stati (ENUM) dovrebbero essere ben definiti e documentati per ogni entità, con le transizioni permesse tra gli stati.
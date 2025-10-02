import { WorkflowTemplate, TaskTemplate, WorkflowCategoryEnum, TaskPriorityEnum } from '../types';

export const workflowTemplates: WorkflowTemplate[] = [
  // Comprehensive Solar Plant Installation Workflow - Based on 2025 Italian Regulations
  {
    id: 'installazione-completa-fotovoltaico',
    name: 'Installazione Completa Impianto Fotovoltaico',
    description: 'Processo completo dall\'analisi iniziale all\'attivazione finale, conforme alle normative italiane 2025',
    category: WorkflowCategoryEnum.ACTIVATION,
    stages: [
      {
        name: 'Valutazione e Progettazione',
        order: 1,
        tasks: [
          {
            id: 'analisi-fabbisogno',
            name: 'Analisi Fabbisogno Energetico',
            title: 'Analisi Fabbisogno Energetico',
            description: 'Studio dei consumi e dimensionamento ottimale impianto basato su bollette ultimi 12 mesi',
            assignee: 'Energy Manager',
            duration_days: 5,
            required_documents: [
              'Bollette elettriche ultimi 12 mesi',
              'POD esistente',
              'Dati catastali immobile (foglio, particella, subalterno)',
              'Planimetria edificio con orientamento'
            ],
            checklist_items: [
              { id: 'analisi-fabbisogno-cl-1', text: 'Calcolo consumo annuo kWh', checked: false },
              { id: 'analisi-fabbisogno-cl-2', text: 'Verifica potenza disponibile POD', checked: false },
              { id: 'analisi-fabbisogno-cl-3', text: 'Stima producibilità zona climatica', checked: false },
              { id: 'analisi-fabbisogno-cl-4', text: 'Calcolo autoconsumo previsto (60-70%)', checked: false }
            ],
            dependencies: [],
            integration: null
          },
          {
            id: 'sopralluogo-tecnico',
            name: 'Sopralluogo Tecnico e Verifica Strutturale',
            title: 'Sopralluogo Tecnico e Verifica Strutturale',
            description: 'Ispezione sito per verifica fattibilità e raccolta dati tecnici. Verifica portata minima 25 kg/m²',
            assignee: 'Progettista',
            priority: TaskPriorityEnum.HIGH,
            duration_days: 2,
            required_documents: [
              'CIS - Certificato Idoneità Statica (validità 15 anni)',
              'Relazione calcolo carichi per zone sismiche',
              'Planimetrie strutturali edificio',
              'Foto dettagliate copertura e quadro elettrico'
            ],
            checklist_items: [
              { id: 'sopralluogo-tecnico-cl-1', text: 'Misurazione superficie disponibile', checked: false },
              { id: 'sopralluogo-tecnico-cl-2', text: 'Verifica orientamento e inclinazione', checked: false },
              { id: 'sopralluogo-tecnico-cl-3', text: 'Analisi ombreggiamenti (Solar Pathfinder)', checked: false },
              { id: 'sopralluogo-tecnico-cl-4', text: 'Controllo portata strutturale ≥ 25 kg/m²', checked: false },
              { id: 'sopralluogo-tecnico-cl-5', text: 'Individuazione punto connessione elettrica', checked: false }
            ],
            dependencies: ['analisi-fabbisogno'],
            integration: null
          },
          {
            id: 'progettazione-definitiva',
            name: 'Progettazione Definitiva Impianto',
            title: 'Progettazione Definitiva Impianto',
            description: 'Elaborazione progetto esecutivo con tutti gli elaborati tecnici richiesti',
            assignee: 'Progettista',
            priority: TaskPriorityEnum.HIGH,
            duration_days: 7,
            required_documents: [
              'Dati sopralluogo completi',
              'Schede tecniche pannelli/inverter candidati',
              'Normativa tecnica CEI 0-21 aggiornata'
            ],
            checklist_items: [
              { id: 'progettazione-definitiva-cl-1', text: 'Schema unifilare firmato', checked: false },
              { id: 'progettazione-definitiva-cl-2', text: 'Layout disposizione moduli', checked: false },
              { id: 'progettazione-definitiva-cl-3', text: 'Relazione tecnica dettagliata', checked: false },
              { id: 'progettazione-definitiva-cl-4', text: 'Calcolo producibilità PVGIS', checked: false },
              { id: 'progettazione-definitiva-cl-5', text: 'Computo metrico materiali', checked: false }
            ],
            dependencies: ['sopralluogo-tecnico'],
            integration: null
          },
          {
            id: 'preventivo-economico',
            name: 'Preventivo e Analisi Economica',
            title: 'Preventivo e Analisi Economica',
            description: 'Elaborazione business plan con ROI e verifica incentivi disponibili 2025',
            assignee: 'Commerciale',
            duration_days: 3,
            required_documents: [
              'Progetto definitivo',
              'Computo metrico',
              'Listini fornitori aggiornati'
            ],
            checklist_items: [
              { id: 'preventivo-economico-cl-1', text: 'Costo totale impianto (800-1200€/kWp)', checked: false },
              { id: 'preventivo-economico-cl-2', text: 'Verifica incentivi: Bonus 50%, Reddito Energetico, CER', checked: false },
              { id: 'preventivo-economico-cl-3', text: 'Calcolo risparmio annuo in bolletta', checked: false },
              { id: 'preventivo-economico-cl-4', text: 'ROI previsto 4-6 anni con detrazioni', checked: false },
              { id: 'preventivo-economico-cl-5', text: 'Proposta contratto e condizioni', checked: false }
            ],
            dependencies: ['progettazione-definitiva'],
            integration: null
          },
        ]
      },
      {
        name: 'Autorizzazioni',
        order: 2,
        tasks: [
          {
            id: 'verifica-iter-autorizzativo',
            name: 'Verifica Iter Autorizzativo',
            title: 'Verifica Iter Autorizzativo',
            description: 'Determinazione procedura autorizzativa: PAS, CILA o AU in base a potenza e vincoli',
            assignee: 'Progettista',
            duration_days: 2,
            required_documents: [
              'Estratto PRG comunale',
              'Verifica vincoli paesaggistici',
              'CDU - Certificato Destinazione Urbanistica'
            ],
            checklist_items: [
              { id: 'verifica-iter-autorizzativo-cl-1', text: 'Controllo potenza impianto per iter', checked: false },
              { id: 'verifica-iter-autorizzativo-cl-2', text: 'Verifica presenza vincoli', checked: false },
              { id: 'verifica-iter-autorizzativo-cl-3', text: 'Scelta procedura: PAS/CILA/AU', checked: false },
              { id: 'verifica-iter-autorizzativo-cl-4', text: 'Identificazione enti coinvolti', checked: false }
            ],
            dependencies: ['preventivo-economico'],
            integration: null
          },
          {
            id: 'presentazione-pas-cila',
            name: 'Presentazione PAS/CILA/AU',
            title: 'Presentazione PAS/CILA/AU',
            description: 'Compilazione e invio pratica edilizia secondo iter identificato. PAS/CILA via SUE/SUAP',
            assignee: 'Progettista',
            priority: TaskPriorityEnum.HIGH,
            duration_days: 2,
            required_documents: [
              'Progetto definitivo completo',
              'Relazione tecnica asseverata',
              'Documento identità proprietario',
              'Delega professionista',
              'Marca da bollo €16 (se richiesta)'
            ],
            checklist_items: [
              { id: 'presentazione-pas-cila-cl-1', text: 'Accesso portale SUAP/SUE con SPID/CIE', checked: false },
              { id: 'presentazione-pas-cila-cl-2', text: 'Compilazione moduli online', checked: false },
              { id: 'presentazione-pas-cila-cl-3', text: 'Upload elaborati (max 10MB per file)', checked: false },
              { id: 'presentazione-pas-cila-cl-4', text: 'Pagamento diritti segreteria', checked: false },
              { id: 'presentazione-pas-cila-cl-5', text: 'Protocollazione pratica', checked: false }
            ],
            dependencies: ['verifica-iter-autorizzativo'],
            integration: 'Municipality',
            deadline_days: 30
          },
        ]
      },
      {
        name: 'Connessione DSO',
        order: 3,
        tasks: [
          {
            id: 'richiesta-connessione-dso',
            name: 'Richiesta Connessione DSO - Modello Unico Parte I',
            title: 'Richiesta Connessione DSO - Modello Unico Parte I',
            description: 'Presentazione domanda connessione a E-Distribuzione con progetto definitivo',
            assignee: 'Asset Manager',
            priority: TaskPriorityEnum.HIGH,
            duration_days: 3,
            required_documents: [
              'Progetto definitivo impianto (PDF max 10MB)',
              'Schema elettrico unifilare firmato',
              'Documento identità richiedente',
              'Visura catastale aggiornata',
              'Coordinate GPS punto connessione'
            ],
            checklist_items: [
              { id: 'richiesta-connessione-dso-cl-1', text: 'Registrazione portale E-Distribuzione', checked: false },
              { id: 'richiesta-connessione-dso-cl-2', text: 'Compilazione Modello Unico online', checked: false },
              { id: 'richiesta-connessione-dso-cl-3', text: 'Verifica power: BT≤100kW o MT>100kW', checked: false },
              { id: 'richiesta-connessione-dso-cl-4', text: 'Upload documentazione tecnica', checked: false },
              { id: 'richiesta-connessione-dso-cl-5', text: 'Invio pratica e protocollazione', checked: false }
            ],
            dependencies: ['presentazione-pas-cila'],
            integration: 'DSO'
          },
          {
            id: 'gestione-tica',
            name: 'Gestione Preventivo TICA',
            title: 'Gestione Preventivo TICA',
            description: 'Ricezione, valutazione e accettazione preventivo connessione entro 45 giorni',
            assignee: 'Asset Manager',
            priority: TaskPriorityEnum.MEDIUM,
            duration_days: 5,
            required_documents: [],
            checklist_items: [
              { id: 'gestione-tica-cl-1', text: 'Ricezione TICA entro 20gg lavorativi', checked: false },
              { id: 'gestione-tica-cl-2', text: 'Analisi costi: quota fissa €100 + potenza + distanza', checked: false },
              { id: 'gestione-tica-cl-3', text: 'Verifica soluzione tecnica proposta', checked: false },
              { id: 'gestione-tica-cl-4', text: 'Accettazione entro 45gg (pena decadenza)', checked: false },
              { id: 'gestione-tica-cl-5', text: 'Bonifico corrispettivo con causale codice TICA', checked: false }
            ],
            dependencies: ['richiesta-connessione-dso'],
            integration: 'DSO',
            deadline_days: 45
          },
        ]
      },
      {
        name: 'Installazione',
        order: 4,
        tasks: [
          {
            id: 'preparazione-cantiere',
            name: 'Preparazione Cantiere e Sicurezza',
            title: 'Preparazione Cantiere e Sicurezza',
            description: 'Allestimento cantiere secondo D.Lgs 81/08 con PSC per cantieri > 200 uomini-giorno',
            assignee: 'Capo Cantiere',
            duration_days: 3,
            required_documents: [
              'PSC - Piano Sicurezza e Coordinamento',
              'POS - Piano Operativo Sicurezza',
              'DURC imprese esecutrici',
              'Nomina CSP/CSE se richiesto'
            ],
            checklist_items: [
              { id: 'preparazione-cantiere-cl-1', text: 'Recinzione e segnaletica cantiere', checked: false },
              { id: 'preparazione-cantiere-cl-2', text: 'Verifica DPI squadra installazione', checked: false },
              { id: 'preparazione-cantiere-cl-3', text: 'Installazione quadro elettrico cantiere', checked: false },
              { id: 'preparazione-cantiere-cl-4', text: 'Briefing sicurezza con operatori', checked: false },
              { id: 'preparazione-cantiere-cl-5', text: 'Notifica preliminare ASL/ITL se dovuta', checked: false }
            ],
            dependencies: ['gestione-tica'],
            integration: null
          },
          {
            id: 'installazione-impianto',
            name: 'Installazione Meccanica ed Elettrica',
            title: 'Installazione Meccanica ed Elettrica',
            description: 'Montaggio strutture, moduli FV, inverter e collegamenti elettrici secondo CEI 0-21',
            assignee: 'Installatore Qualificato',
            priority: TaskPriorityEnum.HIGH,
            duration_days: 10,
            required_documents: [
              'Progetto esecutivo',
              'Schemi di montaggio',
              'Manuali installazione componenti'
            ],
            checklist_items: [
              { id: 'installazione-impianto-cl-1', text: 'Montaggio strutture portanti', checked: false },
              { id: 'installazione-impianto-cl-2', text: 'Installazione moduli FV con serraggio corretto', checked: false },
              { id: 'installazione-impianto-cl-3', text: 'Posa cavi DC (PV1-F) e AC', checked: false },
              { id: 'installazione-impianto-cl-4', text: 'Montaggio inverter e quadri stringa', checked: false },
              { id: 'installazione-impianto-cl-5', text: 'Collegamenti equipotenziali e messa a terra', checked: false }
            ],
            dependencies: ['preparazione-cantiere'],
            integration: null
          },
        ]
      },
      {
        name: 'Collaudo',
        order: 5,
        tasks: [
          {
            id: 'verifiche-preliminari',
            name: 'Verifiche Preliminari e Test Elettrici',
            title: 'Verifiche Preliminari e Test Elettrici',
            description: 'Esecuzione test secondo CEI 82-25 prima della messa in servizio',
            assignee: 'Tecnico Verificatore',
            duration_days: 1,
            required_documents: [
              'Schemi as-built impianto',
              'Certificazioni componenti',
              'Strumentazione calibrata'
            ],
            checklist_items: [
              { id: 'verifiche-preliminari-cl-1', text: 'Test isolamento stringhe (>1MΩ)', checked: false },
              { id: 'verifiche-preliminari-cl-2', text: 'Verifica polarità collegamenti DC', checked: false },
              { id: 'verifiche-preliminari-cl-3', text: 'Test continuità conduttori protezione', checked: false },
              { id: 'verifiche-preliminari-cl-4', text: 'Misura resistenza di terra (<10Ω)', checked: false },
              { id: 'verifiche-preliminari-cl-5', text: 'Verifica funzionamento protezioni', checked: false }
            ],
            dependencies: ['installazione-impianto'],
            integration: null
          },
          {
            id: 'dichiarazione-conformita',
            name: 'Dichiarazione di Conformità DM 37/08',
            title: 'Dichiarazione di Conformità DM 37/08',
            description: 'Rilascio DiCo da parte dell\'installatore abilitato con allegati obbligatori',
            assignee: 'Installatore Abilitato',
            duration_days: 1,
            required_documents: [
              'Progetto as-built',
              'Schema unifilare aggiornato',
              'Report prove e misure',
              'Certificazioni materiali',
              'Visura CCIAA installatore'
            ],
            checklist_items: [
              { id: 'dichiarazione-conformita-cl-1', text: 'Compilazione modello DiCo ministeriale', checked: false },
              { id: 'dichiarazione-conformita-cl-2', text: 'Allegato schema impianto', checked: false },
              { id: 'dichiarazione-conformita-cl-3', text: 'Allegato report verifiche', checked: false },
              { id: 'dichiarazione-conformita-cl-4', text: 'Timbro e firma installatore', checked: false },
              { id: 'dichiarazione-conformita-cl-5', text: 'Consegna copia al committente', checked: false }
            ],
            dependencies: ['verifiche-preliminari'],
            integration: null
          },
        ]
      },
      {
        name: 'Attivazione Connessione',
        order: 6,
        tasks: [
          {
            id: 'comunicazione-fine-lavori',
            name: 'Comunicazione Fine Lavori - Modello Unico Parte II',
            title: 'Comunicazione Fine Lavori - Modello Unico Parte II',
            description: 'Invio documentazione fine lavori al DSO per attivazione connessione',
            assignee: 'Asset Manager',
            priority: TaskPriorityEnum.HIGH,
            duration_days: 2,
            required_documents: [
              'Dichiarazione Conformità impianto',
              'Regolamento di Esercizio firmato',
              'Certificazione inverter e SPI',
              'Report verifica SPI secondo CEI 0-21',
              'Addendum Tecnico contratto'
            ],
            checklist_items: [
              { id: 'comunicazione-fine-lavori-cl-1', text: 'Accesso portale DSO', checked: false },
              { id: 'comunicazione-fine-lavori-cl-2', text: 'Compilazione Parte II online', checked: false },
              { id: 'comunicazione-fine-lavori-cl-3', text: 'Upload documentazione tecnica', checked: false },
              { id: 'comunicazione-fine-lavori-cl-4', text: 'Firma digitale documenti', checked: false },
              { id: 'comunicazione-fine-lavori-cl-5', text: 'Invio e protocollazione', checked: false }
            ],
            dependencies: ['dichiarazione-conformita'],
            integration: 'DSO'
          },
          {
            id: 'installazione-contatore',
            name: 'Installazione Contatore Bidirezionale',
            title: 'Installazione Contatore Bidirezionale',
            description: 'Intervento DSO per sostituzione contatore e attivazione produzione',
            assignee: 'Tecnico DSO',
            priority: TaskPriorityEnum.MEDIUM,
            duration_days: 1,
            required_documents: [],
            checklist_items: [
              { id: 'installazione-contatore-cl-1', text: 'Programmazione intervento DSO', checked: false },
              { id: 'installazione-contatore-cl-2', text: 'Sostituzione contatore M2 bidirezionale', checked: false },
              { id: 'installazione-contatore-cl-3', text: 'Configurazione telegestione', checked: false },
              { id: 'installazione-contatore-cl-4', text: 'Test immissione in rete', checked: false },
              { id: 'installazione-contatore-cl-5', text: 'Rilascio verbale attivazione', checked: false }
            ],
            dependencies: ['comunicazione-fine-lavori'],
            integration: 'DSO'
          },
        ]
      },
      {
        name: 'GAUDÌ',
        order: 7,
        tasks: [
          {
            id: 'registrazione-gaudi',
            name: 'Registrazione Anagrafica GAUDÌ',
            title: 'Registrazione Anagrafica GAUDÌ',
            description: 'Censimento impianto nel sistema GAUDÌ di Terna per tracciabilità nazionale',
            assignee: 'Asset Manager',
            priority: TaskPriorityEnum.HIGH,
            duration_days: 2,
            required_documents: [
              'Codice POD definitivo',
              'Codice rintracciabilità DSO',
              'Dati tecnici moduli/inverter',
              'Coordinate geografiche impianto'
            ],
            checklist_items: [
              { id: 'registrazione-gaudi-cl-1', text: 'Creazione account GAUDÌ produttore', checked: false },
              { id: 'registrazione-gaudi-cl-2', text: 'Inserimento dati anagrafici', checked: false },
              { id: 'registrazione-gaudi-cl-3', text: 'Inserimento dati tecnici impianto', checked: false },
              { id: 'registrazione-gaudi-cl-4', text: 'Upload documenti richiesti', checked: false },
              { id: 'registrazione-gaudi-cl-5', text: 'Validazione e invio pratica', checked: false }
            ],
            dependencies: ['installazione-contatore'],
            integration: 'Terna'
          },
          {
            id: 'validazione-flussi-gaudi',
            name: 'Validazione Flussi GAUDÌ',
            title: 'Validazione Flussi GAUDÌ',
            description: 'Monitoraggio flussi informativi G01, G02, G04 tra DSO e Terna',
            assignee: 'Sistema',
            priority: TaskPriorityEnum.LOW,
            duration_days: 5,
            required_documents: [],
            checklist_items: [
              { id: 'validazione-flussi-gaudi-cl-1', text: 'Ricezione flusso G01 da DSO', checked: false },
              { id: 'validazione-flussi-gaudi-cl-2', text: 'Conferma G02 dati tecnici', checked: false },
              { id: 'validazione-flussi-gaudi-cl-3', text: 'Validazione finale G04', checked: false },
              { id: 'validazione-flussi-gaudi-cl-4', text: 'Attivazione codice CENSIMP', checked: false },
              { id: 'validazione-flussi-gaudi-cl-5', text: 'Download attestato GAUDÌ', checked: false }
            ],
            dependencies: ['registrazione-gaudi'],
            integration: 'Terna'
          },
        ]
      },
      {
        name: 'GSE',
        order: 8,
        tasks: [
          {
            id: 'attivazione-rid-gse',
            name: 'Attivazione Ritiro Dedicato GSE',
            title: 'Attivazione Ritiro Dedicato GSE',
            description: 'Richiesta convenzione RID per vendita energia non autoconsumata',
            assignee: 'Asset Manager',
            priority: TaskPriorityEnum.MEDIUM,
            duration_days: 3,
            required_documents: [
              'Codice CENSIMP da GAUDÌ',
              'IBAN per accrediti',
              'Documento identità',
              'Mandato se delegato'
            ],
            checklist_items: [
              { id: 'attivazione-rid-gse-cl-1', text: 'Accesso Area Clienti con SPID', checked: false },
              { id: 'attivazione-rid-gse-cl-2', text: 'Configurazione MFA obbligatoria', checked: false },
              { id: 'attivazione-rid-gse-cl-3', text: 'Compilazione modulo RID online', checked: false },
              { id: 'attivazione-rid-gse-cl-4', text: 'Upload documentazione', checked: false },
              { id: 'attivazione-rid-gse-cl-5', text: 'Invio richiesta convenzione', checked: false }
            ],
            dependencies: ['validazione-flussi-gaudi'],
            integration: 'GSE'
          },
          {
            id: 'comunicazione-antimafia',
            name: 'Documentazione Antimafia (se > 150k€)',
            title: 'Documentazione Antimafia (se > 150k€)',
            description: 'Presentazione documentazione antimafia per impianti con incentivi superiori a 150.000€',
            assignee: 'Legale',
            duration_days: 7,
            required_documents: [
              'Visura camerale aggiornata',
              'Documenti soci e amministratori',
              'Dichiarazioni sostitutive antimafia',
              'Certificati carichi pendenti'
            ],
            checklist_items: [
              { id: 'comunicazione-antimafia-cl-1', text: 'Verifica soglia incentivi totali', checked: false },
              { id: 'comunicazione-antimafia-cl-2', text: 'Raccolta documentazione societaria', checked: false },
              { id: 'comunicazione-antimafia-cl-3', text: 'Compilazione dichiarazioni', checked: false },
              { id: 'comunicazione-antimafia-cl-4', text: 'Invio tramite Area Clienti GSE', checked: false },
              { id: 'comunicazione-antimafia-cl-5', text: 'Monitoraggio esito verifica', checked: false }
            ],
            dependencies: ['attivazione-rid-gse'],
            integration: 'GSE',
            application_condition: 'incentivi_totali > 150000'
          },
        ]
      },
      {
        name: 'Dogane',
        order: 9,
        tasks: [
          {
            id: 'denuncia-officina-elettrica',
            name: 'Denuncia Officina Elettrica ADM',
            title: 'Denuncia Officina Elettrica ADM',
            description: 'Registrazione impianto > 20kW come officina elettrica presso Agenzia Dogane',
            assignee: 'Fiscalista',
            priority: TaskPriorityEnum.HIGH,
            duration_days: 4,
            required_documents: [
              'Planimetria con schema unifilare',
              'Ubicazione contatori fiscali',
              'Dati tecnici impianto',
              'Visura camerale'
            ],
            checklist_items: [
              { id: 'denuncia-officina-elettrica-cl-1', text: 'Compilazione modello AD-1', checked: false },
              { id: 'denuncia-officina-elettrica-cl-2', text: 'Preparazione planimetria fiscale', checked: false },
              { id: 'denuncia-officina-elettrica-cl-3', text: 'Calcolo franchigia 20kW', checked: false },
              { id: 'denuncia-officina-elettrica-cl-4', text: 'Firma digitale documenti', checked: false },
              { id: 'denuncia-officina-elettrica-cl-5', text: 'Invio telematico PUDM', checked: false }
            ],
            dependencies: ['attivazione-rid-gse'],
            integration: 'Customs',
            application_condition: 'potenza > 20'
          },
          {
            id: 'licenza-esercizio-dogane',
            name: 'Ottenimento Licenza Esercizio',
            title: 'Ottenimento Licenza Esercizio',
            description: 'Ricezione licenza officina elettrica da ADM per esercizio legale',
            assignee: 'Sistema',
            priority: TaskPriorityEnum.LOW,
            duration_days: 10,
            required_documents: [],
            checklist_items: [
              { id: 'licenza-esercizio-dogane-cl-1', text: 'Monitoraggio pratica PUDM', checked: false },
              { id: 'licenza-esercizio-dogane-cl-2', text: 'Eventuale integrazione documenti', checked: false },
              { id: 'licenza-esercizio-dogane-cl-3', text: 'Ricezione licenza UTF', checked: false },
              { id: 'licenza-esercizio-dogane-cl-4', text: 'Registrazione numero licenza', checked: false },
              { id: 'licenza-esercizio-dogane-cl-5', text: 'Archiviazione documento', checked: false }
            ],
            dependencies: ['denuncia-officina-elettrica'],
            integration: 'Customs'
          }
        ]
      }
    ],
    tasks: [
      // FASE 1: Valutazione e Progettazione
      {
        id: 'analisi-fabbisogno',
        name: 'Analisi Fabbisogno Energetico',
        title: 'Analisi Fabbisogno Energetico',
        description: 'Studio dei consumi e dimensionamento ottimale impianto basato su bollette ultimi 12 mesi',
        assignee: 'Energy Manager',
        duration_days: 5,
        stage: 'Valutazione e Progettazione',

        required_documents: [
          'Bollette elettriche ultimi 12 mesi',
          'POD esistente',
          'Dati catastali immobile (foglio, particella, subalterno)',
          'Planimetria edificio con orientamento'
        ],
        checklist_items: [
          { id: 'analisi-fabbisogno-cl-1', text: 'Calcolo consumo annuo kWh', checked: false },
          { id: 'analisi-fabbisogno-cl-2', text: 'Verifica potenza disponibile POD', checked: false },
          { id: 'analisi-fabbisogno-cl-3', text: 'Stima producibilità zona climatica', checked: false },
          { id: 'analisi-fabbisogno-cl-4', text: 'Calcolo autoconsumo previsto (60-70%)', checked: false }
        ],
        dependencies: [],
        integration: null
      },
      {
        id: 'sopralluogo-tecnico',
        name: 'Sopralluogo Tecnico e Verifica Strutturale',
        title: 'Sopralluogo Tecnico e Verifica Strutturale',
        description: 'Ispezione sito per verifica fattibilità e raccolta dati tecnici. Verifica portata minima 25 kg/m²',
        assignee: 'Progettista',
        duration_days: 2,
        stage: 'Valutazione e Progettazione',

        required_documents: [
          'CIS - Certificato Idoneità Statica (validità 15 anni)',
          'Relazione calcolo carichi per zone sismiche',
          'Planimetrie strutturali edificio',
          'Foto dettagliate copertura e quadro elettrico'
        ],
        checklist_items: [
          { id: 'sopralluogo-tecnico-cl-1', text: 'Misurazione superficie disponibile', checked: false },
          { id: 'sopralluogo-tecnico-cl-2', text: 'Verifica orientamento e inclinazione', checked: false },
          { id: 'sopralluogo-tecnico-cl-3', text: 'Analisi ombreggiamenti (Solar Pathfinder)', checked: false },
          { id: 'sopralluogo-tecnico-cl-4', text: 'Controllo portata strutturale ≥ 25 kg/m²', checked: false },
          { id: 'sopralluogo-tecnico-cl-5', text: 'Individuazione punto connessione elettrica', checked: false }
        ],
        dependencies: ['analisi-fabbisogno'],
        integration: null
      },
      {
        id: 'progettazione-definitiva',
        name: 'Progettazione Definitiva Impianto',
        title: 'Progettazione Definitiva Impianto',
        description: 'Elaborazione progetto esecutivo con tutti gli elaborati tecnici richiesti',
        assignee: 'Progettista',
        duration_days: 7,
        stage: 'Valutazione e Progettazione',

        required_documents: [
          'Dati sopralluogo completi',
          'Schede tecniche pannelli/inverter candidati',
          'Normativa tecnica CEI 0-21 aggiornata'
        ],
        checklist_items: [
          { id: 'progettazione-definitiva-cl-1', text: 'Schema unifilare firmato', checked: false },
          { id: 'progettazione-definitiva-cl-2', text: 'Layout disposizione moduli', checked: false },
          { id: 'progettazione-definitiva-cl-3', text: 'Relazione tecnica dettagliata', checked: false },
          { id: 'progettazione-definitiva-cl-4', text: 'Calcolo producibilità PVGIS', checked: false },
          { id: 'progettazione-definitiva-cl-5', text: 'Computo metrico materiali', checked: false }
        ],
        dependencies: ['sopralluogo-tecnico'],
        integration: null
      },
      {
        id: 'preventivo-economico',
        name: 'Preventivo e Analisi Economica',
        title: 'Preventivo e Analisi Economica',
        description: 'Elaborazione business plan con ROI e verifica incentivi disponibili 2025',
        assignee: 'Commerciale',
        duration_days: 3,
        stage: 'Valutazione e Progettazione',

        required_documents: [
          'Progetto definitivo',
          'Computo metrico',
          'Listini fornitori aggiornati'
        ],
        checklist_items: [
          { id: 'preventivo-economico-cl-1', text: 'Costo totale impianto (800-1200€/kWp)', checked: false },
          { id: 'preventivo-economico-cl-2', text: 'Verifica incentivi: Bonus 50%, Reddito Energetico, CER', checked: false },
          { id: 'preventivo-economico-cl-3', text: 'Calcolo risparmio annuo in bolletta', checked: false },
          { id: 'preventivo-economico-cl-4', text: 'ROI previsto 4-6 anni con detrazioni', checked: false },
          { id: 'preventivo-economico-cl-5', text: 'Proposta contratto e condizioni', checked: false }
        ],
        dependencies: ['progettazione-definitiva'],
        integration: null
      },
      // FASE 2: Autorizzazioni
      {
        id: 'verifica-iter-autorizzativo',
        name: 'Verifica Iter Autorizzativo',
        title: 'Verifica Iter Autorizzativo',
        description: 'Determinazione procedura autorizzativa: PAS, CILA o AU in base a potenza e vincoli',
        assignee: 'Progettista',
        duration_days: 2,
        stage: 'Autorizzazioni',

        required_documents: [
          'Estratto PRG comunale',
          'Verifica vincoli paesaggistici',
          'CDU - Certificato Destinazione Urbanistica'
        ],
        checklist_items: [
          { id: 'verifica-iter-autorizzativo-cl-1', text: 'Controllo potenza impianto per iter', checked: false },
          { id: 'verifica-iter-autorizzativo-cl-2', text: 'Verifica presenza vincoli', checked: false },
          { id: 'verifica-iter-autorizzativo-cl-3', text: 'Scelta procedura: PAS/CILA/AU', checked: false },
          { id: 'verifica-iter-autorizzativo-cl-4', text: 'Identificazione enti coinvolti', checked: false }
        ],
        dependencies: ['preventivo-economico'],
        integration: null
      },
      {
        id: 'presentazione-pas-cila',
        name: 'Presentazione PAS/CILA/AU',
        title: 'Presentazione PAS/CILA/AU',
        description: 'Compilazione e invio pratica edilizia secondo iter identificato. PAS/CILA via SUE/SUAP',
        assignee: 'Progettista',
        priority: TaskPriorityEnum.HIGH,
        duration_days: 2,
        stage: 'Autorizzazioni',

        required_documents: [
          'Progetto definitivo completo',
          'Relazione tecnica asseverata',
          'Documento identità proprietario',
          'Delega professionista',
          'Marca da bollo €16 (se richiesta)'
        ],
        checklist_items: [
          { id: 'presentazione-pas-cila-cl-1', text: 'Accesso portale SUAP/SUE con SPID/CIE', checked: false },
          { id: 'presentazione-pas-cila-cl-2', text: 'Compilazione moduli online', checked: false },
          { id: 'presentazione-pas-cila-cl-3', text: 'Upload elaborati (max 10MB per file)', checked: false },
          { id: 'presentazione-pas-cila-cl-4', text: 'Pagamento diritti segreteria', checked: false },
          { id: 'presentazione-pas-cila-cl-5', text: 'Protocollazione pratica', checked: false }
        ],
        dependencies: ['verifica-iter-autorizzativo'],
        integration: 'Municipality',
        deadline_days: 30
      },
      // FASE 3: Connessione DSO
      {
        id: 'richiesta-connessione-dso',
        name: 'Richiesta Connessione DSO - Modello Unico Parte I',
        title: 'Richiesta Connessione DSO - Modello Unico Parte I',
        description: 'Presentazione domanda connessione a E-Distribuzione con progetto definitivo',
        assignee: 'Asset Manager',
        priority: TaskPriorityEnum.HIGH,
        duration_days: 3,
        stage: 'Connessione DSO',

        required_documents: [
          'Progetto definitivo impianto (PDF max 10MB)',
          'Schema elettrico unifilare firmato',
          'Documento identità richiedente',
          'Visura catastale aggiornata',
          'Coordinate GPS punto connessione'
        ],
        checklist_items: [
          { id: 'richiesta-connessione-dso-cl-1', text: 'Registrazione portale E-Distribuzione', checked: false },
          { id: 'richiesta-connessione-dso-cl-2', text: 'Compilazione Modello Unico online', checked: false },
          { id: 'richiesta-connessione-dso-cl-3', text: 'Verifica power: BT≤100kW o MT>100kW', checked: false },
          { id: 'richiesta-connessione-dso-cl-4', text: 'Upload documentazione tecnica', checked: false },
          { id: 'richiesta-connessione-dso-cl-5', text: 'Invio pratica e protocollazione', checked: false }
        ],
        dependencies: ['presentazione-pas-cila'],
        integration: 'DSO'
      },
      {
        id: 'gestione-tica',
        name: 'Gestione Preventivo TICA',
        title: 'Gestione Preventivo TICA',
        description: 'Ricezione, valutazione e accettazione preventivo connessione entro 45 giorni',
        assignee: 'Asset Manager',
        priority: TaskPriorityEnum.MEDIUM,
        duration_days: 5,
        stage: 'Connessione DSO',

        required_documents: [],
        checklist_items: [
          { id: 'gestione-tica-cl-1', text: 'Ricezione TICA entro 20gg lavorativi', checked: false },
          { id: 'gestione-tica-cl-2', text: 'Analisi costi: quota fissa €100 + potenza + distanza', checked: false },
          { id: 'gestione-tica-cl-3', text: 'Verifica soluzione tecnica proposta', checked: false },
          { id: 'gestione-tica-cl-4', text: 'Accettazione entro 45gg (pena decadenza)', checked: false },
          { id: 'gestione-tica-cl-5', text: 'Bonifico corrispettivo con causale codice TICA', checked: false }
        ],
        dependencies: ['richiesta-connessione-dso'],
        integration: 'DSO',
        deadline_days: 45
      },
      // FASE 4: Installazione
      {
        id: 'preparazione-cantiere',
        name: 'Preparazione Cantiere e Sicurezza',
        title: 'Preparazione Cantiere e Sicurezza',
        description: 'Allestimento cantiere secondo D.Lgs 81/08 con PSC per cantieri > 200 uomini-giorno',
        assignee: 'Capo Cantiere',
        duration_days: 3,
        stage: 'Installazione',

        required_documents: [
          'PSC - Piano Sicurezza e Coordinamento',
          'POS - Piano Operativo Sicurezza',
          'DURC imprese esecutrici',
          'Nomina CSP/CSE se richiesto'
        ],
        checklist_items: [
          { id: 'preparazione-cantiere-cl-1', text: 'Recinzione e segnaletica cantiere', checked: false },
          { id: 'preparazione-cantiere-cl-2', text: 'Verifica DPI squadra installazione', checked: false },
          { id: 'preparazione-cantiere-cl-3', text: 'Installazione quadro elettrico cantiere', checked: false },
          { id: 'preparazione-cantiere-cl-4', text: 'Briefing sicurezza con operatori', checked: false },
          { id: 'preparazione-cantiere-cl-5', text: 'Notifica preliminare ASL/ITL se dovuta', checked: false }
        ],
        dependencies: ['gestione-tica'],
        integration: null
      },
      {
        id: 'installazione-impianto',
        name: 'Installazione Meccanica ed Elettrica',
        title: 'Installazione Meccanica ed Elettrica',
        description: 'Montaggio strutture, moduli FV, inverter e collegamenti elettrici secondo CEI 0-21',
        assignee: 'Installatore Qualificato',
        priority: TaskPriorityEnum.HIGH,
        duration_days: 10,
        stage: 'Installazione',

        required_documents: [
          'Progetto esecutivo',
          'Schemi di montaggio',
          'Manuali installazione componenti'
        ],
        checklist_items: [
          { id: 'installazione-impianto-cl-1', text: 'Montaggio strutture portanti', checked: false },
          { id: 'installazione-impianto-cl-2', text: 'Installazione moduli FV con serraggio corretto', checked: false },
          { id: 'installazione-impianto-cl-3', text: 'Posa cavi DC (PV1-F) e AC', checked: false },
          { id: 'installazione-impianto-cl-4', text: 'Montaggio inverter e quadri stringa', checked: false },
          { id: 'installazione-impianto-cl-5', text: 'Collegamenti equipotenziali e messa a terra', checked: false }
        ],
        dependencies: ['preparazione-cantiere'],
        integration: null
      },
      // FASE 5: Collaudo
      {
        id: 'verifiche-preliminari',
        name: 'Verifiche Preliminari e Test Elettrici',
        title: 'Verifiche Preliminari e Test Elettrici',
        description: 'Esecuzione test secondo CEI 82-25 prima della messa in servizio',
        assignee: 'Tecnico Verificatore',
        duration_days: 1,
        stage: 'Collaudo',

        required_documents: [
          'Schemi as-built impianto',
          'Certificazioni componenti',
          'Strumentazione calibrata'
        ],
        checklist_items: [
          { id: 'verifiche-preliminari-cl-1', text: 'Test isolamento stringhe (>1MΩ)', checked: false },
          { id: 'verifiche-preliminari-cl-2', text: 'Verifica polarità collegamenti DC', checked: false },
          { id: 'verifiche-preliminari-cl-3', text: 'Test continuità conduttori protezione', checked: false },
          { id: 'verifiche-preliminari-cl-4', text: 'Misura resistenza di terra (<10Ω)', checked: false },
          { id: 'verifiche-preliminari-cl-5', text: 'Verifica funzionamento protezioni', checked: false }
        ],
        dependencies: ['installazione-impianto'],
        integration: null
      },
      {
        id: 'dichiarazione-conformita',
        name: 'Dichiarazione di Conformità DM 37/08',
        title: 'Dichiarazione di Conformità DM 37/08',
        description: 'Rilascio DiCo da parte dell\'installatore abilitato con allegati obbligatori',
        assignee: 'Installatore Abilitato',
        duration_days: 1,
        stage: 'Collaudo',

        required_documents: [
          'Progetto as-built',
          'Schema unifilare aggiornato',
          'Report prove e misure',
          'Certificazioni materiali',
          'Visura CCIAA installatore'
        ],
        checklist_items: [
          { id: 'dichiarazione-conformita-cl-1', text: 'Compilazione modello DiCo ministeriale', checked: false },
          { id: 'dichiarazione-conformita-cl-2', text: 'Allegato schema impianto', checked: false },
          { id: 'dichiarazione-conformita-cl-3', text: 'Allegato report verifiche', checked: false },
          { id: 'dichiarazione-conformita-cl-4', text: 'Timbro e firma installatore', checked: false },
          { id: 'dichiarazione-conformita-cl-5', text: 'Consegna copia al committente', checked: false }
        ],
        dependencies: ['verifiche-preliminari'],
        integration: null
      },
      // FASE 6: Attivazione Connessione
      {
        id: 'comunicazione-fine-lavori',
        name: 'Comunicazione Fine Lavori - Modello Unico Parte II',
        title: 'Comunicazione Fine Lavori - Modello Unico Parte II',
        description: 'Invio documentazione fine lavori al DSO per attivazione connessione',
        assignee: 'Asset Manager',
        priority: TaskPriorityEnum.HIGH,
        duration_days: 2,
        stage: 'Attivazione Connessione',

        required_documents: [
          'Dichiarazione Conformità impianto',
          'Regolamento di Esercizio firmato',
          'Certificazione inverter e SPI',
          'Report verifica SPI secondo CEI 0-21',
          'Addendum Tecnico contratto'
        ],
        checklist_items: [
          { id: 'comunicazione-fine-lavori-cl-1', text: 'Accesso portale DSO', checked: false },
          { id: 'comunicazione-fine-lavori-cl-2', text: 'Compilazione Parte II online', checked: false },
          { id: 'comunicazione-fine-lavori-cl-3', text: 'Upload documentazione tecnica', checked: false },
          { id: 'comunicazione-fine-lavori-cl-4', text: 'Firma digitale documenti', checked: false },
          { id: 'comunicazione-fine-lavori-cl-5', text: 'Invio e protocollazione', checked: false }
        ],
        dependencies: ['dichiarazione-conformita'],
        integration: 'DSO'
      },
      {
        id: 'installazione-contatore',
        name: 'Installazione Contatore Bidirezionale',
        title: 'Installazione Contatore Bidirezionale',
        description: 'Intervento DSO per sostituzione contatore e attivazione produzione',
        assignee: 'Tecnico DSO',
        priority: TaskPriorityEnum.MEDIUM,
        duration_days: 1,
        stage: 'Attivazione Connessione',

        required_documents: [],
        checklist_items: [
          { id: 'installazione-contatore-cl-1', text: 'Programmazione intervento DSO', checked: false },
          { id: 'installazione-contatore-cl-2', text: 'Sostituzione contatore M2 bidirezionale', checked: false },
          { id: 'installazione-contatore-cl-3', text: 'Configurazione telegestione', checked: false },
          { id: 'installazione-contatore-cl-4', text: 'Test immissione in rete', checked: false },
          { id: 'installazione-contatore-cl-5', text: 'Rilascio verbale attivazione', checked: false }
        ],
        dependencies: ['comunicazione-fine-lavori'],
        integration: 'DSO'
      },
      // FASE 7: GAUDÌ
      {
        id: 'registrazione-gaudi',
        name: 'Registrazione Anagrafica GAUDÌ',
        title: 'Registrazione Anagrafica GAUDÌ',
        description: 'Censimento impianto nel sistema GAUDÌ di Terna per tracciabilità nazionale',
        assignee: 'Asset Manager',
        priority: TaskPriorityEnum.HIGH,
        duration_days: 2,
        stage: 'GAUDÌ',

        required_documents: [
          'Codice POD definitivo',
          'Codice rintracciabilità DSO',
          'Dati tecnici moduli/inverter',
          'Coordinate geografiche impianto'
        ],
        checklist_items: [
          { id: 'registrazione-gaudi-cl-1', text: 'Creazione account GAUDÌ produttore', checked: false },
          { id: 'registrazione-gaudi-cl-2', text: 'Inserimento dati anagrafici', checked: false },
          { id: 'registrazione-gaudi-cl-3', text: 'Inserimento dati tecnici impianto', checked: false },
          { id: 'registrazione-gaudi-cl-4', text: 'Upload documenti richiesti', checked: false },
          { id: 'registrazione-gaudi-cl-5', text: 'Validazione e invio pratica', checked: false }
        ],
        dependencies: ['installazione-contatore'],
        integration: 'Terna'
      },
      {
        id: 'validazione-flussi-gaudi',
        name: 'Validazione Flussi GAUDÌ',
        title: 'Validazione Flussi GAUDÌ',
        description: 'Monitoraggio flussi informativi G01, G02, G04 tra DSO e Terna',
        assignee: 'Sistema',
        priority: TaskPriorityEnum.LOW,
        duration_days: 5,
        stage: 'GAUDÌ',

        required_documents: [],
        checklist_items: [
          { id: 'validazione-flussi-gaudi-cl-1', text: 'Ricezione flusso G01 da DSO', checked: false },
          { id: 'validazione-flussi-gaudi-cl-2', text: 'Conferma G02 dati tecnici', checked: false },
          { id: 'validazione-flussi-gaudi-cl-3', text: 'Validazione finale G04', checked: false },
          { id: 'validazione-flussi-gaudi-cl-4', text: 'Attivazione codice CENSIMP', checked: false },
          { id: 'validazione-flussi-gaudi-cl-5', text: 'Download attestato GAUDÌ', checked: false }
        ],
        dependencies: ['registrazione-gaudi'],
        integration: 'Terna'
      },
      // FASE 8: GSE
      {
        id: 'attivazione-rid-gse',
        name: 'Attivazione Ritiro Dedicato GSE',
        title: 'Attivazione Ritiro Dedicato GSE',
        description: 'Richiesta convenzione RID per vendita energia non autoconsumata',
        assignee: 'Asset Manager',
        priority: TaskPriorityEnum.MEDIUM,
        duration_days: 3,
        stage: 'GSE',

        required_documents: [
          'Codice CENSIMP da GAUDÌ',
          'IBAN per accrediti',
          'Documento identità',
          'Mandato se delegato'
        ],
        checklist_items: [
          { id: 'attivazione-rid-gse-cl-1', text: 'Accesso Area Clienti con SPID', checked: false },
          { id: 'attivazione-rid-gse-cl-2', text: 'Configurazione MFA obbligatoria', checked: false },
          { id: 'attivazione-rid-gse-cl-3', text: 'Compilazione modulo RID online', checked: false },
          { id: 'attivazione-rid-gse-cl-4', text: 'Upload documentazione', checked: false },
          { id: 'attivazione-rid-gse-cl-5', text: 'Invio richiesta convenzione', checked: false }
        ],
        dependencies: ['validazione-flussi-gaudi'],
        integration: 'GSE'
      },
      {
        id: 'comunicazione-antimafia',
        name: 'Documentazione Antimafia (se > 150k€)',
        title: 'Documentazione Antimafia (se > 150k€)',
        description: 'Presentazione documentazione antimafia per impianti con incentivi superiori a 150.000€',
        assignee: 'Legale',
        duration_days: 7,
        stage: 'GSE',

        required_documents: [
          'Visura camerale aggiornata',
          'Documenti soci e amministratori',
          'Dichiarazioni sostitutive antimafia',
          'Certificati carichi pendenti'
        ],
        checklist_items: [
          { id: 'comunicazione-antimafia-cl-1', text: 'Verifica soglia incentivi totali', checked: false },
          { id: 'comunicazione-antimafia-cl-2', text: 'Raccolta documentazione societaria', checked: false },
          { id: 'comunicazione-antimafia-cl-3', text: 'Compilazione dichiarazioni', checked: false },
          { id: 'comunicazione-antimafia-cl-4', text: 'Invio tramite Area Clienti GSE', checked: false },
          { id: 'comunicazione-antimafia-cl-5', text: 'Monitoraggio esito verifica', checked: false }
        ],
        dependencies: ['attivazione-rid-gse'],
        integration: 'GSE',
        application_condition: 'incentivi_totali > 150000'
      },
      // FASE 9: Dogane (se > 20kW)
      {
        id: 'denuncia-officina-elettrica',
        name: 'Denuncia Officina Elettrica ADM',
        title: 'Denuncia Officina Elettrica ADM',
        description: 'Registrazione impianto > 20kW come officina elettrica presso Agenzia Dogane',
        assignee: 'Fiscalista',
        priority: TaskPriorityEnum.HIGH,
        duration_days: 4,
        stage: 'Dogane',

        required_documents: [
          'Planimetria con schema unifilare',
          'Ubicazione contatori fiscali',
          'Dati tecnici impianto',
          'Visura camerale'
        ],
        checklist_items: [
          { id: 'denuncia-officina-elettrica-cl-1', text: 'Compilazione modello AD-1', checked: false },
          { id: 'denuncia-officina-elettrica-cl-2', text: 'Preparazione planimetria fiscale', checked: false },
          { id: 'denuncia-officina-elettrica-cl-3', text: 'Calcolo franchigia 20kW', checked: false },
          { id: 'denuncia-officina-elettrica-cl-4', text: 'Firma digitale documenti', checked: false },
          { id: 'denuncia-officina-elettrica-cl-5', text: 'Invio telematico PUDM', checked: false }
        ],
        dependencies: ['attivazione-rid-gse'],
        integration: 'Customs',
        application_condition: 'potenza > 20'
      },
      {
        id: 'licenza-esercizio-dogane',
        name: 'Ottenimento Licenza Esercizio',
        title: 'Ottenimento Licenza Esercizio',
        description: 'Ricezione licenza officina elettrica da ADM per esercizio legale',
        assignee: 'Sistema',
        priority: TaskPriorityEnum.LOW,
        duration_days: 10,
        stage: 'Dogane',

        required_documents: [],
        checklist_items: [
          { id: 'licenza-esercizio-dogane-cl-1', text: 'Monitoraggio pratica PUDM', checked: false },
          { id: 'licenza-esercizio-dogane-cl-2', text: 'Eventuale integrazione documenti', checked: false },
          { id: 'licenza-esercizio-dogane-cl-3', text: 'Ricezione licenza UTF', checked: false },
          { id: 'licenza-esercizio-dogane-cl-4', text: 'Registrazione numero licenza', checked: false },
          { id: 'licenza-esercizio-dogane-cl-5', text: 'Archiviazione documento', checked: false }
        ],
        dependencies: ['denuncia-officina-elettrica'],
        integration: 'Customs'
      }
    ]
  },
  {
    id: 'nuova-connessione-dso',
    name: 'Nuova Connessione DSO',
    description: 'Processo completo per la connessione di un nuovo plant alla rete del distributore',
    category: WorkflowCategoryEnum.ACTIVATION,

    tasks: [
      {
        id: 'richiesta-connessione',
        name: 'Richiesta di Connessione',
        title: 'Richiesta di Connessione',
        description: 'Compilazione e invio domanda di connessione al DSO tramite portale o PEC',
        assignee: 'Asset Manager',
        duration_days: 2,
        stage: 'Connessione',

        required_documents: [
          'Documento identità titolare',
          'Mandato di rappresentanza',
          'Schema elettrico unifilare',
          'Planimetria catastale',
          'Dichiarazione disponibilità sito'
        ],
        checklist_items: [
          { id: 'richiesta-connessione-cl-1', text: 'Verifica completezza documentazione', checked: false },
          { id: 'richiesta-connessione-cl-2', text: 'Pagamento corrispettivo preventivo', checked: false },
          { id: 'richiesta-connessione-cl-3', text: 'Invio pratica al DSO', checked: false }
        ],
        dependencies: [],
        integration: 'DSO'
      },
      {
        id: 'gestione-tica',
        name: 'Gestione Preventivo TICA',
        title: 'Gestione Preventivo TICA',
        description: 'Ricezione, valutazione e accettazione del preventivo di connessione',
        assignee: 'Asset Manager',
        duration_days: 5,
        stage: 'Connessione',

        required_documents: [],
        checklist_items: [
          { id: 'gestione-tica-cl-1', text: 'Ricezione TICA dal DSO', checked: false },
          { id: 'gestione-tica-cl-2', text: 'Analisi tecnico-economica', checked: false },
          { id: 'gestione-tica-cl-3', text: 'Accettazione e pagamento', checked: false }
        ],
        dependencies: ['richiesta-connessione'],
        integration: 'DSO',
        deadline_days: 45
      },
      {
        id: 'comunicazione-fine-lavori',
        name: 'Comunicazione Fine Lavori',
        title: 'Comunicazione Fine Lavori',
        description: 'Invio documentazione di fine lavori per attivazione connessione',
        assignee: 'Tecnico',
        duration_days: 1,
        stage: 'Attivazione',

        required_documents: [
          'Regolamento di Esercizio',
          'Dichiarazione conformità plant',
          'Dichiarazione conformità inverter/SPI',
          'Report verifica SPI'
        ],
        checklist_items: [
          { id: 'comunicazione-fine-lavori-cl-1', text: 'Raccolta certificazioni', checked: false },
          { id: 'comunicazione-fine-lavori-cl-2', text: 'Verifica conformità normativa', checked: false },
          { id: 'comunicazione-fine-lavori-cl-3', text: 'Invio comunicazione', checked: false }
        ],
        dependencies: ['gestione-tica'],
        integration: 'DSO'
      }
    ]
  },
  {
    id: 'registrazione-gaudi',
    name: 'Registrazione GAUDÌ',
    description: 'Censimento plant nel sistema GAUDÌ di Terna',
    category: WorkflowCategoryEnum.ACTIVATION,

    tasks: [
      {
        id: 'creazione-account',
        name: 'Creazione Account GAUDÌ',
        title: 'Creazione Account GAUDÌ',
        description: 'Registrazione operatore/mandatario su portale GAUDÌ',
        assignee: 'Asset Manager',
        duration_days: 1,
        stage: 'Registrazione',

        required_documents: ['Documento identità', 'Dati aziendali'],
        checklist_items: [
          { id: 'creazione-account-cl-1', text: 'Registrazione portale', checked: false },
          { id: 'creazione-account-cl-2', text: 'Verifica credenziali', checked: false },
          { id: 'creazione-account-cl-3', text: 'Abilitazione profilo', checked: false }
        ],
        dependencies: [],
        integration: 'Terna'
      },
      {
        id: 'inserimento-registry',
        name: 'Inserimento registry plant',
        title: 'Inserimento registry plant',
        description: 'Compilazione dati tecnici plant su GAUDÌ',
        assignee: 'Asset Manager',
        duration_days: 1,
        stage: 'Registrazione',

        required_documents: [
          'Codice POD',
          'Codice rintracciabilità DSO',
          'Schede tecniche pannelli/inverter'
        ],
        checklist_items: [
          { id: 'inserimento-registry-cl-1', text: 'Inserimento dati produttore', checked: false },
          { id: 'inserimento-registry-cl-2', text: 'Inserimento dati tecnici', checked: false },
          { id: 'inserimento-registry-cl-3', text: 'Validazione registry', checked: false }
        ],
        dependencies: ['creazione-account', 'comunicazione-fine-lavori'],
        integration: 'Terna'
      },
      {
        id: 'monitoraggio-flussi',
        name: 'Monitoraggio Flussi Validazione',
        title: 'Monitoraggio Flussi Validazione',
        description: 'Verifica status flussi G01, G02, G04 tra DSO e Terna',
        assignee: 'Sistema',
        duration_days: 3,
        stage: 'Validazione',

        required_documents: [],
        checklist_items: [
          { id: 'monitoraggio-flussi-cl-1', text: 'Ricezione flusso G01', checked: false },
          { id: 'monitoraggio-flussi-cl-2', text: 'Conferma G02', checked: false },
          { id: 'monitoraggio-flussi-cl-3', text: 'Attivazione G04', checked: false }
        ],
        dependencies: ['inserimento-registry'],
        integration: 'Terna'
      }
    ]
  },
  {
    id: 'attivazione-rid-gse',
    name: 'Attivazione Ritiro Dedicato GSE',
    description: 'Attivazione convenzione di Ritiro Dedicato con il GSE',
    category: WorkflowCategoryEnum.INCENTIVES,

    tasks: [
      {
        id: 'accesso-area-clienti',
        name: 'Accesso Area Clienti GSE',
        title: 'Accesso Area Clienti GSE',
        description: 'Login con SPID o credenziali + MFA',
        assignee: 'Asset Manager',
        duration_days: 1,
        stage: 'Accesso',

        required_documents: [],
        checklist_items: [
          { id: 'accesso-area-clienti-cl-1', text: 'Verifica credenziali SPID', checked: false },
          { id: 'accesso-area-clienti-cl-2', text: 'Configurazione MFA', checked: false },
          { id: 'accesso-area-clienti-cl-3', text: 'Accesso portale', checked: false }
        ],
        dependencies: [],
        integration: 'GSE'
      },
      {
        id: 'compilazione-rid',
        name: 'Compilazione Richiesta RID',
        title: 'Compilazione Richiesta RID',
        description: 'Inserimento dati per convenzione Ritiro Dedicato',
        assignee: 'Asset Manager',
        duration_days: 2,
        stage: 'Compilazione',

        required_documents: [
          'Dati plant da GAUDÌ',
          'Coordinate bancarie',
          'Documentazione societaria'
        ],
        checklist_items: [
          { id: 'compilazione-rid-cl-1', text: 'Compilazione moduli', checked: false },
          { id: 'compilazione-rid-cl-2', text: 'Upload documenti', checked: false },
          { id: 'compilazione-rid-cl-3', text: 'Invio richiesta', checked: false }
        ],
        dependencies: ['accesso-area-clienti', 'monitoraggio-flussi'],
        integration: 'GSE'
      },
      {
        id: 'pratica-antimafia',
        name: 'Dichiarazione Antimafia',
        title: 'Dichiarazione Antimafia',
        description: 'Presentazione documentazione antimafia se incentivi > 150k€',
        assignee: 'Legale',
        duration_days: 5,
        stage: 'Compilazione',

        required_documents: [
          'Visura camerale',
          'Documenti soci',
          'Dichiarazioni sostitutive'
        ],
        checklist_items: [
          { id: 'pratica-antimafia-cl-1', text: 'Verifica soglia incentivi', checked: false },
          { id: 'pratica-antimafia-cl-2', text: 'Raccolta documentazione', checked: false },
          { id: 'pratica-antimafia-cl-3', text: 'Invio dichiarazione', checked: false }
        ],
        dependencies: ['compilazione-rid'],
        integration: 'GSE',
        application_condition: 'incentivi > 150000'
      }
    ]
  },
  {
    id: 'denuncia-officina-elettrica',
    name: 'Denuncia Officina Elettrica',
    description: 'Registrazione plant > 20kW presso Agenzia Dogane',
    category: WorkflowCategoryEnum.FISCAL,

    tasks: [
      {
        id: 'preparazione-denuncia',
        name: 'Preparazione Denuncia',
        title: 'Preparazione Denuncia',
        description: 'Compilazione moduli denuncia officina elettrica',
        assignee: 'Fiscalista',
        duration_days: 3,
        stage: 'Preparazione',

        required_documents: [
          'Dati tecnici plant',
          'Planimetria con contatori',
          'Schema unifilare fiscale'
        ],
        checklist_items: [
          { id: 'preparazione-denuncia-cl-1', text: 'Verifica potenza > 20kW', checked: false },
          { id: 'preparazione-denuncia-cl-2', text: 'Compilazione modelli', checked: false },
          { id: 'preparazione-denuncia-cl-3', text: 'Preparazione allegati', checked: false }
        ],
        dependencies: [],
        integration: 'Customs',
        application_condition: 'potenza > 20'
      },
      {
        id: 'invio-telematico',
        name: 'Invio Telematico PUDM',
        title: 'Invio Telematico PUDM',
        description: 'Trasmissione denuncia tramite portale o EDI',
        assignee: 'Fiscalista',
        duration_days: 1,
        stage: 'Invio',

        required_documents: [],
        checklist_items: [
          { id: 'invio-telematico-cl-1', text: 'Accesso PUDM con SPID/CNS', checked: false },
          { id: 'invio-telematico-cl-2', text: 'Upload documentazione', checked: false },
          { id: 'invio-telematico-cl-3', text: 'Protocollazione pratica', checked: false }
        ],
        dependencies: ['preparazione-denuncia'],
        integration: 'Customs'
      },
      {
        id: 'ottenimento-licenza',
        name: 'Ottenimento Licenza Esercizio',
        title: 'Ottenimento Licenza Esercizio',
        description: 'Ricezione licenza officina elettrica',
        assignee: 'Sistema',
        duration_days: 10,
        stage: 'Completamento',

        required_documents: [],
        checklist_items: [
          { id: 'ottenimento-licenza-cl-1', text: 'Monitoraggio status pratica', checked: false },
          { id: 'ottenimento-licenza-cl-2', text: 'Ricezione licenza', checked: false },
          { id: 'ottenimento-licenza-cl-3', text: 'Archiviazione documento', checked: false }
        ],
        dependencies: ['invio-telematico'],
        integration: 'Customs'
      }
    ]
  },
  {
    id: 'dichiarazione-annuale-consumo',
    name: 'Dichiarazione Annuale Consumo',
    description: 'Dichiarazione annuale produzione e consumo energia',
    category: WorkflowCategoryEnum.FISCAL,

    recurrence: 'Annual',
    deadline: { month: 3, day: 31 },
    tasks: [
      {
        id: 'raccolta-dati-produzione',
        name: 'Raccolta Dati Produzione',
        title: 'Raccolta Dati Produzione',
        description: 'Lettura contatori e calcolo produzioni annuali',
        assignee: 'Tecnico',
        duration_days: 2,
        stage: 'Raccolta Dati',

        required_documents: ['Letture mensili contatori'],
        checklist_items: [
          { id: 'raccolta-dati-produzione-cl-1', text: 'Verifica letture mensili', checked: false },
          { id: 'raccolta-dati-produzione-cl-2', text: 'Calcolo total annuali', checked: false },
          { id: 'raccolta-dati-produzione-cl-3', text: 'Validazione dati', checked: false }
        ],
        dependencies: [],
        integration: null
      },
      {
        id: 'generazione-file-edi',
        name: 'Generazione File EDI',
        title: 'Generazione File EDI',
        description: 'Creazione file formato Idoc per invio telematico',
        assignee: 'Sistema',
        duration_days: 1,
        stage: 'Generazione File',

        required_documents: [],
        checklist_items: [
          { id: 'generazione-file-edi-cl-1', text: 'Formattazione dati Idoc', checked: false },
          { id: 'generazione-file-edi-cl-2', text: 'Generazione firma elettronica', checked: false },
          { id: 'generazione-file-edi-cl-3', text: 'Validazione tracciato', checked: false }
        ],
        dependencies: ['raccolta-dati-produzione'],
        integration: 'Customs'
      },
      {
        id: 'invio-s2s',
        name: 'Invio System-to-System',
        title: 'Invio System-to-System',
        description: 'Trasmissione file EDI tramite canale S2S',
        assignee: 'Sistema',
        duration_days: 1,
        stage: 'Invio',

        required_documents: [],
        checklist_items: [
          { id: 'invio-s2s-cl-1', text: 'Connessione canale S2S', checked: false },
          { id: 'invio-s2s-cl-2', text: 'Upload file firmato', checked: false },
          { id: 'invio-s2s-cl-3', text: 'Conferma ricevuta', checked: false }
        ],
        dependencies: ['generazione-file-edi'],
        integration: 'Customs'
      }
    ]
  },
  {
    id: 'revamping-potenziamento',
    name: 'Revamping/Potenziamento plant',
    description: 'Gestione modifiche sostanziali plant esistente',
    category: WorkflowCategoryEnum.CHANGES,

    tasks: [
      {
        id: 'progettazione-intervento',
        name: 'Progettazione Intervento',
        title: 'Progettazione Intervento',
        description: 'Studio fattibilità e progettazione modifiche',
        assignee: 'Progettista',
        duration_days: 10,
        stage: 'Progettazione',

        required_documents: [
          'Status attuale plant',
          'Specifiche nuovi componenti',
          'Analisi producibilità'
        ],
        checklist_items: [
          { id: 'progettazione-intervento-cl-1', text: 'Analisi tecnica', checked: false },
          { id: 'progettazione-intervento-cl-2', text: 'Valutazione economica', checked: false },
          { id: 'progettazione-intervento-cl-3', text: 'Approvazione progetto', checked: false }
        ],
        dependencies: [],
        integration: null
      },
      {
        id: 'modifica-connessione',
        name: 'Modifica Connessione DSO',
        title: 'Modifica Connessione DSO',
        description: 'Richiesta adeguamento connessione per nuova potenza',
        assignee: 'Asset Manager',
        duration_days: 5,
        stage: 'Connessione',

        required_documents: [
          'Progetto modifiche',
          'Nuovi schemi elettrici',
          'Dichiarazioni conformità'
        ],
        checklist_items: [
          { id: 'modifica-connessione-cl-1', text: 'Invio richiesta modifica', checked: false },
          { id: 'modifica-connessione-cl-2', text: 'Ricezione nuovo TICA', checked: false },
          { id: 'modifica-connessione-cl-3', text: 'Accettazione preventivo', checked: false }
        ],
        dependencies: ['progettazione-intervento'],
        integration: 'DSO'
      },
      {
        id: 'aggiornamento-gaudi',
        name: 'Aggiornamento GAUDÌ',
        title: 'Aggiornamento GAUDÌ',
        description: 'Modifica dati tecnici su portale GAUDÌ',
        assignee: 'Asset Manager',
        duration_days: 2,
        stage: 'Aggiornamento',

        required_documents: ['Nuove schede tecniche'],
        checklist_items: [
          { id: 'aggiornamento-gaudi-cl-1', text: 'Accesso sezione modifiche', checked: false },
          { id: 'aggiornamento-gaudi-cl-2', text: 'Aggiornamento dati', checked: false },
          { id: 'aggiornamento-gaudi-cl-3', text: 'Validazione modifiche', checked: false }
        ],
        dependencies: ['modifica-connessione'],
        integration: 'Terna'
      },
      {
        id: 'comunicazione-gse',
        name: 'Comunicazione Modifiche GSE',
        title: 'Comunicazione Modifiche GSE',
        description: 'Notifica variazioni per mantenimento incentivi',
        assignee: 'Asset Manager',
        duration_days: 3,
        stage: 'Comunicazione',

        required_documents: [
          'Relazione tecnica modifiche',
          'Autorizzazioni ottenute'
        ],
        checklist_items: [
          { id: 'comunicazione-gse-cl-1', text: 'Compilazione moduli GSE', checked: false },
          { id: 'comunicazione-gse-cl-2', text: 'Upload documentazione', checked: false },
          { id: 'comunicazione-gse-cl-3', text: 'Conferma mantenimento incentivi', checked: false }
        ],
        dependencies: ['aggiornamento-gaudi'],
        integration: 'GSE'
      }
    ]
  },
  {
    id: 'voltura-plant',
    name: 'Voltura Titolarità plant',
    description: 'Cambio proprietà o gestione plant',
    category: WorkflowCategoryEnum.CHANGES,

    tasks: [
      {
        id: 'preparazione-atti',
        name: 'Preparazione Documentazione',
        title: 'Preparazione Documentazione',
        description: 'Raccolta atti cessione e documenti nuovo titolare',
        assignee: 'Legale',
        duration_days: 5,
        stage: 'Preparazione',

        required_documents: [
          'Atto di cessione',
          'Documenti nuovo titolare',
          'Visure camerali'
        ],
        checklist_items: [
          { id: 'preparazione-atti-cl-1', text: 'Verifica atti notarili', checked: false },
          { id: 'preparazione-atti-cl-2', text: 'Controllo documentazione', checked: false },
          { id: 'preparazione-atti-cl-3', text: 'Preparazione dichiarazioni', checked: false }
        ],
        dependencies: [],
        integration: null
      },
      {
        id: 'voltura-dso',
        name: 'Voltura Contratto DSO',
        title: 'Voltura Contratto DSO',
        description: 'Cambio intestazione contratto connessione',
        assignee: 'Asset Manager',
        duration_days: 2,
        stage: 'Voltura',

        required_documents: ['Modulo voltura DSO'],
        checklist_items: [
          { id: 'voltura-dso-cl-1', text: 'Compilazione modulo', checked: false },
          { id: 'voltura-dso-cl-2', text: 'Invio richiesta', checked: false },
          { id: 'voltura-dso-cl-3', text: 'Conferma voltura', checked: false }
        ],
        dependencies: ['preparazione-atti'],
        integration: 'DSO'
      },
      {
        id: 'voltura-terna',
        name: 'Aggiornamento Titolarità GAUDÌ',
        title: 'Aggiornamento Titolarità GAUDÌ',
        description: 'Modifica registry titolare su GAUDÌ',
        assignee: 'Asset Manager',
        duration_days: 2,
        stage: 'Voltura',

        required_documents: [],
        checklist_items: [
          { id: 'voltura-terna-cl-1', text: 'Accesso GAUDÌ', checked: false },
          { id: 'voltura-terna-cl-2', text: 'Modifica titolarità', checked: false },
          { id: 'voltura-terna-cl-3', text: 'Validazione cambio', checked: false }
        ],
        dependencies: ['voltura-dso'],
        integration: 'Terna'
      },
      {
        id: 'voltura-gse',
        name: 'Voltura Convenzioni GSE',
        title: 'Voltura Convenzioni GSE',
        description: 'Subentro convenzioni incentivanti',
        assignee: 'Asset Manager',
        duration_days: 3,
        stage: 'Voltura',

        required_documents: [
          'Dichiarazione subentro',
          'Nuove coordinate bancarie'
        ],
        checklist_items: [
          { id: 'voltura-gse-cl-1', text: 'Richiesta subentro', checked: false },
          { id: 'voltura-gse-cl-2', text: 'Verifica requisiti', checked: false },
          { id: 'voltura-gse-cl-3', text: 'Attivazione nuovo titolare', checked: false }
        ],
        dependencies: ['voltura-terna'],
        integration: 'GSE'
      },
      {
        id: 'voltura-dogane',
        name: 'Voltura Licenza Dogane',
        title: 'Voltura Licenza Dogane',
        description: 'Cambio titolarità officina elettrica',
        assignee: 'Fiscalista',
        duration_days: 4,
        stage: 'Voltura',

        required_documents: ['Modelli voltura officina'],
        checklist_items: [
          { id: 'voltura-dogane-cl-1', text: 'Comunicazione cessione', checked: false },
          { id: 'voltura-dogane-cl-2', text: 'Nuova denuncia', checked: false },
          { id: 'voltura-dogane-cl-3', text: 'Rilascio nuova licenza', checked: false }
        ],
        dependencies: ['preparazione-atti'],
        integration: 'Customs',
        application_condition: 'potenza > 20'
      }
    ]
  },
  // Quick Installation Workflow for Small Residential Plants < 6kW
  {
    id: 'installazione-rapida-residenziale',
    name: 'Installazione Rapida Residenziale < 6kW',
    description: 'Procedura semplificata per impianti residenziali sotto 6kW con iter autorizzativo ridotto',
    category: WorkflowCategoryEnum.ACTIVATION,

    tasks: [
      {
        id: 'valutazione-rapida',
        name: 'Valutazione Rapida e Preventivo',
        title: 'Valutazione Rapida e Preventivo',
        description: 'Analisi semplificata consumi e fattibilità per impianti residenziali standard',
        assignee: 'Commerciale',
        duration_days: 1,
        stage: 'Valutazione',

        required_documents: [
          'Ultima bolletta elettrica',
          'Foto tetto/copertura',
          'Dati catastali base'
        ],
        checklist_items: [
          { id: 'valutazione-rapida-cl-1', text: 'Stima consumo da ultima bolletta', checked: false },
          { id: 'valutazione-rapida-cl-2', text: 'Verifica idoneità tetto da foto', checked: false },
          { id: 'valutazione-rapida-cl-3', text: 'Calcolo rapido dimensionamento (1kW = 1000kWh/anno)', checked: false },
          { id: 'valutazione-rapida-cl-4', text: 'Preventivo con detrazione 50%', checked: false }
        ],
        dependencies: [],
        integration: null
      },
      {
        id: 'cila-semplificata',
        name: 'CILA Semplificata < 6kW',
        title: 'CILA Semplificata < 6kW',
        description: 'Comunicazione Inizio Lavori Asseverata per piccoli impianti domestici',
        assignee: 'Progettista',
        duration_days: 1,
        stage: 'Autorizzazione',

        required_documents: [
          'Modulo CILA precompilato',
          'Schema semplificato impianto',
          'Documento identità'
        ],
        checklist_items: [
          { id: 'cila-semplificata-cl-1', text: 'Compilazione CILA online', checked: false },
          { id: 'cila-semplificata-cl-2', text: 'Upload schema base', checked: false },
          { id: 'cila-semplificata-cl-3', text: 'Invio immediato pratica', checked: false },
          { id: 'cila-semplificata-cl-4', text: 'Inizio lavori stesso giorno', checked: false }
        ],
        dependencies: ['valutazione-rapida'],
        integration: 'Municipality'
      },
      {
        id: 'installazione-express',
        name: 'Installazione Express 2 giorni',
        title: 'Installazione Express 2 giorni',
        description: 'Installazione rapida con squadra dedicata per impianti standard',
        assignee: 'Installatore',
        duration_days: 2,
        stage: 'Installazione',

        required_documents: [
          'Accesso al sito',
          'Schema impianto base'
        ],
        checklist_items: [
          { id: 'installazione-express-cl-1', text: 'Giorno 1: montaggio strutture e moduli', checked: false },
          { id: 'installazione-express-cl-2', text: 'Giorno 1: cablaggio DC', checked: false },
          { id: 'installazione-express-cl-3', text: 'Giorno 2: inverter e collegamento AC', checked: false },
          { id: 'installazione-express-cl-4', text: 'Giorno 2: test e collaudo base', checked: false }
        ],
        dependencies: ['cila-semplificata'],
        integration: null
      },
      {
        id: 'attivazione-semplificata',
        name: 'Attivazione Semplificata SSP',
        title: 'Attivazione Semplificata SSP',
        description: 'Procedura fast-track per Scambio Sul Posto impianti < 6kW',
        assignee: 'Asset Manager',
        duration_days: 3,
        stage: 'Attivazione',

        required_documents: [
          'DiCo impianto',
          'Codice POD',
          'IBAN'
        ],
        checklist_items: [
          { id: 'attivazione-semplificata-cl-1', text: 'Comunicazione DSO fine lavori', checked: false },
          { id: 'attivazione-semplificata-cl-2', text: 'Registrazione GAUDÌ veloce', checked: false },
          { id: 'attivazione-semplificata-cl-3', text: 'Richiesta SSP automatica', checked: false },
          { id: 'attivazione-semplificata-cl-4', text: 'Attivazione entro 15gg', checked: false }
        ],
        dependencies: ['installazione-express'],
        integration: 'GSE'
      }
    ]
  },
  // Commercial Installation Workflow for Plants > 20kW
  {
    id: 'installazione-commerciale-grande',
    name: 'Installazione Commerciale/Industriale > 20kW',
    description: 'Processo completo per grandi impianti con requisiti aggiuntivi fiscali e autorizzativi',
    category: WorkflowCategoryEnum.ACTIVATION,

    tasks: [
      {
        id: 'studio-fattibilita-avanzato',
        name: 'Studio Fattibilità Avanzato',
        title: 'Studio Fattibilità Avanzato',
        description: 'Analisi dettagliata con business case e ottimizzazione fiscale per grandi impianti',
        assignee: 'Energy Manager',
        duration_days: 15,
        stage: 'Studio Fattibilità',

        required_documents: [
          'Curve di carico orarie',
          'Fatture energia ultimo anno',
          'Layout stabilimento',
          'Bilanci aziendali'
        ],
        checklist_items: [
          { id: 'studio-fattibilita-avanzato-cl-1', text: 'Analisi curve di carico 8760h', checked: false },
          { id: 'studio-fattibilita-avanzato-cl-2', text: 'Ottimizzazione taglia con accumulo', checked: false },
          { id: 'studio-fattibilita-avanzato-cl-3', text: 'Valutazione SEU/RIU', checked: false },
          { id: 'studio-fattibilita-avanzato-cl-4', text: 'Business plan dettagliato', checked: false },
          { id: 'studio-fattibilita-avanzato-cl-5', text: 'Analisi incentivi disponibili', checked: false }
        ],
        dependencies: [],
        integration: null
      },
      {
        id: 'autorizzazione-unica',
        name: 'Autorizzazione Unica Regionale',
        title: 'Autorizzazione Unica Regionale',
        description: 'Iter AU per impianti > 20kW o in aree vincolate, conferenza servizi',
        assignee: 'Progettista',
        duration_days: 10,
        stage: 'Autorizzazione',

        required_documents: [
          'Progetto definitivo completo',
          'VIA screening (se richiesto)',
          'Relazione paesaggistica',
          'Studio impatto ambientale',
          'Pareri enti (VVF, ASL, ARPA)'
        ],
        checklist_items: [
          { id: 'autorizzazione-unica-cl-1', text: 'Presentazione istanza Regione', checked: false },
          { id: 'autorizzazione-unica-cl-2', text: 'Convocazione conferenza servizi', checked: false },
          { id: 'autorizzazione-unica-cl-3', text: 'Acquisizione pareri enti', checked: false },
          { id: 'autorizzazione-unica-cl-4', text: 'Rilascio AU entro 90gg', checked: false },
          { id: 'autorizzazione-unica-cl-5', text: 'Pubblicazione BURT', checked: false }
        ],
        dependencies: ['studio-fattibilita-avanzato'],
        integration: 'Region',
        deadline_days: 90
      },
      {
        id: 'gara-appalto',
        name: 'Gara Appalto Fornitura',
        title: 'Gara Appalto Fornitura',
        description: 'Procedura di selezione fornitori per grandi impianti con capitolato tecnico',
        assignee: 'Procurement',
        duration_days: 20,
        stage: 'Appalto',

        required_documents: [
          'Capitolato tecnico',
          'Computo metrico estimativo',
          'Criteri valutazione offerte'
        ],
        checklist_items: [
          { id: 'gara-appalto-cl-1', text: 'Pubblicazione bando/inviti', checked: false },
          { id: 'gara-appalto-cl-2', text: 'Ricezione offerte tecniche', checked: false },
          { id: 'gara-appalto-cl-3', text: 'Valutazione comparativa', checked: false },
          { id: 'gara-appalto-cl-4', text: 'Aggiudicazione fornitura', checked: false },
          { id: 'gara-appalto-cl-5', text: 'Contratto EPC', checked: false }
        ],
        dependencies: ['autorizzazione-unica'],
        integration: null
      },
      {
        id: 'cantiere-industriale',
        name: 'Cantiere Industriale Complesso',
        title: 'Cantiere Industriale Complesso',
        description: 'Gestione cantiere di grandi dimensioni con più imprese e CSE obbligatorio',
        assignee: 'Project Manager',
        duration_days: 30,
        stage: 'Cantiere',

        required_documents: [
          'PSC dettagliato',
          'POS tutte le imprese',
          'Notifica preliminare',
          'Permessi accesso area'
        ],
        checklist_items: [
          { id: 'cantiere-industriale-cl-1', text: 'Nomina CSP/CSE', checked: false },
          { id: 'cantiere-industriale-cl-2', text: 'Coordinamento imprese', checked: false },
          { id: 'cantiere-industriale-cl-3', text: 'Cronoprogramma dettagliato', checked: false },
          { id: 'cantiere-industriale-cl-4', text: 'Riunioni sicurezza settimanali', checked: false },
          { id: 'cantiere-industriale-cl-5', text: 'Verifiche intermedie', checked: false }
        ],
        dependencies: ['gara-appalto'],
        integration: null
      },
      {
        id: 'connessione-mt',
        name: 'Connessione Media Tensione',
        title: 'Connessione Media Tensione',
        description: 'Realizzazione cabina MT/BT e connessione dedicata per grandi potenze',
        assignee: 'DSO + Installatore',
        duration_days: 15,
        stage: 'Connessione',

        required_documents: [
          'Progetto cabina MT/BT',
          'Contratto connessione MT',
          'Collaudo trasformatore'
        ],
        checklist_items: [
          { id: 'connessione-mt-cl-1', text: 'Realizzazione cabina', checked: false },
          { id: 'connessione-mt-cl-2', text: 'Installazione trasformatore', checked: false },
          { id: 'connessione-mt-cl-3', text: 'Posa cavi MT', checked: false },
          { id: 'connessione-mt-cl-4', text: 'Collaudo DSO', checked: false },
          { id: 'connessione-mt-cl-5', text: 'Attivazione MT', checked: false }
        ],
        dependencies: ['cantiere-industriale'],
        integration: 'DSO'
      },
      {
        id: 'officina-elettrica-completa',
        name: 'Officina Elettrica e UTF Completa',
        title: 'Officina Elettrica e UTF Completa',
        description: 'Registrazione completa con contatori UTF e gestione accise per impianti > 20kW',
        assignee: 'Fiscalista Energetico',
        duration_days: 10,
        stage: 'Officina Elettrica',

        required_documents: [
          'Planimetria UTF dettagliata',
          'Schema contatori fiscali',
          'Calcolo franchigia',
          'Libretti UTF'
        ],
        checklist_items: [
          { id: 'officina-elettrica-completa-cl-1', text: 'Installazione contatori UTF', checked: false },
          { id: 'officina-elettrica-completa-cl-2', text: 'Sigillatura fiscale', checked: false },
          { id: 'officina-elettrica-completa-cl-3', text: 'Denuncia esercizio', checked: false },
          { id: 'officina-elettrica-completa-cl-4', text: 'Sopralluogo ADM', checked: false },
          { id: 'officina-elettrica-completa-cl-5', text: 'Rilascio licenza UTF', checked: false }
        ],
        dependencies: ['connessione-mt'],
        integration: 'Customs'
      }
    ]
  },
  // CER - Community Energy Workflow
  {
    id: 'costituzione-cer-pnrr',
    name: 'Costituzione CER con Fondi PNRR',
    description: 'Processo per costituire Comunità Energetica Rinnovabile con accesso a fondi PNRR 40%',
    category: WorkflowCategoryEnum.INCENTIVES,

    tasks: [
      {
        id: 'studio-cer',
        name: 'Studio Fattibilità CER',
        title: 'Studio Fattibilità CER',
        description: 'Analisi territorio, identificazione membri e dimensionamento impianti condivisi',
        assignee: 'Consulente CER',
        duration_days: 20,
        stage: 'Studio Fattibilità',

        required_documents: [
          'Mappa cabina primaria',
          'Elenco potenziali membri',
          'Consumi membri CER',
          'Aree disponibili'
        ],
        checklist_items: [
          { id: 'studio-cer-cl-1', text: 'Verifica perimetro cabina primaria', checked: false },
          { id: 'studio-cer-cl-2', text: 'Analisi consumi aggregati', checked: false },
          { id: 'studio-cer-cl-3', text: 'Dimensionamento ottimale', checked: false },
          { id: 'studio-cer-cl-4', text: 'Business plan CER', checked: false },
          { id: 'studio-cer-cl-5', text: 'Verifica requisiti PNRR', checked: false }
        ],
        dependencies: [],
        integration: null
      },
      {
        id: 'costituzione-soggetto',
        name: 'Costituzione Soggetto Giuridico CER',
        title: 'Costituzione Soggetto Giuridico CER',
        description: 'Creazione associazione/cooperativa per gestione CER secondo codice terzo settore',
        assignee: 'Legale',
        duration_days: 10,
        stage: 'Costituzione',

        required_documents: [
          'Atto costitutivo CER',
          'Statuto conforme',
          'Elenco soci fondatori',
          'Codici fiscali membri'
        ],
        checklist_items: [
          { id: 'costituzione-soggetto-cl-1', text: 'Assemblea costituente', checked: false },
          { id: 'costituzione-soggetto-cl-2', text: 'Registrazione Agenzia Entrate', checked: false },
          { id: 'costituzione-soggetto-cl-3', text: 'Apertura P.IVA', checked: false },
          { id: 'costituzione-soggetto-cl-4', text: 'Iscrizione RUNTS', checked: false },
          { id: 'costituzione-soggetto-cl-5', text: 'Conto corrente CER', checked: false }
        ],
        dependencies: ['studio-cer'],
        integration: null
      },
      {
        id: 'domanda-pnrr-cer',
        name: 'Domanda Contributo PNRR 40%',
        title: 'Domanda Contributo PNRR 40%',
        description: 'Presentazione istanza per contributo capitale 40% comuni < 5000 abitanti',
        assignee: 'Progettista',
        duration_days: 5,
        stage: 'Domanda Contributo',

        required_documents: [
          'Progetto definitivo CER',
          'Documentazione comune',
          'Preventivi dettagliati',
          'CUP progetto'
        ],
        checklist_items: [
          { id: 'domanda-pnrr-cer-cl-1', text: 'Verifica comune < 5000 ab', checked: false },
          { id: 'domanda-pnrr-cer-cl-2', text: 'Caricamento portale GSE', checked: false },
          { id: 'domanda-pnrr-cer-cl-3', text: 'Richiesta CUP', checked: false },
          { id: 'domanda-pnrr-cer-cl-4', text: 'Invio domanda PNRR', checked: false },
          { id: 'domanda-pnrr-cer-cl-5', text: 'Protocollazione', checked: false }
        ],
        dependencies: ['costituzione-soggetto'],
        integration: 'GSE',
        deadline_days: 60
      },
      {
        id: 'contratti-membri',
        name: 'Contratti Membri CER',
        title: 'Contratti Membri CER',
        description: 'Stipula contratti adesione membri produttori e consumatori con ripartizione benefici',
        assignee: 'Amministratore CER',
        duration_days: 15,
        stage: 'Contratti',

        required_documents: [
          'Template contratto',
          'Regolamento interno',
          'Schema ripartizione'
        ],
        checklist_items: [
          { id: 'contratti-membri-cl-1', text: 'Definizione quote energia', checked: false },
          { id: 'contratti-membri-cl-2', text: 'Schema ripartizione incentivi', checked: false },
          { id: 'contratti-membri-cl-3', text: 'Firma contratti membri', checked: false },
          { id: 'contratti-membri-cl-4', text: 'Comunicazione POD al GSE', checked: false },
          { id: 'contratti-membri-cl-5', text: 'Attivazione monitoraggio', checked: false }
        ],
        dependencies: ['domanda-pnrr-cer'],
        integration: null
      },
      {
        id: 'attivazione-cer-gse',
        name: 'Attivazione CER presso GSE',
        title: 'Attivazione CER presso GSE',
        description: 'Registrazione configurazione CER e richiesta incentivi ventennali',
        assignee: 'Referente CER',
        duration_days: 5,
        stage: 'Attivazione',

        required_documents: [
          'Contratti tutti membri',
          'POD produttori/consumatori',
          'Atto costitutivo CER',
          'Mandato referente'
        ],
        checklist_items: [
          { id: 'attivazione-cer-gse-cl-1', text: 'Accreditamento referente', checked: false },
          { id: 'attivazione-cer-gse-cl-2', text: 'Caricamento configurazione', checked: false },
          { id: 'attivazione-cer-gse-cl-3', text: 'Validazione POD', checked: false },
          { id: 'attivazione-cer-gse-cl-4', text: 'Contratto incentivi 20 anni', checked: false },
          { id: 'attivazione-cer-gse-cl-5', text: 'Attivazione pagamenti', checked: false }
        ],
        dependencies: ['contratti-membri'],
        integration: 'GSE'
      }
    ]
  },
  // Maintenance and Compliance Workflow
  {
    id: 'manutenzione-compliance-annuale',
    name: 'Manutenzione e Compliance Annuale',
    description: 'Ciclo annuale di manutenzione preventiva e adempimenti normativi ricorrenti',
    category: WorkflowCategoryEnum.COMPLIANCE,

    recurrence: 'Annual',
    tasks: [
      {
        id: 'manutenzione-ordinaria',
        name: 'Manutenzione Ordinaria Impianto',
        title: 'Manutenzione Ordinaria Impianto',
        description: 'Interventi di pulizia, controllo e manutenzione preventiva annuale',
        assignee: 'Tecnico Manutentore',
        duration_days: 1,
        stage: 'Manutenzione',

        required_documents: [
          'Checklist manutenzione',
          'Storico interventi',
          'Schede tecniche componenti'
        ],
        checklist_items: [
          { id: 'manutenzione-ordinaria-cl-1', text: 'Pulizia moduli fotovoltaici', checked: false },
          { id: 'manutenzione-ordinaria-cl-2', text: 'Controllo serraggi e ossidazioni', checked: false },
          { id: 'manutenzione-ordinaria-cl-3', text: 'Verifica scaricatori e protezioni', checked: false },
          { id: 'manutenzione-ordinaria-cl-4', text: 'Test isolamento stringhe', checked: false },
          { id: 'manutenzione-ordinaria-cl-5', text: 'Analisi termografica', checked: false }
        ],
        dependencies: [],
        integration: null
      },
      {
        id: 'verifica-performance',
        name: 'Verifica Performance e PR',
        title: 'Verifica Performance e PR',
        description: 'Analisi producibilità e calcolo Performance Ratio per identificare anomalie',
        assignee: 'Energy Manager',
        duration_days: 1,
        stage: 'Verifica',

        required_documents: [
          'Dati produzione 12 mesi',
          'Dati irraggiamento',
          'Report monitoring'
        ],
        checklist_items: [
          { id: 'verifica-performance-cl-1', text: 'Calcolo PR mensile', checked: false },
          { id: 'verifica-performance-cl-2', text: 'Confronto con valori attesi', checked: false },
          { id: 'verifica-performance-cl-3', text: 'Identificazione anomalie', checked: false },
          { id: 'verifica-performance-cl-4', text: 'Report performance', checked: false },
          { id: 'verifica-performance-cl-5', text: 'Piano interventi correttivi', checked: false }
        ],
        dependencies: ['manutenzione-ordinaria'],
        integration: null
      },
      {
        id: 'dichiarazione-consumo-annuale',
        name: 'Dichiarazione Annuale Consumo ADM',
        title: 'Dichiarazione Annuale Consumo ADM',
        description: 'Dichiarazione produzione e consumo energia per officine elettriche > 20kW',
        assignee: 'Fiscalista',
        duration_days: 2,
        stage: 'Dichiarazione',

        required_documents: [
          'Letture mensili UTF',
          'Registri produzione',
          'Fatture vendita energia'
        ],
        checklist_items: [
          { id: 'dichiarazione-consumo-annuale-cl-1', text: 'Raccolta dati produzione anno', checked: false },
          { id: 'dichiarazione-consumo-annuale-cl-2', text: 'Calcolo energia ceduta/consumata', checked: false },
          { id: 'dichiarazione-consumo-annuale-cl-3', text: 'Compilazione modello AD-1', checked: false },
          { id: 'dichiarazione-consumo-annuale-cl-4', text: 'Invio telematico entro 31/3', checked: false },
          { id: 'dichiarazione-consumo-annuale-cl-5', text: 'Pagamento eventuale accisa', checked: false }
        ],
        dependencies: ['verifica-performance'],
        integration: 'Customs',
        deadline_days: 90,
        application_condition: 'potenza > 20'
      },
      {
        id: 'pagamento-canone-utf',
        name: 'Pagamento Canone Licenza UTF',
        title: 'Pagamento Canone Licenza UTF',
        description: 'Versamento canone annuale licenza officina elettrica entro 16 dicembre',
        assignee: 'Amministrazione',
        duration_days: 1,
        stage: 'Pagamento',

        required_documents: [
          'Bollettino precompilato',
          'Licenza UTF'
        ],
        checklist_items: [
          { id: 'pagamento-canone-utf-cl-1', text: 'Verifica importo canone', checked: false },
          { id: 'pagamento-canone-utf-cl-2', text: 'Pagamento F24', checked: false },
          { id: 'pagamento-canone-utf-cl-3', text: 'Archiviazione ricevuta', checked: false },
          { id: 'pagamento-canone-utf-cl-4', text: 'Scadenza 16/12', checked: false }
        ],
        dependencies: ['dichiarazione-consumo-annuale'],
        integration: 'Customs',
        deadline_days: 15,
        application_condition: 'potenza > 20'
      },
      {
        id: 'fuel-mix-disclosure',
        name: 'Comunicazione Fuel Mix GSE',
        title: 'Comunicazione Fuel Mix GSE',
        description: 'Dichiarazione annuale mix energetico per disclosure trasparenza',
        assignee: 'Asset Manager',
        duration_days: 1,
        stage: 'Comunicazione',

        required_documents: [
          'Dati produzione anno',
          'Contratti cessione'
        ],
        checklist_items: [
          { id: 'fuel-mix-disclosure-cl-1', text: 'Accesso portale Fuel Mix', checked: false },
          { id: 'fuel-mix-disclosure-cl-2', text: 'Inserimento dati produzione', checked: false },
          { id: 'fuel-mix-disclosure-cl-3', text: 'Invio entro 31/3', checked: false },
          { id: 'fuel-mix-disclosure-cl-4', text: 'Download certificato', checked: false }
        ],
        dependencies: [],
        integration: 'GSE',
        deadline_days: 90
      },
      {
        id: 'verifica-quinquennale-spi',
        name: 'Verifica Quinquennale SPI',
        title: 'Verifica Quinquennale SPI',
        description: 'Verifica periodica Sistema Protezione Interfaccia secondo CEI 0-21',
        assignee: 'Tecnico Abilitato',
        duration_days: 1,
        stage: 'Verifica',

        required_documents: [
          'Documentazione SPI',
          'Storico verifiche'
        ],
        checklist_items: [
          { id: 'verifica-quinquennale-spi-cl-1', text: 'Test funzionale protezioni', checked: false },
          { id: 'verifica-quinquennale-spi-cl-2', text: 'Verifica tarature', checked: false },
          { id: 'verifica-quinquennale-spi-cl-3', text: 'Cassetta prova relè', checked: false },
          { id: 'verifica-quinquennale-spi-cl-4', text: 'Verbale verifica', checked: false },
          { id: 'verifica-quinquennale-spi-cl-5', text: 'Comunicazione DSO', checked: false }
        ],
        dependencies: [],
        integration: 'DSO'
      }
    ]
  }
];

export const getWorkflowTemplate = (id: string): WorkflowTemplate | undefined => {
  return workflowTemplates.find(template => template.id === id);
};

export const getTemplatesByCategory = (category: string): WorkflowTemplate[] => {
  return workflowTemplates.filter(template => template.category === category);
};

export const calculateWorkflowDuration = (template: WorkflowTemplate): number => {
  if (!template.tasks || template.tasks.length === 0) return 0;
  const taskDurations = template.tasks.map(task => task.duration_days || 0);
  const criticalPath = Math.max(...taskDurations);
  return criticalPath;
};
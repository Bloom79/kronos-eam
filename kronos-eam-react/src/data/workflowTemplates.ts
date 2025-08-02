import { WorkflowTemplate, TaskTemplate } from '../types';

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'nuova-connessione-dso',
    name: 'Nuova Connessione DSO',
    descrizione: 'Processo completo per la connessione di un nuovo plant alla rete del distributore',
    categoria: 'Activation',
    durataStimataDays: 90,
    tasks: [
      {
        id: 'richiesta-connessione',
        name: 'Richiesta di Connessione',
        descrizione: 'Compilazione e invio domanda di connessione al DSO tramite portale o PEC',
        responsabile: 'Asset Manager',
        durataStimataDays: 2,
        documentiRichiesti: [
          'Documento identità titolare',
          'Mandato di rappresentanza',
          'Schema elettrico unifilare',
          'Planimetria catastale',
          'Dichiarazione disponibilità sito'
        ],
        checkpoints: [
          'Verifica completezza documentazione',
          'Pagamento corrispettivo preventivo',
          'Invio pratica al DSO'
        ],
        dipendenze: [],
        integrazione: 'DSO'
      },
      {
        id: 'gestione-tica',
        name: 'Gestione Preventivo TICA',
        descrizione: 'Ricezione, valutazione e accettazione del preventivo di connessione',
        responsabile: 'Asset Manager',
        durataStimataDays: 45,
        documentiRichiesti: [],
        checkpoints: [
          'Ricezione TICA dal DSO',
          'Analisi tecnico-economica',
          'Accettazione e pagamento'
        ],
        dipendenze: ['richiesta-connessione'],
        integrazione: 'DSO',
        scadenzaGiorni: 45
      },
      {
        id: 'comunicazione-fine-lavori',
        name: 'Comunicazione Fine Lavori',
        descrizione: 'Invio documentazione di fine lavori per attivazione connessione',
        responsabile: 'Tecnico',
        durataStimataDays: 5,
        documentiRichiesti: [
          'Regolamento di Esercizio',
          'Dichiarazione conformità plant',
          'Dichiarazione conformità inverter/SPI',
          'Report verifica SPI'
        ],
        checkpoints: [
          'Raccolta certificazioni',
          'Verifica conformità normativa',
          'Invio comunicazione'
        ],
        dipendenze: ['gestione-tica'],
        integrazione: 'DSO'
      }
    ]
  },
  {
    id: 'registrazione-gaudi',
    name: 'Registrazione GAUDÌ',
    descrizione: 'Censimento plant nel sistema GAUDÌ di Terna',
    categoria: 'Activation',
    durataStimataDays: 15,
    tasks: [
      {
        id: 'creazione-account',
        name: 'Creazione Account GAUDÌ',
        descrizione: 'Registrazione operatore/mandatario su portale GAUDÌ',
        responsabile: 'Asset Manager',
        durataStimataDays: 1,
        documentiRichiesti: ['Documento identità', 'Dati aziendali'],
        checkpoints: [
          'Registrazione portale',
          'Verifica credenziali',
          'Abilitazione profilo'
        ],
        dipendenze: [],
        integrazione: 'Terna'
      },
      {
        id: 'inserimento-registry',
        name: 'Inserimento registry plant',
        descrizione: 'Compilazione dati tecnici plant su GAUDÌ',
        responsabile: 'Asset Manager',
        durataStimataDays: 2,
        documentiRichiesti: [
          'Codice POD',
          'Codice rintracciabilità DSO',
          'Schede tecniche pannelli/inverter'
        ],
        checkpoints: [
          'Inserimento dati produttore',
          'Inserimento dati tecnici',
          'Validazione registry'
        ],
        dipendenze: ['creazione-account', 'comunicazione-fine-lavori'],
        integrazione: 'Terna'
      },
      {
        id: 'monitoraggio-flussi',
        name: 'Monitoraggio Flussi Validazione',
        descrizione: 'Verifica status flussi G01, G02, G04 tra DSO e Terna',
        responsabile: 'Sistema',
        durataStimataDays: 10,
        documentiRichiesti: [],
        checkpoints: [
          'Ricezione flusso G01',
          'Conferma G02',
          'Attivazione G04'
        ],
        dipendenze: ['inserimento-registry'],
        integrazione: 'Terna'
      }
    ]
  },
  {
    id: 'attivazione-rid-gse',
    name: 'Attivazione Ritiro Dedicato GSE',
    descrizione: 'Attivazione convenzione di Ritiro Dedicato con il GSE',
    categoria: 'Incentives',
    durataStimataDays: 30,
    tasks: [
      {
        id: 'accesso-area-clienti',
        name: 'Accesso Area Clienti GSE',
        descrizione: 'Login con SPID o credenziali + MFA',
        responsabile: 'Asset Manager',
        durataStimataDays: 1,
        documentiRichiesti: [],
        checkpoints: [
          'Verifica credenziali SPID',
          'Configurazione MFA',
          'Accesso portale'
        ],
        dipendenze: [],
        integrazione: 'GSE'
      },
      {
        id: 'compilazione-rid',
        name: 'Compilazione Richiesta RID',
        descrizione: 'Inserimento dati per convenzione Ritiro Dedicato',
        responsabile: 'Asset Manager',
        durataStimataDays: 2,
        documentiRichiesti: [
          'Dati plant da GAUDÌ',
          'Coordinate bancarie',
          'Documentazione societaria'
        ],
        checkpoints: [
          'Compilazione moduli',
          'Upload documenti',
          'Invio richiesta'
        ],
        dipendenze: ['accesso-area-clienti', 'monitoraggio-flussi'],
        integrazione: 'GSE'
      },
      {
        id: 'pratica-antimafia',
        name: 'Dichiarazione Antimafia',
        descrizione: 'Presentazione documentazione antimafia se incentivi > 150k€',
        responsabile: 'Legale',
        durataStimataDays: 5,
        documentiRichiesti: [
          'Visura camerale',
          'Documenti soci',
          'Dichiarazioni sostitutive'
        ],
        checkpoints: [
          'Verifica soglia incentivi',
          'Raccolta documentazione',
          'Invio dichiarazione'
        ],
        dipendenze: ['compilazione-rid'],
        integrazione: 'GSE',
        condizioneApplicazione: 'incentivi > 150000'
      }
    ]
  },
  {
    id: 'denuncia-officina-elettrica',
    name: 'Denuncia Officina Elettrica',
    descrizione: 'Registrazione plant > 20kW presso Agenzia Dogane',
    categoria: 'Fiscal',
    durataStimataDays: 20,
    tasks: [
      {
        id: 'preparazione-denuncia',
        name: 'Preparazione Denuncia',
        descrizione: 'Compilazione moduli denuncia officina elettrica',
        responsabile: 'Fiscalista',
        durataStimataDays: 3,
        documentiRichiesti: [
          'Dati tecnici plant',
          'Planimetria con contatori',
          'Schema unifilare fiscale'
        ],
        checkpoints: [
          'Verifica potenza > 20kW',
          'Compilazione modelli',
          'Preparazione allegati'
        ],
        dipendenze: [],
        integrazione: 'Customs',
        condizioneApplicazione: 'potenza > 20'
      },
      {
        id: 'invio-telematico',
        name: 'Invio Telematico PUDM',
        descrizione: 'Trasmissione denuncia tramite portale o EDI',
        responsabile: 'Fiscalista',
        durataStimataDays: 1,
        documentiRichiesti: [],
        checkpoints: [
          'Accesso PUDM con SPID/CNS',
          'Upload documentazione',
          'Protocollazione pratica'
        ],
        dipendenze: ['preparazione-denuncia'],
        integrazione: 'Customs'
      },
      {
        id: 'ottenimento-licenza',
        name: 'Ottenimento Licenza Esercizio',
        descrizione: 'Ricezione licenza officina elettrica',
        responsabile: 'Sistema',
        durataStimataDays: 15,
        documentiRichiesti: [],
        checkpoints: [
          'Monitoraggio status pratica',
          'Ricezione licenza',
          'Archiviazione documento'
        ],
        dipendenze: ['invio-telematico'],
        integrazione: 'Customs'
      }
    ]
  },
  {
    id: 'dichiarazione-annuale-consumo',
    name: 'Dichiarazione Annuale Consumo',
    descrizione: 'Dichiarazione annuale produzione e consumo energia',
    categoria: 'Fiscal',
    durataStimataDays: 5,
    ricorrenza: 'Annual',
    scadenza: { mese: 3, giorno: 31 },
    tasks: [
      {
        id: 'raccolta-dati-produzione',
        name: 'Raccolta Dati Produzione',
        descrizione: 'Lettura contatori e calcolo produzioni annuali',
        responsabile: 'Tecnico',
        durataStimataDays: 2,
        documentiRichiesti: ['Letture mensili contatori'],
        checkpoints: [
          'Verifica letture mensili',
          'Calcolo totali annuali',
          'Validazione dati'
        ],
        dipendenze: [],
        integrazione: null
      },
      {
        id: 'generazione-file-edi',
        name: 'Generazione File EDI',
        descrizione: 'Creazione file formato Idoc per invio telematico',
        responsabile: 'Sistema',
        durataStimataDays: 1,
        documentiRichiesti: [],
        checkpoints: [
          'Formattazione dati Idoc',
          'Generazione firma elettronica',
          'Validazione tracciato'
        ],
        dipendenze: ['raccolta-dati-produzione'],
        integrazione: 'Customs'
      },
      {
        id: 'invio-s2s',
        name: 'Invio System-to-System',
        descrizione: 'Trasmissione file EDI tramite canale S2S',
        responsabile: 'Sistema',
        durataStimataDays: 1,
        documentiRichiesti: [],
        checkpoints: [
          'Connessione canale S2S',
          'Upload file firmato',
          'Conferma ricezione'
        ],
        dipendenze: ['generazione-file-edi'],
        integrazione: 'Customs'
      }
    ]
  },
  {
    id: 'revamping-potenziamento',
    name: 'Revamping/Potenziamento plant',
    descrizione: 'Gestione modifiche sostanziali plant esistente',
    categoria: 'Changes',
    durataStimataDays: 60,
    tasks: [
      {
        id: 'progettazione-intervento',
        name: 'Progettazione Intervento',
        descrizione: 'Studio fattibilità e progettazione modifiche',
        responsabile: 'Progettista',
        durataStimataDays: 15,
        documentiRichiesti: [
          'Status attuale plant',
          'Specifiche nuovi componenti',
          'Analisi producibilità'
        ],
        checkpoints: [
          'Analisi tecnica',
          'Valutazione economica',
          'Approvazione progetto'
        ],
        dipendenze: [],
        integrazione: null
      },
      {
        id: 'modifica-connessione',
        name: 'Modifica Connessione DSO',
        descrizione: 'Richiesta adeguamento connessione per nuova potenza',
        responsabile: 'Asset Manager',
        durataStimataDays: 30,
        documentiRichiesti: [
          'Progetto modifiche',
          'Nuovi schemi elettrici',
          'Dichiarazioni conformità'
        ],
        checkpoints: [
          'Invio richiesta modifica',
          'Ricezione nuovo TICA',
          'Accettazione preventivo'
        ],
        dipendenze: ['progettazione-intervento'],
        integrazione: 'DSO'
      },
      {
        id: 'aggiornamento-gaudi',
        name: 'Aggiornamento GAUDÌ',
        descrizione: 'Modifica dati tecnici su portale GAUDÌ',
        responsabile: 'Asset Manager',
        durataStimataDays: 5,
        documentiRichiesti: ['Nuove schede tecniche'],
        checkpoints: [
          'Accesso sezione modifiche',
          'Aggiornamento dati',
          'Validazione modifiche'
        ],
        dipendenze: ['modifica-connessione'],
        integrazione: 'Terna'
      },
      {
        id: 'comunicazione-gse',
        name: 'Comunicazione Modifiche GSE',
        descrizione: 'Notifica variazioni per mantenimento incentivi',
        responsabile: 'Asset Manager',
        durataStimataDays: 10,
        documentiRichiesti: [
          'Relazione tecnica modifiche',
          'Autorizzazioni ottenute'
        ],
        checkpoints: [
          'Compilazione moduli GSE',
          'Upload documentazione',
          'Conferma mantenimento incentivi'
        ],
        dipendenze: ['aggiornamento-gaudi'],
        integrazione: 'GSE'
      }
    ]
  },
  {
    id: 'voltura-plant',
    name: 'Voltura Titolarità plant',
    descrizione: 'Cambio proprietà o gestione plant',
    categoria: 'Changes',
    durataStimataDays: 30,
    tasks: [
      {
        id: 'preparazione-atti',
        name: 'Preparazione Documentazione',
        descrizione: 'Raccolta atti cessione e documenti nuovo titolare',
        responsabile: 'Legale',
        durataStimataDays: 5,
        documentiRichiesti: [
          'Atto di cessione',
          'Documenti nuovo titolare',
          'Visure camerali'
        ],
        checkpoints: [
          'Verifica atti notarili',
          'Controllo documentazione',
          'Preparazione dichiarazioni'
        ],
        dipendenze: [],
        integrazione: null
      },
      {
        id: 'voltura-dso',
        name: 'Voltura Contratto DSO',
        descrizione: 'Cambio intestazione contratto connessione',
        responsabile: 'Asset Manager',
        durataStimataDays: 10,
        documentiRichiesti: ['Modulo voltura DSO'],
        checkpoints: [
          'Compilazione modulo',
          'Invio richiesta',
          'Conferma voltura'
        ],
        dipendenze: ['preparazione-atti'],
        integrazione: 'DSO'
      },
      {
        id: 'voltura-terna',
        name: 'Aggiornamento Titolarità GAUDÌ',
        descrizione: 'Modifica registry titolare su GAUDÌ',
        responsabile: 'Asset Manager',
        durataStimataDays: 5,
        documentiRichiesti: [],
        checkpoints: [
          'Accesso GAUDÌ',
          'Modifica titolarità',
          'Validazione cambio'
        ],
        dipendenze: ['voltura-dso'],
        integrazione: 'Terna'
      },
      {
        id: 'voltura-gse',
        name: 'Voltura Convenzioni GSE',
        descrizione: 'Subentro convenzioni incentivanti',
        responsabile: 'Asset Manager',
        durataStimataDays: 10,
        documentiRichiesti: [
          'Dichiarazione subentro',
          'Nuove coordinate bancarie'
        ],
        checkpoints: [
          'Richiesta subentro',
          'Verifica requisiti',
          'Attivazione nuovo titolare'
        ],
        dipendenze: ['voltura-terna'],
        integrazione: 'GSE'
      },
      {
        id: 'voltura-dogane',
        name: 'Voltura Licenza Dogane',
        descrizione: 'Cambio titolarità officina elettrica',
        responsabile: 'Fiscalista',
        durataStimataDays: 15,
        documentiRichiesti: ['Modelli voltura officina'],
        checkpoints: [
          'Comunicazione cessione',
          'Nuova denuncia',
          'Rilascio nuova licenza'
        ],
        dipendenze: ['preparazione-atti'],
        integrazione: 'Customs',
        condizioneApplicazione: 'potenza > 20'
      }
    ]
  }
];

export const getWorkflowTemplate = (id: string): WorkflowTemplate | undefined => {
  return workflowTemplates.find(template => template.id === id);
};

export const getTemplatesByCategory = (categoria: string): WorkflowTemplate[] => {
  return workflowTemplates.filter(template => template.categoria === categoria);
};

export const calculateWorkflowDuration = (template: WorkflowTemplate): number => {
  const taskDurations = template.tasks.map(task => task.durataStimataDays);
  const criticalPath = Math.max(...taskDurations);
  return criticalPath;
};
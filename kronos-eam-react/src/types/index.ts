// Enums
export type EntityEnum = 'DSO' | 'Terna' | 'GSE' | 'Customs' | 'Municipality' | 'Region' | 'Superintendency';
export type WorkflowCategoryEnum = 'Activation' | 'Fiscal' | 'Incentives' | 'Changes' | 'Maintenance' | 'Compliance';
export type WorkflowStatusEnum = 'Draft' | 'Active' | 'Paused' | 'Completed' | 'Cancelled';
export type TaskStatusEnum = 'To Do' | 'In Progress' | 'Completed' | 'Delayed' | 'Blocked';
export type TaskPriorityEnum = 'High' | 'Medium' | 'Low';
export type PlantStatusEnum = 'In Operation' | 'In Authorization' | 'In Construction' | 'Decommissioned';
export type PlantTypeEnum = 'Photovoltaic' | 'Wind' | 'Hydroelectric' | 'Biomass' | 'Geothermal';
export type MaintenanceTypeEnum = 'Ordinary' | 'Extraordinary';
export type MaintenanceStatusEnum = 'Completed' | 'Planned' | 'In Progress';

// Entity Types
export interface Plant {
  id: number;
  name: string;
  codice?: string;
  potenza: string | number;
  potenza_kw?: number;
  status: PlantStatusEnum;
  type?: PlantTypeEnum;
  location: string;
  comune?: string;
  provincia?: string;
  regione?: string;
  prossimaScadenza?: string;
  prossima_scadenza?: string;
  prossima_scadenza_type?: string;
  coloreScadenza?: string;
  colore_scadenza?: string;
  integrazione_gse?: boolean;
  integrazione_terna?: boolean;
  integrazione_dogane?: boolean;
  integrazione_dso?: boolean;
  registry?: {
    id?: number;
    pod?: string;
    gaudi?: string;
    censimp?: string;
    dataEsercizio?: string;
    data_esercizio?: string;
    regime?: string;
    responsabile?: string;
    assicurazione?: string;
    typeplant?: 'Fotovoltaico' | 'Eolico';
    potenzaNominale?: number;
    superficieOccupata?: number;
    superficie_occupata?: number;
    numeroModuli?: number;
    numero_moduli?: number;
    numeroInverter?: number;
    numero_inverter?: number;
  };
  performance?: {
    labels: string[];
    attesa: number[];
    effettiva: number[];
    pr: number | null;
  };
  manutenzione?: Manutenzione[];
  checklist?: ChecklistConformita;
  documenti?: Documento[];
  integrazioni?: IntegrazioneStatus;
  created_at?: string;
  updated_at?: string;
}

export interface Manutenzione {
  id: number;
  data: string;
  type: MaintenanceTypeEnum;
  desc: string;
  status: MaintenanceStatusEnum;
  costo: string;
}

export interface ChecklistConformita {
  connessione_dso: boolean;
  registrazione_terna: boolean;
  attivazione_gse: boolean;
  licenza_dogane: boolean;
  verifica_spi: boolean;
  dichiarazione_consumo: boolean;
  antimafia?: boolean;
  fuel_mix?: boolean;
}

export interface Workflow {
  id: number;
  name: string;
  plantId: number;
  plantname: string;
  plantRegion?: string;
  plantProvince?: string;
  plantCity?: string;
  plantType?: PlantTypeEnum;
  plantPower?: number;
  statusCorrente: string;
  progresso: number;
  stages: WorkflowStage[];
  dataCreazione?: string;
  dataScadenza?: string;
  dataCompletamento?: string;
  type?: 'New Connection' | 'Revamping' | 'Transfer' | 'Customs Declaration' | 'SPI Verification';
  categoria?: WorkflowCategoryEnum;
  enti_coinvolti?: EntityEnum[];
  potenza_plant?: number;
  type_plant?: string;
  requisiti_documenti?: any;
  status_integrazioni?: Record<string, string>;
  template_id?: number;
  tasks?: Task[];
  created_by_role?: string;
  descrizione?: string;
}

export interface WorkflowStage {
  id?: number;
  name: string;
  tasks: Task[];
  completato?: boolean;
  ordine?: number;
  durata_giorni?: number;
  data_inizio?: Date;
  data_fine?: Date;
}

export interface Task {
  id: number;
  title: string;
  descrizione?: string;
  status: TaskStatusEnum;
  assignee: string;
  dueDate: string;
  documents: TaskDocument[];
  comments: TaskComment[];
  priority?: 'High' | 'Medium' | 'Low';
  estimatedHours?: number;
  actualHours?: number;
  stage?: WorkflowStage;
  dipendenze?: string[];
  ente_responsabile?: EntityEnum;
  tipo_pratica?: string;
  codice_pratica?: string;
  url_portale?: string;
  credenziali_richieste?: string;
  integrazione?: EntityEnum;
  automazione_config?: any;
  instructions?: string;
}

export interface TaskDocument {
  name: string;
  type: 'inviato' | 'ricevuto';
  date: string;
  url?: string;
  size?: string;
}

export interface TaskComment {
  user: string;
  text: string;
  date: string;
  id?: string;
}

export interface Documento {
  id: string;
  name: string;
  type: 'PDF' | 'DOC' | 'XLS' | 'IMG';
  dataCaricamento: string;
  dimensione: string;
  categoria: 'Authorization' | 'Technical' | 'Administrative' | 'Fiscal';
  status?: 'Valid' | 'Expired' | 'Processing';
  dataScadenza?: string;
  versione?: number;
  tags?: string[];
}

export interface Scadenza {
  id: string;
  titolo: string;
  plant: string;
  data: string;
  type: 'Payment' | 'Verification' | 'Declaration' | 'Renewal';
  priorita: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Completed' | 'Delayed';
  ente?: 'GSE' | 'Terna' | 'Customs' | 'DSO';
  ricorrente?: boolean;
  frequenza?: 'Annual' | 'Triennial' | 'Quinquennial';
}

export interface Integrazione {
  id: string;
  name: 'GSE' | 'Terna' | 'Customs' | 'E-Distribuzione';
  status: 'Connected' | 'Disconnected' | 'Error' | 'Maintenance';
  ultimaSincronizzazione: string;
  typeConnessione: 'API' | 'EDI' | 'RPA' | 'PEC';
  messaggiInCoda?: number;
  errori?: number;
}

export interface IntegrazioneStatus {
  gse: boolean;
  terna: boolean;
  dogane: boolean;
  dso: boolean;
}

export interface Notifica {
  id: string;
  type: 'scadenza' | 'task' | 'sistema' | 'integrazione';
  titolo: string;
  messaggio: string;
  timestamp: string;
  letta: boolean;
  priorita: 'alta' | 'media' | 'bassa';
  link?: string;
}

export interface Utente {
  id: string;
  name: string;
  email: string;
  ruolo: 'Admin' | 'Asset Manager' | 'Plant Owner' | 'Operativo' | 'Viewer';
  status: 'Attivo' | 'Sospeso';
  ultimoAccesso?: string;
  tenant?: string;
  plants?: number[];
}

export interface Tenant {
  id: string;
  name: string;
  piano: 'Professional' | 'Business' | 'Enterprise';
  scadenzaPiano: string;
  utenteMax: number;
  utenteAttivi: number;
  potenzaTotale: number;
  plantsTotali: number;
}

export interface Report {
  id: string;
  name: string;
  type: 'Conformità' | 'Performance' | 'Finanziario' | 'Operativo';
  formato: 'PDF' | 'CSV' | 'XLSX';
  dataGenerazione: string;
  utente: string;
  parametri?: any;
}

export interface DashboardMetrics {
  potenzaTotale: string;
  plantsAttivi: number;
  plantsTotali: number;
  workflowInRitardo: number;
  documentiDaRevisionare: number;
  scadenzeImminenti: number;
  taskAssegnati: number;
  conformitaScore: number;
}

export interface AIExtraction {
  documentId: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  extractedData?: any;
  confidence?: number;
  errors?: string[];
}

// Workflow Template Types
export interface TaskTemplate {
  id: string;
  name: string;
  descrizione: string;
  responsabile: string;
  durataStimataDays: number;
  documentiRichiesti: string[];
  checkpoints: string[];
  dipendenze: string[];
  integrazione: 'DSO' | 'Terna' | 'GSE' | 'Customs' | null;
  ente_responsabile?: EntityEnum;
  scadenzaGiorni?: number;
  condizioneApplicazione?: string;
  suggested_assignee_role?: string;
}

// WorkflowTask is an alias for TaskTemplate for now
export interface WorkflowTask extends TaskTemplate {
  workflow_id?: number;
  status?: TaskStatusEnum;
  assegnato_a?: string;
  data_scadenza?: string;
  data_completamento?: string;
  note?: string;
  progresso?: number;
}

export interface TaskWithWorkflow extends Task {
  workflowName: string;
  plantName: string;
}

export interface WorkflowTemplate {
  id: string | number;
  name: string;
  descrizione: string;
  categoria: WorkflowCategoryEnum;
  durataStimataDays: number;
  durata_stimata_giorni?: number; // Alternative name used in backend
  tasks: TaskTemplate[];
  ricorrenza?: 'Annual' | 'Monthly' | 'One-time' | 'Quinquennial' | 'Triennial' | 'Semiannual' | 'Quarterly';
  scadenza?: {
    mese: number;
    giorno: number;
  };
  type_plant?: string;
  min_power?: number;
  max_power?: number;
  enti_richiesti?: EntityEnum[];
  documenti_base?: string[];
  condizioni_attivazione?: any;
  scadenza_config?: any;
  attivo?: boolean;
  workflow_purpose?: 'Complete Activation' | 'Specific Process' | 'Recurring Compliance' | 'Custom' | 'Phase Component';
  is_complete_workflow?: boolean;
  stages?: any[];
}

// Notification interface (was previously Notifica)
export interface Notification {
  id: number;
  titolo: string;
  messaggio: string;
  type: 'info' | 'warning' | 'error' | 'success';
  letta: boolean;
  dataCreazione: string;
  plantId?: number;
  workflowId?: number;
}

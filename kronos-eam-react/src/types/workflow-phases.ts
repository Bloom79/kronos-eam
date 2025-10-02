/**
 * Workflow Phase Types - Italian Solar Plant Activation Process
 */

export enum PhaseType {
  DESIGN = 'DESIGN',
  AUTHORIZATION = 'AUTHORIZATION',
  CONNECTION = 'CONNECTION',
  INSTALLATION = 'INSTALLATION',
  TESTING = 'TESTING',
  REGISTRATION = 'REGISTRATION',
  INCENTIVE = 'INCENTIVE',
  FISCAL = 'FISCAL'
}

export enum EntityType {
  DSO = 'DSO',
  TERNA = 'Terna',
  GSE = 'GSE',
  CUSTOMS = 'Dogane',
  MUNICIPALITY = 'Comune',
  REGION = 'Regione',
  SUPERINTENDENCE = 'Soprintendenza'
}

export enum TaskPriority {
  HIGH = 'Alta',
  MEDIUM = 'Media',
  LOW = 'Bassa'
}

export enum CredentialType {
  SPID = 'SPID',
  CIE = 'CIE',
  CNS = 'CNS',
  DIGITAL_CERT = 'Digital Certificate',
  SPID_CIE = 'SPID/CIE',
  SPID_MFA = 'SPID + MFA',
  EMAIL = 'Email Registration'
}

export enum SubmissionMethod {
  ONLINE_PORTAL = 'Portale Online',
  PEC = 'PEC',
  SYSTEM_TO_SYSTEM = 'System-to-System',
  EDI = 'EDI',
  PORTAL_OR_PEC = 'Portale o PEC'
}

export enum DeadlineType {
  PEREMPTORY = 'peremptory',
  ORDINARY = 'ordinatory',
  SUSPENSIVE = 'suspensive'
}

export interface PhaseTask {
  id?: string;
  name: string;
  tipo_pratica?: string;
  assignee?: string;
  ente_responsabile?: EntityType | string;
  durata_giorni: number;
  priority: TaskPriority | string;
  description?: string;
  
  // Portal information
  portal_url?: string;
  portal_login_url?: string;
  required_credentials?: CredentialType | string;
  submission_method?: SubmissionMethod | string;
  
  // Documents
  documenti_richiesti?: string[];
  documents_to_generate?: string[];
  document_templates?: string[];
  official_form_fields?: Record<string, any>;
  
  // Regulatory
  regulatory_deadline?: string;
  deadline_type?: DeadlineType | string;
  deadline_consequences?: string;
  external_protocol_number?: string;
  
  // Costs
  cost_amount?: number;
  cost_description?: string;
  payment_method?: string;
  
  // Human checkpoints
  requires_human_auth?: boolean;
  requires_physical_signature?: boolean;
  requires_site_inspection?: boolean;
  human_checkpoint_notes?: string;
  
  // Process tracking
  checkpoints?: string[];
  condizioni?: string;
}

export interface DocumentTemplate {
  name: string;
  category: string;
  official_url?: string;
  entity_responsible?: EntityType | string;
  file_path?: string;
  template_url?: string;
  is_required?: boolean;
  upload_deadline_days?: number;
  version?: string;
  last_updated?: string;
  notes?: string;
}

export interface WorkflowPhase {
  id: string;
  name: string;
  description: string;
  type: PhaseType;
  entity_responsible: EntityType | string;
  duration_days: number;
  icon: string;
  color: string;
  tasks: PhaseTask[];
  document_templates?: DocumentTemplate[];
  condizioni?: string;
  ordine?: number;
}

export interface PhaseTemplate {
  id: string;
  name: string;
  description: string;
  phases: WorkflowPhase[];
}

export interface WorkflowTemplateData {
  solarPlantActivation: PhaseTemplate;
  recurringCompliance: PhaseTemplate;
}

// Helper functions
export const getPhaseTypeLabel = (type: PhaseType): string => {
  const labels: Record<PhaseType, string> = {
    [PhaseType.DESIGN]: 'Progettazione',
    [PhaseType.AUTHORIZATION]: 'Autorizzazione',
    [PhaseType.CONNECTION]: 'Connessione',
    [PhaseType.INSTALLATION]: 'Installazione',
    [PhaseType.TESTING]: 'Collaudo',
    [PhaseType.REGISTRATION]: 'Registrazione',
    [PhaseType.INCENTIVE]: 'Incentivi',
    [PhaseType.FISCAL]: 'Fiscale'
  };
  return labels[type] || type;
};

export const getEntityTypeLabel = (entity: EntityType): string => {
  const labels: Record<EntityType, string> = {
    [EntityType.DSO]: 'Distributore (DSO)',
    [EntityType.TERNA]: 'Terna',
    [EntityType.GSE]: 'Gestore Servizi Energetici',
    [EntityType.CUSTOMS]: 'Agenzia delle Dogane',
    [EntityType.MUNICIPALITY]: 'Comune',
    [EntityType.REGION]: 'Regione',
    [EntityType.SUPERINTENDENCE]: 'Soprintendenza'
  };
  return labels[entity] || entity;
};

export const getPhaseColor = (type: PhaseType): string => {
  const colors: Record<PhaseType, string> = {
    [PhaseType.DESIGN]: 'blue',
    [PhaseType.AUTHORIZATION]: 'purple',
    [PhaseType.CONNECTION]: 'green',
    [PhaseType.INSTALLATION]: 'orange',
    [PhaseType.TESTING]: 'teal',
    [PhaseType.REGISTRATION]: 'indigo',
    [PhaseType.INCENTIVE]: 'yellow',
    [PhaseType.FISCAL]: 'red'
  };
  return colors[type] || 'gray';
};

export const getPhaseIcon = (type: PhaseType): string => {
  const icons: Record<PhaseType, string> = {
    [PhaseType.DESIGN]: 'Compass',
    [PhaseType.AUTHORIZATION]: 'Building',
    [PhaseType.CONNECTION]: 'Plug',
    [PhaseType.INSTALLATION]: 'Wrench',
    [PhaseType.TESTING]: 'CheckSquare',
    [PhaseType.REGISTRATION]: 'Database',
    [PhaseType.INCENTIVE]: 'Euro',
    [PhaseType.FISCAL]: 'FileText'
  };
  return icons[type] || 'FileText';
};
export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'Authorization' | 'Technical' | 'Economic' | 'Safety' | 'Compliance' | 'Fiscal' | 'Maintenance';
  fileType: 'pdf' | 'docx' | 'xlsx' | 'dwg' | 'json';
  templateUrl?: string;
  officialUrl?: string;
  version: string;
  lastUpdated: string;
  requiredFields: DocumentField[];
  entityResponsible?: string;
  regulatoryReference?: string;
  notes?: string;
}

export interface DocumentField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'file' | 'signature';
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    message?: string;
  };
}

export const documentTemplates: DocumentTemplate[] = [
  // Authorization Templates
  {
    id: 'pas-standard',
    name: 'PAS - Procedura Abilitativa Semplificata',
    description: 'Modulo standard per PAS impianti fotovoltaici < 200kW',
    category: 'Authorization',
    fileType: 'pdf',
    officialUrl: 'https://www.impresainungiorno.gov.it/web/l-impresa-e-l-europa/modulistica',
    templateUrl: '/templates/pas_fotovoltaico.pdf',
    version: '2025.1',
    lastUpdated: '2025-01-01',
    entityResponsible: 'Comune',
    regulatoryReference: 'D.Lgs. 387/2003, DM 19/05/2015',
    requiredFields: [
      { id: 'comune', label: 'Comune di installazione', type: 'text', required: true },
      { id: 'richiedente', label: 'Dati richiedente', type: 'text', required: true },
      { id: 'ubicazione', label: 'Ubicazione impianto', type: 'text', required: true },
      { id: 'potenza', label: 'Potenza nominale (kWp)', type: 'number', required: true },
      { id: 'superficie', label: 'Superficie occupata (mq)', type: 'number', required: true },
      { id: 'tecnico', label: 'Tecnico progettista', type: 'text', required: true },
      { id: 'asseverazione', label: 'Asseverazione tecnico', type: 'checkbox', required: true }
    ]
  },
  {
    id: 'cila-semplificata',
    name: 'CILA - Comunicazione Inizio Lavori Asseverata',
    description: 'Modulo CILA per impianti residenziali < 50kW',
    category: 'Authorization',
    fileType: 'pdf',
    officialUrl: 'https://www.impresainungiorno.gov.it',
    templateUrl: '/templates/cila_fotovoltaico.pdf',
    version: '2025.1',
    lastUpdated: '2025-01-01',
    entityResponsible: 'Comune',
    requiredFields: [
      { id: 'proprietario', label: 'Dati proprietario', type: 'text', required: true },
      { id: 'ubicazione', label: 'Indirizzo immobile', type: 'text', required: true },
      { id: 'catastali', label: 'Dati catastali', type: 'text', required: true },
      { id: 'descrizione', label: 'Descrizione intervento', type: 'text', required: true },
      { id: 'inizio_lavori', label: 'Data inizio lavori', type: 'date', required: true }
    ]
  },
  {
    id: 'au-regionale',
    name: 'Autorizzazione Unica Regionale',
    description: 'Istanza AU per impianti > 200kW o in aree vincolate',
    category: 'Authorization',
    fileType: 'docx',
    templateUrl: '/templates/istanza_au_fotovoltaico.docx',
    version: '2025.1',
    lastUpdated: '2025-01-01',
    entityResponsible: 'Regione',
    regulatoryReference: 'D.Lgs. 387/2003 art.12',
    requiredFields: [
      { id: 'societa', label: 'Ragione sociale', type: 'text', required: true },
      { id: 'sede_legale', label: 'Sede legale', type: 'text', required: true },
      { id: 'piva', label: 'P.IVA', type: 'text', required: true },
      { id: 'legale_rappresentante', label: 'Legale rappresentante', type: 'text', required: true },
      { id: 'potenza_mw', label: 'Potenza (MW)', type: 'number', required: true },
      { id: 'comune_impianto', label: 'Comune impianto', type: 'text', required: true }
    ]
  },
  // Technical Templates
  {
    id: 'schema-unifilare',
    name: 'Schema Unifilare Impianto FV',
    description: 'Template DWG per schema unifilare secondo CEI',
    category: 'Technical',
    fileType: 'dwg',
    templateUrl: '/templates/schema_unifilare_fv.dwg',
    version: '2025.1',
    lastUpdated: '2025-01-01',
    regulatoryReference: 'CEI 0-21, CEI 82-25',
    requiredFields: [],
    notes: 'Includere: stringhe, inverter, quadri, protezioni, contatori'
  },
  {
    id: 'relazione-tecnica',
    name: 'Relazione Tecnica Impianto',
    description: 'Template relazione tecnica progetto FV',
    category: 'Technical',
    fileType: 'docx',
    templateUrl: '/templates/relazione_tecnica_fv.docx',
    version: '2025.1',
    lastUpdated: '2025-01-01',
    requiredFields: [
      { id: 'progettista', label: 'Progettista abilitato', type: 'text', required: true },
      { id: 'committente', label: 'Committente', type: 'text', required: true },
      { id: 'ubicazione', label: 'Ubicazione impianto', type: 'text', required: true },
      { id: 'potenza_kwp', label: 'Potenza nominale (kWp)', type: 'number', required: true },
      { id: 'moduli_tipo', label: 'Tipo moduli FV', type: 'text', required: true },
      { id: 'inverter_tipo', label: 'Tipo inverter', type: 'text', required: true }
    ]
  },
  {
    id: 'modello-unico-parte1',
    name: 'Modello Unico Semplificato - Parte I',
    description: 'Richiesta connessione DSO',
    category: 'Technical',
    fileType: 'pdf',
    officialUrl: 'https://www.arera.it/it/docs/15/072-15.htm',
    templateUrl: '/templates/modello_unico_parte1.pdf',
    version: '2025.1',
    lastUpdated: '2025-01-01',
    entityResponsible: 'DSO',
    requiredFields: [
      { id: 'richiedente', label: 'Dati richiedente', type: 'text', required: true },
      { id: 'pod', label: 'POD esistente', type: 'text', required: true },
      { id: 'potenza_immissione', label: 'Potenza in immissione (kW)', type: 'number', required: true },
      { id: 'ubicazione', label: 'Ubicazione impianto', type: 'text', required: true },
      { id: 'coordinate_gps', label: 'Coordinate GPS', type: 'text', required: true }
    ]
  },
  {
    id: 'modello-unico-parte2',
    name: 'Modello Unico Semplificato - Parte II',
    description: 'Comunicazione fine lavori DSO',
    category: 'Technical',
    fileType: 'pdf',
    templateUrl: '/templates/modello_unico_parte2.pdf',
    version: '2025.1',
    lastUpdated: '2025-01-01',
    entityResponsible: 'DSO',
    requiredFields: [
      { id: 'codice_rintracciabilita', label: 'Codice rintracciabilità', type: 'text', required: true },
      { id: 'data_fine_lavori', label: 'Data fine lavori', type: 'date', required: true },
      { id: 'dico_numero', label: 'Numero DiCo', type: 'text', required: true }
    ]
  },
  // Economic Templates
  {
    id: 'business-plan-fv',
    name: 'Business Plan Impianto Fotovoltaico',
    description: 'Template Excel per analisi economica investimento FV',
    category: 'Economic',
    fileType: 'xlsx',
    templateUrl: '/templates/business_plan_fv.xlsx',
    version: '2025.1',
    lastUpdated: '2025-01-01',
    requiredFields: [],
    notes: 'Include: costi, ricavi, incentivi, ROI, VAN, TIR'
  },
  {
    id: 'computo-metrico',
    name: 'Computo Metrico Estimativo',
    description: 'Template per computo metrico impianto FV',
    category: 'Economic',
    fileType: 'xlsx',
    templateUrl: '/templates/computo_metrico_fv.xlsx',
    version: '2025.1',
    lastUpdated: '2025-01-01',
    requiredFields: []
  },
  {
    id: 'simulatore-tica',
    name: 'Simulatore Costi Connessione TICA',
    description: 'Calcolo preventivo costi connessione DSO',
    category: 'Economic',
    fileType: 'xlsx',
    templateUrl: '/templates/simulatore_tica.xlsx',
    version: '2025.1',
    lastUpdated: '2025-01-01',
    notes: 'Calcola: quota power, quota distanza, quota fissa',
    requiredFields: []
  },
  // Safety Templates
  {
    id: 'pos-fotovoltaico',
    name: 'POS - Piano Operativo Sicurezza FV',
    description: 'Template POS specifico per cantieri fotovoltaici',
    category: 'Safety',
    fileType: 'docx',
    templateUrl: '/templates/pos_fotovoltaico.docx',
    version: '2025.1',
    lastUpdated: '2025-01-01',
    regulatoryReference: 'D.Lgs. 81/08',
    requiredFields: [
      { id: 'impresa', label: 'Dati impresa esecutrice', type: 'text', required: true },
      { id: 'cantiere', label: 'Ubicazione cantiere', type: 'text', required: true },
      { id: 'durata', label: 'Durata lavori (giorni)', type: 'number', required: true },
      { id: 'responsabile', label: 'Responsabile sicurezza', type: 'text', required: true }
    ]
  },
  {
    id: 'checklist-sicurezza',
    name: 'Checklist Sicurezza Cantiere FV',
    description: 'Lista controllo DPI e misure sicurezza',
    category: 'Safety',
    fileType: 'pdf',
    templateUrl: '/templates/checklist_sicurezza_fv.pdf',
    version: '2025.1',
    lastUpdated: '2025-01-01',
    requiredFields: []
  },
  {
    id: 'dvr-fotovoltaico',
    name: 'DVR - Documento Valutazione Rischi FV',
    description: 'Template DVR specifico installazione FV',
    category: 'Safety',
    fileType: 'docx',
    templateUrl: '/templates/dvr_fotovoltaico.docx',
    version: '2025.1',
    lastUpdated: '2025-01-01',
    regulatoryReference: 'D.Lgs. 81/08 art.17',
    requiredFields: []
  },
  // Compliance Templates
  {
    id: 'dico-dm37-08',
    name: 'DiCo - Dichiarazione Conformità DM 37/08',
    description: 'Modello ministeriale dichiarazione conformità impianti',
    category: 'Compliance',
    fileType: 'pdf',
    officialUrl: 'https://www.mise.gov.it',
    templateUrl: '/templates/dico_dm37_08.pdf',
    version: '2022',
    lastUpdated: '2022-01-01',
    regulatoryReference: 'DM 37/08',
    requiredFields: [
      { id: 'impresa_installatrice', label: 'Impresa installatrice', type: 'text', required: true },
      { id: 'committente', label: 'Committente', type: 'text', required: true },
      { id: 'ubicazione', label: 'Ubicazione impianto', type: 'text', required: true },
      { id: 'tipologia', label: 'Tipologia impianto', type: 'select', required: true, 
        options: ['Nuovo impianto', 'Trasformazione', 'Ampliamento', 'Manutenzione straordinaria'] },
      { id: 'firma_responsabile', label: 'Firma responsabile tecnico', type: 'signature', required: true }
    ]
  },
  {
    id: 'verbale-collaudo',
    name: 'Verbale di Collaudo Impianto FV',
    description: 'Template verbale collaudo con checklist verifiche',
    category: 'Compliance',
    fileType: 'docx',
    templateUrl: '/templates/verbale_collaudo_fv.docx',
    version: '2025.1',
    lastUpdated: '2025-01-01',
    requiredFields: [
      { id: 'data_collaudo', label: 'Data collaudo', type: 'date', required: true },
      { id: 'collaudatore', label: 'Tecnico collaudatore', type: 'text', required: true },
      { id: 'committente', label: 'Committente presente', type: 'text', required: true },
      { id: 'esito', label: 'Esito collaudo', type: 'select', required: true,
        options: ['Positivo', 'Positivo con prescrizioni', 'Negativo'] }
    ]
  },
  {
    id: 'report-verifiche-cei',
    name: 'Report Verifiche Elettriche CEI',
    description: 'Report test elettrici secondo CEI 82-25',
    category: 'Compliance',
    fileType: 'xlsx',
    templateUrl: '/templates/report_verifiche_cei.xlsx',
    version: '2025.1',
    lastUpdated: '2025-01-01',
    regulatoryReference: 'CEI 82-25, CEI 64-8',
    requiredFields: []
  },
  {
    id: 'checklist-collaudo',
    name: 'Checklist Collaudo Completa',
    description: 'Lista completa verifiche collaudo impianto FV',
    category: 'Compliance',
    fileType: 'pdf',
    templateUrl: '/templates/checklist_collaudo_fv.pdf',
    version: '2025.1',
    lastUpdated: '2025-01-01',
    requiredFields: []
  },
  // Fiscal Templates
  {
    id: 'denuncia-officina-ad1',
    name: 'Modello AD-1 Denuncia Officina Elettrica',
    description: 'Denuncia apertura officina elettrica > 20kW',
    category: 'Fiscal',
    fileType: 'pdf',
    officialUrl: 'https://www.adm.gov.it/portale/documents/20182/5064915/Modello+AD1.pdf',
    templateUrl: '/templates/modello_ad1.pdf',
    version: '2025.1',
    lastUpdated: '2025-01-01',
    entityResponsible: 'Agenzia Dogane',
    requiredFields: [
      { id: 'titolare', label: 'Dati titolare officina', type: 'text', required: true },
      { id: 'ubicazione', label: 'Ubicazione officina', type: 'text', required: true },
      { id: 'potenza_kw', label: 'Potenza installata (kW)', type: 'number', required: true },
      { id: 'data_attivazione', label: 'Data attivazione', type: 'date', required: true }
    ]
  },
  {
    id: 'dichiarazione-consumo-annuale',
    name: 'Dichiarazione Annuale Consumo Energia',
    description: 'Dichiarazione annuale per officine elettriche',
    category: 'Fiscal',
    fileType: 'xlsx',
    templateUrl: '/templates/dichiarazione_consumo_annuale.xlsx',
    version: '2025.1',
    lastUpdated: '2025-01-01',
    entityResponsible: 'Agenzia Dogane',
    notes: 'Scadenza: 31 marzo di ogni anno',
    requiredFields: []
  },
  // Maintenance Templates
  {
    id: 'registro-manutenzione',
    name: 'Registro Manutenzione Impianto FV',
    description: 'Registro interventi manutenzione ordinaria e straordinaria',
    category: 'Maintenance',
    fileType: 'xlsx',
    templateUrl: '/templates/registro_manutenzione_fv.xlsx',
    version: '2025.1',
    lastUpdated: '2025-01-01',
    requiredFields: []
  },
  {
    id: 'checklist-manutenzione',
    name: 'Checklist Manutenzione Periodica',
    description: 'Lista controlli manutenzione preventiva',
    category: 'Maintenance',
    fileType: 'pdf',
    templateUrl: '/templates/checklist_manutenzione_fv.pdf',
    version: '2025.1',
    lastUpdated: '2025-01-01',
    requiredFields: []
  },
  {
    id: 'report-performance',
    name: 'Report Performance Impianto',
    description: 'Template analisi PR e producibilità',
    category: 'Maintenance',
    fileType: 'xlsx',
    templateUrl: '/templates/report_performance_fv.xlsx',
    version: '2025.1',
    lastUpdated: '2025-01-01',
    requiredFields: []
  }
];

// Helper functions
export const getTemplatesByCategory = (category: DocumentTemplate['category']): DocumentTemplate[] => {
  return documentTemplates.filter(template => template.category === category);
};

export const getTemplateById = (id: string): DocumentTemplate | undefined => {
  return documentTemplates.find(template => template.id === id);
};

export const getTemplatesForWorkflowPhase = (phaseType: string): DocumentTemplate[] => {
  const phaseTemplateMap: Record<string, string[]> = {
    'DESIGN': ['schema-unifilare', 'relazione-tecnica', 'business-plan-fv', 'computo-metrico'],
    'AUTHORIZATION': ['pas-standard', 'cila-semplificata', 'au-regionale'],
    'CONNECTION': ['modello-unico-parte1', 'modello-unico-parte2', 'simulatore-tica'],
    'INSTALLATION': ['pos-fotovoltaico', 'checklist-sicurezza', 'dvr-fotovoltaico'],
    'TESTING': ['dico-dm37-08', 'verbale-collaudo', 'report-verifiche-cei', 'checklist-collaudo'],
    'FISCAL': ['denuncia-officina-ad1', 'dichiarazione-consumo-annuale'],
    'MAINTENANCE': ['registro-manutenzione', 'checklist-manutenzione', 'report-performance']
  };
  
  const templateIds = phaseTemplateMap[phaseType] || [];
  return documentTemplates.filter(template => templateIds.includes(template.id));
};

export const validateDocumentFields = (templateId: string, data: Record<string, any>): {
  valid: boolean;
  errors: Record<string, string>;
} => {
  const template = getTemplateById(templateId);
  if (!template) {
    return { valid: false, errors: { template: 'Template not found' } };
  }

  const errors: Record<string, string> = {};
  
  template.requiredFields.forEach(field => {
    const value = data[field.id];
    
    // Check required fields
    if (field.required && !value) {
      errors[field.id] = `${field.label} è obbligatorio`;
      return;
    }
    
    // Type-specific validation
    if (value && field.validation) {
      if (field.type === 'number') {
        const numValue = Number(value);
        if (field.validation.min !== undefined && numValue < field.validation.min) {
          errors[field.id] = field.validation.message || `${field.label} deve essere almeno ${field.validation.min}`;
        }
        if (field.validation.max !== undefined && numValue > field.validation.max) {
          errors[field.id] = field.validation.message || `${field.label} deve essere al massimo ${field.validation.max}`;
        }
      }
      
      if (field.type === 'text' && field.validation.pattern) {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(value)) {
          errors[field.id] = field.validation.message || `${field.label} non è valido`;
        }
      }
    }
  });
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};
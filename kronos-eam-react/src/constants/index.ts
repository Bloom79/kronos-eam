/**
 * Application-wide constants
 */

// Plant (plant) Status
export const PLANT_STATUS = {
  IN_OPERATION: 'In Operation',
  IN_AUTHORIZATION: 'Under Authorization',
  UNDER_CONSTRUCTION: 'Under Construction',
  DECOMMISSIONED: 'Decommissioned'
} as const;

export type PlantStatus = typeof PLANT_STATUS[keyof typeof PLANT_STATUS];

// Plant Types
export const PLANT_TYPES = {
  PHOTOVOLTAIC: 'Photovoltaic',
  WIND: 'Wind',
  HYDROELECTRIC: 'Hydroelectric',
  BIOMASS: 'Biomass',
  GEOTHERMAL: 'Geothermal'
} as const;

export type PlantType = typeof PLANT_TYPES[keyof typeof PLANT_TYPES];

// Task Status
export const TASK_STATUS = {
  COMPLETED: 'Completed',
  IN_PROGRESS: 'In Progress',
  TO_START: 'To Start',
  DELAYED: 'Delayed',
  BLOCKED: 'Blocked'
} as const;

export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS];

// Task Priority
export const TASK_PRIORITY = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low'
} as const;

export type TaskPriority = typeof TASK_PRIORITY[keyof typeof TASK_PRIORITY];

// Workflow Status
export const WORKFLOW_STATUS = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  PAUSED: 'Paused',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
} as const;

export type WorkflowStatus = typeof WORKFLOW_STATUS[keyof typeof WORKFLOW_STATUS];

// Entities
export const ENTITIES = {
  DSO: 'DSO',
  TERNA: 'Terna',
  GSE: 'GSE',
  CUSTOMS: 'Customs',
  MUNICIPALITY: 'Municipality',
  REGION: 'Region',
  SUPERINTENDENCY: 'Superintendency'
} as const;

export type Entity = typeof ENTITIES[keyof typeof ENTITIES];

// Maintenance Types
export const MAINTENANCE_TYPES = {
  ORDINARY: 'Ordinary',
  EXTRAORDINARY: 'Extraordinary',
  PREDICTIVE: 'Predictive',
  CORRECTIVE: 'Corrective'
} as const;

export type MaintenanceType = typeof MAINTENANCE_TYPES[keyof typeof MAINTENANCE_TYPES];

// Document Types
export const DOCUMENT_TYPES = {
  PDF: 'PDF',
  DOC: 'DOC',
  XLS: 'XLS',
  IMG: 'IMG'
} as const;

export type DocumentType = typeof DOCUMENT_TYPES[keyof typeof DOCUMENT_TYPES];

// Document Categories
export const DOCUMENT_CATEGORIES = {
  AUTHORIZATION: 'Authorization',
  TECHNICAL: 'Technical',
  ADMINISTRATIVE: 'Administrative',
  FISCAL: 'Fiscal'
} as const;

export type DocumentCategory = typeof DOCUMENT_CATEGORIES[keyof typeof DOCUMENT_CATEGORIES];

// Deadline Types
export const DEADLINE_TYPES = {
  PAYMENT: 'Payment',
  VERIFICATION: 'Verification',
  DECLARATION: 'Declaration',
  RENEWAL: 'Renewal'
} as const;

export type DeadlineType = typeof DEADLINE_TYPES[keyof typeof DEADLINE_TYPES];

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
} as const;

// Status Colors
export const STATUS_COLORS = {
  'In Operation': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Under Authorization': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'Under Construction': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'Decommissioned': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
} as const;
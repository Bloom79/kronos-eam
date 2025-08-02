/**
 * API response types with proper TypeScript interfaces
 */

import { 
  PlantStatus, 
  PlantType, 
  TaskStatus, 
  WorkflowStatus, 
  Entity, 
  MaintenanceType,
  DocumentType,
  DocumentCategory
} from '../constants';

// Base types for common fields
export interface TimestampFields {
  createdAt: string;
  updatedAt: string;
}

export interface TenantFields {
  tenantId: string;
}

// Plant (plant) Types
export interface PlantRegistry {
  id?: number;
  pod?: string;
  gaudiCode?: string;
  censimpCode?: string;
  operationDate?: string;
  regime?: string;
  responsible?: string;
  insurance?: string;
  moduleCount?: number;
  inverterCount?: number;
  occupiedArea?: number;
}

export interface PlantPerformance {
  year: number;
  month: number;
  expectedProductionKwh: number;
  actualProductionKwh: number;
  performanceRatio?: number;
  availability?: number;
}

export interface Maintenance {
  id: number;
  scheduledDate: string;
  executionDate?: string;
  type: MaintenanceType;
  status: 'Completed' | 'Planned' | 'In Progress' | 'Cancelled';
  description: string;
  estimatedCost?: number;
  actualCost?: number;
  executor?: string;
}

export interface ComplianceChecklist {
  dsoConnection: boolean;
  ternaRegistration: boolean;
  gseActivation: boolean;
  customsLicense: boolean;
  spiVerification: boolean;
  consumptionDeclaration: boolean;
  antimafiaDocumentation?: boolean;
  fuelMixDeclaration?: boolean;
  complianceScore: number;
}

export interface Plant extends TimestampFields, TenantFields {
  id: number;
  name: string;
  code: string;
  power: string;
  powerKw: number;
  status: PlantStatus;
  type: PlantType;
  location: string;
  municipality?: string;
  province?: string;
  region?: string;
  nextDeadline?: string;
  nextDeadlineType?: string;
  deadlineColor?: string;
  gseIntegration: boolean;
  ternaIntegration: boolean;
  customsIntegration: boolean;
  dsoIntegration: boolean;
  registry?: PlantRegistry;
  checklist?: ComplianceChecklist;
}

export interface PlantCreateRequest {
  name: string;
  code: string;
  power: string;
  powerKw: number;
  status: string;
  type: string;
  location: string;
  municipality?: string;
  province?: string;
  region?: string;
}

export interface PlantUpdateRequest extends Partial<PlantCreateRequest> {}

export interface PlantListResponse {
  items: Plant[];
  total: number;
  page: number;
  size: number;
}

export interface PlantFilters {
  type?: string;
  status?: string;
  integration?: string;
  search?: string;
  tags?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Workflow Types
export interface WorkflowStage {
  id?: number;
  name: string;
  tasks: Task[];
  completed?: boolean;
  order?: number;
  durationDays?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface Task extends TimestampFields {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  assignee: string;
  dueDate: string;
  documents: TaskDocument[];
  comments: TaskComment[];
  priority?: 'High' | 'Medium' | 'Low';
  estimatedHours?: number;
  actualHours?: number;
  dependencies?: string[];
  responsibleEntity?: Entity;
  practiceType?: string;
  practiceCode?: string;
  portalUrl?: string;
  requiredCredentials?: string;
  integration?: Entity;
  automationConfig?: Record<string, any>;
}

export interface TaskDocument {
  name: string;
  type: 'sent' | 'received';
  date: string;
  url?: string;
  size?: string;
}

export interface TaskComment {
  id?: string;
  user: string;
  text: string;
  date: string;
}

export interface Workflow extends TimestampFields, TenantFields {
  id: number;
  name: string;
  plantId: number;
  plantName: string;
  currentState: string;
  progress: number;
  stages: WorkflowStage[];
  creationDate?: string;
  dueDate?: string;
  completionDate?: string;
  type?: string;
  category?: string;
  involvedEntities?: Entity[];
  plantPower?: number;
  plantType?: string;
  documentRequirements?: Record<string, any>;
  integrationStatus?: Record<string, string>;
  templateId?: number;
}

// Document Types
export interface Document extends TimestampFields, TenantFields {
  id: string;
  name: string;
  type: DocumentType;
  uploadDate: string;
  size: string;
  category: DocumentCategory;
  status?: 'Valid' | 'Expired' | 'Processing';
  expiryDate?: string;
  version?: number;
  tags?: string[];
}

// Deadline Types
export interface Deadline extends TimestampFields, TenantFields {
  id: string;
  title: string;
  plant: string;
  date: string;
  type: 'Payment' | 'Verification' | 'Declaration' | 'Renewal';
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Completed' | 'Late';
  entity?: Entity;
  recurring?: boolean;
  frequency?: 'Annual' | 'Triennial' | 'Quinquennial';
}

// Integration Types
export interface Integration {
  id: string;
  name: 'GSE' | 'Terna' | 'Customs' | 'E-Distribution';
  status: 'Connected' | 'Disconnected' | 'Error' | 'Maintenance';
  lastSync: string;
  connectionType: 'API' | 'EDI' | 'RPA' | 'PEC';
  queuedMessages?: number;
  errors?: number;
}

export interface IntegrationStatus {
  gse: boolean;
  terna: boolean;
  customs: boolean;
  dso: boolean;
}

// Notification Types
export interface Notification extends TimestampFields {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  plantId?: number;
  workflowId?: number;
}

// User Types
export interface User extends TimestampFields, TenantFields {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Asset Manager' | 'Operative' | 'Viewer';
  status: 'Active' | 'Suspended';
  lastAccess?: string;
  plants?: number[];
}

// Dashboard Types
export interface DashboardMetrics {
  totalPower: string;
  activePlants: number;
  totalPlants: number;
  delayedWorkflows: number;
  documentsToReview: number;
  upcomingDeadlines: number;
  assignedTasks: number;
  complianceScore: number;
}

// AI Extraction Types
export interface AIExtraction {
  documentId: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  extractedData?: Record<string, any>;
  confidence?: number;
  errors?: string[];
}

// Workflow Template Types
export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  responsible: string;
  estimatedDurationDays: number;
  requiredDocuments: string[];
  checkpoints: string[];
  dependencies: string[];
  integration: Entity | null;
  responsibleEntity?: Entity;
  deadlineDays?: number;
  applicationCondition?: string;
}

export interface WorkflowTemplate extends TimestampFields {
  id: string | number;
  name: string;
  description: string;
  category: string;
  estimatedDurationDays: number;
  tasks: TaskTemplate[];
  recurrence?: 'Annual' | 'Monthly' | 'One-time' | 'Quinquennial' | 'Triennial';
  deadline?: {
    month: number;
    day: number;
  };
  plantType?: string;
  minPower?: number;
  maxPower?: number;
  requiredEntities?: Entity[];
  baseDocuments?: string[];
  activationConditions?: Record<string, any>;
  deadlineConfig?: Record<string, any>;
  active?: boolean;
  workflowPurpose?: 'Complete Activation' | 'Specific Process' | 'Recurring Compliance' | 'Custom' | 'Phase Component';
  isCompleteWorkflow?: boolean;
  stages?: any[];
}
/**
 * API Services Index
 * Central export for all API service modules
 */

export { authService } from './auth.service';
export type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from './auth.service';

export { dashboardService } from './dashboard.service';
export type { DashboardMetrics, DashboardSummary, IntegrationStatus, PerformanceTrend, AlertItem } from './dashboard.service';

export { plantsService, plantsService as impiantiService } from './plants.service';
export type { 
  Plant, 
  PlantCreate, 
  PlantUpdate, 
  PlantListResponse,
  PlantRegistry,
  PlantPerformance,
  Manutenzione,
  ChecklistConformita,
  PlantFilters
} from './plants.service';

export { smartAssistantService } from './smart-assistant.service';
export type {
  PortalType,
  FormType,
  AssistantMessage,
  AssistantSession,
  FormGenerationRequest,
  FormGenerationResponse,
  PortalForm,
  AssistantChatRequest,
  AssistantChatResponse,
  WorkflowStatus
} from './smart-assistant.service';

export { calendarService } from './calendar.service';
export type {
  CalendarEvent,
  DeadlineAlert,
  ComplianceMatrix,
  CalendarSummary
} from './calendar.service';

export { workflowService } from './workflow.service';
export type {
  WorkflowListResponse,
  WorkflowCreateRequest,
  WorkflowStats,
  TaskUpdateRequest
} from './workflow.service';

export { usersService } from './users.service';
export type {
  User,
  UserRole,
  UserStatus,
  UserCreate,
  UserUpdate,
  UserListResponse,
  UserFilters,
  BulkOperation,
  UserActivity
} from './users.service';

export { default as apiClient, handleApiError } from './apiClient';

// Re-export storage utilities
export { tokenStorage } from '../storage/tokenStorage';
export type { TokenData, UserData } from '../storage/tokenStorage';
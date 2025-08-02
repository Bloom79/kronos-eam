/**
 * Smart Assistant Service
 * Manages AI assistant interactions and form generation
 */

import apiClient, { handleApiError } from './apiClient';

export enum PortalType {
  GSE = 'GSE',
  TERNA = 'TERNA',
  DSO = 'DSO',
  DOGANE = 'DOGANE',
}

export enum FormType {
  // GSE Forms
  RID_APPLICATION = 'RID_APPLICATION',
  SSP_APPLICATION = 'SSP_APPLICATION',
  ANTIMAFIA_DECLARATION = 'ANTIMAFIA_DECLARATION',
  FUEL_MIX_DECLARATION = 'FUEL_MIX_DECLARATION',
  
  // Terna Forms
  PLANT_REGISTRATION = 'PLANT_REGISTRATION',
  CONNECTION_REQUEST = 'CONNECTION_REQUEST',
  GAUDI_UPDATE = 'GAUDI_UPDATE',
  
  // DSO Forms
  TICA_REQUEST = 'TICA_REQUEST',
  CONNECTION_COMPLETION = 'CONNECTION_COMPLETION',
  METER_INSTALLATION = 'METER_INSTALLATION',
  
  // Dogane Forms
  UTF_DECLARATION = 'UTF_DECLARATION',
  ANNUAL_CONSUMPTION = 'ANNUAL_CONSUMPTION',
  LICENSE_RENEWAL = 'LICENSE_RENEWAL',
}

export interface AssistantMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}

export interface AssistantSession {
  session_id: string;
  plant_id: number;
  created_at: string;
  updated_at: string;
  status: 'active' | 'completed' | 'abandoned';
  context?: Record<string, any>;
}

export interface FormGenerationRequest {
  plant_id: number;
  portal: PortalType;
  form_type: FormType;
  additional_data?: Record<string, any>;
}

export interface FormGenerationResponse {
  request_id: string;
  plant_id: number;
  portal: string;
  form_type: string;
  form_path: string;
  form_url: string;
  preview_available: boolean;
  metadata: {
    generated_at: string;
    filled_fields: number;
    total_fields: number;
    missing_data: string[];
    warnings: string[];
  };
  data_used: Record<string, any>;
}

export interface PortalForm {
  portal: PortalType;
  form_type: FormType;
  name: string;
  description: string;
  required_documents: string[];
  deadline_info?: string;
  available: boolean;
}

export interface AssistantChatRequest {
  message: string;
  session_id?: string;
  plant_id?: number;
  context?: Record<string, any>;
}

export interface AssistantChatResponse {
  session_id: string;
  response: string;
  suggestions?: string[];
  actions?: Array<{
    type: string;
    label: string;
    data: any;
  }>;
  context?: Record<string, any>;
}

export interface WorkflowStatus {
  workflow_id: string;
  plant_id: number;
  portal: PortalType;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  current_step: string;
  total_steps: number;
  completed_steps: number;
  next_action?: string;
  blockers?: string[];
  estimated_completion?: string;
}

class SmartAssistantService {
  /**
   * Send message to AI assistant
   */
  async sendMessage(request: AssistantChatRequest): Promise<AssistantChatResponse> {
    try {
      const response = await apiClient.post<AssistantChatResponse>(
        '/smart-assistant/chat',
        request
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Generate form for a specific portal
   */
  async generateForm(request: FormGenerationRequest): Promise<FormGenerationResponse> {
    try {
      const response = await apiClient.post<FormGenerationResponse>(
        '/smart-assistant/generate-form',
        request
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get available forms for a portal
   */
  async getAvailableForms(portal?: PortalType): Promise<PortalForm[]> {
    try {
      const response = await apiClient.get<PortalForm[]>('/smart-assistant/forms', {
        params: portal ? { portal } : undefined,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get workflow status for an plant
   */
  async getWorkflowStatus(plantId: number, portal?: PortalType): Promise<WorkflowStatus[]> {
    try {
      const response = await apiClient.get<WorkflowStatus[]>(
        `/smart-assistant/workflow-status/${plantId}`,
        {
          params: portal ? { portal } : undefined,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get assistant session
   */
  async getSession(sessionId: string): Promise<AssistantSession> {
    try {
      const response = await apiClient.get<AssistantSession>(
        `/smart-assistant/sessions/${sessionId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create new assistant session
   */
  async createSession(plantId?: number): Promise<AssistantSession> {
    try {
      const response = await apiClient.post<AssistantSession>('/smart-assistant/sessions', {
        plant_id: plantId,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get session history
   */
  async getSessionHistory(sessionId: string): Promise<AssistantMessage[]> {
    try {
      const response = await apiClient.get<AssistantMessage[]>(
        `/smart-assistant/sessions/${sessionId}/history`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Analyze document with AI
   */
  async analyzeDocument(
    file: File,
    plantId?: number
  ): Promise<{
    document_type: string;
    extracted_data: Record<string, any>;
    confidence_score: number;
    suggestions: string[];
  }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (plantId) {
        formData.append('plant_id', plantId.toString());
      }

      const response = await apiClient.post(
        '/smart-assistant/analyze-document',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get form generation status
   */
  async getFormStatus(requestId: string): Promise<FormGenerationResponse> {
    try {
      const response = await apiClient.get<FormGenerationResponse>(
        `/smart-assistant/form-status/${requestId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Download generated form
   */
  async downloadForm(formPath: string): Promise<Blob> {
    try {
      const response = await apiClient.get(`/smart-assistant/download-form`, {
        params: { path: formPath },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get portal integration status
   */
  async getPortalStatus(portal: PortalType): Promise<{
    portal: string;
    status: 'active' | 'maintenance' | 'error';
    last_sync: string;
    features_available: string[];
    message?: string;
  }> {
    try {
      const response = await apiClient.get(`/smart-assistant/portal-status/${portal}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

// Export singleton instance
export const smartAssistantService = new SmartAssistantService();
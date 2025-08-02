/**
 * Workflow Service
 * Handles all workflow-related API operations including templates
 */

import apiClient from './apiClient';
import { WorkflowTemplate, Workflow, WorkflowTask } from '../../types';
import { normalizeTemplateId } from '../../utils';

export interface WorkflowListResponse {
  items: Workflow[];
  total: number;
  page: number;
  pages: number;
}

export interface WorkflowCreateRequest {
  template_id?: number | string;
  plant_id: number;
  name: string;
  descrizione?: string;
  potenza_plant?: number;
  type_plant?: string;
  responsabile?: string;
  data_scadenza?: string;
  task_assignments?: Record<string, string>;
  task_due_dates?: Record<string, string>;
  enti_coinvolti?: string[];
  use_phase_templates?: boolean;
  phase_templates?: Record<string, number>;
}

export interface WorkflowStats {
  active_workflows: number;
  completed_workflows: number;
  overdue_tasks: number;
  in_progress_tasks: number;
  completed_tasks: number;
  upcoming_deadlines: number;
  entity_task_distribution: Record<string, number>;
}

export interface TaskUpdateRequest {
  status?: string;
  assegnato_a?: string;
  data_scadenza?: string;
  note?: string;
  progresso?: number;
}

class WorkflowService {
  /**
   * Get all workflow templates
   */
  async getTemplates(params?: {
    categoria?: string;
    phase?: string;
    type_plant?: string;
    potenza_kw?: number;
    area_vincolata?: boolean;
  }): Promise<WorkflowTemplate[]> {
    const response = await apiClient.get('/workflow/templates', { params });
    return response.data;
  }

  /**
   * Get workflow template by ID
   */
  async getTemplate(id: number): Promise<WorkflowTemplate> {
    const response = await apiClient.get(`/workflow/templates/${id}`);
    return response.data;
  }

  /**
   * Get all workflows with optional filters
   */
  async getWorkflows(params?: {
    categoria?: string;
    plant_id?: number;
    status?: string;
    skip?: number;
    limit?: number;
  }): Promise<WorkflowListResponse> {
    const response = await apiClient.get('/workflow/', { params });
    return response.data;
  }

  /**
   * Get workflow by ID
   */
  async getWorkflow(id: number): Promise<Workflow> {
    const response = await apiClient.get(`/workflow/${id}`);
    return response.data;
  }

  /**
   * Create new workflow from template or custom
   */
  async createWorkflow(data: WorkflowCreateRequest): Promise<Workflow> {
    if (data.use_phase_templates && data.phase_templates) {
      // Use the compose endpoint for phase-based workflows
      const response = await apiClient.post('/workflow/compose', {
        plant_id: data.plant_id,
        name: data.name,
        description: data.descrizione,
        phase_templates: data.phase_templates,
        data_scadenza: data.data_scadenza,
        task_assignments: data.task_assignments,
        enti_coinvolti: data.enti_coinvolti
      });
      return response.data;
    } else {
      // Ensure template_id is properly normalized before sending to API
      const requestData = {
        ...data,
        template_id: normalizeTemplateId(data.template_id)
      };
      const response = await apiClient.post('/workflow/', requestData);
      return response.data;
    }
  }

  /**
   * Update workflow
   */
  async updateWorkflow(id: number, data: Partial<Workflow>): Promise<Workflow> {
    const response = await apiClient.put(`/workflow/${id}`, data);
    return response.data;
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(id: number): Promise<void> {
    await apiClient.delete(`/workflow/${id}`);
  }

  /**
   * Get workflow statistics for dashboard
   */
  async getWorkflowStats(): Promise<WorkflowStats> {
    const response = await apiClient.get('/workflow/stats/dashboard');
    return response.data;
  }

  /**
   * Get tasks for a specific workflow
   */
  async getWorkflowTasks(workflowId: number): Promise<WorkflowTask[]> {
    const response = await apiClient.get(`/workflow/${workflowId}/tasks`);
    return response.data;
  }

  /**
   * Update a specific task
   */
  async updateTask(taskId: number, data: TaskUpdateRequest): Promise<WorkflowTask> {
    const response = await apiClient.put(`/workflow/tasks/${taskId}`, data);
    return response.data;
  }

  /**
   * Complete a task
   */
  async completeTask(taskId: number, notes?: string): Promise<WorkflowTask> {
    const response = await apiClient.post(`/workflow/tasks/${taskId}/complete`, { notes });
    return response.data;
  }

  /**
   * Upload document for a task
   */
  async uploadTaskDocument(taskId: number, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post(`/workflow/tasks/${taskId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Add comment to a task
   */
  async addTaskComment(taskId: number, comment: string): Promise<any> {
    const response = await apiClient.post(`/workflow/tasks/${taskId}/comments`, { text: comment });
    return response.data;
  }

  /**
   * Get upcoming deadlines
   */
  async getUpcomingDeadlines(days: number = 30): Promise<any[]> {
    const response = await apiClient.get('/calendar/upcoming', { 
      params: { days } 
    });
    return response.data;
  }

  /**
   * Get document templates for a workflow template
   */
  async getDocumentTemplates(templateId: number): Promise<any[]> {
    const response = await apiClient.get(`/workflow/templates/${templateId}/documents`);
    return response.data;
  }

  /**
   * Create a new workflow template
   */
  async createTemplate(data: Partial<WorkflowTemplate>): Promise<WorkflowTemplate> {
    const response = await apiClient.post('/workflow/templates', data);
    return response.data;
  }

  /**
   * Update an existing workflow template
   */
  async updateTemplate(templateId: number, data: Partial<WorkflowTemplate>): Promise<WorkflowTemplate> {
    const response = await apiClient.put(`/workflow/templates/${templateId}`, data);
    return response.data;
  }

  /**
   * Delete a workflow template
   */
  async deleteTemplate(templateId: number): Promise<void> {
    await apiClient.delete(`/workflow/templates/${templateId}`);
  }

  /**
   * Generate document from template
   */
  async generateDocument(workflowId: number, data: {
    template_id: number;
    format: string;
    data?: Record<string, any>;
  }): Promise<any> {
    const response = await apiClient.post(`/workflow/${workflowId}/documents/generate`, data);
    return response.data;
  }

  /**
   * Preview document template data
   */
  async previewDocumentTemplate(workflowId: number): Promise<Record<string, any>> {
    const response = await apiClient.get(`/workflow/${workflowId}/documents/preview`);
    return response.data;
  }

  /**
   * Create workflow from complete renewable energy template
   */
  async createRenewableEnergyWorkflow(data: {
    plant_id: number;
    potenza_kw: number;
    type_plant: string;
    has_heritage_constraints?: boolean;
    simplified_process?: boolean;
    responsabile: string;
  }): Promise<Workflow> {
    // Find the renewable energy activation template
    const templates = await this.getTemplates();
    const template = templates.find(t => t.name === 'Complete Renewable Plant Activation');
    
    if (!template) {
      throw new Error('Renewable energy workflow template not found');
    }

    // Determine which entities are involved based on plant characteristics
    const entiCoinvolti = ['DSO', 'Terna', 'GSE'];
    if (data.potenza_kw > 20) {
      entiCoinvolti.push('Customs');
    }
    if (data.has_heritage_constraints) {
      entiCoinvolti.push('Superintendency');
    }
    entiCoinvolti.push('Municipality'); // Always required

    const workflowData: WorkflowCreateRequest = {
      template_id: normalizeTemplateId(template.id),
      plant_id: data.plant_id,
      name: `Attivazione ${data.type_plant} ${data.potenza_kw}kW`,
      descrizione: `Processo completo di attivazione plant ${data.type_plant} da ${data.potenza_kw} kW`,
      potenza_plant: data.potenza_kw,
      type_plant: data.type_plant,
      responsabile: data.responsabile,
      enti_coinvolti: entiCoinvolti,
      // Set deadline based on template duration
      data_scadenza: new Date(Date.now() + (template.durata_stimata_giorni || 180) * 24 * 60 * 60 * 1000).toISOString(),
    };

    return this.createWorkflow(workflowData);
  }
}

export const workflowService = new WorkflowService();
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
  description?: string;
  power_kw?: number;
  plant_type?: string;
  assignee?: string;
  due_date?: string;
  task_assignments?: Record<string, string>;
  task_due_dates?: Record<string, string>;
  involvedEntities?: string[];
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
  assigned_to?: string;
  due_date?: string;
  notes?: string;
  progress?: number;
}

class WorkflowService {
  /**
   * Get all workflow templates
   */
  async getTemplates(params?: {
    category?: string;
    phase?: string;
    plant_type?: string;
    power_kw?: number;
    heritage_constraints?: boolean;
  }): Promise<WorkflowTemplate[]> {
    const response = await apiClient.get('/workflow/templates', { params });
    return response.data;
  }

  /**
   * Get workflow templates applicable to a specific plant
   */
  async getApplicableTemplatesForPlant(plantId: number): Promise<WorkflowTemplate[]> {
    const response = await apiClient.get(`/workflow/templates/applicable/${plantId}`);
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
    category?: string;
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
        description: data.description,
        phase_templates: data.phase_templates,
        due_date: data.due_date,
        task_assignments: data.task_assignments,
        involvedEntities: data.involvedEntities
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
    power_kw: number;
    plant_type: string;
    has_heritage_constraints?: boolean;
    simplified_process?: boolean;
    assignee: string;
  }): Promise<Workflow> {
    // Find the renewable energy activation template
    const templates = await this.getTemplates();
    const template = templates.find(t => t.name === 'Complete Renewable Plant Activation');
    
    if (!template) {
      throw new Error('Renewable energy workflow template not found');
    }

    // Determine which entities are involved based on plant characteristics
    const involvedEntities = ['DSO', 'Terna', 'GSE'];
    if (data.power_kw > 20) {
      involvedEntities.push('Customs');
    }
    if (data.has_heritage_constraints) {
      involvedEntities.push('Superintendency');
    }
    involvedEntities.push('Municipality'); // Always required

    const workflowData: WorkflowCreateRequest = {
      template_id: normalizeTemplateId(template.id),
      plant_id: data.plant_id,
      name: `Attivazione ${data.plant_type} ${data.power_kw}kW`,
      description: `Processo completo di attivazione plant ${data.plant_type} da ${data.power_kw} kW`,
      power_kw: data.power_kw,
      plant_type: data.plant_type,
      assignee: data.assignee,
      involvedEntities: involvedEntities,
      // Set deadline based on template duration
      due_date: new Date(Date.now() + (template.estimated_duration_days || 180) * 24 * 60 * 60 * 1000).toISOString(),
    };

    return this.createWorkflow(workflowData);
  }
}

export const workflowService = new WorkflowService();
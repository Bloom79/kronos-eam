/**
 * Unified API Service Export
 * Re-exports all services from the api directory and adds backward compatibility
 */

// Import and re-export the default apiClient
import apiClient from './api/apiClient';
import { authService } from './api/auth.service';

// Re-export everything from the api directory
export * from './api/index';
export default apiClient;
export { apiClient };

// Explicitly re-export authService to ensure it's available
export { authService };

// Additional services that were in the old api.ts file

// Document Service (if not already in api directory)
export const documentService = {
  async getTemplates(category?: string) {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    const response = await apiClient.get(`/documents/templates?${params}`);
    return response.data;
  },

  async searchTemplates(query: string, entity?: string) {
    const params = new URLSearchParams({ query });
    if (entity) params.append('entity', entity);
    const response = await apiClient.get(`/documents/templates/search?${params}`);
    return response.data;
  },

  async uploadTemplate(formData: FormData) {
    const response = await apiClient.post('/documents/templates/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async fillTemplate(templateId: number, plantId: number, fieldValues: any) {
    const response = await apiClient.post(`/documents/templates/${templateId}/fill?plant_id=${plantId}`, fieldValues);
    return response.data;
  }
};

// Additional type exports (if needed for backward compatibility)
export type { User, UserRole, UserStatus, UserFilters, BulkOperation } from './api/users.service';
export type { Plant } from './api/plants.service';
export type { WorkflowTemplate, Workflow } from '../types';
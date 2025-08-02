/**
 * Plants Service
 * Manages power plants (plants) CRUD operations
 */

import apiClient, { handleApiError } from './apiClient';

export interface PlantRegistry {
  id?: number;
  pod?: string;
  gaudi?: string;
  censimp?: string;
  data_esercizio?: string;
  regime?: string;
  responsabile?: string;
  assicurazione?: string;
  numero_moduli?: number;
  numero_inverter?: number;
  superficie_occupata?: number;
}

export interface PlantPerformance {
  anno: number;
  mese: number;
  produzione_attesa_kwh: number;
  produzione_effettiva_kwh: number;
  performance_ratio?: number;
  availability?: number;
}

export interface Manutenzione {
  id: number;
  planned_date: string;
  execution_date?: string;
  type: 'Routine' | 'Extraordinary' | 'Predictive' | 'Corrective';
  status: 'Completed' | 'Planned' | 'In Progress' | 'Cancelled';
  description: string;
  estimated_cost?: number;
  actual_cost?: number;
  executor?: string;
}

export interface ChecklistConformita {
  dso_connection: boolean;
  terna_registration: boolean;
  gse_activation: boolean;
  customs_license: boolean;
  spi_verification: boolean;
  consumption_declaration: boolean;
  compliance_score: number;
}

export interface Plant {
  id: number;
  name: string;
  code: string;
  power: string;
  power_kw: number;
  status: 'In Operation' | 'Under Authorization' | 'Under Construction' | 'Decommissioned';
  type: 'Photovoltaic' | 'Wind' | 'Hydroelectric' | 'Biomass' | 'Geothermal';
  location: string;
  municipality?: string;
  province?: string;
  region?: string;
  next_deadline?: string;
  next_deadline_type?: string;
  deadline_color?: string;
  gse_integration: boolean;
  terna_integration: boolean;
  customs_integration: boolean;
  dso_integration: boolean;
  registry?: PlantRegistry;
  checklist?: ChecklistConformita;
  created_at?: string;
  updated_at?: string;
}

export interface PlantCreate {
  name: string;
  code: string;
  power: string;
  power_kw: number;
  status: string;
  type: string;
  location: string;
  municipality?: string;
  province?: string;
  region?: string;
}

export interface PlantUpdate extends Partial<PlantCreate> {}

export interface PlantListResponse {
  items: Plant[];
  total: number;
  skip: number;
  limit: number;
}

export interface PlantFilters {
  type?: string;
  status?: string;
  integration?: string;
  search?: string;
  tags?: string;
  date_from?: string;
  date_to?: string;
}

class PlantsService {
  /**
   * Get list of plants with pagination and filters
   */
  async getPlants(
    page = 1,
    limit = 20,
    filters?: PlantFilters,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Promise<PlantListResponse> {
    try {
      const skip = (page - 1) * limit;
      const response = await apiClient.get<PlantListResponse>('/plants/', {
        params: {
          skip,
          limit,
          sort_by: sortBy,
          sort_order: sortOrder,
          ...filters,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get single plant by ID
   */
  async getPlant(id: number): Promise<Plant> {
    try {
      const response = await apiClient.get<Plant>(`/plants/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create new plant
   */
  async createPlant(data: PlantCreate): Promise<Plant> {
    try {
      const response = await apiClient.post<Plant>('/plants/', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update plant
   */
  async updatePlant(id: number, data: PlantUpdate): Promise<Plant> {
    try {
      const response = await apiClient.put<Plant>(`/plants/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete plant
   */
  async deletePlant(id: number, softDelete = true): Promise<void> {
    try {
      await apiClient.delete(`/plants/${id}`, {
        params: { soft_delete: softDelete },
      });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get plant performance data
   */
  async getPerformance(plantId: number, year: number, month?: number): Promise<PlantPerformance[]> {
    try {
      const response = await apiClient.get<PlantPerformance[]>(
        `/plants/${plantId}/performance`,
        {
          params: { year, month },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get plant maintenance records
   */
  async getManutenzioni(plantId: number, status?: string): Promise<Manutenzione[]> {
    try {
      const response = await apiClient.get<Manutenzione[]>(
        `/plants/${plantId}/maintenance`,
        {
          params: status ? { status } : undefined,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create maintenance record
   */
  async createManutenzione(plantId: number, data: Partial<Manutenzione>): Promise<Manutenzione> {
    try {
      const response = await apiClient.post<Manutenzione>(
        `/plants/${plantId}/maintenance`,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get plants summary for dashboard
   */
  async getSummary(): Promise<any[]> {
    try {
      const response = await apiClient.get('/plants/summary');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get plant metrics
   */
  async getMetrics(plantId: number, periodDays = 365): Promise<any> {
    try {
      const response = await apiClient.get(`/plants/${plantId}/metrics`, {
        params: { period_days: periodDays },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

// Export singleton instance
export const plantsService = new PlantsService();
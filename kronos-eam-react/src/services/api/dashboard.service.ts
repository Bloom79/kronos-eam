/**
 * Dashboard Service
 * Fetches dashboard metrics, summaries, and analytics data
 */

import apiClient, { handleApiError } from './apiClient';

export interface DashboardMetrics {
  potenza_totale_mw: number;
  plants_attivi: number;
  plants_totali: number;
  performance_ratio_medio: number;
  energia_prodotta_mese_mwh: number;
  energia_attesa_mese_mwh: number;
  disponibilita_media_percent: number;
  allarmi_attivi: number;
  manutenzioni_programmate: number;
  scadenze_prossime_7_giorni: number;
  conformita_media_percent: number;
  ultimo_aggiornamento: string;
}

export interface IntegrationStatus {
  name: string;
  status: 'Connected' | 'Error' | 'Maintenance' | 'Disconnected';
  ultima_sincronizzazione: string | null;
  type_connessione: string;
  messaggi_in_coda?: number;
  errori?: number;
}

export interface DashboardSummary {
  metrics: DashboardMetrics;
  integrations: IntegrationStatus[];
  recent_activities: Array<{
    timestamp: string;
    type: string;
    descrizione: string;
    plant?: string;
    utente?: string;
  }>;
}

export interface PerformanceTrend {
  period: string;
  labels: string[];
  production: number[];
  performance_ratio: number[];
  availability: number[];
  revenue: number[];
}

export interface AlertItem {
  id: string;
  type: 'error' | 'warning' | 'info';
  titolo: string;
  descrizione: string;
  plant_id?: number;
  plant_name?: string;
  timestamp: string;
  letto: boolean;
  azioni?: Array<{
    label: string;
    action: string;
  }>;
}

class DashboardService {
  /**
   * Get dashboard metrics
   */
  async getMetrics(): Promise<DashboardMetrics> {
    try {
      const response = await apiClient.get<DashboardMetrics>('/dashboard/metrics');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get dashboard summary including metrics and integrations
   */
  async getSummary(): Promise<DashboardSummary> {
    try {
      const response = await apiClient.get<DashboardSummary>('/dashboard/summary');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get performance trend data
   */
  async getPerformanceTrend(period: 'week' | 'month' | 'year' = 'month'): Promise<PerformanceTrend> {
    try {
      // Map frontend period values to backend expected values
      const periodMap = {
        'week': 'weekly',
        'month': 'monthly',
        'year': 'yearly'
      };
      const response = await apiClient.get<PerformanceTrend>('/dashboard/performance-trend', {
        params: { period: periodMap[period] || 'monthly' }
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get active alerts
   */
  async getAlerts(unreadOnly = false): Promise<AlertItem[]> {
    try {
      const response = await apiClient.get<AlertItem[]>('/dashboard/alerts', {
        params: { unread_only: unreadOnly }
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Mark alert as read
   */
  async markAlertAsRead(alertId: string): Promise<void> {
    try {
      await apiClient.put(`/dashboard/alerts/${alertId}/read`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get compliance matrix
   */
  async getComplianceMatrix(): Promise<any> {
    try {
      const response = await apiClient.get('/dashboard/compliance-matrix');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get financial summary
   */
  async getFinancialSummary(year?: number): Promise<any> {
    try {
      const response = await apiClient.get('/dashboard/financial-summary', {
        params: year ? { year } : undefined
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get maintenance overview
   */
  async getMaintenanceOverview(): Promise<any> {
    try {
      const response = await apiClient.get('/dashboard/maintenance-overview');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

// Export singleton instance
export const dashboardService = new DashboardService();
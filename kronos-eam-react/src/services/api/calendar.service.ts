/**
 * Calendar Service
 * Manages deadlines, compliance dates, and scheduled events
 */

import apiClient, { handleApiError } from './apiClient';

export interface CalendarEvent {
  id: string;
  plant_id?: number;
  plant_name?: string;
  title: string;
  description: string;
  date: string;
  due_date?: string;
  type: 'deadline' | 'maintenance' | 'inspection' | 'payment' | 'declaration' | 'other';
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed' | 'overdue' | 'cancelled';
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    end_date?: string;
  };
  tags?: string[];
  responsible_user?: string;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface DeadlineAlert {
  id: string;
  event_id: string;
  plant_id?: number;
  type: string;
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  days_remaining: number;
  due_date: string;
  action_required?: string;
  acknowledged: boolean;
  acknowledged_at?: string;
  acknowledged_by?: string;
}

export interface ComplianceMatrix {
  plant_id: number;
  plant_name: string;
  compliance_items: Array<{
    category: string;
    requirement: string;
    deadline: string;
    status: 'compliant' | 'pending' | 'overdue' | 'not_applicable';
    last_completed?: string;
    next_due: string;
    responsible_entity: string;
    documents?: string[];
  }>;
  overall_compliance_score: number;
  critical_deadlines: number;
  upcoming_deadlines_30_days: number;
}

export interface CalendarSummary {
  total_events: number;
  pending_events: number;
  overdue_events: number;
  upcoming_7_days: number;
  upcoming_30_days: number;
  events_by_type: Record<string, number>;
  critical_deadlines: DeadlineAlert[];
}

class CalendarService {
  /**
   * Get calendar events with filters
   */
  async getEvents(params?: {
    plant_id?: number;
    type?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: CalendarEvent[]; total: number }> {
    try {
      const response = await apiClient.get('/calendar/events', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get single event
   */
  async getEvent(eventId: string): Promise<CalendarEvent> {
    try {
      const response = await apiClient.get<CalendarEvent>(`/calendar/events/${eventId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create new event
   */
  async createEvent(event: Partial<CalendarEvent>): Promise<CalendarEvent> {
    try {
      const response = await apiClient.post<CalendarEvent>('/calendar/events', event);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update event
   */
  async updateEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    try {
      const response = await apiClient.put<CalendarEvent>(`/calendar/events/${eventId}`, updates);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete event
   */
  async deleteEvent(eventId: string): Promise<void> {
    try {
      await apiClient.delete(`/calendar/events/${eventId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Mark event as completed
   */
  async completeEvent(eventId: string, notes?: string): Promise<CalendarEvent> {
    try {
      const response = await apiClient.post<CalendarEvent>(
        `/calendar/events/${eventId}/complete`,
        { notes }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get deadline alerts
   */
  async getDeadlineAlerts(params?: {
    plant_id?: number;
    severity?: string;
    acknowledged?: boolean;
    days_ahead?: number;
  }): Promise<DeadlineAlert[]> {
    try {
      const response = await apiClient.get<DeadlineAlert[]>('/calendar/deadline-alerts', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Acknowledge deadline alert
   */
  async acknowledgeAlert(alertId: string, notes?: string): Promise<DeadlineAlert> {
    try {
      const response = await apiClient.post<DeadlineAlert>(
        `/calendar/deadline-alerts/${alertId}/acknowledge`,
        { notes }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get compliance matrix for plant
   */
  async getComplianceMatrix(plantId: number): Promise<ComplianceMatrix> {
    try {
      const response = await apiClient.get<ComplianceMatrix>(
        `/calendar/compliance-matrix/${plantId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get calendar summary
   */
  async getCalendarSummary(plantId?: number): Promise<CalendarSummary> {
    try {
      const response = await apiClient.get<CalendarSummary>('/calendar/summary', {
        params: plantId ? { plant_id: plantId } : undefined,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Generate recurring events
   */
  async generateRecurringEvents(params: {
    plant_id?: number;
    template_type: 'annual_declarations' | 'maintenance' | 'inspections' | 'custom';
    start_date: string;
    end_date: string;
    custom_template?: Partial<CalendarEvent>;
  }): Promise<CalendarEvent[]> {
    try {
      const response = await apiClient.post<CalendarEvent[]>(
        '/calendar/generate-recurring',
        params
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Export calendar to iCal format
   */
  async exportToICal(params?: {
    plant_id?: number;
    date_from?: string;
    date_to?: string;
  }): Promise<Blob> {
    try {
      const response = await apiClient.get('/calendar/export/ical', {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get upcoming deadlines grouped by period
   */
  async getUpcomingDeadlines(plantId?: number): Promise<CalendarEvent[] | {
    overdue: CalendarEvent[];
    this_week: CalendarEvent[];
    this_month: CalendarEvent[];
    next_3_months: CalendarEvent[];
  }> {
    try {
      const response = await apiClient.get('/calendar/upcoming-deadlines', {
        params: plantId ? { plant_id: plantId } : undefined,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

// Export singleton instance
export const calendarService = new CalendarService();
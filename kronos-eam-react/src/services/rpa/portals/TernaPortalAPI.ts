/**
 * Terna Portal API Integration
 * Provides Terna GAUDÌ automation capabilities through API/proxy approach
 */

import { RPACredentials } from '../RPAService';
import { BrowserRPAEngine } from '../BrowserRPAEngine';

export interface plantData {
  typelogia: string;
  potenzaNominale: number;
  pod: string;
  indirizzo: string;
  comune: string;
  provincia: string;
  pannelli?: {
    marca: string;
    modello: string;
    quantita: number;
    potenzaUnitaria: number;
  };
  inverter?: {
    marca: string;
    modello: string;
    quantita: number;
  };
}

export interface CommunicationFlow {
  code: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Error';
  date: string;
  description: string;
}

export class TernaPortalAPI {
  private rpaEngine: BrowserRPAEngine;
  private readonly portalUrl = 'https://www.terna.it/gaudi';
  private readonly apiBaseUrl = 'https://api.terna.it/transparency/v1';

  constructor() {
    this.rpaEngine = new BrowserRPAEngine();
  }

  /**
   * Execute Terna portal action
   */
  async executeAction(action: string, data: any): Promise<any> {
    return this.rpaEngine.executeTask({
      portal: 'terna',
      action,
      data
    });
  }

  /**
   * Login to GAUDÌ portal
   */
  async login(credentials: RPACredentials): Promise<boolean> {
    const result = await this.executeAction('login', { credentials });
    return result.success;
  }

  /**
   * Register new plant on GAUDÌ
   */
  async registerplant(data: plantData): Promise<string> {
    const result = await this.executeAction('registerplant', data);
    return result.gaudiCode || '';
  }

  /**
   * Update existing plant data
   */
  async updateplant(gaudiCode: string, updates: Partial<plantData>): Promise<boolean> {
    const result = await this.executeAction('updateplant', {
      gaudiCode,
      updates
    });
    return result.success;
  }

  /**
   * Check communication flows status
   */
  async checkCommunicationFlows(gaudiCode: string): Promise<CommunicationFlow[]> {
    const result = await this.executeAction('checkFlows', { gaudiCode });
    return result.flows || [];
  }

  /**
   * Download GAUDÌ documents
   */
  async downloadDocuments(gaudiCode: string): Promise<string[]> {
    const result = await this.executeAction('downloadDocuments', { gaudiCode });
    return result.downloadedFiles || [];
  }

  /**
   * Use Terna public APIs for market data
   */
  async fetchMarketData(apiKey: string, date: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/market/day-ahead/${date}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch market data:', error);
      // Return mock data for demo
      return {
        date,
        zones: {
          'NORD': { avgPrice: 85.32, volume: 15420 },
          'CENTRO-NORD': { avgPrice: 87.15, volume: 12300 },
          'CENTRO-SUD': { avgPrice: 88.90, volume: 10250 },
          'SUD': { avgPrice: 90.20, volume: 8900 },
          'SICILIA': { avgPrice: 92.45, volume: 4500 },
          'SARDEGNA': { avgPrice: 91.30, volume: 3200 }
        }
      };
    }
  }

  /**
   * Monitor POD activation status
   */
  async checkPODActivation(pod: string): Promise<any> {
    const result = await this.executeAction('checkPODActivation', { pod });
    return result;
  }

  /**
   * Submit validation documents
   */
  async submitValidationDocuments(gaudiCode: string, documents: Array<{type: string; path: string}>): Promise<boolean> {
    const result = await this.executeAction('submitValidationDocuments', {
      gaudiCode,
      documents
    });
    return result.success;
  }

  /**
   * Open portal for manual interaction
   */
  openPortal(credentials?: RPACredentials): Window | null {
    return this.rpaEngine.openPortalWindow('terna', credentials);
  }

  /**
   * Validate plant data before submission
   */
  validateplantData(data: plantData): string[] {
    const errors: string[] = [];

    if (!data.typelogia) errors.push('typelogia plant richiesta');
    if (!data.potenzaNominale || data.potenzaNominale <= 0) {
      errors.push('Potenza nominale deve essere maggiore di 0');
    }
    if (!data.pod || !data.pod.match(/^IT\d{3}E\d{8}$/)) {
      errors.push('Codice POD non valido (formato: IT001E12345678)');
    }
    if (!data.indirizzo) errors.push('Indirizzo richiesto');
    if (!data.comune) errors.push('Comune richiesto');
    if (!data.provincia || data.provincia.length !== 2) {
      errors.push('Provincia richiesta (sigla 2 caratteri)');
    }

    return errors;
  }

  /**
   * Format flow status for display
   */
  formatFlowStatus(flow: CommunicationFlow): string {
    const statusMap: Record<string, string> = {
      'Pending': 'In Attesa',
      'In Progress': 'In Elaborazione',
      'Completed': 'Completato',
      'Error': 'Errore'
    };
    return statusMap[flow.status] || flow.status;
  }
}
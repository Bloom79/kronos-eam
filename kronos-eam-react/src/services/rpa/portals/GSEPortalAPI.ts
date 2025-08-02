/**
 * GSE Portal API Integration
 * Provides GSE automation capabilities through API/proxy approach
 */

import { RPACredentials } from '../RPAService';
import { BrowserRPAEngine } from '../BrowserRPAEngine';

export class GSEPortalAPI {
  private rpaEngine: BrowserRPAEngine;
  private readonly portalUrl = 'https://areaclienti.gse.it';

  constructor() {
    this.rpaEngine = new BrowserRPAEngine();
  }

  /**
   * Execute GSE portal action
   */
  async executeAction(action: string, data: any): Promise<any> {
    return this.rpaEngine.executeTask({
      portal: 'gse',
      action,
      data
    });
  }

  /**
   * Login to GSE portal
   */
  async login(credentials: RPACredentials): Promise<boolean> {
    const result = await this.executeAction('login', { credentials });
    return result.success;
  }

  /**
   * Submit RID request
   */
  async submitRID(data: any): Promise<string> {
    const result = await this.executeAction('submitRID', data);
    return result.requestId || '';
  }

  /**
   * Submit Antimafia declaration
   */
  async submitAntimafia(data: any): Promise<string> {
    const result = await this.executeAction('submitAntimafia', data);
    return result.declarationId || '';
  }

  /**
   * Submit Fuel Mix communication
   */
  async submitFuelMix(data: any): Promise<boolean> {
    const result = await this.executeAction('submitFuelMix', data);
    return result.success;
  }

  /**
   * Check practice status
   */
  async checkStatus(practiceId: string): Promise<any> {
    return this.executeAction('checkStatus', { practiceId });
  }

  /**
   * Download document
   */
  async downloadDocument(documentUrl: string, savePath: string): Promise<void> {
    await this.executeAction('downloadDocument', {
      documentUrl,
      savePath
    });
  }

  /**
   * Open portal for manual interaction
   */
  openPortal(credentials?: RPACredentials): Window | null {
    return this.rpaEngine.openPortalWindow('gse', credentials);
  }

  /**
   * Generate TOTP code for MFA
   */
  generateTOTP(secret: string): string {
    // This would need a proper TOTP library in production
    // For now, return a placeholder
    return '123456';
  }

  /**
   * Validate form data before submission
   */
  validateRIDData(data: any): string[] {
    const errors: string[] = [];

    if (!data.typeplant) errors.push('type plant richiesto');
    if (!data.potenzaNominale) errors.push('Potenza nominale richiesta');
    if (!data.podCode) errors.push('Codice POD richiesto');
    if (!data.documents || data.documents.length === 0) {
      errors.push('Almeno un documento richiesto');
    }

    return errors;
  }

  /**
   * Format RID data for submission
   */
  formatRIDData(rawData: any): any {
    return {
      typeplant: rawData.typeplant,
      potenzaNominale: parseFloat(rawData.potenzaNominale),
      podCode: rawData.podCode.toUpperCase(),
      dataAttivazione: new Date().toISOString(),
      documents: rawData.documents.map((doc: any) => ({
        type: doc.type,
        fileName: doc.path.split('/').pop(),
        path: doc.path
      }))
    };
  }
}
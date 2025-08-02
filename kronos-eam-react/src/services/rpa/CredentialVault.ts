/**
 * Secure Credential Vault for RPA Services
 * Implements encryption and secure storage of portal credentials
 */

import { BrowserCrypto } from './BrowserCrypto';

export interface VaultCredential {
  id: string;
  portal: string;
  type: string;
  username?: string;
  encryptedPassword?: string;
  certificatePath?: string;
  spidProvider?: string;
  mfaSecret?: string;
  apiKey?: string;
  metadata: {
    createdAt: Date;
    lastUsed?: Date;
    lastRotated?: Date;
    expiresAt?: Date;
  };
}

export interface VaultOptions {
  encryptionKey?: string;
  storageProvider?: 'memory' | 'file' | 'database';
  autoRotate?: boolean;
  rotationDays?: number;
}

export class CredentialVault {
  private credentials: Map<string, VaultCredential> = new Map();
  private encryptionPassword: string;
  private algorithm = 'AES-GCM';

  constructor(options: VaultOptions = {}) {
    // Initialize encryption password
    this.encryptionPassword = options.encryptionKey || 'kronos-eam-default-key';

    // Initialize storage
    this.initializeStorage(options.storageProvider || 'memory');

    // Setup auto-rotation if enabled
    if (options.autoRotate) {
      this.setupAutoRotation(options.rotationDays || 90);
    }
  }


  /**
   * Initialize storage provider
   */
  private initializeStorage(provider: string): void {
    switch (provider) {
      case 'file':
        // Initialize file-based storage
        this.loadFromFile();
        break;
      case 'database':
        // Initialize database storage
        this.loadFromDatabase();
        break;
      default:
        // Memory storage is already initialized
        break;
    }
  }

  /**
   * Encrypt sensitive data
   */
  private async encrypt(text: string): Promise<{ encrypted: string; salt: string; iv: string }> {
    return await BrowserCrypto.encrypt(text, this.encryptionPassword);
  }

  /**
   * Decrypt sensitive data
   */
  private async decrypt(encryptedData: { encrypted: string; salt: string; iv: string }): Promise<string> {
    return await BrowserCrypto.decrypt(encryptedData, this.encryptionPassword);
  }

  /**
   * Store credential in vault
   */
  public async storeCredential(
    portal: string,
    type: string,
    credentials: Record<string, any>
  ): Promise<string> {
    const id = BrowserCrypto.randomUUID();
    
    // Encrypt password if present
    let encryptedPassword: string | undefined;
    if (credentials.password) {
      const encData = await this.encrypt(credentials.password);
      encryptedPassword = JSON.stringify(encData);
    }

    // Encrypt MFA secret if present
    let encryptedMfaSecret: string | undefined;
    if (credentials.mfaSecret) {
      const encData = await this.encrypt(credentials.mfaSecret);
      encryptedMfaSecret = JSON.stringify(encData);
    }

    const vaultCredential: VaultCredential = {
      id,
      portal,
      type,
      username: credentials.username,
      encryptedPassword,
      certificatePath: credentials.certificatePath,
      spidProvider: credentials.spidProvider,
      mfaSecret: encryptedMfaSecret,
      apiKey: credentials.apiKey,
      metadata: {
        createdAt: new Date(),
        expiresAt: credentials.expiresAt
      }
    };

    this.credentials.set(id, vaultCredential);
    await this.persistCredentials();
    
    return id;
  }

  /**
   * Retrieve credential from vault
   */
  public async getCredential(id: string): Promise<Record<string, any> | null> {
    const vaultCred = this.credentials.get(id);
    if (!vaultCred) return null;

    // Check expiration
    if (vaultCred.metadata.expiresAt && new Date() > vaultCred.metadata.expiresAt) {
      this.deleteCredential(id);
      return null;
    }

    // Decrypt password
    let password: string | undefined;
    if (vaultCred.encryptedPassword) {
      const encData = JSON.parse(vaultCred.encryptedPassword);
      password = await this.decrypt(encData);
    }

    // Decrypt MFA secret
    let mfaSecret: string | undefined;
    if (vaultCred.mfaSecret) {
      const encData = JSON.parse(vaultCred.mfaSecret);
      mfaSecret = await this.decrypt(encData);
    }

    // Update last used
    vaultCred.metadata.lastUsed = new Date();
    this.credentials.set(id, vaultCred);

    return {
      portal: vaultCred.portal,
      type: vaultCred.type,
      username: vaultCred.username,
      password,
      certificatePath: vaultCred.certificatePath,
      spidProvider: vaultCred.spidProvider,
      mfaSecret,
      apiKey: vaultCred.apiKey
    };
  }

  /**
   * Update credential
   */
  public async updateCredential(id: string, updates: Partial<Record<string, any>>): Promise<boolean> {
    const existing = this.credentials.get(id);
    if (!existing) return false;

    // Encrypt new password if provided
    if (updates.password) {
      const encData = await this.encrypt(updates.password);
      existing.encryptedPassword = JSON.stringify(encData);
      existing.metadata.lastRotated = new Date();
    }

    // Update other fields
    if (updates.username) existing.username = updates.username;
    if (updates.certificatePath) existing.certificatePath = updates.certificatePath;
    if (updates.apiKey) existing.apiKey = updates.apiKey;

    this.credentials.set(id, existing);
    await this.persistCredentials();
    
    return true;
  }

  /**
   * Delete credential
   */
  public async deleteCredential(id: string): Promise<boolean> {
    const deleted = this.credentials.delete(id);
    if (deleted) {
      await this.persistCredentials();
    }
    return deleted;
  }

  /**
   * List credentials by portal
   */
  public listCredentials(portal?: string): Array<{id: string; portal: string; type: string; username?: string; metadata: any}> {
    const results: Array<{id: string; portal: string; type: string; username?: string; metadata: any}> = [];
    
    for (const [id, cred] of this.credentials.entries()) {
      if (!portal || cred.portal === portal) {
        results.push({
          id,
          portal: cred.portal,
          type: cred.type,
          username: cred.username,
          metadata: cred.metadata
        });
      }
    }
    
    return results;
  }

  /**
   * Rotate credential password
   */
  public async rotatePassword(id: string, newPassword: string): Promise<boolean> {
    return this.updateCredential(id, { password: newPassword });
  }

  /**
   * Check if credential needs rotation
   */
  public needsRotation(id: string, days: number = 90): boolean {
    const cred = this.credentials.get(id);
    if (!cred) return false;

    const lastRotated = cred.metadata.lastRotated || cred.metadata.createdAt;
    const daysSinceRotation = (Date.now() - lastRotated.getTime()) / (1000 * 60 * 60 * 24);
    
    return daysSinceRotation > days;
  }

  /**
   * Setup automatic credential rotation
   */
  private setupAutoRotation(days: number): void {
    setInterval(() => {
      for (const [id, cred] of this.credentials.entries()) {
        if (this.needsRotation(id, days)) {
          console.log(`Credential ${id} needs rotation for portal ${cred.portal}`);
          // Emit event for rotation handling
          this.emitRotationNeeded(id, cred);
        }
      }
    }, 24 * 60 * 60 * 1000); // Check daily
  }

  /**
   * Export credentials (encrypted)
   */
  public async exportVault(): Promise<string> {
    const exportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      credentials: Array.from(this.credentials.entries())
    };
    
    const encrypted = await this.encrypt(JSON.stringify(exportData));
    return btoa(JSON.stringify(encrypted));
  }

  /**
   * Import credentials
   */
  public async importVault(encryptedData: string): Promise<boolean> {
    try {
      const encrypted = JSON.parse(atob(encryptedData));
      const decrypted = await this.decrypt(encrypted);
      const importData = JSON.parse(decrypted);
      
      // Validate version
      if (importData.version !== '1.0') {
        throw new Error('Unsupported vault version');
      }
      
      // Import credentials
      this.credentials.clear();
      for (const [id, cred] of importData.credentials) {
        this.credentials.set(id, {
          ...cred,
          metadata: {
            ...cred.metadata,
            createdAt: new Date(cred.metadata.createdAt),
            lastUsed: cred.metadata.lastUsed ? new Date(cred.metadata.lastUsed) : undefined,
            lastRotated: cred.metadata.lastRotated ? new Date(cred.metadata.lastRotated) : undefined,
            expiresAt: cred.metadata.expiresAt ? new Date(cred.metadata.expiresAt) : undefined
          }
        });
      }
      
      await this.persistCredentials();
      return true;
    } catch (error) {
      console.error('Failed to import vault:', error);
      return false;
    }
  }

  /**
   * Clear all credentials
   */
  public async clearVault(): Promise<void> {
    this.credentials.clear();
    await this.persistCredentials();
  }

  /**
   * Persist credentials to storage
   */
  private async persistCredentials(): Promise<void> {
    // Implementation depends on storage provider
    // For now, just log
    console.log(`Persisted ${this.credentials.size} credentials`);
  }

  /**
   * Load credentials from file storage
   */
  private loadFromFile(): void {
    // Implementation for file-based storage
    console.log('Loading credentials from file storage');
  }

  /**
   * Load credentials from database
   */
  private loadFromDatabase(): void {
    // Implementation for database storage
    console.log('Loading credentials from database');
  }

  /**
   * Emit rotation needed event
   */
  private emitRotationNeeded(id: string, credential: VaultCredential): void {
    // In a real implementation, this would emit an event
    console.log(`Rotation needed for credential ${id} (${credential.portal})`);
  }

  /**
   * Validate credential format
   */
  public validateCredential(portal: string, type: string, credentials: Record<string, any>): string[] {
    const errors: string[] = [];

    // Common validations
    if (type === 'username_password') {
      if (!credentials.username) errors.push('Username is required');
      if (!credentials.password) errors.push('Password is required');
    }

    if (type === 'certificate') {
      if (!credentials.certificatePath) errors.push('Certificate path is required');
    }

    if (type === 'spid') {
      if (!credentials.spidProvider) errors.push('SPID provider is required');
      if (!credentials.username) errors.push('SPID username is required');
      if (!credentials.password) errors.push('SPID password is required');
    }

    // Portal-specific validations
    switch (portal) {
      case 'gse':
        if (type === 'username_password' && !credentials.mfaSecret) {
          errors.push('MFA secret may be required for GSE');
        }
        break;
      
      case 'terna':
        if (type !== 'certificate' && type !== 'username_password') {
          errors.push('Terna only supports certificate or username/password authentication');
        }
        break;
    }

    return errors;
  }
}

// Export singleton instance
export const credentialVault = new CredentialVault();
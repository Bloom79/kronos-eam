/**
 * Browser-compatible crypto utilities
 * Uses Web Crypto API instead of Node.js crypto module
 */

export class BrowserCrypto {
  private static encoder = new TextEncoder();
  private static decoder = new TextDecoder();

  /**
   * Generate a random UUID
   */
  static randomUUID(): string {
    if ('randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    // Fallback for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : ((r & 0x3) | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Generate random bytes
   */
  static randomBytes(length: number): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(length));
  }

  /**
   * Derive key from password using PBKDF2
   */
  static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      this.encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt data using AES-GCM
   */
  static async encrypt(text: string, password: string): Promise<{
    encrypted: string;
    salt: string;
    iv: string;
  }> {
    const salt = this.randomBytes(32);
    const iv = this.randomBytes(16);
    const key = await this.deriveKey(password, salt);

    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      this.encoder.encode(text)
    );

    return {
      encrypted: this.bufferToHex(encryptedBuffer),
      salt: this.bufferToHex(salt),
      iv: this.bufferToHex(iv)
    };
  }

  /**
   * Decrypt data using AES-GCM
   */
  static async decrypt(encryptedData: {
    encrypted: string;
    salt: string;
    iv: string;
  }, password: string): Promise<string> {
    const salt = this.hexToBuffer(encryptedData.salt);
    const iv = this.hexToBuffer(encryptedData.iv);
    const key = await this.deriveKey(password, salt);

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      this.hexToBuffer(encryptedData.encrypted)
    );

    return this.decoder.decode(decryptedBuffer);
  }

  /**
   * Convert buffer to hex string
   */
  private static bufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Convert hex string to buffer
   */
  private static hexToBuffer(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  }

  /**
   * Generate a cryptographically secure random string
   */
  static generateSecureToken(length: number = 32): string {
    const bytes = this.randomBytes(length);
    return this.bufferToHex(bytes);
  }

  /**
   * Hash a string using SHA-256
   */
  static async sha256(text: string): Promise<string> {
    const hash = await crypto.subtle.digest('SHA-256', this.encoder.encode(text));
    return this.bufferToHex(hash);
  }
}
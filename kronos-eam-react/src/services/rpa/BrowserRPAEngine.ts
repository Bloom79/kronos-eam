/**
 * Browser-based RPA Engine
 * Since we can't use Puppeteer in the browser, this provides an alternative approach
 * using iframe-based automation or API proxies
 */

export interface BrowserAutomationOptions {
  useProxy?: boolean;
  proxyUrl?: string;
  useExtension?: boolean;
}

export class BrowserRPAEngine {
  private proxyUrl: string;
  private useExtension: boolean;

  constructor(options: BrowserAutomationOptions = {}) {
    this.proxyUrl = options.proxyUrl || '/api/rpa-proxy';
    this.useExtension = options.useExtension || false;
  }

  /**
   * Execute RPA task through proxy server
   * The actual Puppeteer automation runs on the server
   */
  async executeTask(task: {
    portal: string;
    action: string;
    data: any;
  }): Promise<any> {
    if (this.useExtension) {
      // Communicate with browser extension
      return this.executeViaExtension(task);
    } else {
      // Use server proxy
      return this.executeViaProxy(task);
    }
  }

  /**
   * Execute task via server proxy
   */
  private async executeViaProxy(task: any): Promise<any> {
    try {
      const response = await fetch(this.proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });

      if (!response.ok) {
        throw new Error(`RPA proxy error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('RPA proxy execution failed:', error);
      throw error;
    }
  }

  /**
   * Execute task via browser extension
   */
  private async executeViaExtension(task: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // Send message to browser extension
      window.postMessage({
        type: 'RPA_TASK',
        task: task,
      }, '*');

      // Listen for response
      const handler = (event: MessageEvent) => {
        if (event.data.type === 'RPA_RESULT' && event.data.taskId === task.id) {
          window.removeEventListener('message', handler);
          if (event.data.error) {
            reject(new Error(event.data.error));
          } else {
            resolve(event.data.result);
          }
        }
      };

      window.addEventListener('message', handler);

      // Timeout after 5 minutes
      setTimeout(() => {
        window.removeEventListener('message', handler);
        reject(new Error('RPA task timeout'));
      }, 300000);
    });
  }

  /**
   * Open portal in new window for manual interaction
   */
  openPortalWindow(portal: string, credentials?: any): Window | null {
    const portalUrls: Record<string, string> = {
      gse: 'https://areaclienti.gse.it',
      terna: 'https://www.terna.it/gaudi',
      dso: 'https://www.e-distribuzione.it/servizi/Produttori',
      dogane: 'https://www.adm.gov.it/portale/'
    };

    const url = portalUrls[portal];
    if (!url) {
      console.error(`Unknown portal: ${portal}`);
      return null;
    }

    // Open in new window
    const win = window.open(url, `${portal}_portal`, 'width=1200,height=800');
    
    // If we have credentials, we could potentially fill them using browser extension
    if (win && credentials && this.useExtension) {
      setTimeout(() => {
        window.postMessage({
          type: 'FILL_CREDENTIALS',
          portal,
          credentials,
        }, '*');
      }, 3000);
    }

    return win;
  }

  /**
   * Check if RPA proxy is available
   */
  async checkProxyStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${this.proxyUrl}/status`);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get available RPA capabilities
   */
  async getCapabilities(): Promise<{
    hasProxy: boolean;
    hasExtension: boolean;
    supportedPortals: string[];
  }> {
    const hasProxy = await this.checkProxyStatus();
    const hasExtension = !!(window as any).KronosRPAExtension;

    return {
      hasProxy,
      hasExtension,
      supportedPortals: ['gse', 'terna', 'dso', 'dogane']
    };
  }
}
export interface Notification {
  id: number;
  title: string;
  messaggio: string;
  type: 'info' | 'warning' | 'error' | 'success';
  letta: boolean;
  createdAt: string;
  plantId?: number;
  workflowId?: number;
}

// Legacy interface for backwards compatibility
export interface Notifica {
  id: string;
  type: 'scadenza' | 'task' | 'sistema' | 'integrazione';
  title: string;
  messaggio: string;
  timestamp: string;
  letta: boolean;
  priority: 'alta' | 'media' | 'bassa';
  link?: string;
}
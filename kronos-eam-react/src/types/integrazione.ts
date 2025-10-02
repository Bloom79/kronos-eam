export interface Integrazione {
  id: string;
  name: 'GSE' | 'Terna' | 'Customs' | 'E-Distribuzione';
  status: 'Connected' | 'Disconnected' | 'Error' | 'Maintenance';
  ultimaSincronizzazione: string;
  typeConnessione: 'API' | 'EDI' | 'RPA' | 'PEC';
  messaggiInCoda?: number;
  errori?: number;
}
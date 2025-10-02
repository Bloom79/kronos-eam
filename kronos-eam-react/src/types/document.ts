export type DocumentCategory = 'Authorization' | 'Technical' | 'Administrative' | 'Fiscal';
export type DocumentStatus = 'Valid' | 'Expired' | 'Processing';

export interface Document {
  id: string;
  name: string;
  type: 'PDF' | 'DOC' | 'XLS' | 'IMG';
  dataCaricamento: string;
  dimensione: string;
  category: DocumentCategory;
  status?: DocumentStatus;
  due_date?: string;
  versione?: number;
  tags?: string[];
}
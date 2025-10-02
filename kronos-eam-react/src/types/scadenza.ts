export interface Scadenza {
  id: string;
  title: string;
  plant: string;
  date: string;
  type: 'Payment' | 'Verification' | 'Declaration' | 'Renewal';
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Completed' | 'Delayed';
  entity?: 'GSE' | 'Terna' | 'Customs' | 'DSO';
  recurring?: boolean;
  frequenza?: 'Annual' | 'Triennial' | 'Quinquennial';
}
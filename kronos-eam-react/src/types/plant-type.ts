import { PlantTypeEnum, PlantStatusEnum } from './enums';

// Local/frontend representation used across UI components
export interface Plant {
  id: number;
  name: string;
  // Power fields (string summary + numeric kW)
  power?: string;
  power_kw?: number;
  // Classification
  type?: PlantTypeEnum;
  status?: PlantStatusEnum;
  // Location
  municipality?: string;
  province?: string;
  region?: string;
  location?: string;
  // Codes and identifiers
  code?: string;
  // Deadlines (camelCase and snake_case for mapper compatibility)
  nextDeadline?: string;
  next_deadline?: string;
  prossima_scadenza_type?: string;
  deadlineColor?: string;
  deadline_color?: string;
  // Integrations
  gse_integration?: boolean;
  terna_integration?: boolean;
  customs_integration?: boolean;
  dso_integration?: boolean;
  // Optional nested data used by some views
  registry?: any;
  checklist?: any;
  integrazioni?: any;
  // Timestamps
  created_at?: string;
  updated_at?: string;
}

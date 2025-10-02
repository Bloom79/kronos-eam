import { TaskPriorityEnum, TaskStatusEnum, EntityEnum } from './enums';

export interface TaskChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface TaskDocument {
  id: number;
  name: string;
  url: string;
  uploaded_at: string;
}

export interface TaskComment {
  id: number;
  user: string;
  text: string;
  created_at: string;
}

export interface Task {
  id: number | string;
  name: string;
  title: string;
  description?: string;
  status?: TaskStatusEnum;
  priority?: TaskPriorityEnum;
  assignee?: string;
  due_date?: string;
  duration_days?: number;
  estimated_hours?: number;
  actual_hours?: number;
  dependencies?: (number | string)[];
  required_documents?: string[];
  checklist_items?: TaskChecklistItem[];
  documents?: TaskDocument[];
  comments?: TaskComment[];
  portal_url?: string;
  required_credentials?: string;
  cost_amount?: number;
  regulatory_deadline?: string;
  instructions?: string;
  requires_human_auth?: boolean;
  requires_physical_signature?: boolean;
  requires_site_inspection?: boolean;
  human_checkpoint_notes?: string;
  responsible_entity?: EntityEnum;
  practice_type?: string;
  integration?: string | null;
  application_condition?: string;
  deadline_days?: number;
}

export interface WorkflowTask extends Task {
  stage_name?: string;
  stage?: { id: number; name: string };
}

export interface TaskTemplate extends Omit<Task, 'id' | 'status'> {
  id: string;
  stage?: string;
  documents_to_generate?: any[];
  required_documents?: any[];
}
import { WorkflowCategoryEnum, WorkflowStatusEnum, EntityEnum, PlantTypeEnum } from './enums';
import { WorkflowTask, Task, TaskTemplate } from './workflow-task';

export interface Workflow {
  id: number;
  name: string;
  plant_id: number;
  plant_name?: string;
  type?: string;
  category?: WorkflowCategoryEnum;
  description?: string;
  currentStatus: WorkflowStatusEnum;
  progress: number;
  created_at: string;
  due_date?: string;
  completion_date?: string;
  involved_entities: EntityEnum[];
  plant_power?: number;
  plant_type?: PlantTypeEnum;
  template_id?: number | string;
  stages?: WorkflowStage[];
  tasks?: WorkflowTask[];
}

export interface WorkflowStage {
  id: number;
  name: string;
  tasks: WorkflowTask[];
  order?: number;
  completed?: boolean;
  duration_days?: number;
}

export interface WorkflowTemplate {
  id: number | string;
  name: string;
  description?: string;
  category?: WorkflowCategoryEnum;
  plant_type?: PlantTypeEnum | 'Tutti';
  min_power?: number;
  max_power?: number;
  estimated_duration_days?: number;
  recurrence?: string;
  deadline?: { month: number; day: number };
  tasks?: TaskTemplate[];
  stages?: {
    name: string;
    order: number;
    tasks: TaskTemplate[];
    duration_days?: number;
  }[];
  required_entities?: EntityEnum[];
  workflow_purpose?: string;
  is_complete_workflow?: boolean;
  base_documents?: string[];
  activation_conditions?: any;
  deadline_config?: any;
  active?: boolean;
}

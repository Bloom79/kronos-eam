"""
Workflow schemas for API validation
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict

from app.models.workflow import (
    WorkflowStatusEnum, TaskStatusEnum, TaskPriorityEnum,
    WorkflowCategoryEnum, WorkflowPhaseEnum, EntityEnum
)


class WorkflowStageBase(BaseModel):
    name: str
    order: int


class WorkflowStageCreate(WorkflowStageBase):
    pass


class WorkflowStageUpdate(BaseModel):
    name: Optional[str] = None
    order: Optional[int] = None
    completed: Optional[bool] = None


class WorkflowStageInDB(WorkflowStageBase):
    id: int
    workflow_id: int
    completed: bool = False
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class WorkflowTaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    assignee: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: TaskPriorityEnum = TaskPriorityEnum.MEDIUM
    estimated_hours: Optional[float] = None


class WorkflowTaskCreate(WorkflowTaskBase):
    stage_id: Optional[int] = None
    responsible_entity: Optional[EntityEnum] = None
    practice_type: Optional[str] = None
    portal_url: Optional[str] = None


class WorkflowTaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatusEnum] = None
    assignee: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[TaskPriorityEnum] = None
    actual_hours: Optional[float] = None


class TaskDocumentResponse(BaseModel):
    id: int
    name: str
    type: Optional[str] = None
    size: Optional[int] = None
    url: Optional[str] = None
    document_type: Optional[str] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class TaskCommentResponse(BaseModel):
    id: int
    text: str
    user_id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class WorkflowTaskInDB(WorkflowTaskBase):
    id: int
    workflow_id: int
    stage_id: Optional[int] = None
    stage_name: Optional[str] = None
    status: TaskStatusEnum = TaskStatusEnum.TO_START
    actual_hours: Optional[float] = None
    dependencies: List[Any] = []
    
    # Integration and guide fields
    integration: Optional[EntityEnum] = None
    guide_config: Dict[str, Any] = {}
    instructions: Optional[str] = None
    checklist_items: List[str] = []
    external_resources: List[Dict[str, str]] = []
    
    # Entity and practice fields
    responsible_entity: Optional[EntityEnum] = None
    practice_type: Optional[str] = None
    practice_code: Optional[str] = None
    portal_url: Optional[str] = None
    portal_login_url: Optional[str] = None
    required_credentials: Optional[str] = None
    
    # Document management
    required_documents: List[str] = []
    document_templates: List[str] = []
    documents_to_generate: List[str] = []
    official_form_fields: Dict[str, Any] = {}
    
    # Process tracking
    submission_method: Optional[str] = None
    external_protocol_number: Optional[str] = None
    submission_date: Optional[datetime] = None
    response_date: Optional[datetime] = None
    
    # Cost tracking
    cost_amount: Optional[float] = None
    cost_description: Optional[str] = None
    payment_method: Optional[str] = None
    payment_reference: Optional[str] = None
    
    # Regulatory deadlines
    regulatory_deadline: Optional[datetime] = None
    deadline_type: Optional[str] = None
    deadline_consequences: Optional[str] = None
    
    # Role management
    allowed_roles: List[str] = []
    suggested_assignee_role: Optional[str] = None
    
    # Human checkpoint tracking
    requires_human_auth: bool = False
    requires_physical_signature: bool = False
    requires_site_inspection: bool = False
    human_checkpoint_notes: Optional[str] = None
    
    # Data collection configuration
    data_fields: Dict[str, Any] = {}
    target_table: Optional[str] = None
    target_fields: Dict[str, Any] = {}
    completed_data: Dict[str, Any] = {}
    
    # Completion tracking
    completed_by: Optional[str] = None
    completed_date: Optional[datetime] = None
    
    # Stage reference
    stage_name: Optional[str] = None
    
    # Relationships
    documents: List[TaskDocumentResponse] = []
    comments: List[TaskCommentResponse] = []
    
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class WorkflowBase(BaseModel):
    name: str
    plant_id: int
    type: Optional[str] = None
    category: Optional[WorkflowCategoryEnum] = None
    description: Optional[str] = None


class WorkflowCreate(WorkflowBase):
    template_id: Optional[int] = None
    stages: Optional[List[WorkflowStageCreate]] = None
    involved_entities: Optional[List[str]] = None
    document_requirements: Optional[Dict[str, Any]] = None
    config: Optional[Dict[str, Any]] = None
    created_by_role: Optional[str] = None  # Role of user creating workflow


class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    current_status: Optional[WorkflowStatusEnum] = None
    due_date: Optional[datetime] = None


class WorkflowCompositionRequest(BaseModel):
    name: str
    plant_id: int
    description: Optional[str] = None
    phase_templates: Dict[str, int]  # phase -> template_id mapping
    assignee: Optional[str] = None
    due_date: Optional[datetime] = None
    task_assignments: Optional[Dict[str, str]] = None
    task_due_dates: Optional[Dict[str, str]] = None
    involved_entities: Optional[List[str]] = None


class WorkflowResponse(WorkflowBase):
    id: int
    plant_name: Optional[str] = None
    current_status: Optional[str] = None
    progress: float = 0
    created_date: datetime
    due_date: Optional[datetime] = None
    completion_date: Optional[datetime] = None
    involved_entities: List[str] = []
    plant_power: Optional[float] = None
    plant_type: Optional[str] = None
    document_requirements: Dict[str, Any] = {}
    integration_status: Dict[str, Any] = {}
    stages: List[WorkflowStageInDB] = []
    tasks: List[WorkflowTaskInDB] = []
    created_at: datetime
    updated_at: datetime
    created_by_role: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


class WorkflowListResponse(BaseModel):
    items: List[WorkflowResponse]
    total: int
    skip: int
    limit: int


class WorkflowTemplateResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    category: Optional[WorkflowCategoryEnum] = None
    phase: Optional[WorkflowPhaseEnum] = None
    workflow_purpose: Optional[str] = None
    is_complete_workflow: bool = True
    plant_type: Optional[str] = None
    min_power: Optional[float] = None
    max_power: Optional[float] = None
    estimated_duration_days: Optional[int] = None
    recurrence: Optional[str] = None
    stages: List[Dict[str, Any]] = []
    tasks: List[Dict[str, Any]] = []
    required_entities: List[str] = []
    base_documents: List[str] = []
    activation_conditions: Dict[str, Any] = {}
    deadline_config: Dict[str, Any] = {}
    active: bool = True
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class WorkflowTemplateCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[WorkflowCategoryEnum] = None
    phase: Optional[WorkflowPhaseEnum] = None
    workflow_purpose: Optional[str] = None
    is_complete_workflow: bool = True
    plant_type: Optional[str] = None
    min_power: Optional[float] = None
    max_power: Optional[float] = None
    estimated_duration_days: Optional[int] = None
    recurrence: Optional[str] = None
    stages: List[Dict[str, Any]] = []
    tasks: List[Dict[str, Any]] = []
    required_entities: List[str] = []
    base_documents: List[str] = []
    activation_conditions: Dict[str, Any] = {}
    deadline_config: Dict[str, Any] = {}
    active: bool = True


class WorkflowTemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[WorkflowCategoryEnum] = None
    phase: Optional[WorkflowPhaseEnum] = None
    workflow_purpose: Optional[str] = None
    is_complete_workflow: Optional[bool] = None
    plant_type: Optional[str] = None
    min_power: Optional[float] = None
    max_power: Optional[float] = None
    estimated_duration_days: Optional[int] = None
    recurrence: Optional[str] = None
    stages: Optional[List[Dict[str, Any]]] = None
    tasks: Optional[List[Dict[str, Any]]] = None
    required_entities: Optional[List[str]] = None
    base_documents: Optional[List[str]] = None
    activation_conditions: Optional[Dict[str, Any]] = None
    deadline_config: Optional[Dict[str, Any]] = None
    active: Optional[bool] = None


# Add new classes for comprehensive workflow management
class WorkflowStageResponse(WorkflowStageInDB):
    """Stage response with relationships"""
    tasks: List[WorkflowTaskInDB] = []
    document_templates: List[Dict[str, Any]] = []


class WorkflowTaskResponse(WorkflowTaskInDB):
    """Task response with relationships"""
    stage_name: Optional[str] = None
    documents: List[TaskDocumentResponse] = []
    comments: List[TaskCommentResponse] = []


class WorkflowDetailResponse(WorkflowResponse):
    """Detailed workflow response with all relationships"""
    stages_with_tasks: List[WorkflowStageResponse] = []
    template_info: Optional[WorkflowTemplateResponse] = None
    plant_details: Optional[Dict[str, Any]] = None
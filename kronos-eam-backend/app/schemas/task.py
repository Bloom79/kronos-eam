"""
Task schemas for API requests and responses
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

from app.models.workflow import (
    TaskStatusEnum, TaskPriorityEnum, ActionStatusEnum, EntityEnum
)


class TaskBase(BaseModel):
    """Base task schema"""
    title: str
    descrizione: Optional[str] = None
    status: TaskStatusEnum = TaskStatusEnum.TO_START
    priority: TaskPriorityEnum = TaskPriorityEnum.MEDIUM
    assignee: Optional[str] = None
    dueDate: Optional[datetime] = None
    estimatedHours: Optional[float] = None


class TaskCreate(TaskBase):
    """Schema for creating tasks"""
    workflow_id: int
    stage_id: Optional[int] = None
    dipendenze: Optional[List[int]] = []
    integrazione: Optional[EntityEnum] = None
    ente_responsabile: Optional[EntityEnum] = None
    tipo_pratica: Optional[str] = None
    timeline: Optional[Dict[str, Any]] = None
    documenti_associati: Optional[List[int]] = []
    audit_enabled: bool = True


class TaskUpdate(BaseModel):
    """Schema for updating tasks"""
    title: Optional[str] = None
    descrizione: Optional[str] = None
    status: Optional[TaskStatusEnum] = None
    priority: Optional[TaskPriorityEnum] = None
    assignee: Optional[str] = None
    dueDate: Optional[datetime] = None
    estimatedHours: Optional[float] = None
    actualHours: Optional[float] = None
    timeline_update: Optional[Dict[str, Any]] = None
    documenti_update: Optional[Dict[str, Any]] = None
    note: Optional[str] = None


class TaskResponse(TaskBase):
    """Task response schema"""
    id: int
    workflow_id: int
    stage_id: Optional[int] = None
    actualHours: Optional[float] = None
    dipendenze: List[int] = []
    integrazione: Optional[EntityEnum] = None
    automazione_config: Dict[str, Any] = {}
    ente_responsabile: Optional[EntityEnum] = None
    tipo_pratica: Optional[str] = None
    codice_pratica: Optional[str] = None
    url_portale: Optional[str] = None
    credenziali_richieste: Optional[str] = None
    timeline: Dict[str, Any] = {}
    documenti_associati: List[int] = []
    audit_enabled: bool
    stato_azione: Optional[ActionStatusEnum] = None
    completato_da: Optional[str] = None
    completato_data: Optional[datetime] = None
    is_overdue: bool
    created_at: datetime
    updated_at: datetime
    
    # Computed fields
    completion_percentage: Optional[int] = None
    duration_hours: Optional[float] = None
    
    class Config:
        from_attributes = True
        
    @classmethod
    def from_orm(cls, obj):
        data = super().from_orm(obj)
        
        # Add computed fields
        if hasattr(obj, "is_overdue"):
            data.is_overdue = obj.is_overdue
        
        return data


class TaskTimelineEvent(BaseModel):
    """Timeline event schema"""
    timestamp: str
    event: str
    user: str
    details: str
    old_status: Optional[str] = None
    new_status: Optional[str] = None
    old_assignee: Optional[str] = None
    new_assignee: Optional[str] = None


class TaskTimelineResponse(BaseModel):
    """Task timeline response schema"""
    task_id: int
    title: str
    current_status: Optional[str] = None
    current_assignee: Optional[str] = None
    timeline: Dict[str, Any]
    events: List[TaskTimelineEvent]
    total_events: int
    duration: Optional[float] = None
    is_overdue: bool


class TaskStatistics(BaseModel):
    """Task statistics schema"""
    status_distribution: Dict[str, int]
    priority_distribution: Dict[str, int]
    average_estimated_hours: float
    average_actual_hours: float


class UserTasksResponse(BaseModel):
    """User tasks response schema"""
    tasks: List[Dict[str, Any]]
    total: int
    overdue_count: int
    limit: int
    offset: int
    statistics: TaskStatistics


class BulkTaskUpdate(BaseModel):
    """Bulk task update request schema"""
    task_ids: List[int]
    status: Optional[TaskStatusEnum] = None
    priority: Optional[TaskPriorityEnum] = None
    assignee: Optional[str] = None
    dueDate: Optional[datetime] = None
    note: Optional[str] = None


class BulkUpdateResponse(BaseModel):
    """Bulk update response schema"""
    updated_count: int
    failed_count: int
    failed_ids: List[int]
    success: bool
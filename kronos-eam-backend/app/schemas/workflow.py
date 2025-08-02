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
    nome: str
    ordine: int


class WorkflowStageCreate(WorkflowStageBase):
    pass


class WorkflowStageUpdate(BaseModel):
    nome: Optional[str] = None
    ordine: Optional[int] = None
    completato: Optional[bool] = None


class WorkflowStageInDB(WorkflowStageBase):
    id: int
    workflow_id: int
    completato: bool = False
    data_inizio: Optional[datetime] = None
    data_fine: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class WorkflowTaskBase(BaseModel):
    title: str
    descrizione: Optional[str] = None
    assignee: Optional[str] = None
    dueDate: Optional[datetime] = None
    priority: TaskPriorityEnum = TaskPriorityEnum.MEDIUM
    estimatedHours: Optional[float] = None


class WorkflowTaskCreate(WorkflowTaskBase):
    stage_id: Optional[int] = None
    ente_responsabile: Optional[EntityEnum] = None
    tipo_pratica: Optional[str] = None
    url_portale: Optional[str] = None


class WorkflowTaskUpdate(BaseModel):
    title: Optional[str] = None
    descrizione: Optional[str] = None
    status: Optional[TaskStatusEnum] = None
    assignee: Optional[str] = None
    dueDate: Optional[datetime] = None
    priority: Optional[TaskPriorityEnum] = None
    actualHours: Optional[float] = None


class TaskDocumentResponse(BaseModel):
    id: int
    nome: str
    tipo: Optional[str] = None
    dimensione: Optional[int] = None
    url: Optional[str] = None
    tipo_documento: Optional[str] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class TaskCommentResponse(BaseModel):
    id: int
    testo: str
    user_id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class WorkflowTaskInDB(WorkflowTaskBase):
    id: int
    workflow_id: int
    stage_id: Optional[int] = None
    status: TaskStatusEnum = TaskStatusEnum.TO_START
    actualHours: Optional[float] = None
    dipendenze: List[Any] = []
    integrazione: Optional[EntityEnum] = None
    guide_config: Dict[str, Any] = {}
    ente_responsabile: Optional[EntityEnum] = None
    tipo_pratica: Optional[str] = None
    codice_pratica: Optional[str] = None
    url_portale: Optional[str] = None
    credenziali_richieste: Optional[str] = None
    completato_da: Optional[str] = None
    completato_data: Optional[datetime] = None
    documents: List[TaskDocumentResponse] = []
    comments: List[TaskCommentResponse] = []
    created_at: datetime
    updated_at: datetime
    # Guide and instruction fields
    instructions: Optional[str] = None
    checklist_items: List[str] = []
    external_resources: List[Dict[str, str]] = []
    allowed_roles: List[str] = []
    suggested_assignee_role: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


class WorkflowBase(BaseModel):
    nome: str
    impianto_id: int
    tipo: Optional[str] = None
    categoria: Optional[WorkflowCategoryEnum] = None
    descrizione: Optional[str] = None


class WorkflowCreate(WorkflowBase):
    template_id: Optional[int] = None
    stages: Optional[List[WorkflowStageCreate]] = None
    enti_coinvolti: Optional[List[str]] = None
    requisiti_documenti: Optional[Dict[str, Any]] = None
    config: Optional[Dict[str, Any]] = None
    created_by_role: Optional[str] = None  # Role of user creating workflow


class WorkflowUpdate(BaseModel):
    nome: Optional[str] = None
    descrizione: Optional[str] = None
    stato_corrente: Optional[WorkflowStatusEnum] = None
    data_scadenza: Optional[datetime] = None


class WorkflowCompositionRequest(BaseModel):
    nome: str
    impianto_id: int
    description: Optional[str] = None
    phase_templates: Dict[str, int]  # phase -> template_id mapping
    responsabile: Optional[str] = None
    data_scadenza: Optional[datetime] = None
    task_assignments: Optional[Dict[str, str]] = None
    task_due_dates: Optional[Dict[str, str]] = None
    enti_coinvolti: Optional[List[str]] = None


class WorkflowResponse(WorkflowBase):
    id: int
    impiantoNome: Optional[str] = None
    stato_corrente: Optional[str] = None
    progresso: float = 0
    data_creazione: datetime
    data_scadenza: Optional[datetime] = None
    data_completamento: Optional[datetime] = None
    enti_coinvolti: List[str] = []
    potenza_impianto: Optional[float] = None
    tipo_impianto: Optional[str] = None
    requisiti_documenti: Dict[str, Any] = {}
    stato_integrazioni: Dict[str, Any] = {}
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
    nome: str
    descrizione: Optional[str] = None
    categoria: Optional[WorkflowCategoryEnum] = None
    phase: Optional[WorkflowPhaseEnum] = None
    workflow_purpose: Optional[str] = None
    is_complete_workflow: bool = True
    tipo_impianto: Optional[str] = None
    potenza_minima: Optional[float] = None
    potenza_massima: Optional[float] = None
    durata_stimata_giorni: Optional[int] = None
    ricorrenza: Optional[str] = None
    stages: List[Dict[str, Any]] = []
    tasks: List[Dict[str, Any]] = []
    enti_richiesti: List[str] = []
    documenti_base: List[str] = []
    condizioni_attivazione: Dict[str, Any] = {}
    scadenza_config: Dict[str, Any] = {}
    attivo: bool = True
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class WorkflowTemplateCreate(BaseModel):
    nome: str
    descrizione: Optional[str] = None
    categoria: Optional[WorkflowCategoryEnum] = None
    phase: Optional[WorkflowPhaseEnum] = None
    workflow_purpose: Optional[str] = None
    is_complete_workflow: bool = True
    tipo_impianto: Optional[str] = None
    potenza_minima: Optional[float] = None
    potenza_massima: Optional[float] = None
    durata_stimata_giorni: Optional[int] = None
    ricorrenza: Optional[str] = None
    stages: List[Dict[str, Any]] = []
    tasks: List[Dict[str, Any]] = []
    enti_richiesti: List[str] = []
    documenti_base: List[str] = []
    condizioni_attivazione: Dict[str, Any] = {}
    scadenza_config: Dict[str, Any] = {}
    attivo: bool = True


class WorkflowTemplateUpdate(BaseModel):
    nome: Optional[str] = None
    descrizione: Optional[str] = None
    categoria: Optional[WorkflowCategoryEnum] = None
    phase: Optional[WorkflowPhaseEnum] = None
    workflow_purpose: Optional[str] = None
    is_complete_workflow: Optional[bool] = None
    tipo_impianto: Optional[str] = None
    potenza_minima: Optional[float] = None
    potenza_massima: Optional[float] = None
    durata_stimata_giorni: Optional[int] = None
    ricorrenza: Optional[str] = None
    stages: Optional[List[Dict[str, Any]]] = None
    tasks: Optional[List[Dict[str, Any]]] = None
    enti_richiesti: Optional[List[str]] = None
    documenti_base: Optional[List[str]] = None
    condizioni_attivazione: Optional[Dict[str, Any]] = None
    scadenza_config: Optional[Dict[str, Any]] = None
    attivo: Optional[bool] = None
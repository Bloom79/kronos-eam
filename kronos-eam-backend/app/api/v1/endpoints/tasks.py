"""
Enhanced task management API endpoints
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.models.workflow import (
    WorkflowTask, TaskStatusEnum, TaskPriorityEnum,
    EntityEnum
)
from app.schemas.task import (
    TaskCreate, TaskUpdate, TaskResponse, TaskTimelineResponse,
    UserTasksResponse, BulkTaskUpdate, BulkUpdateResponse
)
from app.services.task_service import TaskService
from app.core.audit_decorator import audit_action
from app.models.audit import TipoModificaEnum


router = APIRouter()


@router.post("/", response_model=TaskResponse)
@audit_action("task", TipoModificaEnum.CREAZIONE)
async def create_task(
    task_data: TaskCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Create a new task with enhanced tracking"""
    service = TaskService(db)
    
    task = service.create_task(
        workflow_id=task_data.workflow_id,
        title=task_data.title,
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        descrizione=task_data.descrizione,
        stage_id=task_data.stage_id,
        status=task_data.status,
        priority=task_data.priority,
        assignee=task_data.assignee,
        dueDate=task_data.dueDate,
        estimatedHours=task_data.estimatedHours,
        dipendenze=task_data.dipendenze,
        integrazione=task_data.integrazione,
        ente_responsabile=task_data.ente_responsabile,
        tipo_pratica=task_data.tipo_pratica,
        timeline=task_data.timeline,
        documenti_associati=task_data.documenti_associati,
        audit_enabled=task_data.audit_enabled
    )
    
    return task


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Get task details"""
    task = db.query(WorkflowTask).join(
        WorkflowTask.workflow
    ).filter(
        WorkflowTask.id == task_id,
        WorkflowTask.workflow.has(tenant_id=current_user.tenant_id)
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return task


@router.put("/{task_id}", response_model=TaskResponse)
@audit_action("task", TipoModificaEnum.AGGIORNAMENTO, capture_old_state=True, capture_new_state=True)
async def update_task(
    task_id: int,
    update_data: TaskUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Update task with comprehensive tracking"""
    service = TaskService(db)
    
    try:
        task = service.update_task(
            task_id=task_id,
            user_id=current_user.id,
            tenant_id=current_user.tenant_id,
            title=update_data.title,
            descrizione=update_data.descrizione,
            status=update_data.status,
            priority=update_data.priority,
            assignee=update_data.assignee,
            dueDate=update_data.dueDate,
            estimatedHours=update_data.estimatedHours,
            actualHours=update_data.actualHours,
            timeline_update=update_data.timeline_update,
            documenti_update=update_data.documenti_update,
            note=update_data.note
        )
        
        return task
    
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{task_id}/status", response_model=TaskResponse)
@audit_action("task", TipoModificaEnum.STATO_CAMBIO)
async def update_task_status(
    task_id: int,
    status: TaskStatusEnum = Body(...),
    note: Optional[str] = Body(None),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Quick status update"""
    service = TaskService(db)
    
    try:
        task = service.update_task_status(
            task_id=task_id,
            status=status,
            user_id=current_user.id,
            tenant_id=current_user.tenant_id,
            note=note
        )
        
        return task
    
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{task_id}/assign", response_model=TaskResponse)
@audit_action("task", TipoModificaEnum.RESPONSABILE_CAMBIO)
async def assign_task(
    task_id: int,
    assignee_email: str = Body(...),
    note: Optional[str] = Body(None),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Assign task to user"""
    service = TaskService(db)
    
    try:
        task = service.assign_task(
            task_id=task_id,
            assignee_email=assignee_email,
            user_id=current_user.id,
            tenant_id=current_user.tenant_id,
            note=note
        )
        
        return task
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{task_id}/timeline", response_model=TaskTimelineResponse)
async def get_task_timeline(
    task_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Get detailed task timeline with audit history"""
    service = TaskService(db)
    
    try:
        timeline = service.get_task_timeline(
            task_id=task_id,
            tenant_id=current_user.tenant_id
        )
        
        return timeline
    
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/user/{user_email}", response_model=UserTasksResponse)
async def get_user_tasks(
    user_email: str,
    status_filter: Optional[List[TaskStatusEnum]] = Query(None),
    priority_filter: Optional[List[TaskPriorityEnum]] = Query(None),
    due_date_start: Optional[datetime] = Query(None),
    due_date_end: Optional[datetime] = Query(None),
    include_completed: bool = Query(False),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Get tasks assigned to a user"""
    # Check permissions
    if user_email != current_user.email and current_user.ruolo not in ["Admin", "Asset Manager"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    service = TaskService(db)
    
    result = service.get_user_tasks(
        user_email=user_email,
        tenant_id=current_user.tenant_id,
        status_filter=status_filter,
        priority_filter=priority_filter,
        due_date_start=due_date_start,
        due_date_end=due_date_end,
        include_completed=include_completed,
        limit=limit,
        offset=offset
    )
    
    return result


@router.post("/bulk-update", response_model=BulkUpdateResponse)
async def bulk_update_tasks(
    bulk_data: BulkTaskUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Bulk update multiple tasks"""
    service = TaskService(db)
    
    result = service.bulk_update_tasks(
        task_ids=bulk_data.task_ids,
        user_id=current_user.id,
        tenant_id=current_user.tenant_id,
        status=bulk_data.status,
        priority=bulk_data.priority,
        assignee=bulk_data.assignee,
        dueDate=bulk_data.dueDate,
        note=bulk_data.note
    )
    
    return result


@router.get("/workflow/{workflow_id}", response_model=List[TaskResponse])
async def get_workflow_tasks(
    workflow_id: int,
    include_completed: bool = Query(False),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Get all tasks for a workflow"""
    from app.models.workflow import Workflow
    
    # Verify workflow access
    workflow = db.query(Workflow).filter(
        Workflow.id == workflow_id,
        Workflow.tenant_id == current_user.tenant_id
    ).first()
    
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    query = db.query(WorkflowTask).filter(
        WorkflowTask.workflow_id == workflow_id
    )
    
    if not include_completed:
        query = query.filter(WorkflowTask.status != TaskStatusEnum.COMPLETED)
    
    tasks = query.order_by(
        WorkflowTask.stage_id,
        WorkflowTask.priority.desc(),
        WorkflowTask.dueDate
    ).all()
    
    return tasks


@router.get("/overdue/list", response_model=List[TaskResponse])
async def get_overdue_tasks(
    assignee_filter: Optional[str] = Query(None),
    priority_filter: Optional[TaskPriorityEnum] = Query(None),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Get overdue tasks"""
    query = db.query(WorkflowTask).join(
        WorkflowTask.workflow
    ).filter(
        WorkflowTask.workflow.has(tenant_id=current_user.tenant_id),
        WorkflowTask.dueDate < datetime.utcnow(),
        WorkflowTask.status != TaskStatusEnum.COMPLETED
    )
    
    if assignee_filter:
        query = query.filter(WorkflowTask.assignee == assignee_filter)
    
    if priority_filter:
        query = query.filter(WorkflowTask.priority == priority_filter)
    
    tasks = query.order_by(
        WorkflowTask.dueDate,
        WorkflowTask.priority.desc()
    ).all()
    
    return tasks


@router.post("/{task_id}/documents/{document_id}")
async def link_document_to_task(
    task_id: int,
    document_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Link a document to a task"""
    service = TaskService(db)
    
    # Verify document exists and belongs to tenant
    from app.models.document import Document
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.tenant_id == current_user.tenant_id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    try:
        task = service.update_task(
            task_id=task_id,
            user_id=current_user.id,
            tenant_id=current_user.tenant_id,
            documenti_update={"add": [document_id]},
            note=f"Linked document: {document.nome}"
        )
        
        return {"message": "Document linked successfully", "task_id": task.id}
    
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{task_id}/documents/{document_id}")
async def unlink_document_from_task(
    task_id: int,
    document_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Unlink a document from a task"""
    service = TaskService(db)
    
    try:
        task = service.update_task(
            task_id=task_id,
            user_id=current_user.id,
            tenant_id=current_user.tenant_id,
            documenti_update={"remove": [document_id]},
            note=f"Unlinked document ID: {document_id}"
        )
        
        return {"message": "Document unlinked successfully", "task_id": task.id}
    
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
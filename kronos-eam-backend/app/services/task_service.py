"""
Enhanced task/action management service
"""

from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.models.workflow import (
    WorkflowTask, TaskStatusEnum, TaskPriorityEnum,
    ActionStatusEnum, EntityEnum
)
from app.models.user import User
from app.models.document import Document
from app.models.audit import TipoModificaEnum
from app.services.audit_service import AuditService
from app.services.notification_service import NotificationService, NotificationBuilder
from app.core.config import settings


class TaskService:
    """Service for enhanced task and action management"""
    
    def __init__(self, db: Session):
        self.db = db
        self.audit_service = AuditService(db)
        self.notification_service = NotificationService(db)
    
    def create_task(
        self,
        workflow_id: int,
        title: str,
        tenant_id: int,
        user_id: int,
        descrizione: Optional[str] = None,
        stage_id: Optional[int] = None,
        status: TaskStatusEnum = TaskStatusEnum.TO_START,
        priority: TaskPriorityEnum = TaskPriorityEnum.MEDIUM,
        assignee: Optional[str] = None,
        dueDate: Optional[datetime] = None,
        estimatedHours: Optional[float] = None,
        dipendenze: Optional[List[int]] = None,
        integrazione: Optional[EntityEnum] = None,
        ente_responsabile: Optional[EntityEnum] = None,
        tipo_pratica: Optional[str] = None,
        timeline: Optional[Dict[str, Any]] = None,
        documenti_associati: Optional[List[int]] = None,
        audit_enabled: bool = True
    ) -> WorkflowTask:
        """
        Create a new task with enhanced tracking
        
        Args:
            workflow_id: Parent workflow ID
            title: Task title
            tenant_id: Tenant ID
            user_id: User creating the task
            ... (other parameters)
            
        Returns:
            Created task
        """
        # Create timeline if not provided
        if not timeline:
            timeline = {
                "inizio": datetime.utcnow().isoformat(),
                "scadenza": dueDate.isoformat() if dueDate else None,
                "fine": None
            }
        
        # Create task
        task = WorkflowTask(
            workflow_id=workflow_id,
            stage_id=stage_id,
            title=title,
            descrizione=descrizione,
            status=status,
            priority=priority,
            assignee=assignee,
            dueDate=dueDate,
            estimatedHours=estimatedHours,
            dipendenze=dipendenze or [],
            integrazione=integrazione,
            ente_responsabile=ente_responsabile,
            tipo_pratica=tipo_pratica,
            timeline=timeline,
            documenti_associati=documenti_associati or [],
            audit_enabled=audit_enabled,
            stato_azione=ActionStatusEnum.WAITING
        )
        
        # Note: tenant_id is inherited from workflow
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        
        # Log creation
        if audit_enabled:
            self.audit_service.log_change(
                entity_type="task",
                entity_id=task.id,
                tipo_modifica=TipoModificaEnum.CREAZIONE,
                user_id=user_id,
                tenant_id=tenant_id,
                new_values={
                    "title": title,
                    "workflow_id": workflow_id,
                    "assignee": assignee,
                    "status": status.value
                }
            )
        
        # TODO: Send notification if assigned (requires async handling)
        # if assignee:
        #     assigned_by = self.db.query(User).filter(User.id == user_id).first()
        #     if assigned_by:
        #         await NotificationBuilder.task_assigned(
        #             self.notification_service,
        #             task,
        #             assigned_by,
        #             tenant_id
        #         )
        
        return task
    
    def update_task(
        self,
        task_id: int,
        user_id: int,
        tenant_id: int,
        title: Optional[str] = None,
        descrizione: Optional[str] = None,
        status: Optional[TaskStatusEnum] = None,
        priority: Optional[TaskPriorityEnum] = None,
        assignee: Optional[str] = None,
        dueDate: Optional[datetime] = None,
        estimatedHours: Optional[float] = None,
        actualHours: Optional[float] = None,
        timeline_update: Optional[Dict[str, Any]] = None,
        documenti_update: Optional[Dict[str, Any]] = None,
        note: Optional[str] = None
    ) -> WorkflowTask:
        """Update task with comprehensive tracking"""
        task = self.db.query(WorkflowTask).join(
            WorkflowTask.workflow
        ).filter(
            WorkflowTask.id == task_id,
            WorkflowTask.workflow.has(tenant_id=tenant_id)
        ).first()
        
        if not task:
            raise ValueError("Task not found")
        
        # Capture old values
        old_values = {
            "title": task.title,
            "status": task.status.value if task.status else None,
            "assignee": task.assignee,
            "priority": task.priority.value if task.priority else None
        }
        
        # Track changes
        changes_made = []
        
        # Update fields
        if title is not None and title != task.title:
            task.title = title
            changes_made.append("title")
        
        if descrizione is not None:
            task.descrizione = descrizione
            changes_made.append("descrizione")
        
        if status is not None and status != task.status:
            # Update timeline based on status change
            if status == TaskStatusEnum.IN_PROGRESS and task.status == TaskStatusEnum.TO_START:
                if not task.timeline:
                    task.timeline = {}
                task.timeline["inizio_effettivo"] = datetime.utcnow().isoformat()
                task.stato_azione = ActionStatusEnum.IN_PROGRESS
                
            elif status == TaskStatusEnum.COMPLETED:
                if not task.timeline:
                    task.timeline = {}
                task.timeline["fine"] = datetime.utcnow().isoformat()
                task.completato_da = self.db.query(User).filter(User.id == user_id).first().email
                task.completato_data = datetime.utcnow()
                task.stato_azione = ActionStatusEnum.COMPLETED
                
            elif status == TaskStatusEnum.BLOCKED:
                task.stato_azione = ActionStatusEnum.CANCELLED
            
            task.status = status
            changes_made.append("status")
        
        if priority is not None and priority != task.priority:
            task.priority = priority
            changes_made.append("priority")
        
        if assignee is not None and assignee != task.assignee:
            old_assignee = task.assignee
            task.assignee = assignee
            changes_made.append("assignee")
            
            # Log responsibility change
            if task.audit_enabled:
                self.audit_service.log_change(
                    entity_type="task",
                    entity_id=task.id,
                    tipo_modifica=TipoModificaEnum.RESPONSABILE_CAMBIO,
                    user_id=user_id,
                    tenant_id=tenant_id,
                    dettaglio_modifica={
                        "old_assignee": old_assignee,
                        "new_assignee": assignee
                    },
                    note=note
                )
            
            # TODO: Notify new assignee (requires async handling)
            # if assignee:
            #     assigner = self.db.query(User).filter(User.id == user_id).first()
            #     await NotificationBuilder.task_assigned(
            #         self.notification_service,
            #         task,
            #         assigner,
            #         tenant_id
            #     )
        
        if dueDate is not None:
            task.dueDate = dueDate
            if task.timeline:
                task.timeline["scadenza"] = dueDate.isoformat()
            changes_made.append("dueDate")
            
            # Check if overdue
            if dueDate < datetime.utcnow() and task.status != TaskStatusEnum.COMPLETED:
                task.status = TaskStatusEnum.DELAYED
                task.stato_azione = ActionStatusEnum.DELAYED
        
        if estimatedHours is not None:
            task.estimatedHours = estimatedHours
            changes_made.append("estimatedHours")
        
        if actualHours is not None:
            task.actualHours = actualHours
            changes_made.append("actualHours")
        
        # Update timeline
        if timeline_update:
            if not task.timeline:
                task.timeline = {}
            task.timeline.update(timeline_update)
            changes_made.append("timeline")
        
        # Update documents
        if documenti_update:
            if documenti_update.get("add"):
                for doc_id in documenti_update["add"]:
                    if doc_id not in task.documenti_associati:
                        task.documenti_associati.append(doc_id)
            
            if documenti_update.get("remove"):
                for doc_id in documenti_update["remove"]:
                    if doc_id in task.documenti_associati:
                        task.documenti_associati.remove(doc_id)
            
            changes_made.append("documenti_associati")
        
        # Capture new values
        new_values = {
            "title": task.title,
            "status": task.status.value if task.status else None,
            "assignee": task.assignee,
            "priority": task.priority.value if task.priority else None
        }
        
        self.db.commit()
        self.db.refresh(task)
        
        # Log update if changes were made
        if changes_made and task.audit_enabled:
            self.audit_service.log_change(
                entity_type="task",
                entity_id=task.id,
                tipo_modifica=TipoModificaEnum.AGGIORNAMENTO,
                user_id=user_id,
                tenant_id=tenant_id,
                old_values=old_values,
                new_values=new_values,
                changed_fields=changes_made,
                note=note
            )
        
        return task
    
    def update_task_status(
        self,
        task_id: int,
        status: TaskStatusEnum,
        user_id: int,
        tenant_id: int,
        note: Optional[str] = None
    ) -> WorkflowTask:
        """Quick status update with tracking"""
        return self.update_task(
            task_id=task_id,
            user_id=user_id,
            tenant_id=tenant_id,
            status=status,
            note=note or f"Status changed to {status.value}"
        )
    
    def assign_task(
        self,
        task_id: int,
        assignee_email: str,
        user_id: int,
        tenant_id: int,
        note: Optional[str] = None
    ) -> WorkflowTask:
        """Assign task to user"""
        # Verify assignee exists
        assignee = self.db.query(User).filter(
            User.email == assignee_email,
            User.tenant_id == tenant_id
        ).first()
        
        if not assignee:
            raise ValueError("Assignee not found")
        
        return self.update_task(
            task_id=task_id,
            user_id=user_id,
            tenant_id=tenant_id,
            assignee=assignee_email,
            note=note or f"Task assigned to {assignee_email}"
        )
    
    def get_task_timeline(
        self,
        task_id: int,
        tenant_id: int
    ) -> Dict[str, Any]:
        """Get detailed task timeline with audit history"""
        task = self.db.query(WorkflowTask).join(
            WorkflowTask.workflow
        ).filter(
            WorkflowTask.id == task_id,
            WorkflowTask.workflow.has(tenant_id=tenant_id)
        ).first()
        
        if not task:
            raise ValueError("Task not found")
        
        # Get audit history
        audit_history = self.audit_service.get_entity_history(
            entity_type="task",
            entity_id=task_id,
            tenant_id=tenant_id,
            limit=100
        )
        
        # Build timeline
        timeline_events = []
        
        # Add creation event
        creation_event = next(
            (log for log in audit_history if log.tipo_modifica == TipoModificaEnum.CREAZIONE),
            None
        )
        if creation_event:
            timeline_events.append({
                "timestamp": creation_event.created_at.isoformat(),
                "event": "created",
                "user": creation_event.utente.email if creation_event.utente else "System",
                "details": "Task created"
            })
        
        # Add status changes
        for log in audit_history:
            if log.tipo_modifica == TipoModificaEnum.STATO_CAMBIO:
                old_status = log.old_values.get("status") if log.old_values else None
                new_status = log.new_values.get("status") if log.new_values else None
                
                timeline_events.append({
                    "timestamp": log.created_at.isoformat(),
                    "event": "status_change",
                    "user": log.utente.email if log.utente else "System",
                    "details": f"Status changed from {old_status} to {new_status}",
                    "old_status": old_status,
                    "new_status": new_status
                })
        
        # Add assignment changes
        for log in audit_history:
            if log.tipo_modifica == TipoModificaEnum.RESPONSABILE_CAMBIO:
                details = log.dettaglio_modifica or {}
                timeline_events.append({
                    "timestamp": log.created_at.isoformat(),
                    "event": "assignment_change",
                    "user": log.utente.email if log.utente else "System",
                    "details": f"Assigned from {details.get('old_assignee', 'Unassigned')} to {details.get('new_assignee')}",
                    "old_assignee": details.get("old_assignee"),
                    "new_assignee": details.get("new_assignee")
                })
        
        # Add document associations
        for log in audit_history:
            if "documenti_associati" in (log.changed_fields or []):
                timeline_events.append({
                    "timestamp": log.created_at.isoformat(),
                    "event": "document_update",
                    "user": log.utente.email if log.utente else "System",
                    "details": "Documents updated"
                })
        
        # Sort by timestamp
        timeline_events.sort(key=lambda x: x["timestamp"])
        
        return {
            "task_id": task.id,
            "title": task.title,
            "current_status": task.status.value if task.status else None,
            "current_assignee": task.assignee,
            "timeline": task.timeline or {},
            "events": timeline_events,
            "total_events": len(timeline_events),
            "duration": self._calculate_task_duration(task),
            "is_overdue": task.is_overdue
        }
    
    def get_user_tasks(
        self,
        user_email: str,
        tenant_id: int,
        status_filter: Optional[List[TaskStatusEnum]] = None,
        priority_filter: Optional[List[TaskPriorityEnum]] = None,
        due_date_start: Optional[datetime] = None,
        due_date_end: Optional[datetime] = None,
        include_completed: bool = False,
        limit: int = 50,
        offset: int = 0
    ) -> Dict[str, Any]:
        """Get tasks assigned to a user with filters"""
        query = self.db.query(WorkflowTask).join(
            WorkflowTask.workflow
        ).filter(
            WorkflowTask.assignee == user_email,
            WorkflowTask.workflow.has(tenant_id=tenant_id)
        )
        
        # Apply filters
        if status_filter:
            query = query.filter(WorkflowTask.status.in_(status_filter))
        elif not include_completed:
            query = query.filter(WorkflowTask.status != TaskStatusEnum.COMPLETED)
        
        if priority_filter:
            query = query.filter(WorkflowTask.priority.in_(priority_filter))
        
        if due_date_start:
            query = query.filter(WorkflowTask.dueDate >= due_date_start)
        
        if due_date_end:
            query = query.filter(WorkflowTask.dueDate <= due_date_end)
        
        # Get total count
        total = query.count()
        
        # Get overdue count
        overdue_count = query.filter(
            WorkflowTask.dueDate < datetime.utcnow(),
            WorkflowTask.status != TaskStatusEnum.COMPLETED
        ).count()
        
        # Apply ordering and pagination
        tasks = query.order_by(
            WorkflowTask.dueDate.asc().nulls_last(),
            WorkflowTask.priority.desc()
        ).offset(offset).limit(limit).all()
        
        # Enhance task data
        enhanced_tasks = []
        for task in tasks:
            enhanced_tasks.append({
                "id": task.id,
                "title": task.title,
                "descrizione": task.descrizione,
                "status": task.status.value if task.status else None,
                "priority": task.priority.value if task.priority else None,
                "dueDate": task.dueDate.isoformat() if task.dueDate else None,
                "is_overdue": task.is_overdue,
                "workflow": {
                    "id": task.workflow.id,
                    "nome": task.workflow.nome,
                    "impianto_nome": task.workflow.impiantoNome
                },
                "documents_count": len(task.documenti_associati),
                "completion_percentage": self._calculate_completion_percentage(task)
            })
        
        return {
            "tasks": enhanced_tasks,
            "total": total,
            "overdue_count": overdue_count,
            "limit": limit,
            "offset": offset,
            "statistics": self._get_task_statistics(query)
        }
    
    def bulk_update_tasks(
        self,
        task_ids: List[int],
        user_id: int,
        tenant_id: int,
        status: Optional[TaskStatusEnum] = None,
        priority: Optional[TaskPriorityEnum] = None,
        assignee: Optional[str] = None,
        dueDate: Optional[datetime] = None,
        note: Optional[str] = None
    ) -> Dict[str, Any]:
        """Bulk update multiple tasks"""
        updated_count = 0
        failed_ids = []
        
        for task_id in task_ids:
            try:
                self.update_task(
                    task_id=task_id,
                    user_id=user_id,
                    tenant_id=tenant_id,
                    status=status,
                    priority=priority,
                    assignee=assignee,
                    dueDate=dueDate,
                    note=note or "Bulk update"
                )
                updated_count += 1
            except Exception as e:
                failed_ids.append(task_id)
        
        return {
            "updated_count": updated_count,
            "failed_count": len(failed_ids),
            "failed_ids": failed_ids,
            "success": len(failed_ids) == 0
        }
    
    def _calculate_task_duration(self, task: WorkflowTask) -> Optional[float]:
        """Calculate task duration in hours"""
        if not task.timeline:
            return None
        
        start = task.timeline.get("inizio_effettivo") or task.timeline.get("inizio")
        end = task.timeline.get("fine")
        
        if not start or not end:
            return None
        
        try:
            start_dt = datetime.fromisoformat(start)
            end_dt = datetime.fromisoformat(end)
            duration = (end_dt - start_dt).total_seconds() / 3600  # Convert to hours
            return round(duration, 2)
        except:
            return None
    
    def _calculate_completion_percentage(self, task: WorkflowTask) -> int:
        """Calculate task completion percentage based on status and timeline"""
        if task.status == TaskStatusEnum.COMPLETED:
            return 100
        elif task.status == TaskStatusEnum.TO_START:
            return 0
        elif task.status == TaskStatusEnum.IN_PROGRESS:
            # Estimate based on time if possible
            if task.timeline and task.estimatedHours:
                duration = self._calculate_task_duration(task)
                if duration:
                    percentage = min(int((duration / task.estimatedHours) * 100), 90)
                    return percentage
            return 50  # Default for in-progress
        elif task.status == TaskStatusEnum.BLOCKED:
            return 0
        
        return 0
    
    def _get_task_statistics(self, base_query) -> Dict[str, Any]:
        """Get statistics for a set of tasks"""
        # Status distribution
        status_dist = {}
        for status in TaskStatusEnum:
            count = base_query.filter(WorkflowTask.status == status).count()
            status_dist[status.value] = count
        
        # Priority distribution
        priority_dist = {}
        for priority in TaskPriorityEnum:
            count = base_query.filter(WorkflowTask.priority == priority).count()
            priority_dist[priority.value] = count
        
        # Average estimated hours
        avg_estimated = self.db.query(
            func.avg(WorkflowTask.estimatedHours)
        ).select_from(base_query.subquery()).scalar() or 0
        
        # Average actual hours (for completed tasks)
        avg_actual = self.db.query(
            func.avg(WorkflowTask.actualHours)
        ).select_from(
            base_query.filter(WorkflowTask.status == TaskStatusEnum.COMPLETED).subquery()
        ).scalar() or 0
        
        return {
            "status_distribution": status_dist,
            "priority_distribution": priority_dist,
            "average_estimated_hours": round(avg_estimated, 2),
            "average_actual_hours": round(avg_actual, 2)
        }
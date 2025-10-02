"""
Enhanced workflow service with copying and sub-workflow support
"""

from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.models.workflow import (
    Workflow, WorkflowStage, WorkflowTask, WorkflowTemplate,
    WorkflowStatusEnum, WorkflowCategoryEnum, WorkflowPhaseEnum,
    WorkflowTypeEnum, TaskStatusEnum, TaskPriorityEnum, EntityEnum
)
from app.models.user import User
from app.models.audit import TipoModificaEnum
from app.services.audit_service import AuditService
from app.services.notification_service import NotificationService, NotificationBuilder
from app.services.task_service import TaskService
from app.core.config import settings


class WorkflowService:
    """Service for enhanced workflow management"""
    
    def __init__(self, db: Session):
        self.db = db
        self.audit_service = AuditService(db)
        self.notification_service = NotificationService(db)
        self.task_service = TaskService(db)
    
    def copy_workflow(
        self,
        workflow_id: int,
        user_id: int,
        tenant_id: int,
        nome: Optional[str] = None,
        target_impianto_id: Optional[int] = None,
        copy_tasks: bool = True,
        copy_documents: bool = False,
        customizations: Optional[Dict[str, Any]] = None,
        note: Optional[str] = None
    ) -> Workflow:
        """
        Create a copy of an existing workflow
        
        Args:
            workflow_id: Source workflow ID
            user_id: User creating the copy
            tenant_id: Tenant ID
            nome: Name for the copy
            target_impianto_id: Target plant ID
            copy_tasks: Whether to copy tasks
            copy_documents: Whether to copy document associations
            customizations: Customization parameters
            note: Notes about the copy
            
        Returns:
            New workflow copy
        """
        # Get source workflow
        source = self._get_workflow_by_id(workflow_id, tenant_id)
        if not source:
            raise ValueError("Source workflow not found")
        
        # Create new workflow copy
        copy = self._create_workflow_copy(source, nome, target_impianto_id, customizations, tenant_id)
        self.db.add(copy)
        self.db.flush()  # Get ID before creating stages/tasks
        
        # Copy stages and tasks if requested
        if copy_tasks:
            stage_mapping = self._copy_workflow_stages(source, copy.id, tenant_id)
            task_mapping = self._copy_workflow_tasks(
                source, copy.id, stage_mapping, tenant_id, copy_documents
            )
            self._update_task_dependencies(source, task_mapping)
        
        self.db.commit()
        self.db.refresh(copy)
        
        # Log the copy operation
        self._log_workflow_copy(copy, source, user_id, tenant_id, copy_tasks, copy_documents, note)
        
        return copy
    
    def create_sub_workflow(
        self,
        parent_workflow_id: int,
        nome: str,
        user_id: int,
        tenant_id: int,
        categoria: Optional[WorkflowCategoryEnum] = None,
        descrizione: Optional[str] = None,
        template_id: Optional[int] = None,
        tipo_workflow: WorkflowTypeEnum = WorkflowTypeEnum.CUSTOM,
        config: Optional[Dict[str, Any]] = None
    ) -> Workflow:
        """
        Create a sub-workflow linked to a parent workflow
        
        Args:
            parent_workflow_id: Parent workflow ID
            nome: Sub-workflow name
            user_id: User creating the sub-workflow
            tenant_id: Tenant ID
            categoria: Workflow category
            descrizione: Description
            template_id: Template to use
            tipo_workflow: Workflow type
            config: Configuration
            
        Returns:
            Created sub-workflow
        """
        # Get parent workflow
        parent = self._get_workflow_by_id(parent_workflow_id, tenant_id)
        if not parent:
            raise ValueError("Parent workflow not found")
        
        # Create sub-workflow
        sub_workflow = self._create_sub_workflow_instance(
            parent, nome, categoria, descrizione, template_id, 
            parent_workflow_id, tipo_workflow, config, tenant_id
        )
        
        self.db.add(sub_workflow)
        
        # If template provided, create tasks from template
        if template_id:
            self._apply_template_to_workflow(sub_workflow, template_id)
        
        self.db.commit()
        self.db.refresh(sub_workflow)
        
        # Log creation and create tracking task
        self._log_sub_workflow_creation(sub_workflow, parent_workflow_id, user_id, tenant_id)
        self._create_sub_workflow_tracking_task(
            parent_workflow_id, sub_workflow, nome, user_id, tenant_id
        )
        
        return sub_workflow
    
    def get_workflow_hierarchy(
        self,
        workflow_id: int,
        tenant_id: int,
        include_siblings: bool = False
    ) -> Dict[str, Any]:
        """
        Get complete workflow hierarchy (parent, siblings, children)
        
        Args:
            workflow_id: Workflow ID
            tenant_id: Tenant ID
            include_siblings: Whether to include sibling workflows
            
        Returns:
            Workflow hierarchy information
        """
        workflow = self.db.query(Workflow).filter(
            Workflow.id == workflow_id,
            Workflow.tenant_id == tenant_id
        ).first()
        
        if not workflow:
            raise ValueError("Workflow not found")
        
        hierarchy = {
            "workflow": {
                "id": workflow.id,
                "nome": workflow.name,
                "tipo": workflow.type,
                "stato": workflow.stato_corrente,
                "progresso": workflow.progress,
                "is_sub_workflow": workflow.parent_workflow_id is not None,
                "is_copy": workflow.workflow_originale_id is not None
            },
            "parent": None,
            "children": [],
            "siblings": [],
            "original": None
        }
        
        # Get parent
        if workflow.parent_workflow_id:
            parent = self.db.query(Workflow).filter(
                Workflow.id == workflow.parent_workflow_id
            ).first()
            if parent:
                hierarchy["parent"] = {
                    "id": parent.id,
                    "nome": parent.name,
                    "tipo": parent.type,
                    "stato": parent.stato_corrente
                }
        
        # Get children
        children = self.db.query(Workflow).filter(
            Workflow.parent_workflow_id == workflow_id,
            Workflow.tenant_id == tenant_id
        ).all()
        
        hierarchy["children"] = [
            {
                "id": child.id,
                "nome": child.name,
                "tipo": child.type,
                "stato": child.stato_corrente,
                "progresso": child.progress
            }
            for child in children
        ]
        
        # Get siblings if requested
        if include_siblings and workflow.parent_workflow_id:
            siblings = self.db.query(Workflow).filter(
                Workflow.parent_workflow_id == workflow.parent_workflow_id,
                Workflow.id != workflow_id,
                Workflow.tenant_id == tenant_id
            ).all()
            
            hierarchy["siblings"] = [
                {
                    "id": sibling.id,
                    "nome": sibling.name,
                    "tipo": sibling.type,
                    "stato": sibling.stato_corrente
                }
                for sibling in siblings
            ]
        
        # Get original if this is a copy
        if workflow.workflow_originale_id:
            original = self.db.query(Workflow).filter(
                Workflow.id == workflow.workflow_originale_id
            ).first()
            if original:
                hierarchy["original"] = {
                    "id": original.id,
                    "nome": original.name,
                    "tipo": original.type,
                    "created_at": original.created_at.isoformat() if original.created_at else None
                }
        
        return hierarchy
    
    def update_sub_workflow_progress(
        self,
        sub_workflow_id: int,
        tenant_id: int
    ):
        """Update parent workflow when sub-workflow progresses"""
        sub_workflow = self.db.query(Workflow).filter(
            Workflow.id == sub_workflow_id,
            Workflow.tenant_id == tenant_id
        ).first()
        
        if not sub_workflow or not sub_workflow.parent_workflow_id:
            return
        
        # Find tracking task in parent
        tracking_task = self.db.query(WorkflowTask).filter(
            WorkflowTask.workflow_id == sub_workflow.parent_workflow_id,
            WorkflowTask.timeline.contains({"sub_workflow_id": sub_workflow_id})
        ).first()
        
        if tracking_task:
            # Update task status based on sub-workflow progress
            if sub_workflow.stato_corrente == WorkflowStatusEnum.COMPLETED.value:
                tracking_task.status = TaskStatusEnum.COMPLETED
                tracking_task.completed_date = datetime.utcnow()
                tracking_task.actualHours = self._calculate_workflow_duration(sub_workflow)
            elif sub_workflow.stato_corrente == WorkflowStatusEnum.ACTIVE.value:
                tracking_task.status = TaskStatusEnum.IN_PROGRESS
            elif sub_workflow.stato_corrente == WorkflowStatusEnum.CANCELLED.value:
                tracking_task.status = TaskStatusEnum.BLOCKED
            
            # Update progress
            if tracking_task.timeline:
                tracking_task.timeline["sub_workflow_progress"] = sub_workflow.progress
                tracking_task.timeline["sub_workflow_status"] = sub_workflow.stato_corrente
        
        self.db.commit()
    
    def get_workflow_copies(
        self,
        workflow_id: int,
        tenant_id: int
    ) -> List[Dict[str, Any]]:
        """Get all copies of a workflow"""
        copies = self.db.query(Workflow).filter(
            Workflow.workflow_originale_id == workflow_id,
            Workflow.tenant_id == tenant_id
        ).order_by(Workflow.created_at.desc()).all()
        
        return [
            {
                "id": copy.id,
                "nome": copy.name,
                "impianto_id": copy.plant_id,
                "impianto_nome": copy.plant_name,
                "stato": copy.stato_corrente,
                "progresso": copy.progress,
                "created_at": copy.created_at.isoformat() if copy.created_at else None,
                "task_count": len(copy.tasks)
            }
            for copy in copies
        ]
    
    def merge_workflows(
        self,
        workflow_ids: List[int],
        nome: str,
        user_id: int,
        tenant_id: int,
        descrizione: Optional[str] = None
    ) -> Workflow:
        """
        Merge multiple workflows into a new composite workflow
        
        Args:
            workflow_ids: List of workflow IDs to merge
            nome: Name for the merged workflow
            user_id: User performing the merge
            tenant_id: Tenant ID
            descrizione: Description
            
        Returns:
            New merged workflow
        """
        if len(workflow_ids) < 2:
            raise ValueError("At least two workflows required for merging")
        
        # Get source workflows
        workflows = self.db.query(Workflow).filter(
            Workflow.id.in_(workflow_ids),
            Workflow.tenant_id == tenant_id
        ).all()
        
        if len(workflows) != len(workflow_ids):
            raise ValueError("One or more workflows not found")
        
        # Verify all workflows are for the same plant
        impianto_ids = set(w.plant_id for w in workflows)
        if len(impianto_ids) > 1:
            raise ValueError("All workflows must belong to the same plant")
        
        # Create merged workflow
        merged = Workflow(
            name=nome,
            plant_id=workflows[0].plant_id,
            plant_name=workflows[0].plant_name,
            type="Workflow Composto",
            category=workflows[0].category,
            description=descrizione or f"Unione di {len(workflows)} workflow",
            stato_corrente=WorkflowStatusEnum.DRAFT.value,
            progress=0,
            tipo_workflow=WorkflowTypeEnum.COMPOSTO,
            involved_entities=list(set(
                ente for w in workflows 
                for ente in (w.involved_entities or [])
            )),
            plant_power=workflows[0].plant_power,
            plant_type=workflows[0].plant_type,
            config={
                "merged_from": workflow_ids,
                "merge_date": datetime.utcnow().isoformat()
            },
            tenant_id=tenant_id
        )
        
        self.db.add(merged)
        self.db.flush()
        
        # Create sub-workflows for each original
        for idx, source_workflow in enumerate(workflows):
            sub_workflow = self.create_sub_workflow(
                parent_workflow_id=merged.id,
                name=f"{source_workflow.name} (Parte {idx + 1})",
                user_id=user_id,
                tenant_id=tenant_id,
                category=source_workflow.category,
                description=f"Sub-workflow da unione: {source_workflow.name}",
                tipo_workflow=source_workflow.tipo_workflow or WorkflowTypeEnum.CUSTOM
            )
            
            # Copy tasks to sub-workflow
            self._copy_tasks_to_workflow(source_workflow, sub_workflow)
        
        self.db.commit()
        self.db.refresh(merged)
        
        # Log the merge
        self.audit_service.log_change(
            entity_type="workflow",
            entity_id=merged.id,
            tipo_modifica=TipoModificaEnum.CREAZIONE,
            user_id=user_id,
            tenant_id=tenant_id,
            dettaglio_modifica={
                "action": "workflow_merge",
                "merged_workflows": workflow_ids,
                "sub_workflows_created": len(workflows)
            },
            notes=f"Merged {len(workflows)} workflows into composite workflow"
        )
        
        return merged
    
    def _adjust_due_date(self, original_date: Optional[datetime]) -> Optional[datetime]:
        """Adjust due date for copied workflow"""
        if not original_date:
            return None
        
        # Calculate days difference from original
        days_diff = (original_date - datetime.utcnow()).days
        
        # Set new date maintaining relative timing
        if days_diff < 0:
            # Was overdue, set to 7 days from now
            return datetime.utcnow() + timedelta(days=7)
        else:
            # Maintain relative timing
            return datetime.utcnow() + timedelta(days=days_diff)
    
    def _calculate_workflow_duration(self, workflow: Workflow) -> float:
        """Calculate workflow duration in hours"""
        if not workflow.created_at or not workflow.completion_date:
            return 0
        
        duration = (workflow.completion_date - workflow.created_at).total_seconds() / 3600
        return round(duration, 2)
    
    def _create_workflow_from_template(self, workflow: Workflow, template: WorkflowTemplate):
        """Create workflow structure from template"""
        # Create stages
        stage_mapping = {}
        for stage_data in template.stages:
            stage = WorkflowStage(
                workflow_id=workflow.id,
                name=stage_data["name"],
                order=stage_data.get("order", 0),
                tenant_id=workflow.tenant_id
            )
            self.db.add(stage)
            self.db.flush()
            stage_mapping[stage_data["id"]] = stage.id
        
        # Create tasks
        for task_data in template.tasks:
            task = WorkflowTask(
                workflow_id=workflow.id,
                stage_id=stage_mapping.get(task_data.get("stage_id")),
                title=task_data["title"],
                description=task_data.get("description"),
                status=TaskStatusEnum.TO_START,
                priority=TaskPriorityEnum[task_data.get("priority", "MEDIUM")],
                estimated_hours=task_data.get("estimated_hours"),
                integration=EntityEnum[task_data["integration"]] if task_data.get("integration") else None,
                responsible_entity=EntityEnum[task_data["responsible_entity"]] if task_data.get("responsible_entity") else None,
                practice_type=task_data.get("practice_type"),
                portal_url=task_data.get("portal_url"),
                required_credentials=task_data.get("required_credentials"),
                timeline={"inizio": datetime.utcnow().isoformat()},
                documenti_associati=[],
                audit_enabled=True
            )
            self.db.add(task)
    
    def _copy_tasks_to_workflow(self, source_workflow: Workflow, target_workflow: Workflow):
        """Copy tasks from one workflow to another"""
        # Copy stages first
        stage_mapping = {}
        for source_stage in source_workflow.stages:
            new_stage = WorkflowStage(
                workflow_id=target_workflow.id,
                name=source_stage.name,
                order=source_stage.order,
                tenant_id=target_workflow.tenant_id
            )
            self.db.add(new_stage)
            self.db.flush()
            stage_mapping[source_stage.id] = new_stage.id
        
        # Copy tasks
        for source_task in source_workflow.tasks:
            new_task = WorkflowTask(
                workflow_id=target_workflow.id,
                stage_id=stage_mapping.get(source_task.stage_id) if source_task.stage_id else None,
                title=source_task.title,
                description=source_task.description,
                status=TaskStatusEnum.TO_START,
                priority=source_task.priority,
                estimated_hours=source_task.estimated_hours,
                integration=source_task.integration,
                responsible_entity=source_task.responsible_entity,
                practice_type=source_task.practice_type,
                timeline={"inizio": datetime.utcnow().isoformat()},
                audit_enabled=source_task.audit_enabled
            )
            self.db.add(new_task)
    
    # Helper methods for reducing code duplication
    
    def _get_workflow_by_id(self, workflow_id: int, tenant_id: int) -> Optional[Workflow]:
        """Get workflow by ID with tenant filtering."""
        return self.db.query(Workflow).filter(
            Workflow.id == workflow_id,
            Workflow.tenant_id == tenant_id
        ).first()
    
    def _create_workflow_copy(
        self, 
        source: Workflow, 
        nome: Optional[str], 
        target_impianto_id: Optional[int],
        customizations: Optional[Dict[str, Any]],
        tenant_id: int
    ) -> Workflow:
        """Create a new workflow instance as a copy of source."""
        return Workflow(
            name=nome or f"Copia di {source.name}",
            plant_id=target_impianto_id or source.plant_id,
            plant_name=source.plant_name,
            type=source.type,
            category=source.category,
            description=f"Copia di: {source.description}" if source.description else None,
            stato_corrente=WorkflowStatusEnum.DRAFT.value,
            progress=0,
            template_id=source.template_id,
            workflow_originale_id=source.id,
            is_standard=False,
            tipo_workflow=source.tipo_workflow,
            involved_entities=source.involved_entities.copy() if source.involved_entities else [],
            plant_power=source.plant_power,
            plant_type=source.plant_type,
            document_requirements=source.document_requirements.copy() if source.document_requirements else {},
            config=customizations or source.config.copy() if source.config else {},
            tenant_id=tenant_id
        )
    
    def _copy_workflow_stages(
        self, 
        source: Workflow, 
        copy_id: int, 
        tenant_id: int
    ) -> Dict[int, int]:
        """Copy workflow stages and return mapping of old to new IDs."""
        stage_mapping = {}
        for source_stage in source.stages:
            new_stage = WorkflowStage(
                workflow_id=copy_id,
                name=source_stage.name,
                order=source_stage.order,
                completed=False,
                tenant_id=tenant_id
            )
            self.db.add(new_stage)
            self.db.flush()
            stage_mapping[source_stage.id] = new_stage.id
        return stage_mapping
    
    def _copy_workflow_tasks(
        self,
        source: Workflow,
        copy_id: int,
        stage_mapping: Dict[int, int],
        tenant_id: int,
        copy_documents: bool
    ) -> Dict[int, int]:
        """Copy workflow tasks and return mapping of old to new IDs."""
        task_mapping = {}
        for source_task in source.tasks:
            new_task = WorkflowTask(
                workflow_id=copy_id,
                stage_id=stage_mapping.get(source_task.stage_id) if source_task.stage_id else None,
                title=source_task.title,
                description=source_task.description,
                status=TaskStatusEnum.TO_START,
                priority=source_task.priority,
                assignee=None,
                due_date=self._adjust_due_date(source_task.due_date) if source_task.due_date else None,
                estimated_hours=source_task.estimated_hours,
                dependencies=[],
                integration=source_task.integration,
                automazione_config=source_task.automazione_config.copy() if source_task.automazione_config else {},
                responsible_entity=source_task.responsible_entity,
                practice_type=source_task.practice_type,
                portal_url=source_task.portal_url,
                required_credentials=source_task.required_credentials,
                timeline={"inizio": datetime.utcnow().isoformat()},
                documenti_associati=[] if not copy_documents else source_task.documenti_associati.copy(),
                audit_enabled=source_task.audit_enabled
            )
            self.db.add(new_task)
            self.db.flush()
            task_mapping[source_task.id] = new_task.id
        return task_mapping
    
    def _update_task_dependencies(
        self, 
        source: Workflow, 
        task_mapping: Dict[int, int]
    ) -> None:
        """Update task dependencies based on mapping."""
        for source_task in source.tasks:
            if source_task.dependencies:
                new_task_id = task_mapping.get(source_task.id)
                if new_task_id:
                    new_task = self.db.query(WorkflowTask).filter(
                        WorkflowTask.id == new_task_id
                    ).first()
                    if new_task:
                        new_task.dependencies = [
                            task_mapping.get(dep_id) 
                            for dep_id in source_task.dependencies 
                            if task_mapping.get(dep_id)
                        ]
    
    def _log_workflow_copy(
        self,
        copy: Workflow,
        source: Workflow,
        user_id: int,
        tenant_id: int,
        copy_tasks: bool,
        copy_documents: bool,
        note: Optional[str]
    ) -> None:
        """Log workflow copy operation."""
        self.audit_service.log_change(
            entity_type="workflow",
            entity_id=copy.id,
            tipo_modifica=TipoModificaEnum.CREAZIONE,
            user_id=user_id,
            tenant_id=tenant_id,
            dettaglio_modifica={
                "source_workflow_id": source.id,
                "is_copy": True,
                "tasks_copied": copy_tasks,
                "documents_copied": copy_documents
            },
            notes=note or f"Workflow copied from {source.name}"
        )
    
    def _create_sub_workflow_instance(
        self,
        parent: Workflow,
        nome: str,
        categoria: Optional[WorkflowCategoryEnum],
        descrizione: Optional[str],
        template_id: Optional[int],
        parent_workflow_id: int,
        tipo_workflow: WorkflowTypeEnum,
        config: Optional[Dict[str, Any]],
        tenant_id: int
    ) -> Workflow:
        """Create a new sub-workflow instance."""
        return Workflow(
            name=nome,
            plant_id=parent.plant_id,
            plant_name=parent.plant_name,
            type=f"Sub-workflow di {parent.type}" if parent.type else "Sub-workflow",
            category=categoria or parent.category,
            description=descrizione,
            stato_corrente=WorkflowStatusEnum.DRAFT.value,
            progress=0,
            template_id=template_id,
            parent_workflow_id=parent_workflow_id,
            tipo_workflow=tipo_workflow,
            involved_entities=parent.involved_entities.copy() if parent.involved_entities else [],
            plant_power=parent.plant_power,
            plant_type=parent.plant_type,
            config=config or {},
            tenant_id=tenant_id
        )
    
    def _apply_template_to_workflow(self, workflow: Workflow, template_id: int) -> None:
        """Apply a template to a workflow."""
        template = self.db.query(WorkflowTemplate).filter(
            WorkflowTemplate.id == template_id
        ).first()
        
        if template:
            self._create_workflow_from_template(workflow, template)
    
    def _log_sub_workflow_creation(
        self,
        sub_workflow: Workflow,
        parent_workflow_id: int,
        user_id: int,
        tenant_id: int
    ) -> None:
        """Log sub-workflow creation."""
        self.audit_service.log_change(
            entity_type="workflow",
            entity_id=sub_workflow.id,
            tipo_modifica=TipoModificaEnum.CREAZIONE,
            user_id=user_id,
            tenant_id=tenant_id,
            dettaglio_modifica={
                "parent_workflow_id": parent_workflow_id,
                "is_sub_workflow": True
            }
        )
    
    def _create_sub_workflow_tracking_task(
        self,
        parent_workflow_id: int,
        sub_workflow: Workflow,
        nome: str,
        user_id: int,
        tenant_id: int
    ) -> None:
        """Create a tracking task in parent workflow for sub-workflow."""
        self.task_service.create_task(
            workflow_id=parent_workflow_id,
            title=f"Sub-workflow: {name}",
            tenant_id=tenant_id,
            user_id=user_id,
            description=f"Tracking of sub-workflow '{name}' (ID: {sub_workflow.id})",
            priority=TaskPriorityEnum.MEDIUM,
            integration=None,
            timeline={
                "sub_workflow_id": sub_workflow.id,
                "created_at": datetime.utcnow().isoformat()
            },
            audit_enabled=True
        )
    
    def _adjust_due_date(self, original_date: datetime) -> datetime:
        """Adjust due date to be relative to current date."""
        if not original_date:
            return None
        
        # Calculate the difference from original creation
        # and apply to current date
        days_diff = (original_date - datetime.utcnow()).days
        return datetime.utcnow() + timedelta(days=max(days_diff, 7))
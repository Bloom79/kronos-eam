"""
Workflow Data Service
Handles task completion and automatic data updates to plant entity tables
"""

from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
import logging

from app.models.workflow import WorkflowTask, TaskStatusEnum
from app.models.plant import Plant
from app.models.plant_entity_data import (
    PlantDSOData, PlantTernaData, PlantGSEData, PlantCustomsData
)
from app.models.user import User
from app.core.exceptions import NotFoundException, ValidationException, PermissionDeniedException

logger = logging.getLogger(__name__)


class WorkflowDataService:
    """Service for handling workflow task data collection and updates"""
    
    def __init__(self, db: Session):
        self.db = db
        
    def complete_task(
        self,
        task_id: int,
        user_id: int,
        form_data: Dict[str, Any],
        tenant_id: str
    ) -> WorkflowTask:
        """
        Complete a workflow task and update associated entity data
        
        Args:
            task_id: ID of the task to complete
            user_id: ID of the user completing the task
            form_data: Data collected from the task form
            tenant_id: Tenant ID for multi-tenancy
            
        Returns:
            Updated WorkflowTask object
        """
        # Get task with validation
        task = self.db.query(WorkflowTask).filter(
            and_(
                WorkflowTask.id == task_id,
                WorkflowTask.tenant_id == tenant_id
            )
        ).first()
        
        if not task:
            raise NotFoundException(f"Task {task_id} not found")
            
        # Validate user can complete this task
        if task.assignee and task.assignee != str(user_id):
            # Check if user has permission to complete tasks for others
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user or user.role not in ['admin', 'manager']:
                raise PermissionDeniedException("You are not assigned to this task")
        
        # Validate task is not already completed
        if task.status == TaskStatusEnum.COMPLETED:
            raise ValidationException("Task is already completed")
            
        # Store the collected data
        task.completed_data = form_data
        task.completed_by = str(user_id)
        task.completed_date = datetime.utcnow()
        task.status = TaskStatusEnum.COMPLETED
        
        # Update entity-specific data if configured
        if task.target_table and task.target_fields:
            self._update_entity_data(task, user_id, form_data)
            
        # Update workflow progress
        self._update_workflow_progress(task.workflow)
        
        self.db.commit()
        self.db.refresh(task)
        
        logger.info(f"Task {task_id} completed by user {user_id}")
        
        return task
        
    def _update_entity_data(
        self,
        task: WorkflowTask,
        user_id: int,
        form_data: Dict[str, Any]
    ):
        """Update entity-specific data tables based on task configuration"""
        
        # Get the plant associated with this workflow
        plant = task.workflow.plant
        if not plant:
            logger.warning(f"No plant associated with workflow {task.workflow_id}")
            return
            
        # Map target table to model class
        table_model_map = {
            'plant_dso_data': PlantDSOData,
            'plant_terna_data': PlantTernaData,
            'plant_gse_data': PlantGSEData,
            'plant_customs_data': PlantCustomsData
        }
        
        model_class = table_model_map.get(task.target_table)
        if not model_class:
            logger.warning(f"Unknown target table: {task.target_table}")
            return
            
        # Get or create entity data record
        entity_data = self.db.query(model_class).filter(
            model_class.plant_id == plant.id
        ).first()
        
        if not entity_data:
            entity_data = model_class(
                plant_id=plant.id,
                tenant_id=task.tenant_id
            )
            self.db.add(entity_data)
            
        # Map form fields to entity fields based on task configuration
        for form_field, entity_field in task.target_fields.items():
            if form_field in form_data:
                # Handle date conversions
                value = form_data[form_field]
                if entity_field.endswith('_date') and isinstance(value, str):
                    try:
                        value = datetime.fromisoformat(value)
                    except:
                        pass
                        
                setattr(entity_data, entity_field, value)
                
        # Update tracking fields
        entity_data.updated_by = user_id
        entity_data.updated_from_workflow = task.workflow_id
        entity_data.updated_from_task = task.id
        entity_data.last_update = datetime.utcnow()
        
        logger.info(f"Updated {task.target_table} for plant {plant.id}")
        
    def _update_workflow_progress(self, workflow):
        """Update workflow progress based on completed tasks"""
        total_tasks = len(workflow.tasks)
        if total_tasks == 0:
            return
            
        completed_tasks = sum(
            1 for task in workflow.tasks 
            if task.status == TaskStatusEnum.COMPLETED
        )
        
        workflow.progress = (completed_tasks / total_tasks) * 100
        
        # Check if workflow is complete
        if workflow.progress >= 100:
            workflow.current_status = "Completed"
            workflow.completion_date = datetime.utcnow()
            
    def get_user_tasks(
        self,
        user_id: int,
        tenant_id: str,
        status: Optional[TaskStatusEnum] = None,
        limit: int = 50
    ) -> list:
        """Get tasks assigned to a user"""
        query = self.db.query(WorkflowTask).filter(
            and_(
                WorkflowTask.assignee == str(user_id),
                WorkflowTask.tenant_id == tenant_id
            )
        )
        
        if status:
            query = query.filter(WorkflowTask.status == status)
            
        # Order by priority and due date
        query = query.order_by(
            WorkflowTask.due_date.asc().nullsfirst(),
            WorkflowTask.priority.desc()
        )
        
        return query.limit(limit).all()
        
    def get_plant_workflow_data(
        self,
        plant_id: int,
        tenant_id: str
    ) -> Dict[str, Any]:
        """Get all workflow-collected data for a plant"""
        
        # Verify plant belongs to tenant
        plant = self.db.query(Plant).filter(
            and_(
                Plant.id == plant_id,
                Plant.tenant_id == tenant_id
            )
        ).first()
        
        if not plant:
            raise NotFoundException(f"Plant {plant_id} not found")
            
        result = {
            'plant_id': plant_id,
            'dso_data': None,
            'terna_data': None,
            'gse_data': None,
            'customs_data': None,
            'workflows': []
        }
        
        # Get entity-specific data
        dso_data = self.db.query(PlantDSOData).filter(
            PlantDSOData.plant_id == plant_id
        ).first()
        if dso_data:
            result['dso_data'] = self._serialize_entity_data(dso_data)
            
        terna_data = self.db.query(PlantTernaData).filter(
            PlantTernaData.plant_id == plant_id
        ).first()
        if terna_data:
            result['terna_data'] = self._serialize_entity_data(terna_data)
            
        gse_data = self.db.query(PlantGSEData).filter(
            PlantGSEData.plant_id == plant_id
        ).first()
        if gse_data:
            result['gse_data'] = self._serialize_entity_data(gse_data)
            
        customs_data = self.db.query(PlantCustomsData).filter(
            PlantCustomsData.plant_id == plant_id
        ).first()
        if customs_data:
            result['customs_data'] = self._serialize_entity_data(customs_data)
            
        # Get workflow summary
        for workflow in plant.workflows:
            result['workflows'].append({
                'id': workflow.id,
                'name': workflow.name,
                'status': workflow.current_status,
                'progress': workflow.progress,
                'created_date': workflow.created_at.isoformat() if workflow.created_at else None,
                'completion_date': workflow.completion_date.isoformat() if workflow.completion_date else None,
                'task_count': len(workflow.tasks),
                'completed_tasks': sum(1 for t in workflow.tasks if t.status == TaskStatusEnum.COMPLETED)
            })
            
        return result
        
    def _serialize_entity_data(self, entity_data) -> Dict[str, Any]:
        """Serialize entity data with source tracking"""
        data = {}
        
        # Get all columns except relationships and internal fields
        for column in entity_data.__table__.columns:
            if column.name not in ['id', 'plant_id', 'tenant_id', 'created_at', 'updated_at']:
                value = getattr(entity_data, column.name)
                # Convert datetime to ISO format
                if isinstance(value, datetime):
                    value = value.isoformat()
                data[column.name] = value
                
        # Add source information
        data['_metadata'] = {
            'last_update': entity_data.last_update.isoformat() if entity_data.last_update else None,
            'updated_by': entity_data.updated_by,
            'source_workflow_id': entity_data.updated_from_workflow,
            'source_task_id': entity_data.updated_from_task
        }
        
        return data
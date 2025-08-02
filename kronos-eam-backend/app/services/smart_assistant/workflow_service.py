"""
Workflow Service

Manages guided workflows, document packages, and collaborative task management
for Smart Assistant operations.
"""

import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from enum import Enum

from app.schemas.smart_assistant import (
    PortalType, FormType, WorkflowGuide, WorkflowStep,
    SubmissionPackage, SmartAssistantTask, CollaborationWorkflow
)


class WorkflowStatus(str, Enum):
    """Workflow execution status"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    WAITING_USER = "waiting_user"
    REVIEW = "review"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class WorkflowService:
    """
    Service for managing guided workflows and collaborative processes
    """
    
    def __init__(self):
        self.active_workflows = {}
        self.workflow_templates = self._initialize_workflow_templates()
    
    def _initialize_workflow_templates(self) -> Dict[str, Dict[str, Any]]:
        """Initialize workflow templates for different portal operations"""
        
        templates = {
            "gse_rid_submission": {
                "title": "GSE RID Application Submission",
                "description": "Complete workflow for submitting RID application to GSE",
                "estimated_duration": 45,  # minutes
                "steps": [
                    {
                        "id": "prepare_documents",
                        "title": "Prepare Documents",
                        "description": "Generate and review all required forms",
                        "type": "automated",
                        "estimated_time": 5
                    },
                    {
                        "id": "review_data",
                        "title": "Review Plant Data",
                        "description": "Verify all plant information is correct",
                        "type": "user_review",
                        "estimated_time": 10
                    },
                    {
                        "id": "access_portal",
                        "title": "Access GSE Portal",
                        "description": "Navigate to https://areaclienti.gse.it",
                        "type": "manual",
                        "estimated_time": 2
                    },
                    {
                        "id": "authenticate",
                        "title": "SPID Authentication",
                        "description": "Complete SPID authentication process",
                        "type": "manual",
                        "estimated_time": 5,
                        "requires_user": True
                    },
                    {
                        "id": "navigate_application",
                        "title": "Navigate to Applications",
                        "description": "Go to RID application section",
                        "type": "guided",
                        "estimated_time": 3
                    },
                    {
                        "id": "upload_forms",
                        "title": "Upload Pre-filled Forms",
                        "description": "Upload the generated forms",
                        "type": "manual",
                        "estimated_time": 10
                    },
                    {
                        "id": "submit_application",
                        "title": "Submit Application",
                        "description": "Final review and submission",
                        "type": "manual",
                        "estimated_time": 10
                    }
                ]
            },
            
            "terna_plant_registration": {
                "title": "Terna GAUDÌ Plant Registration",
                "description": "Register plant in Terna GAUDÌ system",
                "estimated_duration": 60,
                "steps": [
                    {
                        "id": "prepare_technical_data",
                        "title": "Prepare Technical Data",
                        "description": "Compile all technical specifications",
                        "type": "automated",
                        "estimated_time": 10
                    },
                    {
                        "id": "verify_coordinates",
                        "title": "Verify GPS Coordinates",
                        "description": "Confirm plant location coordinates",
                        "type": "user_review",
                        "estimated_time": 5
                    },
                    {
                        "id": "access_gaudi",
                        "title": "Access GAUDÌ Portal",
                        "description": "Navigate to Terna GAUDÌ system",
                        "type": "manual",
                        "estimated_time": 3
                    },
                    {
                        "id": "certificate_auth",
                        "title": "Certificate Authentication",
                        "description": "Authenticate with digital certificate",
                        "type": "manual",
                        "estimated_time": 5,
                        "requires_user": True
                    },
                    {
                        "id": "create_plant_entry",
                        "title": "Create Plant Entry",
                        "description": "Enter plant data in GAUDÌ system",
                        "type": "guided",
                        "estimated_time": 25
                    },
                    {
                        "id": "submit_registration",
                        "title": "Submit Registration",
                        "description": "Submit for Terna approval",
                        "type": "manual",
                        "estimated_time": 5
                    },
                    {
                        "id": "track_approval",
                        "title": "Track Approval Status",
                        "description": "Monitor registration status",
                        "type": "monitoring",
                        "estimated_time": 7
                    }
                ]
            },
            
            "dso_tica_request": {
                "title": "DSO TICA Connection Request",
                "description": "Submit connection cost estimate request to DSO",
                "estimated_duration": 30,
                "steps": [
                    {
                        "id": "prepare_tica_form",
                        "title": "Prepare TICA Form",
                        "description": "Generate pre-filled TICA request",
                        "type": "automated",
                        "estimated_time": 5
                    },
                    {
                        "id": "gather_documents",
                        "title": "Gather Supporting Documents",
                        "description": "Collect technical documentation",
                        "type": "user_action",
                        "estimated_time": 10
                    },
                    {
                        "id": "access_dso_portal",
                        "title": "Access DSO Portal",
                        "description": "Login to DSO business portal",
                        "type": "manual",
                        "estimated_time": 3
                    },
                    {
                        "id": "submit_tica",
                        "title": "Submit TICA Request",
                        "description": "Upload form and documents",
                        "type": "manual",
                        "estimated_time": 10
                    },
                    {
                        "id": "monitor_response",
                        "title": "Monitor Response",
                        "description": "Track TICA processing status",
                        "type": "monitoring",
                        "estimated_time": 2
                    }
                ]
            },
            
            "dogane_utf_declaration": {
                "title": "Dogane UTF Annual Declaration",
                "description": "Submit UTF annual declaration to Dogane",
                "estimated_duration": 25,
                "steps": [
                    {
                        "id": "calculate_utf_fees",
                        "title": "Calculate UTF Fees",
                        "description": "Calculate annual UTF obligations",
                        "type": "automated",
                        "estimated_time": 3
                    },
                    {
                        "id": "prepare_declaration",
                        "title": "Prepare Declaration",
                        "description": "Generate UTF declaration form",
                        "type": "automated",
                        "estimated_time": 5
                    },
                    {
                        "id": "access_dogane_portal",
                        "title": "Access Dogane Portal",
                        "description": "Navigate to Dogane services",
                        "type": "manual",
                        "estimated_time": 3
                    },
                    {
                        "id": "spid_authentication",
                        "title": "SPID Authentication",
                        "description": "Authenticate with SPID/CNS",
                        "type": "manual",
                        "estimated_time": 5,
                        "requires_user": True
                    },
                    {
                        "id": "submit_declaration",
                        "title": "Submit Declaration",
                        "description": "Upload and submit UTF declaration",
                        "type": "manual",
                        "estimated_time": 9
                    }
                ]
            }
        }
        
        return templates
    
    async def create_workflow(
        self,
        tenant_id: str,
        portal: PortalType,
        form_type: FormType,
        plant_id: int,
        submission_package: SubmissionPackage,
        team_members: Optional[List[str]] = None,
        assigned_to: Optional[str] = None
    ) -> CollaborationWorkflow:
        """
        Create a new collaborative workflow
        """
        
        # Generate workflow ID
        workflow_id = f"wf_{portal.value}_{form_type.value}_{uuid.uuid4().hex[:8]}"
        
        # Get template based on portal and form type
        template_key = f"{portal.value}_{form_type.value}"
        template = self.workflow_templates.get(template_key)
        
        if not template:
            # Create basic template if specific one doesn't exist
            template = {
                "title": f"{portal.value.upper()} {form_type.value.replace('_', ' ').title()}",
                "description": f"Workflow for {form_type.value} submission to {portal.value.upper()}",
                "estimated_duration": 30,
                "steps": self._create_generic_steps(portal, form_type)
            }
        
        # Set deadline based on portal type
        deadline = self._calculate_deadline(portal, form_type)
        
        workflow = CollaborationWorkflow(
            workflow_id=workflow_id,
            title=template["title"],
            description=template["description"],
            portal=portal,
            team_members=team_members or [],
            current_assignee=assigned_to,
            total_steps=len(template["steps"]),
            current_step=1,
            deadline=deadline,
            package=submission_package,
            status=WorkflowStatus.PENDING
        )
        
        # Store workflow
        self.active_workflows[workflow_id] = workflow
        
        return workflow
    
    def _create_generic_steps(self, portal: PortalType, form_type: FormType) -> List[Dict[str, Any]]:
        """Create generic workflow steps when no specific template exists"""
        
        return [
            {
                "id": "prepare",
                "title": "Prepare Submission",
                "description": "Prepare all required forms and documents",
                "type": "automated",
                "estimated_time": 5
            },
            {
                "id": "review",
                "title": "Review Data",
                "description": "Review all prepared information",
                "type": "user_review",
                "estimated_time": 10
            },
            {
                "id": "submit",
                "title": "Submit to Portal",
                "description": f"Submit to {portal.value.upper()} portal",
                "type": "manual",
                "estimated_time": 15
            }
        ]
    
    def _calculate_deadline(self, portal: PortalType, form_type: FormType) -> datetime:
        """Calculate appropriate deadline based on portal and form type"""
        
        now = datetime.now()
        
        if portal == PortalType.DOGANE and form_type == FormType.UTF_DECLARATION:
            # UTF declarations due March 31st
            current_year = now.year
            if now.month <= 3:
                return datetime(current_year, 3, 31, 23, 59, 59)
            else:
                return datetime(current_year + 1, 3, 31, 23, 59, 59)
        
        elif portal == PortalType.GSE:
            # GSE applications typically have 60-day processing
            return now + timedelta(days=30)  # Submit 30 days before deadline
        
        elif portal == PortalType.TERNA:
            # Terna registrations for new plants
            return now + timedelta(days=45)
        
        else:
            # Default deadline
            return now + timedelta(days=30)
    
    async def update_workflow_status(
        self,
        workflow_id: str,
        new_status: WorkflowStatus,
        current_step: Optional[int] = None,
        notes: Optional[str] = None
    ) -> bool:
        """
        Update workflow status and progress
        """
        
        if workflow_id not in self.active_workflows:
            return False
        
        workflow = self.active_workflows[workflow_id]
        workflow.status = new_status
        
        if current_step is not None:
            workflow.current_step = current_step
            if current_step not in workflow.steps_completed:
                workflow.steps_completed.append(current_step)
        
        if notes:
            workflow.comments.append({
                "timestamp": datetime.now().isoformat(),
                "author": "system",
                "message": notes,
                "type": "status_update"
            })
        
        return True
    
    async def assign_workflow(
        self,
        workflow_id: str,
        assignee: str,
        assigner: Optional[str] = None
    ) -> bool:
        """
        Assign workflow to a team member
        """
        
        if workflow_id not in self.active_workflows:
            return False
        
        workflow = self.active_workflows[workflow_id]
        
        if assignee not in workflow.team_members:
            workflow.team_members.append(assignee)
        
        workflow.current_assignee = assignee
        
        # Add comment
        workflow.comments.append({
            "timestamp": datetime.now().isoformat(),
            "author": assigner or "system",
            "message": f"Workflow assigned to {assignee}",
            "type": "assignment"
        })
        
        return True
    
    async def add_workflow_comment(
        self,
        workflow_id: str,
        author: str,
        message: str,
        comment_type: str = "comment"
    ) -> bool:
        """
        Add comment to workflow
        """
        
        if workflow_id not in self.active_workflows:
            return False
        
        workflow = self.active_workflows[workflow_id]
        
        workflow.comments.append({
            "timestamp": datetime.now().isoformat(),
            "author": author,
            "message": message,
            "type": comment_type
        })
        
        return True
    
    async def get_workflow(self, workflow_id: str) -> Optional[CollaborationWorkflow]:
        """
        Get workflow by ID
        """
        return self.active_workflows.get(workflow_id)
    
    async def get_user_workflows(
        self,
        user_id: str,
        status: Optional[WorkflowStatus] = None
    ) -> List[CollaborationWorkflow]:
        """
        Get workflows assigned to or involving a user
        """
        
        workflows = []
        
        for workflow in self.active_workflows.values():
            if user_id in workflow.team_members or workflow.current_assignee == user_id:
                if status is None or workflow.status == status:
                    workflows.append(workflow)
        
        return workflows
    
    async def get_tenant_workflows(
        self,
        tenant_id: str,
        status: Optional[WorkflowStatus] = None,
        portal: Optional[PortalType] = None
    ) -> List[CollaborationWorkflow]:
        """
        Get workflows for a tenant with optional filtering
        """
        
        workflows = []
        
        for workflow in self.active_workflows.values():
            # Check if workflow belongs to tenant (would need to track this)
            # For now, return all workflows with filtering
            
            if status and workflow.status != status:
                continue
            
            if portal and workflow.portal != portal:
                continue
            
            workflows.append(workflow)
        
        return workflows
    
    async def create_task_from_workflow_step(
        self,
        workflow_id: str,
        step_index: int,
        assigned_to: Optional[str] = None
    ) -> Optional[SmartAssistantTask]:
        """
        Create a task from a workflow step
        """
        
        workflow = self.active_workflows.get(workflow_id)
        if not workflow:
            return None
        
        template_key = f"{workflow.portal.value}_{workflow.package.form_type.value}"
        template = self.workflow_templates.get(template_key)
        
        if not template or step_index >= len(template["steps"]):
            return None
        
        step = template["steps"][step_index]
        
        task_id = f"task_{workflow_id}_step_{step_index}"
        
        task = SmartAssistantTask(
            task_id=task_id,
            task_type="workflow_step",
            portal=workflow.portal,
            plant_id=workflow.package.plant_id,
            tenant_id=workflow.package.tenant_id,
            title=step["title"],
            description=step["description"],
            assigned_to=assigned_to or workflow.current_assignee,
            due_date=workflow.deadline,
            priority="high" if step.get("requires_user") else "medium",
            task_data={
                "workflow_id": workflow_id,
                "step_index": step_index,
                "step_type": step["type"],
                "estimated_time": step.get("estimated_time", 10)
            }
        )
        
        return task
    
    async def complete_workflow_step(
        self,
        workflow_id: str,
        step_index: int,
        completion_notes: Optional[str] = None,
        completed_by: Optional[str] = None
    ) -> bool:
        """
        Mark a workflow step as completed
        """
        
        if workflow_id not in self.active_workflows:
            return False
        
        workflow = self.active_workflows[workflow_id]
        
        # Add step to completed list
        if step_index not in workflow.steps_completed:
            workflow.steps_completed.append(step_index)
        
        # Update current step if this was the current one
        if workflow.current_step == step_index + 1:
            workflow.current_step = min(step_index + 2, workflow.total_steps + 1)
        
        # Add completion comment
        message = f"Step {step_index + 1} completed"
        if completion_notes:
            message += f": {completion_notes}"
        
        workflow.comments.append({
            "timestamp": datetime.now().isoformat(),
            "author": completed_by or "system",
            "message": message,
            "type": "step_completion"
        })
        
        # Check if workflow is complete
        if len(workflow.steps_completed) >= workflow.total_steps:
            workflow.status = WorkflowStatus.COMPLETED
            workflow.comments.append({
                "timestamp": datetime.now().isoformat(),
                "author": "system",
                "message": "Workflow completed successfully",
                "type": "workflow_completion"
            })
        
        return True
    
    async def cancel_workflow(
        self,
        workflow_id: str,
        reason: Optional[str] = None,
        cancelled_by: Optional[str] = None
    ) -> bool:
        """
        Cancel a workflow
        """
        
        if workflow_id not in self.active_workflows:
            return False
        
        workflow = self.active_workflows[workflow_id]
        workflow.status = WorkflowStatus.CANCELLED
        
        message = "Workflow cancelled"
        if reason:
            message += f": {reason}"
        
        workflow.comments.append({
            "timestamp": datetime.now().isoformat(),
            "author": cancelled_by or "system",
            "message": message,
            "type": "cancellation"
        })
        
        return True
    
    def get_workflow_statistics(self) -> Dict[str, Any]:
        """
        Get statistics about workflows
        """
        
        total_workflows = len(self.active_workflows)
        
        status_counts = {}
        portal_counts = {}
        
        for workflow in self.active_workflows.values():
            # Count by status
            status = workflow.status
            status_counts[status] = status_counts.get(status, 0) + 1
            
            # Count by portal
            portal = workflow.portal.value
            portal_counts[portal] = portal_counts.get(portal, 0) + 1
        
        return {
            "total_workflows": total_workflows,
            "by_status": status_counts,
            "by_portal": portal_counts,
            "templates_available": len(self.workflow_templates)
        }
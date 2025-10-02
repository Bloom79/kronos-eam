"""
Workflow API endpoints
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func

from app.api import deps
from app.models.user import User
from app.models.workflow import (
    Workflow, WorkflowTemplate, WorkflowStage, WorkflowTask,
    WorkflowStatusEnum, TaskStatusEnum, WorkflowCategoryEnum, WorkflowPhaseEnum, 
    EntityEnum, WorkflowTypeEnum, TaskPriorityEnum
)
from app.models.audit import TipoModificaEnum
from app.core.audit_decorator import audit_action
from app.models.plant import Plant
from app.schemas.workflow import (
    WorkflowCreate, WorkflowUpdate, WorkflowResponse,
    WorkflowTemplateResponse, WorkflowTaskCreate, WorkflowTaskUpdate,
    WorkflowStageCreate, WorkflowListResponse, WorkflowCompositionRequest,
    WorkflowTemplateCreate, WorkflowTemplateUpdate, WorkflowTaskInDB
)
from app.data.renewable_energy_workflow import (
    RENEWABLE_ENERGY_WORKFLOWS,
    get_applicable_workflows
)
from app.data.phase_based_templates import (
    PHASE_BASED_TEMPLATES,
    ALL_PHASE_TEMPLATES,
    get_templates_by_phase,
    get_applicable_phase_templates
)
from app.services.workflow_data_service import WorkflowDataService
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/phases", response_model=List[str])
def get_workflow_phases(
    current_user: User = Depends(deps.get_current_active_user)
) -> List[str]:
    """
    Get all available workflow phases
    """
    return [phase.value for phase in WorkflowPhaseEnum]


@router.get("/templates", response_model=List[WorkflowTemplateResponse])
def get_workflow_templates(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    categoria: Optional[WorkflowCategoryEnum] = None,
    phase: Optional[WorkflowPhaseEnum] = None,
    tipo_impianto: Optional[str] = None,
    power_kw: Optional[float] = None,
    area_vincolata: bool = False
) -> List[WorkflowTemplateResponse]:
    """
    Retrieve workflow templates, optionally filtered by category, plant type, or power
    """
    try:
        # Get templates from database
        query = db.query(WorkflowTemplate).filter(
            WorkflowTemplate.active == True,
            WorkflowTemplate.tenant_id == current_user.tenant_id
        )
        
        if categoria:
            query = query.filter(WorkflowTemplate.category == categoria)
        
        if phase:
            query = query.filter(WorkflowTemplate.phase == phase)
        
        if tipo_impianto:
            query = query.filter(
                or_(
                    WorkflowTemplate.plant_type == tipo_impianto,
                    WorkflowTemplate.plant_type == "Tutti"
                )
            )
        
        if power_kw is not None:
            query = query.filter(
                and_(
                    or_(WorkflowTemplate.min_power == None, WorkflowTemplate.min_power <= power_kw),
                    or_(WorkflowTemplate.max_power == None, WorkflowTemplate.max_power >= power_kw)
                )
            )
        
        templates = query.all()
        
        # If no templates in DB, return hardcoded templates
        if not templates:
            if phase:
                # Use phase-based templates
                applicable = get_applicable_phase_templates(
                    phase=phase,
                    potenza_kw=power_kw or 0,
                    plant_type=tipo_impianto or "Tutti",
                    area_vincolata=area_vincolata
                )
            else:
                # Use traditional complete workflow templates
                applicable = RENEWABLE_ENERGY_WORKFLOWS
                
                if categoria:
                    applicable = [w for w in applicable if 
                        w.get("category", w.get("category")) == categoria.value]
                
                if tipo_impianto and tipo_impianto != "Tutti":
                    applicable = [w for w in applicable if 
                        w.get("plant_type", w.get("plant_type")) in ["Tutti", tipo_impianto]]
                
                if power_kw is not None:
                    applicable = [w for w in applicable if
                        (w.get("min_power", w.get("min_power")) is None or 
                         w.get("min_power", w.get("min_power")) <= power_kw) and
                        (w.get("max_power", w.get("max_power")) is None or 
                         w.get("max_power", w.get("max_power")) >= power_kw)
                    ]
            
            # Convert to response format
            templates = []
            for idx, workflow_data in enumerate(applicable):
                # Properly structure stages with all required fields
                structured_stages = []
                all_tasks = []
                
                for stage in workflow_data.get("stages", []):
                    # Create properly structured stage
                    stage_structured = {
                        "name": stage.get("name", ""),
                        "order": stage.get("order", 0),
                        "duration_days": stage.get("duration_days"),
                        "entity_responsible": stage.get("entity_responsible"),
                        "document_templates": stage.get("document_templates", []),
                        "template_requirements": stage.get("template_requirements", {}),
                        "tasks": []  # Will be populated with task references
                    }
                    
                    # Process tasks for this stage
                    if "tasks" in stage:
                        for task_idx, task in enumerate(stage["tasks"]):
                            task_copy = task.copy()
                            # Add stage reference to task
                            task_copy["stage_name"] = stage.get("name", "")
                            task_copy["stage_order"] = stage.get("order", 0)
                            task_copy["id"] = f"task_{idx}_{stage.get('order', 0)}_{task_idx}"
                            
                            # Ensure task has both name and title
                            if "name" in task_copy and "title" not in task_copy:
                                task_copy["title"] = task_copy["name"]
                            
                            # Add task to flattened list
                            all_tasks.append(task_copy)
                            
                            # Add task reference to stage
                            stage_structured["tasks"].append({
                                "id": task_copy["id"],
                                "title": task_copy.get("title", task_copy.get("name", "")),
                                "responsible_entity": task_copy.get("responsible_entity")
                            })
                    
                    structured_stages.append(stage_structured)
                
                template = WorkflowTemplateResponse(
                    id=idx + 1,
                    name=workflow_data.get("name", ""),
                    description=workflow_data.get("description", ""),
                    category=workflow_data.get("category", WorkflowCategoryEnum.ACTIVATION),
                    phase=workflow_data.get("phase"),
                    plant_type=workflow_data.get("plant_type", "Tutti"),
                    min_power=workflow_data.get("min_power"),
                    max_power=workflow_data.get("max_power"),
                    estimated_duration_days=workflow_data.get("estimated_duration_days", 30),
                    recurrence=workflow_data.get("recurrence", "Una tantum"),
                    stages=structured_stages,  # Use properly structured stages
                    tasks=all_tasks,  # Flattened task list for compatibility
                    required_entities=workflow_data.get("required_entities", []),
                    base_documents=workflow_data.get("base_documents", []),
                    activation_conditions=workflow_data.get("activation_conditions", {}),
                    deadline_config=workflow_data.get("deadline_config", {}),
                    active=True,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                templates.append(template)
        
        return templates
        
    except Exception as e:
        logger.error(f"Error retrieving workflow templates: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/templates/applicable/{impianto_id}")
def get_applicable_templates_for_plant(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    impianto_id: int
) -> List[WorkflowTemplateResponse]:
    """
    Get workflow templates applicable to a specific plant based on its characteristics
    """
    try:
        # Get plant details
        impianto = db.query(Plant).filter(
            Plant.id == impianto_id,
            Plant.tenant_id == current_user.tenant_id
        ).first()
        
        if not impianto:
            raise HTTPException(status_code=404, detail="Plant non trovato")
        
        # Get plant characteristics
        power_kw = impianto.power_kw or 0
        tipo_impianto = impianto.type or "Fotovoltaico"
        stato_impianto = "connesso" if impianto.status == "Attivo" else "non_connesso"
        
        # Get applicable workflows
        applicable = get_applicable_workflows(power_kw, tipo_impianto, stato_impianto)
        
        # Convert to response format
        templates = []
        for idx, workflow_data in enumerate(applicable):
            # Properly structure stages with all required fields
            structured_stages = []
            all_tasks = []
            
            for stage in workflow_data.get("stages", []):
                # Create properly structured stage
                stage_structured = {
                    "name": stage.get("name", ""),
                    "order": stage.get("order", 0),
                    "duration_days": stage.get("duration_days"),
                    "entity_responsible": stage.get("entity_responsible"),
                    "document_templates": stage.get("document_templates", []),
                    "template_requirements": stage.get("template_requirements", {}),
                    "tasks": []  # Will be populated with task references
                }
                
                # Process tasks for this stage
                if "tasks" in stage:
                    for task_idx, task in enumerate(stage["tasks"]):
                        task_copy = task.copy()
                        # Add stage reference to task
                        task_copy["stage_name"] = stage.get("name", "")
                        task_copy["stage_order"] = stage.get("order", 0)
                        task_copy["id"] = f"task_{idx}_{stage.get('order', 0)}_{task_idx}"
                        
                        # Ensure task has both name and title
                        if "name" in task_copy and "title" not in task_copy:
                            task_copy["title"] = task_copy["name"]
                        
                        # Add task to flattened list
                        all_tasks.append(task_copy)
                        
                        # Add task reference to stage
                        stage_structured["tasks"].append({
                            "id": task_copy["id"],
                            "title": task_copy.get("title", task_copy.get("name", "")),
                            "responsible_entity": task_copy.get("responsible_entity")
                        })
                
                structured_stages.append(stage_structured)
            
            template = WorkflowTemplateResponse(
                id=idx + 1000 + impianto_id,  # Unique ID for hardcoded templates
                name=workflow_data.get("name", ""),
                description=workflow_data.get("description", ""),
                category=workflow_data.get("category", WorkflowCategoryEnum.ACTIVATION),
                plant_type=workflow_data.get("plant_type", "Tutti"),
                min_power=workflow_data.get("min_power"),
                max_power=workflow_data.get("max_power"),
                estimated_duration_days=workflow_data.get("estimated_duration_days", 30),
                recurrence=workflow_data.get("recurrence", "Una tantum"),
                stages=structured_stages,  # Use properly structured stages
                tasks=all_tasks,  # Flattened task list for compatibility
                required_entities=workflow_data.get("required_entities", []),
                base_documents=workflow_data.get("base_documents", []),
                activation_conditions=workflow_data.get("activation_conditions", {}),
                deadline_config=workflow_data.get("deadline_config", {}),
                active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            templates.append(template)
        
        return templates
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting applicable templates: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=WorkflowResponse)
def create_workflow(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    workflow_in: WorkflowCreate
) -> WorkflowResponse:
    """
    Create a new workflow from a template or custom definition
    """
    try:
        # Validate plant access
        impianto = db.query(Plant).filter(
            Plant.id == workflow_in.plant_id,
            Plant.tenant_id == current_user.tenant_id
        ).first()
        
        if not impianto:
            raise HTTPException(status_code=404, detail="Plant not found")
        
        # Check if template exists in database
        template_from_db = None
        use_hardcoded_template = False
        actual_template_id = workflow_in.template_id
        
        if workflow_in.template_id:
            template_from_db = db.query(WorkflowTemplate).filter(
                WorkflowTemplate.id == workflow_in.template_id
            ).first()
            
            if not template_from_db:
                # This is a hardcoded template
                use_hardcoded_template = True
                actual_template_id = None  # Don't set foreign key to non-existent template
        
        # Create workflow
        workflow = Workflow(
            name=workflow_in.name,
            plant_id=workflow_in.plant_id,
            plant_name=impianto.name,
            type=workflow_in.type,
            category=workflow_in.category,
            description=workflow_in.description,
            current_status=WorkflowStatusEnum.ACTIVE.value,
            progress=0,
            template_id=actual_template_id,  # Will be None for hardcoded templates
            involved_entities=workflow_in.involved_entities or [],
            plant_power=impianto.power_kw,
            plant_type=impianto.type,
            document_requirements=workflow_in.document_requirements or {},
            config=workflow_in.config or {},
            tenant_id=current_user.tenant_id,
            created_by=current_user.sub,
            updated_by=current_user.sub,
            created_by_role=workflow_in.created_by_role or "administrator"  # Default to administrator
        )
        
        # Add workflow first to get ID
        db.add(workflow)
        db.flush()  # Get the ID without committing
        
        # If template_id provided, load template stages and tasks
        if workflow_in.template_id:
            if use_hardcoded_template:
                # Load from hardcoded templates
                all_templates = RENEWABLE_ENERGY_WORKFLOWS + ALL_PHASE_TEMPLATES
                template_data = None
                
                # The ID for hardcoded templates is its index + 1
                template_idx = workflow_in.template_id - 1
                if 0 <= template_idx < len(all_templates):
                    template_data = all_templates[template_idx]

                if template_data:
                    # Create stages and tasks from template
                    for stage_data in template_data.get("stages", []):
                        stage = WorkflowStage(
                            workflow_id=workflow.id,
                            name=stage_data.get("name", ""),
                            order=stage_data.get("order", 0),
                            duration_days=stage_data.get("duration_days"),
                            entity_responsible=stage_data.get("entity_responsible"),
                            document_templates=stage_data.get("document_templates", []),
                            template_requirements=stage_data.get("template_requirements", {}),
                            tenant_id=current_user.tenant_id
                        )
                        db.add(stage)
                        db.flush()  # Get stage ID for task association
                        
                        # Create tasks for this stage
                        for task_data in stage_data.get("tasks", []):
                            # Create comprehensive task with ALL fields from template
                            task = WorkflowTask(
                                workflow_id=workflow.id,
                                stage_id=stage.id,  # Properly link to stage
                                title=task_data.get("name", ""),
                                description=task_data.get("description", ""),
                                assignee=task_data.get("assignee", task_data.get("responsabile", "")),
                                priority=task_data.get("priority", TaskPriorityEnum.MEDIUM.value),
                                estimated_hours=task_data.get("duration_days", task_data.get("duration_days", 1)) * 8,  # Convert days to hours
                                dependencies=task_data.get("dependencies", task_data.get("dependencies", [])),
                                
                                # Entity and practice fields
                                responsible_entity=task_data.get("responsible_entity", task_data.get("responsible_entity")),
                                practice_type=task_data.get("practice_type", task_data.get("practice_type")),
                                practice_code=task_data.get("practice_code", task_data.get("practice_code")),
                                portal_url=task_data.get("portal_url", task_data.get("portal_url")),
                                portal_login_url=task_data.get("portal_login_url", task_data.get("portal_login_url")),
                                required_credentials=task_data.get("required_credentials", task_data.get("required_credentials")),
                                
                                # Integration and guide
                                integration=task_data.get("integration", task_data.get("integration")),
                                guide_config=task_data.get("guide_config", {}),
                                instructions=task_data.get("instructions", task_data.get("instructions")),
                                checklist_items=task_data.get("checklist_items", task_data.get("checklist_items", [])),
                                external_resources=task_data.get("external_resources", task_data.get("external_resources", [])),
                                
                                # Document management
                                required_documents=task_data.get("required_documents", task_data.get("required_documents", [])),
                                document_templates=task_data.get("document_templates", task_data.get("document_templates", [])),
                                documents_to_generate=task_data.get("documents_to_generate", task_data.get("documents_to_generate", [])),
                                official_form_fields=task_data.get("official_form_fields", task_data.get("official_form_fields", {})),
                                
                                # Process tracking
                                submission_method=task_data.get("submission_method", task_data.get("submission_method")),
                                external_protocol_number=task_data.get("external_protocol_number", task_data.get("external_protocol_number")),
                                
                                # Cost tracking
                                cost_amount=task_data.get("cost_amount", task_data.get("cost_amount")),
                                cost_description=task_data.get("cost_description", task_data.get("cost_description")),
                                payment_method=task_data.get("payment_method", task_data.get("payment_method")),
                                payment_reference=task_data.get("payment_reference", task_data.get("payment_reference")),
                                
                                # Regulatory deadlines
                                regulatory_deadline=task_data.get("regulatory_deadline", task_data.get("regulatory_deadline")),
                                deadline_type=task_data.get("deadline_type", task_data.get("deadline_type")),
                                deadline_consequences=task_data.get("deadline_consequences", task_data.get("deadline_consequences")),
                                
                                # Role management
                                allowed_roles=task_data.get("allowed_roles", task_data.get("allowed_roles", [])),
                                suggested_assignee_role=task_data.get("suggested_assignee_role", task_data.get("suggested_assignee_role")),
                                
                                # Human checkpoint tracking
                                requires_human_auth=task_data.get("requires_human_auth", task_data.get("requires_human_auth", False)),
                                requires_physical_signature=task_data.get("requires_physical_signature", task_data.get("requires_physical_signature", False)),
                                requires_site_inspection=task_data.get("requires_site_inspection", task_data.get("requires_site_inspection", False)),
                                human_checkpoint_notes=task_data.get("human_checkpoint_notes", task_data.get("human_checkpoint_notes")),
                                
                                # Data collection configuration
                                data_fields=task_data.get("data_fields", task_data.get("data_fields", {})),
                                target_table=task_data.get("target_table", task_data.get("target_table")),
                                target_fields=task_data.get("target_fields", task_data.get("target_fields", {})),
                                
                                tenant_id=current_user.tenant_id
                            )
                            db.add(task)
            
            elif template_from_db:
                # Load from database template
                for stage_data in template_from_db.stages:
                    stage = WorkflowStage(
                        workflow_id=workflow.id,
                        name=stage_data.get("name", ""),
                        order=stage_data.get("order", 0),
                        duration_days=stage_data.get("duration_days"),
                        entity_responsible=stage_data.get("entity_responsible"),
                        document_templates=stage_data.get("document_templates", []),
                        template_requirements=stage_data.get("template_requirements", {}),
                        completed=False,
                        tenant_id=current_user.tenant_id
                    )
                    db.add(stage)
                    db.flush()  # Get stage ID for task association
                    
                    # Create tasks for this stage if they exist
                    if "tasks" in stage_data:
                        for task_data in stage_data["tasks"]:
                            task = WorkflowTask(
                                workflow_id=workflow.id,
                                stage_id=stage.id,
                                title=task_data.get("name", ""),
                                description=task_data.get("description", ""),
                                responsible_entity=task_data.get("responsible_entity"),
                                tenant_id=current_user.tenant_id
                            )
                            db.add(task)
        
        # Otherwise create from provided stages/tasks
        elif workflow_in.stages:
            for stage_in in workflow_in.stages:
                stage = WorkflowStage(
                    workflow_id=workflow.id,
                    name=stage_in.name,
                    order=stage_in.order,
                    duration_days=stage_in.duration_days if hasattr(stage_in, 'duration_days') else None,
                    entity_responsible=stage_in.entity_responsible if hasattr(stage_in, 'entity_responsible') else None,
                    document_templates=stage_in.document_templates if hasattr(stage_in, 'document_templates') else [],
                    template_requirements=stage_in.template_requirements if hasattr(stage_in, 'template_requirements') else {},
                    completed=False,
                    tenant_id=current_user.tenant_id
                )
                db.add(stage)
                db.flush()  # Get stage ID for task association
                
                # Create tasks for this stage if provided
                if hasattr(stage_in, 'tasks') and stage_in.tasks:
                    for task_in in stage_in.tasks:
                        task = WorkflowTask(
                            workflow_id=workflow.id,
                            stage_id=stage.id,  # Properly link to stage
                            title=task_in.title,
                            description=task_in.description or task_in.description if hasattr(task_in, 'description') else "",
                            assignee=task_in.assignee if hasattr(task_in, 'assignee') else "",
                            due_date=task_in.due_date if hasattr(task_in, 'dueDate') else None,
                            priority=task_in.priority if hasattr(task_in, 'priority') else TaskPriorityEnum.MEDIUM.value,
                            estimated_hours=task_in.estimated_hours if hasattr(task_in, 'estimatedHours') else None,
                            dependencies=task_in.dependencies if hasattr(task_in, 'dependencies') else [],
                            
                            # Add all other fields with safe access
                            responsible_entity=task_in.responsible_entity if hasattr(task_in, 'responsible_entity') else None,
                            practice_type=task_in.practice_type if hasattr(task_in, 'practice_type') else None,
                            portal_url=task_in.portal_url if hasattr(task_in, 'portal_url') else None,
                            required_credentials=task_in.required_credentials if hasattr(task_in, 'required_credentials') else None,
                            checklist_items=task_in.checklist_items if hasattr(task_in, 'checklist_items') else [],
                            required_documents=task_in.required_documents if hasattr(task_in, 'required_documents') else [],
                            documents_to_generate=task_in.documents_to_generate if hasattr(task_in, 'documents_to_generate') else [],
                            cost_amount=task_in.cost_amount if hasattr(task_in, 'cost_amount') else None,
                            cost_description=task_in.cost_description if hasattr(task_in, 'cost_description') else None,
                            
                            tenant_id=current_user.tenant_id
                        )
                        db.add(task)
        
        # Workflow was already added earlier with db.flush()
        db.commit()
        db.refresh(workflow)
        
        return workflow
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating workflow: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/compose", response_model=WorkflowResponse)
def compose_workflow(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    composition_request: WorkflowCompositionRequest
) -> WorkflowResponse:
    """
    Create a workflow by composing multiple phase-specific templates
    """
    try:
        # Validate plant access
        impianto = db.query(Plant).filter(
            Plant.id == composition_request.plant_id,
            Plant.tenant_id == current_user.tenant_id
        ).first()
        
        if not impianto:
            raise HTTPException(status_code=404, detail="Plant non trovato")
        
        # Create main workflow
        workflow = Workflow(
            name=composition_request.name,
            plant_id=composition_request.plant_id,
            plant_name=impianto.name,
            type="Composto",
            category=WorkflowCategoryEnum.ACTIVATION,
            description=composition_request.description or f"Workflow composto per {impianto.name}",
            current_status=WorkflowStatusEnum.ACTIVE.value,
            progress=0,
            involved_entities=composition_request.involved_entities or [],
            plant_power=impianto.power_kw,
            plant_type=impianto.type,
            document_requirements={},
            config={"composed": True, "phase_templates": composition_request.phase_templates},
            tenant_id=current_user.tenant_id,
            created_by=current_user.sub,
            updated_by=current_user.sub
        )
        
        db.add(workflow)
        db.flush()  # Get the workflow ID
        
        # Load and combine templates for each phase
        stage_order = 1
        all_enti = set()
        
        # Define phase order
        phase_order = [
            WorkflowPhaseEnum.DESIGN,
            WorkflowPhaseEnum.CONNECTION,
            WorkflowPhaseEnum.REGISTRATION,
            WorkflowPhaseEnum.FISCAL
        ]
        
        for phase in phase_order:
            phase_key = phase.value
            if phase_key not in composition_request.phase_templates:
                continue
                
            template_id = composition_request.phase_templates[phase_key]
            
            # Get template (try DB first, then hardcoded)
            template = db.query(WorkflowTemplate).filter(
                WorkflowTemplate.id == template_id
            ).first()
            
            template_data = None
            if template:
                # Use DB template
                template_data = {
                    "nome": template.name,
                    "stages": template.stages,
                    "tasks": template.tasks,
                    "enti_richiesti": template.required_entities
                }
            else:
                # Check hardcoded phase templates
                phase_templates = get_templates_by_phase(phase)
                if template_id - 1000 < len(phase_templates):
                    template_data = phase_templates[template_id - 1000]
            
            if not template_data:
                raise HTTPException(
                    status_code=404, 
                    detail=f"Template {template_id} per fase {phase_key} non trovato"
                )
            
            # Add entities from this phase
            all_enti.update(template_data.get("required_entities", []))
            
            # Create stages for this phase
            for stage_data in template_data.get("stages", []):
                stage = WorkflowStage(
                    workflow=workflow,
                    name=f"{phase_key}: {stage_data.get('name', '')}",
                    order=stage_order,
                    duration_days=stage_data.get("duration_days", 10)
                )
                db.add(stage)
                db.flush()  # Get stage ID
                
                # Create tasks for this stage
                for task_data in stage_data.get("tasks", []):
                    task = WorkflowTask(
                        workflow=workflow,
                        stage=stage,
                        title=task_data.get("name", ""),
                        description=task_data.get("description", ""),
                        assignee=composition_request.task_assignments.get(task_data.get("name", "")) if composition_request.task_assignments else None,
                        priority=TaskPriorityEnum.MEDIUM,
                        estimated_hours=task_data.get("duration_days", 1) * 8,
                        responsible_entity=task_data.get("responsible_entity"),
                        practice_type=task_data.get("practice_type"),
                        portal_url=task_data.get("portal_url"),
                        required_credentials=task_data.get("required_credentials"),
                        guide_config=task_data.get("guide_config", {}),
                        dependencies=task_data.get("dependencies", [])
                    )
                    db.add(task)
                
                stage_order += 1
        
        # Update workflow with all entities
        workflow.involved_entities = list(all_enti)
        
        db.commit()
        
        # Reload with relationships
        db.refresh(workflow)
        
        # Build response
        return WorkflowResponse(
            id=workflow.id,
            name=workflow.name,
            plant_id=workflow.plant_id,
            plant_name=workflow.plant_name,
            type=workflow.type,
            category=workflow.category,
            description=workflow.description,
            current_status=workflow.current_status.value if workflow.current_status else None,
            progress=workflow.progress,
            created_at=workflow.created_at,
            updated_at=workflow.updated_at,
            due_date=composition_request.due_date,
            involved_entities=workflow.involved_entities,
            plant_power=workflow.plant_power,
            plant_type=workflow.plant_type,
            document_requirements=workflow.document_requirements,
            integration_status={},
            stages=[],  # Will be populated by separate query if needed
            tasks=[]    # Will be populated by separate query if needed
        )
        
    except Exception as e:
        logger.error(f"Error composing workflow: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=WorkflowListResponse)
def get_workflows(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    skip: int = 0,
    limit: int = 100,
    impianto_id: Optional[int] = None,
    stato: Optional[WorkflowStatusEnum] = None,
    categoria: Optional[WorkflowCategoryEnum] = None,
    search: Optional[str] = None
) -> WorkflowListResponse:
    """
    Retrieve workflows with optional filtering
    """
    try:
        query = db.query(Workflow).options(
            joinedload(Workflow.stages),
            joinedload(Workflow.tasks).joinedload(WorkflowTask.stage)
        ).filter(
            Workflow.tenant_id == current_user.tenant_id
        )
        
        if impianto_id:
            query = query.filter(Workflow.plant_id == impianto_id)
        
        if stato:
            query = query.filter(Workflow.current_status == stato)
        
        if categoria:
            query = query.filter(Workflow.category == categoria)
        
        if search:
            query = query.filter(
                or_(
                    Workflow.name.ilike(f"%{search}%"),
                    Workflow.plant_name.ilike(f"%{search}%")
                )
            )
        
        total = query.count()
        workflows = query.offset(skip).limit(limit).all()
        
        return WorkflowListResponse(
            items=workflows,
            total=total,
            skip=skip,
            limit=limit
        )
        
    except Exception as e:
        logger.error(f"Error retrieving workflows: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{workflow_id}", response_model=WorkflowResponse)
def get_workflow(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    workflow_id: int
) -> WorkflowResponse:
    """
    Get specific workflow by ID
    """
    try:
        workflow = db.query(Workflow).options(
            joinedload(Workflow.stages),
            joinedload(Workflow.tasks).joinedload(WorkflowTask.stage)
        ).filter(
            Workflow.id == workflow_id,
            Workflow.tenant_id == current_user.tenant_id
        ).first()
        
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow non trovato")
        
        return workflow
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving workflow: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{workflow_id}", response_model=WorkflowResponse)
def update_workflow(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    workflow_id: int,
    workflow_in: WorkflowUpdate
) -> WorkflowResponse:
    """
    Update workflow
    """
    try:
        workflow = db.query(Workflow).filter(
            Workflow.id == workflow_id,
            Workflow.tenant_id == current_user.tenant_id
        ).first()
        
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow non trovato")
        
        # Update fields
        update_data = workflow_in.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(workflow, field, value)
        
        workflow.updated_by = current_user.sub
        workflow.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(workflow)
        
        return workflow
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating workflow: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{workflow_id}/tasks", response_model=WorkflowResponse)
def create_workflow_task(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    workflow_id: int,
    task_in: WorkflowTaskCreate
) -> WorkflowResponse:
    """
    Add a new task to a workflow
    """
    try:
        workflow = db.query(Workflow).filter(
            Workflow.id == workflow_id,
            Workflow.tenant_id == current_user.tenant_id
        ).first()
        
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow non trovato")
        
        # Create task
        task = WorkflowTask(
            workflow_id=workflow_id,
            stage_id=task_in.stage_id,
            title=task_in.title,
            description=task_in.description,
            assignee=task_in.assignee,
            due_date=task_in.due_date,
            priority=task_in.priority,
            estimated_hours=task_in.estimated_hours,
            responsible_entity=task_in.responsible_entity,
            practice_type=task_in.practice_type,
            portal_url=task_in.portal_url,
            tenant_id=current_user.tenant_id
        )
        
        db.add(task)
        db.commit()
        db.refresh(workflow)
        
        return workflow
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating task: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/tasks/{task_id}", response_model=WorkflowResponse)
def update_workflow_task(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    task_id: int,
    task_in: WorkflowTaskUpdate
) -> WorkflowResponse:
    """
    Update a workflow task
    """
    try:
        task = db.query(WorkflowTask).join(Workflow).filter(
            WorkflowTask.id == task_id,
            Workflow.tenant_id == current_user.tenant_id
        ).first()
        
        if not task:
            raise HTTPException(status_code=404, detail="Task non trovato")
        
        # Update fields
        update_data = task_in.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(task, field, value)
        
        # Handle completion
        if task_in.status == TaskStatusEnum.COMPLETED.value and not task.completed_date:
            task.completed_by = current_user.email
            task.completed_date = datetime.utcnow()
            
            # Update workflow progress
            workflow = task.workflow
            total_tasks = len(workflow.tasks)
            completed_tasks = sum(1 for t in workflow.tasks if t.status == TaskStatusEnum.COMPLETED.value)
            workflow.progress = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
            
            # Check if workflow is complete
            if workflow.progress == 100:
                workflow.current_status = WorkflowStatusEnum.COMPLETED.value
                workflow.completion_date = datetime.utcnow()
        
        db.commit()
        db.refresh(task.workflow)
        
        return task.workflow
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating task: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats/dashboard")
def get_workflow_stats(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> dict:
    """
    Get workflow statistics for dashboard
    """
    try:
        # Get workflow counts by status
        active_count = db.query(Workflow).filter(
            Workflow.tenant_id == current_user.tenant_id,
            Workflow.current_status == WorkflowStatusEnum.ACTIVE.value
        ).count()
        
        completed_count = db.query(Workflow).filter(
            Workflow.tenant_id == current_user.tenant_id,
            Workflow.current_status == WorkflowStatusEnum.COMPLETED.value
        ).count()
        
        # Get task counts - filter by workflow's tenant_id
        overdue_tasks = db.query(WorkflowTask).join(Workflow).filter(
            Workflow.tenant_id == current_user.tenant_id,
            WorkflowTask.status == TaskStatusEnum.DELAYED.value
        ).count()
        
        in_progress_tasks = db.query(WorkflowTask).join(Workflow).filter(
            Workflow.tenant_id == current_user.tenant_id,
            WorkflowTask.status == TaskStatusEnum.IN_PROGRESS.value
        ).count()
        
        # Get workflows by category
        by_category = db.query(
            Workflow.category,
            func.count(Workflow.id).label('count')
        ).filter(
            Workflow.tenant_id == current_user.tenant_id
        ).group_by(Workflow.category).all()
        
        return {
            "active_workflows": active_count,
            "completed_workflows": completed_count,
            "overdue_tasks": overdue_tasks,
            "in_progress_tasks": in_progress_tasks,
            "by_category": {cat.value if cat else "None": count for cat, count in by_category} if by_category else {}
        }
        
    except Exception as e:
        logger.error(f"Error getting workflow stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{workflow_id}/copy", response_model=WorkflowResponse)
@audit_action("workflow", TipoModificaEnum.CREAZIONE)
def copy_workflow(
    workflow_id: int,
    nome: Optional[str] = Body(None),
    target_impianto_id: Optional[int] = Body(None),
    copy_tasks: bool = Body(True),
    copy_documents: bool = Body(False),
    customizations: Optional[Dict[str, Any]] = Body(None),
    note: Optional[str] = Body(None),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Create a copy of an existing workflow"""
    from app.services.workflow_service import WorkflowService
    
    service = WorkflowService(db)
    
    try:
        workflow = service.copy_workflow(
            workflow_id=workflow_id,
            user_id=current_user.id,
            tenant_id=current_user.tenant_id,
            name=nome,
            target_impianto_id=target_impianto_id,
            copy_tasks=copy_tasks,
            copy_documents=copy_documents,
            customizations=customizations,
            notes=note
        )
        
        return workflow
    
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/{parent_workflow_id}/sub-workflow", response_model=WorkflowResponse)
@audit_action("workflow", TipoModificaEnum.CREAZIONE)
def create_sub_workflow(
    parent_workflow_id: int,
    nome: str = Body(...),
    categoria: Optional[WorkflowCategoryEnum] = Body(None),
    descrizione: Optional[str] = Body(None),
    template_id: Optional[int] = Body(None),
    tipo_workflow: WorkflowTypeEnum = Body(WorkflowTypeEnum.CUSTOM),
    config: Optional[Dict[str, Any]] = Body(None),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Create a sub-workflow linked to a parent workflow"""
    from app.services.workflow_service import WorkflowService
    
    service = WorkflowService(db)
    
    try:
        workflow = service.create_sub_workflow(
            parent_workflow_id=parent_workflow_id,
            name=nome,
            user_id=current_user.id,
            tenant_id=current_user.tenant_id,
            category=categoria,
            description=descrizione,
            template_id=template_id,
            tipo_workflow=tipo_workflow,
            config=config
        )
        
        return workflow
    
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{workflow_id}/hierarchy")
def get_workflow_hierarchy(
    workflow_id: int,
    include_siblings: bool = Query(False),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Get complete workflow hierarchy (parent, siblings, children)"""
    from app.services.workflow_service import WorkflowService
    
    service = WorkflowService(db)
    
    try:
        hierarchy = service.get_workflow_hierarchy(
            workflow_id=workflow_id,
            tenant_id=current_user.tenant_id,
            include_siblings=include_siblings
        )
        
        return hierarchy
    
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{workflow_id}/copies", response_model=List[Dict[str, Any]])
def get_workflow_copies(
    workflow_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Get all copies of a workflow"""
    from app.services.workflow_service import WorkflowService
    
    service = WorkflowService(db)
    
    copies = service.get_workflow_copies(
        workflow_id=workflow_id,
        tenant_id=current_user.tenant_id
    )
    
    return copies


@router.post("/merge", response_model=WorkflowResponse)
@audit_action("workflow", TipoModificaEnum.CREAZIONE)
def merge_workflows(
    workflow_ids: List[int] = Body(...),
    nome: str = Body(...),
    descrizione: Optional[str] = Body(None),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Merge multiple workflows into a composite workflow"""
    from app.services.workflow_service import WorkflowService
    
    service = WorkflowService(db)
    
    try:
        workflow = service.merge_workflows(
            workflow_ids=workflow_ids,
            name=nome,
            user_id=current_user.id,
            tenant_id=current_user.tenant_id,
            description=descrizione
        )
        
        return workflow
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{sub_workflow_id}/update-parent-progress")
def update_sub_workflow_progress(
    sub_workflow_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Update parent workflow when sub-workflow progresses"""
    from app.services.workflow_service import WorkflowService
    
    service = WorkflowService(db)
    
    service.update_sub_workflow_progress(
        sub_workflow_id=sub_workflow_id,
        tenant_id=current_user.tenant_id
    )
    
    return {"message": "Parent workflow updated successfully"}


# Document Template Endpoints

@router.get("/templates/{template_id}/documents", response_model=List[Dict[str, Any]])
def get_workflow_document_templates(
    template_id: int,
    task_nome: Optional[str] = Query(None),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Get document templates associated with a workflow template"""
    from app.services.document_service import DocumentService
    
    service = DocumentService(db)
    
    templates = service.get_workflow_document_templates(
        workflow_template_id=template_id,
        task_name=task_nome,
        tenant_id=current_user.tenant_id
    )
    
    return [
        {
            "id": t.id,
            "document_template_id": t.document_template_id,
            "document_template": {
                "id": t.document_template.id,
                "nome": t.document_template.name,
                "descrizione": t.document_template.description,
                "categoria": t.document_template.category,
                "tipo": t.document_template.template_type,
                "variables": t.document_template.variables
            } if t.document_template else None,
            "task_nome": t.task_name,
            "is_required": t.is_required,
            "output_formats": t.output_formats,
            "auto_generate": t.auto_generate
        }
        for t in templates
    ]


@router.post("/{workflow_id}/documents/generate")
def generate_document_from_template(
    workflow_id: int,
    template_id: int = Body(...),
    data: Dict[str, Any] = Body(...),
    output_format: str = Body(..., pattern="^(pdf|docx)$"),
    task_id: Optional[int] = Body(None),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Generate a document from a workflow template"""
    from app.services.document_service import DocumentService
    
    # Get workflow to verify access and get impianto_id
    workflow = db.query(Workflow).filter(
        Workflow.id == workflow_id,
        Workflow.tenant_id == current_user.tenant_id
    ).first()
    
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    service = DocumentService(db)
    
    try:
        document = service.generate_from_template(
            template_id=template_id,
            data=data,
            output_format=output_format,
            user_id=current_user.id,
            tenant_id=current_user.tenant_id,
            workflow_id=workflow_id,
            task_id=task_id,
            plant_id=workflow.plant_id
        )
        
        return {
            "id": document.id,
            "name": document.name,
            "description": document.description,
            "type": document.type,
            "file_path": document.file_path,
            "download_url": f"/api/v1/documents/{document.id}/download"
        }
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error generating document: {str(e)}")
        raise HTTPException(status_code=500, detail="Error generating document")


@router.get("/{workflow_id}/documents/preview")
def preview_document_template(
    workflow_id: int,
    template_id: int = Query(...),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Preview fields required for a document template"""
    from app.services.document_service import DocumentService
    
    # Verify workflow access
    workflow = db.query(Workflow).filter(
        Workflow.id == workflow_id,
        Workflow.tenant_id == current_user.tenant_id
    ).first()
    
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    service = DocumentService(db)
    
    try:
        placeholders = service.get_template_placeholders(
            template_id=template_id,
            tenant_id=current_user.tenant_id
        )
        
        # Add workflow and plant data that will be auto-filled
        auto_filled = {
            "workflow": {
                "nome": workflow.name,
                "tipo": workflow.type,
                "stato": workflow.current_status
            }
        }
        
        if workflow.impianto:
            auto_filled["impianto"] = {
                "nome": workflow.impianto.name,
                "tipo": workflow.impianto.type,
                "power_kw": workflow.impianto.power_kw,
                "indirizzo": workflow.impianto.address,
                "comune": workflow.impianto.municipality,
                "provincia": workflow.impianto.province
            }
        
        return {
            "required_fields": placeholders,
            "auto_filled_fields": auto_filled,
            "available_formats": ["pdf", "docx"]
        }
    
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/templates", response_model=WorkflowTemplateResponse)
@audit_action(TipoModificaEnum.CREAZIONE, "Template Workflow")
def create_workflow_template(
    *,
    db: Session = Depends(deps.get_db),
    template_in: WorkflowTemplateCreate,
    current_user: User = Depends(deps.get_current_active_user)
) -> WorkflowTemplateResponse:
    """
    Create a new workflow template
    """
    template = WorkflowTemplate(
        **template_in.dict(),
        tenant_id=current_user.tenant_id
    )
    db.add(template)
    db.commit()
    db.refresh(template)
    return template


@router.get("/templates/{template_id}", response_model=WorkflowTemplateResponse)
def get_workflow_template(
    *,
    db: Session = Depends(deps.get_db),
    template_id: int,
    current_user: User = Depends(deps.get_current_active_user)
) -> WorkflowTemplateResponse:
    """
    Get a specific workflow template by ID
    """
    # First try to get from database
    template = db.query(WorkflowTemplate).filter(
        WorkflowTemplate.id == template_id,
        WorkflowTemplate.tenant_id == current_user.tenant_id
    ).first()
    
    if template:
        return template
    
    # If not in database, check hardcoded templates
    all_templates = RENEWABLE_ENERGY_WORKFLOWS + ALL_PHASE_TEMPLATES
    
    for idx, workflow_data in enumerate(all_templates):
        if idx + 1 == template_id:  # IDs start from 1
            # Extract all tasks from stages and normalize field names
            all_tasks = []
            normalized_stages = []
            
            for stage in workflow_data.get("stages", []):
                # Copy stage as-is (should already have English field names)
                stage_copy = stage.copy()
                
                # Normalize tasks within the stage
                normalized_tasks = []
                if "tasks" in stage:
                    for task in stage["tasks"]:
                        # Add stage reference to each task
                        task_copy = task.copy()
                        task_copy["stage_name"] = stage.get("name", "")
                        task_copy["id"] = f"task_{idx}_{len(all_tasks)}"
                        # Ensure task has both name and title (should already be in English)
                        if "name" in task_copy and "title" not in task_copy:
                            task_copy["title"] = task_copy["name"]
                        all_tasks.append(task_copy)
                        normalized_tasks.append(task_copy)
                
                stage_copy["tasks"] = normalized_tasks
                normalized_stages.append(stage_copy)
            
            return WorkflowTemplateResponse(
                id=template_id,
                name=workflow_data.get("name", ""),
                description=workflow_data.get("description", ""),
                category=workflow_data.get("category", WorkflowCategoryEnum.ACTIVATION),
                phase=workflow_data.get("phase"),
                plant_type=workflow_data.get("plant_type", "Tutti"),
                min_power=workflow_data.get("min_power"),
                max_power=workflow_data.get("max_power"),
                estimated_duration_days=workflow_data.get("estimated_duration_days", 30),
                recurrence=workflow_data.get("recurrence", "Una tantum"),
                stages=normalized_stages,
                tasks=all_tasks,
                required_entities=workflow_data.get("required_entities", []),
                base_documents=workflow_data.get("base_documents", []),
                activation_conditions=workflow_data.get("activation_conditions", {}),
                deadline_config=workflow_data.get("deadline_config", {}),
                active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
    
    raise HTTPException(status_code=404, detail="Template not found")


@router.put("/templates/{template_id}", response_model=WorkflowTemplateResponse)
@audit_action(TipoModificaEnum.AGGIORNAMENTO, "Template Workflow")
def update_workflow_template(
    *,
    db: Session = Depends(deps.get_db),
    template_id: int,
    template_in: WorkflowTemplateUpdate,
    current_user: User = Depends(deps.get_current_active_user)
) -> WorkflowTemplateResponse:
    """
    Update a workflow template
    """
    template = db.query(WorkflowTemplate).filter(
        WorkflowTemplate.id == template_id,
        WorkflowTemplate.tenant_id == current_user.tenant_id
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    update_data = template_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(template, field, value)
    
    db.commit()
    db.refresh(template)
    return template


@router.delete("/templates/{template_id}")
@audit_action(TipoModificaEnum.ELIMINAZIONE, "Template Workflow")
def delete_workflow_template(
    *,
    db: Session = Depends(deps.get_db),
    template_id: int,
    current_user: User = Depends(deps.get_current_active_user)
) -> Dict[str, str]:
    """
    Delete a workflow template
    """
    template = db.query(WorkflowTemplate).filter(
        WorkflowTemplate.id == template_id,
        WorkflowTemplate.tenant_id == current_user.tenant_id
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Check if template is in use
    workflows_using_template = db.query(Workflow).filter(
        Workflow.template_id == template_id
    ).count()
    
    if workflows_using_template > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete template. It is being used by {workflows_using_template} workflows"
        )
    
    db.delete(template)
    db.commit()
    
    return {"message": "Template deleted successfully"}


@router.post("/tasks/{task_id}/complete")
def complete_workflow_task(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    task_id: int,
    form_data: Dict[str, Any] = Body(...)
) -> Dict[str, Any]:
    """
    Complete a workflow task and update associated plant data
    """
    service = WorkflowDataService(db)
    
    try:
        task = service.complete_task(
            task_id=task_id,
            user_id=current_user.id,
            form_data=form_data,
            tenant_id=current_user.tenant_id
        )
        
        return {
            "message": "Task completed successfully",
            "task": {
                "id": task.id,
                "title": task.title,
                "status": task.status.value if task.status else None,
                "completed_by": task.completed_by,
                "completed_date": task.completed_date.isoformat() if task.completed_date else None
            },
            "workflow_progress": task.workflow.progress if task.workflow else 0
        }
        
    except Exception as e:
        logger.error(f"Error completing task: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/users/me/tasks", response_model=List[WorkflowTaskInDB])
def get_my_tasks(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    status: Optional[TaskStatusEnum] = Query(None),
    limit: int = Query(50, le=100)
) -> List[WorkflowTaskInDB]:
    """
    Get tasks assigned to the current user
    """
    service = WorkflowDataService(db)
    
    tasks = service.get_user_tasks(
        user_id=current_user.id,
        tenant_id=current_user.tenant_id,
        status=status,
        limit=limit
    )
    
    return tasks


@router.get("/plants/{plant_id}/workflow-data")
def get_plant_workflow_data(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    plant_id: int
) -> Dict[str, Any]:
    """
    Get all workflow-collected data for a plant
    """
    service = WorkflowDataService(db)
    
    try:
        data = service.get_plant_workflow_data(
            plant_id=plant_id,
            tenant_id=current_user.tenant_id
        )
        return data
        
    except Exception as e:
        logger.error(f"Error getting plant workflow data: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))

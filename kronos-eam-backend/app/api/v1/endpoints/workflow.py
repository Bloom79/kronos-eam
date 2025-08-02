"""
Workflow API endpoints
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
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
    potenza_kw: Optional[float] = None,
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
        
        if potenza_kw is not None:
            query = query.filter(
                and_(
                    or_(WorkflowTemplate.min_power == None, WorkflowTemplate.min_power <= potenza_kw),
                    or_(WorkflowTemplate.max_power == None, WorkflowTemplate.max_power >= potenza_kw)
                )
            )
        
        templates = query.all()
        
        # If no templates in DB, return hardcoded templates
        if not templates:
            if phase:
                # Use phase-based templates
                applicable = get_applicable_phase_templates(
                    phase=phase,
                    potenza_kw=potenza_kw or 0,
                    tipo_impianto=tipo_impianto or "Tutti",
                    area_vincolata=area_vincolata
                )
            else:
                # Use traditional complete workflow templates
                applicable = RENEWABLE_ENERGY_WORKFLOWS
                
                if categoria:
                    applicable = [w for w in applicable if w.get("categoria") == categoria.value]
                
                if tipo_impianto and tipo_impianto != "Tutti":
                    applicable = [w for w in applicable if w.get("tipo_impianto") in ["Tutti", tipo_impianto]]
                
                if potenza_kw is not None:
                    applicable = [w for w in applicable if
                        (w.get("potenza_minima") is None or w["potenza_minima"] <= potenza_kw) and
                        (w.get("potenza_massima") is None or w["potenza_massima"] >= potenza_kw)
                    ]
            
            # Convert to response format
            templates = []
            for idx, workflow_data in enumerate(applicable):
                # Extract all tasks from stages
                all_tasks = []
                for stage in workflow_data.get("stages", []):
                    if "tasks" in stage:
                        for task in stage["tasks"]:
                            # Add stage reference to each task
                            task_copy = task.copy()
                            task_copy["stage_nome"] = stage.get("nome", "")
                            task_copy["id"] = f"task_{idx}_{len(all_tasks)}"
                            all_tasks.append(task_copy)
                
                template = WorkflowTemplateResponse(
                    id=idx + 1,
                    nome=workflow_data["nome"],
                    descrizione=workflow_data.get("descrizione", ""),
                    categoria=workflow_data.get("categoria", WorkflowCategoryEnum.ACTIVATION),
                    phase=workflow_data.get("phase"),
                    tipo_impianto=workflow_data.get("tipo_impianto", "Tutti"),
                    potenza_minima=workflow_data.get("potenza_minima"),
                    potenza_massima=workflow_data.get("potenza_massima"),
                    durata_stimata_giorni=workflow_data.get("durata_stimata_giorni", 30),
                    ricorrenza=workflow_data.get("ricorrenza", "Una tantum"),
                    stages=workflow_data.get("stages", []),
                    tasks=all_tasks,
                    enti_richiesti=workflow_data.get("enti_richiesti", []),
                    documenti_base=workflow_data.get("documenti_base", []),
                    condizioni_attivazione=workflow_data.get("condizioni_attivazione", {}),
                    scadenza_config=workflow_data.get("scadenza_config", {}),
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
        potenza_kw = impianto.potenza_kw or 0
        tipo_impianto = impianto.type or "Fotovoltaico"
        stato_impianto = "connesso" if impianto.status == "Attivo" else "non_connesso"
        
        # Get applicable workflows
        applicable = get_applicable_workflows(potenza_kw, tipo_impianto, stato_impianto)
        
        # Convert to response format
        templates = []
        for idx, workflow_data in enumerate(applicable):
            template = WorkflowTemplateResponse(
                id=idx + 1000 + impianto_id,  # Unique ID for hardcoded templates
                nome=workflow_data["nome"],
                descrizione=workflow_data.get("descrizione", ""),
                categoria=workflow_data.get("categoria", WorkflowCategoryEnum.ACTIVATION),
                tipo_impianto=workflow_data.get("tipo_impianto", "Tutti"),
                potenza_minima=workflow_data.get("potenza_minima"),
                potenza_massima=workflow_data.get("potenza_massima"),
                durata_stimata_giorni=workflow_data.get("durata_stimata_giorni", 30),
                ricorrenza=workflow_data.get("ricorrenza", "Una tantum"),
                stages=workflow_data.get("stages", []),
                tasks=workflow_data.get("stages", []),
                enti_richiesti=workflow_data.get("enti_richiesti", []),
                documenti_base=workflow_data.get("documenti_base", []),
                condizioni_attivazione=workflow_data.get("condizioni_attivazione", {}),
                scadenza_config=workflow_data.get("scadenza_config", {}),
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
            Plant.id == workflow_in.impianto_id,
            Plant.tenant_id == current_user.tenant_id
        ).first()
        
        if not impianto:
            raise HTTPException(status_code=404, detail="Plant non trovato")
        
        # Create workflow
        workflow = Workflow(
            nome=workflow_in.name,
            impianto_id=workflow_in.impianto_id,
            impiantoNome=impianto.name,
            tipo=workflow_in.type,
            categoria=workflow_in.categoria,
            descrizione=workflow_in.description,
            current_status=WorkflowStatusEnum.ACTIVE.value,
            progresso=0,
            template_id=workflow_in.template_id,
            enti_coinvolti=workflow_in.enti_coinvolti or [],
            potenza_impianto=impianto.potenza_kw,
            tipo_impianto=impianto.type,
            requisiti_documenti=workflow_in.requisiti_documenti or {},
            config=workflow_in.config or {},
            tenant_id=current_user.tenant_id,
            created_by=current_user.sub,
            updated_by=current_user.sub,
            created_by_role=workflow_in.created_by_role or "administrator"  # Default to administrator
        )
        
        # If template_id provided, load template stages and tasks
        if workflow_in.template_id:
            # Try to load from database
            template = db.query(WorkflowTemplate).filter(
                WorkflowTemplate.id == workflow_in.template_id
            ).first()
            
            # If not in DB, check hardcoded templates
            if not template and workflow_in.template_id >= 1000:
                # This is a hardcoded template
                template_idx = (workflow_in.template_id - 1000) % len(RENEWABLE_ENERGY_WORKFLOWS)
                if 0 <= template_idx < len(RENEWABLE_ENERGY_WORKFLOWS):
                    template_data = RENEWABLE_ENERGY_WORKFLOWS[template_idx]
                    
                    # Create stages and tasks from template
                    for stage_data in template_data.get("stages", []):
                        stage = WorkflowStage(
                            workflow=workflow,
                            nome=stage_data["nome"],
                            ordine=stage_data["ordine"],
                            tenant_id=current_user.tenant_id
                        )
                        workflow.stages.append(stage)
                        
                        # Create tasks for this stage
                        for task_data in stage_data.get("tasks", []):
                            task = WorkflowTask(
                                workflow=workflow,
                                stage=stage,
                                title=task_data["nome"],
                                descrizione=task_data.get("descrizione", ""),
                                assignee=task_data.get("responsabile", ""),
                                priority=task_data.get("priorita", "Media"),
                                estimatedHours=task_data.get("durata_giorni", 1) * 8,  # Convert days to hours
                                dipendenze=task_data.get("dipendenze", []),
                                ente_responsabile=task_data.get("ente_responsabile"),
                                tipo_pratica=task_data.get("tipo_pratica"),
                                url_portale=task_data.get("url_portale"),
                                credenziali_richieste=task_data.get("credenziali_richieste"),
                                integrazione=task_data.get("integrazione"),
                                guide_config=task_data.get("guide_config", {}),
                                tenant_id=current_user.tenant_id
                            )
                            workflow.tasks.append(task)
            
            elif template:
                # Load from database template
                for stage_data in template.stages:
                    stage = WorkflowStage(
                        workflow=workflow,
                        nome=stage_data["nome"],
                        ordine=stage_data["ordine"],
                        tenant_id=current_user.tenant_id
                    )
                    workflow.stages.append(stage)
        
        # Otherwise create from provided stages/tasks
        elif workflow_in.stages:
            for stage_in in workflow_in.stages:
                stage = WorkflowStage(
                    workflow=workflow,
                    nome=stage_in.nome,
                    ordine=stage_in.ordine,
                    tenant_id=current_user.tenant_id
                )
                workflow.stages.append(stage)
                
                # Create tasks for this stage if provided
                if hasattr(stage_in, 'tasks') and stage_in.tasks:
                    for task_in in stage_in.tasks:
                        task = WorkflowTask(
                            workflow=workflow,
                            stage=stage,
                            title=task_in.title,
                            descrizione=task_in.descrizione,
                            assignee=task_in.assignee,
                            dueDate=task_in.dueDate,
                            priority=task_in.priority,
                            estimatedHours=task_in.estimatedHours,
                            tenant_id=current_user.tenant_id
                        )
                        workflow.tasks.append(task)
        
        db.add(workflow)
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
            Plant.id == composition_request.impianto_id,
            Plant.tenant_id == current_user.tenant_id
        ).first()
        
        if not impianto:
            raise HTTPException(status_code=404, detail="Plant non trovato")
        
        # Create main workflow
        workflow = Workflow(
            nome=composition_request.nome,
            impianto_id=composition_request.impianto_id,
            impiantoNome=impianto.name,
            tipo="Composto",
            categoria=WorkflowCategoryEnum.ATTIVAZIONE,
            descrizione=composition_request.description or f"Workflow composto per {impianto.name}",
            current_status=WorkflowStatusEnum.ACTIVE.value,
            progresso=0,
            enti_coinvolti=composition_request.enti_coinvolti or [],
            potenza_impianto=impianto.potenza_kw,
            tipo_impianto=impianto.type,
            requisiti_documenti={},
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
            WorkflowPhaseEnum.PROGETTAZIONE,
            WorkflowPhaseEnum.CONNESSIONE,
            WorkflowPhaseEnum.REGISTRAZIONE,
            WorkflowPhaseEnum.FISCALE
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
                    "nome": template.nome,
                    "stages": template.stages,
                    "tasks": template.tasks,
                    "enti_richiesti": template.enti_richiesti
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
            all_enti.update(template_data.get("enti_richiesti", []))
            
            # Create stages for this phase
            for stage_data in template_data.get("stages", []):
                stage = WorkflowStage(
                    workflow=workflow,
                    nome=f"{phase_key}: {stage_data.get('nome', '')}",
                    ordine=stage_order,
                    durata_giorni=stage_data.get("durata_giorni", 10)
                )
                db.add(stage)
                db.flush()  # Get stage ID
                
                # Create tasks for this stage
                for task_data in stage_data.get("tasks", []):
                    task = WorkflowTask(
                        workflow=workflow,
                        stage=stage,
                        title=task_data.get("nome", ""),
                        descrizione=task_data.get("descrizione", ""),
                        assignee=composition_request.task_assignments.get(task_data.get("nome", "")) if composition_request.task_assignments else None,
                        priority=TaskPriorityEnum.MEDIUM,
                        estimatedHours=task_data.get("durata_giorni", 1) * 8,
                        ente_responsabile=task_data.get("ente_responsabile"),
                        tipo_pratica=task_data.get("tipo_pratica"),
                        url_portale=task_data.get("url_portale"),
                        credenziali_richieste=task_data.get("credenziali_richieste"),
                        guide_config=task_data.get("guide_config", {}),
                        dipendenze=task_data.get("dipendenze", [])
                    )
                    db.add(task)
                
                stage_order += 1
        
        # Update workflow with all entities
        workflow.enti_coinvolti = list(all_enti)
        
        db.commit()
        
        # Reload with relationships
        db.refresh(workflow)
        
        # Build response
        return WorkflowResponse(
            id=workflow.id,
            nome=workflow.name,
            impianto_id=workflow.impianto_id,
            impiantoNome=workflow.impiantoNome,
            tipo=workflow.type,
            categoria=workflow.categoria,
            descrizione=workflow.description,
            current_status=workflow.current_status.value if workflow.current_status else None,
            progresso=workflow.progresso,
            data_creazione=workflow.created_at,
            data_scadenza=composition_request.data_scadenza,
            enti_coinvolti=workflow.enti_coinvolti,
            potenza_impianto=workflow.potenza_impianto,
            tipo_impianto=workflow.plant_type,
            requisiti_documenti=workflow.requisiti_documenti,
            stato_integrazioni={},
            stages=[],  # Will be populated by separate query if needed
            tasks=[],   # Will be populated by separate query if needed
            created_at=workflow.created_at,
            updated_at=workflow.updated_at
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
        query = db.query(Workflow).filter(
            Workflow.tenant_id == current_user.tenant_id
        )
        
        if impianto_id:
            query = query.filter(Workflow.impianto_id == impianto_id)
        
        if stato:
            query = query.filter(Workflow.current_status == stato)
        
        if categoria:
            query = query.filter(Workflow.category == categoria)
        
        if search:
            query = query.filter(
                or_(
                    Workflow.nome.ilike(f"%{search}%"),
                    Workflow.impiantoNome.ilike(f"%{search}%")
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
        workflow = db.query(Workflow).filter(
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
            descrizione=task_in.descrizione,
            assignee=task_in.assignee,
            dueDate=task_in.dueDate,
            priority=task_in.priority,
            estimatedHours=task_in.estimatedHours,
            ente_responsabile=task_in.ente_responsabile,
            tipo_pratica=task_in.tipo_pratica,
            url_portale=task_in.url_portale,
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
        if task_in.status == TaskStatusEnum.COMPLETED.value and not task.completato_data:
            task.completato_da = current_user.email
            task.completato_data = datetime.utcnow()
            
            # Update workflow progress
            workflow = task.workflow
            total_tasks = len(workflow.tasks)
            completed_tasks = sum(1 for t in workflow.tasks if t.status == TaskStatusEnum.COMPLETED.value)
            workflow.progresso = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
            
            # Check if workflow is complete
            if workflow.progresso == 100:
                workflow.current_status = WorkflowStatusEnum.COMPLETED.value
                workflow.data_completamento = datetime.utcnow()
        
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
            nome=nome,
            target_impianto_id=target_impianto_id,
            copy_tasks=copy_tasks,
            copy_documents=copy_documents,
            customizations=customizations,
            note=note
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
            nome=nome,
            user_id=current_user.id,
            tenant_id=current_user.tenant_id,
            categoria=categoria,
            descrizione=descrizione,
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
            nome=nome,
            user_id=current_user.id,
            tenant_id=current_user.tenant_id,
            descrizione=descrizione
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
        task_nome=task_nome,
        tenant_id=current_user.tenant_id
    )
    
    return [
        {
            "id": t.id,
            "document_template_id": t.document_template_id,
            "document_template": {
                "id": t.document_template.id,
                "nome": t.document_template.nome,
                "descrizione": t.document_template.descrizione,
                "categoria": t.document_template.categoria,
                "tipo": t.document_template.template_type,
                "variables": t.document_template.variables
            } if t.document_template else None,
            "task_nome": t.task_nome,
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
            impianto_id=workflow.impianto_id
        )
        
        return {
            "id": document.id,
            "nome": document.nome,
            "descrizione": document.descrizione,
            "tipo": document.tipo,
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
                "potenza_kw": workflow.impianto.potenza_kw,
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
            # Extract all tasks from stages
            all_tasks = []
            for stage in workflow_data.get("stages", []):
                if "tasks" in stage:
                    for task in stage["tasks"]:
                        # Add stage reference to each task
                        task_copy = task.copy()
                        task_copy["stage_nome"] = stage.get("nome", "")
                        task_copy["id"] = f"task_{idx}_{len(all_tasks)}"
                        all_tasks.append(task_copy)
            
            return WorkflowTemplateResponse(
                id=template_id,
                nome=workflow_data["nome"],
                descrizione=workflow_data.get("descrizione", ""),
                categoria=workflow_data.get("categoria", WorkflowCategoryEnum.ACTIVATION),
                phase=workflow_data.get("phase"),
                tipo_impianto=workflow_data.get("tipo_impianto", "Tutti"),
                potenza_minima=workflow_data.get("potenza_minima"),
                potenza_massima=workflow_data.get("potenza_massima"),
                durata_stimata_giorni=workflow_data.get("durata_stimata_giorni", 30),
                ricorrenza=workflow_data.get("ricorrenza", "Una tantum"),
                stages=workflow_data.get("stages", []),
                tasks=all_tasks,
                enti_richiesti=workflow_data.get("enti_richiesti", []),
                documenti_base=workflow_data.get("documenti_base", []),
                condizioni_attivazione=workflow_data.get("condizioni_attivazione", {}),
                scadenza_config=workflow_data.get("scadenza_config", {}),
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

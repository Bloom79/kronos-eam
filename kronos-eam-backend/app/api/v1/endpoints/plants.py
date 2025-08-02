"""
Power Plants endpoints
Complete CRUD operations with multi-tenant support
"""

from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query, File, UploadFile
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func

from app.api.deps import (
    get_tenant_db,
    get_current_active_user,
    PaginationParams,
    FilterParams,
    PaginatedResponse,
    require_tenant_resource
)
from app.core.security import TokenData, require_manager, require_operator
from app.core.rate_limit import rate_limit
from app.models.plant import (
    Plant,
    PlantRegistry,
    ComplianceChecklist,
    Maintenance,
    PlantPerformance,
    MaintenanceStatusEnum
)
from app.models.user import User
from app.schemas.plant import (
    PlantCreate,
    PlantUpdate,
    PlantResponse,
    PlantList,
    PlantSummary,
    PlantMetrics,
    MaintenanceCreate,
    MaintenanceUpdate,
    MaintenanceResponse,
    ComplianceChecklistResponse,
    PerformanceData
)
from app.services.workflow_data_service import WorkflowDataService

router = APIRouter()


@router.get("/", response_model=PlantList)
async def list_plants(
    current_user: TokenData = Depends(get_current_active_user),
    db: Session = Depends(get_tenant_db),
    pagination: PaginationParams = Depends(),
    filters: FilterParams = Depends(),
    plant_type: Optional[str] = Query(None, description="Filter by plant type"),
    integration_status: Optional[str] = Query(None, description="Filter by integration status")
):
    """List all power plants with filtering and pagination"""
    # Base query
    query = db.query(Plant).filter(
        Plant.tenant_id == current_user.tenant_id,
        Plant.is_deleted == False
    )
    
    # Apply filters
    query = filters.apply_to_query(query, Plant)
    
    # Additional filters
    if plant_type:
        query = query.filter(Plant.type == plant_type)
    
    if integration_status:
        if integration_status == "gse":
            query = query.filter(Plant.gse_integration == True)
        elif integration_status == "terna":
            query = query.filter(Plant.terna_integration == True)
        elif integration_status == "dogane":
            query = query.filter(Plant.customs_integration == True)
        elif integration_status == "dso":
            query = query.filter(Plant.dso_integration == True)
    
    # Check user permissions for specific plants
    if current_user.role not in ["Admin", "Asset Manager"]:
        # Filter by authorized plants for operators/viewers
        user = db.query(User).filter(User.id == current_user.sub).first()
        if user and user.authorized_plants:
            query = query.filter(Plant.id.in_(user.authorized_plants))
        else:
            # No authorized plants
            query = query.filter(Plant.id == -1)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    query = pagination.apply_to_query(query)
    
    # Eager load relationships
    query = query.options(
        joinedload(Plant.registry),
        joinedload(Plant.checklist)
    )
    
    items = query.all()
    
    # Convert to response model
    response_items = []
    for item in items:
        try:
            response_item = PlantResponse.from_orm(item)
            # Add counts
            response_item.maintenances_count = db.query(Maintenance).filter(
                Maintenance.plant_id == item.id
            ).count()
            response_item.documents_count = len(item.documents) if hasattr(item, 'documents') and item.documents else 0
            response_item.active_workflows = len([w for w in item.workflows if w.progress < 100]) if hasattr(item, 'workflows') and item.workflows else 0
            
            response_items.append(response_item)
        except Exception as e:
            import logging
            logging.error(f"Error converting plant {item.id}: {e}")
            raise
    
    return PlantList(
        items=response_items,
        total=total,
        skip=pagination.skip,
        limit=pagination.limit
    )


@router.get("/summary", response_model=List[PlantSummary])
async def get_plants_summary(
    current_user: TokenData = Depends(get_current_active_user),
    db: Session = Depends(get_tenant_db)
):
    """Get summary of all power plants for dashboard"""
    query = db.query(Plant).filter(
        Plant.tenant_id == current_user.tenant_id,
        Plant.is_deleted == False
    ).options(joinedload(Plant.checklist))
    
    # Apply user permissions
    if current_user.role not in ["Admin", "Asset Manager"]:
        user = db.query(User).filter(User.id == current_user.sub).first()
        if user and user.authorized_plants:
            query = query.filter(Plant.id.in_(user.authorized_plants))
    
    items = query.all()
    
    summaries = []
    for item in items:
        summary = PlantSummary(
            id=item.id,
            name=item.name,
            code=item.code,
            power=item.power_kw,
            status=item.status.value,
            location=item.location,
            next_deadline=item.next_deadline,
            deadline_color=item.deadline_color or "green",
            compliance_score=item.checklist.compliance_score if item.checklist else 0
        )
        summaries.append(summary)
    
    return summaries


@router.get("/{plant_id}", response_model=PlantResponse)
async def get_plant(
    plant_id: int,
    current_user: TokenData = Depends(get_current_active_user),
    db: Session = Depends(get_tenant_db)
):
    """Get specific power plant details"""
    plant = db.query(Plant).filter(
        Plant.id == plant_id,
        Plant.tenant_id == current_user.tenant_id,
        Plant.is_deleted == False
    ).options(
        joinedload(Plant.registry),
        joinedload(Plant.checklist)
    ).first()
    
    if not plant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant not found"
        )
    
    # Check user permissions
    if current_user.role not in ["Admin", "Asset Manager"]:
        user = db.query(User).filter(User.id == current_user.sub).first()
        if not user or plant_id not in (user.authorized_plants or []):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this plant"
            )
    
    # Convert to response
    response = PlantResponse.from_orm(plant)
    response.maintenances_count = db.query(Maintenance).filter(
        Maintenance.plant_id == plant.id
    ).count()
    response.documents_count = len(plant.documents) if plant.documents else 0
    response.active_workflows = len([w for w in plant.workflows if w.progress < 100]) if plant.workflows else 0
    
    return response


@router.post("/", response_model=PlantResponse, dependencies=[Depends(require_manager)])
async def create_plant(
    plant_data: PlantCreate,
    current_user: TokenData = Depends(get_current_active_user),
    db: Session = Depends(get_tenant_db)
):
    """Create new power plant"""
    # Check if code already exists
    existing = db.query(Plant).filter(
        Plant.code == plant_data.code,
        Plant.tenant_id == current_user.tenant_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Plant with this code already exists"
        )
    
    # Create plant
    plant = Plant(
        **plant_data.dict(exclude={"registry_data", "checklist"}),
        tenant_id=current_user.tenant_id,
        created_by=current_user.sub,
        updated_by=current_user.sub
    )
    
    db.add(plant)
    db.flush()  # Get ID without committing
    
    # Create registry_data if provided
    if plant_data.registry_data:
        registry_data = PlantRegistry(
            **plant_data.registry_data.dict(),
            tenant_id=current_user.tenant_id,
            created_by=current_user.sub
        )
        db.add(registry_data)
        db.flush()
        plant.registry_id = registry_data.id
    
    # Create checklist
    checklist_data = plant_data.checklist.dict() if plant_data.checklist else {}
    checklist = ComplianceChecklist(
        plant_id=plant.id,
        tenant_id=current_user.tenant_id,
        created_by=current_user.sub,
        **checklist_data
    )
    checklist.calculate_score()
    db.add(checklist)
    
    # Calculate next deadline
    plant.calculate_next_deadline()
    
    db.commit()
    db.refresh(plant)
    
    return PlantResponse.from_orm(plant)


@router.put("/{plant_id}", response_model=PlantResponse, dependencies=[Depends(require_manager)])
async def update_plant(
    plant_id: int,
    plant_data: PlantUpdate,
    current_user: TokenData = Depends(get_current_active_user),
    db: Session = Depends(get_tenant_db)
):
    """Update power plant"""
    plant = db.query(Plant).filter(
        Plant.id == plant_id,
        Plant.tenant_id == current_user.tenant_id,
        Plant.is_deleted == False
    ).first()
    
    if not plant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant not found"
        )
    
    # Update main fields
    update_data = plant_data.dict(exclude_unset=True, exclude={"registry_data", "checklist"})
    for field, value in update_data.items():
        setattr(plant, field, value)
    
    plant.updated_by = current_user.sub
    
    # Update registry_data if provided
    if plant_data.registry_data:
        if plant.registry:
            for field, value in plant_data.registry_data.dict(exclude_unset=True).items():
                setattr(plant.registry, field, value)
            plant.registry.updated_by = current_user.sub
        else:
            registry_data = PlantRegistry(
                **plant_data.registry_data.dict(),
                tenant_id=current_user.tenant_id,
                created_by=current_user.sub
            )
            db.add(registry_data)
            db.flush()
            plant.registry_id = registry_data.id
    
    # Update checklist if provided
    if plant_data.checklist and plant.checklist:
        for field, value in plant_data.checklist.dict(exclude_unset=True).items():
            setattr(plant.checklist, field, value)
        plant.checklist.calculate_score()
        plant.checklist.updated_by = current_user.sub
        plant.checklist.last_updated = datetime.utcnow()
    
    # Recalculate next deadline
    plant.calculate_next_deadline()
    
    db.commit()
    db.refresh(plant)
    
    return PlantResponse.from_orm(plant)


@router.delete("/{plant_id}", dependencies=[Depends(require_manager)])
async def delete_plant(
    plant_id: int,
    current_user: TokenData = Depends(get_current_active_user),
    db: Session = Depends(get_tenant_db),
    soft_delete: bool = Query(True, description="Soft delete (default) or hard delete")
):
    """Delete power plant"""
    plant = db.query(Plant).filter(
        Plant.id == plant_id,
        Plant.tenant_id == current_user.tenant_id
    ).first()
    
    if not plant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant not found"
        )
    
    if soft_delete:
        plant.soft_delete(current_user.sub)
    else:
        # Hard delete - only for admins
        if current_user.role != "Admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins can perform hard delete"
            )
        db.delete(plant)
    
    db.commit()
    
    return {"message": "Plant deleted successfully"}


# Performance endpoints
@router.get("/{plant_id}/performance")
async def get_plant_performance(
    plant_id: int,
    year: int = Query(..., description="Year for performance data"),
    month: Optional[int] = Query(None, description="Specific month (1-12)"),
    current_user: TokenData = Depends(get_current_active_user),
    db: Session = Depends(get_tenant_db)
):
    """Get performance data for power plant"""
    # Verify access
    plant = db.query(Plant).filter(
        Plant.id == plant_id,
        Plant.tenant_id == current_user.tenant_id
    ).first()
    
    if not plant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant not found"
        )
    
    # Query performance data
    query = db.query(PlantPerformance).filter(
        PlantPerformance.plant_id == plant_id,
        PlantPerformance.year == year
    )
    
    if month:
        query = query.filter(PlantPerformance.month == month)
    
    performance_data = query.order_by(PlantPerformance.month).all()
    
    return {
        "plant_id": plant_id,
        "year": year,
        "data": [PerformanceData.from_orm(p) for p in performance_data]
    }


@router.post("/{plant_id}/performance")
async def add_performance_data(
    plant_id: int,
    performance: PerformanceData,
    current_user: TokenData = Depends(get_current_active_user),
    db: Session = Depends(get_tenant_db)
):
    """Add or update performance data"""
    # Verify access and role
    if current_user.role not in ["Admin", "Asset Manager", "Operator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    plant = db.query(Plant).filter(
        Plant.id == plant_id,
        Plant.tenant_id == current_user.tenant_id
    ).first()
    
    if not plant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant not found"
        )
    
    # Check if data already exists
    existing = db.query(PlantPerformance).filter(
        PlantPerformance.plant_id == plant_id,
        PlantPerformance.year == performance.year,
        PlantPerformance.month == performance.month
    ).first()
    
    if existing:
        # Update
        for field, value in performance.dict(exclude_unset=True).items():
            setattr(existing, field, value)
        existing.updated_by = current_user.sub
    else:
        # Create new
        perf_data = PlantPerformance(
            plant_id=plant_id,
            tenant_id=current_user.tenant_id,
            created_by=current_user.sub,
            **performance.dict()
        )
        db.add(perf_data)
    
    db.commit()
    
    return {"message": "Performance data saved successfully"}


# Maintenance endpoints
@router.get("/{plant_id}/maintenance", response_model=List[MaintenanceResponse])
async def get_plant_maintenance(
    plant_id: int,
    status: Optional[str] = Query(None, description="Filter by status"),
    current_user: TokenData = Depends(get_current_active_user),
    db: Session = Depends(get_tenant_db)
):
    """Get maintenance records for power plant"""
    # Verify access
    plant = db.query(Plant).filter(
        Plant.id == plant_id,
        Plant.tenant_id == current_user.tenant_id
    ).first()
    
    if not plant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant not found"
        )
    
    query = db.query(Maintenance).filter(
        Maintenance.plant_id == plant_id,
        Maintenance.is_deleted == False
    )
    
    if status:
        query = query.filter(Maintenance.status == status)
    
    maintenances = query.order_by(Maintenance.planned_date.desc()).all()
    
    return [MaintenanceResponse.from_orm(m) for m in maintenances]


@router.post("/{plant_id}/maintenance", response_model=MaintenanceResponse)
async def create_maintenance(
    plant_id: int,
    maintenance: MaintenanceCreate,
    current_user: TokenData = Depends(get_current_active_user),
    db: Session = Depends(get_tenant_db)
):
    """Create maintenance record"""
    # Verify permissions
    if current_user.role not in ["Admin", "Asset Manager", "Operator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    # Verify plant exists and accessible
    plant = db.query(Plant).filter(
        Plant.id == plant_id,
        Plant.tenant_id == current_user.tenant_id
    ).first()
    
    if not plant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant not found"
        )
    
    # Create maintenance
    maintenance_data = maintenance.dict()
    maintenance_data["plant_id"] = plant_id
    
    db_maintenance = Maintenance(
        **maintenance_data,
        tenant_id=current_user.tenant_id,
        created_by=current_user.sub
    )
    
    db.add(db_maintenance)
    db.commit()
    db.refresh(db_maintenance)
    
    return MaintenanceResponse.from_orm(db_maintenance)


# Metrics endpoint
@router.get("/{plant_id}/metrics", response_model=PlantMetrics)
async def get_plant_metrics(
    plant_id: int,
    period_days: int = Query(365, description="Period in days for metrics calculation"),
    current_user: TokenData = Depends(get_current_active_user),
    db: Session = Depends(get_tenant_db)
):
    """Get comprehensive metrics for power plant"""
    # Verify access
    plant = db.query(Plant).filter(
        Plant.id == plant_id,
        Plant.tenant_id == current_user.tenant_id
    ).first()
    
    if not plant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant not found"
        )
    
    # Calculate period
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=period_days)
    
    # Production metrics
    production_data = db.query(
        func.sum(PlantPerformance.actual_production_kwh).label("total_production"),
        func.avg(PlantPerformance.actual_production_kwh).label("avg_production"),
        func.avg(PlantPerformance.performance_ratio).label("avg_pr")
    ).filter(
        PlantPerformance.plant_id == plant_id,
        PlantPerformance.created_at >= start_date
    ).first()
    
    # Maintenance metrics
    maintenance_data = db.query(
        func.count(Maintenance.id).label("total_count"),
        func.sum(func.case([(Maintenance.status == MaintenanceStatusEnum.PLANNED, 1)], else_=0)).label("planned_count"),
        func.sum(Maintenance.actual_cost).label("total_cost")
    ).filter(
        Maintenance.plant_id == plant_id,
        Maintenance.created_at >= start_date
    ).first()
    
    # Financial metrics
    financial_data = db.query(
        func.sum(PlantPerformance.revenue_eur).label("total_revenue"),
        func.sum(PlantPerformance.incentives_eur).label("total_incentives")
    ).filter(
        PlantPerformance.plant_id == plant_id,
        PlantPerformance.created_at >= start_date
    ).first()
    
    # Compliance score
    compliance_score = plant.checklist.compliance_score if plant.checklist else 0
    
    # TODO: Calculate upcoming deadlines and expired documents
    upcoming_deadlines = 0
    expired_documents = 0
    
    return PlantMetrics(
        plant_id=plant_id,
        total_production_kwh=production_data.total_production or 0,
        average_monthly_production=(production_data.avg_production or 0) * 30,
        average_performance_ratio=production_data.avg_pr or 0,
        total_maintenances=maintenance_data.total_count or 0,
        planned_maintenances=maintenance_data.planned_count or 0,
        total_maintenance_cost=maintenance_data.total_cost or 0,
        compliance_score=compliance_score,
        upcoming_deadlines_30d=upcoming_deadlines,
        expired_documents=expired_documents,
        total_revenue=financial_data.total_revenue or 0,
        total_incentives=financial_data.total_incentives or 0,
        period_start=start_date,
        period_end=end_date
    )


# Bulk operations
@router.post("/bulk-update", dependencies=[Depends(require_manager)])
@rate_limit(requests=5, window=60)
async def bulk_update_plants(
    updates: List[dict],  # List of {id: int, update_data: dict}
    current_user: TokenData = Depends(get_current_active_user),
    db: Session = Depends(get_tenant_db)
):
    """Bulk update multiple plants"""
    updated_count = 0
    errors = []
    
    for update in updates:
        try:
            plant_id = update.get("id")
            update_data = update.get("update_data", {})
            
            plant = db.query(Plant).filter(
                Plant.id == plant_id,
                Plant.tenant_id == current_user.tenant_id
            ).first()
            
            if plant:
                for field, value in update_data.items():
                    if hasattr(plant, field):
                        setattr(plant, field, value)
                plant.updated_by = current_user.sub
                updated_count += 1
            else:
                errors.append(f"Plant {plant_id} not found")
                
        except Exception as e:
            errors.append(f"Error updating plant {plant_id}: {str(e)}")
    
    db.commit()
    
    return {
        "updated": updated_count,
        "errors": errors
    }


# Import missing User model
from app.models.user import User


@router.get("/{plant_id}/complete", response_model=dict)
async def get_plant_with_workflow_data(
    plant_id: int,
    current_user: TokenData = Depends(get_current_active_user),
    db: Session = Depends(get_tenant_db)
):
    """Get plant details including all workflow-collected data"""
    # Get plant
    plant = db.query(Plant).filter(
        Plant.id == plant_id,
        Plant.tenant_id == current_user.tenant_id,
        Plant.is_deleted == False
    ).options(
        joinedload(Plant.registry),
        joinedload(Plant.checklist),
        joinedload(Plant.workflows)
    ).first()
    
    if not plant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant not found"
        )
    
    # Get workflow data
    workflow_service = WorkflowDataService(db)
    workflow_data = workflow_service.get_plant_workflow_data(
        plant_id=plant_id,
        tenant_id=current_user.tenant_id
    )
    
    # Build complete response
    response = {
        "plant": PlantResponse.from_orm(plant),
        "workflows": workflow_data.get("workflows", []),
        "entity_data": {
            "dso": workflow_data.get("dso_data"),
            "terna": workflow_data.get("terna_data"),
            "gse": workflow_data.get("gse_data"),
            "customs": workflow_data.get("customs_data")
        }
    }
    
    return response
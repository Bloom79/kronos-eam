"""
Dashboard endpoints for metrics and analytics
"""

from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, case
import calendar

from app.api.deps import get_tenant_db, get_current_active_user
from app.core.security import TokenData
from app.models.plant import Plant, PlantPerformance, Maintenance, ComplianceChecklist, PlantStatusEnum, MaintenanceStatusEnum
from app.models.workflow import Workflow, WorkflowTask, TaskStatusEnum
from app.models.document import Document, DocumentStatusEnum
from app.models.integration import Integration
from app.models.notification import Notification
from app.models.user import User
from app.schemas.dashboard import (
    DashboardMetrics,
    DashboardSummary,
    IntegrationStatus,
    ProductionChart,
    PlantStatusDistribution,
    ScadenzaItem,
    TaskItem,
    NotificationItem,
    PerformanceTrend,
    ComplianceMatrix,
    MaintenanceOverview,
    FinancialSummary,
    AlertItem
)

router = APIRouter()


@router.get("/metrics", response_model=DashboardMetrics)
async def get_dashboard_metrics(
    current_user: TokenData = Depends(get_current_active_user),
    db: Session = Depends(get_tenant_db)
):
    """Get main dashboard metrics"""
    # Get user's accessible plants
    plants_query = db.query(Plant).filter(
        Plant.tenant_id == current_user.tenant_id,
        Plant.is_deleted == False
    )
    
    # Apply user permissions
    if current_user.role not in ["Admin", "Asset Manager"]:
        user = db.query(User).filter(User.id == current_user.sub).first()
        if user and user.authorized_plants:
            plants_query = plants_query.filter(Plant.id.in_(user.authorized_plants))
    
    plants = plants_query.all()
    plant_ids = [p.id for p in plants]
    
    # Calculate metrics
    potenza_totale_kw = sum(p.power_kw for p in plants)
    potenza_totale_mw = potenza_totale_kw / 1000
    plants_attivi = len([p for p in plants if p.status == PlantStatusEnum.IN_OPERATION])
    plants_totali = len(plants)
    
    # Workflows in ritardo
    workflows_in_ritardo = db.query(Workflow).filter(
        Workflow.tenant_id == current_user.tenant_id,
        Workflow.due_date < datetime.utcnow(),
        Workflow.progress < 100
    ).count()
    
    # Documenti da revisionare
    documenti_da_revisionare = db.query(Document).filter(
        Document.tenant_id == current_user.tenant_id,
        Document.stato == DocumentStatusEnum.IN_ELABORAZIONE
    ).count()
    
    # Scadenze imminenti (next 30 days)
    thirty_days_from_now = datetime.utcnow() + timedelta(days=30)
    scadenze_imminenti = db.query(Plant).filter(
        Plant.id.in_(plant_ids),
        Plant.next_deadline <= thirty_days_from_now
    ).count()
    
    # Task assegnati all'utente
    task_assegnati = db.query(WorkflowTask).filter(
        WorkflowTask.assignee == current_user.email,
        WorkflowTask.status.in_([TaskStatusEnum.IN_PROGRESS, TaskStatusEnum.TO_START])
    ).count()
    
    # Conformità media
    compliance_scores = db.query(ComplianceChecklist.compliance_score).filter(
        ComplianceChecklist.plant_id.in_(plant_ids)
    ).all()
    compliance_score = sum(s[0] for s in compliance_scores) / len(compliance_scores) if compliance_scores else 0
    
    # Current month production
    current_month = datetime.utcnow().month
    current_year = datetime.utcnow().year
    
    production_data = db.query(
        func.sum(PlantPerformance.actual_production_kwh).label("total"),
        func.avg(PlantPerformance.performance_ratio).label("pr"),
        func.avg(PlantPerformance.availability).label("availability")
    ).filter(
        PlantPerformance.plant_id.in_(plant_ids),
        PlantPerformance.year == current_year,
        PlantPerformance.month == current_month
    ).first()
    
    # Financial data - separate queries to avoid cartesian product
    revenue_data = db.query(
        func.sum(PlantPerformance.revenue_euro).label("revenue")
    ).filter(
        PlantPerformance.plant_id.in_(plant_ids),
        PlantPerformance.year == current_year,
        PlantPerformance.month == current_month
    ).scalar() or 0
    
    maintenance_cost = db.query(
        func.sum(Maintenance.actual_cost).label("maintenance_cost")
    ).filter(
        Maintenance.plant_id.in_(plant_ids),
        Maintenance.status == MaintenanceStatusEnum.COMPLETED
    ).scalar() or 0
    
    financial_data = type('obj', (object,), {
        'revenue': revenue_data,
        'maintenance_cost': maintenance_cost
    })()
    
    # Calculate trends (compare with previous month)
    prev_month = current_month - 1 if current_month > 1 else 12
    prev_year = current_year if current_month > 1 else current_year - 1
    
    prev_production = db.query(func.sum(PlantPerformance.actual_production_kwh)).filter(
        PlantPerformance.plant_id.in_(plant_ids),
        PlantPerformance.year == prev_year,
        PlantPerformance.month == prev_month
    ).scalar() or 0
    
    current_production = production_data.total or 0
    produzione_trend = ((current_production - prev_production) / prev_production * 100) if prev_production > 0 else 0
    
    return DashboardMetrics(
        total_power=f"{potenza_totale_mw:.1f} MW",
        total_power_mw=potenza_totale_mw,
        active_plants=plants_attivi,
        total_plants=plants_totali,
        workflows_in_ritardo=workflows_in_ritardo,
        documents_to_review=documenti_da_revisionare,
        upcoming_deadlines=scadenze_imminenti,
        assigned_tasks=task_assegnati,
        compliance_score=compliance_score,
        monthly_production_kwh=current_production,
        average_performance_ratio=production_data.pr or 0,
        average_availability=production_data.availability or 0,
        monthly_revenue=financial_data.revenue or 0,
        maintenance_costs=financial_data.maintenance_cost or 0,
        production_trend=produzione_trend,
        compliance_trend=0,  # TODO: Calculate
        costs_trend=0  # TODO: Calculate
    )


@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary(
    current_user: TokenData = Depends(get_current_active_user),
    db: Session = Depends(get_tenant_db)
):
    """Get complete dashboard summary"""
    # Get metrics
    metrics = await get_dashboard_metrics(current_user, db)
    
    # Get integrations status
    integrations = db.query(Integration).filter(
        Integration.tenant_id == current_user.tenant_id
    ).all()
    
    integration_statuses = [
        IntegrationStatus(
            id=str(i.id),
            name=i.name,
            status=i.status,
            last_sync=i.last_sync,
            messages_in_queue=i.messages_in_queue or 0,
            errors=i.errors or 0,
            success_rate=95.0  # TODO: Calculate from logs
        )
        for i in integrations
    ]
    
    # Get production chart data (last 12 months)
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=365)
    
    production_by_month = db.query(
        PlantPerformance.year,
        PlantPerformance.month,
        func.sum(PlantPerformance.expected_production_kwh).label("expected"),
        func.sum(PlantPerformance.actual_production_kwh).label("actual")
    ).filter(
        PlantPerformance.created_at >= start_date
    ).group_by(
        PlantPerformance.year,
        PlantPerformance.month
    ).order_by(
        PlantPerformance.year,
        PlantPerformance.month
    ).all()
    
    # Format chart data
    labels = []
    expected_data = []
    actual_data = []
    
    for row in production_by_month:
        labels.append(f"{calendar.month_abbr[row.month]} {row.year}")
        expected_data.append(row.expected or 0)
        actual_data.append(row.actual or 0)
    
    production_chart = ProductionChart(
        labels=labels,
        datasets=[
            {
                "label": "Produzione Attesa",
                "data": expected_data,
                "borderColor": "rgb(75, 192, 192)",
                "backgroundColor": "rgba(75, 192, 192, 0.2)"
            },
            {
                "label": "Produzione Effettiva",
                "data": actual_data,
                "borderColor": "rgb(255, 99, 132)",
                "backgroundColor": "rgba(255, 99, 132, 0.2)"
            }
        ]
    )
    
    # Get status distribution
    status_counts = db.query(
        Plant.status,
        func.count(Plant.id)
    ).filter(
        Plant.tenant_id == current_user.tenant_id,
        Plant.is_deleted == False
    ).group_by(Plant.status).all()
    
    status_distribution = PlantStatusDistribution(
        labels=[s[0] for s in status_counts],
        values=[s[1] for s in status_counts],
        colors=["#10b981", "#f59e0b", "#3b82f6", "#ef4444"]  # Green, yellow, blue, red
    )
    
    # Get prossime scadenze
    scadenze = db.query(Plant).filter(
        Plant.tenant_id == current_user.tenant_id,
        Plant.next_deadline.isnot(None)
    ).order_by(Plant.next_deadline).limit(10).all()
    
    prossime_scadenze = [
        ScadenzaItem(
            id=str(s.id),
            title=s.next_deadline_type or "Deadline",
            plant=s.name,
            date=s.next_deadline,
            type=s.next_deadline_type or "Generic",
            priority="High" if (s.next_deadline - datetime.utcnow()).days < 7 else "Medium",
            days_remaining=(s.next_deadline - datetime.utcnow()).days
        )
        for s in scadenze
    ]
    
    # Get task recenti
    tasks = db.query(WorkflowTask).filter(
        WorkflowTask.assignee == current_user.email,
        WorkflowTask.status.in_([TaskStatusEnum.IN_PROGRESS, TaskStatusEnum.TO_START])
    ).order_by(WorkflowTask.due_date).limit(10).all()
    
    task_recenti = [
        TaskItem(
            id=t.id,
            title=t.title,
            workflow=t.workflow.name if t.workflow else "N/A",
            plant=t.workflow.plant_name if t.workflow else "N/A",
            assignee=t.assignee,
            due_date=t.due_date,
            status=t.status,
            priority=t.priority or "Media"
        )
        for t in tasks
    ]
    
    # Get notifiche recenti
    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.sub,
        Notification.tenant_id == current_user.tenant_id
    ).order_by(Notification.created_at.desc()).limit(10).all()
    
    notifiche_recenti = [
        NotificationItem(
            id=str(n.id),
            type=n.type,
            title=n.title,
            message=n.message,
            timestamp=n.created_at,
            read=n.read,
            priority=n.priority
        )
        for n in notifications
    ]
    
    # KPI Summary
    kpi_summary = {
        "efficiency": {
            "value": metrics.average_performance_ratio,
            "target": 0.85,
            "status": "good" if metrics.average_performance_ratio >= 0.85 else "warning"
        },
        "availability": {
            "value": metrics.average_availability,
            "target": 0.95,
            "status": "good" if metrics.average_availability >= 0.95 else "warning"
        },
        "compliance": {
            "value": metrics.compliance_score,
            "target": 90,
            "status": "good" if metrics.compliance_score >= 90 else "warning"
        }
    }
    
    # Alerts
    alerts = []
    if metrics.workflows_in_ritardo > 0:
        alerts.append({
            "type": "workflow",
            "severity": "warning",
            "message": f"{metrics.workflows_in_ritardo} workflows delayed"
        })
    
    if metrics.upcoming_deadlines > 5:
        alerts.append({
            "type": "deadline",
            "severity": "critical",
            "message": f"{metrics.upcoming_deadlines} deadlines in the next 30 days"
        })
    
    return DashboardSummary(
        metrics=metrics,
        integrations=integration_statuses,
        production_chart=production_chart,
        status_distribution=status_distribution,
        upcoming_deadlines=prossime_scadenze,
        recent_tasks=task_recenti,
        recent_notifications=notifiche_recenti,
        kpi_summary=kpi_summary,
        alerts=alerts
    )


@router.get("/performance-trend", response_model=PerformanceTrend)
async def get_performance_trend(
    period: str = Query("monthly", pattern="^(daily|weekly|monthly|yearly)$"),
    days: int = Query(365, description="Number of days to look back"),
    current_user: TokenData = Depends(get_current_active_user),
    db: Session = Depends(get_tenant_db)
):
    """Get performance trend data"""
    # Get user's accessible plants
    plants_query = db.query(Plant.id).filter(
        Plant.tenant_id == current_user.tenant_id,
        Plant.is_deleted == False
    )
    
    if current_user.role not in ["Admin", "Asset Manager"]:
        user = db.query(User).filter(User.id == current_user.sub).first()
        if user and user.authorized_plants:
            plants_query = plants_query.filter(Plant.id.in_(user.authorized_plants))
    
    plant_ids = [i[0] for i in plants_query.all()]
    
    # Query performance data
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    if period == "monthly":
        # Group by month
        performance_data = db.query(
            PlantPerformance.year,
            PlantPerformance.month,
            func.sum(PlantPerformance.actual_production_kwh).label("production"),
            func.avg(PlantPerformance.performance_ratio).label("pr"),
            func.avg(PlantPerformance.availability).label("availability"),
            func.sum(PlantPerformance.revenue_euro).label("revenue")
        ).filter(
            PlantPerformance.plant_id.in_(plant_ids),
            PlantPerformance.created_at >= start_date
        ).group_by(
            PlantPerformance.year,
            PlantPerformance.month
        ).order_by(
            PlantPerformance.year,
            PlantPerformance.month
        ).all()
        
        labels = [f"{calendar.month_abbr[row.month]} {row.year}" for row in performance_data]
        production = [row.production or 0 for row in performance_data]
        performance_ratio = [row.pr or 0 for row in performance_data]
        availability = [row.availability or 0 for row in performance_data]
        revenue = [row.revenue or 0 for row in performance_data]
    
    else:
        # TODO: Implement other period groupings (daily, weekly, yearly)
        labels = []
        production = []
        performance_ratio = []
        availability = []
        revenue = []
    
    return PerformanceTrend(
        period=period,
        labels=labels,
        production=production,
        performance_ratio=performance_ratio,
        availability=availability,
        revenue=revenue
    )


@router.get("/compliance-matrix", response_model=ComplianceMatrix)
async def get_compliance_matrix(
    current_user: TokenData = Depends(get_current_active_user),
    db: Session = Depends(get_tenant_db)
):
    """Get compliance status matrix for all plants"""
    # Get plants with checklists
    plants = db.query(Plant).filter(
        Plant.tenant_id == current_user.tenant_id,
        Plant.is_deleted == False
    ).all()
    
    # Define compliance items
    compliance_items = [
        "dso_connection",
        "terna_registration",
        "gse_activation",
        "customs_license",
        "spi_verification",
        "consumption_declaration",
        "antimafia",
        "fuel_mix"
    ]
    
    # Build matrix
    plants_data = []
    matrix = []
    
    for plant in plants:
        plants_data.append({
            "id": plant.id,
            "name": plant.name,
            "codice": plant.code
        })
        
        if plant.checklist:
            row = [
                getattr(plant.checklist, item, False)
                for item in compliance_items
            ]
        else:
            row = [False] * len(compliance_items)
        
        matrix.append(row)
    
    # Calculate overall score
    total_items = len(plants) * len(compliance_items)
    completed_items = sum(sum(row) for row in matrix)
    overall_score = (completed_items / total_items * 100) if total_items > 0 else 0
    
    return ComplianceMatrix(
        plants=plants_data,
        compliance_items=compliance_items,
        matrix=matrix,
        overall_score=overall_score
    )


@router.get("/maintenance-overview", response_model=MaintenanceOverview)
async def get_maintenance_overview(
    current_user: TokenData = Depends(get_current_active_user),
    db: Session = Depends(get_tenant_db)
):
    """Get maintenance overview"""
    # Get counts by status
    status_counts = db.query(
        Maintenance.status,
        func.count(Maintenance.id)
    ).filter(
        Maintenance.tenant_id == current_user.tenant_id,
        Maintenance.is_deleted == False
    ).group_by(Maintenance.status).all()
    
    status_dict = dict(status_counts)
    
    # Get upcoming maintenance
    upcoming = db.query(Maintenance).filter(
        Maintenance.tenant_id == current_user.tenant_id,
        Maintenance.status == MaintenanceStatusEnum.PLANNED,
        Maintenance.planned_date >= datetime.utcnow()
    ).order_by(Maintenance.planned_date).limit(10).all()
    
    upcoming_list = [
        {
            "id": m.id,
            "plant": m.plant.name if m.plant else "N/A",
            "type": m.type,
            "data": m.planned_date,
            "description": m.description
        }
        for m in upcoming
    ]
    
    # Get costs by type
    costs_by_type = db.query(
        Maintenance.type,
        func.sum(Maintenance.actual_cost)
    ).filter(
        Maintenance.tenant_id == current_user.tenant_id,
        Maintenance.actual_cost.isnot(None)
    ).group_by(Maintenance.type).all()
    
    costs_dict = {t: float(c or 0) for t, c in costs_by_type}
    
    # Calculate MTBF and MTTR (simplified)
    # TODO: Implement proper MTBF/MTTR calculation
    mtbf = 720  # 30 days in hours
    mttr = 4    # 4 hours
    
    # Count overdue
    overdue = db.query(Maintenance).filter(
        Maintenance.tenant_id == current_user.tenant_id,
        Maintenance.status == MaintenanceStatusEnum.PLANNED,
        Maintenance.planned_date < datetime.utcnow()
    ).count()
    
    return MaintenanceOverview(
        scheduled=status_dict.get(MaintenanceStatusEnum.PLANNED, 0),
        in_progress=status_dict.get(MaintenanceStatusEnum.IN_PROGRESS, 0),
        completed=status_dict.get(MaintenanceStatusEnum.COMPLETED, 0),
        overdue=overdue,
        upcoming=upcoming_list,
        costs_by_type=costs_dict,
        mtbf=mtbf,
        mttr=mttr
    )


@router.get("/financial-summary", response_model=FinancialSummary)
async def get_financial_summary(
    year: int = Query(None, description="Year for financial data (default: current year)"),
    current_user: TokenData = Depends(get_current_active_user),
    db: Session = Depends(get_tenant_db)
):
    """Get financial summary"""
    if not year:
        year = datetime.utcnow().year
    
    # Get user's accessible plants
    plants_query = db.query(Plant.id).filter(
        Plant.tenant_id == current_user.tenant_id,
        Plant.is_deleted == False
    )
    
    if current_user.role not in ["Admin", "Asset Manager"]:
        user = db.query(User).filter(User.id == current_user.sub).first()
        if user and user.authorized_plants:
            plants_query = plants_query.filter(Plant.id.in_(user.authorized_plants))
    
    plant_ids = [i[0] for i in plants_query.all()]
    
    # Get revenue data
    revenue_data = db.query(
        PlantPerformance.month,
        func.sum(PlantPerformance.revenue_euro).label("revenue"),
        func.sum(PlantPerformance.incentives_euro).label("incentives")
    ).filter(
        PlantPerformance.plant_id.in_(plant_ids),
        PlantPerformance.year == year
    ).group_by(PlantPerformance.month).all()
    
    revenue_by_month = [
        {
            "month": calendar.month_abbr[row.month],
            "revenue": float(row.revenue or 0),
            "incentives": float(row.incentives or 0)
        }
        for row in revenue_data
    ]
    
    revenue_total = sum(r["revenue"] + r["incentives"] for r in revenue_by_month)
    
    # Get costs
    maintenance_costs = db.query(
        func.sum(Maintenance.actual_cost)
    ).filter(
        Maintenance.plant_id.in_(plant_ids),
        func.extract('year', Maintenance.execution_date) == year
    ).scalar() or 0
    
    # Simplified cost breakdown
    costs_breakdown = {
        "maintenance": float(maintenance_costs),
        "operations": float(maintenance_costs * 0.3),  # Estimate
        "insurance": float(revenue_total * 0.02),     # Estimate
        "administration": float(revenue_total * 0.05)  # Estimate
    }
    
    costs_total = sum(costs_breakdown.values())
    
    # Calculate financial metrics
    profit = revenue_total - costs_total
    profit_margin = (profit / revenue_total * 100) if revenue_total > 0 else 0
    
    # Simplified ROI and payback (would need investment data)
    roi = 15.5  # Example
    payback_period = 6.5  # Years
    
    return FinancialSummary(
        revenue_total=revenue_total,
        revenue_by_month=revenue_by_month,
        costs_total=costs_total,
        costs_breakdown=costs_breakdown,
        profit_margin=profit_margin,
        roi=roi,
        payback_period=payback_period
    )


@router.get("/alerts", response_model=List[AlertItem])
async def get_alerts(
    severity: Optional[str] = Query(None, pattern="^(critical|warning|info)$"),
    limit: int = Query(20, le=100),
    current_user: TokenData = Depends(get_current_active_user),
    db: Session = Depends(get_tenant_db)
):
    """Get system alerts and warnings"""
    alerts = []
    
    # Check for overdue maintenance
    overdue_maintenance = db.query(Maintenance).filter(
        Maintenance.tenant_id == current_user.tenant_id,
        Maintenance.status == MaintenanceStatusEnum.PLANNED,
        Maintenance.planned_date < datetime.utcnow()
    ).count()
    
    if overdue_maintenance > 0:
        alerts.append(AlertItem(
            id="alert_maintenance_overdue",
            severity="warning",
            type="maintenance",
            title="Manutenzioni Scadute",
            description=f"{overdue_maintenance} manutenzioni sono scadute e richiedono attenzione",
            plant_id=None,
            created_at=datetime.utcnow(),
            acknowledged=False
        ))
    
    # Check for low performance
    low_performance = db.query(PlantPerformance).filter(
        PlantPerformance.tenant_id == current_user.tenant_id,
        PlantPerformance.performance_ratio < 0.7,
        PlantPerformance.year == datetime.utcnow().year,
        PlantPerformance.month == datetime.utcnow().month
    ).all()
    
    for perf in low_performance:
        alerts.append(AlertItem(
            id=f"alert_low_pr_{perf.plant_id}",
            severity="warning",
            type="performance",
            title="Performance Bassa",
            description=f"PR: {perf.performance_ratio:.1%} - Sotto la soglia minima",
            plant_id=perf.plant_id,
            created_at=datetime.utcnow(),
            acknowledged=False
        ))
    
    # Check for compliance issues
    low_compliance = db.query(ComplianceChecklist).filter(
        ComplianceChecklist.tenant_id == current_user.tenant_id,
        ComplianceChecklist.compliance_score < 70
    ).all()
    
    for checklist in low_compliance:
        alerts.append(AlertItem(
            id=f"alert_compliance_{checklist.plant_id}",
            severity="critical",
            type="compliance",
            title="Conformità Critica",
            description=f"Score conformità: {checklist.compliance_score}% - Richiede intervento immediato",
            plant_id=checklist.plant_id,
            created_at=datetime.utcnow(),
            acknowledged=False
        ))
    
    # Filter by severity if requested
    if severity:
        alerts = [a for a in alerts if a.severity == severity]
    
    # Sort by severity (critical first) and limit
    severity_order = {"critical": 0, "warning": 1, "info": 2}
    alerts.sort(key=lambda x: severity_order.get(x.severity, 3))
    
    return alerts[:limit]


# Imports are already at the top of the file
"""
Dashboard schemas for metrics and analytics
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class DashboardMetrics(BaseModel):
    """Main dashboard metrics"""
    total_power: str
    total_power_mw: float
    active_plants: int
    total_plants: int
    workflows_in_ritardo: int
    documents_to_review: int
    upcoming_deadlines: int
    assigned_tasks: int
    compliance_score: float
    
    # Additional metrics
    monthly_production_kwh: float = 0
    average_performance_ratio: float = 0
    average_availability: float = 0
    
    # Financial
    monthly_revenue: float = 0
    maintenance_costs: float = 0
    
    # Trends (percentage change from previous period)
    production_trend: float = 0
    compliance_trend: float = 0
    costs_trend: float = 0


class IntegrationStatus(BaseModel):
    """Integration status summary"""
    id: str
    name: str
    status: str
    last_sync: Optional[datetime]
    messages_in_queue: int = 0
    errors: int = 0
    success_rate: float = 100.0


class ProductionChart(BaseModel):
    """Production chart data"""
    labels: List[str]  # Month names or dates
    datasets: List[Dict[str, Any]]  # Chart.js datasets


class PlantStatusDistribution(BaseModel):
    """Distribution of plants by status"""
    labels: List[str]
    values: List[int]
    colors: List[str]


class ScadenzaItem(BaseModel):
    """Single deadline item"""
    id: str
    title: str
    plant: str
    date: datetime
    type: str
    priority: str
    days_remaining: Optional[int] = None
    status: Optional[str] = None
    entity: Optional[str] = None
    recurring: Optional[bool] = False


class TaskItem(BaseModel):
    """Task summary item"""
    id: int
    title: str
    workflow: str
    plant: str
    assignee: str
    due_date: datetime
    status: str
    priority: str


class NotificationItem(BaseModel):
    """Notification item"""
    id: str
    type: str
    title: str
    message: str
    timestamp: datetime
    read: bool
    priority: str


class DashboardSummary(BaseModel):
    """Complete dashboard data"""
    metrics: DashboardMetrics
    integrations: List[IntegrationStatus]
    production_chart: ProductionChart
    status_distribution: PlantStatusDistribution
    upcoming_deadlines: List[ScadenzaItem]
    recent_tasks: List[TaskItem]
    recent_notifications: List[NotificationItem]
    
    # Performance indicators
    kpi_summary: Dict[str, Any]
    alerts: List[Dict[str, Any]]


class PerformanceTrend(BaseModel):
    """Performance trend data"""
    period: str  # "daily", "weekly", "monthly", "yearly"
    labels: List[str]
    production: List[float]
    performance_ratio: List[float]
    availability: List[float]
    revenue: List[float]


class ComplianceMatrix(BaseModel):
    """Compliance status matrix"""
    plants: List[Dict[str, Any]]
    compliance_items: List[str]
    matrix: List[List[bool]]  # impianti x compliance_items
    overall_score: float


class MaintenanceOverview(BaseModel):
    """Maintenance overview"""
    scheduled: int
    in_progress: int
    completed: int
    overdue: int
    
    upcoming: List[Dict[str, Any]]
    costs_by_type: Dict[str, float]
    mtbf: float  # Mean Time Between Failures
    mttr: float  # Mean Time To Repair


class FinancialSummary(BaseModel):
    """Financial summary"""
    revenue_total: float
    revenue_by_month: List[Dict[str, float]]
    costs_total: float
    costs_breakdown: Dict[str, float]
    profit_margin: float
    roi: float
    payback_period: float


class AlertItem(BaseModel):
    """Alert/warning item"""
    id: str
    severity: str  # "critical", "warning", "info"
    type: str
    title: str
    description: str
    plant_id: Optional[int]
    created_at: datetime
    acknowledged: bool
"""
Plant (Power Plant) schemas for request/response validation
"""

from typing import Optional, List, Dict, Any
from datetime import datetime, date
from pydantic import BaseModel, Field, validator
from enum import Enum


class PlantStatusEnum(str, Enum):
    IN_OPERATION = "In Operation"
    IN_AUTHORIZATION = "In Authorization"
    UNDER_CONSTRUCTION = "Under Construction"
    DECOMMISSIONED = "Decommissioned"


class PlantTypeEnum(str, Enum):
    PHOTOVOLTAIC = "Photovoltaic"
    WIND = "Wind"
    HYDROELECTRIC = "Hydroelectric"
    BIOMASS = "Biomass"
    GEOTHERMAL = "Geothermal"


class MaintenanceTypeEnum(str, Enum):
    ORDINARY = "Ordinary"
    EXTRAORDINARY = "Extraordinary"
    PREDICTIVE = "Predictive"
    CORRECTIVE = "Corrective"


class MaintenanceStatusEnum(str, Enum):
    COMPLETED = "Completed"
    PLANNED = "Planned"
    IN_PROGRESS = "In Progress"
    CANCELLED = "Cancelled"


# Base schemas
class PlantRegistryBase(BaseModel):
    """Technical details base schema"""
    pod: Optional[str] = None
    gaudi: Optional[str] = None
    censimp: Optional[str] = None
    sapr: Optional[str] = None
    
    operational_date: Optional[datetime] = None
    construction_date: Optional[datetime] = None
    connection_date: Optional[datetime] = None
    
    regime: Optional[str] = None
    manager: Optional[str] = None
    manager_email: Optional[str] = None
    manager_phone: Optional[str] = None
    
    insurance_provider: Optional[str] = None
    insurance_policy_number: Optional[str] = None
    insurance_expiry_date: Optional[datetime] = None
    
    occupied_area: Optional[float] = None
    modules_count: Optional[int] = None
    inverters_count: Optional[int] = None
    trackers_count: Optional[int] = None
    
    technical_specifications: Optional[Dict[str, Any]] = {}
    
    connection_voltage: Optional[str] = None
    primary_substation: Optional[str] = None
    feeder: Optional[str] = None


class PlantBase(BaseModel):
    """Base schema for Plant"""
    name: str = Field(..., min_length=3, max_length=200)
    code: str = Field(..., min_length=3, max_length=50)
    power: str = Field(..., description="Power in string format e.g. '1.2 MW'")
    power_kw: float = Field(..., gt=0, description="Power in kW")
    
    status: PlantStatusEnum
    type: PlantTypeEnum
    
    location: str = Field(..., min_length=2, max_length=200)
    address: Optional[str] = None
    municipality: Optional[str] = None
    province: Optional[str] = Field(None, max_length=10)
    region: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    
    tags: Optional[List[str]] = []
    notes: Optional[str] = None
    custom_fields: Optional[Dict[str, Any]] = {}


class ComplianceChecklistBase(BaseModel):
    """Compliance checklist base schema"""
    dso_connection: bool = False
    dso_connection_date: Optional[datetime] = None
    dso_connection_expiry: Optional[datetime] = None
    
    terna_registration: bool = False
    terna_registration_date: Optional[datetime] = None
    terna_registration_number: Optional[str] = None
    
    gse_activation: bool = False
    gse_activation_date: Optional[datetime] = None
    gse_agreement: Optional[str] = None
    
    customs_license: bool = False
    customs_license_date: Optional[datetime] = None
    customs_license_number: Optional[str] = None
    customs_license_expiry: Optional[datetime] = None
    
    spi_verification: bool = False
    spi_verification_date: Optional[datetime] = None
    spi_next_verification: Optional[datetime] = None
    
    consumption_declaration: bool = False
    consumption_declaration_year: Optional[int] = None
    consumption_declaration_expiry: Optional[datetime] = None
    
    antimafia_certificate: bool = False
    antimafia_certificate_date: Optional[datetime] = None
    antimafia_certificate_expiry: Optional[datetime] = None
    
    fuel_mix_disclosure: bool = False
    fuel_mix_disclosure_date: Optional[datetime] = None
    fuel_mix_disclosure_expiry: Optional[datetime] = None
    
    eia_screening: bool = False
    eia_screening_date: Optional[datetime] = None
    
    ippc_permit: bool = False
    ippc_permit_number: Optional[str] = None
    ippc_permit_expiry: Optional[datetime] = None
    
    custom_items: Optional[Dict[str, Any]] = {}


class MaintenanceBase(BaseModel):
    """Maintenance base schema"""
    planned_date: datetime
    type: MaintenanceTypeEnum
    status: MaintenanceStatusEnum = MaintenanceStatusEnum.PLANNED
    
    description: str = Field(..., min_length=10)
    interventions_performed: Optional[str] = None
    
    estimated_cost: Optional[float] = Field(None, ge=0)
    actual_cost: Optional[float] = Field(None, ge=0)
    
    executor: Optional[str] = None
    man_hours: Optional[float] = Field(None, ge=0)
    
    anomalies_detected: Optional[List[Dict[str, Any]]] = []
    corrective_actions: Optional[str] = None
    
    next_maintenance_date: Optional[datetime] = None


class PerformanceData(BaseModel):
    """Performance metrics schema"""
    year: int
    month: int = Field(..., ge=1, le=12)
    
    expected_production_kwh: Optional[float] = None
    actual_production_kwh: Optional[float] = None
    
    performance_ratio: Optional[float] = Field(None, ge=0, le=1)
    availability: Optional[float] = Field(None, ge=0, le=100)
    capacity_factor: Optional[float] = Field(None, ge=0, le=1)
    
    average_irradiation: Optional[float] = None
    average_temperature: Optional[float] = None
    
    revenue_eur: Optional[float] = None
    incentives_eur: Optional[float] = None


# Create schemas
class PlantCreate(PlantBase):
    """Schema for creating Plant"""
    registry_data: Optional[PlantRegistryBase] = None
    checklist: Optional[ComplianceChecklistBase] = None


class PlantUpdate(BaseModel):
    """Schema for updating Plant"""
    name: Optional[str] = Field(None, min_length=3, max_length=200)
    power: Optional[str] = None
    power_kw: Optional[float] = Field(None, gt=0)
    
    status: Optional[PlantStatusEnum] = None
    
    location: Optional[str] = None
    address: Optional[str] = None
    municipality: Optional[str] = None
    province: Optional[str] = Field(None, max_length=10)
    region: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    
    tags: Optional[List[str]] = None
    notes: Optional[str] = None
    custom_fields: Optional[Dict[str, Any]] = None
    
    registry_data: Optional[PlantRegistryBase] = None
    checklist: Optional[ComplianceChecklistBase] = None


class MaintenanceCreate(MaintenanceBase):
    """Schema for creating maintenance record"""
    plant_id: int


class MaintenanceUpdate(BaseModel):
    """Schema for updating maintenance record"""
    planned_date: Optional[datetime] = None
    execution_date: Optional[datetime] = None
    status: Optional[MaintenanceStatusEnum] = None
    
    description: Optional[str] = None
    interventions_performed: Optional[str] = None
    
    actual_cost: Optional[float] = Field(None, ge=0)
    
    executor: Optional[str] = None
    man_hours: Optional[float] = Field(None, ge=0)
    
    anomalies_detected: Optional[List[Dict[str, Any]]] = None
    corrective_actions: Optional[str] = None
    
    next_maintenance_date: Optional[datetime] = None


# Response schemas
class PlantRegistryResponse(PlantRegistryBase):
    """Anagrafica response schema"""
    id: int
    
    class Config:
        from_attributes = True


class ComplianceChecklistResponse(ComplianceChecklistBase):
    """Checklist response schema"""
    id: int
    plant_id: int
    compliance_score: int
    last_update: datetime
    
    class Config:
        from_attributes = True


class MaintenanceResponse(MaintenanceBase):
    """Maintenance response schema"""
    id: int
    plant_id: int
    execution_date: Optional[datetime] = None
    document_ids: List[str] = []
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class PlantResponse(PlantBase):
    """Complete Plant response"""
    id: int
    tenant_id: str
    
    next_deadline: Optional[datetime] = None
    next_deadline_type: Optional[str] = None
    deadline_color: Optional[str] = None
    
    gse_integration: bool = False
    terna_integration: bool = False
    customs_integration: bool = False
    dso_integration: bool = False
    
    registry: Optional[PlantRegistryResponse] = None
    checklist: Optional[ComplianceChecklistResponse] = None
    
    # Summary fields
    maintenances_count: int = 0
    documents_count: int = 0
    active_workflows: int = 0
    
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class PlantList(BaseModel):
    """List response with pagination"""
    items: List[PlantResponse]
    total: int
    skip: int
    limit: int
    
    class Config:
        from_attributes = True


class PlantSummary(BaseModel):
    """Summary for dashboard"""
    id: int
    name: str
    code: str
    power: str
    status: str
    location: str
    next_deadline: Optional[datetime] = None
    deadline_color: Optional[str] = None
    compliance_score: int = 0
    
    class Config:
        from_attributes = True


class PlantMetrics(BaseModel):
    """Metrics for an Plant"""
    plant_id: int
    
    # Production
    total_production_kwh: float = 0
    average_monthly_production: float = 0
    average_performance_ratio: float = 0
    
    # Maintenance
    total_maintenances: int = 0
    planned_maintenances: int = 0
    total_maintenance_cost: float = 0
    
    # Compliance
    compliance_score: int = 0
    upcoming_deadlines_30d: int = 0
    expired_documents: int = 0
    
    # Financial
    total_revenue: float = 0
    total_incentives: float = 0
    
    period_start: datetime
    period_end: datetime



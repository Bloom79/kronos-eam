"""
Power Plant models with multi-tenant support
"""

from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, JSON, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship, foreign
import enum

from app.models.base import BaseModel


class PlantStatusEnum(str, enum.Enum):
    IN_OPERATION = "In Operation"
    IN_AUTHORIZATION = "In Authorization"
    UNDER_CONSTRUCTION = "Under Construction"
    DECOMMISSIONED = "Decommissioned"


class PlantTypeEnum(str, enum.Enum):
    PHOTOVOLTAIC = "Photovoltaic"
    WIND = "Wind"
    HYDROELECTRIC = "Hydroelectric"
    BIOMASS = "Biomass"
    GEOTHERMAL = "Geothermal"


class MaintenanceTypeEnum(str, enum.Enum):
    ORDINARY = "Ordinary"
    EXTRAORDINARY = "Extraordinary"
    PREDICTIVE = "Predictive"
    CORRECTIVE = "Corrective"


class MaintenanceStatusEnum(str, enum.Enum):
    COMPLETED = "Completed"
    PLANNED = "Planned"
    IN_PROGRESS = "In Progress"
    CANCELLED = "Cancelled"


class Plant(BaseModel):
    """Main power plant model"""
    __tablename__ = "plants"
    
    # Basic info
    name = Column(String(200), nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    power = Column(String(50), nullable=False)  # e.g., "1.2 MW"
    power_kw = Column(Float, nullable=False)  # Numeric value in kW
    
    # Status
    status = Column(Enum(PlantStatusEnum), nullable=False)
    type = Column(Enum(PlantTypeEnum), nullable=False)
    
    # Location
    location = Column(String(200), nullable=False)
    address = Column(String(500))
    municipality = Column(String(100))
    province = Column(String(10))
    region = Column(String(50))
    latitude = Column(Float)
    longitude = Column(Float)
    
    # Next deadline tracking
    next_deadline = Column(DateTime)
    next_deadline_type = Column(String(100))
    deadline_color = Column(String(20))  # Color coding for UI
    
    # Technical details (stored as related record)
    registry_id = Column(Integer, ForeignKey("plant_registries.id"))
    
    # Integration status
    gse_integration = Column(Boolean, default=False)
    terna_integration = Column(Boolean, default=False)
    customs_integration = Column(Boolean, default=False)
    dso_integration = Column(Boolean, default=False)
    
    # Metadata
    tags = Column(JSON, default=list)
    notes = Column(Text)
    custom_fields = Column(JSON, default=dict)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="plants", primaryjoin="foreign(Plant.tenant_id) == Tenant.id", lazy='select')
    registry = relationship("PlantRegistry", back_populates="plant", uselist=False)
    performance_data = relationship("PlantPerformance", back_populates="plant")
    maintenances = relationship("Maintenance", back_populates="plant")
    checklist = relationship("ComplianceChecklist", back_populates="plant", uselist=False)
    documents = relationship("Document", back_populates="plant")
    workflows = relationship("Workflow", back_populates="plant")
    
    def __repr__(self):
        return f"<Plant {self.code}: {self.name}>"
    
    @property
    def is_active(self) -> bool:
        """Check if plant is active"""
        return self.status == PlantStatusEnum.IN_OPERATION
    
    @property
    def integrations_status(self) -> dict:
        """Get integration status summary"""
        return {
            "gse": self.gse_integration,
            "terna": self.terna_integration,
            "customs": self.customs_integration,
            "dso": self.dso_integration
        }
    
    def calculate_next_deadline(self):
        """Calculate next deadline from various sources"""
        # This would aggregate deadlines from workflows, documents, etc.
        # Implementation depends on business logic
        pass


class PlantRegistry(BaseModel):
    """Technical registry of power plant"""
    __tablename__ = "plant_registries"
    
    # Identifiers
    pod = Column(String(50))
    gaudi = Column(String(50))
    censimp = Column(String(50))
    sapr = Column(String(50))
    pod_code = Column(String(50))  # Alias for pod
    censimp_code = Column(String(50))  # Alias for censimp
    
    # Owner data
    owner = Column(String(200))
    tax_code = Column(String(50))
    pec = Column(String(255))
    phone = Column(String(50))
    
    # Location data
    address = Column(String(500))
    municipality = Column(String(100))
    province = Column(String(10))
    region = Column(String(50))
    latitude = Column(Float)
    longitude = Column(Float)
    
    # Technical data
    technology = Column(String(100))
    connection_type = Column(String(100))
    connection_point = Column(String(200))
    grid_operator = Column(String(100))
    practice_code = Column(String(100))
    workshop_code = Column(String(100))  # For Customs
    
    # Dates
    operation_date = Column(DateTime)
    construction_date = Column(DateTime)
    connection_date = Column(DateTime)
    
    # Administrative
    regime = Column(String(100))  # e.g., "Dedicated Withdrawal", "Net Metering"
    responsible = Column(String(200))
    responsible_email = Column(String(255))
    responsible_phone = Column(String(50))
    
    # Insurance
    insurance = Column(String(200))
    insurance_number = Column(String(100))
    insurance_expiry = Column(DateTime)
    
    # Technical specifications
    occupied_area = Column(Float)  # m²
    module_count = Column(Integer)
    inverter_count = Column(Integer)
    tracker_count = Column(Integer)
    
    # Type-specific fields (JSON for flexibility)
    technical_specs = Column(JSON, default=dict)
    
    # Connection details
    connection_voltage = Column(String(50))
    primary_substation = Column(String(100))
    feeder = Column(String(100))
    
    # Plant reference
    installed_power = Column(Float)  # Copy of main plant power for convenience
    
    # Relationship
    plant = relationship("Plant", back_populates="registry", uselist=False)
    
    def __repr__(self):
        return f"<PlantRegistry POD:{self.pod}>"


class PlantPerformance(BaseModel):
    """Performance data for power plant"""
    __tablename__ = "plant_performance"
    
    plant_id = Column(Integer, ForeignKey("plants.id"), nullable=False)
    
    # Period
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    
    # Production data
    expected_production_kwh = Column(Float)
    actual_production_kwh = Column(Float)
    
    # Performance metrics
    performance_ratio = Column(Float)  # PR
    availability = Column(Float)  # Percentage
    capacity_factor = Column(Float)
    
    # Environmental
    average_irradiation = Column(Float)  # kWh/m²
    average_temperature = Column(Float)  # °C
    
    # Financial
    revenue_euro = Column(Float)
    incentives_euro = Column(Float)
    
    # Detailed daily data (JSON array)
    daily_data = Column(JSON, default=list)
    
    # Relationship
    plant = relationship("Plant", back_populates="performance_data")
    
    def __repr__(self):
        return f"<PlantPerformance {self.plant_id} {self.year}/{self.month}>"


class Maintenance(BaseModel):
    """Maintenance records"""
    __tablename__ = "maintenances"
    
    plant_id = Column(Integer, ForeignKey("plants.id"), nullable=False)
    
    # Schedule
    planned_date = Column(DateTime, nullable=False)
    execution_date = Column(DateTime)
    
    # Type and status
    type = Column(Enum(MaintenanceTypeEnum), nullable=False)
    status = Column(Enum(MaintenanceStatusEnum), nullable=False)
    
    # Details
    description = Column(Text, nullable=False)
    interventions_performed = Column(Text)
    
    # Cost
    estimated_cost = Column(Float)
    actual_cost = Column(Float)
    
    # Execution
    executor = Column(String(200))
    man_hours = Column(Float)
    
    # Documents
    document_ids = Column(JSON, default=list)
    
    # Issues found
    anomalies_detected = Column(JSON, default=list)
    corrective_actions = Column(Text)
    
    # Next maintenance
    next_maintenance = Column(DateTime)
    
    # Relationship
    plant = relationship("Plant", back_populates="maintenances")
    
    def __repr__(self):
        return f"<Maintenance {self.type} {self.planned_date}>"


class ComplianceChecklist(BaseModel):
    """Compliance checklist for power plant"""
    __tablename__ = "compliance_checklists"
    
    plant_id = Column(Integer, ForeignKey("plants.id"), nullable=False, unique=True)
    
    # Main compliance items
    dso_connection = Column(Boolean, default=False)
    dso_connection_date = Column(DateTime)
    dso_connection_expiry = Column(DateTime)
    
    terna_registration = Column(Boolean, default=False)
    terna_registration_date = Column(DateTime)
    terna_registration_number = Column(String(100))
    
    gse_activation = Column(Boolean, default=False)
    gse_activation_date = Column(DateTime)
    gse_activation_agreement = Column(String(100))
    
    customs_license = Column(Boolean, default=False)
    customs_license_date = Column(DateTime)
    customs_license_number = Column(String(100))
    customs_license_expiry = Column(DateTime)
    
    spi_verification = Column(Boolean, default=False)
    spi_verification_date = Column(DateTime)
    spi_verification_next = Column(DateTime)
    
    consumption_declaration = Column(Boolean, default=False)
    consumption_declaration_year = Column(Integer)
    consumption_declaration_expiry = Column(DateTime)
    
    # Additional compliance items
    antimafia = Column(Boolean, default=False)
    antimafia_date = Column(DateTime)
    antimafia_expiry = Column(DateTime)
    
    fuel_mix = Column(Boolean, default=False)
    fuel_mix_date = Column(DateTime)
    fuel_mix_expiry = Column(DateTime)
    
    # Environmental compliance
    via_screening = Column(Boolean, default=False)
    via_screening_date = Column(DateTime)
    
    aia = Column(Boolean, default=False)  # Integrated Environmental Authorization
    aia_number = Column(String(100))
    aia_expiry = Column(DateTime)
    
    # Custom compliance items (JSON)
    custom_items = Column(JSON, default=dict)
    
    # Overall compliance score
    compliance_score = Column(Integer, default=0)  # 0-100
    last_update = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    plant = relationship("Plant", back_populates="checklist", uselist=False)
    
    def __repr__(self):
        return f"<ComplianceChecklist Plant:{self.plant_id} Score:{self.compliance_score}>"
    
    def calculate_score(self) -> int:
        """Calculate compliance score"""
        items = [
            self.dso_connection,
            self.terna_registration,
            self.gse_activation,
            self.customs_license,
            self.spi_verification,
            self.consumption_declaration,
            self.antimafia,
            self.fuel_mix
        ]
        
        completed = sum(1 for item in items if item)
        total = len(items)
        
        self.compliance_score = int((completed / total) * 100)
        return self.compliance_score
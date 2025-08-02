"""
Entity-specific data models for plant workflow information
Stores data collected through workflows for each regulatory entity
"""

from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class PlantDSOData(BaseModel):
    """DSO (Distribution System Operator) specific data for plants"""
    __tablename__ = "plant_dso_data"
    
    plant_id = Column(Integer, ForeignKey("plants.id"), nullable=False, unique=True)
    
    # Connection request data
    tica_code = Column(String(100))
    tica_request_date = Column(DateTime)
    tica_approval_date = Column(DateTime)
    tica_expiry_date = Column(DateTime)
    
    # Connection details
    connection_request_code = Column(String(100))
    connection_power_kw = Column(Float)
    connection_voltage = Column(String(50))
    connection_point = Column(String(200))
    
    # POD and metering
    pod_code = Column(String(50))
    pod_activation_date = Column(DateTime)
    meter_serial = Column(String(100))
    meter_type = Column(String(100))
    meter_installation_date = Column(DateTime)
    
    # Contract details
    contract_number = Column(String(100))
    contract_type = Column(String(100))
    transport_tariff = Column(String(50))
    
    # Technical connection
    primary_substation = Column(String(100))
    feeder_name = Column(String(100))
    transformer_cabin = Column(String(100))
    
    # Work completion
    work_start_date = Column(DateTime)
    work_completion_date = Column(DateTime)
    connection_test_date = Column(DateTime)
    
    # Portal access
    portal_username = Column(String(100))
    portal_last_access = Column(DateTime)
    
    # Additional data
    notes = Column(Text)
    documents = Column(JSON, default=list)
    
    # Tracking fields
    updated_by = Column(Integer, ForeignKey("users.id"))
    updated_from_workflow = Column(Integer, ForeignKey("workflows.id"))
    updated_from_task = Column(Integer, ForeignKey("workflow_tasks.id"))
    last_update = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    plant = relationship("Plant", backref="dso_data")
    updated_by_user = relationship("User")
    source_workflow = relationship("Workflow")
    source_task = relationship("WorkflowTask")


class PlantTernaData(BaseModel):
    """Terna (TSO) specific data for plants"""
    __tablename__ = "plant_terna_data"
    
    plant_id = Column(Integer, ForeignKey("plants.id"), nullable=False, unique=True)
    
    # GAUDÌ registration
    gaudi_code = Column(String(100))
    gaudi_registration_date = Column(DateTime)
    gaudi_practice_number = Column(String(100))
    gaudi_up_code = Column(String(100))  # Production Unit code
    
    # CENSIMP registration
    censimp_code = Column(String(100))
    censimp_section = Column(String(50))
    censimp_registration_date = Column(DateTime)
    
    # Plant identification
    terna_plant_code = Column(String(100))
    terna_connection_code = Column(String(100))
    
    # Technical data
    nominal_power_mw = Column(Float)
    active_power_mw = Column(Float)
    reactive_power_mvar = Column(Float)
    
    # Grid connection
    connection_level = Column(String(50))  # AT, MT, BT
    grid_code_compliance = Column(Boolean, default=False)
    grid_code_version = Column(String(50))
    
    # Metering
    utf_meter_code = Column(String(100))
    utf_validation_date = Column(DateTime)
    
    # Commercial data
    dispatching_point_code = Column(String(100))
    market_zone = Column(String(50))
    
    # Certifications
    anti_islanding_cert = Column(Boolean, default=False)
    anti_islanding_cert_date = Column(DateTime)
    
    # Portal access
    myterna_username = Column(String(100))
    myterna_profile = Column(String(50))
    
    # Additional data
    notes = Column(Text)
    documents = Column(JSON, default=list)
    
    # Tracking fields
    updated_by = Column(Integer, ForeignKey("users.id"))
    updated_from_workflow = Column(Integer, ForeignKey("workflows.id"))
    updated_from_task = Column(Integer, ForeignKey("workflow_tasks.id"))
    last_update = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    plant = relationship("Plant", backref="terna_data")
    updated_by_user = relationship("User")
    source_workflow = relationship("Workflow")
    source_task = relationship("WorkflowTask")


class PlantGSEData(BaseModel):
    """GSE (Energy Services Manager) specific data for plants"""
    __tablename__ = "plant_gse_data"
    
    plant_id = Column(Integer, ForeignKey("plants.id"), nullable=False, unique=True)
    
    # Convention data
    convention_number = Column(String(100))
    convention_type = Column(String(100))  # RID, SSP, TO, etc.
    convention_date = Column(DateTime)
    convention_expiry = Column(DateTime)
    
    # Registration codes
    gse_practice_code = Column(String(100))
    gse_plant_code = Column(String(100))
    sapr_code = Column(String(100))
    
    # Incentive data
    incentive_type = Column(String(100))
    incentive_rate_euro_mwh = Column(Float)
    incentive_duration_years = Column(Integer)
    incentive_start_date = Column(DateTime)
    incentive_end_date = Column(DateTime)
    
    # Energy account
    energy_account_number = Column(String(100))
    bank_iban = Column(String(100))
    payment_frequency = Column(String(50))
    
    # Production data
    estimated_annual_production_mwh = Column(Float)
    incentivized_production_cap_mwh = Column(Float)
    
    # Antimafia
    antimafia_protocol = Column(String(100))
    antimafia_date = Column(DateTime)
    antimafia_expiry = Column(DateTime)
    antimafia_status = Column(String(50))
    
    # Fuel Mix
    fuel_mix_declaration = Column(Boolean, default=False)
    fuel_mix_year = Column(Integer)
    fuel_mix_deadline = Column(DateTime)
    
    # GO (Guarantees of Origin)
    go_enabled = Column(Boolean, default=False)
    go_account_number = Column(String(100))
    
    # Portal access
    gse_username = Column(String(100))
    gse_profile_type = Column(String(50))
    
    # Additional data
    notes = Column(Text)
    documents = Column(JSON, default=list)
    
    # Tracking fields
    updated_by = Column(Integer, ForeignKey("users.id"))
    updated_from_workflow = Column(Integer, ForeignKey("workflows.id"))
    updated_from_task = Column(Integer, ForeignKey("workflow_tasks.id"))
    last_update = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    plant = relationship("Plant", backref="gse_data")
    updated_by_user = relationship("User")
    source_workflow = relationship("Workflow")
    source_task = relationship("WorkflowTask")


class PlantCustomsData(BaseModel):
    """Customs Agency (ADM) specific data for plants"""
    __tablename__ = "plant_customs_data"
    
    plant_id = Column(Integer, ForeignKey("plants.id"), nullable=False, unique=True)
    
    # License data
    license_code = Column(String(100))
    license_type = Column(String(100))  # AD, AS
    license_issue_date = Column(DateTime)
    license_expiry_date = Column(DateTime)
    
    # Workshop data
    workshop_code = Column(String(100))
    workshop_authorization_date = Column(DateTime)
    fiscal_warehouse = Column(Boolean, default=False)
    
    # Declaration data
    annual_consumption_kwh = Column(Float)
    declaration_year = Column(Integer)
    declaration_submission_date = Column(DateTime)
    declaration_protocol = Column(String(100))
    
    # Payment data
    license_fee_amount = Column(Float)
    license_fee_deadline = Column(DateTime)
    payment_date = Column(DateTime)
    payment_receipt = Column(String(100))
    
    # Telematic services
    telematic_code = Column(String(100))
    edi_enabled = Column(Boolean, default=False)
    pudm_username = Column(String(100))
    
    # Meter seals
    seal_number = Column(String(100))
    seal_date = Column(DateTime)
    seal_verification_date = Column(DateTime)
    next_verification_date = Column(DateTime)
    
    # UTF (Customs Technical Office)
    utf_office = Column(String(100))
    utf_inspector = Column(String(100))
    last_inspection_date = Column(DateTime)
    
    # Additional data
    notes = Column(Text)
    documents = Column(JSON, default=list)
    
    # Tracking fields
    updated_by = Column(Integer, ForeignKey("users.id"))
    updated_from_workflow = Column(Integer, ForeignKey("workflows.id"))
    updated_from_task = Column(Integer, ForeignKey("workflow_tasks.id"))
    last_update = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    plant = relationship("Plant", backref="customs_data")
    updated_by_user = relationship("User")
    source_workflow = relationship("Workflow")
    source_task = relationship("WorkflowTask")
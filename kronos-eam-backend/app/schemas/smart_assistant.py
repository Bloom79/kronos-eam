"""
Smart Assistant API Schemas

Defines data models for smart assistant functionality including
form generation, portal integration, and workflow automation.
"""

from datetime import datetime
from enum import Enum
from typing import Dict, Any, List, Optional, Union
from pydantic import BaseModel, Field, ConfigDict


class PortalType(str, Enum):
    """Supported energy sector portals"""
    GSE = "gse"
    TERNA = "terna"
    DSO = "dso"
    DOGANE = "dogane"


class FormType(str, Enum):
    """Available form types per portal"""
    # GSE Forms
    RID_APPLICATION = "rid_application"
    SSP_APPLICATION = "ssp_application"
    ANTIMAFIA_DECLARATION = "antimafia_declaration"
    INCENTIVE_MODIFICATION = "incentive_modification"
    
    # Terna Forms
    PLANT_REGISTRATION = "plant_registration"
    TECHNICAL_UPDATE = "technical_update"
    CONNECTION_MODIFICATION = "connection_modification"
    
    # DSO Forms
    TICA_REQUEST = "tica_request"
    CONNECTION_ACTIVATION = "connection_activation"
    METER_REQUEST = "meter_request"
    
    # Dogane Forms
    UTF_DECLARATION = "utf_declaration"
    LICENSE_APPLICATION = "license_application"
    FEE_PAYMENT = "fee_payment"


class SubmissionStatus(str, Enum):
    """Status of form submissions"""
    PREPARING = "preparing"
    READY = "ready"
    SUBMITTED = "submitted"
    IN_REVIEW = "in_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMPLETED = "completed"


class WorkflowStep(BaseModel):
    """Individual step in a guided workflow"""
    model_config = ConfigDict(from_attributes=True)
    
    step_number: int
    title: str
    instruction: str
    url: Optional[str] = None
    screenshot_path: Optional[str] = None
    estimated_time: Optional[int] = None  # minutes
    requires_authentication: bool = False
    notes: Optional[List[str]] = None


class WorkflowGuide(BaseModel):
    """Complete workflow guide for portal submission"""
    model_config = ConfigDict(from_attributes=True)
    
    portal: PortalType
    form_type: FormType
    title: str
    description: str
    total_steps: int
    estimated_total_time: int  # minutes
    steps: List[WorkflowStep]
    prerequisites: List[str]
    required_documents: List[str]


class FormCalculation(BaseModel):
    """Calculated values for form fields"""
    model_config = ConfigDict(from_attributes=True)
    
    field_name: str
    calculated_value: Union[str, float, int]
    formula_description: str
    source_data: Dict[str, Any]
    confidence_level: float = Field(ge=0, le=1)


class IncentiveCalculation(BaseModel):
    """GSE incentive calculations"""
    model_config = ConfigDict(from_attributes=True)
    
    tariff_type: str  # RID, SSP, etc.
    annual_production_kwh: float
    incentive_rate: float  # €/kWh
    annual_incentive: float  # €
    contract_duration: int  # years
    total_incentive: float  # €
    calculations: List[FormCalculation]


class UTFFeeCalculation(BaseModel):
    """UTF fee calculations for Dogane"""
    model_config = ConfigDict(from_attributes=True)
    
    annual_production_kwh: float
    annual_production_mwh: float
    utf_rate: float = 0.0125  # €/MWh
    annual_fee: float
    is_exempt: bool
    exemption_reason: Optional[str] = None


class SubmissionPackage(BaseModel):
    """Complete package for portal submission"""
    model_config = ConfigDict(from_attributes=True)
    
    package_id: str
    portal: PortalType
    form_type: FormType
    plant_id: int
    tenant_id: str
    
    # Generated content
    forms: List[bytes] = Field(default_factory=list)
    form_names: List[str] = Field(default_factory=list)
    supporting_documents: List[bytes] = Field(default_factory=list)
    document_names: List[str] = Field(default_factory=list)
    
    # Guidance
    workflow_guide: Optional[WorkflowGuide] = None
    checklist: List[str] = Field(default_factory=list)
    
    # Calculations
    calculations: Optional[Union[IncentiveCalculation, UTFFeeCalculation]] = None
    
    # Status tracking
    status: SubmissionStatus = SubmissionStatus.PREPARING
    created_at: datetime = Field(default_factory=datetime.now)
    submitted_at: Optional[datetime] = None
    confirmation_number: Optional[str] = None
    
    # Additional data
    portal_url: str
    estimated_completion_time: int  # minutes
    notes: Optional[str] = None


class FormGenerationRequest(BaseModel):
    """Request to generate forms"""
    model_config = ConfigDict(from_attributes=True)
    
    plant_id: int
    portal: PortalType
    form_type: FormType
    additional_data: Optional[Dict[str, Any]] = None
    include_calculations: bool = True
    include_workflow: bool = True


class FormGenerationResponse(BaseModel):
    """Response with generated forms"""
    model_config = ConfigDict(from_attributes=True)
    
    success: bool
    package: Optional[SubmissionPackage] = None
    error_message: Optional[str] = None
    warnings: List[str] = Field(default_factory=list)


class PortalMonitoringData(BaseModel):
    """Portal status and announcements"""
    model_config = ConfigDict(from_attributes=True)
    
    portal: PortalType
    status: str  # "online", "maintenance", "partial"
    last_checked: datetime
    announcements: List[str] = Field(default_factory=list)
    maintenance_windows: List[Dict[str, Any]] = Field(default_factory=list)
    service_disruptions: List[str] = Field(default_factory=list)


class APIIntegrationStatus(BaseModel):
    """Status of API integrations"""
    model_config = ConfigDict(from_attributes=True)
    
    portal: PortalType
    api_available: bool
    api_version: Optional[str] = None
    authentication_method: str
    last_successful_call: Optional[datetime] = None
    rate_limit_remaining: Optional[int] = None
    error_rate: float = 0.0


class SubmissionTrackingData(BaseModel):
    """Data for tracking submission progress"""
    model_config = ConfigDict(from_attributes=True)
    
    package_id: str
    portal: PortalType
    status: SubmissionStatus
    confirmation_number: Optional[str] = None
    submission_date: Optional[datetime] = None
    expected_response_date: Optional[datetime] = None
    notes: Optional[str] = None
    documents_received: List[str] = Field(default_factory=list)


class SmartAssistantTask(BaseModel):
    """Task for the smart assistant"""
    model_config = ConfigDict(from_attributes=True)
    
    task_id: str
    task_type: str  # "form_generation", "portal_submission", "status_check"
    portal: PortalType
    plant_id: int
    tenant_id: str
    
    # Task details
    title: str
    description: str
    priority: str = "medium"  # "low", "medium", "high", "urgent"
    
    # Assignment
    assigned_to: Optional[str] = None
    assigned_at: Optional[datetime] = None
    due_date: Optional[datetime] = None
    
    # Status
    status: str = "pending"  # "pending", "in_progress", "completed", "failed"
    progress_percentage: int = 0
    
    # Data
    task_data: Dict[str, Any] = Field(default_factory=dict)
    result_data: Optional[Dict[str, Any]] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class CalculationEngineRequest(BaseModel):
    """Request for calculation engine"""
    model_config = ConfigDict(from_attributes=True)
    
    calculation_type: str  # "gse_incentives", "utf_fees", "connection_costs"
    plant_id: int
    calculation_data: Dict[str, Any]
    reference_year: Optional[int] = None


class CalculationEngineResponse(BaseModel):
    """Response from calculation engine"""
    model_config = ConfigDict(from_attributes=True)
    
    success: bool
    calculation_type: str
    result: Optional[Union[IncentiveCalculation, UTFFeeCalculation]] = None
    calculations: List[FormCalculation] = Field(default_factory=list)
    error_message: Optional[str] = None
    warnings: List[str] = Field(default_factory=list)


class DataMappingProfile(BaseModel):
    """Profile for mapping plant data to portal formats"""
    model_config = ConfigDict(from_attributes=True)
    
    portal: PortalType
    form_type: FormType
    mapping_rules: Dict[str, str]  # field_name -> plant_attribute_path
    validation_rules: Dict[str, Any]
    required_fields: List[str]
    calculated_fields: List[str]


class ValidationResult(BaseModel):
    """Result of data validation"""
    model_config = ConfigDict(from_attributes=True)
    
    is_valid: bool
    errors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    missing_fields: List[str] = Field(default_factory=list)
    invalid_fields: List[str] = Field(default_factory=list)


class PortalCredentials(BaseModel):
    """Encrypted portal credentials (for assisted login only)"""
    model_config = ConfigDict(from_attributes=True)
    
    portal: PortalType
    tenant_id: str
    credential_type: str  # "username_password", "api_key", "certificate"
    encrypted_data: str
    created_at: datetime = Field(default_factory=datetime.now)
    expires_at: Optional[datetime] = None
    is_active: bool = True
    
    # Metadata
    description: Optional[str] = None
    last_used: Optional[datetime] = None
    usage_count: int = 0


class CollaborationWorkflow(BaseModel):
    """Collaborative workflow for team submissions"""
    model_config = ConfigDict(from_attributes=True)
    
    workflow_id: str
    title: str
    description: str
    portal: PortalType
    
    # Team assignment
    team_members: List[str]
    current_assignee: Optional[str] = None
    
    # Workflow steps
    total_steps: int
    current_step: int
    steps_completed: List[int] = Field(default_factory=list)
    
    # Status
    status: str = "pending"  # "pending", "in_progress", "review", "completed"
    created_at: datetime = Field(default_factory=datetime.now)
    deadline: Optional[datetime] = None
    
    # Submission package
    package: Optional[SubmissionPackage] = None
    
    # Communication
    comments: List[Dict[str, Any]] = Field(default_factory=list)
    notifications_sent: List[str] = Field(default_factory=list)
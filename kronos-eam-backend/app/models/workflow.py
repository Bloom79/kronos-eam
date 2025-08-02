"""
Workflow models for process automation
"""

from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, JSON, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class WorkflowStatusEnum(str, enum.Enum):
    DRAFT = "Draft"
    ACTIVE = "Active"
    PAUSED = "Paused"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"


class TaskStatusEnum(str, enum.Enum):
    TO_START = "To Start"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    DELAYED = "Delayed"
    BLOCKED = "Blocked"


class ActionStatusEnum(str, enum.Enum):
    WAITING = "Waiting"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"
    DELAYED = "Delayed"


class TaskPriorityEnum(str, enum.Enum):
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class WorkflowCategoryEnum(str, enum.Enum):
    ACTIVATION = "Activation"
    FISCAL = "Fiscal"
    INCENTIVES = "Incentives"
    CHANGES = "Changes"
    MAINTENANCE = "Maintenance"
    COMPLIANCE = "Compliance"


class WorkflowPurposeEnum(str, enum.Enum):
    COMPLETE_ACTIVATION = "Complete Activation"
    SPECIFIC_PROCESS = "Specific Process"
    RECURRING_COMPLIANCE = "Recurring Compliance"
    CUSTOM = "Custom"
    PHASE_COMPONENT = "Phase Component"


class WorkflowPhaseEnum(str, enum.Enum):
    DESIGN = "Design"
    CONNECTION = "Connection"
    REGISTRATION = "Registration"
    FISCAL = "Fiscal"


class EntityEnum(str, enum.Enum):
    DSO = "DSO"
    TERNA = "Terna"
    GSE = "GSE"
    CUSTOMS = "Customs"
    MUNICIPALITY = "Municipality"
    REGION = "Region"
    SUPERINTENDENCE = "Superintendence"


class WorkflowTypeEnum(str, enum.Enum):
    STANDARD_REGISTRATION = "STANDARD_REGISTRATION"
    SIMPLIFIED_REGISTRATION = "SIMPLIFIED_REGISTRATION"
    ENERGY_COMMUNITY = "ENERGY_COMMUNITY"
    CUSTOM = "CUSTOM"
    COMPOSITE = "COMPOSITE"


class Workflow(BaseModel):
    """Main workflow model"""
    __tablename__ = "workflows"
    
    name = Column(String(200), nullable=False)
    plant_id = Column(Integer, ForeignKey("plants.id"), nullable=False)
    plant_name = Column(String(200))  # Denormalized for performance
    
    type = Column(String(100))
    category = Column(Enum(WorkflowCategoryEnum, values_callable=lambda x: [e.value for e in x]))
    description = Column(Text)
    
    current_status = Column(String(100))
    progress = Column(Float, default=0)  # 0-100
    
    created_date = Column(DateTime, default=datetime.utcnow)
    due_date = Column(DateTime)
    completion_date = Column(DateTime)
    
    template_id = Column(Integer, ForeignKey("workflow_templates.id"))
    
    # Enhanced workflow support
    parent_workflow_id = Column(Integer, ForeignKey("workflows.id"))
    original_workflow_id = Column(Integer, ForeignKey("workflows.id"))
    is_standard = Column(Boolean, default=False)
    workflow_type = Column(Enum(WorkflowTypeEnum, values_callable=lambda x: [e.value for e in x]))
    
    # Renewable energy specific fields
    involved_entities = Column(JSON, default=list)  # List of EntityEnum values
    plant_power = Column(Float)  # kW - determines applicable workflows
    plant_type = Column(String(50))  # Photovoltaic, Wind, etc.
    document_requirements = Column(JSON, default=dict)  # Document requirements
    
    # Integration tracking
    integration_status = Column(JSON, default=dict)  # {entity: status} mapping
    
    # Configuration
    config = Column(JSON, default=dict)
    model_metadata = Column(JSON, default=dict)
    
    # User role tracking
    created_by_role = Column(String(50))  # Role of user who created the workflow (installer, administrator, owner)
    
    # Relationships
    plant = relationship("Plant", back_populates="workflows")
    stages = relationship("WorkflowStage", back_populates="workflow", cascade="all, delete-orphan")
    tasks = relationship("WorkflowTask", back_populates="workflow", cascade="all, delete-orphan")
    template = relationship("WorkflowTemplate")
    
    # Self-referential relationships
    parent_workflow = relationship("Workflow", remote_side="Workflow.id", foreign_keys=[parent_workflow_id])
    sub_workflows = relationship("Workflow", foreign_keys=[parent_workflow_id], back_populates="parent_workflow")
    original_workflow = relationship("Workflow", remote_side="Workflow.id", foreign_keys=[original_workflow_id])
    
    def __repr__(self):
        return f"<Workflow {self.name}>"


class WorkflowStage(BaseModel):
    """Workflow stage/phase"""
    __tablename__ = "workflow_stages"
    
    workflow_id = Column(Integer, ForeignKey("workflows.id"), nullable=False)
    name = Column(String(200), nullable=False)
    order = Column(Integer, nullable=False)
    
    completed = Column(Boolean, default=False)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    
    # Relationships
    workflow = relationship("Workflow", back_populates="stages")
    tasks = relationship("WorkflowTask", back_populates="stage")


class WorkflowTask(BaseModel):
    """Individual task within a workflow"""
    __tablename__ = "workflow_tasks"
    
    workflow_id = Column(Integer, ForeignKey("workflows.id"), nullable=False)
    stage_id = Column(Integer, ForeignKey("workflow_stages.id"))
    
    title = Column(String(200), nullable=False)
    description = Column(Text)
    
    status = Column(Enum(TaskStatusEnum, values_callable=lambda x: [e.value for e in x]), default=TaskStatusEnum.TO_START)
    priority = Column(Enum(TaskPriorityEnum, values_callable=lambda x: [e.value for e in x]), default=TaskPriorityEnum.MEDIUM)
    
    assignee = Column(String(255))  # Email or user identifier
    due_date = Column(DateTime)
    
    estimated_hours = Column(Float)
    actual_hours = Column(Float)
    
    # Dependencies
    dependencies = Column(JSON, default=list)  # List of task IDs
    
    # Integration and Guide Configuration
    integration = Column(Enum(EntityEnum, values_callable=lambda x: [e.value for e in x]))  # Portal/system to use (GSE, Terna, etc.)
    guide_config = Column(JSON, default=dict)  # Instructions and guidance for the task
    
    # Entity-specific fields
    responsible_entity = Column(Enum(EntityEnum, values_callable=lambda x: [e.value for e in x]))
    practice_type = Column(String(100))  # TICA, GAUDÌ, RID, etc.
    practice_code = Column(String(100))  # External reference number
    portal_url = Column(String(500))  # Portal URL for this task
    required_credentials = Column(String(50))  # SPID, CIE, CNS, etc.
    
    # Enhanced action management fields
    timeline = Column(JSON, default=dict)  # {start, end, deadline}
    associated_documents = Column(JSON, default=list)  # List of document IDs
    audit_enabled = Column(Boolean, default=True)
    action_status = Column(Enum(ActionStatusEnum, values_callable=lambda x: [e.value for e in x]))
    
    # Guide and instruction fields
    instructions = Column(Text)  # Detailed step-by-step instructions
    checklist_items = Column(JSON, default=list)  # List of checklist items to complete
    external_resources = Column(JSON, default=list)  # Links to guides, forms, portals
    allowed_roles = Column(JSON, default=list)  # List of roles that can handle this task
    suggested_assignee_role = Column(String(50))  # Suggested role for this task
    
    # Data collection configuration
    data_fields = Column(JSON, default=dict)  # Fields this task collects
    target_table = Column(String(100))  # Where data should be stored
    target_fields = Column(JSON, default=dict)  # Mapping of form fields to table columns
    completed_data = Column(JSON, default=dict)  # Actual data collected
    
    # Completion
    completed_by = Column(String(255))
    completed_date = Column(DateTime)
    
    # Relationships
    workflow = relationship("Workflow", back_populates="tasks")
    stage = relationship("WorkflowStage", back_populates="tasks")
    documents = relationship("TaskDocument", back_populates="task", cascade="all, delete-orphan")
    comments = relationship("TaskComment", back_populates="task", cascade="all, delete-orphan")
    
    @property
    def is_overdue(self):
        """Check if task is overdue based on timeline"""
        if self.timeline and self.timeline.get('deadline'):
            from datetime import datetime
            deadline = datetime.fromisoformat(self.timeline['deadline'])
            return datetime.utcnow() > deadline
        return False
    
    def __repr__(self):
        return f"<WorkflowTask {self.title}>"


class TaskDocument(BaseModel):
    """Documents attached to tasks"""
    __tablename__ = "task_documents"
    
    task_id = Column(Integer, ForeignKey("workflow_tasks.id"), nullable=False)
    
    name = Column(String(255), nullable=False)
    type = Column(String(10))  # PDF, DOC, etc.
    size = Column(Integer)  # Bytes
    
    url = Column(String(500))
    document_id = Column(Integer, ForeignKey("documents.id"))
    
    document_type = Column(String(50))  # "sent", "received"
    
    # Relationship
    task = relationship("WorkflowTask", back_populates="documents")
    
    def __repr__(self):
        return f"<TaskDocument {self.name}>"


class TaskComment(BaseModel):
    """Comments on tasks"""
    __tablename__ = "task_comments"
    
    task_id = Column(Integer, ForeignKey("workflow_tasks.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    text = Column(Text, nullable=False)
    
    # Relationships
    task = relationship("WorkflowTask", back_populates="comments")
    user = relationship("User")
    
    def __repr__(self):
        return f"<TaskComment by {self.user_id}>"


class WorkflowTemplate(BaseModel):
    """Predefined workflow templates"""
    __tablename__ = "workflow_templates"
    
    name = Column(String(200), nullable=False)
    description = Column(Text)
    category = Column(Enum(WorkflowCategoryEnum, values_callable=lambda x: [e.value for e in x]))
    phase = Column(Enum(WorkflowPhaseEnum, values_callable=lambda x: [e.value for e in x]), nullable=True)  # Workflow phase (null for complete workflows)
    
    # New categorization fields
    workflow_purpose = Column(Enum(WorkflowPurposeEnum, values_callable=lambda x: [e.value for e in x]), nullable=True)
    is_complete_workflow = Column(Boolean, default=True)  # True for complete workflows, False for phase components
    
    plant_type = Column(String(50))  # Photovoltaic, Wind, etc.
    min_power = Column(Float)  # kW - minimum power for applicability
    max_power = Column(Float)  # kW - maximum power for applicability
    
    estimated_duration_days = Column(Integer)
    recurrence = Column(String(50))  # Annual, Monthly, One-time
    
    # Template definition
    stages = Column(JSON, nullable=False)  # List of stage definitions
    tasks = Column(JSON, nullable=False)   # List of task templates
    
    # Entity requirements
    required_entities = Column(JSON, default=list)  # Required entities
    base_documents = Column(JSON, default=list)  # Base document requirements
    
    # Activation rules
    activation_conditions = Column(JSON, default=dict)
    deadline_config = Column(JSON, default=dict)
    
    active = Column(Boolean, default=True)
    
    # Relationships
    document_templates = relationship("WorkflowDocumentTemplate", back_populates="workflow_template")
    
    def __repr__(self):
        return f"<WorkflowTemplate {self.name}>"


class TaskTemplate(BaseModel):
    """Task templates for workflow templates"""
    __tablename__ = "task_templates"
    
    name = Column(String(200), nullable=False)
    description = Column(Text)
    
    default_responsible = Column(String(100))
    estimated_duration_hours = Column(Float)
    
    required_documents = Column(JSON, default=list)
    checkpoints = Column(JSON, default=list)
    
    integration = Column(String(50))  # Portal/system to use
    has_guide = Column(Boolean, default=False)  # Whether detailed guidance is available
    
    def __repr__(self):
        return f"<TaskTemplate {self.name}>"
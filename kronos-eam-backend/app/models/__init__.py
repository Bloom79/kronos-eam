"""
Database models for Kronos EAM
All models support multi-tenant architecture
"""

from app.models.base import Base, TenantMixin, TimestampMixin, AuditMixin
from app.models.tenant import Tenant, TenantPlan
from app.models.user import User, ApiKey, UserSession
from app.models.plant import (
    Plant,
    PlantRegistry,
    PlantPerformance,
    Maintenance,
    ComplianceChecklist
)
from app.models.workflow import (
    Workflow,
    WorkflowStage,
    WorkflowTask,
    TaskDocument,
    TaskComment,
    WorkflowTemplate,
    TaskTemplate
)
from app.models.document import Document, DocumentVersion, DocumentExtraction, DocumentCopy, DocumentTemplate
# from app.models.integration import Integration, IntegrationLog, IntegrationCredential
from app.models.notification import Notification, NotificationPreference
from app.models.audit import AuditLog, AuditLogView

__all__ = [
    # Base classes
    "Base",
    "TenantMixin",
    "TimestampMixin",
    "AuditMixin",
    
    # Tenant models
    "Tenant",
    "TenantPlan",
    
    # User models
    "User",
    "ApiKey",
    "UserSession",
    
    # Plant models
    "Plant",
    "PlantRegistry",
    "PlantPerformance",
    "Maintenance",
    "ComplianceChecklist",
    
    # Workflow models
    "Workflow",
    "WorkflowStage",
    "WorkflowTask",
    "TaskDocument",
    "TaskComment",
    "WorkflowTemplate",
    "TaskTemplate",
    
    # Document models
    "Document",
    "DocumentVersion",
    "DocumentExtraction",
    "DocumentCopy",
    "DocumentTemplate",
    
    # Integration models
    # "Integration",
    # "IntegrationLog",
    # "IntegrationCredential",
    
    # Notification models
    "Notification",
    "NotificationPreference",
    
    # Audit models
    "AuditLog",
    "AuditLogView",
]
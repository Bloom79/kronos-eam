"""
External integration models
"""

from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Boolean, JSON, Enum, Text, ForeignKey
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class IntegrationTypeEnum(str, enum.Enum):
    GSE = "GSE"
    TERNA = "Terna"
    DOGANE = "Dogane"
    DSO = "E-Distribuzione"
    PEC = "PEC"
    API = "API"
    EDI = "EDI"
    FTP = "FTP"


class IntegrationStatusEnum(str, enum.Enum):
    CONNESSO = "Connesso"
    DISCONNESSO = "Disconnesso"
    ERRORE = "Errore"
    IN_MANUTENZIONE = "In Maintenance"
    CONFIGURAZIONE = "In Configurazione"


class Integration(BaseModel):
    """External service integrations"""
    __tablename__ = "integrations"
    
    name = Column(String(100), nullable=False)
    type = Column(Enum(IntegrationTypeEnum), nullable=False)
    status = Column(Enum(IntegrationStatusEnum), default=IntegrationStatusEnum.DISCONNESSO)
    
    # Connection details
    connection_type = Column(String(50))  # API, RPA, EDI, PEC
    endpoint = Column(String(500))
    configuration = Column(JSON, default=dict)
    
    # Status
    last_sync = Column(DateTime)
    next_sync = Column(DateTime)
    
    # Metrics
    messages_in_queue = Column(Integer, default=0)
    messages_processed = Column(Integer, default=0)
    errors = Column(Integer, default=0)
    last_error = Column(Text)
    
    # Scheduling
    is_enabled = Column(Boolean, default=True)
    schedule_config = Column(JSON, default=dict)  # Cron expression or interval
    
    # Relationships
    logs = relationship("IntegrationLog", back_populates="integration", cascade="all, delete-orphan")
    credentials = relationship("IntegrationCredential", back_populates="integration", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Integration {self.name} - {self.status}>"


class IntegrationLog(BaseModel):
    """Integration activity logs"""
    __tablename__ = "integration_logs"
    
    integration_id = Column(Integer, ForeignKey("integrations.id"), nullable=False)
    
    # Log details
    type = Column(String(50))  # sync, error, warning, info
    action = Column(String(100))  # login, download, upload, process
    
    message = Column(Text)
    details = Column(JSON, default=dict)
    
    # Metrics
    duration_ms = Column(Integer)  # Duration in milliseconds
    records_processed = Column(Integer)
    records_with_errors = Column(Integer)
    
    # Status
    is_successful = Column(Boolean, default=True)
    error_message = Column(Text)
    
    # Timestamps handled by BaseModel
    
    # Relationship
    integration = relationship("Integration", back_populates="logs")
    
    def __repr__(self):
        return f"<IntegrationLog {self.integration_id} - {self.type}>"


class IntegrationCredential(BaseModel):
    """Secure credential storage for integrations"""
    __tablename__ = "integration_credentials"
    
    integration_id = Column(Integer, ForeignKey("integrations.id"), nullable=False)
    
    # Credential info
    name = Column(String(100), nullable=False)
    type = Column(String(50))  # username_password, certificate, api_key, oauth
    
    # Encrypted storage
    encrypted_value = Column(Text, nullable=False)
    
    # Validity
    valid_from = Column(DateTime, default=datetime.utcnow)
    valid_until = Column(DateTime)
    
    # Metadata
    credential_metadata = Column("metadata", JSON, default=dict)
    
    # Relationship
    integration = relationship("Integration", back_populates="credentials")
    
    def __repr__(self):
        return f"<IntegrationCredential {self.name}>"


class IntegrationMapping(BaseModel):
    """Field mappings for data synchronization"""
    __tablename__ = "integration_mappings"
    
    integration_id = Column(Integer, ForeignKey("integrations.id"), nullable=False)
    
    # Mapping details
    entity = Column(String(50))  # impianto, documento, workflow
    
    # Field mappings
    source_fields = Column(JSON, nullable=False)  # External field names
    destination_fields = Column(JSON, nullable=False)  # Internal field names
    transformations = Column(JSON, default=dict)  # Transformation rules
    
    # Validation
    validations = Column(JSON, default=dict)
    
    is_active = Column(Boolean, default=True)
    
    def __repr__(self):
        return f"<IntegrationMapping {self.integration_id} - {self.entity}>"


class EDIMessage(BaseModel):
    """EDI message tracking"""
    __tablename__ = "edi_messages"
    
    integration_id = Column(Integer, ForeignKey("integrations.id"), nullable=False)
    
    # Message details
    message_type = Column(String(50))  # ORDERS, INVOIC, DESADV
    message_number = Column(String(100), unique=True)
    
    direction = Column(String(10))  # IN, OUT
    
    # Content
    content = Column(Text)
    format = Column(String(20))  # EDIFACT, XML, X12
    
    # Status
    status = Column(String(50))  # pending, sent, received, processed, error
    sent_at = Column(DateTime)
    received_at = Column(DateTime)
    processed_at = Column(DateTime)
    
    # Error handling
    error_message = Column(Text)
    retry_attempts = Column(Integer, default=0)
    
    # References
    internal_reference = Column(String(100))  # Order ID, Invoice ID, etc.
    
    def __repr__(self):
        return f"<EDIMessage {self.message_number} - {self.status}>"
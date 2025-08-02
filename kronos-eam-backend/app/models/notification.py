"""
Notification models for user alerts and messages
"""

from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Boolean, JSON, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class NotificationTypeEnum(str, enum.Enum):
    SCADENZA = "scadenza"
    TASK = "task"
    SISTEMA = "sistema"
    INTEGRAZIONE = "integrazione"
    WORKFLOW = "workflow"
    DOCUMENTO = "documento"
    MANUTENZIONE = "manutenzione"
    ALERT = "alert"


class NotificationPriorityEnum(str, enum.Enum):
    ALTA = "alta"
    MEDIA = "media"
    BASSA = "bassa"


class NotificationChannelEnum(str, enum.Enum):
    WEB = "web"
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"


class Notification(BaseModel):
    """User notifications"""
    __tablename__ = "notifications"
    
    # Recipient
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Content
    tipo = Column(Enum(NotificationTypeEnum), nullable=False)
    titolo = Column(String(200), nullable=False)
    messaggio = Column(Text, nullable=False)
    priorita = Column(Enum(NotificationPriorityEnum), default=NotificationPriorityEnum.MEDIA)
    
    # Status
    letta = Column(Boolean, default=False)
    data_lettura = Column(DateTime)
    
    # References
    impianto_id = Column(Integer, ForeignKey("plants.id"))
    workflow_id = Column(Integer, ForeignKey("workflows.id"))
    documento_id = Column(Integer, ForeignKey("documents.id"))
    
    # Action
    link = Column(String(500))  # URL or route to navigate
    azione = Column(String(100))  # Action identifier
    azione_eseguita = Column(Boolean, default=False)
    
    # Delivery
    canali = Column(JSON, default=["web"])  # List of channels
    inviata = Column(Boolean, default=False)
    data_invio = Column(DateTime)
    
    # Metadata
    model_metadata = Column(JSON, default=dict)
    
    # Relationships
    user = relationship("User")
    impianto = relationship("Plant")
    workflow = relationship("Workflow")
    documento = relationship("Document")
    
    def __repr__(self):
        return f"<Notification {self.tipo} - {self.titolo}>"


class NotificationPreference(BaseModel):
    """User notification preferences"""
    __tablename__ = "notification_preferences"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    
    # Channel preferences
    email_enabled = Column(Boolean, default=True)
    sms_enabled = Column(Boolean, default=False)
    push_enabled = Column(Boolean, default=True)
    
    # Type preferences
    scadenze_enabled = Column(Boolean, default=True)
    task_enabled = Column(Boolean, default=True)
    sistema_enabled = Column(Boolean, default=True)
    workflow_enabled = Column(Boolean, default=True)
    
    # Timing preferences
    quiet_hours_start = Column(String(5))  # HH:MM
    quiet_hours_end = Column(String(5))    # HH:MM
    timezone = Column(String(50), default="Europe/Rome")
    
    # Frequency
    digest_enabled = Column(Boolean, default=False)
    digest_frequency = Column(String(20))  # daily, weekly
    digest_time = Column(String(5))  # HH:MM
    
    # Filtering
    min_priority = Column(Enum(NotificationPriorityEnum), default=NotificationPriorityEnum.BASSA)
    
    # Relationship
    user = relationship("User")
    
    def __repr__(self):
        return f"<NotificationPreference user:{self.user_id}>"


class NotificationTemplate(BaseModel):
    """Templates for notification messages"""
    __tablename__ = "notification_templates"
    
    # Template identification
    codice = Column(String(50), unique=True, nullable=False)
    nome = Column(String(200), nullable=False)
    tipo = Column(Enum(NotificationTypeEnum), nullable=False)
    
    # Content templates
    titolo_template = Column(String(500), nullable=False)
    messaggio_template = Column(Text, nullable=False)
    
    # Channel-specific templates
    email_subject = Column(String(500))
    email_template = Column(Text)
    sms_template = Column(String(500))
    
    # Variables
    variabili = Column(JSON, default=list)  # List of available variables
    
    # Configuration
    priorita_default = Column(Enum(NotificationPriorityEnum), default=NotificationPriorityEnum.MEDIA)
    canali_default = Column(JSON, default=["web"])
    
    attivo = Column(Boolean, default=True)
    
    def __repr__(self):
        return f"<NotificationTemplate {self.codice}>"


class NotificationQueue(BaseModel):
    """Queue for outbound notifications"""
    __tablename__ = "notification_queue"
    
    notification_id = Column(Integer, ForeignKey("notifications.id"), nullable=False)
    canale = Column(Enum(NotificationChannelEnum), nullable=False)
    
    # Recipient details
    destinatario = Column(String(500), nullable=False)  # Email, phone, device token
    
    # Status
    stato = Column(String(50), default="pending")  # pending, sending, sent, failed
    tentativi = Column(Integer, default=0)
    max_tentativi = Column(Integer, default=3)
    
    # Scheduling
    programmata_per = Column(DateTime, default=datetime.utcnow)
    inviata_il = Column(DateTime)
    
    # Error tracking
    ultimo_errore = Column(Text)
    
    # Relationship
    notification = relationship("Notification")
    
    def __repr__(self):
        return f"<NotificationQueue {self.notification_id} - {self.canale}>"
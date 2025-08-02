"""
Audit and logging models for compliance tracking
"""

from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, JSON, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
import enum

from app.models.base import Base, TenantMixin


class TipoModificaEnum(str, enum.Enum):
    CREAZIONE = "Creazione"
    AGGIORNAMENTO = "Aggiornamento"
    STATO_CAMBIO = "Stato_Cambio"
    RESPONSABILE_CAMBIO = "Responsabile_Cambio"
    ELIMINAZIONE = "Eliminazione"


class AuditLog(Base, TenantMixin):
    """Complete audit trail for all entity changes"""
    __tablename__ = "audit_logs"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Entity tracking
    entity_type = Column(String(50), nullable=False)  # workflow, task, document, etc.
    entity_id = Column(Integer, nullable=False)
    
    # Change details
    tipo_modifica = Column(Enum(TipoModificaEnum), nullable=False)
    dettaglio_modifica = Column(JSON, default=dict)
    
    # User tracking
    utente_id = Column(Integer, ForeignKey("users.id"))
    ip_address = Column(String(45))  # IPv4 or IPv6
    user_agent = Column(String(500))
    
    # Additional context
    session_id = Column(String(100))
    request_id = Column(String(100))
    
    # Change content
    old_values = Column(JSON)  # Previous state
    new_values = Column(JSON)  # New state
    changed_fields = Column(JSON, default=list)  # List of fields that changed
    
    # Metadata
    note = Column(Text)  # Optional user-provided reason
    automatic = Column(Integer, default=0)  # 1 if system-generated change
    
    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    utente = relationship("User")
    
    def __repr__(self):
        return f"<AuditLog {self.entity_type}:{self.entity_id} - {self.tipo_modifica}>"
    
    @property
    def is_critical_change(self):
        """Check if this is a critical change requiring special attention"""
        critical_entities = ["workflow", "document", "user"]
        critical_types = [TipoModificaEnum.ELIMINAZIONE, TipoModificaEnum.RESPONSABILE_CAMBIO]
        
        return (self.entity_type.lower() in critical_entities or 
                self.tipo_modifica in critical_types)
    
    @property
    def summary(self):
        """Generate human-readable summary of the change"""
        summaries = {
            TipoModificaEnum.CREAZIONE: f"Created new {self.entity_type}",
            TipoModificaEnum.AGGIORNAMENTO: f"Updated {self.entity_type}",
            TipoModificaEnum.STATO_CAMBIO: f"Changed status of {self.entity_type}",
            TipoModificaEnum.RESPONSABILE_CAMBIO: f"Changed responsible party for {self.entity_type}",
            TipoModificaEnum.ELIMINAZIONE: f"Deleted {self.entity_type}"
        }
        
        base_summary = summaries.get(self.tipo_modifica, f"Modified {self.entity_type}")
        
        if self.changed_fields:
            fields = ", ".join(self.changed_fields[:3])
            if len(self.changed_fields) > 3:
                fields += f" and {len(self.changed_fields) - 3} more"
            base_summary += f" ({fields})"
        
        return base_summary


class AuditLogView(Base):
    """Materialized view for efficient audit log queries"""
    __tablename__ = "audit_log_view"
    __table_args__ = {'info': {'is_view': True}}
    
    id = Column(Integer, primary_key=True)
    entity_type = Column(String(50))
    entity_id = Column(Integer)
    entity_name = Column(String(255))  # Denormalized entity name
    
    tipo_modifica = Column(String(50))
    utente_nome = Column(String(255))  # Denormalized user name
    utente_email = Column(String(255))  # Denormalized user email
    
    created_at = Column(DateTime)
    tenant_id = Column(Integer)
    
    summary = Column(Text)  # Pre-computed summary
    is_critical = Column(Integer)  # Pre-computed critical flag
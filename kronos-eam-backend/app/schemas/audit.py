"""
Audit schemas for API requests and responses
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

from app.models.audit import TipoModificaEnum


class AuditLogResponse(BaseModel):
    """Audit log response schema"""
    id: int
    entity_type: str
    entity_id: int
    tipo_modifica: TipoModificaEnum
    dettaglio_modifica: Dict[str, Any]
    utente_id: Optional[int]
    ip_address: Optional[str]
    user_agent: Optional[str]
    old_values: Optional[Dict[str, Any]]
    new_values: Optional[Dict[str, Any]]
    changed_fields: List[str]
    note: Optional[str]
    automatic: bool
    created_at: datetime
    summary: str
    is_critical_change: bool
    
    # Include user details if available
    utente_email: Optional[str] = None
    utente_nome: Optional[str] = None
    
    class Config:
        from_attributes = True
        
    @classmethod
    def from_orm(cls, obj):
        data = {
            "id": obj.id,
            "entity_type": obj.entity_type,
            "entity_id": obj.entity_id,
            "tipo_modifica": obj.tipo_modifica,
            "dettaglio_modifica": obj.dettaglio_modifica or {},
            "utente_id": obj.utente_id,
            "ip_address": obj.ip_address,
            "user_agent": obj.user_agent,
            "old_values": obj.old_values,
            "new_values": obj.new_values,
            "changed_fields": obj.changed_fields or [],
            "note": obj.note,
            "automatic": bool(obj.automatic),
            "created_at": obj.created_at,
            "summary": obj.summary,
            "is_critical_change": obj.is_critical_change
        }
        
        # Add user details if relationship is loaded
        if obj.utente:
            data["utente_email"] = obj.utente.email
            data["utente_nome"] = obj.utente.nome_completo
        
        return cls(**data)


class AuditSearchRequest(BaseModel):
    """Audit search request schema"""
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    user_id: Optional[int] = None
    tipo_modifica: Optional[TipoModificaEnum] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    ip_address: Optional[str] = None
    changed_field: Optional[str] = None
    limit: int = Field(default=100, ge=1, le=1000)
    offset: int = Field(default=0, ge=0)


class AuditSearchResponse(BaseModel):
    """Audit search response schema"""
    logs: List[AuditLogResponse]
    total: int
    limit: int
    offset: int


class ComplianceReportRequest(BaseModel):
    """Compliance report request schema"""
    start_date: datetime
    end_date: datetime
    entity_type: Optional[str] = None


class ComplianceReportResponse(BaseModel):
    """Compliance report response schema"""
    period: Dict[str, str]
    summary: Dict[str, int]
    changes_by_type: Dict[str, int]
    changes_by_entity: Dict[str, int]
    most_active_users: List[Dict[str, Any]]
    report_generated_at: str
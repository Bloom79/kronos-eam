"""
Audit logging service for compliance tracking
"""

from typing import Optional, Dict, Any, List
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
import json

from app.models.audit import AuditLog, TipoModificaEnum
from app.models.user import User
from app.core.config import settings
from app.core.security import get_current_user


class AuditService:
    """Service for managing audit logs and compliance tracking"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def log_change(
        self,
        entity_type: str,
        entity_id: int,
        tipo_modifica: TipoModificaEnum,
        user_id: Optional[int] = None,
        tenant_id: Optional[int] = None,
        old_values: Optional[Dict[str, Any]] = None,
        new_values: Optional[Dict[str, Any]] = None,
        dettaglio_modifica: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        session_id: Optional[str] = None,
        request_id: Optional[str] = None,
        note: Optional[str] = None,
        automatic: bool = False
    ) -> AuditLog:
        """
        Create an audit log entry for an entity change
        
        Args:
            entity_type: Type of entity (workflow, task, document, etc.)
            entity_id: ID of the entity
            tipo_modifica: Type of modification
            user_id: ID of user making the change
            tenant_id: Tenant ID
            old_values: Previous state
            new_values: New state
            dettaglio_modifica: Additional modification details
            ip_address: Client IP address
            user_agent: Client user agent
            session_id: Session identifier
            request_id: Request identifier
            note: Optional user-provided reason
            automatic: Whether this was a system-generated change
            
        Returns:
            Created AuditLog entry
        """
        # Calculate changed fields if both old and new values provided
        changed_fields = []
        if old_values and new_values:
            changed_fields = [
                field for field in new_values 
                if field in old_values and old_values[field] != new_values[field]
            ]
        
        audit_log = AuditLog(
            entity_type=entity_type,
            entity_id=entity_id,
            tipo_modifica=tipo_modifica,
            utente_id=user_id,
            tenant_id=tenant_id,
            old_values=old_values,
            new_values=new_values,
            changed_fields=changed_fields,
            dettaglio_modifica=dettaglio_modifica or {},
            ip_address=ip_address,
            user_agent=user_agent,
            session_id=session_id,
            request_id=request_id,
            note=note,
            automatic=1 if automatic else 0
        )
        
        self.db.add(audit_log)
        self.db.commit()
        self.db.refresh(audit_log)
        
        return audit_log
    
    def get_entity_history(
        self,
        entity_type: str,
        entity_id: int,
        tenant_id: int,
        limit: int = 50,
        offset: int = 0
    ) -> List[AuditLog]:
        """
        Get audit history for a specific entity
        
        Args:
            entity_type: Type of entity
            entity_id: ID of the entity
            tenant_id: Tenant ID
            limit: Maximum number of records to return
            offset: Number of records to skip
            
        Returns:
            List of audit log entries
        """
        query = self.db.query(AuditLog).filter(
            AuditLog.entity_type == entity_type,
            AuditLog.entity_id == entity_id,
            AuditLog.tenant_id == tenant_id
        ).order_by(AuditLog.created_at.desc())
        
        return query.offset(offset).limit(limit).all()
    
    def get_user_activity(
        self,
        user_id: int,
        tenant_id: int,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        entity_type: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[AuditLog]:
        """
        Get activity logs for a specific user
        
        Args:
            user_id: User ID
            tenant_id: Tenant ID
            start_date: Start date for filtering
            end_date: End date for filtering
            entity_type: Optional entity type filter
            limit: Maximum number of records
            offset: Number of records to skip
            
        Returns:
            List of audit log entries
        """
        query = self.db.query(AuditLog).filter(
            AuditLog.utente_id == user_id,
            AuditLog.tenant_id == tenant_id
        )
        
        if start_date:
            query = query.filter(AuditLog.created_at >= start_date)
        if end_date:
            query = query.filter(AuditLog.created_at <= end_date)
        if entity_type:
            query = query.filter(AuditLog.entity_type == entity_type)
        
        return query.order_by(AuditLog.created_at.desc()).offset(offset).limit(limit).all()
    
    def get_critical_changes(
        self,
        tenant_id: int,
        start_date: Optional[datetime] = None,
        limit: int = 50
    ) -> List[AuditLog]:
        """
        Get critical changes that require attention
        
        Args:
            tenant_id: Tenant ID
            start_date: Start date for filtering
            limit: Maximum number of records
            
        Returns:
            List of critical audit log entries
        """
        query = self.db.query(AuditLog).filter(
            AuditLog.tenant_id == tenant_id
        )
        
        if start_date:
            query = query.filter(AuditLog.created_at >= start_date)
        
        # Filter for critical changes
        critical_entities = ["workflow", "document", "user"]
        critical_types = [TipoModificaEnum.ELIMINAZIONE, TipoModificaEnum.RESPONSABILE_CAMBIO]
        
        query = query.filter(
            (AuditLog.entity_type.in_(critical_entities)) |
            (AuditLog.tipo_modifica.in_(critical_types))
        )
        
        return query.order_by(AuditLog.created_at.desc()).limit(limit).all()
    
    def get_compliance_report(
        self,
        tenant_id: int,
        start_date: datetime,
        end_date: datetime,
        entity_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate compliance report for audit trail
        
        Args:
            tenant_id: Tenant ID
            start_date: Start date
            end_date: End date
            entity_type: Optional entity type filter
            
        Returns:
            Compliance report with statistics
        """
        base_query = self.db.query(AuditLog).filter(
            AuditLog.tenant_id == tenant_id,
            AuditLog.created_at >= start_date,
            AuditLog.created_at <= end_date
        )
        
        if entity_type:
            base_query = base_query.filter(AuditLog.entity_type == entity_type)
        
        # Get total changes
        total_changes = base_query.count()
        
        # Get changes by type
        changes_by_type = {}
        for tipo in TipoModificaEnum:
            count = base_query.filter(AuditLog.tipo_modifica == tipo).count()
            changes_by_type[tipo.value] = count
        
        # Get changes by entity
        changes_by_entity = {}
        entity_counts = base_query.with_entities(
            AuditLog.entity_type,
            func.count(AuditLog.id)
        ).group_by(AuditLog.entity_type).all()
        
        for entity_type, count in entity_counts:
            changes_by_entity[entity_type] = count
        
        # Get most active users
        user_activity = base_query.with_entities(
            AuditLog.utente_id,
            func.count(AuditLog.id).label('change_count')
        ).filter(
            AuditLog.utente_id.isnot(None)
        ).group_by(
            AuditLog.utente_id
        ).order_by(
            func.count(AuditLog.id).desc()
        ).limit(10).all()
        
        # Get user details
        active_users = []
        for user_id, change_count in user_activity:
            user = self.db.query(User).filter(User.id == user_id).first()
            if user:
                active_users.append({
                    "user_id": user_id,
                    "user_email": user.email,
                    "user_name": user.nome_completo,
                    "change_count": change_count
                })
        
        # Get critical changes count
        critical_changes = base_query.filter(
            (AuditLog.entity_type.in_(["workflow", "document", "user"])) |
            (AuditLog.tipo_modifica.in_([TipoModificaEnum.ELIMINAZIONE, TipoModificaEnum.RESPONSABILE_CAMBIO]))
        ).count()
        
        return {
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            },
            "summary": {
                "total_changes": total_changes,
                "critical_changes": critical_changes,
                "automatic_changes": base_query.filter(AuditLog.automatic == 1).count(),
                "manual_changes": base_query.filter(AuditLog.automatic == 0).count()
            },
            "changes_by_type": changes_by_type,
            "changes_by_entity": changes_by_entity,
            "most_active_users": active_users,
            "report_generated_at": datetime.utcnow().isoformat()
        }
    
    def search_audit_logs(
        self,
        tenant_id: int,
        search_params: Dict[str, Any]
    ) -> List[AuditLog]:
        """
        Search audit logs with multiple criteria
        
        Args:
            tenant_id: Tenant ID
            search_params: Search parameters including:
                - entity_type: Entity type filter
                - entity_id: Entity ID filter
                - user_id: User ID filter
                - tipo_modifica: Modification type filter
                - start_date: Start date filter
                - end_date: End date filter
                - ip_address: IP address filter
                - changed_field: Field that was changed
                - limit: Maximum results
                - offset: Skip results
                
        Returns:
            List of matching audit logs
        """
        query = self.db.query(AuditLog).filter(AuditLog.tenant_id == tenant_id)
        
        # Apply filters
        if search_params.get("entity_type"):
            query = query.filter(AuditLog.entity_type == search_params["entity_type"])
        
        if search_params.get("entity_id"):
            query = query.filter(AuditLog.entity_id == search_params["entity_id"])
        
        if search_params.get("user_id"):
            query = query.filter(AuditLog.utente_id == search_params["user_id"])
        
        if search_params.get("tipo_modifica"):
            query = query.filter(AuditLog.tipo_modifica == search_params["tipo_modifica"])
        
        if search_params.get("start_date"):
            query = query.filter(AuditLog.created_at >= search_params["start_date"])
        
        if search_params.get("end_date"):
            query = query.filter(AuditLog.created_at <= search_params["end_date"])
        
        if search_params.get("ip_address"):
            query = query.filter(AuditLog.ip_address == search_params["ip_address"])
        
        if search_params.get("changed_field"):
            # Search within JSON array
            query = query.filter(
                AuditLog.changed_fields.contains([search_params["changed_field"]])
            )
        
        # Apply ordering
        query = query.order_by(AuditLog.created_at.desc())
        
        # Apply pagination
        limit = search_params.get("limit", 100)
        offset = search_params.get("offset", 0)
        
        return query.offset(offset).limit(limit).all()


# Audit context manager for automatic logging
class AuditContext:
    """Context manager for automatic audit logging"""
    
    def __init__(
        self,
        db: Session,
        entity_type: str,
        entity_id: int,
        tipo_modifica: TipoModificaEnum,
        user_id: int,
        tenant_id: int,
        **kwargs
    ):
        self.service = AuditService(db)
        self.entity_type = entity_type
        self.entity_id = entity_id
        self.tipo_modifica = tipo_modifica
        self.user_id = user_id
        self.tenant_id = tenant_id
        self.kwargs = kwargs
        self.old_values = None
        self.new_values = None
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is None:
            # Only log if no exception occurred
            self.service.log_change(
                entity_type=self.entity_type,
                entity_id=self.entity_id,
                tipo_modifica=self.tipo_modifica,
                user_id=self.user_id,
                tenant_id=self.tenant_id,
                old_values=self.old_values,
                new_values=self.new_values,
                **self.kwargs
            )
        return False
    
    def set_old_values(self, values: Dict[str, Any]):
        """Set the old values for comparison"""
        self.old_values = values
    
    def set_new_values(self, values: Dict[str, Any]):
        """Set the new values for comparison"""
        self.new_values = values
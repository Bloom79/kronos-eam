"""
Decorators for automatic audit logging
"""

from functools import wraps
from typing import Optional, Callable, Any, Dict
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.services.audit_service import AuditService
from app.models.audit import TipoModificaEnum


def audit_action(
    entity_type: str,
    tipo_modifica: TipoModificaEnum,
    entity_id_param: str = "id",
    capture_old_state: bool = False,
    capture_new_state: bool = False,
    note_param: Optional[str] = None
):
    """
    Decorator for automatic audit logging of API actions
    
    Args:
        entity_type: Type of entity being modified
        tipo_modifica: Type of modification
        entity_id_param: Parameter name containing entity ID
        capture_old_state: Whether to capture entity state before modification
        capture_new_state: Whether to capture entity state after modification
        note_param: Parameter name containing optional note
        
    Usage:
        @audit_action("workflow", TipoModificaEnum.AGGIORNAMENTO)
        def update_workflow(id: int, ...):
            ...
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract necessary parameters
            db: Optional[Session] = kwargs.get("db")
            current_user = kwargs.get("current_user")
            request = kwargs.get("request")
            
            if not db or not current_user:
                # If required parameters not found, execute without audit
                return await func(*args, **kwargs)
            
            # Get entity ID
            entity_id = kwargs.get(entity_id_param)
            if not entity_id:
                # Try to extract from path parameters
                if hasattr(func, "__self__") and hasattr(func.__self__, "path_params"):
                    entity_id = func.__self__.path_params.get(entity_id_param)
            
            if not entity_id:
                # Execute without audit if entity ID not found
                return await func(*args, **kwargs)
            
            # Initialize audit service
            audit_service = AuditService(db)
            
            # Capture old state if requested
            old_values = None
            if capture_old_state:
                # This would need to be customized per entity type
                old_entity = _get_entity(db, entity_type, entity_id)
                if old_entity:
                    old_values = _entity_to_dict(old_entity)
            
            # Get additional context
            ip_address = None
            user_agent = None
            if request:
                ip_address = request.client.host if request.client else None
                user_agent = request.headers.get("user-agent")
            
            note = kwargs.get(note_param) if note_param else None
            
            try:
                # Execute the actual function
                result = await func(*args, **kwargs)
                
                # Capture new state if requested
                new_values = None
                if capture_new_state:
                    new_entity = _get_entity(db, entity_type, entity_id)
                    if new_entity:
                        new_values = _entity_to_dict(new_entity)
                
                # Log the audit entry
                audit_service.log_change(
                    entity_type=entity_type,
                    entity_id=entity_id,
                    tipo_modifica=tipo_modifica,
                    user_id=current_user.id,
                    tenant_id=current_user.tenant_id,
                    old_values=old_values,
                    new_values=new_values,
                    ip_address=ip_address,
                    user_agent=user_agent,
                    note=note
                )
                
                return result
                
            except Exception as e:
                # Log failed attempt if it's a deletion
                if tipo_modifica == TipoModificaEnum.ELIMINAZIONE:
                    audit_service.log_change(
                        entity_type=entity_type,
                        entity_id=entity_id,
                        tipo_modifica=tipo_modifica,
                        user_id=current_user.id,
                        tenant_id=current_user.tenant_id,
                        dettaglio_modifica={"error": str(e), "failed": True},
                        ip_address=ip_address,
                        user_agent=user_agent,
                        note=note
                    )
                raise
        
        # Handle both sync and async functions
        if asyncio.iscoroutinefunction(func):
            return wrapper
        else:
            @wraps(func)
            def sync_wrapper(*args, **kwargs):
                return asyncio.run(wrapper(*args, **kwargs))
            return sync_wrapper
    
    return decorator


def _get_entity(db: Session, entity_type: str, entity_id: int) -> Optional[Any]:
    """Get entity by type and ID"""
    # Import models dynamically to avoid circular imports
    from app.models.workflow import Workflow, WorkflowTask
    from app.models.document import Document
    from app.models.user import User
    from app.models.plant import Plant
    
    entity_map = {
        "workflow": Workflow,
        "task": WorkflowTask,
        "document": Document,
        "user": User,
        "impianto": Plant
    }
    
    model_class = entity_map.get(entity_type.lower())
    if not model_class:
        return None
    
    return db.query(model_class).filter(model_class.id == entity_id).first()


def _entity_to_dict(entity: Any) -> Dict[str, Any]:
    """Convert SQLAlchemy entity to dictionary"""
    if not entity:
        return {}
    
    # Get all column attributes
    result = {}
    for column in entity.__table__.columns:
        value = getattr(entity, column.name)
        
        # Convert non-serializable types
        if hasattr(value, "isoformat"):  # datetime
            value = value.isoformat()
        elif hasattr(value, "value"):  # Enum
            value = value.value
        elif isinstance(value, (list, dict)):  # JSON columns
            pass  # Already serializable
        
        result[column.name] = value
    
    return result


# Import asyncio only if needed
try:
    import asyncio
except ImportError:
    asyncio = None
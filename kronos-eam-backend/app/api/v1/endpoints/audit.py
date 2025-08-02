"""
Audit trail API endpoints
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.models.audit import AuditLog, TipoModificaEnum
from app.schemas.audit import (
    AuditLogResponse, AuditSearchRequest, AuditSearchResponse,
    ComplianceReportRequest, ComplianceReportResponse
)
from app.services.audit_service import AuditService


router = APIRouter()


@router.get("/entity/{entity_type}/{entity_id}", response_model=List[AuditLogResponse])
async def get_entity_audit_history(
    entity_type: str,
    entity_id: int,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Get audit history for a specific entity"""
    service = AuditService(db)
    
    logs = service.get_entity_history(
        entity_type=entity_type,
        entity_id=entity_id,
        tenant_id=current_user.tenant_id,
        limit=limit,
        offset=offset
    )
    
    return logs


@router.get("/user/{user_id}", response_model=List[AuditLogResponse])
async def get_user_activity(
    user_id: int,
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    entity_type: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Get activity logs for a specific user"""
    # Check permissions - only admins can view other users' activity
    if current_user.ruolo != "Admin" and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    service = AuditService(db)
    
    logs = service.get_user_activity(
        user_id=user_id,
        tenant_id=current_user.tenant_id,
        start_date=start_date,
        end_date=end_date,
        entity_type=entity_type,
        limit=limit,
        offset=offset
    )
    
    return logs


@router.get("/critical", response_model=List[AuditLogResponse])
async def get_critical_changes(
    start_date: Optional[datetime] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Get critical changes that require attention"""
    if current_user.ruolo not in ["Admin", "Asset Manager"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    service = AuditService(db)
    
    logs = service.get_critical_changes(
        tenant_id=current_user.tenant_id,
        start_date=start_date,
        limit=limit
    )
    
    return logs


@router.post("/search", response_model=AuditSearchResponse)
async def search_audit_logs(
    search_params: AuditSearchRequest,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Search audit logs with multiple criteria"""
    if current_user.ruolo not in ["Admin", "Asset Manager"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    service = AuditService(db)
    
    # Convert search params to dict
    params = search_params.dict(exclude_unset=True)
    
    logs = service.search_audit_logs(
        tenant_id=current_user.tenant_id,
        search_params=params
    )
    
    return {
        "logs": logs,
        "total": len(logs),
        "limit": params.get("limit", 100),
        "offset": params.get("offset", 0)
    }


@router.post("/compliance-report", response_model=ComplianceReportResponse)
async def generate_compliance_report(
    report_params: ComplianceReportRequest,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Generate compliance report for audit trail"""
    if current_user.ruolo != "Admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    service = AuditService(db)
    
    report = service.get_compliance_report(
        tenant_id=current_user.tenant_id,
        start_date=report_params.start_date,
        end_date=report_params.end_date,
        entity_type=report_params.entity_type
    )
    
    return report


@router.get("/stats/summary")
async def get_audit_summary(
    days: int = Query(7, ge=1, le=90),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Get audit statistics summary"""
    service = AuditService(db)
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Get recent activity
    recent_logs = service.search_audit_logs(
        tenant_id=current_user.tenant_id,
        search_params={
            "start_date": start_date,
            "limit": 1000
        }
    )
    
    # Calculate statistics
    stats = {
        "total_changes": len(recent_logs),
        "changes_by_type": {},
        "changes_by_entity": {},
        "most_active_entities": [],
        "recent_critical_changes": 0
    }
    
    # Count by modification type
    for tipo in TipoModificaEnum:
        count = sum(1 for log in recent_logs if log.tipo_modifica == tipo)
        stats["changes_by_type"][tipo.value] = count
    
    # Count by entity type
    entity_counts = {}
    for log in recent_logs:
        entity_counts[log.entity_type] = entity_counts.get(log.entity_type, 0) + 1
    
    stats["changes_by_entity"] = entity_counts
    
    # Most active entities
    entity_activity = {}
    for log in recent_logs:
        key = f"{log.entity_type}:{log.entity_id}"
        entity_activity[key] = entity_activity.get(key, 0) + 1
    
    sorted_entities = sorted(entity_activity.items(), key=lambda x: x[1], reverse=True)[:10]
    stats["most_active_entities"] = [
        {"entity": k, "changes": v} for k, v in sorted_entities
    ]
    
    # Critical changes
    stats["recent_critical_changes"] = sum(1 for log in recent_logs if log.is_critical_change)
    
    return stats
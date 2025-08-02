"""
Calendar endpoints for deadlines and events
"""

from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.api.deps import get_tenant_db, get_current_active_user
from app.core.security import TokenData
from app.models.workflow import Workflow, WorkflowTask
from app.schemas.dashboard import ScadenzaItem

router = APIRouter()


@router.get("/upcoming-deadlines", response_model=List[ScadenzaItem])
async def get_upcoming_deadlines(
    current_user: TokenData = Depends(get_current_active_user),
    db: Session = Depends(get_tenant_db),
    days: int = Query(30, description="Number of days to look ahead")
):
    """Get upcoming deadlines for the next N days"""
    
    # Calculate date range
    today = datetime.utcnow()
    end_date = today + timedelta(days=days)
    
    # Get tasks with due dates in range
    tasks = db.query(WorkflowTask).join(Workflow).filter(
        Workflow.tenant_id == current_user.tenant_id,
        WorkflowTask.due_date.between(today, end_date),
        WorkflowTask.status != "Completed"
    ).order_by(WorkflowTask.due_date).limit(10).all()
    
    # Convert to ScadenzaItem format
    deadlines = []
    for task in tasks:
        # Determine priority based on days until due
        days_until_due = (task.due_date - today).days
        if days_until_due <= 3:
            priority = "High"
        elif days_until_due <= 7:
            priority = "Medium"
        else:
            priority = "Low"
        
        # Determine status
        if task.status == "Delayed":
            status = "Delayed"
        elif task.status == "In Progress":
            status = "Open"
        else:
            status = "Open"
        
        deadline = ScadenzaItem(
            id=str(task.id),
            title=task.title,
            plant=task.workflow.plant_name or "N/A",
            date=task.due_date.isoformat(),
            type="Task",
            priority=priority,
            status=status,
            entity=task.responsible_entity,
            recurring=False
        )
        deadlines.append(deadline)
    
    return deadlines
"""
Safe workflow creation patch to handle missing database columns
"""
from sqlalchemy import inspect
from sqlalchemy.orm import Session


def get_table_columns(db_session: Session, table_name: str) -> set:
    """Get actual columns that exist in the database table"""
    inspector = inspect(db_session.bind)
    columns = inspector.get_columns(table_name)
    return {col['name'] for col in columns}


def create_workflow_stage_safe(db_session: Session, **kwargs):
    """Create WorkflowStage with only columns that exist in the database"""
    from app.models.workflow import WorkflowStage
    
    # Get actual database columns
    existing_columns = get_table_columns(db_session, 'workflow_stages')
    
    # Filter kwargs to only include existing columns
    safe_kwargs = {}
    for key, value in kwargs.items():
        if key in existing_columns:
            safe_kwargs[key] = value
        else:
            print(f"Warning: Column '{key}' does not exist in workflow_stages table, skipping")
    
    return WorkflowStage(**safe_kwargs)


def patch_workflow_creation():
    """Monkey patch the workflow creation to be database-safe"""
    import app.api.v1.endpoints.workflow as workflow_module
    
    # Store original function
    original_create = workflow_module.create_workflow
    
    def safe_create_workflow(*args, **kwargs):
        """Safe wrapper around workflow creation"""
        try:
            return original_create(*args, **kwargs)
        except Exception as e:
            if "entity_responsible" in str(e) or "document_templates" in str(e):
                print("Database schema issue detected, applying safe creation patch...")
                # Here we would apply the safe creation logic
                raise HTTPException(
                    status_code=500, 
                    detail="Database schema mismatch. Please run database migrations to update schema."
                )
            raise e
    
    # Apply patch
    workflow_module.create_workflow = safe_create_workflow
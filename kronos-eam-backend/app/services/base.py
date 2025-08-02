"""
Base service class for all services in the application.
Provides common functionality for database operations and error handling.
"""

from typing import TypeVar, Generic, Type, Optional, List, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
import logging

from app.core.database import get_db_context
from app.models.base import BaseModel

# Type variable for generic model
ModelType = TypeVar("ModelType", bound=BaseModel)

logger = logging.getLogger(__name__)


class BaseService(Generic[ModelType]):
    """Base service class providing common CRUD operations.
    
    This class provides a foundation for all service classes with:
    - Consistent error handling
    - Tenant isolation
    - Common CRUD operations
    - Logging
    """
    
    def __init__(
        self, 
        model: Type[ModelType], 
        tenant_id: str = "demo"
    ) -> None:
        """Initialize the base service.
        
        Args:
            model: The SQLAlchemy model class
            tenant_id: The tenant identifier for data isolation
        """
        self.model = model
        self.tenant_id = tenant_id
        self.model_name = model.__name__
    
    async def get_by_id(self, entity_id: int) -> Optional[ModelType]:
        """Retrieve an entity by its ID.
        
        Args:
            entity_id: The unique identifier of the entity
            
        Returns:
            The entity if found, None otherwise
            
        Raises:
            HTTPException: If there's an error retrieving the entity
        """
        try:
            with get_db_context(self.tenant_id) as db:
                entity = db.query(self.model).filter(
                    self.model.id == entity_id,
                    self.model.tenant_id == self.tenant_id
                ).first()
                return entity
        except SQLAlchemyError as e:
            logger.error(f"Database error retrieving {self.model_name}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error retrieving {self.model_name}"
            )
        except Exception as e:
            logger.error(f"Unexpected error retrieving {self.model_name}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error retrieving {self.model_name}"
            )
    
    async def get_all(
        self, 
        skip: int = 0, 
        limit: int = 100,
        include_deleted: bool = False
    ) -> List[ModelType]:
        """Retrieve all entities for the tenant.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            include_deleted: Whether to include soft-deleted records
            
        Returns:
            List of entities
            
        Raises:
            HTTPException: If there's an error retrieving entities
        """
        try:
            with get_db_context(self.tenant_id) as db:
                query = db.query(self.model).filter(
                    self.model.tenant_id == self.tenant_id
                )
                
                if not include_deleted and hasattr(self.model, 'is_deleted'):
                    query = query.filter(self.model.is_deleted == False)
                
                entities = query.offset(skip).limit(limit).all()
                return entities
        except SQLAlchemyError as e:
            logger.error(f"Database error retrieving {self.model_name} list: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error retrieving {self.model_name} list"
            )
    
    async def create(self, entity_data: Dict[str, Any]) -> ModelType:
        """Create a new entity.
        
        Args:
            entity_data: Dictionary containing entity attributes
            
        Returns:
            The newly created entity
            
        Raises:
            HTTPException: If there's an error creating the entity
        """
        try:
            with get_db_context(self.tenant_id) as db:
                # Ensure tenant_id is set
                entity_data["tenant_id"] = self.tenant_id
                
                # Add timestamps if not provided
                if hasattr(self.model, 'created_at') and 'created_at' not in entity_data:
                    entity_data["created_at"] = datetime.utcnow()
                if hasattr(self.model, 'updated_at'):
                    entity_data["updated_at"] = datetime.utcnow()
                
                entity = self.model(**entity_data)
                db.add(entity)
                db.commit()
                db.refresh(entity)
                
                logger.info(f"Created {self.model_name} with ID: {entity.id}")
                return entity
        except SQLAlchemyError as e:
            logger.error(f"Database error creating {self.model_name}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error creating {self.model_name}"
            )
        except ValueError as e:
            logger.error(f"Validation error creating {self.model_name}: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
    
    async def update(
        self, 
        entity_id: int, 
        update_data: Dict[str, Any]
    ) -> Optional[ModelType]:
        """Update an existing entity.
        
        Args:
            entity_id: The unique identifier of the entity
            update_data: Dictionary containing fields to update
            
        Returns:
            The updated entity if found, None otherwise
            
        Raises:
            HTTPException: If there's an error updating the entity
        """
        try:
            with get_db_context(self.tenant_id) as db:
                entity = db.query(self.model).filter(
                    self.model.id == entity_id,
                    self.model.tenant_id == self.tenant_id
                ).first()
                
                if not entity:
                    return None
                
                # Update fields
                for key, value in update_data.items():
                    if hasattr(entity, key) and key not in ['id', 'tenant_id', 'created_at']:
                        setattr(entity, key, value)
                
                # Update timestamp
                if hasattr(entity, 'updated_at'):
                    entity.updated_at = datetime.utcnow()
                
                db.commit()
                db.refresh(entity)
                
                logger.info(f"Updated {self.model_name} with ID: {entity_id}")
                return entity
        except SQLAlchemyError as e:
            logger.error(f"Database error updating {self.model_name}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error updating {self.model_name}"
            )
    
    async def delete(
        self, 
        entity_id: int, 
        hard_delete: bool = False
    ) -> bool:
        """Delete an entity.
        
        Args:
            entity_id: The unique identifier of the entity
            hard_delete: If True, permanently delete the entity
            
        Returns:
            True if deleted successfully, False if entity not found
            
        Raises:
            HTTPException: If there's an error deleting the entity
        """
        try:
            with get_db_context(self.tenant_id) as db:
                entity = db.query(self.model).filter(
                    self.model.id == entity_id,
                    self.model.tenant_id == self.tenant_id
                ).first()
                
                if not entity:
                    return False
                
                if hard_delete:
                    db.delete(entity)
                    logger.info(f"Hard deleted {self.model_name} with ID: {entity_id}")
                else:
                    if hasattr(entity, 'is_deleted'):
                        entity.is_deleted = True
                        if hasattr(entity, 'updated_at'):
                            entity.updated_at = datetime.utcnow()
                        logger.info(f"Soft deleted {self.model_name} with ID: {entity_id}")
                    else:
                        db.delete(entity)
                        logger.info(f"Deleted {self.model_name} with ID: {entity_id}")
                
                db.commit()
                return True
        except SQLAlchemyError as e:
            logger.error(f"Database error deleting {self.model_name}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error deleting {self.model_name}"
            )
    
    def set_tenant(self, tenant_id: str) -> None:
        """Set tenant for this service instance.
        
        Args:
            tenant_id: The new tenant identifier
        """
        self.tenant_id = tenant_id
    
    def handle_db_error(self, operation: str, error: Exception) -> None:
        """Handle database errors consistently.
        
        Args:
            operation: The operation that failed
            error: The exception that was raised
            
        Raises:
            HTTPException: Always raises an HTTP exception
        """
        logger.error(f"{operation} failed for {self.model_name}: {error}")
        
        if isinstance(error, SQLAlchemyError):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error during {operation}"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error during {operation}"
            )
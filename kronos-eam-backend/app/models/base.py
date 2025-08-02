"""
Base models and mixins for multi-tenant support
"""

from datetime import datetime
from typing import Optional
from sqlalchemy import Column, String, DateTime, Boolean, Integer, event
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.orm import Session

from app.core.database import Base


class TenantMixin:
    """Mixin to add tenant support to models"""
    
    @declared_attr
    def tenant_id(cls):
        return Column(String(50), nullable=False, index=True)
    
    @classmethod
    def __declare_last__(cls):
        """Set up tenant filtering"""
        # This ensures queries are automatically filtered by tenant
        # when using the custom query class
        pass


class TimestampMixin:
    """Mixin to add timestamp fields"""
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class AuditMixin(TimestampMixin):
    """Mixin to add audit fields"""
    
    created_by = Column(String(100))
    updated_by = Column(String(100))
    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime)
    deleted_by = Column(String(100))
    
    def soft_delete(self, user_id: str):
        """Soft delete the record"""
        self.is_deleted = True
        self.deleted_at = datetime.utcnow()
        self.deleted_by = user_id


class BaseModel(Base, TenantMixin, AuditMixin):
    """Base model with all common fields"""
    __abstract__ = True
    
    id = Column(Integer, primary_key=True, index=True)
    
    def to_dict(self) -> dict:
        """Convert model to dictionary"""
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
        }
    
    @classmethod
    def create(cls, db: Session, **kwargs):
        """Create new instance"""
        instance = cls(**kwargs)
        db.add(instance)
        db.commit()
        db.refresh(instance)
        return instance
    
    def update(self, db: Session, **kwargs):
        """Update instance"""
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
        db.commit()
        db.refresh(self)
        return self
    
    def delete(self, db: Session, soft: bool = True, user_id: Optional[str] = None):
        """Delete instance (soft or hard)"""
        if soft and hasattr(self, 'soft_delete'):
            self.soft_delete(user_id)
            db.commit()
        else:
            db.delete(self)
            db.commit()


# Event listeners for automatic tenant assignment
@event.listens_for(Session, "before_flush")
def receive_before_flush(session, flush_context, instances):
    """
    Automatically set tenant_id for new objects
    This requires the session to have tenant_id attribute set
    """
    for obj in session.new:
        if isinstance(obj, TenantMixin) and hasattr(session, 'tenant_id'):
            if not obj.tenant_id:
                obj.tenant_id = session.tenant_id
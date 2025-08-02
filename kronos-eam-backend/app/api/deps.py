"""
Common dependencies for API endpoints
Handles multi-tenant context and common validations
"""

from typing import Generator, Optional
from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from jose import JWTError
import redis

from app.core.database import get_db
from app.core.config import settings
from app.core.security import get_current_active_user, TokenData, TenantContext


def get_redis_client() -> Optional[redis.Redis]:
    """Get Redis client (returns None if Redis is disabled)"""
    if settings.DISABLE_REDIS:
        return None
    
    try:
        client = redis.from_url(
            str(settings.REDIS_URL),
            decode_responses=True
        )
        # Test connection
        client.ping()
        return client
    except Exception:
        if settings.ENVIRONMENT == "development":
            # In development, return None if Redis is not available
            return None
        raise


def get_current_tenant(
    request: Request,
    current_user: Optional[TokenData] = None
) -> str:
    """Get current tenant ID from request context"""
    # Priority order:
    # 1. From authenticated user
    if current_user:
        return current_user.tenant_id
    
    # 2. From request state (set by middleware)
    if hasattr(request.state, "tenant_id"):
        return request.state.tenant_id
    
    # 3. From header
    if "X-Tenant-ID" in request.headers:
        return request.headers["X-Tenant-ID"]
    
    # 4. Default
    return settings.DEFAULT_TENANT_ID


def get_db_for_tenant(
    tenant_id: str = Depends(get_current_tenant)
) -> Generator[Session, None, None]:
    """Get database session for specific tenant"""
    # get_db is already a generator, use it directly
    db_gen = get_db(tenant_id)
    session = next(db_gen)
    try:
        # Set tenant context on session
        session.tenant_id = tenant_id
        yield session
    finally:
        try:
            next(db_gen)
        except StopIteration:
            pass


def get_tenant_db(
    current_user: TokenData = Depends(get_current_active_user),
    request: Request = None
) -> Generator[Session, None, None]:
    """Get database session for authenticated user's tenant"""
    tenant_id = current_user.tenant_id
    # get_db is already a generator, use it directly
    db_gen = get_db(tenant_id)
    session = next(db_gen)
    try:
        session.tenant_id = tenant_id
        yield session
    finally:
        try:
            next(db_gen)
        except StopIteration:
            pass


class PaginationParams:
    """Common pagination parameters"""
    def __init__(
        self,
        skip: int = 0,
        limit: int = 20,
        sort_by: Optional[str] = None,
        sort_order: str = "asc"
    ):
        self.skip = skip
        self.limit = min(limit, 100)  # Max 100 items per page
        self.sort_by = sort_by
        self.sort_order = sort_order
        
    def apply_to_query(self, query):
        """Apply pagination to SQLAlchemy query"""
        if self.sort_by:
            # TODO: Validate sort_by field exists
            if self.sort_order == "desc":
                query = query.order_by(getattr(query.column_descriptions[0]['type'], self.sort_by).desc())
            else:
                query = query.order_by(getattr(query.column_descriptions[0]['type'], self.sort_by))
        
        return query.offset(self.skip).limit(self.limit)


class FilterParams:
    """Common filter parameters"""
    def __init__(
        self,
        search: Optional[str] = None,
        stato: Optional[str] = None,
        tags: Optional[str] = None,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None
    ):
        self.search = search
        self.stato = stato
        self.tags = tags.split(",") if tags else []
        self.date_from = date_from
        self.date_to = date_to
    
    def apply_to_query(self, query, model):
        """Apply filters to SQLAlchemy query"""
        if self.search:
            # Search in common fields
            search_fields = []
            if hasattr(model, "nome"):
                search_fields.append(model.nome.ilike(f"%{self.search}%"))
            if hasattr(model, "codice"):
                search_fields.append(model.codice.ilike(f"%{self.search}%"))
            if hasattr(model, "descrizione"):
                search_fields.append(model.descrizione.ilike(f"%{self.search}%"))
            
            if search_fields:
                from sqlalchemy import or_
                query = query.filter(or_(*search_fields))
        
        if self.stato and hasattr(model, "stato"):
            query = query.filter(model.stato == self.stato)
        
        if self.tags and hasattr(model, "tags"):
            # Filter by tags (JSON array)
            for tag in self.tags:
                query = query.filter(model.tags.contains([tag]))
        
        # Date filters
        if self.date_from and hasattr(model, "created_at"):
            query = query.filter(model.created_at >= self.date_from)
        
        if self.date_to and hasattr(model, "created_at"):
            query = query.filter(model.created_at <= self.date_to)
        
        return query


def require_tenant_resource(
    resource_tenant_id: str,
    current_user: TokenData = Depends(get_current_active_user)
):
    """Verify user can access resource from specific tenant"""
    if current_user.tenant_id != resource_tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to resource from another tenant"
        )
    return True


def get_rate_limiter(
    redis_client: redis.Redis = Depends(get_redis_client),
    current_user: TokenData = Depends(get_current_active_user)
):
    """Rate limiting per user/tenant"""
    # Implement rate limiting logic
    key = f"rate_limit:{current_user.tenant_id}:{current_user.sub}"
    
    # Simple rate limiting: X requests per minute
    current = redis_client.incr(key)
    if current == 1:
        redis_client.expire(key, 60)  # 1 minute
    
    if current > settings.RATE_LIMIT_PER_MINUTE:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded"
        )
    
    return current


class FileUploadChecker:
    """Validate file uploads"""
    def __init__(self, 
                 max_size: int = None,
                 allowed_extensions: list = None):
        self.max_size = max_size or settings.MAX_UPLOAD_SIZE
        self.allowed_extensions = allowed_extensions or settings.ALLOWED_EXTENSIONS
    
    def __call__(self, file):
        # Check file size
        if file.size > self.max_size:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Max size: {self.max_size} bytes"
            )
        
        # Check file extension
        if self.allowed_extensions:
            ext = file.filename.split(".")[-1].lower()
            if ext not in self.allowed_extensions:
                raise HTTPException(
                    status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                    detail=f"File type not allowed. Allowed: {self.allowed_extensions}"
                )
        
        return file


# Common response models
class PaginatedResponse:
    """Standard paginated response"""
    def __init__(self, 
                 items: list,
                 total: int,
                 skip: int,
                 limit: int):
        self.items = items
        self.total = total
        self.skip = skip
        self.limit = limit
        self.pages = (total + limit - 1) // limit if limit > 0 else 0
        self.has_next = skip + limit < total
        self.has_prev = skip > 0
    
    def dict(self):
        return {
            "items": self.items,
            "pagination": {
                "total": self.total,
                "skip": self.skip,
                "limit": self.limit,
                "pages": self.pages,
                "has_next": self.has_next,
                "has_prev": self.has_prev
            }
        }


# Feature flags checker
def require_feature(feature: str):
    """Check if feature is enabled for tenant"""
    async def check_feature(
        current_user: TokenData = Depends(get_current_active_user),
        db: Session = Depends(get_tenant_db)
    ):
        from app.models.tenant import Tenant
        
        tenant = db.query(Tenant).filter(
            Tenant.id == current_user.tenant_id
        ).first()
        
        if not tenant or not tenant.has_feature(feature):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Feature '{feature}' is not enabled for your tenant"
            )
        
        return True
    
    return check_feature


# Dependencies for specific features
require_ai_assistant = require_feature("ai_assistant")
require_voice_features = require_feature("voice_features")
require_rpa_automation = require_feature("rpa_automation")
require_advanced_analytics = require_feature("advanced_analytics")
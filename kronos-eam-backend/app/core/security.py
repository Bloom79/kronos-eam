"""
Security utilities for authentication and authorization
Implements JWT tokens with tenant isolation
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from pydantic import BaseModel
import secrets
import string

from app.core.config import settings
from app.core.database import get_db
import os

# Password hashing
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=settings.BCRYPT_ROUNDS
)

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    scheme_name="JWT"
)


class TokenData(BaseModel):
    """Token payload data"""
    sub: str  # user_id
    tenant_id: str
    email: str
    role: str
    permissions: List[str] = []
    exp: Optional[datetime] = None


def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None
) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode.update({"exp": expire})
    
    # Ensure all required fields are present
    required_fields = ["sub", "tenant_id", "email", "role"]
    for field in required_fields:
        if field not in to_encode:
            raise ValueError(f"Missing required field in token data: {field}")
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def create_refresh_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None
) -> str:
    """Create JWT refresh token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )
    
    to_encode.update({
        "exp": expire,
        "type": "refresh"
    })
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def verify_token(token: str, credentials_exception) -> TokenData:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        
        # Extract token data
        user_id: str = payload.get("sub")
        tenant_id: str = payload.get("tenant_id")
        email: str = payload.get("email")
        role: str = payload.get("role")
        permissions: List[str] = payload.get("permissions", [])
        
        if user_id is None or tenant_id is None:
            raise credentials_exception
        
        token_data = TokenData(
            sub=user_id,
            tenant_id=tenant_id,
            email=email,
            role=role,
            permissions=permissions
        )
        return token_data
        
    except JWTError:
        raise credentials_exception


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash password"""
    return pwd_context.hash(password)


def generate_password(length: int = 12) -> str:
    """Generate a secure random password"""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    password = ''.join(secrets.choice(alphabet) for _ in range(length))
    return password


def generate_api_key() -> str:
    """Generate a secure API key"""
    return f"kron_{secrets.token_urlsafe(32)}"


async def get_current_user(token: str = Depends(oauth2_scheme)) -> TokenData:
    """Get current user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    return verify_token(token, credentials_exception)


async def get_current_active_user(
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> TokenData:
    """Get current active user"""
    # Import here to avoid circular imports
    from app.models.user import User
    
    # Get user from database to check if still active
    user = db.query(User).filter(
        User.id == current_user.sub,
        User.tenant_id == current_user.tenant_id
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    from app.models.user import UserStatusEnum
    if user.status != UserStatusEnum.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is not active"
        )
    
    return current_user


# Mock authentication for local development
async def mock_get_current_active_user() -> TokenData:
    """Mock authentication that always returns a valid user"""
    import os
    
    return TokenData(
        sub="local_user",
        tenant_id="demo",
        email="local_user@local.test",
        role="Admin",
        permissions=["read", "write", "admin"]
    )

# Override for local development - DISABLED to use real authentication
# if os.getenv("ENVIRONMENT") == "development":
#     get_current_active_user = mock_get_current_active_user


class RoleChecker:
    """Dependency to check user roles"""
    
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles
    
    def __call__(self, user: TokenData = Depends(get_current_active_user)):
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{user.role}' not authorized. Required roles: {self.allowed_roles}"
            )
        return user


class PermissionChecker:
    """Dependency to check user permissions"""
    
    def __init__(self, required_permissions: List[str]):
        self.required_permissions = required_permissions
    
    def __call__(self, user: TokenData = Depends(get_current_active_user)):
        missing_permissions = set(self.required_permissions) - set(user.permissions)
        if missing_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing required permissions: {list(missing_permissions)}"
            )
        return user


# Role dependencies
require_admin = RoleChecker(["Admin"])
require_manager = RoleChecker(["Admin", "Asset Manager"])
require_operator = RoleChecker(["Admin", "Asset Manager", "Operativo"])
require_any_role = RoleChecker(["Admin", "Asset Manager", "Operativo", "Viewer"])


# Multi-tenant context
class TenantContext(BaseModel):
    """Manages tenant context for requests"""
    tenant_id: str
    
    def check_resource_access(self, resource_tenant_id: str) -> bool:
        """Check if current tenant can access a resource"""
        return self.tenant_id == resource_tenant_id
    
    def filter_query(self, query):
        """Apply tenant filter to SQLAlchemy query"""
        model = query.column_descriptions[0]['type']
        if hasattr(model, 'tenant_id'):
            return query.filter(model.tenant_id == self.tenant_id)
        return query


async def get_tenant_context(
    current_user: TokenData = Depends(get_current_active_user)
) -> TenantContext:
    """Get tenant context for the current request"""
    return TenantContext(current_user.tenant_id)


# API Key authentication (alternative to JWT)
async def get_api_key_user(
    api_key: str = Depends(OAuth2PasswordBearer(tokenUrl="token", auto_error=False)),
    db: Session = Depends(get_db)
) -> Optional[TokenData]:
    """Authenticate user via API key"""
    if not api_key or not api_key.startswith("kron_"):
        return None
    
    # Import here to avoid circular imports
    from app.models.user import ApiKey
    
    # Find API key in database
    key = db.query(ApiKey).filter(
        ApiKey.key == api_key,
        ApiKey.is_active == True
    ).first()
    
    if not key:
        return None
    
    # Check if key is expired
    if key.expires_at and key.expires_at < datetime.utcnow():
        return None
    
    # Return token data from API key's user
    return TokenData(
        sub=str(key.user_id),
        tenant_id=key.tenant_id,
        email=key.user.email,
        role=key.user.ruolo,
        permissions=key.permissions or []
    )


async def get_current_user_flexible(
    jwt_user: Optional[TokenData] = Depends(get_current_user),
    api_key_user: Optional[TokenData] = Depends(get_api_key_user)
) -> TokenData:
    """Get current user from either JWT or API key"""
    if jwt_user:
        return jwt_user
    elif api_key_user:
        return api_key_user
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No valid authentication provided"
        )


# Utility functions for authorization
def check_tenant_access(user_tenant_id: str, resource_tenant_id: str) -> bool:
    """Check if user can access resource from another tenant"""
    # In strict mode, users can only access their own tenant's resources
    if settings.TENANT_ISOLATION_MODE == "strict":
        return user_tenant_id == resource_tenant_id
    
    # In shared mode, implement custom logic
    # For now, same tenant only
    return user_tenant_id == resource_tenant_id


def check_impianto_access(user: TokenData, impianto_id: int, db: Session) -> bool:
    """Check if user can access specific impianto"""
    from app.models.plant import Plant
    
    impianto = db.query(Plant).filter(
        Plant.id == impianto_id,
        Plant.tenant_id == user.tenant_id
    ).first()
    
    if not impianto:
        return False
    
    # Additional checks based on user role and assigned impianti
    if user.role == "Admin":
        return True
    
    # Check if user has specific impianto access
    # This would check user.impianti field
    # For now, allow access if same tenant
    return True
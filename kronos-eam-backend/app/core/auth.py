"""
Authentication and authorization module for local development
Provides mock authentication for testing Smart Assistant functionality
"""

from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from pydantic import BaseModel
from datetime import datetime, timedelta
import os

# Security scheme
security = HTTPBearer()

# Mock settings for local development
SECRET_KEY = os.getenv("SECRET_KEY", "local-dev-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

class TokenData(BaseModel):
    """Token payload data"""
    sub: str = "local_user"
    tenant_id: str = "demo"
    email: str = "local_user@test.com"
    exp: Optional[datetime] = None
    iat: Optional[datetime] = None

class User(BaseModel):
    """User model for authentication"""
    user_id: str
    tenant_id: str
    email: str
    is_active: bool = True
    
    def __init__(self, user_id: str = "local_user", tenant_id: str = "demo", **data):
        super().__init__(
            user_id=user_id,
            tenant_id=tenant_id,
            email=f"{user_id}@local.test",
            **data
        )

class TenantContext(BaseModel):
    """Tenant context for multi-tenant operations"""
    tenant_id: str
    user_id: str
    
    def __init__(self, tenant_id: str = "demo", user_id: str = "local_user"):
        super().__init__(tenant_id=tenant_id, user_id=user_id)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token (mock implementation)"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> TokenData:
    """Verify JWT token (mock implementation)"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        tenant_id: str = payload.get("tenant_id", "demo")
        email: str = payload.get("email", f"{username}@local.test")
        
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return TokenData(
            sub=username,
            tenant_id=tenant_id,
            email=email,
            exp=datetime.fromtimestamp(payload.get("exp", 0)),
            iat=datetime.fromtimestamp(payload.get("iat", 0))
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> TokenData:
    """Get current user from JWT token"""
    return verify_token(credentials.credentials)

async def get_current_active_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> User:
    """Get current active user (mock implementation for local development)"""
    if not credentials:
        # For local development, return mock user
        return User(user_id="local_user", tenant_id="demo")
    
    try:
        token_data = verify_token(credentials.credentials)
        user = User(
            user_id=token_data.sub,
            tenant_id=token_data.tenant_id,
            email=token_data.email,
            is_active=True
        )
        return user
    except HTTPException:
        # Fallback to mock user for local development
        return User(user_id="local_user", tenant_id="demo")

async def get_current_tenant(current_user: User = Depends(get_current_active_user)) -> str:
    """Get current tenant ID"""
    return current_user.tenant_id

async def get_tenant_context(current_user: User = Depends(get_current_active_user)) -> TenantContext:
    """Get tenant context for multi-tenant operations"""
    return TenantContext(
        tenant_id=current_user.tenant_id,
        user_id=current_user.user_id
    )

# Mock authentication for local development (no token required)
async def mock_get_current_active_user() -> User:
    """Mock authentication that always returns a valid user"""
    return User(user_id="local_user", tenant_id="demo")

# Export the mock function as default for local development
if os.getenv("ENVIRONMENT") == "development":
    get_current_active_user = mock_get_current_active_user
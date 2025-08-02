"""
Authentication endpoints
JWT-based authentication with multi-tenant support
"""

from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import secrets

from app.api.deps import get_db_for_tenant, get_redis_client
from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    verify_token,
    get_password_hash,
    verify_password,
    get_current_user
)
from app.models.user import User, UserSession
from app.schemas.auth import (
    Token,
    TokenRefresh,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    PasswordResetRequest,
    PasswordChangeRequest,
    ApiKeyCreate,
    ApiKeyResponse
)

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db_for_tenant),
    redis_client = Depends(get_redis_client)
):
    """
    OAuth2 compatible login endpoint
    Supports username/password authentication
    """
    import logging
    logger = logging.getLogger(__name__)
    
    logger.info(f"Login attempt for user: {form_data.username}")
    logger.info(f"Tenant ID from request: {request.state.tenant_id}")
    
    # Find user by email
    user = db.query(User).filter(
        User.email == form_data.username,
        User.tenant_id == request.state.tenant_id
    ).first()
    
    if not user:
        # Log failed attempt
        await log_failed_login(form_data.username, request, redis_client)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Check if account is locked
    if user.is_locked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is locked due to too many failed attempts"
        )
    
    # Verify password
    if not user.verify_password(form_data.password):
        user.record_login_attempt(False)
        db.commit()
        
        await log_failed_login(form_data.username, request, redis_client)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is not active"
        )
    
    # Record successful login
    user.record_login_attempt(True)
    
    # Create tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    token_data = {
        "sub": str(user.id),
        "tenant_id": user.tenant_id,
        "email": user.email,
        "role": user.role.value,
        "permissions": user.permissions
    }
    
    access_token = create_access_token(
        data=token_data,
        expires_delta=access_token_expires
    )
    
    refresh_token = create_refresh_token(
        data=token_data,
        expires_delta=refresh_token_expires
    )
    
    # Create session
    session = UserSession(
        session_id=secrets.token_urlsafe(32),
        user_id=user.id,
        tenant_id=user.tenant_id,
        access_token=access_token,
        refresh_token=refresh_token,
        expires_at=datetime.utcnow() + refresh_token_expires,
        ip_address=request.client.host,
        user_agent=request.headers.get("User-Agent", "")[:500]
    )
    db.add(session)
    db.commit()
    
    # Store session in Redis for fast lookup
    if redis_client:
        redis_client.setex(
            f"session:{session.session_id}",
            int(refresh_token_expires.total_seconds()),
            user.id
        )
    
    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=int(access_token_expires.total_seconds()),
        user={
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "role": user.role.value,
            "tenant_id": user.tenant_id,
            "permissions": user.permissions
        }
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(
    token_data: TokenRefresh,
    db: Session = Depends(get_db_for_tenant)
):
    """Refresh access token using refresh token"""
    try:
        # Verify refresh token
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
        
        payload = verify_token(token_data.refresh_token, credentials_exception)
        
        # Check if it's a refresh token
        if payload.get("type") != "refresh":
            raise credentials_exception
        
        # Get user
        user = db.query(User).filter(
            User.id == payload.sub,
            User.tenant_id == payload.tenant_id
        ).first()
        
        if not user or not user.is_active:
            raise credentials_exception
        
        # Create new access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        new_token_data = {
            "sub": str(user.id),
            "tenant_id": user.tenant_id,
            "email": user.email,
            "role": user.role.value,
            "permissions": user.permissions
        }
        
        access_token = create_access_token(
            data=new_token_data,
            expires_delta=access_token_expires
        )
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=int(access_token_expires.total_seconds())
        )
        
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )


@router.post("/logout")
async def logout(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db_for_tenant),
    redis_client = Depends(get_redis_client)
):
    """Logout and invalidate session"""
    # Find and revoke all active sessions for user
    sessions = db.query(UserSession).filter(
        UserSession.user_id == current_user.sub,
        UserSession.is_active == True
    ).all()
    
    for session in sessions:
        session.revoke()
        # Remove from Redis
        redis_client.delete(f"session:{session.session_id}")
    
    db.commit()
    
    return {"message": "Successfully logged out"}


@router.post("/register", response_model=RegisterResponse)
async def register(
    request: Request,
    register_data: RegisterRequest,
    db: Session = Depends(get_db_for_tenant)
):
    """
    Register new user (invite-based)
    In production, this would require an invitation token
    """
    # Check if email already exists
    existing_user = db.query(User).filter(
        User.email == register_data.email
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )
    
    # TODO: In production, verify invitation token
    # and get tenant_id from invitation
    
    # Create new user
    user = User(
        name=register_data.name,
        email=register_data.email,
        password=register_data.password,  # Will be hashed by setter
        tenant_id=request.state.tenant_id,
        role=register_data.role or "Viewer",
        status="Invited",  # Needs email verification
        permissions=[]
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # TODO: Send verification email
    
    return RegisterResponse(
        id=str(user.id),
        email=user.email,
        name=user.name,
        message="Registration successful. Please check your email to verify your account."
    )


@router.post("/forgot-password")
async def forgot_password(
    request_data: PasswordResetRequest,
    db: Session = Depends(get_db_for_tenant),
    redis_client = Depends(get_redis_client)
):
    """Request password reset"""
    # Find user
    user = db.query(User).filter(
        User.email == request_data.email
    ).first()
    
    if not user:
        # Don't reveal if email exists
        return {"message": "If the email exists, a reset link has been sent"}
    
    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    
    # Store in Redis with 1 hour expiry
    redis_client.setex(
        f"password_reset:{reset_token}",
        3600,
        user.id
    )
    
    # TODO: Send reset email with token
    
    return {"message": "If the email exists, a reset link has been sent"}


@router.post("/reset-password")
async def reset_password(
    token: str,
    new_password: str,
    db: Session = Depends(get_db_for_tenant),
    redis_client = Depends(get_redis_client)
):
    """Reset password with token"""
    # Get user ID from token
    user_id = redis_client.get(f"password_reset:{token}")
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Get user
    user = db.query(User).filter(User.id == int(user_id)).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update password
    user.password = new_password
    db.commit()
    
    # Delete token
    redis_client.delete(f"password_reset:{token}")
    
    return {"message": "Password reset successful"}


@router.post("/change-password")
async def change_password(
    password_data: PasswordChangeRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db_for_tenant)
):
    """Change password for authenticated user"""
    # Get user
    user = db.query(User).filter(
        User.id == current_user.sub
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Verify current password
    if not user.verify_password(password_data.current_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )
    
    # Update password
    user.password = password_data.new_password
    db.commit()
    
    return {"message": "Password changed successfully"}


@router.get("/me")
async def get_current_user_info(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db_for_tenant)
):
    """Get current user information"""
    user = db.query(User).filter(
        User.id == current_user.sub
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "id": str(user.id),
        "email": user.email,
        "name": user.name,
        "role": user.role.value,
        "tenant_id": user.tenant_id,
        "permissions": user.permissions,
        "preferences": user.preferences,
        "last_access": user.last_access,
        "email_verified": user.email_verified,
        "mfa_enabled": user.mfa_enabled
    }


@router.post("/api-keys", response_model=ApiKeyResponse)
async def create_api_key(
    key_data: ApiKeyCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db_for_tenant)
):
    """Create new API key for programmatic access"""
    from app.models.user import ApiKey
    from app.core.security import generate_api_key
    
    # Check user permissions
    if current_user.role not in ["Admin", "Asset Manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to create API keys"
        )
    
    # Generate unique key
    api_key = generate_api_key()
    
    # Create API key record
    db_api_key = ApiKey(
        name=key_data.name,
        key=api_key,
        user_id=current_user.sub,
        tenant_id=current_user.tenant_id,
        permissions=key_data.permissions or [],
        allowed_ips=key_data.allowed_ips or [],
        expires_at=key_data.expires_at,
        description=key_data.description,
        rate_limit_per_hour=key_data.rate_limit_per_hour
    )
    
    db.add(db_api_key)
    db.commit()
    db.refresh(db_api_key)
    
    return ApiKeyResponse(
        id=str(db_api_key.id),
        name=db_api_key.name,
        key=api_key,  # Only shown once
        created_at=db_api_key.created_at,
        expires_at=db_api_key.expires_at,
        permissions=db_api_key.permissions,
        message="Save this API key securely. It will not be shown again."
    )


@router.get("/api-keys")
async def list_api_keys(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db_for_tenant)
):
    """List user's API keys (without revealing the actual keys)"""
    from app.models.user import ApiKey
    
    keys = db.query(ApiKey).filter(
        ApiKey.user_id == current_user.sub,
        ApiKey.tenant_id == current_user.tenant_id
    ).all()
    
    return [
        {
            "id": str(key.id),
            "name": key.name,
            "created_at": key.created_at,
            "last_used_at": key.last_used_at,
            "expires_at": key.expires_at,
            "is_active": key.is_active,
            "usage_count": key.usage_count,
            "permissions": key.permissions
        }
        for key in keys
    ]


@router.delete("/api-keys/{key_id}")
async def revoke_api_key(
    key_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db_for_tenant)
):
    """Revoke an API key"""
    from app.models.user import ApiKey
    
    api_key = db.query(ApiKey).filter(
        ApiKey.id == key_id,
        ApiKey.user_id == current_user.sub,
        ApiKey.tenant_id == current_user.tenant_id
    ).first()
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )
    
    api_key.is_active = False
    db.commit()
    
    return {"message": "API key revoked successfully"}


@router.post("/verify-api-key")
async def verify_api_key(
    api_key: str,
    db: Session = Depends(get_db_for_tenant)
):
    """Verify if an API key is valid (for testing)"""
    from app.models.user import ApiKey
    
    key = db.query(ApiKey).filter(
        ApiKey.key == api_key,
        ApiKey.is_active == True
    ).first()
    
    if not key or not key.is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )
    
    return {
        "valid": True,
        "name": key.name,
        "permissions": key.permissions
    }


# Helper functions
async def log_failed_login(
    email: str,
    request: Request,
    redis_client
):
    """Log failed login attempt"""
    if redis_client is None:
        # Redis disabled, skip logging
        return
    
    key = f"failed_login:{email}"
    redis_client.incr(key)
    redis_client.expire(key, 3600)  # 1 hour
    
    # TODO: Add more sophisticated tracking
    # - IP-based blocking
    # - Notification on suspicious activity
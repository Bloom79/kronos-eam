"""
Simple authentication endpoint for debugging
"""

from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import secrets
import logging

from app.api.deps import get_db_for_tenant
from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token
from app.models.user import User
from app.schemas.auth import LoginResponse

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/login-test", response_model=LoginResponse)
async def login_test(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db_for_tenant)
):
    """Test login endpoint"""
    try:
        logger.info(f"Login attempt for: {form_data.username}")
        logger.info(f"Tenant: {request.state.tenant_id}")
        
        # Find user
        user = db.query(User).filter(
            User.email == form_data.username,
            User.tenant_id == request.state.tenant_id
        ).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        # Verify password
        if not user.verify_password(form_data.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid password"
            )
        
        # Create tokens
        access_token_expires = timedelta(minutes=30)
        token_data = {
            "sub": str(user.id),
            "tenant_id": user.tenant_id,
            "email": user.email,
            "role": user.ruolo.value
        }
        
        access_token = create_access_token(
            data=token_data,
            expires_delta=access_token_expires
        )
        
        refresh_token = create_refresh_token(
            data=token_data,
            expires_delta=timedelta(days=7)
        )
        
        return LoginResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=int(access_token_expires.total_seconds()),
            user={
                "id": str(user.id),
                "email": user.email,
                "nome": user.nome,
                "ruolo": user.ruolo.value,
                "tenant_id": user.tenant_id,
                "permissions": []
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )
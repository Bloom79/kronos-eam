"""
Authentication schemas for request/response validation
"""

from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime


class TokenData(BaseModel):
    """Token payload data"""
    sub: str  # user_id
    tenant_id: str
    email: str
    role: str
    permissions: List[str] = []
    exp: Optional[datetime] = None


class Token(BaseModel):
    """Access token response"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenRefresh(BaseModel):
    """Refresh token request"""
    refresh_token: str


class LoginRequest(BaseModel):
    """Login request"""
    email: str  # Changed from EmailStr to support .local domains
    password: str = Field(..., min_length=8)
    remember_me: bool = False


class UserInfo(BaseModel):
    """User information in responses"""
    id: str
    email: str  # Changed from EmailStr to support .local domains
    name: str
    role: str
    tenant_id: str
    permissions: List[str] = []


class LoginResponse(BaseModel):
    """Login response with tokens and user info"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserInfo


class RegisterRequest(BaseModel):
    """User registration request"""
    name: str = Field(..., min_length=2, max_length=200)
    email: str  # Changed from EmailStr to support .local domains
    password: str = Field(..., min_length=8)
    role: Optional[str] = "Viewer"
    invitation_token: Optional[str] = None


class RegisterResponse(BaseModel):
    """Registration response"""
    id: str
    email: str  # Changed from EmailStr to support .local domains
    name: str
    message: str


class PasswordResetRequest(BaseModel):
    """Password reset request"""
    email: str  # Changed from EmailStr to support .local domains


class PasswordChangeRequest(BaseModel):
    """Password change request"""
    current_password: str
    new_password: str = Field(..., min_length=8)


class EmailVerificationRequest(BaseModel):
    """Email verification request"""
    token: str


class MFAEnableRequest(BaseModel):
    """MFA enable request"""
    password: str


class MFAVerifyRequest(BaseModel):
    """MFA verification request"""
    code: str


class ApiKeyCreate(BaseModel):
    """API key creation request"""
    name: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = None
    permissions: Optional[List[str]] = []
    allowed_ips: Optional[List[str]] = []
    expires_at: Optional[datetime] = None
    rate_limit_per_hour: Optional[int] = None


class ApiKeyResponse(BaseModel):
    """API key creation response"""
    id: str
    name: str
    key: str
    created_at: datetime
    expires_at: Optional[datetime]
    permissions: List[str]
    message: str
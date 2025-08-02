"""
User model with multi-tenant support and authentication
"""

from datetime import datetime, timedelta
from typing import Optional, List
from sqlalchemy import Column, String, Integer, DateTime, Boolean, JSON, ForeignKey, Enum
from sqlalchemy.orm import relationship, foreign
import enum

from app.models.base import BaseModel
from app.core.security import get_password_hash, verify_password


class UserRoleEnum(str, enum.Enum):
    ADMIN = "Admin"
    ASSET_MANAGER = "Asset Manager"
    PLANT_OWNER = "Plant Owner"
    OPERATOR = "Operator"
    VIEWER = "Viewer"


class UserStatusEnum(str, enum.Enum):
    ACTIVE = "Active"
    SUSPENDED = "Suspended"
    INVITED = "Invited"


class User(BaseModel):
    """User model with multi-tenant support"""
    __tablename__ = "users"
    
    # Basic info
    name = Column(String(200), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    
    # Role and permissions
    role = Column(Enum(UserRoleEnum, values_callable=lambda x: [e.value for e in x]), nullable=False, default=UserRoleEnum.VIEWER)
    permissions = Column(JSON, default=list)
    
    # Status
    status = Column(Enum(UserStatusEnum, values_callable=lambda x: [e.value for e in x]), nullable=False, default=UserStatusEnum.INVITED)
    email_verified = Column(Boolean, default=False)
    
    # Access control
    last_access = Column(DateTime)
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime)
    
    # Multi-factor authentication
    mfa_enabled = Column(Boolean, default=False)
    mfa_secret = Column(String(100))
    
    # Profile
    phone = Column(String(50))
    avatar_url = Column(String(500))
    language = Column(String(10), default="en")
    timezone = Column(String(50), default="Europe/Rome")
    
    # Plant access (JSON array of plant IDs)
    authorized_plants = Column(JSON, default=list)
    
    # Preferences
    preferences = Column(JSON, default=dict)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="users", primaryjoin="foreign(User.tenant_id) == Tenant.id", lazy='select')
    api_keys = relationship("ApiKey", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User {self.email}>"
    
    @property
    def password(self):
        raise AttributeError("Password is not readable")
    
    @password.setter
    def password(self, password: str):
        self.password_hash = get_password_hash(password)
    
    def verify_password(self, password: str) -> bool:
        """Verify password"""
        return verify_password(password, self.password_hash)
    
    @property
    def is_active(self) -> bool:
        """Check if user is active"""
        return self.status == UserStatusEnum.ACTIVE and not self.is_locked
    
    @property
    def is_locked(self) -> bool:
        """Check if user account is locked"""
        if self.locked_until:
            return datetime.utcnow() < self.locked_until
        return False
    
    def record_login_attempt(self, success: bool):
        """Record login attempt"""
        if success:
            self.failed_login_attempts = 0
            self.last_access = datetime.utcnow()
        else:
            self.failed_login_attempts += 1
            if self.failed_login_attempts >= 5:
                # Lock account for 30 minutes
                self.locked_until = datetime.utcnow() + timedelta(minutes=30)
    
    def has_permission(self, permission: str) -> bool:
        """Check if user has specific permission"""
        # Admin has all permissions
        if self.role == UserRoleEnum.ADMIN:
            return True
        
        # Check specific permissions
        return permission in self.permissions
    
    def can_access_plant(self, plant_id: int) -> bool:
        """Check if user can access specific plant"""
        # Admin can access all
        if self.role == UserRoleEnum.ADMIN:
            return True
        
        # Check authorized plants
        return plant_id in self.authorized_plants
    
    def get_preference(self, key: str, default=None):
        """Get user preference"""
        return self.preferences.get(key, default)
    
    def set_preference(self, key: str, value):
        """Set user preference"""
        if self.preferences is None:
            self.preferences = {}
        self.preferences[key] = value


class ApiKey(BaseModel):
    """API Key for programmatic access"""
    __tablename__ = "api_keys"
    
    # Key info
    name = Column(String(100), nullable=False)
    key = Column(String(100), unique=True, nullable=False, index=True)
    
    # Ownership
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Permissions
    permissions = Column(JSON, default=list)
    allowed_ips = Column(JSON, default=list)  # Empty = all IPs allowed
    
    # Status
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime)
    last_used_at = Column(DateTime)
    
    # Usage tracking
    usage_count = Column(Integer, default=0)
    rate_limit_per_hour = Column(Integer)
    
    # Metadata
    description = Column(String(500))
    api_model_metadata = Column(JSON, default=dict)
    
    # Relationships
    user = relationship("User", back_populates="api_keys")
    
    def __repr__(self):
        return f"<ApiKey {self.name}>"
    
    @property
    def is_valid(self) -> bool:
        """Check if API key is valid"""
        if not self.is_active:
            return False
        
        if self.expires_at and datetime.utcnow() > self.expires_at:
            return False
        
        return True
    
    def record_usage(self):
        """Record API key usage"""
        self.usage_count += 1
        self.last_used_at = datetime.utcnow()


class UserSession(BaseModel):
    """User session tracking"""
    __tablename__ = "user_sessions"
    
    # Session info
    session_id = Column(String(100), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Token info
    access_token = Column(String(500))
    refresh_token = Column(String(500))
    expires_at = Column(DateTime, nullable=False)
    
    # Device info
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    device_type = Column(String(50))
    
    # Status
    is_active = Column(Boolean, default=True)
    revoked_at = Column(DateTime)
    
    # Relationships
    user = relationship("User", back_populates="sessions")
    
    def __repr__(self):
        return f"<UserSession {self.session_id}>"
    
    @property
    def is_valid(self) -> bool:
        """Check if session is valid"""
        if not self.is_active:
            return False
        
        if datetime.utcnow() > self.expires_at:
            return False
        
        return True
    
    def revoke(self):
        """Revoke session"""
        self.is_active = False
        self.revoked_at = datetime.utcnow()


# Default permissions by role
DEFAULT_PERMISSIONS = {
    UserRoleEnum.ADMIN: [
        "users:read", "users:write", "users:delete",
        "plants:read", "plants:write", "plants:delete",
        "workflows:read", "workflows:write", "workflows:delete",
        "documents:read", "documents:write", "documents:delete",
        "ai:use", "rpa:use", "reports:generate",
        "settings:read", "settings:write",
        "tenant:manage"
    ],
    UserRoleEnum.ASSET_MANAGER: [
        "users:read",
        "plants:read", "plants:write",
        "workflows:read", "workflows:write",
        "documents:read", "documents:write",
        "ai:use", "rpa:use", "reports:generate"
    ],
    UserRoleEnum.OPERATOR: [
        "plants:read",
        "workflows:read", "workflows:write",
        "documents:read", "documents:write",
        "ai:use", "rpa:use"
    ],
    UserRoleEnum.VIEWER: [
        "plants:read",
        "workflows:read",
        "documents:read"
    ]
}
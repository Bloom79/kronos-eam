"""
Tenant model for multi-tenant architecture
"""

from sqlalchemy import Column, String, Integer, DateTime, Boolean, JSON, Enum
from sqlalchemy.orm import relationship, foreign
import enum

from app.core.database import Base
from app.models.base import TimestampMixin


class TenantPlanEnum(str, enum.Enum):
    PROFESSIONAL = "Professional"
    BUSINESS = "Business"
    ENTERPRISE = "Enterprise"


class TenantStatusEnum(str, enum.Enum):
    ACTIVE = "Active"
    SUSPENDED = "Suspended"
    TRIAL = "Trial"
    EXPIRED = "Expired"


class Tenant(Base, TimestampMixin):
    """Main tenant model"""
    __tablename__ = "tenants"
    
    id = Column(String(50), primary_key=True)
    name = Column(String(200), nullable=False)
    
    # Plan and limits
    plan = Column(Enum(TenantPlanEnum, values_callable=lambda x: [e.value for e in x]), default=TenantPlanEnum.PROFESSIONAL)
    status = Column(Enum(TenantStatusEnum, values_callable=lambda x: [e.value for e in x]), default=TenantStatusEnum.TRIAL)
    plan_expiry = Column(DateTime, nullable=False)
    
    # Resource limits
    max_users = Column(Integer, default=10)
    max_plants = Column(Integer, default=50)
    max_storage_gb = Column(Integer, default=100)
    api_calls_per_hour = Column(Integer, default=1000)
    
    # Contact information
    contact_email = Column(String(255))
    contact_phone = Column(String(50))
    address = Column(String(500))
    vat_number = Column(String(50))
    tax_code = Column(String(50))
    
    # Configuration
    configuration = Column(JSON, default=dict)
    features_enabled = Column(JSON, default=dict)
    
    # Billing
    stripe_customer_id = Column(String(100))
    stripe_subscription_id = Column(String(100))
    
    # Metadata
    tenant_model_metadata = Column(JSON, default=dict)
    tags = Column(JSON, default=list)
    
    # Relationships
    users = relationship("User", back_populates="tenant", primaryjoin="Tenant.id == foreign(User.tenant_id)", lazy='select')
    plants = relationship("Plant", back_populates="tenant", primaryjoin="Tenant.id == foreign(Plant.tenant_id)", lazy='select')
    
    def __repr__(self):
        return f"<Tenant {self.id}: {self.name}>"
    
    @property
    def is_active(self) -> bool:
        """Check if tenant is active"""
        return self.status == TenantStatusEnum.ACTIVE
    
    @property
    def has_feature(self, feature: str) -> bool:
        """Check if tenant has a specific feature enabled"""
        return self.features_enabled.get(feature, False)
    
    def get_limit(self, resource: str) -> int:
        """Get resource limit for tenant"""
        limits = {
            "users": self.max_users,
            "plants": self.max_plants,
            "storage_gb": self.max_storage_gb,
            "api_calls": self.api_calls_per_hour
        }
        return limits.get(resource, 0)


class TenantPlan(Base, TimestampMixin):
    """Tenant plan configuration"""
    __tablename__ = "tenant_plans"
    
    id = Column(Integer, primary_key=True)
    name = Column(Enum(TenantPlanEnum), unique=True, nullable=False)
    
    # Limits
    max_users = Column(Integer, nullable=False)
    max_plants = Column(Integer, nullable=False)
    max_storage_gb = Column(Integer, nullable=False)
    api_calls_per_hour = Column(Integer, nullable=False)
    
    # Features
    features = Column(JSON, default=dict)
    
    # Pricing
    monthly_price = Column(Integer)  # in cents
    annual_price = Column(Integer)  # in cents
    
    # Description
    description = Column(String(1000))
    benefits = Column(JSON, default=list)
    
    def __repr__(self):
        return f"<TenantPlan {self.name}>"
    
    @classmethod
    def get_default_plans(cls):
        """Get default plan configurations"""
        return [
            {
                "name": TenantPlanEnum.PROFESSIONAL,
                "max_users": 10,
                "max_plants": 50,
                "max_storage_gb": 100,
                "api_calls_per_hour": 1000,
                "monthly_price": 29900,  # €299
                "annual_price": 299000,  # €2990
                "features": {
                    "ai_assistant": True,
                    "voice_features": False,
                    "rpa_automation": True,
                    "advanced_analytics": False,
                    "api_access": True,
                    "custom_branding": False,
                    "priority_support": False
                },
                "benefits": [
                    "Manage up to 50 plants",
                    "10 users included",
                    "Basic RPA automation",
                    "AI assistant for documents",
                    "100 GB storage"
                ]
            },
            {
                "name": TenantPlanEnum.BUSINESS,
                "max_users": 50,
                "max_plants": 200,
                "max_storage_gb": 500,
                "api_calls_per_hour": 5000,
                "monthly_price": 79900,  # €799
                "annual_price": 799000,  # €7990
                "features": {
                    "ai_assistant": True,
                    "voice_features": True,
                    "rpa_automation": True,
                    "advanced_analytics": True,
                    "api_access": True,
                    "custom_branding": True,
                    "priority_support": True
                },
                "benefits": [
                    "Manage up to 200 plants",
                    "50 users included",
                    "Advanced RPA automation",
                    "AI with voice commands",
                    "Advanced analytics",
                    "500 GB storage",
                    "Priority support"
                ]
            },
            {
                "name": TenantPlanEnum.ENTERPRISE,
                "max_users": -1,  # Unlimited
                "max_plants": -1,  # Unlimited
                "max_storage_gb": -1,  # Unlimited
                "api_calls_per_hour": -1,  # Unlimited
                "monthly_price": None,  # Custom pricing
                "annual_price": None,  # Custom pricing
                "features": {
                    "ai_assistant": True,
                    "voice_features": True,
                    "rpa_automation": True,
                    "advanced_analytics": True,
                    "api_access": True,
                    "custom_branding": True,
                    "priority_support": True,
                    "dedicated_instance": True,
                    "custom_integrations": True,
                    "sla_guarantee": True
                },
                "benefits": [
                    "Unlimited plants and users",
                    "Unlimited storage",
                    "All features included",
                    "Dedicated instance",
                    "Custom integrations",
                    "SLA guarantee",
                    "Dedicated account manager"
                ]
            }
        ]
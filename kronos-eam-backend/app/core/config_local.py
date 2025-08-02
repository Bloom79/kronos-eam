"""
Local development configuration
Overrides the main config for local testing
"""

import os
from typing import Dict, Any

class LocalSettings:
    """Local development settings"""
    
    # Basic app settings
    APP_NAME = "Kronos EAM Backend (Local)"
    APP_VERSION = "1.0.0"
    API_V1_STR = "/api/v1"
    ENVIRONMENT = "development"
    DEBUG = True
    LOG_LEVEL = "INFO"
    LOG_FORMAT = "plain"
    
    # Database
    DATABASE_URL = "sqlite:///./local_kronos.db"
    
    # Security
    SECRET_KEY = "local-development-secret-key-change-in-production"
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    
    # Default tenant for local development
    DEFAULT_TENANT_ID = "demo"
    
    # AI Providers (dummy keys for local testing)
    ai_providers = {
        "openai": bool(os.environ.get("OPENAI_API_KEY", "dummy-key")),
        "anthropic": bool(os.environ.get("ANTHROPIC_API_KEY", "dummy-key")),
        "google": bool(os.environ.get("GOOGLE_AI_API_KEY", "dummy-key"))
    }
    
    # CORS
    BACKEND_CORS_ORIGINS = ["http://localhost:3000", "http://localhost:8080"]
    
    # Redis (optional for local dev)
    REDIS_URL = "redis://localhost:6379/0"
    
    # Vector DB (optional for local dev)
    QDRANT_URL = "http://localhost:6333"
    QDRANT_API_KEY = None
    
    def validate_config(self):
        """Validate configuration - relaxed for local development"""
        # Always pass validation in local mode
        pass


# Create settings instance
settings = LocalSettings()
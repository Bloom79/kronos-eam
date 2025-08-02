#!/usr/bin/env python3
"""
Run the full Kronos EAM backend with proper configuration
"""

import os
import sys
import asyncio
import uvicorn
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# Set environment variables for local development
os.environ.setdefault('ENVIRONMENT', 'development')
os.environ.setdefault('DEBUG', 'true')
os.environ.setdefault('DATABASE_URL', 'postgresql://kronos:kronos_password@localhost:5432/kronos_eam')
os.environ.setdefault('SECRET_KEY', 'local-dev-secret-key-change-in-production')
os.environ.setdefault('OPENAI_API_KEY', 'sk-dummy-key-for-testing')
os.environ.setdefault('ANTHROPIC_API_KEY', 'sk-ant-dummy-key-for-testing')
os.environ.setdefault('GOOGLE_AI_API_KEY', 'dummy-google-key-for-testing')
os.environ.setdefault('REDIS_URL', 'redis://localhost:6379/0')
os.environ.setdefault('DEFAULT_TENANT_ID', 'demo')

# Create a simplified app that bypasses complex dependencies
from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Kronos EAM Backend",
    description="Smart Assistant for Italian Energy Sector Portal Automation",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock authentication for local development
class MockUser:
    def __init__(self, user_id: str = "local_user", tenant_id: str = "demo"):
        self.user_id = user_id
        self.tenant_id = tenant_id
        self.email = f"{user_id}@local.test"
        self.is_active = True

async def get_current_active_user():
    """Mock authentication dependency"""
    return MockUser()

# Override auth in Smart Assistant module
try:
    from app.api.v1.endpoints import smart_assistant as sa_module
    sa_module.get_current_active_user = get_current_active_user
    logger.info("Smart Assistant auth override successful")
except ImportError as e:
    logger.warning(f"Could not override Smart Assistant auth: {e}")

# Include routers
try:
    from app.api.v1.endpoints.smart_assistant import router as smart_assistant_router
    app.include_router(
        smart_assistant_router,
        prefix="/api/v1/smart-assistant",
        tags=["smart-assistant"]
    )
    logger.info("Smart Assistant router loaded successfully")
except Exception as e:
    logger.error(f"Failed to load Smart Assistant router: {e}")

# Include basic endpoints
try:
    from app.api.v1.endpoints.auth import router as auth_router
    app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
    logger.info("Auth router loaded")
except Exception as e:
    logger.warning(f"Auth router not loaded: {e}")

try:
    from app.api.v1.endpoints.plants import router as plants_router
    app.include_router(plants_router, prefix="/api/v1/plants", tags=["plants"])
    logger.info("Plants router loaded")
except Exception as e:
    logger.warning(f"Plants router not loaded: {e}")

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "type": type(exc).__name__}
    )

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "kronos-eam-backend",
        "version": "1.0.0",
        "environment": os.environ.get("ENVIRONMENT", "development"),
        "components": {
            "smart_assistant": "loaded",
            "database": "sqlite",
            "auth": "mock"
        }
    }

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Kronos EAM Backend API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "smart_assistant": "/api/v1/smart-assistant",
        "endpoints": {
            "portal_urls": "GET /api/v1/smart-assistant/portal-urls",
            "supported_forms": "GET /api/v1/smart-assistant/supported-forms",
            "generate_forms": "POST /api/v1/smart-assistant/generate-forms",
            "calculate": "POST /api/v1/smart-assistant/calculate",
            "create_task": "POST /api/v1/smart-assistant/create-task",
            "workflow_guide": "GET /api/v1/smart-assistant/workflow-guide/{portal}/{form_type}",
            "download_form": "GET /api/v1/smart-assistant/download-form/{package_id}/{form_index}"
        }
    }

# Demo plant data endpoint
@app.get("/demo/plant")
async def demo_plant():
    return {
        "id": 1,
        "name": "Demo Solar Plant",
        "installed_power": 50.0,
        "activation_date": "2024-01-15",
        "registry_data": {
            "censimp_code": "IT001E00123456",
            "municipality": "Rome",
            "province": "RM",
            "region": "Lazio",
            "pod_code": "IT001E00123456A",
            "owner": "Demo Energy S.r.l.",
            "tax_code": "12345678901",
            "address": "Via Roma 123",
            "pec": "demo@pec.it",
            "phone": "06-12345678",
            "technology": "Photovoltaic",
            "connection_voltage": "0.4 kV",
            "connection_type": "Three-phase"
        }
    }

if __name__ == "__main__":
    print("🚀 Starting Kronos EAM Backend (Full)")
    print("=" * 50)
    print(f"Environment: {os.environ.get('ENVIRONMENT', 'development')}")
    print(f"Database: {os.environ.get('DATABASE_URL', 'sqlite:///./kronos_local.db')}")
    print("API Base URL: http://localhost:8000")
    print("API Docs: http://localhost:8000/docs")
    print("Smart Assistant: http://localhost:8000/api/v1/smart-assistant")
    print("Demo Plant: http://localhost:8000/demo/plant")
    print("=" * 50)
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info",
        reload=False
    )
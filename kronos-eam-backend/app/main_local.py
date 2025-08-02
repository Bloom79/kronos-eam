"""
Local development FastAPI application
Simplified version for local testing without all the production dependencies
"""

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import sys
import os
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Kronos EAM Backend (Local)",
    description="Smart Assistant for Italian Energy Sector Portal Automation - Local Development",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock user authentication for local development
class MockUser:
    def __init__(self, user_id: str = "local_user", tenant_id: str = "demo"):
        self.user_id = user_id
        self.tenant_id = tenant_id
        self.email = f"{user_id}@local.test"
        self.is_active = True

# Mock dependencies
async def get_current_active_user():
    """Mock user dependency for local development"""
    return MockUser()

# Include Smart Assistant router with mock dependencies
try:
    from app.api.v1.endpoints.smart_assistant import router as smart_assistant_router
    
    # Override the auth dependency
    import app.api.v1.endpoints.smart_assistant as sa_module
    sa_module.get_current_active_user = get_current_active_user
    
    app.include_router(
        smart_assistant_router,
        prefix="/api/v1/smart-assistant",
        tags=["smart-assistant"]
    )
    logger.info("Smart Assistant router loaded successfully")
    
except Exception as e:
    logger.error(f"Failed to load Smart Assistant router: {e}")
    
    # Create a fallback router
    from fastapi import APIRouter
    fallback_router = APIRouter()
    
    @fallback_router.get("/health")
    async def smart_assistant_health():
        return {"status": "Smart Assistant not available", "error": str(e)}
    
    app.include_router(fallback_router, prefix="/api/v1/smart-assistant")

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
        "service": "kronos-eam-backend-local",
        "version": "1.0.0",
        "environment": "local-development",
        "smart_assistant": "available"
    }

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Kronos EAM Backend API (Local Development)",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "smart_assistant": "/api/v1/smart-assistant",
        "endpoints": {
            "prepare_submission": "POST /api/v1/smart-assistant/prepare-submission",
            "generate_forms": "POST /api/v1/smart-assistant/generate-forms",
            "calculate": "POST /api/v1/smart-assistant/calculate",
            "portal_urls": "GET /api/v1/smart-assistant/portal-urls",
            "supported_forms": "GET /api/v1/smart-assistant/supported-forms"
        }
    }

# Demo endpoints for testing
@app.get("/demo/plant")
async def demo_plant():
    """Demo plant data for testing"""
    return {
        "id": 1,
        "nome": "Plant Solare Demo",
        "potenza_installata": 50.0,
        "data_attivazione": "2024-01-15",
        "anagrafica": {
            "codice_censimp": "IT001E00123456",
            "comune": "Roma",
            "provincia": "RM",
            "regione": "Lazio",
            "codice_pod": "IT001E00123456A",
            "proprietario": "Demo Energy S.r.l.",
            "codice_fiscale": "12345678901",
            "indirizzo": "Via Roma 123",
            "pec": "demo@pec.it",
            "telefono": "06-12345678",
            "tecnologia": "Fotovoltaico",
            "tensione_connessione": "0.4 kV",
            "tipo_allacciamento": "Trifase"
        }
    }

@app.get("/demo/test-schemas")
async def test_schemas():
    """Test Smart Assistant schemas"""
    try:
        from app.schemas.smart_assistant import PortalType, FormType
        return {
            "portals": [p.value for p in PortalType],
            "form_types": [f.value for f in FormType],
            "status": "schemas_loaded"
        }
    except Exception as e:
        return {"error": str(e), "status": "schemas_failed"}

if __name__ == "__main__":
    import uvicorn
    
    print("🚀 Starting Kronos EAM Backend (Local Development)")
    print("=" * 60)
    print("Environment: Local Development")
    print("Database: SQLite (in-memory)")
    print("API Base URL: http://localhost:8000")
    print("API Docs: http://localhost:8000/docs")
    print("Smart Assistant: http://localhost:8000/api/v1/smart-assistant")
    print("Demo Plant: http://localhost:8000/demo/plant")
    print("=" * 60)
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
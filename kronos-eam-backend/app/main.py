"""
Main FastAPI application for Kronos EAM Backend
Multi-tenant renewable energy asset management system
"""

from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import logging
from prometheus_client import Counter, Histogram, generate_latest, CollectorRegistry, REGISTRY
from starlette.responses import Response

from app.core.config import settings
from app.core.database import init_db, cleanup_connections
from app.core.middleware import (
    RequestTrackingMiddleware,
    TenantContextMiddleware,
    ErrorHandlingMiddleware,
    setup_cors_middleware,
    setup_trusted_host_middleware
)
from app.core.rate_limit import RateLimitMiddleware
from app.api.v1.api import api_router

# Configure logging
log_format = (
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s' 
    if settings.LOG_FORMAT == "plain" 
    else '{"time": "%(asctime)s", "name": "%(name)s", "level": "%(levelname)s", "message": "%(message)s"}'
)

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format=log_format
)
logger = logging.getLogger(__name__)

# Prometheus metrics
def setup_prometheus_metrics():
    """Setup Prometheus metrics with proper error handling."""
    try:
        # Create custom registry to avoid conflicts
        metrics_registry = CollectorRegistry()
        
        request_count = Counter(
            'http_requests_total',
            'Total HTTP requests',
            ['method', 'endpoint', 'status'],
            registry=metrics_registry
        )
        request_duration = Histogram(
            'http_request_duration_seconds',
            'HTTP request duration',
            ['method', 'endpoint'],
            registry=metrics_registry
        )
        
        return request_count, request_duration, metrics_registry
    except ValueError:
        # Use default registry if custom fails
        request_count = Counter(
            'http_requests_total',
            'Total HTTP requests',
            ['method', 'endpoint', 'status']
        )
        request_duration = Histogram(
            'http_request_duration_seconds',
            'HTTP request duration',
            ['method', 'endpoint']
        )
        
        return request_count, request_duration, REGISTRY


REQUEST_COUNT, REQUEST_DURATION, metrics_registry = setup_prometheus_metrics()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle.
    
    Handles startup and shutdown tasks for the application.
    """
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Tenant isolation mode: {settings.TENANT_ISOLATION_MODE}")
    
    # Initialize database
    try:
        init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise
    
    # Initialize services
    try:
        # Import and initialize AI agents if configured
        if settings.OPENAI_API_KEY or settings.GOOGLE_API_KEY:
            from app.agents import initialize_agents
            initialize_agents()
            logger.info("AI agents initialized")
    except ImportError:
        logger.warning("AI agents module not found, skipping initialization")
    except Exception as e:
        logger.error(f"Failed to initialize AI agents: {e}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down application")
    cleanup_connections()
    logger.info("Application shutdown complete")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Setup middleware
def setup_middleware(app: FastAPI) -> None:
    """Configure all application middleware."""
    # Error handling (outermost)
    app.add_middleware(ErrorHandlingMiddleware)
    
    # Rate limiting
    app.add_middleware(RateLimitMiddleware)
    
    # Request tracking
    app.add_middleware(
        RequestTrackingMiddleware,
        request_counter=REQUEST_COUNT,
        request_duration=REQUEST_DURATION
    )
    
    # Tenant context
    app.add_middleware(TenantContextMiddleware)
    
    # CORS
    if settings.BACKEND_CORS_ORIGINS:
        setup_cors_middleware(app, settings.BACKEND_CORS_ORIGINS)
    
    # Trusted hosts
    setup_trusted_host_middleware(app)


# Apply middleware
setup_middleware(app)


# Exception handlers
@app.exception_handler(404)
async def not_found_handler(request: Request, exc) -> JSONResponse:
    """Handle 404 Not Found errors."""
    return JSONResponse(
        status_code=404,
        content={
            "detail": "Resource not found",
            "path": str(request.url.path),
            "method": request.method
        }
    )


@app.exception_handler(500)
async def internal_error_handler(request: Request, exc) -> JSONResponse:
    """Handle 500 Internal Server errors."""
    request_id = getattr(request.state, "request_id", None)
    logger.error(f"Internal server error [Request ID: {request_id}]: {exc}")
    
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "request_id": request_id
        }
    )


# Root endpoint
@app.get("/", tags=["root"])
async def root() -> dict:
    """Root endpoint providing API information."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "operational",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health",
        "metrics": "/metrics"
    }


# Health check
@app.get("/health", tags=["monitoring"])
async def health_check() -> dict:
    """Health check endpoint for monitoring.
    
    Returns:
        Dictionary with service health status
    """
    health_status = {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "tenant_mode": settings.TENANT_ISOLATION_MODE,
        "services": {}
    }
    
    # Check database
    try:
        from app.core.database import engine
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        health_status["services"]["database"] = "connected"
    except Exception as e:
        health_status["services"]["database"] = f"error: {str(e)}"
        health_status["status"] = "unhealthy"
    
    # Check Redis if configured and not disabled
    if settings.DISABLE_REDIS:
        health_status["services"]["redis"] = "disabled"
    elif settings.REDIS_URL:
        try:
            import redis
            r = redis.from_url(str(settings.REDIS_URL))
            r.ping()
            health_status["services"]["redis"] = "connected"
        except Exception as e:
            health_status["services"]["redis"] = f"error: {str(e)}"
    
    # Check Qdrant if configured and not disabled
    if settings.DISABLE_QDRANT:
        health_status["services"]["qdrant"] = "disabled"
    else:
        try:
            from qdrant_client import QdrantClient
            client = QdrantClient(
                host=settings.QDRANT_HOST,
                port=settings.QDRANT_PORT
            )
            # Try to get collections
            client.get_collections()
            health_status["services"]["qdrant"] = "connected"
        except Exception as e:
            health_status["services"]["qdrant"] = f"error: {str(e)}"
    
    # List available AI providers
    ai_providers = []
    if settings.OPENAI_API_KEY:
        ai_providers.append("openai")
    if settings.GOOGLE_API_KEY:
        ai_providers.append("google")
    if settings.ANTHROPIC_API_KEY:
        ai_providers.append("anthropic")
    
    health_status["services"]["ai_providers"] = ai_providers or "none configured"
    
    return health_status


# Metrics endpoint
@app.get("/metrics", tags=["monitoring"])
async def metrics() -> Response:
    """Prometheus metrics endpoint."""
    return Response(
        content=generate_latest(metrics_registry),
        media_type="text/plain"
    )


# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)


# WebSocket endpoint for real-time features
@app.websocket("/ws/{tenant_id}")
async def websocket_endpoint(websocket, tenant_id: str) -> None:
    """WebSocket endpoint for real-time updates.
    
    Args:
        websocket: WebSocket connection
        tenant_id: Tenant identifier for isolation
    """
    try:
        await websocket.accept()
        await websocket.send_json({
            "type": "connection",
            "status": "connected",
            "tenant_id": tenant_id,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # TODO: Implement full WebSocket handler with:
        # - Authentication verification
        # - Message routing
        # - Real-time notifications
        # - Presence tracking
        
        # For now, echo messages
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Echo: {data}")
    except Exception as e:
        logger.error(f"WebSocket error for tenant {tenant_id}: {e}")
    finally:
        await websocket.close()


if __name__ == "__main__":
    import uvicorn
    import os
    
    # Configure uvicorn
    port = int(os.environ.get("PORT", "8000"))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
        access_log=settings.ENVIRONMENT != "production"
    )
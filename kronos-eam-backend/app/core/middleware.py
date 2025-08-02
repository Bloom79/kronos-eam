"""
Application middleware components.
Centralizes all middleware logic for better organization.
"""

import time
import logging
from typing import Callable
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from prometheus_client import Counter, Histogram

from app.core.config import settings

logger = logging.getLogger(__name__)


class RequestTrackingMiddleware(BaseHTTPMiddleware):
    """Middleware for tracking requests with metrics and request IDs."""
    
    def __init__(
        self, 
        app, 
        request_counter: Counter, 
        request_duration: Histogram
    ):
        super().__init__(app)
        self.request_counter = request_counter
        self.request_duration = request_duration
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Track request metrics and add request ID."""
        start_time = time.time()
        
        # Add request ID for tracing
        request_id = request.headers.get("X-Request-ID", f"req_{int(time.time() * 1000)}")
        request.state.request_id = request_id
        
        # Process request
        response = await call_next(request)
        
        # Track metrics
        duration = time.time() - start_time
        self.request_counter.labels(
            method=request.method,
            endpoint=request.url.path,
            status=response.status_code
        ).inc()
        self.request_duration.labels(
            method=request.method,
            endpoint=request.url.path
        ).observe(duration)
        
        # Add headers
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Response-Time"] = f"{duration:.3f}"
        
        return response


class TenantContextMiddleware(BaseHTTPMiddleware):
    """Middleware for setting tenant context for each request."""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Extract and set tenant context."""
        tenant_id = None
        
        # 1. From header
        tenant_id = request.headers.get("X-Tenant-ID")
        
        # 2. From subdomain (e.g., tenant1.kronos-eam.com)
        if not tenant_id and "." in request.headers.get("host", ""):
            subdomain = request.headers["host"].split(".")[0]
            if subdomain not in ["www", "api", "app"]:
                tenant_id = subdomain
        
        # 3. From JWT token or API key (handled in auth dependencies)
        
        # Store in request state
        request.state.tenant_id = tenant_id or settings.DEFAULT_TENANT_ID
        
        response = await call_next(request)
        return response


class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """Centralized error handling middleware."""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Handle errors consistently across the application."""
        try:
            response = await call_next(request)
            return response
        except Exception as e:
            logger.error(f"Unhandled exception: {e}", exc_info=True)
            
            # Get request ID if available
            request_id = getattr(request.state, "request_id", None)
            
            return JSONResponse(
                status_code=500,
                content={
                    "detail": "Internal server error",
                    "request_id": request_id,
                    "error_type": type(e).__name__
                }
            )


def setup_cors_middleware(app, origins: list) -> None:
    """Setup CORS middleware with proper configuration.
    
    Args:
        app: FastAPI application instance
        origins: List of allowed origins
    """
    from fastapi.middleware.cors import CORSMiddleware
    
    # Ensure origins don't have trailing slashes
    clean_origins = [str(origin).rstrip('/') for origin in origins]
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=clean_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-Request-ID", "X-Response-Time"]
    )


def setup_trusted_host_middleware(app, allowed_hosts: list = None) -> None:
    """Setup trusted host middleware.
    
    Args:
        app: FastAPI application instance
        allowed_hosts: List of allowed hosts
    """
    from fastapi.middleware.trustedhost import TrustedHostMiddleware
    
    hosts = allowed_hosts or ["*"]
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=hosts)
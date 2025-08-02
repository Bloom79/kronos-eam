"""
Rate limiting implementation for multi-tenant API
"""

from typing import Optional, Callable
from datetime import datetime, timedelta
import time
from fastapi import HTTPException, Request, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import redis
from functools import wraps

from app.core.config import settings
from app.api.deps import get_redis_client


class RateLimitExceeded(HTTPException):
    """Rate limit exceeded exception"""
    def __init__(self, retry_after: int = 60):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded",
            headers={"Retry-After": str(retry_after)}
        )


class RateLimiter:
    """Rate limiter using sliding window algorithm"""
    
    def __init__(self, 
                 redis_client: redis.Redis,
                 requests: int = 60,
                 window: int = 60,
                 prefix: str = "rate_limit"):
        self.redis_client = redis_client
        self.requests = requests
        self.window = window
        self.prefix = prefix
    
    def _get_key(self, identifier: str) -> str:
        """Generate Redis key for rate limiting"""
        return f"{self.prefix}:{identifier}"
    
    def _get_current_window(self) -> int:
        """Get current time window"""
        return int(time.time() // self.window)
    
    async def check_rate_limit(self, identifier: str) -> tuple[bool, int]:
        """
        Check if request is within rate limit
        Returns (allowed, remaining_requests)
        """
        key = self._get_key(identifier)
        current_window = self._get_current_window()
        
        # Use pipeline for atomic operations
        pipe = self.redis_client.pipeline()
        
        # Clean old windows (keep last 2 windows)
        old_window = current_window - 2
        pipe.zremrangebyscore(key, 0, old_window)
        
        # Count requests in current window
        pipe.zcount(key, current_window, current_window)
        
        # Get total count
        pipe.zcard(key)
        
        results = pipe.execute()
        current_count = results[1]
        
        if current_count >= self.requests:
            return False, 0
        
        # Add current request
        timestamp = time.time()
        pipe = self.redis_client.pipeline()
        pipe.zadd(key, {f"{timestamp}": current_window})
        pipe.expire(key, self.window * 2)  # Expire after 2 windows
        pipe.execute()
        
        remaining = self.requests - current_count - 1
        return True, max(0, remaining)
    
    def get_reset_time(self, identifier: str) -> int:
        """Get time until rate limit resets"""
        current_window = self._get_current_window()
        next_window = (current_window + 1) * self.window
        return next_window - int(time.time())


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware for FastAPI"""
    
    def __init__(self, app, redis_url: str = None):
        super().__init__(app)
        self.redis_client = redis.from_url(
            redis_url or str(settings.REDIS_URL),
            decode_responses=True
        )
        
        # Different rate limiters for different scopes
        self.global_limiter = RateLimiter(
            self.redis_client,
            requests=1000,
            window=3600,  # 1 hour
            prefix="global"
        )
        
        self.tenant_limiter = RateLimiter(
            self.redis_client,
            requests=settings.RATE_LIMIT_PER_HOUR,
            window=3600,
            prefix="tenant"
        )
        
        self.user_limiter = RateLimiter(
            self.redis_client,
            requests=settings.RATE_LIMIT_PER_MINUTE,
            window=60,
            prefix="user"
        )
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Apply rate limiting to requests"""
        # Skip rate limiting for health checks and docs
        if request.url.path in ["/health", "/docs", "/redoc", "/openapi.json"]:
            return await call_next(request)
        
        # Get identifiers
        client_ip = request.client.host
        tenant_id = getattr(request.state, "tenant_id", "unknown")
        
        # Extract user ID from JWT if available
        user_id = None
        if hasattr(request.state, "user_id"):
            user_id = request.state.user_id
        
        # Check global rate limit (by IP)
        allowed, remaining = await self.global_limiter.check_rate_limit(client_ip)
        if not allowed:
            reset_time = self.global_limiter.get_reset_time(client_ip)
            raise RateLimitExceeded(retry_after=reset_time)
        
        # Check tenant rate limit
        if tenant_id != "unknown":
            allowed, remaining = await self.tenant_limiter.check_rate_limit(tenant_id)
            if not allowed:
                reset_time = self.tenant_limiter.get_reset_time(tenant_id)
                raise RateLimitExceeded(retry_after=reset_time)
        
        # Check user rate limit
        if user_id:
            identifier = f"{tenant_id}:{user_id}"
            allowed, remaining = await self.user_limiter.check_rate_limit(identifier)
            if not allowed:
                reset_time = self.user_limiter.get_reset_time(identifier)
                raise RateLimitExceeded(retry_after=reset_time)
        
        # Process request
        response = await call_next(request)
        
        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(self.user_limiter.requests)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(
            int(time.time()) + self.user_limiter.get_reset_time(identifier if user_id else client_ip)
        )
        
        return response


def rate_limit(requests: int = 10, window: int = 60):
    """
    Decorator for rate limiting specific endpoints
    Usage:
        @router.get("/expensive-operation")
        @rate_limit(requests=5, window=60)
        async def expensive_operation():
            ...
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Get request object from args
            request = None
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break
            
            if not request:
                # Try to get from kwargs
                request = kwargs.get("request")
            
            if not request:
                # No request object, skip rate limiting
                return await func(*args, **kwargs)
            
            # Get Redis client
            redis_client = get_redis_client()
            
            # Create rate limiter for this endpoint
            endpoint_limiter = RateLimiter(
                redis_client,
                requests=requests,
                window=window,
                prefix=f"endpoint:{request.url.path}"
            )
            
            # Get identifier
            identifier = request.client.host
            if hasattr(request.state, "user_id"):
                identifier = f"{request.state.tenant_id}:{request.state.user_id}"
            
            # Check rate limit
            allowed, remaining = await endpoint_limiter.check_rate_limit(identifier)
            if not allowed:
                reset_time = endpoint_limiter.get_reset_time(identifier)
                raise RateLimitExceeded(retry_after=reset_time)
            
            return await func(*args, **kwargs)
        
        return wrapper
    return decorator


class TenantRateLimiter:
    """Tenant-specific rate limiting with different tiers"""
    
    TIER_LIMITS = {
        "Professional": {"per_minute": 60, "per_hour": 1000, "per_day": 10000},
        "Business": {"per_minute": 120, "per_hour": 5000, "per_day": 50000},
        "Enterprise": {"per_minute": -1, "per_hour": -1, "per_day": -1},  # Unlimited
    }
    
    def __init__(self, redis_client: redis.Redis):
        self.redis_client = redis_client
    
    async def check_tenant_limits(self, tenant_id: str, tenant_plan: str) -> bool:
        """Check if tenant is within their plan limits"""
        limits = self.TIER_LIMITS.get(tenant_plan, self.TIER_LIMITS["Professional"])
        
        # Check each time window
        for window_name, limit in limits.items():
            if limit == -1:  # Unlimited
                continue
            
            window_seconds = {
                "per_minute": 60,
                "per_hour": 3600,
                "per_day": 86400
            }[window_name]
            
            key = f"tenant_usage:{tenant_id}:{window_name}"
            current = self.redis_client.get(key)
            
            if current and int(current) >= limit:
                return False
            
            # Increment with expiry
            pipe = self.redis_client.pipeline()
            pipe.incr(key)
            pipe.expire(key, window_seconds)
            pipe.execute()
        
        return True


# Utility functions for common rate limiting scenarios
def get_rate_limiter(redis_client: redis.Redis = None) -> RateLimiter:
    """Get default rate limiter instance"""
    if not redis_client:
        redis_client = get_redis_client()
    
    return RateLimiter(
        redis_client,
        requests=settings.RATE_LIMIT_PER_MINUTE,
        window=60
    )


async def check_api_key_rate_limit(api_key: str, redis_client: redis.Redis) -> bool:
    """Check rate limit for API key"""
    limiter = RateLimiter(
        redis_client,
        requests=100,  # API keys get higher limits
        window=60,
        prefix="api_key"
    )
    
    allowed, _ = await limiter.check_rate_limit(api_key)
    return allowed
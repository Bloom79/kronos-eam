"""
Custom exceptions for the application.
Provides consistent error handling across the application.
"""

from typing import Optional, Dict, Any
from fastapi import HTTPException, status


class BaseAPIException(HTTPException):
    """Base exception class for API errors."""
    
    def __init__(
        self,
        status_code: int,
        detail: str,
        headers: Optional[Dict[str, str]] = None,
        error_code: Optional[str] = None
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)
        self.error_code = error_code


class NotFoundError(BaseAPIException):
    """Resource not found error."""
    
    def __init__(
        self,
        resource: str,
        resource_id: Optional[Any] = None,
        headers: Optional[Dict[str, str]] = None
    ):
        detail = f"{resource} not found"
        if resource_id:
            detail = f"{resource} with ID {resource_id} not found"
        
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail,
            headers=headers,
            error_code="RESOURCE_NOT_FOUND"
        )


class ValidationError(BaseAPIException):
    """Validation error."""
    
    def __init__(
        self,
        detail: str,
        field: Optional[str] = None,
        headers: Optional[Dict[str, str]] = None
    ):
        if field:
            detail = f"Validation error in field '{field}': {detail}"
        
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
            headers=headers,
            error_code="VALIDATION_ERROR"
        )


class UnauthorizedError(BaseAPIException):
    """Unauthorized access error."""
    
    def __init__(
        self,
        detail: str = "Unauthorized access",
        headers: Optional[Dict[str, str]] = None
    ):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers=headers or {"WWW-Authenticate": "Bearer"},
            error_code="UNAUTHORIZED"
        )


class ForbiddenError(BaseAPIException):
    """Forbidden access error."""
    
    def __init__(
        self,
        detail: str = "Access forbidden",
        resource: Optional[str] = None,
        headers: Optional[Dict[str, str]] = None
    ):
        if resource:
            detail = f"Access to {resource} is forbidden"
        
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
            headers=headers,
            error_code="FORBIDDEN"
        )


class ConflictError(BaseAPIException):
    """Resource conflict error."""
    
    def __init__(
        self,
        detail: str,
        resource: Optional[str] = None,
        headers: Optional[Dict[str, str]] = None
    ):
        if resource:
            detail = f"Conflict with existing {resource}: {detail}"
        
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
            headers=headers,
            error_code="CONFLICT"
        )


class RateLimitError(BaseAPIException):
    """Rate limit exceeded error."""
    
    def __init__(
        self,
        detail: str = "Rate limit exceeded",
        retry_after: Optional[int] = None,
        headers: Optional[Dict[str, str]] = None
    ):
        if headers is None:
            headers = {}
        
        if retry_after:
            headers["Retry-After"] = str(retry_after)
            detail = f"{detail}. Retry after {retry_after} seconds"
        
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=detail,
            headers=headers,
            error_code="RATE_LIMIT_EXCEEDED"
        )


class ExternalServiceError(BaseAPIException):
    """External service error."""
    
    def __init__(
        self,
        service: str,
        detail: str,
        headers: Optional[Dict[str, str]] = None
    ):
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"External service '{service}' error: {detail}",
            headers=headers,
            error_code="EXTERNAL_SERVICE_ERROR"
        )


class DatabaseError(BaseAPIException):
    """Database operation error."""
    
    def __init__(
        self,
        operation: str,
        detail: Optional[str] = None,
        headers: Optional[Dict[str, str]] = None
    ):
        error_detail = f"Database {operation} failed"
        if detail:
            error_detail = f"{error_detail}: {detail}"
        
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_detail,
            headers=headers,
            error_code="DATABASE_ERROR"
        )


class ConfigurationError(BaseAPIException):
    """Configuration error."""
    
    def __init__(
        self,
        detail: str,
        config_key: Optional[str] = None,
        headers: Optional[Dict[str, str]] = None
    ):
        if config_key:
            detail = f"Configuration error for '{config_key}': {detail}"
        
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail,
            headers=headers,
            error_code="CONFIGURATION_ERROR"
        )


class TenantError(BaseAPIException):
    """Tenant-related error."""
    
    def __init__(
        self,
        detail: str,
        tenant_id: Optional[str] = None,
        headers: Optional[Dict[str, str]] = None
    ):
        if tenant_id:
            detail = f"Tenant '{tenant_id}' error: {detail}"
        
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
            headers=headers,
            error_code="TENANT_ERROR"
        )


class WorkflowError(BaseAPIException):
    """Workflow-related error."""
    
    def __init__(
        self,
        detail: str,
        workflow_id: Optional[int] = None,
        headers: Optional[Dict[str, str]] = None
    ):
        if workflow_id:
            detail = f"Workflow {workflow_id} error: {detail}"
        
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
            headers=headers,
            error_code="WORKFLOW_ERROR"
        )


class IntegrationError(BaseAPIException):
    """Integration error."""
    
    def __init__(
        self,
        integration: str,
        detail: str,
        headers: Optional[Dict[str, str]] = None
    ):
        super().__init__(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Integration '{integration}' error: {detail}",
            headers=headers,
            error_code="INTEGRATION_ERROR"
        )


class FileError(BaseAPIException):
    """File operation error."""
    
    def __init__(
        self,
        operation: str,
        detail: str,
        filename: Optional[str] = None,
        headers: Optional[Dict[str, str]] = None
    ):
        error_detail = f"File {operation} error"
        if filename:
            error_detail = f"{error_detail} for '{filename}'"
        error_detail = f"{error_detail}: {detail}"
        
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_detail,
            headers=headers,
            error_code="FILE_ERROR"
        )


# Aliases for compatibility
NotFoundException = NotFoundError
ValidationException = ValidationError
PermissionDeniedException = ForbiddenError
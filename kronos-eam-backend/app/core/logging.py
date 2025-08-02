"""
Centralized logging configuration.
Provides consistent logging setup across the application.
"""

import logging
import logging.handlers
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional
import sys

from app.core.config import settings


class JSONFormatter(logging.Formatter):
    """Custom JSON formatter for structured logging."""
    
    def format(self, record: logging.LogRecord) -> str:
        """Format log record as JSON."""
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }
        
        # Add extra fields if present
        if hasattr(record, 'user_id'):
            log_data['user_id'] = record.user_id
        if hasattr(record, 'tenant_id'):
            log_data['tenant_id'] = record.tenant_id
        if hasattr(record, 'request_id'):
            log_data['request_id'] = record.request_id
        
        # Add exception info if present
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)
        
        return json.dumps(log_data)


class TenantContextFilter(logging.Filter):
    """Filter to add tenant context to log records."""
    
    def __init__(self, tenant_id: Optional[str] = None):
        super().__init__()
        self.tenant_id = tenant_id
    
    def filter(self, record: logging.LogRecord) -> bool:
        """Add tenant_id to log record."""
        if not hasattr(record, 'tenant_id'):
            record.tenant_id = self.tenant_id or settings.DEFAULT_TENANT_ID
        return True


def setup_logging(
    log_level: str = None,
    log_format: str = None,
    log_file: Optional[str] = None,
    max_bytes: int = 10485760,  # 10MB
    backup_count: int = 5
) -> None:
    """
    Setup logging configuration for the application.
    
    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_format: Format type ('json' or 'plain')
        log_file: Optional log file path
        max_bytes: Maximum size of log file before rotation
        backup_count: Number of backup files to keep
    """
    log_level = log_level or settings.LOG_LEVEL
    log_format = log_format or settings.LOG_FORMAT
    
    # Get root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level.upper()))
    
    # Clear existing handlers
    root_logger.handlers.clear()
    
    # Create formatter
    if log_format == 'json':
        formatter = JSONFormatter()
    else:
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    console_handler.addFilter(TenantContextFilter())
    root_logger.addHandler(console_handler)
    
    # File handler (if specified)
    if log_file:
        log_path = Path(log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)
        
        file_handler = logging.handlers.RotatingFileHandler(
            log_file,
            maxBytes=max_bytes,
            backupCount=backup_count
        )
        file_handler.setFormatter(formatter)
        file_handler.addFilter(TenantContextFilter())
        root_logger.addHandler(file_handler)
    
    # Configure third-party loggers
    configure_third_party_loggers()


def configure_third_party_loggers() -> None:
    """Configure logging levels for third-party libraries."""
    # Reduce noise from third-party libraries
    logging.getLogger('uvicorn.access').setLevel(logging.WARNING)
    logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)
    logging.getLogger('httpx').setLevel(logging.WARNING)
    logging.getLogger('httpcore').setLevel(logging.WARNING)
    
    # Keep important warnings
    logging.getLogger('fastapi').setLevel(logging.INFO)
    logging.getLogger('app').setLevel(logging.DEBUG)


def get_logger(name: str, tenant_id: Optional[str] = None) -> logging.Logger:
    """
    Get a logger instance with optional tenant context.
    
    Args:
        name: Logger name (usually __name__)
        tenant_id: Optional tenant ID to include in logs
        
    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)
    
    if tenant_id:
        # Add tenant filter to this logger
        logger.addFilter(TenantContextFilter(tenant_id))
    
    return logger


class LogContext:
    """Context manager for adding context to log records."""
    
    def __init__(self, logger: logging.Logger, **context):
        self.logger = logger
        self.context = context
        self.old_factory = None
    
    def __enter__(self):
        """Enter context and set up log record factory."""
        self.old_factory = logging.getLogRecordFactory()
        
        def record_factory(*args, **kwargs):
            record = self.old_factory(*args, **kwargs)
            for key, value in self.context.items():
                setattr(record, key, value)
            return record
        
        logging.setLogRecordFactory(record_factory)
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Exit context and restore original factory."""
        logging.setLogRecordFactory(self.old_factory)


def log_performance(logger: logging.Logger, operation: str):
    """
    Decorator to log performance of functions.
    
    Args:
        logger: Logger instance
        operation: Name of the operation being performed
    """
    import functools
    import time
    
    def decorator(func):
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = await func(*args, **kwargs)
                duration = time.time() - start_time
                logger.info(
                    f"{operation} completed",
                    extra={
                        "operation": operation,
                        "duration": duration,
                        "status": "success"
                    }
                )
                return result
            except Exception as e:
                duration = time.time() - start_time
                logger.error(
                    f"{operation} failed",
                    extra={
                        "operation": operation,
                        "duration": duration,
                        "status": "error",
                        "error": str(e)
                    },
                    exc_info=True
                )
                raise
        
        @functools.wraps(func)
        def sync_wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                duration = time.time() - start_time
                logger.info(
                    f"{operation} completed",
                    extra={
                        "operation": operation,
                        "duration": duration,
                        "status": "success"
                    }
                )
                return result
            except Exception as e:
                duration = time.time() - start_time
                logger.error(
                    f"{operation} failed",
                    extra={
                        "operation": operation,
                        "duration": duration,
                        "status": "error",
                        "error": str(e)
                    },
                    exc_info=True
                )
                raise
        
        # Return appropriate wrapper based on function type
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator


# Import asyncio only when needed
import asyncio
"""
Application constants.
Centralizes all constants used throughout the application.
"""

from enum import Enum
from typing import Dict, List


# API Version
API_VERSION = "v1"
API_PREFIX = f"/api/{API_VERSION}"

# Pagination defaults
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100

# File upload limits
MAX_FILE_SIZE_MB = 50
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
ALLOWED_FILE_EXTENSIONS = {
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", 
    ".png", ".jpg", ".jpeg", ".gif", ".bmp",
    ".txt", ".csv", ".xml", ".json"
}

# Document types
DOCUMENT_TYPES = {
    "technical": "Technical Documentation",
    "administrative": "Administrative Documents",
    "compliance": "Compliance Certificates",
    "contract": "Contracts and Agreements",
    "report": "Reports and Analytics",
    "correspondence": "Official Correspondence"
}

# Italian regions
ITALIAN_REGIONS = [
    "Abruzzo", "Basilicata", "Calabria", "Campania", "Emilia-Romagna",
    "Friuli-Venezia Giulia", "Lazio", "Liguria", "Lombardia", "Marche",
    "Molise", "Piemonte", "Puglia", "Sardegna", "Sicilia", "Toscana",
    "Trentino-Alto Adige", "Umbria", "Valle d'Aosta", "Veneto"
]

# Renewable energy specific constants
POWER_PLANT_SIZES = {
    "micro": {"min": 0, "max": 20, "unit": "kW"},
    "small": {"min": 20, "max": 200, "unit": "kW"},
    "medium": {"min": 200, "max": 1000, "unit": "kW"},
    "large": {"min": 1, "max": 10, "unit": "MW"},
    "utility": {"min": 10, "max": float('inf'), "unit": "MW"}
}

# Compliance deadlines (days before deadline to trigger notifications)
DEADLINE_NOTIFICATIONS = {
    "critical": 7,
    "warning": 30,
    "reminder": 60
}

# Integration timeouts (seconds)
INTEGRATION_TIMEOUTS = {
    "gse": 30,
    "terna": 30,
    "customs": 45,
    "dso": 30,
    "default": 30
}

# Workflow automation
MAX_WORKFLOW_STEPS = 50
MAX_PARALLEL_TASKS = 10
WORKFLOW_TIMEOUT_HOURS = 72

# Cache TTL (seconds)
CACHE_TTL = {
    "user_session": 1800,  # 30 minutes
    "plant_data": 300,     # 5 minutes
    "statistics": 600,     # 10 minutes
    "documents": 3600,     # 1 hour
    "ai_response": 300     # 5 minutes
}

# Rate limiting
RATE_LIMIT_DEFAULTS = {
    "requests_per_minute": 60,
    "requests_per_hour": 1000,
    "requests_per_day": 10000
}

# AI Agent configurations
AI_AGENT_MODELS = {
    "openai": {
        "chat": "gpt-4-turbo-preview",
        "embedding": "text-embedding-3-small",
        "completion": "gpt-3.5-turbo"
    },
    "google": {
        "chat": "gemini-1.5-pro",
        "embedding": "text-embedding-004"
    },
    "anthropic": {
        "chat": "claude-3-opus-20240229"
    }
}

# Vector search
VECTOR_SEARCH_CONFIG = {
    "chunk_size": 1000,
    "chunk_overlap": 200,
    "top_k": 10,
    "similarity_threshold": 0.7
}

# Notification templates
NOTIFICATION_PRIORITIES = {
    "low": 1,
    "medium": 2,
    "high": 3,
    "critical": 4
}

# System roles
SYSTEM_ROLES = [
    "Admin",
    "Asset Manager", 
    "Operator",
    "Viewer",
    "API User"
]

# Portal URLs (for smart assistant)
PORTAL_URLS = {
    "gse": {
        "base": "https://www.gse.it",
        "login": "https://www.gse.it/login",
        "dashboard": "https://www.gse.it/area-clienti"
    },
    "terna": {
        "base": "https://www.terna.it",
        "gaudi": "https://www.terna.it/gaudi",
        "myterna": "https://myterna.terna.it"
    },
    "customs": {
        "base": "https://www.adm.gov.it",
        "pudm": "https://pudm.adm.gov.it"
    }
}

# Error messages
ERROR_MESSAGES = {
    "unauthorized": "Unauthorized access",
    "forbidden": "Access forbidden",
    "not_found": "Resource not found",
    "validation_error": "Validation error",
    "server_error": "Internal server error",
    "rate_limit": "Rate limit exceeded",
    "file_too_large": f"File size exceeds {MAX_FILE_SIZE_MB}MB limit",
    "invalid_file_type": "Invalid file type",
    "tenant_not_found": "Tenant not found",
    "user_not_found": "User not found",
    "plant_not_found": "Plant not found",
    "workflow_not_found": "Workflow not found"
}

# Success messages  
SUCCESS_MESSAGES = {
    "created": "Resource created successfully",
    "updated": "Resource updated successfully",
    "deleted": "Resource deleted successfully",
    "uploaded": "File uploaded successfully",
    "workflow_started": "Workflow started successfully",
    "task_completed": "Task completed successfully"
}

# Regex patterns
REGEX_PATTERNS = {
    "email": r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    "italian_fiscal_code": r'^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$',
    "italian_vat": r'^\d{11}$',
    "pod": r'^IT\d{3}E\d{8}$',  # Point of Delivery code
    "phone": r'^\+?[0-9\s\-\(\)]+$'
}

# Date formats
DATE_FORMATS = {
    "iso": "%Y-%m-%d",
    "italian": "%d/%m/%Y",
    "datetime_iso": "%Y-%m-%dT%H:%M:%S",
    "datetime_italian": "%d/%m/%Y %H:%M:%S"
}
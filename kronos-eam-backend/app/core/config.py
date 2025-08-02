"""
Configuration management for Kronos EAM Backend
Multi-tenant aware configuration with environment variable support
"""

from typing import List, Optional, Dict, Any
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, field_validator, PostgresDsn, RedisDsn, AnyUrl
import secrets
import logging
from functools import lru_cache

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Kronos EAM Backend"
    APP_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"
    
    # Security
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"
    BCRYPT_ROUNDS: int = 12
    
    # Multi-tenant Configuration
    ENABLE_MULTI_TENANT: bool = True
    DEFAULT_TENANT_ID: str = "demo"
    MAX_USERS_PER_TENANT: int = 100
    TENANT_ISOLATION_MODE: str = "strict"  # strict, shared, hybrid
    
    # Database
    DATABASE_URL: str = "postgresql://kronos:kronos_password@localhost:5432/kronos_eam"
    REDIS_URL: RedisDsn = "redis://localhost:6379/0"
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 0
    DB_POOL_PRE_PING: bool = True
    
    # Service Toggles (set by start.sh script)
    DISABLE_REDIS: bool = False
    DISABLE_QDRANT: bool = False
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = []
    
    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: str | List[str]) -> List[str] | str:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    # AI Services Configuration
    OPENAI_API_KEY: Optional[str] = None
    GOOGLE_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-1.5-flash"
    GEMMA_MODEL: str = "gemma-2-9b-it"
    
    # LangGraph Configuration
    LANGGRAPH_MEMORY_TYPE: str = "redis"  # redis, postgresql, in-memory
    LANGGRAPH_MAX_STEPS: int = 10
    LANGGRAPH_CHECKPOINT_INTERVAL: int = 5
    
    # Voice Services
    GOOGLE_CLOUD_PROJECT: Optional[str] = None
    GOOGLE_APPLICATION_CREDENTIALS: Optional[str] = None
    VOICE_LANGUAGE_CODE: str = "it-IT"  # Italian by default
    VOICE_SAMPLE_RATE: int = 16000
    
    # Vector Database Configuration
    VECTOR_STORE_TYPE: str = "qdrant"  # qdrant or vertex_ai
    VECTOR_DB_COLLECTION: str = "kronos_documents"
    EMBEDDING_MODEL: str = "text-embedding-ada-002"
    EMBEDDING_DIMENSION: int = 768
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    
    # Qdrant Configuration
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    QDRANT_URL: Optional[str] = None  # Override with full URL if needed
    QDRANT_API_KEY: Optional[str] = None
    QDRANT_USE_GRPC: bool = False
    
    # Vertex AI Vector Search Configuration
    VERTEX_PROJECT_ID: Optional[str] = None
    VERTEX_REGION: str = "us-central1"
    VERTEX_INDEX_ID: Optional[str] = None
    VERTEX_INDEX_ENDPOINT_ID: Optional[str] = None
    VERTEX_GCS_BUCKET: Optional[str] = None
    VERTEX_INDEX_UPDATE_METHOD: str = "STREAM_UPDATE"  # STREAM_UPDATE or BATCH_UPDATE
    
    # RPA Configuration
    RPA_PROXY_PORT: int = 8888
    PLAYWRIGHT_BROWSERS_PATH: str = "/tmp/playwright-browsers"
    RPA_SCREENSHOT_PATH: str = "/tmp/rpa-screenshots"
    RPA_HEADLESS: bool = True
    RPA_TIMEOUT: int = 60000  # 60 seconds
    RPA_MAX_RETRIES: int = 3
    
    # Task Queue Configuration
    CELERY_BROKER_URL: RedisDsn = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: RedisDsn = "redis://localhost:6379/2"
    CELERY_TASK_TIME_LIMIT: int = 3600  # 1 hour
    CELERY_TASK_SOFT_TIME_LIMIT: int = 3300
    
    # External Services
    GSE_API_URL: str = "https://areaclienti.gse.it"
    TERNA_API_URL: str = "https://myterna.terna.it"
    DOGANE_API_URL: str = "https://telematici.adm.gov.it"
    DSO_API_URL: str = "https://www.e-distribuzione.it"
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_PER_HOUR: int = 1000
    RATE_LIMIT_STORAGE: str = "redis"  # redis or memory
    
    # File Upload Configuration
    MAX_UPLOAD_SIZE: int = 52428800  # 50MB
    ALLOWED_EXTENSIONS: List[str] = ["pdf", "doc", "docx", "xls", "xlsx", "png", "jpg", "jpeg", "xml"]
    UPLOAD_PATH: str = "/tmp/uploads"
    
    # WebSocket Configuration
    WS_MESSAGE_QUEUE: str = "redis"  # redis or memory
    WS_HEARTBEAT_INTERVAL: int = 30
    
    # Monitoring
    SENTRY_DSN: Optional[str] = None
    PROMETHEUS_PORT: int = 9090
    ENABLE_METRICS: bool = True
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"  # json or plain
    LOG_FILE: Optional[str] = None
    
    # Email Configuration (for notifications)
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM: str = "noreply@kronos-eam.com"
    
    # Cache Configuration
    CACHE_TTL: int = 300  # 5 minutes
    CACHE_PREFIX: str = "kronos:"
    
    # Feature Flags
    ENABLE_AI_ASSISTANT: bool = True
    ENABLE_VOICE_FEATURES: bool = True
    ENABLE_RPA_AUTOMATION: bool = True
    ENABLE_ADVANCED_ANALYTICS: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        
    def get_tenant_database_url(self, tenant_id: str) -> str:
        """Generate tenant-specific database URL if needed"""
        if self.TENANT_ISOLATION_MODE == "strict":
            # Each tenant gets its own database
            base_url = str(self.DATABASE_URL).rstrip("/")
            return f"{base_url}_{tenant_id}"
        return str(self.DATABASE_URL)
    
    def get_tenant_redis_prefix(self, tenant_id: str) -> str:
        """Get tenant-specific Redis key prefix"""
        return f"{self.CACHE_PREFIX}tenant:{tenant_id}:"
    
    def get_vector_collection_name(self, tenant_id: str) -> str:
        """Get tenant-specific vector collection name"""
        return f"{self.VECTOR_DB_COLLECTION}_{tenant_id}"
    
    @property
    def ai_providers(self) -> Dict[str, bool]:
        """Check which AI providers are configured"""
        return {
            "openai": bool(self.OPENAI_API_KEY),
            "google": bool(self.GOOGLE_API_KEY),
            "anthropic": bool(self.ANTHROPIC_API_KEY),
        }
    
    @property
    def is_production(self) -> bool:
        """Check if running in production"""
        return self.ENVIRONMENT.lower() == "production"
    
    def validate_config(self) -> None:
        """Validate configuration on startup"""
        if self.is_production:
            # Only check critical settings in production
            if self.SECRET_KEY == "your-secret-key-change-this":
                logger.warning("Using default SECRET_KEY in production is insecure!")
            if self.DEBUG:
                logger.warning("DEBUG is True in production!")
            # Don't require SENTRY_DSN - it's optional
            if not self.SENTRY_DSN:
                logger.warning("SENTRY_DSN not configured for production monitoring")
        
        if self.ENABLE_AI_ASSISTANT:
            if not any(self.ai_providers.values()):
                logger.warning("No AI providers configured, disabling AI features")
                self.ENABLE_AI_ASSISTANT = False
        
        if self.ENABLE_VOICE_FEATURES:
            if not self.GOOGLE_CLOUD_PROJECT or not self.GOOGLE_APPLICATION_CREDENTIALS:
                logger.warning("Google Cloud not configured, disabling voice features")
                self.ENABLE_VOICE_FEATURES = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    settings = Settings()
    settings.validate_config()
    return settings


settings = get_settings()
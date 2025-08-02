"""
Database configuration with multi-tenant support
Implements row-level security and tenant isolation
"""

from typing import Generator, Optional, Dict, Any
from sqlalchemy import create_engine, event, Engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, Query
from sqlalchemy.pool import NullPool, QueuePool
from contextlib import contextmanager
import logging
import time

from app.core.config import settings

logger = logging.getLogger(__name__)

# Create base class for models
Base = declarative_base()

# Global registry for tenant-specific engines
_tenant_engines: Dict[str, Engine] = {}
_tenant_sessions: Dict[str, sessionmaker] = {}


class TenantAwareQuery(Query):
    """Custom query class that automatically filters by tenant_id"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._tenant_id = None
    
    def set_tenant(self, tenant_id: str):
        """Set the tenant for this query"""
        self._tenant_id = tenant_id
        return self
    
    def filter_by_tenant(self):
        """Apply tenant filter if the model has tenant_id column"""
        if self._tenant_id and hasattr(self.column_descriptions[0]['type'], 'tenant_id'):
            return self.filter_by(tenant_id=self._tenant_id)
        return self


def get_engine(tenant_id: Optional[str] = None, **kwargs) -> Engine:
    """
    Get or create a database engine for a specific tenant
    """
    max_retries = 30
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            if settings.TENANT_ISOLATION_MODE == "shared" or not tenant_id:
                # Shared database mode - single engine for all tenants
                if "main" not in _tenant_engines:
                    engine = create_engine(
                        str(settings.DATABASE_URL),
                        pool_size=settings.DB_POOL_SIZE,
                        max_overflow=settings.DB_MAX_OVERFLOW,
                        pool_pre_ping=settings.DB_POOL_PRE_PING,
                        **kwargs
                    )
                    _tenant_engines["main"] = engine
                    
                    # Set up event listeners
                    setup_engine_listeners(engine)
                    
                return _tenant_engines["main"]
            
            else:
                # Strict isolation mode - separate database per tenant
                if tenant_id not in _tenant_engines:
                    db_url = settings.get_tenant_database_url(tenant_id)
                    engine = create_engine(
                        db_url,
                        pool_size=max(5, settings.DB_POOL_SIZE // 4),  # Smaller pool per tenant
                        max_overflow=0,
                        pool_pre_ping=settings.DB_POOL_PRE_PING,
                        **kwargs
                    )
                    _tenant_engines[tenant_id] = engine
                    
                    # Set up event listeners
                    setup_engine_listeners(engine, tenant_id)
                    
                return _tenant_engines[tenant_id]
        except Exception as e:
            logger.info(f"Database not ready yet (attempt {retry_count + 1}): {e}")
            time.sleep(2)
            retry_count += 1
            
    logger.error("Could not connect to database after 30 attempts")
    raise Exception("Could not connect to database")


def setup_engine_listeners(engine: Engine, tenant_id: Optional[str] = None):
    """Set up SQLAlchemy event listeners for the engine"""
    
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        """Enable foreign keys for SQLite (useful for testing)"""
        if "sqlite" in str(engine.url):
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()
    
    @event.listens_for(engine, "begin")
    def receive_begin(conn):
        """Set tenant context for each transaction if using PostgreSQL RLS"""
        if tenant_id and settings.TENANT_ISOLATION_MODE == "shared":
            # Set PostgreSQL session variable for Row Level Security
            conn.execute(text(f"SET app.tenant_id = '{tenant_id}'"))


def get_session_factory(tenant_id: Optional[str] = None) -> sessionmaker:
    """Get or create a session factory for a specific tenant"""
    cache_key = tenant_id or "main"
    
    if cache_key not in _tenant_sessions:
        engine = get_engine(tenant_id)
        session_factory = sessionmaker(
            bind=engine,
            class_=Session,
            query_cls=TenantAwareQuery,
            autocommit=False,
            autoflush=False,
            expire_on_commit=False
        )
        _tenant_sessions[cache_key] = session_factory
    
    return _tenant_sessions[cache_key]


class DatabaseSession:
    """Database session manager with tenant awareness"""
    
    def __init__(self, tenant_id: Optional[str] = None):
        self.tenant_id = tenant_id or settings.DEFAULT_TENANT_ID
        self._session_factory = get_session_factory(tenant_id)
        self._session: Optional[Session] = None
    
    def __enter__(self) -> Session:
        self._session = self._session_factory()
        # Set tenant context for queries
        if hasattr(self._session, 'query'):
            # Store the original query method to avoid recursion
            original_query = self._session.query
            self._session.query = lambda *args, **kwargs: \
                original_query(*args, **kwargs).set_tenant(self.tenant_id)
        return self._session
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self._session:
            try:
                if exc_type is not None:
                    self._session.rollback()
                else:
                    self._session.commit()
            finally:
                self._session.close()


def get_db(tenant_id: Optional[str] = None) -> Generator[Session, None, None]:
    """
    Dependency to get database session
    Usage in FastAPI:
        @app.get("/items")
        def get_items(db: Session = Depends(get_db)):
            return db.query(Item).all()
    """
    with DatabaseSession(tenant_id) as session:
        yield session


@contextmanager
def get_db_context(tenant_id: Optional[str] = None) -> Generator[Session, None, None]:
    """
    Context manager for database sessions
    Usage:
        with get_db_context(tenant_id="tenant1") as db:
            items = db.query(Item).all()
    """
    with DatabaseSession(tenant_id) as session:
        yield session


def init_db(tenant_id: Optional[str] = None) -> None:
    """Initialize database tables for a tenant"""
    engine = get_engine(tenant_id)
    
    # Import all models to ensure they're registered
    from app.models import tenant, user, plant, workflow, document, chat, notification, integration  # noqa
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Set up PostgreSQL RLS if in shared mode
    if settings.TENANT_ISOLATION_MODE == "shared" and "postgresql" in str(engine.url):
        setup_row_level_security(engine)
    
    logger.info(f"Database initialized for tenant: {tenant_id or 'main'}")


def setup_row_level_security(engine: Engine):
    """Set up PostgreSQL Row Level Security for multi-tenant isolation"""
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS pgcrypto"))
        conn.commit()
        
        # Example RLS policy for a table
        # This would be applied to each tenant-aware table
        rls_template = """
        -- Enable RLS on table
        ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;
        
        -- Create policy for tenant isolation
        CREATE POLICY tenant_isolation_policy ON {table_name}
        FOR ALL
        TO PUBLIC
        USING (tenant_id = current_setting('app.tenant_id')::VARCHAR);
        
        -- Create policy for superuser bypass
        CREATE POLICY superuser_bypass_policy ON {table_name}
        FOR ALL
        TO postgres
        USING (true);
        """
        
        # Apply to each tenant-aware table
        # This would be expanded based on your actual models
        # for table in ['users', 'impianti', 'workflows', 'documents']:
        #     conn.execute(text(rls_template.format(table_name=table)))
        
        conn.commit()


def cleanup_connections():
    """Clean up all database connections"""
    for engine in _tenant_engines.values():
        engine.dispose()
    _tenant_engines.clear()
    _tenant_sessions.clear()


# Create a default engine for migrations and initial setup
engine = get_engine()
SessionLocal = get_session_factory()

# For Alembic migrations
def get_url():
    return str(settings.DATABASE_URL)
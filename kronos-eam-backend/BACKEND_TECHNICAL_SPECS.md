# Kronos EAM Backend Technical Specifications

## Overview

The Kronos EAM Backend is a modern, cloud-native FastAPI application designed for managing renewable energy assets in Italy. It provides a comprehensive REST API with multi-tenant support, AI-powered assistance, and integration capabilities for various government portals.

## Architecture

### Technology Stack

- **Framework**: FastAPI 0.115.5
- **Python Version**: 3.11+ (required)
- **Database**: PostgreSQL 15 with SQLAlchemy 2.0.36
- **Cache/Queue**: Redis 5.0.14
- **Vector Database**: Qdrant (via Docker)
- **Authentication**: JWT with python-jose[cryptography] 3.3.0
- **AI/ML**: LangChain 0.3.25, LangGraph 0.5.0
- **Async Support**: Full async/await with asyncio

### Project Structure

```
kronos-eam-backend/
├── app/
│   ├── api/                    # REST API endpoints
│   │   ├── v1/                # API v1 routes
│   │   │   ├── auth.py        # Authentication endpoints
│   │   │   ├── impianti.py    # Power plant management
│   │   │   ├── documents.py   # Document handling
│   │   │   ├── workflows.py   # Workflow automation
│   │   │   ├── analytics.py   # Analytics & reporting
│   │   │   ├── chat.py        # AI chat assistant
│   │   │   ├── voice.py       # Voice features
│   │   │   └── assistant.py   # Smart form assistant
│   │   └── deps.py            # Common dependencies
│   ├── agents/                # LangGraph AI agents
│   │   ├── base.py           # Base agent implementation
│   │   ├── tools.py          # Agent tools
│   │   └── prompts.py        # System prompts
│   ├── core/                  # Core functionality
│   │   ├── config.py         # Configuration management
│   │   ├── database.py       # Database connections
│   │   ├── security.py       # Security utilities
│   │   ├── rate_limit.py     # Rate limiting
│   │   └── middleware.py     # Custom middleware
│   ├── models/               # SQLAlchemy models
│   │   ├── base.py          # Base model classes
│   │   ├── tenant.py        # Multi-tenant models
│   │   ├── user.py          # User & auth models
│   │   ├── impianto.py      # Power plant models
│   │   ├── document.py      # Document models
│   │   └── workflow.py      # Workflow models
│   ├── schemas/             # Pydantic schemas
│   ├── services/            # Business logic services
│   │   ├── auth_service.py
│   │   ├── impianto_service.py
│   │   ├── document_service.py
│   │   ├── workflow_service.py
│   │   └── analytics_service.py
│   ├── integrations/        # External integrations
│   │   ├── gse_portal.py
│   │   ├── terna_portal.py
│   │   └── dogane_edi.py
│   └── utils/              # Utility functions
├── alembic/                # Database migrations
├── tests/                  # Test suite
├── scripts/               # Utility scripts
└── docker-compose.yml     # Local development services
```

## Core Dependencies

### Web Framework & API
```
fastapi==0.115.5
uvicorn[standard]==0.32.1
pydantic==2.10.3
pydantic[email]==2.10.3
email-validator==2.2.0
python-multipart==0.0.18
httpx==0.28.1
```

### Database & ORM
```
sqlalchemy==2.0.36
psycopg2-binary==2.9.10
alembic==1.14.0
```

### Authentication & Security
```
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
cryptography==43.0.3
```

### AI/ML Stack (2025 Compatible)
```
langchain==0.3.25
langchain-core>=0.3.58
langchain-community>=0.3.13
langchain-openai>=0.3.0
langchain-google-genai>=2.0.0
langchain-anthropic>=0.3.0
langchain-text-splitters>=0.3.0
langgraph>=0.5.0
langgraph-prebuilt>=0.5.0
langsmith>=0.1.17
```

### Vector Database & Embeddings
```
qdrant-client==1.12.1
chromadb==0.5.0
openai==1.57.4
google-generativeai==0.8.3
anthropic==0.40.0
```

### Caching & Queue
```
redis==5.0.14
celery==5.4.0
```

### Document Processing
```
pypdf2==3.0.1
python-docx==1.1.2
openpyxl==3.1.5
reportlab==4.2.5
PyPDF2==3.0.1
pdf2image==1.17.0
pytesseract==0.3.13
```

### Utilities
```
python-dotenv==1.0.1
pyyaml==6.0.2
click==8.1.8
tenacity==9.0.0
structlog==24.4.0
```

## Configuration

### Environment Variables (.env)
```env
# Application
APP_NAME="Kronos EAM Backend"
APP_VERSION="1.0.0"
DEBUG=True
ENVIRONMENT=development
SECRET_KEY=dev-secret-key-change-in-production

# Database
DATABASE_URL=postgresql://kronos:kronos_password@localhost:5432/kronos_eam
REDIS_URL=redis://:redis_password@localhost:6379/0

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000", "http://localhost:8080"]

# AI Services
OPENAI_API_KEY=sk-dummy-openai-key
GOOGLE_API_KEY=dummy-google-ai-key
ANTHROPIC_API_KEY=sk-ant-dummy-anthropic-key

# Features
ENABLE_AI_ASSISTANT=True
ENABLE_VOICE_FEATURES=False
ENABLE_RPA_AUTOMATION=True
ENABLE_ADVANCED_ANALYTICS=True

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_PER_HOUR=1000
MAX_UPLOAD_SIZE=10485760
ALLOWED_EXTENSIONS=["pdf", "doc", "docx", "txt"]

# Multi-tenant
DEFAULT_TENANT_ID=demo
TENANT_ISOLATION_MODE=shared
```

### Docker Services (docker-compose.yml)
```yaml
services:
  postgres:
    image: postgres:15-alpine
    ports: 5432:5432
    environment:
      POSTGRES_USER: kronos
      POSTGRES_PASSWORD: kronos_password
      POSTGRES_DB: kronos_eam

  redis:
    image: redis:7-alpine
    ports: 6379:6379
    command: redis-server --requirepass redis_password

  qdrant:
    image: qdrant/qdrant
    ports: 6333:6333
    environment:
      QDRANT__SERVICE__HTTP_PORT: 6333
```

## Multi-Tenant Architecture

### Database Isolation
- **Strategy**: Shared schema with row-level security
- **Implementation**: Every table includes `tenant_id` column
- **Enforcement**: Automatic filtering via SQLAlchemy events

### Tenant Context
```python
# Automatic tenant filtering in queries
class TenantMixin:
    tenant_id = Column(String, nullable=False, index=True)
    
    @declared_attr
    def __table_args__(cls):
        return (Index(f'ix_{cls.__tablename__}_tenant_id', 'tenant_id'),)
```

### Authentication Flow
1. User provides credentials → JWT token with tenant_id
2. Middleware extracts tenant_id from token
3. Database queries automatically filtered by tenant
4. Cross-tenant access prevented at multiple levels

## API Architecture

### RESTful Endpoints
- **Base URL**: `/api/v1`
- **Authentication**: Bearer token (JWT)
- **Content-Type**: `application/json`
- **Pagination**: Offset-based with metadata
- **Rate Limiting**: Per-user and per-tenant

### Core API Groups
1. **Authentication** (`/auth`)
   - Login, refresh, logout
   - Multi-factor authentication support

2. **Impianti** (`/plants`)
   - CRUD operations for power plants
   - Performance metrics
   - Maintenance scheduling

3. **Documents** (`/documents`)
   - Upload with virus scanning
   - Version control
   - OCR and metadata extraction

4. **Workflows** (`/workflows`)
   - Process automation
   - Task management
   - Deadline tracking

5. **Analytics** (`/analytics`)
   - Performance dashboards
   - Compliance reports
   - Export capabilities

6. **AI Assistant** (`/assistant`)
   - Smart form filling
   - Document generation
   - Portal automation

## AI Integration

### LangChain/LangGraph Setup
```python
# Agent configuration
agent_config = {
    "model": "gpt-4-turbo-preview",
    "temperature": 0.3,
    "tools": [
        search_documents,
        get_plant_info,
        create_maintenance_task,
        get_compliance_status
    ],
    "memory": ConversationBufferMemory()
}
```

### Multi-Provider LLM Support
- **Primary**: OpenAI GPT-4
- **Secondary**: Google Gemini
- **Tertiary**: Anthropic Claude
- **Fallback**: Automatic provider switching

### Vector Search (Qdrant)
- **Collections**: Per-tenant document embeddings
- **Embedding Model**: OpenAI text-embedding-3-small
- **Similarity**: Cosine distance
- **Hybrid Search**: Vector + keyword

## Security Features

### Authentication
- **Method**: JWT with RS256 signing
- **Token Lifetime**: 30 minutes (access), 7 days (refresh)
- **MFA**: TOTP-based two-factor authentication

### Authorization
- **RBAC**: Role-based access control
- **Permissions**: Granular resource-level permissions
- **Tenant Isolation**: Enforced at API and database levels

### Rate Limiting
```python
# Three-tier rate limiting
- Global: 1000 requests/hour per IP
- Tenant: Based on subscription tier
- User: 60 requests/minute per user
```

### Data Protection
- **Encryption**: AES-256 for sensitive fields
- **Hashing**: Bcrypt for passwords
- **Audit Trail**: All data modifications logged

## Performance Optimizations

### Database
- **Connection Pooling**: SQLAlchemy with 20 connections
- **Query Optimization**: Eager loading, indexes
- **Read Replicas**: Support for read/write splitting

### Caching
- **Redis**: Session storage, rate limiting
- **In-Memory**: Frequently accessed configurations
- **CDN**: Static assets and documents

### Async Processing
- **Background Tasks**: Celery for long-running operations
- **WebSockets**: Real-time updates
- **Streaming**: Large file uploads/downloads

## Development Workflow

### Local Setup
```bash
# Clone repository
git clone https://github.com/kronos-eam/backend.git
cd kronos-eam-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Start services
docker-compose up -d

# Run migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --port 8000
```

### Testing
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test
pytest tests/test_auth.py::test_login
```

### Code Quality
```bash
# Linting
ruff check app/

# Type checking
mypy app/

# Security scan
bandit -r app/
```

## Deployment

### Production Requirements
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- 4GB RAM minimum
- SSL/TLS termination

### Environment-Specific Settings
- **Development**: SQLite option, debug mode
- **Staging**: PostgreSQL, limited rate limits
- **Production**: Full stack, monitoring enabled

### Monitoring
- **APM**: OpenTelemetry integration
- **Logs**: Structured logging with structlog
- **Metrics**: Prometheus-compatible
- **Health Checks**: `/health` endpoint

## Known Issues & Solutions

### 1. Protobuf Compatibility
**Issue**: ChromaDB protobuf conflicts
**Solution**: Set `PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION=python`

### 2. Pydantic V2 Migration
**Issue**: `orm_mode` deprecated
**Solution**: Use `from_attributes = True` in schemas

### 3. LangGraph Updates
**Issue**: `ToolExecutor` replaced by `ToolNode`
**Solution**: Import from `langgraph.prebuilt`

### 4. Redis Authentication
**Issue**: Connection refused without password
**Solution**: Include password in REDIS_URL

## Future Enhancements

1. **GraphQL API**: Alternative to REST
2. **Event Sourcing**: Full audit trail
3. **Kubernetes**: Container orchestration
4. **Feature Flags**: Dynamic feature control
5. **A/B Testing**: Experimentation framework

## Support & Documentation

- **API Docs**: http://localhost:8000/docs (Swagger)
- **ReDoc**: http://localhost:8000/redoc
- **Postman Collection**: `/docs/kronos-eam.postman.json`
- **Architecture Diagrams**: `/docs/architecture/`

---

*Last Updated: January 2025*
*Version: 1.0.0*
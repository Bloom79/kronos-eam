# Kronos EAM Backend

Production-ready backend for Kronos EAM - renewable energy asset management platform.

## Features

- 🏢 **Multi-tenant architecture** with complete data isolation
- 🔐 **JWT authentication** with role-based access control
- 🤖 **AI-powered assistant** using LangGraph and multiple LLM providers
- 📄 **Smart form generation** for regulatory compliance
- 🔄 **Workflow automation** for bureaucratic processes
- 📊 **Real-time monitoring** and analytics
- 🎙️ **Voice interface** support
- 📁 **Document management** with versioning
- 🇮🇹 **Italian renewable energy workflows** (DSO, Terna, GSE, Dogane)

## Tech Stack

- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **AI/ML**: LangChain, LangGraph, OpenAI, Anthropic, Google Gemini
- **Vector DB**: ChromaDB for document embeddings
- **Cache**: Redis for session management
- **PDF Generation**: ReportLab with custom templates
- **Authentication**: JWT with passlib
- **API Documentation**: OpenAPI/Swagger

## Quick Start

### Local Development

1. **Clone and setup:**
```bash
cd kronos-eam-backend
./scripts/setup_db.sh  # Initializes database with all tables and data
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your API keys and settings
```

3. **Start the backend:**
```bash
./run_api.sh
# API available at http://localhost:8000
# Docs at http://localhost:8000/docs
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f backend
```

### Production Deployment

See [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) for detailed instructions on:
- Environment configuration
- Database initialization
- Docker deployment
- Cloud platform deployment (GCP, Azure)
- Security hardening
- Backup and recovery
- Performance tuning

## API Endpoints

### Core APIs
- **Auth**: `/api/v1/auth/` - Login, logout, token refresh
- **Plants**: `/api/v1/plants/` - CRUD operations for renewable plants
- **Workflows**: `/api/v1/workflow/` - Italian regulatory workflows
- **Documents**: `/api/v1/documents/` - File management
- **Dashboard**: `/api/v1/dashboard/` - Metrics and analytics

### Smart Features
- **Assistant**: `/api/v1/assistant/` - AI-powered form filling
- **Chat**: `/api/v1/chat/` - Conversational interface
- **Calendar**: `/api/v1/calendar/` - Compliance deadlines
- **Voice**: `/api/v1/voice/` - Voice transcription and synthesis

### Workflow Templates
The system includes 4 pre-configured Italian renewable energy workflows:
1. **Attivazione Impianto** - Complete plant activation (180 days)
2. **Dichiarazione Consumo** - Annual consumption declaration (10 days)
3. **Pagamento Canone** - License fee payment (5 days)
4. **Verifica SPI** - Protection system verification (30 days)

## Project Structure

```
kronos-eam-backend/
├── app/
│   ├── api/           # API routes and endpoints
│   ├── core/          # Core configurations
│   ├── models/        # SQLAlchemy models
│   ├── schemas/       # Pydantic schemas
│   ├── services/      # Business logic
│   ├── agents/        # LangGraph agents
│   ├── data/          # Workflow templates
│   └── integrations/  # External service clients
├── scripts/           # Setup and utility scripts
│   ├── setup_db.sh    # Database initialization
│   ├── backup_db.sh   # Backup script
│   └── restore_db.sh  # Restore script
├── migrations/        # Alembic database migrations
├── tests/             # Test suite
└── docs/              # Documentation
```

## Database Management

### Initial Setup
```bash
# Run complete database initialization
./scripts/setup_db.sh

# Or manually
python scripts/init_database.py
```

### Backup & Restore
```bash
# Create backup
./scripts/backup_db.sh

# Restore from backup
./scripts/restore_db.sh /backups/kronos_eam_backup_20250718_120000.sql.gz
```

### Migrations
```bash
# Create new migration
alembic revision -m "Add new column"

# Apply migrations
alembic upgrade head
```

## Development

### Prerequisites
- Python 3.11+
- PostgreSQL 14+
- Redis
- Docker (optional)

### Environment Variables
Key variables to configure:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `SECRET_KEY` - Application secret (min 32 chars)
- `OPENAI_API_KEY` - OpenAI API key
- `ANTHROPIC_API_KEY` - Claude API key (optional)
- `GOOGLE_API_KEY` - Gemini API key (optional)

### Testing
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app tests/

# Run specific test
pytest tests/test_workflows.py -v
```

### Code Quality
```bash
# Format code
black app/
isort app/

# Type checking
mypy app/

# Linting
flake8 app/
```

## Security

- JWT tokens with 30-minute expiration
- Password hashing with bcrypt
- Rate limiting on all endpoints
- CORS configuration for frontend domains
- SQL injection protection via SQLAlchemy
- Multi-tenant data isolation

## Monitoring

- Health checks at `/health`
- Prometheus metrics (when configured)
- Structured JSON logging
- Request tracking and performance metrics

## Default Credentials

After initialization:
- **Email**: admin@demo.com
- **Password**: admin123
- **Tenant**: demo

## Multi-Tenant Architecture

The system supports flexible tenant isolation:
- **Shared mode** (default): Single database with row-level security
- **Strict mode**: Separate database per tenant
- **Hybrid mode**: Mix of approaches based on tenant requirements

Tenant context is automatically handled through:
- JWT tokens with tenant claims
- API key authentication
- Request headers
- Subdomain routing (when configured)

## Contributing

1. Create a feature branch
2. Make your changes
3. Add tests
4. Run code quality checks
5. Submit a pull request

## License

Proprietary - All rights reserved

---

For detailed deployment instructions, see [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)
For API documentation, run the server and visit http://localhost:8000/docs
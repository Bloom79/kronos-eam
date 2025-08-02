# Production Deployment Guide for Kronos EAM Backend

This guide covers deploying the Kronos EAM backend to production environments.

## Prerequisites

- Python 3.11 or higher
- PostgreSQL 14+ database server
- Redis server (for caching and background tasks)
- Docker & Docker Compose (optional, for containerized deployment)

## Environment Setup

### 1. Environment Variables

Create a `.env` file with production settings:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/kronos_eam
POSTGRES_USER=kronos_user
POSTGRES_PASSWORD=secure_password_here
POSTGRES_DB=kronos_eam

# Redis
REDIS_URL=redis://:password@host:6379/0

# Security
SECRET_KEY=your-production-secret-key-min-32-chars
JWT_SECRET_KEY=your-jwt-secret-key-min-32-chars
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
BACKEND_CORS_ORIGINS=["https://your-frontend-domain.com"]

# API Keys (for LLM providers)
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key  # Optional
GOOGLE_API_KEY=your-google-key        # Optional

# Application
PROJECT_NAME="Kronos EAM"
VERSION="1.0.0"
API_V1_STR="/api/v1"
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000

# Multi-tenancy
TENANT_ISOLATION_MODE=shared
DEFAULT_TENANT_ID=main
```

## Database Initialization

### First-Time Setup

1. **Create the database and initialize schema:**
   ```bash
   cd /path/to/kronos-eam-backend
   ./scripts/setup_db.sh
   ```

2. **Alternative manual setup:**
   ```bash
   # Activate virtual environment
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Run initialization script
   python scripts/init_database.py
   ```

### Database Migration

For schema updates after initial deployment:

```bash
# Create a new migration
alembic revision -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback if needed
alembic downgrade -1
```

## Deployment Options

### Option 1: Docker Deployment (Recommended)

1. **Build the Docker image:**
   ```bash
   docker build -t kronos-eam-backend:latest .
   ```

2. **Run with Docker Compose:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Initialize database (first time only):**
   ```bash
   docker-compose exec backend python scripts/init_database.py
   ```

### Option 2: Systemd Service

1. **Create service file** `/etc/systemd/system/kronos-eam.service`:
   ```ini
   [Unit]
   Description=Kronos EAM Backend
   After=network.target postgresql.service redis.service
   
   [Service]
   Type=exec
   User=kronos
   Group=kronos
   WorkingDirectory=/opt/kronos-eam-backend
   Environment="PATH=/opt/kronos-eam-backend/venv/bin"
   Environment="PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION=python"
   ExecStart=/opt/kronos-eam-backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
   Restart=always
   RestartSec=10
   StandardOutput=journal
   StandardError=journal
   
   [Install]
   WantedBy=multi-user.target
   ```

2. **Enable and start service:**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable kronos-eam
   sudo systemctl start kronos-eam
   ```

### Option 3: Cloud Platform Deployment

#### Google Cloud Run
```bash
# Build and push image
gcloud builds submit --tag gcr.io/PROJECT_ID/kronos-eam-backend

# Deploy
gcloud run deploy kronos-eam-backend \
  --image gcr.io/PROJECT_ID/kronos-eam-backend \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars "DATABASE_URL=postgresql://..." \
  --set-secrets "OPENAI_API_KEY=openai-key:latest"
```

#### Azure Container Instances
```bash
# Create container
az container create \
  --resource-group kronos-rg \
  --name kronos-eam-backend \
  --image kronos-eam-backend:latest \
  --dns-name-label kronos-api \
  --ports 8000 \
  --environment-variables DATABASE_URL=$DATABASE_URL
```

## Health Checks & Monitoring

### Health Check Endpoints
- **Basic health:** `GET /health`
- **Detailed health:** `GET /health/detailed`
- **Database check:** `GET /health/db`
- **Redis check:** `GET /health/redis`

### Monitoring Setup

1. **Prometheus metrics:**
   ```yaml
   # prometheus.yml
   scrape_configs:
     - job_name: 'kronos-eam'
       static_configs:
         - targets: ['localhost:8000']
   ```

2. **Log aggregation:**
   ```bash
   # Configure structured logging
   export LOG_FORMAT=json
   export LOG_LEVEL=INFO
   ```

## Security Hardening

### 1. Database Security
```sql
-- Create read-only user for reporting
CREATE USER kronos_readonly WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE kronos_eam TO kronos_readonly;
GRANT USAGE ON SCHEMA public TO kronos_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO kronos_readonly;

-- Enable Row Level Security
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE impianti ENABLE ROW LEVEL SECURITY;
```

### 2. API Security
- Enable rate limiting (already configured)
- Use HTTPS only in production
- Implement API key rotation
- Enable CORS with specific origins only

### 3. Environment Security
- Store secrets in environment variables or secret manager
- Never commit `.env` files
- Use strong passwords for all services
- Enable firewall rules for database access

## Backup & Recovery

### Automated Backups
```bash
# Create backup script /opt/kronos-eam/backup.sh
#!/bin/bash
BACKUP_DIR="/backups/kronos-eam"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="kronos_eam"

# Database backup
pg_dump $DATABASE_URL > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

# Keep only last 7 days
find $BACKUP_DIR -name "db_backup_*.sql" -mtime +7 -delete
```

### Restore Procedure
```bash
# Restore from backup
psql $DATABASE_URL < backup_file.sql
```

## Performance Tuning

### 1. Database Optimization
```sql
-- Add indexes for common queries
CREATE INDEX idx_workflows_tenant_status ON workflows(tenant_id, stato);
CREATE INDEX idx_impianti_tenant_tipo ON impianti(tenant_id, tipo_impianto);
CREATE INDEX idx_documents_tenant_created ON documents(tenant_id, created_at DESC);
```

### 2. Application Tuning
```python
# In .env or config
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=10
REDIS_POOL_SIZE=10
```

### 3. Caching Strategy
- Enable Redis caching for frequently accessed data
- Set appropriate TTL values
- Use cache warming for critical data

## Troubleshooting

### Common Issues

1. **Database connection errors:**
   ```bash
   # Check PostgreSQL is running
   sudo systemctl status postgresql
   
   # Test connection
   psql $DATABASE_URL -c "SELECT 1"
   ```

2. **Redis connection errors:**
   ```bash
   # Check Redis is running
   sudo systemctl status redis
   
   # Test connection
   redis-cli ping
   ```

3. **Permission errors:**
   ```bash
   # Fix file permissions
   sudo chown -R kronos:kronos /opt/kronos-eam-backend
   sudo chmod -R 755 /opt/kronos-eam-backend
   ```

### Debug Mode
```bash
# Enable debug logging
export LOG_LEVEL=DEBUG
export SQLALCHEMY_ECHO=true
```

## Maintenance

### Regular Tasks
- **Daily:** Check logs for errors
- **Weekly:** Review performance metrics
- **Monthly:** Update dependencies, apply security patches
- **Quarterly:** Review and rotate API keys

### Update Procedure
1. Backup database
2. Test updates in staging
3. Deploy during maintenance window
4. Run database migrations
5. Verify health checks
6. Monitor for issues

## Support

For production support:
- Check logs: `journalctl -u kronos-eam -f`
- Database queries: Use read-only user for diagnostics
- Performance issues: Check Prometheus metrics
- Security concerns: Review audit logs

## Appendix: Initial Data

The initialization script creates:
- 4 workflow templates for renewable energy management
- Demo tenant with ID 'demo'
- Admin user: admin@demo.com / admin123

To add more initial data, modify `/scripts/init_database.py`.
# Deployment Database Configuration

## Overview

Kronos EAM uses PostgreSQL databases with different configurations for local development and cloud production environments. This document details the database setup for both environments.

## Environment Comparison

| Aspect | Local Development | Cloud Production |
|--------|------------------|------------------|
| **Type** | PostgreSQL 14+ | Cloud SQL PostgreSQL 14 |
| **Host** | localhost:5432 | Cloud SQL Proxy |
| **Database Name** | kronos_eam | kronos_eam |
| **Username** | kronos | postgres |
| **Password** | KronosAdmin2024! | KronosAdmin2024! |
| **Backup** | Manual | Automatic daily |
| **HA** | No | Optional |
| **SSL** | Optional | Required |
| **Cost** | Free | ~$15-20/month |

## Local Development Setup

### 1. Using Docker (Recommended)

```bash
# Start PostgreSQL container
docker run -d \
  --name kronos-postgres \
  -e POSTGRES_USER=kronos \
  -e POSTGRES_PASSWORD=KronosAdmin2024! \
  -e POSTGRES_DB=kronos_eam \
  -p 5432:5432 \
  postgres:14

# Verify connection
psql postgresql://kronos:KronosAdmin2024!@localhost:5432/kronos_eam -c "SELECT version();"
```

### 2. Using Local PostgreSQL

```bash
# Create user and database
sudo -u postgres psql <<EOF
CREATE USER kronos WITH PASSWORD 'KronosAdmin2024!';
CREATE DATABASE kronos_eam OWNER kronos;
GRANT ALL PRIVILEGES ON DATABASE kronos_eam TO kronos;
EOF
```

### 3. Run Migrations

```bash
cd kronos-eam-backend
alembic upgrade head
python scripts/init_data.py
```

## Cloud Production Setup

### 1. Automatic Creation

The Cloud SQL instance is automatically created during the first deployment via GitHub Actions. The workflow:

1. Creates Cloud SQL instance `kronos-db`
2. Creates database `kronos_eam`
3. Sets password from GitHub secrets
4. Runs migrations automatically

### 2. Manual Creation (If Needed)

```bash
# Set variables
PROJECT_ID="kronos-eam-prod-20250802"
REGION="europe-west1"
INSTANCE_NAME="kronos-db"
DB_PASSWORD="KronosAdmin2024!"

# Create Cloud SQL instance
gcloud sql instances create $INSTANCE_NAME \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=$REGION \
  --network=default \
  --no-assign-ip \
  --project=$PROJECT_ID

# Set root password
gcloud sql users set-password postgres \
  --instance=$INSTANCE_NAME \
  --password=$DB_PASSWORD \
  --project=$PROJECT_ID

# Create database
gcloud sql databases create kronos_eam \
  --instance=$INSTANCE_NAME \
  --project=$PROJECT_ID
```

### 3. Connection Methods

#### From Cloud Run (Automatic)

```yaml
# Automatically configured in deployment
DATABASE_URL: postgresql://postgres:PASSWORD@/kronos_eam?host=/cloudsql/PROJECT:REGION:INSTANCE
```

#### From Local Machine (Development)

```bash
# Start Cloud SQL Proxy
cloud_sql_proxy -instances=PROJECT:REGION:INSTANCE=tcp:5432 &

# Connect via psql
psql postgresql://postgres:KronosAdmin2024!@localhost:5432/kronos_eam
```

## Database Schema

### Initial Schema (001_complete_initial_schema.py)

```mermaid
graph TB
    subgraph "Core Tables"
        Tenants[tenants<br/>Multi-tenant isolation]
        Users[users<br/>Authentication & roles]
        Plants[plants<br/>Asset registry]
        Workflows[workflows<br/>Process tracking]
    end
    
    subgraph "Supporting Tables"
        PlantRegistry[plant_registry<br/>Technical details]
        WorkflowTasks[workflow_tasks<br/>Task management]
        Documents[documents<br/>File storage]
        Notifications[notifications<br/>Alerts]
    end
    
    Tenants -->|1:N| Users
    Tenants -->|1:N| Plants
    Plants -->|1:1| PlantRegistry
    Plants -->|1:N| Workflows
    Workflows -->|1:N| WorkflowTasks
    Workflows -->|1:N| Documents
```

### Key Enums (English)

```sql
-- User Roles
'Admin', 'Asset Manager', 'Plant Owner', 'Operator', 'Viewer'

-- Plant Status
'In Operation', 'In Authorization', 'Under Construction', 'Decommissioned'

-- Plant Types
'Photovoltaic', 'Wind', 'Hydroelectric', 'Biomass', 'Geothermal'

-- Workflow Status
'Draft', 'Active', 'Paused', 'Completed', 'Cancelled'
```

## Migration Management

### Development Workflow

```bash
# Check current version
alembic current

# Create new migration
alembic revision -m "Add new feature"

# Apply migrations
alembic upgrade head

# Rollback if needed
alembic downgrade -1
```

### Production Migrations

Migrations run automatically on deployment via `entrypoint.sh`:

```bash
#!/bin/sh
echo "Running database migrations..."
alembic upgrade head

echo "Initializing data..."
python scripts/init_data.py
```

## Backup and Recovery

### Cloud SQL Automatic Backups

- **Schedule**: Daily at 3:00 AM CET
- **Retention**: 7 days
- **Type**: Full backup
- **Location**: Same region as instance

### Manual Backup

```bash
# Export to Cloud Storage
gcloud sql export sql $INSTANCE_NAME \
  gs://YOUR_BUCKET/backup_$(date +%Y%m%d).sql \
  --database=kronos_eam \
  --project=$PROJECT_ID

# Download locally
gsutil cp gs://YOUR_BUCKET/backup_20250802.sql .
```

### Restore Process

```bash
# From backup
gcloud sql backups restore BACKUP_ID \
  --restore-instance=$INSTANCE_NAME \
  --project=$PROJECT_ID

# From SQL file
gcloud sql import sql $INSTANCE_NAME \
  gs://YOUR_BUCKET/backup.sql \
  --database=kronos_eam \
  --project=$PROJECT_ID
```

## Monitoring

### Key Metrics to Watch

1. **CPU Utilization**: Should stay below 70%
2. **Memory Usage**: Should stay below 80%
3. **Storage**: Auto-expands but monitor growth
4. **Connections**: Maximum 25 for db-f1-micro

### Useful Commands

```bash
# Check instance status
gcloud sql instances describe $INSTANCE_NAME \
  --project=$PROJECT_ID

# View recent operations
gcloud sql operations list \
  --instance=$INSTANCE_NAME \
  --project=$PROJECT_ID \
  --limit=10

# Check database size
gcloud sql databases list \
  --instance=$INSTANCE_NAME \
  --project=$PROJECT_ID
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure Cloud SQL Proxy is running
   - Check firewall rules
   - Verify service account permissions

2. **Migration Failures**
   - Check database exists
   - Verify enum types match
   - Look for FK constraint violations

3. **Performance Issues**
   - Check slow query log
   - Review indexes
   - Consider upgrading tier

### Debug Commands

```bash
# Test connection
gcloud sql connect $INSTANCE_NAME \
  --user=postgres \
  --project=$PROJECT_ID

# Check logs
gcloud logging read \
  "resource.type=cloudsql_database" \
  --project=$PROJECT_ID \
  --limit=50

# View current connections
SELECT pid, usename, application_name, client_addr, state 
FROM pg_stat_activity 
WHERE datname = 'kronos_eam';
```

## Cost Optimization

### Estimated Monthly Costs

| Resource | Dev/Test | Production |
|----------|----------|------------|
| db-f1-micro | $15 | - |
| db-g1-small | - | $35 |
| Storage (10GB) | $1.70 | $1.70 |
| Backups | $0.50 | $2 |
| **Total** | **~$17** | **~$39** |

### Cost Saving Tips

1. **Development**: Stop instance when not in use
2. **Production**: Use committed use discounts
3. **Backups**: Adjust retention policy
4. **Storage**: Monitor and clean old data

## Security Best Practices

1. **Never expose database publicly**
   - Always use Cloud SQL Proxy
   - Keep `--no-assign-ip` flag

2. **Use strong passwords**
   - Stored in Secret Manager
   - Rotate periodically

3. **Enable audit logging**
   ```bash
   gcloud sql instances patch $INSTANCE_NAME \
     --database-flags cloudsql.enable_pgaudit=on \
     --project=$PROJECT_ID
   ```

4. **Implement least privilege**
   - Create specific users for applications
   - Grant only necessary permissions

## Next Steps

1. **After deployment completes**, verify database:
   ```bash
   ./verify-deployment.sh
   ```

2. **Set up monitoring alerts** in Cloud Console

3. **Plan backup testing** schedule

4. **Document any custom configurations**
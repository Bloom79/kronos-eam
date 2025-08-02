# Database Migration Guide

This guide explains the new Alembic-based database migration system for Kronos EAM.

## Overview

We've migrated from manual SQL scripts to Alembic for better database version control:
- **Schema migrations**: Handled by Alembic (version controlled)
- **Initial data**: Handled by `scripts/init_data.py` (idempotent)
- **Automatic execution**: Handled by Docker entrypoint on startup

## Local Development

### Running Migrations

```bash
cd kronos-eam-backend

# Run all pending migrations and initialize data
./scripts/migrate.sh

# Or manually:
alembic upgrade head
python scripts/init_data.py
```

### Creating New Migrations

```bash
# Auto-generate migration from model changes
alembic revision --autogenerate -m "Description of changes"

# Or create empty migration
alembic revision -m "Description of changes"
```

### Migration Commands

```bash
# Check current version
alembic current

# Show migration history
alembic history

# Upgrade to latest
alembic upgrade head

# Downgrade one version
alembic downgrade -1

# Upgrade to specific version
alembic upgrade <revision>
```

## Production Deployment

### Automatic Migration

The Docker container automatically runs migrations on startup via `entrypoint.sh`:
1. Runs `alembic upgrade head` to apply schema changes
2. Runs `scripts/init_data.py` to ensure initial data exists
3. Starts the application server

### Manual Migration (if needed)

```bash
# Connect to Cloud SQL and run migrations
gcloud sql connect kronos-db --user=postgres

# Or use Cloud Build
gcloud builds submit --config=- <<EOF
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['run', '--rm',
           '-e', 'DATABASE_URL=<connection-string>',
           'backend-image',
           'alembic', 'upgrade', 'head']
EOF
```

## Migration Files

- **Schema migrations**: `/alembic/versions/`
- **Initial migration**: `/alembic/versions/001_initial_schema.py`
- **Data initialization**: `/scripts/init_data.py`
- **Migration config**: `/alembic.ini`

## Best Practices

1. **Always test migrations locally** before deploying
2. **Review auto-generated migrations** - Alembic may miss some changes
3. **Keep migrations small** - One logical change per migration
4. **Name migrations clearly** - Use descriptive messages
5. **Don't edit deployed migrations** - Create new ones instead

## Troubleshooting

### Migration Conflicts
```bash
# If you get "Can't locate revision identified by 'xxx'"
alembic stamp head  # Force set to latest version
```

### Connection Issues
```bash
# Check database URL
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Data Already Exists
The `init_data.py` script is idempotent - it checks before inserting data.

## Benefits of Alembic

1. **Version Control**: Track all schema changes in Git
2. **Rollback Support**: Can downgrade if needed  
3. **Team Collaboration**: Clear history of who changed what
4. **Automated**: No manual SQL execution required
5. **Type Safety**: Migrations are Python code
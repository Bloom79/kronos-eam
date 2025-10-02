# GCP Infrastructure Setup Guide

This guide explains how to set up and manage GCP infrastructure for Kronos EAM using GitHub Actions workflows.

## Overview

The `setup-gcp-infrastructure.yml` workflow automates the creation and configuration of:
- **Cloud SQL PostgreSQL instance** (kronos-db)
- **Database** (kronos_eam)
- **Secret Manager secrets** (jwt-secret, redis-password, db-password)
- **Service Accounts** with proper IAM permissions

## Key Features

✅ **Idempotent** - Safe to run multiple times, skips existing resources
✅ **Professional CI/CD** - Checks before creating, logs all actions
✅ **Selective execution** - Skip specific sections with input flags
✅ **Comprehensive verification** - Validates all resources after creation
✅ **Detailed logging** - Clear status messages and summaries
✅ **Error handling** - Graceful handling of existing resources

## Quick Start

### First-Time Setup

```bash
# Run the complete infrastructure setup
gh workflow run setup-gcp-infrastructure.yml \
  --ref main \
  -f environment=production
```

This will create all required GCP resources if they don't exist.

### Subsequent Runs

The workflow is **idempotent** - running it again will:
- ✅ Skip existing Cloud SQL instance
- ✅ Skip existing database
- ✅ Update secrets with new versions (if provided)
- ✅ Re-apply IAM permissions (safe to re-run)

```bash
# Safe to run anytime - it only creates what's missing
gh workflow run setup-gcp-infrastructure.yml \
  --ref main \
  -f environment=production
```

## Workflow Inputs

### Environment Selection

```bash
-f environment=<production|staging|development>
```

Select the target environment (currently all point to same project).

### Selective Execution

Skip specific sections if already configured:

```bash
# Skip Cloud SQL setup (if already exists)
gh workflow run setup-gcp-infrastructure.yml \
  --ref main \
  -f environment=production \
  -f skip_sql=true

# Skip secrets setup (if already configured)
-f skip_secrets=true

# Skip IAM setup (if already configured)
-f skip_iam=true

# Example: Only update secrets
gh workflow run setup-gcp-infrastructure.yml \
  --ref main \
  -f environment=production \
  -f skip_sql=true \
  -f skip_iam=true
```

### Force Recreate (Dangerous!)

```bash
# WARNING: This will delete and recreate resources
-f force_recreate=true
```

⚠️ **Not recommended** - Use only in development/testing environments.

## What Gets Created

### 1. Cloud SQL Instance (`kronos-db`)

**Configuration:**
- **Database Version:** PostgreSQL 15
- **Tier:** db-f1-micro (shared CPU, 0.6 GB RAM)
- **Storage:** 10GB SSD
- **Region:** europe-west1
- **Backups:** Daily at 3:00 AM
- **Maintenance:** Sunday at 4:00 AM
- **Features:**
  - Deletion protection enabled
  - Automatic backups
  - High availability (optional, not enabled by default)

**Connection Details:**
```
Instance Name: kronos-db
Connection Name: kronos-eam-prod-20250802:europe-west1:kronos-db
Database: kronos_eam
Port: 5432
```

**Cost Estimate:** ~$10-15/month

### 2. Database

- **Name:** `kronos_eam`
- **Owner:** postgres (default)
- **Encoding:** UTF8

### 3. Secret Manager Secrets

| Secret Name | Purpose | How It's Generated |
|-------------|---------|-------------------|
| `jwt-secret` | JWT token signing | From GitHub secret or auto-generated (64 bytes base64) |
| `redis-password` | Redis authentication | From GitHub secret or auto-generated (32 bytes base64) |
| `db-password` | PostgreSQL password | From GitHub secret or auto-generated (32 bytes base64) |
| `sql-root-password` | Cloud SQL root password | Auto-generated during instance creation (32 bytes base64) |

**Cost:** Free for first 6 secret versions, then $0.06 per version per month

### 4. Service Accounts

#### Backend Service Account
- **Email:** `kronos-backend@kronos-eam-prod-20250802.iam.gserviceaccount.com`
- **Roles:**
  - `roles/cloudsql.client` - Connect to Cloud SQL
  - `roles/secretmanager.secretAccessor` - Access secrets

#### Frontend Service Account
- **Email:** `kronos-frontend@kronos-eam-prod-20250802.iam.gserviceaccount.com`
- **Roles:** (minimal permissions)

## Workflow Behavior

### Idempotent Operations

The workflow is designed to be **safe to run multiple times**:

| Resource | First Run | Subsequent Runs |
|----------|-----------|-----------------|
| Cloud SQL Instance | ✅ Creates | ⏭️ Skips (already exists) |
| Database | ✅ Creates | ⏭️ Skips (already exists) |
| Secrets | ✅ Creates | 🔄 Updates (adds new version) |
| IAM Bindings | ✅ Applies | 🔄 Re-applies (idempotent) |
| Service Accounts | ✅ Creates | ⏭️ Skips (already exists) |

### Verification Steps

After setup, the workflow automatically verifies:
1. ✅ Cloud SQL instance is RUNNABLE
2. ✅ Database exists
3. ✅ All secrets are accessible
4. ✅ Service accounts exist
5. ✅ IAM permissions are correct

If verification fails, the workflow exits with error code 1.

## Monitoring Progress

### Via GitHub UI

1. Go to: https://github.com/Bloom79/kronos-eam/actions
2. Click on "Setup GCP Infrastructure" workflow
3. View real-time logs

### Via CLI

```bash
# List recent runs
gh run list --workflow=setup-gcp-infrastructure.yml --limit 5

# Watch latest run
gh run watch

# View logs from specific run
gh run view <run-id> --log
```

## Common Scenarios

### Scenario 1: First Deployment

```bash
# 1. Setup infrastructure
gh workflow run setup-gcp-infrastructure.yml \
  --ref main \
  -f environment=production

# 2. Wait for completion (5-10 minutes)
gh run watch

# 3. Deploy application
gh workflow run deploy-parallel.yml \
  --ref main \
  -f environment=production \
  -f deploy_target=both
```

### Scenario 2: Infrastructure Already Exists

```bash
# This will skip existing resources and only update what's needed
gh workflow run setup-gcp-infrastructure.yml \
  --ref main \
  -f environment=production

# Output will show:
# ⏭️ Skipping Cloud SQL instance creation - already exists
# ⏭️ Skipping database creation - already exists
# 🔄 Updating secrets with new versions...
# ✅ All infrastructure verified!
```

### Scenario 3: Update Only Secrets

```bash
# Before running, update GitHub secrets:
# - JWT_SECRET
# - REDIS_PASSWORD
# - DB_PASSWORD

gh workflow run setup-gcp-infrastructure.yml \
  --ref main \
  -f environment=production \
  -f skip_sql=true \
  -f skip_iam=true

# This will only update Secret Manager
```

### Scenario 4: Disaster Recovery

If infrastructure needs to be recreated:

```bash
# 1. Manually delete resources (if needed)
gcloud sql instances delete kronos-db --project=kronos-eam-prod-20250802

# 2. Re-run setup
gh workflow run setup-gcp-infrastructure.yml \
  --ref main \
  -f environment=production

# 3. Restore database from backup (if available)
gcloud sql backups list --instance=kronos-db --project=kronos-eam-prod-20250802
gcloud sql backups restore <BACKUP_ID> --backup-instance=kronos-db --project=kronos-eam-prod-20250802
```

## Manual Operations

### Connect to Cloud SQL

```bash
# Connect via gcloud CLI
gcloud sql connect kronos-db \
  --user=postgres \
  --project=kronos-eam-prod-20250802

# Or use Cloud SQL Proxy
cloud_sql_proxy -instances=kronos-eam-prod-20250802:europe-west1:kronos-db=tcp:5432
psql -h localhost -U postgres -d kronos_eam
```

### View Secrets

```bash
# View latest secret version
gcloud secrets versions access latest \
  --secret=db-password \
  --project=kronos-eam-prod-20250802

# List all secret versions
gcloud secrets versions list jwt-secret \
  --project=kronos-eam-prod-20250802
```

### Check IAM Permissions

```bash
# List all permissions for backend service account
gcloud projects get-iam-policy kronos-eam-prod-20250802 \
  --flatten="bindings[].members" \
  --filter="bindings.members:kronos-backend@*" \
  --format="table(bindings.role)"

# Check specific secret access
gcloud secrets get-iam-policy jwt-secret \
  --project=kronos-eam-prod-20250802
```

### Database Migrations

```bash
# Option 1: Connect locally and run migrations
gcloud sql connect kronos-db --user=postgres --project=kronos-eam-prod-20250802
# Then run: \i /path/to/migration.sql

# Option 2: Use Cloud SQL Proxy
cloud_sql_proxy -instances=kronos-eam-prod-20250802:europe-west1:kronos-db=tcp:5433
cd kronos-eam-backend
DATABASE_URL=postgresql://postgres:<password>@localhost:5433/kronos_eam alembic upgrade head
```

## Troubleshooting

### Issue: Cloud SQL instance stuck in PENDING_CREATE

**Symptoms:**
```
Attempt 30/60: Instance state = PENDING_CREATE
```

**Solution:**
- Cloud SQL creation takes 5-10 minutes
- Workflow waits up to 10 minutes automatically
- If it times out, re-run the workflow (idempotent)

### Issue: Permission denied accessing secrets

**Symptoms:**
```
ERROR: (gcloud.secrets.versions.access) PERMISSION_DENIED
```

**Solution:**
```bash
# Re-run IAM setup
gh workflow run setup-gcp-infrastructure.yml \
  --ref main \
  -f environment=production \
  -f skip_sql=true \
  -f skip_secrets=true
```

### Issue: Database already exists error

**Symptoms:**
```
ERROR: Database already exists
```

**Solution:**
- This is normal and expected!
- The workflow handles this gracefully
- Shows: ⏭️ Skipping database creation - already exists

### Issue: Service account not found

**Symptoms:**
```
ERROR: Service account kronos-backend@... does not exist
```

**Solution:**
```bash
# Re-run with IAM setup
gh workflow run setup-gcp-infrastructure.yml \
  --ref main \
  -f environment=production \
  -f skip_sql=true \
  -f skip_secrets=true
```

## Cost Breakdown

| Resource | Tier | Monthly Cost (Estimate) |
|----------|------|-------------------------|
| Cloud SQL (db-f1-micro) | Shared CPU, 0.6 GB | ~$10-15 |
| Cloud SQL Storage (10GB SSD) | Standard SSD | ~$1.70 |
| Cloud SQL Backups | 7 days retention | ~$0.80 |
| Secret Manager | 4 secrets, 2 versions each | Free (< $0.50) |
| Service Accounts | 2 accounts | Free |
| **Total** | | **~$12-17/month** |

### Cost Optimization Tips

1. **Development:** Use `db-f1-micro` (current)
2. **Production:** Consider `db-g1-small` for better performance (~$25/month)
3. **Storage:** Start with 10GB, auto-increase if needed
4. **Backups:** Keep 7 days (can reduce to 3 days to save costs)

## Security Best Practices

✅ **Deletion protection** enabled on Cloud SQL
✅ **Automatic backups** configured
✅ **Secret Manager** for sensitive data (not env vars)
✅ **Service accounts** with least privilege
✅ **IAM bindings** at resource level (not project level)
✅ **TLS encryption** for Cloud SQL connections
✅ **Private IP** (can be enabled for production)

## Next Steps After Setup

1. ✅ Infrastructure created
2. ⏭️ Run database migrations
3. ⏭️ Deploy backend and frontend
4. ⏭️ Verify deployment
5. ⏭️ Monitor Cloud Run logs

## Related Documentation

- [Deployment Troubleshooting](./DEPLOYMENT_TROUBLESHOOTING.md)
- [Diagnostic Script](./diagnose-latest-deployment.sh)
- [GitHub Actions Workflows](../.github/workflows/)

## Support

For issues or questions:
1. Check workflow logs: `gh run view --log`
2. Check this troubleshooting guide
3. Review [DEPLOYMENT_TROUBLESHOOTING.md](./DEPLOYMENT_TROUBLESHOOTING.md)
4. Run diagnostic script: `./deploy/diagnose-latest-deployment.sh`

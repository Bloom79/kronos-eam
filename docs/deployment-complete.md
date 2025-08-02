# Kronos EAM - Complete Deployment Guide

This guide consolidates all deployment information for Kronos EAM.

## Table of Contents
1. [Quick Reference](#quick-reference)
2. [Prerequisites](#prerequisites)
3. [GitHub Setup](#github-setup)
4. [Google Cloud Setup](#google-cloud-setup)
5. [Database Configuration](#database-configuration)
6. [Deployment Process](#deployment-process)
7. [Post-Deployment](#post-deployment)
8. [Troubleshooting](#troubleshooting)
9. [Cost Analysis](#cost-analysis)

## Quick Reference

### Current Deployment
- **GitHub Repository**: https://github.com/Bloom79/kronos-eam
- **GitHub Actions**: https://github.com/Bloom79/kronos-eam/actions
- **GCP Project**: `kronos-eam-prod-20250802`
- **Region**: `europe-west1`

### Key URLs
- **Frontend**: (Available after deployment)
- **Backend API**: (Available after deployment)
- **Local Frontend**: http://localhost:3000
- **Local Backend**: http://localhost:8000

### Credentials
- **Demo User**: `demo@kronos-eam.local` / `Demo2024!`
- **Database Password**: `KronosAdmin2024!`

## Prerequisites

1. **GitHub Account** with repository access
2. **Google Cloud Account** with billing enabled
3. **Local Tools**:
   ```bash
   # Check installations
   git --version          # Git
   gcloud version        # Google Cloud SDK
   docker --version      # Docker (optional)
   node --version        # Node.js 18+
   python --version      # Python 3.11+
   ```

## GitHub Setup

### 1. Create Repository
```bash
# If not already created
# Go to https://github.com/new
# Name: kronos-eam
# Private repository
# Do NOT initialize with README
```

### 2. Push Code
```bash
cd /home/bloom/sentrics
git remote add origin https://github.com/YOUR_USERNAME/kronos-eam.git
git push -u origin main
```

### 3. Add GitHub Secrets

Go to: Settings → Secrets and variables → Actions

Add these repository secrets:

| Secret Name | Value |
|------------|-------|
| **GCP_PROJECT_ID** | `kronos-eam-prod-20250802` |
| **DB_PASSWORD** | `KronosAdmin2024!` |
| **GCP_SA_KEY** | Contents of service account JSON (see below) |

## Google Cloud Setup

### Option 1: Automated Setup (Recommended)

Use the provided script for complete setup:

```bash
cd /home/bloom/sentrics/deploy
export GCP_PROJECT_ID="kronos-eam-prod-$(date +%Y%m%d)"
./gcp-setup.sh
```

This script will:
- Create the project (if needed)
- Enable all required APIs
- Create all service accounts with proper IAM permissions
- Set up Cloud SQL and Redis
- Create Artifact Registry repository (kronos-eam)
- Generate service account key for GitHub Actions

### Option 2: Manual Setup

#### 1. Create Project
```bash
# Create new project
gcloud projects create kronos-eam-prod-$(date +%Y%m%d) \
  --name="Kronos EAM Production"

# Set as active project
gcloud config set project kronos-eam-prod-20250802
```

#### 2. Enable Billing
1. Go to: https://console.cloud.google.com/billing
2. Link billing account to project
3. Verify: `gcloud beta billing projects describe kronos-eam-prod-20250802`

#### 3. Enable APIs
```bash
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  sqladmin.googleapis.com \
  compute.googleapis.com \
  secretmanager.googleapis.com \
  cloudresourcemanager.googleapis.com \
  iam.googleapis.com \
  redis.googleapis.com \
  monitoring.googleapis.com \
  logging.googleapis.com \
  --project=kronos-eam-prod-20250802
```

### 4. Create Service Accounts and IAM Permissions

The `gcp-setup.sh` script will automatically create all necessary service accounts:
- `kronos-deploy` - For GitHub Actions deployment
- `kronos-backend` - For backend service runtime
- `kronos-frontend` - For frontend service runtime

**Important IAM Permissions Set by Script:**
1. **Deployment Service Account** (`kronos-deploy`):
   - `roles/run.admin` - Deploy to Cloud Run
   - `roles/storage.admin` - Push to Artifact Registry
   - `roles/artifactregistry.admin` - Manage artifacts
   - `roles/cloudsql.admin` - Manage database
   - `roles/iam.serviceAccountUser` - Act as other service accounts (CRITICAL)

2. **Backend Service Account** (`kronos-backend`):
   - `roles/cloudsql.client` - Connect to database
   - `roles/secretmanager.secretAccessor` - Read secrets
   - `roles/redis.editor` - Use Redis

### 5. Service Account Key for GitHub

#### Automated (via gcp-setup.sh)
The `gcp-setup.sh` script automatically generates the key at `~/kronos-deploy-key.json`.

#### Manual Generation
```bash
# Generate key for deployment service account
gcloud iam service-accounts keys create ~/kronos-deploy-key.json \
  --iam-account=kronos-deploy@kronos-eam-prod-20250802.iam.gserviceaccount.com

# View the key
cat ~/kronos-deploy-key.json
```

Copy the entire JSON content and add it as `GCP_SA_KEY` in GitHub Secrets.

### 6. Create Artifact Registry
```bash
# Note: Repository name must be 'kronos-eam' to match GitHub Actions workflow
gcloud artifacts repositories create kronos-eam \
  --repository-format=docker \
  --location=europe-west1 \
  --description="Docker images for Kronos EAM" \
  --project=kronos-eam-prod-20250802
```

## Database Configuration

### Local Development
```yaml
Type: PostgreSQL 14+
Host: localhost:5432
Database: kronos_eam
User: kronos
Password: KronosAdmin2024!
Connection: postgresql://kronos:KronosAdmin2024!@localhost:5432/kronos_eam
```

### Cloud Production (Auto-created)
```yaml
Type: Cloud SQL PostgreSQL 14
Instance: kronos-db
Database: kronos_eam
User: postgres
Password: KronosAdmin2024! (from secrets)
Machine: db-f1-micro (0.6GB RAM, 1 vCPU)
Storage: 10GB SSD (auto-expanding)
Backup: Daily at 3 AM CET
Connection: Via Cloud SQL Proxy only
```

### Database Schema
```mermaid
graph TB
    subgraph "Multi-Tenant Structure"
        Tenants[tenants] -->|1:N| Users[users]
        Tenants -->|1:N| Plants[plants]
        Plants -->|1:N| Workflows[workflows]
        Workflows -->|1:N| Tasks[workflow_tasks]
        Workflows -->|1:N| Documents[documents]
    end
```

Key tables:
- `tenants` - Multi-tenant isolation
- `users` - Authentication & roles
- `plants` - Renewable energy assets
- `workflows` - Process tracking
- `documents` - File management

## Deployment Process

### Automatic via GitHub Actions

1. **Push to main branch** (Full deployment with tests):
   ```bash
   git push origin main
   ```

2. **Manual trigger with skip tests option**:
   - Go to: https://github.com/Bloom79/kronos-eam/actions
   - Click "Deploy to Google Cloud Run"
   - Click "Run workflow"
   - Check "Skip test phase" for faster deployment

3. **Quick Deploy workflow** (No tests):
   - Go to Actions → Quick Deploy (No Tests)
   - Click "Run workflow"
   - Select environment (production/staging)

4. **Parallel Deploy workflow** (Fastest - builds in parallel):
   - Go to Actions → Parallel Deploy (Faster)
   - Click "Run workflow"
   - Builds backend and frontend simultaneously
   - Uses `--no-traffic` flag for faster initial deployment

5. **GitHub Actions workflow**:
   - Runs tests (unless skipped)
   - Builds Docker images
   - Pushes to Artifact Registry (kronos-eam repository)
   - Deploys to Cloud Run with proper service accounts
   - Runs database migrations automatically

6. **Monitor progress**:
   - https://github.com/Bloom79/kronos-eam/actions

### Speed Optimization Tips

1. **Use Parallel Deploy**: Saves ~5-10 minutes by building images simultaneously
2. **Skip Tests**: Use skip_tests option or Quick Deploy workflow
3. **Use --no-traffic**: Deploy without routing traffic immediately
4. **Optimize Docker Images**: .dockerignore file reduces build context

### Manual Deployment (if needed)

```bash
# Backend
gcloud run deploy kronos-backend \
  --image europe-west1-docker.pkg.dev/kronos-eam-prod-20250802/kronos-eam/backend:latest \
  --region europe-west1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=postgresql://... \
  --add-cloudsql-instances kronos-eam-prod-20250802:europe-west1:kronos-db

# Frontend
gcloud run deploy kronos-frontend \
  --image europe-west1-docker.pkg.dev/kronos-eam-prod-20250802/kronos-eam/frontend:latest \
  --region europe-west1 \
  --platform managed \
  --allow-unauthenticated
```

## Post-Deployment

### 1. Verify Deployment
```bash
# Run verification script
cd /home/bloom/sentrics
./verify-deployment.sh

# Or manually check services
gcloud run services list --project=kronos-eam-prod-20250802
```

### 2. Get Service URLs
```bash
# Backend URL
gcloud run services describe kronos-backend \
  --region=europe-west1 \
  --format="value(status.url)"

# Frontend URL  
gcloud run services describe kronos-frontend \
  --region=europe-west1 \
  --format="value(status.url)"
```

### 3. Test Application
1. Open frontend URL in browser
2. Login with: `demo@kronos-eam.local` / `Demo2024!`
3. Verify:
   - Language switching (IT/EN)
   - Plant management
   - Workflow creation
   - Document upload

### 4. Monitor Logs
```bash
# Backend logs
gcloud run services logs read kronos-backend \
  --project=kronos-eam-prod-20250802 \
  --limit=50

# Frontend logs
gcloud run services logs read kronos-frontend \
  --project=kronos-eam-prod-20250802 \
  --limit=50

# Database logs
gcloud logging read "resource.type=cloudsql_database" \
  --project=kronos-eam-prod-20250802 \
  --limit=20
```

## Troubleshooting

### Common Issues

#### Secret Not Found Error
**Error**: `Secret projects/949811571472/secrets/jwt-secret/versions/latest was not found`

**Solution**: Run the fix-secrets.sh script:
```bash
cd /home/bloom/sentrics/deploy
./fix-secrets.sh
```

This will create the required secrets (jwt-secret, redis-password) and grant access permissions.

#### IAM Permission Error: "Permission 'iam.serviceAccounts.actAs' denied"
**Error**: `[kronos-deploy@***.iam.gserviceaccount.com] does not have permission to access namespaces instance [***] (or it may not exist): Permission 'iam.serviceAccounts.actAs' denied on service account kronos-backend@***.iam.gserviceaccount.com`

**Solution**: Run the fix-iam-permissions.sh script:
```bash
cd /home/bloom/sentrics/deploy
./fix-iam-permissions.sh
```

Or manually grant permissions:
```bash
# Allow deployment SA to act as backend SA
gcloud iam service-accounts add-iam-policy-binding \
  kronos-backend@${PROJECT_ID}.iam.gserviceaccount.com \
  --member="serviceAccount:kronos-deploy@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Allow deployment SA to act as frontend SA  
gcloud iam service-accounts add-iam-policy-binding \
  kronos-frontend@${PROJECT_ID}.iam.gserviceaccount.com \
  --member="serviceAccount:kronos-deploy@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

#### 2. Deployment Fails
**Symptom**: GitHub Actions workflow fails (general issues)

**Solutions**:
- Check billing is enabled
- Verify all APIs are enabled
- Check GitHub secrets are set correctly
- Re-run workflow from Actions page

#### 2. Database Connection Error
**Symptom**: Backend can't connect to database

**Solutions**:
```bash
# Check Cloud SQL instance
gcloud sql instances describe kronos-db \
  --project=kronos-eam-prod-20250802

# Verify password in Secret Manager
gcloud secrets versions access latest \
  --secret="db-password" \
  --project=kronos-eam-prod-20250802
```

#### 3. Frontend Not Loading
**Symptom**: Blank page or API errors

**Solutions**:
- Check CORS settings
- Verify backend URL in frontend config
- Check browser console for errors
- Ensure migrations completed

#### 4. Authentication Issues
**Symptom**: Can't login

**Solutions**:
```bash
# Connect to database
gcloud sql connect kronos-db \
  --user=postgres \
  --project=kronos-eam-prod-20250802

# Check user exists
SELECT email, role, status FROM users WHERE email='demo@kronos-eam.local';
```

### Debug Commands

```bash
# Service status
gcloud run services describe SERVICE_NAME \
  --region=europe-west1 \
  --project=kronos-eam-prod-20250802

# Recent errors
gcloud logging read "severity>=ERROR" \
  --project=kronos-eam-prod-20250802 \
  --limit=50

# Database connections
gcloud sql operations list \
  --instance=kronos-db \
  --project=kronos-eam-prod-20250802
```

## Cost Analysis

### Monthly Estimates

| Service | Configuration | Cost/Month |
|---------|--------------|------------|
| Cloud Run Backend | 1 vCPU, 512MB, 1-10 instances | $10-30 |
| Cloud Run Frontend | 1 vCPU, 256MB, 1-10 instances | $5-20 |
| Cloud SQL | db-f1-micro, 10GB | $15-20 |
| Load Balancer | HTTPS with SSL | $18-25 |
| Artifact Registry | 10GB storage | $5 |
| Secret Manager | <10K operations | $0.06 |
| **Total** | **Basic usage** | **~$60-100** |

### Cost Optimization

1. **Development**:
   ```bash
   # Stop Cloud SQL when not needed
   gcloud sql instances patch kronos-db \
     --activation-policy=NEVER \
     --project=kronos-eam-prod-20250802
   ```

2. **Production**:
   - Use committed use discounts
   - Set up budget alerts
   - Monitor unused resources

## Security Best Practices

1. **Never commit secrets**
   - Use Secret Manager
   - Rotate keys periodically

2. **Database security**
   - No public IP
   - SSL/TLS only
   - Strong passwords

3. **Application security**
   - JWT tokens expire
   - Rate limiting enabled
   - Input validation

4. **Monitoring**
   - Set up alerts
   - Review logs regularly
   - Track failed logins

## Deployment Scripts Reference

### Available Scripts in `/home/bloom/sentrics/deploy/`

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `gcp-setup.sh` | Complete GCP infrastructure setup | Initial deployment |
| `fix-iam-permissions.sh` | Fix service account permissions | IAM errors |
| `manage-services.sh` | Interactive service management | Local development |
| `create-service-account.sh` | Create deployment SA and key | Manual SA setup |
| `init-database.sh` | Initialize database schema | Database setup |
| `monitoring-setup.sh` | Configure monitoring | Production setup |
| `verify-deployment.sh` | Verify deployment success | Post-deployment |

### Key Changes in Latest Update

1. **Service Accounts**: Now creates 3 SAs (deploy, backend, frontend)
2. **IAM Permissions**: Automatically sets `serviceAccountUser` role
3. **Artifact Registry**: Uses `kronos-eam` not `kronos-docker`
4. **Deployment Options**: Added skip tests and quick deploy workflows

## Next Steps

1. **Set up monitoring**:
   - Cloud Monitoring dashboards
   - Uptime checks
   - Alert policies

2. **Configure backups**:
   - Verify daily backups
   - Test restore process
   - Document procedures

3. **Plan scaling**:
   - Load testing
   - Auto-scaling policies
   - Database sizing

4. **Security hardening**:
   - Security scanning
   - Vulnerability assessment
   - Penetration testing

## Support

- **Documentation**: `/docs` folder
- **Issues**: https://github.com/Bloom79/kronos-eam/issues
- **Logs**: Cloud Logging console
- **Monitoring**: Cloud Monitoring dashboards
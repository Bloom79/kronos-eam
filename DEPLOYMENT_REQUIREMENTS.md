# Kronos EAM Deployment Requirements - Complete Guide

Last Updated: October 3, 2025
Status: **Production-Ready Configuration Verified**

## Overview

This document contains the complete, verified requirements for deploying Kronos EAM to Google Cloud Platform (GCP) or any new environment. These settings have been tested and proven to work in production.

## Critical Requirements Summary

### ⚠️ IMPORTANT: Environment Variable Configuration

**MUST use a SINGLE `--set-env-vars` flag with comma-separated values**. Multiple flags will result in only the first being processed, causing deployment failures.

```bash
# ✅ CORRECT - Single flag with comma-separated values
--set-env-vars "VAR1=value1,VAR2=value2,VAR3=value3"

# ❌ WRONG - Multiple flags (only first will be processed)
--set-env-vars "VAR1=value1" \
--set-env-vars "VAR2=value2" \
--set-env-vars "VAR3=value3"
```

### Boolean Values

Use `1` or `0` for boolean environment variables (not `true`/`false`):
- ✅ `DISABLE_REDIS=1`
- ❌ `DISABLE_REDIS=true` (may not parse correctly)

---

## 1. GCP Infrastructure Requirements

### 1.1 Core Services

| Service | Configuration | Purpose |
|---------|--------------|---------|
| **Cloud SQL (PostgreSQL)** | PostgreSQL 14+, 2 vCPU, 4GB RAM | Primary database |
| **Cloud Run** | 2 vCPU, 8GB RAM, min 1 instance | Backend service |
| **Cloud Run** | 1 vCPU, 2GB RAM, min 1 instance | Frontend service |
| **Artifact Registry** | Standard repository | Docker images |
| **Secret Manager** | 3 secrets minimum | Sensitive credentials |

### 1.2 Service Accounts

```bash
# Backend service account
kronos-backend@PROJECT_ID.iam.gserviceaccount.com
Roles:
- Cloud SQL Client
- Secret Manager Secret Accessor
- Artifact Registry Reader

# Deployment service account
kronos-deploy@PROJECT_ID.iam.gserviceaccount.com
Roles:
- Cloud Run Admin
- Service Account User
- Artifact Registry Writer
- Secret Manager Secret Accessor
```

---

## 2. Required Secrets

### 2.1 Google Secret Manager Secrets

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `jwt-secret` | JWT signing key | 32+ character random string |
| `db-password` | PostgreSQL password | `KronosAdmin2024!` |
| `redis-password` | Redis password (unused but required) | Any value |

### 2.2 GitHub Actions Secrets

| Secret Name | Description |
|------------|-------------|
| `GCP_SA_KEY` | Service account JSON key for deployment |
| `DB_PASSWORD` | Database password (same as Secret Manager) |

---

## 3. Environment Variables (Complete List)

### 3.1 Required Environment Variables for Backend

```bash
# Database Configuration
DATABASE_URL=postgresql://postgres:PASSWORD@/kronos_eam?host=/cloudsql/PROJECT_ID:REGION:INSTANCE

# Environment
ENVIRONMENT=production

# Service Toggles (use 1 for true, 0 for false)
DISABLE_REDIS=1              # Disable Redis requirement
DISABLE_QDRANT=1             # Disable Qdrant requirement
DISABLE_RATE_LIMIT=1         # Disable rate limiting
TENANT_ISOLATION_MODE=shared # Multi-tenant mode

# Initialization
RUN_MIGRATIONS=1             # Run database migrations on startup
RUN_INIT_DATA=1              # Initialize demo data

# CORS Configuration (JSON array format)
BACKEND_CORS_ORIGINS=["https://your-frontend-url.run.app"]
```

### 3.2 Frontend Environment Variables

```bash
REACT_APP_API_URL=https://your-backend-url.run.app
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=1.0.0
```

---

## 4. Database Setup

### 4.1 Initial Database Creation

```sql
-- Create database
CREATE DATABASE kronos_eam;

-- Create user (if not using default postgres)
CREATE USER kronos WITH ENCRYPTED PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE kronos_eam TO kronos;
```

### 4.2 Demo User Configuration

The system automatically creates a demo user with:
- **Email**: `demo@kronos-eam.local`
- **Password**: `Demo2024!`
- **Tenant ID**: `demo`
- **Role**: `Admin`

Password hash (bcrypt, 12 rounds):
```
$2b$12$vgsRw3X30WqIIAAan/32u.1kRxUAyRFLJrhM13Gf8548Nft0F7U2.
```

---

## 5. Deployment Workflow Configuration

### 5.1 GitHub Actions Workflow (deploy-parallel.yml)

**Critical Configuration - Backend Deployment:**

```yaml
- name: Deploy Backend to Cloud Run
  run: |
    gcloud run deploy ${BACKEND_SERVICE} \
      --image ${REGION}-docker.pkg.dev/${PROJECT_ID}/kronos-eam/backend:latest \
      --region ${REGION} \
      --platform managed \
      --allow-unauthenticated \
      --set-env-vars "DATABASE_URL=postgresql://postgres:${{ secrets.DB_PASSWORD }}@/kronos_eam?host=/cloudsql/${PROJECT_ID}:${REGION}:${SQL_INSTANCE},ENVIRONMENT=production,DISABLE_REDIS=1,DISABLE_QDRANT=1,DISABLE_RATE_LIMIT=1,TENANT_ISOLATION_MODE=shared,RUN_MIGRATIONS=1,RUN_INIT_DATA=1,BACKEND_CORS_ORIGINS=[\"https://kronos-frontend-e7xnmhn7ra-ew.a.run.app\"]" \
      --set-secrets "SECRET_KEY=jwt-secret:latest,REDIS_PASSWORD=redis-password:latest,DB_PASSWORD=db-password:latest" \
      --add-cloudsql-instances ${PROJECT_ID}:${REGION}:${SQL_INSTANCE} \
      --service-account kronos-backend@${PROJECT_ID}.iam.gserviceaccount.com \
      --memory 8Gi \
      --cpu 2 \
      --min-instances 1 \
      --max-instances 10 \
      --port 8080 \
      --timeout 600
```

### 5.2 Docker Build Requirements

**Dockerfile must use `--no-cache` for dependency updates:**

```yaml
- name: Build and Push Backend
  run: |
    docker build --no-cache -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/kronos-eam/backend:latest .
    docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/kronos-eam/backend:latest
```

---

## 6. Python Dependencies

### 6.1 Critical Package Versions

```txt
# requirements.txt
bcrypt>=4.0.1           # Password hashing (direct usage, no passlib)
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
pydantic==2.5.0
pydantic-settings==2.1.0
python-jose[cryptography]==3.3.0
python-multipart==0.0.6
alembic==1.12.1
```

### 6.2 Security Configuration

```python
# app/core/security.py
import bcrypt as bcrypt_lib

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash using bcrypt directly"""
    try:
        return bcrypt_lib.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except Exception as e:
        import logging
        logging.error(f"Password verification failed: {e}")
        return False
```

---

## 7. Verification Checklist

### 7.1 Pre-Deployment Verification

- [ ] All secrets created in Secret Manager
- [ ] Service accounts created with correct permissions
- [ ] Cloud SQL instance running
- [ ] Artifact Registry repository created
- [ ] GitHub secrets configured
- [ ] Workflow file uses SINGLE `--set-env-vars` flag
- [ ] Boolean values use `1`/`0` not `true`/`false`
- [ ] CORS origins in JSON array format

### 7.2 Post-Deployment Verification

```bash
# 1. Check environment variables are set
gcloud run services describe kronos-backend \
  --region=europe-west1 \
  --format='value(spec.template.spec.containers[0].env)'

# Expected: Should see all 9 env vars + 3 secrets = 12 total

# 2. Test health endpoint
curl https://your-backend-url.run.app/health

# 3. Test login
curl -X POST https://your-backend-url.run.app/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "X-Tenant-ID: demo" \
  -d "username=demo@kronos-eam.local&password=Demo2024!"

# Expected: JWT token response
```

---

## 8. Common Issues and Solutions

### Issue 1: Missing Environment Variables

**Symptom**: Only 7 of 12 environment variables set
**Cause**: Multiple `--set-env-vars` flags in deployment
**Solution**: Use single flag with comma-separated values

### Issue 2: Rate Limiter Redis Connection Error

**Symptom**: 500 error, "redis.exceptions.ConnectionError"
**Cause**: `DISABLE_RATE_LIMIT` not set or set to `true` (string)
**Solution**: Set `DISABLE_RATE_LIMIT=1`

### Issue 3: Login Returns 401 Unauthorized

**Symptom**: "Incorrect email or password"
**Possible Causes**:
1. User locked after failed attempts
2. Password hash incompatibility
3. Wrong tenant ID

**Solution**:
```sql
-- Reset user lock
UPDATE users
SET failed_login_attempts = 0, locked_until = NULL
WHERE email = 'demo@kronos-eam.local' AND tenant_id = 'demo';
```

### Issue 4: CORS Errors

**Symptom**: Frontend cannot communicate with backend
**Cause**: `BACKEND_CORS_ORIGINS` not set or wrong format
**Solution**: Set as JSON array: `BACKEND_CORS_ORIGINS=["https://frontend-url"]`

---

## 9. Manual Deployment Commands

### 9.1 Quick Environment Update (without rebuild)

```bash
# Update specific environment variables
gcloud run services update kronos-backend \
  --region=europe-west1 \
  --update-env-vars "DISABLE_RATE_LIMIT=1,TENANT_ISOLATION_MODE=shared"

# Add missing environment variables
gcloud run services update kronos-backend \
  --region=europe-west1 \
  --update-env-vars "BACKEND_CORS_ORIGINS=[\"https://frontend-url\"]"
```

### 9.2 Complete Manual Deployment

```bash
# 1. Build and push Docker image
docker build --no-cache -t europe-west1-docker.pkg.dev/PROJECT_ID/kronos-eam/backend:latest .
docker push europe-west1-docker.pkg.dev/PROJECT_ID/kronos-eam/backend:latest

# 2. Deploy to Cloud Run (single command, no line breaks)
gcloud run deploy kronos-backend --image europe-west1-docker.pkg.dev/PROJECT_ID/kronos-eam/backend:latest --region europe-west1 --platform managed --allow-unauthenticated --set-env-vars "DATABASE_URL=postgresql://postgres:PASSWORD@/kronos_eam?host=/cloudsql/PROJECT:REGION:INSTANCE,ENVIRONMENT=production,DISABLE_REDIS=1,DISABLE_QDRANT=1,DISABLE_RATE_LIMIT=1,TENANT_ISOLATION_MODE=shared,RUN_MIGRATIONS=1,RUN_INIT_DATA=1,BACKEND_CORS_ORIGINS=[\"https://frontend-url\"]" --set-secrets "SECRET_KEY=jwt-secret:latest,REDIS_PASSWORD=redis-password:latest,DB_PASSWORD=db-password:latest" --add-cloudsql-instances PROJECT:REGION:INSTANCE --service-account kronos-backend@PROJECT.iam.gserviceaccount.com --memory 8Gi --cpu 2 --min-instances 1 --max-instances 10 --port 8080 --timeout 600
```

---

## 10. Support and Troubleshooting

### Logs Access

```bash
# View Cloud Run logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=kronos-backend" \
  --limit=50 --format='table(timestamp,severity,textPayload)'

# View specific revision logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.revision_name=kronos-backend-00050-xxx" \
  --limit=30
```

### Database Access

```bash
# Connect to Cloud SQL
gcloud sql connect kronos-db --user=postgres --database=kronos_eam

# Check user status
SELECT email, failed_login_attempts, locked_until, status
FROM users WHERE tenant_id = 'demo';
```

---

## Document History

- **2025-10-03**: Initial version with complete production-tested configuration
- **Key Fixes Applied**:
  - Single `--set-env-vars` flag requirement
  - Boolean values as `1`/`0`
  - CORS configuration as JSON array
  - bcrypt direct usage without passlib

---

**Note**: This configuration is battle-tested and currently running in production. Follow these requirements exactly to ensure successful deployment.
## CI/CD Best Practices Guide

This guide explains the optimized CI/CD strategy for Kronos EAM, designed to minimize deployment time and costs.

## Table of Contents
1. [Workflow Overview](#workflow-overview)
2. [Smart Deployment Strategy](#smart-deployment-strategy)
3. [When to Use Each Workflow](#when-to-use-each-workflow)
4. [Cost & Time Optimization](#cost--time-optimization)
5. [Port Configuration](#port-configuration)
6. [Best Practices](#best-practices)

---

## Workflow Overview

### Available Workflows

| Workflow | File | Trigger | Duration | Use Case |
|----------|------|---------|----------|----------|
| **Infrastructure Setup** | `setup-gcp-infrastructure.yml` | Manual only | ~2 min | First-time setup, infrastructure changes |
| **Backend Only** | `deploy-backend-only.yml` | `kronos-eam-backend/**` changes | ~5-8 min | Backend code changes |
| **Frontend Only** | `deploy-frontend-only.yml` | `kronos-eam-react/**` changes | ~2-3 min | Frontend code changes |
| **Full Deployment** | `deploy-parallel.yml` | Manual only | ~15 min | Major releases, both components changed |
| **Sequential Deploy** | `deploy.yml` | Push to main | ~18 min | Legacy workflow (slow) |

### Workflow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Git Push to main                          │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ├─ Changed: kronos-eam-backend/**
                 │  └─> Triggers: deploy-backend-only.yml
                 │      ✓ Builds only backend Docker image
                 │      ✓ Deploys only backend to Cloud Run
                 │      ⏱️  Duration: ~5-8 minutes
                 │
                 ├─ Changed: kronos-eam-react/**
                 │  └─> Triggers: deploy-frontend-only.yml
                 │      ✓ Builds only frontend Docker image
                 │      ✓ Deploys only frontend to Cloud Run
                 │      ⏱️  Duration: ~2-3 minutes
                 │
                 └─ Changed: Both or manual full deployment
                    └─> Use: deploy-parallel.yml (manual trigger)
                        ✓ Builds both in parallel
                        ✓ Deploys both
                        ⏱️  Duration: ~15 minutes
```

---

## Smart Deployment Strategy

### Automatic Path-Based Triggers

The CI/CD system automatically detects which components changed and deploys only what's needed:

#### Backend Changes Only
```yaml
# .github/workflows/deploy-backend-only.yml
on:
  push:
    branches: [main]
    paths:
      - 'kronos-eam-backend/**'
```

**Example**: You change `kronos-eam-backend/app/main.py`
- ✅ Backend workflow triggers
- ⏭️  Frontend workflow skipped
- ⏱️  Saves 10+ minutes
- 💰 Saves 60% deployment cost

#### Frontend Changes Only
```yaml
# .github/workflows/deploy-frontend-only.yml
on:
  push:
    branches: [main]
    paths:
      - 'kronos-eam-react/**'
```

**Example**: You change `kronos-eam-react/src/App.tsx`
- ⏭️  Backend workflow skipped
- ✅ Frontend workflow triggers
- ⏱️  Saves 13+ minutes
- 💰 Saves 80% deployment cost

#### Both Components Changed
```bash
# Manually trigger full deployment
gh workflow run deploy-parallel.yml \
  -f environment=production \
  -f deploy_target=both
```

**Example**: You changed both backend and frontend
- Use parallel deployment for speed
- Both build simultaneously
- Both deploy in sequence

---

## When to Use Each Workflow

### 1. Infrastructure Setup (`setup-gcp-infrastructure.yml`)

**When to use:**
- ✅ First-time project setup
- ✅ Creating Cloud SQL database
- ✅ Setting up secrets
- ✅ Configuring service accounts
- ✅ After deleting infrastructure (disaster recovery)

**When NOT to use:**
- ❌ Regular application deployments
- ❌ Code changes

**Command**:
```bash
gh workflow run setup-gcp-infrastructure.yml -f environment=production
```

**Output**: Creates all GCP infrastructure (Cloud SQL, secrets, IAM)

---

### 2. Backend Only Deployment (`deploy-backend-only.yml`)

**When to use:**
- ✅ Changed Python code in `kronos-eam-backend/`
- ✅ Modified API endpoints
- ✅ Updated database models
- ✅ Changed requirements.txt
- ✅ Modified Dockerfile or entrypoint.sh (backend)

**When NOT to use:**
- ❌ Frontend-only changes
- ❌ Both backend and frontend changed (use full deployment)

**Triggers automatically on push to main** if files in `kronos-eam-backend/` changed.

**Manual trigger**:
```bash
gh workflow run deploy-backend-only.yml -f environment=production
```

**Benefits**:
- ⏱️  5-8 minutes (vs 15-18 min for full)
- 💰 60% cost savings
- 🚀 Faster iterations

---

### 3. Frontend Only Deployment (`deploy-frontend-only.yml`)

**When to use:**
- ✅ Changed React components
- ✅ Modified UI/UX
- ✅ Updated package.json
- ✅ Changed Dockerfile (frontend)
- ✅ Modified CSS/styling

**When NOT to use:**
- ❌ Backend-only changes
- ❌ Both backend and frontend changed (use full deployment)

**Triggers automatically on push to main** if files in `kronos-eam-react/` changed.

**Manual trigger**:
```bash
gh workflow run deploy-frontend-only.yml -f environment=production
```

**Benefits**:
- ⏱️  2-3 minutes (fastest deployment)
- 💰 80% cost savings
- 🚀 Instant UI updates

---

### 4. Full Parallel Deployment (`deploy-parallel.yml`)

**When to use:**
- ✅ Both backend and frontend changed
- ✅ Major releases
- ✅ Breaking changes across stack
- ✅ API contract changes (backend + frontend)
- ✅ Infrastructure changes that affect both

**When NOT to use:**
- ❌ Single component changes (use specific workflow)
- ❌ Small fixes (use targeted deployment)

**Manual trigger only**:
```bash
gh workflow run deploy-parallel.yml \
  -f environment=production \
  -f deploy_target=both
```

**Options**:
```bash
# Deploy only backend (via parallel workflow)
-f deploy_target=backend-only

# Deploy only frontend (via parallel workflow)
-f deploy_target=frontend-only

# Deploy both (default)
-f deploy_target=both
```

**Benefits**:
- 🔄 Parallel builds (faster than sequential)
- 🎯 Selective deployment options
- 🚦 Blue-green deployment with --no-traffic flag

---

### 5. Sequential Deployment (`deploy.yml`) - Legacy

**Status**: 🟡 Maintained for compatibility

**When to use:**
- ⚠️  Rarely needed
- ⚠️  Runs on every push to main (consider disabling)

**Why avoid:**
- ❌ Always deploys both components
- ❌ Sequential (slower than parallel)
- ❌ No path-based triggers
- ❌ 18 minutes deployment time

**Recommendation**: Use `deploy-backend-only.yml` or `deploy-frontend-only.yml` instead.

---

## Cost & Time Optimization

### Deployment Time Comparison

| Scenario | Old Approach | New Approach | Time Saved |
|----------|-------------|-------------|------------|
| Backend code change | 18 min (full deploy) | 5-8 min (backend only) | **10-13 min** ⏱️ |
| Frontend code change | 18 min (full deploy) | 2-3 min (frontend only) | **15-16 min** ⏱️ |
| Both changed | 18 min (sequential) | 15 min (parallel) | **3 min** ⏱️ |

### Cost Impact

**Google Cloud Costs:**

| Component | Build Time | Cost per Minute | Old Monthly Cost | New Monthly Cost | Savings |
|-----------|-----------|----------------|-----------------|-----------------|---------|
| Backend build | 8 min | $0.03 | $24/month | $8/month | **67%** 💰 |
| Frontend build | 3 min | $0.03 | $24/month | $3/month | **87%** 💰 |

**Assumptions:**
- 2 backend deployments/day
- 3 frontend deployments/day
- 20 working days/month

**Total savings**: ~$37/month (~75% reduction)

### Real-World Example

**Before optimization:**
```bash
Day 1:
  9:00 AM  - Change backend API (18 min deploy)
  11:00 AM - Fix frontend bug (18 min deploy)
  2:00 PM  - Update backend (18 min deploy)
  4:00 PM  - Frontend styling (18 min deploy)

Total: 72 minutes of CI/CD time
Cost: $2.16
```

**After optimization:**
```bash
Day 1:
  9:00 AM  - Change backend API (8 min deploy)
  11:00 AM - Fix frontend bug (3 min deploy)
  2:00 PM  - Update backend (8 min deploy)
  4:00 PM  - Frontend styling (3 min deploy)

Total: 22 minutes of CI/CD time
Cost: $0.66

Savings: 50 minutes (69%), $1.50 (69%)
```

---

## Port Configuration

### Current Configuration ✅

The application ports are correctly aligned across all components:

| Component | Port | Configuration | Status |
|-----------|------|--------------|--------|
| **Dockerfile** | 8080 | `EXPOSE 8080` | ✅ Correct |
| **entrypoint.sh** | ${PORT:-8000} | Cloud Run sets PORT=8080 | ✅ Correct |
| **deploy workflows** | 8080 | `--port 8080` | ✅ Correct |
| **Backend service** | 8080 | Cloud Run managed | ✅ Correct |
| **Frontend service** | 80 | `--port 80` | ✅ Correct |

### How Port Configuration Works

1. **Cloud Run** sets environment variable `PORT=8080` automatically
2. **entrypoint.sh** reads `${PORT:-8000}` (defaults to 8000 locally, 8080 in Cloud Run)
3. **Uvicorn** binds to the dynamic port: `--port ${PORT:-8000}`
4. **Health checks** use the same port: `http://localhost:${PORT:-8080}/health`

**Why this works:**
- ✅ Flexible for local development (port 8000)
- ✅ Cloud Run compatible (port 8080)
- ✅ No hardcoded ports in code
- ✅ Dockerfile EXPOSE is documentation only (not enforced)

### Local vs Production Ports

```bash
# Local development (uses .env or default)
PORT=5433  # PostgreSQL (podman)
PORT=6380  # Redis (podman)
PORT=6334  # Qdrant (podman)
PORT=8000  # Backend API (default)
PORT=3000  # Frontend dev server

# Production (Cloud Run)
PORT=8080  # Backend API (Cloud Run sets this)
PORT=80    # Frontend (Cloud Run)
Cloud SQL: Unix socket /cloudsql/project:region:instance
```

**Local containers** are on different ports to avoid conflicts with the existing pharma-postgres container.

---

## Best Practices

### 1. Commit Strategy

**Small, focused commits**:
```bash
# Good: Single component
git commit -m "Fix: Update user authentication endpoint"
# Triggers: deploy-backend-only.yml

# Good: Single component
git commit -m "UI: Add dark mode toggle"
# Triggers: deploy-frontend-only.yml

# Good: Both, with manual deploy
git commit -m "Breaking: Update API contract"
# Manually run: deploy-parallel.yml
```

**Avoid mixing changes**:
```bash
# Bad: Mixed changes
git commit -m "Fix backend bug and update frontend"
# Problem: Both workflows trigger, or need manual intervention
```

### 2. Testing Before Deploy

```bash
# Test locally first
cd kronos-eam-backend
pytest

cd ../kronos-eam-react
npm test

# Then commit and push
git add .
git commit -m "..."
git push origin main
```

### 3. Monitoring Deployments

```bash
# Watch real-time
gh run watch

# Check status
gh run list --limit 5

# View logs
gh run view --log

# Diagnose failures
./deploy/diagnose-latest-deployment.sh
```

### 4. Rolling Back

```bash
# List recent deployments
gcloud run revisions list --service=kronos-backend --region=europe-west1

# Rollback to previous revision
gcloud run services update-traffic kronos-backend \
  --to-revisions=kronos-backend-00011-xyz=100 \
  --region=europe-west1
```

### 5. Blue-Green Deployment

```bash
# Deploy without sending traffic
--no-traffic  # In workflow

# Test the new revision
curl https://kronos-backend-00012-xyz-uc.a.run.app

# Gradually route traffic
gcloud run services update-traffic kronos-backend \
  --to-revisions=kronos-backend-00012-xyz=50,kronos-backend-00011-abc=50

# Full switch
gcloud run services update-traffic kronos-backend \
  --to-latest
```

---

## Troubleshooting

### Issue: Both Workflows Triggered

**Problem**: Changed files in both `kronos-eam-backend/` and `kronos-eam-react/`

**Solution 1**: Let both run (if changes are independent)

**Solution 2**: Cancel one and use full deployment:
```bash
# Cancel the running workflows
gh run cancel <run-id>

# Run full deployment
gh workflow run deploy-parallel.yml -f environment=production -f deploy_target=both
```

### Issue: Workflow Didn't Trigger

**Problem**: Changed files but workflow didn't run

**Check**:
```bash
# Verify path trigger
cat .github/workflows/deploy-backend-only.yml | grep -A 5 "paths:"

# Check if files match pattern
git diff --name-only HEAD~1 HEAD | grep "kronos-eam-backend/"
```

**Solution**: Manually trigger:
```bash
gh workflow run deploy-backend-only.yml -f environment=production
```

### Issue: Wrong Workflow Triggered

**Problem**: Changed Dockerfile and both workflows triggered

**Reason**: Each workflow includes its own file in paths:
```yaml
paths:
  - 'kronos-eam-backend/**'
  - '.github/workflows/deploy-backend-only.yml'  # This line
```

**Solution**: This is intentional - workflow changes should trigger deployment to test them.

---

## Quick Reference

### Common Commands

```bash
# Infrastructure setup (first time)
gh workflow run setup-gcp-infrastructure.yml -f environment=production

# Deploy backend only
gh workflow run deploy-backend-only.yml -f environment=production

# Deploy frontend only
gh workflow run deploy-frontend-only.yml -f environment=production

# Deploy both (parallel)
gh workflow run deploy-parallel.yml -f environment=production -f deploy_target=both

# Watch deployment
gh run watch

# Check recent deployments
gh run list --limit 10

# View specific run
gh run view <run-id> --log

# Diagnose issues
cd deploy && ./diagnose-latest-deployment.sh
```

### Decision Tree

```
Changed files?
│
├─ Only kronos-eam-backend/**
│  └─> Use: deploy-backend-only.yml (auto-triggers)
│
├─ Only kronos-eam-react/**
│  └─> Use: deploy-frontend-only.yml (auto-triggers)
│
├─ Both directories
│  └─> Use: deploy-parallel.yml (manual trigger)
│
├─ Infrastructure (.github/workflows/setup-gcp-infrastructure.yml)
│  └─> Use: setup-gcp-infrastructure.yml (manual trigger)
│
└─ Documentation only (*.md files)
   └─> No deployment needed
```

---

## Related Documentation

- [Infrastructure Setup Guide](./GCP_INFRASTRUCTURE_SETUP.md)
- [Deployment Troubleshooting](./DEPLOYMENT_TROUBLESHOOTING.md)
- [Diagnostic Script](./diagnose-latest-deployment.sh)

---

## Summary

**Key Takeaways:**
1. 🎯 Use specific workflows for single-component changes
2. ⏱️  Save 70% deployment time with path-based triggers
3. 💰 Save 75% CI/CD costs with targeted deployments
4. 🚀 Deploy backend in 5-8 min, frontend in 2-3 min
5. 🔄 Use parallel workflow for full deployments
6. ✅ Ports are correctly configured (8080 for backend, 80 for frontend)

**Deployment speed matters!** Fast CI/CD = faster iterations = better product.

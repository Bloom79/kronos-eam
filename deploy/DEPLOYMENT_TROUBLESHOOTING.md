# Deployment Troubleshooting Guide

This guide shows how to retrieve and analyze GitHub Actions deployment logs and Cloud Run logs to diagnose deployment failures.

## Table of Contents
1. [Quick Diagnostics Script](#quick-diagnostics-script)
2. [Manual GitHub Actions Log Retrieval](#manual-github-actions-log-retrieval)
3. [Manual Cloud Run Log Retrieval](#manual-cloud-run-log-retrieval)
4. [Common Error Patterns](#common-error-patterns)

---

## Quick Diagnostics Script

We've created an automated script that checks both GitHub Actions and Cloud Run logs.

### Usage

```bash
cd /home/bloom/sentrics/deploy
./diagnose-latest-deployment.sh
```

This will:
- Show the latest GitHub Actions workflow runs
- Display detailed logs from the most recent run
- Check Cloud Run service status
- Fetch Cloud Run container logs
- Identify common error patterns

### With Options

```bash
# Check specific workflow run by ID
./diagnose-latest-deployment.sh --run-id 18195536715

# Only show failed jobs
./diagnose-latest-deployment.sh --failed-only

# Include Cloud Run logs from specific revision
./diagnose-latest-deployment.sh --revision kronos-backend-00010-46l

# Verbose output with timestamps
./diagnose-latest-deployment.sh --verbose
```

---

## Manual GitHub Actions Log Retrieval

### 1. List Recent Workflow Runs

```bash
# List last 5 workflow runs
gh run list --repo Bloom79/kronos-eam --limit 5

# List only failed runs
gh run list --repo Bloom79/kronos-eam --status failure --limit 5

# List runs for specific workflow
gh run list --repo Bloom79/kronos-eam --workflow "deploy-parallel.yml" --limit 5

# Get detailed JSON output
gh run list --repo Bloom79/kronos-eam --limit 3 \
  --json workflowName,status,conclusion,createdAt,headBranch
```

**Example Output:**
```
STATUS  TITLE                          WORKFLOW                    BRANCH  EVENT              ID          ELAPSED  AGE
X       Fix PORT environment variable  Deploy to Google Cloud Run  main    push               18195536715  18m12s   2h
X       Parallel Deploy (Faster)       Parallel Deploy (Faster)    main    workflow_dispatch  18194910520  23m45s   3h
✓       Update project ID              Deploy to Google Cloud Run  main    push               18194123456  15m30s   4h
```

### 2. View Specific Workflow Run

```bash
# Get run ID from list above (e.g., 18195536715)
RUN_ID=18195536715

# View run summary
gh run view $RUN_ID --repo Bloom79/kronos-eam

# View run with job details
gh run view $RUN_ID --repo Bloom79/kronos-eam -v

# View in browser
gh run view $RUN_ID --repo Bloom79/kronos-eam --web
```

**Example Output:**
```
X main Deploy to Google Cloud Run · 18195536715
Triggered via push about 2 hours ago

JOBS
✓ test in 5m20s (ID 51800691794)
X deploy in 13m12s (ID 51801211670)
  ✓ Set up job
  ✓ Run actions/checkout@v4
  ✓ Build and Push Backend
  X Deploy Backend to Cloud Run
```

### 3. Get Full Logs

```bash
# Get full logs for a run
gh run view $RUN_ID --repo Bloom79/kronos-eam --log > deployment.log

# Get logs for specific job
JOB_ID=51801211670
gh run view $RUN_ID --repo Bloom79/kronos-eam --job $JOB_ID --log

# Get only failed step logs
gh run view $RUN_ID --repo Bloom79/kronos-eam --log-failed
```

### 4. Watch Running Deployment

```bash
# Watch a running deployment (auto-refresh every 10s)
gh run watch $RUN_ID --repo Bloom79/kronos-eam --interval 10

# Exit with error code if run fails (useful for scripts)
gh run watch $RUN_ID --repo Bloom79/kronos-eam --exit-status
```

---

## Manual Cloud Run Log Retrieval

### 1. List Cloud Run Services

```bash
# List all services
gcloud run services list \
  --region=europe-west1 \
  --project=kronos-eam-prod-20250802

# Get specific service details
gcloud run services describe kronos-backend \
  --region=europe-west1 \
  --project=kronos-eam-prod-20250802
```

### 2. Get Latest Revision Name

```bash
# Get the latest revision
REVISION=$(gcloud run services describe kronos-backend \
  --region=europe-west1 \
  --project=kronos-eam-prod-20250802 \
  --format='value(status.latestCreatedRevisionName)')

echo "Latest revision: $REVISION"
```

### 3. Fetch Cloud Run Container Logs

```bash
# Get logs for latest revision
gcloud logging read \
  "resource.type=cloud_run_revision AND \
   resource.labels.service_name=kronos-backend AND \
   resource.labels.revision_name=$REVISION" \
  --limit 100 \
  --project=kronos-eam-prod-20250802 \
  --format="table(timestamp,severity,textPayload)"

# Get only ERROR logs
gcloud logging read \
  "resource.type=cloud_run_revision AND \
   resource.labels.service_name=kronos-backend AND \
   severity>=ERROR" \
  --limit 50 \
  --project=kronos-eam-prod-20250802 \
  --format="table(timestamp,severity,textPayload)"

# Get logs with specific time range (last 1 hour)
gcloud logging read \
  "resource.type=cloud_run_revision AND \
   resource.labels.service_name=kronos-backend" \
  --limit 100 \
  --project=kronos-eam-prod-20250802 \
  --freshness=1h \
  --format=json

# Stream live logs (tail -f equivalent)
gcloud logging tail \
  "resource.type=cloud_run_revision AND \
   resource.labels.service_name=kronos-backend" \
  --project=kronos-eam-prod-20250802
```

### 4. Pretty Print JSON Logs

```bash
# Get logs as JSON and pretty print
gcloud logging read \
  "resource.type=cloud_run_revision AND \
   resource.labels.service_name=kronos-backend AND \
   resource.labels.revision_name=$REVISION" \
  --limit 100 \
  --project=kronos-eam-prod-20250802 \
  --format=json | python3 -c "
import json, sys
logs = json.load(sys.stdin)
for log in sorted(logs, key=lambda x: x.get('timestamp', '')):
    ts = log.get('timestamp', 'N/A')
    severity = log.get('severity', 'INFO')
    text = log.get('textPayload', log.get('jsonPayload', ''))
    print(f'{ts} [{severity}] {text}')
"
```

---

## Common Error Patterns

### 1. ModuleNotFoundError

**Error Pattern:**
```
ModuleNotFoundError: No module named 'docx'
```

**What to check:**
```bash
# Check requirements.txt for missing package
grep -i docx requirements.txt

# Check if it's imported in code
grep -r "from docx import\|import docx" app/
```

**Fix:** Add missing package to `requirements.txt`

---

### 2. Memory Limit Exceeded

**Error Pattern:**
```
Memory limit of 512 MiB exceeded with 536 MiB used.
```

**What to check:**
```bash
# Check current memory limit
grep "memory" .github/workflows/deploy-parallel.yml
```

**Fix:** Increase `--memory` flag in deployment workflows

---

### 3. PORT Binding Issues

**Error Pattern:**
```
Failed to start and listen on the port defined by PORT=8080
```

**What to check:**
```bash
# Check if PORT is set in Dockerfile
grep "ENV.*PORT" kronos-eam-backend/Dockerfile

# Check entrypoint script
grep "PORT" kronos-eam-backend/entrypoint.sh
```

**Fix:** Remove PORT from Dockerfile ENV, Cloud Run sets it automatically

---

### 4. Bad Substitution (Shell Script Errors)

**Error Pattern:**
```
/app/entrypoint.sh: 7: Bad substitution
```

**What to check:**
```bash
# Check shebang line
head -1 kronos-eam-backend/entrypoint.sh

# Check for bash-specific syntax
grep '\${.*:.*}' kronos-eam-backend/entrypoint.sh
```

**Fix:** Use `#!/bin/bash` instead of `#!/bin/sh` if using bash syntax

---

### 5. Project ID Mismatch

**Error Pattern:**
```
Project 'kronos-eam-prod' not found or permission denied.
```

**What to check:**
```bash
# Check project ID in workflows
grep "PROJECT_ID" .github/workflows/*.yml

# List available projects
gcloud projects list
```

**Fix:** Update PROJECT_ID in workflow files to match actual project

---

### 6. Timeout Errors

**Error Pattern:**
```
The allocated timeout was exceeded
```

**What to check:**
```bash
# Check timeout setting
grep "timeout" .github/workflows/deploy-parallel.yml
```

**Fix:** Increase `--timeout` value (max 3600s)

---

## Advanced Troubleshooting

### Export Logs to File

```bash
# Export GitHub Actions logs
gh run view $RUN_ID --repo Bloom79/kronos-eam --log > github-actions.log

# Export Cloud Run logs
gcloud logging read \
  "resource.type=cloud_run_revision AND resource.labels.service_name=kronos-backend" \
  --limit 500 \
  --project=kronos-eam-prod-20250802 \
  --format=json > cloud-run-logs.json
```

### Search Logs for Specific Errors

```bash
# Search GitHub Actions logs
gh run view $RUN_ID --repo Bloom79/kronos-eam --log | grep -i "error\|failed\|exception"

# Search Cloud Run logs
gcloud logging read \
  "resource.type=cloud_run_revision AND \
   textPayload=~\"Error\|Exception\|Failed\"" \
  --limit 100 \
  --project=kronos-eam-prod-20250802
```

### Compare Successful vs Failed Deployments

```bash
# Get logs from last successful deployment
GOOD_RUN=18194123456
gh run view $GOOD_RUN --repo Bloom79/kronos-eam --log > good-deployment.log

# Get logs from failed deployment
BAD_RUN=18195536715
gh run view $BAD_RUN --repo Bloom79/kronos-eam --log > bad-deployment.log

# Compare
diff good-deployment.log bad-deployment.log
```

---

## Quick Reference Commands

```bash
# Check latest deployment status
gh run list --repo Bloom79/kronos-eam --limit 1

# Get logs from latest run
gh run view --repo Bloom79/kronos-eam --log | tail -100

# Check Cloud Run service health
gcloud run services describe kronos-backend \
  --region=europe-west1 \
  --project=kronos-eam-prod-20250802 \
  --format='value(status.conditions)'

# Get latest Cloud Run errors
gcloud logging read \
  "resource.type=cloud_run_revision AND severity>=ERROR" \
  --limit 20 \
  --project=kronos-eam-prod-20250802 \
  --format="table(timestamp,textPayload)"
```

---

## Automated Diagnostics Script

See `diagnose-latest-deployment.sh` in this directory for a comprehensive automated diagnostic tool.

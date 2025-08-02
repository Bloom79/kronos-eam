# Post-Push Deployment Steps

## After Successfully Pushing to GitHub

### 1. Monitor GitHub Actions
- Go to: https://github.com/Bloom79/kronos-eam/actions
- You should see a workflow running automatically
- If not, check if Actions are enabled in Settings > Actions

### 2. Enable GCP Billing
**REQUIRED before deployment can succeed**

Go to: https://console.cloud.google.com/billing/linkedaccount?project=kronos-eam-prod-20250802

### 3. Enable Required GCP APIs
After billing is enabled, run:

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
    --project=kronos-eam-prod-20250802
```

### 4. Create Artifact Registry
```bash
gcloud artifacts repositories create kronos-eam \
    --repository-format=docker \
    --location=europe-west1 \
    --project=kronos-eam-prod-20250802
```

### 5. If GitHub Actions Fails

Common issues and fixes:

**Billing not enabled:**
- Enable billing as shown above
- Re-run the failed workflow

**APIs not enabled:**
- Run the enable command above
- Re-run the workflow

**Permissions issues:**
- Verify service account has all required roles
- Check GitHub secrets are correctly set

### 6. Verify Deployment

Once successful, get your service URLs:
```bash
gcloud run services list --project=kronos-eam-prod-20250802
```

Access the application:
- Frontend URL: Will be shown in Cloud Run services
- Default login: demo@kronos-eam.local / Demo2024!

### 7. Check Logs if Needed
```bash
# Backend logs
gcloud run services logs read kronos-backend --project=kronos-eam-prod-20250802 --limit=50

# Frontend logs  
gcloud run services logs read kronos-frontend --project=kronos-eam-prod-20250802 --limit=50
```
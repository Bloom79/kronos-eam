# GitHub Secrets Configuration Guide

This guide explains how to set up the required GitHub secrets for deploying Kronos EAM to Google Cloud Platform.

## Required Secrets

### 1. GCP_PROJECT_ID
Your Google Cloud Project ID where resources will be created.

**How to find it:**
```bash
gcloud config get-value project
```
Or visit: https://console.cloud.google.com/home/dashboard

### 2. GCP_SA_KEY
Service account JSON key with necessary permissions.

**How to create it:**
```bash
# Create service account
gcloud iam service-accounts create kronos-deploy \
    --display-name="Kronos Deployment Service Account"

# Grant necessary roles
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:kronos-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:kronos-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:kronos-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/cloudsql.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:kronos-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/artifactregistry.admin"

# Create and download key
gcloud iam service-accounts keys create ~/kronos-sa-key.json \
    --iam-account=kronos-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

**Important:** Copy the entire contents of `~/kronos-sa-key.json` as the secret value.

### 3. DB_PASSWORD
Database password for the Kronos application.

**Value:** KronosAdmin2024!

## How to Add Secrets to GitHub

1. Go to your repository on GitHub
2. Click on "Settings" tab
3. In the left sidebar, click "Secrets and variables" → "Actions"
4. Click "New repository secret"
5. For each secret:
   - Name: Enter the secret name exactly as shown above
   - Value: Enter the secret value
   - Click "Add secret"

## Verification

After adding all secrets, you should see:
- GCP_PROJECT_ID
- GCP_SA_KEY
- DB_PASSWORD

Listed under "Repository secrets" in the Actions secrets page.

## Security Notes

- Never commit these values to your repository
- Rotate the service account key periodically
- Use different passwords for different environments
- Consider using Google Secret Manager for production

## Troubleshooting

If deployment fails with authentication errors:

1. **Verify service account permissions:**
```bash
gcloud projects get-iam-policy YOUR_PROJECT_ID \
    --flatten="bindings[].members" \
    --filter="bindings.members:serviceAccount:kronos-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com"
```

2. **Test service account locally:**
```bash
export GOOGLE_APPLICATION_CREDENTIALS=~/kronos-sa-key.json
gcloud auth application-default print-access-token
```

3. **Check secret format:**
- Ensure GCP_SA_KEY contains the full JSON (including `{` and `}`)
- No extra whitespace or line breaks added
- Use the "paste" option in GitHub, not manual typing
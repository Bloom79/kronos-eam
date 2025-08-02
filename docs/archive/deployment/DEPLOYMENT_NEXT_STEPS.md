# Deployment Next Steps

## Current Status
✅ Repository cleaned and organized
✅ Git initialized with comprehensive commit
✅ All files ready for deployment

## Immediate Next Steps

### 1. Create GitHub Repository
```bash
# Go to https://github.com/new
# Create repository named: kronos-eam
# Set as private initially
```

### 2. Push Code to GitHub
```bash
cd /home/bloom/sentrics
git remote add origin https://github.com/YOUR_USERNAME/kronos-eam.git
git branch -M main
git push -u origin main
```

### 3. Create Google Cloud Service Account
```bash
# If you don't have a GCP project yet:
gcloud projects create YOUR_PROJECT_ID --name="Kronos EAM"

# Create service account with permissions:
cd /home/bloom/sentrics/deploy
./create-service-account.sh YOUR_PROJECT_ID
```

### 4. Set GitHub Secrets
Go to: https://github.com/YOUR_USERNAME/kronos-eam/settings/secrets/actions

Add these secrets:
- **GCP_PROJECT_ID**: Your Google Cloud project ID
- **GCP_SA_KEY**: Contents of ~/kronos-sa-key.json (entire JSON)
- **DB_PASSWORD**: KronosAdmin2024!

### 5. Enable Google Cloud APIs
```bash
cd /home/bloom/sentrics/deploy
./gcp-setup.sh
```

### 6. Trigger Deployment
The deployment will start automatically when you push to main branch.
Monitor progress at: https://github.com/YOUR_USERNAME/kronos-eam/actions

## Post-Deployment Verification

### Check Service URLs
After deployment completes, find your service URLs:
```bash
gcloud run services list
```

Expected services:
- kronos-backend (API)
- kronos-frontend (Web UI)

### Access the Application
1. Open the frontend URL in your browser
2. Login with: demo@kronos-eam.local / Demo2024!
3. Verify:
   - Language switching (IT/EN)
   - Plant Owner role is available
   - Plant management works
   - Portal links open correctly

### Monitor Logs
```bash
# Backend logs
gcloud run services logs read kronos-backend --limit=50

# Frontend logs
gcloud run services logs read kronos-frontend --limit=50
```

## Troubleshooting

### If deployment fails:
1. Check GitHub Actions logs for errors
2. Verify all secrets are set correctly
3. Ensure GCP APIs are enabled
4. Check service account permissions

### Common issues:
- **Build fails**: Check Docker configuration
- **Database connection fails**: Verify Cloud SQL is created
- **Authentication fails**: Check JWT secret configuration
- **Missing roles**: Verify migration ran successfully

## Support Resources
- Deployment Guide: `/DEPLOYMENT_GUIDE.md`
- Testing Guide: `/TESTING_GUIDE.md`
- GitHub Secrets Guide: `/GITHUB_SECRETS_GUIDE.md`
- Architecture Docs: `/docs/architecture.md`
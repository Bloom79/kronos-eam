# Kronos EAM React - Cloud Run Deployment Guide

## Project Information
- **Project ID**: `kronos-eam-react-prototype`
- **Project Number**: `378436084841`
- **Region**: `europe-west1`
- **Service Name**: `kronos-eam-react`

## Prerequisites

1. **Google Cloud SDK**: Install gcloud CLI
   ```bash
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL
   gcloud init
   ```

2. **Docker**: Ensure Docker is installed and running
3. **Node.js**: Version 18 or higher
4. **Google Cloud Project**: Access to `kronos-eam-react-prototype`

## Deployment Steps

### 1. Quick Deployment (Recommended)

Use the provided deployment script:

```bash
./deploy.sh
```

This script will:
- Build the React application
- Create a Docker image
- Push to Google Container Registry
- Deploy to Cloud Run

### 2. Manual Deployment

#### Step 1: Set Project
```bash
gcloud config set project kronos-eam-react-prototype
```

#### Step 2: Build React App
```bash
npm install
npm run build
```

#### Step 3: Build Docker Image
```bash
docker build -t gcr.io/kronos-eam-react-prototype/kronos-eam-react:latest .
```

#### Step 4: Configure Docker Authentication
```bash
gcloud auth configure-docker
```

#### Step 5: Push to Container Registry
```bash
docker push gcr.io/kronos-eam-react-prototype/kronos-eam-react:latest
```

#### Step 6: Deploy to Cloud Run
```bash
gcloud run deploy kronos-eam-react \
  --image gcr.io/kronos-eam-react-prototype/kronos-eam-react:latest \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --port 80 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --min-instances 0 \
  --set-env-vars "REACT_APP_API_URL=https://kronos-eam-api.a.run.app/api/v1,NODE_ENV=production"
```

### 3. Using Cloud Build (CI/CD)

Trigger automated builds by pushing to your repository:

```bash
gcloud builds submit --config cloudbuild.yaml
```

## Environment Variables

The following environment variables are configured:

- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_WEBSOCKET_URL`: WebSocket server URL
- `REACT_APP_RPA_PROXY_URL`: RPA proxy service URL
- `NODE_ENV`: Set to "production"

## Monitoring and Logs

### View Service Status
```bash
gcloud run services describe kronos-eam-react --region=europe-west1
```

### View Logs
```bash
gcloud logging read --project=kronos-eam-react-prototype \
  'resource.labels.service_name="kronos-eam-react"' \
  --limit=50
```

### Access Metrics
Visit: https://console.cloud.google.com/run/detail/europe-west1/kronos-eam-react/metrics?project=kronos-eam-react-prototype

## Troubleshooting

### Build Failures
1. Check Node.js version: `node --version` (should be 18+)
2. Clear npm cache: `npm cache clean --force`
3. Delete node_modules and reinstall: `rm -rf node_modules && npm install`

### Deployment Failures
1. Check project permissions: `gcloud projects get-iam-policy kronos-eam-react-prototype`
2. Ensure Cloud Run API is enabled: `gcloud services enable run.googleapis.com`
3. Check quota limits in Cloud Console

### Runtime Issues
1. Check Cloud Run logs for errors
2. Verify environment variables are set correctly
3. Ensure the backend API is accessible

## Security Considerations

1. **Authentication**: Currently set to allow unauthenticated access. For production, consider:
   - Identity-Aware Proxy (IAP)
   - Firebase Authentication
   - Custom authentication

2. **CORS**: Ensure backend API allows requests from Cloud Run domain

3. **Secrets**: Use Google Secret Manager for sensitive data:
   ```bash
   gcloud secrets create api-key --data-file=api-key.txt
   gcloud run services update kronos-eam-react \
     --set-secrets=REACT_APP_API_KEY=api-key:latest
   ```

## Custom Domain Setup

To use a custom domain:

1. Verify domain ownership in Google Cloud Console
2. Map domain to Cloud Run service:
   ```bash
   gcloud run domain-mappings create \
     --service=kronos-eam-react \
     --domain=app.kronos-eam.com \
     --region=europe-west1
   ```
3. Update DNS records as instructed

## Performance Optimization

1. **CDN**: Consider using Cloud CDN for static assets
2. **Caching**: Nginx configuration includes caching headers
3. **Compression**: Gzip is enabled in nginx.conf
4. **Build Optimization**: Production build is optimized with minification

## Rollback Procedure

To rollback to a previous version:

```bash
# List all revisions
gcloud run revisions list --service=kronos-eam-react --region=europe-west1

# Route traffic to previous revision
gcloud run services update-traffic kronos-eam-react \
  --to-revisions=kronos-eam-react-00001-abc=100 \
  --region=europe-west1
```

## Cost Optimization

1. Set appropriate CPU and memory limits
2. Configure minimum instances to 0 for dev/staging
3. Use Cloud Scheduler to warm up instances before peak hours
4. Monitor usage and adjust autoscaling parameters

## Support

For issues or questions:
- Check Cloud Run documentation: https://cloud.google.com/run/docs
- Review application logs in Cloud Console
- Contact the development team
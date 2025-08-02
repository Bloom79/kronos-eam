# 🚀 Kronos EAM React - Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Kronos EAM React application to Google Cloud Run.

**Project Details:**
- Project ID: `kronos-eam-react-prototype`
- Project Number: `378436084841`
- Service Name: `kronos-eam-react`
- Region: `europe-west1`

## Prerequisites

1. **Google Cloud SDK** installed and configured
2. **Docker** installed and running
3. **Node.js 18+** and npm
4. Access to the Google Cloud project
5. Billing enabled on the Google Cloud project

## Quick Start

### Option 1: Automated Deployment (Recommended)

```bash
# Run the deployment script
./deploy.sh
```

This will handle the entire deployment process automatically.

### Option 2: Step-by-Step Manual Deployment

```bash
# 1. Set up Google Cloud project
gcloud config set project kronos-eam-react-prototype

# 2. Enable required APIs
gcloud services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com

# 3. Build the React app
npm ci
npm run build

# 4. Build Docker image
docker build -t gcr.io/kronos-eam-react-prototype/kronos-eam-react:latest .

# 5. Configure Docker authentication
gcloud auth configure-docker

# 6. Push image to Container Registry
docker push gcr.io/kronos-eam-react-prototype/kronos-eam-react:latest

# 7. Deploy to Cloud Run
gcloud run deploy kronos-eam-react \
  --image gcr.io/kronos-eam-react-prototype/kronos-eam-react:latest \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --port 80 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --min-instances 0
```

### Option 3: CI/CD with Cloud Build

```bash
# Submit build using Cloud Build
gcloud builds submit --config cloudbuild.yaml
```

## Configuration Files

### Key Files Overview

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage build for production |
| `nginx.conf` | Nginx configuration with React Router support |
| `cloudbuild.yaml` | Automated CI/CD pipeline |
| `service.yaml` | Cloud Run service configuration |
| `.env.production` | Production environment variables |
| `deploy.sh` | Automated deployment script |
| `validate-deployment.sh` | Post-deployment validation |

### Environment Variables

The following environment variables are configured in production:

```bash
REACT_APP_API_URL=https://kronos-eam-api.a.run.app/api/v1
REACT_APP_WEBSOCKET_URL=wss://kronos-eam-api.a.run.app
REACT_APP_RPA_PROXY_URL=https://kronos-eam-api.a.run.app/api/rpa
NODE_ENV=production
```

## Post-Deployment

### 1. Validate Deployment

Run the validation script:

```bash
./validate-deployment.sh
```

### 2. Access the Application

Get the service URL:

```bash
gcloud run services describe kronos-eam-react --region=europe-west1 --format='value(status.url)'
```

### 3. Monitor the Application

View logs:
```bash
gcloud logging tail "resource.type=cloud_run_revision AND resource.labels.service_name=kronos-eam-react"
```

View metrics:
```bash
# Open in browser
https://console.cloud.google.com/run/detail/europe-west1/kronos-eam-react/metrics?project=kronos-eam-react-prototype
```

## Features Included

### Phase 1 RPA Implementation ✅
- Multi-portal authentication (GSE, Terna, DSO, Dogane)
- Task queuing and prioritization
- Secure credential management
- Real-time execution monitoring
- Browser-compatible crypto implementation

### UI Enhancements ✅
- Responsive design with Tailwind CSS
- Dark mode support
- Real-time notifications
- Interactive dashboards
- Multi-language support (Italian/English)

### Production Optimizations ✅
- Gzip compression
- Static asset caching
- Security headers
- Health check endpoint
- Error boundaries

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear cache and rebuild
   rm -rf node_modules build
   npm ci
   npm run build
   ```

2. **Docker Build Issues**
   ```bash
   # Build with no cache
   docker build --no-cache -t kronos-eam-react:test .
   ```

3. **Deployment Failures**
   - Check IAM permissions
   - Ensure APIs are enabled
   - Verify billing is active

### Debug Commands

```bash
# Check service status
gcloud run services describe kronos-eam-react --region=europe-west1

# View error logs
gcloud logging read "severity>=ERROR" --limit=50

# Check quotas
gcloud compute project-info describe --project=kronos-eam-react-prototype
```

## Security Best Practices

1. **Authentication**: Currently allows unauthenticated access. For production, implement:
   - Identity-Aware Proxy (IAP)
   - Firebase Authentication
   - Custom JWT authentication

2. **Secrets Management**:
   ```bash
   # Use Secret Manager for sensitive data
   gcloud secrets create api-key --data-file=api-key.txt
   ```

3. **Network Security**:
   - Configure Cloud Armor for DDoS protection
   - Set up Cloud CDN for global distribution
   - Implement rate limiting

## Cost Optimization

1. Set minimum instances to 0 for development
2. Use Cloud Scheduler to warm up instances
3. Monitor usage and adjust limits:
   ```bash
   gcloud run services update kronos-eam-react \
     --min-instances=0 \
     --max-instances=5 \
     --region=europe-west1
   ```

## Maintenance

### Update Application

```bash
# 1. Make changes and test locally
# 2. Build new image
docker build -t gcr.io/kronos-eam-react-prototype/kronos-eam-react:v2 .

# 3. Push to registry
docker push gcr.io/kronos-eam-react-prototype/kronos-eam-react:v2

# 4. Deploy new version
gcloud run deploy kronos-eam-react \
  --image gcr.io/kronos-eam-react-prototype/kronos-eam-react:v2 \
  --region=europe-west1
```

### Rollback

```bash
# List revisions
gcloud run revisions list --service=kronos-eam-react --region=europe-west1

# Rollback to previous
gcloud run services update-traffic kronos-eam-react \
  --to-revisions=kronos-eam-react-00001-abc=100 \
  --region=europe-west1
```

## Support

- **Documentation**: See `/docs` folder
- **Cloud Run Issues**: [Cloud Run Documentation](https://cloud.google.com/run/docs)
- **React Issues**: Check browser console and application logs
- **Infrastructure**: Google Cloud Console

---

Last Updated: July 2024
Version: 1.0.0
# Kronos EAM React - Production Deployment Checklist

## Pre-Deployment Checklist

### ✅ Code Quality
- [ ] All TypeScript errors resolved
- [ ] ESLint warnings reviewed and acceptable
- [ ] No console.log statements in production code
- [ ] Error boundaries implemented for critical components
- [ ] Loading states implemented for async operations

### ✅ Security
- [ ] Environment variables properly configured
- [ ] API keys not exposed in client code
- [ ] CORS properly configured on backend
- [ ] Content Security Policy headers set in nginx.conf
- [ ] HTTPS enforced on all endpoints
- [ ] Authentication mechanism in place (if required)

### ✅ Performance
- [ ] Production build optimized (`npm run build`)
- [ ] Source maps disabled in production
- [ ] Images optimized and lazy loaded
- [ ] Code splitting implemented for large components
- [ ] Bundle size analyzed and optimized
- [ ] Gzip compression enabled in nginx

### ✅ Configuration
- [ ] `.env.production` contains correct API URLs
- [ ] `nginx.conf` properly configured for React Router
- [ ] Docker image tested locally
- [ ] Health check endpoint working (`/health`)
- [ ] Error pages configured (404, 500)

### ✅ Infrastructure
- [ ] Google Cloud project configured
- [ ] Cloud Run service created
- [ ] Container Registry enabled
- [ ] Proper IAM permissions set
- [ ] Resource limits configured (CPU, Memory)
- [ ] Autoscaling parameters set

## Deployment Steps

### 1. Final Build Check
```bash
# Clean install and build
rm -rf node_modules
npm ci
npm run build

# Test the build locally
npx serve -s build -l 3000
```

### 2. Docker Build & Test
```bash
# Build Docker image
docker build -t kronos-eam-react:test .

# Test locally
docker run -p 8080:80 kronos-eam-react:test

# Check health endpoint
curl http://localhost:8080/health
```

### 3. Deploy to Cloud Run
```bash
# Set project
gcloud config set project kronos-eam-react-prototype

# Build and push image
docker build -t gcr.io/kronos-eam-react-prototype/kronos-eam-react:latest .
docker push gcr.io/kronos-eam-react-prototype/kronos-eam-react:latest

# Deploy
gcloud run deploy kronos-eam-react \
  --image gcr.io/kronos-eam-react-prototype/kronos-eam-react:latest \
  --region europe-west1 \
  --platform managed
```

## Post-Deployment Verification

### ✅ Functional Testing
- [ ] Application loads correctly
- [ ] Navigation works (all routes)
- [ ] API connections established
- [ ] WebSocket connections working (if applicable)
- [ ] Forms submit correctly
- [ ] Error handling works as expected

### ✅ Performance Testing
- [ ] Page load time < 3 seconds
- [ ] Time to Interactive < 5 seconds
- [ ] No memory leaks detected
- [ ] API response times acceptable

### ✅ Monitoring Setup
- [ ] Cloud Run metrics enabled
- [ ] Error logging configured
- [ ] Alerts set up for failures
- [ ] Uptime monitoring configured

## Rollback Plan

If issues are detected after deployment:

1. **Immediate Rollback**
   ```bash
   # List revisions
   gcloud run revisions list --service=kronos-eam-react --region=europe-west1
   
   # Route traffic to previous revision
   gcloud run services update-traffic kronos-eam-react \
     --to-revisions=PREVIOUS_REVISION=100 \
     --region=europe-west1
   ```

2. **Debug Issues**
   - Check Cloud Run logs
   - Review error reports
   - Analyze metrics

3. **Fix and Redeploy**
   - Fix identified issues
   - Test thoroughly locally
   - Deploy to staging first (if available)
   - Deploy to production

## Important URLs

- **Production App**: https://kronos-eam-react-[hash].a.run.app
- **Cloud Console**: https://console.cloud.google.com/run?project=kronos-eam-react-prototype
- **Container Registry**: https://console.cloud.google.com/gcr/images/kronos-eam-react-prototype
- **Cloud Build History**: https://console.cloud.google.com/cloud-build/builds?project=kronos-eam-react-prototype

## Support Contacts

- **Cloud Run Issues**: Google Cloud Support
- **Application Issues**: Development Team
- **Security Issues**: Security Team (IMMEDIATE)

## Notes

- Keep this checklist updated with any new requirements
- Document any deployment issues and resolutions
- Review and update deployment procedures quarterly
# Kronos EAM - Complete Deployment Guide

This guide provides step-by-step instructions for deploying Kronos EAM using GitHub Actions and Google Cloud Platform.

## Prerequisites

1. **GitHub Account** with a repository for the project
2. **Google Cloud Account** with billing enabled
3. **Local tools installed**:
   - Git
   - Google Cloud SDK (`gcloud`)
   - Docker (optional, for local testing)

## Step 1: Set Up GitHub Repository

### 1.1 Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `kronos-eam` (or your preferred name)
3. Keep it private initially
4. Do NOT initialize with README (we'll push our code)

### 1.2 Push Code to GitHub

```bash
# Navigate to project root
cd /home/bloom/sentrics

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Kronos EAM platform"

# Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/kronos-eam.git

# Push to GitHub
git push -u origin main
```

## Step 2: Set Up Google Cloud Project

### 2.1 Create GCP Project

```bash
# Set your project ID (must be globally unique)
export PROJECT_ID="kronos-eam-prod-$(date +%s)"

# Create project
gcloud projects create $PROJECT_ID --name="Kronos EAM"

# Set as current project
gcloud config set project $PROJECT_ID

# Link billing account (replace BILLING_ACCOUNT_ID)
gcloud beta billing projects link $PROJECT_ID \
  --billing-account=BILLING_ACCOUNT_ID
```

### 2.2 Enable Required APIs

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com \
  artifactregistry.googleapis.com \
  compute.googleapis.com
```

### 2.3 Create Service Account for GitHub Actions

```bash
# Create service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Deploy"

# Grant necessary roles
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/cloudsql.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/cloudbuild.builds.editor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Create and download key
gcloud iam service-accounts keys create ~/github-actions-key.json \
  --iam-account=github-actions@${PROJECT_ID}.iam.gserviceaccount.com
```

## Step 3: Configure GitHub Secrets

### 3.1 Add Secrets to GitHub

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Add the following secrets:

#### GCP_PROJECT_ID
```
Value: Your GCP project ID (echo $PROJECT_ID)
```

#### GCP_SA_KEY
```bash
# Copy the entire content of the service account key
cat ~/github-actions-key.json
# Paste this JSON content as the secret value
```

#### DB_PASSWORD
```
Value: KronosAdmin2024!
```

### 3.2 (Optional) Additional Secrets

If you want to use external services, add these:

#### OPENAI_API_KEY
```
Value: Your OpenAI API key (if using AI features)
```

#### SMTP_PASSWORD
```
Value: Your SMTP password (for email notifications)
```

## Step 4: Initialize GCP Infrastructure

### 4.1 Run Setup Script

```bash
# Clone your GitHub repository
git clone https://github.com/YOUR_USERNAME/kronos-eam.git
cd kronos-eam/deploy

# Make scripts executable
chmod +x *.sh

# Set environment variables
export GCP_PROJECT_ID=$PROJECT_ID
export GCP_REGION="europe-west1"

# Run setup (this creates all GCP resources)
./gcp-setup.sh
```

This script will:
- Create Artifact Registry for Docker images
- Set up Cloud SQL PostgreSQL instance
- Create Redis instance
- Configure Secret Manager
- Create service accounts
- Set up initial database schema

### 4.2 Verify Setup

```bash
# Check Cloud SQL
gcloud sql instances list

# Check Cloud Run services (should be empty initially)
gcloud run services list --region=europe-west1

# Check Artifact Registry
gcloud artifacts repositories list --location=europe-west1
```

## Step 5: Deploy via GitHub Actions

### 5.1 Trigger Initial Deployment

```bash
# Make a small change to trigger deployment
echo "# Deployed on $(date)" >> README.md
git add README.md
git commit -m "Trigger initial deployment"
git push origin main
```

### 5.2 Monitor Deployment

1. Go to your GitHub repository
2. Click on "Actions" tab
3. Watch the "Deploy to Google Cloud Run" workflow
4. It should take about 10-15 minutes for first deployment

### 5.3 Get Application URLs

Once deployment completes:

```bash
# Get frontend URL
gcloud run services describe kronos-frontend \
  --region=europe-west1 \
  --format='value(status.url)'

# Get backend URL
gcloud run services describe kronos-backend \
  --region=europe-west1 \
  --format='value(status.url)'
```

## Step 6: Post-Deployment Configuration

### 6.1 Update DNS (Optional)

If you have a custom domain:

```bash
# Map domain to Cloud Run
gcloud beta run domain-mappings create \
  --service=kronos-frontend \
  --domain=app.your-domain.com \
  --region=europe-west1
```

### 6.2 Configure SSL Certificate

Cloud Run automatically provides SSL certificates for the generated URLs. For custom domains, follow the domain mapping instructions.

### 6.3 Set Up Monitoring

```bash
# Create uptime checks
gcloud monitoring uptime-checks create kronos-frontend \
  --display-name="Kronos Frontend" \
  --uri=$(gcloud run services describe kronos-frontend --region=europe-west1 --format='value(status.url)')/health

gcloud monitoring uptime-checks create kronos-backend \
  --display-name="Kronos Backend" \
  --uri=$(gcloud run services describe kronos-backend --region=europe-west1 --format='value(status.url)')/health
```

## Step 7: Testing the Deployment

### 7.1 Access the Application

1. Open the frontend URL in your browser
2. Login with demo credentials:
   - Email: `demo@kronos-eam.local`
   - Password: `demo123`

### 7.2 Verify API

```bash
# Test API endpoint
BACKEND_URL=$(gcloud run services describe kronos-backend --region=europe-west1 --format='value(status.url)')
curl $BACKEND_URL/health
```

### 7.3 Check Logs

```bash
# View frontend logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=kronos-frontend" --limit=50

# View backend logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=kronos-backend" --limit=50
```

## Continuous Deployment

### Automatic Deployments

Every push to the `main` branch will trigger automatic deployment:

```bash
# Make changes
git add .
git commit -m "Update feature X"
git push origin main
```

### Pull Request Previews

Pull requests will run tests but won't deploy. To test changes:

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and push
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# Create PR on GitHub
```

### Manual Deployment

To manually trigger deployment:

1. Go to Actions tab on GitHub
2. Select "Deploy to Google Cloud Run"
3. Click "Run workflow"
4. Select branch and click "Run workflow"

## Cost Management

### Estimated Monthly Costs

- Cloud Run: ~$5-10 (with minimal traffic)
- Cloud SQL (db-f1-micro): ~$10
- Redis (1GB basic): ~$35
- Storage & Network: ~$5

**Total: ~$55-65/month** for minimal production setup

### Cost Optimization

```bash
# Scale down when not in use
gcloud run services update kronos-frontend --min-instances=0 --region=europe-west1
gcloud run services update kronos-backend --min-instances=0 --region=europe-west1

# Stop Cloud SQL when not needed
gcloud sql instances patch kronos-db --activation-policy=NEVER
```

## Troubleshooting

### Common Issues

#### 1. Permission Denied Errors
```bash
# Grant Cloud Build permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/run.admin"
```

#### 2. Database Connection Issues
```bash
# Check Cloud SQL proxy
gcloud sql instances describe kronos-db

# Test connection
gcloud sql connect kronos-db --user=postgres
```

#### 3. Build Failures
```bash
# Check Cloud Build logs
gcloud builds list --limit=5
gcloud builds log BUILD_ID
```

### Getting Help

1. Check GitHub Actions logs for detailed error messages
2. Review Cloud Build logs in GCP Console
3. Check application logs using `gcloud logging`
4. Create an issue on GitHub with error details

## Security Best Practices

1. **Change default passwords** immediately after deployment
2. **Enable Cloud Armor** for DDoS protection
3. **Set up Cloud IAP** for internal access only
4. **Configure VPC** for database access
5. **Enable audit logging** for compliance

## Next Steps

1. **Set up staging environment** by creating a separate GCP project
2. **Configure backup automation** for Cloud SQL
3. **Implement monitoring dashboards** in Cloud Monitoring
4. **Set up alerts** for critical issues
5. **Document your specific configuration** changes

---

**Need Help?** Create an issue on GitHub or check the [troubleshooting guide](docs/troubleshooting.md).
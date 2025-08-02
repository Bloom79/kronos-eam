#!/bin/bash
#
# Google Cloud Platform Setup Script for Kronos EAM
# This script sets up all necessary GCP resources from scratch
#

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID=${GCP_PROJECT_ID:-"kronos-eam-prod"}
REGION=${GCP_REGION:-"europe-west1"}
ZONE=${GCP_ZONE:-"europe-west1-b"}
BACKEND_SERVICE_NAME="kronos-backend"
FRONTEND_SERVICE_NAME="kronos-frontend"
SQL_INSTANCE_NAME="kronos-db"
BUCKET_NAME="${PROJECT_ID}-storage"

echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}Kronos EAM - GCP Setup Script${NC}"
echo -e "${GREEN}======================================${NC}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Function to check if user wants to proceed
confirm() {
    read -p "$1 (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Setup cancelled.${NC}"
        exit 1
    fi
}

# 1. Authenticate and set project
echo -e "\n${YELLOW}Step 1: Setting up GCP project${NC}"
echo "Current project: $(gcloud config get-value project)"
confirm "Do you want to create/use project ${PROJECT_ID}?"

# Check if project exists
if ! gcloud projects describe ${PROJECT_ID} &>/dev/null; then
    echo "Creating new project ${PROJECT_ID}..."
    gcloud projects create ${PROJECT_ID} --name="Kronos EAM"
fi

gcloud config set project ${PROJECT_ID}

# 2. Enable required APIs
echo -e "\n${YELLOW}Step 2: Enabling required APIs${NC}"
gcloud services enable \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    sqladmin.googleapis.com \
    secretmanager.googleapis.com \
    cloudresourcemanager.googleapis.com \
    compute.googleapis.com \
    servicenetworking.googleapis.com \
    redis.googleapis.com \
    monitoring.googleapis.com \
    logging.googleapis.com

# 3. Create Cloud Storage bucket
echo -e "\n${YELLOW}Step 3: Creating Cloud Storage bucket${NC}"
if ! gsutil ls -b gs://${BUCKET_NAME} &>/dev/null; then
    gsutil mb -p ${PROJECT_ID} -l ${REGION} gs://${BUCKET_NAME}
    gsutil iam ch allUsers:objectViewer gs://${BUCKET_NAME}
else
    echo "Bucket ${BUCKET_NAME} already exists"
fi

# 4. Create Cloud SQL instance
echo -e "\n${YELLOW}Step 4: Setting up Cloud SQL (PostgreSQL)${NC}"
if ! gcloud sql instances describe ${SQL_INSTANCE_NAME} &>/dev/null; then
    echo "Creating Cloud SQL instance..."
    gcloud sql instances create ${SQL_INSTANCE_NAME} \
        --database-version=POSTGRES_14 \
        --tier=db-f1-micro \
        --region=${REGION} \
        --network=default \
        --no-assign-ip \
        --backup-start-time=03:00 \
        --backup \
        --maintenance-window-day=SUN \
        --maintenance-window-hour=4 \
        --database-flags=max_connections=100
        
    # Create database
    gcloud sql databases create kronos_eam \
        --instance=${SQL_INSTANCE_NAME}
        
    # Set root password
    gcloud sql users set-password postgres \
        --instance=${SQL_INSTANCE_NAME} \
        --password=KronosAdmin2024!
else
    echo "Cloud SQL instance ${SQL_INSTANCE_NAME} already exists"
fi

# 5. Create Redis instance
echo -e "\n${YELLOW}Step 5: Setting up Redis${NC}"
if ! gcloud redis instances describe kronos-redis --region=${REGION} &>/dev/null; then
    echo "Creating Redis instance..."
    gcloud redis instances create kronos-redis \
        --size=1 \
        --region=${REGION} \
        --redis-version=redis_6_x \
        --tier=basic
else
    echo "Redis instance already exists"
fi

# 6. Set up Secret Manager
echo -e "\n${YELLOW}Step 6: Setting up secrets${NC}"

# Function to create or update secret
create_secret() {
    SECRET_NAME=$1
    SECRET_VALUE=$2
    
    if gcloud secrets describe ${SECRET_NAME} &>/dev/null; then
        echo "Updating secret ${SECRET_NAME}..."
        echo -n "${SECRET_VALUE}" | gcloud secrets versions add ${SECRET_NAME} --data-file=-
    else
        echo "Creating secret ${SECRET_NAME}..."
        echo -n "${SECRET_VALUE}" | gcloud secrets create ${SECRET_NAME} --data-file=-
    fi
}

# Create secrets
create_secret "db-password" "KronosAdmin2024!"
create_secret "jwt-secret" "$(openssl rand -base64 32)"
create_secret "redis-password" "$(openssl rand -base64 32)"

# 7. Create service accounts
echo -e "\n${YELLOW}Step 7: Creating service accounts${NC}"

# Deployment service account (for GitHub Actions)
if ! gcloud iam service-accounts describe kronos-deploy@${PROJECT_ID}.iam.gserviceaccount.com &>/dev/null; then
    gcloud iam service-accounts create kronos-deploy \
        --display-name="Kronos Deployment Service Account"
fi

# Backend service account
if ! gcloud iam service-accounts describe kronos-backend@${PROJECT_ID}.iam.gserviceaccount.com &>/dev/null; then
    gcloud iam service-accounts create kronos-backend \
        --display-name="Kronos Backend Service Account"
fi

# Frontend service account
if ! gcloud iam service-accounts describe kronos-frontend@${PROJECT_ID}.iam.gserviceaccount.com &>/dev/null; then
    gcloud iam service-accounts create kronos-frontend \
        --display-name="Kronos Frontend Service Account"
fi

# Grant deployment service account permissions
echo "Granting deployment service account permissions..."

# Grant Cloud Run Admin to deployment service account
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:kronos-deploy@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/run.admin"

# Grant Storage Admin for artifact registry
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:kronos-deploy@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

# Grant Artifact Registry Admin
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:kronos-deploy@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/artifactregistry.admin"

# Grant Cloud SQL Admin for database management
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:kronos-deploy@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/cloudsql.admin"

# CRITICAL: Grant deployment service account permission to act as other service accounts
echo "Granting service account user permissions..."

gcloud iam service-accounts add-iam-policy-binding \
    kronos-backend@${PROJECT_ID}.iam.gserviceaccount.com \
    --member="serviceAccount:kronos-deploy@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser" \
    --project=${PROJECT_ID}

gcloud iam service-accounts add-iam-policy-binding \
    kronos-frontend@${PROJECT_ID}.iam.gserviceaccount.com \
    --member="serviceAccount:kronos-deploy@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser" \
    --project=${PROJECT_ID}

# Grant backend service account permissions
echo "Granting backend service account permissions..."

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:kronos-backend@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:kronos-backend@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:kronos-backend@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/redis.editor"

# Grant specific secret permissions
echo "Granting access to individual secrets..."
for secret in jwt-secret redis-password db-password; do
    gcloud secrets add-iam-policy-binding $secret \
        --member="serviceAccount:kronos-backend@${PROJECT_ID}.iam.gserviceaccount.com" \
        --role="roles/secretmanager.secretAccessor" \
        --project=${PROJECT_ID} 2>/dev/null || true
done

# 8. Create Artifact Registry repositories
echo -e "\n${YELLOW}Step 8: Creating Artifact Registry repositories${NC}"
if ! gcloud artifacts repositories describe kronos-eam --location=${REGION} &>/dev/null; then
    gcloud artifacts repositories create kronos-eam \
        --repository-format=docker \
        --location=${REGION} \
        --description="Docker images for Kronos EAM"
fi

# 9. Build and deploy backend
echo -e "\n${YELLOW}Step 9: Building and deploying backend${NC}"
cd ../kronos-eam-backend

# Create Cloud Build configuration
cat > cloudbuild.yaml << EOF
steps:
  # Build the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', '${REGION}-docker.pkg.dev/${PROJECT_ID}/kronos-eam/backend:latest', '.']
  
  # Push the container image to Artifact Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', '${REGION}-docker.pkg.dev/${PROJECT_ID}/kronos-eam/backend:latest']
  
  # Deploy to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - '${BACKEND_SERVICE_NAME}'
      - '--image'
      - '${REGION}-docker.pkg.dev/${PROJECT_ID}/kronos-eam/backend:latest'
      - '--region'
      - '${REGION}'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'
      - '--set-env-vars'
      - 'DATABASE_URL=postgresql://postgres:KronosAdmin2024!@/kronos_eam?host=/cloudsql/${PROJECT_ID}:${REGION}:${SQL_INSTANCE_NAME}'
      - '--set-secrets'
      - 'SECRET_KEY=jwt-secret:latest,REDIS_PASSWORD=redis-password:latest'
      - '--add-cloudsql-instances'
      - '${PROJECT_ID}:${REGION}:${SQL_INSTANCE_NAME}'
      - '--service-account'
      - 'kronos-backend@${PROJECT_ID}.iam.gserviceaccount.com'
      - '--memory'
      - '512Mi'
      - '--cpu'
      - '1'
      - '--min-instances'
      - '1'
      - '--max-instances'
      - '10'
      - '--port'
      - '8000'

images:
  - '${REGION}-docker.pkg.dev/${PROJECT_ID}/kronos-eam/backend:latest'
EOF

# Submit build
gcloud builds submit --config=cloudbuild.yaml .

# 10. Build and deploy frontend
echo -e "\n${YELLOW}Step 10: Building and deploying frontend${NC}"
cd ../kronos-eam-react

# Get backend URL
BACKEND_URL=$(gcloud run services describe ${BACKEND_SERVICE_NAME} --region=${REGION} --format='value(status.url)')

# Create Cloud Build configuration for frontend
cat > cloudbuild.yaml << EOF
steps:
  # Build the container image with backend URL
  - name: 'gcr.io/cloud-builders/docker'
    args: 
      - 'build'
      - '--build-arg'
      - 'REACT_APP_API_URL=${BACKEND_URL}/api/v1'
      - '-t'
      - '${REGION}-docker.pkg.dev/${PROJECT_ID}/kronos-eam/frontend:latest'
      - '.'
  
  # Push the container image to Artifact Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', '${REGION}-docker.pkg.dev/${PROJECT_ID}/kronos-docker/frontend:latest']
  
  # Deploy to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - '${FRONTEND_SERVICE_NAME}'
      - '--image'
      - '${REGION}-docker.pkg.dev/${PROJECT_ID}/kronos-eam/frontend:latest'
      - '--region'
      - '${REGION}'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'
      - '--service-account'
      - 'kronos-frontend@${PROJECT_ID}.iam.gserviceaccount.com'
      - '--memory'
      - '256Mi'
      - '--cpu'
      - '1'
      - '--min-instances'
      - '1'
      - '--max-instances'
      - '10'
      - '--port'
      - '80'

images:
  - '${REGION}-docker.pkg.dev/${PROJECT_ID}/kronos-eam/frontend:latest'
EOF

# Submit build
gcloud builds submit --config=cloudbuild.yaml .

# 11. Generate service account key for GitHub Actions
echo -e "\n${YELLOW}Step 11: Generating service account key for GitHub Actions${NC}"
echo "Creating service account key for kronos-deploy..."

# Create the key
gcloud iam service-accounts keys create ~/kronos-deploy-key.json \
    --iam-account=kronos-deploy@${PROJECT_ID}.iam.gserviceaccount.com

echo -e "${GREEN}Service account key saved to: ~/kronos-deploy-key.json${NC}"
echo -e "${YELLOW}IMPORTANT: Add this key to GitHub Secrets as GCP_SA_KEY${NC}"
echo "1. Copy the contents: cat ~/kronos-deploy-key.json"
echo "2. Go to GitHub repository settings > Secrets"
echo "3. Add new secret named GCP_SA_KEY with the JSON contents"

# 12. Database initialization
echo -e "\n${YELLOW}Step 12: Database initialization${NC}"
echo "Database will be initialized automatically when the backend service starts"
echo "The entrypoint script will run Alembic migrations and load initial data"

# 13. Get service URLs
echo -e "\n${GREEN}======================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}======================================${NC}"

FRONTEND_URL=$(gcloud run services describe ${FRONTEND_SERVICE_NAME} --region=${REGION} --format='value(status.url)')

echo -e "\n${YELLOW}Service URLs:${NC}"
echo -e "Frontend: ${GREEN}${FRONTEND_URL}${NC}"
echo -e "Backend API: ${GREEN}${BACKEND_URL}${NC}"

echo -e "\n${YELLOW}Demo Credentials:${NC}"
echo -e "Email: ${GREEN}demo@kronos-eam.local${NC}"
echo -e "Password: ${GREEN}demo123${NC}"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo "1. Visit the frontend URL to access the application"
echo "2. Use ./manage-services.sh to start/stop services"
echo "3. Check ./monitoring-setup.sh to set up monitoring"

echo -e "\n${GREEN}Setup completed successfully!${NC}"
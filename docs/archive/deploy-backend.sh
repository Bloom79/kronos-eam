#!/bin/bash

# Kronos EAM Backend - Cloud Run Deployment Script

set -e

# Configuration
PROJECT_ID="kronos-eam-react-prototype"
REGION="europe-west1"
SERVICE_NAME="kronos-eam-api"
IMAGE_NAME="gcr.io/${PROJECT_ID}/kronos-eam-backend"
CLOUD_SQL_INSTANCE="${PROJECT_ID}:${REGION}:kronos-eam-db"

echo "🚀 Starting deployment for Kronos EAM Backend..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed. Please install it first."
    exit 1
fi

# Set the project
echo "📋 Setting project to ${PROJECT_ID}..."
gcloud config set project ${PROJECT_ID}

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    containerregistry.googleapis.com \
    sqladmin.googleapis.com \
    redis.googleapis.com \
    secretmanager.googleapis.com \
    compute.googleapis.com

# Create service account if it doesn't exist
echo "👤 Setting up service account..."
if ! gcloud iam service-accounts describe kronos-eam-backend@${PROJECT_ID}.iam.gserviceaccount.com &>/dev/null; then
    gcloud iam service-accounts create kronos-eam-backend \
        --display-name="Kronos EAM Backend Service Account"
fi

# Grant necessary permissions
echo "🔐 Configuring IAM permissions..."
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:kronos-eam-backend@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:kronos-eam-backend@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

# Create Cloud SQL instance if it doesn't exist
echo "🗄️ Setting up Cloud SQL instance..."
if ! gcloud sql instances describe kronos-eam-db &>/dev/null; then
    gcloud sql instances create kronos-eam-db \
        --database-version=POSTGRES_15 \
        --tier=db-g1-small \
        --region=${REGION} \
        --network=default \
        --no-assign-ip \
        --backup \
        --backup-start-time=03:00
fi

# Create database if it doesn't exist
echo "📊 Creating database..."
gcloud sql databases create kronos_eam \
    --instance=kronos-eam-db || true

# Create database user
echo "👤 Creating database user..."
gcloud sql users create kronos \
    --instance=kronos-eam-db \
    --password=your-secure-password || true

# Create Redis instance if it doesn't exist
echo "🔴 Setting up Redis instance..."
if ! gcloud redis instances describe kronos-eam-redis --region=${REGION} &>/dev/null; then
    gcloud redis instances create kronos-eam-redis \
        --size=1 \
        --region=${REGION} \
        --redis-version=redis_6_x \
        --network=default
fi

# Get Redis host
REDIS_HOST=$(gcloud redis instances describe kronos-eam-redis --region=${REGION} --format="get(host)")

# Create secrets
echo "🔒 Creating secrets in Secret Manager..."
# Database URL
echo "postgresql://kronos:your-secure-password@/kronos_eam?host=/cloudsql/${CLOUD_SQL_INSTANCE}" | \
    gcloud secrets create database-url --data-file=- || \
    echo "postgresql://kronos:your-secure-password@/kronos_eam?host=/cloudsql/${CLOUD_SQL_INSTANCE}" | \
    gcloud secrets versions add database-url --data-file=-

# Redis URL
echo "redis://${REDIS_HOST}:6379/0" | \
    gcloud secrets create redis-url --data-file=- || \
    echo "redis://${REDIS_HOST}:6379/0" | \
    gcloud secrets versions add redis-url --data-file=-

# JWT Secret
python3 -c "import secrets; print(secrets.token_urlsafe(32))" | \
    gcloud secrets create jwt-secret --data-file=- || true

# API Keys (placeholders - replace with actual values)
echo "your-openai-api-key" | \
    gcloud secrets create openai-api-key --data-file=- || true

echo "your-anthropic-api-key" | \
    gcloud secrets create anthropic-api-key --data-file=- || true

echo "your-google-api-key" | \
    gcloud secrets create google-api-key --data-file=- || true

# Build and deploy using Cloud Build
echo "🏗️ Building and deploying with Cloud Build..."
cd kronos-eam-backend

# Submit build
gcloud builds submit \
    --config=cloudbuild.yaml \
    --substitutions=_DATABASE_URL="postgresql://kronos:your-secure-password@/kronos_eam?host=/cloudsql/${CLOUD_SQL_INSTANCE}",_REDIS_URL="redis://${REDIS_HOST}:6379/0",_CLOUD_SQL_INSTANCE="${CLOUD_SQL_INSTANCE}"

# Get the service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format='value(status.url)')

echo "✅ Backend deployment complete!"
echo "🌐 Your API is available at: ${SERVICE_URL}"
echo ""
echo "📊 View logs with: gcloud logging read --project=${PROJECT_ID} 'resource.labels.service_name=\"${SERVICE_NAME}\"' --limit=50"
echo "📈 View metrics at: https://console.cloud.google.com/run/detail/${REGION}/${SERVICE_NAME}/metrics?project=${PROJECT_ID}"
echo ""
echo "⚠️  Important: Update the frontend environment variables with the new API URL: ${SERVICE_URL}"
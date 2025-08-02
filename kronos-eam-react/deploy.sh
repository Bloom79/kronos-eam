#!/bin/bash

# Kronos EAM React - Cloud Run Deployment Script

set -e

# Configuration
PROJECT_ID="kronos-eam-react-prototype"
REGION="europe-west1"
SERVICE_NAME="kronos-eam-react"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "🚀 Starting deployment for Kronos EAM React..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed. Please install it first."
    exit 1
fi

# Set the project
echo "📋 Setting project to ${PROJECT_ID}..."
gcloud config set project ${PROJECT_ID}

# Build the React app
echo "🔨 Building React application..."
npm run build

# Build Docker image
echo "🐳 Building Docker image..."
docker build -t ${IMAGE_NAME}:latest .

# Tag with commit SHA if git is available
if command -v git &> /dev/null && git rev-parse --git-dir > /dev/null 2>&1; then
    COMMIT_SHA=$(git rev-parse --short HEAD)
    docker tag ${IMAGE_NAME}:latest ${IMAGE_NAME}:${COMMIT_SHA}
    echo "✅ Tagged image with commit SHA: ${COMMIT_SHA}"
fi

# Configure Docker for GCR
echo "🔐 Configuring Docker authentication for GCR..."
gcloud auth configure-docker

# Push to Container Registry
echo "📤 Pushing image to Container Registry..."
docker push ${IMAGE_NAME}:latest
if [ ! -z "$COMMIT_SHA" ]; then
    docker push ${IMAGE_NAME}:${COMMIT_SHA}
fi

# Deploy to Cloud Run
echo "☁️ Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
    --image ${IMAGE_NAME}:latest \
    --platform managed \
    --region ${REGION} \
    --allow-unauthenticated \
    --port 80 \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 10 \
    --min-instances 0 \
    --set-env-vars "REACT_APP_API_URL=https://kronos-eam-api.a.run.app/api/v1,REACT_APP_WEBSOCKET_URL=wss://kronos-eam-api.a.run.app,NODE_ENV=production"

# Get the service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format='value(status.url)')

echo "✅ Deployment complete!"
echo "🌐 Your app is available at: ${SERVICE_URL}"
echo ""
echo "📊 View logs with: gcloud logging read --project=${PROJECT_ID} 'resource.labels.service_name=\"${SERVICE_NAME}\"' --limit=50"
echo "📈 View metrics at: https://console.cloud.google.com/run/detail/${REGION}/${SERVICE_NAME}/metrics?project=${PROJECT_ID}"
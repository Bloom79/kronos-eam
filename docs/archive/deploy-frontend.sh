#!/bin/bash

# Kronos EAM Frontend - Cloud Run Deployment Script with Updated Backend URL

set -e

# Configuration
PROJECT_ID="kronos-eam-react-prototype"
REGION="europe-west1"
BACKEND_SERVICE_NAME="kronos-eam-api"
FRONTEND_SERVICE_NAME="kronos-eam-react"

echo "🚀 Starting deployment for Kronos EAM Frontend..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed. Please install it first."
    exit 1
fi

# Set the project
echo "📋 Setting project to ${PROJECT_ID}..."
gcloud config set project ${PROJECT_ID}

# Get backend URL
echo "🔍 Getting backend API URL..."
BACKEND_URL=$(gcloud run services describe ${BACKEND_SERVICE_NAME} --region=${REGION} --format='value(status.url)')

if [ -z "$BACKEND_URL" ]; then
    echo "❌ Backend service not found. Please deploy the backend first."
    exit 1
fi

echo "✅ Found backend URL: ${BACKEND_URL}"

# Update frontend environment variables
echo "📝 Updating frontend environment configuration..."
cd kronos-eam-react

# Create .env.production file
cat > .env.production << EOF
REACT_APP_API_URL=${BACKEND_URL}/api/v1
REACT_APP_WEBSOCKET_URL=${BACKEND_URL/https/wss}
REACT_APP_RPA_PROXY_URL=${BACKEND_URL}/api/rpa
NODE_ENV=production
EOF

# Update cloudbuild.yaml with correct backend URL
sed -i "s|REACT_APP_API_URL=.*|REACT_APP_API_URL=${BACKEND_URL}/api/v1|g" cloudbuild.yaml

# Build and deploy using Cloud Build
echo "🏗️ Building and deploying with Cloud Build..."
gcloud builds submit --config=cloudbuild.yaml

# Get the service URL
SERVICE_URL=$(gcloud run services describe ${FRONTEND_SERVICE_NAME} --region=${REGION} --format='value(status.url)')

echo "✅ Frontend deployment complete!"
echo "🌐 Your app is available at: ${SERVICE_URL}"
echo ""
echo "📊 Backend API: ${BACKEND_URL}"
echo "🖥️  Frontend App: ${SERVICE_URL}"
echo ""
echo "📊 View frontend logs: gcloud logging read --project=${PROJECT_ID} 'resource.labels.service_name=\"${FRONTEND_SERVICE_NAME}\"' --limit=50"
echo "📊 View backend logs: gcloud logging read --project=${PROJECT_ID} 'resource.labels.service_name=\"${BACKEND_SERVICE_NAME}\"' --limit=50"
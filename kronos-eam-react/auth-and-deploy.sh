#!/bin/bash

# Authentication and deployment script for Kronos EAM React

# Add gcloud to PATH
export PATH="/home/bloom/sentrics/google-cloud-sdk/bin:$PATH"

PROJECT_ID="kronos-eam-react-prototype"
REGION="europe-west1"
SERVICE_NAME="kronos-eam-react"
IMAGE_TAG="gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest"

echo "🔐 Kronos EAM React - Authentication & Deployment"
echo "================================================="
echo ""

# Check if already authenticated
echo "Checking current authentication status..."
if gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
    echo "✅ Already authenticated with gcloud"
    ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)")
    echo "   Active account: $ACCOUNT"
else
    echo "❌ Not authenticated with gcloud"
    echo ""
    echo "Please run the following command to authenticate:"
    echo "   /home/bloom/sentrics/google-cloud-sdk/bin/gcloud auth login --no-launch-browser"
    echo ""
    echo "Then run this script again."
    exit 1
fi

# Set the project
echo ""
echo "Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Check if local image exists
if ! docker images | grep -q "kronos-eam-react.*test"; then
    echo "❌ Local Docker image not found. Building now..."
    docker build -t kronos-eam-react:test .
    if [ $? -ne 0 ]; then
        echo "❌ Docker build failed!"
        exit 1
    fi
fi

echo "✅ Local Docker image found"
echo ""

# Tag the image for GCR
echo "🏷️  Tagging image for Google Container Registry..."
docker tag kronos-eam-react:test ${IMAGE_TAG}

# Configure Docker for GCR
echo "🔐 Configuring Docker authentication..."
gcloud auth configure-docker --quiet

# Push to GCR
echo "📤 Pushing image to Container Registry..."
echo "This may take a few minutes..."
docker push ${IMAGE_TAG}

if [ $? -ne 0 ]; then
    echo "❌ Failed to push image to Container Registry"
    echo "Make sure you have the correct permissions"
    exit 1
fi

# Deploy to Cloud Run
echo ""
echo "☁️  Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
    --image ${IMAGE_TAG} \
    --platform managed \
    --region ${REGION} \
    --allow-unauthenticated \
    --port 80 \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 10 \
    --min-instances 0 \
    --set-env-vars "REACT_APP_API_URL=https://kronos-eam-api.a.run.app/api/v1,REACT_APP_WEBSOCKET_URL=wss://kronos-eam-api.a.run.app,NODE_ENV=production" \
    --project ${PROJECT_ID}

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    
    # Get service URL
    SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
        --region=${REGION} \
        --format='value(status.url)' \
        --project ${PROJECT_ID})
    
    echo "🌐 Your application is available at:"
    echo "   ${SERVICE_URL}"
    echo ""
    echo "📊 View logs:"
    echo "   gcloud logging read \"resource.labels.service_name='${SERVICE_NAME}'\" --limit=50 --project ${PROJECT_ID}"
    echo ""
    echo "📈 View in Cloud Console:"
    echo "   https://console.cloud.google.com/run/detail/${REGION}/${SERVICE_NAME}/metrics?project=${PROJECT_ID}"
else
    echo "❌ Deployment failed!"
    echo "Check the error messages above for details."
    exit 1
fi
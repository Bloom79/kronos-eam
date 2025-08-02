#!/bin/bash

# Kronos EAM React - Cloud Run Deployment Commands
# Run these commands step by step to deploy to Google Cloud

echo "🚀 Kronos EAM React - Cloud Run Deployment"
echo "Project ID: kronos-eam-react-prototype"
echo "Region: europe-west1"
echo ""

# Step 1: Set the project
echo "Step 1: Setting Google Cloud project..."
echo "Run: gcloud config set project kronos-eam-react-prototype"
echo ""

# Step 2: Enable required APIs
echo "Step 2: Enable required Google Cloud APIs..."
echo "Run: gcloud services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com"
echo ""

# Step 3: Configure Docker
echo "Step 3: Configure Docker for Google Container Registry..."
echo "Run: gcloud auth configure-docker"
echo ""

# Step 4: Build and push the Docker image
echo "Step 4: Build and push Docker image..."
echo "Run: docker build -t gcr.io/kronos-eam-react-prototype/kronos-eam-react:latest ."
echo "Run: docker push gcr.io/kronos-eam-react-prototype/kronos-eam-react:latest"
echo ""

# Step 5: Deploy to Cloud Run
echo "Step 5: Deploy to Cloud Run..."
cat << 'EOF'
Run: gcloud run deploy kronos-eam-react \
  --image gcr.io/kronos-eam-react-prototype/kronos-eam-react:latest \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --port 80 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --min-instances 0 \
  --set-env-vars "REACT_APP_API_URL=https://kronos-eam-api.a.run.app/api/v1,REACT_APP_WEBSOCKET_URL=wss://kronos-eam-api.a.run.app,REACT_APP_RPA_PROXY_URL=https://kronos-eam-api.a.run.app/api/rpa,NODE_ENV=production"
EOF
echo ""

# Step 6: Get the service URL
echo "Step 6: Get the deployed service URL..."
echo "Run: gcloud run services describe kronos-eam-react --region=europe-west1 --format='value(status.url)'"
echo ""

# Alternative: Use Cloud Build for CI/CD
echo "Alternative: Deploy using Cloud Build (CI/CD)..."
echo "Run: gcloud builds submit --config cloudbuild.yaml --project=kronos-eam-react-prototype"
echo ""

echo "📝 Note: Make sure you have authenticated with 'gcloud auth login' before running these commands"
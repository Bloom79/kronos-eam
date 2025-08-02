#!/bin/bash

echo "=========================================="
echo "Kronos EAM Deployment Verification"
echo "=========================================="

PROJECT_ID="kronos-eam-prod-20250802"

echo -e "\n1. Checking Cloud Run services..."
gcloud run services list --project=$PROJECT_ID --format="table(name,status,url)"

echo -e "\n2. Checking Cloud SQL instances..."
gcloud sql instances list --project=$PROJECT_ID --format="table(name,state,ipAddress)"

echo -e "\n3. Getting backend URL..."
BACKEND_URL=$(gcloud run services describe kronos-backend --project=$PROJECT_ID --region=europe-west1 --format="value(status.url)" 2>/dev/null)
if [ ! -z "$BACKEND_URL" ]; then
    echo "Backend URL: $BACKEND_URL"
    echo -e "\n4. Testing backend health..."
    curl -s "$BACKEND_URL/health" | jq . || echo "Backend not responding yet"
fi

echo -e "\n5. Getting frontend URL..."
FRONTEND_URL=$(gcloud run services describe kronos-frontend --project=$PROJECT_ID --region=europe-west1 --format="value(status.url)" 2>/dev/null)
if [ ! -z "$FRONTEND_URL" ]; then
    echo "Frontend URL: $FRONTEND_URL"
    echo -e "\nYou can access the application at: $FRONTEND_URL"
    echo "Default login: demo@kronos-eam.local / Demo2024!"
fi

echo -e "\n=========================================="
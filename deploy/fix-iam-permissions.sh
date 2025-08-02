#!/bin/bash

# Fix IAM permissions for Cloud Run deployment
# This script grants the necessary permissions for the kronos-deploy service account
# to deploy services using other service accounts

set -e

PROJECT_ID="kronos-eam-prod-20250802"

echo "🔧 Fixing IAM permissions for Cloud Run deployment..."
echo "Project: $PROJECT_ID"
echo ""

# Check if gcloud is configured
if ! gcloud config get-value project &> /dev/null; then
    echo "Setting project..."
    gcloud config set project $PROJECT_ID
fi

# Function to check if service account exists
check_service_account() {
    local sa_email=$1
    if gcloud iam service-accounts describe $sa_email --project=$PROJECT_ID &> /dev/null; then
        echo "✅ Service account exists: $sa_email"
        return 0
    else
        echo "❌ Service account NOT found: $sa_email"
        return 1
    fi
}

# Function to create service account if it doesn't exist
create_service_account_if_needed() {
    local sa_name=$1
    local sa_display=$2
    local sa_email="${sa_name}@${PROJECT_ID}.iam.gserviceaccount.com"
    
    if ! check_service_account $sa_email; then
        echo "Creating service account: $sa_name..."
        gcloud iam service-accounts create $sa_name \
            --display-name="$sa_display" \
            --project=$PROJECT_ID
        echo "✅ Created service account: $sa_email"
    fi
}

echo "1️⃣ Checking service accounts..."
echo ""

# Check/create deployment service account
create_service_account_if_needed "kronos-deploy" "Kronos Deployment Service Account"

# Check/create backend service account
create_service_account_if_needed "kronos-backend" "Kronos Backend Service Account"

# Check/create frontend service account
create_service_account_if_needed "kronos-frontend" "Kronos Frontend Service Account"

echo ""
echo "2️⃣ Granting Service Account User permissions..."
echo ""

# Grant kronos-deploy permission to act as kronos-backend
echo "Granting permission for kronos-deploy to act as kronos-backend..."
gcloud iam service-accounts add-iam-policy-binding \
    kronos-backend@${PROJECT_ID}.iam.gserviceaccount.com \
    --member="serviceAccount:kronos-deploy@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser" \
    --project=$PROJECT_ID

echo "✅ Granted permission for backend"

# Grant kronos-deploy permission to act as kronos-frontend
echo "Granting permission for kronos-deploy to act as kronos-frontend..."
gcloud iam service-accounts add-iam-policy-binding \
    kronos-frontend@${PROJECT_ID}.iam.gserviceaccount.com \
    --member="serviceAccount:kronos-deploy@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser" \
    --project=$PROJECT_ID

echo "✅ Granted permission for frontend"

echo ""
echo "3️⃣ Verifying permissions..."
echo ""

# Verify backend permissions
echo "Backend service account IAM policy:"
gcloud iam service-accounts get-iam-policy \
    kronos-backend@${PROJECT_ID}.iam.gserviceaccount.com \
    --project=$PROJECT_ID \
    --format="table(bindings.members,bindings.role)" | grep -E "(serviceAccountUser|kronos-deploy)" || true

echo ""
echo "Frontend service account IAM policy:"
gcloud iam service-accounts get-iam-policy \
    kronos-frontend@${PROJECT_ID}.iam.gserviceaccount.com \
    --project=$PROJECT_ID \
    --format="table(bindings.members,bindings.role)" | grep -E "(serviceAccountUser|kronos-deploy)" || true

echo ""
echo "4️⃣ Granting additional required roles to service accounts..."
echo ""

# Grant Cloud Run Admin to deployment service account
echo "Granting Cloud Run Admin to kronos-deploy..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:kronos-deploy@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/run.admin" || true

# Grant Storage Admin for artifact registry
echo "Granting Storage Admin to kronos-deploy..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:kronos-deploy@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/storage.admin" || true

# Grant Cloud SQL Client to backend service account
echo "Granting Cloud SQL Client to kronos-backend..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:kronos-backend@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/cloudsql.client" || true

# Grant Secret Manager Secret Accessor to backend
echo "Granting Secret Manager Secret Accessor to kronos-backend..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:kronos-backend@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor" || true

# Grant access to specific secrets
echo "Granting access to individual secrets..."
for secret in jwt-secret redis-password db-password; do
    gcloud secrets add-iam-policy-binding $secret \
        --member="serviceAccount:kronos-backend@${PROJECT_ID}.iam.gserviceaccount.com" \
        --role="roles/secretmanager.secretAccessor" \
        --project=${PROJECT_ID} 2>/dev/null || true
done

echo ""
echo "✅ IAM permissions have been fixed!"
echo ""
echo "Next steps:"
echo "1. Re-trigger the GitHub Actions deployment workflow"
echo "2. Monitor the deployment progress"
echo ""
echo "To manually trigger deployment:"
echo "  - Go to: https://github.com/Bloom79/kronos-eam/actions"
echo "  - Click on 'Deploy to Google Cloud Run'"
echo "  - Click 'Run workflow'"
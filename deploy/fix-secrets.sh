#!/bin/bash

# Fix missing secrets in Google Secret Manager
# This script creates the required secrets and grants access permissions

set -e

PROJECT_ID="kronos-eam-prod-20250802"

echo "🔐 Fixing missing secrets for Kronos EAM deployment..."
echo "Project: $PROJECT_ID"
echo ""

# Check if gcloud is configured
if ! gcloud config get-value project &> /dev/null; then
    echo "Setting project..."
    gcloud config set project $PROJECT_ID
fi

# Function to create secret if it doesn't exist
create_secret_if_needed() {
    local secret_name=$1
    local secret_value=$2
    
    if gcloud secrets describe $secret_name --project=$PROJECT_ID &> /dev/null; then
        echo "✅ Secret already exists: $secret_name"
    else
        echo "Creating secret: $secret_name..."
        echo -n "$secret_value" | gcloud secrets create $secret_name \
            --data-file=- \
            --project=$PROJECT_ID
        echo "✅ Created secret: $secret_name"
    fi
}

echo "1️⃣ Creating required secrets..."
echo ""

# Create jwt-secret with random value
JWT_SECRET=$(openssl rand -base64 32)
create_secret_if_needed "jwt-secret" "$JWT_SECRET"

# Create redis-password with random value
REDIS_PASSWORD=$(openssl rand -base64 32)
create_secret_if_needed "redis-password" "$REDIS_PASSWORD"

# Also ensure db-password exists (if not already)
create_secret_if_needed "db-password" "KronosAdmin2024!"

echo ""
echo "2️⃣ Granting secret access permissions..."
echo ""

# Grant backend service account access to secrets
for secret in jwt-secret redis-password db-password; do
    echo "Granting access to $secret for kronos-backend service account..."
    gcloud secrets add-iam-policy-binding $secret \
        --member="serviceAccount:kronos-backend@${PROJECT_ID}.iam.gserviceaccount.com" \
        --role="roles/secretmanager.secretAccessor" \
        --project=$PROJECT_ID || echo "Permission already exists or granted"
done

echo ""
echo "3️⃣ Verifying secrets..."
echo ""

# List all secrets
echo "Available secrets:"
gcloud secrets list --project=$PROJECT_ID --format="table(name,created)" | grep -E "(jwt-secret|redis-password|db-password)" || true

echo ""
echo "✅ Secrets have been fixed!"
echo ""
echo "Next steps:"
echo "1. Re-trigger the deployment workflow"
echo "2. The deployment should now proceed without secret errors"
echo ""
echo "To manually verify a secret exists:"
echo "  gcloud secrets describe jwt-secret --project=$PROJECT_ID"
echo ""
echo "To view secret versions:"
echo "  gcloud secrets versions list jwt-secret --project=$PROJECT_ID"
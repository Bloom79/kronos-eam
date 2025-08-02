#!/bin/bash

# Create Service Account for Kronos EAM Deployment
# This script creates a service account with all necessary permissions

set -e

# Check if project ID is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <GCP_PROJECT_ID>"
    echo "Example: $0 my-gcp-project-123"
    exit 1
fi

PROJECT_ID=$1
SA_NAME="kronos-deploy"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

echo "Creating service account for project: $PROJECT_ID"
echo "Service account email: $SA_EMAIL"
echo ""

# Create service account
echo "Creating service account..."
gcloud iam service-accounts create $SA_NAME \
    --display-name="Kronos EAM Deployment Service Account" \
    --project=$PROJECT_ID

# Wait a moment for propagation
sleep 2

# Grant necessary roles
echo ""
echo "Granting necessary roles..."

# Cloud Run Admin - to deploy and manage Cloud Run services
echo "- Cloud Run Admin"
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/run.admin"

# Storage Admin - to manage Cloud Storage buckets
echo "- Storage Admin"
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/storage.admin"

# Cloud SQL Admin - to create and manage database
echo "- Cloud SQL Admin"
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/cloudsql.admin"

# Artifact Registry Admin - to push container images
echo "- Artifact Registry Admin"
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/artifactregistry.admin"

# Service Account User - to act as service account
echo "- Service Account User"
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/iam.serviceAccountUser"

# Compute Network Admin - for VPC connector
echo "- Compute Network Admin"
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/compute.networkAdmin"

# Secret Manager Admin - for managing secrets
echo "- Secret Manager Admin"
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/secretmanager.admin"

echo ""
echo "Creating service account key..."

# Create key file
KEY_FILE="${HOME}/kronos-sa-key.json"
gcloud iam service-accounts keys create $KEY_FILE \
    --iam-account=$SA_EMAIL \
    --project=$PROJECT_ID

echo ""
echo "✅ Service account created successfully!"
echo ""
echo "Service account key saved to: $KEY_FILE"
echo ""
echo "IMPORTANT: Copy the contents of $KEY_FILE to use as GCP_SA_KEY secret in GitHub"
echo ""
echo "To view the key:"
echo "cat $KEY_FILE"
echo ""
echo "⚠️  Keep this key secure and do not commit it to version control!"
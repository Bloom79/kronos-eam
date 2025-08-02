#\!/bin/bash
set -e

echo "Enabling required GCP APIs for Kronos EAM..."

gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    sqladmin.googleapis.com \
    compute.googleapis.com \
    secretmanager.googleapis.com \
    cloudresourcemanager.googleapis.com \
    iam.googleapis.com \
    --project=kronos-eam-prod-20250802

echo "Creating Artifact Registry..."
gcloud artifacts repositories create kronos-eam \
    --repository-format=docker \
    --location=europe-west1 \
    --project=kronos-eam-prod-20250802 || echo "Registry might already exist"

echo "APIs enabled successfully\!"

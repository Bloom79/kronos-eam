#!/bin/bash
#
# Quick fix for Artifact Registry deployment issues
# This script enables the API and checks/fixes permissions
#

set -e

# Configuration
PROJECT_ID="kronos-eam-prod-20250802"
REGION="europe-west1"
REPOSITORY="kronos-eam"
DEPLOY_SA="kronos-deploy@${PROJECT_ID}.iam.gserviceaccount.com"

echo "🚀 Quick Fix for Artifact Registry Deployment Issues"
echo "Project: $PROJECT_ID"
echo ""

# Set project
echo "Setting project..."
gcloud config set project $PROJECT_ID

# 1. Enable Artifact Registry API
echo ""
echo "1️⃣ Enabling Artifact Registry API..."
if gcloud services list --enabled --filter="name:artifactregistry.googleapis.com" --format="value(name)" | grep -q artifactregistry; then
    echo "✅ Artifact Registry API is already enabled"
else
    echo "Enabling Artifact Registry API..."
    gcloud services enable artifactregistry.googleapis.com
    echo "✅ Artifact Registry API enabled"
fi

# 2. Check if repository exists
echo ""
echo "2️⃣ Checking Artifact Registry repository..."
if gcloud artifacts repositories describe $REPOSITORY --location=$REGION &>/dev/null; then
    echo "✅ Repository exists: $REPOSITORY"
else
    echo "Creating Artifact Registry repository..."
    gcloud artifacts repositories create $REPOSITORY \
        --repository-format=docker \
        --location=$REGION \
        --description="Docker images for Kronos EAM" \
        --project=$PROJECT_ID
    echo "✅ Repository created"
fi

# 3. Check service account
echo ""
echo "3️⃣ Checking deployment service account..."
if gcloud iam service-accounts describe $DEPLOY_SA --project=$PROJECT_ID &>/dev/null; then
    echo "✅ Service account exists: $DEPLOY_SA"
    
    # Check current roles
    echo ""
    echo "Current roles:"
    gcloud projects get-iam-policy $PROJECT_ID \
        --flatten="bindings[].members" \
        --filter="bindings.members:serviceAccount:$DEPLOY_SA" \
        --format="table(bindings.role)" | tail -n +2 | sed 's/^/  - /'
else
    echo "❌ Service account NOT found!"
    echo "Creating service account..."
    gcloud iam service-accounts create kronos-deploy \
        --display-name="Kronos Deployment Service Account" \
        --project=$PROJECT_ID
    echo "✅ Service account created"
fi

# 4. Grant permissions
echo ""
echo "4️⃣ Granting necessary permissions..."

# Grant Artifact Registry Admin
echo "Granting Artifact Registry Admin..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$DEPLOY_SA" \
    --role="roles/artifactregistry.admin" \
    --condition=None

# Grant Cloud Run Admin
echo "Granting Cloud Run Admin..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$DEPLOY_SA" \
    --role="roles/run.admin" \
    --condition=None

# Grant Service Account User
echo "Granting Service Account User..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$DEPLOY_SA" \
    --role="roles/iam.serviceAccountUser" \
    --condition=None

echo "✅ Permissions granted"

# 5. Create service account key
echo ""
echo "5️⃣ Service Account Key"
echo ""
echo "Do you need to create a new service account key for GitHub Actions?"
echo "Only do this if:"
echo "  - You don't have a key file"
echo "  - The current key in GitHub is wrong/expired"
echo "  - You're seeing authentication errors"
echo ""
read -p "Create new service account key? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    KEY_FILE="kronos-deploy-key-$(date +%Y%m%d-%H%M%S).json"
    
    # Create new key
    gcloud iam service-accounts keys create $KEY_FILE \
        --iam-account=$DEPLOY_SA \
        --project=$PROJECT_ID
    
    echo ""
    echo "✅ Created new service account key: $KEY_FILE"
    echo ""
    echo "📋 Next steps:"
    echo "1. Copy the key content:"
    echo "   cat $KEY_FILE"
    echo ""
    echo "2. Go to GitHub secrets:"
    echo "   https://github.com/Bloom79/kronos-eam/settings/secrets/actions"
    echo ""
    echo "3. Update GCP_SA_KEY with the JSON content"
    echo ""
    echo "4. Delete the local key file:"
    echo "   rm $KEY_FILE"
fi

echo ""
echo "✅ Quick fix completed!"
echo ""
echo "🎯 Summary:"
echo "  - Artifact Registry API: Enabled"
echo "  - Repository: Created/Verified"
echo "  - Service Account: Created/Verified"
echo "  - Permissions: Granted"
echo ""
echo "If deployment still fails, run the full setup:"
echo "  ./gcp-setup.sh"
echo ""
#!/bin/bash
#
# Fix Artifact Registry permissions for GitHub Actions deployment
# This script ensures the deployment service account has proper permissions
# to push Docker images to Artifact Registry
#

set -e

# Configuration
PROJECT_ID="kronos-eam-prod-20250802"
REGION="europe-west1"
REPOSITORY="kronos-eam"
DEPLOY_SA="kronos-deploy@${PROJECT_ID}.iam.gserviceaccount.com"

echo "🔧 Fixing Artifact Registry permissions..."
echo "Project: $PROJECT_ID"
echo "Repository: $REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY"
echo ""

# Check if gcloud is configured
if ! gcloud config get-value project &> /dev/null; then
    echo "Setting project..."
    gcloud config set project $PROJECT_ID
fi

echo "1️⃣ Checking if Artifact Registry repository exists..."
if gcloud artifacts repositories describe $REPOSITORY \
    --location=$REGION \
    --project=$PROJECT_ID &> /dev/null; then
    echo "✅ Repository exists: $REPOSITORY"
else
    echo "❌ Repository NOT found. Creating it..."
    gcloud artifacts repositories create $REPOSITORY \
        --repository-format=docker \
        --location=$REGION \
        --description="Kronos EAM Docker images" \
        --project=$PROJECT_ID
    echo "✅ Created repository: $REPOSITORY"
fi

echo ""
echo "2️⃣ Checking deployment service account..."
if gcloud iam service-accounts describe $DEPLOY_SA --project=$PROJECT_ID &> /dev/null; then
    echo "✅ Service account exists: $DEPLOY_SA"
else
    echo "❌ Service account NOT found: $DEPLOY_SA"
    echo "Creating service account..."
    gcloud iam service-accounts create kronos-deploy \
        --display-name="Kronos Deployment Service Account" \
        --project=$PROJECT_ID
    echo "✅ Created service account"
fi

echo ""
echo "3️⃣ Granting Artifact Registry permissions..."

# Grant Artifact Registry Writer role (minimum required for push)
echo "Granting Artifact Registry Writer role..."
gcloud artifacts repositories add-iam-policy-binding $REPOSITORY \
    --location=$REGION \
    --member="serviceAccount:$DEPLOY_SA" \
    --role="roles/artifactregistry.writer" \
    --project=$PROJECT_ID

echo "✅ Granted Artifact Registry Writer role"

# Also grant at project level for broader access
echo "Granting project-level Artifact Registry Admin role..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$DEPLOY_SA" \
    --role="roles/artifactregistry.admin"

echo "✅ Granted Artifact Registry Admin role"

echo ""
echo "4️⃣ Verifying permissions..."

# Check repository IAM policy
echo "Repository IAM policy:"
gcloud artifacts repositories get-iam-policy $REPOSITORY \
    --location=$REGION \
    --project=$PROJECT_ID \
    --format="table(bindings.members,bindings.role)" | grep -E "(artifactregistry|$DEPLOY_SA)" || true

echo ""
echo "Project IAM policy (artifact registry roles):"
gcloud projects get-iam-policy $PROJECT_ID \
    --flatten="bindings[].members" \
    --filter="bindings.members:serviceAccount:$DEPLOY_SA" \
    --format="table(bindings.role)" | grep artifactregistry || true

echo ""
echo "5️⃣ Creating/updating GitHub Actions service account key..."
echo ""
echo "⚠️  IMPORTANT: You need to update the GCP_SA_KEY secret in GitHub with the new key"
echo ""

# Check if we should create a new key
read -p "Do you want to create a new service account key? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    KEY_FILE="kronos-deploy-key.json"
    
    # Create new key
    gcloud iam service-accounts keys create $KEY_FILE \
        --iam-account=$DEPLOY_SA \
        --project=$PROJECT_ID
    
    echo ""
    echo "✅ Created new service account key: $KEY_FILE"
    echo ""
    echo "📋 Next steps:"
    echo "1. Copy the contents of $KEY_FILE"
    echo "2. Go to: https://github.com/Bloom79/kronos-eam/settings/secrets/actions"
    echo "3. Update the GCP_SA_KEY secret with the new key contents"
    echo "4. Delete the local key file: rm $KEY_FILE"
    echo ""
    echo "To copy the key to clipboard (macOS):"
    echo "  cat $KEY_FILE | pbcopy"
    echo ""
    echo "To copy the key to clipboard (Linux):"
    echo "  cat $KEY_FILE | xclip -selection clipboard"
else
    echo ""
    echo "⚠️  Make sure the existing GCP_SA_KEY in GitHub has the correct permissions"
fi

echo ""
echo "✅ Artifact Registry permissions have been configured!"
echo ""
echo "Additional troubleshooting:"
echo "- Ensure GitHub Actions workflow uses: gcloud auth configure-docker $REGION-docker.pkg.dev"
echo "- Verify the PROJECT_ID in the workflow matches: $PROJECT_ID"
echo "- Check that docker push uses the correct registry URL"
echo ""
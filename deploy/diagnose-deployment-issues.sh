#!/bin/bash
#
# Diagnose deployment issues for Kronos EAM
# This script checks the current state of GCP resources and permissions
#

set -e

# Configuration
PROJECT_ID="kronos-eam-prod-20250802"
REGION="europe-west1"
REPOSITORY="kronos-eam"
DEPLOY_SA="kronos-deploy@${PROJECT_ID}.iam.gserviceaccount.com"
BACKEND_SA="kronos-backend@${PROJECT_ID}.iam.gserviceaccount.com"
FRONTEND_SA="kronos-frontend@${PROJECT_ID}.iam.gserviceaccount.com"

echo "🔍 Diagnosing Kronos EAM deployment issues..."
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Check if gcloud is configured
if ! gcloud config get-value project &> /dev/null; then
    echo "Setting project..."
    gcloud config set project $PROJECT_ID
fi

echo "1️⃣ Checking project existence and access..."
if gcloud projects describe $PROJECT_ID &> /dev/null; then
    echo "✅ Project exists and accessible: $PROJECT_ID"
else
    echo "❌ Cannot access project: $PROJECT_ID"
    echo "   Make sure you have the correct permissions and project ID"
    exit 1
fi

echo ""
echo "2️⃣ Checking Artifact Registry..."
if gcloud artifacts repositories describe $REPOSITORY \
    --location=$REGION \
    --project=$PROJECT_ID &> /dev/null; then
    echo "✅ Artifact Registry repository exists: $REPOSITORY"
    
    # Check repository settings
    echo "   Repository details:"
    gcloud artifacts repositories describe $REPOSITORY \
        --location=$REGION \
        --project=$PROJECT_ID \
        --format="yaml(name,format,description)"
else
    echo "❌ Artifact Registry repository NOT found: $REPOSITORY"
    echo "   This needs to be created first!"
fi

echo ""
echo "3️⃣ Checking service accounts..."

# Function to check service account and its roles
check_service_account() {
    local sa_email=$1
    local sa_name=$(echo $sa_email | cut -d@ -f1)
    
    if gcloud iam service-accounts describe $sa_email --project=$PROJECT_ID &> /dev/null; then
        echo "✅ Service account exists: $sa_name"
        
        # Get roles
        echo "   Roles:"
        gcloud projects get-iam-policy $PROJECT_ID \
            --flatten="bindings[].members" \
            --filter="bindings.members:serviceAccount:$sa_email" \
            --format="table(bindings.role)" | tail -n +2 | sed 's/^/     - /'
    else
        echo "❌ Service account NOT found: $sa_name"
    fi
}

check_service_account $DEPLOY_SA
check_service_account $BACKEND_SA
check_service_account $FRONTEND_SA

echo ""
echo "4️⃣ Checking Artifact Registry permissions for deployment SA..."
if gcloud artifacts repositories get-iam-policy $REPOSITORY \
    --location=$REGION \
    --project=$PROJECT_ID \
    --format="value(bindings)" | grep -q "$DEPLOY_SA"; then
    echo "✅ Deployment SA has repository-level permissions"
    
    echo "   Repository IAM bindings:"
    gcloud artifacts repositories get-iam-policy $REPOSITORY \
        --location=$REGION \
        --project=$PROJECT_ID \
        --flatten="bindings[].members" \
        --filter="bindings.members:$DEPLOY_SA" \
        --format="table(bindings.role)" | tail -n +2 | sed 's/^/     - /'
else
    echo "⚠️  Deployment SA has NO repository-level permissions"
    echo "   This might be OK if project-level permissions are sufficient"
fi

echo ""
echo "5️⃣ Checking Cloud Run services..."
for service in kronos-backend kronos-frontend; do
    if gcloud run services describe $service \
        --region=$REGION \
        --project=$PROJECT_ID &> /dev/null; then
        echo "✅ Cloud Run service exists: $service"
    else
        echo "ℹ️  Cloud Run service not found: $service (will be created on first deploy)"
    fi
done

echo ""
echo "6️⃣ Checking Cloud SQL instance..."
SQL_INSTANCE="kronos-db"
if gcloud sql instances describe $SQL_INSTANCE --project=$PROJECT_ID &> /dev/null; then
    echo "✅ Cloud SQL instance exists: $SQL_INSTANCE"
else
    echo "❌ Cloud SQL instance NOT found: $SQL_INSTANCE"
fi

echo ""
echo "7️⃣ Summary of issues found:"
echo ""

# Collect issues
ISSUES=()

# Check deployment SA permissions
if ! gcloud projects get-iam-policy $PROJECT_ID \
    --flatten="bindings[].members" \
    --filter="bindings.members:serviceAccount:$DEPLOY_SA" \
    --format="value(bindings.role)" | grep -q "artifactregistry"; then
    ISSUES+=("❌ Deployment SA missing Artifact Registry permissions")
fi

if ! gcloud artifacts repositories describe $REPOSITORY \
    --location=$REGION \
    --project=$PROJECT_ID &> /dev/null; then
    ISSUES+=("❌ Artifact Registry repository doesn't exist")
fi

if ! gcloud iam service-accounts describe $DEPLOY_SA --project=$PROJECT_ID &> /dev/null; then
    ISSUES+=("❌ Deployment service account doesn't exist")
fi

# Print issues or success
if [ ${#ISSUES[@]} -eq 0 ]; then
    echo "✅ No critical issues found!"
    echo ""
    echo "⚠️  If deployment still fails, check:"
    echo "   1. GCP_SA_KEY secret in GitHub contains correct service account key"
    echo "   2. The key is for the $DEPLOY_SA service account"
    echo "   3. The key hasn't expired or been revoked"
else
    echo "Found ${#ISSUES[@]} issue(s):"
    for issue in "${ISSUES[@]}"; do
        echo "   $issue"
    done
    echo ""
    echo "💡 Run './fix-artifact-registry-permissions.sh' to fix these issues"
fi

echo ""
echo "📋 Quick fixes:"
echo "   - To fix permissions: ./fix-artifact-registry-permissions.sh"
echo "   - To setup everything: ./gcp-setup.sh"
echo "   - To update GitHub secret: Create new key and update GCP_SA_KEY"
echo ""
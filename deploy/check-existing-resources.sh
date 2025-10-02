#!/bin/bash
#
# Check existing GCP resources and service accounts
# This script lists what's actually in the project
#

set -e

# Configuration
PROJECT_ID="kronos-eam-prod-20250802"
REGION="europe-west1"

echo "🔍 Checking Existing GCP Resources"
echo "Project: $PROJECT_ID"
echo ""

# Set project
echo "Setting project..."
gcloud config set project $PROJECT_ID 2>/dev/null || {
    echo "❌ Cannot set project. Do you have access to $PROJECT_ID?"
    exit 1
}

echo ""
echo "1️⃣ Checking current user/account..."
echo "Active account: $(gcloud config get-value account)"
echo ""

echo "2️⃣ Listing ALL service accounts in the project..."
echo "If this fails, you may not have permission to list service accounts"
echo ""
gcloud iam service-accounts list --project=$PROJECT_ID --format="table(email,displayName)" 2>&1 || {
    echo "Cannot list service accounts. Checking specific ones..."
    echo ""
    
    # Try to describe specific service accounts
    for sa in kronos-deploy kronos-backend kronos-frontend; do
        echo -n "Checking $sa@$PROJECT_ID.iam.gserviceaccount.com: "
        if gcloud iam service-accounts describe $sa@$PROJECT_ID.iam.gserviceaccount.com --project=$PROJECT_ID &>/dev/null; then
            echo "✅ EXISTS"
        else
            echo "❌ NOT FOUND or NO ACCESS"
        fi
    done
}

echo ""
echo "3️⃣ Checking Artifact Registry repositories..."
gcloud artifacts repositories list --location=$REGION --project=$PROJECT_ID --format="table(name,format)" 2>&1 || {
    echo "Cannot list repositories. Checking specific one..."
    echo -n "Checking kronos-eam repository: "
    if gcloud artifacts repositories describe kronos-eam --location=$REGION --project=$PROJECT_ID &>/dev/null; then
        echo "✅ EXISTS"
    else
        echo "❌ NOT FOUND"
    fi
}

echo ""
echo "4️⃣ Checking enabled APIs..."
echo "Checking if Artifact Registry API is enabled..."
if gcloud services list --enabled --filter="name:artifactregistry.googleapis.com" --format="value(name)" --project=$PROJECT_ID | grep -q artifactregistry; then
    echo "✅ Artifact Registry API is ENABLED"
else
    echo "❌ Artifact Registry API is NOT ENABLED"
fi

echo ""
echo "5️⃣ Looking for existing service account keys locally..."
echo "Checking for key files in common locations:"
for pattern in ~/kronos*.json ~/.config/gcloud/kronos*.json ~/Downloads/kronos*.json ./kronos*.json; do
    if ls $pattern 2>/dev/null | head -5; then
        echo "Found key files matching: $pattern"
    fi
done

echo ""
echo "6️⃣ Checking GitHub repository for clues..."
echo "Recent workflow runs might show which service account is being used"
echo ""

echo "💡 Recommendations:"
echo ""
echo "1. If service accounts exist but you can't access them:"
echo "   - You may be using the wrong GCP account"
echo "   - Try: gcloud auth list"
echo ""
echo "2. If you have existing key files:"
echo "   - Check the 'client_email' field: cat <keyfile> | grep client_email"
echo "   - This shows which service account the key belongs to"
echo ""
echo "3. To use an existing service account:"
echo "   - Find or create a key for it"
echo "   - Update GitHub secret GCP_SA_KEY with that key"
echo ""
echo "4. To see what service account GitHub is currently using:"
echo "   - Check the failed workflow logs"
echo "   - Look for authentication steps"
echo ""
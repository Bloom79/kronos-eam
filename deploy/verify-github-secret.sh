#!/bin/bash
#
# Verify GitHub Actions service account configuration
# This script helps identify if the GCP_SA_KEY is using the correct service account
#

set -e

echo "🔍 Verifying GitHub Actions Service Account Configuration"
echo ""
echo "This script will help you verify that your GitHub Actions workflow"
echo "is using the correct service account with proper permissions."
echo ""

# Configuration
PROJECT_ID="kronos-eam-prod-20250802"
EXPECTED_SA="kronos-deploy@${PROJECT_ID}.iam.gserviceaccount.com"

echo "Expected configuration:"
echo "  Project ID: $PROJECT_ID"
echo "  Service Account: $EXPECTED_SA"
echo ""

echo "📋 Steps to verify your GitHub secret:"
echo ""
echo "1. Go to: https://github.com/Bloom79/kronos-eam/settings/secrets/actions"
echo "2. Click on 'GCP_SA_KEY' to view (you can't see the value but can update it)"
echo ""

echo "3. To check what service account the key belongs to:"
echo "   - The JSON key should have a field 'client_email' with value: $EXPECTED_SA"
echo "   - If you have the key locally, run:"
echo "     cat your-key-file.json | grep client_email"
echo ""

echo "4. To verify the service account has proper permissions, run:"
echo ""
echo "   gcloud projects get-iam-policy $PROJECT_ID \\"
echo "     --flatten='bindings[].members' \\"
echo "     --filter='bindings.members:serviceAccount:$EXPECTED_SA' \\"
echo "     --format='table(bindings.role)'"
echo ""

echo "5. The service account should have these roles:"
echo "   - roles/artifactregistry.admin (or at least roles/artifactregistry.writer)"
echo "   - roles/run.admin"
echo "   - roles/iam.serviceAccountUser"
echo ""

echo "🔧 If the service account is wrong or missing permissions:"
echo ""
echo "Option 1: Create a new key for the correct service account"
echo "  gcloud iam service-accounts keys create new-key.json \\"
echo "    --iam-account=$EXPECTED_SA \\"
echo "    --project=$PROJECT_ID"
echo ""
echo "Option 2: Run the fix script to ensure permissions and create new key"
echo "  ./fix-artifact-registry-permissions.sh"
echo ""

echo "📌 Quick check - List all keys for the deployment service account:"
echo ""
gcloud iam service-accounts keys list \
    --iam-account=$EXPECTED_SA \
    --project=$PROJECT_ID \
    --format="table(name,validAfterTime,validBeforeTime)" 2>/dev/null || echo "Error: Cannot list keys. Check if service account exists."

echo ""
echo "⚠️  Note: If you see multiple keys, one of them is being used by GitHub Actions."
echo "    You may want to audit and remove old/unused keys for security."
echo ""
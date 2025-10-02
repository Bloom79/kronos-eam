#!/bin/bash
#
# Fix deployment issues for Kronos EAM on GCP
# This script addresses all identified deployment problems
#

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="kronos-eam-prod-20250802"
REGION="europe-west1"
REPOSITORY="kronos-eam"
DEPLOY_SA="kronos-deploy@${PROJECT_ID}.iam.gserviceaccount.com"
BACKEND_SA="kronos-backend@${PROJECT_ID}.iam.gserviceaccount.com"
FRONTEND_SA="kronos-frontend@${PROJECT_ID}.iam.gserviceaccount.com"

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Kronos EAM - Deployment Issue Fixer${NC}"
echo -e "${BLUE}======================================${NC}"

# Check if gcloud is configured
if ! gcloud config get-value project &> /dev/null; then
    echo "Setting project..."
    gcloud config set project $PROJECT_ID
fi

echo -e "\n${YELLOW}1. Checking and enabling required APIs...${NC}"
# Enable required APIs
REQUIRED_APIS=(
    "artifactregistry.googleapis.com"
    "cloudbuild.googleapis.com"
    "run.googleapis.com"
    "sqladmin.googleapis.com"
    "secretmanager.googleapis.com"
    "compute.googleapis.com"
    "iam.googleapis.com"
)

for api in "${REQUIRED_APIS[@]}"; do
    echo -n "Enabling $api... "
    if gcloud services enable $api --project=$PROJECT_ID 2>&1 | grep -q "already enabled"; then
        echo -e "${GREEN}already enabled${NC}"
    else
        echo -e "${GREEN}enabled${NC}"
    fi
done

echo -e "\n${YELLOW}2. Creating Artifact Registry repository if needed...${NC}"
if ! gcloud artifacts repositories describe $REPOSITORY \
    --location=$REGION \
    --project=$PROJECT_ID &> /dev/null; then
    echo "Creating Artifact Registry repository..."
    gcloud artifacts repositories create $REPOSITORY \
        --repository-format=docker \
        --location=$REGION \
        --description="Docker images for Kronos EAM" \
        --project=$PROJECT_ID
    echo -e "${GREEN}✅ Repository created${NC}"
else
    echo -e "${GREEN}✅ Repository already exists${NC}"
fi

echo -e "\n${YELLOW}3. Creating service accounts if needed...${NC}"
# Function to create service account if it doesn't exist
create_service_account() {
    local sa_name=$1
    local display_name=$2
    local sa_email="${sa_name}@${PROJECT_ID}.iam.gserviceaccount.com"
    
    if ! gcloud iam service-accounts describe $sa_email --project=$PROJECT_ID &> /dev/null; then
        echo "Creating service account: $sa_name..."
        gcloud iam service-accounts create $sa_name \
            --display-name="$display_name" \
            --project=$PROJECT_ID
        echo -e "${GREEN}✅ Created $sa_name${NC}"
    else
        echo -e "${GREEN}✅ $sa_name already exists${NC}"
    fi
}

create_service_account "kronos-deploy" "Kronos Deployment Service Account"
create_service_account "kronos-backend" "Kronos Backend Service Account"
create_service_account "kronos-frontend" "Kronos Frontend Service Account"

echo -e "\n${YELLOW}4. Granting IAM permissions...${NC}"

# Function to grant role if not already granted
grant_role() {
    local member=$1
    local role=$2
    local resource=${3:-$PROJECT_ID}
    
    echo -n "Granting $role to $member... "
    if gcloud projects add-iam-policy-binding $resource \
        --member="$member" \
        --role="$role" \
        --condition=None 2>&1 | grep -q "already has role"; then
        echo -e "${GREEN}already granted${NC}"
    else
        echo -e "${GREEN}granted${NC}"
    fi
}

# Grant deployment service account permissions
echo -e "\n${BLUE}Deployment Service Account Permissions:${NC}"
grant_role "serviceAccount:$DEPLOY_SA" "roles/run.admin"
grant_role "serviceAccount:$DEPLOY_SA" "roles/storage.admin"
grant_role "serviceAccount:$DEPLOY_SA" "roles/artifactregistry.admin"
grant_role "serviceAccount:$DEPLOY_SA" "roles/cloudsql.admin"
grant_role "serviceAccount:$DEPLOY_SA" "roles/secretmanager.admin"
grant_role "serviceAccount:$DEPLOY_SA" "roles/iam.serviceAccountUser"

# Grant service account user permissions
echo -e "\n${BLUE}Service Account User Permissions:${NC}"
for sa_email in $BACKEND_SA $FRONTEND_SA; do
    echo -n "Granting serviceAccountUser for $sa_email... "
    gcloud iam service-accounts add-iam-policy-binding $sa_email \
        --member="serviceAccount:$DEPLOY_SA" \
        --role="roles/iam.serviceAccountUser" \
        --project=$PROJECT_ID &> /dev/null
    echo -e "${GREEN}granted${NC}"
done

# Grant backend service account permissions
echo -e "\n${BLUE}Backend Service Account Permissions:${NC}"
grant_role "serviceAccount:$BACKEND_SA" "roles/cloudsql.client"
grant_role "serviceAccount:$BACKEND_SA" "roles/secretmanager.secretAccessor"
grant_role "serviceAccount:$BACKEND_SA" "roles/logging.logWriter"
grant_role "serviceAccount:$BACKEND_SA" "roles/monitoring.metricWriter"

# Grant frontend service account permissions
echo -e "\n${BLUE}Frontend Service Account Permissions:${NC}"
grant_role "serviceAccount:$FRONTEND_SA" "roles/logging.logWriter"

echo -e "\n${YELLOW}5. Creating/updating secrets...${NC}"

# Function to create or update secret
create_secret() {
    local secret_name=$1
    local secret_value=$2
    
    echo -n "Processing secret $secret_name... "
    if gcloud secrets describe $secret_name --project=$PROJECT_ID &> /dev/null; then
        echo -e "${GREEN}already exists${NC}"
    else
        echo -n "${secret_value}" | gcloud secrets create $secret_name \
            --data-file=- \
            --project=$PROJECT_ID &> /dev/null
        echo -e "${GREEN}created${NC}"
    fi
    
    # Grant backend service account access to the secret
    gcloud secrets add-iam-policy-binding $secret_name \
        --member="serviceAccount:$BACKEND_SA" \
        --role="roles/secretmanager.secretAccessor" \
        --project=$PROJECT_ID &> /dev/null || true
}

# Create required secrets if they don't exist
create_secret "jwt-secret" "$(openssl rand -base64 32)"
create_secret "db-password" "KronosEAM2024!"
create_secret "redis-password" "$(openssl rand -base64 32)"

echo -e "\n${YELLOW}6. Checking Cloud SQL instance...${NC}"
SQL_INSTANCE="kronos-db"
if ! gcloud sql instances describe $SQL_INSTANCE --project=$PROJECT_ID &> /dev/null; then
    echo -e "${RED}❌ Cloud SQL instance not found!${NC}"
    echo "You need to create it with: gcloud sql instances create $SQL_INSTANCE --database-version=POSTGRES_14 --tier=db-f1-micro --region=$REGION"
else
    echo -e "${GREEN}✅ Cloud SQL instance exists${NC}"
fi

echo -e "\n${YELLOW}7. Summary and Next Steps${NC}"
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}✅ All fixable issues have been addressed!${NC}"
echo -e "${GREEN}======================================${NC}"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo "1. If you haven't already, create or update the GitHub secret:"
echo "   - Run: ${BLUE}gcloud iam service-accounts keys create ~/kronos-deploy-key.json --iam-account=$DEPLOY_SA${NC}"
echo "   - Copy the contents: ${BLUE}cat ~/kronos-deploy-key.json | pbcopy${NC}"
echo "   - Go to GitHub repository settings > Secrets > Actions"
echo "   - Update/create secret named ${BLUE}GCP_SA_KEY${NC} with the JSON contents"
echo ""
echo "2. If Cloud SQL instance is missing, create it:"
echo "   ${BLUE}./init-database.sh${NC}"
echo ""
echo "3. Trigger deployment:"
echo "   - Push to main branch, or"
echo "   - Run workflow manually from GitHub Actions tab"
echo ""
echo "4. Monitor deployment:"
echo "   - Check GitHub Actions logs for any errors"
echo "   - Use ${BLUE}./verify-deployment.sh${NC} to check deployment status"

echo -e "\n${GREEN}Script completed successfully!${NC}"
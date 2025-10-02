#!/bin/bash
#
# Verify deployment readiness for Kronos EAM
# This script checks if all requirements are met for successful deployment
#

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_ID="kronos-eam-prod-20250802"
REGION="europe-west1"
REPOSITORY="kronos-eam"
DEPLOY_SA="kronos-deploy@${PROJECT_ID}.iam.gserviceaccount.com"
BACKEND_SA="kronos-backend@${PROJECT_ID}.iam.gserviceaccount.com"
FRONTEND_SA="kronos-frontend@${PROJECT_ID}.iam.gserviceaccount.com"
SQL_INSTANCE="kronos-db"

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Deployment Readiness Check${NC}"
echo -e "${BLUE}======================================${NC}"

ISSUES_FOUND=0
WARNINGS_FOUND=0

# Function to check condition
check() {
    local condition=$1
    local description=$2
    local is_warning=${3:-false}
    
    echo -n "Checking: $description... "
    if eval "$condition"; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        if [ "$is_warning" = true ]; then
            echo -e "${YELLOW}⚠️  WARNING${NC}"
            ((WARNINGS_FOUND++))
        else
            echo -e "${RED}❌ FAILED${NC}"
            ((ISSUES_FOUND++))
        fi
        return 1
    fi
}

# Set project
gcloud config set project $PROJECT_ID 2>/dev/null || true

echo -e "\n${YELLOW}1. Checking APIs...${NC}"
check "gcloud services list --enabled --filter='name:artifactregistry.googleapis.com' --format='value(name)' | grep -q artifactregistry" "Artifact Registry API enabled"
check "gcloud services list --enabled --filter='name:run.googleapis.com' --format='value(name)' | grep -q run" "Cloud Run API enabled"
check "gcloud services list --enabled --filter='name:cloudbuild.googleapis.com' --format='value(name)' | grep -q cloudbuild" "Cloud Build API enabled"
check "gcloud services list --enabled --filter='name:sqladmin.googleapis.com' --format='value(name)' | grep -q sqladmin" "Cloud SQL API enabled"

echo -e "\n${YELLOW}2. Checking Artifact Registry...${NC}"
check "gcloud artifacts repositories describe $REPOSITORY --location=$REGION &>/dev/null" "Artifact Registry repository exists"

echo -e "\n${YELLOW}3. Checking service accounts...${NC}"
check "gcloud iam service-accounts describe $DEPLOY_SA &>/dev/null" "Deployment service account exists"
check "gcloud iam service-accounts describe $BACKEND_SA &>/dev/null" "Backend service account exists"
check "gcloud iam service-accounts describe $FRONTEND_SA &>/dev/null" "Frontend service account exists"

echo -e "\n${YELLOW}4. Checking IAM permissions...${NC}"
# Check if deployment SA has key roles
check "gcloud projects get-iam-policy $PROJECT_ID --flatten='bindings[].members' --filter='bindings.members:$DEPLOY_SA' --format='value(bindings.role)' | grep -q 'artifactregistry.admin'" "Deployment SA has Artifact Registry admin"
check "gcloud projects get-iam-policy $PROJECT_ID --flatten='bindings[].members' --filter='bindings.members:$DEPLOY_SA' --format='value(bindings.role)' | grep -q 'run.admin'" "Deployment SA has Cloud Run admin"
check "gcloud projects get-iam-policy $PROJECT_ID --flatten='bindings[].members' --filter='bindings.members:$DEPLOY_SA' --format='value(bindings.role)' | grep -q 'iam.serviceAccountUser'" "Deployment SA can impersonate service accounts"

echo -e "\n${YELLOW}5. Checking secrets...${NC}"
check "gcloud secrets describe jwt-secret &>/dev/null" "JWT secret exists"
check "gcloud secrets describe db-password &>/dev/null" "Database password secret exists"
check "gcloud secrets describe redis-password &>/dev/null" "Redis password secret exists" true

echo -e "\n${YELLOW}6. Checking Cloud SQL...${NC}"
check "gcloud sql instances describe $SQL_INSTANCE &>/dev/null" "Cloud SQL instance exists" true

echo -e "\n${YELLOW}7. Checking local GitHub Actions files...${NC}"
check "[ -f ../.github/workflows/deploy.yml ]" "deploy.yml exists"
check "[ -f ../.github/workflows/deploy-parallel.yml ]" "deploy-parallel.yml exists"
check "grep -q 'kronos-eam-prod' ../.github/workflows/deploy.yml" "deploy.yml uses correct project ID"
check "grep -q 'kronos-eam-prod' ../.github/workflows/deploy-parallel.yml" "deploy-parallel.yml uses correct project ID"

echo -e "\n${YELLOW}8. Checking Docker files...${NC}"
check "[ -f ../kronos-eam-backend/Dockerfile ]" "Backend Dockerfile exists"
check "[ -f ../kronos-eam-react/Dockerfile ]" "Frontend Dockerfile exists"
check "[ -f ../kronos-eam-backend/entrypoint.sh ]" "Backend entrypoint script exists"

echo -e "\n${BLUE}======================================${NC}"
echo -e "${BLUE}Deployment Readiness Summary${NC}"
echo -e "${BLUE}======================================${NC}"

if [ $ISSUES_FOUND -eq 0 ] && [ $WARNINGS_FOUND -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Deployment should work.${NC}"
    echo ""
    echo "Next step: Update GitHub secret GCP_SA_KEY with deployment service account key"
    echo "Then trigger deployment via GitHub Actions"
elif [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS_FOUND warning(s) found but deployment may still work.${NC}"
    echo ""
    echo "Warnings are for optional components. Core deployment should work."
else
    echo -e "${RED}❌ $ISSUES_FOUND critical issue(s) found!${NC}"
    echo ""
    echo "Run ${BLUE}./fix-deployment-issues.sh${NC} to fix these issues automatically"
fi

echo ""
echo "To create/update GitHub secret:"
echo "1. ${BLUE}gcloud iam service-accounts keys create ~/kronos-deploy-key.json --iam-account=$DEPLOY_SA${NC}"
echo "2. ${BLUE}cat ~/kronos-deploy-key.json | pbcopy${NC} (or use 'clip' on Windows, 'xclip' on Linux)"
echo "3. Go to GitHub > Settings > Secrets > Actions"
echo "4. Update GCP_SA_KEY with the JSON content"
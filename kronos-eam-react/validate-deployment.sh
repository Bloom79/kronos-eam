#!/bin/bash

# Kronos EAM React - Deployment Validation Script

set -e

echo "🔍 Kronos EAM React - Deployment Validation"
echo "==========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a command succeeded
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1${NC}"
    else
        echo -e "${RED}✗ $1${NC}"
        return 1
    fi
}

# Function to check URL status
check_url() {
    local url=$1
    local expected_status=${2:-200}
    
    echo -n "Checking $url... "
    status=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
    
    if [ "$status" = "$expected_status" ]; then
        echo -e "${GREEN}✓ HTTP $status${NC}"
        return 0
    else
        echo -e "${RED}✗ HTTP $status (expected $expected_status)${NC}"
        return 1
    fi
}

# Get service URL
echo "📍 Getting Cloud Run service URL..."
SERVICE_URL=$(gcloud run services describe kronos-eam-react \
    --region=europe-west1 \
    --format='value(status.url)' 2>/dev/null || echo "")

if [ -z "$SERVICE_URL" ]; then
    echo -e "${RED}✗ Could not retrieve service URL. Is the service deployed?${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Service URL: $SERVICE_URL${NC}"
echo ""

# Check service health
echo "🏥 Checking service health..."
check_url "$SERVICE_URL/health" 200

# Check main page
echo ""
echo "🏠 Checking main application..."
check_url "$SERVICE_URL" 200

# Check static assets
echo ""
echo "📁 Checking static assets..."
check_url "$SERVICE_URL/static/js/main.js" 200 || check_url "$SERVICE_URL/static/js/bundle.js" 200

# Check API connectivity (if backend is deployed)
echo ""
echo "🔌 Checking API connectivity..."
API_URL="https://kronos-eam-api.a.run.app/health"
check_url "$API_URL" 200 || echo -e "${YELLOW}⚠ Backend API not accessible${NC}"

# Check Cloud Run service status
echo ""
echo "☁️ Checking Cloud Run service status..."
SERVICE_STATUS=$(gcloud run services describe kronos-eam-react \
    --region=europe-west1 \
    --format='value(status.conditions[0].status)' 2>/dev/null || echo "Unknown")

if [ "$SERVICE_STATUS" = "True" ]; then
    echo -e "${GREEN}✓ Service is ready${NC}"
else
    echo -e "${RED}✗ Service status: $SERVICE_STATUS${NC}"
fi

# Check recent logs for errors
echo ""
echo "📋 Checking recent logs for errors..."
ERROR_COUNT=$(gcloud logging read \
    "resource.type=cloud_run_revision AND resource.labels.service_name=kronos-eam-react AND severity>=ERROR" \
    --limit=10 \
    --format="value(textPayload)" \
    --project=kronos-eam-react-prototype 2>/dev/null | wc -l || echo "0")

if [ "$ERROR_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✓ No recent errors in logs${NC}"
else
    echo -e "${YELLOW}⚠ Found $ERROR_COUNT error(s) in recent logs${NC}"
fi

# Check resource utilization
echo ""
echo "📊 Checking resource utilization..."
gcloud run services describe kronos-eam-react \
    --region=europe-west1 \
    --format="table(spec.template.spec.containers[0].resources.limits)" 2>/dev/null || \
    echo -e "${YELLOW}⚠ Could not retrieve resource information${NC}"

# Summary
echo ""
echo "==========================================="
echo "📋 Deployment Validation Summary"
echo "==========================================="
echo -e "Service URL: ${GREEN}$SERVICE_URL${NC}"
echo ""
echo "Next steps:"
echo "1. Visit $SERVICE_URL in your browser"
echo "2. Test all major features"
echo "3. Monitor logs: gcloud logging tail --project=kronos-eam-react-prototype"
echo "4. Check metrics in Cloud Console"
echo ""

# Performance tip
echo -e "${YELLOW}💡 Tip: First load might be slow due to cold start. Subsequent loads will be faster.${NC}"
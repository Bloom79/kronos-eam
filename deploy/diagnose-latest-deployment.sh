#!/bin/bash
#
# Automated Deployment Diagnostics Script
# Retrieves and analyzes GitHub Actions and Cloud Run logs
#

set -e

# Configuration
REPO="Bloom79/kronos-eam"
PROJECT_ID="kronos-eam-prod-20250802"
REGION="europe-west1"
BACKEND_SERVICE="kronos-backend"
FRONTEND_SERVICE="kronos-frontend"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Parse arguments
RUN_ID=""
FAILED_ONLY=false
REVISION=""
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --run-id)
            RUN_ID="$2"
            shift 2
            ;;
        --failed-only)
            FAILED_ONLY=true
            shift
            ;;
        --revision)
            REVISION="$2"
            shift 2
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --run-id ID        Check specific GitHub Actions run ID"
            echo "  --failed-only      Only show failed workflow runs"
            echo "  --revision NAME    Check specific Cloud Run revision"
            echo "  --verbose          Show detailed output with timestamps"
            echo "  --help             Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                                    # Check latest deployment"
            echo "  $0 --run-id 18195536715              # Check specific run"
            echo "  $0 --failed-only                      # Show only failures"
            echo "  $0 --revision kronos-backend-00010-46l  # Check specific revision"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        Kronos EAM Deployment Diagnostics                       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================================================
# SECTION 1: GitHub Actions Workflow Runs
# ============================================================================

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📋 SECTION 1: GitHub Actions Workflow Status${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# List recent runs
echo -e "${YELLOW}Recent workflow runs:${NC}"
if [ "$FAILED_ONLY" = true ]; then
    gh run list --repo $REPO --status failure --limit 5
else
    gh run list --repo $REPO --limit 5
fi
echo ""

# Get run ID if not provided
if [ -z "$RUN_ID" ]; then
    RUN_ID=$(gh run list --repo $REPO --limit 1 --json databaseId --jq '.[0].databaseId')
    echo -e "${YELLOW}📌 Analyzing latest run: ${GREEN}$RUN_ID${NC}"
else
    echo -e "${YELLOW}📌 Analyzing specified run: ${GREEN}$RUN_ID${NC}"
fi
echo ""

# Get run details
echo -e "${YELLOW}Run details:${NC}"
gh run view $RUN_ID --repo $REPO -v
echo ""

# Check for failed jobs
FAILED_JOBS=$(gh run view $RUN_ID --repo $REPO --json jobs --jq '.jobs[] | select(.conclusion == "failure") | .name' 2>/dev/null || echo "")

if [ -n "$FAILED_JOBS" ]; then
    echo -e "${RED}❌ Failed jobs found:${NC}"
    echo "$FAILED_JOBS" | while read -r job; do
        echo -e "  ${RED}✗${NC} $job"
    done
    echo ""

    echo -e "${YELLOW}Getting logs from failed jobs...${NC}"
    gh run view $RUN_ID --repo $REPO --log-failed 2>&1 | tail -100
    echo ""
else
    echo -e "${GREEN}✅ No failed jobs in this run${NC}"
    echo ""
fi

# ============================================================================
# SECTION 2: Cloud Run Service Status
# ============================================================================

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}☁️  SECTION 2: Cloud Run Service Status${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check backend service
echo -e "${YELLOW}Backend Service Status:${NC}"
if gcloud run services describe $BACKEND_SERVICE \
    --region=$REGION \
    --project=$PROJECT_ID &>/dev/null; then

    BACKEND_STATUS=$(gcloud run services describe $BACKEND_SERVICE \
        --region=$REGION \
        --project=$PROJECT_ID \
        --format='value(status.conditions[0].status)')

    BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE \
        --region=$REGION \
        --project=$PROJECT_ID \
        --format='value(status.url)')

    if [ "$BACKEND_STATUS" = "True" ]; then
        echo -e "  Status: ${GREEN}✅ Ready${NC}"
    else
        echo -e "  Status: ${RED}❌ Not Ready${NC}"
    fi
    echo -e "  URL: ${BLUE}$BACKEND_URL${NC}"

    # Get latest revision
    if [ -z "$REVISION" ]; then
        REVISION=$(gcloud run services describe $BACKEND_SERVICE \
            --region=$REGION \
            --project=$PROJECT_ID \
            --format='value(status.latestCreatedRevisionName)')
    fi
    echo -e "  Latest Revision: ${CYAN}$REVISION${NC}"
else
    echo -e "  ${RED}❌ Backend service not found${NC}"
fi
echo ""

# Check frontend service
echo -e "${YELLOW}Frontend Service Status:${NC}"
if gcloud run services describe $FRONTEND_SERVICE \
    --region=$REGION \
    --project=$PROJECT_ID &>/dev/null; then

    FRONTEND_STATUS=$(gcloud run services describe $FRONTEND_SERVICE \
        --region=$REGION \
        --project=$PROJECT_ID \
        --format='value(status.conditions[0].status)')

    FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE \
        --region=$REGION \
        --project=$PROJECT_ID \
        --format='value(status.url)')

    if [ "$FRONTEND_STATUS" = "True" ]; then
        echo -e "  Status: ${GREEN}✅ Ready${NC}"
    else
        echo -e "  Status: ${RED}❌ Not Ready${NC}"
    fi
    echo -e "  URL: ${BLUE}$FRONTEND_URL${NC}"
else
    echo -e "  ${RED}❌ Frontend service not found${NC}"
fi
echo ""

# ============================================================================
# SECTION 3: Cloud Run Container Logs
# ============================================================================

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📝 SECTION 3: Cloud Run Container Logs${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ -n "$REVISION" ]; then
    echo -e "${YELLOW}Fetching logs for revision: ${CYAN}$REVISION${NC}"
    echo ""

    # Get all logs
    if [ "$VERBOSE" = true ]; then
        gcloud logging read \
            "resource.type=cloud_run_revision AND \
             resource.labels.service_name=$BACKEND_SERVICE AND \
             resource.labels.revision_name=$REVISION" \
            --limit 200 \
            --project=$PROJECT_ID \
            --format="table(timestamp,severity,textPayload)"
    else
        gcloud logging read \
            "resource.type=cloud_run_revision AND \
             resource.labels.service_name=$BACKEND_SERVICE AND \
             resource.labels.revision_name=$REVISION" \
            --limit 100 \
            --project=$PROJECT_ID \
            --format=json | python3 -c "
import json, sys
logs = json.load(sys.stdin)
for log in sorted(logs, key=lambda x: x.get('timestamp', '')):
    ts = log.get('timestamp', 'N/A')
    severity = log.get('severity', 'INFO')
    text = log.get('textPayload', log.get('jsonPayload', ''))
    if text:
        # Truncate long log lines
        text_str = str(text)
        if len(text_str) > 200:
            text_str = text_str[:200] + '...'
        print(f'{ts} [{severity}] {text_str}')
" 2>/dev/null
    fi
    echo ""

    # Check for specific errors
    echo -e "${YELLOW}Checking for common error patterns...${NC}"
    ERROR_COUNT=$(gcloud logging read \
        "resource.type=cloud_run_revision AND \
         resource.labels.revision_name=$REVISION AND \
         severity>=ERROR" \
        --limit 10 \
        --project=$PROJECT_ID \
        --format="value(textPayload)" 2>/dev/null | wc -l)

    if [ "$ERROR_COUNT" -gt 0 ]; then
        echo -e "${RED}❌ Found $ERROR_COUNT error(s) in logs:${NC}"
        echo ""
        gcloud logging read \
            "resource.type=cloud_run_revision AND \
             resource.labels.revision_name=$REVISION AND \
             severity>=ERROR" \
            --limit 10 \
            --project=$PROJECT_ID \
            --format="table(timestamp,textPayload)" 2>/dev/null
    else
        echo -e "${GREEN}✅ No ERROR-level logs found${NC}"
    fi
    echo ""

    # Check for specific error patterns
    echo -e "${YELLOW}Pattern detection:${NC}"

    # Memory errors
    if gcloud logging read \
        "resource.type=cloud_run_revision AND \
         resource.labels.revision_name=$REVISION AND \
         textPayload=~\"Memory limit.*exceeded\"" \
        --limit 1 \
        --project=$PROJECT_ID \
        --format="value(textPayload)" 2>/dev/null | grep -q "Memory"; then
        echo -e "  ${RED}⚠️  Memory limit exceeded detected${NC}"
    fi

    # Module errors
    if gcloud logging read \
        "resource.type=cloud_run_revision AND \
         resource.labels.revision_name=$REVISION AND \
         textPayload=~\"ModuleNotFoundError\"" \
        --limit 1 \
        --project=$PROJECT_ID \
        --format="value(textPayload)" 2>/dev/null | grep -q "ModuleNotFoundError"; then
        echo -e "  ${RED}⚠️  Missing Python module detected${NC}"
    fi

    # PORT errors
    if gcloud logging read \
        "resource.type=cloud_run_revision AND \
         resource.labels.revision_name=$REVISION AND \
         textPayload=~\"PORT\"" \
        --limit 1 \
        --project=$PROJECT_ID \
        --format="value(textPayload)" 2>/dev/null | grep -q "PORT"; then
        echo -e "  ${YELLOW}ℹ️  PORT-related messages found (may be informational)${NC}"
    fi

    # Startup probe failures
    if gcloud logging read \
        "resource.type=cloud_run_revision AND \
         resource.labels.revision_name=$REVISION AND \
         textPayload=~\"STARTUP.*probe failed\"" \
        --limit 1 \
        --project=$PROJECT_ID \
        --format="value(textPayload)" 2>/dev/null | grep -q "probe failed"; then
        echo -e "  ${RED}⚠️  Container startup probe failed${NC}"
    fi

    echo ""
else
    echo -e "${YELLOW}No revision specified, skipping Cloud Run logs${NC}"
    echo -e "${YELLOW}Use --revision flag to check specific revision logs${NC}"
    echo ""
fi

# ============================================================================
# SECTION 4: Summary and Recommendations
# ============================================================================

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}💡 SECTION 4: Summary and Recommendations${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check overall status
ISSUES_FOUND=0

# Check GitHub Actions status
RUN_STATUS=$(gh run view $RUN_ID --repo $REPO --json conclusion --jq '.conclusion' 2>/dev/null || echo "unknown")
if [ "$RUN_STATUS" != "success" ] && [ "$RUN_STATUS" != "skipped" ]; then
    echo -e "${RED}❌ GitHub Actions deployment failed${NC}"
    ((ISSUES_FOUND++))
fi

# Check Cloud Run status
if [ -n "$BACKEND_STATUS" ] && [ "$BACKEND_STATUS" != "True" ]; then
    echo -e "${RED}❌ Backend service is not ready${NC}"
    ((ISSUES_FOUND++))
fi

if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}✅ No critical issues detected${NC}"
    echo -e "${GREEN}   Deployment appears to be successful${NC}"
else
    echo -e "${RED}⚠️  $ISSUES_FOUND issue(s) detected${NC}"
    echo ""
    echo -e "${YELLOW}Recommendations:${NC}"
    echo "1. Review the logs above for specific error messages"
    echo "2. Check the deployment troubleshooting guide: ./DEPLOYMENT_TROUBLESHOOTING.md"
    echo "3. Common fixes:"
    echo "   - Missing dependencies: Add to requirements.txt"
    echo "   - Memory issues: Increase --memory in workflow files"
    echo "   - PORT conflicts: Remove PORT from Dockerfile ENV"
    echo "   - Import errors: Check Python import paths"
fi

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    Diagnostics Complete                       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Save logs to files
if [ "$VERBOSE" = true ]; then
    echo -e "${YELLOW}Saving detailed logs to files...${NC}"

    # GitHub Actions logs
    gh run view $RUN_ID --repo $REPO --log > "github-run-$RUN_ID.log" 2>&1
    echo -e "  ${GREEN}✓${NC} GitHub Actions logs: github-run-$RUN_ID.log"

    # Cloud Run logs
    if [ -n "$REVISION" ]; then
        gcloud logging read \
            "resource.type=cloud_run_revision AND resource.labels.revision_name=$REVISION" \
            --limit 500 \
            --project=$PROJECT_ID \
            --format=json > "cloud-run-$REVISION.json" 2>&1
        echo -e "  ${GREEN}✓${NC} Cloud Run logs: cloud-run-$REVISION.json"
    fi

    echo ""
fi

exit 0

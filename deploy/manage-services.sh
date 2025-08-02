#!/bin/bash
#
# Service Management Script for Kronos EAM
# Start, stop, and manage all services locally and on GCP
#

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_ID=${GCP_PROJECT_ID:-"kronos-eam-prod"}
REGION=${GCP_REGION:-"europe-west1"}
BACKEND_SERVICE="kronos-backend"
FRONTEND_SERVICE="kronos-frontend"
LOCAL_BACKEND_PORT=8000
LOCAL_FRONTEND_PORT=3000

# Function to display menu
show_menu() {
    echo -e "\n${BLUE}======================================${NC}"
    echo -e "${BLUE}Kronos EAM - Service Manager${NC}"
    echo -e "${BLUE}======================================${NC}"
    echo -e "\n${YELLOW}Local Development:${NC}"
    echo "1. Start all services locally"
    echo "2. Stop all services locally"
    echo "3. Restart all services locally"
    echo "4. View local service status"
    echo "5. View local logs"
    echo -e "\n${YELLOW}Google Cloud Platform:${NC}"
    echo "6. Deploy to GCP"
    echo "7. Stop GCP services"
    echo "8. View GCP service status"
    echo "9. View GCP logs"
    echo "10. Scale GCP services"
    echo -e "\n${YELLOW}Database:${NC}"
    echo "11. Initialize database"
    echo "12. Backup database"
    echo "13. Restore database"
    echo -e "\n${YELLOW}Other:${NC}"
    echo "14. Run tests"
    echo "15. Update dependencies"
    echo "0. Exit"
    echo -e "\n${GREEN}Enter your choice:${NC} "
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
port_in_use() {
    lsof -i:$1 >/dev/null 2>&1
}

# Start local services
start_local() {
    echo -e "\n${YELLOW}Starting local services...${NC}"
    
    # Start PostgreSQL
    if command_exists docker; then
        echo "Starting PostgreSQL..."
        docker run -d --name kronos-postgres \
            -e POSTGRES_USER=kronos \
            -e POSTGRES_PASSWORD=kronos_password \
            -e POSTGRES_DB=kronos_eam \
            -p 5432:5432 \
            postgres:14-alpine 2>/dev/null || echo "PostgreSQL already running"
    fi
    
    # Start Redis
    echo "Starting Redis..."
    docker run -d --name kronos-redis \
        -p 6379:6379 \
        redis:7-alpine 2>/dev/null || echo "Redis already running"
    
    # Start Backend
    echo "Starting Backend..."
    cd ../kronos-eam-backend
    if [ -f "venv/bin/activate" ]; then
        source venv/bin/activate
    else
        python3 -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
    fi
    
    # Export environment variables
    export DATABASE_URL="postgresql://kronos:kronos_password@localhost:5432/kronos_eam"
    export REDIS_URL="redis://localhost:6379/0"
    export SECRET_KEY="dev-secret-key-change-in-production"
    export ENVIRONMENT="development"
    
    # Run database initialization
    python scripts/init_database.py
    
    # Start backend in background
    nohup python -m uvicorn app.main:app --reload --host 0.0.0.0 --port ${LOCAL_BACKEND_PORT} > backend.log 2>&1 &
    echo $! > backend.pid
    
    # Start Frontend
    echo "Starting Frontend..."
    cd ../kronos-eam-react
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    
    # Set backend URL
    export REACT_APP_API_URL="http://localhost:${LOCAL_BACKEND_PORT}/api/v1"
    
    # Start frontend in background
    nohup npm start > frontend.log 2>&1 &
    echo $! > frontend.pid
    
    echo -e "\n${GREEN}Local services started!${NC}"
    echo -e "Frontend: ${BLUE}http://localhost:${LOCAL_FRONTEND_PORT}${NC}"
    echo -e "Backend API: ${BLUE}http://localhost:${LOCAL_BACKEND_PORT}${NC}"
    echo -e "API Docs: ${BLUE}http://localhost:${LOCAL_BACKEND_PORT}/docs${NC}"
}

# Stop local services
stop_local() {
    echo -e "\n${YELLOW}Stopping local services...${NC}"
    
    # Stop Frontend
    if [ -f "../kronos-eam-react/frontend.pid" ]; then
        echo "Stopping Frontend..."
        kill $(cat ../kronos-eam-react/frontend.pid) 2>/dev/null || true
        rm ../kronos-eam-react/frontend.pid
    fi
    
    # Stop Backend
    if [ -f "../kronos-eam-backend/backend.pid" ]; then
        echo "Stopping Backend..."
        kill $(cat ../kronos-eam-backend/backend.pid) 2>/dev/null || true
        rm ../kronos-eam-backend/backend.pid
    fi
    
    # Stop Docker containers
    if command_exists docker; then
        echo "Stopping Docker containers..."
        docker stop kronos-postgres kronos-redis 2>/dev/null || true
        docker rm kronos-postgres kronos-redis 2>/dev/null || true
    fi
    
    echo -e "${GREEN}Local services stopped!${NC}"
}

# Restart local services
restart_local() {
    stop_local
    sleep 2
    start_local
}

# View local service status
status_local() {
    echo -e "\n${YELLOW}Local Service Status:${NC}"
    
    # Check Frontend
    if [ -f "../kronos-eam-react/frontend.pid" ] && kill -0 $(cat ../kronos-eam-react/frontend.pid) 2>/dev/null; then
        echo -e "Frontend: ${GREEN}Running${NC} (PID: $(cat ../kronos-eam-react/frontend.pid))"
    else
        echo -e "Frontend: ${RED}Stopped${NC}"
    fi
    
    # Check Backend
    if [ -f "../kronos-eam-backend/backend.pid" ] && kill -0 $(cat ../kronos-eam-backend/backend.pid) 2>/dev/null; then
        echo -e "Backend: ${GREEN}Running${NC} (PID: $(cat ../kronos-eam-backend/backend.pid))"
    else
        echo -e "Backend: ${RED}Stopped${NC}"
    fi
    
    # Check Docker containers
    if command_exists docker; then
        if docker ps | grep -q kronos-postgres; then
            echo -e "PostgreSQL: ${GREEN}Running${NC}"
        else
            echo -e "PostgreSQL: ${RED}Stopped${NC}"
        fi
        
        if docker ps | grep -q kronos-redis; then
            echo -e "Redis: ${GREEN}Running${NC}"
        else
            echo -e "Redis: ${RED}Stopped${NC}"
        fi
    fi
}

# View local logs
view_local_logs() {
    echo -e "\n${YELLOW}Select log to view:${NC}"
    echo "1. Backend logs"
    echo "2. Frontend logs"
    echo "3. All logs"
    read -p "Choice: " log_choice
    
    case $log_choice in
        1)
            if [ -f "../kronos-eam-backend/backend.log" ]; then
                tail -f ../kronos-eam-backend/backend.log
            else
                echo -e "${RED}Backend log file not found${NC}"
            fi
            ;;
        2)
            if [ -f "../kronos-eam-react/frontend.log" ]; then
                tail -f ../kronos-eam-react/frontend.log
            else
                echo -e "${RED}Frontend log file not found${NC}"
            fi
            ;;
        3)
            if command_exists multitail; then
                multitail ../kronos-eam-backend/backend.log ../kronos-eam-react/frontend.log
            else
                echo -e "${YELLOW}Installing multitail for better log viewing...${NC}"
                sudo apt-get install -y multitail
                multitail ../kronos-eam-backend/backend.log ../kronos-eam-react/frontend.log
            fi
            ;;
    esac
}

# Deploy to GCP
deploy_gcp() {
    echo -e "\n${YELLOW}Deploying to Google Cloud Platform...${NC}"
    
    # Check if gcloud is configured
    if ! command_exists gcloud; then
        echo -e "${RED}gcloud CLI not found. Please install it first.${NC}"
        return 1
    fi
    
    # Deploy backend
    echo "Deploying backend..."
    cd ../kronos-eam-backend
    gcloud builds submit --config=cloudbuild.yaml .
    
    # Deploy frontend
    echo "Deploying frontend..."
    cd ../kronos-eam-react
    gcloud builds submit --config=cloudbuild.yaml .
    
    echo -e "${GREEN}Deployment complete!${NC}"
}

# Stop GCP services
stop_gcp() {
    echo -e "\n${YELLOW}Stopping GCP services...${NC}"
    
    gcloud run services update ${BACKEND_SERVICE} \
        --region=${REGION} \
        --min-instances=0 \
        --max-instances=0
    
    gcloud run services update ${FRONTEND_SERVICE} \
        --region=${REGION} \
        --min-instances=0 \
        --max-instances=0
    
    echo -e "${GREEN}GCP services stopped!${NC}"
}

# View GCP service status
status_gcp() {
    echo -e "\n${YELLOW}GCP Service Status:${NC}"
    
    # Backend status
    echo -e "\n${BLUE}Backend Service:${NC}"
    gcloud run services describe ${BACKEND_SERVICE} \
        --region=${REGION} \
        --format="table(status.conditions.type,status.conditions.status,status.url)"
    
    # Frontend status
    echo -e "\n${BLUE}Frontend Service:${NC}"
    gcloud run services describe ${FRONTEND_SERVICE} \
        --region=${REGION} \
        --format="table(status.conditions.type,status.conditions.status,status.url)"
}

# View GCP logs
view_gcp_logs() {
    echo -e "\n${YELLOW}Select service logs:${NC}"
    echo "1. Backend logs"
    echo "2. Frontend logs"
    read -p "Choice: " log_choice
    
    case $log_choice in
        1)
            gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=${BACKEND_SERVICE}" \
                --limit=50 \
                --format="table(timestamp,severity,textPayload)"
            ;;
        2)
            gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=${FRONTEND_SERVICE}" \
                --limit=50 \
                --format="table(timestamp,severity,textPayload)"
            ;;
    esac
}

# Scale GCP services
scale_gcp() {
    echo -e "\n${YELLOW}Scale GCP Services${NC}"
    read -p "Minimum instances (0-10): " min_instances
    read -p "Maximum instances (1-100): " max_instances
    
    echo "Scaling backend..."
    gcloud run services update ${BACKEND_SERVICE} \
        --region=${REGION} \
        --min-instances=${min_instances} \
        --max-instances=${max_instances}
    
    echo "Scaling frontend..."
    gcloud run services update ${FRONTEND_SERVICE} \
        --region=${REGION} \
        --min-instances=${min_instances} \
        --max-instances=${max_instances}
    
    echo -e "${GREEN}Services scaled successfully!${NC}"
}

# Initialize database
init_database() {
    echo -e "\n${YELLOW}Initializing database...${NC}"
    cd ../kronos-eam-backend
    
    if [ -f "venv/bin/activate" ]; then
        source venv/bin/activate
    fi
    
    python scripts/init_database.py
    python scripts/migrate_to_english.py
    
    echo -e "${GREEN}Database initialized!${NC}"
}

# Backup database
backup_database() {
    echo -e "\n${YELLOW}Backing up database...${NC}"
    
    timestamp=$(date +%Y%m%d_%H%M%S)
    backup_file="kronos_backup_${timestamp}.sql"
    
    # Local backup
    if port_in_use 5432; then
        PGPASSWORD=kronos_password pg_dump -h localhost -U kronos -d kronos_eam > backups/${backup_file}
        echo -e "${GREEN}Local backup created: backups/${backup_file}${NC}"
    fi
    
    # GCP backup
    read -p "Create GCP backup? (y/n): " gcp_backup
    if [[ $gcp_backup =~ ^[Yy]$ ]]; then
        gcloud sql backups create --instance=kronos-db
        echo -e "${GREEN}GCP backup created!${NC}"
    fi
}

# Restore database
restore_database() {
    echo -e "\n${YELLOW}Available backups:${NC}"
    ls -la backups/*.sql 2>/dev/null || echo "No local backups found"
    
    read -p "Enter backup filename to restore: " backup_file
    
    if [ -f "backups/${backup_file}" ]; then
        PGPASSWORD=kronos_password psql -h localhost -U kronos -d kronos_eam < backups/${backup_file}
        echo -e "${GREEN}Database restored from ${backup_file}${NC}"
    else
        echo -e "${RED}Backup file not found${NC}"
    fi
}

# Run tests
run_tests() {
    echo -e "\n${YELLOW}Running tests...${NC}"
    
    # Backend tests
    echo -e "\n${BLUE}Backend tests:${NC}"
    cd ../kronos-eam-backend
    if [ -f "venv/bin/activate" ]; then
        source venv/bin/activate
    fi
    pytest
    
    # Frontend tests
    echo -e "\n${BLUE}Frontend tests:${NC}"
    cd ../kronos-eam-react
    npm test -- --watchAll=false
}

# Update dependencies
update_dependencies() {
    echo -e "\n${YELLOW}Updating dependencies...${NC}"
    
    # Backend dependencies
    echo -e "\n${BLUE}Updating backend dependencies:${NC}"
    cd ../kronos-eam-backend
    if [ -f "venv/bin/activate" ]; then
        source venv/bin/activate
    fi
    pip install --upgrade pip
    pip install -r requirements.txt --upgrade
    
    # Frontend dependencies
    echo -e "\n${BLUE}Updating frontend dependencies:${NC}"
    cd ../kronos-eam-react
    npm update
    
    echo -e "${GREEN}Dependencies updated!${NC}"
}

# Main loop
while true; do
    show_menu
    read choice
    
    case $choice in
        1) start_local ;;
        2) stop_local ;;
        3) restart_local ;;
        4) status_local ;;
        5) view_local_logs ;;
        6) deploy_gcp ;;
        7) stop_gcp ;;
        8) status_gcp ;;
        9) view_gcp_logs ;;
        10) scale_gcp ;;
        11) init_database ;;
        12) backup_database ;;
        13) restore_database ;;
        14) run_tests ;;
        15) update_dependencies ;;
        0) 
            echo -e "${GREEN}Goodbye!${NC}"
            exit 0 
            ;;
        *)
            echo -e "${RED}Invalid option. Please try again.${NC}"
            ;;
    esac
    
    echo -e "\n${YELLOW}Press Enter to continue...${NC}"
    read
done
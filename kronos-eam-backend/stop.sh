#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🛑 Stopping Kronos EAM Backend Services${NC}"
echo "========================================"

# Stop the FastAPI application
echo -e "${YELLOW}Stopping FastAPI application...${NC}"
pkill -f "uvicorn app.main:app" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ FastAPI application stopped${NC}"
else
    echo -e "${YELLOW}✗ FastAPI application was not running${NC}"
fi

# Check if we should stop Docker services
STOP_DOCKER=true
HELP=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --keep-docker)
            STOP_DOCKER=false
            shift
            ;;
        -h|--help)
            HELP=true
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            HELP=true
            shift
            ;;
    esac
done

# Show help if requested
if [ "$HELP" = true ]; then
    echo ""
    echo "Usage: ./stop.sh [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --keep-docker  Keep Docker services running"
    echo "  -h, --help     Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./stop.sh               # Stop all services"
    echo "  ./stop.sh --keep-docker # Stop only the backend, keep databases running"
    echo ""
    exit 0
fi

# Stop Docker services if requested
if [ "$STOP_DOCKER" = true ]; then
    echo -e "${YELLOW}Stopping Docker services...${NC}"
    
    # Check if docker-compose.temp.yml exists (from custom start)
    if [ -f "docker-compose.temp.yml" ]; then
        docker-compose -f docker-compose.temp.yml down
        rm -f docker-compose.temp.yml
    else
        # Stop using default docker-compose.yml
        docker-compose down
    fi
    
    echo -e "${GREEN}✓ Docker services stopped${NC}"
else
    echo -e "${YELLOW}Docker services kept running (--keep-docker flag)${NC}"
fi

echo ""
echo -e "${GREEN}All services stopped successfully!${NC}"
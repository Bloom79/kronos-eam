#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Kronos EAM Backend Development Server${NC}"
echo "================================================"

# Parse command line arguments
START_REDIS=true
START_QDRANT=true
SKIP_DEPS=false
HELP=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --no-redis)
            START_REDIS=false
            shift
            ;;
        --no-qdrant)
            START_QDRANT=false
            shift
            ;;
        --no-redis-qdrant)
            START_REDIS=false
            START_QDRANT=false
            shift
            ;;
        --skip-deps)
            SKIP_DEPS=true
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
    echo "Usage: ./start.sh [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --no-redis         Don't start Redis service"
    echo "  --no-qdrant        Don't start Qdrant service"
    echo "  --no-redis-qdrant  Don't start Redis or Qdrant services"
    echo "  --skip-deps        Skip dependency installation"
    echo "  -h, --help         Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./start.sh                    # Start all services"
    echo "  ./start.sh --no-redis         # Start without Redis"
    echo "  ./start.sh --no-qdrant        # Start without Qdrant"
    echo "  ./start.sh --no-redis-qdrant  # Start only PostgreSQL and backend"
    echo "  ./start.sh --skip-deps        # Skip pip install step"
    echo ""
    exit 0
fi

# Display configuration
echo -e "${YELLOW}Configuration:${NC}"
echo -e "  PostgreSQL: ${GREEN}✓ Will start${NC}"
echo -e "  Redis:      $([ "$START_REDIS" = true ] && echo -e "${GREEN}✓ Will start${NC}" || echo -e "${YELLOW}✗ Skipped${NC}")"
echo -e "  Qdrant:     $([ "$START_QDRANT" = true ] && echo -e "${GREEN}✓ Will start${NC}" || echo -e "${YELLOW}✗ Skipped${NC}")"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
echo -e "${BLUE}Activating virtual environment...${NC}"
source venv/bin/activate

# Install dependencies (unless skipped)
if [ "$SKIP_DEPS" = false ]; then
    echo -e "${BLUE}Installing dependencies...${NC}"
    pip install -r requirements.txt
else
    echo -e "${YELLOW}Skipping dependency installation${NC}"
fi

# Create temporary docker-compose file based on selected services
TEMP_COMPOSE="docker-compose.temp.yml"
cat > $TEMP_COMPOSE << 'EOF'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: kronos
      POSTGRES_PASSWORD: kronos_password
      POSTGRES_DB: kronos_eam
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U kronos"]
      interval: 10s
      timeout: 5s
      retries: 5
EOF

# Add Redis if enabled
if [ "$START_REDIS" = true ]; then
    cat >> $TEMP_COMPOSE << 'EOF'

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass redis_password
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
EOF
fi

# Add Qdrant if enabled
if [ "$START_QDRANT" = true ]; then
    cat >> $TEMP_COMPOSE << 'EOF'

  qdrant:
    image: qdrant/qdrant
    ports:
      - "6333:6333"
    volumes:
      - qdrant_data:/qdrant/storage
    environment:
      - QDRANT__SERVICE__HTTP_PORT=6333
      - QDRANT__SERVICE__ENABLE_TLS=false
EOF
fi

# Add volumes section
echo "" >> $TEMP_COMPOSE
echo "volumes:" >> $TEMP_COMPOSE
echo "  postgres_data:" >> $TEMP_COMPOSE
[ "$START_REDIS" = true ] && echo "  redis_data:" >> $TEMP_COMPOSE
[ "$START_QDRANT" = true ] && echo "  qdrant_data:" >> $TEMP_COMPOSE

# Start services
echo -e "${BLUE}Starting database services...${NC}"
docker-compose -f $TEMP_COMPOSE up -d

# Wait for services to be ready
echo -e "${BLUE}Waiting for services to be ready...${NC}"
sleep 5

# Check service health
echo -e "${BLUE}Checking service health...${NC}"
docker-compose -f $TEMP_COMPOSE ps

# Set environment variables for disabled services
if [ "$START_REDIS" = false ]; then
    export DISABLE_REDIS=true
    echo -e "${YELLOW}Redis disabled - background tasks will not run${NC}"
fi

if [ "$START_QDRANT" = false ]; then
    export DISABLE_QDRANT=true
    echo -e "${YELLOW}Qdrant disabled - AI features will not be available${NC}"
fi

# Clean up temporary compose file
rm -f $TEMP_COMPOSE

# Run migrations (when we have them)
# alembic upgrade head

# Start the application
echo -e "${GREEN}Starting FastAPI application...${NC}"
echo ""
export PYTHONPATH=/home/bloom/sentrics/kronos-eam-backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
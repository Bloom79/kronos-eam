#!/bin/bash
# Production Database Setup Script for Kronos EAM Backend

echo "=== Kronos EAM Database Setup ==="
echo "This script will initialize the database for production deployment"
echo ""

# Check if we're in the correct directory
if [ ! -f "requirements.txt" ]; then
    echo "ERROR: Please run this script from the kronos-eam-backend directory"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies if needed
echo "Checking dependencies..."
pip install -q -r requirements.txt

# Run the database initialization
echo ""
echo "Initializing database..."
python scripts/init_database.py

# Run any pending migrations
if [ -d "migrations" ]; then
    echo ""
    echo "Checking for database migrations..."
    # If using Alembic
    if command -v alembic &> /dev/null; then
        echo "Running Alembic migrations..."
        alembic upgrade head
    fi
fi

echo ""
echo "=== Database Setup Complete ==="
echo ""
echo "Default credentials:"
echo "  Email: admin@demo.com"
echo "  Password: admin123"
echo "  Tenant: demo"
echo ""
echo "To start the backend server:"
echo "  ./run_api.sh"
echo ""
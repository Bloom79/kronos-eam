#!/bin/bash
# Database migration script for local development

set -e

echo "Running database migrations..."

# Check if we're in the backend directory
if [ ! -f "alembic.ini" ]; then
    echo "Error: alembic.ini not found. Please run this script from the kronos-eam-backend directory."
    exit 1
fi

# Run migrations
echo "Applying migrations..."
alembic upgrade head

# Run data initialization
echo "Initializing data..."
python scripts/init_data.py

echo "Migration complete!"
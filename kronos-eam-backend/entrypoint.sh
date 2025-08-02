#!/bin/sh
set -e

echo "Starting Kronos EAM Backend..."

# Set Python path
export PYTHONPATH=/app:$PYTHONPATH

# Use PORT environment variable (required by Cloud Run)
PORT=${PORT:-8000}
echo "Will listen on port: $PORT"

# Check database alignment (optional - for development)
if [ "$CHECK_DB_ALIGNMENT" = "true" ]; then
    echo "Checking database alignment..."
    python scripts/check_db_alignment.py || echo "Warning: Database alignment check failed"
fi

# Run database migrations with timeout
echo "Running database migrations..."
timeout 60 alembic upgrade head || {
    echo "Warning: Database migration failed or timed out"
    if [ "$ENVIRONMENT" = "production" ]; then
        echo "Continuing anyway in production..."
    else
        exit 1
    fi
}

# Initialize data if this is a fresh database (with timeout)
echo "Initializing data..."
timeout 30 python scripts/init_data.py || echo "Data initialization skipped (may already exist or timed out)"

# Start the application
echo "Starting application server on port $PORT..."
exec uvicorn main:app --host 0.0.0.0 --port $PORT
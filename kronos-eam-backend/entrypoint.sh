#!/bin/sh
# Don't use set -e to allow commands to fail

echo "=== Starting Kronos EAM Backend ==="
echo "PORT: ${PORT:-8000}"
echo "ENVIRONMENT: ${ENVIRONMENT:-development}"
echo "DATABASE_URL: ${DATABASE_URL:0:30}..." # Show start of DB URL for debugging
echo "Working directory: $(pwd)"
echo "Python version: $(python --version)"
echo "Current time: $(date)"

# Change to app directory
cd /app

# Only run migrations in non-production or if explicitly enabled
if [ "$ENVIRONMENT" != "production" ] || [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "Running database migrations..."
    # Add timeout to prevent hanging
    timeout 30s alembic upgrade head 2>&1 || echo "Migration failed or timed out - continuing anyway"
else
    echo "Skipping migrations in production (set RUN_MIGRATIONS=true to enable)"
fi

# Skip data initialization in production unless explicitly enabled
if [ "$ENVIRONMENT" != "production" ] || [ "$RUN_INIT_DATA" = "true" ]; then
    echo "Initializing data..."
    timeout 10s python scripts/init_data.py 2>&1 || echo "Data init failed or timed out - continuing anyway"
else
    echo "Skipping data initialization in production (set RUN_INIT_DATA=true to enable)"
fi

# Start the application immediately
echo "Starting uvicorn on port ${PORT:-8000}..."
echo "Binding to 0.0.0.0:${PORT:-8000}"
exec python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --log-level info
#!/bin/sh
set -e

echo "=== Starting Kronos EAM Backend ==="
echo "PORT: ${PORT:-8000}"
echo "ENVIRONMENT: ${ENVIRONMENT:-development}"
echo "Working directory: $(pwd)"
echo "Python version: $(python --version)"

# Change to app directory
cd /app

# Run migrations (allow to fail in production)
echo "Running database migrations..."
if alembic upgrade head; then
    echo "Migrations completed successfully"
else
    echo "Migrations failed"
    if [ "$ENVIRONMENT" = "production" ]; then
        echo "Continuing anyway in production..."
    else
        exit 1
    fi
fi

# Initialize data (allow to fail)
echo "Initializing data..."
if python scripts/init_data.py; then
    echo "Data initialization completed"
else
    echo "Data initialization failed or skipped"
fi

# Start the application
echo "Starting uvicorn on port ${PORT:-8000}..."
exec python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --log-level info
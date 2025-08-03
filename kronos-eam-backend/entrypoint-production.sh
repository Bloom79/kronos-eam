#!/bin/sh
# Production-optimized entrypoint - skip all initialization

echo "=== Starting Kronos EAM Backend (Production) ==="
echo "PORT: ${PORT:-8000}"
echo "ENVIRONMENT: production"
echo "Starting time: $(date)"

# Change to app directory
cd /app

# Skip all initialization in production for fastest startup
echo "Skipping migrations and data initialization for fast startup"
echo "To run migrations, deploy with RUN_MIGRATIONS=true"

# Start the application immediately
echo "Starting uvicorn on port ${PORT:-8000}..."
exec python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --log-level info
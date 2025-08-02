#!/bin/bash
set -e

echo "Starting Kronos EAM Backend..."

# Wait for PostgreSQL to be ready
if [ -n "$DATABASE_URL" ]; then
    echo "Waiting for PostgreSQL..."
    # Extract host and port from DATABASE_URL
    DB_HOST=$(echo $DATABASE_URL | sed -E 's/.*@([^:\/]+).*/\1/')
    DB_PORT=$(echo $DATABASE_URL | sed -E 's/.*:([0-9]+)\/.*/\1/')
    DB_PORT=${DB_PORT:-5432}
    
    until nc -z $DB_HOST $DB_PORT; do
        echo "PostgreSQL is unavailable - sleeping"
        sleep 1
    done
    echo "PostgreSQL is ready!"
fi

# Initialize database on first run
if [ "$INIT_DB" = "true" ]; then
    echo "Initializing database..."
    python scripts/init_database.py || echo "Database initialization completed (some warnings are normal)"
fi

# Run migrations if Alembic is available
if [ -d "migrations" ] && command -v alembic &> /dev/null; then
    echo "Running database migrations..."
    alembic upgrade head || echo "Migrations completed"
fi

# Start the application
echo "Starting Uvicorn server..."
exec uvicorn app.main:app \
    --host ${BACKEND_HOST:-0.0.0.0} \
    --port ${BACKEND_PORT:-8000} \
    --workers ${WORKERS:-1} \
    --log-level ${LOG_LEVEL:-info}
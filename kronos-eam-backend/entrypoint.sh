#!/bin/sh
set -e

echo "Starting Kronos EAM Backend..."

# Check database alignment (optional - for development)
if [ "$CHECK_DB_ALIGNMENT" = "true" ]; then
    echo "Checking database alignment..."
    python scripts/check_db_alignment.py || echo "Warning: Database alignment check failed"
fi

# Run database migrations
echo "Running database migrations..."
alembic upgrade head

# Initialize data if this is a fresh database
echo "Initializing data..."
python scripts/init_data.py || echo "Data initialization skipped (may already exist)"

# Start the application
echo "Starting application server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
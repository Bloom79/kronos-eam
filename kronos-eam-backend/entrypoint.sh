#!/bin/sh
set -e

echo "Starting Kronos EAM Backend..."

# Set Python path
export PYTHONPATH=/app:$PYTHONPATH

# Use PORT environment variable (required by Cloud Run)
PORT=${PORT:-8000}
echo "Will listen on port: $PORT"

# Check if we're in production
IS_PRODUCTION=false
if [ "$ENVIRONMENT" = "production" ]; then
    IS_PRODUCTION=true
    echo "Running in PRODUCTION mode"
fi

# Function to run with timeout using Python
run_with_timeout() {
    local timeout=$1
    local description=$2
    shift 2
    
    echo "Running: $description (timeout: ${timeout}s)..."
    python -c "
import subprocess
import sys
import signal

def timeout_handler(signum, frame):
    print('Operation timed out after ${timeout} seconds')
    sys.exit(1)

signal.signal(signal.SIGALRM, timeout_handler)
signal.alarm(${timeout})

try:
    result = subprocess.run(['$@'], capture_output=True, text=True)
    signal.alarm(0)
    
    if result.stdout:
        print(result.stdout)
    if result.stderr:
        print(result.stderr, file=sys.stderr)
    
    sys.exit(result.returncode)
except Exception as e:
    print(f'Error: {e}', file=sys.stderr)
    sys.exit(1)
" || {
        echo "Warning: $description failed"
        if [ "$IS_PRODUCTION" = "true" ]; then
            echo "Continuing anyway in production..."
            return 0
        else
            return 1
        fi
    }
}

# Check database connectivity first
echo "Checking database connectivity..."
python -c "
import os
from sqlalchemy import create_engine, text

try:
    db_url = os.environ.get('DATABASE_URL', '')
    if db_url:
        engine = create_engine(db_url)
        with engine.connect() as conn:
            result = conn.execute(text('SELECT 1'))
            print('Database connection successful')
    else:
        print('WARNING: DATABASE_URL not set')
except Exception as e:
    print(f'Database connection error: {e}')
    if os.environ.get('ENVIRONMENT') == 'production':
        print('Continuing anyway in production...')
    else:
        exit(1)
"

# Run database migrations
if command -v alembic >/dev/null 2>&1; then
    run_with_timeout 60 "database migrations" alembic upgrade head
else
    echo "Warning: alembic not found, skipping migrations"
fi

# Initialize data if this is a fresh database
if [ -f "scripts/init_data.py" ]; then
    run_with_timeout 30 "data initialization" python scripts/init_data.py
else
    echo "Warning: init_data.py not found, skipping data initialization"
fi

# Start the application
echo "Starting application server on port $PORT..."
echo "Python path: $PYTHONPATH"
echo "Working directory: $(pwd)"
echo "Files in current directory:"
ls -la

# Try to start with app.main first, fall back to main if that fails
if [ -f "app/main.py" ]; then
    echo "Found app/main.py, trying app.main:app"
    exec python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT --log-level info
else
    echo "No app/main.py found, trying main:app"
    exec python -m uvicorn main:app --host 0.0.0.0 --port $PORT --log-level info
fi
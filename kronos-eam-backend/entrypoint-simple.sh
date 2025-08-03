#!/bin/sh
# Ultra-simple entrypoint for debugging

echo "Starting Kronos Backend..."
echo "PORT=$PORT"
cd /app
exec python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
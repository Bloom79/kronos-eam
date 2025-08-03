#!/bin/sh
# Ultra-minimal entrypoint - no database, no initialization, just uvicorn
echo "Starting minimal Kronos Backend on PORT ${PORT:-8000}"
cd /app
exec python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
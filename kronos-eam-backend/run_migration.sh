#!/bin/bash
# Run database migrations with proper environment

echo "Running database migrations..."

# Set environment to avoid protobuf issues
export PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION=python

# Navigate to backend directory
cd /home/bloom/sentrics/kronos-eam-backend

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Run migrations
python3 -m pip install cffi
alembic upgrade head

echo "Migrations completed!"
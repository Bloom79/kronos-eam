#!/bin/bash
# Run API server with proper environment

export PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION=python
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
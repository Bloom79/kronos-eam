#!/usr/bin/env python3
"""
Local development server for Kronos EAM Backend
Run this to test the Smart Assistant locally without GCP dependencies
"""

import os
import sys
import uvicorn
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# Set environment variables for local development
os.environ['ENVIRONMENT'] = 'development'
os.environ['DATABASE_URL'] = 'sqlite:///./local_kronos.db'
os.environ['SECRET_KEY'] = 'local-development-secret-key-change-in-production'
os.environ['ALGORITHM'] = 'HS256'
os.environ['ACCESS_TOKEN_EXPIRE_MINUTES'] = '30'

# AI Provider settings (use dummy keys for local testing)
os.environ['OPENAI_API_KEY'] = 'sk-dummy-openai-key-for-local-testing'
os.environ['GOOGLE_AI_API_KEY'] = 'dummy-google-ai-key'
os.environ['ANTHROPIC_API_KEY'] = 'dummy-anthropic-key'

# Redis settings for local development
os.environ['REDIS_URL'] = 'redis://localhost:6379/0'

# Disable SSL verification for local development
os.environ['PYTHONHTTPSVERIFY'] = '0'

if __name__ == "__main__":
    print("🚀 Starting Kronos EAM Backend (Local Development)")
    print("=" * 50)
    print(f"Environment: {os.environ['ENVIRONMENT']}")
    print(f"Database: {os.environ['DATABASE_URL']}")
    print(f"API Base URL: http://localhost:8000")
    print(f"API Docs: http://localhost:8000/docs")
    print(f"Smart Assistant: http://localhost:8000/api/v1/smart-assistant")
    print("=" * 50)
    
    # Run the server
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=[str(project_root / "app")],
        log_level="info"
    )
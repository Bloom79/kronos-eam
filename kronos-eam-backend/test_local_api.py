#!/usr/bin/env python3
"""
Test script for local API server
Tests the Smart Assistant endpoints locally
"""

import asyncio
import aiohttp
import json
import sys
from datetime import datetime

BASE_URL = "http://localhost:8000"

async def test_endpoint(session, method, endpoint, data=None, description=""):
    """Test a single endpoint"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method.upper() == "GET":
            async with session.get(url) as response:
                result = await response.json()
                status = response.status
        elif method.upper() == "POST":
            async with session.post(url, json=data) as response:
                result = await response.json()
                status = response.status
        
        print(f"✅ {method} {endpoint} - {status} - {description}")
        return result
        
    except Exception as e:
        print(f"❌ {method} {endpoint} - ERROR: {e}")
        return None

async def test_api():
    """Test all Smart Assistant endpoints"""
    
    print("🧪 Testing Kronos EAM Smart Assistant API")
    print("=" * 50)
    
    async with aiohttp.ClientSession() as session:
        # Test basic endpoints
        print("\n1. Basic Endpoints")
        print("-" * 20)
        
        await test_endpoint(session, "GET", "/", description="Root endpoint")
        await test_endpoint(session, "GET", "/health", description="Health check")
        await test_endpoint(session, "GET", "/demo/plant", description="Demo plant data")
        await test_endpoint(session, "GET", "/demo/test-schemas", description="Test schemas")
        
        # Test Smart Assistant endpoints
        print("\n2. Smart Assistant Endpoints")
        print("-" * 30)
        
        await test_endpoint(session, "GET", "/api/v1/smart-assistant/health", description="Smart Assistant health")
        await test_endpoint(session, "GET", "/api/v1/smart-assistant/portal-urls", description="Portal URLs")
        await test_endpoint(session, "GET", "/api/v1/smart-assistant/supported-forms", description="Supported forms")
        await test_endpoint(session, "GET", "/api/v1/smart-assistant/calculation-metadata", description="Calculation metadata")
        
        # Test form generation
        print("\n3. Form Generation")
        print("-" * 20)
        
        form_request = {
            "plant_id": 1,
            "portal": "gse",
            "form_type": "rid_application",
            "include_calculations": True,
            "include_workflow": True
        }
        
        await test_endpoint(
            session, "POST", 
            "/api/v1/smart-assistant/generate-forms", 
            data=form_request,
            description="Generate GSE RID form"
        )
        
        # Test calculations
        print("\n4. Calculations")
        print("-" * 15)
        
        calc_request = {
            "calculation_type": "gse_incentives",
            "plant_id": 1,
            "calculation_data": {
                "tariff_type": "RID",
                "annual_production_kwh": 65000
            }
        }
        
        await test_endpoint(
            session, "POST",
            "/api/v1/smart-assistant/calculate",
            data=calc_request,
            description="Calculate GSE incentives"
        )
        
        # Test workflow guide
        print("\n5. Workflow Guide")
        print("-" * 18)
        
        await test_endpoint(
            session, "GET",
            "/api/v1/smart-assistant/workflow-guide/gse/rid_application?plant_id=1",
            description="Get GSE RID workflow guide"
        )
        
        # Test data mapping
        print("\n6. Data Mapping")
        print("-" * 15)
        
        await test_endpoint(
            session, "GET",
            "/api/v1/smart-assistant/data-mapping/gse/rid_application",
            description="Get GSE RID data mapping"
        )
        
        # Test task creation
        print("\n7. Task Management")
        print("-" * 18)
        
        task_request = {
            "task_type": "form_submission",
            "portal": "gse",
            "plant_id": 1,
            "title": "Submit GSE RID Application",
            "description": "Complete RID application for demo plant",
            "priority": "high"
        }
        
        await test_endpoint(
            session, "POST",
            "/api/v1/smart-assistant/create-task",
            data=task_request,
            description="Create submission task"
        )
        
        await test_endpoint(
            session, "GET",
            "/api/v1/smart-assistant/tasks",
            description="Get tasks list"
        )

async def test_pdf_download():
    """Test PDF form download"""
    print("\n8. PDF Download Test")
    print("-" * 20)
    
    try:
        async with aiohttp.ClientSession() as session:
            # Try to download a form
            url = f"{BASE_URL}/api/v1/smart-assistant/download-form/gse_rid_application_1_12345678/0"
            async with session.get(url) as response:
                if response.status == 200:
                    content = await response.read()
                    print(f"✅ PDF Download - {response.status} - Downloaded {len(content)} bytes")
                else:
                    print(f"⚠️ PDF Download - {response.status} - {await response.text()}")
    except Exception as e:
        print(f"❌ PDF Download - ERROR: {e}")

async def main():
    """Run all tests"""
    print("Starting Local API Tests...")
    print("Make sure the server is running: python app/main_local.py")
    print()
    
    # Test if server is running
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{BASE_URL}/health") as response:
                if response.status != 200:
                    print("❌ Server is not running or not healthy")
                    sys.exit(1)
    except Exception:
        print("❌ Cannot connect to server. Make sure it's running on port 8000")
        sys.exit(1)
    
    # Run tests
    await test_api()
    await test_pdf_download()
    
    print("\n" + "=" * 50)
    print("✅ All tests completed!")
    print("\nTo explore the API interactively:")
    print("📖 API Documentation: http://localhost:8000/docs")
    print("📋 ReDoc: http://localhost:8000/redoc")

if __name__ == "__main__":
    asyncio.run(main())
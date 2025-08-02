#!/usr/bin/env python3
"""
Simple API test for form generation endpoint
"""

import asyncio
import sys
import os
sys.path.insert(0, os.path.abspath('.'))

# Set environment variables for testing
os.environ['OPENAI_API_KEY'] = 'test_key'
os.environ['ENVIRONMENT'] = 'test'

from fastapi import FastAPI
from fastapi.testclient import TestClient
import uvloop

# Create a minimal app for testing
app = FastAPI()

# Import and mount the smart assistant router
from app.api.v1.endpoints.smart_assistant import router as smart_assistant_router

# Mount without authentication dependencies for testing
@app.post("/api/v1/smart-assistant/generate-forms")
async def test_generate_forms(request: dict):
    """Test endpoint that bypasses authentication"""
    from app.schemas.smart_assistant import FormGenerationRequest, PortalType, FormType
    from app.services.smart_assistant.smart_assistant_service import SmartAssistantService
    
    # Create request object
    form_request = FormGenerationRequest(
        plant_id=request.get("plant_id", 1),
        portal=PortalType(request.get("portal", "gse")),
        form_type=FormType(request.get("form_type", "rid_application")),
        include_calculations=request.get("include_calculations", True),
        include_workflow=request.get("include_workflow", True)
    )
    
    # Create service and process request
    service = SmartAssistantService()
    
    # Mock the plant_service to avoid database dependency
    class MockPlantService:
        async def get_impianto(self, plant_id):
            class MockAnagrafica:
                def __init__(self):
                    self.codice_censimp = "IT001E00123456"
                    self.comune = "Roma"
                    self.provincia = "RM"
                    self.regione = "Lazio"
                    self.codice_pod = "IT00000000123456A"  # Format: IT + 14 digits + 1 letter
                    self.proprietario = "Test Company S.r.l."
                    self.codice_fiscale = "12345678901"
                    self.indirizzo = "Via Roma 123"
                    self.pec = "test@pec.it"
                    self.telefono = "06-12345678"
                    self.tecnologia = "Fotovoltaico"
                    self.tensione_connessione = "0.4 kV"
                    self.tipo_allacciamento = "Trifase"
            
            class MockPlant:
                def __init__(self):
                    self.id = plant_id
                    self.tenant_id = "demo"
                    self.nome = "Plant Test"
                    self.potenza_installata = 50.0
                    from datetime import datetime
                    self.data_attivazione = datetime(2023, 1, 1)
                    self.anagrafica = MockAnagrafica()
            
            return MockPlant()
    
    # Replace the service's plant_service
    service.plant_service = MockPlantService()
    
    try:
        result = await service.process_form_generation_request(form_request, "demo")
        
        # Convert PDF bytes to base64 for JSON serialization
        import base64
        result_dict = result.model_dump()
        
        if result_dict.get("package") and result_dict["package"].get("forms"):
            # Forms are stored as List[bytes], convert to base64
            encoded_forms = []
            for i, form_bytes in enumerate(result_dict["package"]["forms"]):
                if isinstance(form_bytes, bytes):
                    encoded_forms.append({
                        "content": base64.b64encode(form_bytes).decode('utf-8'),
                        "content_length": len(form_bytes),
                        "name": result_dict["package"]["form_names"][i] if i < len(result_dict["package"]["form_names"]) else f"form_{i}.pdf"
                    })
            result_dict["package"]["forms"] = encoded_forms
        
        return result_dict
    except Exception as e:
        import traceback
        return {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }


def test_form_generation():
    """Test the form generation endpoint"""
    client = TestClient(app)
    
    # Test request data
    request_data = {
        "plant_id": 1,
        "portal": "gse",
        "form_type": "rid_application",
        "include_calculations": True,
        "include_workflow": True
    }
    
    print("Testing Form Generation Endpoint")
    print("=" * 50)
    print(f"Request: {request_data}")
    print()
    
    # Make the request
    response = client.post("/api/v1/smart-assistant/generate-forms", json=request_data)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 200:
        data = response.json()
        if data.get("success"):
            print("\n✅ Form generation successful!")
            
            package = data.get("package", {})
            if package.get("forms"):
                print(f"\nGenerated Forms: {len(package['forms'])}")
                for form in package["forms"]:
                    content_length = form.get('content_length', 0) or len(form.get('content', ''))
                    print(f"  - {form['name']}: {content_length} bytes")
            
            if package.get("calculations"):
                print(f"\nCalculations:")
                calc = package["calculations"]
                if isinstance(calc, dict):
                    for key, value in calc.items():
                        if key != "calculations":  # Skip nested calculations list
                            print(f"  {key}: {value}")
            
            if package.get("workflow_guide"):
                workflow = package["workflow_guide"]
                print(f"\nWorkflow Steps: {len(workflow.get('steps', []))}")
                for step in workflow.get("steps", []):
                    print(f"  {step['step_number']}. {step['title']} ({step['estimated_time']} min)")
        else:
            print("\n❌ Form generation failed!")
            print(f"Error: {data.get('error')}")
            if data.get('traceback'):
                print(f"\nTraceback:\n{data['traceback']}")
    else:
        print(f"\n❌ Request failed with status {response.status_code}")
        print(f"Error: {response.text}")


if __name__ == "__main__":
    # Set up asyncio with uvloop for better performance
    asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())
    
    # Run the test
    test_form_generation()
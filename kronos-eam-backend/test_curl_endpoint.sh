#!/bin/bash

# Start the FastAPI server in the background with modified auth
echo "Starting test server..."

# Create a simple test server that bypasses authentication
cat > test_server.py << 'EOF'
import asyncio
import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

# Import the smart assistant functionality
from app.api.v1.endpoints.smart_assistant import router as smart_assistant_router
from app.schemas.smart_assistant import FormGenerationRequest, PortalType, FormType
from app.services.smart_assistant.smart_assistant_service import SmartAssistantService

# Create endpoint that bypasses auth
@app.post("/api/v1/smart-assistant/generate-forms")
async def generate_forms(request: Request):
    """Test endpoint that bypasses authentication"""
    body = await request.json()
    
    # Create request object
    form_request = FormGenerationRequest(
        plant_id=body.get("plant_id", 1),
        portal=PortalType(body.get("portal", "gse")),
        form_type=FormType(body.get("form_type", "rid_application")),
        include_calculations=body.get("include_calculations", True),
        include_workflow=body.get("include_workflow", True)
    )
    
    # Create service
    service = SmartAssistantService()
    
    # Mock the plant_service
    class MockPlantService:
        async def get_impianto(self, plant_id):
            class MockAnagrafica:
                def __init__(self):
                    self.codice_censimp = "IT001E00123456"
                    self.comune = "Roma"
                    self.provincia = "RM"
                    self.regione = "Lazio"
                    self.codice_pod = "IT00000000123456A"
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
                    from datetime import datetime
                    self.id = plant_id
                    self.tenant_id = "demo"
                    self.nome = "Impianto Test"
                    self.potenza_installata = 50.0
                    self.data_attivazione = datetime(2023, 1, 1)
                    self.anagrafica = MockAnagrafica()
            
            return MockPlant()
    
    service.plant_service = MockPlantService()
    
    try:
        result = await service.process_form_generation_request(form_request, "demo")
        
        # Convert result to dict, handling bytes
        import base64
        result_dict = result.model_dump()
        
        if result_dict.get("package") and result_dict["package"].get("forms"):
            # Convert bytes to base64 for JSON response
            for i, form_bytes in enumerate(result_dict["package"]["forms"]):
                if isinstance(form_bytes, bytes):
                    result_dict["package"]["forms"][i] = base64.b64encode(form_bytes).decode('utf-8')
        
        # Use FastAPI's jsonable_encoder to handle datetime serialization
        from fastapi.encoders import jsonable_encoder
        return JSONResponse(content=jsonable_encoder(result_dict))
        
    except Exception as e:
        import traceback
        return JSONResponse(
            content={
                "success": False,
                "error": str(e),
                "traceback": traceback.format_exc()
            },
            status_code=500
        )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOF

# Start the test server
source venv/bin/activate
python test_server.py &
SERVER_PID=$!

# Wait for server to start
echo "Waiting for server to start..."
sleep 5

# Run the curl command
echo "Running curl command..."
curl -X POST "http://localhost:8000/api/v1/smart-assistant/generate-forms" \
  -H "X-Tenant-ID: demo" \
  -H "Content-Type: application/json" \
  -d '{
    "plant_id": 1,
    "portal": "gse",
    "form_type": "rid_application",
    "include_calculations": true,
    "include_workflow": true
  }' | python -m json.tool

# Kill the server
kill $SERVER_PID

echo "Test completed."
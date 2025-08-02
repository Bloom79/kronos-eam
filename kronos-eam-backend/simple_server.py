#!/usr/bin/env python3
"""
Simple Smart Assistant test server
Minimal setup for testing Smart Assistant functionality
"""

import os
import sys
import asyncio
import uvicorn
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any
import io

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# Set environment variables
os.environ['ENVIRONMENT'] = 'local'
os.environ['OPENAI_API_KEY'] = 'dummy-key'

# Create FastAPI app
app = FastAPI(
    title="Kronos EAM Smart Assistant (Test Server)",
    description="Simplified test server for Smart Assistant functionality",
    version="1.0.0"
)

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import Smart Assistant components
try:
    from app.schemas.smart_assistant import PortalType, FormType, FormGenerationRequest
    schemas_loaded = True
except Exception as e:
    print(f"Warning: Could not load schemas: {e}")
    schemas_loaded = False

# Mock plant data
DEMO_PLANT = {
    "id": 1,
    "nome": "Plant Solare Demo",
    "potenza_installata": 50.0,
    "data_attivazione": "2024-01-15",
    "anagrafica": {
        "codice_censimp": "IT001E00123456",
        "comune": "Roma",
        "provincia": "RM",
        "regione": "Lazio",
        "codice_pod": "IT001E00123456A",
        "proprietario": "Demo Energy S.r.l.",
        "codice_fiscale": "12345678901",
        "indirizzo": "Via Roma 123",
        "pec": "demo@pec.it",
        "telefono": "06-12345678",
        "tecnologia": "Fotovoltaico",
        "tensione_connessione": "0.4 kV",
        "tipo_allacciamento": "Trifase"
    }
}

# Request models
class FormRequest(BaseModel):
    plant_id: int
    portal: str
    form_type: str
    include_calculations: bool = True
    include_workflow: bool = True

class CalcRequest(BaseModel):
    calculation_type: str
    plant_id: int
    calculation_data: Dict[str, Any]

class TaskRequest(BaseModel):
    task_type: str
    portal: str
    plant_id: int
    title: str
    description: str
    priority: str = "medium"

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Kronos EAM Smart Assistant Test Server",
        "version": "1.0.0",
        "status": "running",
        "schemas_loaded": schemas_loaded,
        "endpoints": {
            "health": "GET /health",
            "portal_urls": "GET /api/v1/smart-assistant/portal-urls",
            "supported_forms": "GET /api/v1/smart-assistant/supported-forms",
            "generate_forms": "POST /api/v1/smart-assistant/generate-forms",
            "calculate": "POST /api/v1/smart-assistant/calculate",
            "demo_plant": "GET /demo/plant"
        }
    }

# Health check
@app.get("/health")
async def health():
    return {"status": "healthy", "schemas_loaded": schemas_loaded}

# Demo plant
@app.get("/demo/plant")
async def demo_plant():
    return DEMO_PLANT

# Portal URLs
@app.get("/api/v1/smart-assistant/portal-urls")
async def portal_urls():
    return {
        "portals": {
            "gse": {
                "name": "GSE - Gestore Servizi Energetici",
                "url": "https://areaclienti.gse.it",
                "auth_method": "SPID",
                "description": "RID, SSP, and incentive applications"
            },
            "terna": {
                "name": "Terna GAUDÌ",
                "url": "https://www.terna.it/it/sistema-elettrico/gaudi",
                "auth_method": "Digital Certificate",
                "description": "Plant registration and technical data"
            },
            "dso": {
                "name": "E-Distribuzione",
                "url": "https://www.e-distribuzione.it/it/area-clienti",
                "auth_method": "Username/Password + OTP",
                "description": "Connection requests and meter management"
            },
            "dogane": {
                "name": "Agenzia delle Dogane",
                "url": "https://www.adm.gov.it/portale/servizi-online",
                "auth_method": "SPID/CIE/CNS",
                "description": "UTF declarations and license management"
            }
        }
    }

# Supported forms
@app.get("/api/v1/smart-assistant/supported-forms")
async def supported_forms():
    if not schemas_loaded:
        return {"error": "Schemas not loaded", "forms_by_portal": {}}
    
    forms_by_portal = {
        "gse": [
            {"type": "rid_application", "name": "RID Application", "description": "Dedicated withdrawal regime"},
            {"type": "ssp_application", "name": "SSP Application", "description": "On-site exchange"},
        ],
        "terna": [
            {"type": "plant_registration", "name": "Plant Registration", "description": "GAUDÌ plant census"},
        ],
        "dso": [
            {"type": "tica_request", "name": "TICA Request", "description": "Connection cost estimate"},
        ],
        "dogane": [
            {"type": "utf_declaration", "name": "UTF Declaration", "description": "Annual energy tax declaration"},
        ]
    }
    
    return {"forms_by_portal": forms_by_portal}

# Generate forms
@app.post("/api/v1/smart-assistant/generate-forms")
async def generate_forms(request: FormRequest):
    try:
        # Create mock plant object
        class MockAnagrafica:
            def __init__(self, data):
                for k, v in data.items():
                    setattr(self, k, v)
        
        class MockPlant:
            def __init__(self, data):
                self.id = data["id"]
                self.nome = data["nome"]
                self.potenza_installata = data["potenza_installata"]
                self.data_attivazione = None
                self.anagrafica = MockAnagrafica(data["anagrafica"])
        
        plant = MockPlant(DEMO_PLANT)
        
        # Try to generate PDF
        try:
            from app.services.smart_assistant.pdf_generator import PDFFormGenerator
            generator = PDFFormGenerator()
            
            if request.portal == "gse" and request.form_type == "rid_application":
                pdf_data = await generator.generate_gse_rid_form(plant)
            elif request.portal == "terna" and request.form_type == "plant_registration":
                pdf_data = await generator.generate_terna_gaudi_form(plant)
            elif request.portal == "dso" and request.form_type == "tica_request":
                pdf_data = await generator.generate_dso_tica_request(plant)
            elif request.portal == "dogane" and request.form_type == "utf_declaration":
                pdf_data = await generator.generate_dogane_utf_declaration(plant, 65000.0)
            else:
                pdf_data = b"Mock PDF data"
            
            return {
                "success": True,
                "package": {
                    "package_id": f"{request.portal}_{request.form_type}_{request.plant_id}_12345678",
                    "portal": request.portal,
                    "form_type": request.form_type,
                    "plant_id": request.plant_id,
                    "form_names": [f"{request.portal}_{request.form_type}_demo.pdf"],
                    "pdf_size": len(pdf_data),
                    "status": "ready"
                }
            }
        except Exception as e:
            return {
                "success": True,
                "package": {
                    "package_id": f"{request.portal}_{request.form_type}_{request.plant_id}_12345678",
                    "portal": request.portal,
                    "form_type": request.form_type,
                    "plant_id": request.plant_id,
                    "form_names": [f"{request.portal}_{request.form_type}_demo.pdf"],
                    "pdf_size": 1024,
                    "status": "ready",
                    "note": f"Mock data (PDF generation error: {e})"
                }
            }
    except Exception as e:
        return {"success": False, "error": str(e)}

# Calculate
@app.post("/api/v1/smart-assistant/calculate")
async def calculate(request: CalcRequest):
    try:
        if request.calculation_type == "gse_incentives":
            power_kw = 50.0
            annual_production = request.calculation_data.get("annual_production_kwh", 65000)
            
            # Calculate tariff
            if power_kw <= 20:
                tariff = 0.103
            elif power_kw <= 200:
                tariff = 0.091
            else:
                tariff = 0.084
            
            annual_incentive = annual_production * tariff
            
            return {
                "success": True,
                "calculation_type": request.calculation_type,
                "result": {
                    "tariff_type": "RID",
                    "annual_production_kwh": annual_production,
                    "incentive_rate": tariff,
                    "annual_incentive": annual_incentive,
                    "contract_duration": 20,
                    "total_incentive": annual_incentive * 20
                }
            }
        
        elif request.calculation_type == "utf_fees":
            annual_production = request.calculation_data.get("annual_production_kwh", 65000)
            power_kw = 50.0
            
            return {
                "success": True,
                "calculation_type": request.calculation_type,
                "result": {
                    "annual_production_kwh": annual_production,
                    "annual_production_mwh": annual_production / 1000,
                    "utf_rate": 0.0125,
                    "annual_fee": (annual_production / 1000) * 0.0125 if power_kw > 20 else 0,
                    "is_exempt": power_kw <= 20
                }
            }
        
        else:
            return {"success": False, "error": f"Unknown calculation type: {request.calculation_type}"}
    
    except Exception as e:
        return {"success": False, "error": str(e)}

# Download form
@app.get("/api/v1/smart-assistant/download-form/{package_id}/{form_index}")
async def download_form(package_id: str, form_index: int):
    try:
        # Generate a simple PDF
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        from datetime import datetime
        
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        styles = getSampleStyleSheet()
        
        story = []
        story.append(Paragraph("Demo Form Generated by Kronos EAM", styles['Title']))
        story.append(Spacer(1, 20))
        story.append(Paragraph(f"Package ID: {package_id}", styles['Normal']))
        story.append(Paragraph(f"Form Index: {form_index}", styles['Normal']))
        story.append(Paragraph(f"Generated: {datetime.now().strftime('%d/%m/%Y %H:%M')}", styles['Normal']))
        
        doc.build(story)
        buffer.seek(0)
        
        return StreamingResponse(
            io.BytesIO(buffer.getvalue()),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=demo_form_{package_id}.pdf"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Create task
@app.post("/api/v1/smart-assistant/create-task")
async def create_task(request: TaskRequest):
    return {
        "task_id": f"task_{request.portal}_{request.plant_id}_12345678",
        "task_type": request.task_type,
        "portal": request.portal,
        "plant_id": request.plant_id,
        "title": request.title,
        "description": request.description,
        "priority": request.priority,
        "status": "pending",
        "created_at": "2024-01-01T10:00:00Z"
    }

# Get tasks
@app.get("/api/v1/smart-assistant/tasks")
async def get_tasks():
    return {
        "tasks": [
            {
                "task_id": "task_gse_1_12345678",
                "task_type": "form_submission",
                "portal": "gse",
                "plant_id": 1,
                "title": "Submit GSE RID Application",
                "description": "Complete RID application for demo plant",
                "priority": "high",
                "status": "pending",
                "created_at": "2024-01-01T10:00:00Z"
            }
        ],
        "total": 1
    }

# Workflow guide
@app.get("/api/v1/smart-assistant/workflow-guide/{portal}/{form_type}")
async def workflow_guide(portal: str, form_type: str, plant_id: int):
    return {
        "portal": portal,
        "form_type": form_type,
        "title": f"{portal.upper()} {form_type.replace('_', ' ').title()} Guide",
        "description": f"Step-by-step guide for {form_type} submission",
        "total_steps": 5,
        "estimated_total_time": 30,
        "steps": [
            {"step_number": 1, "title": "Access Portal", "estimated_time": 2},
            {"step_number": 2, "title": "Authenticate", "estimated_time": 5},
            {"step_number": 3, "title": "Navigate to Forms", "estimated_time": 3},
            {"step_number": 4, "title": "Upload Documents", "estimated_time": 10},
            {"step_number": 5, "title": "Submit Application", "estimated_time": 10}
        ]
    }

# Calculation metadata
@app.get("/api/v1/smart-assistant/calculation-metadata")
async def calculation_metadata():
    return {
        "supported_calculations": ["gse_incentives", "utf_fees", "connection_costs"],
        "gse_tariffs": {
            "RID": {"small": 0.103, "medium": 0.091, "large": 0.084}
        },
        "utf_rates": {"rate_per_mwh": 0.0125, "exemption_threshold_kw": 20.0}
    }

if __name__ == "__main__":
    print("🚀 Starting Kronos EAM Smart Assistant Test Server")
    print("=" * 50)
    print("Environment: Local Test")
    print("API Base URL: http://localhost:8001")
    print("API Docs: http://localhost:8001/docs")
    print("Demo Plant: http://localhost:8001/demo/plant")
    print("=" * 50)
    
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")
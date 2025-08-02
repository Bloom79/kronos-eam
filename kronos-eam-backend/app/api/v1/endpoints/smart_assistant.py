"""
Smart Assistant API Endpoints

RESTful endpoints for Smart Assistant functionality including:
- Form generation and pre-filling
- Portal submission preparation
- Workflow guidance
- Task management
"""

from datetime import datetime
from typing import Dict, Any, Optional, List
from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import StreamingResponse
import io

from app.core.auth import get_current_active_user
from app.schemas.auth import TokenData
from app.schemas.smart_assistant import (
    PortalType, FormType, SubmissionPackage,
    FormGenerationRequest, FormGenerationResponse,
    SubmissionTrackingData, SmartAssistantTask,
    CalculationEngineRequest, CalculationEngineResponse
)
from app.services.smart_assistant.smart_assistant_service import SmartAssistantService
from app.services.smart_assistant.calculation_engine import CalculationEngine

router = APIRouter()

# Initialize services
smart_assistant = SmartAssistantService()
calculation_engine = CalculationEngine()


@router.post("/prepare-submission", response_model=SubmissionPackage)
async def prepare_submission(
    portal: PortalType,
    form_type: FormType,
    plant_id: int,
    additional_data: Optional[Dict[str, Any]] = None,
    include_calculations: bool = True,
    include_workflow: bool = True,
    current_user: TokenData = Depends(get_current_active_user)
):
    """
    Prepare complete submission package for a portal
    """
    try:
        package = await smart_assistant.prepare_submission(
            tenant_id=current_user.tenant_id,
            plant_id=plant_id,
            portal=portal,
            form_type=form_type,
            additional_data=additional_data,
            include_calculations=include_calculations,
            include_workflow=include_workflow
        )
        return package
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to prepare submission: {str(e)}")


@router.post("/generate-forms", response_model=FormGenerationResponse)
async def generate_forms(
    request: FormGenerationRequest,
    current_user: TokenData = Depends(get_current_active_user)
):
    """
    Generate pre-filled forms for specific portal and form type
    """
    try:
        response = await smart_assistant.process_form_generation_request(
            request, current_user.tenant_id
        )
        return response
    
    except Exception as e:
        import traceback
        error_detail = f"Failed to generate forms: {str(e)}\n\nTraceback:\n{traceback.format_exc()}"
        raise HTTPException(status_code=500, detail=error_detail)


@router.get("/download-form/{package_id}/{form_index}")
async def download_form(
    package_id: str,
    form_index: int,
    current_user: TokenData = Depends(get_current_active_user)
):
    """
    Download a specific form from a submission package
    """
    # In a real implementation, you'd retrieve the package from database
    # For now, we'll return a placeholder response
    
    try:
        # This would retrieve from database/cache
        # package = await get_submission_package(package_id, current_user.tenant_id)
        
        # For demo purposes, generate a sample form
        from app.services.plant_service import PlantService
        from app.services.smart_assistant.pdf_generator import PDFFormGenerator
        
        # Extract info from package_id (simplified parsing)
        parts = package_id.split('_')
        if len(parts) >= 3:
            portal_str = parts[0]
            form_type_str = parts[1]
            plant_id = int(parts[2])
            
            portal = PortalType(portal_str)
            form_type = FormType(form_type_str)
            
            # Get plant and generate form
            plant_service = PlantService()
            plant = await plant_service.get_plant(plant_id)
            
            if not plant:
                raise HTTPException(status_code=404, detail="Plant not found")
            
            pdf_generator = PDFFormGenerator()
            form_data = await pdf_generator.generate_form_by_type(portal, form_type, plant)
            
            # Create streaming response
            form_stream = io.BytesIO(form_data)
            
            filename = f"{portal.value}_{form_type.value}_{plant.nome}.pdf"
            
            return StreamingResponse(
                io.BytesIO(form_data),
                media_type="application/pdf",
                headers={"Content-Disposition": f"attachment; filename={filename}"}
            )
        else:
            raise HTTPException(status_code=400, detail="Invalid package ID format")
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download form: {str(e)}")


@router.post("/calculate", response_model=CalculationEngineResponse)
async def calculate_values(
    request: CalculationEngineRequest,
    current_user: TokenData = Depends(get_current_active_user)
):
    """
    Perform calculations for form values
    """
    try:
        response = await calculation_engine.process_calculation_request(request)
        return response
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calculation failed: {str(e)}")


@router.get("/portal-urls")
async def get_portal_urls(
    current_user: TokenData = Depends(get_current_active_user)
):
    """
    Get portal URLs and access information
    """
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


@router.get("/supported-forms")
async def get_supported_forms(
    portal: Optional[PortalType] = None,
    current_user: TokenData = Depends(get_current_active_user)
):
    """
    Get supported form types by portal
    """
    forms_by_portal = {
        PortalType.GSE: [
            {"type": "rid_application", "name": "RID Application", "description": "Dedicated withdrawal regime"},
            {"type": "ssp_application", "name": "SSP Application", "description": "On-site exchange"},
            {"type": "antimafia_declaration", "name": "Anti-mafia Declaration", "description": "Required for incentives"},
        ],
        PortalType.TERNA: [
            {"type": "plant_registration", "name": "Plant Registration", "description": "GAUDÌ plant census"},
            {"type": "technical_update", "name": "Technical Data Update", "description": "Modify plant specifications"},
        ],
        PortalType.DSO: [
            {"type": "tica_request", "name": "TICA Request", "description": "Connection cost estimate"},
            {"type": "connection_activation", "name": "Connection Activation", "description": "Activate new connection"},
            {"type": "meter_request", "name": "Meter Request", "description": "Meter installation/replacement"},
        ],
        PortalType.DOGANE: [
            {"type": "utf_declaration", "name": "UTF Declaration", "description": "Annual energy tax declaration"},
            {"type": "license_application", "name": "License Application", "description": "UTF license for plants >20kW"},
        ]
    }
    
    if portal:
        return {"portal": portal, "forms": forms_by_portal.get(portal, [])}
    
    return {"forms_by_portal": forms_by_portal}


@router.post("/create-task", response_model=SmartAssistantTask)
async def create_task(
    task_type: str,
    portal: PortalType,
    plant_id: int,
    title: str,
    description: str,
    assigned_to: Optional[str] = None,
    due_date: Optional[datetime] = None,
    priority: str = "medium",
    task_data: Optional[Dict[str, Any]] = None,
    current_user: TokenData = Depends(get_current_active_user)
):
    """
    Create a new smart assistant task
    """
    try:
        task = await smart_assistant.create_task(
            tenant_id=current_user.tenant_id,
            task_type=task_type,
            portal=portal,
            plant_id=plant_id,
            title=title,
            description=description,
            assigned_to=assigned_to,
            due_date=due_date,
            priority=priority,
            task_data=task_data
        )
        return task
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create task: {str(e)}")


@router.get("/tasks")
async def get_tasks(
    portal: Optional[PortalType] = None,
    status: Optional[str] = None,
    assigned_to: Optional[str] = None,
    current_user: TokenData = Depends(get_current_active_user)
):
    """
    Get smart assistant tasks with optional filtering
    """
    # In a real implementation, this would query the database
    # For now, return sample data
    
    sample_tasks = [
        {
            "task_id": "task_gse_12345678",
            "task_type": "form_submission",
            "portal": "gse",
            "plant_id": 1,
            "title": "Submit RID Application for Solar Plant Alpha",
            "description": "Complete RID application submission to GSE portal",
            "status": "pending",
            "priority": "high",
            "due_date": "2024-01-31T23:59:59",
            "created_at": "2024-01-15T10:00:00"
        },
        {
            "task_id": "task_terna_87654321",
            "task_type": "data_sync",
            "portal": "terna",
            "plant_id": 2,
            "title": "Update GAUDÌ Registration",
            "description": "Sync latest plant data with Terna GAUDÌ system",
            "status": "in_progress",
            "priority": "medium",
            "due_date": "2024-02-15T23:59:59",
            "created_at": "2024-01-10T14:30:00"
        }
    ]
    
    # Apply filters
    filtered_tasks = sample_tasks
    
    if portal:
        filtered_tasks = [t for t in filtered_tasks if t["portal"] == portal.value]
    
    if status:
        filtered_tasks = [t for t in filtered_tasks if t["status"] == status]
    
    if assigned_to:
        filtered_tasks = [t for t in filtered_tasks if t.get("assigned_to") == assigned_to]
    
    return {"tasks": filtered_tasks, "total": len(filtered_tasks)}


@router.post("/track-submission")
async def track_submission(
    tracking_data: SubmissionTrackingData,
    current_user: TokenData = Depends(get_current_active_user)
):
    """
    Update submission tracking status
    """
    try:
        # In a real implementation, this would update the database
        # For now, return success response
        
        return {
            "success": True,
            "message": f"Submission {tracking_data.package_id} status updated to {tracking_data.status}",
            "updated_at": datetime.now().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to track submission: {str(e)}")


@router.get("/workflow-guide/{portal}/{form_type}")
async def get_workflow_guide(
    portal: PortalType,
    form_type: FormType,
    plant_id: int,
    current_user: TokenData = Depends(get_current_active_user)
):
    """
    Get detailed workflow guide for portal submission
    """
    try:
        # Get plant data for context
        from app.services.plant_service import PlantService
        plant_service = PlantService()
        plant = await plant_service.get_impianto(plant_id)
        
        if not plant:
            raise HTTPException(status_code=404, detail="Plant not found")
        
        # Generate workflow guide
        guide = smart_assistant._generate_workflow_guide(portal, form_type, plant)
        
        return guide
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate workflow guide: {str(e)}")


@router.get("/data-mapping/{portal}/{form_type}")
async def get_data_mapping(
    portal: PortalType,
    form_type: FormType,
    current_user: TokenData = Depends(get_current_active_user)
):
    """
    Get field mapping information for portal forms
    """
    try:
        mapping_description = smart_assistant.data_mapper.get_field_mapping_description(
            portal, form_type
        )
        
        return {
            "portal": portal,
            "form_type": form_type,
            "field_mappings": mapping_description
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get data mapping: {str(e)}")


@router.get("/calculation-metadata")
async def get_calculation_metadata(
    current_user: TokenData = Depends(get_current_active_user)
):
    """
    Get metadata about available calculations
    """
    try:
        metadata = calculation_engine.get_calculation_metadata()
        return metadata
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get calculation metadata: {str(e)}")


@router.get("/health")
async def health_check():
    """
    Health check endpoint for Smart Assistant service
    """
    return {
        "service": "smart_assistant",
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }
"""
Smart Assistant Service

Main orchestration service for the Smart Assistant functionality.
Coordinates PDF generation, data mapping, calculations, and workflow guidance.
"""

import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
import tempfile
import os
import logging

logger = logging.getLogger(__name__)

from app.models.plant import Plant
from app.schemas.smart_assistant import (
    PortalType, FormType, SubmissionPackage, SubmissionStatus,
    FormGenerationRequest, FormGenerationResponse, WorkflowGuide,
    WorkflowStep, SmartAssistantTask
)
from app.services.smart_assistant.pdf_generator import PDFFormGenerator
from app.services.smart_assistant.data_mapper import DataMapper
from app.services.smart_assistant.calculation_engine import CalculationEngine
from app.services.plant_service import PlantService


class SmartAssistantService:
    """
    Main service for Smart Assistant operations
    """
    
    def __init__(self):
        self.pdf_generator = PDFFormGenerator()
        self.data_mapper = DataMapper()
        self.calculation_engine = CalculationEngine()
        self.plant_service = PlantService()
    
    async def prepare_submission(
        self,
        tenant_id: str,
        plant_id: int,
        portal: PortalType,
        form_type: FormType,
        additional_data: Optional[Dict[str, Any]] = None,
        include_calculations: bool = True,
        include_workflow: bool = True
    ) -> SubmissionPackage:
        """
        Prepare complete submission package for a portal
        """
        # Get plant data
        import logging
        logger = logging.getLogger(__name__)
        
        plant = await self.plant_service.get_plant(plant_id)
        if not plant:
            raise ValueError(f"Plant with ID {plant_id} not found")
        
        logger.info(f"Plant loaded: {plant.nome if plant else 'None'}")
        logger.info(f"Plant anagrafica: {hasattr(plant, 'anagrafica')}")
        if hasattr(plant, 'anagrafica') and plant.anagrafica:
            logger.info(f"Anagrafica tecnologia: {getattr(plant.anagrafica, 'tecnologia', 'None')}")
        
        # Generate package ID
        package_id = f"{portal.value}_{form_type.value}_{plant_id}_{uuid.uuid4().hex[:8]}"
        
        # Map plant data to portal format
        mapped_data = self.data_mapper.map_plant_to_portal_format(
            plant, portal, form_type, additional_data
        )
        
        # Validate mapped data
        validation_result = self.data_mapper.validate_mapped_data(mapped_data, portal, form_type)
        if not validation_result.is_valid:
            raise ValueError(f"Data validation failed: {validation_result.errors}")
        
        # Generate forms
        forms = []
        form_names = []
        
        form_pdf = await self.pdf_generator.generate_form_by_type(
            portal, form_type, plant, additional_data
        )
        forms.append(form_pdf)
        form_names.append(f"{portal.value}_{form_type.value}_{plant.nome}.pdf")
        
        # Calculate values if requested
        calculations = None
        if include_calculations:
            calculations = await self._perform_calculations(plant, portal, form_type, additional_data)
        
        # Generate workflow guide if requested
        workflow_guide = None
        if include_workflow:
            workflow_guide = self._generate_workflow_guide(portal, form_type, plant)
        
        # Create checklist
        checklist = self._create_submission_checklist(portal, form_type, plant)
        
        # Determine portal URL
        portal_url = self._get_portal_url(portal)
        
        # Estimate completion time
        estimated_time = self._estimate_completion_time(portal, form_type)
        
        # Create submission package
        package = SubmissionPackage(
            package_id=package_id,
            portal=portal,
            form_type=form_type,
            plant_id=plant_id,
            tenant_id=tenant_id,
            forms=forms,
            form_names=form_names,
            workflow_guide=workflow_guide,
            checklist=checklist,
            calculations=calculations,
            status=SubmissionStatus.READY,
            portal_url=portal_url,
            estimated_completion_time=estimated_time,
            notes=f"Package prepared for {plant.nome} - {portal.value} {form_type.value}"
        )
        
        return package
    
    async def _perform_calculations(
        self,
        plant: Plant,
        portal: PortalType,
        form_type: FormType,
        additional_data: Optional[Dict[str, Any]] = None
    ):
        """Perform relevant calculations based on portal and form type"""
        
        if portal == PortalType.GSE and form_type in [FormType.RID_APPLICATION, FormType.SSP_APPLICATION]:
            # Calculate GSE incentives
            tariff_type = "RID" if form_type == FormType.RID_APPLICATION else "SSP"
            annual_production = additional_data.get("annual_production_kwh") if additional_data else None
            
            return await self.calculation_engine.calculate_gse_incentives(
                plant, tariff_type, annual_production
            )
        
        elif portal == PortalType.DOGANE and form_type == FormType.UTF_DECLARATION:
            # Calculate UTF fees
            annual_production = additional_data.get("annual_production_kwh", 0) if additional_data else 0
            reference_year = additional_data.get("reference_year") if additional_data else None
            
            return await self.calculation_engine.calculate_utf_fees(
                plant, annual_production, reference_year
            )
        
        return None
    
    def _generate_workflow_guide(
        self,
        portal: PortalType,
        form_type: FormType,
        plant: Plant
    ) -> WorkflowGuide:
        """Generate step-by-step workflow guide"""
        
        steps = []
        
        if portal == PortalType.GSE:
            steps = self._create_gse_workflow_steps(form_type)
        elif portal == PortalType.TERNA:
            steps = self._create_terna_workflow_steps(form_type)
        elif portal == PortalType.DSO:
            steps = self._create_dso_workflow_steps(form_type)
        elif portal == PortalType.DOGANE:
            steps = self._create_dogane_workflow_steps(form_type)
        
        total_time = sum(step.estimated_time or 0 for step in steps)
        
        return WorkflowGuide(
            portal=portal,
            form_type=form_type,
            title=f"{portal.value.upper()} {form_type.value.replace('_', ' ').title()} Guide",
            description=f"Step-by-step guide for submitting {form_type.value} to {portal.value.upper()}",
            total_steps=len(steps),
            estimated_total_time=total_time,
            steps=steps,
            prerequisites=self._get_prerequisites(portal, form_type),
            required_documents=self._get_required_documents(portal, form_type)
        )
    
    def _create_gse_workflow_steps(self, form_type: FormType) -> List[WorkflowStep]:
        """Create GSE-specific workflow steps"""
        steps = [
            WorkflowStep(
                step_number=1,
                title="Access GSE Portal",
                instruction="Navigate to https://areaclienti.gse.it",
                url="https://areaclienti.gse.it",
                estimated_time=2,
                requires_authentication=False
            ),
            WorkflowStep(
                step_number=2,
                title="Authenticate with SPID",
                instruction="Click 'Entra con SPID' and complete authentication with your SPID provider",
                estimated_time=5,
                requires_authentication=True,
                notes=["This step requires manual interaction", "Cannot be automated due to SPID requirements"]
            ),
            WorkflowStep(
                step_number=3,
                title="Navigate to Applications Section",
                instruction="Go to 'Domande' > 'Nuova Domanda' from the main menu",
                estimated_time=2
            ),
            WorkflowStep(
                step_number=4,
                title="Select Application Type",
                instruction=f"Choose '{form_type.value.upper()}' from the available options",
                estimated_time=2
            ),
            WorkflowStep(
                step_number=5,
                title="Upload Pre-filled Forms",
                instruction="Upload the forms generated by Kronos EAM",
                estimated_time=5,
                notes=["Forms are already pre-filled with plant data", "Review data before submission"]
            ),
            WorkflowStep(
                step_number=6,
                title="Review and Submit",
                instruction="Review all information and submit the application",
                estimated_time=10,
                notes=["Double-check all data before final submission", "Save confirmation number"]
            )
        ]
        return steps
    
    def _create_terna_workflow_steps(self, form_type: FormType) -> List[WorkflowStep]:
        """Create Terna GAUDÌ workflow steps"""
        steps = [
            WorkflowStep(
                step_number=1,
                title="Access GAUDÌ Portal",
                instruction="Navigate to https://www.terna.it/it/sistema-elettrico/gaudi",
                url="https://www.terna.it/it/sistema-elettrico/gaudi",
                estimated_time=2
            ),
            WorkflowStep(
                step_number=2,
                title="Authenticate with Digital Certificate",
                instruction="Insert smart card or USB token and select your digital certificate",
                estimated_time=5,
                requires_authentication=True,
                notes=["Requires CNS or qualified digital certificate", "Manual authentication required"]
            ),
            WorkflowStep(
                step_number=3,
                title="Access Plant Management",
                instruction="Navigate to 'Anagrafica Impianti' section",
                estimated_time=2
            ),
            WorkflowStep(
                step_number=4,
                title="Create New Plant Entry",
                instruction="Click 'Nuovo Plant' and fill in the pre-calculated data",
                estimated_time=15,
                notes=["Use the data provided in the generated form", "GPS coordinates required"]
            ),
            WorkflowStep(
                step_number=5,
                title="Submit Registration",
                instruction="Review all data and submit for Terna approval",
                estimated_time=5,
                notes=["CENSIMP code will be assigned after approval"]
            )
        ]
        return steps
    
    def _create_dso_workflow_steps(self, form_type: FormType) -> List[WorkflowStep]:
        """Create DSO workflow steps"""
        steps = [
            WorkflowStep(
                step_number=1,
                title="Access DSO Portal",
                instruction="Navigate to your local DSO portal (e.g., www.e-distribuzione.it)",
                estimated_time=2
            ),
            WorkflowStep(
                step_number=2,
                title="Login to Business Area",
                instruction="Login with your business credentials",
                estimated_time=3,
                requires_authentication=True
            ),
            WorkflowStep(
                step_number=3,
                title="Submit TICA Request",
                instruction="Upload the pre-filled TICA request form",
                estimated_time=10,
                notes=["Include all required technical documentation"]
            ),
            WorkflowStep(
                step_number=4,
                title="Track Request Status",
                instruction="Monitor the request status in the portal",
                estimated_time=2,
                notes=["Response typically within 30-60 days"]
            )
        ]
        return steps
    
    def _create_dogane_workflow_steps(self, form_type: FormType) -> List[WorkflowStep]:
        """Create Dogane workflow steps"""
        steps = [
            WorkflowStep(
                step_number=1,
                title="Access Dogane Portal",
                instruction="Navigate to https://www.adm.gov.it/portale/servizi-online",
                url="https://www.adm.gov.it/portale/servizi-online",
                estimated_time=2
            ),
            WorkflowStep(
                step_number=2,
                title="Authenticate",
                instruction="Login with SPID, CIE, or CNS credentials",
                estimated_time=5,
                requires_authentication=True,
                notes=["Digital identity required by law"]
            ),
            WorkflowStep(
                step_number=3,
                title="Access UTF Section",
                instruction="Navigate to 'Accise' > 'UTF' section",
                estimated_time=2
            ),
            WorkflowStep(
                step_number=4,
                title="Submit Declaration",
                instruction="Upload the pre-filled UTF declaration",
                estimated_time=10,
                notes=["Declaration must be submitted by March 31st"]
            )
        ]
        return steps
    
    def _get_prerequisites(self, portal: PortalType, form_type: FormType) -> List[str]:
        """Get prerequisites for portal submission"""
        common_prereqs = ["Valid plant data in Kronos EAM", "All required plant documentation"]
        
        if portal == PortalType.GSE:
            return common_prereqs + [
                "SPID digital identity",
                "CENSIMP code from Terna (if available)",
                "POD code from local DSO"
            ]
        elif portal == PortalType.TERNA:
            return common_prereqs + [
                "Digital certificate (CNS/CIE)",
                "GPS coordinates of plant location",
                "Connection agreement with DSO"
            ]
        elif portal == PortalType.DSO:
            return common_prereqs + [
                "DSO business account",
                "Technical project documentation",
                "Electrical diagrams"
            ]
        elif portal == PortalType.DOGANE:
            return common_prereqs + [
                "SPID/CIE/CNS digital identity",
                "UTF license (for plants > 20kW)",
                "Annual production data"
            ]
        
        return common_prereqs
    
    def _get_required_documents(self, portal: PortalType, form_type: FormType) -> List[str]:
        """Get required documents for submission"""
        if portal == PortalType.GSE:
            return [
                "Application form (generated by Kronos)",
                "Plant technical specifications",
                "Anti-mafia declaration (if required)",
                "Company registration documents"
            ]
        elif portal == PortalType.TERNA:
            return [
                "Plant registration form (generated by Kronos)",
                "Technical diagrams",
                "Connection point documentation"
            ]
        elif portal == PortalType.DSO:
            return [
                "TICA request form (generated by Kronos)",
                "Site plan and electrical diagrams",
                "Authorization documents"
            ]
        elif portal == PortalType.DOGANE:
            return [
                "UTF declaration (generated by Kronos)",
                "Production metering records",
                "License documentation"
            ]
        
        return []
    
    def _create_submission_checklist(
        self,
        portal: PortalType,
        form_type: FormType,
        plant: Plant
    ) -> List[str]:
        """Create submission checklist"""
        checklist = [
            "✓ Plant data verified in Kronos EAM",
            "✓ Forms generated and reviewed",
            "✓ All calculations verified"
        ]
        
        # Add portal-specific items
        if portal == PortalType.GSE:
            checklist.extend([
                "□ SPID authentication ready",
                "□ CENSIMP code available (if required)",
                "□ POD code verified",
                "□ Anti-mafia declaration prepared (if needed)"
            ])
        elif portal == PortalType.TERNA:
            checklist.extend([
                "□ Digital certificate ready",
                "□ GPS coordinates confirmed",
                "□ Technical specifications updated"
            ])
        elif portal == PortalType.DSO:
            checklist.extend([
                "□ DSO account credentials ready",
                "□ Technical documentation prepared",
                "□ Connection requirements reviewed"
            ])
        elif portal == PortalType.DOGANE:
            checklist.extend([
                "□ Digital identity ready",
                "□ Production data for reference year",
                "□ UTF license number (if applicable)"
            ])
        
        checklist.extend([
            "□ Backup copies of all documents",
            "□ Submission deadline verified",
            "□ Confirmation receipt prepared for filing"
        ])
        
        return checklist
    
    def _get_portal_url(self, portal: PortalType) -> str:
        """Get portal base URL"""
        urls = {
            PortalType.GSE: "https://areaclienti.gse.it",
            PortalType.TERNA: "https://www.terna.it/it/sistema-elettrico/gaudi",
            PortalType.DSO: "https://www.e-distribuzione.it/it/area-clienti",
            PortalType.DOGANE: "https://www.adm.gov.it/portale/servizi-online"
        }
        return urls.get(portal, "")
    
    def _estimate_completion_time(self, portal: PortalType, form_type: FormType) -> int:
        """Estimate total completion time in minutes"""
        base_times = {
            PortalType.GSE: 25,
            PortalType.TERNA: 30,
            PortalType.DSO: 20,
            PortalType.DOGANE: 15
        }
        return base_times.get(portal, 20)
    
    async def create_task(
        self,
        tenant_id: str,
        task_type: str,
        portal: PortalType,
        plant_id: int,
        title: str,
        description: str,
        assigned_to: Optional[str] = None,
        due_date: Optional[datetime] = None,
        priority: str = "medium",
        task_data: Optional[Dict[str, Any]] = None
    ) -> SmartAssistantTask:
        """Create a new smart assistant task"""
        
        task_id = f"task_{portal.value}_{uuid.uuid4().hex[:8]}"
        
        if due_date is None and task_type == "form_submission":
            # Set default due date based on portal type
            if portal == PortalType.DOGANE:
                # UTF declarations due March 31st
                current_year = datetime.now().year
                if datetime.now().month <= 3:
                    due_date = datetime(current_year, 3, 31)
                else:
                    due_date = datetime(current_year + 1, 3, 31)
            else:
                # Default 30 days for other submissions
                due_date = datetime.now() + timedelta(days=30)
        
        task = SmartAssistantTask(
            task_id=task_id,
            task_type=task_type,
            portal=portal,
            plant_id=plant_id,
            tenant_id=tenant_id,
            title=title,
            description=description,
            priority=priority,
            assigned_to=assigned_to,
            due_date=due_date,
            task_data=task_data or {}
        )
        
        return task
    
    async def process_form_generation_request(
        self,
        request: FormGenerationRequest,
        tenant_id: str
    ) -> FormGenerationResponse:
        """Process form generation request"""
        try:
            import traceback
            print(f"Processing form generation request: plant_id={request.plant_id}, portal={request.portal}, form_type={request.form_type}")
            
            package = await self.prepare_submission(
                tenant_id=tenant_id,
                plant_id=request.plant_id,
                portal=request.portal,
                form_type=request.form_type,
                additional_data=request.additional_data,
                include_calculations=request.include_calculations,
                include_workflow=request.include_workflow
            )
            
            return FormGenerationResponse(
                success=True,
                package=package
            )
        
        except Exception as e:
            import traceback
            full_traceback = traceback.format_exc()
            print(f"Error in process_form_generation_request: {str(e)}")
            print(f"Full traceback:\n{full_traceback}")
            
            # Return shortened error for response
            error_lines = full_traceback.strip().split('\n')
            # Find the actual error location
            relevant_lines = []
            for i, line in enumerate(error_lines):
                if '.lower()' in line or 'NoneType' in line or i >= len(error_lines) - 5:
                    relevant_lines.append(line)
            
            error_message = str(e)
            if relevant_lines:
                error_message += "\n\nRelevant traceback:\n" + "\n".join(relevant_lines[-10:])
            
            return FormGenerationResponse(
                success=False,
                error_message=error_message
            )
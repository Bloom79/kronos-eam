#!/usr/bin/env python3
"""
Direct test of form generation endpoint without starting the server
"""

import asyncio
import sys
import os
sys.path.insert(0, os.path.abspath('.'))

# Set environment variables for testing
os.environ['OPENAI_API_KEY'] = 'test_key'
os.environ['ENVIRONMENT'] = 'test'

from app.services.smart_assistant.smart_assistant_service import SmartAssistantService
from app.schemas.smart_assistant import FormGenerationRequest, PortalType, FormType


async def test_form_generation():
    """Test form generation directly"""
    print("Testing Form Generation Endpoint")
    print("=" * 50)
    
    # Create service instance
    service = SmartAssistantService()
    
    # Create mock database session
    class MockDB:
        def query(self, model):
            return self
        
        def filter(self, *args, **kwargs):
            return self
        
        def first(self):
            # Return a mock plant
            class MockAnagrafica:
                def __init__(self):
                    self.codice_censimp = "IT001E00123456"
                    self.comune = "Roma"
                    self.provincia = "RM"
                    self.regione = "Lazio"
                    self.codice_pod = "IT001E00123456A"
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
                    self.id = 1
                    self.tenant_id = "demo"
                    self.nome = "Plant Test"
                    self.potenza_installata = 50.0
                    self.data_attivazione = None
                    self.anagrafica = MockAnagrafica()
            
            return MockPlant()
    
    db = MockDB()
    
    # Test request
    request = FormGenerationRequest(
        plant_id=1,
        portal=PortalType.GSE,
        form_type=FormType.RID_APPLICATION,
        include_calculations=True,
        include_workflow=True
    )
    
    try:
        # Call the service
        result = await service.generate_forms(db, "demo", request)
        
        print("\nForm Generation Results:")
        print(f"Portal: {result.portal}")
        print(f"Form Type: {result.form_type}")
        print(f"Status: {result.status}")
        
        if result.forms:
            print(f"\nGenerated Forms: {len(result.forms)}")
            for form in result.forms:
                print(f"  - {form.name}: {len(form.content)} bytes")
        
        if result.calculations:
            print(f"\nCalculations:")
            for calc_type, calc_data in result.calculations.items():
                print(f"  {calc_type}:")
                for key, value in calc_data.items():
                    print(f"    {key}: {value}")
        
        if result.workflow:
            print(f"\nWorkflow Steps: {len(result.workflow.steps)}")
            for step in result.workflow.steps:
                print(f"  {step.step_number}. {step.title} ({step.estimated_time} min)")
        
        if result.validation_warnings:
            print(f"\nValidation Warnings: {len(result.validation_warnings)}")
            for warning in result.validation_warnings:
                print(f"  - {warning}")
        
        print("\nTest completed successfully!")
        
    except Exception as e:
        print(f"\nError during test: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(test_form_generation())
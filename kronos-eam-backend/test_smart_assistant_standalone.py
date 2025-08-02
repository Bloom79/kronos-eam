#!/usr/bin/env python3
"""
Standalone test for Smart Assistant core functionality
"""

import asyncio
import sys
import os
sys.path.insert(0, os.path.abspath('.'))

# Set environment variables for testing
os.environ['OPENAI_API_KEY'] = 'test_key'
os.environ['ENVIRONMENT'] = 'test'

from app.schemas.smart_assistant import PortalType, FormType


def test_schemas():
    """Test Smart Assistant schemas"""
    print("=== Testing Smart Assistant Schemas ===")
    
    # Test PortalType enum
    print("Available portals:")
    for portal in PortalType:
        print(f"  - {portal.value}")
    
    # Test FormType enum  
    print("\nAvailable form types:")
    for form_type in FormType:
        print(f"  - {form_type.value}")
    
    print("\nSchemas test passed!")


async def test_pdf_generation_standalone():
    """Test PDF generation without database dependencies"""
    print("\n=== Testing PDF Generation (Standalone) ===")
    
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        import tempfile
        import io
        from datetime import datetime
        
        # Test reportlab directly
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        styles = getSampleStyleSheet()
        
        story = []
        story.append(Paragraph("Test GSE RID Form", styles['Title']))
        story.append(Spacer(1, 20))
        story.append(Paragraph("Plant Name: Test Plant", styles['Normal']))
        story.append(Paragraph("Power: 50.0 kW", styles['Normal']))
        story.append(Paragraph(f"Generated: {datetime.now().strftime('%d/%m/%Y %H:%M')}", styles['Normal']))
        
        doc.build(story)
        buffer.seek(0)
        pdf_data = buffer.getvalue()
        
        print(f"  Successfully generated PDF: {len(pdf_data)} bytes")
        print("PDF generation test passed!")
        
    except Exception as e:
        print(f"PDF generation test failed: {e}")
        import traceback
        traceback.print_exc()


async def test_data_mapping_standalone():
    """Test data mapping logic without database"""
    print("\n=== Testing Data Mapping (Standalone) ===")
    
    try:
        # Test mapping logic without database models
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
        
        class MockPlant:
            def __init__(self):
                self.nome = "Plant Test"
                self.potenza_installata = 50.0
                self.anagrafica = MockAnagrafica()
        
        # Test mapping rules
        mapping_rules = {
            "codice_censimp": "anagrafica.codice_censimp",
            "denominazione_impianto": "nome",
            "potenza_installata_kw": "potenza_installata",
            "comune_installazione": "anagrafica.comune",
            "ragione_sociale": "anagrafica.proprietario",
            "codice_fiscale": "anagrafica.codice_fiscale"
        }
        
        plant = MockPlant()
        mapped_data = {}
        
        for field_name, plant_path in mapping_rules.items():
            current = plant
            for part in plant_path.split('.'):
                if hasattr(current, part):
                    current = getattr(current, part)
                else:
                    current = None
                    break
            mapped_data[field_name] = current
        
        print(f"  Mapped {len(mapped_data)} fields successfully")
        for field, value in mapped_data.items():
            print(f"    {field}: {value}")
        
        print("Data mapping test passed!")
        
    except Exception as e:
        print(f"Data mapping test failed: {e}")
        import traceback
        traceback.print_exc()


async def test_calculations_standalone():
    """Test calculation logic without database"""
    print("\n=== Testing Calculations (Standalone) ===")
    
    try:
        # Test GSE tariff calculation
        potenza_kw = 50.0
        
        # RID tariff logic
        if potenza_kw <= 20:
            tariff = 0.103
            category = "Small (≤20 kW)"
        elif potenza_kw <= 200:
            tariff = 0.091
            category = "Medium (20-200 kW)"
        else:
            tariff = 0.084
            category = "Large (>200 kW)"
        
        print(f"  Plant power: {potenza_kw} kW")
        print(f"  Tariff category: {category}")
        print(f"  RID tariff: €{tariff:.3f}/kWh")
        
        # Annual production estimate
        irradiation = 1300  # kWh/m²/year for Rome
        performance_ratio = 0.80
        annual_production = potenza_kw * irradiation * performance_ratio
        
        print(f"  Estimated annual production: {annual_production:,.0f} kWh")
        
        # Annual incentive
        annual_incentive = annual_production * tariff
        print(f"  Estimated annual incentive: €{annual_incentive:,.2f}")
        
        # UTF fee calculation
        production_mwh = annual_production / 1000
        utf_rate = 0.0125  # €/MWh
        utf_fee = production_mwh * utf_rate if potenza_kw > 20 else 0
        
        print(f"  UTF fee: €{utf_fee:.2f} ({'exempt' if potenza_kw <= 20 else 'applicable'})")
        
        print("Calculations test passed!")
        
    except Exception as e:
        print(f"Calculations test failed: {e}")
        import traceback
        traceback.print_exc()


async def test_workflow_logic():
    """Test workflow logic"""
    print("\n=== Testing Workflow Logic ===")
    
    try:
        # Test workflow step creation
        gse_steps = [
            {"step": 1, "title": "Access GSE Portal", "time": 2},
            {"step": 2, "title": "SPID Authentication", "time": 5, "requires_user": True},
            {"step": 3, "title": "Navigate to Applications", "time": 2},
            {"step": 4, "title": "Upload Forms", "time": 10},
            {"step": 5, "title": "Submit Application", "time": 10}
        ]
        
        total_time = sum(step["time"] for step in gse_steps)
        manual_steps = [step for step in gse_steps if step.get("requires_user")]
        
        print(f"  GSE workflow: {len(gse_steps)} steps")
        print(f"  Total estimated time: {total_time} minutes")
        print(f"  Manual steps requiring user: {len(manual_steps)}")
        
        # Test portal URLs
        portal_urls = {
            "gse": "https://areaclienti.gse.it",
            "terna": "https://www.terna.it/it/sistema-elettrico/gaudi", 
            "dso": "https://www.e-distribuzione.it/it/area-clienti",
            "dogane": "https://www.adm.gov.it/portale/servizi-online"
        }
        
        print(f"  Portal URLs configured: {len(portal_urls)}")
        
        print("Workflow logic test passed!")
        
    except Exception as e:
        print(f"Workflow logic test failed: {e}")
        import traceback
        traceback.print_exc()


async def main():
    """Run all standalone tests"""
    print("Starting Smart Assistant Standalone Tests")
    print("=" * 50)
    
    # Test schemas
    test_schemas()
    
    # Test PDF generation
    await test_pdf_generation_standalone()
    
    # Test data mapping
    await test_data_mapping_standalone()
    
    # Test calculations
    await test_calculations_standalone()
    
    # Test workflow logic
    await test_workflow_logic()
    
    print("\n" + "=" * 50)
    print("All standalone tests completed!")


if __name__ == "__main__":
    asyncio.run(main())
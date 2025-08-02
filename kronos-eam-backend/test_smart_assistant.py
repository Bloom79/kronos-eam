#!/usr/bin/env python3
"""
Test script for Smart Assistant functionality
"""

import asyncio
import sys
import os
sys.path.insert(0, os.path.abspath('.'))

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


async def test_pdf_generation():
    """Test PDF generation without database"""
    print("\n=== Testing PDF Generation ===")
    
    try:
        from app.services.smart_assistant.pdf_generator import PDFFormGenerator
        
        # Create a mock plant object
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
                self.nome = "Plant Test"
                self.potenza_installata = 50.0
                self.data_attivazione = None
                self.anagrafica = MockAnagrafica()
        
        generator = PDFFormGenerator()
        plant = MockPlant()
        
        # Test GSE RID form generation
        print("Generating GSE RID form...")
        rid_pdf = await generator.generate_gse_rid_form(plant)
        print(f"  Generated RID form: {len(rid_pdf)} bytes")
        
        # Test Terna GAUDI form generation
        print("Generating Terna GAUDÌ form...")
        gaudi_pdf = await generator.generate_terna_gaudi_form(plant)
        print(f"  Generated GAUDÌ form: {len(gaudi_pdf)} bytes")
        
        # Test DSO TICA form generation
        print("Generating DSO TICA form...")
        tica_pdf = await generator.generate_dso_tica_request(plant)
        print(f"  Generated TICA form: {len(tica_pdf)} bytes")
        
        # Test UTF declaration
        print("Generating UTF declaration...")
        utf_pdf = await generator.generate_dogane_utf_declaration(plant, 65000.0)
        print(f"  Generated UTF declaration: {len(utf_pdf)} bytes")
        
        print("PDF generation test passed!")
        
    except Exception as e:
        print(f"PDF generation test failed: {e}")
        import traceback
        traceback.print_exc()


async def test_data_mapper():
    """Test data mapping functionality"""
    print("\n=== Testing Data Mapper ===")
    
    try:
        from app.services.smart_assistant.data_mapper import DataMapper
        
        # Create mock plant
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
        
        mapper = DataMapper()
        plant = MockPlant()
        
        # Test mapping for GSE RID
        print("Testing GSE RID mapping...")
        mapped_data = mapper.map_plant_to_portal_format(
            plant, PortalType.GSE, FormType.RID_APPLICATION
        )
        print(f"  Mapped {len(mapped_data)} fields")
        
        # Test validation
        print("Testing data validation...")
        validation_result = mapper.validate_mapped_data(
            mapped_data, PortalType.GSE, FormType.RID_APPLICATION
        )
        print(f"  Validation result: {'PASS' if validation_result.is_valid else 'FAIL'}")
        if validation_result.warnings:
            print(f"  Warnings: {len(validation_result.warnings)}")
        
        print("Data mapper test passed!")
        
    except Exception as e:
        print(f"Data mapper test failed: {e}")
        import traceback
        traceback.print_exc()


async def test_calculation_engine():
    """Test calculation engine"""
    print("\n=== Testing Calculation Engine ===")
    
    try:
        from app.services.smart_assistant.calculation_engine import CalculationEngine
        
        # Create mock plant
        class MockAnagrafica:
            def __init__(self):
                self.regione = "Lazio"
        
        class MockPlant:
            def __init__(self):
                self.potenza_installata = 50.0
                self.anagrafica = MockAnagrafica()
        
        engine = CalculationEngine()
        plant = MockPlant()
        
        # Test GSE incentive calculation
        print("Testing GSE incentive calculation...")
        incentive_calc = await engine.calculate_gse_incentives(plant, "RID")
        print(f"  Annual production: {incentive_calc.annual_production_kwh:,.0f} kWh")
        print(f"  Incentive rate: €{incentive_calc.incentive_rate:.3f}/kWh")
        print(f"  Annual incentive: €{incentive_calc.annual_incentive:,.2f}")
        
        # Test UTF fee calculation
        print("Testing UTF fee calculation...")
        utf_calc = await engine.calculate_utf_fees(plant, 65000.0)
        print(f"  Annual production: {utf_calc.annual_production_kwh:,.0f} kWh")
        print(f"  Annual fee: €{utf_calc.annual_fee:.2f}")
        print(f"  Is exempt: {utf_calc.is_exempt}")
        
        print("Calculation engine test passed!")
        
    except Exception as e:
        print(f"Calculation engine test failed: {e}")
        import traceback
        traceback.print_exc()


async def main():
    """Run all tests"""
    print("Starting Smart Assistant Tests")
    print("=" * 50)
    
    # Test schemas
    test_schemas()
    
    # Test PDF generation
    await test_pdf_generation()
    
    # Test data mapper
    await test_data_mapper()
    
    # Test calculation engine
    await test_calculation_engine()
    
    print("\n" + "=" * 50)
    print("All tests completed!")


if __name__ == "__main__":
    asyncio.run(main())
#!/usr/bin/env python3
"""
Simple script to add sample plant data
"""

import requests
import json
from datetime import datetime, timedelta

# API configuration
API_URL = "http://localhost:8000/api/v1"
EMAIL = "demo@kronos-eam.local"
PASSWORD = "Demo2024!"
TENANT_ID = "demo"

def login():
    """Login and get access token"""
    login_url = f"{API_URL}/auth/login"
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Tenant-ID": TENANT_ID
    }
    data = {
        "username": EMAIL,
        "password": PASSWORD
    }

    response = requests.post(login_url, headers=headers, data=data)
    if response.status_code == 200:
        print("✓ Login successful")
        return response.json()["access_token"]
    else:
        print(f"✗ Login failed: {response.status_code}")
        print(response.text)
        return None

def create_sample_plants(token):
    """Create sample plants with various statuses and types"""

    plants_url = f"{API_URL}/plants/"
    headers = {
        "Authorization": f"Bearer {token}",
        "X-Tenant-ID": TENANT_ID,
        "Content-Type": "application/json"
    }

    # Sample plant data with ONLY the required fields and proper checklist format
    sample_plants = [
        {
            "name": "Solar Park Roma Nord",
            "code": "SPRN001",
            "type": "Photovoltaic",
            "status": "In Operation",
            "power": "1.5 MW",
            "power_kw": 1500,
            "location": "Via Tiburtina 123, Roma",
            "municipality": "Roma",
            "province": "RM",
            "region": "Lazio",
            "latitude": 41.9028,
            "longitude": 12.4964,
            "checklist": {
                "dso_connection": True,
                "terna_registration": True,
                "gse_activation": True,
                "customs_license": False,
                "spi_verification": True,
                "consumption_declaration": True,
                "antimafia_certificate": True,
                "fuel_mix_disclosure": False,
                "eia_screening": False,
                "ippc_permit": False
            }
        },
        {
            "name": "Parco Eolico Appennino",
            "code": "PEA002",
            "type": "Wind",
            "status": "In Operation",
            "power": "3.2 MW",
            "power_kw": 3200,
            "location": "Loc. Monte Ventoso, Potenza",
            "municipality": "Potenza",
            "province": "PZ",
            "region": "Basilicata",
            "latitude": 40.6420,
            "longitude": 15.8059,
            "checklist": {
                "dso_connection": True,
                "terna_registration": True,
                "gse_activation": True,
                "customs_license": True,
                "spi_verification": True,
                "consumption_declaration": True,
                "antimafia_certificate": True,
                "fuel_mix_disclosure": True,
                "eia_screening": True,
                "ippc_permit": False
            }
        },
        {
            "name": "Impianto FV Milano Sud",
            "code": "IFMS003",
            "type": "Photovoltaic",
            "status": "Under Construction",
            "power": "750 kW",
            "power_kw": 750,
            "location": "Via Ripamonti 456, Milano",
            "municipality": "Milano",
            "province": "MI",
            "region": "Lombardia",
            "latitude": 45.4642,
            "longitude": 9.1900,
            "checklist": {
                "dso_connection": False,
                "terna_registration": False,
                "gse_activation": False,
                "customs_license": False,
                "spi_verification": False,
                "consumption_declaration": False,
                "antimafia_certificate": False,
                "fuel_mix_disclosure": False,
                "eia_screening": False,
                "ippc_permit": False
            }
        },
        {
            "name": "Central Idroelettrica Valle",
            "code": "CIV004",
            "type": "Hydroelectric",
            "status": "In Operation",
            "power": "5.0 MW",
            "power_kw": 5000,
            "location": "Valle del Serchio, Lucca",
            "municipality": "Borgo a Mozzano",
            "province": "LU",
            "region": "Toscana",
            "latitude": 43.9827,
            "longitude": 10.5497,
            "checklist": {
                "dso_connection": True,
                "terna_registration": True,
                "gse_activation": True,
                "customs_license": True,
                "spi_verification": True,
                "consumption_declaration": False,
                "antimafia_certificate": True,
                "fuel_mix_disclosure": True,
                "eia_screening": True,
                "ippc_permit": True
            }
        },
        {
            "name": "Biomassa Agricola Veneto",
            "code": "BAV005",
            "type": "Biomass",
            "status": "In Operation",
            "power": "2.0 MW",
            "power_kw": 2000,
            "location": "Via Padana 789, Verona",
            "municipality": "Verona",
            "province": "VR",
            "region": "Veneto",
            "latitude": 45.4384,
            "longitude": 10.9916,
            "checklist": {
                "dso_connection": True,
                "terna_registration": False,
                "gse_activation": True,
                "customs_license": True,
                "spi_verification": True,
                "consumption_declaration": True,
                "antimafia_certificate": True,
                "fuel_mix_disclosure": False,
                "eia_screening": False,
                "ippc_permit": True
            }
        },
        {
            "name": "Solar Rooftop Napoli",
            "code": "SRN006",
            "type": "Photovoltaic",
            "status": "In Authorization",
            "power": "250 kW",
            "power_kw": 250,
            "location": "Centro Direzionale, Napoli",
            "municipality": "Napoli",
            "province": "NA",
            "region": "Campania",
            "latitude": 40.8518,
            "longitude": 14.2681,
            "checklist": {
                "dso_connection": True,
                "terna_registration": False,
                "gse_activation": True,
                "customs_license": False,
                "spi_verification": True,
                "consumption_declaration": True,
                "antimafia_certificate": False,
                "fuel_mix_disclosure": False,
                "eia_screening": False,
                "ippc_permit": False
            }
        },
        {
            "name": "Parco FV Sicilia",
            "code": "PFS007",
            "type": "Photovoltaic",
            "status": "In Operation",
            "power": "10.0 MW",
            "power_kw": 10000,
            "location": "Contrada Piana, Catania",
            "municipality": "Catania",
            "province": "CT",
            "region": "Sicilia",
            "latitude": 37.5079,
            "longitude": 15.0830,
            "checklist": {
                "dso_connection": True,
                "terna_registration": True,
                "gse_activation": True,
                "customs_license": True,
                "spi_verification": True,
                "consumption_declaration": True,
                "antimafia_certificate": True,
                "fuel_mix_disclosure": True,
                "eia_screening": True,
                "ippc_permit": True
            }
        },
        {
            "name": "Mini Eolico Sardegna",
            "code": "MES008",
            "type": "Wind",
            "status": "Decommissioned",
            "power": "500 kW",
            "power_kw": 500,
            "location": "Loc. Costa Smeralda, Olbia",
            "municipality": "Olbia",
            "province": "SS",
            "region": "Sardegna",
            "latitude": 40.9239,
            "longitude": 9.4964,
            "checklist": {
                "dso_connection": False,
                "terna_registration": False,
                "gse_activation": False,
                "customs_license": False,
                "spi_verification": False,
                "consumption_declaration": False,
                "antimafia_certificate": False,
                "fuel_mix_disclosure": False,
                "eia_screening": False,
                "ippc_permit": False
            }
        },
        {
            "name": "Geotermica Toscana",
            "code": "GT009",
            "type": "Geothermal",
            "status": "In Operation",
            "power": "1.0 MW",
            "power_kw": 1000,
            "location": "Larderello, Pisa",
            "municipality": "Pomarance",
            "province": "PI",
            "region": "Toscana",
            "latitude": 43.2524,
            "longitude": 10.8719,
            "checklist": {
                "dso_connection": True,
                "terna_registration": True,
                "gse_activation": True,
                "customs_license": False,
                "spi_verification": True,
                "consumption_declaration": True,
                "antimafia_certificate": True,
                "fuel_mix_disclosure": True,
                "eia_screening": True,
                "ippc_permit": True
            }
        },
        {
            "name": "FV Industriale Torino",
            "code": "FIT010",
            "type": "Photovoltaic",
            "status": "In Operation",
            "power": "2.5 MW",
            "power_kw": 2500,
            "location": "Zona Industriale, Torino",
            "municipality": "Torino",
            "province": "TO",
            "region": "Piemonte",
            "latitude": 45.0703,
            "longitude": 7.6869,
            "checklist": {
                "dso_connection": True,
                "terna_registration": True,
                "gse_activation": True,
                "customs_license": True,
                "spi_verification": False,
                "consumption_declaration": True,
                "antimafia_certificate": True,
                "fuel_mix_disclosure": False,
                "eia_screening": False,
                "ippc_permit": False
            }
        }
    ]

    created_count = 0
    for plant_data in sample_plants:
        try:
            response = requests.post(plants_url, headers=headers, json=plant_data)
            if response.status_code in [200, 201]:
                print(f"✓ Created plant: {plant_data['name']} ({plant_data['type']})")
                created_count += 1
            else:
                print(f"✗ Failed to create {plant_data['name']}: {response.status_code}")
                if response.status_code != 500:  # Show detail if not internal error
                    print(f"  Response: {response.text[:200]}")
        except Exception as e:
            print(f"✗ Error creating {plant_data['name']}: {str(e)}")

    print(f"\n✓ Successfully created {created_count}/{len(sample_plants)} plants")
    return created_count

def main():
    print("=== Adding Sample Plant Data ===\n")

    # Login
    token = login()
    if not token:
        print("Failed to login. Exiting.")
        return

    # Create sample plants
    created = create_sample_plants(token)

    print("\n=== Summary ===")
    print(f"Total plants created: {created}")
    print("\nYou can now view the plants in the UI at http://localhost:3000")
    print("The plants have various:")
    print("  - Types: Photovoltaic, Wind, Hydroelectric, Biomass, Geothermal")
    print("  - Statuses: In Operation, Under Construction, In Authorization, Decommissioned")
    print("  - Compliance levels: 0% to 100%")
    print("  - Integration statuses: Various combinations")

if __name__ == "__main__":
    main()
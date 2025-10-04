#!/usr/bin/env python3
"""
Script to add sample plant data for testing the enhanced UI
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

    # Sample plant data with various types and statuses
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
            "country": "Italy",
            "latitude": 41.9028,
            "longitude": 12.4964,
            "commissioning_date": "2022-03-15",
            "next_deadline": (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"),
            "gse_integration": True,
            "terna_integration": True,
            "customs_integration": False,
            "checklist": {
                "technical_docs": True,
                "permits": True,
                "insurance": True,
                "maintenance_contract": True,
                "safety_compliance": False,
                "grid_connection": True,
                "metering": True,
                "monitoring_system": True
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
            "country": "Italy",
            "latitude": 40.6420,
            "longitude": 15.8059,
            "commissioning_date": "2021-09-01",
            "next_deadline": (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d"),
            "gse_integration": True,
            "terna_integration": True,
            "customs_integration": True,
            "checklist": {
                "technical_docs": True,
                "permits": True,
                "insurance": True,
                "maintenance_contract": True,
                "safety_compliance": True,
                "grid_connection": True,
                "metering": True,
                "monitoring_system": True
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
            "country": "Italy",
            "latitude": 45.4642,
            "longitude": 9.1900,
            "commissioning_date": "2024-01-15",
            "next_deadline": (datetime.now() + timedelta(days=60)).strftime("%Y-%m-%d"),
            "gse_integration": False,
            "terna_integration": False,
            "customs_integration": False,
            "checklist": {
                "technical_docs": True,
                "permits": True,
                "insurance": False,
                "maintenance_contract": False,
                "safety_compliance": False,
                "grid_connection": False,
                "metering": False,
                "monitoring_system": False
            }
        },
        {
            "name": "Central Idroelettrica Valle",
            "code": "CIV004",
            "type": "Hydroelectric",
            "status": "In Operation",
            "power": "5.0 MW",
            "location": "Valle del Serchio, Lucca",
            "municipality": "Borgo a Mozzano",
            "province": "LU",
            "region": "Toscana",
            "country": "Italy",
            "latitude": 43.9827,
            "longitude": 10.5497,
            "commissioning_date": "2020-06-10",
            "next_deadline": (datetime.now() - timedelta(days=5)).strftime("%Y-%m-%d"),  # Overdue
            "gse_integration": True,
            "terna_integration": True,
            "customs_integration": True,
            "checklist": {
                "technical_docs": True,
                "permits": True,
                "insurance": True,
                "maintenance_contract": False,
                "safety_compliance": True,
                "grid_connection": True,
                "metering": True,
                "monitoring_system": False
            }
        },
        {
            "name": "Biomassa Agricola Veneto",
            "code": "BAV005",
            "type": "Biomass",
            "status": "In Operation",
            "power": "2.0 MW",
            "location": "Via Padana 789, Verona",
            "municipality": "Verona",
            "province": "VR",
            "region": "Veneto",
            "country": "Italy",
            "latitude": 45.4384,
            "longitude": 10.9916,
            "commissioning_date": "2023-02-20",
            "next_deadline": (datetime.now() + timedelta(days=90)).strftime("%Y-%m-%d"),
            "gse_integration": True,
            "terna_integration": False,
            "customs_integration": True,
            "checklist": {
                "technical_docs": True,
                "permits": True,
                "insurance": True,
                "maintenance_contract": True,
                "safety_compliance": True,
                "grid_connection": True,
                "metering": False,
                "monitoring_system": True
            }
        },
        {
            "name": "Solar Rooftop Napoli",
            "code": "SRN006",
            "type": "Photovoltaic",
            "status": "Maintenance",
            "power": "250 kW",
            "location": "Centro Direzionale, Napoli",
            "municipality": "Napoli",
            "province": "NA",
            "region": "Campania",
            "country": "Italy",
            "latitude": 40.8518,
            "longitude": 14.2681,
            "commissioning_date": "2021-11-30",
            "next_deadline": (datetime.now() + timedelta(days=15)).strftime("%Y-%m-%d"),
            "gse_integration": True,
            "terna_integration": False,
            "customs_integration": False,
            "checklist": {
                "technical_docs": True,
                "permits": True,
                "insurance": True,
                "maintenance_contract": True,
                "safety_compliance": False,
                "grid_connection": True,
                "metering": True,
                "monitoring_system": True
            }
        },
        {
            "name": "Parco FV Sicilia",
            "code": "PFS007",
            "type": "Photovoltaic",
            "status": "In Operation",
            "power": "10.0 MW",
            "location": "Contrada Piana, Catania",
            "municipality": "Catania",
            "province": "CT",
            "region": "Sicilia",
            "country": "Italy",
            "latitude": 37.5079,
            "longitude": 15.0830,
            "commissioning_date": "2022-07-01",
            "next_deadline": (datetime.now() + timedelta(days=45)).strftime("%Y-%m-%d"),
            "gse_integration": True,
            "terna_integration": True,
            "customs_integration": True,
            "checklist": {
                "technical_docs": True,
                "permits": True,
                "insurance": True,
                "maintenance_contract": True,
                "safety_compliance": True,
                "grid_connection": True,
                "metering": True,
                "monitoring_system": True
            }
        },
        {
            "name": "Mini Eolico Sardegna",
            "code": "MES008",
            "type": "Wind",
            "status": "Inactive",
            "power": "500 kW",
            "location": "Loc. Costa Smeralda, Olbia",
            "municipality": "Olbia",
            "province": "SS",
            "region": "Sardegna",
            "country": "Italy",
            "latitude": 40.9239,
            "longitude": 9.4964,
            "commissioning_date": "2019-05-15",
            "next_deadline": None,
            "gse_integration": False,
            "terna_integration": False,
            "customs_integration": False,
            "checklist": {
                "technical_docs": True,
                "permits": True,
                "insurance": False,
                "maintenance_contract": False,
                "safety_compliance": False,
                "grid_connection": False,
                "metering": False,
                "monitoring_system": False
            }
        },
        {
            "name": "Geotermica Toscana",
            "code": "GT009",
            "type": "Geothermal",
            "status": "In Operation",
            "power": "1.0 MW",
            "location": "Larderello, Pisa",
            "municipality": "Pomarance",
            "province": "PI",
            "region": "Toscana",
            "country": "Italy",
            "latitude": 43.2524,
            "longitude": 10.8719,
            "commissioning_date": "2023-09-10",
            "next_deadline": (datetime.now() + timedelta(days=120)).strftime("%Y-%m-%d"),
            "gse_integration": True,
            "terna_integration": True,
            "customs_integration": False,
            "checklist": {
                "technical_docs": True,
                "permits": True,
                "insurance": True,
                "maintenance_contract": True,
                "safety_compliance": True,
                "grid_connection": True,
                "metering": True,
                "monitoring_system": True
            }
        },
        {
            "name": "FV Industriale Torino",
            "code": "FIT010",
            "type": "Photovoltaic",
            "status": "In Operation",
            "power": "2.5 MW",
            "location": "Zona Industriale, Torino",
            "municipality": "Torino",
            "province": "TO",
            "region": "Piemonte",
            "country": "Italy",
            "latitude": 45.0703,
            "longitude": 7.6869,
            "commissioning_date": "2022-12-01",
            "next_deadline": (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d"),  # Urgent
            "gse_integration": True,
            "terna_integration": True,
            "customs_integration": True,
            "checklist": {
                "technical_docs": True,
                "permits": True,
                "insurance": True,
                "maintenance_contract": False,
                "safety_compliance": True,
                "grid_connection": True,
                "metering": False,
                "monitoring_system": True
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
                print(f"  Response: {response.text}")
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
    print("  - Statuses: Active, Under Construction, Maintenance, Inactive")
    print("  - Compliance levels: 0% to 100%")
    print("  - Deadlines: Including some urgent and overdue")
    print("  - Integration statuses: Various combinations of GSE, Terna, ADM")

if __name__ == "__main__":
    main()
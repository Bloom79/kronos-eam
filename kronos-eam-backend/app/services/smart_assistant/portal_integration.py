"""
Portal Integration Service

Handles API integration and monitoring for Italian energy sector portals.
Includes Terna API client, E-Distribuzione B2B integration, and portal monitoring.
"""

import asyncio
import ssl
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List, Tuple
import aiohttp
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from app.schemas.smart_assistant import (
    PortalType, APIIntegrationStatus, PortalMonitoringData
)


class TernaAPIClient:
    """
    Client for Terna GAUDÌ API integration
    """
    
    def __init__(self, certificate_path: str, private_key_path: str, api_key: str):
        self.base_url = "https://api.terna.it/gaudi/v1"
        self.certificate_path = certificate_path
        self.private_key_path = private_key_path
        self.api_key = api_key
        
        # Setup session with certificate authentication
        self.session = requests.Session()
        self.session.cert = (certificate_path, private_key_path)
        self.session.headers.update({
            'X-API-Key': api_key,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        
        # Add retry strategy
        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("https://", adapter)
    
    async def get_plant_data(self, censimp_code: str) -> Dict[str, Any]:
        """
        Retrieve plant data from Terna GAUDÌ
        """
        try:
            url = f"{self.base_url}/plants/{censimp_code}"
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            
            return {
                "success": True,
                "data": response.json(),
                "timestamp": datetime.now().isoformat()
            }
        
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def update_technical_data(
        self, 
        censimp_code: str, 
        updates: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Update plant technical data in Terna GAUDÌ
        """
        try:
            url = f"{self.base_url}/plants/{censimp_code}/technical"
            response = self.session.patch(url, json=updates, timeout=30)
            response.raise_for_status()
            
            return {
                "success": True,
                "data": response.json(),
                "timestamp": datetime.now().isoformat()
            }
        
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def register_new_plant(self, plant_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Register new plant in Terna GAUDÌ system
        """
        try:
            url = f"{self.base_url}/plants"
            response = self.session.post(url, json=plant_data, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            censimp_code = result.get('censimp_code')
            
            return {
                "success": True,
                "censimp_code": censimp_code,
                "data": result,
                "timestamp": datetime.now().isoformat()
            }
        
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def check_api_status(self) -> APIIntegrationStatus:
        """
        Check Terna API status and connectivity
        """
        try:
            url = f"{self.base_url}/health"
            start_time = datetime.now()
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            return APIIntegrationStatus(
                portal=PortalType.TERNA,
                api_available=True,
                api_version="v1",
                authentication_method="Digital Certificate + API Key",
                last_successful_call=datetime.now(),
                rate_limit_remaining=int(response.headers.get('X-RateLimit-Remaining', 1000)),
                error_rate=0.0
            )
        
        except Exception as e:
            return APIIntegrationStatus(
                portal=PortalType.TERNA,
                api_available=False,
                authentication_method="Digital Certificate + API Key",
                error_rate=1.0
            )


class EDistribuzioneClient:
    """
    Client for E-Distribuzione B2B API integration
    """
    
    def __init__(self, api_key: str, client_id: str, client_secret: str):
        self.base_url = "https://api.e-distribuzione.it/b2b/v1"
        self.api_key = api_key
        self.client_id = client_id
        self.client_secret = client_secret
        self.access_token = None
        self.token_expires_at = None
        
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    
    async def _get_access_token(self) -> str:
        """
        Get OAuth2 access token for API authentication
        """
        if self.access_token and self.token_expires_at and datetime.now() < self.token_expires_at:
            return self.access_token
        
        try:
            url = f"{self.base_url}/oauth/token"
            data = {
                "grant_type": "client_credentials",
                "client_id": self.client_id,
                "client_secret": self.client_secret
            }
            
            response = self.session.post(url, data=data)
            response.raise_for_status()
            
            token_data = response.json()
            self.access_token = token_data['access_token']
            expires_in = token_data.get('expires_in', 3600)
            self.token_expires_at = datetime.now() + timedelta(seconds=expires_in - 60)
            
            # Update session headers
            self.session.headers['Authorization'] = f"Bearer {self.access_token}"
            
            return self.access_token
        
        except Exception as e:
            raise Exception(f"Failed to get access token: {str(e)}")
    
    async def submit_tica_request(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Submit TICA request via B2B API
        """
        try:
            await self._get_access_token()
            
            url = f"{self.base_url}/connections/tica"
            response = self.session.post(url, json=request_data, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            return {
                "success": True,
                "request_id": result.get('request_id'),
                "data": result,
                "timestamp": datetime.now().isoformat()
            }
        
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def check_connection_status(self, pod: str) -> Dict[str, Any]:
        """
        Check connection status for a POD
        """
        try:
            await self._get_access_token()
            
            url = f"{self.base_url}/connections/{pod}/status"
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            
            return {
                "success": True,
                "data": response.json(),
                "timestamp": datetime.now().isoformat()
            }
        
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def get_meter_readings(self, pod: str, start_date: str, end_date: str) -> Dict[str, Any]:
        """
        Get meter readings for a POD
        """
        try:
            await self._get_access_token()
            
            url = f"{self.base_url}/meters/{pod}/readings"
            params = {
                "start_date": start_date,
                "end_date": end_date
            }
            
            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            return {
                "success": True,
                "data": response.json(),
                "timestamp": datetime.now().isoformat()
            }
        
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }


class PortalMonitor:
    """
    Monitor portal status and announcements
    """
    
    def __init__(self):
        self.portal_urls = {
            PortalType.GSE: "https://areaclienti.gse.it",
            PortalType.TERNA: "https://www.terna.it/it/sistema-elettrico/gaudi",
            PortalType.DSO: "https://www.e-distribuzione.it",
            PortalType.DOGANE: "https://www.adm.gov.it/portale/servizi-online"
        }
    
    async def check_portal_status(self, portal: PortalType) -> PortalMonitoringData:
        """
        Check portal availability and status
        """
        url = self.portal_urls.get(portal)
        if not url:
            return PortalMonitoringData(
                portal=portal,
                status="unknown",
                last_checked=datetime.now(),
                announcements=["Portal URL not configured"]
            )
        
        try:
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=10)) as session:
                async with session.get(url) as response:
                    if response.status == 200:
                        status = "online"
                    elif response.status in [503, 502]:
                        status = "maintenance"
                    else:
                        status = "partial"
                    
                    # Try to extract any maintenance announcements
                    announcements = await self._extract_announcements(response, portal)
                    
                    return PortalMonitoringData(
                        portal=portal,
                        status=status,
                        last_checked=datetime.now(),
                        announcements=announcements
                    )
        
        except Exception as e:
            return PortalMonitoringData(
                portal=portal,
                status="offline",
                last_checked=datetime.now(),
                announcements=[f"Connection error: {str(e)}"]
            )
    
    async def _extract_announcements(
        self, 
        response: aiohttp.ClientResponse, 
        portal: PortalType
    ) -> List[str]:
        """
        Extract maintenance announcements from portal pages
        """
        announcements = []
        
        try:
            # Only parse if content is HTML
            content_type = response.headers.get('content-type', '')
            if 'text/html' not in content_type:
                return announcements
            
            text = await response.text()
            
            # Simple keyword-based announcement detection
            maintenance_keywords = [
                "manutenzione", "maintenance", "aggiornamento", "update",
                "disservizio", "interruzione", "servizio non disponibile"
            ]
            
            lines = text.lower().split('\n')
            for line in lines:
                for keyword in maintenance_keywords:
                    if keyword in line and len(line.strip()) < 200:
                        announcements.append(line.strip())
                        break
                
                if len(announcements) >= 5:  # Limit to 5 announcements
                    break
        
        except Exception:
            # Ignore parsing errors
            pass
        
        return announcements
    
    async def check_all_portals(self) -> Dict[PortalType, PortalMonitoringData]:
        """
        Check status of all portals concurrently
        """
        tasks = []
        for portal in PortalType:
            tasks.append(self.check_portal_status(portal))
        
        results = await asyncio.gather(*tasks)
        
        return {
            portal: result 
            for portal, result in zip(PortalType, results)
        }
    
    async def monitor_regulation_changes(self) -> List[Dict[str, Any]]:
        """
        Monitor for new regulations or procedural changes
        """
        # This would typically scrape official regulatory sites
        # For now, return placeholder data
        
        return [
            {
                "source": "GSE",
                "title": "Updated RID procedures",
                "date": "2024-01-15",
                "url": "https://www.gse.it/news",
                "summary": "New documentation requirements for RID applications"
            },
            {
                "source": "ARERA",
                "title": "New connection standards",
                "date": "2024-01-10",
                "url": "https://www.arera.it/delibere",
                "summary": "Updated technical standards for grid connections"
            }
        ]


class PortalIntegrationService:
    """
    Main service for portal integrations
    """
    
    def __init__(self):
        self.terna_client = None
        self.dso_client = None
        self.monitor = PortalMonitor()
    
    def configure_terna_client(
        self, 
        certificate_path: str, 
        private_key_path: str, 
        api_key: str
    ):
        """Configure Terna API client"""
        self.terna_client = TernaAPIClient(certificate_path, private_key_path, api_key)
    
    def configure_dso_client(
        self, 
        api_key: str, 
        client_id: str, 
        client_secret: str
    ):
        """Configure E-Distribuzione API client"""
        self.dso_client = EDistribuzioneClient(api_key, client_id, client_secret)
    
    async def sync_with_terna(self, plant_id: int, censimp_code: str) -> Dict[str, Any]:
        """
        Sync plant data with Terna via API
        """
        if not self.terna_client:
            return {
                "success": False,
                "error": "Terna client not configured"
            }
        
        try:
            # Get current data from Terna
            terna_data = await self.terna_client.get_plant_data(censimp_code)
            
            if not terna_data["success"]:
                return terna_data
            
            # Compare with local data and determine updates needed
            # This would typically involve comparing with database
            updates_needed = []
            
            return {
                "success": True,
                "terna_data": terna_data["data"],
                "updates_needed": updates_needed,
                "timestamp": datetime.now().isoformat()
            }
        
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def submit_dso_request(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Submit request to DSO via B2B API
        """
        if not self.dso_client:
            return {
                "success": False,
                "error": "DSO client not configured"
            }
        
        return await self.dso_client.submit_tica_request(request_data)
    
    async def get_portal_statuses(self) -> Dict[str, Any]:
        """
        Get status of all portals
        """
        statuses = await self.monitor.check_all_portals()
        
        return {
            "portals": {
                portal.value: {
                    "status": data.status,
                    "last_checked": data.last_checked.isoformat(),
                    "announcements": data.announcements
                }
                for portal, data in statuses.items()
            },
            "overall_status": "operational" if all(
                data.status in ["online", "partial"] for data in statuses.values()
            ) else "degraded"
        }
    
    async def get_api_integration_status(self) -> Dict[str, APIIntegrationStatus]:
        """
        Get status of API integrations
        """
        statuses = {}
        
        # Check Terna API
        if self.terna_client:
            statuses[PortalType.TERNA] = await self.terna_client.check_api_status()
        else:
            statuses[PortalType.TERNA] = APIIntegrationStatus(
                portal=PortalType.TERNA,
                api_available=False,
                authentication_method="Not configured"
            )
        
        # Check E-Distribuzione API
        if self.dso_client:
            # Would implement status check for DSO client
            statuses[PortalType.DSO] = APIIntegrationStatus(
                portal=PortalType.DSO,
                api_available=True,
                authentication_method="OAuth2 + API Key"
            )
        else:
            statuses[PortalType.DSO] = APIIntegrationStatus(
                portal=PortalType.DSO,
                api_available=False,
                authentication_method="Not configured"
            )
        
        # GSE and Dogane don't have APIs
        statuses[PortalType.GSE] = APIIntegrationStatus(
            portal=PortalType.GSE,
            api_available=False,
            authentication_method="Manual (SPID required)"
        )
        
        statuses[PortalType.DOGANE] = APIIntegrationStatus(
            portal=PortalType.DOGANE,
            api_available=False,
            authentication_method="Manual (SPID/CNS required)"
        )
        
        return statuses
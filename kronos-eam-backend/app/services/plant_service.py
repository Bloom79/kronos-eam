"""
Plant service for managing power plants
Handles CRUD operations and business logic for plants
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_
from fastapi import HTTPException, status

from app.core.database import get_db_context
from app.models.plant import Plant, PlantPerformance, PlantStatusEnum, PlantTypeEnum


class PlantService:
    """Service for managing power plants with multi-tenant support.
    
    This service handles all CRUD operations and business logic for power plants,
    ensuring proper tenant isolation and data integrity.
    """
    
    def __init__(self, tenant_id: str = "demo") -> None:
        """Initialize the plant service.
        
        Args:
            tenant_id: The tenant identifier for data isolation
        """
        self.tenant_id = tenant_id
    
    async def get_plant(self, plant_id: int) -> Optional[Plant]:
        """Retrieve a single plant by ID.
        
        Args:
            plant_id: The unique identifier of the plant
            
        Returns:
            The plant object if found, None otherwise
            
        Raises:
            HTTPException: If there's an error retrieving the plant
        """
        try:
            with get_db_context(self.tenant_id) as db:
                plant = db.query(Plant).options(
                    joinedload(Plant.registry),
                    joinedload(Plant.tenant)
                ).filter(
                    Plant.id == plant_id,
                    Plant.tenant_id == self.tenant_id
                ).first()
                
                # Force load relationships to prevent lazy loading issues
                if plant:
                    self._preload_relationships(plant)
                
                return plant
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error retrieving plant: {str(e)}"
            )
    
    async def get_plants_by_tenant(self, tenant_id: str) -> List[Plant]:
        """Retrieve all plants for a specific tenant.
        
        Args:
            tenant_id: The tenant identifier
            
        Returns:
            List of plants belonging to the tenant
            
        Raises:
            HTTPException: If there's an error retrieving plants
        """
        try:
            with get_db_context(tenant_id) as db:
                plants = db.query(Plant).filter(
                    Plant.tenant_id == tenant_id,
                    Plant.is_deleted == False
                ).all()
                return plants
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error retrieving plants: {str(e)}"
            )
    
    async def create_plant(self, plant_data: Dict[str, Any]) -> Plant:
        """Create a new plant.
        
        Args:
            plant_data: Dictionary containing plant attributes
            
        Returns:
            The newly created plant
            
        Raises:
            HTTPException: If there's an error creating the plant
        """
        try:
            with get_db_context(self.tenant_id) as db:
                # Ensure tenant_id is set
                plant_data["tenant_id"] = self.tenant_id
                
                # Validate required fields
                self._validate_plant_data(plant_data)
                
                plant = Plant(**plant_data)
                db.add(plant)
                db.commit()
                db.refresh(plant)
                return plant
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error creating plant: {str(e)}"
            )
    
    async def update_plant(self, plant_id: int, update_data: Dict[str, Any]) -> Optional[Plant]:
        """Update an existing plant.
        
        Args:
            plant_id: The unique identifier of the plant
            update_data: Dictionary containing fields to update
            
        Returns:
            The updated plant if found, None otherwise
            
        Raises:
            HTTPException: If there's an error updating the plant
        """
        try:
            with get_db_context(self.tenant_id) as db:
                plant = db.query(Plant).filter(
                    Plant.id == plant_id,
                    Plant.tenant_id == self.tenant_id
                ).first()
                
                if not plant:
                    return None
                
                # Update fields
                for key, value in update_data.items():
                    if hasattr(plant, key) and key not in ['id', 'tenant_id', 'created_at']:
                        setattr(plant, key, value)
                
                plant.updated_at = datetime.utcnow()
                db.commit()
                db.refresh(plant)
                return plant
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error updating plant: {str(e)}"
            )
    
    async def delete_plant(self, plant_id: int, hard_delete: bool = False) -> bool:
        """Delete a plant (soft delete by default).
        
        Args:
            plant_id: The unique identifier of the plant
            hard_delete: If True, permanently delete the plant
            
        Returns:
            True if deleted successfully, False if plant not found
            
        Raises:
            HTTPException: If there's an error deleting the plant
        """
        try:
            with get_db_context(self.tenant_id) as db:
                plant = db.query(Plant).filter(
                    Plant.id == plant_id,
                    Plant.tenant_id == self.tenant_id
                ).first()
                
                if not plant:
                    return False
                
                if hard_delete:
                    db.delete(plant)
                else:
                    plant.is_deleted = True
                    plant.updated_at = datetime.utcnow()
                
                db.commit()
                return True
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error deleting plant: {str(e)}"
            )
    
    async def get_plant_registry(self, plant_id: int) -> Optional[Plant]:
        """Get registry information for a plant.
        
        Args:
            plant_id: The unique identifier of the plant
            
        Returns:
            The plant with registry information if found
            
        Raises:
            HTTPException: If there's an error retrieving registry
        """
        try:
            with get_db_context(self.tenant_id) as db:
                plant = db.query(Plant).options(
                    joinedload(Plant.registry)
                ).filter(
                    Plant.id == plant_id,
                    Plant.tenant_id == self.tenant_id
                ).first()
                
                return plant
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error retrieving plant registry: {str(e)}"
            )
    
    async def get_plant_performance(
        self, 
        plant_id: int, 
        year: int, 
        month: Optional[int] = None
    ) -> List[PlantPerformance]:
        """Get performance data for a plant.
        
        Args:
            plant_id: The unique identifier of the plant
            year: The year to filter by
            month: Optional month to filter by
            
        Returns:
            List of performance records
            
        Raises:
            HTTPException: If there's an error retrieving performance data
        """
        try:
            with get_db_context(self.tenant_id) as db:
                query = db.query(PlantPerformance).filter(
                    PlantPerformance.plant_id == plant_id,
                    PlantPerformance.year == year
                )
                
                if month:
                    query = query.filter(PlantPerformance.month == month)
                
                return query.all()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error retrieving performance data: {str(e)}"
            )
    
    async def search_plants(
        self,
        search_term: Optional[str] = None,
        plant_type: Optional[PlantTypeEnum] = None,
        status: Optional[PlantStatusEnum] = None,
        region: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Plant]:
        """Search plants with filters.
        
        Args:
            search_term: Text to search in name and code
            plant_type: Filter by plant type
            status: Filter by plant status
            region: Filter by region
            limit: Maximum number of results
            offset: Number of results to skip
            
        Returns:
            List of plants matching the criteria
            
        Raises:
            HTTPException: If there's an error searching plants
        """
        try:
            with get_db_context(self.tenant_id) as db:
                query = db.query(Plant).filter(
                    Plant.tenant_id == self.tenant_id,
                    Plant.is_deleted == False
                )
                
                if search_term:
                    query = query.filter(
                        or_(
                            Plant.name.ilike(f"%{search_term}%"),
                            Plant.code.ilike(f"%{search_term}%")
                        )
                    )
                
                if plant_type:
                    query = query.filter(Plant.type == plant_type)
                
                if status:
                    query = query.filter(Plant.status == status)
                
                if region:
                    query = query.filter(Plant.region == region)
                
                return query.offset(offset).limit(limit).all()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error searching plants: {str(e)}"
            )
    
    async def get_plant_summary(self, plant_id: int) -> Dict[str, Any]:
        """Get comprehensive summary data for a plant.
        
        Args:
            plant_id: The unique identifier of the plant
            
        Returns:
            Dictionary containing plant summary information
            
        Raises:
            HTTPException: If there's an error retrieving the summary
        """
        plant = await self.get_plant(plant_id)
        if not plant:
            return {}
        
        registry = plant.registry if plant else None
        
        return {
            "id": plant.id,
            "name": plant.name,
            "code": plant.code,
            "type": plant.type.value if plant.type else None,
            "status": plant.status.value if plant.status else None,
            "power": plant.power,
            "power_kw": plant.power_kw,
            "location": plant.location,
            "region": plant.region,
            "integrations": {
                "gse": plant.gse_integration,
                "terna": plant.terna_integration,
                "customs": plant.customs_integration,
                "dso": plant.dso_integration
            },
            "registry": {
                "pod": registry.pod if registry else None,
                "censimp": registry.censimp if registry else None,
                "regime": registry.regime if registry else None,
                "commissioning_date": registry.commissioning_date.isoformat() if registry and registry.commissioning_date else None
            } if registry else None,
            "next_deadline": plant.next_deadline.isoformat() if plant.next_deadline else None,
            "deadline_type": plant.next_deadline_type
        }
    
    def set_tenant(self, tenant_id: str) -> None:
        """Set tenant for this service instance.
        
        Args:
            tenant_id: The new tenant identifier
        """
        self.tenant_id = tenant_id
    
    def _validate_plant_data(self, plant_data: Dict[str, Any]) -> None:
        """Validate plant data before creation.
        
        Args:
            plant_data: Dictionary containing plant attributes
            
        Raises:
            ValueError: If required fields are missing or invalid
        """
        required_fields = ['name', 'code', 'power_kw', 'type', 'status']
        for field in required_fields:
            if field not in plant_data:
                raise ValueError(f"Missing required field: {field}")
        
        if plant_data['power_kw'] <= 0:
            raise ValueError("Power must be greater than 0")
    
    def _preload_relationships(self, plant: Plant) -> None:
        """Preload relationships to prevent lazy loading issues.
        
        Args:
            plant: The plant object to preload relationships for
        """
        if plant.registry:
            _ = plant.registry.__dict__
        if plant.tenant:
            _ = plant.tenant.__dict__
    
    async def get_tenant_statistics(self, tenant_id: str) -> Dict[str, Any]:
        """Get comprehensive statistics for tenant's plants.
        
        Args:
            tenant_id: The tenant identifier
            
        Returns:
            Dictionary containing aggregated statistics
            
        Raises:
            HTTPException: If there's an error calculating statistics
        """
        try:
            with get_db_context(tenant_id) as db:
                plants = db.query(Plant).filter(
                    Plant.tenant_id == tenant_id,
                    Plant.is_deleted == False
                ).all()
                
                stats = {
                    "total_plants": len(plants),
                    "by_type": {},
                    "by_status": {},
                    "by_region": {},
                    "total_power_kw": 0,
                    "average_power_kw": 0,
                    "integrations_summary": {
                        "gse": 0,
                        "terna": 0,
                        "customs": 0,
                        "dso": 0
                    },
                    "active_plants": 0,
                    "plants_with_deadlines": 0
                }
                
                total_power = 0
                
                for plant in plants:
                    # By type
                    if plant.type:
                        type_key = plant.type.value
                        stats["by_type"][type_key] = stats["by_type"].get(type_key, 0) + 1
                    
                    # By status
                    if plant.status:
                        status_key = plant.status.value
                        stats["by_status"][status_key] = stats["by_status"].get(status_key, 0) + 1
                        
                        if plant.status == PlantStatusEnum.IN_OPERATION:
                            stats["active_plants"] += 1
                    
                    # By region
                    if plant.region:
                        stats["by_region"][plant.region] = stats["by_region"].get(plant.region, 0) + 1
                    
                    # Total power
                    if plant.power_kw:
                        total_power += plant.power_kw
                    
                    # Integrations
                    if plant.gse_integration:
                        stats["integrations_summary"]["gse"] += 1
                    if plant.terna_integration:
                        stats["integrations_summary"]["terna"] += 1
                    if plant.customs_integration:
                        stats["integrations_summary"]["customs"] += 1
                    if plant.dso_integration:
                        stats["integrations_summary"]["dso"] += 1
                    
                    # Deadlines
                    if plant.next_deadline:
                        stats["plants_with_deadlines"] += 1
                
                stats["total_power_kw"] = total_power
                stats["average_power_kw"] = total_power / len(plants) if plants else 0
                
                return stats
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error getting tenant statistics: {str(e)}"
            )



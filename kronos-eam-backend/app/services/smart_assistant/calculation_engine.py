"""
Calculation Engine Service

Handles pre-calculations for portal forms including:
- GSE incentive calculations (RID, SSP)
- UTF fee calculations for Dogane
- Connection cost estimates
- Performance predictions
"""

from datetime import datetime, date
from typing import Dict, Any, Optional, List, Tuple
from decimal import Decimal, ROUND_HALF_UP
import math

from app.models.plant import Plant
from app.schemas.smart_assistant import (
    IncentiveCalculation, UTFFeeCalculation, FormCalculation,
    CalculationEngineRequest, CalculationEngineResponse
)


class CalculationEngine:
    """
    Pre-calculation engine for portal form values
    """
    
    def __init__(self):
        self.gse_tariffs = self._load_gse_tariffs()
        self.regional_factors = self._load_regional_factors()
        self.utf_rates = self._load_utf_rates()
    
    def _load_gse_tariffs(self) -> Dict[str, Dict[str, float]]:
        """Load current GSE tariff rates"""
        return {
            "RID": {
                "small": 0.103,    # ≤20 kW
                "medium": 0.091,   # 20-200 kW
                "large": 0.084     # >200 kW
            },
            "SSP": {
                "contribution": 0.045,  # Contribution for energy exchanged
                "sale": 0.055          # Sale price for excess energy
            },
            "zones": {
                "north": 1.0,
                "center": 1.05,
                "south": 1.1,
                "islands": 1.15
            }
        }
    
    def _load_regional_factors(self) -> Dict[str, Dict[str, float]]:
        """Load regional production factors"""
        return {
            "irradiation": {  # kWh/m²/year
                "valle_aosta": 1200, "piemonte": 1250, "lombardia": 1220,
                "trentino_alto_adige": 1300, "veneto": 1280, "friuli_venezia_giulia": 1260,
                "liguria": 1320, "emilia_romagna": 1290, "toscana": 1350,
                "umbria": 1380, "marche": 1360, "lazio": 1420,
                "abruzzo": 1400, "molise": 1450, "campania": 1480,
                "puglia": 1520, "basilicata": 1500, "calabria": 1550,
                "sicilia": 1600, "sardegna": 1580
            },
            "performance_ratio": {  # System performance ratio
                "excellent": 0.85,
                "good": 0.80,
                "average": 0.75,
                "poor": 0.70
            }
        }
    
    def _load_utf_rates(self) -> Dict[str, float]:
        """Load UTF rates and thresholds"""
        return {
            "rate_per_mwh": 0.0125,  # €/MWh
            "exemption_threshold_kw": 20.0,
            "minimum_fee": 0.0
        }
    
    async def calculate_gse_incentives(
        self, 
        plant: Plant, 
        tariff_type: str = "RID",
        annual_production_kwh: Optional[float] = None
    ) -> IncentiveCalculation:
        """
        Calculate GSE incentive values for RID or SSP
        """
        # Estimate annual production if not provided
        if annual_production_kwh is None:
            annual_production_kwh = self._estimate_annual_production(plant)
        
        calculations = []
        
        # Determine tariff rate
        if tariff_type == "RID":
            tariff_rate, rate_calc = self._calculate_rid_tariff(plant)
            calculations.append(rate_calc)
        elif tariff_type == "SSP":
            tariff_rate, rate_calc = self._calculate_ssp_rate(plant)
            calculations.append(rate_calc)
        else:
            raise ValueError(f"Unsupported tariff type: {tariff_type}")
        
        # Apply regional zone multiplier
        zone_multiplier, zone_calc = self._get_zone_multiplier(plant.anagrafica.regione)
        calculations.append(zone_calc)
        
        final_rate = tariff_rate * zone_multiplier
        
        # Calculate annual incentive
        annual_incentive = annual_production_kwh * final_rate
        calculations.append(FormCalculation(
            field_name="annual_incentive",
            calculated_value=annual_incentive,
            formula_description=f"Annual production ({annual_production_kwh:,.0f} kWh) × Final rate (€{final_rate:.3f}/kWh)",
            source_data={
                "annual_production_kwh": annual_production_kwh,
                "final_rate": final_rate
            },
            confidence_level=0.85
        ))
        
        # Determine contract duration
        contract_duration = 20 if tariff_type == "RID" else 20  # Standard duration
        total_incentive = annual_incentive * contract_duration
        
        calculations.append(FormCalculation(
            field_name="total_incentive",
            calculated_value=total_incentive,
            formula_description=f"Annual incentive (€{annual_incentive:,.2f}) × Duration ({contract_duration} years)",
            source_data={
                "annual_incentive": annual_incentive,
                "contract_duration": contract_duration
            },
            confidence_level=0.75  # Lower confidence for long-term projection
        ))
        
        return IncentiveCalculation(
            tariff_type=tariff_type,
            annual_production_kwh=annual_production_kwh,
            incentive_rate=final_rate,
            annual_incentive=annual_incentive,
            contract_duration=contract_duration,
            total_incentive=total_incentive,
            calculations=calculations
        )
    
    def _calculate_rid_tariff(self, plant: Plant) -> Tuple[float, FormCalculation]:
        """Calculate RID tariff rate based on plant size"""
        potenza = plant.potenza_installata
        
        if potenza <= 20:
            rate = self.gse_tariffs["RID"]["small"]
            category = "Small (≤20 kW)"
        elif potenza <= 200:
            rate = self.gse_tariffs["RID"]["medium"]
            category = "Medium (20-200 kW)"
        else:
            rate = self.gse_tariffs["RID"]["large"]
            category = "Large (>200 kW)"
        
        calculation = FormCalculation(
            field_name="rid_base_tariff",
            calculated_value=rate,
            formula_description=f"RID tariff for {category}: €{rate:.3f}/kWh",
            source_data={
                "plant_power_kw": potenza,
                "tariff_category": category,
                "base_rate": rate
            },
            confidence_level=0.95
        )
        
        return rate, calculation
    
    def _calculate_ssp_rate(self, plant: Plant) -> Tuple[float, FormCalculation]:
        """Calculate SSP contribution rate"""
        # SSP uses contribution + sale mechanism
        contribution_rate = self.gse_tariffs["SSP"]["contribution"]
        sale_rate = self.gse_tariffs["SSP"]["sale"]
        
        # Simplified average (in practice depends on consumption pattern)
        average_rate = (contribution_rate + sale_rate) / 2
        
        calculation = FormCalculation(
            field_name="ssp_average_rate",
            calculated_value=average_rate,
            formula_description=f"SSP average rate: (Contribution €{contribution_rate:.3f} + Sale €{sale_rate:.3f}) / 2",
            source_data={
                "contribution_rate": contribution_rate,
                "sale_rate": sale_rate,
                "calculation_method": "simplified_average"
            },
            confidence_level=0.70  # Lower confidence due to simplified calculation
        )
        
        return average_rate, calculation
    
    def _get_zone_multiplier(self, regione: Optional[str]) -> Tuple[float, FormCalculation]:
        """Get zone price multiplier based on region"""
        if not regione:
            multiplier = 1.0
            zone = "default"
        else:
            regione_lower = regione.lower().replace(" ", "_")
            
            # Map regions to zones
            if regione_lower in ["valle_aosta", "piemonte", "lombardia", "trentino_alto_adige", "veneto", "friuli_venezia_giulia", "emilia_romagna"]:
                zone = "north"
            elif regione_lower in ["liguria", "toscana", "umbria", "marche", "lazio"]:
                zone = "center"
            elif regione_lower in ["abruzzo", "molise", "campania", "puglia", "basilicata", "calabria"]:
                zone = "south"
            else:  # sicilia, sardegna
                zone = "islands"
            
            multiplier = self.gse_tariffs["zones"][zone]
        
        calculation = FormCalculation(
            field_name="zone_multiplier",
            calculated_value=multiplier,
            formula_description=f"Regional zone multiplier for {zone}: {multiplier}x",
            source_data={
                "region": regione,
                "zone": zone,
                "multiplier": multiplier
            },
            confidence_level=0.90
        )
        
        return multiplier, calculation
    
    def _estimate_annual_production(self, plant: Plant) -> float:
        """Estimate annual energy production"""
        potenza_kw = plant.potenza_installata
        
        # Get regional irradiation
        regione = plant.anagrafica.regione
        if regione:
            regione_key = regione.lower().replace(" ", "_")
            irradiation = self.regional_factors["irradiation"].get(regione_key, 1300)
        else:
            irradiation = 1300  # Italian average
        
        # Assume good performance ratio for calculation
        performance_ratio = self.regional_factors["performance_ratio"]["good"]
        
        # Standard PV panel efficiency
        panel_efficiency = 0.20  # 20%
        
        # Calculate production
        # kWh/year = kW × (kWh/m²/year) × (1/1000 W/m²) × performance_ratio
        annual_production = potenza_kw * irradiation * performance_ratio
        
        return annual_production
    
    async def calculate_utf_fees(
        self, 
        plant: Plant, 
        annual_production_kwh: float,
        reference_year: Optional[int] = None
    ) -> UTFFeeCalculation:
        """
        Calculate UTF fees for Dogane declaration
        """
        if reference_year is None:
            reference_year = datetime.now().year - 1
        
        potenza_kw = plant.potenza_installata
        annual_production_mwh = annual_production_kwh / 1000
        
        # Check exemption
        is_exempt = potenza_kw <= self.utf_rates["exemption_threshold_kw"]
        
        if is_exempt:
            annual_fee = 0.0
            exemption_reason = f"Plant power ({potenza_kw:.1f} kW) ≤ {self.utf_rates['exemption_threshold_kw']} kW threshold"
        else:
            annual_fee = annual_production_mwh * self.utf_rates["rate_per_mwh"]
            exemption_reason = None
        
        return UTFFeeCalculation(
            annual_production_kwh=annual_production_kwh,
            annual_production_mwh=annual_production_mwh,
            utf_rate=self.utf_rates["rate_per_mwh"],
            annual_fee=annual_fee,
            is_exempt=is_exempt,
            exemption_reason=exemption_reason
        )
    
    async def calculate_connection_costs(
        self, 
        plant: Plant, 
        connection_type: str = "new"
    ) -> FormCalculation:
        """
        Estimate DSO connection costs
        """
        potenza_kw = plant.potenza_installata
        
        # Base cost estimation
        if potenza_kw <= 6:
            base_cost = 500
            description = "Standard residential connection"
        elif potenza_kw <= 20:
            base_cost = 1500
            description = "Small commercial connection"
        elif potenza_kw <= 100:
            base_cost = 5000
            description = "Medium commercial connection"
        elif potenza_kw <= 1000:
            base_cost = potenza_kw * 100
            description = "Large commercial connection"
        else:
            base_cost = potenza_kw * 150
            description = "Industrial connection"
        
        # Connection type multipliers
        multipliers = {
            "new": 1.0,
            "upgrade": 0.7,
            "modification": 0.5
        }
        
        multiplier = multipliers.get(connection_type, 1.0)
        final_cost = base_cost * multiplier
        
        return FormCalculation(
            field_name="estimated_connection_cost",
            calculated_value=final_cost,
            formula_description=f"{description}: €{base_cost:,.0f} × {multiplier} ({connection_type})",
            source_data={
                "plant_power_kw": potenza_kw,
                "base_cost": base_cost,
                "connection_type": connection_type,
                "multiplier": multiplier,
                "description": description
            },
            confidence_level=0.60  # Cost estimates are inherently uncertain
        )
    
    async def calculate_payback_period(
        self, 
        plant: Plant, 
        installation_cost: float,
        annual_savings: float
    ) -> FormCalculation:
        """
        Calculate investment payback period
        """
        if annual_savings <= 0:
            payback_years = float('inf')
            description = "No positive cash flow - payback not possible"
        else:
            payback_years = installation_cost / annual_savings
            description = f"Investment cost €{installation_cost:,.0f} ÷ Annual savings €{annual_savings:,.0f}"
        
        return FormCalculation(
            field_name="payback_period_years",
            calculated_value=payback_years,
            formula_description=description,
            source_data={
                "installation_cost": installation_cost,
                "annual_savings": annual_savings
            },
            confidence_level=0.70
        )
    
    async def process_calculation_request(
        self, 
        request: CalculationEngineRequest
    ) -> CalculationEngineResponse:
        """
        Process calculation request and return appropriate result
        """
        try:
            # Get plant data
            from app.services.plant_service import PlantService
            plant_service = PlantService()
            plant = await plant_service.get_plant(request.plant_id)
            
            if not plant:
                return CalculationEngineResponse(
                    success=False,
                    calculation_type=request.calculation_type,
                    error_message=f"Plant with ID {request.plant_id} not found"
                )
            
            # Process based on calculation type
            if request.calculation_type == "gse_incentives":
                tariff_type = request.calculation_data.get("tariff_type", "RID")
                annual_production = request.calculation_data.get("annual_production_kwh")
                
                result = await self.calculate_gse_incentives(
                    plant, tariff_type, annual_production
                )
                
                return CalculationEngineResponse(
                    success=True,
                    calculation_type=request.calculation_type,
                    result=result,
                    calculations=result.calculations
                )
            
            elif request.calculation_type == "utf_fees":
                annual_production = request.calculation_data.get("annual_production_kwh", 0)
                reference_year = request.reference_year
                
                result = await self.calculate_utf_fees(
                    plant, annual_production, reference_year
                )
                
                return CalculationEngineResponse(
                    success=True,
                    calculation_type=request.calculation_type,
                    result=result
                )
            
            elif request.calculation_type == "connection_costs":
                connection_type = request.calculation_data.get("connection_type", "new")
                
                calculation = await self.calculate_connection_costs(plant, connection_type)
                
                return CalculationEngineResponse(
                    success=True,
                    calculation_type=request.calculation_type,
                    calculations=[calculation]
                )
            
            else:
                return CalculationEngineResponse(
                    success=False,
                    calculation_type=request.calculation_type,
                    error_message=f"Unsupported calculation type: {request.calculation_type}"
                )
        
        except Exception as e:
            return CalculationEngineResponse(
                success=False,
                calculation_type=request.calculation_type,
                error_message=str(e)
            )
    
    def get_calculation_metadata(self) -> Dict[str, Any]:
        """Get metadata about available calculations"""
        return {
            "supported_calculations": [
                "gse_incentives", "utf_fees", "connection_costs", "payback_period"
            ],
            "gse_tariffs": self.gse_tariffs,
            "utf_rates": self.utf_rates,
            "regional_factors": {
                "available_regions": list(self.regional_factors["irradiation"].keys()),
                "performance_ratios": self.regional_factors["performance_ratio"]
            },
            "last_updated": datetime.now().isoformat()
        }
"""
Data Mapping Service

Maps internal plant data to portal-specific formats.
Handles field transformations, validations, and calculations.
"""

from datetime import datetime, date
from typing import Dict, Any, Optional, List, Union
from decimal import Decimal

from app.models.plant import Plant
from app.schemas.smart_assistant import (
    PortalType, FormType, DataMappingProfile, ValidationResult
)


class DataMapper:
    """
    Maps plant data to portal-specific formats
    """
    
    def __init__(self):
        self.mapping_profiles = self._initialize_mapping_profiles()
    
    def _initialize_mapping_profiles(self) -> Dict[str, DataMappingProfile]:
        """Initialize mapping profiles for each portal/form combination"""
        profiles = {}
        
        # GSE RID Application
        profiles["gse_rid_application"] = DataMappingProfile(
            portal=PortalType.GSE,
            form_type=FormType.RID_APPLICATION,
            mapping_rules={
                "codice_censimp": "anagrafica.codice_censimp",
                "denominazione_impianto": "nome",
                "potenza_installata_kw": "potenza_installata",
                "comune_installazione": "anagrafica.comune",
                "provincia": "anagrafica.provincia",
                "regione": "anagrafica.regione",
                "codice_pod": "anagrafica.codice_pod",
                "ragione_sociale": "anagrafica.proprietario",
                "codice_fiscale": "anagrafica.codice_fiscale",
                "indirizzo": "anagrafica.indirizzo",
                "pec": "anagrafica.pec",
                "telefono": "anagrafica.telefono",
                "tecnologia": "anagrafica.tecnologia",
                "data_entrata_esercizio": "data_attivazione",
                "tensione_connessione": "anagrafica.tensione_connessione",
                "tipo_allacciamento": "anagrafica.tipo_allacciamento"
            },
            validation_rules={
                "potenza_installata_kw": {"min": 0.1, "max": 1000000},
                "codice_fiscale": {"pattern": r"^[A-Z0-9]{11,16}$"},
                "codice_pod": {"pattern": r"^IT\d{14}[A-Z]$"},
                "data_entrata_esercizio": {"after": "2005-01-01"}
            },
            required_fields=[
                "denominazione_impianto", "potenza_installata_kw", 
                "comune_installazione", "ragione_sociale", "codice_fiscale"
            ],
            calculated_fields=["energia_annua_stimata", "tariffa_rid_applicabile"]
        )
        
        # Terna GAUDÌ Registration
        profiles["terna_plant_registration"] = DataMappingProfile(
            portal=PortalType.TERNA,
            form_type=FormType.PLANT_REGISTRATION,
            mapping_rules={
                "codice_censimp": "anagrafica.codice_censimp",
                "denominazione": "nome",
                "comune": "anagrafica.comune",
                "provincia": "anagrafica.provincia",
                "latitudine": "anagrafica.latitudine",
                "longitudine": "anagrafica.longitudine",
                "potenza_efficiente_lorda_mw": "potenza_installata",  # Will convert to MW
                "tensione_nominale_kv": "anagrafica.tensione_connessione",
                "punto_connessione": "anagrafica.punto_connessione",
                "gestore_rete": "anagrafica.gestore_rete",
                "codice_pratica": "anagrafica.codice_pratica",
                "tecnologia": "anagrafica.tecnologia"
            },
            validation_rules={
                "potenza_efficiente_lorda_mw": {"min": 0.0001, "max": 1000},
                "latitudine": {"min": 35.0, "max": 47.5},  # Italy bounds
                "longitudine": {"min": 6.0, "max": 19.0},
                "tensione_nominale_kv": {"enum": ["0.4", "15", "20", "132", "220", "380"]}
            },
            required_fields=[
                "denominazione", "comune", "provincia", 
                "potenza_efficiente_lorda_mw", "tecnologia"
            ],
            calculated_fields=["codice_unita_produzione", "regime_incentivazione"]
        )
        
        # DSO TICA Request
        profiles["dso_tica_request"] = DataMappingProfile(
            portal=PortalType.DSO,
            form_type=FormType.TICA_REQUEST,
            mapping_rules={
                "ragione_sociale": "anagrafica.proprietario",
                "codice_fiscale": "anagrafica.codice_fiscale",
                "indirizzo_sede": "anagrafica.indirizzo",
                "pec": "anagrafica.pec",
                "telefono": "anagrafica.telefono",
                "indirizzo_installazione": "anagrafica.indirizzo",
                "potenza_installare_kw": "potenza_installata",
                "tecnologia": "anagrafica.tecnologia",
                "tensione_richiesta": "anagrafica.tensione_connessione",
                "codice_pod_esistente": "anagrafica.codice_pod"
            },
            validation_rules={
                "potenza_installare_kw": {"min": 0.1, "max": 10000},
                "codice_fiscale": {"pattern": r"^[A-Z0-9]{11,16}$"},
                "tensione_richiesta": {"enum": ["0.4", "15", "20"]}
            },
            required_fields=[
                "ragione_sociale", "codice_fiscale", "indirizzo_installazione",
                "potenza_installare_kw", "tecnologia"
            ],
            calculated_fields=["costo_stimato_connessione", "tempi_realizzazione"]
        )
        
        # Dogane UTF Declaration
        profiles["dogane_utf_declaration"] = DataMappingProfile(
            portal=PortalType.DOGANE,
            form_type=FormType.UTF_DECLARATION,
            mapping_rules={
                "ragione_sociale": "anagrafica.proprietario",
                "codice_fiscale": "anagrafica.codice_fiscale",
                "numero_licenza_utf": "anagrafica.numero_licenza_utf",
                "codice_officina": "anagrafica.codice_officina",
                "denominazione_impianto": "nome",
                "ubicazione": "anagrafica.indirizzo",
                "potenza_installata_kw": "potenza_installata",
                "data_attivazione": "data_attivazione",
                "tipo_impianto": "anagrafica.tecnologia"
            },
            validation_rules={
                "potenza_installata_kw": {"min": 0.1, "max": 1000000},
                "energia_prodotta_kwh": {"min": 0, "max": 50000000},
                "codice_fiscale": {"pattern": r"^[A-Z0-9]{11,16}$"}
            },
            required_fields=[
                "ragione_sociale", "codice_fiscale", "denominazione_impianto",
                "potenza_installata_kw", "energia_prodotta_kwh"
            ],
            calculated_fields=["energia_prodotta_mwh", "tributo_dovuto_euro"]
        )
        
        return profiles
    
    def map_plant_to_portal_format(
        self, 
        plant: Plant, 
        portal: PortalType, 
        form_type: FormType,
        additional_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Map plant data to portal-specific format
        """
        profile_key = f"{portal.value}_{form_type.value}"
        profile = self.mapping_profiles.get(profile_key)
        
        if not profile:
            raise ValueError(f"No mapping profile found for {portal}/{form_type}")
        
        mapped_data = {}
        
        # Apply mapping rules
        for field_name, plant_path in profile.mapping_rules.items():
            value = self._get_nested_value(plant, plant_path)
            mapped_data[field_name] = self._transform_value(field_name, value, portal, form_type)
        
        # Add additional data
        if additional_data:
            mapped_data.update(additional_data)
        
        # Calculate derived fields
        for calc_field in profile.calculated_fields:
            calculated_value = self._calculate_field(calc_field, mapped_data, plant, portal, form_type)
            if calculated_value is not None:
                mapped_data[calc_field] = calculated_value
        
        return mapped_data
    
    def _get_nested_value(self, obj: Any, path: str) -> Any:
        """Get value from nested object path (e.g., 'anagrafica.comune')"""
        import logging
        logger = logging.getLogger(__name__)
        
        current = obj
        for part in path.split('.'):
            if hasattr(current, part):
                current = getattr(current, part)
                if current is None:
                    logger.warning(f"Found None value at path '{path}' (part: '{part}')")
                    return None
            else:
                logger.warning(f"Path '{path}' not found at part '{part}' in object {type(current).__name__}")
                return None
        return current
    
    def _transform_value(
        self, 
        field_name: str, 
        value: Any, 
        portal: PortalType, 
        form_type: FormType
    ) -> Any:
        """Transform value based on portal requirements"""
        if value is None:
            return None
        
        # Date transformations
        if isinstance(value, (date, datetime)):
            if portal == PortalType.GSE:
                return value.strftime('%d/%m/%Y')
            elif portal == PortalType.TERNA:
                return value.strftime('%Y-%m-%d')
            else:
                return value.strftime('%d/%m/%Y')
        
        # Power unit conversions
        if field_name == "potenza_efficiente_lorda_mw" and isinstance(value, (int, float, Decimal)):
            return float(value) / 1000  # kW to MW
        
        # Technology mappings
        if field_name == "tecnologia" and value:
            tech_mapping = {
                "fotovoltaico": "Fotovoltaico",
                "eolico": "Eolico",
                "idroeletrico": "Idroelettrico",
                "biomasse": "Biomasse"
            }
            # Ensure value is string before calling lower()
            if isinstance(value, str):
                return tech_mapping.get(value.lower(), value)
            return value
        
        # Voltage transformations
        if "tensione" in field_name and value:
            # Ensure kV format
            if isinstance(value, str):
                if "kv" not in value.lower():
                    return f"{value} kV"
            return str(value)
        
        # String cleaning
        if isinstance(value, str):
            return value.strip()
        
        return value
    
    def _calculate_field(
        self,
        field_name: str,
        mapped_data: Dict[str, Any],
        plant: Plant,
        portal: PortalType,
        form_type: FormType
    ) -> Any:
        """Calculate derived field values"""
        
        if field_name == "energia_annua_stimata":
            # Estimate based on technology and location
            potenza_kw = mapped_data.get("potenza_installata_kw", 0)
            tecnologia = mapped_data.get("tecnologia") or ""
            tecnologia_lower = tecnologia.lower() if tecnologia else ""
            
            if "fotovoltaico" in tecnologia_lower:
                # Average 1200-1400 kWh/kW/year in Italy
                return potenza_kw * 1300
            elif "eolico" in tecnologia_lower:
                return potenza_kw * 2000
            else:
                return potenza_kw * 1000
        
        elif field_name == "tariffa_rid_applicabile":
            # RID tariff based on plant size and technology
            potenza_kw = mapped_data.get("potenza_installata_kw", 0)
            
            if potenza_kw <= 20:
                return 0.103  # €/kWh for small plants
            elif potenza_kw <= 200:
                return 0.091
            else:
                return 0.084
        
        elif field_name == "codice_unita_produzione":
            # Generate UP code for Terna
            censimp = mapped_data.get("codice_censimp", "")
            if censimp:
                return f"{censimp}UP01"
            return "DA_ASSEGNARE_UP01"
        
        elif field_name == "regime_incentivazione":
            # Determine incentive regime
            data_attivazione = plant.data_attivazione
            if data_attivazione:
                if data_attivazione.year >= 2013:
                    return "Scambio sul Posto"
                else:
                    return "Conto Energia"
            return "DA_DETERMINARE"
        
        elif field_name == "costo_stimato_connessione":
            # Estimate connection cost
            potenza_kw = mapped_data.get("potenza_installare_kw", 0)
            
            if potenza_kw <= 6:
                return 500  # €
            elif potenza_kw <= 20:
                return 1500
            elif potenza_kw <= 100:
                return 5000
            else:
                return potenza_kw * 100  # €/kW
        
        elif field_name == "tempi_realizzazione":
            # Estimate realization time
            potenza_kw = mapped_data.get("potenza_installare_kw", 0)
            
            if potenza_kw <= 20:
                return "30-60 giorni"
            elif potenza_kw <= 100:
                return "60-120 giorni"
            else:
                return "120-180 giorni"
        
        elif field_name == "energia_prodotta_mwh":
            # Convert kWh to MWh for UTF declaration
            kwh = mapped_data.get("energia_prodotta_kwh", 0)
            return kwh / 1000
        
        elif field_name == "tributo_dovuto_euro":
            # Calculate UTF fee
            potenza_kw = mapped_data.get("potenza_installata_kw", 0)
            mwh = mapped_data.get("energia_prodotta_mwh", 0)
            
            if potenza_kw <= 20:
                return 0.0  # Exempt
            else:
                return mwh * 0.0125  # €0.0125/MWh
        
        return None
    
    def validate_mapped_data(
        self, 
        mapped_data: Dict[str, Any], 
        portal: PortalType, 
        form_type: FormType
    ) -> ValidationResult:
        """
        Validate mapped data against portal requirements
        """
        profile_key = f"{portal.value}_{form_type.value}"
        profile = self.mapping_profiles.get(profile_key)
        
        if not profile:
            return ValidationResult(
                is_valid=False,
                errors=[f"No validation profile found for {portal}/{form_type}"]
            )
        
        errors = []
        warnings = []
        missing_fields = []
        invalid_fields = []
        
        # Check required fields
        for field in profile.required_fields:
            if field not in mapped_data or mapped_data[field] is None:
                missing_fields.append(field)
                errors.append(f"Required field '{field}' is missing")
        
        # Validate field values
        for field, rules in profile.validation_rules.items():
            if field not in mapped_data:
                continue
            
            value = mapped_data[field]
            if value is None:
                continue
            
            # Numeric range validation
            if "min" in rules and isinstance(value, (int, float)):
                if value < rules["min"]:
                    invalid_fields.append(field)
                    errors.append(f"Field '{field}' value {value} is below minimum {rules['min']}")
            
            if "max" in rules and isinstance(value, (int, float)):
                if value > rules["max"]:
                    invalid_fields.append(field)
                    errors.append(f"Field '{field}' value {value} exceeds maximum {rules['max']}")
            
            # Pattern validation
            if "pattern" in rules and isinstance(value, str):
                import re
                if not re.match(rules["pattern"], value):
                    invalid_fields.append(field)
                    errors.append(f"Field '{field}' format is invalid")
            
            # Enum validation
            if "enum" in rules and value not in rules["enum"]:
                invalid_fields.append(field)
                errors.append(f"Field '{field}' value '{value}' not in allowed values: {rules['enum']}")
            
            # Date validation
            if "after" in rules and isinstance(value, str):
                try:
                    from datetime import datetime
                    value_date = datetime.strptime(value, '%d/%m/%Y')
                    min_date = datetime.strptime(rules["after"], '%Y-%m-%d')
                    if value_date < min_date:
                        invalid_fields.append(field)
                        errors.append(f"Field '{field}' date is before minimum {rules['after']}")
                except ValueError:
                    invalid_fields.append(field)
                    errors.append(f"Field '{field}' has invalid date format")
        
        # Check for potential issues (warnings)
        self._add_warnings(mapped_data, portal, form_type, warnings)
        
        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            missing_fields=missing_fields,
            invalid_fields=invalid_fields
        )
    
    def _add_warnings(
        self,
        mapped_data: Dict[str, Any],
        portal: PortalType,
        form_type: FormType,
        warnings: List[str]
    ):
        """Add validation warnings"""
        
        # GSE-specific warnings
        if portal == PortalType.GSE:
            if not mapped_data.get("codice_censimp"):
                warnings.append("CENSIMP code missing - will need to be obtained from Terna first")
            
            if not mapped_data.get("codice_pod"):
                warnings.append("POD code missing - check with local DSO")
            
            potenza = mapped_data.get("potenza_installata_kw", 0)
            if potenza > 200:
                warnings.append("Plants > 200kW may require additional documentation")
        
        # Terna-specific warnings
        elif portal == PortalType.TERNA:
            if not mapped_data.get("latitudine") or not mapped_data.get("longitudine"):
                warnings.append("GPS coordinates missing - required for GAUDÌ registration")
            
            if not mapped_data.get("codice_pratica"):
                warnings.append("Connection practice code missing - obtain from DSO")
        
        # DSO-specific warnings
        elif portal == PortalType.DSO:
            potenza = mapped_data.get("potenza_installare_kw", 0)
            if potenza > 100:
                warnings.append("Plants > 100kW require medium voltage connection")
            
            if not mapped_data.get("codice_pod_esistente"):
                warnings.append("No existing POD - new connection required")
        
        # Dogane-specific warnings
        elif portal == PortalType.DOGANE:
            if not mapped_data.get("numero_licenza_utf"):
                warnings.append("UTF license number required for plants > 20kW")
            
            potenza = mapped_data.get("potenza_installata_kw", 0)
            if potenza <= 20:
                warnings.append("Plant is exempt from UTF fees (≤20kW)")
    
    def get_field_mapping_description(
        self, 
        portal: PortalType, 
        form_type: FormType
    ) -> Dict[str, str]:
        """Get human-readable description of field mappings"""
        profile_key = f"{portal.value}_{form_type.value}"
        profile = self.mapping_profiles.get(profile_key)
        
        if not profile:
            return {}
        
        descriptions = {}
        for field, path in profile.mapping_rules.items():
            descriptions[field] = f"Mapped from plant.{path}"
        
        for field in profile.calculated_fields:
            descriptions[field] = "Calculated automatically"
        
        return descriptions
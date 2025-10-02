/**
 * Type mapper utilities for converting between API and local types
 */

import type { Plant as LocalPlant } from '../types/plant-type';
import type { Plant as Apiplant } from '../services/api/plants.service';
import type { Plant } from '../types/api';

/**
 * Maps API plant type to local plant type
 */
export function mapApiplantToLocal(apiplant: Apiplant): LocalPlant {
  // Map status from English to Italian
  const statusMap: Record<string, any> = {
    'In Operation': 'In Esercizio',
    'Under Authorization': 'In Autorizzazione',
    'Under Construction': 'In Costruzione',
    'Decommissioned': 'Dismesso'
  };
  
  // Map type from English to Italian
  const typeMap: Record<string, any> = {
    'Photovoltaic': 'Fotovoltaico',
    'Wind': 'Eolico',
    'Hydroelectric': 'Idroelettrico',
    'Biomass': 'Biomasse',
    'Geothermal': 'Geotermico'
  };
  
  return {
    id: apiplant.id,
    name: apiplant.name,
    code: apiplant.code,
    power: apiplant.power,
    power_kw: apiplant.power_kw,
    status: statusMap[apiplant.status] || apiplant.status,
    type: apiplant.type ? typeMap[apiplant.type] : undefined,
    location: apiplant.location,
    municipality: apiplant.municipality,
    province: apiplant.province,
    region: apiplant.region,
    nextDeadline: apiplant.next_deadline,
    next_deadline: apiplant.next_deadline,
    prossima_scadenza_type: apiplant.next_deadline_type,
    deadlineColor: apiplant.deadline_color,
    deadline_color: apiplant.deadline_color,
    gse_integration: apiplant.gse_integration,
    terna_integration: apiplant.terna_integration,
    customs_integration: apiplant.customs_integration,
    dso_integration: apiplant.dso_integration,
    registry: apiplant.registry ? {
      id: apiplant.registry.id,
      pod: apiplant.registry.pod,
      gaudi: apiplant.registry.gaudi,
      censimp: apiplant.registry.censimp,
      dataEsercizio: apiplant.registry.data_esercizio,
      data_esercizio: apiplant.registry.data_esercizio,
      regime: apiplant.registry.regime,
      assignee: apiplant.registry.assignee,
      assicurazione: apiplant.registry.assicurazione,
      numeroModuli: apiplant.registry.numero_moduli,
      numero_moduli: apiplant.registry.numero_moduli,
      numeroInverter: apiplant.registry.numero_inverter,
      numero_inverter: apiplant.registry.numero_inverter,
      superficieOccupata: apiplant.registry.superficie_occupata,
      superficie_occupata: apiplant.registry.superficie_occupata,
    } : undefined,
    checklist: apiplant.checklist ? {
      connessione_dso: apiplant.checklist.dso_connection,
      registrazione_terna: apiplant.checklist.terna_registration,
      attivazione_gse: apiplant.checklist.gse_activation,
      licenza_dogane: apiplant.checklist.customs_license,
      verifica_spi: apiplant.checklist.spi_verification,
      dichiarazione_consumo: apiplant.checklist.consumption_declaration,
      antimafia: false, // Not in API checklist, add default
      fuel_mix: false, // Not in API checklist, add default
    } : undefined,
    integrazioni: {
      gse: apiplant.gse_integration,
      terna: apiplant.terna_integration,
      dogane: apiplant.customs_integration,
      dso: apiplant.dso_integration,
    },
    created_at: apiplant.created_at,
    updated_at: apiplant.updated_at,
  };
}

/**
 * Safely get potenza in kW from plant
 */
export function getplantPotenzaKw(plant: Apiplant | LocalPlant | any): number {
  // Check for power_kw field (both API and Local types have this)
  if (plant.power_kw !== undefined && plant.power_kw !== null) {
    return typeof plant.power_kw === 'number' ? plant.power_kw : parseFloat(plant.power_kw);
  }
  
  // Check for powerKw field (alternative naming)
  if (plant.powerKw !== undefined && plant.powerKw !== null) {
    return typeof plant.powerKw === 'number' ? plant.powerKw : parseFloat(plant.powerKw);
  }
  
  // Parse from power string
  if (plant.power && typeof plant.power === 'string') {
    // Extract number from strings like "50 kW" or "1.5 MW"
    const match = plant.power.match(/[\d.]+/);
    if (match) {
      const value = parseFloat(match[0]);
      // Check if it's MW and convert to kW
      if (plant.power.toLowerCase().includes('mw')) {
        return value * 1000;
      }
      return value;
    }
  }
  
  return 0;
}

/**
 * Convert template ID to number for API requests
 */
export function normalizeTemplateId(id: string | number | undefined): number | undefined {
  if (id === undefined) return undefined;
  return typeof id === 'string' ? parseInt(id, 10) : id;
}

/**
 * Map backend plant data to frontend Plant format
 */
export function mapBackendToPlant(data: any): Plant {
  return {
    id: data.id,
    name: data.name,
    code: data.code,
    power: data.power,
    powerKw: data.power_kw,
    status: data.status,
    type: data.type,
    location: data.location,
    municipality: data.municipality,
    province: data.province,
    region: data.region,
    // Map deadline fields
    nextDeadline: data.next_deadline || data.nextDeadline,
    nextDeadlineType: data.prossima_scadenza_type || data.prossimaScadenzatype,
    deadlineColor: data.deadline_color || data.deadlineColor,
    // Map integration fields
    gseIntegration: data.gse_integration ?? false,
    ternaIntegration: data.terna_integration ?? false,
    customsIntegration: data.customs_integration ?? false,
    dsoIntegration: data.dso_integration ?? false,
    // Map nested objects
    registry: data.registry ? mapBackendRegistry(data.registry) : undefined,
    checklist: data.checklist ? mapBackendChecklist(data.checklist) : undefined,
    // Timestamps
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    // Tenant
    tenantId: data.tenant_id || ''
  };
}

/**
 * Map frontend Plant data to backend plant format
 */
export function mapPlantToBackend(data: Partial<Plant>): any {
  const mapped: any = {};

  // Map basic fields
  if (data.id !== undefined) mapped.id = data.id;
  if (data.name !== undefined) mapped.name = data.name;
  if (data.code !== undefined) mapped.code = data.code;
  if (data.power !== undefined) mapped.power = data.power;
  if (data.powerKw !== undefined) mapped.power_kw = data.powerKw;
  if (data.status !== undefined) mapped.status = data.status;
  if (data.type !== undefined) mapped.type = data.type;
  if (data.location !== undefined) mapped.location = data.location;
  if (data.municipality !== undefined) mapped.municipality = data.municipality;
  if (data.province !== undefined) mapped.province = data.province;
  if (data.region !== undefined) mapped.region = data.region;

  // Map integration fields
  if (data.gseIntegration !== undefined) mapped.gse_integration = data.gseIntegration;
  if (data.ternaIntegration !== undefined) mapped.terna_integration = data.ternaIntegration;
  if (data.customsIntegration !== undefined) mapped.customs_integration = data.customsIntegration;
  if (data.dsoIntegration !== undefined) mapped.dso_integration = data.dsoIntegration;

  return mapped;
}

/**
 * Map backend registry data
 */
function mapBackendRegistry(data: any): any {
  return {
    id: data.id,
    pod: data.pod,
    gaudiCode: data.gaudi || data.gaudiCode,
    censimpCode: data.censimp || data.censimpCode,
    operationDate: data.data_esercizio || data.dataEsercizio,
    regime: data.regime,
    responsible: data.assignee,
    insurance: data.assicurazione,
    moduleCount: data.numero_moduli || data.numeroModuli,
    inverterCount: data.numero_inverter || data.numeroInverter,
    occupiedArea: data.superficie_occupata || data.superficieOccupata
  };
}

/**
 * Map backend checklist data
 */
function mapBackendChecklist(data: any): any {
  return {
    dsoConnection: data.connessione_dso ?? false,
    ternaRegistration: data.registrazione_terna ?? false,
    gseActivation: data.attivazione_gse ?? false,
    customsLicense: data.licenza_dogane ?? false,
    spiVerification: data.verifica_spi ?? false,
    consumptionDeclaration: data.dichiarazione_consumo ?? false,
    antimafiaDocumentation: data.antimafia ?? false,
    fuelMixDeclaration: data.fuel_mix ?? false,
    complianceScore: calculateComplianceScore(data)
  };
}

/**
 * Calculate compliance score
 */
function calculateComplianceScore(checklist: any): number {
  const items = [
    checklist.connessione_dso,
    checklist.registrazione_terna,
    checklist.attivazione_gse,
    checklist.licenza_dogane,
    checklist.verifica_spi,
    checklist.dichiarazione_consumo,
    checklist.antimafia,
    checklist.fuel_mix
  ].filter(item => item !== undefined);
  
  if (items.length === 0) return 0;
  
  const completed = items.filter(item => item === true).length;
  return Math.round((completed / items.length) * 100);
}
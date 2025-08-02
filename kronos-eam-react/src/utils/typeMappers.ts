/**
 * Type mapper utilities for converting between API and local types
 */

import type { Plant as LocalPlant } from '../types';
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
    codice: apiplant.code,
    potenza: apiplant.power,
    potenza_kw: apiplant.power_kw,
    status: statusMap[apiplant.status] || apiplant.status,
    type: apiplant.type ? typeMap[apiplant.type] : undefined,
    location: apiplant.location,
    comune: apiplant.municipality,
    provincia: apiplant.province,
    regione: apiplant.region,
    prossimaScadenza: apiplant.next_deadline,
    prossima_scadenza: apiplant.next_deadline,
    prossima_scadenza_type: apiplant.next_deadline_type,
    coloreScadenza: apiplant.deadline_color,
    colore_scadenza: apiplant.deadline_color,
    integrazione_gse: apiplant.gse_integration,
    integrazione_terna: apiplant.terna_integration,
    integrazione_dogane: apiplant.customs_integration,
    integrazione_dso: apiplant.dso_integration,
    registry: apiplant.registry ? {
      id: apiplant.registry.id,
      pod: apiplant.registry.pod,
      gaudi: apiplant.registry.gaudi,
      censimp: apiplant.registry.censimp,
      dataEsercizio: apiplant.registry.data_esercizio,
      data_esercizio: apiplant.registry.data_esercizio,
      regime: apiplant.registry.regime,
      responsabile: apiplant.registry.responsabile,
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
export function getplantPotenzaKw(plant: Apiplant | LocalPlant): number {
  // For API Plant type
  if ('power_kw' in plant && plant.power_kw) {
    return plant.power_kw;
  }
  
  // For local plant type
  if ('potenza_kw' in plant && plant.potenza_kw) {
    return plant.potenza_kw;
  }
  
  // Parse from power string (API)
  if ('power' in plant && typeof plant.power === 'string') {
    const parsed = parseFloat(plant.power);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  // Parse from potenza string (local)
  if ('potenza' in plant && typeof plant.potenza === 'string') {
    const parsed = parseFloat(plant.potenza);
    return isNaN(parsed) ? 0 : parsed;
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
    code: data.codice,
    power: data.potenza,
    powerKw: data.potenza_kw,
    status: data.status,
    type: data.type,
    location: data.location,
    municipality: data.comune,
    province: data.provincia,
    region: data.regione,
    // Map deadline fields
    nextDeadline: data.prossima_scadenza || data.prossimaScadenza,
    nextDeadlineType: data.prossima_scadenza_type || data.prossimaScadenzatype,
    deadlineColor: data.colore_scadenza || data.coloreScadenza,
    // Map integration fields
    gseIntegration: data.integrazione_gse ?? false,
    ternaIntegration: data.integrazione_terna ?? false,
    customsIntegration: data.integrazione_dogane ?? false,
    dsoIntegration: data.integrazione_dso ?? false,
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
  if (data.code !== undefined) mapped.codice = data.code;
  if (data.power !== undefined) mapped.potenza = data.power;
  if (data.powerKw !== undefined) mapped.potenza_kw = data.powerKw;
  if (data.status !== undefined) mapped.status = data.status;
  if (data.type !== undefined) mapped.type = data.type;
  if (data.location !== undefined) mapped.location = data.location;
  if (data.municipality !== undefined) mapped.comune = data.municipality;
  if (data.province !== undefined) mapped.provincia = data.province;
  if (data.region !== undefined) mapped.regione = data.region;

  // Map integration fields
  if (data.gseIntegration !== undefined) mapped.integrazione_gse = data.gseIntegration;
  if (data.ternaIntegration !== undefined) mapped.integrazione_terna = data.ternaIntegration;
  if (data.customsIntegration !== undefined) mapped.integrazione_dogane = data.customsIntegration;
  if (data.dsoIntegration !== undefined) mapped.integrazione_dso = data.dsoIntegration;

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
    responsible: data.responsabile,
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
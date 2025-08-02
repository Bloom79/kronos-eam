/**
 * Utility functions
 */

/**
 * Normalize template ID to ensure it's a number
 * Handles both string and number inputs
 */
export const normalizeTemplateId = (id: string | number | undefined): number | undefined => {
  if (id === undefined || id === null) return undefined;
  return typeof id === 'string' ? parseInt(id, 10) : id;
};

/**
 * Extract power (kW) from plant object
 * Handles different property names for power
 */
export const getplantPotenzaKw = (plant: any): number => {
  if (!plant) return 0;
  
  // Try different property names
  return plant.potenza_kw || 
         plant.potenza || 
         plant.potenza_nominale_kw || 
         plant.potenza_nominale ||
         0;
};
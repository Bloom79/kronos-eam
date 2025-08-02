/**
 * Validation utility functions
 */

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Italian fiscal code (Codice Fiscale)
 */
export function isValidCodiceFiscale(cf: string): boolean {
  if (!cf || cf.length !== 16) return false;
  
  const cfRegex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/;
  return cfRegex.test(cf.toUpperCase());
}

/**
 * Validate Italian VAT number (Partita IVA)
 */
export function isValidPartitaIVA(piva: string): boolean {
  if (!piva || piva.length !== 11) return false;
  
  const pivaRegex = /^[0-9]{11}$/;
  return pivaRegex.test(piva);
}

/**
 * Validate POD (Point of Delivery) code
 */
export function isValidPOD(pod: string): boolean {
  if (!pod) return false;
  
  // Italian POD format: IT001E12345678
  const podRegex = /^IT[0-9]{3}[A-Z][0-9]{8}$/;
  return podRegex.test(pod.toUpperCase());
}

/**
 * Validate power value
 */
export function isValidPower(power: number | string): boolean {
  const numPower = typeof power === 'string' ? parseFloat(power) : power;
  return !isNaN(numPower) && numPower > 0;
}

/**
 * Validate date is not in the past
 */
export function isDateInFuture(date: string | Date): boolean {
  const dateObj = date instanceof Date ? date : new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return dateObj >= today;
}

/**
 * Validate date range
 */
export function isValidDateRange(startDate: string | Date, endDate: string | Date): boolean {
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);
  
  return start <= end;
}

/**
 * Validate Italian province code
 */
export function isValidProvince(province: string): boolean {
  if (!province || province.length !== 2) return false;
  
  // List of valid Italian province codes
  const validProvinces = [
    'AG', 'AL', 'AN', 'AO', 'AP', 'AQ', 'AR', 'AT', 'AV', 'BA', 'BG', 'BI', 'BL', 'BN', 'BO',
    'BR', 'BS', 'BT', 'BZ', 'CA', 'CB', 'CE', 'CH', 'CI', 'CL', 'CN', 'CO', 'CR', 'CS', 'CT',
    'CZ', 'EN', 'FC', 'FE', 'FG', 'FI', 'FM', 'FR', 'GE', 'GO', 'GR', 'IM', 'IS', 'KR', 'LC',
    'LE', 'LI', 'LO', 'LT', 'LU', 'MB', 'MC', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NA', 'NO',
    'NU', 'OG', 'OR', 'OT', 'PA', 'PC', 'PD', 'PE', 'PG', 'PI', 'PN', 'PO', 'PR', 'PT', 'PU',
    'PV', 'PZ', 'RA', 'RC', 'RE', 'RG', 'RI', 'RM', 'RN', 'RO', 'SA', 'SI', 'SO', 'SP', 'SR',
    'SS', 'SU', 'SV', 'TA', 'TE', 'TN', 'TO', 'TP', 'TR', 'TS', 'TV', 'UD', 'VA', 'VB', 'VC',
    'VE', 'VI', 'VR', 'VS', 'VT', 'VV'
  ];
  
  return validProvinces.includes(province.toUpperCase());
}

/**
 * Validate required fields in an object
 */
export function validateRequiredFields<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[]
): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    const value = data[field];
    if (value === null || value === undefined || value === '') {
      missingFields.push(String(field));
    }
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}

/**
 * Validate file type
 */
export function isValidFileType(filename: string, allowedTypes: string[]): boolean {
  const extension = filename.split('.').pop()?.toLowerCase();
  if (!extension) return false;
  
  return allowedTypes.map(t => t.toLowerCase()).includes(extension);
}

/**
 * Validate file size (in bytes)
 */
export function isValidFileSize(size: number, maxSizeInMB: number): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return size <= maxSizeInBytes;
}
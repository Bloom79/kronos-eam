/**
 * Utility functions for exporting data
 */

interface ExportToCSVOptions {
  filename?: string;
  headers?: string[];
  includeTimestamp?: boolean;
}

/**
 * Export data array to CSV file
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  options: ExportToCSVOptions = {}
): void {
  const {
    filename = 'export',
    headers,
    includeTimestamp = true
  } = options;

  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Create CSV content
  const csvRows = [
    // Header row
    csvHeaders.join(','),
    // Data rows
    ...data.map(row => 
      csvHeaders.map(header => {
        const value = row[header as keyof T];
        // Escape values containing commas or quotes
        const stringValue = value?.toString() || '';
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ];

  const csvContent = csvRows.join('\n');
  
  // Create blob and download
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  // Generate filename with timestamp if requested
  const timestamp = includeTimestamp ? `_${new Date().toISOString().split('T')[0]}` : '';
  const fullFilename = `${filename}${timestamp}.csv`;
  
  link.setAttribute('href', url);
  link.setAttribute('download', fullFilename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
}

/**
 * Format date for export
 */
export function formatDateForExport(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * Format currency for export
 */
export function formatCurrencyForExport(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') return '';
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return '';
  
  return numAmount.toFixed(2);
}

/**
 * Prepare plant data for export
 */
export function preparePlantDataForExport(plants: any[]): any[] {
  return plants.map(plant => ({
    Name: plant.name,
    Code: plant.codice,
    Power: plant.potenza,
    Status: plant.status,
    Type: plant.type,
    Location: plant.location,
    Municipality: plant.comune || '',
    Province: plant.provincia || '',
    Region: plant.regione || '',
    'Created Date': formatDateForExport(plant.created_at),
    'Next Deadline': plant.prossima_scadenza || plant.prossimaScadenza || ''
  }));
}
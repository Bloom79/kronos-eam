/**
 * Formatting utility functions
 */

/**
 * Format power value with appropriate unit (kW or MW)
 */
export function formatPower(kw: number): string {
  if (kw >= 1000) {
    return `${(kw / 1000).toFixed(1)} MW`;
  }
  return `${kw} kW`;
}

/**
 * Format date to localized string
 */
export function formatDate(date: string | Date | null | undefined, locale = 'en-US'): string {
  if (!date) return '-';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return '-';
  }
}

/**
 * Format date time to localized string
 */
export function formatDateTime(date: string | Date | null | undefined, locale = 'en-US'): string {
  if (!date) return '-';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '-';
  }
}

/**
 * Format currency
 */
export function formatCurrency(amount: number | string | null | undefined, currency = 'EUR'): string {
  if (amount === null || amount === undefined || amount === '') return '-';
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return '-';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numAmount);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number | null | undefined, decimals = 0): string {
  if (value === null || value === undefined || isNaN(value)) return '-';
  
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Format duration in days to human readable
 */
export function formatDuration(days: number): string {
  if (days < 1) return 'Less than a day';
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  if (days < 30) return `${Math.floor(days / 7)} weeks`;
  if (days < 365) return `${Math.floor(days / 30)} months`;
  return `${Math.floor(days / 365)} years`;
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
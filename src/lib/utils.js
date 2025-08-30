import { api } from './config';

/**
 * Builds a full image URL from a relative path
 * @param {string} imagePath - The relative image path from the API
 * @returns {string} The full image URL
 */
export function getImageUrl(imagePath) {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  
  return `${api.baseURL}/${cleanPath}`;
}

/**
 * Formats price with proper currency
 * @param {number} price - The price to format
 * @param {string} currency - The currency code (default: 'USD')
 * @returns {string} Formatted price
 */
export function formatPrice(price, currency = 'USD') {
  if (price == null || price === undefined) return '';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price);
}

/**
 * Truncates text to a specified length
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

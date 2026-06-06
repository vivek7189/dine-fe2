/**
 * Currency formatting utilities
 */

import { defaultCurrencySettings } from '../lib/currencyData';

/**
 * Format a number as currency with the given settings
 * @param {number} amount - The amount to format
 * @param {object} settings - Currency settings object
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, settings = null) {
  const config = settings || defaultCurrencySettings;

  // Handle invalid amounts
  if (amount === null || amount === undefined || isNaN(amount)) {
    return config.symbolPosition === 'before'
      ? `${config.currencySymbol}0`
      : `0${config.currencySymbol}`;
  }

  const numAmount = parseFloat(amount);

  // Format the number with proper decimal places
  const fixedAmount = numAmount.toFixed(config.decimalPlaces || 2);

  // Split into integer and decimal parts
  const [intPart, decPart] = fixedAmount.split('.');

  // Add thousand separators to integer part
  const separator = config.thousandSeparator || ',';
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);

  // Combine with decimal part
  const decimalSep = config.decimalSeparator || '.';
  const formattedNumber = (config.decimalPlaces || 2) > 0
    ? `${formattedInt}${decimalSep}${decPart}`
    : formattedInt;

  // Add symbol in correct position
  const symbol = config.currencySymbol || '';
  if (config.symbolPosition === 'after') {
    return `${formattedNumber}${symbol}`;
  }
  return `${symbol}${formattedNumber}`;
}

/**
 * Format currency and return parts separately for custom rendering
 * @param {number} amount - The amount to format
 * @param {object} settings - Currency settings object
 * @returns {object} Object with symbol, amount, and position
 */
export function formatCurrencyParts(amount, settings = null) {
  const config = settings || defaultCurrencySettings;

  // Handle invalid amounts
  if (amount === null || amount === undefined || isNaN(amount)) {
    return {
      symbol: config.currencySymbol || '',
      amount: '0',
      position: config.symbolPosition || 'before'
    };
  }

  const numAmount = parseFloat(amount);

  // Format the number with proper decimal places
  const fixedAmount = numAmount.toFixed(config.decimalPlaces || 2);

  // Split into integer and decimal parts
  const [intPart, decPart] = fixedAmount.split('.');

  // Add thousand separators to integer part
  const separator = config.thousandSeparator || ',';
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);

  // Combine with decimal part
  const decimalSep = config.decimalSeparator || '.';
  const formattedNumber = (config.decimalPlaces || 2) > 0
    ? `${formattedInt}${decimalSep}${decPart}`
    : formattedInt;

  return {
    symbol: config.currencySymbol || '',
    amount: formattedNumber,
    position: config.symbolPosition || 'before'
  };
}

/**
 * Get just the currency symbol from settings
 * @param {object} settings - Currency settings object
 * @returns {string} Currency symbol
 */
export function getCurrencySymbol(settings = null) {
  const config = settings || defaultCurrencySettings;
  return config.currencySymbol || '';
}

/**
 * Format currency using Intl.NumberFormat (uses browser locale formatting)
 * @param {number} amount - The amount to format
 * @param {object} settings - Currency settings object
 * @returns {string} Formatted currency string
 */
export function formatCurrencyIntl(amount, settings = null) {
  const config = settings || defaultCurrencySettings;

  // Handle invalid amounts
  if (amount === null || amount === undefined || isNaN(amount)) {
    amount = 0;
  }

  try {
    return new Intl.NumberFormat(config.locale || 'en-IN', {
      style: 'currency',
      currency: config.currencyCode || 'INR',
      minimumFractionDigits: config.decimalPlaces || 2,
      maximumFractionDigits: config.decimalPlaces || 2
    }).format(amount);
  } catch (error) {
    // Fallback to manual formatting if Intl fails
    return formatCurrency(amount, config);
  }
}

/**
 * Parse a formatted currency string back to a number
 * @param {string} formattedValue - The formatted currency string
 * @param {object} settings - Currency settings object
 * @returns {number} The numeric value
 */
export function parseCurrencyString(formattedValue, settings = null) {
  const config = settings || defaultCurrencySettings;

  if (!formattedValue || typeof formattedValue !== 'string') {
    return 0;
  }

  // Remove currency symbol
  let cleaned = formattedValue.replace(config.currencySymbol || '', '');

  // Remove thousand separators
  const thousandSep = config.thousandSeparator || ',';
  cleaned = cleaned.split(thousandSep).join('');

  // Replace decimal separator with standard period
  const decimalSep = config.decimalSeparator || '.';
  if (decimalSep !== '.') {
    cleaned = cleaned.replace(decimalSep, '.');
  }

  // Remove any remaining non-numeric characters except decimal point and minus
  cleaned = cleaned.replace(/[^\d.-]/g, '');

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format currency for HTML templates (print receipts, etc.)
 * Returns HTML-safe string
 * @param {number} amount - The amount to format
 * @param {object} settings - Currency settings object
 * @returns {string} HTML-safe formatted currency string
 */
export function formatCurrencyHtml(amount, settings = null) {
  const formatted = formatCurrency(amount, settings);
  // Escape any HTML special characters
  return formatted
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

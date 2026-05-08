/**
 * Denomination data for cash register counting across all supported currencies.
 * Each currency has its notes and coins listed from highest to lowest value.
 */

export const denominationsByCurrency = {
  // India
  INR: {
    notes: [2000, 500, 200, 100, 50, 20, 10],
    coins: [5, 2, 1],
  },
  // United States
  USD: {
    notes: [100, 50, 20, 10, 5, 2, 1],
    coins: [0.25, 0.10, 0.05, 0.01],
    coinNames: { 0.25: 'Quarter', 0.10: 'Dime', 0.05: 'Nickel', 0.01: 'Penny' },
  },
  // United Kingdom
  GBP: {
    notes: [50, 20, 10, 5],
    coins: [2, 1, 0.50, 0.20, 0.10, 0.05, 0.02, 0.01],
  },
  // Eurozone
  EUR: {
    notes: [500, 200, 100, 50, 20, 10, 5],
    coins: [2, 1, 0.50, 0.20, 0.10, 0.05, 0.02, 0.01],
  },
  // UAE
  AED: {
    notes: [1000, 500, 200, 100, 50, 20, 10, 5],
    coins: [1, 0.50, 0.25],
  },
  // Saudi Arabia
  SAR: {
    notes: [500, 200, 100, 50, 10, 5, 1],
    coins: [2, 1, 0.50, 0.25],
  },
  // Canada
  CAD: {
    notes: [100, 50, 20, 10, 5],
    coins: [2, 1, 0.25, 0.10, 0.05],
    coinNames: { 2: 'Toonie', 1: 'Loonie' },
  },
  // Australia
  AUD: {
    notes: [100, 50, 20, 10, 5],
    coins: [2, 1, 0.50, 0.20, 0.10, 0.05],
  },
  // Singapore
  SGD: {
    notes: [1000, 100, 50, 10, 5, 2],
    coins: [1, 0.50, 0.20, 0.10, 0.05],
  },
  // Malaysia
  MYR: {
    notes: [100, 50, 20, 10, 5, 1],
    coins: [0.50, 0.20, 0.10, 0.05],
  },
  // Thailand
  THB: {
    notes: [1000, 500, 100, 50, 20],
    coins: [10, 5, 2, 1, 0.50, 0.25],
  },
  // Japan (no coins below 1)
  JPY: {
    notes: [10000, 5000, 2000, 1000],
    coins: [500, 100, 50, 10, 5, 1],
  },
  // South Korea
  KRW: {
    notes: [50000, 10000, 5000, 1000],
    coins: [500, 100, 50, 10],
  },
  // Bangladesh
  BDT: {
    notes: [1000, 500, 200, 100, 50, 20, 10, 5, 2],
    coins: [5, 2, 1],
  },
  // Pakistan
  PKR: {
    notes: [5000, 1000, 500, 100, 75, 50, 20, 10],
    coins: [10, 5, 2, 1],
  },
  // Nepal
  NPR: {
    notes: [1000, 500, 100, 50, 20, 10, 5],
    coins: [2, 1],
  },
  // South Africa
  ZAR: {
    notes: [200, 100, 50, 20, 10],
    coins: [5, 2, 1, 0.50, 0.20, 0.10],
  },
  // Nigeria
  NGN: {
    notes: [1000, 500, 200, 100, 50, 20, 10, 5],
    coins: [2, 1, 0.50],
  },
  // Kenya
  KES: {
    notes: [1000, 500, 200, 100, 50],
    coins: [40, 20, 10, 5, 1],
  },
  // Egypt
  EGP: {
    notes: [200, 100, 50, 20, 10, 5, 1],
    coins: [1, 0.50, 0.25],
  },
  // Brazil
  BRL: {
    notes: [200, 100, 50, 20, 10, 5, 2],
    coins: [1, 0.50, 0.25, 0.10, 0.05],
  },
  // Mexico
  MXN: {
    notes: [1000, 500, 200, 100, 50, 20],
    coins: [10, 5, 2, 1, 0.50, 0.20, 0.10],
  },
  // Indonesia
  IDR: {
    notes: [100000, 50000, 20000, 10000, 5000, 2000, 1000],
    coins: [1000, 500, 200, 100],
  },
  // Philippines
  PHP: {
    notes: [1000, 500, 200, 100, 50, 20],
    coins: [10, 5, 1, 0.25],
  },
  // Vietnam
  VND: {
    notes: [500000, 200000, 100000, 50000, 20000, 10000],
    coins: [5000, 2000, 1000, 500, 200],
  },
  // Switzerland
  CHF: {
    notes: [1000, 200, 100, 50, 20, 10],
    coins: [5, 2, 1, 0.50, 0.20, 0.10, 0.05],
  },
  // Poland
  PLN: {
    notes: [500, 200, 100, 50, 20, 10],
    coins: [5, 2, 1, 0.50, 0.20, 0.10, 0.05, 0.02, 0.01],
  },
  // Sweden
  SEK: {
    notes: [1000, 500, 200, 100, 50, 20],
    coins: [10, 5, 2, 1],
  },
  // Norway
  NOK: {
    notes: [1000, 500, 200, 100, 50],
    coins: [20, 10, 5, 1],
  },
  // Denmark
  DKK: {
    notes: [1000, 500, 200, 100, 50],
    coins: [20, 10, 5, 2, 1, 0.50],
  },
  // New Zealand
  NZD: {
    notes: [100, 50, 20, 10, 5],
    coins: [2, 1, 0.50, 0.20, 0.10],
  },
  // Qatar
  QAR: {
    notes: [500, 100, 50, 10, 5, 1],
    coins: [0.50, 0.25],
  },
  // Kuwait
  KWD: {
    notes: [20, 10, 5, 1, 0.50, 0.25],
    coins: [0.100, 0.050, 0.020, 0.010, 0.005],
  },
  // Bahrain
  BHD: {
    notes: [20, 10, 5, 1, 0.5],
    coins: [0.100, 0.050, 0.025, 0.010, 0.005],
  },
  // Oman
  OMR: {
    notes: [50, 20, 10, 5, 1, 0.5, 0.2, 0.1],
    coins: [0.050, 0.025, 0.010, 0.005],
  },
  // Turkey
  TRY: {
    notes: [200, 100, 50, 20, 10, 5],
    coins: [1, 0.50, 0.25, 0.10, 0.05],
  },
  // Sri Lanka
  LKR: {
    notes: [5000, 2000, 1000, 500, 100, 50, 20],
    coins: [10, 5, 2, 1],
  },
  // Myanmar
  MMK: {
    notes: [10000, 5000, 1000, 500, 200, 100, 50],
    coins: [100, 50, 10, 5, 1],
  },
};

/**
 * Generate a denomination key safe for object property use.
 * Notes use plain value string, coins use 'coin_' prefix.
 */
function denomKey(value, isCoin) {
  if (isCoin) return `coin_${String(value)}`;
  return String(value);
}

/**
 * Format a denomination value for display label.
 * Uses the currency symbol and handles decimals.
 */
function formatDenomLabel(value, currencySymbol, isCoin, coinName) {
  if (coinName) return `${currencySymbol}${value} ${coinName}`;

  // Format value nicely
  let formatted;
  if (Number.isInteger(value)) {
    formatted = value.toLocaleString();
  } else {
    formatted = value.toFixed(2);
  }

  if (isCoin) {
    return `${currencySymbol}${formatted} coin`;
  }
  return `${currencySymbol}${formatted}`;
}

/**
 * Get flat array of denomination labels for UI rendering.
 * Returns [{key, label, value, isCoin}] sorted from highest note to lowest coin.
 */
export function getDenominationLabels(currencyCode, currencySymbol) {
  const config = denominationsByCurrency[currencyCode];
  if (!config) return [];

  const symbol = currencySymbol || '';
  const coinNames = config.coinNames || {};
  const labels = [];

  for (const val of (config.notes || [])) {
    labels.push({
      key: denomKey(val, false),
      label: formatDenomLabel(val, symbol, false),
      value: val,
      isCoin: false,
    });
  }

  for (const val of (config.coins || [])) {
    labels.push({
      key: denomKey(val, true),
      label: formatDenomLabel(val, symbol, true, coinNames[val]),
      value: val,
      isCoin: true,
    });
  }

  return labels;
}

/**
 * Build initial zero-state object for denomination counts.
 * Returns {key: 0} for each denomination.
 */
export function buildDenomState(currencyCode) {
  const config = denominationsByCurrency[currencyCode];
  if (!config) return {};

  const state = {};
  for (const val of (config.notes || [])) {
    state[denomKey(val, false)] = 0;
  }
  for (const val of (config.coins || [])) {
    state[denomKey(val, true)] = 0;
  }
  return state;
}

/**
 * Quick preset amounts for opening cash, per currency.
 */
const quickPresetsByCurrency = {
  INR: [1000, 2000, 5000],
  USD: [100, 200, 500],
  GBP: [50, 100, 200],
  EUR: [100, 200, 500],
  AED: [200, 500, 1000],
  SAR: [200, 500, 1000],
  CAD: [100, 200, 500],
  AUD: [100, 200, 500],
  SGD: [100, 200, 500],
  MYR: [100, 200, 500],
  THB: [1000, 2000, 5000],
  JPY: [5000, 10000, 30000],
  KRW: [50000, 100000, 200000],
  BDT: [1000, 2000, 5000],
  PKR: [1000, 2000, 5000],
  NPR: [1000, 2000, 5000],
  ZAR: [200, 500, 1000],
  NGN: [5000, 10000, 20000],
  KES: [1000, 2000, 5000],
  EGP: [500, 1000, 2000],
  BRL: [100, 200, 500],
  MXN: [500, 1000, 2000],
  IDR: [100000, 200000, 500000],
  PHP: [500, 1000, 2000],
  VND: [200000, 500000, 1000000],
  CHF: [100, 200, 500],
  PLN: [100, 200, 500],
  SEK: [500, 1000, 2000],
  NOK: [500, 1000, 2000],
  DKK: [500, 1000, 2000],
  NZD: [100, 200, 500],
  QAR: [100, 200, 500],
  KWD: [5, 10, 20],
  BHD: [5, 10, 20],
  OMR: [5, 10, 20],
  TRY: [200, 500, 1000],
  LKR: [2000, 5000, 10000],
  MMK: [5000, 10000, 50000],
};

/**
 * Get quick preset amounts for opening cash for a given currency.
 */
export function getQuickPresets(currencyCode) {
  return quickPresetsByCurrency[currencyCode] || [100, 500, 1000];
}

/**
 * Compute total from denomination counts safely (handles floating point).
 */
export function computeDenomTotal(denominationLabels, denoms) {
  const raw = denominationLabels.reduce((sum, d) => {
    return sum + (denoms[d.key] || 0) * d.value;
  }, 0);
  return Math.round(raw * 100) / 100;
}

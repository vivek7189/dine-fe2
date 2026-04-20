/**
 * Auto-detect user's country using a 3-layer cascade:
 * 1. Vercel geo cookie (set by middleware from x-vercel-ip-country header)
 * 2. Browser timezone (Intl API)
 * 3. navigator.language region subtag
 *
 * Persists to localStorage so detection only runs once.
 */
import { getCurrencyByCountryCode, currencyByCountry } from './currencyData';

// ~70 entries covering all 52 supported countries.
// Multi-timezone countries get major city entries.
const TIMEZONE_TO_COUNTRY = {
  // India
  'Asia/Kolkata': 'IN',
  'Asia/Calcutta': 'IN',
  // United States
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Los_Angeles': 'US',
  'America/Phoenix': 'US',
  'America/Anchorage': 'US',
  'Pacific/Honolulu': 'US',
  'America/Detroit': 'US',
  'America/Indiana/Indianapolis': 'US',
  // Canada
  'America/Toronto': 'CA',
  'America/Vancouver': 'CA',
  'America/Edmonton': 'CA',
  'America/Winnipeg': 'CA',
  'America/Halifax': 'CA',
  'America/St_Johns': 'CA',
  // United Kingdom
  'Europe/London': 'GB',
  // Australia
  'Australia/Sydney': 'AU',
  'Australia/Melbourne': 'AU',
  'Australia/Brisbane': 'AU',
  'Australia/Perth': 'AU',
  'Australia/Adelaide': 'AU',
  'Australia/Hobart': 'AU',
  'Australia/Darwin': 'AU',
  // Europe
  'Europe/Berlin': 'DE',
  'Europe/Paris': 'FR',
  'Europe/Rome': 'IT',
  'Europe/Madrid': 'ES',
  'Europe/Amsterdam': 'NL',
  'Europe/Brussels': 'BE',
  'Europe/Zurich': 'CH',
  'Europe/Vienna': 'AT',
  'Europe/Stockholm': 'SE',
  'Europe/Oslo': 'NO',
  'Europe/Copenhagen': 'DK',
  'Europe/Helsinki': 'FI',
  'Europe/Warsaw': 'PL',
  'Europe/Prague': 'CZ',
  'Europe/Budapest': 'HU',
  'Europe/Bucharest': 'RO',
  'Europe/Dublin': 'IE',
  'Europe/Lisbon': 'PT',
  'Europe/Athens': 'GR',
  'Europe/Istanbul': 'TR',
  'Europe/Moscow': 'RU',
  // Americas
  'America/Sao_Paulo': 'BR',
  'America/Rio_Branco': 'BR',
  'America/Argentina/Buenos_Aires': 'AR',
  'America/Mexico_City': 'MX',
  'America/Cancun': 'MX',
  'America/Tijuana': 'MX',
  // East Asia
  'Asia/Shanghai': 'CN',
  'Asia/Chongqing': 'CN',
  'Asia/Tokyo': 'JP',
  'Asia/Seoul': 'KR',
  'Asia/Hong_Kong': 'HK',
  'Asia/Taipei': 'TW',
  // Southeast Asia
  'Asia/Singapore': 'SG',
  'Asia/Kuala_Lumpur': 'MY',
  'Asia/Bangkok': 'TH',
  'Asia/Ho_Chi_Minh': 'VN',
  'Asia/Saigon': 'VN',
  'Asia/Manila': 'PH',
  'Asia/Jakarta': 'ID',
  'Asia/Makassar': 'ID',
  // South Asia
  'Asia/Dhaka': 'BD',
  'Asia/Karachi': 'PK',
  'Asia/Colombo': 'LK',
  'Asia/Kathmandu': 'NP',
  // Middle East
  'Asia/Riyadh': 'SA',
  'Asia/Dubai': 'AE',
  'Asia/Qatar': 'QA',
  'Asia/Kuwait': 'KW',
  'Asia/Bahrain': 'BH',
  'Asia/Muscat': 'OM',
  'Asia/Jerusalem': 'IL',
  'Asia/Tel_Aviv': 'IL',
  // Africa
  'Africa/Johannesburg': 'ZA',
  'Africa/Cairo': 'EG',
  'Africa/Lagos': 'NG',
  'Africa/Nairobi': 'KE',
  // Oceania
  'Pacific/Auckland': 'NZ',
};

// Country flags for display
const COUNTRY_FLAGS = {
  IN: '\u{1F1EE}\u{1F1F3}', US: '\u{1F1FA}\u{1F1F8}', GB: '\u{1F1EC}\u{1F1E7}',
  CA: '\u{1F1E8}\u{1F1E6}', AU: '\u{1F1E6}\u{1F1FA}', DE: '\u{1F1E9}\u{1F1EA}',
  FR: '\u{1F1EB}\u{1F1F7}', IT: '\u{1F1EE}\u{1F1F9}', ES: '\u{1F1EA}\u{1F1F8}',
  NL: '\u{1F1F3}\u{1F1F1}', BE: '\u{1F1E7}\u{1F1EA}', CH: '\u{1F1E8}\u{1F1ED}',
  AT: '\u{1F1E6}\u{1F1F9}', SE: '\u{1F1F8}\u{1F1EA}', NO: '\u{1F1F3}\u{1F1F4}',
  DK: '\u{1F1E9}\u{1F1F0}', FI: '\u{1F1EB}\u{1F1EE}', PL: '\u{1F1F5}\u{1F1F1}',
  CZ: '\u{1F1E8}\u{1F1FF}', HU: '\u{1F1ED}\u{1F1FA}', RO: '\u{1F1F7}\u{1F1F4}',
  IE: '\u{1F1EE}\u{1F1EA}', PT: '\u{1F1F5}\u{1F1F9}', GR: '\u{1F1EC}\u{1F1F7}',
  BR: '\u{1F1E7}\u{1F1F7}', AR: '\u{1F1E6}\u{1F1F7}', MX: '\u{1F1F2}\u{1F1FD}',
  CN: '\u{1F1E8}\u{1F1F3}', JP: '\u{1F1EF}\u{1F1F5}', KR: '\u{1F1F0}\u{1F1F7}',
  SG: '\u{1F1F8}\u{1F1EC}', MY: '\u{1F1F2}\u{1F1FE}', TH: '\u{1F1F9}\u{1F1ED}',
  VN: '\u{1F1FB}\u{1F1F3}', PH: '\u{1F1F5}\u{1F1ED}', ID: '\u{1F1EE}\u{1F1E9}',
  BD: '\u{1F1E7}\u{1F1E9}', PK: '\u{1F1F5}\u{1F1F0}', LK: '\u{1F1F1}\u{1F1F0}',
  NP: '\u{1F1F3}\u{1F1F5}', SA: '\u{1F1F8}\u{1F1E6}', AE: '\u{1F1E6}\u{1F1EA}',
  QA: '\u{1F1F6}\u{1F1E6}', KW: '\u{1F1F0}\u{1F1FC}', BH: '\u{1F1E7}\u{1F1ED}',
  OM: '\u{1F1F4}\u{1F1F2}', TR: '\u{1F1F9}\u{1F1F7}', RU: '\u{1F1F7}\u{1F1FA}',
  ZA: '\u{1F1FF}\u{1F1E6}', EG: '\u{1F1EA}\u{1F1EC}', NG: '\u{1F1F3}\u{1F1EC}',
  KE: '\u{1F1F0}\u{1F1EA}', NZ: '\u{1F1F3}\u{1F1FF}', IL: '\u{1F1EE}\u{1F1F1}',
  HK: '\u{1F1ED}\u{1F1F0}', TW: '\u{1F1F9}\u{1F1FC}',
};

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function isSupported(code) {
  return code && currencyByCountry[code.toUpperCase()];
}

function getCountryFromTimezone() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz) return null;
    return TIMEZONE_TO_COUNTRY[tz] || null;
  } catch { return null; }
}

function getCountryFromLanguage() {
  try {
    const lang = navigator.language || navigator.userLanguage;
    if (!lang) return null;
    const parts = lang.split('-');
    if (parts.length >= 2) {
      const region = parts[parts.length - 1].toUpperCase();
      if (isSupported(region)) return region;
    }
    return null;
  } catch { return null; }
}

/**
 * Detect user's country code using layered fallbacks.
 * @returns {{ countryCode: string|null, method: string, confidence: 'high'|'medium'|'low'|'none' }}
 */
export function detectCountry() {
  if (typeof window === 'undefined') {
    return { countryCode: null, method: 'ssr', confidence: 'none' };
  }

  // 1. Already stored
  const stored = localStorage.getItem('selectedCountryCode');
  if (stored && isSupported(stored)) {
    return { countryCode: stored.toUpperCase(), method: 'stored', confidence: 'high' };
  }

  // 2. Vercel geo cookie
  const geo = getCookie('geo_country');
  if (geo && isSupported(geo)) {
    return { countryCode: geo.toUpperCase(), method: 'vercel_geo', confidence: 'high' };
  }

  // 3. Browser timezone
  const tz = getCountryFromTimezone();
  if (tz) {
    return { countryCode: tz, method: 'timezone', confidence: 'medium' };
  }

  // 4. navigator.language
  const lang = getCountryFromLanguage();
  if (lang) {
    return { countryCode: lang, method: 'language', confidence: 'low' };
  }

  return { countryCode: null, method: 'none', confidence: 'none' };
}

/**
 * Detect country and persist to localStorage.
 * Returns the detection result plus currency data.
 */
export function detectAndSetCountry() {
  const result = detectCountry();
  if (result.countryCode) {
    localStorage.setItem('selectedCountryCode', result.countryCode);
  }
  return {
    ...result,
    currency: result.countryCode ? getCurrencyByCountryCode(result.countryCode) : null,
  };
}

/**
 * Get flag emoji for a country code.
 */
export function getCountryFlag(countryCode) {
  if (!countryCode) return '';
  return COUNTRY_FLAGS[countryCode.toUpperCase()] || '';
}

/**
 * Format a price according to currency settings.
 * Lightweight — for onboarding/preview where CurrencyContext isn't available.
 */
export function formatPriceWithCurrency(price, currencyInfo) {
  if (!currencyInfo) return `₹${price}`;
  const num = typeof price === 'number' ? price : parseFloat(price) || 0;
  const formatted = num.toLocaleString(currencyInfo.locale || 'en-IN', {
    minimumFractionDigits: currencyInfo.decimalPlaces ?? 2,
    maximumFractionDigits: currencyInfo.decimalPlaces ?? 2,
  });
  const sym = currencyInfo.currencySymbol || '₹';
  return currencyInfo.symbolPosition === 'after' ? `${formatted} ${sym}` : `${sym}${formatted}`;
}

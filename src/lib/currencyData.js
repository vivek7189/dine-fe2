/**
 * Currency data mapping countries to their currencies.
 * Uses ISO 3166-1 alpha-2 country codes and ISO 4217 currency codes.
 */

// Country to currency mapping with full details
export const currencyByCountry = {
  // India
  IN: {
    countryCode: 'IN',
    countryName: 'India',
    currencyCode: 'INR',
    currencyName: 'Indian Rupee',
    currencySymbol: '₹',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    locale: 'en-IN',
    taxLabel: 'GST'
  },
  // United States
  US: {
    countryCode: 'US',
    countryName: 'United States',
    currencyCode: 'USD',
    currencyName: 'US Dollar',
    currencySymbol: '$',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    locale: 'en-US',
    taxLabel: 'Sales Tax'
  },
  // United Kingdom
  GB: {
    countryCode: 'GB',
    countryName: 'United Kingdom',
    currencyCode: 'GBP',
    currencyName: 'British Pound',
    currencySymbol: '£',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    locale: 'en-GB',
    taxLabel: 'VAT'
  },
  // Canada
  CA: {
    countryCode: 'CA',
    countryName: 'Canada',
    currencyCode: 'CAD',
    currencyName: 'Canadian Dollar',
    currencySymbol: '$',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    locale: 'en-CA',
    taxLabel: 'GST/HST'
  },
  // Australia
  AU: {
    countryCode: 'AU',
    countryName: 'Australia',
    currencyCode: 'AUD',
    currencyName: 'Australian Dollar',
    currencySymbol: '$',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    locale: 'en-AU',
    taxLabel: 'GST'
  },
  // Germany
  DE: {
    countryCode: 'DE',
    countryName: 'Germany',
    currencyCode: 'EUR',
    currencyName: 'Euro',
    currencySymbol: '€',
    symbolPosition: 'after',
    decimalPlaces: 2,
    thousandSeparator: '.',
    decimalSeparator: ',',
    locale: 'de-DE',
    taxLabel: 'MwSt'
  },
  // France
  FR: {
    countryCode: 'FR',
    countryName: 'France',
    currencyCode: 'EUR',
    currencyName: 'Euro',
    currencySymbol: '€',
    symbolPosition: 'after',
    decimalPlaces: 2,
    thousandSeparator: ' ',
    decimalSeparator: ',',
    locale: 'fr-FR',
    taxLabel: 'TVA'
  },
  // Italy
  IT: {
    countryCode: 'IT',
    countryName: 'Italy',
    currencyCode: 'EUR',
    currencyName: 'Euro',
    currencySymbol: '€',
    symbolPosition: 'after',
    decimalPlaces: 2,
    thousandSeparator: '.',
    decimalSeparator: ',',
    locale: 'it-IT',
    taxLabel: 'IVA'
  },
  // Spain
  ES: {
    countryCode: 'ES',
    countryName: 'Spain',
    currencyCode: 'EUR',
    currencyName: 'Euro',
    currencySymbol: '€',
    symbolPosition: 'after',
    decimalPlaces: 2,
    thousandSeparator: '.',
    decimalSeparator: ',',
    locale: 'es-ES',
    taxLabel: 'IVA'
  },
  // Netherlands
  NL: {
    countryCode: 'NL',
    countryName: 'Netherlands',
    currencyCode: 'EUR',
    currencyName: 'Euro',
    currencySymbol: '€',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: '.',
    decimalSeparator: ',',
    locale: 'nl-NL',
    taxLabel: 'BTW'
  },
  // Belgium
  BE: {
    countryCode: 'BE',
    countryName: 'Belgium',
    currencyCode: 'EUR',
    currencyName: 'Euro',
    currencySymbol: '€',
    symbolPosition: 'after',
    decimalPlaces: 2,
    thousandSeparator: '.',
    decimalSeparator: ',',
    locale: 'fr-BE',
    taxLabel: 'TVA'
  },
  // Switzerland
  CH: {
    countryCode: 'CH',
    countryName: 'Switzerland',
    currencyCode: 'CHF',
    currencyName: 'Swiss Franc',
    currencySymbol: 'CHF',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: "'",
    decimalSeparator: '.',
    locale: 'de-CH',
    taxLabel: 'MwSt'
  },
  // Austria
  AT: {
    countryCode: 'AT',
    countryName: 'Austria',
    currencyCode: 'EUR',
    currencyName: 'Euro',
    currencySymbol: '€',
    symbolPosition: 'after',
    decimalPlaces: 2,
    thousandSeparator: '.',
    decimalSeparator: ',',
    locale: 'de-AT',
    taxLabel: 'MwSt'
  },
  // Sweden
  SE: {
    countryCode: 'SE',
    countryName: 'Sweden',
    currencyCode: 'SEK',
    currencyName: 'Swedish Krona',
    currencySymbol: 'kr',
    symbolPosition: 'after',
    decimalPlaces: 2,
    thousandSeparator: ' ',
    decimalSeparator: ',',
    locale: 'sv-SE',
    taxLabel: 'Moms'
  },
  // Norway
  NO: {
    countryCode: 'NO',
    countryName: 'Norway',
    currencyCode: 'NOK',
    currencyName: 'Norwegian Krone',
    currencySymbol: 'kr',
    symbolPosition: 'after',
    decimalPlaces: 2,
    thousandSeparator: ' ',
    decimalSeparator: ',',
    locale: 'nb-NO',
    taxLabel: 'MVA'
  },
  // Denmark
  DK: {
    countryCode: 'DK',
    countryName: 'Denmark',
    currencyCode: 'DKK',
    currencyName: 'Danish Krone',
    currencySymbol: 'kr',
    symbolPosition: 'after',
    decimalPlaces: 2,
    thousandSeparator: '.',
    decimalSeparator: ',',
    locale: 'da-DK',
    taxLabel: 'Moms'
  },
  // Finland
  FI: {
    countryCode: 'FI',
    countryName: 'Finland',
    currencyCode: 'EUR',
    currencyName: 'Euro',
    currencySymbol: '€',
    symbolPosition: 'after',
    decimalPlaces: 2,
    thousandSeparator: ' ',
    decimalSeparator: ',',
    locale: 'fi-FI',
    taxLabel: 'ALV'
  },
  // Poland
  PL: {
    countryCode: 'PL',
    countryName: 'Poland',
    currencyCode: 'PLN',
    currencyName: 'Polish Zloty',
    currencySymbol: 'zł',
    symbolPosition: 'after',
    decimalPlaces: 2,
    thousandSeparator: ' ',
    decimalSeparator: ',',
    locale: 'pl-PL',
    taxLabel: 'VAT'
  },
  // Czech Republic
  CZ: {
    countryCode: 'CZ',
    countryName: 'Czech Republic',
    currencyCode: 'CZK',
    currencyName: 'Czech Koruna',
    currencySymbol: 'Kč',
    symbolPosition: 'after',
    decimalPlaces: 2,
    thousandSeparator: ' ',
    decimalSeparator: ',',
    locale: 'cs-CZ',
    taxLabel: 'DPH'
  },
  // Hungary
  HU: {
    countryCode: 'HU',
    countryName: 'Hungary',
    currencyCode: 'HUF',
    currencyName: 'Hungarian Forint',
    currencySymbol: 'Ft',
    symbolPosition: 'after',
    decimalPlaces: 0,
    thousandSeparator: ' ',
    decimalSeparator: ',',
    locale: 'hu-HU',
    taxLabel: 'ÁFA'
  },
  // Romania
  RO: {
    countryCode: 'RO',
    countryName: 'Romania',
    currencyCode: 'RON',
    currencyName: 'Romanian Leu',
    currencySymbol: 'lei',
    symbolPosition: 'after',
    decimalPlaces: 2,
    thousandSeparator: '.',
    decimalSeparator: ',',
    locale: 'ro-RO',
    taxLabel: 'TVA'
  },
  // Ireland
  IE: {
    countryCode: 'IE',
    countryName: 'Ireland',
    currencyCode: 'EUR',
    currencyName: 'Euro',
    currencySymbol: '€',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    locale: 'en-IE',
    taxLabel: 'VAT'
  },
  // Portugal
  PT: {
    countryCode: 'PT',
    countryName: 'Portugal',
    currencyCode: 'EUR',
    currencyName: 'Euro',
    currencySymbol: '€',
    symbolPosition: 'after',
    decimalPlaces: 2,
    thousandSeparator: '.',
    decimalSeparator: ',',
    locale: 'pt-PT',
    taxLabel: 'IVA'
  },
  // Greece
  GR: {
    countryCode: 'GR',
    countryName: 'Greece',
    currencyCode: 'EUR',
    currencyName: 'Euro',
    currencySymbol: '€',
    symbolPosition: 'after',
    decimalPlaces: 2,
    thousandSeparator: '.',
    decimalSeparator: ',',
    locale: 'el-GR',
    taxLabel: 'ΦΠΑ'
  },
  // Brazil
  BR: {
    countryCode: 'BR',
    countryName: 'Brazil',
    currencyCode: 'BRL',
    currencyName: 'Brazilian Real',
    currencySymbol: 'R$',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: '.',
    decimalSeparator: ',',
    locale: 'pt-BR',
    taxLabel: 'ICMS'
  },
  // Argentina
  AR: {
    countryCode: 'AR',
    countryName: 'Argentina',
    currencyCode: 'ARS',
    currencyName: 'Argentine Peso',
    currencySymbol: '$',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: '.',
    decimalSeparator: ',',
    locale: 'es-AR',
    taxLabel: 'IVA'
  },
  // Mexico
  MX: {
    countryCode: 'MX',
    countryName: 'Mexico',
    currencyCode: 'MXN',
    currencyName: 'Mexican Peso',
    currencySymbol: '$',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    locale: 'es-MX',
    taxLabel: 'IVA'
  },
  // China
  CN: {
    countryCode: 'CN',
    countryName: 'China',
    currencyCode: 'CNY',
    currencyName: 'Chinese Yuan',
    currencySymbol: '¥',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    locale: 'zh-CN',
    taxLabel: 'VAT'
  },
  // Japan
  JP: {
    countryCode: 'JP',
    countryName: 'Japan',
    currencyCode: 'JPY',
    currencyName: 'Japanese Yen',
    currencySymbol: '¥',
    symbolPosition: 'before',
    decimalPlaces: 0,
    thousandSeparator: ',',
    decimalSeparator: '.',
    locale: 'ja-JP',
    taxLabel: 'Tax'
  },
  // South Korea
  KR: {
    countryCode: 'KR',
    countryName: 'South Korea',
    currencyCode: 'KRW',
    currencyName: 'South Korean Won',
    currencySymbol: '₩',
    symbolPosition: 'before',
    decimalPlaces: 0,
    thousandSeparator: ',',
    decimalSeparator: '.',
    locale: 'ko-KR',
    taxLabel: 'VAT'
  },
  // Singapore
  SG: {
    countryCode: 'SG',
    countryName: 'Singapore',
    currencyCode: 'SGD',
    currencyName: 'Singapore Dollar',
    currencySymbol: '$',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    locale: 'en-SG',
    taxLabel: 'GST'
  },
  // Malaysia
  MY: {
    countryCode: 'MY',
    countryName: 'Malaysia',
    currencyCode: 'MYR',
    currencyName: 'Malaysian Ringgit',
    currencySymbol: 'RM',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    locale: 'ms-MY',
    taxLabel: 'SST'
  },
  // Thailand
  TH: {
    countryCode: 'TH',
    countryName: 'Thailand',
    currencyCode: 'THB',
    currencyName: 'Thai Baht',
    currencySymbol: '฿',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    locale: 'th-TH',
    taxLabel: 'VAT'
  },
  // Vietnam
  VN: {
    countryCode: 'VN',
    countryName: 'Vietnam',
    currencyCode: 'VND',
    currencyName: 'Vietnamese Dong',
    currencySymbol: '₫',
    symbolPosition: 'after',
    decimalPlaces: 0,
    thousandSeparator: '.',
    decimalSeparator: ',',
    locale: 'vi-VN',
    taxLabel: 'VAT'
  },
  // Philippines
  PH: {
    countryCode: 'PH',
    countryName: 'Philippines',
    currencyCode: 'PHP',
    currencyName: 'Philippine Peso',
    currencySymbol: '₱',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    locale: 'en-PH',
    taxLabel: 'VAT'
  },
  // Indonesia
  ID: {
    countryCode: 'ID',
    countryName: 'Indonesia',
    currencyCode: 'IDR',
    currencyName: 'Indonesian Rupiah',
    currencySymbol: 'Rp',
    symbolPosition: 'before',
    decimalPlaces: 0,
    thousandSeparator: '.',
    decimalSeparator: ',',
    locale: 'id-ID',
    taxLabel: 'PPN'
  },
  // Bangladesh
  BD: {
    countryCode: 'BD',
    countryName: 'Bangladesh',
    currencyCode: 'BDT',
    currencyName: 'Bangladeshi Taka',
    currencySymbol: '৳',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    locale: 'bn-BD',
    taxLabel: 'VAT'
  },
  // Pakistan
  PK: {
    countryCode: 'PK',
    countryName: 'Pakistan',
    currencyCode: 'PKR',
    currencyName: 'Pakistani Rupee',
    currencySymbol: 'Rs',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    locale: 'ur-PK',
    taxLabel: 'GST'
  },
  // Sri Lanka
  LK: {
    countryCode: 'LK',
    countryName: 'Sri Lanka',
    currencyCode: 'LKR',
    currencyName: 'Sri Lankan Rupee',
    currencySymbol: 'Rs',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    locale: 'si-LK',
    taxLabel: 'VAT'
  },
  // Nepal
  NP: {
    countryCode: 'NP',
    countryName: 'Nepal',
    currencyCode: 'NPR',
    currencyName: 'Nepalese Rupee',
    currencySymbol: 'Rs',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    locale: 'ne-NP',
    taxLabel: 'VAT'
  },
  // Saudi Arabia
  SA: {
    countryCode: 'SA',
    countryName: 'Saudi Arabia',
    currencyCode: 'SAR',
    currencyName: 'Saudi Riyal',
    currencySymbol: 'ر.س',
    symbolPosition: 'after',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    locale: 'ar-SA',
    taxLabel: 'VAT'
  },
  // United Arab Emirates
  AE: {
    countryCode: 'AE',
    countryName: 'United Arab Emirates',
    currencyCode: 'AED',
    currencyName: 'UAE Dirham',
    currencySymbol: 'د.إ',
    symbolPosition: 'after',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    locale: 'ar-AE',
    taxLabel: 'VAT'
  },
  // Qatar
  QA: {
    countryCode: 'QA',
    countryName: 'Qatar',
    currencyCode: 'QAR',
    currencyName: 'Qatari Riyal',
    currencySymbol: 'ر.ق',
    symbolPosition: 'after',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    locale: 'ar-QA',
    taxLabel: 'VAT'
  },
  // Kuwait
  KW: {
    countryCode: 'KW',
    countryName: 'Kuwait',
    currencyCode: 'KWD',
    currencyName: 'Kuwaiti Dinar',
    currencySymbol: 'د.ك',
    symbolPosition: 'after',
    decimalPlaces: 3,
    thousandSeparator: ',',
    decimalSeparator: '.',
    locale: 'ar-KW',
    taxLabel: 'Tax'
  },
  // Bahrain
  BH: {
    countryCode: 'BH',
    countryName: 'Bahrain',
    currencyCode: 'BHD',
    currencyName: 'Bahraini Dinar',
    currencySymbol: '.د.ب',
    symbolPosition: 'after',
    decimalPlaces: 3,
    thousandSeparator: ',',
    decimalSeparator: '.',
    locale: 'ar-BH',
    taxLabel: 'VAT'
  },
  // Oman
  OM: {
    countryCode: 'OM',
    countryName: 'Oman',
    currencyCode: 'OMR',
    currencyName: 'Omani Rial',
    currencySymbol: 'ر.ع.',
    symbolPosition: 'after',
    decimalPlaces: 3,
    thousandSeparator: ',',
    decimalSeparator: '.',
    locale: 'ar-OM',
    taxLabel: 'VAT'
  },
  // Turkey
  TR: {
    countryCode: 'TR',
    countryName: 'Turkey',
    currencyCode: 'TRY',
    currencyName: 'Turkish Lira',
    currencySymbol: '₺',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: '.',
    decimalSeparator: ',',
    locale: 'tr-TR',
    taxLabel: 'KDV'
  },
  // Russia
  RU: {
    countryCode: 'RU',
    countryName: 'Russia',
    currencyCode: 'RUB',
    currencyName: 'Russian Ruble',
    currencySymbol: '₽',
    symbolPosition: 'after',
    decimalPlaces: 2,
    thousandSeparator: ' ',
    decimalSeparator: ',',
    locale: 'ru-RU',
    taxLabel: 'НДС'
  },
  // South Africa
  ZA: {
    countryCode: 'ZA',
    countryName: 'South Africa',
    currencyCode: 'ZAR',
    currencyName: 'South African Rand',
    currencySymbol: 'R',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ' ',
    decimalSeparator: ',',
    locale: 'en-ZA',
    taxLabel: 'VAT'
  },
  // Egypt
  EG: {
    countryCode: 'EG',
    countryName: 'Egypt',
    currencyCode: 'EGP',
    currencyName: 'Egyptian Pound',
    currencySymbol: 'ج.م',
    symbolPosition: 'after',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    locale: 'ar-EG',
    taxLabel: 'VAT'
  },
  // Nigeria
  NG: {
    countryCode: 'NG',
    countryName: 'Nigeria',
    currencyCode: 'NGN',
    currencyName: 'Nigerian Naira',
    currencySymbol: '₦',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    locale: 'en-NG',
    taxLabel: 'VAT'
  },
  // Kenya
  KE: {
    countryCode: 'KE',
    countryName: 'Kenya',
    currencyCode: 'KES',
    currencyName: 'Kenyan Shilling',
    currencySymbol: 'KSh',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    locale: 'en-KE',
    taxLabel: 'VAT'
  },
  // New Zealand
  NZ: {
    countryCode: 'NZ',
    countryName: 'New Zealand',
    currencyCode: 'NZD',
    currencyName: 'New Zealand Dollar',
    currencySymbol: '$',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    locale: 'en-NZ',
    taxLabel: 'GST'
  },
  // Israel
  IL: {
    countryCode: 'IL',
    countryName: 'Israel',
    currencyCode: 'ILS',
    currencyName: 'Israeli Shekel',
    currencySymbol: '₪',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    locale: 'he-IL',
    taxLabel: 'VAT'
  },
  // Hong Kong
  HK: {
    countryCode: 'HK',
    countryName: 'Hong Kong',
    currencyCode: 'HKD',
    currencyName: 'Hong Kong Dollar',
    currencySymbol: 'HK$',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    locale: 'zh-HK',
    taxLabel: 'Tax'
  },
  // Taiwan
  TW: {
    countryCode: 'TW',
    countryName: 'Taiwan',
    currencyCode: 'TWD',
    currencyName: 'New Taiwan Dollar',
    currencySymbol: 'NT$',
    symbolPosition: 'before',
    decimalPlaces: 0,
    thousandSeparator: ',',
    decimalSeparator: '.',
    locale: 'zh-TW',
    taxLabel: 'VAT'
  }
};

// Dial code to country code mapping for auto-detection
export const dialCodeToCountry = {
  '+91': 'IN',
  '+1': 'US', // Default to US for +1, could be CA
  '+44': 'GB',
  '+61': 'AU',
  '+49': 'DE',
  '+33': 'FR',
  '+39': 'IT',
  '+34': 'ES',
  '+31': 'NL',
  '+32': 'BE',
  '+41': 'CH',
  '+43': 'AT',
  '+46': 'SE',
  '+47': 'NO',
  '+45': 'DK',
  '+358': 'FI',
  '+48': 'PL',
  '+420': 'CZ',
  '+36': 'HU',
  '+40': 'RO',
  '+353': 'IE',
  '+351': 'PT',
  '+30': 'GR',
  '+55': 'BR',
  '+54': 'AR',
  '+52': 'MX',
  '+86': 'CN',
  '+81': 'JP',
  '+82': 'KR',
  '+65': 'SG',
  '+60': 'MY',
  '+66': 'TH',
  '+84': 'VN',
  '+63': 'PH',
  '+62': 'ID',
  '+880': 'BD',
  '+92': 'PK',
  '+94': 'LK',
  '+977': 'NP',
  '+966': 'SA',
  '+971': 'AE',
  '+974': 'QA',
  '+965': 'KW',
  '+973': 'BH',
  '+968': 'OM',
  '+90': 'TR',
  '+7': 'RU',
  '+27': 'ZA',
  '+20': 'EG',
  '+234': 'NG',
  '+254': 'KE',
  '+64': 'NZ',
  '+972': 'IL',
  '+852': 'HK',
  '+886': 'TW'
};

// Default currency settings (INR for backward compatibility)
export const defaultCurrencySettings = {
  countryCode: 'IN',
  currencyCode: 'INR',
  currencySymbol: '₹',
  symbolPosition: 'before',
  decimalPlaces: 2,
  thousandSeparator: ',',
  decimalSeparator: '.',
  locale: 'en-IN',
  taxLabel: 'GST'
};

/**
 * Get currency settings by country code
 * @param {string} countryCode - ISO 3166-1 alpha-2 country code (e.g., 'IN', 'US')
 * @returns {object} Currency settings or default settings if not found
 */
export function getCurrencyByCountryCode(countryCode) {
  if (!countryCode) return defaultCurrencySettings;
  const upperCode = countryCode.toUpperCase();
  return currencyByCountry[upperCode] || defaultCurrencySettings;
}

/**
 * Get currency settings by phone dial code
 * @param {string} dialCode - Phone dial code (e.g., '+91', '+1')
 * @returns {object} Currency settings or default settings if not found
 */
export function getCurrencyByDialCode(dialCode) {
  if (!dialCode) return defaultCurrencySettings;
  const cleanDialCode = dialCode.startsWith('+') ? dialCode : '+' + dialCode;
  const countryCode = dialCodeToCountry[cleanDialCode];
  return countryCode ? getCurrencyByCountryCode(countryCode) : defaultCurrencySettings;
}

/**
 * Get tax label for a country
 * @param {string} countryCode - ISO 3166-1 alpha-2 country code
 * @returns {string} Tax label (e.g., 'GST', 'VAT', 'Sales Tax')
 */
export function getTaxLabelByCountry(countryCode) {
  const currency = getCurrencyByCountryCode(countryCode);
  return currency.taxLabel || 'Tax';
}

/**
 * Get all countries with their currency info
 * @returns {Array} Array of country/currency objects sorted by country name
 */
export function getAllCountriesWithCurrency() {
  return Object.values(currencyByCountry).sort((a, b) =>
    a.countryName.localeCompare(b.countryName)
  );
}

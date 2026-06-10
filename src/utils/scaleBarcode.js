// Scale Barcode Parser — EAN-13 barcodes from label-printing weighing scales
//
// Supports two barcode formats:
//   Option 2 (weight): FFIIIIXXXXXXC  — weight embedded (recommended)
//   Option 1 (price):  FFIIIIPPPPPC   — price embedded
//
// Where:
//   FF     = Flag prefix (2 digits, e.g. "20" or "21")
//   IIII   = PLU / Item Code (4 digits)
//   XXXXXX = Weight in grams (6 digits, last 3 are decimal → 001500 = 1.500 kg)
//   PPPPPP = Price in minor units (6 digits, last 2 are decimal → 015000 = 150.00)
//   C      = EAN-13 check digit (1 digit)

/**
 * Validate EAN-13 check digit
 */
function validEAN13CheckDigit(barcode) {
  if (barcode.length !== 13) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(barcode[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(barcode[12], 10);
}

/**
 * Check if a barcode string is a scale barcode.
 * @param {string} barcode - The scanned barcode string
 * @param {string} flagPrefix - The 2-digit flag prefix (e.g. "20", "21")
 * @returns {boolean}
 */
export function isScaleBarcode(barcode, flagPrefix = '20') {
  if (!barcode || typeof barcode !== 'string') return false;
  const cleaned = barcode.trim();
  if (cleaned.length !== 13) return false;
  if (!/^\d{13}$/.test(cleaned)) return false;
  // Check all configured flag prefixes (comma-separated, e.g. "20,21")
  const prefixes = flagPrefix.split(',').map(p => p.trim());
  return prefixes.some(p => cleaned.startsWith(p));
}

/**
 * Parse a scale barcode into its components.
 * Detects format based on whether the matching menu item uses weight or price mode.
 * Default: weight mode (Option 2).
 *
 * @param {string} barcode - The 13-digit EAN-13 barcode
 * @param {object} [options]
 * @param {string} [options.flagPrefix='20'] - Comma-separated flag prefixes
 * @param {'weight'|'price'} [options.format='weight'] - Barcode format
 * @returns {{ flag: string, itemCode: string, weight?: number, price?: number, checkDigit: string, format: string } | null}
 */
export function parseScaleBarcode(barcode, options = {}) {
  const { flagPrefix = '20', format = 'weight' } = options;
  if (!isScaleBarcode(barcode, flagPrefix)) return null;

  const cleaned = barcode.trim();

  // Validate EAN-13 check digit
  if (!validEAN13CheckDigit(cleaned)) return null;

  const flag = cleaned.substring(0, 2);
  const itemCode = cleaned.substring(2, 6);
  const dataDigits = cleaned.substring(6, 12);
  const checkDigit = cleaned.substring(12, 13);

  if (format === 'price') {
    // Option 1: PPPPPP — last 2 digits are decimal places
    const priceRaw = parseInt(dataDigits, 10);
    const price = priceRaw / 100; // e.g. 015000 → 150.00
    return { flag, itemCode, price, checkDigit, format: 'price' };
  }

  // Option 2 (default): XXXXXX — last 3 digits are decimal places (weight in kg)
  const weightRaw = parseInt(dataDigits, 10);
  const weight = weightRaw / 1000; // e.g. 001500 → 1.500 kg
  return { flag, itemCode, weight, checkDigit, format: 'weight' };
}

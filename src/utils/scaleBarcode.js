// Scale Barcode Parser — EAN-13 barcodes from label-printing weighing scales
//
// Supports two PLU length formats:
//   4-digit PLU: FF IIII XXXXXX C  (4-digit item code + 6-digit weight/price)
//   5-digit PLU: FF IIIII XXXXX C  (5-digit item code + 5-digit weight/price)
//
// And two data modes:
//   Weight mode: data digits represent weight (last 3 are decimal → 001500 = 1.500 kg)
//   Price mode:  data digits represent price (last 2 are decimal → 015000 = 150.00)
//
// Where:
//   FF = Flag prefix (2 digits, e.g. "20" or "21" or "22")
//   C  = EAN-13 check digit (1 digit)

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
 *
 * @param {string} barcode - The 13-digit EAN-13 barcode
 * @param {object} [options]
 * @param {string} [options.flagPrefix='20'] - Comma-separated flag prefixes
 * @param {'weight'|'price'} [options.format='weight'] - Barcode format
 * @param {number} [options.pluDigits=4] - Number of PLU digits (4 or 5)
 * @returns {{ flag: string, itemCode: string, weight?: number, price?: number, checkDigit: string, format: string } | null}
 */
export function parseScaleBarcode(barcode, options = {}) {
  const { flagPrefix = '20', format = 'weight', pluDigits = 4 } = options;
  if (!isScaleBarcode(barcode, flagPrefix)) return null;

  const cleaned = barcode.trim();

  // Validate EAN-13 check digit
  if (!validEAN13CheckDigit(cleaned)) return null;

  const pluLen = pluDigits === 5 ? 5 : 4; // Only 4 or 5 supported
  const dataLen = 10 - pluLen; // 6 for 4-digit PLU, 5 for 5-digit PLU

  const flag = cleaned.substring(0, 2);
  const itemCode = cleaned.substring(2, 2 + pluLen);
  const dataDigits = cleaned.substring(2 + pluLen, 12);
  const checkDigit = cleaned.substring(12, 13);

  if (format === 'price') {
    const priceRaw = parseInt(dataDigits, 10);
    const price = priceRaw / 100;
    return { flag, itemCode, price, checkDigit, format: 'price' };
  }

  // Weight mode: last 3 digits are decimal places (weight in kg)
  const weightRaw = parseInt(dataDigits, 10);
  const weight = weightRaw / 1000;
  return { flag, itemCode, weight, checkDigit, format: 'weight' };
}

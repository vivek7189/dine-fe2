// ─────────────────────────────────────────────────────────────────────────────
// Country tax regimes — SUGGESTED default restaurant tax setup per country.
//
// These are *suggestions* shown by default when a restaurant's country is set,
// until the owner saves their own preference. They never overwrite an existing
// saved taxSettings — the admin UI only applies a regime when the owner clicks
// "Use suggested". All rates are reasonable defaults and MUST be confirmed by the
// owner / their accountant (rates change; local rules vary). Additive + optional:
// if a store never touches this, its behavior is unchanged.
//
// Shared shape (mirrored in dine-backend + dine-app):
//   label            → what to call tax in the UI ("GST" / "VAT" / "Sales Tax")
//   inclusiveDefault → whether prices are typically shown tax-inclusive there
//   taxes[]          → suggested named taxes [{ name, rate }]
//   slabs[]          → common rate slabs for the quick-pick chips
//   split            → 'cgst_sgst' (India) → show CGST+SGST on the invoice
//   orderTypeAware   → true where order type changes the rate (UK eat-in/takeaway)
//   idField          → tax-identity field key + label for the invoice
//   hint             → one-line guidance shown under the suggestion
// ─────────────────────────────────────────────────────────────────────────────

export const TAX_REGIMES = {
  IN: {
    country: 'India', label: 'GST', inclusiveDefault: false, split: 'cgst_sgst',
    taxes: [{ name: 'GST', rate: 5 }], slabs: [0, 5, 12, 18, 28],
    idField: { key: 'gstin', label: 'GSTIN' },
    hint: 'Restaurants are usually GST 5% (no input credit). Shown as CGST 2.5% + SGST 2.5% on the invoice.',
  },
  AE: {
    country: 'United Arab Emirates', label: 'VAT', inclusiveDefault: true,
    taxes: [{ name: 'VAT', rate: 5 }], slabs: [0, 5],
    idField: { key: 'trn', label: 'TRN' },
    hint: 'UAE VAT is 5%. Menu prices are normally shown VAT-inclusive. Free-zone / diplomatic sales may be zero-rated.',
  },
  SA: {
    country: 'Saudi Arabia', label: 'VAT', inclusiveDefault: true,
    taxes: [{ name: 'VAT', rate: 15 }], slabs: [0, 15],
    idField: { key: 'vatTin', label: 'VAT No.' },
    hint: 'KSA VAT is 15%, normally shown VAT-inclusive (ZATCA e-invoice rules apply).',
  },
  QA: {
    country: 'Qatar', label: 'Tax', inclusiveDefault: false,
    taxes: [], slabs: [0],
    hint: 'Qatar has no VAT yet — default is no tax (0%).',
  },
  GB: {
    country: 'United Kingdom', label: 'VAT', inclusiveDefault: true, orderTypeAware: true,
    taxes: [{ name: 'VAT', rate: 20 }], slabs: [0, 5, 20],
    idField: { key: 'vatNumber', label: 'VAT No.' },
    hint: 'UK VAT: eat-in & hot takeaway 20%, most cold takeaway 0%. Prices shown VAT-inclusive.',
  },
  US: {
    country: 'United States', label: 'Sales Tax', inclusiveDefault: false,
    taxes: [{ name: 'Sales Tax', rate: 0 }], slabs: [],
    idField: { key: 'taxId', label: 'Tax ID' },
    hint: 'US sales tax varies by state & county — set your exact local rate. Prices shown tax-exclusive.',
  },
  SG: {
    country: 'Singapore', label: 'GST', inclusiveDefault: true,
    taxes: [{ name: 'GST', rate: 9 }], slabs: [0, 9],
    idField: { key: 'gstReg', label: 'GST Reg. No.' },
    hint: 'Singapore GST is 9%, normally shown GST-inclusive.',
  },
  CA: {
    country: 'Canada', label: 'GST/HST', inclusiveDefault: false,
    taxes: [{ name: 'GST', rate: 5 }], slabs: [5, 13, 15],
    idField: { key: 'gstHst', label: 'GST/HST No.' },
    hint: 'Federal GST 5% plus provincial tax (HST/PST) varies by province.',
  },
  AU: {
    country: 'Australia', label: 'GST', inclusiveDefault: true,
    taxes: [{ name: 'GST', rate: 10 }], slabs: [0, 10],
    idField: { key: 'abn', label: 'ABN' },
    hint: 'Australia GST is 10%, shown GST-inclusive.',
  },
  KE: {
    country: 'Kenya', label: 'VAT', inclusiveDefault: false,
    taxes: [{ name: 'VAT', rate: 16 }], slabs: [0, 16],
    idField: { key: 'pin', label: 'KRA PIN' },
    hint: 'Kenya VAT is 16% (KRA eTIMS fiscalisation applies).',
  },
  ZA: {
    country: 'South Africa', label: 'VAT', inclusiveDefault: true,
    taxes: [{ name: 'VAT', rate: 15 }], slabs: [0, 15],
    idField: { key: 'vatNumber', label: 'VAT No.' },
    hint: 'South Africa VAT is 15%, shown VAT-inclusive.',
  },
  NZ: {
    country: 'New Zealand', label: 'GST', inclusiveDefault: true,
    taxes: [{ name: 'GST', rate: 15 }], slabs: [0, 15],
    idField: { key: 'gstNumber', label: 'GST No.' },
    hint: 'New Zealand GST is 15%, shown GST-inclusive.',
  },
  MY: {
    country: 'Malaysia', label: 'SST', inclusiveDefault: false,
    taxes: [{ name: 'Service Tax', rate: 6 }], slabs: [0, 6, 10],
    idField: { key: 'sstNumber', label: 'SST No.' },
    hint: 'Malaysia: 6% service tax on F&B (SST).',
  },
  BH: {
    country: 'Bahrain', label: 'VAT', inclusiveDefault: true,
    taxes: [{ name: 'VAT', rate: 10 }], slabs: [0, 10],
    idField: { key: 'vatNumber', label: 'VAT No.' },
    hint: 'Bahrain VAT is 10%, shown VAT-inclusive.',
  },
};

// A universal "tax-free" preset — e.g. a UAE free-zone outlet or diplomatic sales.
export const TAX_FREE_PRESET = {
  country: 'Tax-Free', label: 'No Tax', inclusiveDefault: false, taxes: [],
  hint: 'No tax charged (e.g. free zone / diplomatic / tax-exempt outlet).',
};

// Resolve the suggested regime for a country code (falls back to a neutral one).
export function getTaxRegime(countryCode) {
  const cc = String(countryCode || '').toUpperCase();
  return TAX_REGIMES[cc] || { country: cc || 'Other', label: 'Tax', inclusiveDefault: false, taxes: [], slabs: [], hint: 'Set the tax name and rate that apply in your country.' };
}

// Countries we ship a suggestion for (for the "popular" picker).
export const REGIME_COUNTRY_CODES = Object.keys(TAX_REGIMES);

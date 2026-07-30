// Shared tax-inclusive (reverse-calculated) split so the cart, the bill, and
// order history all show IDENTICAL per-item numbers that sum to the line total.
//
// For a tax-INCLUSIVE price the tax is extracted FROM the price (not added on top):
//   tax  = amount * rate / (100 + rate)
//   base = amount - tax           // "MRP"/taxable value
//   base + tax === amount         // always sums back to the price
//
// `rate` is the item's TOTAL tax rate (e.g. CGST 2.5 + SGST 2.5 = 5).

export function inclusiveSplit(amount, ratePercent) {
  const a = Number(amount) || 0;
  const r = Number(ratePercent) || 0;
  if (r <= 0) return { base: round2(a), tax: 0, rate: 0 };
  const tax = round2(a * r / (100 + r));
  return { base: round2(a - tax), tax, rate: r };
}

// Sum the enabled tax rates that apply to an item into a single total rate.
export function totalRate(taxes) {
  if (!Array.isArray(taxes)) return 0;
  return taxes.reduce((s, t) => s + (Number(t?.rate) || 0), 0);
}

function round2(n) { return Math.round((Number(n) || 0) * 100) / 100; }

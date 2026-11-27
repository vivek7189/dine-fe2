// Shared unit conversion map — kept in sync with dine-backend/services/inventoryService.js
export const UNIT_CONVERSIONS = {
  // Mass (base: g)
  'g': { dimension: 'mass', toBase: 1 },
  'gm': { dimension: 'mass', toBase: 1 },
  'gms': { dimension: 'mass', toBase: 1 },
  'gram': { dimension: 'mass', toBase: 1 },
  'grams': { dimension: 'mass', toBase: 1 },
  'kg': { dimension: 'mass', toBase: 1000 },
  'kgs': { dimension: 'mass', toBase: 1000 },
  'kilogram': { dimension: 'mass', toBase: 1000 },
  'kilograms': { dimension: 'mass', toBase: 1000 },
  'mg': { dimension: 'mass', toBase: 0.001 },
  'oz': { dimension: 'mass', toBase: 28.3495 },
  'ounce': { dimension: 'mass', toBase: 28.3495 },
  'ounces': { dimension: 'mass', toBase: 28.3495 },
  'lb': { dimension: 'mass', toBase: 453.592 },
  'lbs': { dimension: 'mass', toBase: 453.592 },
  'pound': { dimension: 'mass', toBase: 453.592 },
  'pounds': { dimension: 'mass', toBase: 453.592 },

  // Volume (base: ml)
  'ml': { dimension: 'volume', toBase: 1 },
  'milliliter': { dimension: 'volume', toBase: 1 },
  'milliliters': { dimension: 'volume', toBase: 1 },
  'l': { dimension: 'volume', toBase: 1000 },
  'ltr': { dimension: 'volume', toBase: 1000 },
  'litre': { dimension: 'volume', toBase: 1000 },
  'liter': { dimension: 'volume', toBase: 1000 },
  'litres': { dimension: 'volume', toBase: 1000 },
  'ltrs': { dimension: 'volume', toBase: 1000 },
  'lts': { dimension: 'volume', toBase: 1000 },
  'liters': { dimension: 'volume', toBase: 1000 },
  'cl': { dimension: 'volume', toBase: 10 },
  'cup': { dimension: 'volume', toBase: 236.588 },
  'cups': { dimension: 'volume', toBase: 236.588 },
  'tbsp': { dimension: 'volume', toBase: 14.787 },
  'tablespoon': { dimension: 'volume', toBase: 14.787 },
  'tablespoons': { dimension: 'volume', toBase: 14.787 },
  'tsp': { dimension: 'volume', toBase: 4.929 },
  'teaspoon': { dimension: 'volume', toBase: 4.929 },
  'teaspoons': { dimension: 'volume', toBase: 4.929 },
  'fl oz': { dimension: 'volume', toBase: 29.574 },
  'fluid ounce': { dimension: 'volume', toBase: 29.574 },
  'gallon': { dimension: 'volume', toBase: 3785.41 },
  'gallons': { dimension: 'volume', toBase: 3785.41 },
  'pint': { dimension: 'volume', toBase: 473.176 },
  'pints': { dimension: 'volume', toBase: 473.176 },
  'quart': { dimension: 'volume', toBase: 946.353 },
  'quarts': { dimension: 'volume', toBase: 946.353 },

  // Count (base: pcs)
  'pcs': { dimension: 'count', toBase: 1 },
  'pcs.': { dimension: 'count', toBase: 1 },
  'pc.': { dimension: 'count', toBase: 1 },
  'nos.': { dimension: 'count', toBase: 1 },
  'pc': { dimension: 'count', toBase: 1 },
  'piece': { dimension: 'count', toBase: 1 },
  'pieces': { dimension: 'count', toBase: 1 },
  'dozen': { dimension: 'count', toBase: 12 },
  'dzn': { dimension: 'count', toBase: 12 },
  'nos': { dimension: 'count', toBase: 1 },
  'no': { dimension: 'count', toBase: 1 },
  'each': { dimension: 'count', toBase: 1 },
  'unit': { dimension: 'count', toBase: 1 },
  'units': { dimension: 'count', toBase: 1 },

  // Container units — same-type only
  'pack': { dimension: 'pack', toBase: 1 },
  'packs': { dimension: 'pack', toBase: 1 },
  'packet': { dimension: 'pack', toBase: 1 },
  'packets': { dimension: 'pack', toBase: 1 },
  'pkt': { dimension: 'pack', toBase: 1 },
  'pkts': { dimension: 'pack', toBase: 1 },
  'bottle': { dimension: 'bottle', toBase: 1 },
  'bottles': { dimension: 'bottle', toBase: 1 },
  'can': { dimension: 'can', toBase: 1 },
  'cans': { dimension: 'can', toBase: 1 },
  'bag': { dimension: 'bag', toBase: 1 },
  'bags': { dimension: 'bag', toBase: 1 },
  'box': { dimension: 'box', toBase: 1 },
  'boxes': { dimension: 'box', toBase: 1 },
  'bunch': { dimension: 'bunch', toBase: 1 },
  'bunches': { dimension: 'bunch', toBase: 1 },
};

/**
 * Convert quantity between compatible units.
 * Returns original quantity if units are unknown or incompatible.
 */
export function convertUnits(quantity, fromUnit, toUnit) {
  if (!fromUnit || !toUnit) return quantity;
  const from = fromUnit.toLowerCase().trim();
  const to = toUnit.toLowerCase().trim();
  if (from === to) return quantity;

  const fromConv = UNIT_CONVERSIONS[from];
  const toConv = UNIT_CONVERSIONS[to];

  if (!fromConv || !toConv) return quantity;
  if (fromConv.dimension !== toConv.dimension) return quantity;

  return (quantity * fromConv.toBase) / toConv.toBase;
}

// Recipe/waste quantity → this stock item's unit, the same way the server does it: same kind of unit
// (g↔kg, ml↔L) converts; another kind (g↔pcs) only through the item's "1 <unit> = N <unit>" setting
// (item.unitEquivalent). Returns null when it can't convert (the server skips such lines).
export function convertForItem(quantity, fromUnit, item) {
  const to = item && item.unit;
  if (!fromUnit || !to) return quantity;
  const f = UNIT_CONVERSIONS[String(fromUnit).toLowerCase().trim()];
  const t = UNIT_CONVERSIONS[String(to).toLowerCase().trim()];
  if (String(fromUnit).toLowerCase().trim() === String(to).toLowerCase().trim()) return quantity;
  if (f && t && f.dimension === t.dimension) return (quantity * f.toBase) / t.toBase;
  const eq = item.unitEquivalent;
  const per = Number(eq && eq.quantity);
  const e = eq && UNIT_CONVERSIONS[String(eq.unit || '').toLowerCase().trim()];
  if (!e || !(per > 0) || !f || f.dimension !== e.dimension) return null;
  return ((quantity * f.toBase) / e.toBase) / per;
}

// Supplier bill line: the unit its quantity was bought in. Not chosen (a scanned bill, an older line) →
// kg / L for items kept in g / ml, since bills are in kg and litres (MFC: "10" milk saved as 10 ml at
// 78 per ml, "1" paneer as 1 g at 1,537 per g — stock value in crores).
export function billLineUnit(chosen, stockUnit) {
  if (chosen) return chosen;
  const dim = UNIT_CONVERSIONS[String(stockUnit || '').toLowerCase().trim()]?.dimension;
  if (dim === 'mass') return 'kg';
  if (dim === 'volume') return 'l';
  return stockUnit || '';
}

// Supplier bill bought in packs (MFC: rice in 26 kg bags). The line is "7 bag at 1,150, 1 bag = 26 kg":
// stock gets 7 × 26 = 182 kg and the cost is per kg (8,050 ÷ 182 = 44.23). The pack size is in kg / L
// for items kept by weight / volume (any g / ml stock unit converts), else in the stock unit (pcs).
export const PACK_UNITS = ['bag', 'box', 'case', 'pack', 'tin', 'tray', 'crate', 'carton'];
export const isPackUnit = (u) => PACK_UNITS.includes(String(u || '').toLowerCase().trim());
export function packBaseUnit(stockUnit) {
  const dim = UNIT_CONVERSIONS[String(stockUnit || '').toLowerCase().trim()]?.dimension;
  if (dim === 'mass') return 'kg';
  if (dim === 'volume') return 'l';
  return stockUnit || '';
}
// A bought-in-pack line: the buy unit is a pack and not the item's own stock unit.
export const isPackLine = (buyUnit, stockUnit) => isPackUnit(buyUnit)
  && String(buyUnit || '').toLowerCase().trim() !== String(stockUnit || '').toLowerCase().trim();
// Bill line quantity → stock-unit quantity (null = a pack line with no pack size yet).
export function billLineStockQty(qty, buyUnit, stockUnit, packSize) {
  const q = Number(qty) || 0;
  if (isPackLine(buyUnit, stockUnit)) {
    const ps = Number(packSize);
    if (!(ps > 0)) return null;
    return convertUnits(q * ps, packBaseUnit(stockUnit), stockUnit);
  }
  return stockUnit && buyUnit ? convertUnits(q, buyUnit, stockUnit) : q;
}

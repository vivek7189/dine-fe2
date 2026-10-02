// Shared, pure tax engine — an EXACT mirror of the backend (dine-backend index.js):
//   isItemTaxInclusive(), resolveTaxesForItem(), taxAppliesToOrderType(), calculatePerItemTax().
// Keep these identical to the server so the total a client shows is the total the server saves.
//
// Rules (same as server):
//   • Inclusive: item.taxInclusive === true/false wins, else settings.taxInclusivePricing === true.
//   • Taxes per item: item tax group → category tax group → restaurant (global) taxes.
//     A group with alsoApplyGlobalTax merges the global taxes in (dedup by name+rate).
//   • Global taxes: the enabled entries of a NON-EMPTY `taxes` array; when `taxes` is empty or
//     missing, a single { name:'Tax', rate: defaultTaxRate } if defaultTaxRate is set; else none.
//   • A tax with `orderTypes` (non-empty) applies only to those order types.
//   • Discount is spread only over items with discountApplicable !== false; service charge (plus any
//     folded additional-charge base) is spread proportionally to each item's post-discount amount.
//   • Inclusive items: tax = amount × rate / (100 + itemTotalRate); exclusive: amount × rate / 100.

export function isItemTaxInclusive(item, taxSettings) {
  if (item?.taxInclusive === true) return true;
  if (item?.taxInclusive === false) return false;
  return taxSettings?.taxInclusivePricing === true;
}

export function taxAppliesToOrderType(tax, orderType) {
  const list = tax && tax.orderTypes;
  if (!Array.isArray(list) || list.length === 0) return true;
  const canon = (x) => String(x || '').toLowerCase().replace(/[_\s]+/g, '-');
  const cur = canon(orderType);
  return list.some((x) => canon(x) === cur);
}

export function getGlobalTaxes(taxSettings) {
  if (!taxSettings) return [];
  return (taxSettings.taxes && taxSettings.taxes.length > 0)
    ? taxSettings.taxes.filter(t => t.enabled)
    : (taxSettings.defaultTaxRate
      ? [{ name: 'Tax', rate: taxSettings.defaultTaxRate, type: 'percentage' }]
      : []);
}

export function resolveTaxesForItem(item, taxSettings, categories) {
  if (!taxSettings?.enabled) return [];
  const groups = taxSettings.taxGroups || [];
  const globalTaxes = getGlobalTaxes(taxSettings);

  const resolveGroup = (group) => {
    const groupTaxes = group.taxes || [];
    if (group.alsoApplyGlobalTax && globalTaxes.length > 0) {
      const merged = [...groupTaxes];
      for (const gt of globalTaxes) {
        if (!merged.some(t => t.name === gt.name && t.rate === gt.rate)) merged.push(gt);
      }
      return merged;
    }
    return groupTaxes;
  };

  if (item?.taxGroupId) {
    const group = groups.find(g => g.id === item.taxGroupId);
    if (group) return resolveGroup(group);
  }
  const catId = item?.category || item?.categoryId;
  if (catId && categories && categories.length > 0) {
    const cat = categories.find(c => c.id === catId || c.name === catId);
    if (cat?.taxGroupId) {
      const group = groups.find(g => g.id === cat.taxGroupId);
      if (group) return resolveGroup(group);
    }
  }
  return globalTaxes;
}

// Taxes that actually apply to `item` for `orderType` (resolve + order-type gating).
export function getItemTaxes(item, taxSettings, categories, orderType) {
  return resolveTaxesForItem(item, taxSettings, categories)
    .filter(tax => taxAppliesToOrderType(tax, orderType));
}

const lineTotalOf = (item) => (item.total || (Number(item.price) || 0) * (Number(item.quantity) || 0));

// Pure mirror of the server's calculatePerItemTax. `orderItems` need: total (or price × quantity),
// discountApplicable, taxInclusive, taxGroupId, category/categoryId. Does NOT mutate the items;
// per-item results come back in `perItem` (same order as the input).
export function calculatePerItemTax(orderItems, taxSettings, categories, totalDiscount, serviceChargeAmount, orderType) {
  const items = Array.isArray(orderItems) ? orderItems : [];
  const disc = Number(totalDiscount) || 0;
  const sc = Number(serviceChargeAmount) || 0;
  const subtotal = items.reduce((sum, item) => sum + lineTotalOf(item), 0);
  const discountableSubtotal = items.reduce((sum, item) => {
    if (item.discountApplicable === false) return sum;
    return sum + lineTotalOf(item);
  }, 0);

  const taxTotals = {};
  let totalTaxAmount = 0;
  let inclusiveTaxAmount = 0;
  let exclusiveTaxAmount = 0;
  const perItem = [];

  for (const item of items) {
    const itemTotal = lineTotalOf(item);
    const isDiscountable = item.discountApplicable !== false;
    const isInclusive = isItemTaxInclusive(item, taxSettings);
    const itemDiscShare = (isDiscountable && discountableSubtotal > 0)
      ? (itemTotal / discountableSubtotal) * disc
      : 0;
    const itemTaxable = Math.max(0, itemTotal - itemDiscShare);
    const postDiscountSubtotal = Math.max(0, subtotal - disc);
    const itemSCShare = postDiscountSubtotal > 0
      ? (itemTaxable / postDiscountSubtotal) * sc
      : (subtotal > 0 ? (itemTotal / subtotal) * sc : 0);
    const itemTaxableWithSC = itemTaxable + itemSCShare;

    const itemTaxes = getItemTaxes(item, taxSettings, categories, orderType);
    const totalRate = itemTaxes.reduce((sum, t) => sum + (t.rate || 0), 0);
    let itemTaxAmount = 0;
    for (const tax of itemTaxes) {
      const amt = isInclusive
        ? (itemTaxableWithSC * (tax.rate || 0) / (100 + totalRate))
        : (itemTaxableWithSC * (tax.rate || 0) / 100);
      const key = `${tax.name || 'Tax'}|${tax.rate || 0}|${isInclusive}`;
      if (!taxTotals[key]) taxTotals[key] = { name: tax.name || 'Tax', rate: tax.rate || 0, amount: 0, inclusive: isInclusive };
      taxTotals[key].amount += amt;
      itemTaxAmount += amt;
      totalTaxAmount += amt;
      if (isInclusive) inclusiveTaxAmount += amt;
      else exclusiveTaxAmount += amt;
    }
    perItem.push({
      itemTaxAmount: Math.round(itemTaxAmount * 100) / 100,
      taxInclusive: isInclusive,
      rate: totalRate,
      taxableAmount: itemTaxableWithSC,
    });
  }

  const taxBreakdown = Object.values(taxTotals).map(t => ({ ...t, amount: Math.round(t.amount * 100) / 100 }));
  return {
    taxBreakdown,
    totalTaxAmount: Math.round(totalTaxAmount * 100) / 100,
    inclusiveTaxAmount: Math.round(inclusiveTaxAmount * 100) / 100,
    exclusiveTaxAmount: Math.round(exclusiveTaxAmount * 100) / 100,
    perItem,
  };
}

// Server's getDefaultTaxSettings(): India (or unknown currency) → GST 5%; elsewhere no tax.
export function getDefaultTaxSettings(currencySettings) {
  const isIndia = !currencySettings || currencySettings.countryCode === 'IN' || currencySettings.currencyCode === 'INR';
  if (isIndia) {
    return { enabled: true, taxes: [{ id: 'gst', name: 'GST', rate: 5, enabled: true, type: 'percentage' }], defaultTaxRate: 5 };
  }
  return { enabled: false, taxes: [], defaultTaxRate: 0 };
}

// Per-item tax fields to carry from a saved order line onto a cart line: the line's own value,
// else the menu item's. Saved-order → cart mappings used to drop these, so a tax-INCLUSIVE item
// was taxed on top when the order was re-opened / billed.
export function lineTaxFlags(line, menuItem) {
  const out = {};
  const ti = line?.taxInclusive ?? menuItem?.taxInclusive;
  if (ti != null) out.taxInclusive = ti;
  const da = line?.discountApplicable ?? menuItem?.discountApplicable;
  if (da != null) out.discountApplicable = da;
  const cid = line?.categoryId || menuItem?.categoryId;
  if (cid) out.categoryId = cid;
  const hsn = line?.hsnCode || menuItem?.hsnCode;
  if (hsn) out.hsnCode = hsn;
  return out;
}

// A saved order line stores price = billed base (variant / tier / edited) + topping prices.
// Returns that base (toppings taken off, since the cart adds them back once), or null when the
// line has no usable saved price.
export function savedLineBasePrice(line) {
  const saved = typeof line?.price === 'number' ? line.price
    : (line?.price != null && !isNaN(parseFloat(line.price)) ? parseFloat(line.price) : null);
  if (saved == null) return null;
  const toppings = Array.isArray(line?.selectedCustomizations)
    ? line.selectedCustomizations.reduce((sum, c) => sum + (typeof c?.price === 'number' ? c.price : (parseFloat(c?.price) || 0)), 0)
    : 0;
  return Math.max(0, Math.round((saved - toppings) * 100) / 100);
}

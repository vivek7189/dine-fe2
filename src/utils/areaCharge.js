// Area / zone surcharge — an EXACT mirror of the backend (dine-backend index.js):
//   calculatePricingAdjustments()  — POST /api/orders (new order at a table)
//   orderZoneSurchargeFor()        — PATCH / edit of an existing order
// The server adds the surcharge to the order subtotal (so it is part of the base for offers,
// discount caps, service charge and additional charges) and folds it into the item tax base
// (like service charge). It is skipped when a multi-tier pricing rule is active.

const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

// Server calculatePricingAdjustments(): floor area charge first, else zone pricing by section.
export function calcPricingAdjustment({ floorData, tableSection, pricingSettings, subtotal }) {
  const sub = Number(subtotal) || 0;
  const res = { zoneSurcharge: 0, rule: null };
  if (floorData?.areaChargeType && floorData.areaChargeType !== 'none' && floorData.areaChargeValue > 0 && sub > 0) {
    res.zoneSurcharge = floorData.areaChargeType === 'percentage'
      ? r2(sub * floorData.areaChargeValue / 100)
      : r2(floorData.areaChargeValue);
    res.rule = { type: 'floor_area_charge', floorName: floorData.name, markupType: floorData.areaChargeType, markupValue: floorData.areaChargeValue };
    return res;
  }
  const zonePricing = pricingSettings?.zonePricing;
  if (zonePricing?.enabled && tableSection && Array.isArray(zonePricing.zones)) {
    const z = zonePricing.zones.find(zz => zz.isActive && zz.sectionMatch
      && String(tableSection).toLowerCase().includes(String(zz.sectionMatch).toLowerCase()));
    if (z && sub > 0) {
      res.zoneSurcharge = z.markupType === 'percentage'
        ? r2(sub * (z.markupValue || 0) / 100)
        : r2(z.markupValue || 0);
      res.rule = { type: 'zone', zoneName: z.name, markupType: z.markupType, markupValue: z.markupValue };
    }
  }
  return res;
}

// The floor (and table) the server resolves for an order: floorId + tableId fast path, else the
// first table across floors whose name matches the order's table number (case-insensitive).
export function findTableFloor(floors, selectedTable, tableNumber) {
  const list = Array.isArray(floors) ? floors : [];
  if (selectedTable?.floorId && selectedTable?.id) {
    const f = list.find(fl => fl && fl.id === selectedTable.floorId);
    const t = f && (f.tables || []).find(tb => tb && tb.id === selectedTable.id);
    if (f && t) return { floor: f, table: t };
  }
  const want = String(tableNumber || '').trim().toLowerCase();
  if (!want) return null;
  for (const f of list) {
    const t = (f?.tables || []).find(tb => tb?.name != null && String(tb.name).toLowerCase() === want);
    if (t) return { floor: f, table: t };
  }
  return null;
}

// The pricing rule the server resolves for a new order (POST /api/orders): only when multiPricing
// is enabled — the table floor's mapping (resolveTablePricingRule: floor name CONTAINS the mapping)
// → the client's pricingRuleId if it is an active rule → the order-type rule
// (resolveOrderTypePricingRule: order type id / label ⇄ rule name, normalised). null = none.
export function serverPricingRuleId(multiPricing, floorName, clientRuleId, orderType, orderTypesList) {
  if (!multiPricing?.enabled) return null;
  const rules = Array.isArray(multiPricing.rules) ? multiPricing.rules : [];
  if (floorName) {
    const fl = String(floorName).toLowerCase();
    for (const rule of rules) {
      if (!rule?.isActive) continue;
      for (const m of (rule.tableMappings || [])) {
        if (m && fl.includes(String(m).toLowerCase())) return rule.id;
      }
    }
  }
  if (clientRuleId) {
    const r = rules.find(x => x && x.id === clientRuleId && x.isActive);
    if (r) return r.id;
  }
  if (!orderType) return null;
  const norm = (x) => (x || '').toLowerCase().replace(/[\s_-]+/g, '');
  const list = Array.isArray(orderTypesList) ? orderTypesList : [];
  const otObj = list.find(o => o && o.id === orderType);
  const candidates = new Set([norm(orderType), norm(otObj?.label)].filter(Boolean));
  const rule = rules.find(r => r && r.isActive && candidates.has(norm(r.name)));
  return rule ? rule.id : null;
}

// Server orderZoneSurchargeFor(): the surcharge an EXISTING order keeps on edit/billing.
export function orderZoneSurchargeFor(order, newItemsSubtotal) {
  const prev = Number(order && order.zoneSurcharge) || 0;
  if (!(prev > 0)) return 0;
  const prevItems = (Array.isArray(order.items) ? order.items : [])
    .reduce((s, i) => s + (typeof i?.total === 'number' ? i.total : (Number(i?.price) || 0) * (Number(i?.quantity) || 1)), 0);
  if ((Number(order.subtotal) || 0) < prevItems + prev - 0.05) return 0;
  const rule = (Array.isArray(order.appliedPricingRules) ? order.appliedPricingRules : [])
    .find(r => r && (r.type === 'floor_area_charge' || r.type === 'zone'));
  if (rule && rule.markupType === 'percentage' && Number(rule.markupValue) > 0) {
    return r2((Number(newItemsSubtotal) || 0) * Number(rule.markupValue) / 100);
  }
  return prev;
}

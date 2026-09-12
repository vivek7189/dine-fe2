// Variant-level multi-tier pricing resolver (shared by billing + variant modal).
// Mirrors the backend resolveItemPriceForRule() variant branch so client and server agree.

const TAKEAWAY_NAMES = ['takeaway', 'take away', 'take-away'];
const DELIVERY_NAMES = ['delivery'];
const DINEIN_NAMES = ['dine-in', 'dine in', 'dinein'];
const CHANNEL_NAMES = [...DINEIN_NAMES, ...TAKEAWAY_NAMES, ...DELIVERY_NAMES];

const isZoneRule = (rule) => !CHANNEL_NAMES.includes((rule?.name || '').toLowerCase().trim());
const findDineInRule = (rules) => (rules || []).find(r => r.isActive && DINEIN_NAMES.includes((r.name || '').toLowerCase().trim()));

// Resolve a variant's unit price for the active pricing rule:
//   per-variant tier price → (zone rule) inherit variant Dine-In price → variant base price.
// Returns null only when `variant` is falsy; otherwise always a number (falls back to base).
export function resolveVariantTierPrice(variant, activeRuleId, rules) {
  if (!variant) return null;
  const base = typeof variant.price === 'number' ? variant.price : (parseFloat(variant.price) || 0);
  if (!activeRuleId) return base;
  const per = variant.pricingRules?.[activeRuleId];
  if (typeof per === 'number') return per;
  const rule = (rules || []).find(r => r.id === activeRuleId);
  if (rule && isZoneRule(rule)) {
    const di = findDineInRule(rules);
    if (di && typeof variant.pricingRules?.[di.id] === 'number') return variant.pricingRules[di.id];
  }
  return base;
}

// Resolve a non-variant ITEM's unit price for the active pricing rule. Mirrors the
// dashboard menu card's getItemDisplayPrice EXACTLY so the card, the cart line/total
// and the order payload never disagree:
//   P1 per-item tier price → P2 (zone rule) inherit item Dine-In price
//   → P3 rule default markup on base → base.
// `basePrice` is the item's ORIGINAL/base price (authoritative). `item.pricingRules`
// supplies per-item overrides. Always returns a number.
export function resolveItemTierPrice(item, basePrice, activeRuleId, rules) {
  const base = typeof basePrice === 'number' && !isNaN(basePrice)
    ? basePrice
    : (typeof item?.price === 'number' ? item.price : parseFloat(item?.price) || 0);
  if (!activeRuleId) return base;
  // P1: explicit per-item price for this rule
  const per = item?.pricingRules?.[activeRuleId];
  if (per != null) {
    const n = Number(per);
    if (!isNaN(n) && n >= 0) return n;
  }
  const rule = (rules || []).find(r => r.id === activeRuleId);
  // P2: zone rules inherit the item's Dine-In per-item price
  if (rule && isZoneRule(rule)) {
    const di = findDineInRule(rules);
    const diPer = di ? item?.pricingRules?.[di.id] : undefined;
    if (diPer != null) {
      const n = Number(diPer);
      if (!isNaN(n) && n >= 0) return n;
    }
  }
  // P3: rule default markup on base
  if (rule?.defaultMarkupType === 'percentage' && rule.defaultMarkupValue) {
    return Math.round(base * (1 + rule.defaultMarkupValue / 100) * 100) / 100;
  }
  if (rule?.defaultMarkupType === 'flat' && rule.defaultMarkupValue) {
    return Math.round((base + rule.defaultMarkupValue) * 100) / 100;
  }
  return base;
}

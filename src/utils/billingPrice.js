// Shared line/subtotal pricing for the BILLING modals (Order History "Complete Billing" and the
// table "Bill" modal used by the dashboard table view and /tables).
//
// This is an exact copy of the main POS logic in dashboard/page.js — getEffectiveItemPrice() and
// getTotalAmount() — so every billing surface charges what the POS shows: variant / zone-tier
// price + topping/add-on prices (× weight for sold-by-weight lines). The modals used to sum
// item.price × qty only, which dropped toppings (and zone pricing) from the subtotal, the tax and
// the saved totals. Keep this in sync with dashboard/page.js if that logic ever changes.

import { resolveVariantTierPrice, resolveItemTierPrice } from './variantPricing';

export function getEffectiveItemPrice(item, { multiPricingEnabled = false, activePricingRuleId = null, pricingRules = [], menuItems = [] } = {}) {
  let base;
  if (item?.selectedVariant?.price != null) {
    if (multiPricingEnabled && activePricingRuleId) {
      const freshVariant = (menuItems || []).find(m => m.id === item.id)
        ?.variants?.find(v => v.name === item.selectedVariant.name);
      base = resolveVariantTierPrice(freshVariant || item.selectedVariant, activePricingRuleId, pricingRules);
    } else {
      base = item.selectedVariant.price;
    }
  } else if (multiPricingEnabled && activePricingRuleId) {
    const freshMenuItem = item?.id != null ? (menuItems || []).find(m => m.id === item.id) : undefined;
    const trueBase = typeof freshMenuItem?.price === 'number' ? freshMenuItem.price
      : typeof item?._originalPrice === 'number' ? item._originalPrice
      : typeof item?.basePrice === 'number' ? item.basePrice
      : typeof item?.price === 'number' ? item.price : 0;
    const mergedRules = { ...(item?.pricingRules || {}), ...(freshMenuItem?.pricingRules || {}) };
    base = resolveItemTierPrice({ pricingRules: mergedRules }, trueBase, activePricingRuleId, pricingRules);
  } else {
    base = typeof item?.price === 'number' ? item.price : 0;
  }
  // Last resort: if base is still 0 and this isn't intentionally free, use the current menu price.
  if (base === 0 && item?.id) {
    const menuItem = (menuItems || []).find(m => m.id === item.id);
    if (menuItem && typeof menuItem.price === 'number' && menuItem.price > 0) {
      base = menuItem.price;
    }
  }
  const extras = Array.isArray(item?.selectedCustomizations)
    ? item.selectedCustomizations.reduce((s, c) => s + (c?.price || 0), 0)
    : (typeof item?.customizationPrice === 'number' ? item.customizationPrice : 0);
  return (base || 0) + (extras || 0);
}

// Mirror of the dashboard's getTotalAmount().
export function getCartSubtotal(cart, ctx) {
  return (cart || []).reduce((sum, item) => {
    const price = getEffectiveItemPrice(item, ctx);
    if (item.soldByWeight && item.itemWeight) {
      const wt = item.priceUnit === 'per_100g' ? item.itemWeight / 100 : item.itemWeight;
      return sum + price * wt;
    }
    return sum + price * (item.quantity || 1);
  }, 0);
}

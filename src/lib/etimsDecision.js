'use client';

/**
 * Kenya KRA eTIMS — single source of truth for "is this store live on eTIMS right now?"
 * and "should we ask Yes/No per bill?". Previously this predicate was duplicated inline in
 * dashboard/page.js and dashboard/v2/page.js; centralising it here lets OrderSummary (the one
 * component every billing screen renders) make the same decision everywhere.
 *
 * etimsActiveFor is TRUE only when: the store is Kenya (KE / KES), eTIMS is enabled, the device
 * is initialised (has an SDC ID), AND we're in the desktop app (the VSCU relay exists). On the
 * web there is no local VSCU, so this is always false and billing prints normally — unchanged.
 */
export function etimsActiveFor(restaurant) {
  if (!restaurant || typeof window === 'undefined') return false;
  const cs = restaurant.currencySettings || {};
  const isKenya = cs.countryCode === 'KE' || cs.currencyCode === 'KES';
  const cfg = restaurant.etimsConfig || {};
  return !!(
    isKenya
    && cfg.enabled
    && cfg.device && cfg.device.sdcId
    && window.electronAPI && typeof window.electronAPI.etimsRelay === 'function'
  );
}

// Whether the store opted into the per-bill "Send to KRA?" prompt (else auto-send every bill).
export function etimsAskPerBillFor(restaurant) {
  return !!(restaurant && restaurant.etimsConfig && restaurant.etimsConfig.askPerBill);
}

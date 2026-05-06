import { getEssentialData } from './offlineDb';

/**
 * Load all essential data from IndexedDB in parallel.
 * Used as last-resort fallback when API + localStorage both fail.
 * Returns null for any data that isn't cached.
 */
export async function loadOfflineEssentials(restaurantId) {
  if (!restaurantId) return null;

  try {
    const [menu, floors, tax, printSettings, pricingRules, restaurant, categories] = await Promise.all([
      getEssentialData(`menu_${restaurantId}`),
      getEssentialData(`floors_${restaurantId}`),
      getEssentialData(`tax_${restaurantId}`),
      getEssentialData(`printSettings_${restaurantId}`),
      getEssentialData(`pricingRules_${restaurantId}`),
      getEssentialData(`restaurant_${restaurantId}`),
      getEssentialData(`categories_${restaurantId}`),
    ]);

    return { menu, floors, tax, printSettings, pricingRules, restaurant, categories };
  } catch {
    return null;
  }
}

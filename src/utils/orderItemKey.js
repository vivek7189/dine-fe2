/**
 * Generate a composite key for an order/cart item that uniquely identifies it.
 * Used everywhere items are matched, deduped, or compared.
 * Key format: "menuItemId|variantName|custId1,custId2" (sorted customizations)
 *
 * Works with both cart items (id field) and order items (menuItemId field).
 */
export function getOrderItemKey(item) {
  const id = item.menuItemId || item.id || '';
  const variant = item.selectedVariant?.name || '';
  const custs =
    Array.isArray(item.selectedCustomizations) && item.selectedCustomizations.length > 0
      ? [...item.selectedCustomizations]
          .map((c) => c.id || c.name || '')
          .sort()
          .join(',')
      : '';
  return `${id}|${variant}|${custs}`;
}

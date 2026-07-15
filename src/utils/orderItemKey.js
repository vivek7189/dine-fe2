/**
 * Generate a composite key for an order/cart item that uniquely identifies it.
 * Used everywhere items are matched, deduped, or compared.
 * Key format: "menuItemId|variantName|custId1,custId2" (sorted customizations)
 * When the item carries a seat assignment (seat-level ordering), "|sN" is
 * appended so the same item on different seats stays as separate lines.
 * Items with no seat produce the exact same key as before — zero behavior
 * change for existing orders and restaurants with the feature off.
 *
 * Works with both cart items (id field) and order items (menuItemId field).
 */

/**
 * Sanitize a per-item seat number. Valid: integer 1..65. Anything else → null
 * (null = shared / "for table").
 */
export function sanitizeSeat(seat) {
  const n = typeof seat === 'string' && seat.trim() !== '' ? Number(seat) : seat;
  return Number.isInteger(n) && n >= 1 && n <= 65 ? n : null;
}

/**
 * Display label for a seat: seat 1 on table 7 → "7A"; null → "Table" (shared).
 * Without a table number: seat 1 → "A".
 */
export function seatLabel(seat, tableNumber) {
  const s = sanitizeSeat(seat);
  if (s === null) return 'Table';
  // 1→A .. 26→Z, then 27→AA style
  let n = s;
  let letters = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    letters = String.fromCharCode(65 + rem) + letters;
    n = Math.floor((n - 1) / 26);
  }
  return tableNumber != null && tableNumber !== '' ? `${tableNumber}${letters}` : letters;
}

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
  const seat = sanitizeSeat(item.seat);
  const base = `${id}|${variant}|${custs}`;
  return seat === null ? base : `${base}|s${seat}`;
}

/**
 * Base key WITHOUT the seat — used for KOT change detection only.
 * Moving an item between seats must NOT look like remove+add to the kitchen;
 * KOT diffs aggregate quantities by this base key instead.
 */
export function getOrderItemBaseKey(item) {
  return getOrderItemKey({ ...item, seat: null });
}

/**
 * categoryColors — a small, curated palette + a deterministic mapping from a category
 * (id or name) to a clean accent color, used by the Fast Billing view to color-code
 * categories, sub-category pills, item-card stripes and bill labels.
 *
 * Deterministic: the same category always gets the same color across renders/sessions,
 * with no color stored on the menu. Distinct, soft hues (not the clashing full-orange /
 * full-green tiles of legacy POS systems).
 */
const PALETTE = [
  '#0ea5e9', // sky
  '#f59e0b', // amber
  '#10b981', // emerald
  '#f43f5e', // rose
  '#8b5cf6', // violet
  '#fb923c', // orange
  '#ec4899', // pink
  '#14b8a6', // teal
  '#6366f1', // indigo
  '#84cc16', // lime
  '#06b6d4', // cyan
  '#a855f7', // purple
  '#ef4444', // red
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
];

function hashKey(key) {
  const s = String(key == null ? '' : key).toLowerCase().trim();
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Accent color for a category key (id or name). Stable per key. */
export function categoryColor(key) {
  if (!key) return '#94a3b8'; // neutral slate for "all"/unknown
  return PALETTE[hashKey(key) % PALETTE.length];
}

/**
 * Root-category color for a menu item, so a dish always inherits its TOP category's color
 * regardless of how deep its sub-category is. Falls back to the item's own category.
 * `resolveRoot` (optional) should return the item's root category node (id/name) — pass
 * resolveCategoryPath(item, index)[0] from the caller when a category tree is available.
 */
export function itemColor(item, rootKey) {
  return categoryColor(rootKey || item?.category || item?.subCategory || item?.name);
}

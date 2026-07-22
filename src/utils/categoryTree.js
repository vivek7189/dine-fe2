/**
 * categoryTree — one resolver for the whole app so category hierarchy behaves
 * identically on billing, menu, reports and print.
 *
 * BACKWARD COMPATIBILITY IS THE POINT:
 *  - Old data: item.category = parent id/name, item.subCategory = child id/name.
 *  - New data: item.category = the leaf category id at any depth (subCategory unused).
 *  - Legacy free-text: item.category is a raw display name not present in the tree.
 * All three resolve through `resolveCategoryPath` below, so callers never branch.
 *
 * A store is "hierarchical" ONLY when at least one category has a parentId. That
 * fact — not any toggle — is what turns the drill-down UI on (auto-detect). Flat
 * stores get an empty/rootless tree and every consumer falls back to old behavior.
 *
 * Category shape (from restaurantData.categories): { id, name, emoji, parentId,
 *   displayOrder? }. `id` is a slug of the name; matching also accepts the name.
 */

const MAX_DEPTH = 12; // cycle/pathology guard — real menus are 2-3 deep

const norm = (v) => (v == null ? '' : String(v).trim().toLowerCase());

/**
 * Build a fast lookup index over a categories array. Cheap; safe to memoize.
 * @param {Array} categories
 * @returns {{
 *   list: Array, byKey: Map, childrenOf: Function, roots: Array, hasTree: boolean,
 *   resolve: Function
 * }}
 */
export function buildCategoryIndex(categories) {
  const list = Array.isArray(categories) ? categories.filter(Boolean) : [];

  // Index by both id and name (lowercased) so item.category can be either.
  const byKey = new Map();
  for (const c of list) {
    if (c.id != null) byKey.set(norm(c.id), c);
  }
  // Names are a lower-priority alias — only fill if the key isn't already an id.
  for (const c of list) {
    const nk = norm(c.name);
    if (nk && !byKey.has(nk)) byKey.set(nk, c);
  }

  const resolve = (idOrName) => byKey.get(norm(idOrName)) || null;

  const sortCats = (arr) =>
    arr.slice().sort((a, b) => {
      const ao = Number.isFinite(a?.displayOrder) ? a.displayOrder : Infinity;
      const bo = Number.isFinite(b?.displayOrder) ? b.displayOrder : Infinity;
      if (ao !== bo) return ao - bo;
      return norm(a?.name).localeCompare(norm(b?.name));
    });

  // parentKey(child) -> [children], resolving the parent to its canonical node
  // so a parentId that points at either an id or a name still groups correctly.
  const childrenMap = new Map();
  for (const c of list) {
    if (!c.parentId) continue;
    const parent = resolve(c.parentId);
    const pk = parent ? norm(parent.id) : norm(c.parentId);
    if (!childrenMap.has(pk)) childrenMap.set(pk, []);
    childrenMap.get(pk).push(c);
  }

  const childrenOf = (idOrName) => {
    const node = resolve(idOrName);
    const key = node ? norm(node.id) : norm(idOrName);
    return sortCats(childrenMap.get(key) || []);
  };

  // Roots = categories with no (resolvable) parent.
  const roots = sortCats(list.filter((c) => !c.parentId || !resolve(c.parentId)));

  const hasTree = list.some((c) => c.parentId && resolve(c.parentId));

  return { list, byKey, resolve, childrenOf, roots, hasTree };
}

/**
 * The leaf category key an item belongs to. Honors BOTH data shapes:
 * new single-leaf (item.category) and old two-field (subCategory is the leaf).
 */
export function leafCategoryKey(item) {
  if (!item) return '';
  return norm(item.subCategory) || norm(item.category);
}

/**
 * Resolve an item to its full category path [root, …, leaf].
 * Walks parentId up from the leaf. Cycle- and depth-guarded. Never throws.
 * If the leaf isn't in the tree, returns a single synthetic node so legacy
 * free-text categories still render as their own top-level tab.
 * @param {object} item
 * @param {object} index - from buildCategoryIndex
 * @returns {Array<{id,name,emoji?,parentId?,synthetic?:boolean}>}
 */
export function resolveCategoryPath(item, index) {
  if (!item) return [];
  // Prefer the sub-category (deepest) but fall back to the category if the
  // sub-category isn't in the tree — so a real category is never lost just
  // because an item carries a stale/free-text subCategory.
  let leaf = null;
  const candidates = [];
  if (item.subCategory) candidates.push(item.subCategory);
  if (item.category) candidates.push(item.category);
  for (const cand of candidates) {
    const n = index?.resolve ? index.resolve(cand) : null;
    if (n) { leaf = n; break; }
  }
  if (!leaf) {
    if (!candidates.length) return [];
    // Legacy free-text category (or subCategory) not present in the tree.
    const raw = item.subCategory || item.category || '';
    return [{
      id: norm(raw),
      name: typeof raw === 'string' && raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : raw,
      synthetic: true,
    }];
  }
  const path = [];
  const seen = new Set();
  let node = leaf;
  let depth = 0;
  while (node && depth < MAX_DEPTH) {
    const key = norm(node.id);
    if (seen.has(key)) break; // cycle guard
    seen.add(key);
    path.push(node);
    if (!node.parentId) break;
    const parent = index.resolve(node.parentId);
    if (!parent) break;
    node = parent;
    depth++;
  }
  return path.reverse(); // [root, …, leaf]
}

/**
 * True if `nodeIdOrName` is the item's leaf OR any of its ancestors — i.e. the
 * item belongs under that category node. This is the billing filter rule AND
 * the print station-routing rule (assigning a parent routes all descendants).
 */
export function isAncestorOrSelf(nodeIdOrName, item, index) {
  const targetNode = index?.resolve ? index.resolve(nodeIdOrName) : null;
  const targetKey = targetNode ? norm(targetNode.id) : norm(nodeIdOrName);
  if (!targetKey) return false;
  const path = resolveCategoryPath(item, index);
  return path.some((n) => norm(n.id) === targetKey || norm(n.name) === targetKey);
}

/** All descendant category ids of a node (not including itself). Depth-guarded. */
export function descendantIdsOf(idOrName, index) {
  const out = [];
  const seen = new Set();
  const walk = (key, depth) => {
    if (depth > MAX_DEPTH) return;
    for (const child of index.childrenOf(key)) {
      const ck = norm(child.id);
      if (seen.has(ck)) continue;
      seen.add(ck);
      out.push(child.id);
      walk(child.id, depth + 1);
    }
  };
  walk(idOrName, 0);
  return out;
}

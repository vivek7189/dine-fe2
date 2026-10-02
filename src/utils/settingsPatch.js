// What changed between the settings a page loaded (`base`) and what it is about to save (`cur`).
// Plain objects are compared key by key; arrays and values as a whole; a removed key becomes null.
// Returns { patch, topLevel } or null when nothing changed:
//   patch    — only the changed leaves (nested), for a server that merges it into the saved copy
//   topLevel — the changed top-level keys with their full current value (older servers)
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date);
const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

function diff(base, cur) {
  const out = {};
  let changed = false;
  const keys = new Set([...Object.keys(base || {}), ...Object.keys(cur || {})]);
  for (const k of keys) {
    const a = base ? base[k] : undefined;
    const b = cur ? cur[k] : undefined;
    if (same(a, b)) continue;
    changed = true;
    out[k] = isObj(a) && isObj(b) ? diff(a, b) : (b === undefined ? null : b);
  }
  return changed ? out : undefined;
}

export function settingsPatch(base, cur) {
  const patch = diff(base || {}, cur || {});
  if (!patch) return null;
  const topLevel = {};
  for (const k of Object.keys(patch)) topLevel[k] = cur && cur[k] !== undefined ? cur[k] : null;
  return { patch, topLevel };
}

// Apply a settingsPatch() `patch` onto a FRESH copy of the saved settings and return the full
// merged object. `cur` is the page's full current object: where the fresh copy has no plain
// object to merge a nested change into, the page's whole current value is taken.
// Sending this FULL object works on every backend: new ones (partial deep-merge) and old ones
// still running on local-server hubs (tax PUT replaces the whole object and needs `taxes`;
// billing PUT rebuilds from the body with defaults) — while changes saved elsewhere since the
// page loaded are kept, because the base is the fresh server copy, not the page's stale one.
export function applySettingsPatch(fresh, patch, cur) {
  const out = isObj(fresh) ? { ...fresh } : {};
  for (const k of Object.keys(patch || {})) {
    const p = patch[k];
    const c = cur ? cur[k] : undefined;
    if (isObj(p) && isObj(c) && isObj(out[k])) out[k] = applySettingsPatch(out[k], p, c);
    else if (isObj(p) && isObj(c)) out[k] = c;
    else out[k] = p;
  }
  return out;
}

export default settingsPatch;

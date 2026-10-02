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

export default settingsPatch;

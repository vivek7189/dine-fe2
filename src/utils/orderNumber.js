// Toast-style display order number, gated to genuinely multi-terminal setups.
//
// The backend stamps `orderNumberDisplay` at creation: a plain daily number ("45") on a single
// terminal / cloud, or a terminal-scoped "T2-45" when the creating till has a terminal number
// assigned (each terminal keeps its OWN daily counter, so "T1-45" and "T2-45" never collide).
//
// We show the terminal tag ONLY when the shop actually runs MULTIPLE terminals — i.e. the loaded
// orders contain ≥2 distinct terminal tags. A lone till shows plain numbers even if it happens to
// have a number assigned, so single-terminal shops are never cluttered with a redundant "T1-". This
// is a DISPLAY decision only — order identity is always the unique id, so nothing here affects
// billing, totals or de-dup.
//
// Multi-terminal status is detected centrally (see detectMultiTerminal, called from api.getOrders)
// and stashed in localStorage so every screen and print agrees without threading a flag through.
// Use orderDisplayNumber() EVERYWHERE an order number is shown (lists, receipts, KOTs).

const MT_KEY = 'dineopen_multi_terminal';

// Split a stamped display value: "T2-45" → { tag:'T2', plain:'45' }; "45"/"500003" → { tag:null }.
// A hyphen in `orderNumberDisplay` only ever comes from a terminal prefix (the plain form is digits).
function splitTag(raw) {
  const s = String(raw);
  const m = s.match(/^([A-Za-z][A-Za-z0-9]*)-(.+)$/);
  return m ? { tag: m[1], plain: m[2] } : { tag: null, plain: s };
}

function readMulti() {
  try { return typeof window !== 'undefined' && window.localStorage.getItem(MT_KEY) === '1'; }
  catch (_) { return false; }
}

// Inspect a freshly-loaded batch of orders and remember whether this shop is multi-terminal
// (≥2 distinct terminal tags). Only writes when the batch actually has orders, so an empty or
// oddly-shaped response never downgrades a correct flag. Returns the boolean.
export function detectMultiTerminal(orders) {
  try {
    const list = Array.isArray(orders) ? orders : [];
    if (!list.length) return readMulti();
    const tags = new Set();
    for (const o of list) {
      if (!o) continue;
      if (o.orderNumberDisplay != null) { const { tag } = splitTag(o.orderNumberDisplay); if (tag) tags.add(tag); }
      else if (o.terminalPrefix) tags.add(String(o.terminalPrefix));
    }
    const multi = tags.size >= 2;
    if (typeof window !== 'undefined') window.localStorage.setItem(MT_KEY, multi ? '1' : '0');
    return multi;
  } catch (_) { return readMulti(); }
}

// Explicit override (e.g. a settings toggle or a test). Pass a boolean.
export function setMultiTerminal(v) {
  try { if (typeof window !== 'undefined') window.localStorage.setItem(MT_KEY, v ? '1' : '0'); } catch (_) {}
}

export function isMultiTerminal() { return readMulti(); }

export function orderDisplayNumber(order) {
  if (!order) return '';
  if (order.orderNumberDisplay != null) {
    const { tag, plain } = splitTag(order.orderNumberDisplay);
    const termTag = tag || (order.terminalPrefix ? String(order.terminalPrefix) : null);
    // Show the terminal tag only in a real multi-terminal setup; otherwise the plain number.
    return (termTag && readMulti()) ? `${termTag}-${plain}` : plain;
  }
  if (order.dailyOrderId != null) return String(order.dailyOrderId);
  if (order.orderNumber != null) return String(order.orderNumber);
  return order.id ? String(order.id).slice(-4).toUpperCase() : '—';
}

export default orderDisplayNumber;

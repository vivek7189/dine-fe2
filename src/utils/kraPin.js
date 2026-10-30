// Customer's KRA PIN on a bill (Kenya eTIMS buyer PIN, saved as order.customerTin).
// Same rules as the backend (utils/kraPin.js there).

// Capitals, letters + digits only, max 15 — same as the POS billing box.
export const cleanKraPin = (v) => String(v == null ? '' : v).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15);

// KRA PIN = letter + 9 digits + letter, e.g. P051813230X
export const isKraPin = (v) => /^[A-Z]\d{9}[A-Z]$/.test(String(v || ''));

export const KRA_PIN_HINT = 'A KRA PIN is a letter, 9 digits and a letter (e.g. P051813230X).';

// The PIN can't change once the bill is at KRA (signed) or may be (waiting for a KRA portal check).
export const kraPinLocked = (order) => {
  const e = order && order.etims;
  return !!(e && (e.rcptSign || e.needsReconciliation));
};

// Customer's KRA PIN on a bill (Kenya eTIMS buyer PIN, saved as order.customerTin).
// Same rules as the backend (utils/kraPin.js there) — the backend has the final say.

// Capitals, letters + digits only, max 15 — same as the POS billing box.
export const cleanKraPin = (v) => String(v == null ? '' : v).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15);

// KRA PIN = letter + 9 digits + letter, e.g. P051813230X
export const isKraPin = (v) => /^[A-Z]\d{9}[A-Z]$/.test(String(v || ''));

export const KRA_PIN_HINT = 'A KRA PIN is a letter, 9 digits and a letter (e.g. P051813230X).';

const toMs = (v) => {
  try {
    if (!v) return 0;
    if (typeof v.toDate === 'function') return v.toDate().getTime();
    if (v._seconds) return v._seconds * 1000;
    if (typeof v.seconds === 'number') return v.seconds * 1000;
    return new Date(v).getTime() || 0;
  } catch { return 0; }
};

// Why the PIN can't change ('' = it can): only while we KNOW the bill is not at KRA — never sent,
// or KRA turned the last send down.
export const kraPinLockReason = (order) => {
  const e = (order && order.etims && typeof order.etims === 'object') ? order.etims : {};
  if (e.rcptSign) return 'This bill is already at KRA, so the PIN cannot change. Refund it and bill again to issue a KRA receipt with a PIN.';
  if (e.needsReconciliation) return 'This bill may already be at KRA (waiting for a check on the KRA portal), so the PIN cannot change now.';
  if (e.pendingInvcNo) {
    const lastSend = Math.max(toMs(e.sendingAt), toMs(e.preparedAt), toMs(e.claimAt));
    // a clear "no" = a real KRA error code (not 924 duplicate, not 'none' / unreadable)
    const code = String((e.lastError && e.lastError.resultCd) || '');
    const rejected = /^\d+$/.test(code) && code !== '924' && code !== '000' && toMs(e.lastAttemptAt) >= lastSend;
    if (!rejected) return 'This bill was sent to KRA and the answer is not known yet. Send it to KRA again first; the PIN can be changed only if KRA turns it down.';
  }
  return '';
};

export const kraPinLocked = (order) => !!kraPinLockReason(order);

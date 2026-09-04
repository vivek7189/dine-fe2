// Robustly turn any date-ish value into a JS Date, or null when unparseable.
//
// WHY: the Firestore backend returns dates as plain strings ("2026-09-10"), but the
// Postgres backend (pgAdapter) returns every timestamp as a Firestore-style object
// { _seconds, _nanoseconds } (or { seconds, nanoseconds }). A naive `new Date(value)`
// yields "Invalid Date" for that object shape — which is why offer dates showed
// "Invalid Date" and offers were wrongly treated as expired on PG/GCP accounts.
//
// Handles: Date | epoch number (s or ms) | ISO/date string | Firestore Timestamp
// ({seconds}/{_seconds} or a .toDate() method).
export function toJsDate(value) {
  if (value === null || value === undefined || value === '') return null;

  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;

  if (typeof value === 'number') {
    // < 1e12 → seconds (through year ~33658), else milliseconds
    const ms = value < 1e12 ? value * 1000 : value;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof value === 'object') {
    // Firestore Admin Timestamp instance (has a real toDate method)
    if (typeof value.toDate === 'function') {
      try { const d = value.toDate(); return d instanceof Date && !isNaN(d.getTime()) ? d : null; }
      catch { return null; }
    }
    // Serialized Firestore Timestamp — Admin SDK uses _seconds, client SDK uses seconds
    const secs = value.seconds ?? value._seconds;
    if (secs !== undefined && secs !== null) {
      const nanos = value.nanoseconds ?? value._nanoseconds ?? 0;
      const d = new Date(secs * 1000 + Math.floor(nanos / 1e6));
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  }

  if (typeof value === 'string') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

// Convenience: format a date-ish value with toLocaleDateString, or '' if unparseable.
export function formatDateSafe(value, locale, options) {
  const d = toJsDate(value);
  return d ? d.toLocaleDateString(locale, options) : '';
}

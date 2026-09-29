// Restaurant-local dates and times for screens that show REAL moments (order time, clock-in,
// login…) and for report date presets (Today / Yesterday / 7 days / 30 days).
//
// Reports belong to the restaurant's day, not to the device's: an owner viewing from Singapore
// must see an India restaurant's "today" and its 7:00 PM order as 7:00 PM. The restaurant's
// IANA timezone + business-day start hour are set on apiClient by the dashboard layout; when the
// timezone is not configured everything falls back to the device (the old behaviour).
//
// Only format real moments with fmt*(). A calendar date string ("2026-09-29") or a wall-clock
// time built on the device must keep its own formatting — shifting it would move its label.
import apiClient from './api';

export function restaurantTimeZone() {
  try {
    return (apiClient.getRestaurantTimezone && apiClient.getRestaurantTimezone()) || null;
  } catch {
    return null;
  }
}

function businessDayStartHour() {
  try {
    const n = Number(apiClient.getBusinessDayStartHour ? apiClient.getBusinessDayStartHour() : 0);
    return Number.isFinite(n) && n > 0 && n < 24 ? Math.floor(n) : 0;
  } catch {
    return 0;
  }
}

// Intl options with the restaurant's timezone added (an explicit timeZone is kept).
export function withRestaurantTz(options = {}) {
  const tz = restaurantTimeZone();
  if (!tz || (options && options.timeZone)) return options;
  return { ...(options || {}), timeZone: tz };
}

function toDate(value) {
  if (value === null || value === undefined || value === '') return null;
  let d = value;
  if (value && typeof value.toDate === 'function') d = value.toDate();          // Firestore Timestamp
  else if (value && typeof value === 'object' && typeof value._seconds === 'number') d = new Date(value._seconds * 1000);
  else if (value && typeof value === 'object' && typeof value.seconds === 'number') d = new Date(value.seconds * 1000);
  else if (!(value instanceof Date)) d = new Date(value);
  return d instanceof Date && !isNaN(d.getTime()) ? d : null;
}

function safeFormat(d, method, locale, options) {
  try {
    return d[method](locale, withRestaurantTz(options));
  } catch {
    return d[method](locale, options); // unknown timezone name → device time rather than a crash
  }
}

// A real moment → text in the restaurant's timezone. Invalid / empty → fallback ('' by default).
export function fmtTime(value, locale, options, fallback = '') {
  const d = toDate(value);
  return d ? safeFormat(d, 'toLocaleTimeString', locale, options) : fallback;
}

export function fmtDate(value, locale, options, fallback = '') {
  const d = toDate(value);
  return d ? safeFormat(d, 'toLocaleDateString', locale, options) : fallback;
}

export function fmtDateTime(value, locale, options, fallback = '') {
  const d = toDate(value);
  return d ? safeFormat(d, 'toLocaleString', locale, options) : fallback;
}

// YYYY-MM-DD of a moment on the restaurant's calendar (no business-day shift).
export function restaurantDateKey(value) {
  const d = toDate(value);
  if (!d) return '';
  try {
    return d.toLocaleDateString('en-CA', withRestaurantTz({ year: 'numeric', month: '2-digit', day: '2-digit' }));
  } catch {
    return d.toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }
}

// The restaurant's current BUSINESS date as a device Date at local noon — for date presets.
// Its local fields (getFullYear / getMonth / getDate) are the restaurant's business date, so the
// usual `d.setDate(d.getDate() - 6)` arithmetic works; format it with ymd(), never toISOString().
// Noon keeps day arithmetic clear of DST changes on the device.
export function restaurantToday() {
  const now = new Date();
  const shifted = new Date(now.getTime() - businessDayStartHour() * 3600000);
  const tz = restaurantTimeZone();
  if (tz) {
    try {
      const parts = {};
      for (const p of new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(shifted)) {
        parts[p.type] = p.value;
      }
      const y = Number(parts.year), m = Number(parts.month), d = Number(parts.day);
      if (y && m && d) return new Date(y, m - 1, d, 12, 0, 0, 0);
    } catch { /* unknown timezone → device date below */ }
  }
  return new Date(shifted.getFullYear(), shifted.getMonth(), shifted.getDate(), 12, 0, 0, 0);
}

// Local-field YYYY-MM-DD (use with restaurantToday()).
export function ymd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Event Calendar helpers shared by /calendar, the Home "Upcoming events" card, the Admin
// Calendar tab and the Sidebar entry.
//
// Event dates from the API are restaurant-local calendar dates ("2026-11-08"), never moments —
// all arithmetic here is done on UTC midnights of those strings so a viewer abroad still sees
// the right day. "Today" is the restaurant's business date (restaurantToday()).
import apiClient from './api';
import { getCurrentLanguage, t } from './i18n';
import { restaurantToday, ymd } from './restaurantTime';

export const CALENDAR_CATEGORIES = ['festival', 'religious', 'national', 'cultural', 'sports', 'commercial', 'custom'];

export const CATEGORY_STYLE = {
  festival:   { color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
  religious:  { color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  national:   { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  cultural:   { color: '#db2777', bg: '#fdf2f8', border: '#fbcfe8' },
  sports:     { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  commercial: { color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc' },
  custom:     { color: '#ca8a04', bg: '#fefce8', border: '#fde68a' },
};

export const MANAGER_ROLES = ['owner', 'admin', 'co-owner', 'manager'];

export function eventCategory(ev) {
  const c = String(ev?.category || '').toLowerCase();
  if (CATEGORY_STYLE[c]) return c;
  if (c === 'public' || ev?.source === 'public') return 'national';
  if (ev?.source === 'custom') return 'custom';
  return 'festival';
}

export function categoryStyle(ev) {
  return CATEGORY_STYLE[eventCategory(ev)];
}

export function categoryLabel(cat) {
  return t(`eventCalendar.categories.${cat}`);
}

// UI language for API `lang` + Intl formatting.
export function calendarLang() {
  try { return getCurrentLanguage() || 'en'; } catch { return 'en'; }
}

export function todayKey() {
  return ymd(restaurantToday());
}

// "YYYY-MM-DD" → UTC ms (NaN when malformed)
export function dayMs(key) {
  const [y, m, d] = String(key || '').split('-').map(Number);
  if (!y || !m || !d) return NaN;
  return Date.UTC(y, m - 1, d);
}

export function addDays(key, n) {
  const ms = dayMs(key);
  if (Number.isNaN(ms)) return key;
  return new Date(ms + n * 86400000).toISOString().slice(0, 10);
}

export function daysBetween(fromKey, toKey) {
  return Math.round((dayMs(toKey) - dayMs(fromKey)) / 86400000);
}

export function eventEnd(ev) {
  return ev?.endDate && ev.endDate >= ev.date ? ev.endDate : ev?.date;
}

// Does the event cover this calendar day?
export function eventOnDay(ev, key) {
  return ev?.date && ev.date <= key && key <= eventEnd(ev);
}

// Format a calendar date string in the UI language (no timezone shift).
export function fmtDay(key, options = { day: 'numeric', month: 'short', year: 'numeric' }) {
  const ms = dayMs(key);
  if (Number.isNaN(ms)) return key || '';
  const lang = calendarLang();
  try {
    return new Date(ms).toLocaleDateString(lang, { ...options, timeZone: 'UTC' });
  } catch {
    return new Date(ms).toLocaleDateString('en', { ...options, timeZone: 'UTC' });
  }
}

export function fmtRange(ev, options) {
  const end = eventEnd(ev);
  if (!end || end === ev.date) return fmtDay(ev.date, options);
  return `${fmtDay(ev.date, { day: 'numeric', month: 'short' })} – ${fmtDay(end, options)}`;
}

// "Today" / "Tomorrow" / "in 12 days" / "Ongoing" / "3 days ago"
export function countdownLabel(ev, today = todayKey()) {
  const start = ev?.date;
  const end = eventEnd(ev);
  if (!start) return '';
  if (start <= today && today <= end) return start === today ? t('eventCalendar.today') : t('eventCalendar.ongoing');
  const n = daysBetween(today, start);
  if (n === 1) return t('eventCalendar.tomorrow');
  if (n > 1) return t('eventCalendar.inDays', { n });
  const ago = daysBetween(end, today);
  return ago === 1 ? t('eventCalendar.yesterday') : t('eventCalendar.daysAgo', { n: ago });
}

export function isManagerRole(role) {
  return MANAGER_ROLES.includes(String(role || '').toLowerCase());
}

export function currentRestaurantId() {
  try {
    if (typeof window === 'undefined') return null;
    const rid = localStorage.getItem('selectedRestaurantId');
    if (rid) return rid;
    const u = JSON.parse(localStorage.getItem('user') || 'null');
    return u?.restaurantId || null;
  } catch { return null; }
}

// ── Access cache (drives the Sidebar entry) ────────────────────────────────────────────────
// 'allowed' | 'denied'. 403 (staff can't view) or 404 (backend without the calendar yet) →
// denied; network errors leave the previous answer. Cached 6 h per restaurant.
const ACCESS_TTL = 6 * 3600 * 1000;
const accessKey = (rid) => `calendarAccess:${rid}`;

export function getCachedCalendarAccess(rid) {
  if (!rid || typeof window === 'undefined') return null;
  try {
    const v = JSON.parse(localStorage.getItem(accessKey(rid)) || 'null');
    return v && v.state ? v : null;
  } catch { return null; }
}

export function setCalendarAccess(rid, state) {
  if (!rid || typeof window === 'undefined') return;
  try {
    const prev = getCachedCalendarAccess(rid);
    localStorage.setItem(accessKey(rid), JSON.stringify({ state, at: Date.now() }));
    if (!prev || prev.state !== state) {
      window.dispatchEvent(new CustomEvent('calendarAccessChanged', { detail: { restaurantId: rid, state } }));
    }
  } catch { /* storage blocked */ }
}

// Record the outcome of any calendar API call.
export function noteCalendarResult(rid, err) {
  if (!err) { setCalendarAccess(rid, 'allowed'); return; }
  if (err.status === 403 || err.status === 404) setCalendarAccess(rid, 'denied');
}

export async function probeCalendarAccess(rid, { force = false } = {}) {
  if (!rid) return null;
  const cached = getCachedCalendarAccess(rid);
  if (!force && cached && Date.now() - cached.at < ACCESS_TTL) return cached.state;
  try {
    await apiClient.getUpcomingEvents(rid, { days: 1, lang: calendarLang() });
    setCalendarAccess(rid, 'allowed');
    return 'allowed';
  } catch (err) {
    noteCalendarResult(rid, err);
    return getCachedCalendarAccess(rid)?.state || null;
  }
}

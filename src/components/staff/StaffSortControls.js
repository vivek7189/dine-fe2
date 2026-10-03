'use client';

import { useEffect, useMemo, useState } from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { t, getCurrentLanguage } from '../../lib/i18n';

// Admin → Staff list: sort (name / role / status / last login / user ID) + role & status filter
// chips, in both the table and the card view. Persisted per signed-in user in localStorage.
// Never mutates the list it is given.

export const STAFF_SORT_KEYS = ['name', 'role', 'status', 'lastLogin', 'userId'];
const DEFAULT_STATE = { key: 'name', dir: 'asc', filters: { roles: [], statuses: [] } };

function toMillis(v) {
  if (!v) return null;
  try {
    if (typeof v.toDate === 'function') return v.toDate().getTime();
    if (typeof v === 'object' && typeof v._seconds === 'number') return v._seconds * 1000;
    if (typeof v === 'object' && typeof v.seconds === 'number') return v.seconds * 1000;
    const ms = new Date(v).getTime();
    return Number.isNaN(ms) ? null : ms;
  } catch { return null; }
}

export const staffStatusOf = (m) => String(m?.status || 'active').toLowerCase();
const roleOf = (m) => String(m?.role || '').toLowerCase();

function storageKey() {
  try {
    const u = JSON.parse(localStorage.getItem('user') || 'null');
    const id = u?.id || u?.userId || u?.uid || u?.phone || 'anon';
    return `staffListSort:${id}`;
  } catch { return 'staffListSort:anon'; }
}

function sanitize(s) {
  const key = STAFF_SORT_KEYS.includes(s?.key) ? s.key : DEFAULT_STATE.key;
  const dir = s?.dir === 'desc' ? 'desc' : 'asc';
  const roles = Array.isArray(s?.filters?.roles) ? s.filters.roles.filter((x) => typeof x === 'string') : [];
  const statuses = Array.isArray(s?.filters?.statuses) ? s.filters.statuses.filter((x) => typeof x === 'string') : [];
  return { key, dir, filters: { roles, statuses } };
}

export function useStaffSort(list) {
  const [state, setState] = useState(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey());
      if (raw) setState(sanitize(JSON.parse(raw)));
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(storageKey(), JSON.stringify(state)); } catch { /* ignore */ }
  }, [state, loaded]);

  const collator = useMemo(() => {
    let lang = 'en';
    try { lang = getCurrentLanguage() || 'en'; } catch { /* ignore */ }
    try { return new Intl.Collator([lang, 'en'], { sensitivity: 'base', numeric: true }); } catch { return new Intl.Collator('en', { sensitivity: 'base', numeric: true }); }
  }, []);

  const source = Array.isArray(list) ? list : [];
  const roleOptions = useMemo(() => Array.from(new Set(source.map(roleOf).filter(Boolean))).sort(), [source]);
  const statusOptions = useMemo(() => Array.from(new Set(source.map(staffStatusOf))).sort(), [source]);

  const items = useMemo(() => {
    const { key, dir, filters } = state;
    const rolesF = filters.roles.filter((r) => roleOptions.includes(r));
    const statusF = filters.statuses.filter((s) => statusOptions.includes(s));
    const filtered = source.filter((m) =>
      (rolesF.length === 0 || rolesF.includes(roleOf(m))) &&
      (statusF.length === 0 || statusF.includes(staffStatusOf(m))));
    const sign = dir === 'desc' ? -1 : 1;
    const byName = (a, b) => collator.compare(String(a?.name || ''), String(b?.name || ''));
    const cmp = (a, b) => {
      if (key === 'lastLogin') {
        const x = toMillis(a?.lastLogin); const y = toMillis(b?.lastLogin);
        if (x === null && y === null) return byName(a, b);
        if (x === null) return 1; // never logged in → always last
        if (y === null) return -1;
        return x === y ? byName(a, b) : (x - y) * sign;
      }
      let r;
      if (key === 'role') r = collator.compare(roleOf(a), roleOf(b));
      else if (key === 'status') r = collator.compare(staffStatusOf(a), staffStatusOf(b));
      else if (key === 'userId') {
        const x = String(a?.loginId || ''); const y = String(b?.loginId || '');
        if (!x && y) return 1; if (x && !y) return -1;
        r = collator.compare(x, y);
      } else r = byName(a, b);
      return r !== 0 ? r * sign : byName(a, b);
    };
    return [...filtered].sort(cmp);
  }, [source, state, collator, roleOptions, statusOptions]);

  const setSort = (key) => setState((s) => ({
    ...s,
    key,
    // Last login: newest first on the first click; everything else A→Z.
    dir: s.key === key ? (s.dir === 'asc' ? 'desc' : 'asc') : (key === 'lastLogin' ? 'desc' : 'asc'),
  }));
  const setSortExplicit = (key, dir) => setState((s) => ({ ...s, key, dir }));
  const toggleFilter = (group, value) => setState((s) => {
    const cur = s.filters[group];
    return { ...s, filters: { ...s.filters, [group]: cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value] } };
  });
  const clearFilters = () => setState((s) => ({ ...s, filters: { roles: [], statuses: [] } }));

  return { items, sort: state, setSort, setSortExplicit, toggleFilter, clearFilters, roleOptions, statusOptions };
}

// Clickable table header with an arrow showing the current sort.
export function SortableTh({ label, sortKey, sort, onSort, align = 'left' }) {
  const active = sort.key === sortKey;
  const Icon = !active ? FaSort : sort.dir === 'asc' ? FaSortUp : FaSortDown;
  return (
    <th aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
      style={{ padding: 0, textAlign: align, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>
      <button type="button" onClick={() => onSort(sortKey)}
        style={{ width: '100%', padding: '12px 16px', border: 'none', background: 'transparent', cursor: 'pointer', font: 'inherit', fontWeight: 600, color: active ? '#111827' : '#374151', display: 'flex', alignItems: 'center', gap: 6, justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start' }}>
        {label}
        <Icon size={11} style={{ color: active ? '#ef4444' : '#cbd5e1', flexShrink: 0 }} />
      </button>
    </th>
  );
}

const chip = (on) => ({
  padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer',
  border: on ? '1px solid #111827' : '1px solid #e5e7eb', background: on ? '#111827' : '#fff', color: on ? '#fff' : '#374151',
  textTransform: 'capitalize',
});

// Filter chips + (for the card view) a sort picker.
export function StaffSortFilterBar({ ctl, roleLabel, statusLabel, showSortPicker, total }) {
  const { sort, roleOptions, statusOptions, toggleFilter, clearFilters, setSortExplicit } = ctl;
  const anyFilter = sort.filters.roles.length > 0 || sort.filters.statuses.length > 0;
  const sortOptions = [
    ['name', 'asc', 'staffList.sortNameAsc'], ['name', 'desc', 'staffList.sortNameDesc'],
    ['role', 'asc', 'staffList.sortRole'], ['status', 'asc', 'staffList.sortStatus'],
    ['lastLogin', 'desc', 'staffList.sortLastLoginNewest'], ['lastLogin', 'asc', 'staffList.sortLastLoginOldest'],
    ['userId', 'asc', 'staffList.sortUserId'],
  ];
  const current = `${sort.key}:${sort.dir}`;
  if (roleOptions.length < 2 && statusOptions.length < 2 && !showSortPicker) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
      {roleOptions.length > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>{t('staffList.role')}:</span>
          {roleOptions.map((r) => (
            <button key={r} type="button" aria-pressed={sort.filters.roles.includes(r)} onClick={() => toggleFilter('roles', r)} style={chip(sort.filters.roles.includes(r))}>{roleLabel(r)}</button>
          ))}
        </div>
      )}
      {statusOptions.length > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>{t('staffList.status')}:</span>
          {statusOptions.map((s) => (
            <button key={s} type="button" aria-pressed={sort.filters.statuses.includes(s)} onClick={() => toggleFilter('statuses', s)} style={chip(sort.filters.statuses.includes(s))}>{statusLabel(s)}</button>
          ))}
        </div>
      )}
      {anyFilter && (
        <button type="button" onClick={clearFilters} style={{ border: 'none', background: 'transparent', color: '#ef4444', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
          {t('staffList.clearFilters')}{typeof total === 'number' ? ` (${t('staffList.showing', { n: total })})` : ''}
        </button>
      )}
      {showSortPicker && (
        <label style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#6b7280' }}>
          {t('staffList.sortBy')}
          <select value={current} onChange={(e) => { const [k, d] = e.target.value.split(':'); setSortExplicit(k, d); }}
            style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, color: '#111827', background: '#fff' }}>
            {sortOptions.map(([k, d, label]) => <option key={`${k}:${d}`} value={`${k}:${d}`}>{t(label)}</option>)}
            {!sortOptions.some(([k, d]) => `${k}:${d}` === current) && <option value={current}>{t(`staffList.col.${sort.key}`)} ({sort.dir === 'asc' ? '↑' : '↓'})</option>}
          </select>
        </label>
      )}
    </div>
  );
}

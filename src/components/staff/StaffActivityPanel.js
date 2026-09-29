'use client';

// Staff → Activity: how many staff / waiters are using the app right now, who logged in on a day,
// and the login history. Data: GET /api/staff-activity/:restaurantId (owner / admin / manager).
// "Active now" = the person's app/POS talked to the server in the last 15 minutes.
import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaSyncAlt, FaSpinner, FaCircle, FaSearch } from 'react-icons/fa';
import apiClient from '../../lib/api';

const PLATFORM_LABEL = {
  'dine-app': 'Waiter app', 'mobile-app': 'Mobile app', desktop: 'Desktop POS', web: 'Web',
  'dine-frontend': 'Web', 'mobile-web': 'Phone browser', ios: 'iPhone app', android: 'Android app',
};
const METHOD_LABEL = {
  password: 'Password', pin: 'PIN', 'phone-otp': 'Phone OTP', google: 'Google', apple: 'Apple',
  email: 'Email', 'email-otp': 'Email OTP', support: 'Support login',
};
const platformLabel = (p) => (p ? PLATFORM_LABEL[p] || p : '—');
const titleCase = (r) => String(r || '').replace(/\b\w/g, (c) => c.toUpperCase());
const localDate = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function ago(iso) {
  if (!iso) return 'never';
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'yesterday' : `${d} days ago`;
}
const timeOf = (iso) => (iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) : '—');
const dateTimeOf = (iso) => (iso
  ? new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
  : '—');

const card = { background: 'white', border: '1px solid #eef0f3', borderRadius: '14px', padding: '14px 16px' };
const th = { padding: '9px 12px', textAlign: 'left', fontSize: '11.5px', fontWeight: 700, color: '#6b7280', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' };
const td = { padding: '9px 12px', fontSize: '13px', color: '#111827', borderBottom: '1px solid #f8fafc', whiteSpace: 'nowrap' };

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active now' },
  { key: 'used', label: 'Used app on this day' },
  { key: 'notUsed', label: 'Not on this day' },
  { key: 'never', label: 'Never logged in' },
];

export default function StaffActivityPanel({ restaurantId, restaurantName, onClose }) {
  const [date, setDate] = useState(localDate());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const isToday = date === localDate();

  const load = useCallback(async (quiet) => {
    if (!restaurantId) return;
    if (!quiet) setLoading(true);
    setError('');
    try {
      const r = await apiClient.getStaffActivity(restaurantId, date);
      if (r?.success) setData(r); else setError(r?.error || 'Could not load staff activity');
    } catch (e) {
      setError(e?.message || 'Could not load staff activity');
    } finally {
      setLoading(false);
    }
  }, [restaurantId, date]);

  useEffect(() => { load(); }, [load]);
  // Keep "active now" fresh while looking at today.
  useEffect(() => {
    if (!isToday) return undefined;
    const id = setInterval(() => load(true), 60 * 1000);
    return () => clearInterval(id);
  }, [isToday, load]);

  const staff = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data?.staff || []).filter((m) => {
      if (roleFilter && m.role !== roleFilter) return false;
      if (q && !String(m.name).toLowerCase().includes(q)) return false;
      if (filter === 'active') return m.activeNow;
      if (filter === 'used') return m.usedAppOnDate;
      if (filter === 'notUsed') return !m.usedAppOnDate && m.status !== 'inactive';
      if (filter === 'never') return m.neverLoggedIn;
      return true;
    });
  }, [data, roleFilter, filter, search]);

  const sm = data?.summary || { total: 0, activeNow: 0, usedAppOnDate: 0, neverLoggedIn: 0 };
  const dayWord = isToday ? 'today' : new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  // Portal to <body> above the sidebar (z 10000/10001), like the other dashboard modals.
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 10002, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '24px 12px', overflowY: 'auto' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#f8fafc', borderRadius: '18px', width: '100%', maxWidth: '1040px', boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 20px', borderBottom: '1px solid #eef0f3', background: 'white', borderRadius: '18px 18px 0 0', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ fontSize: '17px', fontWeight: 800, color: '#111827' }}>Staff Activity</div>
            <div style={{ fontSize: '12.5px', color: '#6b7280' }}>{restaurantName || ''} · who is using the app, and who logged in</div>
          </div>
          <input
            type="date" value={date} max={localDate()}
            onChange={(e) => e.target.value && setDate(e.target.value)}
            style={{ padding: '8px 10px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '13px' }}
          />
          <button onClick={() => load()} title="Refresh" style={{ padding: '9px 11px', borderRadius: '10px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer' }}>
            {loading ? <FaSpinner className="animate-spin" size={13} /> : <FaSyncAlt size={13} />}
          </button>
          <button onClick={onClose} title="Close" style={{ padding: '9px 11px', borderRadius: '10px', border: 'none', background: '#f3f4f6', cursor: 'pointer' }}>
            <FaTimes size={13} />
          </button>
        </div>

        <div style={{ padding: '16px 20px 22px' }}>
          {error && <div style={{ marginBottom: '12px', padding: '10px 14px', borderRadius: '12px', background: '#fef2f2', color: '#b91c1c', fontSize: '13px' }}>{error}</div>}

          {loading && !data ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}><FaSpinner className="animate-spin" /> Loading…</div>
          ) : data && (
            <>
              {/* Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px', marginBottom: '14px' }}>
                {isToday && (
                  <div style={{ ...card, borderColor: '#bbf7d0' }}>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#15803d' }}>ACTIVE NOW</div>
                    <div style={{ fontSize: '26px', fontWeight: 800, color: '#15803d' }}>{sm.activeNow}</div>
                    <div style={{ fontSize: '11.5px', color: '#6b7280' }}>used the app in the last {data.activeWindowMinutes} min</div>
                  </div>
                )}
                <div style={card}>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#1d4ed8' }}>USED THE APP {dayWord.toUpperCase()}</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#1d4ed8' }}>{sm.usedAppOnDate}</div>
                  <div style={{ fontSize: '11.5px', color: '#6b7280' }}>logged in or active {dayWord}</div>
                </div>
                <div style={card}>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#374151' }}>ACTIVE STAFF</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#111827' }}>{sm.total}</div>
                  <div style={{ fontSize: '11.5px', color: '#6b7280' }}>{Math.max(0, sm.total - sm.usedAppOnDate)} did not use the app {dayWord}</div>
                </div>
                <div style={card}>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#b45309' }}>NEVER LOGGED IN</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#b45309' }}>{sm.neverLoggedIn}</div>
                  <div style={{ fontSize: '11.5px', color: '#6b7280' }}>accounts not used yet</div>
                </div>
              </div>

              {/* By role */}
              <div style={{ ...card, padding: 0, marginBottom: '14px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}>
                  <thead>
                    <tr>
                      <th style={th}>Role</th><th style={th}>Staff</th>
                      {isToday && <th style={th}>Active now</th>}
                      <th style={th}>Used app {dayWord}</th><th style={th}>Never logged in</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.roles || []).map((r) => (
                      <tr key={r.role} onClick={() => setRoleFilter(roleFilter === r.role ? '' : r.role)}
                        style={{ cursor: 'pointer', background: roleFilter === r.role ? '#eff6ff' : 'white' }}>
                        <td style={{ ...td, fontWeight: 700 }}>{titleCase(r.role)}</td>
                        <td style={td}>{r.total}</td>
                        {isToday && <td style={{ ...td, color: r.activeNow ? '#15803d' : '#9ca3af', fontWeight: 700 }}>{r.activeNow}</td>}
                        <td style={{ ...td, color: '#1d4ed8', fontWeight: 700 }}>{r.usedAppOnDate}</td>
                        <td style={{ ...td, color: r.neverLoggedIn ? '#b45309' : '#9ca3af' }}>{r.neverLoggedIn}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '10px' }}>
                {FILTERS.filter((f) => isToday || f.key !== 'active').map((f) => (
                  <button key={f.key} onClick={() => setFilter(f.key)}
                    style={{ padding: '6px 12px', borderRadius: '999px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer',
                      border: '1px solid ' + (filter === f.key ? '#111827' : '#e5e7eb'),
                      background: filter === f.key ? '#111827' : 'white', color: filter === f.key ? 'white' : '#374151' }}>
                    {f.label}
                  </button>
                ))}
                {roleFilter && (
                  <button onClick={() => setRoleFilter('')}
                    style={{ padding: '6px 12px', borderRadius: '999px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8' }}>
                    {titleCase(roleFilter)} ✕
                  </button>
                )}
                <div style={{ marginLeft: 'auto', position: 'relative' }}>
                  <FaSearch size={11} style={{ position: 'absolute', left: '10px', top: '10px', color: '#9ca3af' }} />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search staff"
                    style={{ padding: '7px 10px 7px 28px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '13px', width: '170px' }} />
                </div>
              </div>

              {/* Staff list */}
              <div style={{ ...card, padding: 0, marginBottom: '14px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '680px' }}>
                  <thead>
                    <tr>
                      <th style={th}>Staff</th><th style={th}>Role</th><th style={th}>Last active</th>
                      <th style={th}>App</th><th style={th}>Last login</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.length === 0 ? (
                      <tr><td colSpan={5} style={{ ...td, textAlign: 'center', color: '#9ca3af', padding: '24px' }}>No staff match this filter.</td></tr>
                    ) : staff.map((m) => (
                      <tr key={m.id} style={{ opacity: m.status === 'inactive' ? 0.5 : 1 }}>
                        <td style={{ ...td, fontWeight: 600 }}>
                          <FaCircle size={8} style={{ marginRight: '8px', color: m.activeNow ? '#22c55e' : (m.usedAppOnDate ? '#93c5fd' : '#e5e7eb') }} />
                          {m.name}{m.status === 'inactive' ? ' (inactive)' : ''}
                        </td>
                        <td style={td}>{titleCase(m.role)}</td>
                        <td style={{ ...td, color: m.activeNow ? '#15803d' : '#374151', fontWeight: m.activeNow ? 700 : 400 }}>
                          {m.activeNow ? 'Active now' : ago(m.lastSeenAt)}
                        </td>
                        <td style={td}>{platformLabel(m.lastSeenPlatform || m.lastLoginPlatform)}</td>
                        <td style={td}>{m.lastLogin ? `${dateTimeOf(m.lastLogin)} · ${ago(m.lastLogin)}` : <span style={{ color: '#b45309' }}>Never</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Login history */}
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#111827', margin: '4px 0 8px' }}>
                Logins on {dayWord} <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>({(data.logins || []).length})</span>
              </div>
              <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }}>
                  <thead>
                    <tr><th style={th}>Time</th><th style={th}>Staff</th><th style={th}>Role</th><th style={th}>How</th><th style={th}>App</th></tr>
                  </thead>
                  <tbody>
                    {(data.logins || []).length === 0 ? (
                      <tr><td colSpan={5} style={{ ...td, textAlign: 'center', color: '#9ca3af', padding: '22px' }}>
                        No logins recorded {dayWord}. Staff who stay logged in show under &quot;Last active&quot; instead.
                      </td></tr>
                    ) : data.logins.map((l, i) => (
                      <tr key={`${l.userId}-${l.at}-${i}`}>
                        <td style={td}>{timeOf(l.at)}</td>
                        <td style={{ ...td, fontWeight: 600 }}>{l.name}</td>
                        <td style={td}>{titleCase(l.role)}</td>
                        <td style={td}>{METHOD_LABEL[l.method] || l.method || '—'}</td>
                        <td style={td}>{platformLabel(l.platform)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ fontSize: '11.5px', color: '#9ca3af', marginTop: '10px' }}>
                Login history and &quot;last active&quot; are recorded from 29 Sep 2026. Staff stay logged in on their phones, so
                &quot;Last active&quot; shows who is really using the app; &quot;Last login&quot; is when they last signed in.
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

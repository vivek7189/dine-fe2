'use client';

// Compact "Served by" chip for the POS order panel. Counter logins (owner / manager / cashier)
// pick the waiter a counter order's sales go to; the choice is remembered on this terminal
// (lib/servedBy) and sent with each new order. Hidden for other roles and customer pages.

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import apiClient from '../lib/api';
import { t } from '../lib/i18n';
import { COUNTER_ROLES, SERVED_BY_EVENT, currentUserRole, getServedBy, setServedBy } from '../lib/servedBy';

const tr = (key, fallback) => { const v = t(key); return v && v !== key ? v : fallback; };

// Floor staff first in the list; everyone else after.
const FLOOR_ROLES = ['waiter', 'captain', 'all rounder', 'all-rounder', 'server', 'steward', 'takeaway leader', 'parcel'];
const rank = (role) => { const i = FLOOR_ROLES.indexOf(String(role || '').toLowerCase()); return i === -1 ? FLOOR_ROLES.length : i; };

export default function ServedByPicker({ restaurantId, billingMode = false, isMobile = false }) {
  const [role, setRole] = useState('');
  const [chosen, setChosen] = useState(null);
  const [open, setOpen] = useState(false);
  const [staff, setStaff] = useState(null); // null = not loaded
  const [q, setQ] = useState('');
  const boxRef = useRef(null);
  const menuRef = useRef(null);
  const [pos, setPos] = useState(null); // fixed position of the menu (the order panel header clips overflow)

  useEffect(() => { setRole(currentUserRole()); }, []);
  useEffect(() => {
    setChosen(getServedBy(restaurantId));
    const onChange = (e) => { if (!e?.detail?.restaurantId || e.detail.restaurantId === restaurantId) setChosen(getServedBy(restaurantId)); };
    window.addEventListener(SERVED_BY_EVENT, onChange);
    return () => window.removeEventListener(SERVED_BY_EVENT, onChange);
  }, [restaurantId]);

  // Load the staff list the first time the menu opens.
  useEffect(() => {
    if (!open || staff !== null || !restaurantId) return;
    apiClient.getWaiters(restaurantId)
      .then((res) => setStaff(Array.isArray(res?.waiters) ? res.waiters.filter((s) => s && s.id && s.name) : []))
      .catch(() => setStaff([]));
  }, [open, staff, restaurantId]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (boxRef.current && boxRef.current.contains(e.target)) return;
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('touchstart', onDown); };
  }, [open]);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (staff || [])
      .filter((s) => !term || String(s.name).toLowerCase().includes(term) || String(s.role || '').toLowerCase().includes(term))
      .sort((a, b) => rank(a.role) - rank(b.role) || String(a.name).localeCompare(String(b.name)));
  }, [staff, q]);

  if (!restaurantId || !COUNTER_ROLES.has(role)) return null;

  const pick = (s) => { setServedBy(restaurantId, s ? { id: s.id, name: s.name } : null); setOpen(false); setQ(''); };
  const label = chosen ? chosen.name : tr('servedBy.none', 'No waiter');

  const chipStyle = {
    display: 'flex', alignItems: 'center', gap: 4, maxWidth: isMobile ? 110 : 160,
    padding: isMobile ? '4px 6px' : '6px 10px', borderRadius: isMobile ? 4 : 6, cursor: 'pointer',
    fontSize: isMobile ? 9 : 10, fontWeight: 700, whiteSpace: 'nowrap',
    background: billingMode ? (chosen ? '#ecfdf5' : 'transparent') : (chosen ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.1)'),
    color: billingMode ? (chosen ? '#047857' : '#334155') : 'white',
    border: billingMode ? `1px solid ${chosen ? '#6ee7b7' : '#cbd5e1'}` : `1px ${chosen ? 'solid' : 'dashed'} rgba(255,255,255,${chosen ? 0.8 : 0.45})`,
  };

  return (
    <div ref={boxRef} style={{ position: 'relative', flexShrink: 0 }}>
      <button type="button" onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const width = 240;
        setPos({ top: r.bottom + 6, left: Math.max(8, Math.min(r.right - width, window.innerWidth - width - 8)) });
        setOpen((v) => !v);
      }} style={chipStyle}
        title={`${tr('servedBy.label', 'Served by')}: ${label} — ${tr('servedBy.hint', 'Remembered on this device. Sales go to this person in Staff Sales.')}`}>
        <span aria-hidden>👤</span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
      </button>
      {open && pos && typeof document !== 'undefined' && createPortal(
        <div ref={menuRef} style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 100000, width: 240, background: 'white', color: '#111827',
          border: '1px solid #e5e7eb', borderRadius: 10, boxShadow: '0 10px 30px rgba(0,0,0,0.18)', overflow: 'hidden' }}>
          <div style={{ padding: '8px 10px 4px', fontSize: 11, fontWeight: 700, color: '#374151' }}>{tr('servedBy.label', 'Served by')}</div>
          <div style={{ padding: '0 10px 6px', fontSize: 10, color: '#6b7280' }}>{tr('servedBy.hint', 'Remembered on this device. Sales go to this person in Staff Sales.')}</div>
          <div style={{ padding: '0 8px 6px' }}>
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr('servedBy.search', 'Search staff…')}
              style={{ width: '100%', padding: '6px 8px', fontSize: 12, border: '1px solid #d1d5db', borderRadius: 6, outline: 'none' }} />
          </div>
          <div style={{ maxHeight: 240, overflowY: 'auto' }}>
            {chosen && (
              <button type="button" onClick={() => pick(null)}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 12px', fontSize: 12, color: '#b91c1c', background: 'white', border: 'none', borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}>
                ✕ {tr('servedBy.clear', 'Clear — counter sale')}
              </button>
            )}
            {staff === null && <div style={{ padding: '10px 12px', fontSize: 12, color: '#6b7280' }}>…</div>}
            {staff !== null && list.length === 0 && <div style={{ padding: '10px 12px', fontSize: 12, color: '#6b7280' }}>{tr('servedBy.empty', 'No staff found')}</div>}
            {list.map((s) => {
              const active = chosen && String(chosen.id) === String(s.id);
              return (
                <button type="button" key={s.id} onClick={() => pick(s)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', padding: '7px 12px', fontSize: 12,
                    background: active ? '#ecfdf5' : 'white', border: 'none', cursor: 'pointer', fontWeight: active ? 700 : 500, color: '#111827' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                  <span style={{ fontSize: 10, color: '#9ca3af', textTransform: 'capitalize', flexShrink: 0 }}>{s.role || ''}</span>
                </button>
              );
            })}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

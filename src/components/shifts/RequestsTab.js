'use client';

// Staff requests waiting for the owner / a manager: open shifts someone asked for, and shift swaps
// a colleague already accepted. Approving updates the rota and tells the staff involved.
import { useState, useEffect, useCallback } from 'react';
import { FaCheck, FaTimes, FaSpinner, FaUserPlus, FaExchangeAlt, FaInbox } from 'react-icons/fa';
import apiClient from '../../lib/api';
import { formatDateISO, formatTime, titleCase } from './constants';
import { useCurrency } from '../../contexts/CurrencyContext';

const card = { backgroundColor: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: '16px' };
const btn = (bg, color) => ({ padding: '7px 12px', borderRadius: '9px', border: 'none', background: bg, color, fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' });
const when = (s) => `${new Date(s.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} · ${s.shiftName ? `${s.shiftName} ` : ''}${formatTime(s.startTime)}–${formatTime(s.endTime)}`;

export default function RequestsTab({ restaurantId, onChanged, isMobile }) {
  const [data, setData] = useState(null);
  const { getCurrencySymbol } = useCurrency();
  const currencySymbol = getCurrencySymbol() || '';
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true); setError('');
    try {
      const today = formatDateISO(new Date());
      const end = new Date(); end.setDate(end.getDate() + 90);
      const r = await apiClient.getMyShifts(restaurantId, today, formatDateISO(end));
      setData(r?.approvals || { claims: [], swaps: [] });
    } catch (e) { setError(e?.message || 'Failed to load requests'); }
    finally { setLoading(false); }
  }, [restaurantId]);

  useEffect(() => { load(); }, [load]);

  const act = async (key, fn) => {
    setBusy(key); setError('');
    try { await fn(); await load(); if (onChanged) onChanged(); }
    catch (e) { setError(e?.message || 'Action failed'); }
    finally { setBusy(null); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}><FaSpinner className="animate-spin" /> Loading requests…</div>;

  const claims = (data?.claims || []);
  const swaps = (data?.swaps || []);

  return (
    <div style={{ maxWidth: '860px' }}>
      {error && <div style={{ marginBottom: '12px', padding: '10px 14px', borderRadius: '12px', background: '#fef2f2', color: '#b91c1c', fontSize: '13px' }}>{error}</div>}

      <div style={card}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 700, color: '#111827' }}>
          <FaUserPlus size={14} color="#2563eb" /> Open shifts requested ({claims.reduce((n, s) => n + (s.claims || []).filter(c => c.status === 'pending').length, 0)})
        </div>
        {claims.length === 0 ? (
          <div style={{ padding: '22px 18px', fontSize: '13px', color: '#9ca3af' }}>No requests. Add an <b>open shift</b> on the Schedule and staff of that role can ask for it from their app.</div>
        ) : claims.map(s => (
          <div key={s.id} style={{ padding: '12px 18px', borderBottom: '1px solid #f9fafb' }}>
            <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#111827' }}>{when(s)} <span style={{ color: '#6b7280', fontWeight: 500 }}>· {titleCase(s.role)}</span>
              {Number(s.incentive?.amount) > 0 && <span style={{ marginLeft: '6px', fontSize: '11.5px', fontWeight: 700, color: '#b45309', background: '#fef3c7', padding: '1px 7px', borderRadius: '8px' }}>+{currencySymbol}{s.incentive.amount} incentive</span>}
            </div>
            {(s.claims || []).filter(c => c.status === 'pending').map(c => (
              <div key={c.staffId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', color: '#374151' }}>{c.staffName || 'Staff member'} wants this shift</span>
                <span style={{ display: 'flex', gap: '6px' }}>
                  <button disabled={!!busy} style={btn('#dcfce7', '#166534')} onClick={() => act(`c-${s.id}-${c.staffId}`, () => apiClient.decideShiftClaim(restaurantId, s.id, c.staffId, true))}>
                    {busy === `c-${s.id}-${c.staffId}` ? <FaSpinner className="animate-spin" size={11} /> : <FaCheck size={11} />} Give it to {c.staffName?.split(' ')[0] || 'them'}
                  </button>
                  <button disabled={!!busy} style={btn('#fef2f2', '#991b1b')} onClick={() => act(`r-${s.id}-${c.staffId}`, () => apiClient.decideShiftClaim(restaurantId, s.id, c.staffId, false))}><FaTimes size={11} /> Decline</button>
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={card}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 700, color: '#111827' }}>
          <FaExchangeAlt size={13} color="#7c3aed" /> Shift swaps to approve ({swaps.length})
        </div>
        {swaps.length === 0 ? (
          <div style={{ padding: '22px 18px', fontSize: '13px', color: '#9ca3af' }}>No swaps waiting. Staff ask a colleague from their app; once the colleague accepts, it shows here.</div>
        ) : swaps.map(s => (
          <div key={s.id} style={{ padding: '12px 18px', borderBottom: '1px solid #f9fafb', display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#111827' }}>{when(s)}</div>
              <div style={{ fontSize: '12.5px', color: '#6b7280' }}>{s.swapRequest.fromName} → <b style={{ color: '#374151' }}>{s.swapRequest.toName}</b> (both agreed)</div>
            </div>
            <span style={{ display: 'flex', gap: '6px' }}>
              <button disabled={!!busy} style={btn('#dcfce7', '#166534')} onClick={() => act(`sa-${s.id}`, () => apiClient.decideShiftSwap(restaurantId, s.id, true))}>
                {busy === `sa-${s.id}` ? <FaSpinner className="animate-spin" size={11} /> : <FaCheck size={11} />} Approve
              </button>
              <button disabled={!!busy} style={btn('#fef2f2', '#991b1b')} onClick={() => act(`sr-${s.id}`, () => apiClient.decideShiftSwap(restaurantId, s.id, false))}><FaTimes size={11} /> Reject</button>
            </span>
          </div>
        ))}
      </div>

      <div style={{ fontSize: '12.5px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <FaInbox size={12} /> Leave requests are handled in <b>Attendance → Leave</b>.
      </div>
    </div>
  );
}

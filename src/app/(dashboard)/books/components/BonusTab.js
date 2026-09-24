'use client';

import { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaGift, FaTimes, FaTrash } from 'react-icons/fa';

/**
 * BonusTab — record staff bonuses/incentives; payroll adds them to net pay.
 * Self-contained (fetches its own data), mirrors AdvancesTab.
 */
export default function BonusTab({ restaurantId, apiClient, staffList = [], isMobile, formatCurrency }) {
  const [bonuses, setBonuses] = useState([]);
  const [summary, setSummary] = useState({ count: 0, pending: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ staffId: '', amount: '', bonusType: 'incentive', reason: '' });

  const fmt = (n) => (formatCurrency ? formatCurrency(n) : `₹${Number(n || 0).toLocaleString()}`);

  const load = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true); setError('');
    try {
      const res = await apiClient.getStaffBonuses(restaurantId);
      setBonuses(res.bonuses || []);
      setSummary(res.summary || { count: 0, pending: 0 });
    } catch (e) { setError(e?.message || 'Could not load bonuses.'); }
    finally { setLoading(false); }
  }, [restaurantId, apiClient]);

  useEffect(() => { load(); }, [load]);

  const staffOf = (id) => (staffList || []).find(x => (x.id || x.staffId) === id);

  const submit = async () => {
    if (!form.staffId || !(Number(form.amount) > 0)) { setError('Pick a staff member and enter a positive amount.'); return; }
    setSaving(true); setError('');
    try {
      const s = staffOf(form.staffId);
      await apiClient.createStaffBonus(restaurantId, {
        staffId: form.staffId,
        staffName: s ? (s.name || s.staffName) : '',
        role: s ? (s.role || null) : null,
        amount: Number(form.amount),
        bonusType: form.bonusType,
        reason: form.reason || null,
      });
      setForm({ staffId: '', amount: '', bonusType: 'incentive', reason: '' });
      setShowForm(false);
      await load();
    } catch (e) { setError(e?.message || 'Could not save the bonus.'); }
    finally { setSaving(false); }
  };

  const act = async (bn, patch, confirmMsg) => {
    if (confirmMsg && typeof window !== 'undefined' && !window.confirm(confirmMsg)) return;
    try {
      if (patch === 'delete') await apiClient.deleteStaffBonus(restaurantId, bn.id);
      else await apiClient.updateStaffBonus(restaurantId, bn.id, patch);
      await load();
    } catch (e) { setError(e?.message || 'Action failed.'); }
  };

  const STATUS_STYLE = {
    approved:  { bg: '#ecfdf5', color: '#047857', label: 'Pending payout' },
    paid:      { bg: '#eff6ff', color: '#1d4ed8', label: 'Paid' },
    cancelled: { bg: '#f3f4f6', color: '#6b7280', label: 'Cancelled' },
    pending:   { bg: '#fffbeb', color: '#b45309', label: 'Pending' },
  };
  const TYPES = [
    { id: 'incentive', name: 'Incentive' },
    { id: 'performance', name: 'Performance' },
    { id: 'festival', name: 'Festival' },
    { id: 'other', name: 'Other' },
  ];

  return (
    <div style={{ padding: isMobile ? '8px' : '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaGift /></div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#111827' }}>Staff Bonuses</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Added to net pay on the next payroll run.</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>PENDING PAYOUT</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1d4ed8' }}>{fmt(summary.pending)}</div>
          </div>
          <button onClick={() => setShowForm(v => !v)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            <FaPlus size={11} /> New Bonus
          </button>
        </div>
      </div>

      {error && <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '8px 12px', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{error}</div>}

      {showForm && (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, marginBottom: 16, background: '#fafafa' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Staff member
              <select value={form.staffId} onChange={e => setForm({ ...form, staffId: e.target.value })} style={inp}>
                <option value="">Select staff…</option>
                {(staffList || []).map(s => { const id = s.id || s.staffId; return <option key={id} value={id}>{s.name || s.staffName}{s.role ? ` · ${s.role}` : ''}</option>; })}
              </select>
            </label>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Bonus amount
              <input type="number" min="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="e.g. 2000" style={inp} />
            </label>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Type
              <select value={form.bonusType} onChange={e => setForm({ ...form, bonusType: e.target.value })} style={inp}>
                {TYPES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </label>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Reason <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span>
              <input value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="e.g. Diwali, top performer" style={inp} />
            </label>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
            <button onClick={() => setShowForm(false)} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            <button onClick={submit} disabled={saving} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: saving ? '#93c5fd' : '#2563eb', color: '#fff', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'Saving…' : 'Record bonus'}</button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ padding: 30, textAlign: 'center', color: '#9ca3af' }}>Loading…</div>
      ) : bonuses.length === 0 ? (
        <div style={{ padding: 30, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>No bonuses recorded yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {bonuses.map(bn => {
            const ss = STATUS_STYLE[bn.status] || STATUS_STYLE.approved;
            const s = staffOf(bn.staffId);
            const typeName = (TYPES.find(t => t.id === bn.bonusType) || {}).name || bn.bonusType || 'Bonus';
            return (
              <div key={bn.id} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ minWidth: 160 }}>
                  <div style={{ fontWeight: 700, color: '#111827', fontSize: 14 }}>{bn.staffName || (s && (s.name || s.staffName)) || 'Staff'}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>{typeName}{bn.reason ? ` · ${bn.reason}` : ''}{bn.appliedMonth ? ` · paid ${bn.appliedMonth}` : ''}</div>
                </div>
                <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'right' }}><div style={{ fontSize: 10, color: '#9ca3af' }}>BONUS</div><div style={{ fontWeight: 800, color: '#1d4ed8' }}>{fmt(bn.amount)}</div></div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: ss.bg, color: ss.color }}>{ss.label}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {(bn.status === 'approved' || bn.status === 'pending') && (
                      <button title="Cancel" onClick={() => act(bn, { status: 'cancelled' }, 'Cancel this bonus? It will not be paid.')} style={iconBtn('#6b7280')}><FaTimes size={11} /></button>
                    )}
                    <button title="Delete" onClick={() => act(bn, 'delete', 'Delete this bonus record permanently?')} style={iconBtn('#b91c1c')}><FaTrash size={10} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const inp = { width: '100%', marginTop: 4, padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, fontWeight: 400, color: '#111827', background: '#fff', outline: 'none' };
const iconBtn = (color) => ({ width: 28, height: 28, borderRadius: 7, border: '1px solid #e5e7eb', background: '#fff', color, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' });

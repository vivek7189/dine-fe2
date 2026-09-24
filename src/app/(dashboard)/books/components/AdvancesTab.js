'use client';

import { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaMoneyBillWave, FaCheck, FaTimes, FaTrash } from 'react-icons/fa';

/**
 * AdvancesTab — record staff cash advances and let payroll auto-recover them.
 * Self-contained: fetches its own data via apiClient (same pattern as GST/Ledger tabs).
 */
export default function AdvancesTab({ restaurantId, apiClient, staffList = [], isMobile, formatCurrency }) {
  const [advances, setAdvances] = useState([]);
  const [summary, setSummary] = useState({ count: 0, outstanding: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ staffId: '', amount: '', reason: '', recoveryPerMonth: '', paymentMethod: 'cash' });

  const fmt = (n) => (formatCurrency ? formatCurrency(n) : `₹${Number(n || 0).toLocaleString()}`);

  const load = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true); setError('');
    try {
      const res = await apiClient.getStaffAdvances(restaurantId);
      setAdvances(res.advances || []);
      setSummary(res.summary || { count: 0, outstanding: 0 });
    } catch (e) {
      setError(e?.message || 'Could not load advances.');
    } finally { setLoading(false); }
  }, [restaurantId, apiClient]);

  useEffect(() => { load(); }, [load]);

  const staffName = (id) => {
    const s = (staffList || []).find(x => (x.id || x.staffId) === id);
    return s ? (s.name || s.staffName || 'Staff') : '';
  };
  const staffRole = (id) => {
    const s = (staffList || []).find(x => (x.id || x.staffId) === id);
    return s ? (s.role || null) : null;
  };

  const submit = async () => {
    if (!form.staffId || !(Number(form.amount) > 0)) { setError('Pick a staff member and enter a positive amount.'); return; }
    setSaving(true); setError('');
    try {
      await apiClient.createStaffAdvance(restaurantId, {
        staffId: form.staffId,
        staffName: staffName(form.staffId),
        role: staffRole(form.staffId),
        amount: Number(form.amount),
        reason: form.reason || null,
        recoveryPerMonth: form.recoveryPerMonth !== '' ? Number(form.recoveryPerMonth) : null,
        paymentMethod: form.paymentMethod,
      });
      setForm({ staffId: '', amount: '', reason: '', recoveryPerMonth: '', paymentMethod: 'cash' });
      setShowForm(false);
      await load();
    } catch (e) { setError(e?.message || 'Could not save the advance.'); }
    finally { setSaving(false); }
  };

  const act = async (adv, patch, confirmMsg) => {
    if (confirmMsg && typeof window !== 'undefined' && !window.confirm(confirmMsg)) return;
    try {
      if (patch === 'delete') await apiClient.deleteStaffAdvance(restaurantId, adv.id);
      else await apiClient.updateStaffAdvance(restaurantId, adv.id, patch);
      await load();
    } catch (e) { setError(e?.message || 'Action failed.'); }
  };

  const STATUS_STYLE = {
    approved:  { bg: '#ecfdf5', color: '#047857', label: 'Recovering' },
    settled:   { bg: '#eff6ff', color: '#1d4ed8', label: 'Settled' },
    cancelled: { bg: '#f3f4f6', color: '#6b7280', label: 'Cancelled' },
    pending:   { bg: '#fffbeb', color: '#b45309', label: 'Pending' },
    rejected:  { bg: '#fef2f2', color: '#b91c1c', label: 'Rejected' },
  };

  return (
    <div style={{ padding: isMobile ? '8px' : '4px' }}>
      {/* Header + summary */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fff7ed', color: '#c2410c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaMoneyBillWave />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#111827' }}>Staff Advances</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Recorded advances are auto-recovered from payroll.</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>OUTSTANDING</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#c2410c' }}>{fmt(summary.outstanding)}</div>
          </div>
          <button onClick={() => setShowForm(v => !v)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, border: 'none', background: '#dc2626', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            <FaPlus size={11} /> New Advance
          </button>
        </div>
      </div>

      {error && <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '8px 12px', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{error}</div>}

      {/* Add form */}
      {showForm && (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, marginBottom: 16, background: '#fafafa' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Staff member
              <select value={form.staffId} onChange={e => setForm({ ...form, staffId: e.target.value })} style={inp}>
                <option value="">Select staff…</option>
                {(staffList || []).map(s => {
                  const id = s.id || s.staffId;
                  return <option key={id} value={id}>{s.name || s.staffName}{s.role ? ` · ${s.role}` : ''}</option>;
                })}
              </select>
            </label>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Advance amount
              <input type="number" min="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="e.g. 5000" style={inp} />
            </label>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Recover per month <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span>
              <input type="number" min="0" value={form.recoveryPerMonth} onChange={e => setForm({ ...form, recoveryPerMonth: e.target.value })} placeholder="blank = recover in full next payroll" style={inp} />
            </label>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Reason <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span>
              <input value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="e.g. medical, festival" style={inp} />
            </label>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
            <button onClick={() => setShowForm(false)} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            <button onClick={submit} disabled={saving} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: saving ? '#fca5a5' : '#dc2626', color: '#fff', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'Saving…' : 'Record advance'}</button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={{ padding: 30, textAlign: 'center', color: '#9ca3af' }}>Loading…</div>
      ) : advances.length === 0 ? (
        <div style={{ padding: 30, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>No advances recorded yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {advances.map(a => {
            const bal = Math.max(0, (a.amount || 0) - (a.amountRecovered || 0));
            const ss = STATUS_STYLE[a.status] || STATUS_STYLE.approved;
            return (
              <div key={a.id} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ minWidth: 160 }}>
                  <div style={{ fontWeight: 700, color: '#111827', fontSize: 14 }}>{a.staffName || staffName(a.staffId) || 'Staff'}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>{a.reason || '—'}{a.recoveryPerMonth ? ` · ${fmt(a.recoveryPerMonth)}/mo` : ' · full next payroll'}</div>
                </div>
                <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'right' }}><div style={{ fontSize: 10, color: '#9ca3af' }}>ADVANCE</div><div style={{ fontWeight: 700 }}>{fmt(a.amount)}</div></div>
                  <div style={{ textAlign: 'right' }}><div style={{ fontSize: 10, color: '#9ca3af' }}>RECOVERED</div><div style={{ fontWeight: 700, color: '#047857' }}>{fmt(a.amountRecovered || 0)}</div></div>
                  <div style={{ textAlign: 'right' }}><div style={{ fontSize: 10, color: '#9ca3af' }}>BALANCE</div><div style={{ fontWeight: 800, color: '#c2410c' }}>{fmt(bal)}</div></div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: ss.bg, color: ss.color }}>{ss.label}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {(a.status === 'approved' || a.status === 'pending') && (
                      <button title="Mark settled" onClick={() => act(a, { status: 'settled' }, 'Mark this advance as fully settled?')} style={iconBtn('#047857')}><FaCheck size={11} /></button>
                    )}
                    {(a.status === 'approved' || a.status === 'pending') && (
                      <button title="Cancel" onClick={() => act(a, { status: 'cancelled' }, 'Cancel this advance? It will stop recovering.')} style={iconBtn('#6b7280')}><FaTimes size={11} /></button>
                    )}
                    <button title="Delete" onClick={() => act(a, 'delete', 'Delete this advance record permanently?')} style={iconBtn('#b91c1c')}><FaTrash size={10} /></button>
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

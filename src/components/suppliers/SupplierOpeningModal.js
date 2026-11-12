'use client';

// Opening balance of a supplier: what was owed on the day you started (we owe them, or they owe us /
// paid ahead). "We owe" shows on the statement as the first bill and is paid like any bill; "they
// owe us" is an advance that "Use advance" sets against new bills. 0 removes it.
// `current` = the saved opening balance (from the statement); left out, it is loaded here.
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaSave } from 'react-icons/fa';
import apiClient from '../../lib/api';
import { useCurrency } from '../../contexts/CurrencyContext';

const inputStyle = {
  width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e8ecf1',
  fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff', color: '#1f2937',
};
const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '12px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' };
const todayLocal = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const dayOf = (iso) => { const d = iso ? new Date(iso) : null; if (!d || isNaN(d)) return ''; d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };

// Direction + amount + date fields, shared with the Add Supplier form.
export function OpeningFields({ value, onChange, compact = false }) {
  const set = (k, v) => onChange({ ...value, [k]: v });
  const choice = (dir, label) => {
    const on = value.direction === dir;
    return (
      <button type="button" onClick={() => set('direction', dir)}
        style={{ flex: 1, padding: '9px 10px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: `1.5px solid ${on ? '#059669' : '#e5e7eb'}`, background: on ? '#ecfdf5' : '#fff', color: on ? '#065f46' : '#374151' }}>
        {label}
      </button>
    );
  };
  return (
    <div style={{ display: 'grid', gap: compact ? 10 : 14 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {choice('owe', 'We owe them')}
        {choice('advance', 'They owe us / paid ahead')}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={labelStyle}>Opening balance</label>
          <input data-testid="opening-amount" type="number" min="0" step="0.01" inputMode="decimal" value={value.amount} placeholder="0"
            onChange={e => set('amount', e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>As on date</label>
          <input data-testid="opening-date" type="date" value={value.asOf} max={todayLocal()} onChange={e => set('asOf', e.target.value)} style={inputStyle} />
        </div>
      </div>
    </div>
  );
}

export const emptyOpening = () => ({ direction: 'owe', amount: '', asOf: todayLocal(), note: '' });

export default function SupplierOpeningModal({ restaurantId, supplier, current: given, onClose, onSaved }) {
  const { formatCurrency } = useCurrency();
  const supplierId = supplier?.id || supplier?.supplierId;
  const [form, setForm] = useState(emptyOpening);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [current, setCurrent] = useState(given === undefined ? undefined : given);

  useEffect(() => {
    if (given !== undefined || !restaurantId || !supplierId) return undefined;
    let live = true;
    apiClient.getSupplierLedger(restaurantId, supplierId)
      .then(r => { if (live) setCurrent(r?.openingSet || null); })
      .catch(e => { if (live) { setCurrent(null); setErr(e.message || 'Could not load the supplier'); } });
    return () => { live = false; };
  }, [given, restaurantId, supplierId]);

  useEffect(() => {
    if (current) setForm({ direction: current.direction, amount: String(current.amount ?? ''), asOf: dayOf(current.asOf) || todayLocal(), note: current.note || '' });
  }, [current]);

  const save = async (remove = false) => {
    const amount = remove ? 0 : Math.round((Number(form.amount) || 0) * 100) / 100;
    if (!remove && (!(Number(form.amount) >= 0) || form.amount === '')) { setErr('Enter the opening balance'); return; }
    if (!remove && amount > 0 && !form.asOf) { setErr('Choose the date'); return; }
    setSaving(true); setErr('');
    try {
      const r = await apiClient.setSupplierOpeningBalance(restaurantId, supplierId, { amount, direction: form.direction, asOf: form.asOf, note: form.note });
      onSaved && onSaved(r.opening || null);
      onClose();
    } catch (e) { setErr(e.message || 'Could not save the opening balance'); }
    finally { setSaving(false); }
  };

  if (!supplier || typeof document === 'undefined') return null;
  const settled = Number(current?.settled) || 0;
  return createPortal(
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10003, padding: 12 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div data-testid="supplier-opening" style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Opening balance</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{supplier.name}</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', display: 'flex' }}><FaTimes size={13} /></button>
        </div>
        <div style={{ padding: 18, display: 'grid', gap: 14 }}>
          <div style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.5 }}>
            What was owed with this supplier on the day you started using DineOpen (from your old book). It shows as the first line of the statement.
          </div>
          {current === undefined ? <div style={{ color: '#9ca3af', fontSize: 13, padding: '12px 0' }}>Loading…</div> : <OpeningFields value={form} onChange={setForm} />}
          <div>
            <label style={labelStyle}>Note (optional)</label>
            <input value={form.note} maxLength={300} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="e.g. as per old ledger" style={inputStyle} />
          </div>
          {settled > 0 && (
            <div style={{ fontSize: 12, color: '#92400e', background: '#fffbeb', borderRadius: 8, padding: '8px 10px' }}>
              {formatCurrency(settled)} of it is already {current.direction === 'owe' ? 'paid' : 'used against bills'} — it can&apos;t go below that.
            </div>
          )}
          {err && <div style={{ color: '#b91c1c', fontSize: 13 }}>{err}</div>}
        </div>
        <div style={{ padding: '12px 18px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {current && settled <= 0 && (
            <button disabled={saving} onClick={() => save(true)} style={{ marginRight: 'auto', padding: '10px 14px', borderRadius: 10, border: '1px solid #fecaca', background: '#fff', color: '#b91c1c', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Remove</button>
          )}
          <button onClick={onClose} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          <button data-testid="opening-save" disabled={saving || current === undefined} onClick={() => save(false)} style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: '#059669', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, opacity: saving ? 0.6 : 1 }}>
            <FaSave size={12} /> {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

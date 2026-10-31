'use client';

// Pay a supplier: one payment set against one or more of their open bills (oldest first, or the
// bills the cashier picks), anything left over kept as an advance. Used from Books → Supplier Dues,
// the supplier statement and Inventory → Procurement → Suppliers.
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaSave, FaMoneyBillWave } from 'react-icons/fa';
import apiClient from '../../lib/api';
import { useCurrency } from '../../contexts/CurrencyContext';

const inputStyle = {
  width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e8ecf1',
  fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff', color: '#1f2937',
};
const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '12px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' };
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const fmtDay = (v) => { const d = v ? new Date(v) : null; return d && !isNaN(d) ? d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : ''; };
const todayLocal = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };

export function paymentMethods(cs = {}) {
  const ke = cs.countryCode === 'KE' || cs.currencyCode === 'KES';
  const india = cs.countryCode === 'IN' || cs.currencyCode === 'INR';
  return [
    ...(ke ? [{ value: 'mpesa', label: 'M-Pesa' }] : []),
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cash', label: 'Cash' },
    ...(india ? [{ value: 'upi', label: 'UPI' }] : []),
    { value: 'cheque', label: 'Cheque' },
    { value: 'card', label: 'Card' },
    ...(!ke ? [{ value: 'mpesa', label: 'M-Pesa' }] : []),
    { value: 'other', label: 'Other' },
  ];
}
export const methodLabel = (m) => ({ mpesa: 'M-Pesa', bank_transfer: 'Bank Transfer', cash: 'Cash', upi: 'UPI', cheque: 'Cheque', card: 'Card', other: 'Other' }[m] || m || '');

export default function SupplierPayModal({ restaurantId, supplier, preselectInvoiceId = null, onClose, onDone, formatCurrency }) {
  const { currencySettings, formatCurrency: fmtCtx } = useCurrency();
  const fmt = formatCurrency || fmtCtx;
  const methods = paymentMethods(currencySettings);
  const [bills, setBills] = useState(null);
  const [loadErr, setLoadErr] = useState('');
  const [mode, setMode] = useState(preselectInvoiceId ? 'pick' : 'auto'); // auto | pick | advance
  const [picked, setPicked] = useState({}); // invoiceId → amount string
  const [form, setForm] = useState({ amount: '', method: methods[0].value, date: todayLocal(), reference: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const supplierId = supplier?.id || supplier?.supplierId;

  useEffect(() => {
    if (!supplierId || !restaurantId) return;
    let live = true;
    apiClient.getSupplierLedger(restaurantId, supplierId).then(res => {
      if (!live) return;
      const open = (res?.lines || []).filter(l => l.type === 'bill' && (l.billBalance || 0) > 0.004)
        .map(l => ({ id: l.id, invoiceNumber: l.ref, at: l.at, total: l.debit, balance: l.billBalance, dueDate: l.dueDate }));
      setBills(open);
      if (preselectInvoiceId) {
        const b = open.find(x => x.id === preselectInvoiceId);
        if (b) { setPicked({ [b.id]: String(b.balance) }); setForm(f => ({ ...f, amount: String(b.balance) })); }
      } else {
        const due = r2(open.reduce((s, b) => s + b.balance, 0));
        if (due > 0) setForm(f => ({ ...f, amount: String(due) }));
      }
    }).catch(e => live && setLoadErr(e.message || 'Could not load bills'));
    return () => { live = false; };
  }, [restaurantId, supplierId, preselectInvoiceId]);

  const amount = r2(form.amount);
  const totalDue = r2((bills || []).reduce((s, b) => s + b.balance, 0));
  // What the server will do with the money, shown before saving.
  const plan = useMemo(() => {
    if (!bills) return { lines: [], used: 0 };
    if (mode === 'advance') return { lines: [], used: 0 };
    if (mode === 'pick') {
      const lines = bills.filter(b => picked[b.id] !== undefined).map(b => ({ ...b, pay: r2(picked[b.id]) })).filter(l => l.pay > 0);
      return { lines, used: r2(lines.reduce((s, l) => s + l.pay, 0)) };
    }
    let left = amount; const lines = [];
    for (const b of bills) { if (left <= 0.004) break; const pay = r2(Math.min(b.balance, left)); lines.push({ ...b, pay }); left = r2(left - pay); }
    return { lines, used: r2(lines.reduce((s, l) => s + l.pay, 0)) };
  }, [bills, mode, picked, amount]);
  const advance = r2(Math.max(0, amount - plan.used));
  const overPick = mode === 'pick' && plan.used > amount + 0.004;
  const badLine = mode === 'pick' && plan.lines.some(l => l.pay > l.balance + 0.004);

  const togglePick = (b) => {
    const n = { ...picked };
    if (n[b.id] !== undefined) delete n[b.id];
    else n[b.id] = String(b.balance);
    setPicked(n);
    const sum = r2(Object.values(n).reduce((s, v) => s + r2(v), 0));
    if (sum > 0) setForm(f => ({ ...f, amount: String(sum) }));
  };

  const submit = async () => {
    setErr('');
    if (!(amount > 0)) { setErr('Enter the amount paid'); return; }
    if (overPick) { setErr('The bill amounts add up to more than the payment'); return; }
    if (badLine) { setErr('A bill amount is more than what is left on that bill'); return; }
    if (mode === 'pick' && plan.lines.length === 0) { setErr('Tick at least one bill, or choose "Keep as advance"'); return; }
    setSaving(true);
    try {
      const body = { supplierId, amount, paymentDate: form.date, method: form.method, reference: form.reference, notes: form.notes };
      if (mode === 'advance') body.keepAsAdvance = true;
      if (mode === 'pick') body.allocations = plan.lines.map(l => ({ invoiceId: l.id, amount: l.pay }));
      const res = await apiClient.recordSupplierPayment(restaurantId, body);
      onDone && onDone(res?.payment);
      onClose();
    } catch (e) {
      setErr(e.message || 'Could not save the payment');
    } finally { setSaving(false); }
  };

  if (!supplier || typeof document === 'undefined') return null;

  const pill = (key, label) => (
    <button type="button" onClick={() => setMode(key)} style={{
      flex: 1, padding: '8px 6px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
      border: `1.5px solid ${mode === key ? '#059669' : '#e5e7eb'}`, background: mode === key ? '#ecfdf5' : '#fff', color: mode === key ? '#065f46' : '#4b5563',
    }}>{label}</button>
  );

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10003, padding: 12 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div data-testid="supplier-pay-modal" style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '520px', maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaMoneyBillWave size={14} /> Pay {supplier.name || supplier.supplierName}
          </h2>
          <button onClick={onClose} aria-label="Close" style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', cursor: 'pointer', padding: '7px', borderRadius: '8px', display: 'flex' }}><FaTimes size={13} /></button>
        </div>

        <div style={{ padding: '18px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 13, color: '#6b7280' }}>
            Unpaid bills: <strong style={{ color: '#111827' }}>{bills ? `${bills.length} · ${fmt(totalDue)}` : '…'}</strong>
          </div>
          {loadErr && <div style={{ color: '#b91c1c', fontSize: 13 }}>{loadErr}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Amount paid *</label>
              <input data-testid="pay-amount" type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Date</label>
              <input type="date" value={form.date} max={todayLocal()} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Paid by</label>
              <select data-testid="pay-method" value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                {methods.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Reference</label>
              <input value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} placeholder={form.method === 'mpesa' ? 'M-Pesa code' : form.method === 'cheque' ? 'Cheque no.' : 'Optional'} style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Set this payment against</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {pill('auto', 'Oldest bills first')}
              {pill('pick', 'Choose bills')}
              {pill('advance', 'Keep as advance')}
            </div>
          </div>

          {mode !== 'advance' && bills && bills.length > 0 && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
              {bills.map(b => {
                const line = plan.lines.find(l => l.id === b.id);
                return (
                  <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderBottom: '1px solid #f3f4f6', fontSize: 13 }}>
                    {mode === 'pick' && <input type="checkbox" checked={picked[b.id] !== undefined} onChange={() => togglePick(b)} aria-label={`Pay bill ${b.invoiceNumber}`} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: '#111827' }}>{b.invoiceNumber || 'Bill'}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{fmtDay(b.at)} · left {fmt(b.balance)}</div>
                    </div>
                    {mode === 'pick' && picked[b.id] !== undefined ? (
                      <input type="number" min="0" step="0.01" value={picked[b.id]} onChange={e => {
                        // the payment follows the bill amounts typed, so nothing turns into an advance unnoticed
                        const n = { ...picked, [b.id]: e.target.value };
                        setPicked(n);
                        const sum = r2(Object.values(n).reduce((s, v) => s + r2(v), 0));
                        setForm(f => ({ ...f, amount: sum > 0 ? String(sum) : '' }));
                      }}
                        style={{ ...inputStyle, width: 110, padding: '6px 8px', fontSize: 13, borderColor: r2(picked[b.id]) > b.balance + 0.004 ? '#ef4444' : '#e8ecf1' }} />
                    ) : (
                      <div style={{ fontWeight: 700, color: line ? '#059669' : '#d1d5db', minWidth: 80, textAlign: 'right' }}>{line ? fmt(line.pay) : '—'}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {mode !== 'advance' && bills && bills.length === 0 && (
            <div style={{ fontSize: 13, color: '#6b7280' }}>No unpaid bills — the whole amount will be kept as an advance for the next bill.</div>
          )}

          {amount > 0 && (
            <div style={{ background: '#f9fafb', borderRadius: 10, padding: '10px 12px', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Against bills</span><strong>{fmt(plan.used)}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Kept as advance</span><strong style={{ color: advance > 0 ? '#2563eb' : '#111827' }}>{fmt(advance)}</strong></div>
            </div>
          )}

          <div>
            <label style={labelStyle}>Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional" style={{ ...inputStyle, minHeight: 44, resize: 'vertical' }} />
          </div>
          {err && <div data-testid="pay-error" style={{ color: '#b91c1c', fontSize: 13, fontWeight: 600 }}>{err}</div>}
        </div>

        <div style={{ padding: '14px 20px', borderTop: '1px solid #e8ecf1', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '10px 18px', backgroundColor: '#f1f5f9', color: '#374151', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button data-testid="pay-save" onClick={submit} disabled={saving || !bills} style={{
            padding: '10px 22px', background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', border: 'none', borderRadius: '10px',
            fontSize: '13px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, opacity: saving || !bills ? 0.7 : 1,
          }}><FaSave size={12} /> {saving ? 'Saving…' : 'Save payment'}</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

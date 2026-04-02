'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaSave, FaMoneyBillWave } from 'react-icons/fa';

const inputStyle = {
  width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e8ecf1',
  fontSize: '14px', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box',
  backgroundColor: '#fff', color: '#1f2937',
};
const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '12px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' };

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'upi', label: 'UPI' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'card', label: 'Card' },
];

export default function PaymentRecordModal({ invoice, onClose, onSubmit, formatCurrency }) {
  const balance = (invoice?.totalAmount || 0) - (invoice?.paidAmount || 0);
  const [form, setForm] = useState({
    paidAmount: String(balance > 0 ? balance.toFixed(2) : ''),
    paymentMethod: 'bank_transfer',
    paidDate: new Date().toISOString().split('T')[0],
    referenceId: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  if (!invoice || typeof document === 'undefined') return null;

  const handleSubmit = async () => {
    const amount = parseFloat(form.paidAmount);
    if (!amount || amount <= 0) return;
    setSaving(true);
    try {
      await onSubmit(invoice.id, {
        paidAmount: (invoice.paidAmount || 0) + amount,
        paymentMethod: form.paymentMethod,
        paidDate: form.paidDate,
        notes: form.notes,
      });
      onClose();
    } catch (err) {
      console.error('Payment record error:', err);
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10002, backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '440px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaMoneyBillWave size={14} /> Record Payment
          </h2>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', cursor: 'pointer', padding: '7px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
            <FaTimes size={13} />
          </button>
        </div>

        {/* Invoice Info */}
        <div style={{ padding: '16px 22px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: '#6b7280' }}>Invoice: <strong style={{ color: '#111827' }}>{invoice.invoiceNumber}</strong></span>
            <span style={{ color: '#6b7280' }}>Total: <strong style={{ color: '#111827' }}>{formatCurrency(invoice.totalAmount)}</strong></span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginTop: '4px' }}>
            <span style={{ color: '#6b7280' }}>Paid: <strong style={{ color: '#059669' }}>{formatCurrency(invoice.paidAmount || 0)}</strong></span>
            <span style={{ color: '#6b7280' }}>Balance: <strong style={{ color: '#dc2626' }}>{formatCurrency(balance)}</strong></span>
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Payment Amount *</label>
            <input type="number" value={form.paidAmount} onChange={e => setForm(f => ({ ...f, paidAmount: e.target.value }))}
              placeholder="0.00" max={balance} step="0.01" style={inputStyle} />
            {parseFloat(form.paidAmount) < balance && parseFloat(form.paidAmount) > 0 && (
              <div style={{ fontSize: '11px', color: '#f59e0b', marginTop: '4px' }}>Partial payment — {formatCurrency(balance - parseFloat(form.paidAmount))} will remain</div>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Payment Method</label>
              <select value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Payment Date</label>
              <input type="date" value={form.paidDate} onChange={e => setForm(f => ({ ...f, paidDate: e.target.value }))} style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Reference / Transaction ID</label>
            <input value={form.referenceId} onChange={e => setForm(f => ({ ...f, referenceId: e.target.value }))} placeholder="Optional" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes" style={{ ...inputStyle, minHeight: '50px', resize: 'vertical' }} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 22px', borderTop: '1px solid #e8ecf1', backgroundColor: 'white', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onClose} style={{ padding: '11px 20px', backgroundColor: '#f1f5f9', color: '#374151', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving} style={{
            padding: '11px 24px', background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', border: 'none',
            borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(5,150,105,0.3)',
            opacity: saving ? 0.7 : 1,
          }}>
            <FaSave size={12} /> {saving ? 'Saving...' : 'Record Payment'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

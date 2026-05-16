'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaMoneyBill } from 'react-icons/fa';

export default function PaymentForm({ isOpen, onClose, onSave, booking, isMobile }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');
  const [type, setType] = useState('partial');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen || typeof document === 'undefined') return null;

  const balance = booking?.balanceAmount || 0;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    setSaving(true);
    try {
      await onSave({
        amount: Number(amount),
        method,
        type,
        note: note.trim() || null,
      });
      setAmount('');
      setNote('');
      onClose();
    } catch (err) {
      console.error('Payment save error:', err);
    } finally {
      setSaving(false);
    }
  }

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '3px solid #ef4444', borderRadius: '12px 12px 0 0' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
            <FaMoneyBill size={14} style={{ marginRight: '8px', color: '#ef4444' }} />
            Record Payment
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><FaTimes size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {booking && (
            <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#6b7280' }}>Total Amount:</span>
                <span style={{ fontWeight: '600', color: '#1f2937' }}>₹{(booking.totalAmount || 0).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#6b7280' }}>Paid:</span>
                <span style={{ fontWeight: '600', color: '#059669' }}>₹{(booking.paidAmount || 0).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Balance:</span>
                <span style={{ fontWeight: '700', color: '#dc2626' }}>₹{balance.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>Amount *</label>
            <input type="number" value={amount} onChange={function(e) { setAmount(e.target.value); }} placeholder={balance > 0 ? `Max ₹${balance}` : 'Enter amount'} style={{ width: '100%', padding: '10px 12px', borderRadius: '7px', border: '1px solid #d1d5db', fontSize: '15px', fontWeight: '600' }} min="1" step="0.01" />
            {balance > 0 && <button type="button" onClick={function() { setAmount(String(balance)); }} style={{ marginTop: '4px', padding: '3px 8px', borderRadius: '4px', border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: '11px', color: '#6b7280', cursor: 'pointer' }}>Pay full balance</button>}
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>Payment Method</label>
            <select value={method} onChange={function(e) { setMethod(e.target.value); }} style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1px solid #d1d5db', fontSize: '14px' }}>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>Payment Type</label>
            <select value={type} onChange={function(e) { setType(e.target.value); }} style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1px solid #d1d5db', fontSize: '14px' }}>
              <option value="advance">Advance</option>
              <option value="partial">Partial</option>
              <option value="final">Final Payment</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>Note (optional)</label>
            <input value={note} onChange={function(e) { setNote(e.target.value); }} style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1px solid #d1d5db', fontSize: '14px' }} placeholder="Payment reference or note" />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '10px' }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 18px', borderRadius: '7px', border: '1px solid #d1d5db', background: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={saving || !amount} style={{ padding: '9px 18px', borderRadius: '7px', border: 'none', background: '#059669', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', opacity: (saving || !amount) ? 0.6 : 1 }}>
              {saving ? 'Saving...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

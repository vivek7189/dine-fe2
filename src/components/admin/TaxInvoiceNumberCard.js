'use client';

// Settings → Order management → "Tax invoice number" (orderSettings.taxInvoiceNumbering, off by default).
// When on, every new bill also gets a number that is unique for the financial year and is printed as
// the Bill #: India (GST Rule 46) April–March "MFC/26-27/00123", max 16 characters; other countries
// the calendar year "MFC/2026/00123". The short order number on the POS / KOT does not change.
import { useEffect, useState } from 'react';
import { FaSave, FaSpinner, FaFileInvoice } from 'react-icons/fa';
import apiClient from '../../lib/api';

const clean = (p) => String(p || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);

function isIndia(r) {
  const c = (r && r.currencySettings) || {};
  if (c.countryCode) return String(c.countryCode).toUpperCase() === 'IN';
  return !c.currencyCode || String(c.currencyCode).toUpperCase() === 'INR';
}

function sampleYear(india) {
  const d = new Date();
  const y = d.getFullYear();
  if (!india) return String(y);
  const start = d.getMonth() + 1 >= 4 ? y : y - 1;
  return `${String(start % 100).padStart(2, '0')}-${String((start + 1) % 100).padStart(2, '0')}`;
}

export default function TaxInvoiceNumberCard({ restaurant, onSaved }) {
  const saved = (restaurant && restaurant.orderSettings && restaurant.orderSettings.taxInvoiceNumbering) || {};
  const [enabled, setEnabled] = useState(saved.enabled === true);
  const [prefix, setPrefix] = useState(clean(saved.prefix));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const rid = restaurant && restaurant.id;
  useEffect(() => {
    const s = (restaurant && restaurant.orderSettings && restaurant.orderSettings.taxInvoiceNumbering) || {};
    setEnabled(s.enabled === true); setPrefix(clean(s.prefix)); setMsg(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rid]); // another restaurant picked → show its setting (a save keeps the message)

  if (!restaurant) return null;
  const india = isIndia(restaurant);
  const sample = `${prefix ? prefix + '/' : ''}${sampleYear(india)}/00001`;
  const changed = enabled !== (saved.enabled === true) || prefix !== clean(saved.prefix);

  const save = async () => {
    setSaving(true); setMsg(null);
    try {
      const value = { enabled, prefix };
      await apiClient.updateRestaurant(restaurant.id, { orderSettings: { taxInvoiceNumbering: value } });
      onSaved && onSaved(value);
      setMsg({ ok: true, text: 'Saved. New bills use this from now on.' });
    } catch (e) {
      setMsg({ ok: false, text: e.message || 'Could not save' });
    } finally { setSaving(false); }
  };

  return (
    <div data-testid="tax-invoice-card" style={{ backgroundColor: 'white', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.06)', padding: 32, border: '1px solid #f1f5f9', marginTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <FaFileInvoice color="#ef4444" size={18} />
        <span style={{ fontSize: 18, fontWeight: 700, color: '#1f2937' }}>Tax invoice number</span>
      </div>
      <p style={{ margin: '0 0 18px', fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>
        {india
          ? 'Prints a GST bill number on every bill: one series for the financial year (April–March), unique and at most 16 characters. It starts again on 1 April.'
          : 'Prints a bill number on every bill that is unique for the year. It starts again on 1 January.'}
        {' '}The short order number on the POS and kitchen tickets stays as it is.
      </p>

      <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', marginBottom: 14 }}>
        <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} data-testid="tax-invoice-toggle" style={{ width: 18, height: 18, accentColor: '#ef4444' }} />
        <span style={{ fontSize: 15, fontWeight: 600, color: '#1f2937' }}>Use a {india ? 'financial-year (GST)' : 'yearly'} bill number</span>
      </label>

      {enabled && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end', marginBottom: 6 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Prefix (up to 4 letters, optional)</div>
            <input value={prefix} onChange={e => setPrefix(clean(e.target.value))} placeholder="e.g. MFC" maxLength={4} data-testid="tax-invoice-prefix" style={{ width: 140, padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 15, fontWeight: 600, letterSpacing: '0.05em', outline: 'none' }} />
          </div>
          <div style={{ fontSize: 13, color: '#6b7280', paddingBottom: 10 }}>
            First bill: <b style={{ color: '#111827', fontFamily: 'monospace', fontSize: 15 }}>{sample}</b>
          </div>
        </div>
      )}

      {msg && <div role="status" style={{ marginTop: 12, fontSize: 13, color: msg.ok ? '#047857' : '#b91c1c' }}>{msg.text}</div>}

      <button onClick={save} disabled={saving || !changed} data-testid="tax-invoice-save" style={{ marginTop: 18, width: '100%', padding: '14px 20px', borderRadius: 12, fontWeight: 600, fontSize: 15, border: 'none', cursor: saving || !changed ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: saving || !changed ? '#9ca3af' : 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white' }}>
        {saving ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} size={16} /> : <FaSave size={16} />}
        {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  );
}

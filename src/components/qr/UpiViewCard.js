'use client';

// The restaurant's own UPI QR + UPI ID for guests to look at (Customer App → "Show UPI to guests",
// customerAppSettings.upiView, backend utils/qrUpiView.js). View only: no "I've paid" button and
// nothing about the order changes — staff check the payment in their bank app.
import { useState } from 'react';

export default function UpiViewCard({ upi, amountText, style }) {
  const [copied, setCopied] = useState(false);
  if (!upi || (!upi.upiId && !upi.qrUrl)) return null;
  const copy = async () => {
    try { await navigator.clipboard.writeText(upi.upiId); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* no clipboard */ }
  };
  return (
    <div data-testid="upi-view" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '14px 16px', textAlign: 'center', ...style }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Pay by UPI{amountText ? ` · ${amountText}` : ''}</div>
      {upi.name ? <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{upi.name}</div> : null}
      {upi.qrUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={upi.qrUrl} alt="UPI QR code" style={{ display: 'block', width: '100%', maxWidth: 220, height: 'auto', margin: '10px auto 0', borderRadius: 8 }} />
      ) : null}
      {upi.upiId ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: '#6b7280' }}>UPI ID:</span>
          <span data-testid="upi-view-id" style={{ fontSize: 14, fontWeight: 700, color: '#111827', wordBreak: 'break-all' }}>{upi.upiId}</span>
          <button type="button" onClick={copy} style={{ border: '1px solid #d1d5db', background: '#f9fafb', borderRadius: 8, padding: '3px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      ) : null}
      <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>Scan with any UPI app, then show the payment to our staff.</div>
    </div>
  );
}

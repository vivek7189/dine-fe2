'use client';

// Customer App → "Show UPI to guests (view only)" (customerAppSettings.upiView, backend utils/qrUpiView.js).
// Off by default. Guests see the restaurant's UPI QR picture + UPI ID to pay with their own UPI app —
// nothing about ordering, Razorpay / Paytm or the POS changes (unlike "Enable UPI Payment" above).
// posAfterBill: the same QR on a "Scan to pay" screen on the POS (web, desktop, app) after a bill is completed.
import { useState } from 'react';
import apiClient from '../../lib/api';

const input = { width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' };
const label = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', margin: '10px 0 4px' };

export default function UpiViewSettings({ value, onChange }) {
  const u = { enabled: false, upiId: '', name: '', qrUrl: '', where: 'both', posAfterBill: 'off', ...(value || {}) };
  const anyOn = u.enabled || (u.posAfterBill && u.posAfterBill !== 'off');
  const set = (patch) => onChange({ ...u, ...patch });
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');
  const idOk = !u.upiId || /^[\w.-]{1,}@[a-zA-Z][\w.-]{1,}$/.test(u.upiId.trim());

  const upload = async (file) => {
    if (!file) return;
    setErr('');
    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) { setErr('Use a JPEG, PNG or WebP picture.'); return; }
    if (file.size > 5 * 1024 * 1024) { setErr('Picture is over 5 MB.'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const r = await apiClient.uploadImage(fd);
      if (r?.imageUrl) set({ qrUrl: r.imageUrl }); else setErr('Upload failed. Please try again.');
    } catch { setErr('Upload failed. Please try again.'); }
    setUploading(false);
  };

  return (
    <div data-testid="upi-view-settings" style={{ border: '2px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', marginTop: 16 }}>
      <label style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, cursor: 'pointer' }}>
        <span>
          <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#1f2937' }}>Show UPI to guests (view only)</span>
          <span style={{ display: 'block', fontSize: 12, color: '#6b7280', marginTop: 2 }}>
            Guests see your UPI QR and UPI ID to pay from their own UPI app. Ordering, online payment and billing stay the same —
            check the payment in your bank app before closing the bill.
          </span>
        </span>
        <input type="checkbox" checked={u.enabled} data-testid="upi-view-switch" onChange={(e) => set({ enabled: e.target.checked })}
          style={{ width: 18, height: 18, accentColor: '#059669', flexShrink: 0, marginTop: 2 }} />
      </label>

      <label style={{ display: 'block', marginTop: 12 }}>
        <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#1f2937' }}>On the POS after a bill is completed</span>
        <span style={{ display: 'block', fontSize: 12, color: '#6b7280', margin: '2px 0 6px' }}>
          A &quot;Scan to pay&quot; screen with this QR to turn towards the guest, on the web POS, desktop app and mobile app. Staff tap Close — the bill itself doesn&apos;t change.
        </span>
        <select style={input} value={u.posAfterBill || 'off'} onChange={(e) => set({ posAfterBill: e.target.value })} data-testid="upi-view-pos">
          <option value="off">Off</option>
          <option value="upi">Only bills paid by UPI</option>
          <option value="all">Every bill</option>
        </select>
      </label>

      {anyOn && (
        <div>
          <span style={label}>UPI ID</span>
          <input style={{ ...input, borderColor: idOk ? '#d1d5db' : '#ef4444' }} value={u.upiId} placeholder="e.g. yourbusiness@icici" maxLength={100}
            onChange={(e) => set({ upiId: e.target.value.trim() })} data-testid="upi-view-id-input" />
          {!idOk && <div style={{ fontSize: 12, color: '#b91c1c', marginTop: 4 }}>This doesn&apos;t look like a UPI ID (name@bank).</div>}

          <span style={label}>Name above the QR (optional)</span>
          <input style={input} value={u.name} placeholder="e.g. your business name" maxLength={60} onChange={(e) => set({ name: e.target.value })} />

          <span style={label}>QR picture (optional)</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {u.qrUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={u.qrUrl} alt="UPI QR" style={{ width: 90, height: 'auto', borderRadius: 6, border: '1px solid #e5e7eb' }} />
            ) : null}
            <label style={{ border: '1px solid #059669', color: '#059669', borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {uploading ? 'Uploading…' : u.qrUrl ? 'Change picture' : 'Upload picture'}
              <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} disabled={uploading}
                onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ''; }} />
            </label>
            {u.qrUrl ? <button type="button" onClick={() => set({ qrUrl: '' })} style={{ border: 'none', background: 'none', color: '#b91c1c', fontSize: 13, cursor: 'pointer' }}>Remove</button> : null}
          </div>
          {err && <div style={{ fontSize: 12, color: '#b91c1c', marginTop: 4 }}>{err}</div>}

          {u.enabled && (<>
            <span style={label}>Where guests see it</span>
            <select style={input} value={u.where} onChange={(e) => set({ where: e.target.value })}>
              <option value="both">Their order page and the cart (when paying at the counter)</option>
              <option value="bill">Only their order page (with the bill)</option>
              <option value="cart">Only the cart (when paying at the counter)</option>
            </select>
          </>)}
        </div>
      )}
    </div>
  );
}

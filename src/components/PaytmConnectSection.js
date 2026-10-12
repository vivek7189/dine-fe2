'use client';

// Customer App settings → Paytm Payment Gateway. The owner connects the restaurant's OWN Paytm
// merchant account (MID + merchant key from the Paytm dashboard → Developer settings → API keys).
// The server checks the keys with Paytm before saving and stores the key encrypted; it is never
// shown again. Once connected, "Accept Paytm on QR ordering" (saved with the page's Save button)
// makes guests pay with Paytm, and their order reaches the POS only after Paytm confirms.

import { useEffect, useState } from 'react';
import { FaCheck, FaCopy, FaSpinner, FaUnlink, FaWallet } from 'react-icons/fa';
import apiClient from '../lib/api';

const card = (isMobile) => ({
  backgroundColor: 'white', borderRadius: isMobile ? '12px' : '16px', padding: isMobile ? '16px' : '24px',
  marginTop: isMobile ? '12px' : '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb', overflow: 'hidden',
});
const input = { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' };
const label = { display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' };

export default function PaytmConnectSection({ restaurantId, isMobile, enabled, connected, razorpayEnabled, onChange, Toggle, notify }) {
  const [info, setInfo] = useState(null);
  const [form, setForm] = useState({ mid: '', merchantKey: '', websiteName: '', env: 'production' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!restaurantId) return;
    apiClient.getPaytmSettings(restaurantId).then(setInfo).catch(() => setInfo(null));
  }, [restaurantId, connected]);

  const say = (m) => (typeof notify === 'function' ? notify(m) : null);

  const connect = async () => {
    setErr('');
    if (!form.mid.trim() || !form.merchantKey.trim()) { setErr('Enter the MID and the merchant key'); return; }
    setBusy(true);
    try {
      const r = await apiClient.connectPaytm(restaurantId, form);
      setInfo(r);
      setForm({ mid: '', merchantKey: '', websiteName: '', env: 'production' });
      onChange({ paytmConnected: true });
      say('Paytm connected — now switch on "Accept Paytm on QR ordering" and Save.');
    } catch (e) {
      setErr(e?.message || 'Could not connect Paytm');
    }
    setBusy(false);
  };

  const disconnect = async () => {
    if (!window.confirm('Disconnect Paytm? Guests will no longer be able to pay with Paytm on the QR ordering page.')) return;
    setBusy(true);
    try {
      await apiClient.disconnectPaytm(restaurantId);
      setInfo({ connected: false });
      onChange({ paytmConnected: false, paytmEnabled: false });
      say('Paytm disconnected');
    } catch (e) {
      say(e?.message || 'Could not disconnect Paytm');
    }
    setBusy(false);
  };

  const copy = (t) => { try { navigator.clipboard.writeText(t); say('Copied'); } catch (_) { /* ignore */ } };

  return (
    <div style={card(isMobile)}>
      <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FaWallet color="#00baf2" />
        Paytm Payment Gateway
      </h2>
      <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 16px' }}>
        Guests pay with Paytm (UPI apps, Paytm wallet, cards) straight into your own Paytm account. DineOpen gets the payment
        confirmation from Paytm and sends the order to your POS and kitchen only once it is paid — until then it shows in Order History as
        &quot;Pending payment&quot;.
      </p>

      {connected ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', backgroundColor: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
            <FaCheck style={{ color: '#16a34a', flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: '13px', color: '#374151' }}>
              <b style={{ color: '#15803d' }}>Connected</b>
              {info?.mid ? <span style={{ marginLeft: 8 }}>MID {info.mid}</span> : null}
              {info?.env === 'staging' ? <span style={{ marginLeft: 8, color: '#b45309', fontWeight: 600 }}>· TEST mode</span> : null}
            </div>
          </div>

          <Toggle
            value={!!enabled}
            onChange={(v) => onChange({ paytmEnabled: v })}
            label="Accept Paytm on QR ordering (guest pays first, order goes to the kitchen once paid)"
          />
          {enabled && razorpayEnabled ? (
            <p style={{ margin: 0, fontSize: '12px', color: '#b45309' }}>Razorpay is also on — guests will be asked to pay with Paytm.</p>
          ) : null}

          {info?.webhookUrl ? (
            <div style={{ padding: '12px 16px', backgroundColor: '#f9fafb', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Recommended: in the Paytm dashboard → Developer settings → Webhook, set the <i>Payment notification URL</i> to:
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <code style={{ flex: 1, fontSize: '12px', wordBreak: 'break-all', color: '#111827' }}>{info.webhookUrl}</code>
                <button type="button" onClick={() => copy(info.webhookUrl)} style={{ border: '1px solid #d1d5db', background: '#fff', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}><FaCopy size={12} /></button>
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280', marginTop: 6 }}>Payments are confirmed even without it; this makes confirmation instant if a guest closes the page right after paying.</div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={disconnect}
            disabled={busy}
            style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '13px', cursor: busy ? 'not-allowed' : 'pointer', padding: '4px 0', display: 'flex', alignItems: 'center', gap: '6px', alignSelf: 'flex-start', opacity: busy ? 0.5 : 1 }}
          >
            <FaUnlink size={12} /> Disconnect Paytm
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={label}>MID (Merchant ID)</label>
              <input style={input} value={form.mid} onChange={(e) => setForm({ ...form, mid: e.target.value })} placeholder="e.g. AbCdEf12345678901234" autoComplete="off" />
            </div>
            <div>
              <label style={label}>Merchant key</label>
              <input style={input} type="password" value={form.merchantKey} onChange={(e) => setForm({ ...form, merchantKey: e.target.value })} placeholder="16-character key" autoComplete="new-password" />
            </div>
            <div>
              <label style={label}>Website name</label>
              <input style={input} value={form.websiteName} onChange={(e) => setForm({ ...form, websiteName: e.target.value })} placeholder={form.env === 'staging' ? 'WEBSTAGING' : 'DEFAULT'} autoComplete="off" />
            </div>
            <div>
              <label style={label}>Keys type</label>
              <select style={input} value={form.env} onChange={(e) => setForm({ ...form, env: e.target.value })}>
                <option value="production">Live (production)</option>
                <option value="staging">Test (staging)</option>
              </select>
            </div>
          </div>
          {err ? <div style={{ fontSize: '13px', color: '#dc2626' }}>{err}</div> : null}
          <button
            type="button"
            onClick={connect}
            disabled={busy}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px 22px', backgroundColor: busy ? '#7dd3fc' : '#002e6e', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: busy ? 'not-allowed' : 'pointer' }}
          >
            {busy ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : null}
            {busy ? 'Checking keys with Paytm…' : 'Connect Paytm'}
          </button>
          <div style={{ padding: '12px 16px', backgroundColor: '#f9fafb', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 600, color: '#374151' }}>Where to find these:</p>
            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#6b7280', lineHeight: 1.8 }}>
              <li>Log in to the Paytm for Business dashboard → Developer settings → API keys</li>
              <li>Copy the <b>Production</b> MID and Merchant key (use Test keys only for a trial)</li>
              <li>No API keys option? Ask Paytm support to enable &quot;Payment Gateway / API access&quot; on your account</li>
              <li>Money goes straight to your Paytm account — DineOpen never holds it</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

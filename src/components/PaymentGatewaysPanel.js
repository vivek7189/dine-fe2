'use client';

// Admin → Payment Settings: online payment gateways in one place. Each gateway is a card (logo +
// Connected / Not connected); opening it shows its connect form. Same server calls as the QR-ordering
// settings page (Razorpay OAuth connect / disconnect, PaytmConnectSection); the "use on QR ordering"
// switches are saved into customerAppSettings.paymentSettings with the same merge the UPI section uses,
// so nothing else is touched. New gateways = one more entry in GATEWAYS.
import { useCallback, useEffect, useState } from 'react';
import { SiRazorpay, SiPaytm } from 'react-icons/si';
import { FaCheck, FaExternalLinkAlt, FaSpinner, FaUnlink, FaPlus } from 'react-icons/fa';
import apiClient from '../lib/api';
import PaytmConnectSection from './PaytmConnectSection';

const GATEWAYS = [
  { key: 'razorpay', name: 'Razorpay', Icon: SiRazorpay, color: '#0c2451', bg: '#eef2ff', blurb: 'UPI, cards, netbanking & wallets', connectedKey: 'razorpayConnected', enabledKey: 'razorpayEnabled' },
  { key: 'paytm', name: 'Paytm', Icon: SiPaytm, color: '#00baf2', bg: '#ecfeff', blurb: 'UPI apps, Paytm wallet & cards', connectedKey: 'paytmConnected', enabledKey: 'paytmEnabled' },
];

function Toggle({ value, onChange, label }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: 10, cursor: 'pointer' }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{label}</span>
      <span onClick={(e) => { e.preventDefault(); onChange(!value); }} role="switch" aria-checked={!!value}
        style={{ width: 44, height: 24, borderRadius: 999, background: value ? '#16a34a' : '#d1d5db', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
        <span style={{ position: 'absolute', top: 3, left: value ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left .2s', boxShadow: '0 1px 2px rgba(0,0,0,.2)' }} />
      </span>
    </label>
  );
}

export default function PaymentGatewaysPanel({ restaurantId, notify }) {
  const [ps, setPs] = useState({});          // customerAppSettings.paymentSettings
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(null);    // gateway key being shown
  const [dirty, setDirty] = useState({});    // on/off switches changed, not saved yet
  const [saving, setSaving] = useState(false);
  const [rzBusy, setRzBusy] = useState(false);
  const say = useCallback((m) => { if (typeof notify === 'function') notify(m); }, [notify]);

  const load = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const r = await apiClient.get(`/api/restaurants/${restaurantId}/customer-app-settings`);
      setPs((r && r.settings && r.settings.paymentSettings) || {});
    } catch (_) { setPs({}); }
    setDirty({}); setLoaded(true);
  }, [restaurantId]);
  useEffect(() => { setLoaded(false); setOpen(null); load(); }, [load]);

  const patch = (p) => setPs((prev) => ({ ...prev, ...p }));
  const setSwitch = (key, v) => { patch({ [key]: v }); setDirty((d) => ({ ...d, [key]: v })); };

  const saveSwitches = async () => {
    if (!Object.keys(dirty).length) return;
    setSaving(true);
    try {
      // Same merge as the UPI section: only the changed switches are written.
      const existing = await apiClient.get(`/api/restaurants/${restaurantId}/customer-app-settings`);
      const merged = { ...(existing?.settings || {}), paymentSettings: { ...(existing?.settings?.paymentSettings || {}), ...dirty } };
      await apiClient.put(`/api/restaurants/${restaurantId}/customer-app-settings`, merged);
      setDirty({});
      say('Payment gateway settings saved');
    } catch (e) {
      say(e?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const razorpayConnect = async () => {
    setRzBusy(true);
    try {
      const r = await apiClient.get(`/api/razorpay-oauth/authorize-url?restaurantId=${restaurantId}`);
      if (r && r.url) { window.location.href = r.url; return; }
      say('Could not start the Razorpay connection');
    } catch (e) { say('Could not start the Razorpay connection'); }
    setRzBusy(false);
  };
  const razorpayDisconnect = async () => {
    if (!window.confirm('Disconnect your Razorpay account? Customers will no longer be able to pay online with Razorpay.')) return;
    setRzBusy(true);
    try {
      await apiClient.post('/api/razorpay-oauth/disconnect', { restaurantId });
      patch({ razorpayConnected: false, razorpayEnabled: false, razorpayAccountId: '' });
      setDirty((d) => { const n = { ...d }; delete n.razorpayEnabled; return n; });
      say('Razorpay account disconnected');
    } catch (e) { say('Could not disconnect Razorpay'); }
    setRzBusy(false);
  };

  if (!restaurantId) return null;
  const btn = (bg, color = 'white') => ({ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 20px', background: bg, color, border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' });

  return (
    <div data-testid="payment-gateways" style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid #f1f5f9' }}>
      <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: 0 }}>Online payment gateways</h3>
      <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 16px' }}>
        Connect your own account. Customers pay online on your QR / online ordering page; the money goes straight to you.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {GATEWAYS.map((g) => {
          const connected = !!ps[g.connectedKey], enabled = !!ps[g.enabledKey], active = open === g.key;
          return (
            <button key={g.key} type="button" onClick={() => setOpen(active ? null : g.key)} data-testid={`gw-${g.key}`}
              style={{ textAlign: 'left', padding: 16, borderRadius: 14, cursor: 'pointer', background: 'white', border: `2px solid ${active ? '#6366f1' : connected ? '#bbf7d0' : '#e5e7eb'}`, boxShadow: active ? '0 4px 14px rgba(99,102,241,.15)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 44, height: 44, borderRadius: 12, background: g.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <g.Icon size={g.key === 'paytm' ? 30 : 22} color={g.color} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#111827' }}>{g.name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{g.blurb}</div>
                </div>
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {!loaded ? <span style={{ fontSize: 12, color: '#9ca3af' }}>Checking…</span> : connected ? (
                  <>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#15803d', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 999, padding: '3px 10px' }}>● Connected</span>
                    {enabled && <span style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 999, padding: '3px 10px' }}>On for QR ordering</span>}
                  </>
                ) : <span style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 999, padding: '3px 10px' }}>Not connected</span>}
              </div>
            </button>
          );
        })}
        <div style={{ padding: 16, borderRadius: 14, border: '2px dashed #e5e7eb', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 44, height: 44, borderRadius: 12, background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaPlus /></span>
          <div><div style={{ fontWeight: 700, fontSize: 14, color: '#6b7280' }}>More gateways</div><div style={{ fontSize: 12 }}>Coming soon</div></div>
        </div>
      </div>

      {open === 'razorpay' && (
        <div style={{ marginTop: 16, padding: 18, border: '1px solid #e5e7eb', borderRadius: 14 }} data-testid="gw-detail-razorpay">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}><SiRazorpay color="#0c2451" /><b>Razorpay</b></div>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 14px' }}>Accept UPI, cards, netbanking and wallets into your own Razorpay account. DineOpen never holds the money.</p>
          {ps.razorpayConnected ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10 }}>
                <FaCheck color="#16a34a" /><b style={{ color: '#15803d', fontSize: 14 }}>Connected</b>
                {ps.razorpayAccountId && <span style={{ fontSize: 12, color: '#6b7280' }}>({ps.razorpayAccountId})</span>}
              </div>
              <Toggle value={!!ps.razorpayEnabled} onChange={(v) => setSwitch('razorpayEnabled', v)} label="Use Razorpay on QR / online ordering" />
              <button type="button" onClick={razorpayDisconnect} disabled={rzBusy} style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start', padding: 0, opacity: rzBusy ? 0.5 : 1 }}>
                <FaUnlink size={12} /> {rzBusy ? 'Disconnecting…' : 'Disconnect Razorpay account'}
              </button>
            </div>
          ) : (
            <button type="button" onClick={razorpayConnect} disabled={rzBusy} style={btn(rzBusy ? '#93c5fd' : '#0366d6')}>
              {rzBusy ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaExternalLinkAlt size={13} />}
              {rzBusy ? 'Opening Razorpay…' : 'Connect Razorpay account'}
            </button>
          )}
        </div>
      )}

      {open === 'paytm' && (
        <div style={{ marginTop: 16 }} data-testid="gw-detail-paytm">
          <PaytmConnectSection
            restaurantId={restaurantId}
            isMobile={false}
            enabled={!!ps.paytmEnabled}
            connected={!!ps.paytmConnected}
            razorpayEnabled={!!ps.razorpayEnabled}
            Toggle={Toggle}
            onChange={(p) => {
              patch(p);
              // Connect / disconnect are saved by Paytm's own calls; only the on/off switch needs Save.
              if (Object.prototype.hasOwnProperty.call(p, 'paytmEnabled') && !Object.prototype.hasOwnProperty.call(p, 'paytmConnected')) setDirty((d) => ({ ...d, paytmEnabled: p.paytmEnabled }));
              else if (p.paytmConnected === false) setDirty((d) => { const n = { ...d }; delete n.paytmEnabled; return n; });
            }}
            notify={say}
          />
        </div>
      )}

      {Object.keys(dirty).length > 0 && (
        <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" onClick={saveSwitches} disabled={saving} style={btn(saving ? '#9ca3af' : '#6366f1')} data-testid="gw-save">
            {saving ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : null}{saving ? 'Saving…' : 'Save gateway settings'}
          </button>
        </div>
      )}
    </div>
  );
}

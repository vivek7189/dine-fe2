'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FaWhatsapp, FaCheckCircle, FaExclamationTriangle, FaMotorcycle,
  FaMoneyBillWave, FaLink, FaStore, FaCommentDots, FaInfoCircle,
} from 'react-icons/fa';
import apiClient from '../lib/api';

const WA_GREEN = '#25D366';
const WA_DARK = '#075E54';
const WA_TEAL = '#128C7E';
const CHAT_BG = '#E5DDD5';

/**
 * WhatsApp Ordering — self-serve onboarding + settings, shown as a tab inside the Admin page.
 * The restaurant connects its WhatsApp number ONCE via the existing Automation → WhatsApp Embedded
 * Signup; here they just flip Ordering on and configure it. Backend reuses the connected number
 * (auto-pulled from automationSettings) so no credentials are re-entered. Includes a live animated
 * phone demo so the owner can SEE the exact customer experience.
 */
export default function WhatsAppOrderingTab({ restaurantId, restaurantName = 'Your Restaurant', currencySymbol = '₹', onGoToConnect }) {
  const cs = currencySymbol || '₹';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connectedNumber, setConnectedNumber] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [requireAddress, setRequireAddress] = useState(true);
  const [paymentMode, setPaymentMode] = useState('pay_at_counter');
  const [paymentLink, setPaymentLink] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => { if (restaurantId) loadAll(); /* eslint-disable-next-line */ }, [restaurantId]);

  async function loadAll() {
    setLoading(true);
    try {
      const [statusRes, cfgRes] = await Promise.all([
        apiClient.get(`/api/automation/${restaurantId}/whatsapp`).catch(() => ({})),
        apiClient.get(`/api/whatsapp-ordering/config/${restaurantId}`).catch(() => ({})),
      ]);
      setConnected(!!statusRes?.connected);
      setConnectedNumber(statusRes?.settings?.phoneNumber || statusRes?.settings?.phoneNumberId || '');
      const c = (cfgRes && cfgRes.config) || {};
      setEnabled(!!c.enabled);
      setWelcomeMessage(c.welcomeMessage || `Welcome to *${restaurantName}*! 🍽️\n\nI can help you place an order.\nType *menu* to see our menu.`);
      setRequireAddress(c.requireAddress !== false);
      setPaymentMode(c.paymentMode || 'pay_at_counter');
      setPaymentLink(c.paymentLink || '');
    } catch (e) { /* ignore — show defaults */ }
    setLoading(false);
  }

  function showToast(m) { setToast(m); setTimeout(() => setToast(''), 2600); }

  async function save(nextEnabled) {
    setSaving(true);
    try {
      const body = {
        enabled: nextEnabled != null ? nextEnabled : enabled,
        welcomeMessage,
        requireAddress,
        paymentMode,
        paymentLink,
      };
      const res = await apiClient.post(`/api/whatsapp-ordering/config/${restaurantId}`, body);
      if (res && res.success) {
        if (nextEnabled != null) setEnabled(nextEnabled);
        showToast('Saved ✓');
      } else {
        showToast(res?.error || 'Save failed');
      }
    } catch (e) { showToast('Save failed'); }
    setSaving(false);
  }

  async function toggleEnabled() {
    if (!connected) { showToast('Connect your WhatsApp number first'); return; }
    await save(!enabled);
  }

  const card = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 20, marginBottom: 18 };
  const label = { fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6, display: 'block' };
  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 9, fontSize: 14, color: '#111827', boxSizing: 'border-box' };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading WhatsApp Ordering…</div>;
  }

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '4px 4px 40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, background: WA_GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FaWhatsapp size={26} color="#fff" />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827' }}>WhatsApp Ordering</h2>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: '#6b7280' }}>Let customers place orders by chatting with your WhatsApp number. Orders drop straight into your POS &amp; kitchen.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* LEFT: setup + settings */}
        <div style={{ flex: '1 1 460px', minWidth: 320 }}>
          {/* Step 1 — connection */}
          <div style={card}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#9ca3af', letterSpacing: 0.6, marginBottom: 10 }}>STEP 1 · CONNECT YOUR NUMBER</div>
            {connected ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 10, padding: '12px 14px' }}>
                <FaCheckCircle color="#059669" size={20} />
                <div>
                  <div style={{ fontWeight: 700, color: '#065f46', fontSize: 14 }}>WhatsApp connected</div>
                  <div style={{ fontSize: 13, color: '#047857' }}>{connectedNumber ? `Number: ${connectedNumber}` : 'Your business number is linked.'}</div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 14px', flexWrap: 'wrap' }}>
                <FaExclamationTriangle color="#d97706" size={18} />
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontWeight: 700, color: '#92400e', fontSize: 14 }}>No WhatsApp number connected</div>
                  <div style={{ fontSize: 13, color: '#b45309' }}>Connect your business number once — then just turn ordering on here.</div>
                </div>
                <button onClick={() => onGoToConnect && onGoToConnect()} style={{ background: WA_GREEN, color: '#fff', border: 'none', borderRadius: 9, padding: '9px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  Connect WhatsApp
                </button>
              </div>
            )}
          </div>

          {/* Step 2 — enable */}
          <div style={card}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#9ca3af', letterSpacing: 0.6, marginBottom: 10 }}>STEP 2 · TURN ON ORDERING</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
              <div>
                <div style={{ fontWeight: 700, color: '#111827', fontSize: 15 }}>Enable WhatsApp Ordering</div>
                <div style={{ fontSize: 12.5, color: '#6b7280', marginTop: 2 }}>Customers messaging your number get a guided ordering menu.</div>
              </div>
              <button onClick={toggleEnabled} disabled={!connected || saving}
                style={{ position: 'relative', width: 54, height: 30, borderRadius: 999, border: 'none', cursor: connected ? 'pointer' : 'not-allowed', background: enabled ? WA_GREEN : '#d1d5db', transition: 'background .2s', flexShrink: 0, opacity: connected ? 1 : 0.6 }}>
                <span style={{ position: 'absolute', top: 3, left: enabled ? 27 : 3, width: 24, height: 24, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.3)' }} />
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 12, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 9, padding: '9px 12px' }}>
              <FaInfoCircle color="#2563eb" size={14} style={{ marginTop: 2, flexShrink: 0 }} />
              <div style={{ fontSize: 12, color: '#1e40af', lineHeight: 1.5 }}>
                One number does <b>one</b> job on incoming messages. While Ordering is on, this number runs the ordering bot instead of the AI chat/auto-reply.
              </div>
            </div>
          </div>

          {/* Step 3 — settings */}
          <div style={{ ...card, opacity: enabled ? 1 : 0.55, pointerEvents: enabled ? 'auto' : 'none' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#9ca3af', letterSpacing: 0.6, marginBottom: 14 }}>STEP 3 · CONFIGURE</div>

            <div style={{ marginBottom: 16 }}>
              <label style={label}><FaCommentDots style={{ marginRight: 6, verticalAlign: -1 }} />Welcome message</label>
              <textarea value={welcomeMessage} onChange={e => setWelcomeMessage(e.target.value)} rows={3}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} placeholder="Welcome message shown when a customer says hi" />
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Tip: wrap words in *stars* for bold (WhatsApp style).</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={label}><FaMotorcycle style={{ marginRight: 6, verticalAlign: -1 }} />Delivery address</label>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 9, padding: '10px 12px' }}>
                <span style={{ fontSize: 13.5, color: '#374151' }}>Ask the customer for a delivery address</span>
                <button onClick={() => setRequireAddress(v => !v)}
                  style={{ position: 'relative', width: 46, height: 26, borderRadius: 999, border: 'none', cursor: 'pointer', background: requireAddress ? WA_GREEN : '#d1d5db' }}>
                  <span style={{ position: 'absolute', top: 3, left: requireAddress ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .2s' }} />
                </button>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={label}><FaMoneyBillWave style={{ marginRight: 6, verticalAlign: -1 }} />Payment</label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {[{ id: 'pay_at_counter', label: 'Pay at counter', icon: FaStore }, { id: 'payment_link', label: 'Online payment link', icon: FaLink }].map(opt => {
                  const active = paymentMode === opt.id;
                  const Icon = opt.icon;
                  return (
                    <button key={opt.id} onClick={() => setPaymentMode(opt.id)}
                      style={{ flex: '1 1 160px', display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', borderRadius: 10, cursor: 'pointer', border: active ? `2px solid ${WA_GREEN}` : '1px solid #d1d5db', background: active ? '#f0fdf4' : '#fff', fontWeight: 600, fontSize: 13.5, color: active ? '#065f46' : '#374151' }}>
                      <Icon size={15} /> {opt.label}
                    </button>
                  );
                })}
              </div>
              {paymentMode === 'payment_link' && (
                <input value={paymentLink} onChange={e => setPaymentLink(e.target.value)} placeholder="https://your-payment-link.com"
                  style={{ ...inputStyle, marginTop: 10 }} />
              )}
            </div>

            <button onClick={() => save()} disabled={saving}
              style={{ width: '100%', background: WA_TEAL, color: '#fff', border: 'none', borderRadius: 10, padding: '12px 0', fontWeight: 800, fontSize: 15, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving…' : 'Save settings'}
            </button>
          </div>
        </div>

        {/* RIGHT: live demo phone */}
        <div style={{ flex: '0 0 340px', maxWidth: 340 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#9ca3af', letterSpacing: 0.6, marginBottom: 10, textAlign: 'center' }}>LIVE PREVIEW · HOW CUSTOMERS ORDER</div>
          <DemoPhone restaurantName={restaurantName} cs={cs} requireAddress={requireAddress} paymentMode={paymentMode} welcome={welcomeMessage} />
        </div>
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 26, left: '50%', transform: 'translateX(-50%)', background: '#111827', color: '#fff', padding: '11px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, zIndex: 9999, boxShadow: '0 6px 20px rgba(0,0,0,.25)' }}>{toast}</div>
      )}
    </div>
  );
}

/* ---------- Animated WhatsApp phone demo ---------- */
function DemoPhone({ restaurantName, cs, requireAddress, paymentMode, welcome }) {
  const clean = (welcome || '').replace(/\*/g, '').split('\n')[0] || `Welcome to ${restaurantName}!`;
  const script = [
    { from: 'bot', text: `${clean}\nType *menu* to see our menu 🍽️` },
    { from: 'user', text: 'menu' },
    { from: 'bot', text: '📋 *Our Menu* — pick a category:', chips: ['Starters', 'Main Course', 'Beverages'] },
    { from: 'user', text: 'Main Course' },
    { from: 'bot', text: 'Select an item:', chips: [`Butter Chicken · ${cs}250`, `Paneer Tikka · ${cs}200`, `Veg Biryani · ${cs}180`] },
    { from: 'user', text: 'Butter Chicken' },
    { from: 'bot', text: `*Butter Chicken* — ${cs}250\nHow many? (1–50)` },
    { from: 'user', text: '2' },
    { from: 'bot', text: `✅ Added *2× Butter Chicken*\n🛒 Total: ${cs}500`, chips: ['Checkout', 'Add More'] },
    { from: 'user', text: 'Checkout' },
    { from: 'bot', text: 'Please enter your *name*:' },
    { from: 'user', text: 'Rahul' },
    ...(requireAddress ? [
      { from: 'bot', text: 'Share your *delivery address* 📍' },
      { from: 'user', text: '12 MG Road' },
    ] : []),
    { from: 'bot', text: `📋 *Order Summary*\n👤 Rahul\n2× Butter Chicken — ${cs}500\n\nConfirm your order?`, chips: ['Confirm Order', 'Edit'] },
    { from: 'user', text: 'Confirm Order' },
    { from: 'bot', text: `✅ *Order Placed!*\n🔢 Order #A1B2\n${paymentMode === 'payment_link' ? '💳 Pay online: link sent' : '💳 Pay at counter'}\nThank you! 🙏` },
  ];

  const [n, setN] = useState(1);
  const scrollRef = useRef(null);
  const len = script.length;

  // Restart the demo whenever the settings that change the script change.
  useEffect(() => { setN(1); }, [requireAddress, paymentMode, welcome]);

  // Reveal one message at a time; pause at the end, then loop.
  useEffect(() => {
    const atEnd = n >= len;
    const t = setTimeout(() => setN(atEnd ? 1 : n + 1), atEnd ? 2400 : 1050);
    return () => clearTimeout(t);
  }, [n, len]);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [n]);

  const bubbleFmt = (t) => t.split('*').map((seg, i) => i % 2 ? <b key={i}>{seg}</b> : <span key={i}>{seg}</span>);

  return (
    <div style={{ width: 320, margin: '0 auto', border: '10px solid #111827', borderRadius: 34, overflow: 'hidden', boxShadow: '0 12px 34px rgba(0,0,0,.28)', background: '#000' }}>
      {/* header */}
      <div style={{ background: WA_DARK, color: '#fff', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FaStore color={WA_DARK} size={16} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.1 }}>{restaurantName}</div>
          <div style={{ fontSize: 11, opacity: 0.85 }}>online</div>
        </div>
        <FaWhatsapp size={18} />
      </div>
      {/* chat */}
      <div ref={scrollRef} style={{ background: CHAT_BG, height: 430, overflowY: 'auto', padding: '12px 10px', backgroundImage: 'radial-gradient(rgba(0,0,0,0.035) 1px, transparent 1px)', backgroundSize: '14px 14px' }}>
        {script.slice(0, n).map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start', marginBottom: 7 }}>
            <div style={{ maxWidth: '82%', background: m.from === 'user' ? '#DCF8C6' : '#fff', color: '#111827', padding: '8px 11px', borderRadius: 10, fontSize: 13, lineHeight: 1.4, whiteSpace: 'pre-wrap', boxShadow: '0 1px 1px rgba(0,0,0,.08)' }}>
              {bubbleFmt(m.text)}
              {m.chips && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 8 }}>
                  {m.chips.map((c, j) => (
                    <div key={j} style={{ border: `1px solid ${WA_TEAL}`, color: WA_TEAL, borderRadius: 7, padding: '6px 8px', fontSize: 12.5, fontWeight: 600, textAlign: 'center', background: '#fff' }}>{c}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* input bar */}
      <div style={{ background: '#F0F0F0', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, background: '#fff', borderRadius: 18, padding: '8px 12px', fontSize: 12.5, color: '#9ca3af' }}>Type a message…</div>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: WA_GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FaWhatsapp color="#fff" size={16} />
        </div>
      </div>
    </div>
  );
}

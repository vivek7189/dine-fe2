'use client';

// Phone browser: Facebook (WhatsApp Embedded Signup) comes back here in the same tab with a one-time
// code. We check it belongs to the signup this browser started (utils/whatsappConnect `state`), then
// the server exchanges it, finds the WhatsApp account + number and connects them (same as the
// computer popup flow). The code is removed from the address bar straight away.
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import apiClient from '../../../lib/api';
import { takePhoneConnect, connectReturnUrl } from '../../../utils/whatsappConnect';

export default function WhatsAppConnectedPage() {
  const [state, setState] = useState({ phase: 'working', text: 'Connecting your WhatsApp number…' });
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const p = new URLSearchParams(window.location.search);
    const code = p.get('code');
    const st = p.get('state');
    const fbError = p.get('error_description') || p.get('error_reason') || p.get('error');
    try { window.history.replaceState(null, '', window.location.pathname); } catch (_) { /* ignore */ }
    const saved = takePhoneConnect(st);

    if (!saved) {
      setState({ phase: 'error', text: 'This link has expired or was opened in a different browser. Please go back to DineOpen → Admin → WhatsApp and tap Connect again.' });
      return;
    }
    const rid = saved.restaurantId;
    if (!code) {
      apiClient.reportWhatsAppConnectDiagnostic(rid, { phase: 'client-phone-return', ok: false, errorMessage: fbError ? `Facebook: ${fbError}` : 'Facebook returned without a code (not finished)' });
      setState({ phase: 'error', text: fbError ? `Facebook stopped the setup: ${fbError}. Please try again.` : 'The Facebook steps were not finished. Please try again and complete all the steps.' });
      return;
    }
    apiClient.connectWhatsAppEmbeddedSignup(rid, { code, redirect_uri: connectReturnUrl() })
      .then((res) => setState({ phase: 'done', text: res?.phoneNumber && res.phoneNumber !== 'Connected' ? `WhatsApp connected: ${res.phoneNumber}` : 'WhatsApp connected!' }))
      .catch((err) => {
        apiClient.reportWhatsAppConnectDiagnostic(rid, { phase: 'client-setup-failed', ok: false, errorMessage: err?.error || err?.message || 'Failed to complete setup (phone)' });
        setState({ phase: 'error', text: err?.error || err?.message || 'Could not finish connecting. Please try again.' });
      });
  }, []);

  const color = state.phase === 'done' ? '#15803d' : state.phase === 'error' ? '#b91c1c' : '#374151';
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', background: '#f7f7f5', fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 420, background: 'white', borderRadius: 18, padding: '28px 22px', textAlign: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize: 40, lineHeight: 1 }}>{state.phase === 'done' ? '✅' : state.phase === 'error' ? '⚠️' : '⏳'}</div>
        <div style={{ fontSize: 17, fontWeight: 700, color, marginTop: 12, lineHeight: 1.4 }}>{state.text}</div>
        {state.phase !== 'working' && (
          <Link href="/admin?tab=whatsapp" style={{ display: 'inline-block', marginTop: 20, padding: '12px 18px', borderRadius: 12, background: '#111827', color: 'white', fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
            Back to WhatsApp settings
          </Link>
        )}
      </div>
    </main>
  );
}

'use client';

/**
 * Onboarding AI Setup Concierge — INLINE (part of the page, not a floating window).
 *
 * A proactive assistant that can actually DO setup, not just answer questions. It
 * renders as a normal card in the page flow (no fixed positioning, no pop-open
 * overlay, no launcher bubble). Compact by default (intro + quick actions); it grows
 * inline, bubble-style, only once you chat.
 *
 * Hero action: one-tap builds a real, country-localized menu (reuses the AI
 * starter-menu endpoint). Also answers "how do I…" questions and offers a human
 * hand-off. SAFE: self-contained, every call guarded — it can never break the flow.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { FaRobot, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import apiClient from '../lib/api';

const WA = 'https://wa.me/919528632779';

export default function OnboardingConcierge({ restaurantId, businessLabel = 'restaurant', countryName = '', onMenuBuilt }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  const push = useCallback((type, content) => {
    setMessages((m) => [...m, { id: Date.now() + Math.random(), type, content }]);
  }, []);

  useEffect(() => { if (messages.length) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [messages, busy]);

  const buildMenu = async () => {
    if (busy || !restaurantId) return;
    push('user', '✨ Build my menu');
    setBusy(true);
    try {
      const res = await apiClient.generateAiStarterMenu(restaurantId, {});
      if (res?.success && res.count > 0) {
        push('bot', `Done! ✅ I built a ${countryName ? countryName + ' ' : ''}menu with ${res.count} local dishes, priced in your currency. Edit anything from the Menu page — or just start taking orders.`);
        if (typeof onMenuBuilt === 'function') onMenuBuilt(res.count);
      } else {
        push('bot', "I couldn't build it just now — your sample menu is still ready. Try again in a moment, or upload a photo of your menu.");
      }
    } catch {
      push('bot', "I couldn't build it just now — your sample menu is still ready. Try again shortly, or upload a menu photo.");
    } finally {
      setBusy(false);
    }
  };

  const ask = async (text) => {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    push('user', q);
    setInput('');
    setBusy(true);
    try {
      const res = await apiClient.post('/api/chatbot/query', { query: q, restaurantId });
      const answer = res?.response?.response || res?.answer || "I'm here to help you set up — try “Build my menu”, or ask about taking your first order.";
      push('bot', answer);
    } catch {
      push('bot', "I'm here to help you get set up. Tap “Build my menu” to start, or open your POS to take your first order.");
    } finally {
      setBusy(false);
    }
  };

  const chips = [
    { label: '✨ Build my menu', on: buildMenu },
    { label: '🧾 Take my first order', on: () => push('bot', "Add a dish to the bill, tap “Bill”, then “Print” — that's your first sale! Finish setup and tap “Start taking orders” to try it now.") },
    { label: '💡 What can DineOpen do?', on: () => ask('In 2-3 short lines, what can DineOpen do for my restaurant?') },
    { label: '💬 Talk to a human', on: () => { try { window.open(`${WA}?text=${encodeURIComponent('Hi, I need help setting up DineOpen')}`, '_blank'); } catch (_) {} } },
  ];

  if (!restaurantId) return null;

  return (
    <div className="ob-fadeIn-d2" style={{
      borderRadius: '16px', border: '1px solid #ede9fe',
      background: 'linear-gradient(135deg,#faf7ff,#ffffff)', overflow: 'hidden', marginBottom: '20px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '13px 16px', borderBottom: messages.length ? '1px solid #f1eefb' : 'none' }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: 'linear-gradient(135deg,#7c3aed,#db2777)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FaRobot size={15} color="#fff" />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: '14px', color: '#3b0764' }}>Setup Assistant
            <span style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.06em', color: '#7c3aed', background: '#f3e8ff', padding: '1px 6px', borderRadius: '10px', marginLeft: '7px', verticalAlign: 'middle' }}>AI</span>
          </div>
          <div style={{ fontSize: '11.5px', color: '#8b5cf6' }}>I can build your {String(businessLabel).toLowerCase()} menu — or answer anything.</div>
        </div>
      </div>

      {/* Inline conversation (only once there's something to show) */}
      {messages.length > 0 && (
        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '9px', maxHeight: '260px', overflowY: 'auto' }}>
          {messages.map((m) => (
            <div key={m.id} style={{ alignSelf: m.type === 'user' ? 'flex-end' : 'flex-start', maxWidth: '88%' }}>
              <div style={{
                padding: '8px 12px', borderRadius: m.type === 'user' ? '13px 13px 4px 13px' : '13px 13px 13px 4px',
                background: m.type === 'user' ? '#7c3aed' : '#fff', color: m.type === 'user' ? '#fff' : '#1f2937',
                border: m.type === 'user' ? 'none' : '1px solid #eee', fontSize: '13px', lineHeight: 1.45,
              }}>{m.content}</div>
            </div>
          ))}
          {busy && (
            <div style={{ alignSelf: 'flex-start', color: '#7c3aed', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FaSpinner size={11} style={{ animation: 'spin 0.8s linear infinite' }} /> thinking…
            </div>
          )}
          <div ref={endRef} />
        </div>
      )}

      {/* Quick actions */}
      <div style={{ padding: messages.length ? '2px 14px 12px' : '10px 14px 12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {chips.map((c) => (
          <button key={c.label} type="button" onClick={c.on} disabled={busy}
            style={{ fontSize: '12px', fontWeight: 600, padding: '6px 11px', borderRadius: '20px', cursor: busy ? 'default' : 'pointer', border: '1px solid #ddd6fe', background: '#f5f3ff', color: '#6d28d9' }}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Ask box */}
      <form onSubmit={(e) => { e.preventDefault(); ask(); }} style={{ padding: '0 14px 14px', display: 'flex', gap: '8px' }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything about setup…"
          style={{ flex: 1, padding: '9px 12px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '13px', outline: 'none', background: '#fff' }} />
        <button type="submit" disabled={busy || !input.trim()} aria-label="Send"
          style={{ width: 40, borderRadius: '10px', border: 'none', cursor: busy || !input.trim() ? 'default' : 'pointer', background: busy || !input.trim() ? '#e5e7eb' : '#7c3aed', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FaPaperPlane size={12} />
        </button>
      </form>
    </div>
  );
}

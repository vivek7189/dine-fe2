'use client';

/**
 * Onboarding AI Setup Concierge.
 *
 * A proactive assistant for brand-new owners that can actually DO setup for them —
 * not just answer questions. Its hero action builds a real, country-localized menu
 * in one tap (reusing the AI starter-menu endpoint); it also answers "how do I…"
 * questions and offers a human hand-off.
 *
 * SAFE BY DESIGN: fully self-contained, gated to onboarding (mounted only there),
 * every network call wrapped so it can never break the flow. It only reads/creates
 * via existing endpoints; it never touches billing or other users' data.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { FaRobot, FaPaperPlane, FaTimes, FaMagic, FaSpinner } from 'react-icons/fa';
import apiClient from '../lib/api';

const WA = 'https://wa.me/919528632779';

export default function OnboardingConcierge({ restaurantId, businessLabel = 'restaurant', countryName = '', onMenuBuilt }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [greeted, setGreeted] = useState(false);
  const endRef = useRef(null);

  const push = useCallback((type, content) => {
    setMessages((m) => [...m, { id: Date.now() + Math.random(), type, content }]);
  }, []);

  // Gentle proactive greeting once, shortly after the page settles.
  useEffect(() => {
    if (!restaurantId) return;
    const t = setTimeout(() => {
      setOpen(true);
      setGreeted((g) => {
        if (!g) push('bot', `Hi! I'm your DineOpen setup assistant 👋 I can build your ${String(businessLabel).toLowerCase()} menu in seconds, or answer any question. What would you like?`);
        return true;
      });
    }, 2600);
    return () => clearTimeout(t);
  }, [restaurantId, businessLabel, push]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, open]);

  const buildMenu = async () => {
    if (busy || !restaurantId) return;
    push('user', '✨ Build my menu');
    setBusy(true);
    try {
      const res = await apiClient.generateAiStarterMenu(restaurantId, {});
      if (res?.success && res.count > 0) {
        push('bot', `Done! ✅ I created a ${countryName ? countryName + ' ' : ''}menu with ${res.count} local dishes, priced in your currency. Edit anything from the Menu page — or just start taking orders.`);
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
      const answer = res?.response?.response || res?.answer || "I'm here to help you set up — try “Build my menu”, or ask me about taking your first order.";
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
    <>
      {/* Launcher bubble */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open setup assistant"
          style={{
            position: 'fixed', right: '20px', bottom: '20px', zIndex: 1150,
            width: '56px', height: '56px', borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg,#7c3aed,#db2777)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 10px 30px rgba(124,58,237,0.4)',
          }}
        >
          <FaRobot size={22} />
        </button>
      )}

      {/* Panel */}
      {open && (
        <div style={{
          position: 'fixed', right: '20px', bottom: '20px', zIndex: 1150,
          width: 'min(360px, calc(100vw - 24px))', height: 'min(520px, calc(100vh - 40px))',
          background: '#fff', borderRadius: '18px', overflow: 'hidden',
          boxShadow: '0 18px 50px rgba(0,0,0,0.22)', border: '1px solid #ede9fe',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)', color: '#fff', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaRobot size={16} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: '14.5px' }}>Setup Assistant</div>
              <div style={{ fontSize: '11.5px', opacity: 0.9 }}>AI · here to set you up</div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close" style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}><FaTimes size={16} /></button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px', background: '#faf9fb', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((m) => (
              <div key={m.id} style={{ alignSelf: m.type === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                <div style={{
                  padding: '9px 12px', borderRadius: m.type === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: m.type === 'user' ? '#7c3aed' : '#fff', color: m.type === 'user' ? '#fff' : '#1f2937',
                  border: m.type === 'user' ? 'none' : '1px solid #eee', fontSize: '13.5px', lineHeight: 1.45,
                  boxShadow: m.type === 'user' ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
                }}>{m.content}</div>
              </div>
            ))}
            {busy && (
              <div style={{ alignSelf: 'flex-start', color: '#7c3aed', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 6px' }}>
                <FaSpinner size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> thinking…
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick actions (shown until there's a real back-and-forth) */}
          {messages.length <= 3 && (
            <div style={{ padding: '8px 12px 0', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {chips.map((c) => (
                <button key={c.label} onClick={c.on} disabled={busy}
                  style={{ fontSize: '12px', fontWeight: 600, padding: '6px 10px', borderRadius: '20px', cursor: busy ? 'default' : 'pointer', border: '1px solid #ddd6fe', background: '#f5f3ff', color: '#6d28d9' }}>
                  {c.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={(e) => { e.preventDefault(); ask(); }} style={{ padding: '10px 12px', display: 'flex', gap: '8px', borderTop: '1px solid #f1f0f4' }}>
            <input
              value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything about setup…"
              style={{ flex: 1, padding: '9px 12px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '13.5px', outline: 'none' }}
            />
            <button type="submit" disabled={busy || !input.trim()} aria-label="Send"
              style={{ width: 40, borderRadius: '10px', border: 'none', cursor: busy || !input.trim() ? 'default' : 'pointer', background: busy || !input.trim() ? '#e5e7eb' : '#7c3aed', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaPaperPlane size={13} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

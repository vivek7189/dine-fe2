'use client';

/**
 * Guided First Sale — the "aha moment" coach for a brand-new restaurant.
 *
 * It manufactures the first real outcome: it gently walks a just-onboarded owner
 * through their first 3 taps (add an item → open the bill → complete the sale) and
 * then celebrates the result. This is what turns "I set it up" into "it works for
 * MY restaurant" — the belief that drives day-2 return.
 *
 * SAFETY / DESIGN:
 *  - Fully self-contained and PASSIVE: it only READS `cartCount` and `orderPlaced`
 *    props and advances its own step. It never touches the cart, the order, billing,
 *    or printing — so it cannot break the POS.
 *  - Event-validated (Shopify-style): steps advance on REAL actions, not clicks on a
 *    tour. Add a real item → step 2; complete a real order → celebration.
 *  - Shows ONCE, only to genuinely new users: gated on a freshly-seeded onboarding
 *    checklist (completed < 24h ago) AND a one-time `guidedFirstSaleDone` flag. Every
 *    existing user, and every user who skips, renders nothing.
 *  - Dismissible at any time.
 */

import { useEffect, useState, useCallback } from 'react';

const DONE_KEY = 'guidedFirstSaleDone';

export default function GuidedFirstSale({ cartCount = 0, orderPlaced = false }) {
  const [active, setActive] = useState(false);
  const [celebrated, setCelebrated] = useState(false);

  // Decide once, on mount, whether this user should see the guide.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (localStorage.getItem(DONE_KEY) === 'true') return;
      const raw = localStorage.getItem('onboardingChecklist');
      if (!raw) return; // never onboarded on this device → don't show
      const data = JSON.parse(raw);
      const completedAt = Number(data && data.completedAt) || 0;
      // Only for genuinely new users: onboarding finished within the last 24h.
      if (!completedAt || Date.now() - completedAt > 24 * 60 * 60 * 1000) return;
      setActive(true);
    } catch { /* never block the POS */ }
  }, []);

  // Latch the celebration once the first order is placed (so it stays up even if
  // the parent clears cart/order state right after).
  useEffect(() => {
    if (active && orderPlaced) setCelebrated(true);
  }, [active, orderPlaced]);

  const finish = useCallback(() => {
    try { localStorage.setItem(DONE_KEY, 'true'); } catch { /* ignore */ }
    setActive(false);
  }, []);

  if (!active) return null;

  // Derive the step from REAL state.
  const step = celebrated ? 3 : cartCount > 0 ? 2 : 1;

  const COPY = {
    1: { icon: '👆', title: 'Ring your first order', body: 'Tap any dish to add it to the bill. Try it — nothing is charged to a real customer.' },
    2: { icon: '🧾', title: 'Now open the bill', body: 'Tap "Bill" (or "Place Order") to charge it — this prints a real bill, just like a live sale.' },
    3: { icon: '🎉', title: "That's your first sale!", body: "It's already counted in today's sales — open Home any time to see your daily total grow." },
  }[step];

  return (
    <div
      role="dialog"
      aria-label="Guided first sale"
      style={{
        position: 'fixed', left: '50%', bottom: '20px', transform: 'translateX(-50%)',
        zIndex: 1200, width: 'min(380px, calc(100vw - 24px))',
        background: '#ffffff', borderRadius: '16px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.18)', border: '1px solid #f1e2df',
        overflow: 'hidden', animation: 'gfsIn .35s ease',
      }}
    >
      <style>{`@keyframes gfsIn{from{opacity:0;transform:translate(-50%,14px)}to{opacity:1;transform:translate(-50%,0)}}`}</style>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: '5px', padding: '12px 16px 0' }}>
        {[1, 2, 3].map((s) => (
          <div key={s} style={{
            height: '4px', flex: 1, borderRadius: '4px',
            background: s <= step ? (step === 3 ? '#16a34a' : '#ef4444') : '#f1f0ee',
            transition: 'background .3s',
          }} />
        ))}
      </div>

      <div style={{ padding: '14px 16px 16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0, fontSize: 22,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: step === 3 ? '#e6f4ea' : '#fdecea',
        }}>{COPY.icon}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: step === 3 ? '#16a34a' : '#ef4444', marginBottom: '2px' }}>
            Step {step} of 3
          </div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#1f2937', lineHeight: 1.2 }}>{COPY.title}</div>
          <div style={{ fontSize: '13.5px', color: '#6b7280', marginTop: '4px', lineHeight: 1.45 }}>{COPY.body}</div>

          {step === 3 ? (
            <button
              onClick={finish}
              style={{
                marginTop: '12px', width: '100%', padding: '10px', borderRadius: '10px', border: 'none',
                background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer',
              }}
            >
              🎉 Done — I made my first sale
            </button>
          ) : (
            <button
              onClick={finish}
              style={{
                marginTop: '10px', background: 'none', border: 'none', padding: 0,
                color: '#9ca3af', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Skip tour
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

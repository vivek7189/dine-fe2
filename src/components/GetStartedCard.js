'use client';

/**
 * "Get ready for your first customer" — the owner's Home card for a new restaurant.
 *
 * PostHog (Oct 2026): 71% of new owners reach the POS but only 29% ever come back another day.
 * Owners who came back had, on day one, made the menu their own (72% vs 41%) and opened printer
 * settings (33% vs 10%). So this card asks for exactly those two things, plus the first bill.
 *
 * Every state is read from the SERVER (restaurant record + orders), so it shows on any device,
 * any day — unlike the old localStorage checklist that only appeared on the signup device for 24h:
 *  - setup unfinished  → restaurant.onboardingStep is a number   → "Continue setup"
 *  - sample menu       → restaurant.hasDefaultMenu               → upload / edit menu
 *  - printer           → saved printSettings, or opened printer setup on this device
 *  - first bill        → any order exists
 * Shown only to restaurants younger than 30 days with no order yet, or with steps left, so
 * established restaurants never see it. It also arms the POS "Guided first sale" coach
 * (GuidedFirstSale) for this restaurant while it has no order.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaRocket, FaArrowRight, FaCheck, FaTimes } from 'react-icons/fa';
import apiClient from '../lib/api';
import { track } from '../lib/analytics';

const MAX_AGE_DAYS = 30;
export const FIRST_SALE_FLAG = 'activationFirstSaleRid';

function toMillis(v) {
  if (!v) return 0;
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return Date.parse(v) || 0;
  if (v._seconds) return v._seconds * 1000;
  if (v.seconds) return v.seconds * 1000;
  return 0;
}

export default function GetStartedCard() {
  const router = useRouter();
  const [state, setState] = useState(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const rid = typeof window !== 'undefined' && localStorage.getItem('selectedRestaurantId');
    if (!rid) return;
    try { if (localStorage.getItem(`getStartedDismissed_${rid}`)) { setHidden(true); return; } } catch { /* ignore */ }
    (async () => {
      try {
        const [restRes, ordersRes] = await Promise.all([
          apiClient.request(`/api/restaurants/${rid}`),
          apiClient.getOrders(rid, { limit: 1 }).catch(() => null),
        ]);
        const r = restRes?.restaurant || restRes;
        if (!r || cancelled) return;
        const orders = Array.isArray(ordersRes) ? ordersRes : (ordersRes?.orders || []);
        const hasOrder = orders.length > 0;
        const ageDays = (Date.now() - toMillis(r.createdAt)) / 86400000;
        const step = r.onboardingStep;
        const setupUnfinished = step != null && step !== 'complete' && !isNaN(Number(step));
        let printerOpened = false;
        try { printerOpened = !!localStorage.getItem(`getStartedPrinter_${rid}`); } catch { /* ignore */ }
        const s = {
          rid,
          setupStep: setupUnfinished ? Math.max(2, Number(step)) : null,
          menuDone: !r.hasDefaultMenu,
          printerDone: hasOrder || printerOpened || !!(r.printSettings && Object.keys(r.printSettings).length),
          orderDone: hasOrder,
        };
        // Arm (or disarm) the POS first-sale coach for this restaurant.
        try {
          if (!hasOrder && ageDays <= MAX_AGE_DAYS) localStorage.setItem(FIRST_SALE_FLAG, rid);
          else if (localStorage.getItem(FIRST_SALE_FLAG) === rid) localStorage.removeItem(FIRST_SALE_FLAG);
        } catch { /* ignore */ }
        const allDone = !s.setupStep && s.menuDone && s.printerDone && s.orderDone;
        // Established restaurants (old or already billing) never see the card.
        if (allDone || ageDays > MAX_AGE_DAYS || (hasOrder && !s.setupStep && s.menuDone)) return;
        setState(s);
        track('get_started_card_shown', { setup_step: s.setupStep, menu_done: s.menuDone, printer_done: s.printerDone, order_done: s.orderDone });
      } catch { /* never block Home */ }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!state || hidden) return null;

  const go = (key, href) => {
    track('get_started_click', { item: key });
    if (key === 'printer') { try { localStorage.setItem(`getStartedPrinter_${state.rid}`, '1'); } catch { /* ignore */ } }
    const h = (typeof window !== 'undefined' && window.__DINEOPEN_MOBILE_EMBED__ && !href.startsWith('/mobile') && !href.startsWith('/onboarding')) ? '/mobile' + href : href;
    router.push(h);
  };

  const dismiss = () => {
    setHidden(true);
    try { localStorage.setItem(`getStartedDismissed_${state.rid}`, '1'); } catch { /* ignore */ }
    track('get_started_dismissed');
  };

  const posPath = '/dashboard';
  const items = [
    state.setupStep && {
      key: 'setup', done: false,
      title: 'Finish setting up your restaurant',
      text: 'You stopped part-way. Pick up where you left off.',
      actions: [{ label: 'Continue setup', href: `/onboarding?step=${state.setupStep}`, primary: true }],
    },
    {
      key: 'menu', done: state.menuDone,
      title: 'Make the menu yours',
      text: state.menuDone ? 'Your own menu is in.' : 'You have sample dishes. Upload a photo or PDF of your menu and AI adds every item and price.',
      actions: [{ label: 'Upload menu photo', href: '/menu?upload=1', primary: true }, { label: 'Edit items', href: '/menu' }],
    },
    {
      key: 'printer', done: state.printerDone,
      title: 'Print a test bill',
      text: state.printerDone ? 'Printer step done.' : 'Connect your bill printer and print a sample. No printer? Bills can be shared on WhatsApp instead.',
      actions: [{ label: 'Connect printer', href: '/admin?tab=print', primary: true }],
    },
    {
      key: 'order', done: state.orderDone,
      title: 'Take your first order',
      text: state.orderDone ? 'First bill done.' : 'Tap a dish, then Bill. We guide you through it step by step.',
      actions: [{ label: 'Open POS', href: posPath, primary: true }],
    },
  ].filter(Boolean);
  const doneCount = items.filter((i) => i.done).length;

  return (
    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '20px 22px', margin: '20px 20px 0', position: 'relative' }}>
      <button onClick={dismiss} aria-label="Hide" title="Hide" style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}>
        <FaTimes size={14} />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', paddingRight: '28px' }}>
        <FaRocket size={16} color="#ef4444" />
        <span style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>Get ready for your first customer</span>
        <span style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: 700, padding: '2px 10px', borderRadius: '10px', background: '#fef3c7', color: '#b45309', whiteSpace: 'nowrap' }}>
          {doneCount} of {items.length} done
        </span>
      </div>
      <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 14px' }}>A few minutes now and DineOpen is ready for real customers.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '10px' }}>
        {items.map((it) => (
          <div key={it.key} style={{ border: `1px solid ${it.done ? '#bbf7d0' : '#e5e7eb'}`, background: it.done ? '#f0fdf4' : '#f8fafc', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: it.done ? '#10b981' : '#e2e8f0', color: 'white' }}>
                {it.done && <FaCheck size={9} />}
              </span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: it.done ? '#6b7280' : '#111827' }}>{it.title}</span>
            </div>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: 0, lineHeight: 1.45 }}>{it.text}</p>
            {!it.done && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 'auto' }}>
                {it.actions.map((a) => (
                  <button key={a.label} onClick={() => go(it.key, a.href)} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 700,
                    padding: '8px 12px', borderRadius: '8px',
                    border: a.primary ? 'none' : '1px solid #e5e7eb',
                    background: a.primary ? '#ef4444' : 'white', color: a.primary ? 'white' : '#374151',
                  }}>
                    {a.label}{a.primary && <FaArrowRight size={10} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

// AccountNoticeGate — per-restaurant "account / billing gate" banner, controlled
// by super-admin from dine-admin (PATCH /api/super-admin/restaurants/:id/billing-notice).
// Three levels: info → slim dismissible bottom banner; warning → dismissible popup;
// blocking → full-screen hard stop (not dismissible). Renders on web AND Electron
// (same dashboard layout). Polls a lightweight endpoint; never blocks the app on a
// failed poll. Display-only — it changes nothing about the order/payment data.

import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import { FaExclamationTriangle, FaTimes, FaLock, FaArrowRight } from 'react-icons/fa';
import apiClient from '../lib/api';

const POLL_MS = 90 * 1000;
// On the Billing page we re-check much faster so the gate lifts right after payment
// (the server check is live — only this client poll/cache adds delay).
const BILLING_PAGE_POLL_MS = 15 * 1000;
const BILLING_PATH = '/billing';
// Fired by the Billing page after a successful payment/activation → re-check immediately.
export const BILLING_PAYMENT_SUCCESS_EVENT = 'billingPaymentSuccess';

const THEME = {
  info:     { bar: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', text: '#1e3a8a', icon: '#2563eb' },
  warning:  { bar: '#d97706', bg: '#fffbeb', border: '#fde68a', text: '#92400e', icon: '#d97706' },
  blocking: { bar: '#dc2626', bg: '#fef2f2', border: '#fecaca', text: '#7f1d1d', icon: '#dc2626' },
};

export default function AccountNoticeGate() {
  const pathname = usePathname() || '';
  const router = useRouter();
  const onBillingPage = pathname === BILLING_PATH || pathname.startsWith(BILLING_PATH + '/');
  const [mounted, setMounted] = useState(false);
  const [rid, setRid] = useState(null);
  const [notice, setNotice] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Track the currently-selected restaurant (localStorage + the app's event bus).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const read = () => setRid(localStorage.getItem('selectedRestaurantId') || null);
    read();
    const onChange = (e) => setRid((e && e.detail && e.detail.restaurantId) || localStorage.getItem('selectedRestaurantId') || null);
    window.addEventListener('restaurantChanged', onChange);
    return () => window.removeEventListener('restaurantChanged', onChange);
  }, []);

  // fresh=true bypasses the 90s client cache (used after payment / on focus / route change).
  const fetchNotice = useCallback(async (fresh = false) => {
    if (!rid) { setNotice(null); return; }
    try {
      if (fresh) apiClient.invalidateCache(`/api/restaurants/${rid}/billing-notice`);
      const res = await apiClient.getBillingNotice(rid);
      setNotice((res && res.billingNotice) || null);
    } catch (_) { /* keep last state — a failed poll must never gate the app */ }
  }, [rid]);

  // Regular poll — faster while the user is on the Billing page completing payment.
  const hasNotice = !!notice;
  useEffect(() => {
    if (!rid) return;
    fetchNotice(onBillingPage);
    const fast = onBillingPage && hasNotice;
    const t = setInterval(() => fetchNotice(fast), fast ? BILLING_PAGE_POLL_MS : POLL_MS);
    return () => clearInterval(t);
  }, [rid, fetchNotice, onBillingPage, hasNotice]);

  // Immediate re-check: after a successful payment (event from the Billing page), and
  // whenever the window regains focus (e.g. returning from a hosted checkout tab).
  useEffect(() => {
    if (typeof window === 'undefined' || !rid) return;
    const recheck = () => fetchNotice(true);
    const onVisible = () => { if (document.visibilityState === 'visible') recheck(); };
    window.addEventListener(BILLING_PAYMENT_SUCCESS_EVENT, recheck);
    window.addEventListener('focus', recheck);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener(BILLING_PAYMENT_SUCCESS_EVENT, recheck);
      window.removeEventListener('focus', recheck);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [rid, fetchNotice]);

  // A dismiss is remembered per notice version (updatedAt) so editing/re-issuing a
  // notice re-shows it, but repeated renders don't nag.
  const dismissKey = notice ? `billingNoticeDismissed:${rid}:${notice.updatedAt || ''}` : null;
  useEffect(() => {
    if (!notice) { setDismissed(false); return; }
    try { setDismissed(localStorage.getItem(dismissKey) === '1'); } catch (_) { setDismissed(false); }
  }, [dismissKey, notice]);

  if (!mounted || !notice || notice.enabled !== true) return null;

  const level = ['info', 'warning', 'blocking'].includes(notice.level) ? notice.level : 'info';
  const t = THEME[level];
  const canDismiss = level !== 'blocking' && notice.dismissible !== false;
  if (dismissed && canDismiss) return null;

  const doDismiss = () => {
    if (!canDismiss) return;
    try { localStorage.setItem(dismissKey, '1'); } catch (_) {}
    setDismissed(true);
  };
  // ── On the Billing page: never cover the page with the popup/overlay — the user must be
  // able to pay. Show a slim, non-blocking note instead (it disappears once paid).
  if (onBillingPage) {
    if (level === 'info' && dismissed && canDismiss) return null;
    return createPortal(
      <div style={{
        position: 'fixed', left: '50%', bottom: 16, transform: 'translateX(-50%)', zIndex: 100000,
        maxWidth: 'calc(100vw - 32px)', background: '#ffffff', border: `1px solid ${t.border}`,
        borderLeft: `4px solid ${t.bar}`, borderRadius: 12, boxShadow: '0 10px 30px rgba(15,23,42,0.15)',
        padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, color: t.text,
      }}>
        {level === 'blocking' ? <FaLock color={t.icon} size={14} style={{ flexShrink: 0 }} /> : <FaExclamationTriangle color={t.icon} size={14} style={{ flexShrink: 0 }} />}
        <span style={{ fontSize: 13, fontWeight: 600 }}>
          Choose a plan and complete the payment below — your account unlocks automatically.
        </span>
      </div>,
      document.body
    );
  }

  // CTA always leads somewhere: the admin-set URL, or the in-app Billing page by default.
  const ctaUrl = notice.ctaUrl || BILLING_PATH;
  const isExternalCta = /^https?:\/\//i.test(ctaUrl);
  const onCta = () => {
    if (isExternalCta) window.open(ctaUrl, '_blank', 'noopener');
    else router.push(ctaUrl);
  };
  const goBilling = () => router.push(BILLING_PATH);
  const ctaLabel = notice.ctaLabel || (level === 'blocking' ? 'Pay Now' : 'Go to Billing');
  const title = notice.title || (level === 'blocking' ? 'Account suspended' : 'Action required');
  const ctaBtn = (
    <button onClick={onCta} style={{
      display: 'inline-flex', alignItems: 'center', gap: 8, padding: level === 'info' ? '6px 14px' : '10px 20px',
      borderRadius: 8, border: 'none', background: t.bar, color: '#fff', fontWeight: 700,
      fontSize: level === 'info' ? 13 : 14, cursor: 'pointer', whiteSpace: 'nowrap',
    }}>{ctaLabel} <FaArrowRight size={11} /></button>
  );
  // When the admin CTA points elsewhere (external link), still offer the in-app Billing page.
  const billingLink = isExternalCta ? (
    <button onClick={goBilling} style={{
      background: 'transparent', border: 'none', color: t.bar, fontSize: 13, fontWeight: 700,
      cursor: 'pointer', padding: 4, textDecoration: 'underline',
    }}>Open Billing page</button>
  ) : null;

  // ── INFO — slim bottom banner (never hides the header / nav) ──────────────
  if (level === 'info') {
    return createPortal(
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 100000,
        background: t.bg, borderTop: `2px solid ${t.bar}`, boxShadow: '0 -4px 16px rgba(0,0,0,0.08)',
        padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <FaExclamationTriangle color={t.icon} size={16} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0, color: t.text }}>
          <span style={{ fontWeight: 700, fontSize: 13 }}>{title}</span>
          {notice.message ? <span style={{ fontSize: 13, marginLeft: 8, opacity: 0.9 }}>{notice.message}</span> : null}
        </div>
        {ctaBtn}
        <button onClick={doDismiss} title="Dismiss" style={{
          background: 'transparent', border: 'none', color: t.text, cursor: 'pointer', padding: 6, flexShrink: 0,
        }}><FaTimes size={14} /></button>
      </div>,
      document.body
    );
  }

  // ── WARNING (dismissible popup) & BLOCKING (hard stop) ────────────────────
  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100000,
      background: level === 'blocking' ? 'rgba(15,23,42,0.85)' : 'rgba(15,23,42,0.55)',
      backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: '#fff', borderRadius: 18, maxWidth: 460, width: '100%', overflow: 'hidden',
        boxShadow: '0 24px 60px rgba(0,0,0,0.35)', border: `1px solid ${t.border}`,
      }}>
        <div style={{ background: t.bar, height: 6 }} />
        <div style={{ padding: '28px 26px 24px', textAlign: 'center' }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%', background: t.bg, display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center', marginBottom: 16,
          }}>
            {level === 'blocking' ? <FaLock color={t.icon} size={26} /> : <FaExclamationTriangle color={t.icon} size={26} />}
          </div>
          <h2 style={{ margin: '0 0 10px', fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{title}</h2>
          {notice.message ? (
            <p style={{ margin: '0 0 20px', fontSize: 15, lineHeight: 1.55, color: '#475569', whiteSpace: 'pre-wrap' }}>{notice.message}</p>
          ) : null}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'stretch' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>{ctaBtn}</div>
            {billingLink ? <div style={{ display: 'flex', justifyContent: 'center' }}>{billingLink}</div> : null}
            {canDismiss ? (
              <button onClick={doDismiss} style={{
                background: 'transparent', border: 'none', color: '#64748b', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', padding: 6,
              }}>Dismiss for now</button>
            ) : (
              <div style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 4 }}>
                Please complete your payment to continue. Contact support if you believe this is a mistake.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

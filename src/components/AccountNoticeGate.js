'use client';

// AccountNoticeGate — per-restaurant "account / billing gate" banner, controlled
// by super-admin from dine-admin (PATCH /api/super-admin/restaurants/:id/billing-notice).
// Three levels: info → slim dismissible bottom banner; warning → dismissible popup;
// blocking → full-screen hard stop (not dismissible). Renders on web AND Electron
// (same dashboard layout). Polls a lightweight endpoint; never blocks the app on a
// failed poll. Display-only — it changes nothing about the order/payment data.

import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FaExclamationTriangle, FaTimes, FaLock, FaArrowRight } from 'react-icons/fa';
import apiClient from '../lib/api';

const POLL_MS = 90 * 1000;

const THEME = {
  info:     { bar: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', text: '#1e3a8a', icon: '#2563eb' },
  warning:  { bar: '#d97706', bg: '#fffbeb', border: '#fde68a', text: '#92400e', icon: '#d97706' },
  blocking: { bar: '#dc2626', bg: '#fef2f2', border: '#fecaca', text: '#7f1d1d', icon: '#dc2626' },
};

export default function AccountNoticeGate() {
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

  const fetchNotice = useCallback(async () => {
    if (!rid) { setNotice(null); return; }
    try {
      const res = await apiClient.getBillingNotice(rid);
      setNotice((res && res.billingNotice) || null);
    } catch (_) { /* keep last state — a failed poll must never gate the app */ }
  }, [rid]);

  useEffect(() => {
    if (!rid) return;
    fetchNotice();
    const t = setInterval(fetchNotice, POLL_MS);
    return () => clearInterval(t);
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
  const onCta = () => {
    const url = notice.ctaUrl;
    if (!url) return;
    if (/^https?:\/\//i.test(url)) window.open(url, '_blank', 'noopener');
    else window.location.href = url;
  };
  const title = notice.title || (level === 'blocking' ? 'Account suspended' : 'Action required');
  const ctaBtn = notice.ctaLabel ? (
    <button onClick={onCta} style={{
      display: 'inline-flex', alignItems: 'center', gap: 8, padding: level === 'info' ? '6px 14px' : '10px 20px',
      borderRadius: 8, border: 'none', background: t.bar, color: '#fff', fontWeight: 700,
      fontSize: level === 'info' ? 13 : 14, cursor: 'pointer', whiteSpace: 'nowrap',
    }}>{notice.ctaLabel} <FaArrowRight size={11} /></button>
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
            {ctaBtn ? <div style={{ display: 'flex', justifyContent: 'center' }}>{ctaBtn}</div> : null}
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

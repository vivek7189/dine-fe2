'use client';

// Trial-ended payment reminder for new owners (backend decides who: utils/trialNotice).
// AccountNoticeGate fetches it with the billing notice and publishes it here; the dashboard
// layout shows <TrialEndedBar /> at the top of every page, and AccountNoticeGate shows
// <TrialEndedModal /> once per login. Both disappear as soon as the owner pays.

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import { FaArrowRight, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import apiClient from '../lib/api';

const EVENT = 'dineopen:trialNotice';
const BILLING_PATH = '/billing';

export function publishTrialNotice(tn) {
  if (typeof window === 'undefined') return;
  window.__dineTrialNotice = tn || null;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: tn || null }));
}

export function useTrialNotice() {
  const [tn, setTn] = useState(null);
  useEffect(() => {
    setTn(window.__dineTrialNotice || null);
    const on = (e) => setTn(e.detail || null);
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);
  return tn;
}

const onBilling = (p) => p === BILLING_PATH || p.startsWith(BILLING_PATH + '/');

export function TrialEndedBar() {
  const tn = useTrialNotice();
  const pathname = usePathname() || '';
  const router = useRouter();
  if (!tn || onBilling(pathname)) return null;
  return (
    <div role="status" style={{
      display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '8px 16px',
      background: '#fef2f2', borderBottom: '1px solid #fecaca', color: '#991b1b',
    }}>
      <FaExclamationCircle size={14} color="#dc2626" style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, minWidth: 200, fontSize: 13, fontWeight: 600 }}>
        Your {tn.trialDays || 7}-day free trial has ended. Choose a plan to keep using DineOpen without a break.
      </span>
      <button onClick={() => router.push(BILLING_PATH)} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, border: 'none',
        background: '#dc2626', color: '#fff', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', whiteSpace: 'nowrap',
      }}>Choose a plan <FaArrowRight size={10} /></button>
    </div>
  );
}

// Once per login: the key includes the end of the login token, so a new login shows it again.
function seenKey(rid) {
  let tail = '';
  try { tail = String(apiClient.getToken() || '').slice(-24); } catch (_) { /* no token */ }
  return `trialModalSeen:${rid}:${tail}`;
}

export function TrialEndedModal({ restaurantId }) {
  const tn = useTrialNotice();
  const pathname = usePathname() || '';
  const router = useRouter();
  const [seen, setSeen] = useState(true);

  useEffect(() => {
    if (!tn || !restaurantId) return;
    try { setSeen(localStorage.getItem(seenKey(restaurantId)) === '1'); } catch (_) { setSeen(false); }
  }, [tn, restaurantId]);

  if (!tn || seen || onBilling(pathname) || typeof document === 'undefined') return null;

  const close = () => {
    try { localStorage.setItem(seenKey(restaurantId), '1'); } catch (_) { /* storage blocked */ }
    setSeen(true);
  };
  const choose = () => { close(); router.push(BILLING_PATH); };

  return createPortal(
    <div role="dialog" aria-modal="true" aria-labelledby="trial-ended-title" style={{
      position: 'fixed', inset: 0, zIndex: 100000, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(3px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{ background: '#fff', borderRadius: 20, maxWidth: 440, width: '100%', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', padding: '26px 26px 22px', color: '#fff', textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', opacity: 0.9 }}>DineOpen</div>
          <h2 id="trial-ended-title" style={{ margin: '8px 0 0', fontSize: 22, fontWeight: 800, lineHeight: 1.25 }}>Your free trial has ended</h2>
        </div>
        <div style={{ padding: '22px 26px 24px' }}>
          <p style={{ margin: '0 0 16px', fontSize: 15, lineHeight: 1.6, color: '#475569', textAlign: 'center' }}>
            Thanks for trying DineOpen. Choose a plan to keep billing, kitchen orders and reports running.
          </p>
          <ul style={{ listStyle: 'none', margin: '0 0 20px', padding: 0, display: 'grid', gap: 8 }}>
            {['Your menu, orders and reports are safe', 'Pay online in a minute', 'Carry on right where you left off'].map((t) => (
              <li key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#0f172a', fontWeight: 600 }}>
                <FaCheckCircle color="#16a34a" size={15} style={{ flexShrink: 0 }} />{t}
              </li>
            ))}
          </ul>
          <button onClick={choose} style={{
            width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 18px',
            borderRadius: 12, border: 'none', background: '#dc2626', color: '#fff', fontWeight: 800, fontSize: 15.5, cursor: 'pointer',
          }}>Choose a plan <FaArrowRight size={12} /></button>
          <button onClick={close} style={{
            width: '100%', marginTop: 8, padding: 10, background: 'transparent', border: 'none', color: '#64748b',
            fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
          }}>Remind me later</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

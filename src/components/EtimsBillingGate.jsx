'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Kenya eTIMS billing gate for the dashboard. Centralises the two things that used
 * to live inline (and duplicated) in dashboard/page.js and dashboard/v2/page.js:
 *
 *   1. window.__etimsFiscalActive — set while eTIMS is live so the NORMAL bill
 *      auto-print (useAutoPrint / OrderSummary) is suppressed; the combined fiscal
 *      receipt (bill + KRA block/QR) prints instead. Cleared on unmount so a
 *      non-Kenya store's bill print can never be stranded.
 *   2. On each completed bill (`orderSuccess`): fiscalise against the local VSCU and
 *      print the combined receipt. Covers BOTH "Complete Billing" and "Bill & Print"
 *      because both set `orderSuccess`.
 *
 * Per-bill opt-in (etimsConfig.askPerBill): when the store turned on
 * "Ask 'Send to KRA?' on each bill", instead of auto-sending it shows a small
 * Yes/No prompt. Yes -> the full fiscal flow (unchanged). No -> skip KRA and print a
 * plain bill. When the flag is OFF this is byte-for-byte the previous behaviour
 * (auto-fiscalise, no prompt).
 *
 * Inert for non-Kenya / eTIMS-off stores: `etimsActive` is false, so the window flag
 * stays false, nothing fiscalises, and this renders nothing.
 */
export default function EtimsBillingGate({ etimsActive, askPerBill, orderSuccess, restaurant, printSettings, onError }) {
  const [prompt, setPrompt] = useState(null); // { orderId } while awaiting a Yes/No choice
  const handledRef = useRef(null);             // last orderId we've already acted on (act once per bill)

  // (1) Suppress the normal bill auto-print while eTIMS is live.
  useEffect(() => {
    if (typeof window !== 'undefined') window.__etimsFiscalActive = etimsActive;
    return () => { if (typeof window !== 'undefined') window.__etimsFiscalActive = false; };
  }, [etimsActive]);

  const run = async (orderId, sendToKra) => {
    try {
      const { fiscaliseAndPrint } = await import('../lib/etimsPrint');
      const res = await fiscaliseAndPrint({ restaurantId: restaurant.id, order: { id: orderId }, restaurant, printSettings, sendToKra });
      if (res && res.error && typeof onError === 'function') onError(res);
    } catch { /* never block the POS on fiscalisation */ }
  };

  // (2) On each completed bill: auto-fiscalise, or (opt-in) ask first.
  useEffect(() => {
    if (!etimsActive || !orderSuccess?.show || !orderSuccess?.orderId) return;
    const oid = orderSuccess.orderId;
    if (handledRef.current === oid) return; // already acted for this bill
    if (askPerBill) { setPrompt({ orderId: oid }); return; } // wait for the cashier's choice
    handledRef.current = oid;
    run(oid, true); // default: auto-send (previous behaviour, unchanged)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etimsActive, askPerBill, orderSuccess?.orderId, orderSuccess?.show, restaurant?.id]);

  const choose = (sendToKra) => {
    const oid = prompt && prompt.orderId;
    setPrompt(null);
    if (!oid) return;
    handledRef.current = oid;
    run(oid, sendToKra);
  };

  if (!prompt) return null;
  return (
    <div role="dialog" aria-modal="true"
      style={{ position: 'fixed', inset: 0, zIndex: 100001, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 380, background: '#fff', borderRadius: 18, padding: '26px 24px', boxShadow: '0 24px 70px rgba(0,0,0,0.4)', textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 6 }}>🇰🇪</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Send this bill to KRA?</div>
        <div style={{ fontSize: 13, color: '#64748b', margin: '8px 0 20px', lineHeight: 1.55 }}>
          <b>Yes</b> — report to KRA eTIMS and print the fiscal receipt (SDC ID, signature &amp; QR).<br />
          <b>No</b> — print a normal bill only; nothing is sent to KRA.
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={() => choose(false)}
            style={{ flex: 1, padding: '14px', fontSize: 15, fontWeight: 800, borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#334155', cursor: 'pointer' }}>
            No
          </button>
          <button type="button" onClick={() => choose(true)} autoFocus
            style={{ flex: 1, padding: '14px', fontSize: 15, fontWeight: 800, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', cursor: 'pointer' }}>
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}

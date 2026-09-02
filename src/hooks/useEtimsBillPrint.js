'use client';

/**
 * Kenya KRA eTIMS — REUSABLE "print a bill, KRA-aware" hook for ANY screen that has a
 * print-bill button (order history, tables, etc.). It mirrors OrderSummary's billing flow
 * EXACTLY, in one place, so the fiscalisation + "Send to KRA?" logic never has to be
 * copy-pasted per screen:
 *
 *   • eTIMS-active Kenya desktop (etimsActiveFor) → fiscalise the order against the local
 *     VSCU and print the combined bill + KRA fiscal receipt. If the store opted into the
 *     per-bill prompt (etimsAskPerBillFor) it asks "Send to KRA?" first; otherwise auto-sends.
 *   • Everywhere else (non-Kenya, web with no VSCU, eTIMS off) → calls the caller's own
 *     plainPrint(), i.e. the EXISTING non-fiscal print path — so current behaviour is unchanged.
 *   • If fiscalisation is somehow not applicable or errors, it falls back to plainPrint() too,
 *     so a bill ALWAYS comes out. Never throws.
 *
 * Usage:
 *   const { printBill, KraPrompt } = useEtimsBillPrint();
 *   // in a print handler:
 *   printBill({ restaurantId, order, restaurant, printSettings, plainPrint: () => <existing print> });
 *   // render once, anywhere in the page:  {KraPrompt}
 */

import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { etimsActiveFor, etimsAskPerBillFor } from '../lib/etimsDecision';

export function useEtimsBillPrint() {
  // ctx while awaiting the per-bill Yes/No answer: { restaurantId, order, restaurant, printSettings, plainPrint }
  const [kraPrompt, setKraPrompt] = useState(null);

  const runEtims = useCallback(async (ctx, sendToKra) => {
    try {
      // Dedup vs useAutoPrint (dedicated print terminals) — same signal OrderSummary sets.
      if (typeof window !== 'undefined' && ctx.order && ctx.order.id) window.__lastLocalPrintedBill = ctx.order.id;
      const { fiscaliseAndPrint } = await import('../lib/etimsPrint');
      const res = await fiscaliseAndPrint({
        restaurantId: ctx.restaurantId,
        order: ctx.order,
        restaurant: ctx.restaurant,
        printSettings: ctx.printSettings || {},
        sendToKra,
      });
      // Not actually applicable (not desktop / not Kenya) → nothing printed → do the normal bill.
      if (res && res.skipped) { try { await ctx.plainPrint(); } catch (_) {} }
    } catch (_) {
      // Fiscalisation path threw → never leave the user without a receipt.
      try { await ctx.plainPrint(); } catch (__) {}
    }
  }, []);

  const chooseKra = useCallback((sendToKra) => {
    setKraPrompt((cur) => {
      if (cur) runEtims(cur, sendToKra);
      return null;
    });
  }, [runEtims]);

  /**
   * Print a bill, KRA-aware. `order` needs at least { id }. `plainPrint` is the caller's existing
   * non-fiscal print (used when eTIMS is off / not applicable). Returns a promise.
   */
  const printBill = useCallback(async ({ restaurantId, order, restaurant, printSettings, plainPrint }) => {
    const doPlain = typeof plainPrint === 'function' ? plainPrint : () => {};
    // Only FINAL bills are fiscalised — a pre-bill / still-active table order is not a KRA sale yet
    // (the backend's prepare-sale enforces the same 'completed'|'paid' rule). Those print plainly.
    const isFinal = !!order && (order.status === 'completed' || order.status === 'paid');
    if (etimsActiveFor(restaurant) && order && order.id && isFinal) {
      const ctx = { restaurantId, order, restaurant, printSettings, plainPrint: doPlain };
      if (etimsAskPerBillFor(restaurant)) { setKraPrompt(ctx); return; }
      return runEtims(ctx, true);
    }
    return doPlain();
  }, [runEtims]);

  // The "Send to KRA?" modal — identical to OrderSummary's, portaled to <body> so it sits above
  // any overlay. Rendered only while a prompt is pending. Caller just drops {KraPrompt} in its JSX.
  const KraPrompt = (kraPrompt && typeof document !== 'undefined')
    ? createPortal(
        <div role="dialog" aria-modal="true"
          style={{ position: 'fixed', inset: 0, zIndex: 2147483000, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ width: '100%', maxWidth: 380, background: '#fff', borderRadius: 18, padding: '26px 24px', boxShadow: '0 24px 70px rgba(0,0,0,0.4)', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 6 }}>🇰🇪</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Send this bill to KRA?</div>
            <div style={{ fontSize: 13, color: '#64748b', margin: '8px 0 20px', lineHeight: 1.55 }}>
              <b>Yes</b> — report to KRA eTIMS and print the fiscal receipt (SDC ID, signature &amp; QR).<br />
              <b>No</b> — print a normal bill only; nothing is sent to KRA.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => chooseKra(false)}
                style={{ flex: 1, padding: '14px', fontSize: 15, fontWeight: 800, borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#334155', cursor: 'pointer' }}>
                No
              </button>
              <button type="button" onClick={() => chooseKra(true)} autoFocus
                style={{ flex: 1, padding: '14px', fontSize: 15, fontWeight: 800, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', cursor: 'pointer' }}>
                Yes
              </button>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return { printBill, KraPrompt };
}

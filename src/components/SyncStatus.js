'use client';

/**
 * SyncStatus — first-run sync loader + a persistent status pill, shown ONLY inside the
 * local-server POS app. On the very first sync it overlays a friendly progress screen
 * ("Menu ✓ · Staff ✓ · Orders 45…") with a "Continue in background" button so the cashier
 * can start working immediately; after that it collapses to a small always-on pill
 * (Synced / Syncing… / Offline). Web + the main app never mount this (no local server).
 */
import { useEffect, useState, useCallback, useRef } from 'react';
import { getLocalServerUrl, isLocalServerMode } from '../lib/localServer';

const LABELS = {
  orders: 'Orders', payments: 'Payments', menu_items: 'Menu', menus: 'Menu',
  staff_users: 'Staff', floors: 'Floor plan', tables: 'Tables', inventory: 'Inventory',
  customers: 'Customers', offers: 'Offers', recipes: 'Recipes', suppliers: 'Suppliers',
  daily_stats: 'Sales stats', cash_registers: 'Cash registers', shifts: 'Shifts',
};
const label = (t) => LABELS[t] || t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
const SHOWN_KEY = 'dineopen_first_sync_shown';

export default function SyncStatus() {
  const [prog, setProg] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const shownRef = useRef(typeof window !== 'undefined' && localStorage.getItem(SHOWN_KEY) === '1');

  const poll = useCallback(async () => {
    try {
      const base = getLocalServerUrl();
      if (!base) return;
      const r = await fetch(`${base}/api/local-server/sync-progress`);
      const j = await r.json();
      setProg(j);
      if (j.firstSyncDone && !shownRef.current) {
        shownRef.current = true;
        try { localStorage.setItem(SHOWN_KEY, '1'); } catch (_) {}
      }
    } catch (_) { /* offline / not local-server */ }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !isLocalServerMode()) return;
    poll();
    const fast = !shownRef.current; // poll quickly during the first-run loader, then relax
    const id = setInterval(poll, fast ? 1500 : 5000);
    return () => clearInterval(id);
  }, [poll]);

  if (typeof window === 'undefined' || !isLocalServerMode() || !prog) return null;

  const firstSyncDone = prog.firstSyncDone || shownRef.current;
  const showLoader = !firstSyncDone && !dismissed;

  // ── First-run loader overlay ──
  if (showLoader) {
    const cats = (prog.categories || []).filter((c) => c.rows > 0);
    return (
      <div style={S.overlay}>
        <div style={S.card}>
          <div style={S.spinnerWrap}><div style={S.spinner} /></div>
          <div style={S.title}>Setting up your restaurant</div>
          <div style={S.sub}>
            {prog.reachable ? 'Pulling your data from the cloud — this happens once.' : 'Waiting for internet to sync…'}
          </div>
          <div style={S.list}>
            {cats.length === 0 && <div style={S.catMuted}>Starting…</div>}
            {cats.map((c) => (
              <div key={c.table} style={S.catRow}>
                <span style={S.catDot} />
                <span style={S.catName}>{label(c.table)}</span>
                <span style={S.catCount}>{c.rows}</span>
              </div>
            ))}
          </div>
          <div style={S.totalRow}>
            <b>{prog.totalSynced || 0}</b>&nbsp;records synced{prog.running ? '…' : ''}
          </div>
          <button style={S.bgBtn} onClick={() => setDismissed(true)}>Continue to POS — keep syncing in background →</button>
          <div style={S.note}>Your data keeps syncing while you work.</div>
        </div>
        <style>{`@keyframes dspin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // ── Persistent status pill ──
  const state = !prog.reachable ? 'offline' : prog.running ? 'syncing' : 'synced';
  const dot = { synced: '#16A34A', syncing: '#DC4A3D', offline: '#C98A2B' }[state];
  const text = { synced: 'Synced', syncing: 'Syncing…', offline: 'Offline' }[state];
  return (
    <div style={S.pillWrap}>
      {expanded && (
        <div style={S.pop}>
          <div style={S.popHead}>Cloud sync</div>
          {(prog.categories || []).filter((c) => c.rows > 0).map((c) => (
            <div key={c.table} style={S.popRow}><span>{label(c.table)}</span><b>{c.rows}</b></div>
          ))}
          <div style={{ ...S.popRow, borderTop: '1px solid #EEE3D2', marginTop: 6, paddingTop: 6 }}>
            <span>Total</span><b>{prog.totalSynced || 0}</b>
          </div>
          <div style={S.popNote}>{prog.reachable ? 'Two-way sync active' : 'Offline — will sync when online'}</div>
        </div>
      )}
      <button style={S.pill} onClick={() => setExpanded((v) => !v)} title="Cloud sync status">
        <span style={{ ...S.pillDot, background: dot, ...(state === 'syncing' ? { animation: 'dspin 1s linear infinite' } : {}) }} />
        {text}
      </button>
    </div>
  );
}

const S = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(28,22,18,.55)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 9999, fontFamily: 'ui-sans-serif,-apple-system,sans-serif' },
  card: { width: 'min(92vw,380px)', background: '#fff', borderRadius: 22, padding: '30px 26px 22px', boxShadow: '0 20px 60px rgba(0,0,0,.3)', textAlign: 'center' },
  spinnerWrap: { display: 'grid', placeItems: 'center', marginBottom: 16 },
  spinner: { width: 44, height: 44, borderRadius: '50%', border: '4px solid #F1E4DE', borderTopColor: '#DC4A3D', animation: 'dspin .9s linear infinite' },
  title: { fontWeight: 800, fontSize: 21, color: '#2A211C', letterSpacing: '-.02em' },
  sub: { color: '#8A7D74', fontSize: 13.5, margin: '6px 0 18px' },
  list: { display: 'flex', flexDirection: 'column', gap: 7, textAlign: 'left', maxHeight: 190, overflowY: 'auto' },
  catRow: { display: 'flex', alignItems: 'center', gap: 10, background: '#F7F1E7', border: '1px solid #EEE3D2', borderRadius: 10, padding: '9px 12px' },
  catDot: { width: 8, height: 8, borderRadius: '50%', background: '#16A34A', flexShrink: 0 },
  catName: { fontSize: 13.5, fontWeight: 600, color: '#2A211C', flex: 1 },
  catCount: { fontSize: 13, fontWeight: 700, color: '#8A7D74', fontVariantNumeric: 'tabular-nums' },
  catMuted: { color: '#8A7D74', fontSize: 13, textAlign: 'center', padding: 10 },
  totalRow: { fontSize: 13.5, color: '#2A211C', margin: '16px 0 14px' },
  bgBtn: { width: '100%', background: '#DC4A3D', color: '#fff', border: 'none', borderRadius: 12, padding: '13px 12px', fontWeight: 800, fontSize: 13.5, cursor: 'pointer', lineHeight: 1.3 },
  note: { fontSize: 11.5, color: '#8A7D74', marginTop: 10 },
  pillWrap: { position: 'fixed', top: 9, left: '50%', transform: 'translateX(-50%)', zIndex: 9998, fontFamily: 'ui-sans-serif,-apple-system,sans-serif' },
  pill: { display: 'inline-flex', alignItems: 'center', gap: 7, background: '#fff', border: '1px solid #EAdfd0', borderRadius: 999, padding: '5px 12px', fontSize: 12, fontWeight: 700, color: '#2A211C', boxShadow: '0 2px 8px rgba(42,33,28,.10)', cursor: 'pointer' },
  pillDot: { width: 8, height: 8, borderRadius: '50%', display: 'inline-block' },
  pop: { position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 40, width: 220, background: '#fff', border: '1px solid #EAdfd0', borderRadius: 14, padding: '12px 14px', boxShadow: '0 12px 34px rgba(42,33,28,.18)' },
  popHead: { fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', color: '#8A7D74', marginBottom: 8 },
  popRow: { display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#2A211C', padding: '3px 0' },
  popNote: { fontSize: 11, color: '#8A7D74', marginTop: 8 },
};

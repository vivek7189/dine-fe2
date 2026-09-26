'use client';

// Recipe mapping — how every menu item uses stock (read-only view).
// Data: GET /api/recipes/:restaurantId/mapping (backend services/stockMappingService.js).
//   Sell-through = one stock item per sale · Recipe = ingredients per plate
//   Draft = AI-made recipe not yet reviewed (still deducts as before)
//   Not mapped = no setup, but a same-named stock item exists or another item's recipe is borrowed
//   Not tracked = selling it doesn't touch stock
import { useState, useEffect, useMemo, useCallback } from 'react';
import { FaSearch, FaSync, FaChevronDown, FaChevronRight, FaExclamationTriangle } from 'react-icons/fa';
import apiClient from '@/lib/api';

const STATUS = {
  mapped: { label: 'Mapped', color: '#047857', bg: '#ecfdf5' },
  draft: { label: 'Draft (AI)', color: '#b45309', bg: '#fffbeb' },
  not_mapped: { label: 'Not mapped', color: '#b91c1c', bg: '#fef2f2' },
  not_tracked: { label: 'Not tracked', color: '#6b7280', bg: '#f3f4f6' },
};
const FILTERS = [
  { id: 'all', label: 'All menu items' },
  { id: 'mapped', label: 'Mapped' },
  { id: 'draft', label: 'Draft (AI)' },
  { id: 'not_mapped', label: 'Not mapped' },
  { id: 'not_tracked', label: 'Not tracked' },
  { id: 'problems', label: 'Has problems' },
];
const PROBLEM_TEXT = {
  unit_mismatch: 'Unit does not match the stock item',
  no_stock_item: 'Not linked to any stock item',
  not_linked_exact_name_exists: 'Not linked (a stock item with this name exists)',
};

const fmtQty = (n) => (Number.isFinite(n) ? (Math.round(n * 1000) / 1000).toString() : '-');

function Tag({ status }) {
  const s = STATUS[status] || STATUS.not_tracked;
  return (
    <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999, color: s.color, background: s.bg, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
}

function setupText(row) {
  if (row.mode === 'sell_through') {
    const ing = row.ingredients.find(i => i.kind === 'stock');
    return ing ? `Sell-through · ${ing.name} × ${fmtQty(ing.quantity)} ${ing.unit || ''}`.trim() : 'Sell-through';
  }
  if (row.mode === 'recipe') return `Recipe · ${row.ingredients.length} ingredient${row.ingredients.length === 1 ? '' : 's'}`;
  return '—';
}

const btn = (kind) => ({
  padding: '6px 11px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
  border: kind === 'primary' ? '1.5px solid #dc2626' : '1.5px solid #e5e7eb',
  background: kind === 'primary' ? '#dc2626' : '#fff', color: kind === 'primary' ? '#fff' : '#374151',
});

// What the owner can do on a row, and the sentence shown before it is applied.
function actionFor(r) {
  if (r.switchedOff) return { type: 'switch_on', label: 'Switch on', confirm: `Selling ${r.name} will use its stock setup again.` };
  if (r.status === 'not_mapped' && r.suggestion) return { type: 'link_sell_through', label: 'Link as sell-through' };
  if (r.status === 'not_mapped' && r.borrowed) return { type: 'switch_off', label: 'Stop borrowing', confirm: `${r.name} will stop deducting the recipe "${r.borrowed.name || '(no name)'}". Selling it will not change stock until you set it up.` };
  if (r.status === 'draft') return { type: 'review', label: 'Review' };
  return null;
}

export default function RecipeMappingTab({ currentRestaurant, isMobile, canUpdate = true }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState({});
  const [pending, setPending] = useState(null); // { menuItemId, type, recipeId?, confirm? }
  const [qty, setQty] = useState('1');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null); // { ok, text }

  const load = useCallback(async () => {
    if (!currentRestaurant?.id) return;
    setLoading(true); setError(null);
    try {
      setData(await apiClient.getStockMapping(currentRestaurant.id));
    } catch (e) {
      setError(e.message || 'Could not load recipe mapping');
    } finally { setLoading(false); }
  }, [currentRestaurant?.id]);

  useEffect(() => { load(); }, [load]);

  const apply = async (row, body) => {
    setBusy(true); setNotice(null);
    try {
      const res = await apiClient.applyStockMappingAction(currentRestaurant.id, { menuItemId: row.menuItemId, ...body });
      setNotice({ ok: true, text: res.message || 'Saved' });
      setPending(null);
      await load();
    } catch (e) {
      setNotice({ ok: false, text: e.message || 'Could not save the change' });
    } finally { setBusy(false); }
  };

  const startAction = (row, a) => {
    setNotice(null);
    if (a.type === 'review') { setOpen(o => ({ ...o, [row.menuItemId]: true })); return; }
    if (a.type === 'link_sell_through') setQty('1');
    setPending({ menuItemId: row.menuItemId, type: a.type, confirm: a.confirm });
    setOpen(o => ({ ...o, [row.menuItemId]: true }));
  };

  const rows = useMemo(() => {
    const items = data?.items || [];
    const q = search.trim().toLowerCase();
    return items.filter(r => {
      if (filter === 'problems') { if (!(r.unitProblems > 0 || r.borrowed)) return false; }
      else if (filter !== 'all' && r.status !== filter) return false;
      if (q && !(`${r.name} ${r.category}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [data, filter, search]);

  const s = data?.summary || {};
  const countFor = (id) => id === 'all' ? s.total : id === 'problems' ? (data?.items || []).filter(r => r.unitProblems > 0 || r.borrowed).length : s[id];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1f2937' }}>Recipe mapping</h2>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6b7280', maxWidth: 640 }}>
            How each menu item uses stock when it is sold. This page only shows the current setup; nothing here changes stock.
          </p>
        </div>
        <button onClick={load} disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', background: '#fff', color: '#374151', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: loading ? 'wait' : 'pointer' }}>
          <FaSync size={12} style={loading ? { animation: 'spin 1s linear infinite' } : undefined} /> Refresh
        </button>
      </div>

      {notice && (
        <div style={{ padding: '11px 14px', borderRadius: 10, marginBottom: 14, fontSize: 13.5, fontWeight: 600,
          background: notice.ok ? '#ecfdf5' : '#fef2f2', color: notice.ok ? '#047857' : '#b91c1c' }}>{notice.text}</div>
      )}

      {error && (
        <div style={{ padding: '12px 14px', borderRadius: 10, background: '#fef2f2', color: '#b91c1c', fontSize: 14, marginBottom: 14 }}>{error}</div>
      )}

      {data?.sharedFrom && (
        <div style={{ padding: '11px 14px', borderRadius: 10, background: '#eff6ff', color: '#1e3a8a', fontSize: 13, marginBottom: 14 }}>
          This outlet uses another outlet&apos;s stock, so recipes and stock items shown here come from that outlet.
        </div>
      )}

      {(s.draft > 0) && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '11px 14px', borderRadius: 10, background: '#fffbeb', color: '#78350f', fontSize: 13, marginBottom: 14 }}>
          <FaExclamationTriangle style={{ marginTop: 2, flexShrink: 0 }} />
          <span><b>{s.draft} recipe{s.draft === 1 ? '' : 's'} made by AI.</b> They keep deducting exactly as today. Open one with Review to confirm it or switch it off.</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {FILTERS.map(f => {
          const active = filter === f.id;
          const n = countFor(f.id);
          return (
            <button key={f.id} onClick={() => setFilter(f.id)}
              style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: '8px 12px', borderRadius: 10, cursor: 'pointer', background: active ? '#fef2f2' : '#fff', border: `1.5px solid ${active ? '#dc2626' : '#e5e7eb'}` }}>
              <span style={{ fontSize: 17, fontWeight: 800, color: '#111827', fontVariantNumeric: 'tabular-nums' }}>{n ?? '–'}</span>
              <span style={{ fontSize: 12.5, color: '#6b7280', fontWeight: 600 }}>{f.label}</span>
            </button>
          );
        })}
      </div>

      <div style={{ position: 'relative', marginBottom: 14, maxWidth: 420 }}>
        <FaSearch size={13} style={{ position: 'absolute', left: 12, top: 12, color: '#9ca3af' }} />
        <input id="recipe-mapping-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search menu items"
          style={{ width: '100%', padding: '9px 12px 9px 34px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fff' }} />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflowX: 'auto', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5, minWidth: isMobile ? 640 : 0 }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['', 'Menu item', 'Stock setup', 'Status', 'Plates from stock', ''].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 11.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && !data && (
              <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>Loading…</td></tr>
            )}
            {data && rows.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>No menu items match.</td></tr>
            )}
            {rows.map(r => {
              const a = canUpdate ? actionFor(r) : null;
              const expandable = r.ingredients.length > 0 || r.suggestion || r.borrowed || r.switchedOff;
              const isOpen = !!open[r.menuItemId];
              const pend = pending && pending.menuItemId === r.menuItemId ? pending : null;
              return [
                <tr key={r.menuItemId} onClick={() => expandable && setOpen(o => ({ ...o, [r.menuItemId]: !o[r.menuItemId] }))}
                  style={{ borderBottom: '1px solid #f1f5f9', cursor: expandable ? 'pointer' : 'default' }}>
                  <td style={{ padding: '10px 6px 10px 12px', width: 22, color: '#9ca3af' }}>
                    {expandable ? (isOpen ? <FaChevronDown size={11} /> : <FaChevronRight size={11} />) : null}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 700, color: '#111827' }}>{r.name}</div>
                    {r.category && <div style={{ fontSize: 12, color: '#9ca3af' }}>{r.category}</div>}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#374151' }}>
                    {setupText(r)}
                    {r.unitProblems > 0 && <div style={{ fontSize: 12, color: '#b91c1c', fontWeight: 600 }}>{r.unitProblems} problem line{r.unitProblems === 1 ? '' : 's'}</div>}
                    {r.suggestion && <div style={{ fontSize: 12, color: '#374151' }}>Same-named stock item: <b>{r.suggestion.name}</b></div>}
                    {r.switchedOff && <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>Switched off by you — selling it does not change stock</div>}
                    {r.inactiveButDeducting && <div style={{ fontSize: 12, color: '#b45309', fontWeight: 600 }}>Marked inactive, but still deducts. Switch it off to stop.</div>}
                    {r.borrowed && (
                      <div style={{ fontSize: 12, color: '#b45309', fontWeight: 600 }}>
                        Today this deducts the recipe &quot;{r.borrowed.name || '(no name)'}&quot;{r.borrowed.ownedBy ? ` of ${r.borrowed.ownedBy}` : ''}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '10px 12px' }}><Tag status={r.status} /></td>
                  <td style={{ padding: '10px 12px', fontVariantNumeric: 'tabular-nums', color: r.platesPossible === 0 ? '#b91c1c' : '#374151', fontWeight: r.platesPossible === 0 ? 700 : 500 }}>
                    {r.platesPossible == null ? '—' : r.platesPossible}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                    {a && <button type="button" style={btn(a.type === 'link_sell_through' ? 'primary' : 'default')} disabled={busy} onClick={() => startAction(r, a)}>{a.label}</button>}
                  </td>
                </tr>,
                isOpen && (
                  <tr key={`${r.menuItemId}-d`} style={{ background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
                    <td />
                    <td colSpan={5} style={{ padding: '8px 12px 14px' }} onClick={e => e.stopPropagation()}>
                      {r.ingredients.length > 0 ? (
                        <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%' }}>
                          <thead>
                            <tr>{['Stock item', 'Per plate', 'In stock', ''].map(h => (
                              <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: 11, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>{h}</th>
                            ))}</tr>
                          </thead>
                          <tbody>
                            {r.ingredients.map((ing, i) => (
                              <tr key={i}>
                                <td style={{ padding: '5px 8px', color: '#111827' }}>{ing.name || '(unnamed)'}{ing.kind === 'subRecipe' ? ' · sub-recipe' : ''}</td>
                                <td style={{ padding: '5px 8px', fontVariantNumeric: 'tabular-nums' }}>{fmtQty(ing.quantity)} {ing.unit}</td>
                                <td style={{ padding: '5px 8px', fontVariantNumeric: 'tabular-nums', color: '#6b7280' }}>{ing.inStock == null ? '—' : `${fmtQty(ing.inStock)} ${ing.stockUnit || ''}`}</td>
                                <td style={{ padding: '5px 8px', color: '#b91c1c', fontWeight: 600, fontSize: 12 }}>{ing.problem ? (PROBLEM_TEXT[ing.problem] || ing.problem) : ''}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div style={{ fontSize: 13, color: '#6b7280' }}>
                          {r.switchedOff ? 'Switched off.' : 'No stock setup yet.'}{r.suggestion ? ` Stock item "${r.suggestion.name}" (${fmtQty(r.suggestion.inStock)} ${r.suggestion.unit}) has the same name.` : ''}
                        </div>
                      )}

                      {canUpdate && r.status === 'draft' && !pend && r.recipeId && (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                          <button type="button" style={btn('primary')} disabled={busy}
                            onClick={() => setPending({ menuItemId: r.menuItemId, type: 'confirm', recipeId: r.recipeId, confirm: `Confirm this recipe for ${r.name}? It keeps deducting these ingredients per plate.` })}>Confirm recipe</button>
                          <button type="button" style={btn()} disabled={busy}
                            onClick={() => setPending({ menuItemId: r.menuItemId, type: 'switch_off', recipeId: r.recipeId, confirm: `Switch off this recipe? Selling ${r.name} will no longer change stock.` })}>Switch off</button>
                        </div>
                      )}
                      {canUpdate && r.status === 'mapped' && !r.switchedOff && r.recipeId && !pend && (
                        <div style={{ marginTop: 10 }}>
                          <button type="button" style={btn()} disabled={busy}
                            onClick={() => setPending({ menuItemId: r.menuItemId, type: 'switch_off', recipeId: r.recipeId, confirm: `Switch off? Selling ${r.name} will no longer change stock.` })}>Switch off</button>
                        </div>
                      )}

                      {pend && (
                        <div style={{ marginTop: 12, padding: '12px 14px', border: '1.5px solid #fecaca', background: '#fff', borderRadius: 10, display: 'grid', gap: 10 }}>
                          {pend.type === 'link_sell_through' && r.suggestion ? (
                            <div style={{ fontSize: 13.5, color: '#111827', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              Each sale of <b>{r.name}</b> takes
                              <input id={`mapping-qty-${r.menuItemId}`} type="number" min="0.001" step="any" value={qty} onChange={e => setQty(e.target.value)}
                                style={{ width: 80, padding: '6px 8px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14 }} />
                              <b>{r.suggestion.unit || 'pcs'}</b> of <b>{r.suggestion.name}</b>
                            </div>
                          ) : (
                            <div style={{ fontSize: 13.5, color: '#111827' }}>{pend.confirm}</div>
                          )}
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button type="button" style={btn('primary')} disabled={busy || (pend.type === 'link_sell_through' && !(Number(qty) > 0))}
                              onClick={() => apply(r, pend.type === 'link_sell_through'
                                ? { action: 'link_sell_through', inventoryItemId: r.suggestion.inventoryItemId, quantity: Number(qty) }
                                : { action: pend.type, recipeId: pend.recipeId })}>
                              {busy ? 'Saving…' : 'Confirm'}
                            </button>
                            <button type="button" style={btn()} disabled={busy} onClick={() => setPending(null)}>Cancel</button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ),
              ];
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

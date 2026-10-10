'use client';

// Inventory → "Sold as is": the simple default. Every menu item; things you sell as they are (Coke,
// water, chips, beer) get Track + a count — each sale reduces it, 0 shows "out of stock" on POS / QR.
// Track re-uses a same-name stock item (no duplicates). Dishes made from ingredients use Recipes.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaSearch, FaPlus } from 'react-icons/fa';
import apiClient from '../../../../lib/api';

const fmt = (n) => (Math.round((Number(n) || 0) * 1000) / 1000).toLocaleString();
const chip = (on) => ({ padding: '6px 12px', borderRadius: 999, border: `1px solid ${on ? '#059669' : '#e5e7eb'}`, background: on ? '#ecfdf5' : '#fff', color: on ? '#047857' : '#4b5563', fontSize: 12.5, fontWeight: on ? 700 : 500, cursor: 'pointer' });
const smallInp = { width: 90, padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 };

export default function SoldAsIsTab({ restaurantId, isMobile, canUpdate, formatCurrency, onReceive, refreshKey, onMessage }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all'); // all | tracked | untracked | out
  const [selected, setSelected] = useState({}); // menuItemId → { openingStock, lowStock }
  const [busy, setBusy] = useState(false);
  const [stopId, setStopId] = useState(null);

  const load = useCallback(async () => {
    if (!restaurantId) return;
    try { setData(await apiClient.getSoldAsIs(restaurantId)); setError(''); }
    catch (e) { setError(e?.message || 'Could not load menu items.'); }
  }, [restaurantId]);
  useEffect(() => { load(); }, [load, refreshKey]);

  const items = data?.items || [];
  const stockOf = (i) => Number(i.linked ? i.linked.currentStock : i.stockQuantity) || 0;
  const lowOf = (i) => (i.lowStockThreshold != null ? Number(i.lowStockThreshold) : (i.linked ? i.linked.minStock : 0)) || 0;
  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return items.filter(i => (!t || i.name.toLowerCase().includes(t) || String(i.category).toLowerCase().includes(t))
      && (filter === 'all' || (filter === 'tracked' && i.tracked) || (filter === 'untracked' && !i.tracked) || (filter === 'out' && i.tracked && stockOf(i) <= 0)));
  }, [items, q, filter]);
  const nSel = Object.keys(selected).length;

  const track = async (entries, okText) => {
    setBusy(true); setError('');
    try {
      const r = await apiClient.trackSoldAsIs(restaurantId, entries);
      const bad = (r.results || []).filter(x => !x.ok);
      onMessage?.(bad.length ? `${entries.length - bad.length} done, ${bad.length} failed` : okText);
      setSelected({}); setStopId(null);
      await load();
    } catch (e) { setError(e?.message || 'Could not save.'); }
    finally { setBusy(false); }
  };
  const toggleSel = (i) => setSelected(s => { const n = { ...s }; if (n[i.id]) delete n[i.id]; else n[i.id] = { openingStock: i.match ? String(i.match.currentStock) : '', lowStock: '' }; return n; });
  const setSel = (id, k, v) => setSelected(s => ({ ...s, [id]: { ...s[id], [k]: v } }));

  if (!data && !error) return <div style={{ padding: 30, textAlign: 'center', color: '#9ca3af' }}>Loading menu items…</div>;
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #eef0f3', padding: isMobile ? 12 : 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#111827' }}>Sold as is</div>
          <div style={{ fontSize: 12.5, color: '#6b7280', maxWidth: 620 }}>
            Things you sell exactly as you buy them — Coke, water, chips, beer. Tick <b>Track</b> and enter how many you have: every sale reduces it, and at 0 it shows “out of stock”.
            Dishes made from ingredients (biryani, dosa) use <b>Recipes</b> instead.
          </div>
        </div>
        {data && <div style={{ fontSize: 12.5, color: '#374151' }}><b>{data.counts.tracked}</b> tracked · <b style={{ color: data.counts.outOfStock ? '#b91c1c' : '#374151' }}>{data.counts.outOfStock}</b> out of stock</div>}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 320 }}>
          <FaSearch style={{ position: 'absolute', left: 10, top: 10, color: '#9ca3af' }} size={12} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search menu items" style={{ width: '100%', padding: '7px 10px 7px 28px', border: '1px solid #d1d5db', borderRadius: 9, fontSize: 13, boxSizing: 'border-box' }} />
        </div>
        {[['all', 'All'], ['tracked', 'Tracked'], ['untracked', 'Not tracked'], ['out', 'Out of stock']].map(([k, l]) => <button key={k} type="button" onClick={() => setFilter(k)} style={chip(filter === k)}>{l}</button>)}
      </div>
      {error && <div style={{ fontSize: 13, color: '#b91c1c', background: '#fef2f2', borderRadius: 8, padding: '8px 10px', marginBottom: 10 }}>{error}</div>}

      {canUpdate && nSel > 0 && (
        <div style={{ border: '1px solid #a7f3d0', background: '#f0fdf4', borderRadius: 12, padding: 12, marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 8 }}>Track {nSel} item{nSel > 1 ? 's' : ''} — how many do you have now?</div>
          <div style={{ display: 'grid', gap: 6, maxHeight: 260, overflow: 'auto' }}>
            {Object.entries(selected).map(([id, v]) => {
              const it = items.find(i => i.id === id); if (!it) return null;
              return (
                <div key={id} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', fontSize: 13 }}>
                  <span style={{ flex: '1 1 160px', fontWeight: 600 }}>{it.name}{it.match ? <span style={{ color: '#047857', fontWeight: 500 }}> · uses your “{it.match.name}”</span> : null}</span>
                  <input type="number" min="0" step="any" inputMode="decimal" placeholder="Count" value={v.openingStock} onChange={e => setSel(id, 'openingStock', e.target.value)} style={smallInp} />
                  <input type="number" min="0" step="any" inputMode="decimal" placeholder="Warn below" value={v.lowStock} onChange={e => setSel(id, 'lowStock', e.target.value)} style={smallInp} />
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button type="button" disabled={busy} onClick={() => track(Object.entries(selected).map(([menuItemId, v]) => ({ menuItemId, track: true, openingStock: v.openingStock === '' ? 0 : Number(v.openingStock), ...(v.lowStock !== '' ? { lowStock: Number(v.lowStock) } : {}) })), `Tracking ${nSel} item${nSel > 1 ? 's' : ''}`)}
              style={{ padding: '8px 16px', borderRadius: 9, border: 'none', background: '#059669', color: '#fff', fontWeight: 800, cursor: 'pointer', opacity: busy ? 0.6 : 1 }}>{busy ? 'Saving…' : `Track ${nSel}`}</button>
            <button type="button" onClick={() => setSelected({})} style={{ padding: '8px 14px', borderRadius: 9, border: '1px solid #d1d5db', background: '#fff', fontWeight: 700, cursor: 'pointer' }}>Clear</button>
            <span style={{ fontSize: 12, color: '#6b7280' }}>Blank count = 0 (shows “out of stock” until you add stock).</span>
          </div>
        </div>
      )}

      {!shown.length ? <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>{items.length ? 'Nothing here.' : 'No menu items yet — add your menu first.'}</div> : (
        <div style={{ display: 'grid', gap: 6 }}>
          {shown.map(i => {
            const st = stockOf(i), lo = lowOf(i), out = i.tracked && st <= 0, isLow = i.tracked && !out && lo > 0 && st <= lo;
            return (
              <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '10px 12px', border: '1px solid #f1f5f9', borderRadius: 10, background: out ? '#fff7f7' : '#fff' }}>
                {canUpdate && !i.tracked && <input type="checkbox" checked={!!selected[i.id]} onChange={() => toggleSel(i)} aria-label={`Select ${i.name}`} />}
                <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: '#111827', fontSize: 14 }}>{i.name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{i.category}{i.price ? ` · ${formatCurrency ? formatCurrency(i.price) : i.price}` : ''}{i.hasRecipe ? ' · has a recipe' : ''}{i.variants ? ` · ${i.variants} sizes share one count` : ''}</div>
                </div>
                {i.tracked ? (
                  <>
                    <div style={{ minWidth: 110, textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: 15, color: out ? '#b91c1c' : isLow ? '#b45309' : '#047857' }}>{fmt(st)} {i.linked?.unit || i.stockUnit || 'pcs'}</div>
                      <div style={{ fontSize: 11.5, color: out ? '#b91c1c' : '#9ca3af' }}>{out ? 'Out of stock' : isLow ? `Low (below ${fmt(lo)})` : lo ? `warn below ${fmt(lo)}` : 'in stock'}</div>
                    </div>
                    {canUpdate && i.linked && <button type="button" onClick={() => onReceive?.({ kind: 'stock', item: { ...i.linked, name: i.linked.name } })} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 9, border: 'none', background: '#059669', color: '#fff', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}><FaPlus size={10} /> Receive</button>}
                    {canUpdate && (stopId === i.id ? (
                      <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', fontSize: 12 }}>
                        Stop tracking?
                        <button type="button" disabled={busy} onClick={() => track([{ menuItemId: i.id, track: false }], `${i.name}: tracking stopped`)} style={{ padding: '5px 10px', borderRadius: 8, border: 'none', background: '#b91c1c', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Yes</button>
                        <button type="button" onClick={() => setStopId(null)} style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>No</button>
                      </span>
                    ) : <button type="button" onClick={() => setStopId(i.id)} style={{ padding: '7px 10px', borderRadius: 9, border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', fontSize: 12, cursor: 'pointer' }}>Stop</button>)}
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: 12, color: '#9ca3af', minWidth: 110, textAlign: 'right' }}>{i.match ? `stock item “${i.match.name}”: ${fmt(i.match.currentStock)} ${i.match.unit}` : 'not tracked'}</span>
                    {canUpdate && <button type="button" onClick={() => onReceive?.({ kind: 'menu', item: i })} style={{ padding: '7px 12px', borderRadius: 9, border: '1.5px solid #059669', background: '#fff', color: '#047857', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>Track</button>}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

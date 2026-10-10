'use client';

// Receive stock — one sheet for "stock came in": search stock items AND menu items together.
//   • a stock item            → how much came in (or packs × pack size), cost, supplier, expiry, note
//                               → added (never a total), recorded in History, linked menu item back in stock
//   • a menu item not tracked → start tracking it as "sold as is" with how many you have now
//                               (re-uses a same-name stock item instead of creating a duplicate)
// A double press / retry adds only once (requestId).

import { useEffect, useMemo, useRef, useState } from 'react';
import { FaTimes, FaSearch, FaBox, FaUtensils } from 'react-icons/fa';
import apiClient from '../../../../lib/api';

const inp = { width: '100%', padding: '9px 11px', border: '1px solid #d1d5db', borderRadius: 9, fontSize: 14, boxSizing: 'border-box' };
const lbl = { display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 4 };
const newRequestId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
const fmt = (n) => (Math.round((Number(n) || 0) * 1000) / 1000).toLocaleString();

export default function ReceiveStockModal({ open, onClose, restaurantId, inventoryItems = [], preset = null, currencySymbol = '', onDone }) {
  const [sold, setSold] = useState(null);            // menu items (sold-as-is view), loaded on open
  const [q, setQ] = useState('');
  const [pick, setPick] = useState(null);             // { kind: 'stock', item } | { kind: 'menu', item }
  const [qty, setQty] = useState('');
  const [usePacks, setUsePacks] = useState(false);
  const [packs, setPacks] = useState('');
  const [packSize, setPackSize] = useState('');
  const [cost, setCost] = useState('');
  const [supplier, setSupplier] = useState('');
  const [expiry, setExpiry] = useState('');
  const [note, setNote] = useState('');
  const [low, setLow] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const reqId = useRef(newRequestId());

  useEffect(() => {
    if (!open) return;
    reqId.current = newRequestId();
    setQ(''); setQty(''); setUsePacks(false); setPacks(''); setPackSize(''); setCost(''); setSupplier(''); setExpiry(''); setNote(''); setLow(''); setError('');
    setPick(preset || null);
    if (restaurantId) apiClient.getSoldAsIs(restaurantId).then(r => setSold(r.items || [])).catch(() => setSold([]));
  }, [open, restaurantId, preset]);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    const linkedIds = new Set((sold || []).filter(m => m.linked).map(m => String(m.linked.id)));
    const stock = (inventoryItems || []).map(it => ({ kind: 'stock', item: it, key: 's' + (it.id || it._id), label: it.name,
      sub: `${fmt(it.currentStock)} ${it.unit || ''} in stock${linkedIds.has(String(it.id || it._id)) ? ' · sold as is' : ''}` }));
    const menu = (sold || []).filter(m => !m.tracked).map(m => ({ kind: 'menu', item: m, key: 'm' + m.id, label: m.name,
      sub: m.match ? `Menu item — will use your stock item "${m.match.name}" (${fmt(m.match.currentStock)} ${m.match.unit})` : 'Menu item — start tracking (sold as is)' }));
    const all = [...stock, ...menu];
    return (t ? all.filter(r => r.label.toLowerCase().includes(t)) : all).slice(0, 40);
  }, [q, inventoryItems, sold]);

  const totalQty = usePacks ? (Number(packs) || 0) * (Number(packSize) || 0) : Number(qty) || 0;
  const stockItem = pick?.kind === 'stock' ? pick.item : null;
  const menuItem = pick?.kind === 'menu' ? pick.item : null;

  const save = async () => {
    setError('');
    if (stockItem) {
      if (!(totalQty > 0)) return setError('Enter how much came in.');
      setBusy(true);
      try {
        const r = await apiClient.receiveStock(restaurantId, stockItem.id || stockItem._id, {
          quantity: totalQty, requestId: reqId.current,
          ...(cost !== '' ? { costPerUnit: Number(cost) } : {}),
          ...(supplier ? { supplier } : {}), ...(expiry ? { expiryDate: expiry } : {}), ...(note ? { note } : {}),
          ...(usePacks ? { packs: Number(packs), packSize: Number(packSize) } : {}),
        });
        onDone?.(`Added ${fmt(totalQty)} ${stockItem.unit || ''} to ${stockItem.name} — now ${fmt(r.currentStock)} ${r.unit || stockItem.unit || ''}`);
        onClose?.();
      } catch (e) { setError(e?.message || 'Could not add stock.'); }
      finally { setBusy(false); }
    } else if (menuItem) {
      if (qty === '' || !(Number(qty) >= 0)) return setError('Enter how many you have now (0 if none).');
      setBusy(true);
      try {
        const r = await apiClient.trackSoldAsIs(restaurantId, [{ menuItemId: menuItem.id, track: true, openingStock: Number(qty), ...(low !== '' ? { lowStock: Number(low) } : {}) }]);
        const res = (r.results || [])[0];
        if (!res || !res.ok) throw new Error(res?.error || 'Could not start tracking');
        onDone?.(`${menuItem.name} is now tracked${menuItem.match ? ` (using your stock item "${menuItem.match.name}")` : ''}.`);
        onClose?.();
      } catch (e) { setError(e?.message || 'Could not start tracking.'); }
      finally { setBusy(false); }
    }
  };

  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '92vh', overflow: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }}>
        <div style={{ padding: '14px 18px', background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '16px 16px 0 0' }}>
          <b style={{ fontSize: 16 }}>{menuItem ? 'Start tracking' : 'Receive stock'}</b>
          <button type="button" onClick={onClose} aria-label="Close" style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 8, width: 30, height: 30, cursor: 'pointer' }}><FaTimes /></button>
        </div>
        <div style={{ padding: 18, display: 'grid', gap: 12 }}>
          {!pick ? (
            <>
              <div style={{ position: 'relative' }}>
                <FaSearch style={{ position: 'absolute', left: 11, top: 12, color: '#9ca3af' }} size={13} />
                <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search a stock item or menu item (e.g. Coke)" style={{ ...inp, paddingLeft: 32 }} />
              </div>
              <div style={{ display: 'grid', gap: 6, maxHeight: 360, overflow: 'auto' }}>
                {sold === null && <span style={{ fontSize: 13, color: '#9ca3af' }}>Loading…</span>}
                {sold !== null && results.length === 0 && <span style={{ fontSize: 13, color: '#9ca3af' }}>Nothing matches. Add it as a new item from “+ Add item”.</span>}
                {results.map(r => (
                  <button key={r.key} type="button" onClick={() => { setPick(r); if (r.kind === 'menu' && r.item.match) setQty(String(r.item.match.currentStock || 0)); }}
                    style={{ display: 'flex', gap: 10, alignItems: 'center', textAlign: 'left', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 10, background: '#fff', cursor: 'pointer' }}>
                    <span style={{ width: 30, height: 30, borderRadius: 8, background: r.kind === 'stock' ? '#ecfdf5' : '#eef2ff', color: r.kind === 'stock' ? '#047857' : '#4338ca', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {r.kind === 'stock' ? <FaBox size={12} /> : <FaUtensils size={12} />}
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: 'block', fontWeight: 700, fontSize: 14, color: '#111827' }}>{r.label}</span>
                      <span style={{ display: 'block', fontSize: 12, color: '#6b7280' }}>{r.sub}</span>
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#f9fafb', borderRadius: 10 }}>
                <div>
                  <div style={{ fontWeight: 800, color: '#111827' }}>{(stockItem || menuItem).name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    {stockItem ? `${fmt(stockItem.currentStock)} ${stockItem.unit || ''} in stock now` : menuItem.match ? `Will use your stock item "${menuItem.match.name}" — ${fmt(menuItem.match.currentStock)} ${menuItem.match.unit}` : 'Menu item — each sale will reduce its stock'}
                  </div>
                </div>
                {!preset && <button type="button" onClick={() => setPick(null)} style={{ border: 'none', background: 'none', color: '#2563eb', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>Change</button>}
              </div>

              {stockItem && (
                <>
                  <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: '#374151' }}>
                    <input type="checkbox" checked={usePacks} onChange={e => setUsePacks(e.target.checked)} /> Came in packs / crates
                  </label>
                  {usePacks ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div><label style={lbl}>Packs</label><input type="number" min="0" step="any" inputMode="decimal" value={packs} onChange={e => setPacks(e.target.value)} style={inp} placeholder="5" /></div>
                      <div><label style={lbl}>{stockItem.unit || 'Units'} in one pack</label><input type="number" min="0" step="any" inputMode="decimal" value={packSize} onChange={e => setPackSize(e.target.value)} style={inp} placeholder="24" /></div>
                    </div>
                  ) : (
                    <div><label style={lbl}>How much came in ({stockItem.unit || 'units'})</label><input autoFocus type="number" min="0" step="any" inputMode="decimal" value={qty} onChange={e => setQty(e.target.value)} style={inp} placeholder="e.g. 24" /></div>
                  )}
                  {totalQty > 0 && <div style={{ fontSize: 12.5, color: '#047857', fontWeight: 600 }}>Adds {fmt(totalQty)} {stockItem.unit || ''} → {fmt((Number(stockItem.currentStock) || 0) + totalQty)} {stockItem.unit || ''} in stock</div>}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div><label style={lbl}>Cost per {stockItem.unit || 'unit'} {currencySymbol ? `(${currencySymbol})` : ''}</label><input type="number" min="0" step="any" inputMode="decimal" value={cost} onChange={e => setCost(e.target.value)} style={inp} placeholder={stockItem.costPerUnit ? String(stockItem.costPerUnit) : 'optional'} /></div>
                    <div><label style={lbl}>Expiry (optional)</label><input type="date" value={expiry} onChange={e => setExpiry(e.target.value)} style={inp} /></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div><label style={lbl}>Supplier (optional)</label><input value={supplier} onChange={e => setSupplier(e.target.value)} style={inp} placeholder={stockItem.supplier || ''} /></div>
                    <div><label style={lbl}>Note (optional)</label><input value={note} onChange={e => setNote(e.target.value)} style={inp} placeholder="Bill no. …" /></div>
                  </div>
                </>
              )}
              {menuItem && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div><label style={lbl}>How many do you have now?</label><input autoFocus type="number" min="0" step="any" inputMode="decimal" value={qty} onChange={e => setQty(e.target.value)} style={inp} placeholder="e.g. 48" /></div>
                  <div><label style={lbl}>Warn me below (optional)</label><input type="number" min="0" step="any" inputMode="decimal" value={low} onChange={e => setLow(e.target.value)} style={inp} placeholder="e.g. 10" /></div>
                  {Number(qty) === 0 && qty !== '' && <div style={{ gridColumn: '1 / -1', fontSize: 12, color: '#b45309' }}>With 0 it shows “out of stock” until you add stock.</div>}
                </div>
              )}
              {error && <div style={{ fontSize: 13, color: '#b91c1c', background: '#fef2f2', borderRadius: 8, padding: '8px 10px' }}>{error}</div>}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" onClick={onClose} style={{ padding: '9px 16px', borderRadius: 9, border: '1px solid #d1d5db', background: '#fff', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                <button type="button" disabled={busy} onClick={save} style={{ padding: '9px 18px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', fontWeight: 800, cursor: 'pointer', opacity: busy ? 0.6 : 1 }}>
                  {busy ? 'Saving…' : stockItem ? 'Add stock' : 'Start tracking'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

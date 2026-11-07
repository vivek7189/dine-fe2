'use client';

// Stock on the kitchen screen (kitchen display login, setting `stock`: view | deduct — backend
// GET /api/kitchen-display/stock and POST /api/kitchen-display/stock/:itemId/use). Full-screen panel:
// search + "Low only", each item with how much is left; with deduct the cook can take stock out as
// Used or Wasted (logged in Inventory as from the kitchen screen). Big touch targets for a kitchen tablet.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaTimes, FaSearch, FaSpinner } from 'react-icons/fa';
import apiClient from '../lib/api';

const fmt = (n) => String(Math.round((Number(n) || 0) * 1000) / 1000);

export default function KitchenStockPanel({ onClose }) {
  const [data, setData] = useState(null); // { canDeduct, items } | { error }
  const [q, setQ] = useState('');
  const [lowOnly, setLowOnly] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [qty, setQty] = useState('');
  const [kind, setKind] = useState('used');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null); // { ok, text }

  const load = useCallback(async () => {
    try {
      const r = await apiClient.request('/api/kitchen-display/stock');
      setData(r && r.success ? { canDeduct: !!r.canDeduct, items: r.items || [] } : { error: (r && r.error) || 'Could not load stock' });
    } catch (e) {
      setData({ error: e?.message || 'Could not load stock' });
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const list = useMemo(() => {
    const items = data?.items || [];
    const s = q.trim().toLowerCase();
    return items.filter(it => (!lowOnly || it.status === 'low') && (!s || it.name.toLowerCase().includes(s) || (it.category || '').toLowerCase().includes(s)));
  }, [data, q, lowOnly]);

  const openRow = (id) => { setOpenId(openId === id ? null : id); setQty(''); setKind('used'); setNote(''); setMsg(null); };

  const save = async (it) => {
    const n = Number(qty);
    if (!Number.isFinite(n) || n <= 0) { setMsg({ ok: false, text: 'Enter how much (above 0).' }); return; }
    setBusy(true); setMsg(null);
    try {
      const r = await apiClient.request(`/api/kitchen-display/stock/${encodeURIComponent(it.id)}/use`, {
        method: 'POST', body: JSON.stringify({ quantity: n, kind, note: note.trim() || undefined }),
      });
      if (!r || !r.success) throw new Error((r && r.error) || 'Could not update stock');
      setData(d => ({ ...d, items: d.items.map(x => (x.id === it.id ? { ...x, ...r.item } : x)) }));
      setMsg({ ok: true, text: `${kind === 'wasted' ? 'Wasted' : 'Used'} ${fmt(n)} ${it.unit} of ${it.name} — ${fmt(r.item.currentStock)} ${it.unit} left` });
      setOpenId(null);
    } catch (e) {
      setMsg({ ok: false, text: e?.message || 'Could not update stock' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: '#f9fafb', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: '#111827', color: 'white' }}>
        <div style={{ fontWeight: 800, fontSize: 17, flex: 1 }}>Stock</div>
        <button type="button" onClick={onClose} aria-label="Close stock"
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 9, border: '1px solid #374151', background: 'transparent', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          <FaTimes size={13} /> Close
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '12px 16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '1 1 220px', display: 'flex', alignItems: 'center', gap: 8, background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, padding: '0 12px' }}>
          <FaSearch size={13} color="#9ca3af" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search item"
            style={{ flex: 1, border: 'none', outline: 'none', padding: '11px 0', fontSize: 15, background: 'transparent' }} />
        </div>
        <button type="button" onClick={() => setLowOnly(!lowOnly)}
          style={{ padding: '10px 14px', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', border: lowOnly ? '1px solid #dc2626' : '1px solid #e5e7eb', background: lowOnly ? '#fef2f2' : 'white', color: lowOnly ? '#b91c1c' : '#374151' }}>
          Low only
        </button>
      </div>

      {msg && (
        <div style={{ margin: '0 16px 8px', padding: '10px 12px', borderRadius: 10, fontSize: 14, fontWeight: 600, background: msg.ok ? '#ecfdf5' : '#fef2f2', color: msg.ok ? '#047857' : '#b91c1c' }}>{msg.text}</div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px' }}>
        {!data ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}><FaSpinner className="animate-spin" size={22} /></div>
        ) : data.error ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#b91c1c', fontWeight: 600 }}>{data.error}</div>
        ) : list.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>{(data.items || []).length ? 'No items match.' : 'No stock items yet.'}</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {list.map((it) => {
              const low = it.status === 'low';
              const open = openId === it.id;
              return (
                <div key={it.id} style={{ background: 'white', border: `1px solid ${low ? '#fecaca' : '#e5e7eb'}`, borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.name}</div>
                      {it.category && <div style={{ fontSize: 12, color: '#9ca3af' }}>{it.category}</div>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: low ? '#b91c1c' : '#111827', fontVariantNumeric: 'tabular-nums' }}>{fmt(it.currentStock)} <span style={{ fontSize: 13, fontWeight: 600, color: '#6b7280' }}>{it.unit}</span></div>
                      {low && <div style={{ fontSize: 11, fontWeight: 700, color: '#b91c1c' }}>LOW (min {fmt(it.minStock)})</div>}
                    </div>
                    {data.canDeduct && (
                      <button type="button" onClick={() => openRow(it.id)}
                        style={{ padding: '10px 14px', borderRadius: 10, border: 'none', background: open ? '#e5e7eb' : '#111827', color: open ? '#111827' : 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                        {open ? 'Cancel' : 'Take out'}
                      </button>
                    )}
                  </div>
                  {open && (
                    <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                      <div style={{ display: 'flex', borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                        {[['used', 'Used'], ['wasted', 'Wasted']].map(([k, label]) => (
                          <button key={k} type="button" onClick={() => setKind(k)}
                            style={{ padding: '10px 14px', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', background: kind === k ? (k === 'wasted' ? '#dc2626' : '#111827') : 'white', color: kind === k ? 'white' : '#374151' }}>
                            {label}
                          </button>
                        ))}
                      </div>
                      <input type="number" inputMode="decimal" min="0" step="any" value={qty} onChange={(e) => setQty(e.target.value)} placeholder={`How much (${it.unit || 'qty'})`}
                        style={{ width: 150, padding: '10px 12px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 15 }} />
                      <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={140} placeholder="Note (optional)"
                        style={{ flex: '1 1 160px', padding: '10px 12px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 15 }} />
                      <button type="button" disabled={busy} onClick={() => save(it)}
                        style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: '#16a34a', color: 'white', fontWeight: 800, fontSize: 15, cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1 }}>
                        {busy ? 'Saving…' : 'Save'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

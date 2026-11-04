'use client';

// "Today's prices" — change many prices (incl. each size: 500 g / 1 kg, Half / Full) and sold-out in
// one screen, for shops whose prices move daily (meat, fish, vegetables, sweets). Saves ONLY the
// items that changed, one by one, through the same PATCH /api/menus/item/:id the Menu page uses, so
// the server's menu permissions apply as-is. Sizes are re-sent whole with only the price changed
// (cost, recipe multiplier and multi-tier prices kept). The menu is shared, so a save shows at once
// on the POS, the QR menu and the WhatsApp order bot.
import { useMemo, useState } from 'react';
import { FaTimes, FaSearch } from 'react-icons/fa';
import apiClient from '../lib/api';

const num = (s) => {
  const t = String(s ?? '').trim();
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return null;
  return parseFloat(t);
};
const same = (a, b) => Math.round(Number(a) * 100) === Math.round(Number(b) * 100);

export default function TodaysPricesEditor({ items, currencySymbol = '₹', canEditPrice, canMarkOutOfStock, isOnline = true, restaurantId, onItemSaved, onClose }) {
  const [q, setQ] = useState('');
  // draft: itemId → { price?: string, variants?: { [index]: string }, isAvailable?: boolean }
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  const [confirmClose, setConfirmClose] = useState(false);

  const list = useMemo(() => (items || []).filter((it) => it && it.id && it.status !== 'deleted'), [items]);

  // Grouped by category in menu order, filtered by search.
  const groups = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const m = new Map();
    list.forEach((it) => {
      if (ql && !String(it.name || '').toLowerCase().includes(ql)) return;
      const c = it.category || 'Other';
      if (!m.has(c)) m.set(c, []);
      m.get(c).push(it);
    });
    return [...m.entries()];
  }, [list, q]);

  const setField = (id, patch) => { setDone(''); setDraft((d) => ({ ...d, [id]: { ...(d[id] || {}), ...patch } })); };
  const setVariant = (id, i, val) => { setDone(''); setDraft((d) => ({ ...d, [id]: { ...(d[id] || {}), variants: { ...((d[id] || {}).variants || {}), [i]: val } } })); };

  // What would be sent for one item, or null if nothing changed. { patch, invalid }
  const changeFor = (it) => {
    const d = draft[it.id];
    if (!d) return null;
    const patch = {};
    let invalid = false;
    const vs = Array.isArray(it.variants) ? it.variants : [];
    if (vs.length > 0 && d.variants) {
      let changed = false;
      const next = vs.map((v, i) => {
        if (d.variants[i] === undefined) return v;
        const n = num(d.variants[i]);
        if (n === null || n <= 0) { invalid = true; return v; }
        if (!same(n, v.price)) changed = true;
        return { ...v, price: n };
      });
      if (changed) {
        patch.variants = next;
        // Base price follows the first size when it did before (how menus are usually set up).
        if (same(it.price, vs[0].price) && !same(next[0].price, vs[0].price)) patch.price = next[0].price;
      }
    } else if (d.price !== undefined) {
      const n = num(d.price);
      if (n === null || n <= 0) invalid = true;
      else if (!same(n, it.price)) patch.price = n;
    }
    if (d.isAvailable !== undefined && d.isAvailable !== (it.isAvailable !== false)) patch.isAvailable = d.isAvailable;
    if (invalid) return { patch, invalid: true };
    return Object.keys(patch).length ? { patch, invalid: false } : null;
  };

  const changes = list.map((it) => ({ it, ch: changeFor(it) })).filter((x) => x.ch);
  const invalidCount = changes.filter((x) => x.ch.invalid).length;
  const toSave = changes.filter((x) => !x.ch.invalid);

  const save = async () => {
    if (!isOnline) { setError('You are offline. Go online to save prices.'); return; }
    if (invalidCount) { setError('Fix the prices marked in red first (numbers only, more than 0).'); return; }
    setSaving(true); setError(''); setDone('');
    let ok = 0;
    for (const { it, ch } of toSave) {
      setProgress(`Saving ${ok + 1} of ${toSave.length}…`);
      try {
        await apiClient.updateMenuItem(it.id, ch.patch, restaurantId);
        ok += 1;
        if (onItemSaved) onItemSaved(it.id, ch.patch);
        setDraft((d) => { const n = { ...d }; delete n[it.id]; return n; });
      } catch (e) {
        setError(`Saved ${ok} of ${toSave.length}. Could not save "${it.name}": ${e?.message || 'error'}. Your other changes are still here, press Save again.`);
        setSaving(false); setProgress('');
        return;
      }
    }
    setSaving(false); setProgress('');
    setDone(`${ok} item${ok === 1 ? '' : 's'} updated. Live now on POS, QR menu and WhatsApp.`);
  };

  const requestClose = () => {
    if (saving) return;
    if (changes.length && !confirmClose) { setConfirmClose(true); return; }
    onClose && onClose();
  };

  const inputStyle = (bad, changed) => ({
    width: 84, padding: '7px 8px', borderRadius: 8, fontSize: 15, fontWeight: 600, textAlign: 'right',
    border: `1.5px solid ${bad ? '#ef4444' : changed ? '#f59e0b' : '#e5e7eb'}`,
    background: bad ? '#fef2f2' : changed ? '#fffbeb' : (canEditPrice ? 'white' : '#f9fafb'),
    color: '#111827', outline: 'none',
  });

  const priceBox = (it, i, label, original, value, onChange) => {
    const shown = value !== undefined ? value : String(original ?? '');
    const n = value !== undefined ? num(value) : null;
    const bad = value !== undefined && (n === null || n <= 0);
    const changed = value !== undefined && !bad && !same(n, original);
    return (
      <label key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginRight: 10, marginTop: 6 }}>
        {label ? <span style={{ fontSize: 12, color: '#6b7280', minWidth: 44 }}>{label}</span> : null}
        <span style={{ fontSize: 13, color: '#9ca3af' }}>{currencySymbol}</span>
        <input type="text" inputMode="decimal" value={shown} disabled={!canEditPrice || saving}
          onChange={(e) => onChange(e.target.value)} style={inputStyle(bad, changed)} aria-label={`${it.name} ${label || 'price'}`} />
      </label>
    );
  };

  return (
    <div onClick={requestClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ background: 'white', borderRadius: 18, width: '100%', maxWidth: 640, maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 18px', borderBottom: '1px solid #f1f5f9' }}>
          <span aria-hidden style={{ fontSize: 20 }}>🏷️</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 17, color: '#111827' }}>Today&apos;s prices</div>
            <div style={{ fontSize: 12.5, color: '#6b7280' }}>Change prices and sold-out in one go. Shows at once on POS, QR menu and WhatsApp.</div>
          </div>
          <button onClick={requestClose} aria-label="Close" style={{ border: 'none', background: '#f3f4f6', borderRadius: 10, width: 34, height: 34, cursor: 'pointer' }}><FaTimes /></button>
        </div>

        <div style={{ padding: '10px 18px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #e5e7eb', borderRadius: 10, padding: '7px 10px' }}>
            <FaSearch style={{ color: '#9ca3af' }} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search item" style={{ border: 'none', outline: 'none', flex: 1, fontSize: 14 }} />
          </div>
          {!canEditPrice && <div style={{ fontSize: 12, color: '#92400e', marginTop: 6 }}>You can mark items sold out. Changing prices needs menu edit permission.</div>}
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '4px 18px 12px' }}>
          {groups.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: '#6b7280', fontSize: 14 }}>No items found.</div>}
          {groups.map(([cat, its]) => (
            <div key={cat}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '12px 0 4px' }}>{cat}</div>
              {its.map((it) => {
                const d = draft[it.id] || {};
                const vs = Array.isArray(it.variants) ? it.variants : [];
                const avail = d.isAvailable !== undefined ? d.isAvailable : it.isAvailable !== false;
                return (
                  <div key={it.id} style={{ padding: '10px 0', borderBottom: '1px solid #f3f4f6', opacity: avail ? 1 : 0.75 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0, fontWeight: 600, fontSize: 14.5, color: '#111827' }}>{it.name}</div>
                      {canMarkOutOfStock && (
                        <button type="button" disabled={saving} onClick={() => setField(it.id, { isAvailable: !avail })}
                          style={{ flexShrink: 0, border: `1px solid ${avail ? '#bbf7d0' : '#fecaca'}`, background: avail ? '#f0fdf4' : '#fef2f2', color: avail ? '#15803d' : '#b91c1c', borderRadius: 999, padding: '5px 12px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                          {avail ? '● In stock' : '○ Sold out'}
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                      {vs.length > 0
                        ? vs.map((v, i) => priceBox(it, i, v.name, v.price, (d.variants || {})[i], (val) => setVariant(it.id, i, val)))
                        : priceBox(it, 0, '', it.price, d.price, (val) => setField(it.id, { price: val }))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div style={{ padding: '12px 18px', borderTop: '1px solid #f1f5f9', background: '#fafafa', borderRadius: '0 0 18px 18px' }}>
          {error && <div style={{ fontSize: 13, color: '#b91c1c', marginBottom: 8 }}>{error}</div>}
          {done && <div style={{ fontSize: 13, color: '#15803d', marginBottom: 8 }}>✓ {done}</div>}
          {!isOnline && <div style={{ fontSize: 13, color: '#92400e', marginBottom: 8 }}>You are offline. Go online to save.</div>}
          {confirmClose ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ flex: 1, fontSize: 13.5, color: '#374151' }}>You have {changes.length} unsaved change{changes.length === 1 ? '' : 's'}. Close without saving?</span>
              <button onClick={() => setConfirmClose(false)} style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontWeight: 600 }}>Keep editing</button>
              <button onClick={() => onClose && onClose()} style={{ padding: '9px 14px', borderRadius: 10, border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: 600 }}>Discard</button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ flex: 1, fontSize: 13, color: '#6b7280' }}>
                {saving ? progress : changes.length ? `${changes.length} item${changes.length === 1 ? '' : 's'} changed${invalidCount ? ` · ${invalidCount} to fix` : ''}` : 'No changes yet'}
              </span>
              <button onClick={save} disabled={saving || !toSave.length || invalidCount > 0 || !isOnline}
                style={{ padding: '10px 18px', borderRadius: 10, border: 'none', fontWeight: 700, fontSize: 14, cursor: saving || !toSave.length || invalidCount || !isOnline ? 'not-allowed' : 'pointer', background: saving || !toSave.length || invalidCount || !isOnline ? '#e5e7eb' : '#ef4444', color: saving || !toSave.length || invalidCount || !isOnline ? '#9ca3af' : 'white' }}>
                {saving ? 'Saving…' : `Save${toSave.length ? ` ${toSave.length}` : ''}`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

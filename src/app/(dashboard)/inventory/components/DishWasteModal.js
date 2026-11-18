'use client';

// Waste → "Waste a dish": a whole plate thrown away (dropped, returned, burnt). Its recipe ingredients
// come off stock by the same rules as a sale (size / sub-recipes / units), each saved as a waste entry.
// The server works out the ingredients; this screen shows them before anything is saved.
import { useEffect, useMemo, useState } from 'react';
import { FaTimes, FaSearch, FaUtensils } from 'react-icons/fa';
import apiClient from '../../../../lib/api';
import { fmtQty } from '../utils/formatQty';

const REASONS = [
  { value: 'damaged', label: 'Dropped / damaged' },
  { value: 'spillage', label: 'Spillage' },
  { value: 'leftover', label: 'Returned by customer' },
  { value: 'staff_meal', label: 'Staff meal' },
  { value: 'complimentary', label: 'Complimentary' },
  { value: 'expired', label: 'Expired' },
  { value: 'other', label: 'Other' },
];

const label = { fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' };
const input = { width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#fff' };

export default function DishWasteModal({ open, onClose, onSaved, restaurantId, menuItems = [], formatCurrency }) {
  const [search, setSearch] = useState('');
  const [dish, setDish] = useState(null);
  const [variantName, setVariantName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [reason, setReason] = useState('damaged');
  const [notes, setNotes] = useState('');
  const [preview, setPreview] = useState(null);
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setSearch(''); setDish(null); setVariantName(''); setQuantity('1'); setReason('damaged'); setNotes(''); setPreview(null); setError('');
  }, [open]);

  const matches = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = (menuItems || []).filter(m => m && m.id && m.name);
    return (q ? list.filter(m => m.name.toLowerCase().includes(q)) : list).slice(0, 30);
  }, [menuItems, search]);

  const variants = (dish && Array.isArray(dish.variants)) ? dish.variants.filter(v => v && v.name) : [];
  const qty = Number(quantity);

  // Ask the server what this would take from stock whenever the choice changes.
  useEffect(() => {
    if (!open || !dish || !(qty > 0) || (variants.length > 0 && !variantName)) { setPreview(null); return; }
    let live = true;
    setChecking(true); setError('');
    const t = setTimeout(async () => {
      try {
        const r = await apiClient.wasteDish(restaurantId, { menuItemId: dish.id, variantName: variantName || undefined, quantity: qty, preview: true });
        if (live) setPreview(r);
      } catch (e) {
        if (live) { setPreview(null); setError(e.message || 'Could not work out the ingredients'); }
      } finally { if (live) setChecking(false); }
    }, 300);
    return () => { live = false; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, dish, variantName, qty, restaurantId]);

  if (!open) return null;

  const save = async () => {
    if (!preview || saving) return;
    setSaving(true); setError('');
    try {
      await apiClient.wasteDish(restaurantId, { menuItemId: dish.id, variantName: variantName || undefined, quantity: qty, reason, notes });
      onSaved && onSaved();
      onClose();
    } catch (e) {
      setError(e.message || 'Could not save');
    } finally { setSaving(false); }
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} data-testid="dish-waste-modal" style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 520, maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #e5e7eb' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Waste a dish</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Its recipe ingredients come off stock, the same as when it is sold.</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 6 }}><FaTimes /></button>
        </div>

        <div style={{ padding: 18, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {!dish ? (
            <div>
              <span style={label}>Dish</span>
              <div style={{ position: 'relative' }}>
                <FaSearch size={12} style={{ position: 'absolute', left: 12, top: 13, color: '#9ca3af' }} />
                <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search the menu" style={{ ...input, paddingLeft: 32 }} />
              </div>
              <div style={{ marginTop: 8, border: '1px solid #e5e7eb', borderRadius: 8, maxHeight: 260, overflowY: 'auto' }}>
                {matches.length === 0 && <div style={{ padding: 14, fontSize: 13, color: '#9ca3af' }}>No dish found</div>}
                {matches.map(m => (
                  <button key={m.id} onClick={() => { setDish(m); setVariantName(''); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', padding: '10px 12px', background: '#fff', border: 'none', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', fontSize: 14, color: '#111827' }}>
                    <FaUtensils size={11} color="#9ca3af" /> {m.name}
                    {m.category && <span style={{ marginLeft: 'auto', fontSize: 11, color: '#9ca3af' }}>{m.category}</span>}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px' }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{dish.name}</span>
                <button onClick={() => { setDish(null); setPreview(null); }} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Change</button>
              </div>

              {variants.length > 0 && (
                <div>
                  <span style={label}>Size</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {variants.map(v => (
                      <button key={v.name} onClick={() => setVariantName(v.name)} style={{ padding: '7px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: variantName === v.name ? '2px solid #059669' : '1px solid #d1d5db', background: variantName === v.name ? '#ecfdf5' : '#fff', color: '#111827' }}>{v.name}</button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 110 }}>
                  <span style={label}>How many</span>
                  <input type="number" min="1" step="1" inputMode="numeric" value={quantity} onChange={e => setQuantity(e.target.value)} style={input} />
                </div>
                <div style={{ flex: 1 }}>
                  <span style={label}>Reason</span>
                  <select value={reason} onChange={e => setReason(e.target.value)} style={input}>
                    {REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <span style={label}>Note (optional)</span>
                <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. dropped while plating" style={input} maxLength={300} />
              </div>

              <div>
                <span style={label}>Comes off stock</span>
                {variants.length > 0 && !variantName && <div style={{ fontSize: 13, color: '#9ca3af' }}>Pick a size first.</div>}
                {checking && <div style={{ fontSize: 13, color: '#6b7280' }}>Working it out…</div>}
                {!checking && preview && (
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                    {preview.lines.map(l => (
                      <div key={l.inventoryItemId} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '8px 12px', borderBottom: '1px solid #f3f4f6', fontSize: 13 }}>
                        <span style={{ color: '#111827' }}>{l.name}</span>
                        <span style={{ color: '#374151', whiteSpace: 'nowrap' }}>
                          {fmtQty(l.quantity)} {l.unit}
                          {l.quantity > l.inStock && <span style={{ color: '#b45309', marginLeft: 6, fontSize: 11 }}>(only {fmtQty(l.inStock)} in stock)</span>}
                          <span style={{ color: '#ef4444', marginLeft: 10, fontWeight: 600 }}>{formatCurrency ? formatCurrency(l.value) : l.value}</span>
                        </span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 12px', background: '#f9fafb', fontSize: 13, fontWeight: 700 }}>
                      <span>Total waste</span>
                      <span style={{ color: '#ef4444' }}>{formatCurrency ? formatCurrency(preview.totalValue) : preview.totalValue}</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {error && <div role="alert" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 8, padding: '9px 12px', fontSize: 13 }}>{error}</div>}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '12px 18px', borderTop: '1px solid #e5e7eb' }}>
          <button onClick={onClose} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
          <button onClick={save} disabled={!preview || checking || saving} data-testid="dish-waste-save" style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: !preview || checking || saving ? '#9ca3af' : '#dc2626', color: '#fff', fontSize: 13, fontWeight: 700, cursor: !preview || checking || saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Saving…' : 'Record waste'}
          </button>
        </div>
      </div>
    </div>
  );
}

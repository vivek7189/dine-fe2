'use client';

// "Stock" section of the menu item form: how selling this item uses stock.
//   Not tracked  — selling it doesn't touch stock
//   Sell-through — each sale takes a quantity of ONE stock item:
//                    • an existing stock item (saved as a confirmed 1:1 link), or
//                    • "create a stock item for this dish" = the classic Track stock count
//                      (formData.isStockManaged; its fields stay in the form below this section)
//   Recipe       — ingredients per plate from stock (units checked before saving)
// The menu item itself is saved exactly as before; the setup is saved through
// POST /api/recipes/:rid/mapping/action { action: 'set_setup' } (see menu/page.js handleSubmit).
// Stock COUNTS are never written from here.
import { useEffect, useMemo, useState } from 'react';
import apiClient from '@/lib/api';
import { UNIT_CONVERSIONS } from '../../inventory/utils/unitConversion';

const normUnit = (u) => String(u || '').toLowerCase().trim();
export function unitsCompatible(unit, stockUnit) {
  const a = normUnit(unit), b = normUnit(stockUnit || 'pcs');
  if (!a || a === b) return true;
  const ca = UNIT_CONVERSIONS[a], cb = UNIT_CONVERSIONS[b];
  return !!(ca && cb && ca.dimension === cb.dimension);
}
const UNIT_CHOICES = { mass: ['g', 'kg'], volume: ['ml', 'l'] };
const unitOptions = (stockUnit) => {
  const u = normUnit(stockUnit || 'pcs');
  const dim = UNIT_CONVERSIONS[u]?.dimension;
  const list = UNIT_CHOICES[dim] ? [...UNIT_CHOICES[dim]] : [];
  if (!list.includes(u)) list.unshift(u);
  return list;
};

export const EMPTY_STOCK_SETUP = { mode: 'none', inventoryItemId: '', quantity: '1', ingredients: [], dirty: false, loaded: false, locked: false, lockReason: '', original: null, clientError: null };

// The classic "Track stock" count (formData.isStockManaged) always means Sell-through / own count.
const effectiveMode = (setup, formData) => (formData && formData.isStockManaged ? 'sell_through' : setup.mode);

// Checks the setup before anything is saved. Returns an error sentence or null.
export function validateStockSetup(setup, formData, inventoryItems) {
  if (!setup || !setup.dirty || setup.locked) return null;
  const mode = effectiveMode(setup, formData);
  if (mode === 'sell_through' && !formData.isStockManaged) {
    if (!setup.inventoryItemId) return 'Stock: pick the stock item this dish sells.';
    if (!(Number(setup.quantity) > 0)) return 'Stock: enter how much each sale takes.';
  }
  if (mode === 'recipe') {
    const lines = setup.ingredients.filter(l => l.inventoryItemId || l.quantity);
    if (lines.length === 0) return 'Stock: add at least one ingredient.';
    for (const l of lines) {
      const inv = inventoryItems.find(i => i.id === l.inventoryItemId);
      if (!inv) return 'Stock: pick a stock item on every ingredient line.';
      if (!(Number(l.quantity) > 0)) return `Stock: enter a quantity for ${inv.name}.`;
      if (!unitsCompatible(l.unit || inv.unit, inv.unit)) return `Stock: ${inv.name} is stocked in ${inv.unit}. Use a matching unit.`;
    }
  }
  return null;
}

// The body for set_setup, or null when nothing needs saving (untouched, locked, or the classic count).
export function stockSetupPayload(setup, formData) {
  if (!setup || !setup.dirty || setup.locked) return null;
  const mode = effectiveMode(setup, formData);
  if (mode === 'sell_through' && formData.isStockManaged) return null; // classic Track stock — saved with the menu item
  if (mode === 'none') return setup.original && setup.original !== 'none' ? { action: 'set_setup', mode: 'none' } : null;
  if (mode === 'sell_through') return { action: 'set_setup', mode: 'sell_through', inventoryItemId: setup.inventoryItemId, quantity: Number(setup.quantity) };
  return {
    action: 'set_setup', mode: 'recipe',
    ingredients: setup.ingredients.filter(l => l.inventoryItemId).map(l => ({ inventoryItemId: l.inventoryItemId, quantity: Number(l.quantity), unit: l.unit })),
  };
}

const box = { marginBottom: 16, padding: '12px 14px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fafafa' };
const seg = (on) => ({ padding: '7px 12px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', border: 'none', background: on ? '#dc2626' : '#fff', color: on ? '#fff' : '#374151' });
const input = { width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, boxSizing: 'border-box', background: '#fff' };
const small = { fontSize: 11, color: '#6b7280', margin: '6px 0 0' };

export default function StockSetupSection({ restaurantId, editingItem, formData, setFormData, value, onChange }) {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loadError, setLoadError] = useState('');
  const setup = value || EMPTY_STOCK_SETUP;
  const update = (patch) => onChange({ ...setup, ...patch, dirty: true });

  // Stock items for the pickers.
  useEffect(() => {
    if (!restaurantId) return;
    let alive = true;
    apiClient.getInventoryItems(restaurantId)
      .then(res => { if (alive) setInventoryItems((res.items || res.inventory || res.inventoryItems || []).map(i => ({ ...i, id: i.id || i._id })).sort((a, b) => String(a.name).localeCompare(String(b.name)))); })
      .catch(() => { if (alive) setLoadError('Could not load stock items.'); });
    return () => { alive = false; };
  }, [restaurantId]);

  // Current setup of the item being edited.
  useEffect(() => {
    if (!restaurantId || !editingItem?.id || setup.loaded) return;
    let alive = true;
    apiClient.getMenuItemStockSetup(restaurantId, editingItem.id)
      .then(res => {
        if (!alive) return;
        const row = res.item;
        const next = { ...EMPTY_STOCK_SETUP, loaded: true };
        if (!row || row.switchedOff || row.mode === 'none') {
          next.mode = editingItem.isStockManaged ? 'sell_through' : 'none';
        } else if (row.mode === 'sell_through') {
          next.mode = 'sell_through';
          const ing = (row.ingredients || []).find(i => i.kind === 'stock');
          if (ing) { next.inventoryItemId = ing.inventoryItemId || ''; next.quantity = String(ing.quantity || 1); }
        } else {
          next.mode = 'recipe';
          const lines = row.ingredients || [];
          next.ingredients = lines.filter(l => l.kind === 'stock' && l.inventoryItemId).map(l => ({ inventoryItemId: l.inventoryItemId, quantity: String(l.quantity), unit: l.unit || l.stockUnit || '' }));
          const unsafe = lines.some(l => l.kind === 'subRecipe' || !l.inventoryItemId);
          if (unsafe) { next.locked = true; next.lockReason = 'This recipe has lines this form cannot show (sub-recipes or ingredients not linked to a stock item). Edit it in Inventory → Recipes so nothing is lost.'; }
        }
        next.original = next.mode;
        onChange(next);
      })
      .catch(() => { if (alive) onChange({ ...EMPTY_STOCK_SETUP, loaded: true, mode: editingItem.isStockManaged ? 'sell_through' : 'none', original: null }); });
    return () => { alive = false; };
  }, [restaurantId, editingItem?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const invById = useMemo(() => new Map(inventoryItems.map(i => [i.id, i])), [inventoryItems]);
  const selected = invById.get(setup.inventoryItemId);
  const ownCount = !!formData.isStockManaged;
  const mode = effectiveMode(setup, formData);

  // Keep the check result on the setup so the form can stop a bad save and stay open.
  useEffect(() => {
    const err = validateStockSetup(setup, formData, inventoryItems);
    if ((err || null) !== (setup.clientError || null)) onChange({ ...setup, clientError: err || null });
  }, [setup, formData.isStockManaged, inventoryItems]); // eslint-disable-line react-hooks/exhaustive-deps

  const chooseMode = (mode) => {
    if (setup.locked && mode !== effectiveMode(setup, formData)) return;
    // Leaving sell-through/own count turns the classic count off (the server unlinks it).
    if (mode !== 'sell_through' && formData.isStockManaged) setFormData(prev => ({ ...prev, isStockManaged: false }));
    update({ mode, ingredients: mode === 'recipe' && setup.ingredients.length === 0 ? [{ inventoryItemId: '', quantity: '', unit: '' }] : setup.ingredients });
  };
  const setLine = (idx, patch) => update({ ingredients: setup.ingredients.map((l, i) => i === idx ? { ...l, ...patch } : l) });

  return (
    <div style={box}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Stock</div>
          <div style={{ fontSize: 11, color: '#6b7280' }}>How selling this item uses stock</div>
        </div>
        <div role="group" aria-label="How this item uses stock" style={{ display: 'inline-flex', border: '1.5px solid #e5e7eb', borderRadius: 9, overflow: 'hidden' }}>
          <button type="button" style={seg(mode === 'none')} onClick={() => chooseMode('none')}>Not tracked</button>
          <button type="button" style={{ ...seg(mode === 'sell_through'), borderLeft: '1.5px solid #e5e7eb' }} onClick={() => chooseMode('sell_through')}>Sell-through</button>
          <button type="button" style={{ ...seg(mode === 'recipe'), borderLeft: '1.5px solid #e5e7eb' }} onClick={() => chooseMode('recipe')}>Recipe</button>
        </div>
      </div>

      {loadError && <p style={{ ...small, color: '#b91c1c' }}>{loadError}</p>}
      {setup.locked && <p style={{ ...small, color: '#b45309', fontWeight: 600 }}>{setup.lockReason}</p>}

      {mode === 'none' && (
        <p style={small}>Selling this item does not change any stock.</p>
      )}

      {mode === 'sell_through' && (
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12.5, color: '#374151' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input type="radio" name="stock-source" checked={!ownCount} onChange={() => { setFormData(prev => ({ ...prev, isStockManaged: false })); update({}); }} />
              Use an existing stock item
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input type="radio" name="stock-source" checked={ownCount} onChange={() => { setFormData(prev => ({ ...prev, isStockManaged: true, deductionQuantity: prev.deductionQuantity || 1 })); update({}); }} />
              Create a stock item for this dish
            </label>
          </div>
          {!ownCount ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(90px, 1fr)', gap: 10 }}>
              <div>
                <label htmlFor="stock-sell-item" style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Stock item sold</label>
                <select id="stock-sell-item" value={setup.inventoryItemId} onChange={e => update({ inventoryItemId: e.target.value })} style={input}>
                  <option value="">Choose a stock item…</option>
                  {inventoryItems.map(i => <option key={i.id} value={i.id}>{i.name} · {i.currentStock ?? 0} {i.unit || 'pcs'}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="stock-sell-qty" style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Per sale{selected ? ` (${selected.unit || 'pcs'})` : ''}</label>
                <input id="stock-sell-qty" type="number" min="0" step="any" value={setup.quantity} onChange={e => update({ quantity: e.target.value })} style={input} />
              </div>
            </div>
          ) : (
            <p style={small}>A stock item is kept for this dish with its own count (set below). Receive stock through Inventory; this form only changes the count if you type a new one.</p>
          )}
          {!ownCount && selected && Number(setup.quantity) > 0 && (
            <p style={small}>Each sale takes {setup.quantity} {selected.unit || 'pcs'} of {selected.name} ({Math.floor((Number(selected.currentStock) || 0) / Number(setup.quantity))} sales possible now).</p>
          )}
        </div>
      )}

      {mode === 'recipe' && (
        <div style={{ display: 'grid', gap: 8 }}>
          {setup.ingredients.map((l, idx) => {
            const inv = invById.get(l.inventoryItemId);
            const unit = l.unit || inv?.unit || '';
            const bad = inv && !unitsCompatible(unit, inv.unit);
            return (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(70px, 0.8fr) minmax(70px, 0.7fr) 32px', gap: 8, alignItems: 'center' }}>
                <select aria-label="Ingredient" disabled={setup.locked} value={l.inventoryItemId} onChange={e => { const it = invById.get(e.target.value); setLine(idx, { inventoryItemId: e.target.value, unit: it ? (it.unit || 'pcs') : '' }); }} style={input}>
                  <option value="">Stock item…</option>
                  {inventoryItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
                <input aria-label="Quantity per plate" disabled={setup.locked} type="number" min="0" step="any" placeholder="Qty" value={l.quantity} onChange={e => setLine(idx, { quantity: e.target.value })} style={input} />
                <select aria-label="Unit" disabled={setup.locked || !inv} value={unit} onChange={e => setLine(idx, { unit: e.target.value })} style={{ ...input, borderColor: bad ? '#dc2626' : '#d1d5db' }}>
                  {(inv ? unitOptions(inv.unit) : [unit || '—']).map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                <button type="button" aria-label="Remove ingredient" disabled={setup.locked} onClick={() => update({ ingredients: setup.ingredients.filter((_, i) => i !== idx) })}
                  style={{ height: 34, borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', cursor: 'pointer' }}>×</button>
              </div>
            );
          })}
          {!setup.locked && (
            <button type="button" onClick={() => update({ ingredients: [...setup.ingredients, { inventoryItemId: '', quantity: '', unit: '' }] })}
              style={{ justifySelf: 'start', padding: '6px 12px', borderRadius: 8, border: '1.5px dashed #d1d5db', background: '#fff', fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
              + Add ingredient
            </button>
          )}
          <p style={small}>Quantities are per plate. Each line&apos;s unit must match how that stock item is counted.</p>
        </div>
      )}
    </div>
  );
}

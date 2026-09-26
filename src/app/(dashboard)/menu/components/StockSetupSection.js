'use client';

// "Stock" on the menu item form — kept deliberately simple:
//   ☐ Reduce stock when this item is sold → pick ONE stock item + quantity per sale
//     (bottles, cans, packed items; "+ New stock item…" creates one right here).
// Dishes made from several ingredients use a recipe, which is set up in Inventory → Recipes
// (this form only shows it and links there). Items still on the classic "Track stock" count
// (formData.isStockManaged) keep their count fields in the form below this section.
// The menu item is saved exactly as before; this setup is saved via
// POST /api/recipes/:rid/mapping/action { action: 'set_setup' } (see menu/page.js handleSubmit).
// Stock COUNTS are never written from here.
import { useEffect, useMemo, useState } from 'react';
import apiClient from '@/lib/api';

export const EMPTY_STOCK_SETUP = { mode: 'none', inventoryItemId: '', quantity: '1', recipeName: '', recipeLines: 0, dirty: false, loaded: false, original: null, clientError: null };

// The classic "Track stock" count (formData.isStockManaged) means the item is tracked.
const effectiveMode = (setup, formData) => (formData && formData.isStockManaged ? 'sell_through' : setup.mode);

// Checks the setup before anything is saved. Returns an error sentence or null.
export function validateStockSetup(setup, formData) {
  if (!setup || !setup.dirty) return null;
  if (effectiveMode(setup, formData) === 'sell_through' && !formData.isStockManaged) {
    if (!setup.inventoryItemId) return 'Stock: pick the stock item this dish uses, or untick "Reduce stock".';
    if (!(Number(setup.quantity) > 0)) return 'Stock: enter how much each sale uses.';
  }
  return null;
}

// The body for set_setup, or null when nothing needs saving.
export function stockSetupPayload(setup, formData) {
  if (!setup || !setup.dirty) return null;
  const mode = effectiveMode(setup, formData);
  if (mode === 'sell_through' && formData.isStockManaged) return null; // classic count — saved with the menu item
  if (mode === 'none') return setup.original && setup.original !== 'none' ? { action: 'set_setup', mode: 'none' } : null;
  if (mode === 'sell_through') return { action: 'set_setup', mode: 'sell_through', inventoryItemId: setup.inventoryItemId, quantity: Number(setup.quantity) };
  return null; // recipes are edited in Inventory → Recipes
}

const box = { marginBottom: 16, padding: '12px 14px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fafafa' };
const input = { width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, boxSizing: 'border-box', background: '#fff' };
const small = { fontSize: 11.5, color: '#6b7280', margin: '6px 0 0' };
const link = { color: '#dc2626', fontWeight: 700, textDecoration: 'none' };
const NEW_ITEM = '__new__';
const NEW_UNITS = ['pcs', 'g', 'kg', 'ml', 'l', 'slices', 'packet', 'bottle'];

export default function StockSetupSection({ restaurantId, editingItem, formData, setFormData, value, onChange }) {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [creating, setCreating] = useState(null); // { name, unit, stock, busy, error }
  const setup = value || EMPTY_STOCK_SETUP;
  const update = (patch) => onChange({ ...setup, ...patch, dirty: true });
  const mode = effectiveMode(setup, formData);
  const tracked = mode !== 'none';

  // Stock items for the picker.
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
          next.recipeName = row.recipeName || '';
          next.recipeLines = (row.ingredients || []).length;
        }
        next.original = next.mode;
        onChange(next);
      })
      .catch(() => { if (alive) onChange({ ...EMPTY_STOCK_SETUP, loaded: true, mode: editingItem.isStockManaged ? 'sell_through' : 'none', original: null }); });
    return () => { alive = false; };
  }, [restaurantId, editingItem?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the check result on the setup so the form can stop a bad save and stay open.
  useEffect(() => {
    const err = validateStockSetup(setup, formData);
    if ((err || null) !== (setup.clientError || null)) onChange({ ...setup, clientError: err || null });
  }, [setup, formData.isStockManaged]); // eslint-disable-line react-hooks/exhaustive-deps

  const invById = useMemo(() => new Map(inventoryItems.map(i => [i.id, i])), [inventoryItems]);
  const selected = invById.get(setup.inventoryItemId);

  const toggleTracked = (on) => {
    if (on) { update({ mode: setup.original === 'recipe' ? 'recipe' : 'sell_through' }); return; }
    if (formData.isStockManaged) setFormData(prev => ({ ...prev, isStockManaged: false }));
    update({ mode: 'none' });
  };

  const createStockItem = async () => {
    const name = String(creating?.name || '').trim();
    if (!name) { setCreating(c => ({ ...c, error: 'Enter a name' })); return; }
    let item = inventoryItems.find(i => String(i.name).toLowerCase().trim() === name.toLowerCase());
    if (!item) {
      setCreating(c => ({ ...c, busy: true, error: '' }));
      try {
        const res = await apiClient.createInventoryItem(restaurantId, {
          name, unit: creating.unit || 'pcs', category: 'Ingredients',
          currentStock: Number(creating.stock) > 0 ? Number(creating.stock) : 0, minStock: 0, costPerUnit: 0,
        });
        const created = res.item || res.inventoryItem || res;
        item = { ...created, id: created.id || created._id || res.id, name, unit: creating.unit || 'pcs', currentStock: Number(creating.stock) || 0 };
        setInventoryItems(list => [...list, item].sort((a, b) => String(a.name).localeCompare(String(b.name))));
      } catch (e) {
        setCreating(c => ({ ...c, busy: false, error: e.message || 'Could not create the stock item' }));
        return;
      }
    }
    update({ mode: 'sell_through', inventoryItemId: item.id });
    setCreating(null);
  };

  return (
    <div style={box}>
      <label htmlFor="stock-reduce" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
        <input id="stock-reduce" type="checkbox" checked={tracked} onChange={e => toggleTracked(e.target.checked)}
          style={{ width: 16, height: 16, marginTop: 2, accentColor: '#dc2626', cursor: 'pointer', flexShrink: 0 }} />
        <span>
          <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#111827' }}>Reduce stock when this item is sold</span>
          <span style={{ display: 'block', fontSize: 11.5, color: '#6b7280' }}>Each sale takes a quantity from a stock item in Inventory.</span>
        </span>
      </label>

      {loadError && <p style={{ ...small, color: '#b91c1c' }}>{loadError}</p>}
      {!tracked && setup.original && setup.original !== 'none' && (
        <p style={{ ...small, color: '#b45309', fontWeight: 600 }}>When you save, selling this item will stop reducing stock{setup.original === 'recipe' ? ' (its recipe is kept, just switched off)' : ''}.</p>
      )}

      {tracked && mode === 'recipe' && (
        <div style={{ marginTop: 10, padding: '10px 12px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12.5, color: '#374151' }}>
          Uses the recipe <b>{setup.recipeName || formData.name}</b>{setup.recipeLines ? ` (${setup.recipeLines} ingredient${setup.recipeLines === 1 ? '' : 's'})` : ''}.{' '}
          <a href="/inventory?tab=recipes" target="_blank" rel="noopener noreferrer" style={link}>Edit in Inventory → Recipes</a>
        </div>
      )}

      {tracked && mode === 'sell_through' && formData.isStockManaged && (
        <p style={small}>
          Uses its own stock count (below).{' '}
          <button type="button" onClick={() => { setFormData(prev => ({ ...prev, isStockManaged: false })); update({ mode: 'sell_through' }); }}
            style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', fontSize: 11.5, ...link }}>
            Use a stock item from Inventory instead
          </button>
        </p>
      )}

      {tracked && mode === 'sell_through' && !formData.isStockManaged && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(90px, 1fr)', gap: 10, marginTop: 10 }}>
          <div>
            <label htmlFor="stock-sell-item" style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Stock item</label>
            <select id="stock-sell-item" value={setup.inventoryItemId}
              onChange={e => { if (e.target.value === NEW_ITEM) setCreating({ name: String(formData.name || '').trim(), unit: 'pcs', stock: '', busy: false, error: '' }); else update({ inventoryItemId: e.target.value }); }}
              style={input}>
              <option value="">Choose…</option>
              {inventoryItems.map(i => <option key={i.id} value={i.id}>{i.name} · {i.currentStock ?? 0} {i.unit || 'pcs'}</option>)}
              <option value={NEW_ITEM}>+ New stock item…</option>
            </select>
          </div>
          <div>
            <label htmlFor="stock-sell-qty" style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Qty per sale{selected ? ` (${selected.unit || 'pcs'})` : ''}</label>
            <input id="stock-sell-qty" type="number" min="0" step="any" value={setup.quantity} onChange={e => update({ quantity: e.target.value })} style={input} />
          </div>
        </div>
      )}

      {creating && (
        <div style={{ marginTop: 10, padding: '10px 12px', border: '1.5px solid #fecaca', background: '#fff', borderRadius: 10, display: 'grid', gap: 8 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#111827' }}>New stock item</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(80px, 1fr) minmax(90px, 1fr)', gap: 8 }}>
            <input id="new-stock-name" autoFocus placeholder="Name" value={creating.name} onChange={e => setCreating(c => ({ ...c, name: e.target.value }))} style={input} />
            <select id="new-stock-unit" aria-label="Counted in" value={creating.unit} onChange={e => setCreating(c => ({ ...c, unit: e.target.value }))} style={input}>
              {NEW_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <input id="new-stock-qty" type="number" min="0" step="any" placeholder="In stock now" value={creating.stock} onChange={e => setCreating(c => ({ ...c, stock: e.target.value }))} style={input} />
          </div>
          {creating.error && <p style={{ ...small, color: '#b91c1c', margin: 0 }}>{creating.error}</p>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" disabled={creating.busy} onClick={createStockItem}
              style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              {creating.busy ? 'Creating…' : 'Create and use'}
            </button>
            <button type="button" disabled={creating.busy} onClick={() => setCreating(null)}
              style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {mode !== 'recipe' && (
        <p style={{ ...small, marginTop: 10 }}>
          Made from several ingredients (e.g. a cooked dish)?{' '}
          <a href="/inventory?tab=recipes" target="_blank" rel="noopener noreferrer" style={link}>Set up its recipe in Inventory → Recipes</a>
        </p>
      )}
    </div>
  );
}

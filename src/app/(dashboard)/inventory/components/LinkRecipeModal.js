'use client';

// Link a dish — the one simple way to connect a menu item to inventory.
//   Step 1  pick the menu item (search)
//   Step 2  what ONE plate uses from inventory (ingredient + quantity; only units that fit the item)
//   Step 3  saved → "Linked": every sale of the dish now reduces those ingredients
// Saves through POST /api/recipes/:rid with menuItemId, which replaces the dish's existing recipe
// (no duplicates) and marks it as the owner's recipe.
import { useState, useEffect, useMemo, useRef } from 'react';
import { FaTimes, FaSearch, FaPlus, FaTrash, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import apiClient from '@/lib/api';

const WEIGHT = ['kg', 'g', 'mg', 'lb', 'oz'];
const VOLUME = ['L', 'ml', 'cl', 'fl oz'];
const NEW_ITEM_UNITS = ['kg', 'g', 'L', 'ml', 'pcs', 'dozen', 'bottle', 'can', 'pack', 'box'];
const unitsFor = (u) => (WEIGHT.includes(u) ? WEIGHT : VOLUME.includes(u) ? VOLUME : [u || 'pcs']);
// A plate usually uses a small amount: suggest g / ml when the item is bought in kg / L.
const defaultUnitFor = (u) => (u === 'kg' ? 'g' : u === 'L' ? 'ml' : (u || 'pcs'));

const emptyLine = () => ({ key: Math.random().toString(36).slice(2), inventoryItemId: '', name: '', quantity: '', unit: '', type: 'inventory' });

const S = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(15,23,42,.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  box: { background: '#fff', borderRadius: 16, width: '100%', maxWidth: 620, maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px rgba(0,0,0,.25)' },
  input: { width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box' },
  btn: (primary) => ({
    padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer',
    border: primary ? 'none' : '1.5px solid #e5e7eb', background: primary ? '#059669' : '#fff', color: primary ? '#fff' : '#374151',
  }),
  hint: { fontSize: 12.5, color: '#6b7280', margin: '4px 0 0' },
};

function StepDots({ step }) {
  const steps = ['Pick the dish', 'What one plate uses', 'Linked'];
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
      {steps.map((t, i) => {
        const n = i + 1; const on = step >= n;
        return (
          <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 22, height: 22, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, background: on ? '#059669' : '#e5e7eb', color: on ? '#fff' : '#6b7280' }}>{n}</span>
            <span style={{ fontSize: 12.5, fontWeight: step === n ? 800 : 600, color: step === n ? '#065f46' : '#6b7280' }}>{t}</span>
            {n < 3 && <span style={{ color: '#d1d5db', margin: '0 2px' }}>›</span>}
          </div>
        );
      })}
    </div>
  );
}

// Text box that searches inventory items; pick one from the list.
function InventoryPicker({ line, items, onPick, onCreate, inputId }) {
  const [q, setQ] = useState(line.name || '');
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);
  useEffect(() => { setQ(line.name || ''); }, [line.name]);
  useEffect(() => {
    const close = (e) => { if (wrap.current && !wrap.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  const term = q.trim().toLowerCase();
  const matches = useMemo(() => items.filter(i => !term || (i.name || '').toLowerCase().includes(term)).slice(0, 8), [items, term]);
  const exact = items.some(i => (i.name || '').trim().toLowerCase() === term);
  return (
    <div ref={wrap} style={{ position: 'relative', flex: 1, minWidth: 0 }}>
      <input id={inputId} value={q} placeholder="Search inventory (e.g. Chicken)" style={S.input}
        onFocus={() => setOpen(true)}
        onChange={e => { setQ(e.target.value); setOpen(true); if (line.inventoryItemId) onPick(null); }} />
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 5, marginTop: 4, background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.12)', maxHeight: 240, overflowY: 'auto' }}>
          {matches.map(i => (
            <button key={i.id} type="button" onMouseDown={e => e.preventDefault()} onClick={() => { onPick(i); setOpen(false); }}
              style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '9px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13.5, textAlign: 'left' }}>
              <span style={{ fontWeight: 600, color: '#111827' }}>{i.name}</span>
              <span style={{ color: '#9ca3af', fontSize: 12 }}>{Number(i.currentStock) || 0} {i.unit} in stock</span>
            </button>
          ))}
          {matches.length === 0 && <div style={{ padding: '9px 12px', fontSize: 13, color: '#6b7280' }}>No inventory item matches.</div>}
          {term && !exact && onCreate && (
            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => { onCreate(q.trim()); setOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '9px 12px', border: 'none', borderTop: '1px solid #f1f5f9', background: '#f0fdf4', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#047857', textAlign: 'left' }}>
              <FaPlus size={11} /> Add “{q.trim()}” to inventory
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function LinkRecipeModal({ open, onClose, restaurantId, inventoryItems = [], recipes = [], preselectMenuItemId = null, onSaved }) {
  const [step, setStep] = useState(1);
  const [dishes, setDishes] = useState(null); // mapping rows
  const [loadErr, setLoadErr] = useState(null);
  const [search, setSearch] = useState('');
  const [dish, setDish] = useState(null);
  const [lines, setLines] = useState([emptyLine()]);
  const [keep, setKeep] = useState({}); // fields of an existing recipe kept on replace (instructions etc.)
  const [items, setItems] = useState(inventoryItems);
  const [creating, setCreating] = useState(null); // { lineKey, name, unit }
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => { setItems(inventoryItems); }, [inventoryItems]);

  // Fresh start every time it opens.
  useEffect(() => {
    if (!open || !restaurantId) return;
    setStep(1); setDish(null); setLines([emptyLine()]); setKeep({}); setSearch(''); setErr(null); setCreating(null); setLoadErr(null); setDishes(null);
    let alive = true;
    apiClient.getStockMapping(restaurantId)
      .then(d => { if (!alive) return; setDishes(d?.items || []); })
      .catch(e => { if (alive) setLoadErr(e.message || 'Could not load menu items'); });
    return () => { alive = false; };
  }, [open, restaurantId]);

  const pickDish = (row) => {
    setDish(row); setErr(null);
    const own = row.recipeId ? recipes.find(r => (r.id || r._id) === row.recipeId) : null;
    const src = own && Array.isArray(own.ingredients) && own.ingredients.length
      ? own.ingredients.map(i => ({ inventoryItemId: i.inventoryItemId || '', name: i.inventoryItemName || i.name || '', quantity: i.quantity, unit: i.unit || '', type: i.type || 'inventory', subRecipeId: i.subRecipeId || null }))
      : (row.ingredients || []).filter(i => i.kind === 'stock' && i.inventoryItemId)
        .map(i => ({ inventoryItemId: i.inventoryItemId, name: i.name, quantity: i.quantity, unit: i.unit || i.stockUnit || '', type: 'inventory' }));
    setLines(src.length ? src.map(l => ({ ...emptyLine(), ...l })) : [emptyLine()]);
    setKeep(own ? { description: own.description || '', instructions: own.instructions || [], prepTime: own.prepTime || 0, cookTime: own.cookTime || 0, servings: Number(own.servings) || 1 } : {});
    setStep(2);
  };

  useEffect(() => {
    if (!open || !dishes || !preselectMenuItemId || dish) return;
    const row = dishes.find(d => d.menuItemId === preselectMenuItemId);
    if (row) pickDish(row);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, dishes, preselectMenuItemId]);

  const shownDishes = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (dishes || []).filter(d => !q || `${d.name} ${d.category || ''}`.toLowerCase().includes(q)).slice(0, 60);
  }, [dishes, search]);

  const setLine = (key, patch) => setLines(ls => ls.map(l => (l.key === key ? { ...l, ...patch } : l)));

  const createItem = async () => {
    if (!creating?.name || !creating.unit) return;
    setBusy(true); setErr(null);
    try {
      const res = await apiClient.createInventoryItem(restaurantId, { name: creating.name, unit: creating.unit, category: 'Ingredients', currentStock: 0, minStock: 0, maxStock: 0, costPerUnit: 0 });
      const it = res.item || res;
      const item = { id: it.id, name: it.name || creating.name, unit: it.unit || creating.unit, currentStock: 0 };
      setItems(prev => [...prev, item]);
      setLine(creating.lineKey, { inventoryItemId: item.id, name: item.name, unit: defaultUnitFor(item.unit) });
      setCreating(null);
    } catch (e) {
      setErr(e.message || 'Could not add the inventory item');
    } finally { setBusy(false); }
  };

  const filled = lines.filter(l => l.type === 'recipe' ? l.subRecipeId : l.inventoryItemId);
  const lineProblem = (l) => {
    if (l.type === 'recipe') return null;
    if (!l.inventoryItemId) return l.name ? 'Pick an item from the list' : null;
    if (!(Number(l.quantity) > 0)) return 'Enter how much one plate uses';
    return null;
  };
  const canSave = filled.length > 0 && lines.every(l => !lineProblem(l));

  const save = async () => {
    if (!dish || !canSave) return;
    setBusy(true); setErr(null);
    try {
      const ingredients = filled.map(l => l.type === 'recipe'
        ? { type: 'recipe', subRecipeId: l.subRecipeId, inventoryItemName: l.name, quantity: Number(l.quantity) || 1, unit: l.unit || 'portion' }
        : { type: 'inventory', inventoryItemId: l.inventoryItemId, inventoryItemName: l.name, quantity: Number(l.quantity), unit: l.unit || 'pcs' });
      await apiClient.createRecipe(restaurantId, {
        name: dish.name, menuItemId: dish.menuItemId, menuItemName: dish.name, category: dish.category || '',
        servings: keep.servings || 1, description: keep.description || '', instructions: keep.instructions || [],
        prepTime: keep.prepTime || 0, cookTime: keep.cookTime || 0, ingredients,
      });
      setStep(3);
      onSaved && onSaved();
    } catch (e) {
      setErr(e.message || 'Could not save the recipe');
    } finally { setBusy(false); }
  };

  if (!open) return null;
  const perPlate = (keep.servings || 1) > 1 ? `${keep.servings} plates` : 'one plate';

  return (
    <div style={S.overlay} onMouseDown={e => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <div style={S.box}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Link a dish to inventory</h3>
            <button type="button" onClick={onClose} disabled={busy} aria-label="Close" style={{ border: 'none', background: '#f3f4f6', borderRadius: 8, width: 32, height: 32, cursor: 'pointer' }}><FaTimes /></button>
          </div>
          <StepDots step={step} />
        </div>

        <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
          {step === 1 && (
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Which menu item is this recipe for?</div>
                <p style={S.hint}>Search your menu and pick the dish.</p>
              </div>
              <div style={{ position: 'relative' }}>
                <FaSearch size={13} style={{ position: 'absolute', left: 12, top: 13, color: '#9ca3af' }} />
                <input id="link-dish-search" autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search menu items" style={{ ...S.input, paddingLeft: 34 }} />
              </div>
              {loadErr && <div style={{ color: '#b91c1c', fontSize: 13 }}>{loadErr}</div>}
              {!dishes && !loadErr && <div style={{ color: '#6b7280', fontSize: 13 }}>Loading menu…</div>}
              <div style={{ display: 'grid', gap: 6 }}>
                {shownDishes.map(d => {
                  const linked = d.status === 'mapped' || d.status === 'draft';
                  return (
                    <button key={d.menuItemId} type="button" onClick={() => pickDish(d)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 10, background: '#fff', cursor: 'pointer', textAlign: 'left' }}>
                      <span>
                        <span style={{ display: 'block', fontWeight: 700, color: '#111827', fontSize: 14 }}>{d.name}</span>
                        {d.category && <span style={{ fontSize: 12, color: '#9ca3af' }}>{d.category}</span>}
                      </span>
                      <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 9px', borderRadius: 999, whiteSpace: 'nowrap', color: linked ? '#047857' : '#6b7280', background: linked ? '#ecfdf5' : '#f3f4f6' }}>
                        {linked ? 'Linked · edit' : 'Not linked'}
                      </span>
                    </button>
                  );
                })}
                {dishes && shownDishes.length === 0 && <div style={{ color: '#6b7280', fontSize: 13 }}>No menu item matches. Add dishes on the Menu page first.</div>}
              </div>
            </div>
          )}

          {step === 2 && dish && (
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>What does {perPlate} of <span style={{ color: '#047857' }}>{dish.name}</span> use?</div>
                <p style={S.hint}>Add each ingredient from your inventory and how much goes into {perPlate}. When this dish is sold, these amounts are taken out of inventory.</p>
              </div>
              {dish.mode === 'sell_through' && (
                <div style={{ padding: '10px 12px', borderRadius: 10, background: '#fffbeb', color: '#78350f', fontSize: 12.5 }}>
                  This dish is currently counted as a direct item (one inventory item per sale). Saving here replaces that with this recipe.
                </div>
              )}

              {lines.map((l, idx) => {
                const inv = items.find(i => i.id === l.inventoryItemId);
                const units = inv ? unitsFor(inv.unit) : [];
                const problem = lineProblem(l);
                if (l.type === 'recipe') {
                  return (
                    <div key={l.key} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13.5, color: '#374151' }}>
                      <span style={{ flex: 1 }}>Sub-recipe: <b>{l.name || '(unnamed)'}</b> × {l.quantity} {l.unit}</span>
                      <button type="button" onClick={() => setLines(ls => ls.filter(x => x.key !== l.key))} aria-label="Remove" style={{ border: 'none', background: 'none', color: '#9ca3af', cursor: 'pointer' }}><FaTrash /></button>
                    </div>
                  );
                }
                return (
                  <div key={l.key} style={{ display: 'grid', gap: 4 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <InventoryPicker line={l} items={items} inputId={`link-ing-${idx}`}
                        onPick={(i) => setLine(l.key, i ? { inventoryItemId: i.id, name: i.name, unit: defaultUnitFor(i.unit) } : { inventoryItemId: '' })}
                        onCreate={(name) => setCreating({ lineKey: l.key, name, unit: 'g' })} />
                      <input id={`link-qty-${idx}`} type="number" min="0" step="any" placeholder="Qty" value={l.quantity}
                        onChange={e => setLine(l.key, { quantity: e.target.value })} style={{ ...S.input, width: 90 }} />
                      <select id={`link-unit-${idx}`} value={l.unit} disabled={!inv} onChange={e => setLine(l.key, { unit: e.target.value })}
                        style={{ ...S.input, width: 92, background: inv ? '#fff' : '#f9fafb' }}>
                        {!inv && <option value="">unit</option>}
                        {units.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                      <button type="button" onClick={() => setLines(ls => (ls.length > 1 ? ls.filter(x => x.key !== l.key) : [emptyLine()]))} aria-label="Remove ingredient"
                        style={{ border: 'none', background: 'none', color: '#9ca3af', cursor: 'pointer', padding: 6 }}><FaTrash /></button>
                    </div>
                    {problem && <span style={{ fontSize: 12, color: '#b45309' }}>{problem}</span>}
                    {creating && creating.lineKey === l.key && (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', padding: '10px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, fontSize: 13 }}>
                        Add <b>{creating.name}</b> to inventory, counted in
                        <select id="link-new-unit" value={creating.unit} onChange={e => setCreating(c => ({ ...c, unit: e.target.value }))} style={{ ...S.input, width: 90, padding: '6px 8px' }}>
                          {NEW_ITEM_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                        <button type="button" style={{ ...S.btn(true), padding: '7px 14px', fontSize: 13 }} disabled={busy} onClick={createItem}>{busy ? 'Adding…' : 'Add'}</button>
                        <button type="button" style={{ ...S.btn(false), padding: '7px 14px', fontSize: 13 }} disabled={busy} onClick={() => setCreating(null)}>Cancel</button>
                        <span style={{ width: '100%', color: '#6b7280', fontSize: 12 }}>It starts at 0 in stock — add the quantity you have in the Stock tab.</span>
                      </div>
                    )}
                  </div>
                );
              })}

              <button type="button" onClick={() => setLines(ls => [...ls, emptyLine()])}
                style={{ justifySelf: 'start', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1.5px dashed #a7f3d0', background: '#f0fdf4', color: '#047857', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                <FaPlus size={11} /> Add ingredient
              </button>
              {err && <div style={{ color: '#b91c1c', fontSize: 13, fontWeight: 600 }}>{err}</div>}
            </div>
          )}

          {step === 3 && dish && (
            <div style={{ textAlign: 'center', display: 'grid', gap: 12, justifyItems: 'center', padding: '10px 0' }}>
              <FaCheckCircle size={44} color="#059669" />
              <div style={{ fontSize: 18, fontWeight: 800, color: '#065f46' }}>{dish.name} is linked</div>
              <p style={{ margin: 0, fontSize: 14, color: '#374151', maxWidth: 440 }}>
                Every time <b>{dish.name}</b> is sold, inventory reduces by:
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                {filled.map(l => (
                  <span key={l.key} style={{ padding: '5px 11px', background: '#ecfdf5', color: '#065f46', borderRadius: 999, fontSize: 13, fontWeight: 700 }}>
                    {l.quantity} {l.unit} {l.name}
                  </span>
                ))}
              </div>
              {(keep.servings || 1) > 1 && <p style={S.hint}>(These amounts are for {keep.servings} plates, so one sale uses 1/{keep.servings} of them.)</p>}
            </div>
          )}
        </div>

        <div style={{ padding: '14px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', gap: 10 }}>
          {step === 2 ? (
            <button type="button" style={{ ...S.btn(false), display: 'flex', alignItems: 'center', gap: 6 }} disabled={busy} onClick={() => setStep(1)}><FaArrowLeft size={11} /> Change dish</button>
          ) : <span />}
          {step === 1 && <button type="button" style={S.btn(false)} onClick={onClose}>Cancel</button>}
          {step === 2 && (
            <button type="button" style={{ ...S.btn(true), opacity: canSave ? 1 : 0.5 }} disabled={busy || !canSave} onClick={save}>
              {busy ? 'Saving…' : 'Save & link'}
            </button>
          )}
          {step === 3 && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" style={S.btn(false)} onClick={() => {
                setDish(null); setLines([emptyLine()]); setKeep({}); setSearch(''); setStep(1); setDishes(null);
                apiClient.getStockMapping(restaurantId).then(d => setDishes(d?.items || [])).catch(e => setLoadErr(e.message || 'Could not load menu items'));
              }}>Link another dish</button>
              <button type="button" style={S.btn(true)} onClick={onClose}>Done</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

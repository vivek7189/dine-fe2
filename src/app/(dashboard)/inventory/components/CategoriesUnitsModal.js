'use client';

// Inventory → "Categories & units" (owner / admin). MFC 27 Nov:
//  - One fixed unit per item: staff enter supplier bills in the item's own unit (kg, L, pcs or its bag) —
//    no kg / g choice; only owner / admin change an item's unit.
//  - Stock categories: add, rename (moves its items), remove an empty one, and the unit a new item in
//    that category starts with. Saved in restaurant.inventorySettings (backend utils/inventorySettings.js).
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaPlus, FaTrash, FaCheck } from 'react-icons/fa';
import apiClient from '@/lib/api';

const UNITS = ['', 'kg', 'g', 'L', 'ml', 'pcs', 'pack', 'bag', 'box', 'bottle', 'can', 'dozen', 'tray'];
const inp = { padding: '7px 9px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, boxSizing: 'border-box', width: '100%' };

export default function CategoriesUnitsModal({ open, onClose, restaurantId, settings, onSaved }) {
  const [fixedUnits, setFixedUnits] = useState(false);
  const [cats, setCats] = useState([]);        // [{ name, defaultUnit, items, newName }]
  const [newCat, setNewCat] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ text: '', bad: false });

  useEffect(() => {
    if (!open) return;
    setFixedUnits(settings?.fixedUnits === true);
    setCats((settings?.categories || []).map(c => ({ ...c, newName: c.name })));
    setNewCat(''); setMsg({ text: '', bad: false });
  }, [open, settings]);

  if (!open || typeof document === 'undefined') return null;
  const canEdit = settings?.canEdit === true;

  const apply = (r, text) => {
    const next = { fixedUnits: r?.fixedUnits === true, categories: r?.categories || [], canEdit: true };
    setCats(next.categories.map(c => ({ ...c, newName: c.name })));
    setFixedUnits(next.fixedUnits);
    onSaved && onSaved(next);
    setMsg({ text, bad: false });
  };
  const run = async (fn, okText) => {
    setBusy(true); setMsg({ text: '', bad: false });
    try { apply(await fn(), okText); } catch (e) { setMsg({ text: e?.message || 'Could not save', bad: true }); }
    setBusy(false);
  };
  const listToSave = (list) => list.map(c => ({ name: c.name, defaultUnit: c.defaultUnit || '' }));
  const save = () => run(() => apiClient.saveInventorySettings(restaurantId, { fixedUnits, categories: listToSave(cats) }), 'Saved.');
  const addCat = () => {
    const name = newCat.trim();
    if (!name) return;
    if (cats.some(c => c.name.toLowerCase() === name.toLowerCase())) { setMsg({ text: `"${name}" is already there.`, bad: true }); return; }
    run(() => apiClient.saveInventorySettings(restaurantId, { categories: listToSave([...cats, { name, defaultUnit: '' }]) }), `Added "${name}".`);
    setNewCat('');
  };
  const rename = (c) => {
    const to = String(c.newName || '').trim();
    if (!to || to === c.name) return;
    const into = cats.find(x => x !== c && x.name.toLowerCase() === to.toLowerCase());
    run(() => apiClient.renameInventoryCategory(restaurantId, c.name, to),
      into ? `Moved ${c.items} item${c.items === 1 ? '' : 's'} into "${into.name}".` : `Renamed to "${to}"${c.items ? ` (${c.items} item${c.items === 1 ? '' : 's'})` : ''}.`);
  };
  const remove = (c) => run(() => apiClient.saveInventorySettings(restaurantId, { categories: listToSave(cats.filter(x => x !== c)) }), `Removed "${c.name}".`);

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10002, padding: 12 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div data-testid="categories-units" style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 640, maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Categories &amp; units</div>
          <button onClick={onClose} aria-label="Close" style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', display: 'flex' }}><FaTimes size={13} /></button>
        </div>
        <div style={{ padding: '14px 18px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!canEdit && <div style={{ fontSize: 12.5, color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '8px 10px' }}>Only the owner or admin can change these.</div>}

          <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', border: '2px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', cursor: canEdit ? 'pointer' : 'default' }}>
            <input type="checkbox" checked={fixedUnits} disabled={!canEdit || busy} data-testid="fixed-units-switch"
              onChange={e => setFixedUnits(e.target.checked)} style={{ width: 18, height: 18, marginTop: 2, accentColor: '#059669', flexShrink: 0 }} />
            <span>
              <span style={{ display: 'block', fontWeight: 700, fontSize: 14 }}>One fixed unit per item</span>
              <span style={{ display: 'block', fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                Supplier bills use each item&apos;s own unit — kg for things kept by weight, L for liquids, pcs / bottle / can as set, or its bag size.
                Staff can&apos;t choose kg or g any more, and only the owner or admin can change an item&apos;s unit.
              </span>
            </span>
          </label>

          <div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>Stock categories</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Rename a category to fix it everywhere (its items move with it); give it the same name as another to merge them. A new item in a category starts with its unit.</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 92px 56px 70px', gap: '6px 8px', alignItems: 'center', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>
              <span>Name</span><span>Unit</span><span>Items</span><span />
            </div>
            {cats.map((c, i) => (
              <div key={`${c.name}-${i}`} data-testid="category-row" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 92px 56px 70px', gap: '6px 8px', alignItems: 'center', marginTop: 6 }}>
                <input style={inp} value={c.newName} disabled={!canEdit || busy}
                  onChange={e => setCats(cs => cs.map(x => (x === c ? { ...x, newName: e.target.value.slice(0, 40) } : x)))}
                  onKeyDown={e => { if (e.key === 'Enter') rename(c); }} />
                <select style={inp} value={c.defaultUnit || ''} disabled={!canEdit || busy}
                  onChange={e => setCats(cs => cs.map(x => (x === c ? { ...x, defaultUnit: e.target.value } : x)))}>
                  {UNITS.map(u => <option key={u} value={u}>{u || '—'}</option>)}
                </select>
                <span style={{ fontSize: 13, color: '#374151', textAlign: 'center' }}>{c.items}</span>
                <span style={{ display: 'flex', gap: 4 }}>
                  {canEdit && c.newName.trim() && c.newName.trim() !== c.name && (
                    <button type="button" title="Rename" disabled={busy} onClick={() => rename(c)} style={{ border: 'none', background: '#059669', color: '#fff', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', display: 'flex' }}><FaCheck size={11} /></button>
                  )}
                  {canEdit && c.items === 0 && (
                    <button type="button" title="Remove" disabled={busy} onClick={() => remove(c)} style={{ border: 'none', background: '#fef2f2', color: '#b91c1c', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', display: 'flex' }}><FaTrash size={11} /></button>
                  )}
                </span>
              </div>
            ))}
            {canEdit && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <input style={inp} value={newCat} placeholder="New category, e.g. Liquids" maxLength={40} disabled={busy}
                  onChange={e => setNewCat(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addCat(); }} data-testid="new-category" />
                <button type="button" onClick={addCat} disabled={busy || !newCat.trim()}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid #059669', color: '#059669', background: '#fff', borderRadius: 8, padding: '0 12px', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  <FaPlus size={11} /> Add
                </button>
              </div>
            )}
          </div>
          {msg.text && <div style={{ fontSize: 13, fontWeight: 600, color: msg.bad ? '#b91c1c' : '#047857' }}>{msg.text}</div>}
        </div>
        <div style={{ padding: '12px 18px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button type="button" onClick={onClose} style={{ border: '1px solid #d1d5db', background: '#fff', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontWeight: 600 }}>Close</button>
          {canEdit && (
            <button type="button" onClick={save} disabled={busy} data-testid="save-categories-units"
              style={{ border: 'none', background: '#059669', color: '#fff', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontWeight: 700 }}>
              {busy ? 'Saving…' : 'Save'}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

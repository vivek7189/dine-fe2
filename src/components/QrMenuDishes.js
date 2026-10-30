'use client';

// The dishes of one QR menu, as a simple list with photo, name, category and price — and three
// plain ways to add: "New dish" (photo, name, price, category), "Choose from my menu" (tick dishes
// one by one or a whole category) and "From a menu photo". Every change is saved straight away.
// Dishes from your menu stay one dish (same price, same KOT / kitchen screen); a QR menu with its
// own separate menu keeps its new dishes only on that QR.

import { useMemo, useState } from 'react';
import apiClient from '../lib/api';
import { useCurrency } from '../contexts/CurrencyContext';
import { FaPlus, FaListUl, FaCamera, FaTimes, FaSpinner, FaSearch, FaImage } from 'react-icons/fa';

const catId = (v) => String(v || '').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
const photoOf = (i) => (Array.isArray(i?.images) && i.images[0] && (i.images[0].url || i.images[0])) || i?.image || '';

function Thumb({ item, size = 44 }) {
  const src = photoOf(item);
  return src
    ? <img src={src} alt="" style={{ width: size, height: size, borderRadius: 10, objectFit: 'cover', flexShrink: 0, background: '#f3f4f6' }} />
    : <div style={{ width: size, height: size, borderRadius: 10, flexShrink: 0, background: '#f5f3ff', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: size / 2.6 }}>{String(item?.name || '?').trim().charAt(0).toUpperCase()}</div>;
}
const VegDot = ({ veg }) => (
  <span title={veg ? 'Veg' : 'Non-veg'} style={{ display: 'inline-flex', width: 12, height: 12, border: `1.5px solid ${veg ? '#16a34a' : '#b91c1c'}`, borderRadius: 2, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    <span style={{ width: 6, height: 6, borderRadius: 6, background: veg ? '#16a34a' : '#b91c1c' }} />
  </span>
);

export default function QrMenuDishes({ restaurant, menu, menuItems, categories, canAdd, onPatch, onReload, onPhoto, onUpload }) {
  const { getCurrencySymbol } = useCurrency();
  const sym = getCurrencySymbol();
  const [adding, setAdding] = useState(false);   // New dish form open
  const [choosing, setChoosing] = useState(false); // Choose from my menu open
  const [busyId, setBusyId] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null); // own dish to delete
  const [note, setNote] = useState('');

  const normal = useMemo(() => (menuItems || []).filter((i) => !i.qrMenuOnly), [menuItems]);
  const catName = (id) => {
    const c = (categories || []).find((x) => x.id === id || catId(x.name) === catId(id));
    if (c) return c.name;
    const s = String(id || '');
    return (s.startsWith('qrmenu-') && s.includes('--') ? s.slice(s.lastIndexOf('--') + 2) : s).replace(/[-_]+/g, ' ');
  };

  const ids = menu.itemIds || [];
  const wholeCats = (menu.categories || []);
  const wholeOf = (i) => wholeCats.find((c) => catId(c) === catId(i.category));
  const own = menu.ownMenu ? (menuItems || []).filter((i) => i.qrMenuOnly === menu.id) : [];
  const picked = ids.map((id) => normal.find((i) => String(i.id) === id)).filter((i) => i && !wholeOf(i));
  const fromCats = normal.filter((i) => wholeOf(i));
  const dishes = [...own.map((i) => ({ ...i, _own: true })), ...picked, ...fromCats.map((i) => ({ ...i, _cat: true }))];
  // grouped by category, in the menu's category order
  const groups = (() => {
    const order = (categories || []).map((c) => catId(c.id));
    const map = new Map();
    dishes.forEach((i) => { const k = catId(i.category); if (!map.has(k)) map.set(k, []); map.get(k).push(i); });
    return [...map.entries()].sort((a, b) => (order.indexOf(a[0]) + 1 || 999) - (order.indexOf(b[0]) + 1 || 999));
  })();
  const [editPrice, setEditPrice] = useState(null);    // { id, value }
  const [confirmGroup, setConfirmGroup] = useState(null); // category key to remove

  const run = async (id, fn) => { setBusyId(id); try { await fn(); } catch (e) { setNote(e?.message || 'Could not save'); } setBusyId(null); };
  const remove = (i) => {
    if (i._own) { setConfirmDel(i); return; }
    const cat = i._cat && wholeOf(i);
    // a dish from a whole category: keep the rest of that category as single dishes
    if (cat) return run(i.id, () => onPatch({ categories: wholeCats.filter((x) => x !== cat), itemIds: [...new Set([...ids, ...fromCats.filter((x) => wholeOf(x) === cat && x.id !== i.id).map((x) => String(x.id))])] }));
    return run(i.id, () => onPatch({ itemIds: ids.filter((x) => x !== String(i.id)) }));
  };
  const removeGroup = (k, list) => {
    setConfirmGroup(null);
    const gone = new Set(list.filter((i) => !i._own).map((i) => String(i.id)));
    return run(k, () => onPatch({ categories: wholeCats.filter((c) => catId(c) !== k), itemIds: ids.filter((x) => !gone.has(x)) }));
  };
  const savePrice = () => {
    const { id, value } = editPrice; setEditPrice(null);
    if (!(Number(value) > 0)) return;
    return run(id, async () => { await apiClient.updateMenuItem(id, { price: Number(value) }, restaurant.id); await onReload(); });
  };
  const deleteOwn = async (i) => {
    setBusyId(i.id); setConfirmDel(null);
    try { await apiClient.request(`/api/menus/item/${i.id}?restaurantId=${restaurant.id}`, { method: 'DELETE' }); } catch (_) { /* shown by reload */ }
    await onReload();
    setBusyId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#111827' }}>Dishes on this QR</div>
        <div style={{ fontSize: 12, color: '#6b7280' }}>{menu.allItems ? 'your whole menu' : dishes.length}</div>
      </div>

      {/* three ways to add */}
      {!menu.allItems && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
          <AddBtn icon={<FaPlus />} title="New dish" sub="Photo, name, price" disabled={!canAdd} onClick={() => setAdding(true)} />
          <AddBtn icon={<FaListUl />} title="Choose from my menu" sub="One by one or a whole category" disabled={!canAdd} onClick={() => setChoosing(true)} />
          {menu.ownMenu
            ? <AddBtn icon={<FaCamera />} title="Upload a menu" sub="Photo, PDF or Excel" disabled={!canAdd || !onUpload} onClick={onUpload} />
            : <AddBtn icon={<FaCamera />} title="From a menu photo" sub="We read the dishes" disabled={!canAdd} onClick={onPhoto} />}
        </div>
      )}
      {!canAdd && <div style={{ fontSize: 12, color: '#b45309' }}>Type a name for this QR menu first.</div>}

      {!menu.allItems && dishes.length === 0 && (
        <div style={{ padding: '18px 12px', textAlign: 'center', border: '1px dashed #e5e7eb', borderRadius: 12, color: '#9ca3af', fontSize: 13 }}>No dishes yet — add them with the buttons above.</div>
      )}
      {!menu.allItems && dishes.length > 0 && (
        <div style={{ fontSize: 11.5, color: '#6b7280' }}>Tap a price to change it — it changes in your menu too (POS and all QRs). × takes a dish off this QR only.</div>
      )}

      {!menu.allItems && groups.map(([k, list]) => {
        const whole = list.some((i) => i._cat);
        return (
          <div key={k}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 2px 6px' }}>
              <div style={{ flex: 1, fontSize: 12, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.03em' }}>
                {catName(k)} <span style={{ fontWeight: 600 }}>· {list.length}</span>
                {whole && <span style={{ textTransform: 'none', fontWeight: 600, color: '#7c3aed', letterSpacing: 0 }}> · whole category — new dishes come on by themselves</span>}
              </div>
              {confirmGroup === k
                ? <><button type="button" onClick={() => setConfirmGroup(null)} style={smallBtn}>Keep</button><button type="button" onClick={() => removeGroup(k, list)} style={{ ...smallBtn, color: '#fff', background: '#b91c1c', border: 'none' }}>Remove {list.length}</button></>
                : (!list.every((i) => i._own) && <button type="button" onClick={() => setConfirmGroup(k)} style={{ ...smallBtn, padding: '3px 9px', fontSize: 11.5 }}>Remove all</button>)}
            </div>
            <div style={{ border: '1px solid #f3f4f6', borderRadius: 12, overflow: 'hidden' }}>
              {list.map((i, n) => {
                const off = i.isAvailable === false;
                const sizes = Array.isArray(i.variants) && i.variants.length ? i.variants : null;
                const editing = editPrice && editPrice.id === i.id;
                return (
                  <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderTop: n ? '1px solid #f3f4f6' : 'none', background: '#fff', opacity: busyId === i.id || busyId === k ? 0.5 : 1 }}>
                    <Thumb item={i} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <VegDot veg={i.isVeg !== false} />
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.name}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 2 }}>
                        {sizes ? sizes.map((v) => `${v.name} ${sym}${v.price}`).join(' · ') : catName(i.category)}
                        {off && <b style={{ color: '#b45309' }}> · switched off — not shown</b>}
                        {i.hideOnQr === true && <b style={{ color: '#b45309' }}> · hidden from QR</b>}
                      </div>
                    </div>
                    {editing ? (
                      <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
                        <input autoFocus value={editPrice.value} inputMode="decimal" onChange={(e) => setEditPrice({ id: i.id, value: e.target.value.replace(/[^0-9.]/g, '') })}
                          onKeyDown={(e) => { if (e.key === 'Enter') savePrice(); if (e.key === 'Escape') setEditPrice(null); }} style={{ ...inp, width: 80, padding: '6px 8px' }} />
                        <button type="button" onClick={savePrice} style={{ ...smallBtn, background: '#7c3aed', color: '#fff', border: 'none' }}>Set</button>
                      </span>
                    ) : (
                      <button type="button" disabled={!!sizes} title={sizes ? 'This dish has sizes — change their prices in Menu' : 'Change price'}
                        onClick={() => setEditPrice({ id: i.id, value: String(i.price ?? '') })}
                        style={{ border: '1px dashed transparent', background: 'none', padding: '4px 6px', borderRadius: 8, fontSize: 13.5, fontWeight: 700, color: '#111827', cursor: sizes ? 'default' : 'pointer' }}>
                        {sizes ? `from ${sym}${Math.min(...sizes.map((v) => Number(v.price) || 0))}` : `${sym}${i.price}`}
                      </button>
                    )}
                    {off && (
                      <button type="button" onClick={() => run(i.id, async () => { await apiClient.updateMenuItem(i.id, { isAvailable: true }, restaurant.id); await onReload(); })}
                        style={{ ...smallBtn, color: '#b45309', borderColor: '#fcd34d' }}>Switch on</button>
                    )}
                    <button type="button" title={i._own ? 'Delete this dish' : 'Remove from this QR'} onClick={() => remove(i)} disabled={busyId === i.id} style={{ ...xBtn, fontSize: 18, padding: '0 4px' }}>×</button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {note && <div style={{ fontSize: 12.5, color: '#b45309', fontWeight: 600 }}>{note}</div>}
      {confirmDel && (
        <div style={{ padding: '10px 12px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', fontSize: 12.5, color: '#991b1b', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ flex: 1, minWidth: 180 }}>Delete <b>{confirmDel.name}</b>? It is only on this QR.</span>
          <button type="button" onClick={() => setConfirmDel(null)} style={smallBtn}>Keep</button>
          <button type="button" onClick={() => deleteOwn(confirmDel)} style={{ ...smallBtn, background: '#b91c1c', color: '#fff', border: 'none' }}>Delete</button>
        </div>
      )}

      {adding && (
        <NewDish restaurant={restaurant} menu={menu} categories={categories} sym={sym}
          onClose={() => setAdding(false)}
          onSaved={async (item, photoErr) => { setAdding(false); setNote(photoErr || ''); if (!menu.ownMenu) await onPatch({ itemIds: [...new Set([...ids, String(item.id)])] }); await onReload(); }} />
      )}
      {choosing && (
        <ChooseFromMenu items={normal} categories={categories} sym={sym} already={new Set([...ids, ...fromCats.map((i) => String(i.id))])}
          catName={catName}
          onClose={() => setChoosing(false)}
          onAdd={async (newIds) => { setChoosing(false); await onPatch({ itemIds: [...new Set([...ids, ...newIds])] }); }} />
      )}
    </div>
  );
}

function AddBtn({ icon, title, sub, onClick, disabled }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      style={{ textAlign: 'left', padding: '12px', borderRadius: 12, border: '1.5px solid #ddd6fe', background: '#faf5ff', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, display: 'flex', gap: 10, alignItems: 'center' }}>
      <span style={{ width: 32, height: 32, borderRadius: 9, background: '#7c3aed', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13 }}>{icon}</span>
      <span>
        <span style={{ display: 'block', fontSize: 13.5, fontWeight: 800, color: '#4c1d95' }}>{title}</span>
        <span style={{ display: 'block', fontSize: 11.5, color: '#6b7280' }}>{sub}</span>
      </span>
    </button>
  );
}

function Modal({ title, sub, onClose, children, footer }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>{title}</div>
            {sub && <div style={{ fontSize: 12, color: '#6b7280' }}>{sub}</div>}
          </div>
          <button type="button" onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#6b7280' }}><FaTimes /></button>
        </div>
        <div style={{ padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
        {footer && <div style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'flex-end' }}>{footer}</div>}
      </div>
    </div>
  );
}

// New dish: photo, name, price, category, veg — goes into your menu (or this QR's own menu)
function NewDish({ restaurant, menu, categories, sym, onClose, onSaved }) {
  const ownCats = (categories || []).filter((c) => String(c.id || '').startsWith(`qrmenu-${menu.id}--`));
  const cats = menu.ownMenu ? ownCats : (categories || []).filter((c) => !String(c.id || '').startsWith('qrmenu-'));
  const [f, setF] = useState({ name: '', price: '', category: cats[0]?.id || '', newCat: '', isVeg: true, description: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (p) => setF((x) => ({ ...x, ...p }));
  const newCatMode = f.category === '__new' || cats.length === 0;
  const ok = f.name.trim() && Number(f.price) > 0 && (newCatMode ? f.newCat.trim() : f.category);

  const pick = (e) => {
    const fl = e.target.files && e.target.files[0];
    if (!fl) return;
    if (fl.size > 10 * 1024 * 1024) { setErr('Photo is over 10 MB — please pick a smaller one.'); return; }
    setErr(''); setFile(fl);
    try { setPreview(URL.createObjectURL(fl)); } catch (_) { setPreview(''); }
  };

  const save = async () => {
    setBusy(true); setErr('');
    try {
      const dish = { name: f.name.trim(), price: Number(f.price), isVeg: f.isVeg, description: f.description.trim() };
      let item;
      if (menu.ownMenu) {
        // this QR's own menu: the server files it under the QR menu's own category
        const cName = newCatMode ? f.newCat.trim() : (cats.find((c) => c.id === f.category)?.name || 'Dishes');
        const r = await apiClient.bulkSaveMenuItems(restaurant.id, [{ ...dish, category: cName }], [{ name: cName, order: 1 }], menu.id);
        item = r?.savedItems?.[0];
      } else {
        let category = f.category;
        if (newCatMode) {
          const r = await apiClient.createCategory(restaurant.id, { name: f.newCat.trim() });
          category = r?.category?.id || catId(f.newCat);
        }
        const r = await apiClient.createMenuItem(restaurant.id, { ...dish, category });
        item = r?.menuItem;
      }
      if (!item?.id) throw new Error('The dish was not saved — please try again');
      let photoErr = '';
      if (file) {
        try { await apiClient.uploadMenuItemImages(item.id, [file], restaurant.id); } catch (e) { photoErr = `${item.name} was added, but its photo did not upload — add it again in Menu.`; }
      }
      await onSaved(item, photoErr);
    } catch (e) { setErr(e?.message || 'Could not save'); setBusy(false); }
  };

  return (
    <Modal title="New dish" sub={menu.ownMenu ? `Only on “${menu.name}”` : `Added to your menu and to “${menu.name}”`} onClose={onClose}
      footer={<>
        <button type="button" onClick={onClose} style={smallBtn}>Cancel</button>
        <button type="button" onClick={save} disabled={!ok || busy} style={{ ...mainBtn, opacity: !ok || busy ? 0.5 : 1 }}>{busy ? <FaSpinner className="animate-spin" size={11} /> : null} Add dish</button>
      </>}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <label style={{ width: 88, height: 88, borderRadius: 14, border: '1.5px dashed #c4b5fd', background: preview ? `center/cover no-repeat url(${preview})` : '#faf5ff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#7c3aed', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
          {!preview && <><FaImage size={20} /><span style={{ marginTop: 4 }}>Add photo</span></>}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} style={{ display: 'none' }} />
        </label>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input value={f.name} onChange={(e) => set({ name: e.target.value })} placeholder="Dish name" style={inp} autoFocus />
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={f.price} onChange={(e) => set({ price: e.target.value.replace(/[^0-9.]/g, '') })} placeholder={sym ? `Price (${sym})` : 'Price'} inputMode="decimal" style={inp} />
            <div style={{ display: 'flex', borderRadius: 9, border: '1px solid #e5e7eb', overflow: 'hidden', flexShrink: 0 }}>
              {[[true, 'Veg'], [false, 'Non-veg']].map(([v, t]) => (
                <button key={t} type="button" onClick={() => set({ isVeg: v })} style={{ padding: '0 12px', border: 'none', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', background: f.isVeg === v ? (v ? '#dcfce7' : '#fee2e2') : '#fff', color: f.isVeg === v ? (v ? '#166534' : '#991b1b') : '#6b7280' }}>{t}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <label style={lbl}>Category
        {cats.length > 0 && (
          <select value={f.category} onChange={(e) => set({ category: e.target.value })} style={inp}>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            <option value="__new">+ New category…</option>
          </select>
        )}
        {newCatMode && <input value={f.newCat} onChange={(e) => set({ newCat: e.target.value })} placeholder="New category name, e.g. Salads" style={inp} />}
      </label>
      <label style={lbl}>Description <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span>
        <input value={f.description} onChange={(e) => set({ description: e.target.value })} placeholder="e.g. Kokum, cucumber, onion" style={inp} />
      </label>
      {err && <div style={{ fontSize: 12.5, color: '#b91c1c', fontWeight: 600 }}>{err}</div>}
    </Modal>
  );
}

// Choose from my menu: search, category tabs, tick dishes or "All" of a category
function ChooseFromMenu({ items, categories, sym, already, catName, onClose, onAdd }) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [sel, setSel] = useState(() => new Set());
  const groups = useMemo(() => {
    const t = q.trim().toLowerCase();
    const map = new Map();
    items.filter((i) => (!t || String(i.name || '').toLowerCase().includes(t)) && (!cat || catId(i.category) === cat))
      .forEach((i) => { const k = catId(i.category); if (!map.has(k)) map.set(k, []); map.get(k).push(i); });
    const order = (categories || []).map((c) => catId(c.id));
    return [...map.entries()].sort((a, b) => (order.indexOf(a[0]) + 1 || 999) - (order.indexOf(b[0]) + 1 || 999));
  }, [items, categories, q, cat]);
  const allCats = useMemo(() => [...new Set(items.map((i) => catId(i.category)))], [items]);
  const toggle = (id) => setSel((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const toggleAll = (list) => setSel((s) => {
    const free = list.filter((i) => !already.has(String(i.id))).map((i) => String(i.id));
    const n = new Set(s); const all = free.every((id) => n.has(id));
    free.forEach((id) => (all ? n.delete(id) : n.add(id))); return n;
  });

  return (
    <Modal title="Choose from my menu" sub="Tick dishes, or “All” for a whole category" onClose={onClose}
      footer={<>
        <span style={{ flex: 1, fontSize: 12.5, color: '#4b5563' }}>{sel.size} selected</span>
        <button type="button" onClick={onClose} style={smallBtn}>Cancel</button>
        <button type="button" onClick={() => onAdd([...sel])} disabled={!sel.size} style={{ ...mainBtn, opacity: sel.size ? 1 : 0.5 }}>Add {sel.size || ''} dish{sel.size === 1 ? '' : 'es'}</button>
      </>}>
      <div style={{ position: 'relative' }}>
        <FaSearch style={{ position: 'absolute', left: 11, top: 13, color: '#9ca3af', zIndex: 1 }} size={12} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a dish…" style={{ ...inp, paddingLeft: 30 }} />
      </div>
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
        {[['', 'All'], ...allCats.map((c) => [c, catName(c)])].map(([v, t]) => (
          <button key={v || 'all'} type="button" onClick={() => setCat(v)} style={{ padding: '5px 11px', borderRadius: 999, whiteSpace: 'nowrap', fontSize: 12, fontWeight: 700, cursor: 'pointer', border: `1px solid ${cat === v ? '#7c3aed' : '#e5e7eb'}`, background: cat === v ? '#7c3aed' : '#fff', color: cat === v ? '#fff' : '#4b5563' }}>{t}</button>
        ))}
      </div>
      {groups.length === 0 && <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, padding: 16 }}>No dishes found</div>}
      {groups.map(([c, list]) => {
        const free = list.filter((i) => !already.has(String(i.id)));
        const allOn = free.length > 0 && free.every((i) => sel.has(String(i.id)));
        return (
          <div key={c}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 2px 6px' }}>
              <div style={{ flex: 1, fontSize: 12, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.03em' }}>{catName(c)}</div>
              {free.length > 0 && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#6d28d9', cursor: 'pointer' }}>
                  <input type="checkbox" checked={allOn} onChange={() => toggleAll(list)} /> All {free.length}
                </label>
              )}
            </div>
            <div style={{ border: '1px solid #f3f4f6', borderRadius: 12, overflow: 'hidden' }}>
              {list.map((i, n) => {
                const on = already.has(String(i.id));
                const checked = on || sel.has(String(i.id));
                return (
                  <label key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderTop: n ? '1px solid #f3f4f6' : 'none', cursor: on ? 'default' : 'pointer', background: checked && !on ? '#faf5ff' : '#fff' }}>
                    <input type="checkbox" checked={checked} disabled={on} onChange={() => toggle(String(i.id))} />
                    <Thumb item={i} size={38} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><VegDot veg={i.isVeg !== false} /><span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{i.name}</span></div>
                      {(on || i.isAvailable === false) && <div style={{ fontSize: 11, color: on ? '#16a34a' : '#b45309', marginTop: 1 }}>{on ? 'Already on this QR' : 'Switched off in your menu'}</div>}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{sym}{i.price}</span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </Modal>
  );
}

const xBtn = { border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af', marginLeft: 4 };
const smallBtn = { padding: '6px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 12.5, fontWeight: 600, color: '#374151', cursor: 'pointer' };
const mainBtn = { padding: '9px 16px', borderRadius: 10, border: 'none', background: '#7c3aed', color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 };
const lbl = { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, fontWeight: 700, color: '#374151' };
const inp = { width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 9, border: '1px solid #e5e7eb', fontSize: 13.5, fontWeight: 400, color: '#111827', background: '#fff' };

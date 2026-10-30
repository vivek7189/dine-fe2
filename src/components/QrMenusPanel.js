'use client';

// QR menus — named menus with their own QR code (Tables → QR codes → QR menus). Give someone a QR
// that shows only the categories / items you pick (e.g. "Corporate lunch", "Drinks only"); only
// those can be ordered from it — the server checks every order. The normal table / takeaway QRs
// keep showing the full menu. Items switched to "Hide from the QR / online menu" never show.
// A QR menu can also have its OWN separate menu (e.g. an event): upload it here; those dishes show
// only on that QR (staff still see them at the POS, under a category named after the QR menu).

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import QRCode from 'qrcode';
import apiClient from '../lib/api';
import { FaPlus, FaTrash, FaSpinner, FaCheck, FaChevronDown, FaChevronUp, FaUpload } from 'react-icons/fa';

const BulkMenuUpload = dynamic(() => import('./BulkMenuUpload'), { ssr: false });
const QrMenuFromPhoto = dynamic(() => import('./QrMenuFromPhoto'), { ssr: false });
import QrMenuDishes from './QrMenuDishes';

const newMenu = () => ({ id: '', name: '', categories: [], itemIds: [], orderType: 'any', note: '', viewOnly: false, allItems: false, ownMenu: false, active: true });

// today as YYYY-MM-DD on this device (the server checks the restaurant's own day)
const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const niceDate = (s) => { try { return new Date(`${s}T12:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }); } catch (_) { return s; } };
// Is this menu on all QR codes right now?
const onAllQrsNow = (m) => m.allQrs === true && m.active !== false && (!m.allQrsUntil || todayStr() <= m.allQrsUntil);

function qrUrl(restaurant, m) {
  const isDev = process.env.NODE_ENV === 'development';
  const qs = `restaurant=${restaurant.id}&menu=${encodeURIComponent(m.id)}${m.orderType === 'takeaway' ? '&orderType=takeaway' : ''}`;
  if (restaurant.subdomainEnabled && restaurant.subdomain) {
    const base = isDev ? `http://${restaurant.subdomain}.localhost:3002` : `https://${restaurant.subdomain}.dineopen.com`;
    return `${base}/placeorder?${qs}`;
  }
  return `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://www.dineopen.com'}/placeorder?${qs}`;
}

export default function QrMenusPanel({ restaurant }) {
  const [menus, setMenus] = useState(null);
  const [saved, setSaved] = useState([]);   // last saved list — saving one menu never saves another's half-done edits
  const [cats, setCats] = useState([]);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(null);   // index being edited
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [qrs, setQrs] = useState({});       // id → data url
  const [ownDishes, setOwnDishes] = useState({}); // menu id → how many dishes of its own
  const [uploadFor, setUploadFor] = useState(null); // QR menu the upload window is open for
  const [confirmDelete, setConfirmDelete] = useState(null); // { k, count } — menu with own dishes
  const [photoFor, setPhotoFor] = useState(null); // { k, rows? } — "Fill from a menu photo" / add one new dish
  const [ownerItems, setOwnerItems] = useState(null); // your menu incl. switched-off dishes + QR menus' own dishes (the public menu leaves those out)
  const [ownerCats, setOwnerCats] = useState([]);
  const [more, setMore] = useState(false);          // "More options" open in the editor

  const loadOwnDishes = () => apiClient.request(`/api/restaurants/${restaurant.id}/qr-menus`)
    .then((r) => setOwnDishes(r?.ownDishes || {})).catch(() => {});

  const loadItems = () => {
    apiClient.getPublicMenu(restaurant.id).then((r) => {
      setCats(Array.isArray(r?.categories) ? r.categories : []);
      setItems(Array.isArray(r?.menu) ? r.menu : []);
    }).catch(() => {});
    return apiClient.getMenu(restaurant.id).then((r) => {
      setOwnerItems((r?.menuItems || []).filter((i) => i.status !== 'deleted'));
      setOwnerCats(Array.isArray(r?.categories) ? r.categories : []);
    }).catch(() => {});
  };
  const reloadAll = () => Promise.all([loadItems(), loadOwnDishes()]);

  useEffect(() => {
    if (!restaurant?.id) return;
    apiClient.request(`/api/restaurants/${restaurant.id}/qr-menus`).then((r) => { setMenus(r?.qrMenus || []); setSaved(r?.qrMenus || []); setOwnDishes(r?.ownDishes || {}); }).catch((e) => { setMenus([]); setMsg(e?.message || 'Could not load QR menus'); });
    loadItems();
  }, [restaurant?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // QR images for saved menus
  useEffect(() => {
    (menus || []).filter((m) => m.id).forEach((m) => {
      const url = qrUrl(restaurant, m);
      QRCode.toDataURL(url, { width: 220, margin: 1, color: { dark: '#1f2937', light: '#ffffff' } })
        .then((d) => setQrs((q) => ({ ...q, [`${m.id}|${m.orderType}`]: d }))).catch(() => {});
    });
  }, [menus, restaurant]);

  // same matching as the server: a category id ("main-course") or name ("Main Course")
  const catId = (v) => String(v || '').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const countFor = (m) => (m.allItems ? items.filter((i) => i.hideOnQr !== true).length
    : items.filter((i) => (m.itemIds || []).includes(String(i.id)) || (m.categories || []).some((c) => catId(c) === catId(i.category))).length);
  // can be saved: a name, and something to show (its own menu, the whole menu, or picked categories / items)
  const canSave = (m) => !!m.name.trim() && (m.ownMenu || m.allItems || (m.categories || []).length > 0 || (m.itemIds || []).length > 0);
  const summary = (m) => {
    if (m.ownMenu) {
      const own = ownDishes[m.id] || 0;
      const picked = (m.categories || []).length || (m.itemIds || []).length ? countFor(m) : 0;
      return `Own menu · ${own} dish${own === 1 ? '' : 'es'}${picked ? ` + ${picked} from your menu` : ''}`;
    }
    return m.allItems ? 'Whole menu' : `${countFor(m)} items`;
  };
  const setM = (k, patch) => setMenus((list) => list.map((m, j) => (j === k ? { ...m, ...patch } : m)));
  // Save ONE menu (k) or delete it: built from the last saved list, so other menus' unsaved edits stay unsaved
  // patch: changes saved with it (dish list); keepOpen: stay in the editor (dish changes save straight away)
  const save = async (k, remove = false, deleteOwnDishes = false, patch = null, keepOpen = false) => {
    const m = patch ? { ...menus[k], ...patch } : menus[k];
    const isSaved = !!(m && m.id && saved.some((x) => x.id === m.id));
    const list = remove
      ? saved.filter((x) => !(m && m.id && x.id === m.id))
      : (isSaved ? saved.map((x) => (x.id === m.id ? m : x)) : [...saved, m])
        // only one menu can be on all QR codes: this one takes over from any other
        .map((x) => (m.allQrs && x.id !== m.id && x.allQrs ? { ...x, allQrs: false } : x));
    setSaving(true); setMsg('');
    try {
      const r = await apiClient.request(`/api/restaurants/${restaurant.id}/qr-menus`, { method: 'PUT', body: { qrMenus: list, ...(deleteOwnDishes ? { deleteOwnDishes: true } : {}) } });
      const next = r?.qrMenus || [];
      setConfirmDelete(null);
      if (r?.deletedDishes) loadOwnDishes();
      setSaved(next);
      // keep other menus' unsaved edits on screen; this one now shows what was saved
      setMenus((cur) => {
        const others = cur.filter((_, j) => j !== k).filter((x) => !x.id || next.some((n) => n.id === x.id) || !saved.some((sv) => sv.id === x.id));
        const merged = next.map((n) => others.find((o) => o.id === n.id) || n);
        return [...merged, ...others.filter((o) => !o.id)];
      });
      if (keepOpen && !remove) {
        const savedM = isSaved ? next.find((x) => x.id === m.id) : next[next.length - 1];
        const idx = savedM ? next.findIndex((x) => x.id === savedM.id) : -1;
        if (idx >= 0) setOpen(idx);
      } else setOpen(null);
      setMsg('Saved');
      setTimeout(() => setMsg(''), 2000);
    } catch (e) {
      // deleting a menu that has its own dishes: ask first (the server refuses without deleteOwnDishes)
      if (remove && e?.code === 'HAS_OWN_DISHES') setConfirmDelete({ k, count: e?.data?.ownDishes || ownDishes[m.id] || 0 });
      else setMsg(e?.message || 'Could not save');
    }
    setSaving(false);
  };
  // after "Fill from a menu photo": tick those dishes on this QR menu and save it
  const photoDone = (ids, res) => {
    const { k } = photoFor; setPhotoFor(null);
    const m = menus[k];
    if (res.added || res.switchedOn) loadItems();
    if (ids.length) save(k, false, false, { itemIds: [...new Set([...(m.itemIds || []), ...ids])] }, true);
    if (res.failed?.length) setTimeout(() => setMsg(`Could not save: ${res.failed.join(', ')}`), 2500);
  };

  if (!menus) return <div style={{ padding: 30, textAlign: 'center' }}><FaSpinner className="animate-spin" color="#9ca3af" /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '4px 0 20px' }}>
      <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
        A QR that shows only the menu you pick — give it to a company, an event or a counter. Only those items can be ordered from it.
        Or give it a <b>separate menu of its own</b> (e.g. for an event) and upload that menu here. Your table and takeaway QRs keep the full menu —
        unless you switch on <b>Use on all my QR codes</b> for one menu (e.g. an event day).
      </p>

      {menus.map((m, k) => {
        const editing = open === k;
        const qr = m.id ? qrs[`${m.id}|${m.orderType}`] : null;
        return (
          <div key={m.id || `new${k}`} style={{ border: '1px solid #e5e7eb', borderRadius: '14px', background: '#fff', overflow: 'hidden' }}>
            <div style={{ display: 'flex', gap: '14px', padding: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
              {qr ? <img src={qr} alt={`${m.name} QR`} style={{ width: 96, height: 96, borderRadius: 8, border: '1px solid #f3f4f6' }} /> : <div style={{ width: 96, height: 96, borderRadius: 8, background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>Save to get the QR</div>}
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#111827' }}>{m.name || 'New QR menu'} {m.active === false && <span style={{ fontSize: 11, color: '#b91c1c', fontWeight: 700 }}>· off</span>}</div>
                {m.allQrs && saved.some((x) => x.id === m.id && x.allQrs) && (
                  <div style={{ display: 'inline-block', marginTop: 4, padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: onAllQrsNow(m) ? '#dcfce7' : '#f3f4f6', color: onAllQrsNow(m) ? '#166534' : '#6b7280' }}>
                    {onAllQrsNow(m) ? `On all QR codes${m.allQrsUntil ? ` till ${niceDate(m.allQrsUntil)}` : ''}` : (m.active === false ? 'All QR codes — menu is off' : `Was on all QR codes till ${niceDate(m.allQrsUntil)}`)}
                  </div>
                )}
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: 2 }}>
                  {summary(m)} · {m.viewOnly ? <b style={{ color: '#0369a1' }}>view only — no ordering</b> : (m.orderType === 'takeaway' ? 'takeaway' : m.orderType === 'dine-in' ? 'dine-in' : 'any order type')}
                </div>
                {m.id && (
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                    <button onClick={() => { if (!qr) return; const a = document.createElement('a'); a.href = qr; a.download = `QR-${m.name.replace(/[^a-z0-9]+/gi, '-')}.png`; a.click(); }} style={btn}>Download</button>
                    <button onClick={() => { try { navigator.clipboard.writeText(qrUrl(restaurant, m)); setMsg('Link copied'); setTimeout(() => setMsg(''), 1500); } catch (_) { /* no clipboard */ } }} style={btn}>Copy link</button>
                    <a href={qrUrl(restaurant, m)} target="_blank" rel="noreferrer" style={{ ...btn, textDecoration: 'none' }}>Open</a>
                    {m.ownMenu && saved.some((x) => x.id === m.id && x.ownMenu) && (
                      <button onClick={() => setUploadFor(m)} style={{ ...btn, background: '#7c3aed', color: '#fff', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}><FaUpload size={10} /> Upload menu</button>
                    )}
                  </div>
                )}
              </div>
              <button onClick={() => setOpen(editing ? null : k)} style={{ ...btn, display: 'inline-flex', alignItems: 'center', gap: 6 }}>{editing ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />} {editing ? 'Close' : 'Edit'}</button>
            </div>

            {editing && (
              <div style={{ borderTop: '1px solid #f3f4f6', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#fcfcfd' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  <label style={lbl}>Name<input value={m.name} onChange={(e) => setM(k, { name: e.target.value })} placeholder="e.g. Corporate lunch" style={inp} /></label>
                  {!m.viewOnly && (
                  <label style={lbl}>Orders from this QR are
                    <select value={m.orderType} onChange={(e) => setM(k, { orderType: e.target.value })} style={inp}>
                      <option value="any">Customer chooses</option><option value="takeaway">Takeaway — token number, no table</option><option value="dine-in">Dine-in</option>
                    </select>
                  </label>
                  )}
                </div>
                <QrMenuDishes
                  restaurant={restaurant}
                  menu={m}
                  menuItems={ownerItems || []}
                  categories={ownerCats}
                  canAdd={!!m.name.trim() && (!m.ownMenu || saved.some((x) => x.id === m.id && x.ownMenu))}
                  onPatch={(patch) => save(k, false, false, patch, true)}
                  onReload={reloadAll}
                  onPhoto={() => setPhotoFor({ k })}
                  onUpload={m.id && saved.some((x) => x.id === m.id && x.ownMenu) ? () => setUploadFor(m) : null}
                />
                <button type="button" onClick={() => setMore((v) => !v)} style={{ ...btn, alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {more ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />} More options <span style={{ fontWeight: 400, color: '#9ca3af' }}>(menu type, view only, all QR codes, note)</span>
                </button>
                {more && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px', borderRadius: 12, border: '1px solid #f3f4f6', background: '#fff' }}>
                <div>
                  <div style={{ ...lbl, display: 'block', marginBottom: 6 }}>What does this QR show?</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[[false, 'Dishes from my menu', 'Pick categories or items from your normal menu'], [true, 'Its own separate menu', 'Different dishes, e.g. for an event — upload that menu']].map(([own, t, d]) => {
                      const on = !!m.ownMenu === own;
                      // a menu that already has its own dishes stays an own menu (delete those first)
                      const locked = !own && m.ownMenu && (ownDishes[m.id] || 0) > 0;
                      return (
                        <button key={t} type="button" disabled={locked} onClick={() => setM(k, { ownMenu: own, ...(own ? { allItems: false } : {}) })}
                          title={locked ? 'This QR menu has its own dishes' : ''}
                          style={{ flex: '1 1 200px', textAlign: 'left', padding: '10px 12px', borderRadius: 10, cursor: locked ? 'not-allowed' : 'pointer', opacity: locked ? 0.5 : 1, border: `1.5px solid ${on ? '#7c3aed' : '#e5e7eb'}`, background: on ? '#f5f3ff' : '#fff' }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: on ? '#6d28d9' : '#111827' }}>{on ? '● ' : '○ '}{t}</div>
                          <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 2 }}>{d}</div>
                        </button>
                      );
                    })}
                  </div>
                  {m.ownMenu && (
                    <div style={{ marginTop: 8, padding: '10px 12px', borderRadius: 10, background: '#f9fafb', fontSize: 12.5, color: '#4b5563', lineHeight: 1.5 }}>
                      {m.id && saved.some((x) => x.id === m.id && x.ownMenu)
                        ? <>This menu has <b>{ownDishes[m.id] || 0}</b> dish{(ownDishes[m.id] || 0) === 1 ? '' : 'es'} of its own. <button type="button" onClick={() => setUploadFor(m)} style={{ border: 'none', background: 'none', padding: 0, color: '#7c3aed', fontWeight: 700, cursor: 'pointer' }}>Upload menu</button> (photo, PDF or Excel) to add dishes.</>
                        : <>Save this QR menu, then use <b>Upload menu</b> to add its dishes (photo, PDF or Excel).</>}
                      {' '}To add, edit or remove single dishes: <b>Menu</b> → category <b>“{m.name || 'this menu'}”</b>. These dishes show only on this QR — not on your table QRs — and your staff see them at the POS.
                    </div>
                  )}
                </div>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#374151' }}>
                  <input type="checkbox" checked={m.viewOnly === true} onChange={(e) => setM(k, { viewOnly: e.target.checked })} style={{ marginTop: 3 }} />
                  <span><b>View only</b> — customers who scan this QR can see the menu and prices but cannot order (no Add / cart). Other QR codes still take orders.</span>
                </label>
                {!m.ownMenu && (
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#374151' }}>
                  <input type="checkbox" checked={m.allItems === true} onChange={(e) => setM(k, { allItems: e.target.checked })} style={{ marginTop: 3 }} />
                  <span><b>Whole menu</b> — show every item (no need to pick categories). Items set to “Hide from the QR menu” stay hidden.</span>
                </label>
                )}
                <div style={{ padding: '10px 12px', borderRadius: 10, border: `1px solid ${m.allQrs ? '#86efac' : '#e5e7eb'}`, background: m.allQrs ? '#f0fdf4' : '#fff' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#374151' }}>
                    <input type="checkbox" checked={m.allQrs === true} onChange={(e) => setM(k, { allQrs: e.target.checked, ...(e.target.checked && !m.allQrsUntil ? { allQrsUntil: todayStr() } : {}) })} style={{ marginTop: 3 }} />
                    <span><b>Use on all my QR codes</b> — every table and takeaway QR shows this menu (e.g. for an event). No need to print new QR codes. Your normal menu comes back after the last day.</span>
                  </label>
                  {m.allQrs && (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 8, paddingLeft: 24 }}>
                      <label style={{ ...lbl, flexDirection: 'row', alignItems: 'center', gap: 8 }}>Last day
                        <input type="date" value={m.allQrsUntil || ''} min={todayStr()} onChange={(e) => setM(k, { allQrsUntil: e.target.value })} style={{ ...inp, width: 160 }} />
                      </label>
                      <span style={{ fontSize: 11.5, color: '#6b7280' }}>{m.allQrsUntil ? `Normal menu again after ${niceDate(m.allQrsUntil)} closing` : 'No last day — until you switch it off'}</span>
                      {menus.some((x, j) => j !== k && x.allQrs && saved.some((sv) => sv.id === x.id && sv.allQrs)) && (
                        <span style={{ fontSize: 11.5, color: '#b45309' }}>This replaces “{menus.find((x, j) => j !== k && x.allQrs)?.name}” on all QR codes.</span>
                      )}
                    </div>
                  )}
                  {m.allQrs && m.orderType === 'takeaway' && !m.viewOnly && (
                    <div style={{ fontSize: 11.5, color: '#166534', marginTop: 6, paddingLeft: 24 }}>Takeaway: customers order without a table number and get a token (order) number.</div>
                  )}
                </div>
                <label style={lbl}>Note at the top of the menu (optional)<input value={m.note} onChange={(e) => setM(k, { note: e.target.value })} placeholder="e.g. Staff lunch — pay at the counter" style={inp} /></label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151' }}>
                  <input type="checkbox" checked={m.active !== false} onChange={(e) => setM(k, { active: e.target.checked })} /> On — when off, this QR shows the normal full menu
                </label>
                </div>
                )}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                  <button type="button" onClick={() => (m.id && saved.some((x) => x.id === m.id) ? save(k, true) : (setMenus((cur) => cur.filter((_, j) => j !== k)), setOpen(null)))} disabled={saving} style={{ ...btn, color: '#b91c1c', display: 'inline-flex', alignItems: 'center', gap: 6 }}><FaTrash size={11} /> Delete</button>
                  <button type="button" onClick={() => save(k)} disabled={saving || !canSave(m)}
                    style={{ ...btn, background: '#7c3aed', color: '#fff', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, opacity: (saving || !canSave(m)) ? 0.5 : 1 }}>
                    {saving ? <FaSpinner className="animate-spin" size={11} /> : <FaCheck size={11} />} Save
                  </button>
                </div>
                {confirmDelete && confirmDelete.k === k && (
                  <div style={{ padding: '10px 12px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', fontSize: 12.5, color: '#991b1b', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ flex: 1, minWidth: 200 }}>This QR menu has <b>{confirmDelete.count}</b> dish{confirmDelete.count === 1 ? '' : 'es'} of its own. Deleting it deletes those dishes too.</span>
                    <button type="button" onClick={() => setConfirmDelete(null)} style={btn}>Keep</button>
                    <button type="button" onClick={() => save(k, true, true)} disabled={saving} style={{ ...btn, background: '#b91c1c', color: '#fff', border: 'none' }}>Delete menu and dishes</button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      <button type="button" onClick={() => { setMenus([...(menus || []), newMenu()]); setOpen((menus || []).length); }}
        style={{ padding: '12px', borderRadius: '12px', border: '1px dashed #c4b5fd', background: '#faf5ff', color: '#6d28d9', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <FaPlus size={11} /> New QR menu
      </button>
      {uploadFor && (
        <BulkMenuUpload
          isOpen
          onClose={() => setUploadFor(null)}
          restaurantId={restaurant.id}
          qrMenu={{ id: uploadFor.id, name: uploadFor.name }}
          onMenuItemsAdded={loadOwnDishes}
          taxSettings={restaurant?.taxSettings}
        />
      )}
      {photoFor && menus[photoFor.k] && (
        <QrMenuFromPhoto
          restaurant={restaurant}
          menuName={menus[photoFor.k].name}
          rows={photoFor.rows || null}
          onClose={() => setPhotoFor(null)}
          onDone={photoDone}
        />
      )}
      {msg && <div style={{ fontSize: 12.5, fontWeight: 600, color: msg === 'Saved' || msg === 'Link copied' ? '#059669' : '#b91c1c' }}>{msg}</div>}
    </div>
  );
}

const btn = { padding: '7px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', fontSize: '12.5px', fontWeight: 600, color: '#374151', cursor: 'pointer' };
const lbl = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontWeight: 600, color: '#374151' };
const inp = { width: '100%', boxSizing: 'border-box', padding: '9px 11px', borderRadius: '9px', border: '1px solid #e5e7eb', fontSize: 13.5, fontWeight: 400, color: '#111827', background: '#fff' };

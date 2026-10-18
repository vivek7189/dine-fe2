'use client';

// QR menus — named menus with their own QR code (Tables → QR codes → QR menus). Give someone a QR
// that shows only the categories / items you pick (e.g. "Corporate lunch", "Drinks only"); only
// those can be ordered from it — the server checks every order. The normal table / takeaway QRs
// keep showing the full menu. Items switched to "Hide from the QR / online menu" never show.

import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import apiClient from '../lib/api';
import { FaPlus, FaTrash, FaSpinner, FaCheck, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const newMenu = () => ({ id: '', name: '', categories: [], itemIds: [], orderType: 'any', note: '', active: true });

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
  const [itemSearch, setItemSearch] = useState('');

  useEffect(() => {
    if (!restaurant?.id) return;
    apiClient.request(`/api/restaurants/${restaurant.id}/qr-menus`).then((r) => { setMenus(r?.qrMenus || []); setSaved(r?.qrMenus || []); }).catch((e) => { setMenus([]); setMsg(e?.message || 'Could not load QR menus'); });
    apiClient.getPublicMenu(restaurant.id).then((r) => {
      setCats(Array.isArray(r?.categories) ? r.categories : []);
      setItems(Array.isArray(r?.menu) ? r.menu : []);
    }).catch(() => {});
  }, [restaurant?.id]);

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
  const countFor = (m) => items.filter((i) => (m.itemIds || []).includes(String(i.id)) || (m.categories || []).some((c) => catId(c) === catId(i.category))).length;
  const setM = (k, patch) => setMenus((list) => list.map((m, j) => (j === k ? { ...m, ...patch } : m)));
  // Save ONE menu (k) or delete it: built from the last saved list, so other menus' unsaved edits stay unsaved
  const save = async (k, remove = false) => {
    const m = menus[k];
    const isSaved = !!(m && m.id && saved.some((x) => x.id === m.id));
    const list = remove
      ? saved.filter((x) => !(m && m.id && x.id === m.id))
      : (isSaved ? saved.map((x) => (x.id === m.id ? m : x)) : [...saved, m]);
    setSaving(true); setMsg('');
    try {
      const r = await apiClient.request(`/api/restaurants/${restaurant.id}/qr-menus`, { method: 'PUT', body: { qrMenus: list } });
      const next = r?.qrMenus || [];
      setSaved(next);
      // keep other menus' unsaved edits on screen; this one now shows what was saved
      setMenus((cur) => {
        const others = cur.filter((_, j) => j !== k).filter((x) => !x.id || next.some((n) => n.id === x.id) || !saved.some((sv) => sv.id === x.id));
        const merged = next.map((n) => others.find((o) => o.id === n.id) || n);
        return [...merged, ...others.filter((o) => !o.id)];
      });
      setOpen(null); setMsg('Saved');
      setTimeout(() => setMsg(''), 2000);
    } catch (e) { setMsg(e?.message || 'Could not save'); }
    setSaving(false);
  };
  const filteredItems = useMemo(() => {
    const t = itemSearch.trim().toLowerCase();
    return t ? items.filter((i) => String(i.name || '').toLowerCase().includes(t)).slice(0, 40) : [];
  }, [items, itemSearch]);

  if (!menus) return <div style={{ padding: 30, textAlign: 'center' }}><FaSpinner className="animate-spin" color="#9ca3af" /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '4px 0 20px' }}>
      <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
        A QR that shows only the menu you pick — give it to a company, an event or a counter. Only those items can be ordered from it.
        Your table and takeaway QRs keep the full menu.
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
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: 2 }}>
                  {countFor(m)} items · {m.orderType === 'takeaway' ? 'takeaway' : m.orderType === 'dine-in' ? 'dine-in' : 'any order type'}
                </div>
                {m.id && (
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                    <button onClick={() => { if (!qr) return; const a = document.createElement('a'); a.href = qr; a.download = `QR-${m.name.replace(/[^a-z0-9]+/gi, '-')}.png`; a.click(); }} style={btn}>Download</button>
                    <button onClick={() => { try { navigator.clipboard.writeText(qrUrl(restaurant, m)); setMsg('Link copied'); setTimeout(() => setMsg(''), 1500); } catch (_) { /* no clipboard */ } }} style={btn}>Copy link</button>
                    <a href={qrUrl(restaurant, m)} target="_blank" rel="noreferrer" style={{ ...btn, textDecoration: 'none' }}>Open</a>
                  </div>
                )}
              </div>
              <button onClick={() => setOpen(editing ? null : k)} style={{ ...btn, display: 'inline-flex', alignItems: 'center', gap: 6 }}>{editing ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />} {editing ? 'Close' : 'Edit'}</button>
            </div>

            {editing && (
              <div style={{ borderTop: '1px solid #f3f4f6', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#fcfcfd' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  <label style={lbl}>Name<input value={m.name} onChange={(e) => setM(k, { name: e.target.value })} placeholder="e.g. Corporate lunch" style={inp} /></label>
                  <label style={lbl}>Orders from this QR are
                    <select value={m.orderType} onChange={(e) => setM(k, { orderType: e.target.value })} style={inp}>
                      <option value="any">Customer chooses</option><option value="takeaway">Takeaway</option><option value="dine-in">Dine-in</option>
                    </select>
                  </label>
                </div>
                <label style={lbl}>Note at the top of the menu (optional)<input value={m.note} onChange={(e) => setM(k, { note: e.target.value })} placeholder="e.g. Staff lunch — pay at the counter" style={inp} /></label>
                <div>
                  <div style={{ ...lbl, display: 'block', marginBottom: 6 }}>Categories on this menu</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {cats.map((c) => {
                      const on = (m.categories || []).includes(c.id);
                      return (
                        <button key={c.id} type="button" onClick={() => setM(k, { categories: on ? m.categories.filter((x) => x !== c.id) : [...(m.categories || []), c.id] })}
                          style={{ padding: '6px 12px', borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', border: `1px solid ${on ? '#7c3aed' : '#e5e7eb'}`, background: on ? '#f5f3ff' : '#fff', color: on ? '#6d28d9' : '#4b5563' }}>
                          {on ? '✓ ' : ''}{c.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <div style={{ ...lbl, display: 'block', marginBottom: 6 }}>Extra single items <span style={{ fontWeight: 400, color: '#9ca3af' }}>(from other categories)</span></div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: 6 }}>
                    {(m.itemIds || []).map((id) => {
                      const it = items.find((i) => String(i.id) === id);
                      return <span key={id} style={{ padding: '4px 10px', borderRadius: 999, background: '#ede9fe', color: '#5b21b6', fontSize: 12 }}>{it ? it.name : id} <button type="button" onClick={() => setM(k, { itemIds: m.itemIds.filter((x) => x !== id) })} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#7c3aed' }}>×</button></span>;
                    })}
                  </div>
                  <input value={itemSearch} onChange={(e) => setItemSearch(e.target.value)} placeholder="Search an item to add…" style={inp} />
                  {filteredItems.length > 0 && (
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, marginTop: 4, maxHeight: 180, overflowY: 'auto', background: '#fff' }}>
                      {filteredItems.map((i) => (
                        <button key={i.id} type="button" onClick={() => { setM(k, { itemIds: [...new Set([...(m.itemIds || []), String(i.id)])] }); setItemSearch(''); }}
                          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13 }}>{i.name}</button>
                      ))}
                    </div>
                  )}
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151' }}>
                  <input type="checkbox" checked={m.active !== false} onChange={(e) => setM(k, { active: e.target.checked })} /> On — when off, this QR shows the normal full menu
                </label>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                  <button type="button" onClick={() => (m.id ? save(k, true) : (setMenus((cur) => cur.filter((_, j) => j !== k)), setOpen(null)))} disabled={saving} style={{ ...btn, color: '#b91c1c', display: 'inline-flex', alignItems: 'center', gap: 6 }}><FaTrash size={11} /> Delete</button>
                  <button type="button" onClick={() => save(k)} disabled={saving || !m.name.trim() || (!(m.categories || []).length && !(m.itemIds || []).length)}
                    style={{ ...btn, background: '#7c3aed', color: '#fff', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, opacity: (saving || !m.name.trim() || (!(m.categories || []).length && !(m.itemIds || []).length)) ? 0.5 : 1 }}>
                    {saving ? <FaSpinner className="animate-spin" size={11} /> : <FaCheck size={11} />} Save
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <button type="button" onClick={() => { setMenus([...(menus || []), newMenu()]); setOpen((menus || []).length); }}
        style={{ padding: '12px', borderRadius: '12px', border: '1px dashed #c4b5fd', background: '#faf5ff', color: '#6d28d9', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <FaPlus size={11} /> New QR menu
      </button>
      {msg && <div style={{ fontSize: 12.5, fontWeight: 600, color: msg === 'Saved' || msg === 'Link copied' ? '#059669' : '#b91c1c' }}>{msg}</div>}
    </div>
  );
}

const btn = { padding: '7px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', fontSize: '12.5px', fontWeight: 600, color: '#374151', cursor: 'pointer' };
const lbl = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontWeight: 600, color: '#374151' };
const inp = { width: '100%', boxSizing: 'border-box', padding: '9px 11px', borderRadius: '9px', border: '1px solid #e5e7eb', fontSize: 13.5, fontWeight: 400, color: '#111827', background: '#fff' };

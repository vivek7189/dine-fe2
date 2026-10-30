'use client';

// Fill a QR menu ("Dishes from my menu") from a photo / PDF of a menu: the AI reads the dishes and
// prices, each one is matched to a dish in your menu (names can differ — "Piri Piri" = "Peri Peri",
// "Eggplant" = "Vangyache"), and you check the list before anything changes:
//  - found       → ticked onto this QR menu (your menu's price is used)
//  - switched off → can be switched on (it then shows everywhere again)
//  - not in menu → can be added to your menu with the price from the photo
// Reading the photo saves nothing; only "Add to QR menu" changes anything.
// Also opened with one typed dish (rows) to add a single new dish from the item search.

import { useEffect, useMemo, useState } from 'react';
import apiClient from '../lib/api';
import { useCurrency } from '../contexts/CurrencyContext';
import { FaCamera, FaSpinner, FaTimes } from 'react-icons/fa';

const MAX_FILE = 25 * 1024 * 1024; // the server's per-file limit for menu reading

// same words for the same thing (menus spell dishes many ways)
const SAME = { piri: 'peri', brinjal: 'eggplant', baingan: 'eggplant', vangyache: 'eggplant', vangi: 'eggplant', aubergine: 'eggplant', chiken: 'chicken', panner: 'paneer' };
const words = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/&/g, ' and ')
  .split(/[^a-z0-9]+/).filter(Boolean).map((w) => SAME[w] || w).map((w) => (w.length > 3 && w.endsWith('s') ? w.slice(0, -1) : w));
const key = (s) => words(s).join(' ');
// 0..1 — how alike two dish names are (+ a little when the price is the same)
function score(name, price, item) {
  const a = new Set(words(name)); const b = new Set(words(item.name));
  if (!a.size || !b.size) return 0;
  let common = 0; a.forEach((w) => { if (b.has(w)) common += 1; });
  let s = (2 * common) / (a.size + b.size);
  if (common && (common === a.size || common === b.size)) s = Math.max(s, 0.7); // one name inside the other
  if (Number(price) > 0 && Number(price) === Number(item.price)) s += 0.15;
  return s;
}
const catId = (v) => String(v || '').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

export default function QrMenuFromPhoto({ restaurant, menuName, rows: startRows = null, onClose, onDone }) {
  const [menuItems, setMenuItems] = useState(null); // your menu, switched-off dishes included
  const [cats, setCats] = useState([]);
  const [files, setFiles] = useState([]);
  const [reading, setReading] = useState(false);
  const [rows, setRows] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const { getCurrencySymbol } = useCurrency();
  const sym = getCurrencySymbol();

  useEffect(() => {
    apiClient.getMenu(restaurant.id).then((r) => {
      // a QR menu's own dishes (qrMenuOnly) belong to that QR only — never matched here
      setMenuItems((r?.menuItems || []).filter((i) => i.status !== 'deleted' && !i.qrMenuOnly));
      setCats((r?.categories || []).filter((c) => !String(c.id || '').startsWith('qrmenu-')));
    }).catch((e) => { setMenuItems([]); setErr(e?.message || 'Could not load your menu'); });
  }, [restaurant.id]);

  const firstCat = cats[0]?.id || '';
  const guessCat = (c) => (cats.find((x) => catId(x.id) === catId(c) || catId(x.name) === catId(c))?.id || '');

  // dishes read from the photo (or typed) → rows matched to your menu
  const buildRows = (dishes) => dishes.filter((d) => String(d.name || '').trim()).map((d, n) => {
    const ranked = menuItems.map((it) => ({ it, s: key(d.name) === key(it.name) ? 2 : score(d.name, d.price, it) }))
      .filter((x) => x.s >= 0.4).sort((x, y) => y.s - x.s).slice(0, 6);
    const best = ranked[0];
    return {
      n, name: String(d.name).trim(), price: Number(d.price) || '', isVeg: d.isVeg !== false, description: d.description || '',
      options: ranked.map((x) => x.it),
      matchId: best && best.s >= 0.5 ? String(best.it.id) : '',
      sure: !!best && best.s >= 1,
      switchOn: true,
      add: true,
      category: guessCat(d.category) || firstCat,
    };
  });

  useEffect(() => {
    if (startRows && menuItems && !rows) setRows(buildRows(startRows));
  }, [startRows, menuItems]); // eslint-disable-line react-hooks/exhaustive-deps

  const read = async () => {
    if (!files.length) return;
    if (files.some((f) => f.size > MAX_FILE)) { setErr('A file is over 25 MB — please use a smaller photo or fewer pages.'); return; }
    setReading(true); setErr('');
    try {
      const r = await apiClient.uploadMenuFiles(restaurant.id, files);
      const dishes = (r?.data || []).flatMap((m) => m.menuItems || []);
      if (!dishes.length) setErr('No dishes could be read. Try a clearer, straight photo.');
      else setRows(buildRows(dishes));
    } catch (e) { setErr(e?.message || 'Could not read the menu'); }
    setReading(false);
  };

  const setRow = (n, patch) => setRows((list) => list.map((r) => (r.n === n ? { ...r, ...patch } : r)));
  const itemOf = (id) => (menuItems || []).find((i) => String(i.id) === String(id));

  const plan = useMemo(() => {
    const p = { pick: [], switchOn: [], create: [], skipped: 0, noCat: 0 };
    (rows || []).forEach((r) => {
      const it = r.matchId && itemOf(r.matchId);
      if (it) {
        p.pick.push(String(it.id));
        if (it.isAvailable === false && r.switchOn) p.switchOn.push(it);
      } else if (r.add && r.name && Number(r.price) > 0 && r.category) p.create.push(r);
      else if (r.add && !r.category) p.noCat += 1;
      else p.skipped += 1;
    });
    p.pick = [...new Set(p.pick)];
    p.switchOn = p.switchOn.filter((it, i, a) => a.findIndex((x) => x.id === it.id) === i);
    return p;
  }, [rows, menuItems]); // eslint-disable-line react-hooks/exhaustive-deps

  const apply = async () => {
    setBusy(true); setErr('');
    const ids = [...plan.pick];
    const failed = [];
    let switchedOn = 0; let added = 0;
    for (const it of plan.switchOn) {
      try { await apiClient.updateMenuItem(it.id, { isAvailable: true }, restaurant.id); switchedOn += 1; } catch (_) { failed.push(it.name); }
    }
    for (const r of plan.create) {
      try {
        const res = await apiClient.createMenuItem(restaurant.id, { name: r.name.trim(), price: Number(r.price), category: r.category, isVeg: r.isVeg, description: r.description });
        if (res?.menuItem?.id) { ids.push(String(res.menuItem.id)); added += 1; } else failed.push(r.name);
      } catch (_) { failed.push(r.name); }
    }
    setBusy(false);
    onDone(ids, { added, switchedOn, failed });
  };

  const nothing = rows && !plan.pick.length && !plan.create.length;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 680, maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>{startRows ? 'Add a dish' : 'Fill from a menu photo'}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>For “{menuName || 'this QR menu'}”</div>
          </div>
          <button type="button" onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#6b7280' }}><FaTimes /></button>
        </div>

        <div style={{ padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {!menuItems && <div style={{ textAlign: 'center', padding: 20 }}><FaSpinner className="animate-spin" color="#9ca3af" /></div>}

          {menuItems && !rows && (
            <>
              <p style={{ margin: 0, fontSize: 13, color: '#4b5563', lineHeight: 1.5 }}>
                Take a photo of the menu (or pick a PDF). We read the dishes and prices and find them in your menu — you check the list before anything is saved.
              </p>
              <label style={{ border: '1.5px dashed #c4b5fd', borderRadius: 12, padding: 18, textAlign: 'center', cursor: 'pointer', background: '#faf5ff', color: '#6d28d9', fontWeight: 700, fontSize: 13.5 }}>
                <FaCamera style={{ marginRight: 8 }} />{files.length ? files.map((f) => f.name).join(', ') : 'Choose photo or PDF'}
                <input type="file" accept="image/*,application/pdf" multiple onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 10))} style={{ display: 'none' }} />
              </label>
              <button type="button" onClick={read} disabled={!files.length || reading}
                style={{ ...btnMain, opacity: !files.length || reading ? 0.5 : 1 }}>
                {reading ? <><FaSpinner className="animate-spin" size={11} /> Reading the menu… (up to a minute)</> : 'Read the menu'}
              </button>
            </>
          )}

          {rows && (
            <>
              {!startRows && <div style={{ fontSize: 12.5, color: '#4b5563' }}>Found <b>{rows.length}</b> dishes. Check each one — the price your customers pay is the one in your menu.</div>}
              {rows.map((r) => {
                const it = r.matchId && itemOf(r.matchId);
                const off = it && it.isAvailable === false;
                return (
                  <div key={r.n} style={{ border: `1px solid ${it ? (off ? '#fcd34d' : '#bbf7d0') : '#fecaca'}`, borderRadius: 12, padding: '10px 12px', background: it ? (off ? '#fffbeb' : '#f0fdf4') : '#fef2f2' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                      <b style={{ fontSize: 13.5, color: '#111827' }}>{r.name}</b>
                      {r.price !== '' && <span style={{ fontSize: 12, color: '#6b7280' }}>{sym}{r.price} on the photo</span>}
                      <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: it ? (off ? '#b45309' : '#166534') : '#b91c1c' }}>
                        {it ? (off ? 'Switched off' : (r.sure ? 'Found' : 'Same dish?')) : 'Not in your menu'}
                      </span>
                    </div>
                    {(r.options.length > 0) && (
                      <select value={r.matchId} onChange={(e) => setRow(r.n, { matchId: e.target.value, sure: true })} style={{ ...inp, marginTop: 6 }}>
                        {r.options.map((o) => <option key={o.id} value={String(o.id)}>{o.name} — {sym}{o.price}{o.isAvailable === false ? ' (switched off)' : ''}</option>)}
                        <option value="">Not in my menu</option>
                      </select>
                    )}
                    {it && Number(r.price) > 0 && Number(it.price) !== Number(r.price) && (
                      <div style={{ fontSize: 11.5, color: '#92400e', marginTop: 4 }}>Your menu price is {sym}{it.price} — that is what customers pay.</div>
                    )}
                    {off && (
                      <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12.5, color: '#78350f', marginTop: 6 }}>
                        <input type="checkbox" checked={r.switchOn} onChange={(e) => setRow(r.n, { switchOn: e.target.checked })} style={{ marginTop: 2 }} />
                        <span>Switch it on — it shows again on all your QRs and the POS. Leave unticked if it is out of stock (it stays hidden).</span>
                      </label>
                    )}
                    {!it && (
                      <div style={{ marginTop: 6 }}>
                        <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12.5, color: '#374151' }}>
                          <input type="checkbox" checked={r.add} onChange={(e) => setRow(r.n, { add: e.target.checked })} /> Add it to my menu
                        </label>
                        {r.add && (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 6, marginTop: 6 }}>
                            <input value={r.name} onChange={(e) => setRow(r.n, { name: e.target.value })} placeholder="Dish name" style={inp} />
                            <input value={r.price} onChange={(e) => setRow(r.n, { price: e.target.value.replace(/[^0-9.]/g, '') })} placeholder={sym ? `Price (${sym})` : 'Price'} inputMode="decimal" style={inp} />
                            <select value={r.category} onChange={(e) => setRow(r.n, { category: e.target.value })} style={inp}>
                              <option value="">Category…</option>
                              {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <select value={r.isVeg ? 'veg' : 'non'} onChange={(e) => setRow(r.n, { isVeg: e.target.value === 'veg' })} style={inp}>
                              <option value="veg">Veg</option><option value="non">Non-veg</option>
                            </select>
                          </div>
                        )}
                        {r.add && !(Number(r.price) > 0) && <div style={{ fontSize: 11.5, color: '#b91c1c', marginTop: 4 }}>Enter the price to add it.</div>}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
          {err && <div style={{ fontSize: 12.5, color: '#b91c1c', fontWeight: 600 }}>{err}</div>}
        </div>

        {rows && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200, fontSize: 12, color: '#4b5563' }}>
              {plan.pick.length + plan.create.length} on this QR menu
              {plan.create.length ? ` · ${plan.create.length} new in your menu` : ''}
              {plan.switchOn.length ? ` · ${plan.switchOn.length} switched on` : ''}
              {plan.noCat ? ` · ${plan.noCat} need a category` : ''}
            </div>
            <button type="button" onClick={onClose} style={btn}>Cancel</button>
            <button type="button" onClick={apply} disabled={busy || nothing} style={{ ...btnMain, width: 'auto', opacity: busy || nothing ? 0.5 : 1 }}>
              {busy ? <FaSpinner className="animate-spin" size={11} /> : null} Add to QR menu
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const btn = { padding: '8px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 12.5, fontWeight: 600, color: '#374151', cursor: 'pointer' };
const btnMain = { width: '100%', padding: '10px 14px', borderRadius: 10, border: 'none', background: '#7c3aed', color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 };
const inp = { width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, color: '#111827', background: '#fff' };

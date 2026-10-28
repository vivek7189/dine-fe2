'use client';

// Owner / manager editor for "Today's special" on the QR menu (customerAppSettings.todaySpecial,
// backend utils/qrTodaySpecial.js). Made for a daily 1-minute change: switch on, pick categories
// (e.g. Kingfish, Pomfret) or single dishes, a title, how long it shows → Save.
import { useEffect, useMemo, useState } from 'react';
import { FaTimes, FaCheck, FaSearch } from 'react-icons/fa';
import apiClient from '../lib/api';

const TITLES = ['Fresh catch of the day 🐟', "Today's special ⭐", "Chef's special today 👨‍🍳"];
const pretty = (c) => String(c || '').replace(/[-_]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

export default function TodaySpecialEditor({ restaurantId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(null); // { showingNow }
  const [today, setToday] = useState('');
  const [items, setItems] = useState([]);
  const [catNames, setCatNames] = useState({});
  const [q, setQ] = useState('');
  const [f, setF] = useState({ enabled: true, title: TITLES[0], note: '', categories: [], itemIds: [], until: 'today' });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [sp, menu] = await Promise.all([
          apiClient.request(`/api/restaurants/${restaurantId}/today-special`),
          apiClient.getMenu(restaurantId),
        ]);
        if (!alive) return;
        const list = (menu && (menu.menuItems || menu.items || menu.menu)) || [];
        setItems(Array.isArray(list) ? list : []);
        const names = {};
        ((menu && menu.categories) || []).forEach((c) => { if (c) { names[String(c.id || '').toLowerCase()] = c.name; names[String(c.name || '').toLowerCase()] = c.name; } });
        setCatNames(names);
        setToday(sp?.today || '');
        const t = sp?.todaySpecial;
        if (t) {
          setF({
            enabled: t.enabled === true, title: t.title || TITLES[0], note: t.note || '',
            categories: t.categories || [], itemIds: t.itemIds || [],
            until: !t.until ? 'off' : (t.until === sp.today ? 'today' : t.until),
          });
          setSaved({ showingNow: !!sp.showingNow });
        }
      } catch (e) {
        if (alive) setError(e?.message || 'Could not load');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [restaurantId]);

  // Categories that have dishes, in menu order, with a dish count.
  const cats = useMemo(() => {
    const m = new Map();
    items.forEach((it) => { const k = String(it.category || '').toLowerCase(); if (k) m.set(k, (m.get(k) || 0) + 1); });
    return [...m.entries()].map(([k, n]) => ({ key: k, label: catNames[k] || pretty(k), n }));
  }, [items, catNames]);

  const chosenDishes = useMemo(() => {
    const cs = new Set(f.categories);
    const out = items.filter((it) => cs.has(String(it.category || '').toLowerCase()));
    f.itemIds.forEach((id) => { const it = items.find((x) => x.id === id); if (it && !out.includes(it)) out.push(it); });
    return out;
  }, [items, f.categories, f.itemIds]);

  const found = q.trim().length >= 2
    ? items.filter((it) => it.name && it.name.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 8) : [];

  // Any change clears the last "Saved…" line (it describes what was saved, not the edits on screen).
  const upd = (fn) => { setSaved(null); setF(fn); };
  const toggle = (key, v) => upd((x) => ({ ...x, [key]: x[key].includes(v) ? x[key].filter((y) => y !== v) : [...x[key], v] }));

  const save = async () => {
    setSaving(true); setError('');
    try {
      const until = f.until === 'today' ? today : (f.until === 'off' ? null : f.until);
      const r = await apiClient.request(`/api/restaurants/${restaurantId}/today-special`, {
        method: 'PUT', body: JSON.stringify({ ...f, until }),
      });
      setSaved({ showingNow: !!r?.showingNow });
    } catch (e) {
      setError(e?.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const canSave = !f.enabled || chosenDishes.length > 0;

  return (
    <div onClick={() => !saving && onClose && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div role="dialog" aria-label="Today's special on QR menu" onClick={(e) => e.stopPropagation()}
        style={{ background: 'white', borderRadius: 18, width: '100%', maxWidth: 560, maxHeight: '92vh', overflow: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 18px', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
          <div style={{ fontSize: 24 }}>🐟</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 17, color: '#111827' }}>Today&apos;s special on QR menu</div>
            <div style={{ fontSize: 12.5, color: '#6b7280' }}>Shows at the very top of your QR menu. Change it any day.</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ border: 'none', background: '#f3f4f6', borderRadius: 10, width: 34, height: 34, cursor: 'pointer' }}><FaTimes /></button>
        </div>

        {loading ? <div style={{ padding: 30, textAlign: 'center', color: '#6b7280' }}>Loading…</div> : (
          <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* 1. On / off */}
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 14px', borderRadius: 12, background: f.enabled ? '#fff7ed' : '#f9fafb', border: `1px solid ${f.enabled ? '#fed7aa' : '#e5e7eb'}`, cursor: 'pointer' }}>
              <span style={{ fontWeight: 700, color: '#111827' }}>Show on QR menu</span>
              <input type="checkbox" checked={f.enabled} onChange={(e) => upd((x) => ({ ...x, enabled: e.target.checked }))} style={{ width: 22, height: 22, accentColor: '#ea580c' }} />
            </label>

            {f.enabled && (<>
              {/* 2. Title */}
              <div>
                <div style={stepLabel}>1. Heading</div>
                <input value={f.title} maxLength={60} onChange={(e) => upd((x) => ({ ...x, title: e.target.value }))} style={input} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {TITLES.map((t) => <button key={t} type="button" onClick={() => upd((x) => ({ ...x, title: t }))} style={chip(f.title === t)}>{t}</button>)}
                </div>
                <input value={f.note} maxLength={140} onChange={(e) => upd((x) => ({ ...x, note: e.target.value }))} placeholder="Small line under it (optional) — e.g. Caught this morning · ask about today's size" style={{ ...input, marginTop: 8, fontSize: 13.5 }} />
              </div>

              {/* 3. What to show */}
              <div>
                <div style={stepLabel}>2. Which dishes</div>
                <div style={{ fontSize: 12.5, color: '#6b7280', marginBottom: 8 }}>Tap whole categories…</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {cats.map((c) => (
                    <button key={c.key} type="button" aria-pressed={f.categories.includes(c.key)} onClick={() => toggle('categories', c.key)} style={chip(f.categories.includes(c.key))}>
                      {f.categories.includes(c.key) ? '✓ ' : ''}{c.label} <span style={{ opacity: 0.7 }}>({c.n})</span>
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 12.5, color: '#6b7280', margin: '12px 0 6px' }}>…or add single dishes</div>
                <div style={{ position: 'relative' }}>
                  <FaSearch style={{ position: 'absolute', left: 12, top: 13, color: '#9ca3af' }} size={13} />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a dish" style={{ ...input, paddingLeft: 34 }} />
                </div>
                {found.length > 0 && (
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, marginTop: 6, overflow: 'hidden' }}>
                    {found.map((it) => {
                      const on = f.itemIds.includes(it.id);
                      return (
                        <button key={it.id} type="button" onClick={() => toggle('itemIds', it.id)} style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 8, padding: '9px 12px', border: 'none', borderBottom: '1px solid #f3f4f6', background: on ? '#fff7ed' : 'white', cursor: 'pointer', textAlign: 'left' }}>
                          <span style={{ width: 18, color: '#ea580c' }}>{on ? <FaCheck size={12} /> : null}</span>
                          <span style={{ flex: 1, fontSize: 14, color: '#111827' }}>{it.name}</span>
                          <span style={{ fontSize: 12, color: '#6b7280' }}>{catNames[String(it.category || '').toLowerCase()] || pretty(it.category)}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 4. How long */}
              <div>
                <div style={stepLabel}>3. Show until</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                  <button type="button" onClick={() => upd((x) => ({ ...x, until: 'today' }))} style={chip(f.until === 'today')}>Today only</button>
                  <button type="button" onClick={() => upd((x) => ({ ...x, until: 'off' }))} style={chip(f.until === 'off')}>Until I turn it off</button>
                  <input type="date" min={today || undefined} value={!['today', 'off'].includes(f.until) ? f.until : ''} onChange={(e) => upd((x) => ({ ...x, until: e.target.value || 'today' }))} style={{ ...input, width: 'auto', padding: '7px 10px', fontSize: 13 }} aria-label="Last day" />
                </div>
              </div>

              {/* Preview */}
              <div style={{ borderRadius: 12, background: '#f9fafb', border: '1px dashed #d1d5db', padding: '10px 12px' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#9ca3af', letterSpacing: '0.06em', marginBottom: 4 }}>CUSTOMERS WILL SEE</div>
                <div style={{ fontWeight: 800, color: '#9a3412' }}>{f.title || 'Fresh catch of the day'}</div>
                {f.note ? <div style={{ fontSize: 12.5, color: '#b45309' }}>{f.note}</div> : null}
                <div style={{ fontSize: 13, color: '#374151', marginTop: 4 }}>
                  {chosenDishes.length ? chosenDishes.map((d) => d.name).join(' · ') : <span style={{ color: '#dc2626' }}>Pick at least one category or dish</span>}
                </div>
              </div>
            </>)}

            {error && <div style={{ color: '#b91c1c', fontSize: 13 }}>{error}</div>}
            {saved && !saving && !error && (
              <div style={{ fontSize: 13, fontWeight: 600, color: saved.showingNow ? '#047857' : '#6b7280' }}>
                {saved.showingNow ? '✓ Saved — showing on your QR menu now' : '✓ Saved — not showing on the QR menu'}
              </div>
            )}
            <button type="button" onClick={save} disabled={saving || !canSave}
              style={{ padding: '13px 16px', borderRadius: 12, border: 'none', background: canSave ? '#ea580c' : '#fdba74', color: 'white', fontWeight: 800, fontSize: 15, cursor: canSave ? 'pointer' : 'not-allowed' }}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const stepLabel = { fontSize: 13, fontWeight: 800, color: '#111827', marginBottom: 6 };
const input = { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 14.5, outline: 'none', boxSizing: 'border-box' };
const chip = (on) => ({ padding: '7px 12px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: on ? '1.5px solid #ea580c' : '1.5px solid #e5e7eb', background: on ? '#ea580c' : 'white', color: on ? 'white' : '#374151' });

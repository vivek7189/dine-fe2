'use client';

// Customer App → Branding → "Quick menu" (customerAppSettings.quickMenu, backend utils/qrQuickMenu.js).
// Off by default. Switch + two optional parts, both for the QR page only:
//  - Sections: show several menu categories as one section (e.g. Iced coffee + Hot classics → "Coffee & Tea"),
//    and put a section under Food or Drinks. The menu, POS, KOT and reports keep the real categories.
//  - Add-ons under dishes: chosen add-on dishes show as a small strip right after chosen dishes.
import { useEffect, useMemo, useState } from 'react';
import { FaTimes, FaPlus } from 'react-icons/fa';
import apiClient from '../../lib/api';

const pretty = (c) => String(c || '').replace(/[-_]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
const box = { border: '2px solid #e5e7eb', borderRadius: 10, background: 'white', padding: '10px 12px' };
const input = { width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' };
const chip = { display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f3f4f6', borderRadius: 999, padding: '3px 8px', fontSize: 12, margin: '0 4px 4px 0' };

function DishPicker({ items, ids, onChange, placeholder }) {
  const byId = useMemo(() => new Map(items.map(i => [i.id, i])), [items]);
  return (
    <div>
      <div>
        {ids.map(id => (
          <span key={id} style={chip}>
            {byId.get(id)?.name || 'Removed dish'}
            <button type="button" aria-label="Remove" onClick={() => onChange(ids.filter(x => x !== id))}
              style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#6b7280' }}><FaTimes size={10} /></button>
          </span>
        ))}
      </div>
      <select value="" onChange={(e) => { if (e.target.value) onChange([...ids, e.target.value]); }} style={input}>
        <option value="">{placeholder}</option>
        {items.filter(i => !ids.includes(i.id)).map(i => <option key={i.id} value={i.id}>{i.name} — {pretty(i.category)}</option>)}
      </select>
    </div>
  );
}

export default function QuickMenuSettings({ restaurantId, value, onChange }) {
  const q = { enabled: false, sections: {}, tabs: {}, addonLinks: [], ...(value || {}) };
  const set = (patch) => onChange({ ...q, ...patch });
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!restaurantId || !open) return undefined;
    let alive = true;
    apiClient.getMenu(restaurantId).then((menu) => {
      if (!alive) return;
      const list = (menu && (menu.menuItems || menu.items || menu.menu)) || [];
      setItems((Array.isArray(list) ? list : []).filter(i => i && i.id && i.status !== 'deleted'));
    }).catch(() => {});
    return () => { alive = false; };
  }, [restaurantId, open]);

  // Categories that have dishes, in menu order.
  const cats = useMemo(() => {
    const seen = [];
    items.forEach(i => { const c = i.category; if (c && !seen.includes(c)) seen.push(c); });
    return seen;
  }, [items]);
  const sectionNames = [...new Set(cats.map(c => q.sections[c] || c))];
  const setSection = (cat, name) => {
    const sections = { ...q.sections };
    if (name.trim()) sections[cat] = name.slice(0, 40); else delete sections[cat];
    set({ sections });
  };
  const setTab = (name, v) => {
    const tabs = { ...q.tabs };
    if (v) tabs[name] = v; else delete tabs[name];
    set({ tabs });
  };
  const setLink = (i, patch) => set({ addonLinks: q.addonLinks.map((l, k) => (k === i ? { ...l, ...patch } : l)) });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ ...box, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, cursor: 'pointer' }}>
        <span>
          <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151' }}>Quick menu</span>
          <span style={{ display: 'block', fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
            QR menu (Classic design): small header with the search in it, short dish cards, Food / Drinks tabs, a &quot;Veg only&quot; switch, and the cart puts the cursor in the phone box, then the name box.
          </span>
        </span>
        <input type="checkbox" checked={q.enabled === true} data-testid="quick-menu-switch"
          onChange={(e) => set({ enabled: e.target.checked })}
          style={{ width: 18, height: 18, accentColor: '#111827', flexShrink: 0 }} />
      </label>

      <button type="button" onClick={() => setOpen(o => !o)}
        style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: '#2563eb', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
        {open ? 'Hide sections & add-ons' : 'Sections & add-ons (optional)'}
      </button>

      {open && (
        <div style={{ ...box, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {!items.length ? <div style={{ fontSize: 12, color: '#9ca3af' }}>Loading menu…</div> : (
            <>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Sections on the QR menu</div>
                <div style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 8px' }}>
                  Give several categories the same name to show them as one section (e.g. &quot;Coffee &amp; Tea&quot;). Empty = the category&apos;s own name. Only the QR page changes.
                </div>
                <datalist id="qm-section-names">{sectionNames.filter(n => !cats.includes(n)).map(n => <option key={n} value={n} />)}</datalist>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '6px 10px', alignItems: 'center' }}>
                  {cats.map(c => (
                    <div key={c} style={{ display: 'contents' }}>
                      <span style={{ fontSize: 12, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pretty(c)}</span>
                      <input list="qm-section-names" value={q.sections[c] || ''} placeholder={pretty(c)} data-testid={`qm-section-${c}`}
                        onChange={(e) => setSection(c, e.target.value)} style={input} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Food or Drinks</div>
                <div style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 8px' }}>Auto puts juice, coffee, tea, smoothies, beer and liquor under Drinks, the rest under Food.</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 120px', gap: '6px 10px', alignItems: 'center' }}>
                  {sectionNames.map(n => (
                    <div key={n} style={{ display: 'contents' }}>
                      <span style={{ fontSize: 12, color: '#374151' }}>{cats.includes(n) ? pretty(n) : n}</span>
                      <select value={q.tabs[n] || ''} onChange={(e) => setTab(n, e.target.value)} style={input}>
                        <option value="">Auto</option>
                        <option value="food">Food</option>
                        <option value="drinks">Drinks</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Add-ons under dishes</div>
                <div style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 8px' }}>
                  e.g. Cheese, Extra bread after the Parathas; dips after the Fries. Those add-ons then show only there, not in their own section.
                </div>
                {q.addonLinks.map((l, i) => (
                  <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, marginBottom: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input value={l.label || ''} placeholder="Heading (e.g. Add-ons)" onChange={(e) => setLink(i, { label: e.target.value.slice(0, 40) })} style={input} />
                      <button type="button" onClick={() => set({ addonLinks: q.addonLinks.filter((_, k) => k !== i) })}
                        style={{ border: '1px solid #fecaca', background: '#fef2f2', color: '#b91c1c', borderRadius: 8, padding: '0 10px', fontSize: 12, cursor: 'pointer' }}>Remove</button>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280' }}>Add-on dishes</div>
                    <DishPicker items={items} ids={l.addonIds || []} placeholder="+ Add an add-on dish" onChange={(ids) => setLink(i, { addonIds: ids })} />
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280' }}>Show after these dishes</div>
                    <DishPicker items={items} ids={l.afterIds || []} placeholder="+ Add a dish" onChange={(ids) => setLink(i, { afterIds: ids })} />
                  </div>
                ))}
                {q.addonLinks.length < 30 && (
                  <button type="button" onClick={() => set({ addonLinks: [...q.addonLinks, { label: 'Add-ons', addonIds: [], afterIds: [] }] })}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px dashed #9ca3af', background: 'white', borderRadius: 8, padding: '6px 10px', fontSize: 12, cursor: 'pointer' }}>
                    <FaPlus size={10} /> Add-on group
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

// "Today's special" band at the top of the QR menu (customerAppSettings.todaySpecial, set by the
// owner / manager in Menu → Today's special). Shows the chosen dishes (whole categories and/or single
// items) under the restaurant's own title, e.g. "Fresh catch of the day". Display + Add only — prices
// and ordering are the menu's own (same item objects, same add-to-cart).
import { getDisplayImage } from '../utils/placeholderImages';

const LOOKS = {
  standard: { wrap: 'linear-gradient(135deg, #fff7ed 0%, #fffbeb 100%)', border: '#fed7aa', title: '#9a3412', note: '#b45309', card: '#ffffff', cardBorder: '#fde4c7', name: '#1f2937', price: '#111827', btn: '#ea580c', btnText: '#ffffff', tag: '#ea580c' },
  dark: { wrap: '#141414', border: '#2a2a2a', title: '#ffffff', note: '#a3a3a3', card: '#1c1c1c', cardBorder: '#2e2e2e', name: '#f5f5f5', price: '#ffffff', btn: '#ffffff', btnText: '#000000', tag: '#fbbf24' },
  green: { wrap: '#0B3D2E', border: '#C9A227', title: '#ffffff', note: '#D9E8DF', card: '#ffffff', cardBorder: '#E1ECE5', name: '#10291F', price: '#1F7A4D', btn: '#1F7A4D', btnText: '#ffffff', tag: '#C9A227' },
};

// Items for the band: whole categories first (menu order), then single items; no duplicates.
export function todaySpecialItems(special, menu) {
  if (!special || !Array.isArray(menu)) return [];
  const cats = new Set((special.categories || []).map((c) => String(c).toLowerCase()));
  const ids = special.itemIds || [];
  const out = [];
  const seen = new Set();
  const push = (it) => { if (it && !seen.has(it.id) && it.isAvailable !== false) { seen.add(it.id); out.push(it); } };
  menu.filter((it) => cats.has(String(it.category || '').toLowerCase())).forEach(push);
  ids.forEach((id) => push(menu.find((it) => it.id === id)));
  return out;
}

export default function QrTodaySpecial({ special, menu, look = 'standard', cs = '₹', qtyOf, onAdd, onRemove, hideImages = false }) {
  const items = todaySpecialItems(special, menu);
  if (!items.length) return null;
  const c = LOOKS[look] || LOOKS.standard;
  return (
    <section aria-label={special.title} style={{ background: c.wrap, border: `1.5px solid ${c.border}`, borderRadius: 18, padding: '14px 14px 12px', margin: '14px 0 10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: look === 'standard' ? '#fff' : c.wrap, background: c.tag, padding: '3px 8px', borderRadius: 999 }}>Today</span>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: c.title, lineHeight: 1.25 }}>{special.title}</h2>
      </div>
      {special.note ? <p style={{ margin: '4px 0 0', fontSize: 13, color: c.note }}>{special.note}</p> : null}
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '12px 2px 4px', WebkitOverflowScrolling: 'touch' }}>
        {items.map((it) => {
          const q = qtyOf ? qtyOf(it.id) : 0;
          const img = hideImages ? null : getDisplayImage(it);
          const hasChoices = (Array.isArray(it.variants) && it.variants.length) || (Array.isArray(it.sizes) && it.sizes.length);
          return (
            <div key={it.id} style={{ flex: '0 0 auto', width: 150, background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {img ? <img src={img} alt="" loading="lazy" style={{ width: '100%', height: 92, objectFit: 'cover', display: 'block' }} /> : null}
              <div style={{ padding: '8px 10px 10px', display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: c.name, lineHeight: 1.25 }}>{it.name}</div>
                <div style={{ fontSize: 11.5, color: '#6b7280', textTransform: 'capitalize' }}>{String(it.category || '').replace(/[-_]+/g, ' ')}</div>
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, paddingTop: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: c.price }}>{hasChoices ? 'from ' : ''}{cs}{Number(it.price || 0).toLocaleString()}</span>
                  {q > 0 && !hasChoices ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 9, overflow: 'hidden', border: `1px solid ${c.btn}` }}>
                      <button type="button" aria-label={`Remove one ${it.name}`} onClick={() => onRemove && onRemove(it.id)} style={{ width: 26, height: 26, border: 'none', background: 'transparent', color: c.price, fontWeight: 800, cursor: 'pointer' }}>−</button>
                      <span style={{ minWidth: 18, textAlign: 'center', fontSize: 13, fontWeight: 800, color: c.price }}>{q}</span>
                      <button type="button" aria-label={`Add one ${it.name}`} onClick={() => onAdd && onAdd(it)} style={{ width: 26, height: 26, border: 'none', background: 'transparent', color: c.price, fontWeight: 800, cursor: 'pointer' }}>+</button>
                    </span>
                  ) : (
                    <button type="button" onClick={() => onAdd && onAdd(it)} style={{ padding: '5px 11px', borderRadius: 9, border: 'none', background: c.btn, color: c.btnText, fontSize: 12.5, fontWeight: 800, cursor: 'pointer' }}>{q > 0 ? `Add · ${q}` : 'Add'}</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

'use client';

// Additional Charges settings — generic, international, no hardcoding. Restaurants define any
// number of charges (packaging, service, container, cutlery, …), each fixed or %, scoped to
// order types, optionally taxable (with an optional explicit tax rate), optional % cap and
// min-order threshold. Stored in taxSettings.additionalCharges; the backend applies + snapshots
// them on each order and prints them on the bill/receipt. Fully controlled via `onChange`.

import { FaPlus, FaTrash } from 'react-icons/fa';

const ORDER_TYPES = [
  { key: 'dine-in', label: 'Dine-In' },
  { key: 'takeaway', label: 'Takeaway' },
  { key: 'delivery', label: 'Delivery' },
];

const box = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 14, marginBottom: 12 };
const label = { fontSize: 11, color: '#6b7280', fontWeight: 600, marginBottom: 4, display: 'block' };
const input = { width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, boxSizing: 'border-box' };
const chip = (on) => ({ padding: '5px 11px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid ' + (on ? '#ef4444' : '#d1d5db'), background: on ? '#ef4444' : '#fff', color: on ? '#fff' : '#6b7280' });

export default function AdditionalChargesSettings({ charges, onChange, currencySymbol = '₹' }) {
  const list = Array.isArray(charges) ? charges : [];

  const update = (i, patch) => onChange(list.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  const remove = (i) => onChange(list.filter((_, idx) => idx !== i));
  const add = () => onChange([
    ...list,
    { id: `chg_${Date.now()}`, name: '', type: 'fixed', value: 0, appliesTo: ['delivery'], taxable: true, taxRate: null, maxCap: null, minOrderValue: null, enabled: true },
  ]);

  // "All order types" = empty list or contains 'all'
  const isAll = (c) => !Array.isArray(c.appliesTo) || c.appliesTo.length === 0 || c.appliesTo.some((x) => String(x).toLowerCase() === 'all');
  const toggleType = (i, key) => {
    const c = list[i];
    const cur = isAll(c) ? [] : (Array.isArray(c.appliesTo) ? c.appliesTo.filter((x) => String(x).toLowerCase() !== 'all') : []);
    const next = cur.includes(key) ? cur.filter((x) => x !== key) : [...cur, key];
    update(i, { appliesTo: next });
  };
  const numOrNull = (v) => (v === '' || v === null || v === undefined ? null : Number(v));

  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>📦 Additional Charges</h3>
          <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0' }}>
            Packaging, service, container, etc. — fixed or %, auto-applied to matching order types (e.g. packaging on delivery).
          </p>
        </div>
        <button onClick={add} type="button"
          style={{ background: '#ef4444', color: '#fff', padding: '7px 13px', borderRadius: 8, fontWeight: 600, fontSize: 12, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
          <FaPlus size={10} /> Add Charge
        </button>
      </div>

      {list.length === 0 && (
        <div style={{ ...box, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
          No additional charges. Click &ldquo;Add Charge&rdquo; to add one (e.g. a delivery packaging fee).
        </div>
      )}

      {list.map((c, i) => {
        const percent = c.type === 'percent';
        return (
          <div key={c.id || i} style={{ ...box, opacity: c.enabled === false ? 0.6 : 1 }}>
            {/* row 1: enable + name + delete */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <input type="checkbox" checked={c.enabled !== false} onChange={(e) => update(i, { enabled: e.target.checked })} title="Enabled" style={{ width: 16, height: 16 }} />
              <input placeholder="Charge name (e.g. Packaging Charge)" value={c.name || ''} onChange={(e) => update(i, { name: e.target.value })} style={{ ...input, flex: 1, fontWeight: 600 }} />
              <button onClick={() => remove(i)} type="button" title="Delete" style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: 8, padding: '7px 9px', cursor: 'pointer' }}>
                <FaTrash size={11} />
              </button>
            </div>

            {/* row 2: type + value + cap */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
              <div style={{ minWidth: 120 }}>
                <label style={label}>Type</label>
                <select value={c.type || 'fixed'} onChange={(e) => update(i, { type: e.target.value })} style={input}>
                  <option value="fixed">Fixed amount</option>
                  <option value="percent">% of subtotal</option>
                </select>
              </div>
              <div style={{ minWidth: 120 }}>
                <label style={label}>{percent ? 'Percentage (%)' : `Amount (${currencySymbol})`}</label>
                <input type="number" min="0" step="any" value={c.value ?? ''} onChange={(e) => update(i, { value: numOrNull(e.target.value) })} style={input} />
              </div>
              {percent && (
                <div style={{ minWidth: 120 }}>
                  <label style={label}>Max cap ({currencySymbol}, optional)</label>
                  <input type="number" min="0" step="any" placeholder="No cap" value={c.maxCap ?? ''} onChange={(e) => update(i, { maxCap: numOrNull(e.target.value) })} style={input} />
                </div>
              )}
              <div style={{ minWidth: 130 }}>
                <label style={label}>Min order ({currencySymbol}, optional)</label>
                <input type="number" min="0" step="any" placeholder="Always" value={c.minOrderValue ?? ''} onChange={(e) => update(i, { minOrderValue: numOrNull(e.target.value) })} style={input} />
              </div>
            </div>

            {/* row 3: applies to */}
            <div style={{ marginBottom: 10 }}>
              <label style={label}>Applies to</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span onClick={() => update(i, { appliesTo: [] })} style={chip(isAll(c))}>All order types</span>
                {ORDER_TYPES.map((t) => (
                  <span key={t.key} onClick={() => toggleType(i, t.key)} style={chip(!isAll(c) && Array.isArray(c.appliesTo) && c.appliesTo.includes(t.key))}>{t.label}</span>
                ))}
              </div>
            </div>

            {/* row 4: taxable + tax rate */}
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
                <input type="checkbox" checked={c.taxable !== false} onChange={(e) => update(i, { taxable: e.target.checked })} style={{ width: 15, height: 15 }} />
                Taxable
              </label>
              {c.taxable !== false && (
                <div>
                  <label style={label}>Tax rate (%, optional — blank = same tax as items)</label>
                  <input type="number" min="0" step="any" placeholder="Item tax" value={c.taxRate ?? ''} onChange={(e) => update(i, { taxRate: numOrNull(e.target.value) })} style={{ ...input, width: 150 }} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

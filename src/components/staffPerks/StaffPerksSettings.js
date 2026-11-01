'use client';

// Admin → Billing → Staff perks. The owner / an admin chooses which menu items a staff member gets
// free each day, how many, whether only after punching in, and the % off the rest of a staff order.
// Others see the rules read-only. Saved through PUT /api/staff-perks/:restaurantId.
import { useEffect, useMemo, useState } from 'react';
import { FaUserTag, FaSearch, FaCheck } from 'react-icons/fa';
import apiClient from '../../lib/api';

const EMPTY = { enabled: false, freeItems: [], freePerDay: 1, requireClockIn: false, discountPercent: 0, discountScope: 'all', discountItems: [], allowOffers: false };
const sizesOf = (it) => (Array.isArray(it?.variants) ? it.variants.filter(v => v && v.name) : []);

function ItemPicker({ menu, selected, onChange, disabled, testId }) {
  const [q, setQ] = useState('');
  const sel = new Set(selected);
  const toggle = (key) => {
    const next = new Set(sel);
    if (next.has(key)) next.delete(key); else next.add(key);
    // A whole item replaces its single sizes (and the other way round).
    const [id, size] = key.split('::');
    if (next.has(key)) {
      if (size) next.delete(id); else [...next].forEach(k => { if (k.startsWith(`${id}::`)) next.delete(k); });
    }
    onChange([...next]);
  };
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return menu.filter(m => !t || (m.name || '').toLowerCase().includes(t) || (m.category || '').toLowerCase().includes(t)).slice(0, 200);
  }, [menu, q]);
  const nameOf = (key) => { const [id, size] = key.split('::'); const m = menu.find(x => x.id === id); return m ? `${m.name}${size ? ` (${size})` : ''}` : key; };

  return (
    <div data-testid={testId}>
      {selected.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {selected.map(k => (
            <span key={k} style={{ background: '#eef2ff', color: '#3730a3', borderRadius: 999, padding: '4px 10px', fontSize: 12, fontWeight: 600, display: 'inline-flex', gap: 6, alignItems: 'center' }}>
              {nameOf(k)}
              {!disabled && <button type="button" onClick={() => toggle(k)} aria-label={`Remove ${nameOf(k)}`} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#6366f1', padding: 0, fontSize: 14, lineHeight: 1 }}>×</button>}
            </span>
          ))}
        </div>
      )}
      {!disabled && (
        <>
          <div style={{ position: 'relative', marginBottom: 6 }}>
            <FaSearch size={12} style={{ position: 'absolute', left: 10, top: 11, color: '#9ca3af' }} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search menu items…"
              style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} />
          </div>
          <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid #f3f4f6', borderRadius: 8 }}>
            {list.length === 0 && <div style={{ padding: 10, fontSize: 12, color: '#9ca3af' }}>No items</div>}
            {list.map(m => (
              <div key={m.id} style={{ padding: '6px 10px', borderBottom: '1px solid #f9fafb' }}>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={sel.has(m.id)} onChange={() => toggle(m.id)} />
                  <span style={{ flex: 1 }}>{m.name}</span>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>{m.category}</span>
                </label>
                {sizesOf(m).length > 0 && !sel.has(m.id) && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '4px 0 2px 24px' }}>
                    {sizesOf(m).map(v => {
                      const k = `${m.id}::${v.name}`;
                      return (
                        <button type="button" key={k} onClick={() => toggle(k)}
                          style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, cursor: 'pointer', border: `1px solid ${sel.has(k) ? '#6366f1' : '#e5e7eb'}`, background: sel.has(k) ? '#eef2ff' : '#fff', color: sel.has(k) ? '#3730a3' : '#6b7280' }}>
                          {sel.has(k) && <FaCheck size={8} style={{ marginRight: 4 }} />}{v.name} only
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function StaffPerksSettings({ restaurantId }) {
  const [s, setS] = useState(EMPTY);
  const [canEdit, setCanEdit] = useState(false);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (!restaurantId) return;
    let live = true;
    setLoading(true);
    Promise.all([
      apiClient.getStaffPerks(restaurantId),
      apiClient.getMenu(restaurantId).catch(() => null),
    ]).then(([p, m]) => {
      if (!live) return;
      setS({ ...EMPTY, ...(p?.settings || {}) });
      setCanEdit(!!p?.canEdit);
      const items = m?.menuItems || m?.items || m?.menu || [];
      setMenu((Array.isArray(items) ? items : []).filter(x => x && x.id && x.name).map(x => ({ id: x.id, name: x.name, category: x.category || '', variants: x.variants || [] })));
    }).catch(e => live && setMsg({ ok: false, text: e.message || 'Could not load staff perks' }))
      .finally(() => live && setLoading(false));
    return () => { live = false; };
  }, [restaurantId]);

  const set = (patch) => { setS(prev => ({ ...prev, ...patch })); setMsg(null); };
  const save = async () => {
    setSaving(true); setMsg(null);
    try {
      const r = await apiClient.saveStaffPerks(restaurantId, s);
      setS({ ...EMPTY, ...(r?.settings || s) });
      setMsg({ ok: true, text: 'Saved' });
    } catch (e) { setMsg({ ok: false, text: e.message || 'Could not save' }); }
    finally { setSaving(false); }
  };

  const box = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 20, marginTop: 20, maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' };
  const label = { fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 };
  const hint = { fontSize: 12, color: '#6b7280', marginTop: 4 };
  const num = { width: 90, padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14 };
  const off = !canEdit;

  return (
    <div style={box} data-testid="staff-perks-settings">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}><FaUserTag color="#6366f1" /> Staff perks</div>
          <div style={hint}>Free items and a discount when staff buy for themselves. At billing, tap <b>Staff</b> and pick the staff member.</div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, cursor: off ? 'default' : 'pointer' }}>
          <input type="checkbox" data-testid="staff-perks-enabled" checked={s.enabled} disabled={off || loading} onChange={e => set({ enabled: e.target.checked })} />
          {s.enabled ? 'On' : 'Off'}
        </label>
      </div>

      {loading ? <div style={{ ...hint, marginTop: 12 }}>Loading…</div> : (
        <div style={{ marginTop: 16, display: 'grid', gap: 18, opacity: s.enabled ? 1 : 0.6 }}>
          <div>
            <span style={label}>Free items</span>
            <ItemPicker menu={menu} selected={s.freeItems} onChange={v => set({ freeItems: v })} disabled={off} testId="staff-perks-free-items" />
            <div style={hint}>e.g. Tea and Coffee. When the order has more than one, the dearest one is free.</div>
          </div>

          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div>
              <span style={label}>Free per staff per day</span>
              <input type="number" min={0} max={20} data-testid="staff-perks-free-per-day" value={s.freePerDay} disabled={off}
                onChange={e => set({ freePerDay: Math.max(0, Math.min(20, parseInt(e.target.value, 10) || 0)) })} style={num} />
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <span style={label}>Only after punching in</span>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
                <input type="checkbox" data-testid="staff-perks-clockin" checked={s.requireClockIn} disabled={off} onChange={e => set({ requireClockIn: e.target.checked })} />
                Free items only on a day the staff member clocked in (Attendance)
              </label>
            </div>
          </div>

          <div>
            <span style={label}>Discount on everything else</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="number" min={0} max={100} step="0.5" data-testid="staff-perks-percent" value={s.discountPercent} disabled={off}
                onChange={e => set({ discountPercent: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)) })} style={num} />
              <span style={{ fontSize: 14, color: '#374151' }}>% off</span>
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 13 }}>
              <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input type="radio" name="staff-perk-scope" checked={s.discountScope === 'all'} disabled={off} onChange={() => set({ discountScope: 'all' })} /> Whole menu
              </label>
              <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input type="radio" name="staff-perk-scope" data-testid="staff-perks-scope-items" checked={s.discountScope === 'items'} disabled={off} onChange={() => set({ discountScope: 'items' })} /> Only these items
              </label>
            </div>
            {s.discountScope === 'items' && (
              <div style={{ marginTop: 8 }}>
                <ItemPicker menu={menu} selected={s.discountItems} onChange={v => set({ discountItems: v })} disabled={off} testId="staff-perks-discount-items" />
              </div>
            )}
            <div style={hint}>0 = no discount. Applies after the free items, e.g. 40% off the second tea.</div>
          </div>

          <div>
            <span style={label}>Customer offers</span>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
              <input type="checkbox" data-testid="staff-perks-allow-offers" checked={s.allowOffers} disabled={off} onChange={e => set({ allowOffers: e.target.checked })} />
              Customer offers also apply on staff orders
            </label>
            <div style={hint}>Off = staff get only the staff perk above; offers and happy-hour deals are not added on their bill.</div>
          </div>

          {off ? (
            <div style={{ ...hint, background: '#f9fafb', padding: 10, borderRadius: 8 }}>Only the owner or an admin can change staff perks.</div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button type="button" onClick={save} disabled={saving} data-testid="staff-perks-save"
                style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 600, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving…' : 'Save staff perks'}
              </button>
              {msg && <span style={{ fontSize: 13, color: msg.ok ? '#059669' : '#dc2626' }}>{msg.text}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

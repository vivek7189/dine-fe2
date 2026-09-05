'use client';

import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaPlus, FaTrash, FaSearch } from 'react-icons/fa';
import apiClient from '../lib/api';

/**
 * BulkModifierGroupModal — apply ONE modifier group to MANY products at once.
 * Self-contained: define (or copy) a group, tick the products, choose merge/replace, apply.
 * Calls POST /api/menus/:id/bulk-modifier-group, which reuses the exact same normalize +
 * flatten logic as a single-item save, so affected items end up identical to a manual edit.
 */
export default function BulkModifierGroupModal({ isOpen, onClose, restaurantId, menuItems = [], onApplied }) {
  const [groupName, setGroupName] = useState('');
  const [required, setRequired] = useState(false);
  const [minSel, setMinSel] = useState('0');
  const [maxSel, setMaxSel] = useState('1');
  const [options, setOptions] = useState([{ name: '', price: '' }]);
  const [mode, setMode] = useState('merge'); // 'merge' | 'replace'
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');

  const activeItems = useMemo(() => (menuItems || []).filter(i => i && i.status !== 'deleted'), [menuItems]);
  const cats = useMemo(() => [...new Set(activeItems.map(i => i.category).filter(Boolean))], [activeItems]);
  const filtered = useMemo(() => activeItems.filter(i =>
    (catFilter === 'all' || i.category === catFilter) &&
    (!search.trim() || (i.name || '').toLowerCase().includes(search.trim().toLowerCase()))
  ), [activeItems, catFilter, search]);

  // Existing groups across the menu, so the owner can copy one instead of retyping.
  const existingGroups = useMemo(() => {
    const map = new Map();
    activeItems.forEach(i => (i.modifierGroups || []).forEach(g => {
      if (g && g.name && !map.has(g.name)) map.set(g.name, g);
    }));
    return [...map.values()];
  }, [activeItems]);

  const pickExisting = (name) => {
    const g = existingGroups.find(x => x.name === name);
    if (!g) return;
    setGroupName(g.name || '');
    setRequired(g.required === true);
    setMinSel(String(g.min ?? 0));
    setMaxSel(String(g.max ?? 1));
    setOptions((g.items || []).map(it => ({ name: it.name || '', price: it.price != null ? String(it.price) : '' })) || [{ name: '', price: '' }]);
  };

  const toggle = (id) => setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selectAllFiltered = () => setSelectedIds(prev => { const n = new Set(prev); filtered.forEach(i => n.add(i.id)); return n; });
  const clearSel = () => setSelectedIds(new Set());

  const addOption = () => setOptions(o => [...o, { name: '', price: '' }]);
  const setOption = (idx, k, v) => setOptions(o => o.map((x, i) => i === idx ? { ...x, [k]: v } : x));
  const removeOption = (idx) => setOptions(o => (o.length > 1 ? o.filter((_, i) => i !== idx) : o));

  const validOptions = options.filter(o => o.name.trim());
  const canApply = groupName.trim() && validOptions.length > 0 && selectedIds.size > 0 && !saving;

  const apply = async () => {
    if (!canApply) return;
    setSaving(true); setError(''); setDone('');
    try {
      const modifierGroup = {
        name: groupName.trim(),
        required,
        min: parseInt(minSel, 10) || 0,
        max: parseInt(maxSel, 10) || 1,
        items: validOptions.map(o => ({ name: o.name.trim(), price: parseFloat(o.price) || 0 })),
      };
      const res = await apiClient.bulkApplyModifierGroup(restaurantId, { itemIds: [...selectedIds], modifierGroup, mode });
      setDone(`Applied "${modifierGroup.name}" to ${res?.applied ?? selectedIds.size} product(s).`);
      if (onApplied) onApplied(res);
      setTimeout(() => onClose && onClose(), 900);
    } catch (e) {
      setError(e?.error || e?.message || 'Failed to apply modifier group');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || typeof document === 'undefined') return null;

  const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.03em' };

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 10050, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '16px', width: '95vw', maxWidth: '860px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#111827' }}>Apply Modifier Group to Products</h2>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6b7280' }}>Define a group once, tick the products, apply to all in one go.</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '6px' }}><FaTimes size={18} /></button>
        </div>

        {/* Body: two columns */}
        <div style={{ display: 'flex', gap: '0', flex: 1, minHeight: 0, flexWrap: 'wrap' }}>
          {/* LEFT — group definition */}
          <div style={{ flex: '1 1 360px', padding: '18px 22px', overflowY: 'auto', borderRight: '1px solid #f1f5f9' }}>
            {existingGroups.length > 0 && (
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Copy an existing group (optional)</label>
                <select defaultValue="" onChange={e => { if (e.target.value) pickExisting(e.target.value); }} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">— start fresh —</option>
                  {existingGroups.map(g => <option key={g.name} value={g.name}>{g.name} ({(g.items || []).length} options)</option>)}
                </select>
              </div>
            )}

            <label style={labelStyle}>Group name</label>
            <input value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="e.g. Choice of Milk" style={{ ...inputStyle, marginBottom: '12px' }} />

            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
                <input type="checkbox" checked={required} onChange={e => setRequired(e.target.checked)} /> Required
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>Min</span>
                <input type="number" min="0" value={minSel} onChange={e => setMinSel(e.target.value)} style={{ ...inputStyle, width: '64px', padding: '7px 8px' }} />
                <span style={{ fontSize: '12px', color: '#6b7280' }}>Max</span>
                <input type="number" min="1" value={maxSel} onChange={e => setMaxSel(e.target.value)} style={{ ...inputStyle, width: '64px', padding: '7px 8px' }} />
              </div>
            </div>

            <label style={labelStyle}>Options</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {options.map((o, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input value={o.name} onChange={e => setOption(idx, 'name', e.target.value)} placeholder="Option name (e.g. Almond)" style={{ ...inputStyle, flex: 1 }} />
                  <input value={o.price} onChange={e => setOption(idx, 'price', e.target.value.replace(/[^\d.]/g, ''))} placeholder="+₹" style={{ ...inputStyle, width: '80px' }} />
                  <button onClick={() => removeOption(idx)} disabled={options.length <= 1} style={{ background: 'none', border: 'none', cursor: options.length <= 1 ? 'not-allowed' : 'pointer', color: options.length <= 1 ? '#d1d5db' : '#ef4444', padding: '6px' }}><FaTrash size={13} /></button>
                </div>
              ))}
            </div>
            <button onClick={addOption} style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}><FaPlus size={11} /> Add option</button>
          </div>

          {/* RIGHT — product checklist */}
          <div style={{ flex: '1 1 360px', padding: '18px 22px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <label style={labelStyle}>Apply to products ({selectedIds.size} selected)</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '140px' }}>
                <FaSearch size={12} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products" style={{ ...inputStyle, paddingLeft: '30px' }} />
              </div>
              <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ ...inputStyle, width: 'auto', cursor: 'pointer' }}>
                <option value="all">All categories</option>
                {cats.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
              <button onClick={selectAllFiltered} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: 0 }}>Select all shown ({filtered.length})</button>
              <button onClick={clearSel} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: 0 }}>Clear</button>
            </div>
            <div style={{ flex: 1, minHeight: '160px', maxHeight: '340px', overflowY: 'auto', border: '1px solid #f1f5f9', borderRadius: '10px' }}>
              {filtered.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>No products match.</div>
              ) : filtered.map(item => {
                const on = selectedIds.has(item.id);
                return (
                  <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderBottom: '1px solid #f8fafc', cursor: 'pointer', background: on ? '#eff6ff' : '#fff' }}>
                    <input type="checkbox" checked={on} onChange={() => toggle(item.id)} />
                    <span style={{ flex: 1, fontSize: '13px', color: '#374151' }}>{item.name}</span>
                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>{item.category || ''}</span>
                    {(item.modifierGroups || []).length > 0 && <span style={{ fontSize: '10px', color: '#7c3aed', background: '#f3e8ff', borderRadius: '999px', padding: '2px 7px' }}>{item.modifierGroups.length} grp</span>}
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #f1f5f9', padding: '14px 22px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: '9px', padding: '3px' }}>
            {[{ id: 'merge', label: 'Merge (keep other groups)' }, { id: 'replace', label: 'Replace all groups' }].map(m => (
              <button key={m.id} onClick={() => setMode(m.id)} style={{ padding: '6px 12px', borderRadius: '7px', border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer', background: mode === m.id ? '#fff' : 'transparent', color: mode === m.id ? '#dc2626' : '#64748b', boxShadow: mode === m.id ? '0 1px 3px rgba(0,0,0,0.12)' : 'none' }}>{m.label}</button>
            ))}
          </div>
          <div style={{ flex: 1, minWidth: '120px', fontSize: '12px' }}>
            {error && <span style={{ color: '#dc2626', fontWeight: 600 }}>{error}</span>}
            {done && <span style={{ color: '#059669', fontWeight: 600 }}>{done}</span>}
          </div>
          <button onClick={onClose} style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={apply} disabled={!canApply} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: canApply ? 'linear-gradient(135deg,#ef4444,#dc2626)' : '#e5e7eb', color: canApply ? '#fff' : '#9ca3af', fontSize: '13px', fontWeight: 700, cursor: canApply ? 'pointer' : 'not-allowed' }}>
            {saving ? 'Applying…' : `Apply to ${selectedIds.size || ''} product${selectedIds.size === 1 ? '' : 's'}`}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

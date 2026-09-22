'use client';
import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaSpinner, FaGlobe } from 'react-icons/fa';
import hotelApi from '../api/hotelApi';
import { inputCls, Btn, Select } from './ui';

const APPLIES = [{ v: 'room', l: 'Rooms' }, { v: 'fnb', l: 'F&B' }, { v: 'all', l: 'All' }];

export default function TaxSettingsPanel({ restaurantId, notify }) {
  const [packs, setPacks] = useState([]);
  const [country, setCountry] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await hotelApi.getTax(restaurantId);
        setPacks(res.packs || []);
        if (res.config) {
          setCountry(res.config.country || '');
          setEnabled(res.config.enabled !== false);
          setRows((res.config.components || []).map((c) => ({ ...c })));
        }
      } catch (e) { notify('error', e.message || 'Failed to load tax settings'); }
      finally { setLoading(false); }
    })();
  }, [restaurantId, notify]);

  const applyPack = (code) => {
    setCountry(code);
    const pack = packs.find((p) => p.code === code);
    if (pack) setRows((pack.components || []).map((c) => ({ ...c })));
  };
  const updateRow = (i, patch) => setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const removeRow = (i) => setRows((rs) => rs.filter((_, idx) => idx !== i));
  const addRow = () => setRows((rs) => [...rs, { name: '', rate: '', appliesTo: 'all' }]);

  const save = async () => {
    setSaving(true);
    try {
      const components = rows
        .map((r) => ({ name: (r.name || '').trim(), rate: Number(r.rate) || 0, appliesTo: r.appliesTo || 'all' }))
        .filter((r) => r.name && r.rate > 0);
      const res = await hotelApi.saveTax(restaurantId, { country: country || null, enabled, components });
      setRows((res.config?.components || []).map((c) => ({ ...c })));
      notify('success', 'Tax settings saved');
    } catch (e) { notify('error', e.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center gap-2 py-8 text-[var(--h-faint)]"><FaSpinner className="animate-spin" /> Loading…</div>;

  return (
    <div className="max-w-2xl">
      <p className="mb-4 text-sm text-[var(--h-muted)]">Pick your country for sensible defaults, then adjust. Taxes apply to the guest folio automatically — rooms, F&amp;B, or everything.</p>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2">
          <FaGlobe className="text-[var(--h-faint)]" size={13} />
          <div className="w-56"><Select value={country} onChange={applyPack} placeholder="Select country pack…"
            options={[{ value: '', label: 'Select country pack…' }, ...packs.map((p) => ({ value: p.code, label: p.label }))]} /></div>
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--h-text)]">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="h-4 w-4 rounded border-[var(--h-border2)]" />
          Tax enabled
        </label>
      </div>

      <div className="rounded-xl border border-[var(--h-border)]">
        <div className="grid grid-cols-[1fr_90px_120px_36px] gap-2 border-b border-[var(--h-bsoft2)] bg-[var(--h-surface2)] px-3 py-2 text-xs font-medium uppercase tracking-wide text-[var(--h-faint)]">
          <span>Tax name</span><span>Rate %</span><span>Applies to</span><span />
        </div>
        <div className="divide-y divide-[var(--h-divider)] p-2">
          {rows.length === 0 && <p className="py-6 text-center text-sm text-[var(--h-faint)]">No tax components. Pick a country or add one.</p>}
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-[1fr_90px_120px_36px] items-center gap-2 py-1.5">
              <input className={inputCls} value={r.name} onChange={(e) => updateRow(i, { name: e.target.value })} placeholder="VAT" />
              <input type="number" min="0" step="0.5" className={inputCls} value={r.rate} onChange={(e) => updateRow(i, { rate: e.target.value })} placeholder="5" />
              <Select value={r.appliesTo} onChange={(v) => updateRow(i, { appliesTo: v })} options={APPLIES.map((a) => ({ value: a.v, label: a.l }))} />
              <button onClick={() => removeRow(i)} className="flex justify-center text-[var(--h-faint3)] hover:text-rose-600" aria-label="Remove"><FaTrash size={12} /></button>
            </div>
          ))}
        </div>
        <div className="border-t border-[var(--h-bsoft2)] px-2 py-2">
          <button onClick={addRow} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-[var(--h-brand)] hover:bg-[var(--h-brand-soft)]"><FaPlus size={11} /> Add tax</button>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Btn onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save tax settings'}</Btn>
      </div>
    </div>
  );
}

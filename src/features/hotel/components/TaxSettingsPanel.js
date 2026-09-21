'use client';
import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaSpinner, FaGlobe } from 'react-icons/fa';
import hotelApi from '../api/hotelApi';
import { inputCls, Btn } from './ui';

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

  if (loading) return <div className="flex items-center gap-2 py-8 text-[#A79C88]"><FaSpinner className="animate-spin" /> Loading…</div>;

  return (
    <div className="max-w-2xl">
      <p className="mb-4 text-sm text-[#8A8172]">Pick your country for sensible defaults, then adjust. Taxes apply to the guest folio automatically — rooms, F&amp;B, or everything.</p>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2">
          <FaGlobe className="text-[#A79C88]" size={13} />
          <select className={`${inputCls} w-56`} value={country} onChange={(e) => applyPack(e.target.value)}>
            <option value="">Select country pack…</option>
            {packs.map((p) => <option key={p.code} value={p.code}>{p.label}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-[#6E6656]">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="h-4 w-4 rounded border-[#DFD7C6]" />
          Tax enabled
        </label>
      </div>

      <div className="rounded-xl border border-[#EBE4D6]">
        <div className="grid grid-cols-[1fr_90px_120px_36px] gap-2 border-b border-[#F1ECE1] bg-[#FAF7F0] px-3 py-2 text-xs font-medium uppercase tracking-wide text-[#A79C88]">
          <span>Tax name</span><span>Rate %</span><span>Applies to</span><span />
        </div>
        <div className="divide-y divide-[#F5F1E8] p-2">
          {rows.length === 0 && <p className="py-6 text-center text-sm text-[#A79C88]">No tax components. Pick a country or add one.</p>}
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-[1fr_90px_120px_36px] items-center gap-2 py-1.5">
              <input className={inputCls} value={r.name} onChange={(e) => updateRow(i, { name: e.target.value })} placeholder="VAT" />
              <input type="number" min="0" step="0.5" className={inputCls} value={r.rate} onChange={(e) => updateRow(i, { rate: e.target.value })} placeholder="5" />
              <select className={inputCls} value={r.appliesTo} onChange={(e) => updateRow(i, { appliesTo: e.target.value })}>
                {APPLIES.map((a) => <option key={a.v} value={a.v}>{a.l}</option>)}
              </select>
              <button onClick={() => removeRow(i)} className="flex justify-center text-[#C3B9A3] hover:text-rose-600" aria-label="Remove"><FaTrash size={12} /></button>
            </div>
          ))}
        </div>
        <div className="border-t border-[#F1ECE1] px-2 py-2">
          <button onClick={addRow} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-[#9A7B45] hover:bg-[#F3EAD7]"><FaPlus size={11} /> Add tax</button>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Btn onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save tax settings'}</Btn>
      </div>
    </div>
  );
}

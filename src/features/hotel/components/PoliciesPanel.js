'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaPen, FaTrash, FaSpinner, FaShieldAlt } from 'react-icons/fa';
import hotelApi from '../api/hotelApi';
import { Modal, Field, inputCls, Btn } from './ui';

const CHARGE_TYPES = [
  { v: 'none', l: 'No charge' },
  { v: 'first_night', l: 'First night' },
  { v: 'percent', l: '% of stay' },
  { v: 'flat', l: 'Flat amount' },
  { v: 'full', l: 'Full stay' },
];
const typeLabel = (t) => CHARGE_TYPES.find((x) => x.v === t)?.l || t;
const needsValue = (t) => t === 'percent' || t === 'flat';
const EMPTY = { name: '', description: '', freeUntilHours: 24, cancelChargeType: 'first_night', cancelChargeValue: 0, noShowChargeType: 'first_night', noShowChargeValue: 0, isDefault: false, active: true };

const canManage = (() => { try { return ['owner', 'admin', 'manager'].includes((JSON.parse(localStorage.getItem('user') || '{}').role || '').toLowerCase()); } catch { return false; } })();

function chargeText(type, value) {
  if (type === 'percent') return `${value || 0}% of stay`;
  if (type === 'flat') return `flat ${value || 0}`;
  return typeLabel(type);
}

export default function PoliciesPanel({ restaurantId, notify }) {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try { const r = await hotelApi.listPolicies(restaurantId, true); setPolicies(r.policies || []); }
    catch (e) { notify('error', e.message || 'Failed to load policies'); }
    finally { setLoading(false); }
  }, [restaurantId, notify]);
  useEffect(() => { load(); }, [load]);

  const openNew = () => { setForm(EMPTY); setEditing({}); };
  const openEdit = (p) => {
    setForm({ name: p.name, description: p.description || '', freeUntilHours: p.freeUntilHours, cancelChargeType: p.cancelChargeType, cancelChargeValue: p.cancelChargeValue, noShowChargeType: p.noShowChargeType, noShowChargeValue: p.noShowChargeValue, isDefault: p.isDefault, active: p.active });
    setEditing(p);
  };
  const save = async () => {
    if (!form.name.trim()) return notify('error', 'Policy name is required');
    setSaving(true);
    try {
      const body = { ...form, freeUntilHours: Number(form.freeUntilHours) || 0, cancelChargeValue: Number(form.cancelChargeValue) || 0, noShowChargeValue: Number(form.noShowChargeValue) || 0 };
      if (editing.id) await hotelApi.updatePolicy(restaurantId, editing.id, body);
      else await hotelApi.createPolicy(restaurantId, body);
      notify('success', `Policy ${editing.id ? 'updated' : 'created'}`); setEditing(null); await load();
    } catch (e) { notify('error', e.message || 'Save failed'); }
    finally { setSaving(false); }
  };
  const remove = async (p) => { if (!window.confirm(`Delete policy "${p.name}"?`)) return; try { await hotelApi.deletePolicy(restaurantId, p.id); notify('success', 'Policy deleted'); await load(); } catch (e) { notify('error', e.message); } };
  const seed = async () => { try { const r = await hotelApi.seedPolicy(restaurantId); notify('success', `Added ${r.seeded || 0} policy`); await load(); } catch (e) { notify('error', e.message); } };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-[#8A8172]">Cancellation &amp; no-show rules. When a booking is cancelled past its free window (or flagged a no-show by the night audit), the fee is posted to the guest folio.</p>
        {canManage && <Btn onClick={openNew}><FaPlus size={12} /> New policy</Btn>}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-[#A79C88]"><FaSpinner className="animate-spin" /> Loading…</div>
      ) : policies.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#EBE4D6] py-12 text-center text-[#A79C88]">
          <FaShieldAlt className="mx-auto mb-2" size={22} />
          <div className="mb-3">No cancellation policy yet — cancellations are free until you add one.</div>
          {canManage && <Btn variant="ghost" onClick={seed}>✨ Add a standard 24h policy</Btn>}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {policies.map((p) => (
            <div key={p.id} className={`group rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(40,33,20,0.05)] ${p.active ? 'border-[#EBE4D6]' : 'border-dashed border-[#E0D8C7] opacity-70'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-[16px] font-semibold text-[#2A241B]">{p.name}</span>
                  {p.isDefault && <span className="rounded-full bg-[#F3EAD7] px-2 py-0.5 text-[10px] font-semibold text-[#876A3A]">Default</span>}
                </div>
                {canManage && (
                  <div className="flex flex-none gap-1 opacity-0 transition group-hover:opacity-100">
                    <button onClick={() => openEdit(p)} className="rounded p-1.5 text-[#A79C88] hover:bg-[#EFE9DD] hover:text-[#9A7B45]"><FaPen size={11} /></button>
                    <button onClick={() => remove(p)} className="rounded p-1.5 text-[#A79C88] hover:bg-rose-50 hover:text-rose-600"><FaTrash size={11} /></button>
                  </div>
                )}
              </div>
              {p.description && <p className="mt-1 text-[12.5px] leading-snug text-[#8A8172]">{p.description}</p>}
              <div className="mt-3 space-y-1 text-[12px] text-[#4A4335]">
                <div className="flex justify-between"><span className="text-[#A79C88]">Free until</span><span>{p.freeUntilHours}h before arrival</span></div>
                <div className="flex justify-between"><span className="text-[#A79C88]">Cancellation fee</span><span className="font-medium">{chargeText(p.cancelChargeType, p.cancelChargeValue)}</span></div>
                <div className="flex justify-between"><span className="text-[#A79C88]">No-show fee</span><span className="font-medium">{chargeText(p.noShowChargeType, p.noShowChargeValue)}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!editing} wide title={editing?.id ? 'Edit policy' : 'New cancellation policy'} onClose={() => setEditing(null)}
        footer={<><Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn><Btn onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save policy'}</Btn></>}>
        <div className="space-y-3.5">
          <Field label="Policy name" required><input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Flexible / Non-refundable" /></Field>
          <Field label="Description"><input className={inputCls} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Shown to staff" /></Field>
          <Field label="Free cancellation until (hours before arrival)" hint="0 = never free">
            <input type="number" min="0" className={inputCls} value={form.freeUntilHours} onChange={(e) => setForm({ ...form, freeUntilHours: e.target.value })} />
          </Field>
          <div className="rounded-xl border border-[#EBE4D6] bg-[#FBF9F4] p-3">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8A8172]">Cancellation fee (after free window)</div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Charge"><select className={inputCls} value={form.cancelChargeType} onChange={(e) => setForm({ ...form, cancelChargeType: e.target.value })}>{CHARGE_TYPES.map((c) => <option key={c.v} value={c.v}>{c.l}</option>)}</select></Field>
              {needsValue(form.cancelChargeType) && <Field label={form.cancelChargeType === 'percent' ? 'Percent' : 'Amount'}><input type="number" min="0" className={inputCls} value={form.cancelChargeValue} onChange={(e) => setForm({ ...form, cancelChargeValue: e.target.value })} /></Field>}
            </div>
          </div>
          <div className="rounded-xl border border-[#EBE4D6] bg-[#FBF9F4] p-3">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8A8172]">No-show fee</div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Charge"><select className={inputCls} value={form.noShowChargeType} onChange={(e) => setForm({ ...form, noShowChargeType: e.target.value })}>{CHARGE_TYPES.map((c) => <option key={c.v} value={c.v}>{c.l}</option>)}</select></Field>
              {needsValue(form.noShowChargeType) && <Field label={form.noShowChargeType === 'percent' ? 'Percent' : 'Amount'}><input type="number" min="0" className={inputCls} value={form.noShowChargeValue} onChange={(e) => setForm({ ...form, noShowChargeValue: e.target.value })} /></Field>}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-[#6E6656]"><input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="h-4 w-4 rounded border-[#DFD7C6]" /> Default policy</label>
            <label className="flex items-center gap-2 text-sm text-[#6E6656]"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="h-4 w-4 rounded border-[#DFD7C6]" /> Active</label>
          </div>
        </div>
      </Modal>
    </div>
  );
}

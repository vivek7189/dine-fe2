'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaPen, FaTrash, FaSpinner, FaTags, FaTicketAlt, FaUtensils, FaBan } from 'react-icons/fa';
import hotelApi from '../api/hotelApi';
import { Modal, Field, inputCls, Btn, Select } from './ui';

// Pricing modes — how a plan's price derives from the base (rate-calendar) rate.
const MODES = [
  { v: 'percent', l: '% of base rate', hint: 'e.g. −12 for a 12% discount, 0 = same as BAR' },
  { v: 'delta', l: '± amount on base', hint: 'e.g. +500 breakfast supplement per night' },
  { v: 'absolute', l: 'Fixed nightly rate', hint: 'Ignores the calendar — this exact price' },
];
const MEALS = [
  { v: 'none', l: 'Room only' },
  { v: 'breakfast', l: 'Breakfast included' },
  { v: 'half-board', l: 'Breakfast + dinner' },
  { v: 'full-board', l: 'All meals' },
];
const EMPTY = {
  name: '', code: '', description: '', pricingMode: 'percent', value: 0, roomTypeIds: [],
  mealPlan: 'none', refundable: true, isPromo: false, promoCode: '', minStay: '', minAdvanceDays: '',
  isDefault: false, active: true,
};

const canManage = (() => {
  try { return ['owner', 'admin', 'manager'].includes((JSON.parse(localStorage.getItem('user') || '{}').role || '').toLowerCase()); }
  catch { return false; }
})();

// Human summary of a plan's pricing.
function priceLabel(p, money) {
  if (p.pricingMode === 'absolute') return `${money(p.value)} / night`;
  if (p.pricingMode === 'delta') return `${p.value >= 0 ? '+' : '−'}${money(Math.abs(p.value))} on base`;
  const v = Number(p.value) || 0;
  return v === 0 ? 'Base rate (BAR)' : `${v > 0 ? '+' : '−'}${Math.abs(v)}% of base`;
}

export default function RatePlansPanel({ restaurantId, formatCurrency, notify }) {
  const [plans, setPlans] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const money = (v) => (formatCurrency ? formatCurrency(v || 0) : Number(v || 0).toLocaleString());

  const load = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const [pr, tr] = await Promise.all([
        hotelApi.listRatePlans(restaurantId, true),
        hotelApi.listRoomTypes(restaurantId).catch(() => ({ roomTypes: [] })),
      ]);
      setPlans(pr.plans || []);
      setTypes(tr.roomTypes || tr.types || []);
    } catch (e) { notify('error', e.message || 'Failed to load rate plans'); }
    finally { setLoading(false); }
  }, [restaurantId, notify]);
  useEffect(() => { load(); }, [load]);

  const openNew = () => { setForm(EMPTY); setEditing({}); };
  const openEdit = (p) => {
    setForm({
      name: p.name, code: p.code || '', description: p.description || '',
      pricingMode: p.pricingMode, value: p.value, roomTypeIds: p.roomTypeIds || [],
      mealPlan: p.mealPlan || 'none', refundable: p.refundable, isPromo: p.isPromo,
      promoCode: p.promoCode || '', minStay: p.minStay ?? '', minAdvanceDays: p.minAdvanceDays ?? '',
      isDefault: p.isDefault, active: p.active,
    });
    setEditing(p);
  };

  const toggleType = (id) => setForm((f) => ({
    ...f, roomTypeIds: f.roomTypeIds.includes(id) ? f.roomTypeIds.filter((x) => x !== id) : [...f.roomTypeIds, id],
  }));

  const save = async () => {
    if (!form.name.trim()) return notify('error', 'Plan name is required');
    if (form.isPromo && !form.promoCode.trim()) return notify('error', 'A promo plan needs a promo code');
    setSaving(true);
    try {
      const body = {
        ...form, value: Number(form.value) || 0,
        minStay: form.minStay === '' ? null : Number(form.minStay),
        minAdvanceDays: form.minAdvanceDays === '' ? null : Number(form.minAdvanceDays),
      };
      if (editing.id) await hotelApi.updateRatePlan(restaurantId, editing.id, body);
      else await hotelApi.createRatePlan(restaurantId, body);
      notify('success', `Rate plan ${editing.id ? 'updated' : 'created'}`); setEditing(null); await load();
    } catch (e) { notify('error', e.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete rate plan "${p.name}"?`)) return;
    try { await hotelApi.deleteRatePlan(restaurantId, p.id); notify('success', 'Rate plan deleted'); await load(); }
    catch (e) { notify('error', e.message); }
  };

  const seed = async () => {
    try { const r = await hotelApi.seedRatePlans(restaurantId); notify('success', `Added ${r.seeded || 0} starter plan(s)`); await load(); }
    catch (e) { notify('error', e.message); }
  };

  const typeName = (id) => (types.find((t) => t.id === id)?.name) || 'type';

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-[var(--h-muted)]">Named pricing strategies layered on the calendar — BAR, breakfast packages, corporate rates, non-refundable deals and promo codes. Guests and staff pick a plan when booking.</p>
        {canManage && <Btn onClick={openNew}><FaPlus size={12} /> New plan</Btn>}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-[var(--h-faint)]"><FaSpinner className="animate-spin" /> Loading…</div>
      ) : plans.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--h-border)] py-12 text-center text-[var(--h-faint)]">
          <FaTags className="mx-auto mb-2" size={22} />
          <div className="mb-3">No rate plans yet.</div>
          {canManage && <Btn variant="ghost" onClick={seed}>✨ Add starter plans (BAR, Breakfast, Advance Purchase)</Btn>}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {plans.map((p) => (
            <div key={p.id} className={`group relative rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(40,33,20,0.05)] ${p.active ? 'border-[var(--h-border)]' : 'border-dashed border-[var(--h-border2)] opacity-70'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-[16px] font-semibold text-[var(--h-ink)]">{p.name}</span>
                    {p.isDefault && <span className="rounded-full bg-[var(--h-brand-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--h-brand-ink)]">BAR</span>}
                    {p.isPromo && <span className="inline-flex items-center gap-1 rounded-full bg-[#EEEAF6] px-2 py-0.5 text-[10px] font-semibold text-[#5A4A85]"><FaTicketAlt size={9} /> {p.promoCode}</span>}
                  </div>
                  {p.code && <div className="mt-0.5 text-[11px] uppercase tracking-[0.08em] text-[var(--h-faint2)]">{p.code}</div>}
                </div>
                {canManage && (
                  <div className="flex flex-none gap-1 opacity-0 transition group-hover:opacity-100">
                    <button onClick={() => openEdit(p)} className="rounded p-1.5 text-[var(--h-faint)] hover:bg-[var(--h-bsoft)] hover:text-[var(--h-brand)]"><FaPen size={11} /></button>
                    <button onClick={() => remove(p)} className="rounded p-1.5 text-[var(--h-faint)] hover:bg-rose-50 hover:text-rose-600"><FaTrash size={11} /></button>
                  </div>
                )}
              </div>

              <div className="mt-2 text-[18px] font-semibold text-[var(--h-brand)]">{priceLabel(p, money)}</div>
              {p.description && <p className="mt-1 text-[12.5px] leading-snug text-[var(--h-muted)]">{p.description}</p>}

              <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                {p.mealPlan && p.mealPlan !== 'none' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#E7F1EA] px-2 py-0.5 font-medium text-[#356B4E]"><FaUtensils size={9} /> {p.mealLabel}</span>
                )}
                {!p.refundable && <span className="inline-flex items-center gap-1 rounded-full bg-[#F5E6E2] px-2 py-0.5 font-medium text-[#8A3F31]"><FaBan size={9} /> Non-refundable</span>}
                {p.minStay ? <span className="rounded-full bg-[var(--h-chip)] px-2 py-0.5 text-[var(--h-text2)]">Min {p.minStay} night(s)</span> : null}
                {p.minAdvanceDays ? <span className="rounded-full bg-[var(--h-chip)] px-2 py-0.5 text-[var(--h-text2)]">Book {p.minAdvanceDays}d ahead</span> : null}
                <span className="rounded-full bg-[var(--h-chip)] px-2 py-0.5 text-[var(--h-text2)]">
                  {p.roomTypeIds?.length ? p.roomTypeIds.map(typeName).join(', ') : 'All room types'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!editing} wide title={editing?.id ? 'Edit rate plan' : 'New rate plan'} onClose={() => setEditing(null)}
        footer={<><Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn><Btn onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save plan'}</Btn></>}>
        <div className="space-y-3.5">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2"><Field label="Plan name" required><input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Corporate — Acme Ltd" /></Field></div>
            <Field label="Short code" hint="BAR, CP, CORP…"><input className={inputCls} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="CORP" /></Field>
          </div>

          <Field label="Description"><input className={inputCls} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Shown to guests on the booking page" /></Field>

          <div className="rounded-xl border border-[var(--h-border)] bg-[var(--h-surface)] p-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Pricing" hint={MODES.find((m) => m.v === form.pricingMode)?.hint}>
                <Select value={form.pricingMode} onChange={(v) => setForm({ ...form, pricingMode: v })} options={MODES.map((m) => ({ value: m.v, label: m.l }))} />
              </Field>
              <Field label={form.pricingMode === 'percent' ? 'Percentage (±)' : form.pricingMode === 'delta' ? 'Amount (±)' : 'Nightly rate'}>
                <input type="number" step="0.01" className={inputCls} value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
              </Field>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Meal plan"><Select value={form.mealPlan} onChange={(v) => setForm({ ...form, mealPlan: v })} options={MEALS.map((m) => ({ value: m.v, label: m.l }))} /></Field>
            <div className="flex items-end gap-4 pb-2">
              <label className="flex items-center gap-2 text-sm text-[var(--h-text)]"><input type="checkbox" checked={form.refundable} onChange={(e) => setForm({ ...form, refundable: e.target.checked })} className="h-4 w-4 rounded border-[var(--h-border2)]" /> Refundable</label>
              <label className="flex items-center gap-2 text-sm text-[var(--h-text)]"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="h-4 w-4 rounded border-[var(--h-border2)]" /> Active</label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Min stay (nights)" hint="optional"><input type="number" min="0" className={inputCls} value={form.minStay} onChange={(e) => setForm({ ...form, minStay: e.target.value })} /></Field>
            <Field label="Advance booking (days)" hint="optional — for advance-purchase"><input type="number" min="0" className={inputCls} value={form.minAdvanceDays} onChange={(e) => setForm({ ...form, minAdvanceDays: e.target.value })} /></Field>
          </div>

          {types.length > 0 && (
            <Field label="Applies to room types" hint="none selected = all room types">
              <div className="flex flex-wrap gap-1.5">
                {types.map((t) => {
                  const on = form.roomTypeIds.includes(t.id);
                  return (
                    <button type="button" key={t.id} onClick={() => toggleType(t.id)}
                      className={`rounded-full border px-2.5 py-1 text-[12px] transition ${on ? 'border-[var(--h-brand)] bg-[var(--h-brand-soft)] text-[var(--h-brand-ink)]' : 'border-[var(--h-border2)] bg-white text-[var(--h-muted)] hover:bg-[var(--h-hover)]'}`}>
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </Field>
          )}

          <div className="rounded-xl border border-[var(--h-border)] p-3">
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--h-ink2)]">
              <input type="checkbox" checked={form.isPromo} onChange={(e) => setForm({ ...form, isPromo: e.target.checked })} className="h-4 w-4 rounded border-[var(--h-border2)]" />
              <FaTicketAlt size={11} className="text-[#5A4A85]" /> Promo code plan
            </label>
            {form.isPromo && (
              <div className="mt-2.5">
                <Field label="Promo code" required hint="Guests enter this on the booking page to unlock the rate">
                  <input className={inputCls} value={form.promoCode} onChange={(e) => setForm({ ...form, promoCode: e.target.value.toUpperCase() })} placeholder="SUMMER25" />
                </Field>
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm text-[var(--h-text)]">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="h-4 w-4 rounded border-[var(--h-border2)]" />
            Make this the default (BAR) — the rate shown before any plan is chosen
          </label>
        </div>
      </Modal>
    </div>
  );
}

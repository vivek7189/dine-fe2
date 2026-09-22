'use client';
import React, { useState, useEffect } from 'react';
import { FaSpinner, FaBed, FaPlus, FaTimes, FaConciergeBell } from 'react-icons/fa';
import hotelApi from '../api/hotelApi';
import { Modal, Field, inputCls, Btn, Select } from './ui';

const SectionLabel = ({ children }) => (
  <div className="mb-2 mt-1 text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--h-brand)]">{children}</div>
);

const nightsBetween = (ci, co) => {
  if (!ci || !co) return 0;
  const d = (new Date(co + 'T00:00:00Z') - new Date(ci + 'T00:00:00Z')) / 86400000;
  return d > 0 ? Math.round(d) : 0;
};

export default function NewBookingModal({ restaurantId, open, onClose, onCreated, formatCurrency, initial }) {
  const [form, setForm] = useState({ guestName: '', guestPhone: '', checkIn: '', checkOut: '', adults: 2, children: 0, roomId: '', rate: '' });
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [availErr, setAvailErr] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  // Rate plans (priced by the selected room's type + stay dates).
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [ratePlanId, setRatePlanId] = useState(null);
  const [mealPlan, setMealPlan] = useState(null);
  const [promo, setPromo] = useState('');
  const [promoInput, setPromoInput] = useState('');
  // Optional add-on services chosen at booking time.
  const [catalog, setCatalog] = useState([]);
  const [chosenSvcs, setChosenSvcs] = useState([]);
  const [svcPick, setSvcPick] = useState({ id: '', qty: 1 });

  const nights = nightsBetween(form.checkIn, form.checkOut);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const selectedRoom = rooms.find((r) => r.id === form.roomId);
  const roomTypeId = selectedRoom?.roomTypeId || null;

  // reset on open (honouring an optional prefill from the calendar)
  useEffect(() => {
    if (open) {
      setForm({
        guestName: '', guestPhone: '', adults: 2, children: 0, rate: '',
        checkIn: initial?.checkIn || '', checkOut: initial?.checkOut || '', roomId: initial?.roomId || '',
      });
      setRooms([]); setError(null); setAvailErr(null);
      setPlans([]); setRatePlanId(null); setMealPlan(null); setPromo(''); setPromoInput('');
      setChosenSvcs([]); setSvcPick({ id: '', qty: 1 });
    }
  }, [open, initial]);

  // Load the services catalog once when the modal opens.
  useEffect(() => {
    if (!open) return;
    hotelApi.listServices(restaurantId).then((r) => setCatalog((r.services || []).filter((s) => s.active !== false))).catch(() => setCatalog([]));
  }, [open, restaurantId]);

  const addService = () => {
    const s = catalog.find((x) => x.id === svcPick.id);
    if (!s) return;
    const qty = Math.max(1, Number(svcPick.qty) || 1);
    setChosenSvcs((list) => [...list, { serviceId: s.id, name: s.name, price: Number(s.price) || 0, qty, taxable: s.taxable !== false, unit: s.unit }]);
    setSvcPick({ id: '', qty: 1 });
  };
  const removeService = (i) => setChosenSvcs((list) => list.filter((_, idx) => idx !== i));
  const servicesTotal = chosenSvcs.reduce((s, x) => s + x.price * x.qty, 0);

  // Fetch priced rate plans whenever a room (→ type) + valid dates are chosen.
  useEffect(() => {
    if (!open || !roomTypeId || nights <= 0) { setPlans([]); return; }
    let cancelled = false;
    setLoadingPlans(true);
    hotelApi.quoteRatePlans(restaurantId, roomTypeId, form.checkIn, form.checkOut, promo || undefined)
      .then((res) => {
        if (cancelled) return;
        const opts = (res.options || []).filter((o) => o.bookable);
        setPlans(opts);
        // default-select BAR (or first) if nothing chosen yet
        setRatePlanId((cur) => {
          if (cur && opts.some((o) => o.ratePlanId === cur)) return cur;
          const def = opts.find((o) => o.isDefault) || opts[0];
          if (def) { setForm((f) => ({ ...f, rate: def.nightly })); setMealPlan(def.mealPlan || null); }
          return def ? def.ratePlanId : null;
        });
      })
      .catch(() => { if (!cancelled) setPlans([]); })
      .finally(() => { if (!cancelled) setLoadingPlans(false); });
    return () => { cancelled = true; };
  }, [open, restaurantId, roomTypeId, form.checkIn, form.checkOut, nights, promo]);

  const pickPlan = (o) => {
    setRatePlanId(o.ratePlanId);
    setMealPlan(o.mealPlan || null);
    set({ rate: o.nightly });
  };
  const applyPromo = () => setPromo(promoInput.trim().toUpperCase());

  // fetch availability whenever a valid date range is set
  useEffect(() => {
    if (!open || !form.checkIn || !form.checkOut || nights <= 0) { setRooms([]); return; }
    let cancelled = false;
    setLoadingRooms(true); setAvailErr(null);
    hotelApi.availability(restaurantId, form.checkIn, form.checkOut)
      .then((res) => {
        if (cancelled) return;
        const rr = res.rooms || [];
        setRooms(rr);
        if (!rr.length) setAvailErr('No rooms free for those dates.');
        // reconcile a prefilled room: drop it if no longer free; seed rate from tariff
        setForm((f) => {
          if (f.roomId && !rr.find((x) => x.id === f.roomId)) return { ...f, roomId: '' };
          const chosen = rr.find((x) => x.id === f.roomId);
          return chosen && (f.rate === '' || f.rate == null) ? { ...f, rate: chosen.tariff ?? '' } : f;
        });
      })
      .catch((e) => { if (!cancelled) { setRooms([]); setAvailErr(e.message || 'Could not load availability'); } })
      .finally(() => { if (!cancelled) setLoadingRooms(false); });
    return () => { cancelled = true; };
  }, [open, restaurantId, form.checkIn, form.checkOut, nights]);

  const pickRoom = (roomId) => {
    const r = rooms.find((x) => x.id === roomId);
    set({ roomId, rate: form.rate || (r?.tariff ?? '') });
  };

  const total = form.rate !== '' && nights > 0 ? Number(form.rate) * nights : null;

  const submit = async () => {
    if (!form.guestName.trim()) return setError('Guest name is required');
    if (nights <= 0) return setError('Enter valid check-in / check-out dates');
    setSaving(true); setError(null);
    try {
      await hotelApi.createReservation(restaurantId, {
        guestName: form.guestName.trim(), guestPhone: form.guestPhone.trim() || null,
        checkIn: form.checkIn, checkOut: form.checkOut,
        adults: Number(form.adults) || 1, children: Number(form.children) || 0,
        roomId: form.roomId || null, rate: form.rate === '' ? null : Number(form.rate),
        ratePlanId: ratePlanId || null, mealPlan: mealPlan || null,
        services: chosenSvcs,
        source: 'walk-in',
      });
      onCreated && onCreated();
      onClose();
    } catch (e) {
      setError(e.message || 'Booking failed');
    } finally {
      setSaving(false);
    }
  };

  const roomTotal = total || 0;
  const grandTotal = roomTotal + servicesTotal;
  const fmt = (v) => (formatCurrency ? formatCurrency(v) : v);

  const roomOptions = [
    { value: '', label: nights <= 0 ? 'Pick dates first' : '— Unassigned —' },
    ...rooms.map((r) => ({
      value: r.id,
      label: `Room ${r.roomNumber}${r.typeName ? ` · ${r.typeName}` : ''}`,
      right: r.tariff > 0 ? `${fmt(r.tariff)}/night` : undefined,
    })),
  ];
  const svcOptions = [
    { value: '', label: 'Add a service…' },
    ...catalog.map((s) => ({ value: s.id, label: s.name, right: `${fmt(s.price)}${s.unit ? `/${s.unit.replace('per-', '')}` : ''}` })),
  ];
  const roomLabel = nights <= 0 ? 'Available rooms' : `Available rooms · ${rooms.length} free · ${nights} night${nights > 1 ? 's' : ''}`;

  return (
    <Modal
      open={open}
      title="New booking"
      subtitle="Create a reservation — assign a room now or later."
      icon={FaBed}
      size="xl"
      onClose={onClose}
      footer={<>
        <div className="mr-auto text-left">
          <div className="text-[11px] text-[var(--h-faint)]">Estimated total</div>
          <div className="text-[17px] font-semibold text-[var(--h-ink)]">{grandTotal > 0 ? fmt(grandTotal) : '—'}</div>
        </div>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn onClick={submit} disabled={saving}>{saving ? 'Booking…' : 'Create booking'}</Btn>
      </>}
    >
      {error && <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}

      <div className="grid gap-x-6 gap-y-1 md:grid-cols-2">
        {/* ── left column ── */}
        <div className="space-y-3">
          <SectionLabel>Guest</SectionLabel>
          <Field label="Guest name" required><input className={inputCls} value={form.guestName} onChange={(e) => set({ guestName: e.target.value })} placeholder="Full name" /></Field>
          <Field label="Phone"><input className={inputCls} value={form.guestPhone} onChange={(e) => set({ guestPhone: e.target.value })} placeholder="Optional" /></Field>

          <SectionLabel>Stay</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Check-in" required><input type="date" className={inputCls} value={form.checkIn} onChange={(e) => set({ checkIn: e.target.value, roomId: '' })} /></Field>
            <Field label="Check-out" required><input type="date" className={inputCls} value={form.checkOut} min={form.checkIn || undefined} onChange={(e) => set({ checkOut: e.target.value, roomId: '' })} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Adults"><input type="number" min="1" className={inputCls} value={form.adults} onChange={(e) => set({ adults: e.target.value })} /></Field>
            <Field label="Children"><input type="number" min="0" className={inputCls} value={form.children} onChange={(e) => set({ children: e.target.value })} /></Field>
          </div>

          <SectionLabel>Room</SectionLabel>
          <Field label={roomLabel} hint="Leave unassigned to book now and assign a room later.">
            {loadingRooms ? (
              <div className="flex items-center gap-2 py-2 text-sm text-[var(--h-faint)]"><FaSpinner className="animate-spin" size={12} /> Checking availability…</div>
            ) : (
              <Select value={form.roomId} onChange={pickRoom} options={roomOptions} disabled={nights <= 0} placeholder={nights <= 0 ? 'Pick dates first' : '— Unassigned —'} />
            )}
            {availErr && <span className="mt-1 block text-[11px] text-amber-600">{availErr}</span>}
          </Field>
        </div>

        {/* ── right column ── */}
        <div className="space-y-3">
          <SectionLabel>Rate &amp; plan</SectionLabel>
          {roomTypeId && nights > 0 && plans.length > 0 ? (
            <div className="space-y-2">
              <div className="space-y-2">
                {plans.map((o) => {
                  const on = o.ratePlanId === ratePlanId;
                  return (
                    <button type="button" key={o.ratePlanId || o.code} onClick={() => pickPlan(o)}
                      className={`flex w-full flex-col rounded-xl border p-2.5 text-left transition ${on ? 'border-[var(--h-brand)] bg-[color-mix(in_srgb,var(--h-brand-soft)_60%,transparent)] ring-1 ring-[color-mix(in_srgb,var(--h-brand)_30%,transparent)]' : 'border-[var(--h-border2)] bg-white hover:bg-[var(--h-hover)]'}`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-semibold text-[var(--h-ink)]">{o.name}</span>
                        <span className="text-[13px] font-semibold text-[var(--h-brand)]">{fmt(o.nightly)}<span className="text-[10px] font-normal text-[var(--h-faint)]">/night</span></span>
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10.5px] text-[var(--h-muted)]">
                        {o.mealPlan && o.mealPlan !== 'none' && <span className="rounded-full bg-[#E7F1EA] px-1.5 py-0.5 text-[#356B4E]">{o.mealLabel}</span>}
                        {!o.refundable && <span className="rounded-full bg-[#F5E6E2] px-1.5 py-0.5 text-[#8A3F31]">Non-refundable</span>}
                        {o.isPromo && <span className="rounded-full bg-[#EEEAF6] px-1.5 py-0.5 text-[#5A4A85]">Promo</span>}
                        <span className="text-[var(--h-faint2)]">· {fmt(o.total)} total</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2">
                <input className={`${inputCls} max-w-[160px]`} value={promoInput} onChange={(e) => setPromoInput(e.target.value.toUpperCase())} placeholder="Promo code" />
                <Btn variant="ghost" onClick={applyPromo} className="!py-1.5">Apply</Btn>
                {promo && <span className="text-[11px] text-[#356B4E]">Applied: {promo}</span>}
              </div>
            </div>
          ) : loadingPlans ? (
            <div className="flex items-center gap-2 py-2 text-sm text-[var(--h-faint)]"><FaSpinner className="animate-spin" size={12} /> Pricing plans…</div>
          ) : (
            <p className="text-[12px] text-[var(--h-faint)]">Pick a room &amp; dates to see rate plans, or set a nightly rate below.</p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Nightly rate"><input type="number" min="0" step="0.01" className={inputCls} value={form.rate} onChange={(e) => { set({ rate: e.target.value }); setRatePlanId(null); }} placeholder="0" /></Field>
            <Field label="Room subtotal">
              <div className={`${inputCls} bg-[var(--h-surface2)] text-[var(--h-ink2)]`}>{total != null ? fmt(total) : '—'}</div>
            </Field>
          </div>

          <SectionLabel>Add-on services · optional</SectionLabel>
          <div className="rounded-xl border border-[var(--h-border)] bg-[var(--h-surface2)] p-3">
            {catalog.length === 0 ? (
              <div className="flex items-center gap-2 text-[12px] text-[var(--h-faint)]"><FaConciergeBell size={11} /> No services yet. Add them under Setup → Services.</div>
            ) : (
              <>
                <div className="flex items-end gap-2">
                  <div className="flex-1"><Select value={svcPick.id} onChange={(v) => setSvcPick({ ...svcPick, id: v })} options={svcOptions} placeholder="Add a service…" /></div>
                  <input type="number" min="1" className={`${inputCls} w-14`} value={svcPick.qty} onChange={(e) => setSvcPick({ ...svcPick, qty: e.target.value })} />
                  <Btn variant="ghost" onClick={addService} disabled={!svcPick.id} className="!py-2"><FaPlus size={11} /> Add</Btn>
                </div>
                {chosenSvcs.length > 0 && (
                  <div className="mt-2.5 space-y-1.5">
                    {chosenSvcs.map((s, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg bg-[var(--h-surface)] px-3 py-1.5 text-[13px]">
                        <span className="text-[var(--h-ink2)]">{s.name} <span className="text-[var(--h-faint)]">× {s.qty}</span></span>
                        <span className="flex items-center gap-2">
                          <span className="font-medium tabular-nums text-[var(--h-ink)]">{fmt(s.price * s.qty)}</span>
                          <button onClick={() => removeService(i)} className="text-[var(--h-faint)] hover:text-rose-600"><FaTimes size={11} /></button>
                        </span>
                      </div>
                    ))}
                    <p className="px-1 pt-0.5 text-[11px] text-[var(--h-faint)]">Services post to the folio at check-in.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

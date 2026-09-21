'use client';
// Public, guest-facing direct-booking page. Self-contained (no dashboard chrome,
// no auth). Reached at /book/hotel/<restaurantId>.
import React, { useState, useEffect, useCallback } from 'react';
import { FaBed, FaSpinner, FaCheckCircle, FaHotel, FaUserFriends, FaArrowLeft } from 'react-icons/fa';
import { publicBookingApi } from './lib/publicBookingApi';

const localToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const addDays = (s, n) => { const d = new Date(s + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const nights = (a, b) => { const d = (new Date(b + 'T00:00:00Z') - new Date(a + 'T00:00:00Z')) / 86400000; return d > 0 ? Math.round(d) : 0; };
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ymd = (v) => (typeof v === 'string' ? v.slice(0, 10) : v ? new Date(v).toISOString().slice(0, 10) : '');
const fmt = (v) => { const s = ymd(v); if (!s) return ''; const [, m, d] = s.split('-'); return `${MONTHS[+m - 1]} ${+d}`; };

export default function PublicBooking({ restaurantId }) {
  const today = localToday();
  const [property, setProperty] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(addDays(today, 1));
  const [guests, setGuests] = useState(2);
  const [types, setTypes] = useState(null); // null = not searched yet
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null); // room type being booked
  const [form, setForm] = useState({ guestName: '', guestPhone: '', guestEmail: '', specialRequests: '' });
  const [booking, setBooking] = useState(false);
  const [confirmed, setConfirmed] = useState(null);
  // Rate plans for the chosen room type.
  const [plans, setPlans] = useState(null);   // null = loading
  const [planId, setPlanId] = useState(null);
  const [promo, setPromo] = useState('');
  const [promoInput, setPromoInput] = useState('');
  const chosenPlan = (plans || []).find((p) => p.ratePlanId === planId) || null;
  const stayTotal = chosenPlan ? chosenPlan.total : (selected ? (selected.rate || 0) * n : 0);

  const cur = property?.currency || '';
  const money = (v) => `${cur}${cur ? ' ' : ''}${Number(v || 0).toLocaleString()}`;
  const n = nights(checkIn, checkOut);

  useEffect(() => {
    publicBookingApi.info(restaurantId).then((r) => setProperty(r.property)).catch(() => setNotFound(true));
  }, [restaurantId]);

  const search = useCallback(async () => {
    if (n <= 0) { setError('Please choose valid dates'); return; }
    setSearching(true); setError(null); setSelected(null);
    try {
      const r = await publicBookingApi.availability(restaurantId, checkIn, checkOut);
      setTypes(r.roomTypes || []);
    } catch (e) { setError(e.message || 'Could not check availability'); }
    finally { setSearching(false); }
  }, [restaurantId, checkIn, checkOut, n]);

  // Load priced rate plans when a room type is picked (and when a promo is applied).
  useEffect(() => {
    if (!selected) { setPlans(null); setPlanId(null); return; }
    let cancelled = false;
    setPlans(null);
    publicBookingApi.ratePlans(restaurantId, selected.roomTypeId, checkIn, checkOut, promo || undefined)
      .then((r) => {
        if (cancelled) return;
        const opts = r.options || [];
        setPlans(opts);
        setPlanId((cur) => (cur && opts.some((o) => o.ratePlanId === cur) ? cur : (opts.find((o) => o.isDefault) || opts[0])?.ratePlanId || null));
      })
      .catch(() => { if (!cancelled) setPlans([]); });
    return () => { cancelled = true; };
  }, [selected, restaurantId, checkIn, checkOut, promo]);

  const submit = async () => {
    if (!form.guestName.trim()) { setError('Please enter your name'); return; }
    if (!form.guestPhone.trim() && !form.guestEmail.trim()) { setError('Please enter a phone or email'); return; }
    setBooking(true); setError(null);
    try {
      const r = await publicBookingApi.book(restaurantId, {
        roomTypeId: selected.roomTypeId, checkIn, checkOut, adults: Math.min(30, Math.max(1, parseInt(guests, 10) || 1)),
        guestName: form.guestName.trim(), guestPhone: form.guestPhone.trim() || null,
        guestEmail: form.guestEmail.trim() || null, specialRequests: form.specialRequests.trim() || null,
        ratePlanId: planId || null, promoCode: promo || null,
      });
      setConfirmed(r.booking);
    } catch (e) { setError(e.message || 'Booking failed'); }
    finally { setBooking(false); }
  };

  if (notFound) {
    return <Shell><div className="py-16 text-center text-slate-500"><FaHotel className="mx-auto mb-3 text-slate-300" size={30} />This booking page isn’t available.</div></Shell>;
  }
  if (!property) {
    return <Shell><div className="flex items-center justify-center gap-2 py-16 text-slate-400"><FaSpinner className="animate-spin" /> Loading…</div></Shell>;
  }

  // confirmation screen
  if (confirmed) {
    return (
      <Shell property={property}>
        <div className="py-6 text-center">
          <FaCheckCircle className="mx-auto mb-3 text-emerald-500" size={42} />
          <h2 className="text-xl font-semibold text-slate-900">Booking confirmed</h2>
          <p className="mt-1 text-sm text-slate-500">A confirmation has been noted. Please keep your reference.</p>
          <div className="mx-auto mt-5 max-w-sm rounded-xl border border-slate-200 bg-slate-50 p-4 text-left text-sm">
            <Row k="Reference" v={<span className="font-mono font-semibold">{confirmed.code}</span>} />
            <Row k="Guest" v={confirmed.guestName} />
            <Row k="Room" v={confirmed.roomType} />
            {confirmed.ratePlan ? <Row k="Rate plan" v={confirmed.ratePlan} /> : null}
            <Row k="Stay" v={`${fmt(confirmed.checkIn)} → ${fmt(confirmed.checkOut)} · ${confirmed.nights} night${confirmed.nights > 1 ? 's' : ''}`} />
            {confirmed.total ? <Row k="Total" v={money(confirmed.total)} /> : null}
          </div>
          <button onClick={() => { setConfirmed(null); setSelected(null); setTypes(null); setPlanId(null); setPromo(''); setPromoInput(''); setForm({ guestName: '', guestPhone: '', guestEmail: '', specialRequests: '' }); }}
            className="mt-5 text-sm font-medium text-indigo-600 hover:underline">Make another booking</button>
        </div>
      </Shell>
    );
  }

  // guest details screen
  if (selected) {
    return (
      <Shell property={property}>
        <button onClick={() => setSelected(null)} className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"><FaArrowLeft size={11} /> Back to rooms</button>
        <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-sm">
          <div className="font-semibold text-indigo-800">{selected.name}</div>
          <div className="text-indigo-600">{fmt(checkIn)} → {fmt(checkOut)} · {n} night{n > 1 ? 's' : ''} · {money(stayTotal)}</div>
        </div>

        {/* Rate plan / package chooser */}
        <div className="mb-4">
          <div className="mb-1.5 text-xs font-medium text-slate-500">Choose a rate</div>
          {plans === null ? (
            <div className="flex items-center gap-2 py-3 text-sm text-slate-400"><FaSpinner className="animate-spin" size={12} /> Loading rates…</div>
          ) : plans.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-500">Standard rate · {money((selected.rate || 0) * n)}</div>
          ) : (
            <div className="space-y-2">
              {plans.map((o) => {
                const on = o.ratePlanId === planId;
                return (
                  <button key={o.ratePlanId || o.code} type="button" onClick={() => setPlanId(o.ratePlanId)}
                    className={`flex w-full items-start justify-between gap-3 rounded-xl border p-3 text-left transition ${on ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-200' : 'border-slate-200 bg-white hover:border-indigo-200'}`}>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`h-3.5 w-3.5 flex-none rounded-full border ${on ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`} />
                        <span className="text-sm font-semibold text-slate-800">{o.name}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1.5 pl-5 text-[11px]">
                        {o.mealPlan && o.mealPlan !== 'none' && <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-emerald-700">{o.mealLabel}</span>}
                        {!o.refundable && <span className="rounded-full bg-rose-50 px-1.5 py-0.5 text-rose-600">Non-refundable</span>}
                        {o.isPromo && <span className="rounded-full bg-violet-50 px-1.5 py-0.5 text-violet-700">Promo applied</span>}
                        {o.description && <span className="text-slate-400">{o.description}</span>}
                      </div>
                    </div>
                    <div className="flex-none text-right">
                      <div className="text-sm font-semibold text-slate-900">{money(o.total)}</div>
                      <div className="text-[10px] text-slate-400">{money(o.nightly)}/night</div>
                    </div>
                  </button>
                );
              })}
              <div className="flex items-center gap-2 pt-1">
                <input value={promoInput} onChange={(e) => setPromoInput(e.target.value.toUpperCase())} placeholder="Promo code"
                  className="w-40 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-500" />
                <button type="button" onClick={() => setPromo(promoInput.trim().toUpperCase())} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Apply</button>
                {promo && <span className="text-[11px] text-emerald-600">Code “{promo}” applied</span>}
              </div>
            </div>
          )}
        </div>

        {error && <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}
        <div className="space-y-3">
          <Input label="Full name" value={form.guestName} onChange={(v) => setForm({ ...form, guestName: v })} placeholder="Your name" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Phone" value={form.guestPhone} onChange={(v) => setForm({ ...form, guestPhone: v })} placeholder="Phone" />
            <Input label="Email" value={form.guestEmail} onChange={(v) => setForm({ ...form, guestEmail: v })} placeholder="Email" />
          </div>
          <Input label="Special requests" value={form.specialRequests} onChange={(v) => setForm({ ...form, specialRequests: v })} placeholder="Optional" />
          <button onClick={submit} disabled={booking}
            className="mt-1 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:bg-indigo-300">
            {booking ? 'Booking…' : `Confirm booking${stayTotal ? ` · ${money(stayTotal)}` : ''}`}
          </button>
        </div>
      </Shell>
    );
  }

  // search + results screen
  return (
    <Shell property={property}>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Field label="Check-in"><input type="date" value={checkIn} min={today} onChange={(e) => setCheckIn(e.target.value)} className={inp} /></Field>
          <Field label="Check-out"><input type="date" value={checkOut} min={addDays(checkIn, 1)} onChange={(e) => setCheckOut(e.target.value)} className={inp} /></Field>
          <Field label="Guests"><input type="number" min="1" value={guests} onChange={(e) => setGuests(e.target.value)} className={inp} /></Field>
          <div className="flex items-end">
            <button onClick={search} disabled={searching} className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:bg-indigo-300">
              {searching ? '…' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      {error && <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}

      {types !== null && (
        <div className="mt-4 space-y-3">
          {types.length === 0 && <p className="py-8 text-center text-slate-400">No room types published yet.</p>}
          {types.map((t) => {
            const soldOut = t.available <= 0;
            return (
              <div key={t.roomTypeId} className={`flex items-center justify-between gap-3 rounded-xl border p-4 ${soldOut ? 'border-slate-100 bg-slate-50 opacity-60' : 'border-slate-200 bg-white'}`}>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <FaBed className="text-indigo-500" size={13} />
                    <span className="font-semibold text-slate-800">{t.name}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><FaUserFriends size={10} /> Up to {t.maxOccupancy}</span>
                    {!soldOut && <span>{t.available} left</span>}
                  </div>
                  {t.description && <p className="mt-1 line-clamp-2 text-xs text-slate-500">{t.description}</p>}
                </div>
                <div className="text-right">
                  {t.rate > 0 && <div className="text-sm font-semibold text-slate-900">{money(t.rate)}<span className="text-[11px] font-normal text-slate-400">/night</span></div>}
                  <button disabled={soldOut} onClick={() => { setSelected(t); setError(null); }}
                    className="mt-1 rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400">
                    {soldOut ? 'Sold out' : 'Book'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Shell>
  );
}

const inp = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100';
function Field({ label, children }) { return <label className="block"><span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>{children}</label>; }
function Input({ label, value, onChange, placeholder }) { return <Field label={label}><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inp} /></Field>; }
function Row({ k, v }) { return <div className="flex justify-between border-b border-slate-100 py-1.5 last:border-0"><span className="text-slate-400">{k}</span><span className="text-slate-700">{v}</span></div>; }

function Shell({ property, children }) {
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white"><FaHotel /></div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">{property?.name || 'Book a room'}</h1>
            <p className="text-xs text-slate-400">Direct booking · best rates</p>
          </div>
        </div>
        {children}
        <p className="mt-6 text-center text-[11px] text-slate-300">Powered by DineOpen</p>
      </div>
    </div>
  );
}

'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FaSpinner, FaSearch, FaTimes, FaStar, FaBed, FaUtensils, FaPhone, FaEnvelope } from 'react-icons/fa';
import hotelApi from '../api/hotelApi';
import { inputCls, Field, Btn } from './ui';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmt = (v) => { if (!v) return '—'; const [, m, d] = String(v).slice(0, 10).split('-'); return `${MONTHS[+m - 1]} ${+d}`; };
const initials = (n) => (n || '?').trim().split(/\s+/).slice(0, 2).map((x) => x[0]).join('').toUpperCase() || '?';

export default function GuestsView({ restaurantId, formatCurrency, notify }) {
  const [guests, setGuests] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const money = (v) => (formatCurrency ? formatCurrency(v || 0) : `₹${Number(v || 0).toLocaleString()}`);

  const load = useCallback(async (term) => {
    setLoading(true);
    try { const r = await hotelApi.listGuests(restaurantId, term || ''); setGuests(r.guests || []); }
    catch (e) { notify('error', e.message || 'Failed to load guests'); }
    finally { setLoading(false); }
  }, [restaurantId, notify]);
  useEffect(() => { load(''); }, [load]);

  const onSearch = (e) => { e.preventDefault(); load(search); };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13.5px] text-[var(--h-muted)]">One guest profile across your hotel &amp; restaurant — stays, dining, ID and preferences.</p>
        <form onSubmit={onSearch} className="flex items-center gap-2">
          <div className="relative">
            <FaSearch size={11} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--h-faint2)]" />
            <input className={`${inputCls} w-64 pl-8`} placeholder="Search name / phone / email" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Btn variant="ghost" type="submit">Search</Btn>
          {search && <button type="button" onClick={() => { setSearch(''); load(''); }} className="text-xs text-[var(--h-muted)] hover:text-[var(--h-ink2)]">Clear</button>}
        </form>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-[var(--h-faint)]"><FaSpinner className="animate-spin" /> Loading…</div>
      ) : guests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--h-brand-tint2)] bg-white py-12 text-center text-[var(--h-faint)]">
          {search ? 'No guests match that search.' : 'No guests yet — they appear here after their first booking.'}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--h-border)] bg-white shadow-[0_1px_2px_rgba(40,33,20,0.05)]">
          <table className="min-w-full divide-y divide-[var(--h-bsoft2)] text-sm">
            <thead className="bg-[var(--h-surface2)] text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--h-faint)]">
              <tr>
                <th className="px-4 py-2.5">Guest</th><th className="px-4 py-2.5">Loyalty</th>
                <th className="px-4 py-2.5">Stays</th><th className="px-4 py-2.5">Last stay</th>
                <th className="px-4 py-2.5 text-right">Lifetime spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--h-divider)]">
              {guests.map((g) => (
                <tr key={g.id} onClick={() => setOpenId(g.id)} className="cursor-pointer hover:bg-[var(--h-surface2)]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[var(--h-brand-tint)] text-[11px] font-semibold text-[var(--h-brand-ink)]">{initials(g.name)}</span>
                      <div>
                        <div className="flex items-center gap-1.5 font-semibold text-[var(--h-ink)]">{g.name || 'Guest'}{g.hotel?.vip && <FaStar size={10} className="text-[#B58836]" />}</div>
                        <div className="text-[11px] text-[var(--h-faint)]">{g.phone || g.email || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="inline-flex items-center rounded-full bg-[var(--h-brand-soft)] px-2 py-0.5 text-[11px] font-medium capitalize text-[var(--h-brand-ink)]">{g.loyaltyTier || 'bronze'}</span></td>
                  <td className="px-4 py-3 tabular-nums text-[var(--h-text)]">{g.stays != null ? `${g.stays} · ${g.totalNights || 0}n` : '—'}</td>
                  <td className="px-4 py-3 text-[var(--h-text)]">{fmt(g.lastStay)}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium text-[var(--h-ink)]">{money(g.totalSpent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {openId && <GuestDrawer restaurantId={restaurantId} guestId={openId} money={money} onClose={() => setOpenId(null)} onSaved={() => load(search)} notify={notify} />}
    </div>
  );
}

function GuestDrawer({ restaurantId, guestId, money, onClose, onSaved, notify }) {
  const [g, setG] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    hotelApi.getGuest(restaurantId, guestId).then((r) => { setG(r.guest); setForm({ name: r.guest.name || '', phone: r.guest.phone || '', email: r.guest.email || '', city: r.guest.city || '', hotel: { ...r.guest.hotel } }); }).catch((e) => notify('error', e.message));
  }, [restaurantId, guestId, notify]);
  const setH = (k, v) => setForm((f) => ({ ...f, hotel: { ...f.hotel, [k]: v } }));
  const save = async () => {
    setSaving(true);
    try { await hotelApi.updateGuest(restaurantId, guestId, form); notify('success', 'Guest updated'); onSaved(); onClose(); }
    catch (e) { notify('error', e.message || 'Save failed'); setSaving(false); }
  };
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div className="fixed inset-0 z-[10050] flex justify-end bg-[color-mix(in_srgb,var(--h-ink)_50%,transparent)]" onClick={onClose}>
      <div className="flex h-full w-full max-w-lg flex-col bg-[var(--h-surface)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[var(--h-bsoft)] px-5 py-3.5">
          <h3 className="font-serif text-[17px] font-semibold text-[var(--h-ink)]">Guest profile</h3>
          <button onClick={onClose} className="text-[var(--h-faint)] hover:text-[var(--h-text)]"><FaTimes /></button>
        </div>
        {!g || !form ? (
          <div className="flex flex-1 items-center gap-2 p-6 text-[var(--h-faint)]"><FaSpinner className="animate-spin" /> Loading…</div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {/* header */}
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--h-brand-tint)] text-sm font-semibold text-[var(--h-brand-ink)]">{initials(g.name)}</span>
              <div>
                <div className="flex items-center gap-2 font-serif text-[18px] font-semibold text-[var(--h-ink)]">{g.name || 'Guest'}{form.hotel.vip && <FaStar size={12} className="text-[#B58836]" />}</div>
                <div className="text-[12px] text-[var(--h-muted)]">{g.loyaltyTier} · {g.loyaltyPoints} pts</div>
              </div>
            </div>
            {/* stats */}
            <div className="mb-4 grid grid-cols-3 gap-2 text-center">
              <Stat icon={FaBed} label="Stays" value={g.staysCount} />
              <Stat icon={FaUtensils} label="Dining orders" value={g.totalOrders} />
              <Stat label="Lifetime" value={money(g.totalSpent)} />
            </div>

            <Section title="Contact">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Name"><input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
                <Field label="Phone"><input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
                <Field label="Email"><input className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
                <Field label="City"><input className={inputCls} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
              </div>
            </Section>

            <Section title="ID & preferences">
              <div className="grid grid-cols-2 gap-3">
                <Field label="ID type"><input className={inputCls} list="idtypes" value={form.hotel.idType} onChange={(e) => setH('idType', e.target.value)} placeholder="Passport / Aadhaar / Driving licence" /><datalist id="idtypes"><option value="Passport" /><option value="Aadhaar" /><option value="Driving licence" /><option value="Voter ID" /></datalist></Field>
                <Field label="ID number"><input className={inputCls} value={form.hotel.idNumber} onChange={(e) => setH('idNumber', e.target.value)} /></Field>
                <Field label="Nationality"><input className={inputCls} value={form.hotel.nationality} onChange={(e) => setH('nationality', e.target.value)} /></Field>
                <Field label="Company (bill-to)"><input className={inputCls} value={form.hotel.company} onChange={(e) => setH('company', e.target.value)} /></Field>
              </div>
              <Field label="Preferences"><input className={inputCls} value={form.hotel.preferences} onChange={(e) => setH('preferences', e.target.value)} placeholder="e.g. non-smoking, high floor, extra pillows" /></Field>
              <Field label="Notes"><input className={inputCls} value={form.hotel.notes} onChange={(e) => setH('notes', e.target.value)} /></Field>
              <label className="mt-1 flex items-center gap-2 text-sm text-[var(--h-ink2)]"><input type="checkbox" checked={!!form.hotel.vip} onChange={(e) => setH('vip', e.target.checked)} className="h-4 w-4 rounded border-[var(--h-border2)]" /> Mark as VIP</label>
            </Section>

            <Section title={`Stay history (${g.stays.length})`}>
              {g.stays.length === 0 ? <p className="text-xs text-[var(--h-faint2)]">No stays yet.</p> : (
                <div className="space-y-1.5">
                  {g.stays.map((s) => (
                    <div key={s.id} className="flex items-center justify-between rounded-lg border border-[var(--h-bsoft2)] bg-white px-3 py-2 text-[13px]">
                      <div><span className="font-medium text-[var(--h-ink)]">{s.roomNumber ? `Room ${s.roomNumber}` : s.code}</span><span className="ml-2 text-[var(--h-muted)]">{fmt(s.checkIn)}→{fmt(s.checkOut)} · {s.nights}n</span></div>
                      <span className="tabular-nums text-[var(--h-text)]">{money(s.total)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </div>
        )}
        {g && form && (
          <div className="border-t border-[var(--h-bsoft)] px-5 py-3">
            <Btn onClick={save} disabled={saving} className="w-full justify-center">{saving ? 'Saving…' : 'Save profile'}</Btn>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-[var(--h-border)] bg-white py-2.5">
      <div className="font-serif text-[18px] font-semibold text-[var(--h-ink)]">{value}</div>
      <div className="mt-0.5 flex items-center justify-center gap-1 text-[10px] uppercase tracking-wide text-[var(--h-faint)]">{Icon && <Icon size={9} />} {label}</div>
    </div>
  );
}
function Section({ title, children }) {
  return (
    <div className="mb-4">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--h-brand)]">{title}</div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { FaChevronLeft, FaChevronRight, FaSpinner, FaLayerGroup } from 'react-icons/fa';
import hotelApi from '../api/hotelApi';
import { Modal, Field, inputCls, Btn, Select } from './ui';

const toYmd = (d) => d.toISOString().slice(0, 10);
const addDays = (s, n) => { const d = new Date(s + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return toYmd(d); };
const localToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS = 14;

export default function RateGrid({ restaurantId, formatCurrency, notify }) {
  const [start, setStart] = useState(localToday());
  const [grid, setGrid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(null);   // { typeId, typeName, date, cell }
  const [bulk, setBulk] = useState(false);
  const today = localToday();
  const to = addDays(start, DAYS);
  const money = (v) => (formatCurrency ? formatCurrency(v || 0) : Number(v || 0).toLocaleString());

  const load = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try { const r = await hotelApi.getRates(restaurantId, start, to); setGrid(r.grid); }
    catch (e) { notify('error', e.message || 'Failed to load rates'); }
    finally { setLoading(false); }
  }, [restaurantId, start, to, notify]);

  useEffect(() => { load(); }, [load]);

  // Normalize to bare YYYY-MM-DD defensively (in case the API ever returns ISO timestamps).
  const days = (grid?.days || []).map((d) => (typeof d === 'string' ? d.slice(0, 10) : d));

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setStart(addDays(start, -7))} className="rounded-lg border border-[var(--h-border2)] p-2 text-[var(--h-text)] hover:bg-[var(--h-hover)]" aria-label="Previous"><FaChevronLeft size={12} /></button>
          <button onClick={() => setStart(today)} className="rounded-lg border border-[var(--h-border2)] px-3 py-1.5 text-sm font-medium text-[var(--h-ink2)] hover:bg-[var(--h-hover)]">Today</button>
          <button onClick={() => setStart(addDays(start, 7))} className="rounded-lg border border-[var(--h-border2)] p-2 text-[var(--h-text)] hover:bg-[var(--h-hover)]" aria-label="Next"><FaChevronRight size={12} /></button>
        </div>
        <Btn variant="ghost" onClick={() => setBulk(true)}><FaLayerGroup size={12} /> Bulk update</Btn>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-[var(--h-faint)]"><FaSpinner className="animate-spin" /> Loading…</div>
      ) : !grid || grid.roomTypes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--h-border)] py-12 text-center text-[var(--h-faint)]">No room types yet — add them in Rooms &amp; Types.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--h-border)]">
          <table className="min-w-[820px] border-collapse text-sm">
            <thead>
              <tr className="bg-[var(--h-surface2)]">
                <th className="sticky left-0 z-10 border-b border-r border-[var(--h-border)] bg-[var(--h-surface2)] px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--h-faint)]">Room type</th>
                {days.map((d) => {
                  const dow = new Date(d + 'T00:00:00Z').getUTCDay();
                  const isToday = d === today;
                  return (
                    <th key={d} className={`border-b border-[var(--h-bsoft2)] px-1 py-1.5 text-center text-[11px] font-medium ${isToday ? 'bg-[var(--h-brand-soft)] text-[var(--h-brand-ink)]' : (dow === 0 || dow === 6) ? 'bg-[color-mix(in_srgb,var(--h-bsoft2)_60%,transparent)] text-[var(--h-faint)]' : 'text-[var(--h-muted)]'}`}>
                      <div>{WD[dow]}</div><div className="tabular-nums">{+d.split('-')[2]}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {grid.roomTypes.map((t) => (
                <tr key={t.id}>
                  <td className="sticky left-0 z-10 border-b border-r border-[var(--h-border)] bg-white px-3 py-2">
                    <div className="font-semibold text-[var(--h-ink)]">{t.name}</div>
                    <div className="text-[11px] text-[var(--h-faint)]">{t.rooms} rooms · {money(t.defaultRate)} base</div>
                  </td>
                  {days.map((d) => {
                    const c = grid.cells[t.id]?.[d] || {};
                    return (
                      <td key={d} className={`border-b border-l border-[var(--h-divider)] p-0 ${c.rateOverride && !c.closed ? 'bg-[var(--h-brand-tint)]' : ''}`}>
                        <button onClick={() => setEdit({ typeId: t.id, typeName: t.name, date: d, cell: c })}
                          className={`flex h-full w-full flex-col items-center gap-0.5 px-1 py-2.5 text-center transition hover:bg-[color-mix(in_srgb,var(--h-brand)_8%,transparent)] ${c.closed ? 'bg-rose-50' : ''}`}>
                          <span className={`text-[12.5px] font-semibold tabular-nums ${c.rateOverride ? 'text-[var(--h-brand-ink)]' : 'text-[var(--h-ink)]'}`}>{c.closed ? '—' : money(c.rate)}</span>
                          <span className={`text-[10px] tabular-nums ${c.closed ? 'text-rose-500' : c.available === 0 ? 'text-amber-500' : 'text-[var(--h-faint)]'}`}>{c.closed ? 'closed' : `${c.available} left`}</span>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--h-faint)]"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-[var(--h-brand-tint)] ring-1 ring-[var(--h-brand)]/30" /> Highlighted = custom rate · click any cell to edit rate, stop-sell, min-stay or allotment. These rates feed the direct booking page (and OTA channels later).</p>

      {edit && <CellEditor restaurantId={restaurantId} edit={edit} money={money}
        onClose={() => setEdit(null)} onSaved={() => { setEdit(null); notify('success', 'Rate updated'); load(); }} notify={notify} />}
      {bulk && <BulkEditor restaurantId={restaurantId} roomTypes={grid?.roomTypes || []} start={start}
        onClose={() => setBulk(false)} onSaved={(n) => { setBulk(false); notify('success', `Updated ${n} day(s)`); load(); }} notify={notify} />}
    </div>
  );
}

function CellEditor({ restaurantId, edit, onClose, onSaved, notify }) {
  const [form, setForm] = useState({
    rate: edit.cell.rateOverride ? edit.cell.rate : '', closed: !!edit.cell.closed,
    minStay: edit.cell.minStay ?? '', availabilityCap: edit.cell.availabilityCap ?? '',
  });
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    try {
      await hotelApi.setRate(restaurantId, {
        roomTypeId: edit.typeId, date: edit.date,
        rate: form.rate === '' ? null : Number(form.rate), closed: form.closed,
        minStay: form.minStay === '' ? null : Number(form.minStay),
        availabilityCap: form.availabilityCap === '' ? null : Number(form.availabilityCap),
      });
      onSaved();
    } catch (e) { notify('error', e.message || 'Save failed'); setSaving(false); }
  };
  return (
    <Modal open title={`${edit.typeName} · ${edit.date}`} onClose={onClose}
      footer={<><Btn variant="ghost" onClick={onClose}>Cancel</Btn><Btn onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Btn></>}>
      <div className="space-y-3">
        <Field label="Rate" hint="Leave blank to use the room-type default"><input type="number" min="0" step="0.01" className={inputCls} value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} placeholder={`${edit.cell.rate}`} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Min stay (nights)"><input type="number" min="1" className={inputCls} value={form.minStay} onChange={(e) => setForm({ ...form, minStay: e.target.value })} placeholder="—" /></Field>
          <Field label="Allotment cap"><input type="number" min="0" className={inputCls} value={form.availabilityCap} onChange={(e) => setForm({ ...form, availabilityCap: e.target.value })} placeholder="all rooms" /></Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-[var(--h-ink2)]">
          <input type="checkbox" checked={form.closed} onChange={(e) => setForm({ ...form, closed: e.target.checked })} className="h-4 w-4 rounded border-[var(--h-border2)]" />
          Stop-sell (closed) for this date
        </label>
      </div>
    </Modal>
  );
}

const WD_FULL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
function BulkEditor({ restaurantId, roomTypes, start, onClose, onSaved, notify }) {
  const [form, setForm] = useState({
    roomTypeId: roomTypes[0]?.id || '', from: start, to: addDays(start, 7),
    rate: '', closed: '', weekdays: [],
  });
  const [saving, setSaving] = useState(false);
  const toggleWd = (i) => setForm((f) => ({ ...f, weekdays: f.weekdays.includes(i) ? f.weekdays.filter((x) => x !== i) : [...f.weekdays, i] }));
  const save = async () => {
    if (!form.roomTypeId) return notify('error', 'Pick a room type');
    if (form.to <= form.from) return notify('error', 'End date must be after start');
    setSaving(true);
    try {
      const patch = { roomTypeId: form.roomTypeId, from: form.from, to: form.to };
      if (form.weekdays.length) patch.weekdays = form.weekdays;
      if (form.rate !== '') patch.rate = Number(form.rate);
      if (form.closed !== '') patch.closed = form.closed === 'closed';
      const r = await hotelApi.bulkRate(restaurantId, patch);
      onSaved(r.updated);
    } catch (e) { notify('error', e.message || 'Bulk update failed'); setSaving(false); }
  };
  return (
    <Modal open title="Bulk update rates" onClose={onClose} wide
      footer={<><Btn variant="ghost" onClick={onClose}>Cancel</Btn><Btn onClick={save} disabled={saving}>{saving ? 'Applying…' : 'Apply'}</Btn></>}>
      <div className="space-y-3">
        <Field label="Room type"><Select value={form.roomTypeId} onChange={(v) => setForm({ ...form, roomTypeId: v })} options={roomTypes.map((t) => ({ value: t.id, label: t.name }))} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="From"><input type="date" className={inputCls} value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} /></Field>
          <Field label="To (exclusive)"><input type="date" className={inputCls} value={form.to} min={form.from} onChange={(e) => setForm({ ...form, to: e.target.value })} /></Field>
        </div>
        <Field label="Days (leave empty = all days)">
          <div className="flex flex-wrap gap-1.5">
            {WD_FULL.map((w, i) => (
              <button key={i} onClick={() => toggleWd(i)} className={`rounded-md border px-2.5 py-1 text-xs font-medium ${form.weekdays.includes(i) ? 'border-[var(--h-brand)] bg-[var(--h-brand)] text-white' : 'border-[var(--h-border2)] text-[var(--h-text)] hover:bg-[var(--h-hover)]'}`}>{w}</button>
            ))}
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Set rate" hint="Blank = leave unchanged"><input type="number" min="0" step="0.01" className={inputCls} value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} placeholder="—" /></Field>
          <Field label="Stop-sell"><Select value={form.closed} onChange={(v) => setForm({ ...form, closed: v })} placeholder="Leave unchanged" options={[{ value: '', label: 'Leave unchanged' }, { value: 'open', label: 'Open' }, { value: 'closed', label: 'Closed' }]} /></Field>
        </div>
      </div>
    </Modal>
  );
}

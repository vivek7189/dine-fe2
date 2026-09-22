'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaPen, FaTrash, FaDoorClosed, FaSpinner, FaChevronDown } from 'react-icons/fa';
import hotelApi, { SELL_STATUS, HK_STATUS } from '../api/hotelApi';
import { Modal, Field, inputCls, Btn } from './ui';

// A status shown as a colored capsule that is itself the dropdown control.
const STATUS_TONE = {
  available: 'text-emerald-700 bg-emerald-50 ring-emerald-600/20', occupied: 'text-rose-700 bg-rose-50 ring-rose-600/20',
  reserved: 'text-amber-700 bg-amber-50 ring-amber-600/20', blocked: 'text-[var(--h-text)] bg-[var(--h-bsoft2)] ring-[color-mix(in_srgb,var(--h-faint)_25%,transparent)]',
  'out-of-service': 'text-[var(--h-muted)] bg-[var(--h-bsoft2)] ring-[color-mix(in_srgb,var(--h-faint)_25%,transparent)]', clean: 'text-emerald-700 bg-emerald-50 ring-emerald-600/20',
  dirty: 'text-amber-700 bg-amber-50 ring-amber-600/20', inspected: 'text-sky-700 bg-sky-50 ring-sky-600/20',
  'out-of-order': 'text-rose-700 bg-rose-50 ring-rose-600/20',
};
function StatusSelect({ value, options, onChange, disabled }) {
  return (
    <span className={`relative inline-flex items-center rounded-full ring-1 ring-inset ${STATUS_TONE[value] || 'bg-[var(--h-bsoft2)] text-[var(--h-text)] ring-[color-mix(in_srgb,var(--h-faint)_25%,transparent)]'}`}>
      <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
        className="appearance-none rounded-full bg-transparent py-1 pl-3 pr-6 text-[11px] font-medium capitalize outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--h-brand)_20%,transparent)]">
        {options.map((s) => <option key={s} value={s} className="capitalize">{s.replace(/-/g, ' ')}</option>)}
      </select>
      <FaChevronDown size={8} className="pointer-events-none absolute right-2 opacity-60" />
    </span>
  );
}

const EMPTY = { roomNumber: '', roomTypeId: '', floor: '', capacity: '', tariff: '', status: 'available' };

export default function RoomsPanel({ restaurantId, formatCurrency, notify, typesRefreshKey }) {
  const [rooms, setRooms] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [newType, setNewType] = useState(null); // inline "add room type" form
  const canManage = (() => { try { return ['owner', 'admin', 'manager'].includes((JSON.parse(localStorage.getItem('user') || '{}').role || '').toLowerCase()); } catch { return false; } })();

  const addTypeInline = async () => {
    if (!newType.name.trim()) return notify('error', 'Type name is required');
    try {
      const res = await hotelApi.createRoomType(restaurantId, { name: newType.name.trim(), defaultRate: newType.rate === '' ? 0 : Number(newType.rate) });
      await loadTypes();
      setForm((f) => ({ ...f, roomTypeId: res.roomType.id, tariff: f.tariff || res.roomType.defaultRate || '' }));
      setNewType(null);
      notify('success', `Room type "${res.roomType.name}" added`);
    } catch (e) { notify('error', e.message || 'Could not add type'); }
  };

  const loadTypes = useCallback(async () => {
    if (!restaurantId) return;
    try { const r = await hotelApi.listRoomTypes(restaurantId); setTypes(r.roomTypes || []); } catch { /* handled by panel */ }
  }, [restaurantId]);

  const load = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const res = await hotelApi.listRooms(restaurantId);
      setRooms(res.rooms || []);
    } catch (e) {
      notify('error', e.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }, [restaurantId, notify]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadTypes(); }, [loadTypes, typesRefreshKey]);

  const openNew = () => { setForm(EMPTY); setEditing({}); };
  const openEdit = (r) => {
    setForm({
      roomNumber: r.roomNumber || '', roomTypeId: r.roomTypeId || '', floor: r.floor ?? '',
      capacity: r.capacity ?? '', tariff: r.tariff ?? '', status: r.status || 'available',
    });
    setEditing(r);
  };

  const save = async () => {
    if (!String(form.roomNumber).trim()) return notify('error', 'Room number is required');
    setSaving(true);
    try {
      const chosen = types.find((t) => t.id === form.roomTypeId);
      const body = {
        roomNumber: String(form.roomNumber).trim(),
        roomTypeId: form.roomTypeId || null,
        type: chosen ? chosen.name : undefined, // keep legacy free-text label in sync
        floor: form.floor === '' ? null : form.floor,
        capacity: form.capacity === '' ? null : Number(form.capacity),
        tariff: form.tariff === '' ? null : Number(form.tariff),
        status: form.status,
      };
      if (editing.id) await hotelApi.updateRoom(restaurantId, editing.id, body);
      else await hotelApi.createRoom(restaurantId, body);
      notify('success', `Room ${editing.id ? 'updated' : 'created'}`);
      setEditing(null);
      await load();
    } catch (e) {
      notify('error', e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const quickStatus = async (r, status) => {
    try { await hotelApi.setRoomStatus(restaurantId, r.id, status); setRooms((xs) => xs.map((x) => x.id === r.id ? { ...x, status } : x)); }
    catch (e) { notify('error', e.message || 'Update failed'); }
  };
  const quickHk = async (r, hk) => {
    try { await hotelApi.setRoomHousekeeping(restaurantId, r.id, hk); setRooms((xs) => xs.map((x) => x.id === r.id ? { ...x, housekeepingStatus: hk } : x)); }
    catch (e) { notify('error', e.message || 'Update failed'); }
  };
  const remove = async (r) => {
    if (!window.confirm(`Delete room ${r.roomNumber}?`)) return;
    try { await hotelApi.deleteRoom(restaurantId, r.id); notify('success', 'Room deleted'); await load(); }
    catch (e) { notify('error', e.message || 'Delete failed'); }
  };

  // group by floor for a scannable layout
  const byFloor = rooms.reduce((acc, r) => {
    const f = r.floor == null || r.floor === '' ? 'Unassigned' : `Floor ${r.floor}`;
    (acc[f] = acc[f] || []).push(r);
    return acc;
  }, {});
  const floorKeys = Object.keys(byFloor).sort((a, b) => (a === 'Unassigned' ? 1 : b === 'Unassigned' ? -1 : a.localeCompare(b, undefined, { numeric: true })));

  const selCls = 'rounded-md border border-[var(--h-border)] bg-white px-1.5 py-0.5 text-xs text-[var(--h-text)] outline-none focus:border-[var(--h-brand-si)]';

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-[var(--h-muted)]">Your physical room inventory. Sell-status and housekeeping are tracked separately.</p>
        <Btn onClick={openNew}><FaPlus size={12} /> New room</Btn>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-[var(--h-faint)]"><FaSpinner className="animate-spin" /> Loading…</div>
      ) : rooms.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--h-border)] py-12 text-center text-[var(--h-faint)]">
          <FaDoorClosed className="mx-auto mb-2" size={22} />
          No rooms yet. Add your first room.
        </div>
      ) : (
        <div className="space-y-5">
          {floorKeys.map((fk) => (
            <div key={fk}>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--h-faint)]">{fk} · {byFloor[fk].length}</div>
              <div className="overflow-x-auto rounded-xl border border-[var(--h-border)]">
                <table className="min-w-full divide-y divide-[var(--h-bsoft2)] text-sm">
                  <thead className="bg-[var(--h-surface2)] text-left text-xs uppercase tracking-wide text-[var(--h-faint)]">
                    <tr>
                      <th className="px-4 py-2 font-medium">Room</th>
                      <th className="px-4 py-2 font-medium">Type</th>
                      <th className="px-4 py-2 font-medium">Rate</th>
                      <th className="px-4 py-2 font-medium">Sell status</th>
                      <th className="px-4 py-2 font-medium">Housekeeping</th>
                      <th className="px-4 py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--h-divider)]">
                    {byFloor[fk].map((r) => (
                      <tr key={r.id} className="hover:bg-[color-mix(in_srgb,var(--h-hover)_60%,transparent)]">
                        <td className="px-4 py-3 text-[15px] font-bold text-[var(--h-ink)] tabular-nums">{r.roomNumber}</td>
                        <td className="px-4 py-3"><span className="inline-flex items-center rounded-md bg-[var(--h-bsoft2)] px-2 py-0.5 text-xs font-medium capitalize text-[var(--h-text)]">{r.typeName || r.type || '—'}</span></td>
                        <td className="px-4 py-3 tabular-nums font-medium text-[var(--h-ink2)]">{r.tariff ? (formatCurrency ? formatCurrency(r.tariff) : r.tariff) : <span className="text-[var(--h-faint3)]">—</span>}</td>
                        <td className="px-4 py-3"><StatusSelect value={r.status} options={SELL_STATUS} onChange={(v) => quickStatus(r, v)} /></td>
                        <td className="px-4 py-3"><StatusSelect value={r.housekeepingStatus || 'clean'} options={HK_STATUS} onChange={(v) => quickHk(r, v)} /></td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1 opacity-0 transition group-hover:opacity-100">
                            <button onClick={() => openEdit(r)} className="rounded p-1.5 text-[var(--h-faint)] hover:bg-[var(--h-bsoft)] hover:text-[var(--h-brand)]" aria-label="Edit"><FaPen size={12} /></button>
                            <button onClick={() => remove(r)} className="rounded p-1.5 text-[var(--h-faint)] hover:bg-rose-50 hover:text-rose-600" aria-label="Delete"><FaTrash size={12} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!editing}
        title={editing?.id ? `Edit room ${form.roomNumber}` : 'New room'}
        onClose={() => setEditing(null)}
        footer={<>
          <Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn>
          <Btn onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Btn>
        </>}
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Room number" required><input className={inputCls} value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} placeholder="101" /></Field>
            <Field label="Floor"><input className={inputCls} value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} placeholder="1" /></Field>
          </div>
          <Field label="Room type">
            <select className={inputCls} value={newType ? '__new__' : form.roomTypeId}
              onChange={(e) => { const v = e.target.value; if (v === '__new__') setNewType({ name: '', rate: '' }); else { setNewType(null); setForm({ ...form, roomTypeId: v }); } }}>
              <option value="">— none —</option>
              {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              {canManage && <option value="__new__">＋ Add a new room type…</option>}
            </select>
            {newType && (
              <div className="mt-2 grid grid-cols-[1fr_90px_auto] gap-2 rounded-lg border border-[var(--h-border2)] bg-[var(--h-surface)] p-2">
                <input className={inputCls} placeholder="Type name (e.g. Deluxe)" value={newType.name} onChange={(e) => setNewType({ ...newType, name: e.target.value })} />
                <input className={inputCls} type="number" min="0" placeholder="Rate" value={newType.rate} onChange={(e) => setNewType({ ...newType, rate: e.target.value })} />
                <button onClick={addTypeInline} style={{ backgroundColor: 'var(--h-brand)' }} className="rounded-lg px-3 text-sm font-semibold text-white hover:brightness-110">Add</button>
              </div>
            )}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Capacity"><input type="number" min="1" className={inputCls} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="2" /></Field>
            <Field label="Tariff" hint="per night"><input type="number" min="0" step="0.01" className={inputCls} value={form.tariff} onChange={(e) => setForm({ ...form, tariff: e.target.value })} /></Field>
          </div>
          <Field label="Sell status">
            <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {SELL_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>
      </Modal>
    </div>
  );
}

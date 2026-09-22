'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaSpinner, FaBroom, FaCheck, FaSearch, FaTools, FaUndo, FaUser } from 'react-icons/fa';
import hotelApi from '../api/hotelApi';
import { Select } from './ui';

// Housekeeping columns in workflow order. Each defines the actions available on a
// room in that state (targets are housekeeping_status values).
const COLUMNS = [
  { key: 'dirty', label: 'Dirty', accent: 'amber', hint: 'Needs cleaning',
    actions: [{ to: 'clean', label: 'Clean', icon: FaCheck }, { to: 'out-of-order', label: 'Out of order', icon: FaTools }] },
  { key: 'clean', label: 'Clean', accent: 'sky', hint: 'Cleaned, awaiting inspection',
    actions: [{ to: 'inspected', label: 'Inspect', icon: FaSearch }, { to: 'dirty', label: 'Dirty', icon: FaUndo }] },
  { key: 'inspected', label: 'Inspected', accent: 'emerald', hint: 'Ready to sell',
    actions: [{ to: 'dirty', label: 'Dirty', icon: FaUndo }] },
  { key: 'out-of-order', label: 'Out of order', accent: 'rose', hint: 'Under maintenance',
    actions: [{ to: 'clean', label: 'Return to service', icon: FaUndo }] },
];

const ACCENT = {
  amber: { bar: 'bg-amber-400', chip: 'bg-amber-50 text-amber-700', dot: 'text-amber-500' },
  sky: { bar: 'bg-sky-400', chip: 'bg-sky-50 text-sky-700', dot: 'text-sky-500' },
  emerald: { bar: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700', dot: 'text-emerald-500' },
  rose: { bar: 'bg-rose-500', chip: 'bg-rose-50 text-rose-700', dot: 'text-rose-500' },
};

export default function HousekeepingBoard({ restaurantId, notify }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [floor, setFloor] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try { const r = await hotelApi.listRooms(restaurantId); setRooms(r.rooms || []); }
    catch (e) { notify('error', e.message || 'Failed to load rooms'); }
    finally { setLoading(false); }
  }, [restaurantId, notify]);

  useEffect(() => { load(); }, [load]);

  const floors = useMemo(() => {
    const s = new Set(rooms.map((r) => (r.floor == null || r.floor === '' ? null : String(r.floor))).filter(Boolean));
    return Array.from(s).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [rooms]);

  const visible = floor ? rooms.filter((r) => String(r.floor) === floor) : rooms;
  const grouped = useMemo(() => {
    const g = { dirty: [], clean: [], inspected: [], 'out-of-order': [] };
    for (const r of visible) (g[r.housekeepingStatus] || g.dirty).push(r);
    return g;
  }, [visible]);

  const setStatus = async (room, to) => {
    setBusyId(room.id);
    // optimistic
    setRooms((xs) => xs.map((x) => (x.id === room.id ? { ...x, housekeepingStatus: to } : x)));
    try { await hotelApi.setRoomHousekeeping(restaurantId, room.id, to); }
    catch (e) { notify('error', e.message || 'Update failed'); load(); }
    finally { setBusyId(null); }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FaBroom className="text-[var(--h-brand)]" />
          <span className="text-sm text-[var(--h-muted)]">Turn rooms around: dirty → clean → inspected → ready to sell.</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-40"><Select value={floor} onChange={setFloor} options={[{ value: '', label: 'All floors' }, ...floors.map((f) => ({ value: String(f), label: `Floor ${f}` }))]} /></div>
          <button onClick={load} className="rounded-lg border border-[var(--h-border2)] px-3 py-1.5 text-sm text-[var(--h-text)] hover:bg-[var(--h-hover)]">Refresh</button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-[var(--h-faint)]"><FaSpinner className="animate-spin" /> Loading…</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((col) => {
            const a = ACCENT[col.accent];
            const list = grouped[col.key] || [];
            return (
              <div key={col.key} className="rounded-xl border border-[var(--h-border)] bg-[var(--h-surface2)]">
                <div className="flex items-center justify-between rounded-t-xl border-b border-[var(--h-bsoft2)] bg-white px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${a.bar}`} />
                    <span className="text-sm font-semibold text-[var(--h-ink)]">{col.label}</span>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${a.chip}`}>{list.length}</span>
                </div>
                <div className="space-y-2 p-2">
                  {list.length === 0 ? (
                    <p className="py-6 text-center text-xs text-[var(--h-faint3)]">Empty</p>
                  ) : list.map((room) => (
                    <div key={room.id} className="rounded-lg border border-[var(--h-border)] bg-white p-2.5 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm font-semibold text-[var(--h-ink)]">Room {room.roomNumber}</div>
                          <div className="text-[11px] text-[var(--h-faint)]">{room.typeName || room.type || ''}{room.floor != null && room.floor !== '' ? ` · Fl ${room.floor}` : ''}</div>
                        </div>
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${room.status === 'occupied' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>{room.status === 'occupied' ? 'Occupied' : 'Vacant'}</span>
                      </div>
                      {room.currentGuest && <div className="mt-1 flex items-center gap-1 text-[11px] text-[var(--h-muted)]"><FaUser size={9} /> {room.currentGuest}</div>}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {col.actions.map((act) => {
                          const Icon = act.icon;
                          return (
                            <button key={act.to} onClick={() => setStatus(room, act.to)} disabled={busyId === room.id}
                              className="inline-flex items-center gap-1 rounded-md border border-[var(--h-border)] px-2 py-1 text-[11px] font-medium text-[var(--h-text)] hover:border-[var(--h-brand-tint2)] hover:bg-[var(--h-brand-soft)] hover:text-[var(--h-brand-ink)] disabled:opacity-50">
                              <Icon size={9} /> {act.label}
                            </button>
                          );
                        })}
                        {busyId === room.id && <FaSpinner className="animate-spin text-[var(--h-faint3)]" size={11} />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FaPlus, FaSpinner, FaLayerGroup, FaTimes, FaTrash, FaUserPlus, FaUndo, FaBuilding, FaPhone } from 'react-icons/fa';
import hotelApi from '../api/hotelApi';
import { Modal, Field, inputCls, Btn } from './ui';

const STATUS = [
  { v: 'tentative', l: 'Tentative', c: 'bg-[#F6EEDD] text-[#8A6721]', d: 'bg-[#B58836]' },
  { v: 'definite', l: 'Definite', c: 'bg-[#E7F1EA] text-[#356B4E]', d: 'bg-[#3E7C5A]' },
  { v: 'closed', l: 'Closed', c: 'bg-[#EFEAE0] text-[#7A6F58]', d: 'bg-[#A79C88]' },
  { v: 'cancelled', l: 'Cancelled', c: 'bg-[#F5E6E2] text-[#8A3F31]', d: 'bg-[#9B4A3A]' },
];
const statusMeta = (s) => STATUS.find((x) => x.v === s) || STATUS[0];
const fmtDate = (v) => { const s = typeof v === 'string' ? v.slice(0, 10) : ''; if (!s) return '—'; const [y, m, d] = s.split('-'); const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; return `${+d} ${M[+m - 1]} ${y.slice(2)}`; };

const canManage = (() => {
  try { return ['owner', 'admin', 'manager'].includes((JSON.parse(localStorage.getItem('user') || '{}').role || '').toLowerCase()); }
  catch { return false; }
})();

const EMPTY = {
  name: '', code: '', contactName: '', contactPhone: '', contactEmail: '', company: '',
  checkIn: '', checkOut: '', cutoffDate: '', status: 'tentative', billTo: 'individual',
  ratePlanId: '', notes: '', allotments: [],
};

function StatusChip({ status }) {
  const m = statusMeta(status);
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${m.c}`}><span className={`h-1.5 w-1.5 rounded-full ${m.d}`} />{m.l}</span>;
}

function Bar({ picked, blocked }) {
  const pct = blocked > 0 ? Math.min(100, Math.round((picked / blocked) * 100)) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px] text-[#8A8172]"><span>Pickup</span><span className="tabular-nums">{picked}/{blocked} rooms</span></div>
      <div className="h-2 overflow-hidden rounded-full bg-[#EDE7DB]"><div className="h-full rounded-full bg-[#9A7B45]" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

export default function GroupsView({ restaurantId, formatCurrency, notify }) {
  const [groups, setGroups] = useState([]);
  const [types, setTypes] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [openId, setOpenId] = useState(null);
  const money = (v) => (formatCurrency ? formatCurrency(v || 0) : Number(v || 0).toLocaleString());

  const load = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const [gr, tr, pr] = await Promise.all([
        hotelApi.listGroups(restaurantId),
        hotelApi.listRoomTypes(restaurantId).catch(() => ({ roomTypes: [] })),
        hotelApi.listRatePlans(restaurantId).catch(() => ({ plans: [] })),
      ]);
      setGroups(gr.groups || []);
      setTypes(tr.roomTypes || tr.types || []);
      setPlans(pr.plans || []);
    } catch (e) { notify('error', e.message || 'Failed to load groups'); }
    finally { setLoading(false); }
  }, [restaurantId, notify]);
  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setForm({ ...EMPTY, allotments: types.map((t) => ({ roomTypeId: t.id, typeName: t.name, roomsBlocked: 0, rate: '' })) });
    setEditing({});
  };
  const openEdit = (g) => {
    setForm({
      name: g.name, code: g.code || '', contactName: g.contactName || '', contactPhone: g.contactPhone || '',
      contactEmail: g.contactEmail || '', company: g.company || '', checkIn: g.checkIn || '', checkOut: g.checkOut || '',
      cutoffDate: g.cutoffDate || '', status: g.status, billTo: g.billTo || 'individual', ratePlanId: g.ratePlanId || '',
      notes: g.notes || '',
      allotments: types.map((t) => {
        const a = (g.allotments || []).find((x) => x.roomTypeId === t.id);
        return { roomTypeId: t.id, typeName: t.name, roomsBlocked: a?.roomsBlocked || 0, rate: a?.rate ?? '' };
      }),
    });
    setEditing(g);
  };
  const setAllot = (typeId, patch) => setForm((f) => ({ ...f, allotments: f.allotments.map((a) => a.roomTypeId === typeId ? { ...a, ...patch } : a) }));

  const save = async () => {
    if (!form.name.trim()) return notify('error', 'Block name is required');
    if (!form.checkIn || !form.checkOut || form.checkOut <= form.checkIn) return notify('error', 'Enter valid block dates');
    setSaving(true);
    try {
      const body = {
        ...form,
        ratePlanId: form.ratePlanId || null, cutoffDate: form.cutoffDate || null,
        allotments: form.allotments.filter((a) => Number(a.roomsBlocked) > 0)
          .map((a) => ({ roomTypeId: a.roomTypeId, roomsBlocked: Number(a.roomsBlocked) || 0, rate: a.rate === '' ? null : Number(a.rate) })),
      };
      if (editing.id) await hotelApi.updateGroup(restaurantId, editing.id, body);
      else await hotelApi.createGroup(restaurantId, body);
      notify('success', `Block ${editing.id ? 'updated' : 'created'}`); setEditing(null); await load();
    } catch (e) { notify('error', e.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-[#8A8172]">A block reserves rooms for an event at a negotiated rate. Blocked rooms are held out of general availability until guests pick them up or the balance is released.</p>
        {canManage && <Btn onClick={openNew} disabled={!types.length}><FaPlus size={12} /> New block</Btn>}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-[#A79C88]"><FaSpinner className="animate-spin" /> Loading…</div>
      ) : groups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#EBE4D6] py-12 text-center text-[#A79C88]">
          <FaLayerGroup className="mx-auto mb-2" size={22} />
          <div>No group blocks yet. Create one for a wedding, corporate stay or tour.</div>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {groups.map((g) => (
            <button key={g.id} onClick={() => setOpenId(g.id)}
              className="rounded-2xl border border-[#EBE4D6] bg-white p-4 text-left shadow-[0_1px_2px_rgba(40,33,20,0.05)] transition hover:border-[#D8CDB6] hover:shadow-md">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-serif text-[17px] font-semibold text-[#2A241B]">{g.name}</div>
                  <div className="mt-0.5 text-[12px] text-[#9A9081]">{fmtDate(g.checkIn)} → {fmtDate(g.checkOut)}{g.company ? ` · ${g.company}` : ''}</div>
                </div>
                <StatusChip status={g.status} />
              </div>
              <div className="mt-3"><Bar picked={g.roomsPicked || 0} blocked={g.roomsBlocked || 0} /></div>
              <div className="mt-2 text-[11px] text-[#B3A88F]">{g.typeCount || 0} room type{g.typeCount === 1 ? '' : 's'} · {g.code}</div>
            </button>
          ))}
        </div>
      )}

      {/* Create / edit modal */}
      <Modal open={!!editing} wide title={editing?.id ? 'Edit block' : 'New group block'} onClose={() => setEditing(null)}
        footer={<><Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn><Btn onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save block'}</Btn></>}>
        <div className="space-y-3.5">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2"><Field label="Block name" required><input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sharma–Verma Wedding" /></Field></div>
            <Field label="Status"><select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{STATUS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}</select></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Contact name"><input className={inputCls} value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} placeholder="Organiser" /></Field>
            <Field label="Company"><input className={inputCls} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Optional" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Contact phone"><input className={inputCls} value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} /></Field>
            <Field label="Contact email"><input className={inputCls} value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} /></Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Block from" required><input type="date" className={inputCls} value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} /></Field>
            <Field label="Block to" required><input type="date" className={inputCls} value={form.checkOut} min={form.checkIn || undefined} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} /></Field>
            <Field label="Cutoff date" hint="release after"><input type="date" className={inputCls} value={form.cutoffDate} onChange={(e) => setForm({ ...form, cutoffDate: e.target.value })} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Negotiated rate plan" hint="optional">
              <select className={inputCls} value={form.ratePlanId} onChange={(e) => setForm({ ...form, ratePlanId: e.target.value })}>
                <option value="">— None —</option>
                {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </Field>
            <Field label="Billing" hint="master = bill-to-company">
              <select className={inputCls} value={form.billTo} onChange={(e) => setForm({ ...form, billTo: e.target.value })}>
                <option value="individual">Each guest pays own</option>
                <option value="master">Master account (bill company)</option>
              </select>
            </Field>
          </div>

          <div className="rounded-xl border border-[#EBE4D6] bg-[#FBF9F4] p-3">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8A8172]">Allotment — rooms per type</div>
            {form.allotments.length === 0 ? (
              <div className="text-[12px] text-[#A79C88]">No room types configured yet.</div>
            ) : (
              <div className="space-y-2">
                {form.allotments.map((a) => (
                  <div key={a.roomTypeId} className="grid grid-cols-12 items-center gap-2">
                    <div className="col-span-6 truncate text-[13px] text-[#4A4335]">{a.typeName}</div>
                    <div className="col-span-3"><input type="number" min="0" className={inputCls} value={a.roomsBlocked} onChange={(e) => setAllot(a.roomTypeId, { roomsBlocked: e.target.value })} placeholder="rooms" /></div>
                    <div className="col-span-3"><input type="number" min="0" step="0.01" className={inputCls} value={a.rate} onChange={(e) => setAllot(a.roomTypeId, { rate: e.target.value })} placeholder="rate/night" /></div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Field label="Notes"><input className={inputCls} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional" /></Field>
        </div>
      </Modal>

      {openId && (
        <GroupDrawer restaurantId={restaurantId} groupId={openId} types={types} money={money} notify={notify}
          canManage={canManage} onClose={() => setOpenId(null)} onEdit={(g) => { setOpenId(null); openEdit(g); }} onChanged={load} />
      )}
    </div>
  );
}

// ── Detail drawer: allotments, rooming list, add-guest, release, delete ──
function GroupDrawer({ restaurantId, groupId, types, money, notify, canManage, onClose, onEdit, onChanged }) {
  const [group, setGroup] = useState(null);
  const [rooming, setRooming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState(false);
  const [guest, setGuest] = useState({ guestName: '', guestPhone: '', roomTypeId: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [g, r] = await Promise.all([hotelApi.getGroup(restaurantId, groupId), hotelApi.groupRoomingList(restaurantId, groupId)]);
      setGroup(g.group); setRooming(r.reservations || []);
    } catch (e) { notify('error', e.message); }
    finally { setLoading(false); }
  }, [restaurantId, groupId, notify]);
  useEffect(() => { load(); }, [load]);

  const addGuest = async () => {
    if (!guest.guestName.trim()) return notify('error', 'Guest name is required');
    const multi = (group?.allotments || []).length > 1;
    if (multi && !guest.roomTypeId) return notify('error', 'Choose a room type');
    setBusy(true);
    try {
      await hotelApi.bookIntoGroup(restaurantId, groupId, {
        guestName: guest.guestName.trim(), guestPhone: guest.guestPhone.trim() || null,
        roomTypeId: guest.roomTypeId || undefined,
      });
      notify('success', 'Guest added to block'); setGuest({ guestName: '', guestPhone: '', roomTypeId: '' }); setAdding(false);
      await load(); onChanged && onChanged();
    } catch (e) { notify('error', e.message || 'Could not add guest'); }
    finally { setBusy(false); }
  };
  const release = async () => {
    if (!window.confirm('Release all unpicked rooms back to general availability?')) return;
    setBusy(true);
    try { await hotelApi.releaseGroup(restaurantId, groupId); notify('success', 'Unpicked rooms released'); await load(); onChanged && onChanged(); }
    catch (e) { notify('error', e.message); } finally { setBusy(false); }
  };
  const del = async () => {
    if (!window.confirm('Delete this block? (only possible with no active pickup)')) return;
    setBusy(true);
    try { await hotelApi.deleteGroup(restaurantId, groupId); notify('success', 'Block deleted'); onClose(); onChanged && onChanged(); }
    catch (e) { notify('error', e.message); setBusy(false); }
  };

  if (typeof document === 'undefined') return null;
  const g = group;
  const typeName = (id) => types.find((t) => t.id === id)?.name || (g?.allotments || []).find((a) => a.roomTypeId === id)?.typeName || 'Room';

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex justify-end bg-[#2A241B]/50 backdrop-blur-[2px]" onClick={onClose}>
      <div className="flex h-full w-full max-w-lg flex-col bg-[#FBF9F4] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between border-b border-[#EFE9DD] px-5 py-4">
          <div className="min-w-0">
            <div className="font-serif text-[18px] font-semibold text-[#2A241B]">{g?.name || 'Block'}</div>
            {g && <div className="mt-0.5 text-[12px] text-[#9A9081]">{fmtDate(g.checkIn)} → {fmtDate(g.checkOut)} · {g.code}</div>}
          </div>
          <div className="flex items-center gap-2">
            {g && <StatusChip status={g.status} />}
            <button onClick={onClose} className="text-[#A79C88] hover:text-[#6E6656]"><FaTimes /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading || !g ? (
            <div className="flex items-center gap-2 py-10 text-[#A79C88]"><FaSpinner className="animate-spin" /> Loading…</div>
          ) : (
            <div className="space-y-5">
              {(g.contactName || g.company || g.contactPhone) && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-[#6E6656]">
                  {g.contactName && <span>{g.contactName}</span>}
                  {g.company && <span className="inline-flex items-center gap-1"><FaBuilding size={10} className="text-[#A79C88]" /> {g.company}</span>}
                  {g.contactPhone && <span className="inline-flex items-center gap-1"><FaPhone size={10} className="text-[#A79C88]" /> {g.contactPhone}</span>}
                  {g.billTo === 'master' && <span className="rounded-full bg-[#EEEAF6] px-2 py-0.5 text-[11px] text-[#5A4A85]">Bill to company</span>}
                </div>
              )}

              {/* Allotments */}
              <div>
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8A8172]">Allotment</div>
                <div className="overflow-hidden rounded-xl border border-[#EBE4D6]">
                  <table className="min-w-full text-sm">
                    <thead className="bg-[#F3EFE6] text-[11px] uppercase tracking-wide text-[#8A8172]">
                      <tr><th className="px-3 py-2 text-left font-medium">Room type</th><th className="px-3 py-2 text-right font-medium">Blocked</th><th className="px-3 py-2 text-right font-medium">Picked</th><th className="px-3 py-2 text-right font-medium">Left</th><th className="px-3 py-2 text-right font-medium">Rate</th></tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5F1E8]">
                      {g.allotments.map((a) => (
                        <tr key={a.roomTypeId}>
                          <td className="px-3 py-2 text-[#2A241B]">{a.typeName}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{a.roomsBlocked}</td>
                          <td className="px-3 py-2 text-right tabular-nums text-[#356B4E]">{a.picked}</td>
                          <td className="px-3 py-2 text-right tabular-nums text-[#9A7B45]">{a.remaining}</td>
                          <td className="px-3 py-2 text-right tabular-nums text-[#6E6656]">{a.rate != null ? money(a.rate) : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Rooming list */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8A8172]">Rooming list ({rooming.length})</div>
                  {['cancelled', 'closed'].includes(g.status) ? null : (
                    <button onClick={() => setAdding((v) => !v)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#DDD4C2] bg-white px-2.5 py-1 text-[12px] font-medium text-[#4A4335] hover:bg-[#F3EFE6]"><FaUserPlus size={11} /> Add guest</button>
                  )}
                </div>
                {adding && (
                  <div className="mb-2 rounded-xl border border-[#EBE4D6] bg-white p-3">
                    <div className="grid grid-cols-2 gap-2">
                      <input className={inputCls} value={guest.guestName} onChange={(e) => setGuest({ ...guest, guestName: e.target.value })} placeholder="Guest name" />
                      <input className={inputCls} value={guest.guestPhone} onChange={(e) => setGuest({ ...guest, guestPhone: e.target.value })} placeholder="Phone (optional)" />
                    </div>
                    {g.allotments.length > 1 && (
                      <select className={`${inputCls} mt-2`} value={guest.roomTypeId} onChange={(e) => setGuest({ ...guest, roomTypeId: e.target.value })}>
                        <option value="">Choose room type…</option>
                        {g.allotments.map((a) => <option key={a.roomTypeId} value={a.roomTypeId} disabled={a.remaining <= 0}>{a.typeName} ({a.remaining} left)</option>)}
                      </select>
                    )}
                    <div className="mt-2 flex justify-end gap-2">
                      <Btn variant="ghost" onClick={() => setAdding(false)}>Cancel</Btn>
                      <Btn onClick={addGuest} disabled={busy}>{busy ? 'Adding…' : 'Add to block'}</Btn>
                    </div>
                  </div>
                )}
                {rooming.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#EBE4D6] py-6 text-center text-[12px] text-[#A79C88]">No pickups yet.</div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-[#EBE4D6]">
                    <table className="min-w-full text-sm">
                      <tbody className="divide-y divide-[#F5F1E8]">
                        {rooming.map((r) => (
                          <tr key={r.id} className="hover:bg-[#F3EFE6]/60">
                            <td className="px-3 py-2">
                              <div className="font-medium text-[#2A241B]">{r.guestName}</div>
                              <div className="text-[11px] text-[#A79C88]">{r.code}{r.roomNumber ? ` · Room ${r.roomNumber}` : ` · ${typeName(r.roomTypeId)} · unassigned`}</div>
                            </td>
                            <td className="px-3 py-2 text-right text-[12px] text-[#6E6656] tabular-nums">{fmtDate(r.checkIn)}→{fmtDate(r.checkOut)}</td>
                            <td className="px-3 py-2 text-right"><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${r.status === 'checked_in' ? 'bg-[#EAF0F5] text-[#3F5C79]' : r.status === 'cancelled' ? 'bg-[#F5E6E2] text-[#8A3F31]' : 'bg-[#E7F1EA] text-[#356B4E]'}`}>{String(r.status).replace('_', ' ')}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {g && canManage && (
          <div className="flex items-center justify-between gap-2 border-t border-[#EFE9DD] px-5 py-3">
            <button onClick={del} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[#9B4A3A] hover:bg-rose-50 disabled:opacity-50"><FaTrash size={11} /> Delete</button>
            <div className="flex gap-2">
              <Btn variant="ghost" onClick={release} disabled={busy}><FaUndo size={11} /> Release unpicked</Btn>
              <Btn variant="ghost" onClick={() => onEdit(g)}>Edit block</Btn>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaSpinner, FaPlus, FaPen, FaTrash, FaUserTie, FaBroom, FaUtensils, FaTools, FaShieldAlt, FaConciergeBell, FaPhone, FaUsers } from 'react-icons/fa';
import hotelApi from '../api/hotelApi';
import { Modal, Field, inputCls, Btn, StatCard } from './ui';

const DEPTS = {
  'front-desk': { label: 'Front Desk', icon: FaConciergeBell, color: 'indigo' },
  housekeeping: { label: 'Housekeeping', icon: FaBroom, color: 'sky' },
  'food-beverage': { label: 'Food & Beverage', icon: FaUtensils, color: 'amber' },
  maintenance: { label: 'Maintenance', icon: FaTools, color: 'slate' },
  security: { label: 'Security', icon: FaShieldAlt, color: 'rose' },
  management: { label: 'Management', icon: FaUserTie, color: 'emerald' },
};
const DEPT_ORDER = ['front-desk', 'housekeeping', 'food-beverage', 'maintenance', 'security', 'management'];
const AVATAR = { indigo: 'bg-[#F3EAD7] text-[#876A3A]', sky: 'bg-sky-100 text-sky-700', amber: 'bg-amber-100 text-amber-700', slate: 'bg-[#E4DCC9] text-[#6E6656]', rose: 'bg-rose-100 text-rose-700', emerald: 'bg-emerald-100 text-emerald-700' };
const initials = (n) => (n || '').trim().split(/\s+/).slice(0, 2).map((x) => x[0]).join('').toUpperCase() || '?';
const EMPTY = { name: '', role: '', department: 'front-desk', shift: '', phone: '', email: '' };

export default function StaffView({ restaurantId, notify }) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try { const r = await hotelApi.listStaff(restaurantId); setStaff(r.staff || []); }
    catch (e) { notify('error', e.message || 'Failed to load staff'); }
    finally { setLoading(false); }
  }, [restaurantId, notify]);

  useEffect(() => { load(); }, [load]);

  const byDept = useMemo(() => {
    const g = {}; for (const s of staff) (g[s.department] = g[s.department] || []).push(s); return g;
  }, [staff]);

  const openNew = () => { setForm(EMPTY); setEditing({}); };
  const openEdit = (s) => { setForm({ name: s.name || '', role: s.role || '', department: s.department, shift: s.shift || '', phone: s.phone || '', email: s.email || '' }); setEditing(s); };

  const save = async () => {
    if (!form.name.trim()) return notify('error', 'Name is required');
    setSaving(true);
    try {
      if (editing.id) await hotelApi.updateStaff(restaurantId, editing.id, form);
      else await hotelApi.createStaff(restaurantId, form);
      notify('success', `Staff ${editing.id ? 'updated' : 'added'}`);
      setEditing(null); await load();
    } catch (e) { notify('error', e.message || 'Save failed'); }
    finally { setSaving(false); }
  };
  const remove = async (s) => {
    if (!window.confirm(`Remove ${s.name}?`)) return;
    try { await hotelApi.deleteStaff(restaurantId, s.id); notify('success', 'Staff removed'); await load(); }
    catch (e) { notify('error', e.message || 'Remove failed'); }
  };

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <StatCard icon={FaUsers} tone="indigo" label="Total staff" value={staff.length} />
        <StatCard icon={FaConciergeBell} tone="indigo" label="Front desk" value={(byDept['front-desk'] || []).length} />
        <StatCard icon={FaBroom} tone="sky" label="Housekeeping" value={(byDept.housekeeping || []).length} />
        <StatCard icon={FaUtensils} tone="amber" label="F&B" value={(byDept['food-beverage'] || []).length} />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-[#8A8172]">Your team, organised by the area they cover.</p>
        <Btn onClick={openNew}><FaPlus size={12} /> Add staff</Btn>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-[#A79C88]"><FaSpinner className="animate-spin" /> Loading…</div>
      ) : staff.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#EBE4D6] py-12 text-center text-[#A79C88]">
          <FaUserTie className="mx-auto mb-2" size={22} /> No staff yet. Add your team and assign each to an area.
        </div>
      ) : (
        <div className="space-y-5">
          {[...DEPT_ORDER, ...Object.keys(byDept).filter((d) => !DEPT_ORDER.includes(d))].filter((d) => (byDept[d] || []).length).map((d) => {
            const meta = DEPTS[d] || { label: d, icon: FaUserTie, color: 'slate' }; const Icon = meta.icon;
            return (
              <div key={d}>
                <div className="mb-2 flex items-center gap-2">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-md ${AVATAR[meta.color]}`}><Icon size={11} /></span>
                  <h3 className="text-sm font-semibold text-[#4A4335]">{meta.label}</h3>
                  <span className="rounded-full bg-[#F1ECE1] px-2 py-0.5 text-[11px] text-[#8A8172]">{byDept[d].length}</span>
                </div>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {byDept[d].map((s) => (
                    <div key={s.id} className="group flex items-center gap-3 rounded-xl border border-[#EBE4D6] bg-white p-3 shadow-sm">
                      <span className={`flex h-10 w-10 flex-none items-center justify-center rounded-full text-sm font-semibold ${AVATAR[meta.color]}`}>{initials(s.name)}</span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-[#2A241B]">{s.name}</div>
                        <div className="truncate text-xs text-[#A79C88]">{s.role || meta.label}{s.shift ? ` · ${s.shift}` : ''}</div>
                        {s.phone && <div className="mt-0.5 flex items-center gap-1 text-[11px] text-[#A79C88]"><FaPhone size={8} /> {s.phone}</div>}
                      </div>
                      <div className="flex flex-col gap-1 opacity-0 transition group-hover:opacity-100">
                        <button onClick={() => openEdit(s)} className="rounded p-1 text-[#A79C88] hover:bg-[#F3EFE6] hover:text-[#9A7B45]" aria-label="Edit"><FaPen size={11} /></button>
                        <button onClick={() => remove(s)} className="rounded p-1 text-[#A79C88] hover:bg-rose-50 hover:text-rose-600" aria-label="Remove"><FaTrash size={11} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!editing} title={editing?.id ? 'Edit staff' : 'Add staff'} onClose={() => setEditing(null)}
        footer={<><Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn><Btn onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Btn></>}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name" required><input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" /></Field>
            <Field label="Role"><input className={inputCls} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="e.g. Receptionist" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Area / department" hint="Pick one or type your own">
              <input className={inputCls} list="staff-depts" value={DEPTS[form.department]?.label || form.department}
                onChange={(e) => { const v = e.target.value; const match = DEPT_ORDER.find((d) => DEPTS[d].label.toLowerCase() === v.toLowerCase()); setForm({ ...form, department: match || v }); }} />
              <datalist id="staff-depts">{DEPT_ORDER.map((d) => <option key={d} value={DEPTS[d].label} />)}</datalist>
            </Field>
            <Field label="Shift"><input className={inputCls} value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value })} placeholder="Morning / Evening / Night" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone"><input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <Field label="Email"><input className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          </div>
        </div>
      </Modal>
    </div>
  );
}

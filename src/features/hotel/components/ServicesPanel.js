'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaPlus, FaPen, FaTrash, FaSpinner, FaConciergeBell } from 'react-icons/fa';
import hotelApi from '../api/hotelApi';
import { Modal, Field, inputCls, Btn } from './ui';

const UNITS = [{ v: 'per-item', l: 'per item' }, { v: 'per-night', l: 'per night' }, { v: 'per-person', l: 'per person' }];
const CATEGORIES = ['Transport', 'Laundry', 'Spa & Wellness', 'Food & Beverage', 'Business', 'Other'];
const EMPTY = { name: '', category: 'Transport', price: '', unit: 'per-item', taxable: true, active: true };

export default function ServicesPanel({ restaurantId, formatCurrency, notify }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const money = (v) => (formatCurrency ? formatCurrency(v || 0) : Number(v || 0).toLocaleString());

  const load = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try { const r = await hotelApi.listServices(restaurantId); setServices(r.services || []); }
    catch (e) { notify('error', e.message || 'Failed to load services'); }
    finally { setLoading(false); }
  }, [restaurantId, notify]);
  useEffect(() => { load(); }, [load]);

  const byCat = useMemo(() => { const g = {}; for (const s of services) (g[s.category || 'Other'] = g[s.category || 'Other'] || []).push(s); return g; }, [services]);

  const openNew = () => { setForm(EMPTY); setEditing({}); };
  const openEdit = (s) => { setForm({ name: s.name, category: s.category || 'Other', price: s.price, unit: s.unit, taxable: s.taxable, active: s.active }); setEditing(s); };
  const save = async () => {
    if (!form.name.trim()) return notify('error', 'Name is required');
    setSaving(true);
    try {
      const body = { ...form, price: Number(form.price) || 0 };
      if (editing.id) await hotelApi.updateService(restaurantId, editing.id, body);
      else await hotelApi.createService(restaurantId, body);
      notify('success', `Service ${editing.id ? 'updated' : 'added'}`); setEditing(null); await load();
    } catch (e) { notify('error', e.message || 'Save failed'); }
    finally { setSaving(false); }
  };
  const remove = async (s) => { if (!window.confirm(`Delete "${s.name}"?`)) return; try { await hotelApi.deleteService(restaurantId, s.id); notify('success', 'Service deleted'); await load(); } catch (e) { notify('error', e.message); } };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-[var(--h-muted)]">Add-on services staff can charge to a guest (cab, laundry, spa…). Set them up here; staff pick them on the folio.</p>
        <Btn onClick={openNew}><FaPlus size={12} /> Add service</Btn>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-[var(--h-faint)]"><FaSpinner className="animate-spin" /> Loading…</div>
      ) : services.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--h-border)] py-12 text-center text-[var(--h-faint)]">
          <FaConciergeBell className="mx-auto mb-2" size={22} /> No services yet. Add cab, laundry, airport pickup, spa…
        </div>
      ) : (
        <div className="space-y-5">
          {Object.keys(byCat).map((cat) => (
            <div key={cat}>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--h-brand)]">{cat}</div>
              <div className="overflow-hidden rounded-xl border border-[var(--h-border)]">
                <table className="min-w-full divide-y divide-[var(--h-bsoft2)] text-sm">
                  <tbody className="divide-y divide-[var(--h-divider)]">
                    {byCat[cat].map((s) => (
                      <tr key={s.id} className="group hover:bg-[color-mix(in_srgb,var(--h-hover)_60%,transparent)]">
                        <td className="px-4 py-2.5">
                          <div className="font-medium text-[var(--h-ink)]">{s.name}{!s.active && <span className="ml-2 rounded bg-[var(--h-bsoft2)] px-1.5 py-0.5 text-[10px] text-[var(--h-faint)]">inactive</span>}</div>
                          <div className="text-[11px] text-[var(--h-faint)]">{s.unit.replace('-', ' ')}{s.taxable ? ' · taxable' : ''}</div>
                        </td>
                        <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-[var(--h-ink)]">{money(s.price)}</td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="flex justify-end gap-1 opacity-0 transition group-hover:opacity-100">
                            <button onClick={() => openEdit(s)} className="rounded p-1.5 text-[var(--h-faint)] hover:bg-[var(--h-bsoft)] hover:text-[var(--h-brand)]"><FaPen size={11} /></button>
                            <button onClick={() => remove(s)} className="rounded p-1.5 text-[var(--h-faint)] hover:bg-rose-50 hover:text-rose-600"><FaTrash size={11} /></button>
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

      <Modal open={!!editing} title={editing?.id ? 'Edit service' : 'Add service'} onClose={() => setEditing(null)}
        footer={<><Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn><Btn onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Btn></>}>
        <div className="space-y-3">
          <Field label="Service name" required><input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Airport pickup (cab)" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <input className={inputCls} list="svc-cats" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              <datalist id="svc-cats">{CATEGORIES.map((c) => <option key={c} value={c} />)}</datalist>
            </Field>
            <Field label="Price"><input type="number" min="0" step="0.01" className={inputCls} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Charged"><select className={inputCls} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>{UNITS.map((u) => <option key={u.v} value={u.v}>{u.l}</option>)}</select></Field>
            <div className="flex items-end gap-4 pb-2">
              <label className="flex items-center gap-2 text-sm text-[var(--h-text)]"><input type="checkbox" checked={form.taxable} onChange={(e) => setForm({ ...form, taxable: e.target.checked })} className="h-4 w-4 rounded border-[var(--h-border2)]" /> Taxable</label>
              <label className="flex items-center gap-2 text-sm text-[var(--h-text)]"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="h-4 w-4 rounded border-[var(--h-border2)]" /> Active</label>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

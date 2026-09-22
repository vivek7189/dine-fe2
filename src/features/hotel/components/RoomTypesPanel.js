'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaPen, FaTrash, FaBed, FaSpinner } from 'react-icons/fa';
import hotelApi from '../api/hotelApi';
import { Modal, Field, inputCls, Btn, Pill } from './ui';

const EMPTY = { name: '', code: '', baseOccupancy: 2, maxOccupancy: 3, defaultRate: '', description: '' };

export default function RoomTypesPanel({ restaurantId, formatCurrency, notify, onChanged }) {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | {} (new) | type (edit)
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const res = await hotelApi.listRoomTypes(restaurantId);
      setTypes(res.roomTypes || []);
    } catch (e) {
      notify('error', e.message || 'Failed to load room types');
    } finally {
      setLoading(false);
    }
  }, [restaurantId, notify]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setForm(EMPTY); setEditing({}); };
  const openEdit = (t) => {
    setForm({
      name: t.name || '', code: t.code || '', baseOccupancy: t.baseOccupancy ?? 2,
      maxOccupancy: t.maxOccupancy ?? 3, defaultRate: t.defaultRate ?? '', description: t.description || '',
    });
    setEditing(t);
  };

  const save = async () => {
    if (!form.name.trim()) return notify('error', 'Name is required');
    setSaving(true);
    try {
      const body = {
        name: form.name.trim(), code: form.code.trim() || null,
        baseOccupancy: Number(form.baseOccupancy) || 1, maxOccupancy: Number(form.maxOccupancy) || 1,
        defaultRate: form.defaultRate === '' ? 0 : Number(form.defaultRate),
        description: form.description.trim() || null,
      };
      if (editing.id) await hotelApi.updateRoomType(restaurantId, editing.id, body);
      else await hotelApi.createRoomType(restaurantId, body);
      notify('success', `Room type ${editing.id ? 'updated' : 'created'}`);
      setEditing(null);
      await load();
      onChanged && onChanged();
    } catch (e) {
      notify('error', e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (t) => {
    if (!window.confirm(`Delete room type "${t.name}"? Rooms keep their existing type until reassigned.`)) return;
    try {
      await hotelApi.deleteRoomType(restaurantId, t.id);
      notify('success', 'Room type deleted');
      await load();
      onChanged && onChanged();
    } catch (e) {
      notify('error', e.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-[var(--h-muted)]">Categories that rooms belong to and rates hang off.</p>
        <Btn onClick={openNew}><FaPlus size={12} /> New type</Btn>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-[var(--h-faint)]"><FaSpinner className="animate-spin" /> Loading…</div>
      ) : types.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--h-border)] py-12 text-center text-[var(--h-faint)]">
          <FaBed className="mx-auto mb-2" size={22} />
          No room types yet. Create your first one.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {types.map((t) => (
            <div key={t.id} className="rounded-xl border border-[var(--h-border)] bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-[var(--h-ink)]">{t.name}</h4>
                    {t.code && <Pill value={t.code} />}
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--h-muted)]">Sleeps {t.baseOccupancy}–{t.maxOccupancy}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(t)} className="rounded p-1.5 text-[var(--h-faint)] hover:bg-[var(--h-hover)] hover:text-[var(--h-brand)]" aria-label="Edit"><FaPen size={12} /></button>
                  <button onClick={() => remove(t)} className="rounded p-1.5 text-[var(--h-faint)] hover:bg-rose-50 hover:text-rose-600" aria-label="Delete"><FaTrash size={12} /></button>
                </div>
              </div>
              <div className="mt-3 text-lg font-semibold text-[var(--h-ink)]">
                {formatCurrency ? formatCurrency(t.defaultRate || 0) : t.defaultRate}
                <span className="ml-1 text-xs font-normal text-[var(--h-faint)]">/ night</span>
              </div>
              {t.description && <p className="mt-2 line-clamp-2 text-xs text-[var(--h-muted)]">{t.description}</p>}
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!editing}
        title={editing?.id ? 'Edit room type' : 'New room type'}
        onClose={() => setEditing(null)}
        footer={<>
          <Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn>
          <Btn onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Btn>
        </>}
      >
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Field label="Name" required>
                <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Deluxe" />
              </Field>
            </div>
            <Field label="Code" hint="e.g. DLX">
              <input className={inputCls} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="DLX" />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Base occupancy"><input type="number" min="1" className={inputCls} value={form.baseOccupancy} onChange={(e) => setForm({ ...form, baseOccupancy: e.target.value })} /></Field>
            <Field label="Max occupancy"><input type="number" min="1" className={inputCls} value={form.maxOccupancy} onChange={(e) => setForm({ ...form, maxOccupancy: e.target.value })} /></Field>
            <Field label="Default rate" hint="per night"><input type="number" min="0" step="0.01" className={inputCls} value={form.defaultRate} onChange={(e) => setForm({ ...form, defaultRate: e.target.value })} /></Field>
          </div>
          <Field label="Description">
            <textarea rows={2} className={inputCls} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What guests get with this room type." />
          </Field>
        </div>
      </Modal>
    </div>
  );
}

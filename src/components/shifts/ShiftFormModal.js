'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaClock, FaUser, FaStickyNote, FaCalendarAlt, FaExclamationTriangle, FaUserPlus } from 'react-icons/fa';
import { getRoleColor, BREAK_OPTIONS, formatDateISO, rotaRoles, titleCase, availabilityOn } from './constants';

const field = {
  width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e5e7eb',
  fontSize: '14px', color: '#111827', backgroundColor: '#fafafa', outline: 'none', boxSizing: 'border-box',
};
const label = { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' };

// Add / edit one shift. `prefill` (from a coverage gap) can set { shiftType, role, isOpen }.
export default function ShiftFormModal({
  isOpen, onClose, onSave, shift, staff, date, staffId, isMobile,
  shiftTypes = [], extraRoles = [], availability = {}, prefill = null,
}) {
  const blank = {
    staffId: '', date: '', startTime: '09:00', endTime: '17:00', breakMinutes: 30,
    role: 'employee', notes: '', status: 'draft', isOpen: false, shiftName: '', color: '',
  };
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    if (shift) {
      setForm({
        staffId: shift.staffId || '',
        date: shift.date ? formatDateISO(shift.date) : '',
        startTime: shift.startTime || '09:00',
        endTime: shift.endTime || '17:00',
        breakMinutes: shift.breakMinutes || 0,
        role: shift.role || 'employee',
        notes: shift.notes || '',
        status: shift.status || 'published',
        isOpen: !!shift.isOpen && !shift.staffId,
        shiftName: shift.shiftName || '',
        color: shift.color || '',
      });
    } else {
      const member = staff?.find(s => s.id === staffId);
      const t = prefill?.shiftType;
      setForm({
        ...blank,
        staffId: prefill?.isOpen ? '' : (staffId || ''),
        date: date ? formatDateISO(date) : formatDateISO(new Date()),
        startTime: t?.startTime || '09:00',
        endTime: t?.endTime || '17:00',
        role: prefill?.role || member?.role || 'employee',
        isOpen: !!prefill?.isOpen,
        shiftName: t?.name || '',
        color: t?.color || '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, shift, date, staffId, staff, prefill]);

  if (!isOpen) return null;

  const roles = rotaRoles(staff, extraRoles);
  const activeStaff = (staff || []).filter(s => s.status === 'active');
  const selectedStaff = staff?.find(s => s.id === form.staffId);
  const avail = form.staffId && form.date ? availabilityOn(availability[form.staffId], form.date) : null;
  const outsideHours = avail?.available && avail.startTime && avail.endTime &&
    (form.startTime < avail.startTime || form.endTime > avail.endTime);

  const pickType = (name) => {
    const t = shiftTypes.find(x => x.name === name);
    setForm(f => t ? { ...f, shiftName: t.name, color: t.color || '', startTime: t.startTime, endTime: t.endTime } : { ...f, shiftName: '', color: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date || !form.startTime || !form.endTime) return;
    if (!form.isOpen && !form.staffId) { setError('Choose a staff member, or make it an open shift'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave({ ...form, staffId: form.isOpen ? null : form.staffId, id: shift?.id || shift?._id });
      onClose();
    } catch (err) {
      setError(err?.message || 'Could not save the shift');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      backdropFilter: 'blur(4px)'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'white', borderRadius: '20px', width: '100%', maxWidth: '480px',
        maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
              {shift ? 'Edit Shift' : form.isOpen ? 'Add Open Shift' : 'Add Shift'}
            </h2>
            {selectedStaff && !form.isOpen && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px', backgroundColor: getRoleColor(selectedStaff.role).bg, color: getRoleColor(selectedStaff.role).text }}>{selectedStaff.role}</span>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>{selectedStaff.name}</span>
              </div>
            )}
          </div>
          <button onClick={onClose} style={{ border: 'none', background: '#f3f4f6', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <FaTimes size={14} color="#6b7280" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px' }}>
          {/* Who */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            {[['staff', 'Assign a person', FaUser], ['open', 'Open shift (staff can pick)', FaUserPlus]].map(([k, t, Icon]) => {
              const on = (k === 'open') === form.isOpen;
              return (
                <button key={k} type="button" onClick={() => setForm(f => ({ ...f, isOpen: k === 'open', staffId: k === 'open' ? '' : f.staffId }))}
                  style={{ flex: 1, padding: '9px 10px', borderRadius: '10px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer',
                    border: on ? '2px solid #ef4444' : '1px solid #e5e7eb', background: on ? '#fef2f2' : 'white', color: on ? '#b91c1c' : '#4b5563',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Icon size={11} /> {t}
                </button>
              );
            })}
          </div>

          {!form.isOpen ? (
            <div style={{ marginBottom: '14px' }}>
              <label style={label}><FaUser size={12} color="#6b7280" /> Staff member</label>
              <select value={form.staffId} style={field}
                onChange={e => { const m = staff?.find(s => s.id === e.target.value); setForm(f => ({ ...f, staffId: e.target.value, role: m?.role || f.role })); }}>
                <option value="">Select staff member…</option>
                {activeStaff.map(s => {
                  const a = form.date ? availabilityOn(availability[s.id], form.date) : null;
                  return <option key={s.id} value={s.id}>{s.name} ({s.role}){a && !a.available ? ' — unavailable' : ''}</option>;
                })}
              </select>
              {avail && !avail.available && (
                <div style={{ marginTop: '6px', fontSize: '12px', color: '#b45309', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FaExclamationTriangle size={11} /> {avail.reason} — you can still assign, but check with them.
                </div>
              )}
              {outsideHours && (
                <div style={{ marginTop: '6px', fontSize: '12px', color: '#b45309', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FaExclamationTriangle size={11} /> Available only {avail.startTime}–{avail.endTime} this day.
                </div>
              )}
            </div>
          ) : (
            <div style={{ marginBottom: '14px', padding: '10px 12px', borderRadius: '10px', background: '#eff6ff', color: '#1e40af', fontSize: '12.5px', lineHeight: 1.5 }}>
              Staff with this role see it in their app and can ask for it. You or a manager approve who gets it.
            </div>
          )}

          {/* Shift type */}
          {shiftTypes.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <label style={label}><FaClock size={12} color="#6b7280" /> Shift type</label>
              <select value={form.shiftName} onChange={e => pickType(e.target.value)} style={field}>
                <option value="">Custom times</option>
                {shiftTypes.map(t => <option key={t.name} value={t.name}>{t.name} ({t.startTime}–{t.endTime})</option>)}
              </select>
            </div>
          )}

          <div style={{ marginBottom: '14px' }}>
            <label style={label}><FaCalendarAlt size={12} color="#6b7280" /> Date</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required style={field} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={label}><FaClock size={12} color="#6b7280" /> Start</label>
              <input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} required style={field} />
            </div>
            <div>
              <label style={label}><FaClock size={12} color="#6b7280" /> End</label>
              <input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} required style={field} />
            </div>
          </div>
          {form.endTime && form.startTime && form.endTime < form.startTime && (
            <div style={{ marginTop: '-8px', marginBottom: '12px', fontSize: '11.5px', color: '#6b7280' }}>Ends after midnight (next day).</div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ ...label, display: 'block' }}>Break</label>
              <select value={form.breakMinutes} onChange={e => setForm(f => ({ ...f, breakMinutes: Number(e.target.value) }))} style={field}>
                {BREAK_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ ...label, display: 'block' }}>Role{form.isOpen ? ' *' : ''}</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={field}>
                {[...new Set([...roles, form.role].filter(Boolean))].map(r => <option key={r} value={r}>{titleCase(r)}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={label}><FaStickyNote size={12} color="#6b7280" /> Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Shift notes (optional)…" rows={2}
              style={{ ...field, resize: 'vertical', fontFamily: 'inherit' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '12px', backgroundColor: '#f9fafb', marginBottom: '8px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Publish now</div>
              <div style={{ fontSize: '11.5px', color: '#6b7280' }}>{form.status === 'published' ? 'Staff see it and get notified' : 'Draft — only you see it until you press Publish'}</div>
            </div>
            <button type="button" onClick={() => setForm(f => ({ ...f, status: f.status === 'published' ? 'draft' : 'published' }))}
              style={{ width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer', backgroundColor: form.status === 'published' ? '#22c55e' : '#d1d5db', position: 'relative', transition: 'all 0.2s', flexShrink: 0 }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '10px', backgroundColor: 'white', position: 'absolute', top: '2px', transition: 'all 0.2s', left: form.status === 'published' ? '22px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </button>
          </div>

          {error && <div style={{ margin: '10px 0', padding: '10px 12px', borderRadius: '10px', background: '#fef2f2', color: '#b91c1c', fontSize: '13px' }}>{error}</div>}

          <button type="submit" disabled={saving || (!form.isOpen && !form.staffId)} style={{
            width: '100%', marginTop: '10px', padding: '12px', borderRadius: '12px', border: 'none',
            background: saving || (!form.isOpen && !form.staffId) ? '#e5e7eb' : 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: 'white', fontWeight: 700, fontSize: '15px', cursor: saving ? 'not-allowed' : 'pointer'
          }}>
            {saving ? 'Saving…' : shift ? 'Update Shift' : form.isOpen ? 'Add Open Shift' : 'Add Shift'}
          </button>
        </form>
      </div>
    </div>
  );
}

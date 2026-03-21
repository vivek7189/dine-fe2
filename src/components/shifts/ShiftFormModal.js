'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaClock, FaUser, FaStickyNote, FaCalendarAlt } from 'react-icons/fa';
import { getRoleColor, BREAK_OPTIONS, ALL_ROLES, formatDateISO } from './constants';

export default function ShiftFormModal({ isOpen, onClose, onSave, shift, staff, date, staffId, isMobile }) {
  const [form, setForm] = useState({
    staffId: '',
    date: '',
    startTime: '09:00',
    endTime: '17:00',
    breakMinutes: 30,
    role: 'employee',
    notes: '',
    status: 'draft',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
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
      });
    } else {
      const member = staff?.find(s => s.id === staffId);
      setForm({
        staffId: staffId || '',
        date: date ? formatDateISO(date) : formatDateISO(new Date()),
        startTime: '09:00',
        endTime: '17:00',
        breakMinutes: 30,
        role: member?.role || 'employee',
        notes: '',
        status: 'draft',
      });
    }
  }, [shift, date, staffId, staff]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.staffId || !form.date || !form.startTime || !form.endTime) return;
    setSaving(true);
    try {
      await onSave({ ...form, id: shift?.id || shift?._id });
      onClose();
    } catch (err) {
      console.error('Error saving shift:', err);
    } finally {
      setSaving(false);
    }
  };

  const selectedStaff = staff?.find(s => s.id === form.staffId);

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      backdropFilter: 'blur(4px)'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'white', borderRadius: '20px', width: '100%', maxWidth: '460px',
        maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
              {shift ? 'Edit Shift' : 'Add Shift'}
            </h2>
            {selectedStaff && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <span style={{
                  fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px',
                  backgroundColor: getRoleColor(selectedStaff.role).bg,
                  color: getRoleColor(selectedStaff.role).text
                }}>{selectedStaff.role}</span>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>{selectedStaff.name}</span>
              </div>
            )}
          </div>
          <button onClick={onClose} style={{
            border: 'none', background: '#f3f4f6', borderRadius: '10px', width: '36px', height: '36px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
          }}><FaTimes size={14} color="#6b7280" /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px' }}>
          {/* Staff Member */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              <FaUser size={12} color="#6b7280" /> Staff Member
            </label>
            <select
              value={form.staffId}
              onChange={e => {
                const member = staff?.find(s => s.id === e.target.value);
                setForm(f => ({ ...f, staffId: e.target.value, role: member?.role || f.role }));
              }}
              required
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e5e7eb',
                fontSize: '14px', color: '#111827', backgroundColor: '#fafafa', outline: 'none'
              }}
            >
              <option value="">Select staff member...</option>
              {(staff || []).filter(s => s.status === 'active').map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              <FaCalendarAlt size={12} color="#6b7280" /> Date
            </label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              required
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e5e7eb',
                fontSize: '14px', color: '#111827', backgroundColor: '#fafafa', outline: 'none'
              }}
            />
          </div>

          {/* Time Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                <FaClock size={12} color="#6b7280" /> Start
              </label>
              <input
                type="time"
                value={form.startTime}
                onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                required
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e5e7eb',
                  fontSize: '14px', color: '#111827', backgroundColor: '#fafafa', outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                <FaClock size={12} color="#6b7280" /> End
              </label>
              <input
                type="time"
                value={form.endTime}
                onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                required
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e5e7eb',
                  fontSize: '14px', color: '#111827', backgroundColor: '#fafafa', outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Break + Role Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px', display: 'block' }}>Break</label>
              <select
                value={form.breakMinutes}
                onChange={e => setForm(f => ({ ...f, breakMinutes: Number(e.target.value) }))}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e5e7eb',
                  fontSize: '14px', color: '#111827', backgroundColor: '#fafafa', outline: 'none'
                }}
              >
                {BREAK_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px', display: 'block' }}>Role</label>
              <select
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e5e7eb',
                  fontSize: '14px', color: '#111827', backgroundColor: '#fafafa', outline: 'none'
                }}
              >
                {ALL_ROLES.map(r => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              <FaStickyNote size={12} color="#6b7280" /> Notes
            </label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Shift notes (optional)..."
              rows={2}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e5e7eb',
                fontSize: '14px', color: '#111827', backgroundColor: '#fafafa', outline: 'none',
                resize: 'vertical', fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Status Toggle */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 14px', borderRadius: '12px', backgroundColor: '#f9fafb', marginBottom: '20px'
          }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Publish immediately</span>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, status: f.status === 'published' ? 'draft' : 'published' }))}
              style={{
                width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                backgroundColor: form.status === 'published' ? '#22c55e' : '#d1d5db',
                position: 'relative', transition: 'all 0.2s'
              }}
            >
              <div style={{
                width: '20px', height: '20px', borderRadius: '10px', backgroundColor: 'white',
                position: 'absolute', top: '2px', transition: 'all 0.2s',
                left: form.status === 'published' ? '22px' : '2px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }} />
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving || !form.staffId}
            style={{
              width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
              background: saving ? '#e5e7eb' : 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white', fontWeight: 700, fontSize: '15px', cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: saving ? 'none' : '0 4px 12px rgba(239,68,68,0.3)', transition: 'all 0.2s'
            }}
          >
            {saving ? 'Saving...' : shift ? 'Update Shift' : 'Add Shift'}
          </button>
        </form>
      </div>
    </div>
  );
}

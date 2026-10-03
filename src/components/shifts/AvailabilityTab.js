'use client';

import { useState, useEffect } from 'react';
import { FaClock, FaCheck, FaTimes, FaSpinner, FaSave } from 'react-icons/fa';
import apiClient from '../../lib/api';
import { getRoleColor, DAYS_OF_WEEK, DAYS_FULL, dayAvailabilitySlots } from './constants';
import TimeSelect from './TimeSelect';

// "09:00-13:00 17:00-22:00" — one line per slot in the small cells.
const cellTimes = (d) => dayAvailabilitySlots(d).map(s => `${s.startTime.slice(0, 5)}-${s.endTime.slice(0, 5)}`);
const timeField = { width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '14px', outline: 'none', background: 'white' };

// The server stores weekdays as mon … sun (one spelling for the app, this grid and the rota check).
// This grid keys days in lowercase ('monday' … — see DEFAULT_AVAILABILITY / avail[day.toLowerCase()])
// and converts when loading / saving.
const SHORT = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const LONG = DAYS_FULL.map(D => D.toLowerCase());
const fromServer = (a = {}) => Object.fromEntries(LONG.map((d, i) => [d, a[SHORT[i]] || a[d] || a[DAYS_FULL[i]]]).filter(([, v]) => v));
const toServer = (grid = {}) => Object.fromEntries(LONG.map((d, i) => [SHORT[i], grid[d]]).filter(([, v]) => v));

const DEFAULT_AVAILABILITY = DAYS_FULL.reduce((acc, day) => {
  acc[day.toLowerCase()] = { available: true, startTime: '09:00', endTime: '22:00' };
  return acc;
}, {});

export default function AvailabilityTab({ restaurantId, staff, isMobile, onAvailabilityChanged }) {
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [editingCell, setEditingCell] = useState(null); // { staffId, day }
  const [editForm, setEditForm] = useState({ available: true, slots: [{ startTime: '09:00', endTime: '22:00' }] });
  const [editError, setEditError] = useState('');

  const activeStaff = (staff || []).filter(s => s.status === 'active');

  useEffect(() => {
    loadAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staff, restaurantId]);

  // One call for everyone (was one per person, and read the wrong field so saved values never showed).
  const [unavailable, setUnavailable] = useState({}); // staffId → ['YYYY-MM-DD']
  const loadAvailability = async () => {
    if (!restaurantId) return;
    setLoading(true);
    const avail = {};
    const off = {};
    try {
      const res = await apiClient.getAllStaffAvailability(restaurantId);
      const all = res?.availability || {};
      for (const member of activeStaff) {
        avail[member.id] = { ...DEFAULT_AVAILABILITY, ...fromServer(all[member.id]?.availability || {}) };
        off[member.id] = all[member.id]?.unavailableDates || [];
      }
    } catch {
      for (const member of activeStaff) { avail[member.id] = { ...DEFAULT_AVAILABILITY }; off[member.id] = []; }
    }
    setAvailability(avail);
    setUnavailable(off);
    setLoading(false);
    if (onAvailabilityChanged) onAvailabilityChanged();
  };

  const saveDates = async (staffId, dates) => {
    setSaving(staffId);
    try {
      await apiClient.updateStaffAvailability(staffId, { unavailableDates: dates });
      setUnavailable(prev => ({ ...prev, [staffId]: dates }));
      if (onAvailabilityChanged) onAvailabilityChanged();
    } catch (err) {
      alert(err?.message || 'Could not save');
    } finally { setSaving(null); }
  };

  const openEdit = (staffId, day) => {
    const current = availability[staffId]?.[day] || { available: true, startTime: '09:00', endTime: '22:00' };
    setEditForm({ available: current.available !== false, slots: dayAvailabilitySlots(current).map(x => ({ ...x })) });
    setEditError('');
    setEditingCell({ staffId, day });
  };

  const saveCell = async () => {
    if (!editingCell) return;
    const { staffId, day } = editingCell;
    setSaving(staffId);
    setEditError('');
    try {
      const slots = editForm.slots.slice(0, 2);
      // startTime / endTime = first slot, so older readers still see a sensible range.
      const dayValue = { available: editForm.available, startTime: slots[0].startTime, endTime: slots[0].endTime, slots };
      const updated = { ...(availability[staffId] || DEFAULT_AVAILABILITY), [day]: dayValue };
      const res = await apiClient.updateStaffAvailability(staffId, { availability: toServer(updated) });
      const saved = res?.availability?.availability ? { ...DEFAULT_AVAILABILITY, ...fromServer(res.availability.availability) } : updated;
      setAvailability(prev => ({ ...prev, [staffId]: saved }));
      setEditingCell(null);
      if (onAvailabilityChanged) onAvailabilityChanged();
    } catch (err) {
      console.error('Error saving availability:', err);
      setEditError(err?.message || 'Could not save');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
        <FaSpinner size={24} className="animate-spin" style={{ marginBottom: '12px' }} />
        <p>Loading availability...</p>
      </div>
    );
  }

  const todayKey = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();
  // "Can't work on" dates: chips (× removes) + a date picker to add.
  const renderDates = (member) => {
    const dates = (unavailable[member.id] || []).filter(d => d >= todayKey);
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
        {dates.map(d => (
          <span key={d} style={{ padding: '3px 8px', borderRadius: '10px', background: '#fee2e2', color: '#991b1b', fontSize: '11px', fontWeight: 600, display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
            {new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            <button type="button" disabled={saving === member.id} onClick={() => saveDates(member.id, (unavailable[member.id] || []).filter(x => x !== d))}
              style={{ border: 'none', background: 'none', color: '#991b1b', cursor: 'pointer', padding: 0, fontSize: '12px' }}>×</button>
          </span>
        ))}
        <input type="date" min={todayKey} value="" disabled={saving === member.id}
          onChange={e => { const v = e.target.value; if (v && !(unavailable[member.id] || []).includes(v)) saveDates(member.id, [...(unavailable[member.id] || []), v].sort()); }}
          title="Add a date they can't work"
          style={{ padding: '3px 6px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '11px', color: '#6b7280', width: '120px' }} />
      </div>
    );
  };

  // Mobile: list view
  if (isMobile) {
    return (
      <div>
        {activeStaff.map(member => {
          const rc = getRoleColor(member.role);
          const avail = availability[member.id] || DEFAULT_AVAILABILITY;
          return (
            <div key={member.id} style={{
              backgroundColor: 'white', borderRadius: '14px', padding: '16px',
              border: '1px solid #f1f5f9', marginBottom: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px', backgroundColor: rc.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: 700, color: rc.text
                }}>{(member.name || '?')[0].toUpperCase()}</div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{member.name}</div>
                  <span style={{
                    fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: '8px',
                    backgroundColor: rc.bg, color: rc.text, textTransform: 'capitalize'
                  }}>{member.role}</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {DAYS_FULL.map((day, i) => {
                  const d = avail[day.toLowerCase()];
                  const isAvailable = d?.available !== false;
                  return (
                    <button key={day} onClick={() => openEdit(member.id, day.toLowerCase())} style={{
                      padding: '6px 2px', borderRadius: '8px', border: 'none',
                      backgroundColor: isAvailable ? '#dcfce7' : '#fee2e2',
                      color: isAvailable ? '#166534' : '#991b1b',
                      fontSize: '10px', fontWeight: 600, cursor: 'pointer', textAlign: 'center'
                    }}>
                      <div>{DAYS_OF_WEEK[i]}</div>
                      {isAvailable ? cellTimes(d).map(t => <div key={t} style={{ fontSize: '9px' }}>{t}</div>) : <FaTimes size={8} />}
                    </button>
                  );
                })}
              </div>
              <div style={{ marginTop: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', marginBottom: '4px' }}>CAN&apos;T WORK ON</div>
                {renderDates(member)}
              </div>
            </div>
          );
        })}
        {renderEditModal()}
      </div>
    );
  }

  function renderEditModal() {
    if (!editingCell) return null;
    const member = activeStaff.find(s => s.id === editingCell.staffId);
    return (
      <div style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
        backdropFilter: 'blur(4px)'
      }} onClick={() => setEditingCell(null)}>
        <div style={{
          backgroundColor: 'white', borderRadius: '20px', width: '100%', maxWidth: '360px',
          padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
        }} onClick={e => e.stopPropagation()}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
            {member?.name} — {editingCell.day.charAt(0).toUpperCase() + editingCell.day.slice(1)}
          </h3>
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '20px' }}>Set availability for this day</p>

          {/* Available toggle */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 14px', borderRadius: '12px', backgroundColor: '#f9fafb', marginBottom: '16px'
          }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>Available</span>
            <button type="button" onClick={() => setEditForm(f => ({ ...f, available: !f.available }))}
              style={{
                width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                backgroundColor: editForm.available ? '#22c55e' : '#d1d5db', position: 'relative', transition: 'all 0.2s'
              }}>
              <div style={{
                width: '20px', height: '20px', borderRadius: '10px', backgroundColor: 'white',
                position: 'absolute', top: '2px', transition: 'all 0.2s',
                left: editForm.available ? '22px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }} />
            </button>
          </div>

          {editForm.available && (
            <div style={{ marginBottom: '20px' }}>
              {editForm.slots.map((slot, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', alignItems: 'end', marginBottom: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '4px' }}>{editForm.slots.length > 1 ? `Slot ${idx + 1} · From` : 'From'}</label>
                    <TimeSelect value={slot.startTime} style={timeField} ariaLabel={`Slot ${idx + 1} start`}
                      onChange={v => setEditForm(f => ({ ...f, slots: f.slots.map((x, j) => (j === idx ? { ...x, startTime: v } : x)) }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '4px' }}>To</label>
                    <TimeSelect value={slot.endTime} style={timeField} ariaLabel={`Slot ${idx + 1} end`}
                      onChange={v => setEditForm(f => ({ ...f, slots: f.slots.map((x, j) => (j === idx ? { ...x, endTime: v } : x)) }))} />
                  </div>
                  {idx > 0 ? (
                    <button type="button" title="Remove this slot" onClick={() => setEditForm(f => ({ ...f, slots: f.slots.filter((_, j) => j !== idx) }))}
                      style={{ border: 'none', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', width: '32px', height: '40px', cursor: 'pointer' }}><FaTimes size={11} /></button>
                  ) : <span style={{ width: '32px' }} />}
                </div>
              ))}
              {editForm.slots.length < 2 && (
                <button type="button" onClick={() => setEditForm(f => ({ ...f, slots: [...f.slots, { startTime: '17:00', endTime: '22:00' }] }))}
                  style={{ border: '1px dashed #d1d5db', background: 'white', color: '#374151', borderRadius: '10px', padding: '8px 12px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}>
                  + Add 2nd time slot (split shift)
                </button>
              )}
            </div>
          )}
          {editError && <div style={{ marginBottom: '12px', padding: '8px 10px', borderRadius: '8px', background: '#fef2f2', color: '#b91c1c', fontSize: '12.5px' }}>{editError}</div>}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setEditingCell(null)} style={{
              flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #e5e7eb',
              backgroundColor: 'white', color: '#374151', fontWeight: 600, fontSize: '14px', cursor: 'pointer'
            }}>Cancel</button>
            <button onClick={saveCell} disabled={saving === editingCell.staffId} style={{
              flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white',
              fontWeight: 600, fontSize: '14px', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(239,68,68,0.3)'
            }}>
              {saving === editingCell.staffId ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop: table/grid view
  return (
    <div>
      <div style={{
        backgroundColor: 'white', borderRadius: '16px', border: '1px solid #f1f5f9',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'auto'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{
                position: 'sticky', left: 0, zIndex: 2, backgroundColor: '#fafafa',
                padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 700,
                color: '#374151', borderBottom: '1px solid #f1f5f9', minWidth: '180px'
              }}>Staff</th>
              {DAYS_OF_WEEK.map(day => (
                <th key={day} style={{
                  padding: '14px 12px', textAlign: 'center', fontSize: '13px', fontWeight: 700,
                  color: '#374151', borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafafa',
                  minWidth: '100px'
                }}>{day}</th>
              ))}
              <th style={{ padding: '14px 12px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: '#374151', borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafafa', minWidth: '200px' }}>Can&apos;t work on</th>
            </tr>
          </thead>
          <tbody>
            {activeStaff.map(member => {
              const rc = getRoleColor(member.role);
              const avail = availability[member.id] || DEFAULT_AVAILABILITY;
              return (
                <tr key={member.id}>
                  <td style={{
                    position: 'sticky', left: 0, zIndex: 1, backgroundColor: 'white',
                    padding: '12px 16px', borderBottom: '1px solid #f9fafb'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '8px', backgroundColor: rc.bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '13px', fontWeight: 700, color: rc.text
                      }}>{(member.name || '?')[0].toUpperCase()}</div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{member.name}</div>
                        <span style={{
                          fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: '6px',
                          backgroundColor: rc.bg, color: rc.text, textTransform: 'capitalize'
                        }}>{member.role}</span>
                      </div>
                    </div>
                  </td>
                  {DAYS_FULL.map(day => {
                    const d = avail[day.toLowerCase()];
                    const isAvailable = d?.available !== false;
                    return (
                      <td key={day} style={{
                        padding: '8px', textAlign: 'center', borderBottom: '1px solid #f9fafb'
                      }}>
                        <button onClick={() => openEdit(member.id, day.toLowerCase())} style={{
                          width: '100%', padding: '8px 6px', borderRadius: '10px', border: 'none',
                          backgroundColor: isAvailable ? '#dcfce7' : '#fee2e2',
                          color: isAvailable ? '#166534' : '#991b1b',
                          cursor: 'pointer', fontSize: '12px', fontWeight: 600, transition: 'all 0.2s'
                        }}>
                          {isAvailable ? (
                            <div>
                              <FaCheck size={10} style={{ marginBottom: '2px' }} />
                              {cellTimes(d).map(t => <div key={t} style={{ fontSize: '10px' }}>{t}</div>)}
                            </div>
                          ) : (
                            <div><FaTimes size={10} /><div style={{ fontSize: '10px' }}>Off</div></div>
                          )}
                        </button>
                      </td>
                    );
                  })}
                  <td style={{ padding: '8px', borderBottom: '1px solid #f9fafb' }}>{renderDates(member)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {activeStaff.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
          <FaClock size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
          <p style={{ fontSize: '15px', fontWeight: 600 }}>No staff members</p>
          <p style={{ fontSize: '13px' }}>Add team members first to set availability</p>
        </div>
      )}

      {renderEditModal()}
    </div>
  );
}

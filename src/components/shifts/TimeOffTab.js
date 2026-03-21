'use client';

import { useState } from 'react';
import { FaCalendarAlt, FaPlus, FaTimes, FaCheck, FaBan, FaClock, FaUser } from 'react-icons/fa';
import apiClient from '../../lib/api';
import { getRoleColor } from './constants';

export default function TimeOffTab({ restaurantId, staff, shiftSettings, setShiftSettings, isMobile }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ staffId: '', startDate: '', endDate: '', reason: '' });

  const requests = shiftSettings?.timeOffRequests || [];
  const activeStaff = (staff || []).filter(s => s.status === 'active');

  const statusColors = {
    pending: { bg: '#fef3c7', text: '#92400e', label: 'Pending' },
    approved: { bg: '#dcfce7', text: '#166534', label: 'Approved' },
    denied: { bg: '#fee2e2', text: '#991b1b', label: 'Denied' },
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.staffId || !form.startDate || !form.endDate) return;
    setSaving(true);
    try {
      const newRequest = {
        id: 'req_' + Date.now(),
        ...form,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      const updatedRequests = [...requests, newRequest];
      const updatedSettings = { ...shiftSettings, timeOffRequests: updatedRequests };
      await apiClient.updateShiftSettings(restaurantId, updatedSettings);
      setShiftSettings(updatedSettings);
      setShowAddModal(false);
      setForm({ staffId: '', startDate: '', endDate: '', reason: '' });
    } catch (err) {
      console.error('Error adding time off:', err);
      alert('Failed to save request');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      const updatedRequests = requests.map(r => r.id === requestId ? { ...r, status: newStatus } : r);
      const updatedSettings = { ...shiftSettings, timeOffRequests: updatedRequests };
      await apiClient.updateShiftSettings(restaurantId, updatedSettings);
      setShiftSettings(updatedSettings);
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDelete = async (requestId) => {
    try {
      const updatedRequests = requests.filter(r => r.id !== requestId);
      const updatedSettings = { ...shiftSettings, timeOffRequests: updatedRequests };
      await apiClient.updateShiftSettings(restaurantId, updatedSettings);
      setShiftSettings(updatedSettings);
    } catch (err) {
      console.error('Error deleting request:', err);
    }
  };

  const getStaffName = (staffId) => {
    const member = activeStaff.find(s => s.id === staffId);
    return member?.name || 'Unknown';
  };

  const getStaffRole = (staffId) => {
    const member = activeStaff.find(s => s.id === staffId);
    return member?.role || 'employee';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDays = (start, end) => {
    if (!start || !end) return 0;
    const diff = new Date(end) - new Date(start);
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  // Sort: pending first, then by date
  const sorted = [...requests].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              padding: '4px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
              backgroundColor: '#fef3c7', color: '#92400e'
            }}>{requests.filter(r => r.status === 'pending').length} pending</span>
            <span style={{
              padding: '4px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
              backgroundColor: '#dcfce7', color: '#166534'
            }}>{requests.filter(r => r.status === 'approved').length} approved</span>
          </div>
        </div>
        <button onClick={() => setShowAddModal(true)} style={{
          padding: '10px 18px', borderRadius: '12px', border: 'none',
          background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white',
          fontWeight: 600, fontSize: '14px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '6px',
          boxShadow: '0 4px 12px rgba(239,68,68,0.3)'
        }}><FaPlus size={12} /> Request Time Off</button>
      </div>

      {/* Requests List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {sorted.map(req => {
          const sc = statusColors[req.status] || statusColors.pending;
          const rc = getRoleColor(getStaffRole(req.staffId));
          const days = getDays(req.startDate, req.endDate);
          return (
            <div key={req.id} style={{
              backgroundColor: 'white', borderRadius: '14px', padding: '16px',
              border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap'
            }}>
              {/* Staff avatar */}
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px', backgroundColor: rc.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', fontWeight: 700, color: rc.text, flexShrink: 0
              }}>{getStaffName(req.staffId)[0]?.toUpperCase() || '?'}</div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: '150px' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{getStaffName(req.staffId)}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FaCalendarAlt size={10} /> {formatDate(req.startDate)} — {formatDate(req.endDate)}
                  </span>
                  <span style={{
                    fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '8px',
                    backgroundColor: '#f3f4f6', color: '#374151'
                  }}>{days} day{days !== 1 ? 's' : ''}</span>
                </div>
                {req.reason && (
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px', fontStyle: 'italic' }}>
                    &ldquo;{req.reason}&rdquo;
                  </div>
                )}
              </div>

              {/* Status */}
              <span style={{
                padding: '4px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
                backgroundColor: sc.bg, color: sc.text
              }}>{sc.label}</span>

              {/* Actions */}
              {req.status === 'pending' && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => handleUpdateStatus(req.id, 'approved')} style={{
                    padding: '8px 14px', borderRadius: '10px', border: 'none',
                    backgroundColor: '#dcfce7', color: '#166534', fontWeight: 600,
                    fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                  }}><FaCheck size={10} /> Approve</button>
                  <button onClick={() => handleUpdateStatus(req.id, 'denied')} style={{
                    padding: '8px 14px', borderRadius: '10px', border: 'none',
                    backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: 600,
                    fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                  }}><FaBan size={10} /> Deny</button>
                </div>
              )}

              <button onClick={() => handleDelete(req.id)} style={{
                padding: '6px', borderRadius: '8px', border: 'none',
                backgroundColor: '#f3f4f6', cursor: 'pointer', color: '#9ca3af'
              }}><FaTimes size={12} /></button>
            </div>
          );
        })}
      </div>

      {sorted.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
          <FaCalendarAlt size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
          <p style={{ fontSize: '15px', fontWeight: 600 }}>No time-off requests</p>
          <p style={{ fontSize: '13px' }}>All clear! No pending or upcoming time off.</p>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
          backdropFilter: 'blur(4px)'
        }} onClick={() => setShowAddModal(false)}>
          <div style={{
            backgroundColor: 'white', borderRadius: '20px', width: '100%', maxWidth: '420px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>Request Time Off</h2>
              <button onClick={() => setShowAddModal(false)} style={{
                border: 'none', background: '#f3f4f6', borderRadius: '10px',
                width: '36px', height: '36px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer'
              }}><FaTimes size={14} color="#6b7280" /></button>
            </div>

            <form onSubmit={handleAdd} style={{ padding: '20px 24px 24px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  <FaUser size={12} /> Staff Member
                </label>
                <select value={form.staffId} onChange={e => setForm(f => ({ ...f, staffId: e.target.value }))}
                  required style={{
                    width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e5e7eb',
                    fontSize: '14px', backgroundColor: '#fafafa', outline: 'none'
                  }}>
                  <option value="">Select...</option>
                  {activeStaff.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px', display: 'block' }}>From</label>
                  <input type="date" value={form.startDate} required
                    onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e5e7eb',
                      fontSize: '14px', outline: 'none'
                    }} />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px', display: 'block' }}>To</label>
                  <input type="date" value={form.endDate} required
                    onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e5e7eb',
                      fontSize: '14px', outline: 'none'
                    }} />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px', display: 'block' }}>Reason (optional)</label>
                <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                  placeholder="Vacation, personal, medical..."
                  rows={2} style={{
                    width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e5e7eb',
                    fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit'
                  }} />
              </div>

              <button type="submit" disabled={saving} style={{
                width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
                background: saving ? '#e5e7eb' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white', fontWeight: 700, fontSize: '15px',
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: saving ? 'none' : '0 4px 12px rgba(239,68,68,0.3)'
              }}>
                {saving ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

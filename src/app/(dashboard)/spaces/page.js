'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FaCalendarAlt, FaClock, FaUser, FaPhone, FaBuilding, FaCheck, FaTimes,
  FaPlay, FaFlag, FaSearch, FaChevronDown, FaCog, FaQrcode, FaRupeeSign,
  FaSpinner, FaExclamationCircle, FaChevronLeft, FaChevronRight, FaEye
} from 'react-icons/fa';
import apiClient from '../../../lib/api';
import QRCodeModal from '../../../components/QRCodeModal';

const PRIMARY = '#0d9488';
const PRIMARY_LIGHT = '#ccfbf1';

// ─── Helpers ────────────────────────────────────────────
function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function statusColor(s) {
  const map = {
    requested: { bg: '#fef3c7', text: '#92400e' },
    confirmed: { bg: '#dbeafe', text: '#1e40af' },
    in_use: { bg: '#dcfce7', text: '#166534' },
    completed: { bg: '#f1f5f9', text: '#475569' },
    cancelled: { bg: '#fee2e2', text: '#991b1b' },
    rejected: { bg: '#fee2e2', text: '#991b1b' },
  };
  return map[s] || { bg: '#f1f5f9', text: '#475569' };
}

function Shimmer({ width = '100%', height = 20, borderRadius = 8 }) {
  return <div style={{ width, height, borderRadius, background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />;
}

// ═════════════════════════════════════════════════════════
// Admin Spaces Dashboard
// ═════════════════════════════════════════════════════════
export default function SpacesAdminPage() {
  const [tab, setTab] = useState('bookings'); // bookings | settings
  const [spaces, setSpaces] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  // Filters
  const [selectedSpaceId, setSelectedSpaceId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

  // Modals
  const [rejectModal, setRejectModal] = useState(null); // { bookingId }
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // bookingId being actioned
  const [qrModal, setQrModal] = useState(null); // { spaceId, spaceName }

  // Settings edit
  const [editingSettings, setEditingSettings] = useState({}); // { spaceId: { ...settings } }
  const [savingSettings, setSavingSettings] = useState(null);

  // ─── Load spaces ──────────────────────────────────────
  useEffect(() => {
    apiClient.getOwnerSpaces()
      .then(data => {
        setSpaces(data.spaces || []);
        if (data.spaces?.length > 0 && !selectedSpaceId) {
          setSelectedSpaceId(data.spaces[0].id);
        }
      })
      .catch(e => console.error('Failed to load spaces:', e))
      .finally(() => setLoading(false));
  }, []);

  // ─── Load bookings ───────────────────────────────────
  const loadBookings = useCallback(async () => {
    setBookingsLoading(true);
    try {
      const filters = {};
      if (selectedSpaceId) filters.spaceId = selectedSpaceId;
      if (statusFilter) filters.status = statusFilter;
      if (dateFilter) filters.date = dateFilter;
      const data = await apiClient.getSpaceBookings(filters);
      setBookings(data.bookings || []);
    } catch (e) {
      console.error('Failed to load bookings:', e);
    } finally {
      setBookingsLoading(false);
    }
  }, [selectedSpaceId, statusFilter, dateFilter]);

  useEffect(() => {
    if (tab === 'bookings') loadBookings();
  }, [tab, loadBookings]);

  // ─── Actions ──────────────────────────────────────────
  const handleStatusUpdate = async (bookingId, status, rejectionReason) => {
    setActionLoading(bookingId);
    try {
      const body = { status };
      if (rejectionReason) body.rejectionReason = rejectionReason;
      await apiClient.updateSpaceBookingStatus(bookingId, body);
      setRejectModal(null);
      setRejectReason('');
      await loadBookings();
    } catch (e) {
      alert(e.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveSettings = async (spaceId) => {
    setSavingSettings(spaceId);
    try {
      const s = editingSettings[spaceId];
      await apiClient.updateSpaceSettings(spaceId, s);
      // Update local spaces
      setSpaces(prev => prev.map(sp => sp.id === spaceId ? { ...sp, spaceSettings: { ...sp.spaceSettings, ...s } } : sp));
      setEditingSettings(prev => { const n = { ...prev }; delete n[spaceId]; return n; });
    } catch (e) {
      alert(e.message || 'Save failed');
    } finally {
      setSavingSettings(null);
    }
  };

  const startEditing = (space) => {
    const s = space.spaceSettings || {};
    setEditingSettings(prev => ({
      ...prev,
      [space.id]: {
        hourlyRate: s.hourlyRate || 0,
        operatingHours: s.operatingHours || { start: '08:00', end: '22:00' },
        slotDurationMinutes: s.slotDurationMinutes || 60,
        advancePercentage: s.advancePercentage ?? 50,
        autoApprove: s.autoApprove || false
      }
    }));
  };

  const dateNav = (delta) => {
    const d = new Date(dateFilter);
    d.setDate(d.getDate() + delta);
    setDateFilter(d.toISOString().split('T')[0]);
  };

  // ═════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════
  return (
    <div style={{ padding: '20px 16px', maxWidth: 1100, margin: '0 auto' }}>
      <style>{`
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input:focus, select:focus { outline: none; border-color: ${PRIMARY} !important; box-shadow: 0 0 0 3px ${PRIMARY_LIGHT} !important; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', margin: 0 }}>Space Bookings</h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Manage venue bookings and space settings</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#f1f5f9', borderRadius: 10, padding: 4 }}>
        {[
          { id: 'bookings', label: 'Bookings', icon: FaCalendarAlt },
          { id: 'settings', label: 'Space Settings', icon: FaCog }
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '10px 16px', borderRadius: 8, border: 'none',
            background: tab === t.id ? '#fff' : 'transparent',
            color: tab === t.id ? PRIMARY : '#64748b',
            fontWeight: 600, fontSize: 14, cursor: 'pointer',
            boxShadow: tab === t.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'all 0.15s'
          }}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* ═══ Bookings Tab ═══ */}
      {tab === 'bookings' && (
        <>
          {/* Filters Row */}
          <div style={{
            display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center'
          }}>
            {/* Date nav */}
            <div style={{
              display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 10,
              border: '1px solid #e2e8f0', overflow: 'hidden'
            }}>
              <button onClick={() => dateNav(-1)} style={{ padding: '8px 10px', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                <FaChevronLeft size={12} />
              </button>
              <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
                style={{ border: 'none', padding: '8px 4px', fontSize: 14, fontWeight: 500, color: '#1e293b', background: 'transparent', cursor: 'pointer' }}
              />
              <button onClick={() => dateNav(1)} style={{ padding: '8px 10px', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                <FaChevronRight size={12} />
              </button>
            </div>

            {/* Space filter */}
            {spaces.length > 1 && (
              <select value={selectedSpaceId} onChange={e => setSelectedSpaceId(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, color: '#1e293b', background: '#fff', cursor: 'pointer' }}
              >
                <option value="">All Spaces</option>
                {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            )}

            {/* Status filter */}
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, color: '#1e293b', background: '#fff', cursor: 'pointer' }}
            >
              <option value="">All Status</option>
              {['requested', 'confirmed', 'in_use', 'completed', 'cancelled', 'rejected'].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}</option>
              ))}
            </select>

            {/* Today button */}
            <button onClick={() => setDateFilter(new Date().toISOString().split('T')[0])} style={{
              padding: '8px 14px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff',
              fontSize: 13, fontWeight: 500, color: '#475569', cursor: 'pointer'
            }}>Today</button>
          </div>

          {/* Bookings List */}
          {bookingsLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 12, padding: 16, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <Shimmer width={80} height={40} />
                    <div style={{ flex: 1 }}>
                      <Shimmer width="50%" height={16} />
                      <Shimmer width="30%" height={14} borderRadius={4} />
                    </div>
                    <Shimmer width={70} height={24} borderRadius={12} />
                  </div>
                </div>
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: '#94a3b8' }}>
              <FaCalendarAlt size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
              <div style={{ fontSize: 16, fontWeight: 500 }}>No bookings found</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Try changing the date or filters</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {bookings.map(b => {
                const sc = statusColor(b.status);
                const isActioning = actionLoading === b.id;

                return (
                  <div key={b.id} style={{
                    background: '#fff', borderRadius: 14, padding: '14px 16px',
                    border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    transition: 'box-shadow 0.15s'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                      {/* Left: time + customer */}
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <FaClock size={13} color={PRIMARY} />
                          <span style={{ fontSize: 15, fontWeight: 600, color: '#1e293b' }}>
                            {formatTime(b.startTime)} – {formatTime(b.endTime)}
                          </span>
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>({b.duration}h)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#475569' }}>
                          <FaUser size={11} color="#94a3b8" />
                          <span style={{ fontWeight: 500 }}>{b.customerInfo?.name}</span>
                          {b.customerInfo?.company && <span style={{ color: '#94a3b8' }}>• {b.customerInfo.company}</span>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#94a3b8', marginTop: 2 }}>
                          <FaPhone size={10} /> {b.customerInfo?.phone}
                          {b.customerInfo?.email && <span>• {b.customerInfo.email}</span>}
                        </div>
                        {b.amenities?.length > 0 && (
                          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                            Amenities: {b.amenities.map(a => `${a.name} ×${a.quantity}`).join(', ')}
                          </div>
                        )}
                        {b.notes && (
                          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, fontStyle: 'italic' }}>
                            Note: {b.notes}
                          </div>
                        )}
                      </div>

                      {/* Right: status + amount */}
                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                        <div style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                          background: sc.bg, color: sc.text, fontSize: 11, fontWeight: 700,
                          textTransform: 'uppercase', letterSpacing: 0.5
                        }}>
                          {b.status.replace('_', ' ')}
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>₹{b.totalAmount}</div>
                        {b.rejectionReason && (
                          <div style={{ fontSize: 11, color: '#ef4444', maxWidth: 180, textAlign: 'right' }}>
                            Reason: {b.rejectionReason}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {(b.status === 'requested' || b.status === 'confirmed' || b.status === 'in_use') && (
                      <div style={{
                        display: 'flex', gap: 8, marginTop: 12, paddingTop: 12,
                        borderTop: '1px solid #f1f5f9', flexWrap: 'wrap'
                      }}>
                        {b.status === 'requested' && (
                          <>
                            <button disabled={isActioning} onClick={() => handleStatusUpdate(b.id, 'confirmed')}
                              style={{
                                padding: '7px 14px', borderRadius: 8, border: 'none',
                                background: '#059669', color: '#fff', fontWeight: 600, fontSize: 13,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                                opacity: isActioning ? 0.6 : 1
                              }}>
                              {isActioning ? <FaSpinner size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <FaCheck size={12} />} Approve
                            </button>
                            <button disabled={isActioning} onClick={() => { setRejectModal({ bookingId: b.id }); setRejectReason(''); }}
                              style={{
                                padding: '7px 14px', borderRadius: 8, border: '1px solid #fecaca',
                                background: '#fff', color: '#dc2626', fontWeight: 600, fontSize: 13,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5
                              }}>
                              <FaTimes size={12} /> Reject
                            </button>
                          </>
                        )}
                        {b.status === 'confirmed' && (
                          <>
                            <button disabled={isActioning} onClick={() => handleStatusUpdate(b.id, 'in_use')}
                              style={{
                                padding: '7px 14px', borderRadius: 8, border: 'none',
                                background: '#2563eb', color: '#fff', fontWeight: 600, fontSize: 13,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                                opacity: isActioning ? 0.6 : 1
                              }}>
                              <FaPlay size={10} /> Mark In Use
                            </button>
                            <button disabled={isActioning} onClick={() => handleStatusUpdate(b.id, 'cancelled')}
                              style={{
                                padding: '7px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
                                background: '#fff', color: '#64748b', fontWeight: 600, fontSize: 13,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5
                              }}>
                              <FaTimes size={12} /> Cancel
                            </button>
                          </>
                        )}
                        {b.status === 'in_use' && (
                          <button disabled={isActioning} onClick={() => handleStatusUpdate(b.id, 'completed')}
                            style={{
                              padding: '7px 14px', borderRadius: 8, border: 'none',
                              background: '#475569', color: '#fff', fontWeight: 600, fontSize: 13,
                              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                              opacity: isActioning ? 0.6 : 1
                            }}>
                            <FaFlag size={10} /> Complete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ═══ Settings Tab ═══ */}
      {tab === 'settings' && (
        <>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[1, 2].map(i => (
                <div key={i} style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #e2e8f0' }}>
                  <Shimmer width="40%" height={20} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
                    <Shimmer height={40} /><Shimmer height={40} />
                    <Shimmer height={40} /><Shimmer height={40} />
                  </div>
                </div>
              ))}
            </div>
          ) : spaces.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: '#94a3b8' }}>
              <FaBuilding size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
              <div style={{ fontSize: 16, fontWeight: 500 }}>No spaces found</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Create a restaurant with business type &quot;space&quot; to get started</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {spaces.map(space => {
                const editing = editingSettings[space.id];
                const s = editing || space.spaceSettings || {};
                const isSaving = savingSettings === space.id;
                const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://dineopen.com';

                return (
                  <div key={space.id} style={{
                    background: '#fff', borderRadius: 14, padding: 20,
                    border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                  }}>
                    {/* Space Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 17, fontWeight: 700, color: '#1e293b' }}>{space.name}</div>
                        {space.address && <div style={{ fontSize: 13, color: '#64748b' }}>{space.address}{space.city ? `, ${space.city}` : ''}</div>}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setQrModal({ spaceId: space.id, spaceName: space.name })}
                          style={{
                            padding: '7px 12px', borderRadius: 8, border: '1px solid #e2e8f0',
                            background: '#fff', color: '#475569', fontWeight: 500, fontSize: 13,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5
                          }}>
                          <FaQrcode size={13} /> QR Code
                        </button>
                        <a href={`/spaces/availability/${space.id}`} target="_blank" rel="noopener noreferrer"
                          style={{
                            padding: '7px 12px', borderRadius: 8, border: '1px solid #e2e8f0',
                            background: '#fff', color: '#475569', fontWeight: 500, fontSize: 13,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                            textDecoration: 'none'
                          }}>
                          <FaEye size={13} /> Display Board
                        </a>
                      </div>
                    </div>

                    {/* Settings Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                      {/* Hourly Rate */}
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>Hourly Rate (₹)</label>
                        <input type="number" value={s.hourlyRate ?? 0}
                          onChange={e => {
                            if (!editing) startEditing(space);
                            setEditingSettings(p => ({ ...p, [space.id]: { ...(p[space.id] || s), hourlyRate: Number(e.target.value) } }));
                          }}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' }}
                        />
                      </div>

                      {/* Slot Duration */}
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>Slot Duration (min)</label>
                        <select value={s.slotDurationMinutes ?? 60}
                          onChange={e => {
                            if (!editing) startEditing(space);
                            setEditingSettings(p => ({ ...p, [space.id]: { ...(p[space.id] || s), slotDurationMinutes: Number(e.target.value) } }));
                          }}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 14, background: '#fff', boxSizing: 'border-box' }}
                        >
                          {[15, 30, 45, 60, 90, 120].map(m => <option key={m} value={m}>{m} min</option>)}
                        </select>
                      </div>

                      {/* Operating Hours Start */}
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>Opens At</label>
                        <input type="time" value={s.operatingHours?.start || '08:00'}
                          onChange={e => {
                            if (!editing) startEditing(space);
                            setEditingSettings(p => ({
                              ...p, [space.id]: {
                                ...(p[space.id] || s),
                                operatingHours: { ...(p[space.id]?.operatingHours || s.operatingHours || {}), start: e.target.value }
                              }
                            }));
                          }}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' }}
                        />
                      </div>

                      {/* Operating Hours End */}
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>Closes At</label>
                        <input type="time" value={s.operatingHours?.end || '22:00'}
                          onChange={e => {
                            if (!editing) startEditing(space);
                            setEditingSettings(p => ({
                              ...p, [space.id]: {
                                ...(p[space.id] || s),
                                operatingHours: { ...(p[space.id]?.operatingHours || s.operatingHours || {}), end: e.target.value }
                              }
                            }));
                          }}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' }}
                        />
                      </div>

                      {/* Advance % */}
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>Advance Payment (%)</label>
                        <input type="number" min={0} max={100} value={s.advancePercentage ?? 50}
                          onChange={e => {
                            if (!editing) startEditing(space);
                            setEditingSettings(p => ({ ...p, [space.id]: { ...(p[space.id] || s), advancePercentage: Number(e.target.value) } }));
                          }}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' }}
                        />
                      </div>

                      {/* Auto Approve */}
                      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: '#1e293b' }}>
                          <input type="checkbox" checked={s.autoApprove || false}
                            onChange={e => {
                              if (!editing) startEditing(space);
                              setEditingSettings(p => ({ ...p, [space.id]: { ...(p[space.id] || s), autoApprove: e.target.checked } }));
                            }}
                            style={{ width: 18, height: 18, accentColor: PRIMARY, cursor: 'pointer' }}
                          />
                          Auto-approve bookings
                        </label>
                      </div>
                    </div>

                    {/* Save button */}
                    {editing && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14, gap: 8 }}>
                        <button onClick={() => setEditingSettings(p => { const n = { ...p }; delete n[space.id]; return n; })}
                          style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                          Cancel
                        </button>
                        <button disabled={isSaving} onClick={() => handleSaveSettings(space.id)}
                          style={{
                            padding: '8px 20px', borderRadius: 8, border: 'none',
                            background: PRIMARY, color: '#fff', fontWeight: 600, fontSize: 13,
                            cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1,
                            display: 'flex', alignItems: 'center', gap: 5
                          }}>
                          {isSaving ? <FaSpinner size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <FaCheck size={12} />} Save Settings
                        </button>
                      </div>
                    )}

                    {/* Booking URL */}
                    <div style={{
                      marginTop: 14, padding: '10px 14px', background: '#f8fafc', borderRadius: 8,
                      fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6
                    }}>
                      <span style={{ fontWeight: 500 }}>Booking URL:</span>
                      <code style={{ color: PRIMARY, fontWeight: 600 }}>{frontendUrl}/book-space/{space.id}</code>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ═══ Reject Modal ═══ */}
      {rejectModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }} onClick={() => setRejectModal(null)}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: 24, maxWidth: 400, width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 700, color: '#1e293b' }}>Reject Booking</h3>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (optional)..."
              rows={3}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e2e8f0',
                fontSize: 14, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box'
              }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' }}>
              <button onClick={() => setRejectModal(null)} style={{
                padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0',
                background: '#fff', color: '#64748b', fontWeight: 600, fontSize: 13, cursor: 'pointer'
              }}>Cancel</button>
              <button onClick={() => handleStatusUpdate(rejectModal.bookingId, 'rejected', rejectReason)}
                disabled={actionLoading === rejectModal.bookingId}
                style={{
                  padding: '8px 20px', borderRadius: 8, border: 'none',
                  background: '#dc2626', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                  opacity: actionLoading === rejectModal.bookingId ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', gap: 5
                }}>
                {actionLoading === rejectModal.bookingId ? <FaSpinner size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <FaTimes size={12} />} Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ QR Code Modal ═══ */}
      {qrModal && (
        <QRCodeModal
          isOpen={true}
          onClose={() => setQrModal(null)}
          restaurantId={qrModal.spaceId}
          restaurantName={qrModal.spaceName}
        />
      )}
    </div>
  );
}

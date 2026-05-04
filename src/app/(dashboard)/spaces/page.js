'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FaCalendarAlt, FaClock, FaUser, FaPhone, FaBuilding, FaCheck, FaTimes,
  FaPlay, FaFlag, FaCog, FaQrcode, FaPlus, FaMapMarkerAlt, FaEnvelope,
  FaSpinner, FaChevronLeft, FaChevronRight, FaEye, FaEllipsisV, FaDoorOpen,
  FaRupeeSign, FaStickyNote, FaExternalLinkAlt, FaCopy, FaShareAlt
} from 'react-icons/fa';
import apiClient from '../../../lib/api';
import QRCodeModal from '../../../components/QRCodeModal';

const PRIMARY = '#0d9488';
const PRIMARY_DARK = '#0f766e';
const PRIMARY_LIGHT = '#ccfbf1';
const PRIMARY_BG = '#f0fdfa';

function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

function statusBadge(s) {
  const map = {
    requested: { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b', label: 'Pending', border: '#fde68a' },
    confirmed: { bg: '#dbeafe', text: '#1e40af', dot: '#3b82f6', label: 'Confirmed', border: '#bfdbfe' },
    in_use: { bg: '#dcfce7', text: '#166534', dot: '#22c55e', label: 'In Use', border: '#bbf7d0' },
    completed: { bg: '#f1f5f9', text: '#475569', dot: '#94a3b8', label: 'Completed', border: '#e2e8f0' },
    cancelled: { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444', label: 'Cancelled', border: '#fecaca' },
    rejected: { bg: '#fce7f3', text: '#9d174d', dot: '#ec4899', label: 'Rejected', border: '#fbcfe8' },
  };
  return map[s] || { bg: '#f1f5f9', text: '#475569', dot: '#94a3b8', label: s, border: '#e2e8f0' };
}

function Shimmer({ w = '100%', h = 20, r = 8, style = {} }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', ...style }} />;
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (dateStr === today.toISOString().split('T')[0]) return 'Today';
  if (dateStr === tomorrow.toISOString().split('T')[0]) return 'Tomorrow';
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

// ═════════════════════════════════════════════════════════
export default function SpacesAdminPage() {
  const [tab, setTab] = useState('bookings');
  const [spaces, setSpaces] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Filters
  const [selectedSpaceId, setSelectedSpaceId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

  // Modals
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [qrModal, setQrModal] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [expandedBooking, setExpandedBooking] = useState(null);

  // Create space form
  const [newSpace, setNewSpace] = useState({ name: '', address: '', city: '', phone: '', email: '', description: '' });
  const [creating, setCreating] = useState(false);

  // Settings edit
  const [editingSettings, setEditingSettings] = useState({});
  const [savingSettings, setSavingSettings] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(null);

  // ─── Responsive ───────────────────────────────────────
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ─── Load spaces ──────────────────────────────────────
  const loadSpaces = useCallback(async () => {
    try {
      const data = await apiClient.getOwnerSpaces();
      setSpaces(data.spaces || []);
      if (data.spaces?.length > 0 && !selectedSpaceId) {
        setSelectedSpaceId(data.spaces[0].id);
      }
    } catch (e) {
      console.error('Failed to load spaces:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSpaces(); }, [loadSpaces]);

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

  // ─── Stats from bookings ────────────────────────────
  const bookingStats = useMemo(() => {
    const pending = bookings.filter(b => b.status === 'requested').length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const inUse = bookings.filter(b => b.status === 'in_use').length;
    const revenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    return { pending, confirmed, inUse, revenue };
  }, [bookings]);

  // ─── Create space ─────────────────────────────────────
  const handleCreateSpace = async () => {
    if (!newSpace.name.trim()) return;
    setCreating(true);
    try {
      await apiClient.createRestaurant({
        name: newSpace.name.trim(),
        address: newSpace.address.trim() || undefined,
        city: newSpace.city.trim() || undefined,
        phone: newSpace.phone.trim() || undefined,
        email: newSpace.email.trim() || undefined,
        description: newSpace.description.trim() || undefined,
        businessType: 'space'
      });
      setCreateModal(false);
      setNewSpace({ name: '', address: '', city: '', phone: '', email: '', description: '' });
      await loadSpaces();
      setTab('settings');
    } catch (e) {
      alert(e.message || 'Failed to create space');
    } finally {
      setCreating(false);
    }
  };

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

  const copyUrl = (url, id) => {
    navigator.clipboard.writeText(url).catch(() => {});
    setCopiedUrl(id);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const dateNav = (delta) => {
    const d = new Date(dateFilter);
    d.setDate(d.getDate() + delta);
    setDateFilter(d.toISOString().split('T')[0]);
  };

  const pendingCount = bookings.filter(b => b.status === 'requested').length;

  // Header subtitle
  const headerSubtitle = useMemo(() => {
    if (tab === 'bookings') {
      if (bookingsLoading) return '';
      if (bookingStats.pending > 0) return `${bookingStats.pending} pending approval${bookingStats.pending > 1 ? 's' : ''}`;
      if (bookings.length > 0) return `${bookings.length} booking${bookings.length > 1 ? 's' : ''} for ${formatDate(dateFilter)}`;
      return 'All clear today';
    }
    return `${spaces.length} space${spaces.length !== 1 ? 's' : ''} configured`;
  }, [tab, bookingsLoading, bookingStats, bookings.length, dateFilter, spaces.length]);

  // ═════════════════════════════════════════════════════════
  return (
    <div style={{ padding: isMobile ? '16px 12px' : '24px 20px', maxWidth: 1100, margin: '0 auto' }}>
      <style>{`
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(100%); } to { opacity: 1; transform: translateY(0); } }
        .sp-input { width: 100%; padding: 10px 12px; border-radius: 10px; border: 1.5px solid #e2e8f0; font-size: 14px; color: #1e293b; background: #fff; box-sizing: border-box; transition: border 0.15s, box-shadow 0.15s; font-family: inherit; }
        .sp-input:focus { outline: none; border-color: ${PRIMARY}; box-shadow: 0 0 0 3px ${PRIMARY_LIGHT}; }
        .sp-btn { padding: 8px 16px; border-radius: 10px; border: none; font-weight: 600; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.15s; }
        .sp-btn:active { transform: scale(0.97); }
        .sp-card { background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.04); animation: fadeIn 0.3s ease; }
        .sp-label { font-size: 12px; font-weight: 600; color: #64748b; display: block; margin-bottom: 5px; }
        .sp-booking-card { transition: all 0.15s ease; }
        .sp-booking-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); transform: translateY(-1px); }
      `}</style>

      {/* ─── Header ─── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: 20, flexWrap: 'wrap', gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, background: PRIMARY_BG,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FaDoorOpen size={20} color={PRIMARY} />
          </div>
          <div>
            <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: '#1e293b', margin: 0 }}>Spaces</h1>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
              {headerSubtitle}
            </p>
          </div>
        </div>
        <button onClick={() => setCreateModal(true)} className="sp-btn" style={{
          background: PRIMARY, color: '#fff', padding: '10px 18px', fontSize: 14, borderRadius: 12
        }}>
          <FaPlus size={12} /> Add Space
        </button>
      </div>

      {/* ─── Tabs ─── */}
      <div style={{
        display: 'flex', gap: 2, marginBottom: 20, background: '#f1f5f9',
        borderRadius: 14, padding: 3, position: 'relative'
      }}>
        {[
          { id: 'bookings', label: 'Bookings', icon: FaCalendarAlt, badge: pendingCount },
          { id: 'settings', label: 'Settings', icon: FaCog }
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: isMobile ? '10px 8px' : '11px 20px', borderRadius: 12, border: 'none',
            background: tab === t.id ? '#fff' : 'transparent',
            color: tab === t.id ? PRIMARY : '#64748b',
            fontWeight: 600, fontSize: isMobile ? 13 : 14, cursor: 'pointer',
            boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'all 0.2s'
          }}>
            <t.icon size={14} />
            {t.label}
            {t.badge > 0 && (
              <span style={{
                background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700,
                padding: '1px 6px', borderRadius: 10, marginLeft: 2
              }}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* BOOKINGS TAB */}
      {/* ═══════════════════════════════════════════════════ */}
      {tab === 'bookings' && (
        <>
          {/* Filters */}
          <div style={{
            display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center'
          }}>
            {/* Date nav */}
            <div style={{
              display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 12,
              border: '1.5px solid #e2e8f0', overflow: 'hidden', flex: isMobile ? '1 1 100%' : '0 0 auto'
            }}>
              <button onClick={() => dateNav(-1)} style={{
                padding: '9px 12px', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b'
              }}><FaChevronLeft size={12} /></button>
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                  {formatDate(dateFilter)}
                </span>
                <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
                  style={{
                    border: 'none', fontSize: 13, color: '#94a3b8', background: 'transparent',
                    cursor: 'pointer', width: 20, padding: 0, opacity: 0.6
                  }}
                />
              </div>
              <button onClick={() => dateNav(1)} style={{
                padding: '9px 12px', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b'
              }}><FaChevronRight size={12} /></button>
            </div>

            {/* Quick date buttons */}
            <div style={{ display: 'flex', gap: 4 }}>
              {[
                { label: 'Today', date: new Date().toISOString().split('T')[0] },
                { label: 'Tomorrow', date: (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; })() }
              ].map(d => (
                <button key={d.label} onClick={() => setDateFilter(d.date)} className="sp-btn" style={{
                  background: dateFilter === d.date ? PRIMARY_LIGHT : '#fff',
                  color: dateFilter === d.date ? PRIMARY_DARK : '#64748b',
                  border: dateFilter === d.date ? `1.5px solid ${PRIMARY}` : '1.5px solid #e2e8f0',
                  padding: '7px 12px', borderRadius: 10
                }}>{d.label}</button>
              ))}
            </div>

            {/* Space & Status filters */}
            <div style={{ display: 'flex', gap: 6, flex: isMobile ? '1 1 100%' : '0 0 auto' }}>
              {spaces.length > 1 && (
                <select value={selectedSpaceId} onChange={e => setSelectedSpaceId(e.target.value)} className="sp-input"
                  style={{ flex: 1, padding: '8px 10px', borderRadius: 10 }}>
                  <option value="">All Spaces</option>
                  {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              )}
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="sp-input"
                style={{ flex: 1, padding: '8px 10px', borderRadius: 10 }}>
                <option value="">All Status</option>
                {['requested', 'confirmed', 'in_use', 'completed', 'cancelled', 'rejected'].map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Stats Bar */}
          {!bookingsLoading && bookings.length > 0 && (
            <div style={{
              display: 'flex', gap: 8, marginBottom: 16,
              overflowX: 'auto', paddingBottom: 4,
              WebkitOverflowScrolling: 'touch'
            }}>
              {[
                { label: 'Pending', count: bookingStats.pending, bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
                { label: 'Confirmed', count: bookingStats.confirmed, bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' },
                { label: 'In Use', count: bookingStats.inUse, bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
                { label: 'Revenue', count: `₹${bookingStats.revenue.toLocaleString('en-IN')}`, bg: PRIMARY_BG, text: PRIMARY_DARK, border: PRIMARY_LIGHT },
              ].map(s => (
                <div key={s.label} style={{
                  padding: '8px 16px', borderRadius: 12, background: s.bg,
                  border: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', gap: 8,
                  whiteSpace: 'nowrap', flexShrink: 0
                }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: s.text, opacity: 0.8 }}>{s.label}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: s.text }}>{s.count}</span>
                </div>
              ))}
            </div>
          )}

          {/* Bookings List */}
          {bookingsLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="sp-card" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <Shimmer w={48} h={48} r={12} />
                    <div style={{ flex: 1 }}>
                      <Shimmer w="60%" h={16} />
                      <Shimmer w="35%" h={13} style={{ marginTop: 6 }} />
                    </div>
                    <Shimmer w={72} h={26} r={20} />
                  </div>
                </div>
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="sp-card" style={{ textAlign: 'center', padding: isMobile ? '40px 20px' : '60px 40px' }}>
              <div style={{
                width: 64, height: 64, borderRadius: 20, background: '#f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
              }}>
                <FaCalendarAlt size={28} color="#cbd5e1" />
              </div>
              <div style={{ fontSize: 17, fontWeight: 600, color: '#475569' }}>
                {dateFilter === new Date().toISOString().split('T')[0]
                  ? 'Your schedule is clear'
                  : `No bookings for ${formatDate(dateFilter)}`
                }
              </div>
              <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 6 }}>
                {spaces.length === 0
                  ? 'Create a space first to start receiving bookings'
                  : dateFilter === new Date().toISOString().split('T')[0]
                    ? 'No bookings scheduled for today'
                    : 'Try selecting a different date'
                }
              </div>
              {spaces.length === 0 ? (
                <button onClick={() => setCreateModal(true)} className="sp-btn" style={{
                  background: PRIMARY, color: '#fff', marginTop: 16, padding: '10px 20px', borderRadius: 12
                }}>
                  <FaPlus size={12} /> Create Your First Space
                </button>
              ) : (
                <button onClick={() => {
                  const url = `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://dineopen.com'}/book-space/${spaces[0]?.id}`;
                  navigator.clipboard.writeText(url).catch(() => {});
                  setCopiedUrl('empty-cta');
                  setTimeout(() => setCopiedUrl(null), 2000);
                }} className="sp-btn" style={{
                  background: '#fff', color: PRIMARY, border: `1.5px solid ${PRIMARY}`,
                  marginTop: 16, padding: '10px 20px', borderRadius: 12
                }}>
                  <FaShareAlt size={12} /> {copiedUrl === 'empty-cta' ? 'Link Copied!' : 'Share Booking Link'}
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {bookings.map(b => {
                const sb = statusBadge(b.status);
                const isActioning = actionLoading === b.id;
                const isExpanded = expandedBooking === b.id;
                const initial = (b.customerInfo?.name || '?')[0].toUpperCase();

                return (
                  <div key={b.id} className="sp-card sp-booking-card" style={{
                    overflow: 'hidden',
                    borderLeft: `4px solid ${sb.dot}`
                  }}>
                    {/* Main row — always visible */}
                    <div
                      onClick={() => isMobile && setExpandedBooking(isExpanded ? null : b.id)}
                      style={{
                        padding: isMobile ? '12px 14px' : '14px 18px',
                        cursor: isMobile ? 'pointer' : 'default',
                        display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 14
                      }}
                    >
                      {/* Customer avatar (desktop only) */}
                      {!isMobile && (
                        <div style={{
                          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                          background: `linear-gradient(135deg, ${PRIMARY_LIGHT}, ${PRIMARY_BG})`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 16, fontWeight: 700, color: PRIMARY_DARK
                        }}>
                          {initial}
                        </div>
                      )}

                      {/* Time block */}
                      <div style={{
                        width: isMobile ? 52 : 64, flexShrink: 0, textAlign: 'center',
                        padding: '8px 4px', borderRadius: 12, background: PRIMARY_BG
                      }}>
                        <div style={{ fontSize: isMobile ? 13 : 15, fontWeight: 700, color: PRIMARY_DARK, lineHeight: 1.1 }}>
                          {formatTime(b.startTime)}
                        </div>
                        <div style={{ fontSize: 10, color: '#94a3b8', margin: '2px 0' }}>to</div>
                        <div style={{ fontSize: isMobile ? 11 : 12, fontWeight: 600, color: '#64748b' }}>
                          {formatTime(b.endTime)}
                        </div>
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: isMobile ? 14 : 15, fontWeight: 600, color: '#1e293b' }}>
                            {b.customerInfo?.name || 'Unknown'}
                          </span>
                          {b.customerInfo?.company && (
                            <span style={{
                              fontSize: 11, color: '#64748b', background: '#f1f5f9',
                              padding: '1px 8px', borderRadius: 6
                            }}>{b.customerInfo.company}</span>
                          )}
                        </div>
                        {!isMobile && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 3, fontSize: 13, color: '#94a3b8' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <FaPhone size={10} /> {b.customerInfo?.phone}
                            </span>
                            {b.customerInfo?.email && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <FaEnvelope size={10} /> {b.customerInfo.email}
                              </span>
                            )}
                            <span>{b.duration}h</span>
                          </div>
                        )}
                      </div>

                      {/* Right side */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px',
                          borderRadius: 20, background: sb.bg, fontSize: 11, fontWeight: 700, color: sb.text
                        }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: sb.dot }} />
                          {sb.label}
                        </div>
                        <div style={{ fontSize: isMobile ? 15 : 16, fontWeight: 700, color: PRIMARY }}>
                          ₹{b.totalAmount}
                        </div>
                      </div>
                    </div>

                    {/* Expanded details (mobile) or always show actions (desktop) */}
                    {((!isMobile) || isExpanded) && (
                      <div style={{
                        padding: isMobile ? '0 14px 14px' : '0 18px 14px',
                        animation: isMobile ? 'fadeIn 0.2s ease' : 'none'
                      }}>
                        {/* Mobile-only details */}
                        {isMobile && (
                          <div style={{
                            padding: '10px 12px', background: '#f8fafc', borderRadius: 10,
                            marginBottom: 10, fontSize: 13, color: '#64748b',
                            display: 'flex', flexDirection: 'column', gap: 4
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <FaPhone size={10} color="#94a3b8" /> {b.customerInfo?.phone}
                            </div>
                            {b.customerInfo?.email && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <FaEnvelope size={10} color="#94a3b8" /> {b.customerInfo.email}
                              </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <FaClock size={10} color="#94a3b8" /> {b.duration} hour{b.duration !== 1 ? 's' : ''}
                            </div>
                          </div>
                        )}

                        {/* Amenities */}
                        {b.amenities?.length > 0 && (
                          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {b.amenities.map((a, i) => (
                              <span key={i} style={{
                                background: '#f1f5f9', padding: '2px 8px', borderRadius: 6
                              }}>{a.name} ×{a.quantity}</span>
                            ))}
                          </div>
                        )}

                        {/* Notes */}
                        {b.notes && (
                          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8, fontStyle: 'italic', display: 'flex', gap: 4 }}>
                            <FaStickyNote size={10} color="#cbd5e1" style={{ marginTop: 2, flexShrink: 0 }} />
                            {b.notes}
                          </div>
                        )}

                        {/* Rejection reason */}
                        {b.rejectionReason && (
                          <div style={{
                            fontSize: 12, color: '#dc2626', background: '#fef2f2', padding: '6px 10px',
                            borderRadius: 8, marginBottom: 8
                          }}>Reason: {b.rejectionReason}</div>
                        )}

                        {/* Action buttons */}
                        {(b.status === 'requested' || b.status === 'confirmed' || b.status === 'in_use') && (
                          <div style={{
                            display: 'flex', gap: 8, paddingTop: 10,
                            borderTop: '1px solid #f1f5f9', flexWrap: 'wrap'
                          }}>
                            {b.status === 'requested' && (
                              <>
                                <button disabled={isActioning} onClick={() => handleStatusUpdate(b.id, 'confirmed')}
                                  className="sp-btn" style={{
                                    background: '#059669', color: '#fff', flex: isMobile ? 1 : 'none',
                                    justifyContent: 'center', padding: '9px 16px', opacity: isActioning ? 0.6 : 1
                                  }}>
                                  {isActioning ? <FaSpinner size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <FaCheck size={12} />}
                                  Approve
                                </button>
                                <button disabled={isActioning}
                                  onClick={() => { setRejectModal({ bookingId: b.id }); setRejectReason(''); }}
                                  className="sp-btn" style={{
                                    background: '#fff', color: '#dc2626', border: '1.5px solid #fecaca',
                                    flex: isMobile ? 1 : 'none', justifyContent: 'center', padding: '9px 16px'
                                  }}>
                                  <FaTimes size={12} /> Reject
                                </button>
                              </>
                            )}
                            {b.status === 'confirmed' && (
                              <>
                                <button disabled={isActioning} onClick={() => handleStatusUpdate(b.id, 'in_use')}
                                  className="sp-btn" style={{
                                    background: '#2563eb', color: '#fff', flex: isMobile ? 1 : 'none',
                                    justifyContent: 'center', padding: '9px 16px', opacity: isActioning ? 0.6 : 1
                                  }}>
                                  <FaPlay size={10} /> Mark In Use
                                </button>
                                <button disabled={isActioning} onClick={() => handleStatusUpdate(b.id, 'cancelled')}
                                  className="sp-btn" style={{
                                    background: '#fff', color: '#64748b', border: '1.5px solid #e2e8f0',
                                    flex: isMobile ? 1 : 'none', justifyContent: 'center', padding: '9px 16px'
                                  }}>
                                  <FaTimes size={12} /> Cancel
                                </button>
                              </>
                            )}
                            {b.status === 'in_use' && (
                              <button disabled={isActioning} onClick={() => handleStatusUpdate(b.id, 'completed')}
                                className="sp-btn" style={{
                                  background: '#475569', color: '#fff', flex: isMobile ? 1 : 'none',
                                  justifyContent: 'center', padding: '9px 16px', opacity: isActioning ? 0.6 : 1
                                }}>
                                <FaFlag size={10} /> Complete
                              </button>
                            )}
                          </div>
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

      {/* ═══════════════════════════════════════════════════ */}
      {/* SETTINGS TAB */}
      {/* ═══════════════════════════════════════════════════ */}
      {tab === 'settings' && (
        <>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[1, 2].map(i => (
                <div key={i} className="sp-card" style={{ padding: 20 }}>
                  <Shimmer w="40%" h={22} />
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginTop: 16 }}>
                    <Shimmer h={44} /><Shimmer h={44} />
                    <Shimmer h={44} /><Shimmer h={44} />
                  </div>
                </div>
              ))}
            </div>
          ) : spaces.length === 0 ? (
            <div className="sp-card" style={{ textAlign: 'center', padding: isMobile ? '48px 20px' : '64px 40px' }}>
              <div style={{
                width: 80, height: 80, borderRadius: 24, background: PRIMARY_BG,
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
              }}>
                <FaDoorOpen size={36} color={PRIMARY} />
              </div>
              <div style={{ fontSize: 19, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>No spaces yet</div>
              <div style={{ fontSize: 14, color: '#94a3b8', maxWidth: 320, margin: '0 auto 20px' }}>
                Create your first space to start accepting bookings from tenants and visitors
              </div>
              <button onClick={() => setCreateModal(true)} className="sp-btn" style={{
                background: PRIMARY, color: '#fff', padding: '12px 24px', fontSize: 15, borderRadius: 14
              }}>
                <FaPlus size={13} /> Create Space
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {spaces.map(space => {
                const editing = editingSettings[space.id];
                const s = editing || space.spaceSettings || {};
                const isSaving = savingSettings === space.id;
                const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://dineopen.com';
                const bookingUrl = `${frontendUrl}/book-space/${space.id}`;

                return (
                  <div key={space.id} className="sp-card" style={{ overflow: 'hidden' }}>
                    {/* ── Space Card Header ── */}
                    <div style={{
                      padding: isMobile ? '16px 14px' : '18px 20px',
                      background: `linear-gradient(135deg, ${PRIMARY_BG} 0%, #fff 100%)`,
                      borderBottom: '1px solid #e2e8f0'
                    }}>
                      <div style={{
                        display: 'flex', alignItems: 'flex-start', gap: 14
                      }}>
                        {/* Space image placeholder */}
                        <div style={{
                          width: 72, height: 72, borderRadius: 14, flexShrink: 0,
                          background: space.image
                            ? `url(${space.image}) center/cover no-repeat`
                            : `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                          {!space.image && <FaDoorOpen size={28} color="#fff" />}
                        </div>

                        {/* Name + description + pills */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: '#1e293b' }}>
                            {space.name}
                          </div>
                          {(space.description || space.address) && (
                            <div style={{
                              fontSize: 13, color: '#64748b', marginTop: 2,
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                            }}>
                              {space.description || `${space.address}${space.city ? `, ${space.city}` : ''}`}
                            </div>
                          )}
                          {/* Rate + hours pills */}
                          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                            {(s.hourlyRate > 0) && (
                              <span style={{
                                fontSize: 12, fontWeight: 600, color: PRIMARY_DARK, background: PRIMARY_LIGHT,
                                padding: '3px 10px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 3
                              }}>
                                <FaRupeeSign size={10} />{s.hourlyRate}/hr
                              </span>
                            )}
                            {s.operatingHours && (
                              <span style={{
                                fontSize: 12, fontWeight: 500, color: '#475569', background: '#f1f5f9',
                                padding: '3px 10px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4
                              }}>
                                <FaClock size={10} />
                                {formatTime(s.operatingHours.start)} – {formatTime(s.operatingHours.end)}
                              </span>
                            )}
                            {s.autoApprove && (
                              <span style={{
                                fontSize: 11, fontWeight: 600, color: '#059669', background: '#dcfce7',
                                padding: '3px 8px', borderRadius: 8
                              }}>Auto-approve</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons row */}
                      <div style={{
                        display: 'flex', gap: 6, marginTop: 14, paddingTop: 14,
                        borderTop: '1px solid #e2e8f0', flexWrap: 'wrap'
                      }}>
                        <button onClick={() => setQrModal({ spaceId: space.id, spaceName: space.name })}
                          className="sp-btn" style={{
                            background: '#fff', color: '#475569', border: '1.5px solid #e2e8f0', padding: '7px 12px'
                          }}>
                          <FaQrcode size={13} /> {!isMobile && 'QR Code'}
                        </button>
                        <a href={`/spaces/availability/${space.id}`} target="_blank" rel="noopener noreferrer"
                          className="sp-btn" style={{
                            background: '#fff', color: '#475569', border: '1.5px solid #e2e8f0',
                            textDecoration: 'none', padding: '7px 12px'
                          }}>
                          <FaEye size={13} /> {!isMobile && 'Display'}
                        </a>
                        <a href={`/book-space/${space.id}`} target="_blank" rel="noopener noreferrer"
                          className="sp-btn" style={{
                            background: PRIMARY, color: '#fff', textDecoration: 'none', padding: '7px 12px'
                          }}>
                          <FaExternalLinkAlt size={11} /> {!isMobile && 'Book Page'}
                        </a>
                        <button onClick={() => copyUrl(bookingUrl, `share-${space.id}`)}
                          className="sp-btn" style={{
                            background: '#fff', color: '#475569', border: '1.5px solid #e2e8f0', padding: '7px 12px',
                            marginLeft: 'auto'
                          }}>
                          {copiedUrl === `share-${space.id}` ? <><FaCheck size={11} /> Copied</> : <><FaCopy size={11} /> Copy URL</>}
                        </button>
                      </div>
                    </div>

                    {/* ── Settings Form ── */}
                    <div style={{ padding: isMobile ? '14px' : '18px 20px' }}>
                      {/* Section: Pricing & Booking */}
                      <div style={{
                        fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase',
                        letterSpacing: 0.5, marginBottom: 10
                      }}>Pricing & Booking</div>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
                        gap: isMobile ? 10 : 14,
                        marginBottom: 18
                      }}>
                        {/* Hourly Rate */}
                        <div>
                          <label className="sp-label">Hourly Rate (₹)</label>
                          <input type="number" value={s.hourlyRate ?? 0} className="sp-input"
                            onChange={e => {
                              if (!editing) startEditing(space);
                              setEditingSettings(p => ({ ...p, [space.id]: { ...(p[space.id] || s), hourlyRate: Number(e.target.value) } }));
                            }}
                          />
                        </div>

                        {/* Slot Duration */}
                        <div>
                          <label className="sp-label">Slot Duration</label>
                          <select value={s.slotDurationMinutes ?? 60} className="sp-input"
                            onChange={e => {
                              if (!editing) startEditing(space);
                              setEditingSettings(p => ({ ...p, [space.id]: { ...(p[space.id] || s), slotDurationMinutes: Number(e.target.value) } }));
                            }}>
                            {[15, 30, 45, 60, 90, 120].map(m => <option key={m} value={m}>{m} min</option>)}
                          </select>
                        </div>

                        {/* Advance % */}
                        <div>
                          <label className="sp-label">Advance (%)</label>
                          <input type="number" min={0} max={100} value={s.advancePercentage ?? 50} className="sp-input"
                            onChange={e => {
                              if (!editing) startEditing(space);
                              setEditingSettings(p => ({ ...p, [space.id]: { ...(p[space.id] || s), advancePercentage: Number(e.target.value) } }));
                            }}
                          />
                        </div>

                        {/* Auto Approve */}
                        <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 2 }}>
                          <label style={{
                            display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                            fontSize: 14, color: '#1e293b', padding: '10px 0'
                          }}>
                            <div style={{
                              width: 42, height: 24, borderRadius: 12, position: 'relative',
                              background: (s.autoApprove) ? PRIMARY : '#cbd5e1', transition: 'background 0.2s',
                              cursor: 'pointer'
                            }} onClick={(e) => {
                              e.preventDefault();
                              if (!editing) startEditing(space);
                              setEditingSettings(p => ({ ...p, [space.id]: { ...(p[space.id] || s), autoApprove: !(p[space.id]?.autoApprove ?? s.autoApprove) } }));
                            }}>
                              <div style={{
                                width: 20, height: 20, borderRadius: '50%', background: '#fff',
                                position: 'absolute', top: 2,
                                left: (s.autoApprove) ? 20 : 2,
                                transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                              }} />
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 500 }}>Auto-approve</span>
                          </label>
                        </div>
                      </div>

                      {/* Section: Operating Hours */}
                      <div style={{
                        fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase',
                        letterSpacing: 0.5, marginBottom: 10
                      }}>Operating Hours</div>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: isMobile ? 10 : 14
                      }}>
                        {/* Opens At */}
                        <div>
                          <label className="sp-label">Opens At</label>
                          <input type="time" value={s.operatingHours?.start || '08:00'} className="sp-input"
                            onChange={e => {
                              if (!editing) startEditing(space);
                              setEditingSettings(p => ({
                                ...p, [space.id]: {
                                  ...(p[space.id] || s),
                                  operatingHours: { ...(p[space.id]?.operatingHours || s.operatingHours || {}), start: e.target.value }
                                }
                              }));
                            }}
                          />
                        </div>

                        {/* Closes At */}
                        <div>
                          <label className="sp-label">Closes At</label>
                          <input type="time" value={s.operatingHours?.end || '22:00'} className="sp-input"
                            onChange={e => {
                              if (!editing) startEditing(space);
                              setEditingSettings(p => ({
                                ...p, [space.id]: {
                                  ...(p[space.id] || s),
                                  operatingHours: { ...(p[space.id]?.operatingHours || s.operatingHours || {}), end: e.target.value }
                                }
                              }));
                            }}
                          />
                        </div>
                      </div>

                      {/* Save / Cancel */}
                      {editing && (
                        <div style={{
                          display: 'flex', justifyContent: 'flex-end', marginTop: 16, gap: 8,
                          paddingTop: 14, borderTop: '1px solid #f1f5f9'
                        }}>
                          <button onClick={() => setEditingSettings(p => { const n = { ...p }; delete n[space.id]; return n; })}
                            className="sp-btn" style={{
                              background: '#fff', color: '#64748b', border: '1.5px solid #e2e8f0', padding: '9px 16px'
                            }}>Cancel</button>
                          <button disabled={isSaving} onClick={() => handleSaveSettings(space.id)}
                            className="sp-btn" style={{
                              background: PRIMARY, color: '#fff', padding: '9px 20px',
                              opacity: isSaving ? 0.7 : 1
                            }}>
                            {isSaving ? <FaSpinner size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <FaCheck size={12} />}
                            Save
                          </button>
                        </div>
                      )}

                      {/* Booking URL — more prominent */}
                      <div style={{
                        marginTop: 16, padding: '12px 16px', background: '#f8fafc', borderRadius: 12,
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6
                        }}>
                          <FaShareAlt size={12} color="#94a3b8" />
                          <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Booking URL</span>
                        </div>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 8
                        }}>
                          <code style={{
                            flex: 1, fontSize: 13, color: PRIMARY_DARK, fontWeight: 600,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            background: '#fff', padding: '8px 12px', borderRadius: 8,
                            border: '1px solid #e2e8f0', fontFamily: 'monospace'
                          }}>{bookingUrl}</code>
                          <button onClick={() => copyUrl(bookingUrl, space.id)}
                            className="sp-btn" style={{
                              background: copiedUrl === space.id ? '#dcfce7' : PRIMARY,
                              color: copiedUrl === space.id ? '#166534' : '#fff',
                              padding: '8px 16px', fontSize: 13, borderRadius: 10, flexShrink: 0
                            }}>
                            {copiedUrl === space.id ? <><FaCheck size={11} /> Copied</> : <><FaCopy size={11} /> Copy</>}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ═══ Create Space Modal ═══ */}
      {createModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
          zIndex: 1000, display: 'flex',
          alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center'
        }} onClick={() => setCreateModal(false)}>
          <div style={{
            background: '#fff', width: '100%', maxWidth: 480,
            borderRadius: isMobile ? '20px 20px 0 0' : 20,
            padding: isMobile ? '20px 16px 32px' : '28px 28px',
            maxHeight: '90vh', overflowY: 'auto',
            animation: isMobile ? 'slideUp 0.3s ease' : 'fadeIn 0.2s ease',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)'
          }} onClick={e => e.stopPropagation()}>
            {/* Drag handle on mobile */}
            {isMobile && (
              <div style={{ width: 36, height: 4, borderRadius: 2, background: '#e2e8f0', margin: '0 auto 16px' }} />
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, background: PRIMARY_BG,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <FaDoorOpen size={18} color={PRIMARY} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1e293b' }}>Create New Space</h2>
                <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>Add a bookable venue or meeting room</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="sp-label">Space Name *</label>
                <input value={newSpace.name} onChange={e => setNewSpace(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Conference Room A" className="sp-input" autoFocus />
              </div>
              <div>
                <label className="sp-label">Description</label>
                <input value={newSpace.description} onChange={e => setNewSpace(p => ({ ...p, description: e.target.value }))}
                  placeholder="50-seater hall with projector" className="sp-input" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="sp-label">City</label>
                  <input value={newSpace.city} onChange={e => setNewSpace(p => ({ ...p, city: e.target.value }))}
                    placeholder="Mumbai" className="sp-input" />
                </div>
                <div>
                  <label className="sp-label">Phone</label>
                  <input value={newSpace.phone} onChange={e => setNewSpace(p => ({ ...p, phone: e.target.value }))}
                    placeholder="9876543210" className="sp-input" type="tel" />
                </div>
              </div>
              <div>
                <label className="sp-label">Address</label>
                <input value={newSpace.address} onChange={e => setNewSpace(p => ({ ...p, address: e.target.value }))}
                  placeholder="Building name, Floor, Area" className="sp-input" />
              </div>
              <div>
                <label className="sp-label">Email</label>
                <input value={newSpace.email} onChange={e => setNewSpace(p => ({ ...p, email: e.target.value }))}
                  placeholder="admin@building.com" className="sp-input" type="email" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => setCreateModal(false)} className="sp-btn" style={{
                flex: 1, background: '#f1f5f9', color: '#64748b', padding: '12px 16px',
                justifyContent: 'center', fontSize: 14, borderRadius: 12
              }}>Cancel</button>
              <button disabled={!newSpace.name.trim() || creating} onClick={handleCreateSpace}
                className="sp-btn" style={{
                  flex: 2, background: (!newSpace.name.trim() || creating) ? '#94a3b8' : PRIMARY,
                  color: '#fff', padding: '12px 16px', justifyContent: 'center',
                  fontSize: 14, borderRadius: 12
                }}>
                {creating ? <FaSpinner size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <FaPlus size={12} />}
                {creating ? 'Creating...' : 'Create Space'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Reject Modal ═══ */}
      {rejectModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
          zIndex: 1000, display: 'flex',
          alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center'
        }} onClick={() => setRejectModal(null)}>
          <div style={{
            background: '#fff', maxWidth: 420, width: '100%',
            borderRadius: isMobile ? '20px 20px 0 0' : 20,
            padding: isMobile ? '20px 16px 32px' : '24px',
            animation: isMobile ? 'slideUp 0.3s ease' : 'fadeIn 0.2s ease',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)'
          }} onClick={e => e.stopPropagation()}>
            {isMobile && (
              <div style={{ width: 36, height: 4, borderRadius: 2, background: '#e2e8f0', margin: '0 auto 16px' }} />
            )}
            <h3 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 700, color: '#1e293b' }}>Reject Booking</h3>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (optional)..." rows={3} className="sp-input"
              style={{ resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => setRejectModal(null)} className="sp-btn" style={{
                flex: 1, background: '#f1f5f9', color: '#64748b', padding: '11px 16px',
                justifyContent: 'center', borderRadius: 12
              }}>Cancel</button>
              <button onClick={() => handleStatusUpdate(rejectModal.bookingId, 'rejected', rejectReason)}
                disabled={actionLoading === rejectModal.bookingId}
                className="sp-btn" style={{
                  flex: 1, background: '#dc2626', color: '#fff', padding: '11px 16px',
                  justifyContent: 'center', borderRadius: 12,
                  opacity: actionLoading === rejectModal.bookingId ? 0.7 : 1
                }}>
                {actionLoading === rejectModal.bookingId
                  ? <FaSpinner size={12} style={{ animation: 'spin 1s linear infinite' }} />
                  : <FaTimes size={12} />}
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ QR Code Modal ═══ */}
      {qrModal && (
        <QRCodeModal isOpen={true} onClose={() => setQrModal(null)}
          restaurantId={qrModal.spaceId} restaurantName={qrModal.spaceName} />
      )}
    </div>
  );
}

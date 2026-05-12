'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FaParking, FaPlus, FaTimes, FaEdit, FaTrash, FaToggleOn, FaToggleOff,
  FaThLarge, FaCar, FaChargingStation, FaWheelchair, FaStar, FaLayerGroup,
  FaSave, FaArrowLeft, FaSearch, FaExclamationTriangle
} from 'react-icons/fa';
import Link from 'next/link';
import apiClient from '../../../../lib/api';

const PRIMARY = '#0369a1';
const PRIMARY_DARK = '#075985';
const PRIMARY_LIGHT = '#e0f2fe';
const BG = '#f8fafc';

const ZONE_TYPES = [
  { value: 'general', label: 'General', icon: FaCar },
  { value: 'vip', label: 'VIP', icon: FaStar },
  { value: 'reserved', label: 'Reserved', icon: FaParking },
  { value: 'handicapped', label: 'Handicapped', icon: FaWheelchair },
  { value: 'ev_charging', label: 'EV Charging', icon: FaChargingStation },
];

const SLOT_STATUSES = {
  available: { bg: '#dcfce7', text: '#166534', border: '#bbf7d0', label: 'Available' },
  occupied: { bg: '#fee2e2', text: '#991b1b', border: '#fecaca', label: 'Occupied' },
  maintenance: { bg: '#fef9c3', text: '#854d0e', border: '#fde68a', label: 'Maintenance' },
  reserved: { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe', label: 'Reserved' },
};

const SLOT_TYPES = ['standard', 'compact', 'large', 'handicapped', 'ev_charging'];

function Shimmer({ w = '100%', h = 20, r = 8, style = {} }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', ...style }} />;
}

function ZoneTypeIcon({ type, size = 14 }) {
  const found = ZONE_TYPES.find(z => z.value === type);
  const Icon = found ? found.icon : FaCar;
  return <Icon size={size} />;
}

// ================================================================
export default function ParkingZonesPage() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [restaurantId, setRestaurantId] = useState(null);
  const [slotTrackingMode, setSlotTrackingMode] = useState(null);

  // Zone modal
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [zoneForm, setZoneForm] = useState({ zoneName: '', zoneNameAr: '', zoneCode: '', floor: '', zoneType: 'general', totalSlots: '' });
  const [saving, setSaving] = useState(false);

  // Selected zone for slot management
  const [selectedZone, setSelectedZone] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Bulk create slots
  const [bulkForm, setBulkForm] = useState({ prefix: '', startNumber: 1, count: 10, slotType: 'standard' });
  const [bulkCreating, setBulkCreating] = useState(false);

  // Slot editing
  const [editingSlot, setEditingSlot] = useState(null);
  const [slotEditForm, setSlotEditForm] = useState({ status: '', slotType: '' });
  const [slotSaving, setSlotSaving] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // --- Responsive ---
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // --- Load restaurantId ---
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.restaurantId) setRestaurantId(user.restaurantId);
    } catch {}
  }, []);

  // --- Load parking config ---
  useEffect(() => {
    if (!restaurantId) return;
    const loadConfig = async () => {
      try {
        const res = await apiClient.getParkingConfig(restaurantId);
        setSlotTrackingMode(res?.slotTrackingMode || res?.config?.slotTrackingMode || 'individual_slots');
      } catch {
        setSlotTrackingMode('individual_slots');
      }
    };
    loadConfig();
  }, [restaurantId]);

  // --- Load zones ---
  const loadZones = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const res = await apiClient.getParkingZones(restaurantId);
      setZones(res?.zones || res || []);
    } catch (e) {
      console.error('Failed to load zones:', e);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => { loadZones(); }, [loadZones]);

  // --- Load slots for a zone ---
  const loadSlots = useCallback(async (zoneId) => {
    if (!restaurantId || !zoneId) return;
    setSlotsLoading(true);
    try {
      const res = await apiClient.getParkingSlots(restaurantId, { zoneId });
      setSlots(res?.slots || res || []);
    } catch (e) {
      console.error('Failed to load slots:', e);
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    if (selectedZone && slotTrackingMode === 'individual_slots') {
      loadSlots(selectedZone.id || selectedZone._id);
    }
  }, [selectedZone, loadSlots, slotTrackingMode]);

  // --- Zone CRUD ---
  const openCreateZone = () => {
    setEditingZone(null);
    setZoneForm({ zoneName: '', zoneNameAr: '', zoneCode: '', floor: '', zoneType: 'general', totalSlots: '' });
    setShowZoneModal(true);
  };

  const openEditZone = (zone) => {
    setEditingZone(zone);
    setZoneForm({
      zoneName: zone.zoneName || zone.name || '',
      zoneNameAr: zone.zoneNameAr || '',
      zoneCode: zone.zoneCode || zone.code || '',
      floor: zone.floor ?? '',
      zoneType: zone.zoneType || zone.type || 'general',
      totalSlots: zone.totalSlots ?? '',
    });
    setShowZoneModal(true);
  };

  const handleSaveZone = async () => {
    if (!zoneForm.zoneName.trim() || !zoneForm.zoneCode.trim()) return;
    setSaving(true);
    try {
      const data = {
        zoneName: zoneForm.zoneName.trim(),
        zoneNameAr: zoneForm.zoneNameAr.trim() || undefined,
        zoneCode: zoneForm.zoneCode.trim(),
        floor: zoneForm.floor !== '' ? Number(zoneForm.floor) : undefined,
        zoneType: zoneForm.zoneType,
        totalSlots: zoneForm.totalSlots !== '' ? Number(zoneForm.totalSlots) : undefined,
      };
      if (editingZone) {
        await apiClient.updateParkingZone(restaurantId, editingZone.id || editingZone._id, data);
      } else {
        await apiClient.createParkingZone(restaurantId, data);
      }
      setShowZoneModal(false);
      await loadZones();
    } catch (e) {
      alert(e.message || 'Failed to save zone');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteZone = async (zone) => {
    try {
      await apiClient.deleteParkingZone(restaurantId, zone.id || zone._id);
      setDeleteConfirm(null);
      if (selectedZone && (selectedZone.id || selectedZone._id) === (zone.id || zone._id)) {
        setSelectedZone(null);
        setSlots([]);
      }
      await loadZones();
    } catch (e) {
      alert(e.message || 'Failed to delete zone');
    }
  };

  const handleToggleActive = async (zone) => {
    try {
      await apiClient.updateParkingZone(restaurantId, zone.id || zone._id, { isActive: !zone.isActive });
      await loadZones();
    } catch (e) {
      alert(e.message || 'Failed to toggle zone');
    }
  };

  // --- Bulk slot creation ---
  const handleBulkCreate = async () => {
    if (!bulkForm.prefix.trim() || bulkForm.count < 1) return;
    setBulkCreating(true);
    try {
      await apiClient.bulkCreateParkingSlots(restaurantId, {
        zoneId: selectedZone.id || selectedZone._id,
        prefix: bulkForm.prefix.trim(),
        startNumber: Number(bulkForm.startNumber),
        count: Number(bulkForm.count),
        slotType: bulkForm.slotType,
      });
      await loadSlots(selectedZone.id || selectedZone._id);
    } catch (e) {
      alert(e.message || 'Failed to create slots');
    } finally {
      setBulkCreating(false);
    }
  };

  // --- Slot editing ---
  const openSlotEdit = (slot) => {
    setEditingSlot(slot);
    setSlotEditForm({ status: slot.status || 'available', slotType: slot.slotType || slot.type || 'standard' });
  };

  const handleSaveSlot = async () => {
    if (!editingSlot) return;
    setSlotSaving(true);
    try {
      await apiClient.updateParkingSlot(restaurantId, editingSlot.id || editingSlot._id, slotEditForm);
      setEditingSlot(null);
      await loadSlots(selectedZone.id || selectedZone._id);
    } catch (e) {
      alert(e.message || 'Failed to update slot');
    } finally {
      setSlotSaving(false);
    }
  };

  const handleDeleteSlot = async (slot) => {
    if (!confirm('Delete this slot?')) return;
    try {
      await apiClient.deleteParkingSlot(restaurantId, slot.id || slot._id);
      await loadSlots(selectedZone.id || selectedZone._id);
    } catch (e) {
      alert(e.message || 'Failed to delete slot');
    }
  };

  // --- Computed ---
  const filteredZones = zones.filter(z => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (z.zoneName || z.name || '').toLowerCase().includes(q)
      || (z.zoneCode || z.code || '').toLowerCase().includes(q);
  });

  const isIndividualSlots = slotTrackingMode === 'individual_slots';

  const slotStats = slots.reduce((acc, s) => {
    acc[s.status || 'available'] = (acc[s.status || 'available'] || 0) + 1;
    return acc;
  }, {});

  // ================================================================
  if (!restaurantId) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <FaParking size={40} style={{ color: '#d1d5db', marginBottom: 16 }} />
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#374151', marginBottom: 8 }}>No Restaurant Found</h2>
        <p style={{ fontSize: 14, color: '#6b7280' }}>Please log in again or select a restaurant.</p>
      </div>
    );
  }

  // ================================================================
  return (
    <div style={{ padding: isMobile ? '16px 12px' : '24px 20px', maxWidth: 1200, margin: '0 auto', background: BG, minHeight: '100vh' }}>
      <style>{`
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .pz-input { width: 100%; padding: 10px 12px; border-radius: 10px; border: 1.5px solid #e2e8f0; font-size: 14px; color: #1e293b; background: #fff; box-sizing: border-box; transition: border 0.15s, box-shadow 0.15s; font-family: inherit; }
        .pz-input:focus { outline: none; border-color: ${PRIMARY}; box-shadow: 0 0 0 3px ${PRIMARY_LIGHT}; }
        .pz-btn { padding: 8px 16px; border-radius: 10px; border: none; font-weight: 600; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.15s; }
        .pz-btn:active { transform: scale(0.97); }
        .pz-card { background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.04); animation: fadeIn 0.3s ease; }
        .pz-label { font-size: 12px; font-weight: 600; color: #64748b; display: block; margin-bottom: 5px; }
        .pz-select { width: 100%; padding: 10px 12px; border-radius: 10px; border: 1.5px solid #e2e8f0; font-size: 14px; color: #1e293b; background: #fff; box-sizing: border-box; font-family: inherit; cursor: pointer; }
        .pz-select:focus { outline: none; border-color: ${PRIMARY}; box-shadow: 0 0 0 3px ${PRIMARY_LIGHT}; }
        .pz-slot { cursor: pointer; transition: all 0.15s ease; border-radius: 10px; }
        .pz-slot:hover { transform: scale(1.05); box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
      `}</style>

      {/* --- Header --- */}
      {!selectedZone ? (
        <>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            marginBottom: 20, flexWrap: 'wrap', gap: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link href="/parking" style={{
                width: 36, height: 36, borderRadius: 10, background: '#f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#475569', textDecoration: 'none', border: '1px solid #e2e8f0',
                cursor: 'pointer', flexShrink: 0
              }}>
                <FaArrowLeft size={14} />
              </Link>
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: PRIMARY_LIGHT,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <FaParking size={20} color={PRIMARY} />
              </div>
              <div>
                <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: '#1e293b', margin: 0 }}>Parking Zones</h1>
                <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
                  {loading ? '' : `${zones.length} zone${zones.length !== 1 ? 's' : ''} configured`}
                  {slotTrackingMode === 'zone_capacity' ? ' (capacity mode)' : ''}
                </p>
              </div>
            </div>
            <button onClick={openCreateZone} className="pz-btn" style={{
              background: PRIMARY, color: '#fff', padding: '10px 18px', fontSize: 14, borderRadius: 12
            }}>
              <FaPlus size={12} /> Add Zone
            </button>
          </div>

          {/* Search */}
          {zones.length > 3 && (
            <div style={{ marginBottom: 16, position: 'relative' }}>
              <FaSearch size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                className="pz-input"
                placeholder="Search zones..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: 38 }}
              />
            </div>
          )}

          {/* Loading shimmer */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="pz-card" style={{ padding: 20 }}>
                  <Shimmer h={20} w="60%" style={{ marginBottom: 12 }} />
                  <Shimmer h={14} w="40%" style={{ marginBottom: 8 }} />
                  <Shimmer h={14} w="80%" style={{ marginBottom: 8 }} />
                  <Shimmer h={32} w="100%" />
                </div>
              ))}
            </div>
          ) : filteredZones.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <FaLayerGroup size={36} style={{ color: '#d1d5db', marginBottom: 12 }} />
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#6b7280', marginBottom: 4 }}>
                {searchQuery ? 'No zones match your search' : 'No parking zones yet'}
              </h3>
              <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>
                {searchQuery ? 'Try a different search term' : 'Create your first parking zone to get started'}
              </p>
              {!searchQuery && (
                <button onClick={openCreateZone} className="pz-btn" style={{ background: PRIMARY, color: '#fff' }}>
                  <FaPlus size={12} /> Create Zone
                </button>
              )}
            </div>
          ) : (
            /* Zone cards grid */
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {filteredZones.map(zone => {
                const zId = zone.id || zone._id;
                const occupied = zone.occupiedSlots || zone.occupiedCount || 0;
                const total = zone.totalSlots || 0;
                const pct = total > 0 ? Math.round((occupied / total) * 100) : 0;
                const typeInfo = ZONE_TYPES.find(t => t.value === (zone.zoneType || zone.type)) || ZONE_TYPES[0];

                return (
                  <div
                    key={zId}
                    className="pz-card"
                    style={{ padding: 0, overflow: 'hidden', opacity: zone.isActive === false ? 0.6 : 1 }}
                  >
                    {/* Card header */}
                    <div
                      style={{
                        padding: '16px 16px 12px', cursor: isIndividualSlots ? 'pointer' : 'default',
                        borderBottom: '1px solid #f1f5f9'
                      }}
                      onClick={() => { if (isIndividualSlots) { setSelectedZone(zone); } }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: 10, background: PRIMARY_LIGHT,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: PRIMARY
                          }}>
                            <ZoneTypeIcon type={zone.zoneType || zone.type} size={16} />
                          </div>
                          <div>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                              {zone.zoneName || zone.name}
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                              <span style={{
                                fontSize: 11, fontWeight: 600, padding: '1px 8px', borderRadius: 6,
                                background: '#f1f5f9', color: '#64748b'
                              }}>{zone.zoneCode || zone.code}</span>
                              {zone.floor !== undefined && zone.floor !== null && (
                                <span style={{ fontSize: 11, color: '#94a3b8' }}>Floor {zone.floor}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 8,
                          background: typeInfo.value === 'vip' ? '#fef3c7' : '#f1f5f9',
                          color: typeInfo.value === 'vip' ? '#92400e' : '#64748b'
                        }}>
                          {typeInfo.label}
                        </span>
                      </div>

                      {/* Capacity bar */}
                      <div style={{ marginTop: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 12, color: '#64748b' }}>
                            {occupied} / {total} slots
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: pct > 80 ? '#dc2626' : pct > 50 ? '#d97706' : '#16a34a' }}>
                            {pct}%
                          </span>
                        </div>
                        <div style={{ height: 6, borderRadius: 3, background: '#f1f5f9', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: 3, width: `${pct}%`,
                            background: pct > 80 ? '#dc2626' : pct > 50 ? '#d97706' : '#16a34a',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                      </div>
                    </div>

                    {/* Card actions */}
                    <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEditZone(zone)} className="pz-btn" style={{
                          background: '#f1f5f9', color: '#64748b', padding: '6px 10px', fontSize: 12
                        }}>
                          <FaEdit size={11} /> Edit
                        </button>
                        <button onClick={() => setDeleteConfirm(zone)} className="pz-btn" style={{
                          background: '#fef2f2', color: '#dc2626', padding: '6px 10px', fontSize: 12
                        }}>
                          <FaTrash size={10} />
                        </button>
                      </div>
                      <button onClick={() => handleToggleActive(zone)} style={{
                        background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', gap: 4
                      }}>
                        <span style={{ fontSize: 11, color: zone.isActive !== false ? '#16a34a' : '#94a3b8' }}>
                          {zone.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                        {zone.isActive !== false
                          ? <FaToggleOn size={22} color="#16a34a" />
                          : <FaToggleOff size={22} color="#d1d5db" />
                        }
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* ================================================================ */
        /* SELECTED ZONE - Slot Management */
        /* ================================================================ */
        <>
          {/* Back + zone header */}
          <div style={{ marginBottom: 20 }}>
            <button onClick={() => { setSelectedZone(null); setSlots([]); setEditingSlot(null); }} className="pz-btn" style={{
              background: '#f1f5f9', color: '#64748b', marginBottom: 12
            }}>
              <FaArrowLeft size={12} /> Back to Zones
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: PRIMARY_LIGHT,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: PRIMARY
              }}>
                <ZoneTypeIcon type={selectedZone.zoneType || selectedZone.type} size={18} />
              </div>
              <div>
                <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                  {selectedZone.zoneName || selectedZone.name}
                </h1>
                <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
                  {selectedZone.zoneCode || selectedZone.code} - Floor {selectedZone.floor ?? 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Slot stats bar */}
          <div style={{
            display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto',
            paddingBottom: 4, WebkitOverflowScrolling: 'touch'
          }}>
            {Object.entries(SLOT_STATUSES).map(([key, val]) => (
              <div key={key} style={{
                padding: '8px 16px', borderRadius: 12, background: val.bg,
                border: `1px solid ${val.border}`, display: 'flex', alignItems: 'center', gap: 8,
                whiteSpace: 'nowrap', flexShrink: 0
              }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: val.text, opacity: 0.8 }}>{val.label}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: val.text }}>{slotStats[key] || 0}</span>
              </div>
            ))}
          </div>

          {/* Bulk create slots */}
          <div className="pz-card" style={{ padding: 16, marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: '0 0 12px 0' }}>
              <FaPlus size={12} style={{ marginRight: 6 }} /> Create Slots in Bulk
            </h3>
            <div style={{
              display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5, 1fr)',
              gap: 10, alignItems: 'end'
            }}>
              <div>
                <label className="pz-label">Prefix</label>
                <input className="pz-input" placeholder="e.g. A" value={bulkForm.prefix}
                  onChange={e => setBulkForm(p => ({ ...p, prefix: e.target.value }))} />
              </div>
              <div>
                <label className="pz-label">Start Number</label>
                <input className="pz-input" type="number" min={1} value={bulkForm.startNumber}
                  onChange={e => setBulkForm(p => ({ ...p, startNumber: e.target.value }))} />
              </div>
              <div>
                <label className="pz-label">Count</label>
                <input className="pz-input" type="number" min={1} max={200} value={bulkForm.count}
                  onChange={e => setBulkForm(p => ({ ...p, count: e.target.value }))} />
              </div>
              <div>
                <label className="pz-label">Slot Type</label>
                <select className="pz-select" value={bulkForm.slotType}
                  onChange={e => setBulkForm(p => ({ ...p, slotType: e.target.value }))}>
                  {SLOT_TYPES.map(t => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1).replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <button onClick={handleBulkCreate} className="pz-btn" disabled={bulkCreating} style={{
                  background: PRIMARY, color: '#fff', width: '100%', justifyContent: 'center',
                  padding: '10px 16px', opacity: bulkCreating ? 0.7 : 1
                }}>
                  {bulkCreating ? 'Creating...' : 'Create Slots'}
                </button>
              </div>
            </div>
          </div>

          {/* Slot map grid */}
          <div className="pz-card" style={{ padding: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: '0 0 16px 0' }}>
              <FaThLarge size={12} style={{ marginRight: 6 }} /> Slot Map
              <span style={{ fontWeight: 400, fontSize: 12, color: '#94a3b8', marginLeft: 8 }}>
                ({slots.length} slots)
              </span>
            </h3>

            {slotsLoading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: 8 }}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <Shimmer key={i} h={56} r={10} />
                ))}
              </div>
            ) : slots.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                <FaCar size={28} style={{ marginBottom: 8, opacity: 0.4 }} />
                <p style={{ fontSize: 13 }}>No slots yet. Use bulk creation above to add slots.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? '60px' : '76px'}, 1fr))`, gap: 8 }}>
                {slots.map(slot => {
                  const sId = slot.id || slot._id;
                  const status = slot.status || 'available';
                  const st = SLOT_STATUSES[status] || SLOT_STATUSES.available;
                  const isEditing = editingSlot && (editingSlot.id || editingSlot._id) === sId;

                  return (
                    <div
                      key={sId}
                      className="pz-slot"
                      onClick={() => openSlotEdit(slot)}
                      style={{
                        background: isEditing ? PRIMARY_LIGHT : st.bg,
                        border: `2px solid ${isEditing ? PRIMARY : st.border}`,
                        padding: isMobile ? '8px 4px' : '10px 6px',
                        textAlign: 'center',
                        position: 'relative'
                      }}
                    >
                      <div style={{ fontSize: isMobile ? 11 : 13, fontWeight: 700, color: st.text }}>
                        {slot.slotNumber || slot.number || slot.label || sId.slice(-4)}
                      </div>
                      <div style={{ fontSize: 9, color: st.text, opacity: 0.7, marginTop: 2 }}>
                        {status}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Legend */}
            <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
              {Object.entries(SLOT_STATUSES).map(([key, val]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: val.bg, border: `1px solid ${val.border}` }} />
                  <span style={{ fontSize: 11, color: '#64748b' }}>{val.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Slot edit panel */}
          {editingSlot && (
            <div className="pz-card" style={{ padding: 16, marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                  Edit Slot: {editingSlot.slotNumber || editingSlot.number || editingSlot.label}
                </h3>
                <button onClick={() => setEditingSlot(null)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4
                }}><FaTimes size={14} /></button>
              </div>
              <div style={{
                display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr auto auto',
                gap: 10, alignItems: 'end'
              }}>
                <div>
                  <label className="pz-label">Status</label>
                  <select className="pz-select" value={slotEditForm.status}
                    onChange={e => setSlotEditForm(p => ({ ...p, status: e.target.value }))}>
                    {Object.entries(SLOT_STATUSES).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="pz-label">Slot Type</label>
                  <select className="pz-select" value={slotEditForm.slotType}
                    onChange={e => setSlotEditForm(p => ({ ...p, slotType: e.target.value }))}>
                    {SLOT_TYPES.map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1).replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <button onClick={handleSaveSlot} className="pz-btn" disabled={slotSaving} style={{
                  background: PRIMARY, color: '#fff', padding: '10px 16px', opacity: slotSaving ? 0.7 : 1
                }}>
                  <FaSave size={12} /> {slotSaving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => handleDeleteSlot(editingSlot)} className="pz-btn" style={{
                  background: '#fef2f2', color: '#dc2626', padding: '10px 12px'
                }}>
                  <FaTrash size={12} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ================================================================ */}
      {/* CREATE/EDIT ZONE MODAL */}
      {/* ================================================================ */}
      {showZoneModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center',
          padding: isMobile ? 0 : 20
        }} onClick={() => setShowZoneModal(false)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: isMobile ? '20px 20px 0 0' : 20, padding: 24,
              width: isMobile ? '100%' : 480, maxHeight: '90vh', overflowY: 'auto',
              animation: 'fadeIn 0.25s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                {editingZone ? 'Edit Zone' : 'Create Zone'}
              </h2>
              <button onClick={() => setShowZoneModal(false)} style={{
                background: '#f1f5f9', border: 'none', width: 32, height: 32, borderRadius: 10,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b'
              }}><FaTimes size={14} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="pz-label">Zone Name *</label>
                <input className="pz-input" placeholder="e.g. Ground Floor Parking" value={zoneForm.zoneName}
                  onChange={e => setZoneForm(p => ({ ...p, zoneName: e.target.value }))} />
              </div>
              <div>
                <label className="pz-label">Zone Name (Arabic)</label>
                <input className="pz-input" placeholder="Optional" dir="rtl" value={zoneForm.zoneNameAr}
                  onChange={e => setZoneForm(p => ({ ...p, zoneNameAr: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="pz-label">Zone Code *</label>
                  <input className="pz-input" placeholder="e.g. GF" value={zoneForm.zoneCode}
                    onChange={e => setZoneForm(p => ({ ...p, zoneCode: e.target.value.toUpperCase() }))} />
                </div>
                <div>
                  <label className="pz-label">Floor Number</label>
                  <input className="pz-input" type="number" placeholder="e.g. 0" value={zoneForm.floor}
                    onChange={e => setZoneForm(p => ({ ...p, floor: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="pz-label">Zone Type</label>
                  <select className="pz-select" value={zoneForm.zoneType}
                    onChange={e => setZoneForm(p => ({ ...p, zoneType: e.target.value }))}>
                    {ZONE_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="pz-label">Total Slots</label>
                  <input className="pz-input" type="number" min={0} placeholder="e.g. 50" value={zoneForm.totalSlots}
                    onChange={e => setZoneForm(p => ({ ...p, totalSlots: e.target.value }))} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowZoneModal(false)} className="pz-btn" style={{
                background: '#f1f5f9', color: '#64748b', padding: '10px 20px'
              }}>Cancel</button>
              <button onClick={handleSaveZone} className="pz-btn" disabled={saving || !zoneForm.zoneName.trim() || !zoneForm.zoneCode.trim()} style={{
                background: PRIMARY, color: '#fff', padding: '10px 24px',
                opacity: saving || !zoneForm.zoneName.trim() || !zoneForm.zoneCode.trim() ? 0.6 : 1
              }}>
                <FaSave size={12} /> {saving ? 'Saving...' : editingZone ? 'Update Zone' : 'Create Zone'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* DELETE CONFIRM MODAL */}
      {/* ================================================================ */}
      {deleteConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }} onClick={() => setDeleteConfirm(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#fff', borderRadius: 20, padding: 24, width: 380,
            textAlign: 'center', animation: 'fadeIn 0.25s ease'
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, background: '#fef2f2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <FaExclamationTriangle size={20} color="#dc2626" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: '0 0 8px' }}>Delete Zone</h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px' }}>
              Are you sure you want to delete <strong>{deleteConfirm.zoneName || deleteConfirm.name}</strong>? This will also delete all slots in this zone.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setDeleteConfirm(null)} className="pz-btn" style={{
                background: '#f1f5f9', color: '#64748b', padding: '10px 20px'
              }}>Cancel</button>
              <button onClick={() => handleDeleteZone(deleteConfirm)} className="pz-btn" style={{
                background: '#dc2626', color: '#fff', padding: '10px 20px'
              }}>
                <FaTrash size={11} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

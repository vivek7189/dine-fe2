'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FaPlus, FaEdit, FaTrash, FaTimes, FaCheck, FaStar,
  FaCar, FaTruck, FaMotorcycle, FaBus, FaClock, FaMoon,
  FaCalendarAlt, FaLayerGroup, FaMoneyBillWave, FaShieldAlt,
  FaToggleOn, FaToggleOff, FaSpinner, FaExclamationTriangle, FaArrowLeft
} from 'react-icons/fa';
import Link from 'next/link';
import apiClient from '../../../../lib/api';

const PRIMARY = '#0369a1';
const PRIMARY_DARK = '#075985';
const PRIMARY_LIGHT = '#e0f2fe';
const BG = '#f8fafc';

const VEHICLE_TYPES = [
  { value: 'all', label: 'All Vehicles', icon: FaCar },
  { value: 'car', label: 'Car', icon: FaCar },
  { value: 'suv', label: 'SUV', icon: FaTruck },
  { value: 'bike', label: 'Bike', icon: FaMotorcycle },
  { value: 'truck', label: 'Truck', icon: FaTruck },
  { value: 'bus', label: 'Bus', icon: FaBus },
];

const RATE_TYPES = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'flat', label: 'Flat' },
  { value: 'tiered', label: 'Tiered' },
  { value: 'daily', label: 'Daily' },
  { value: 'monthly', label: 'Monthly' },
];

function Shimmer({ w = '100%', h = 20, r = 8, style = {} }) {
  return (
    <div
      style={{
        width: w, height: h, borderRadius: r,
        background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        ...style,
      }}
    />
  );
}

function ShimmerCard({ isMobile }) {
  return (
    <div style={{
      backgroundColor: '#fff', borderRadius: 14, padding: isMobile ? 16 : 20,
      border: '1px solid #e2e8f0',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <Shimmer w={140} h={20} />
        <Shimmer w={60} h={24} r={12} />
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <Shimmer w={80} h={24} r={12} />
        <Shimmer w={80} h={24} r={12} />
      </div>
      <Shimmer w="60%" h={16} style={{ marginBottom: 8 }} />
      <Shimmer w="40%" h={16} />
    </div>
  );
}

const emptyForm = {
  rateName: '',
  rateNameAr: '',
  vehicleType: 'all',
  rateType: 'hourly',
  hourlyRate: '',
  minimumCharge: '',
  gracePeriodMinutes: '15',
  maxDailyRate: '',
  flatRate: '',
  tiers: [{ upToMinutes: '', rate: '' }],
  nightSurcharge: false,
  nightStartHour: '22',
  nightEndHour: '6',
  nightMultiplier: '1.5',
  weekendSurcharge: false,
  weekendMultiplier: '1.25',
  isDefault: false,
  zoneIds: [],
};

export default function ParkingRatesPage() {
  const [rates, setRates] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [restaurantId, setRestaurantId] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Responsive
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Restaurant ID (localStorage → user → API)
  useEffect(() => {
    const resolve = async () => {
      try {
        const saved = localStorage.getItem('selectedRestaurantId');
        if (saved) { setRestaurantId(saved); return; }
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user?.restaurantId) { setRestaurantId(user.restaurantId); return; }
        const res = await apiClient.getRestaurants();
        const list = res?.restaurants || [];
        if (list.length > 0) {
          const r = list.find(r => r.id === res.defaultRestaurantId) || list[0];
          localStorage.setItem('selectedRestaurantId', r.id);
          setRestaurantId(r.id);
          return;
        }
      } catch {}
      setLoading(false);
    };
    resolve();
  }, []);

  // Load rates
  const loadRates = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const data = await apiClient.getParkingRates(restaurantId);
      setRates(data.rates || data || []);
    } catch (e) {
      console.error('Failed to load parking rates:', e);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  // Load zones
  const loadZones = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const data = await apiClient.getParkingZones(restaurantId);
      setZones(data.zones || data || []);
    } catch (e) {
      console.error('Failed to load parking zones:', e);
    }
  }, [restaurantId]);

  useEffect(() => {
    loadRates();
    loadZones();
  }, [loadRates, loadZones]);

  // Form helpers
  const updateForm = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  const openCreateModal = () => {
    setEditingRate(null);
    setFormData({ ...emptyForm });
    setShowModal(true);
  };

  const openEditModal = (rate) => {
    setEditingRate(rate);
    setFormData({
      rateName: rate.rateName || rate.name || '',
      rateNameAr: rate.rateNameAr || rate.nameAr || '',
      vehicleType: rate.vehicleType || 'all',
      rateType: rate.rateType || 'hourly',
      hourlyRate: rate.hourlyRate ?? '',
      minimumCharge: rate.minimumCharge ?? '',
      gracePeriodMinutes: rate.gracePeriodMinutes ?? '15',
      maxDailyRate: rate.maxDailyRate ?? '',
      flatRate: rate.flatRate ?? '',
      tiers: rate.tiers?.length ? rate.tiers : [{ upToMinutes: '', rate: '' }],
      nightSurcharge: rate.nightSurcharge?.enabled || false,
      nightStartHour: rate.nightSurcharge?.startHour ?? '22',
      nightEndHour: rate.nightSurcharge?.endHour ?? '6',
      nightMultiplier: rate.nightSurcharge?.multiplier ?? '1.5',
      weekendSurcharge: rate.weekendSurcharge?.enabled || false,
      weekendMultiplier: rate.weekendSurcharge?.multiplier ?? '1.25',
      isDefault: rate.isDefault || false,
      zoneIds: rate.zoneIds || [],
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.rateName.trim()) return;
    setSaving(true);
    try {
      const payload = {
        rateName: formData.rateName.trim(),
        rateNameAr: formData.rateNameAr.trim() || undefined,
        vehicleType: formData.vehicleType,
        rateType: formData.rateType,
        isDefault: formData.isDefault,
        zoneIds: formData.zoneIds,
      };

      if (formData.rateType === 'hourly') {
        payload.hourlyRate = parseFloat(formData.hourlyRate) || 0;
        payload.minimumCharge = parseFloat(formData.minimumCharge) || 0;
        payload.gracePeriodMinutes = parseInt(formData.gracePeriodMinutes) || 0;
        payload.maxDailyRate = parseFloat(formData.maxDailyRate) || undefined;
      } else if (formData.rateType === 'flat' || formData.rateType === 'daily' || formData.rateType === 'monthly') {
        payload.flatRate = parseFloat(formData.flatRate) || 0;
      } else if (formData.rateType === 'tiered') {
        payload.tiers = formData.tiers
          .filter(t => t.upToMinutes && t.rate)
          .map(t => ({ upToMinutes: parseInt(t.upToMinutes), rate: parseFloat(t.rate) }));
      }

      if (formData.nightSurcharge) {
        payload.nightSurcharge = {
          enabled: true,
          startHour: parseInt(formData.nightStartHour),
          endHour: parseInt(formData.nightEndHour),
          multiplier: parseFloat(formData.nightMultiplier),
        };
      }

      if (formData.weekendSurcharge) {
        payload.weekendSurcharge = {
          enabled: true,
          multiplier: parseFloat(formData.weekendMultiplier),
        };
      }

      if (editingRate) {
        await apiClient.updateParkingRate(restaurantId, editingRate.id || editingRate._id, payload);
      } else {
        await apiClient.createParkingRate(restaurantId, payload);
      }

      setShowModal(false);
      loadRates();
    } catch (e) {
      console.error('Failed to save rate:', e);
      alert('Failed to save rate. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (rateId) => {
    setDeleting(true);
    try {
      await apiClient.deleteParkingRate(restaurantId, rateId);
      setDeleteConfirm(null);
      loadRates();
    } catch (e) {
      console.error('Failed to delete rate:', e);
      alert('Failed to delete rate.');
    } finally {
      setDeleting(false);
    }
  };

  // Tier helpers
  const addTier = () => updateForm('tiers', [...formData.tiers, { upToMinutes: '', rate: '' }]);
  const removeTier = (idx) => updateForm('tiers', formData.tiers.filter((_, i) => i !== idx));
  const updateTier = (idx, key, value) => {
    const updated = [...formData.tiers];
    updated[idx] = { ...updated[idx], [key]: value };
    updateForm('tiers', updated);
  };

  // Zone toggle
  const toggleZone = (zoneId) => {
    setFormData(prev => ({
      ...prev,
      zoneIds: prev.zoneIds.includes(zoneId)
        ? prev.zoneIds.filter(id => id !== zoneId)
        : [...prev.zoneIds, zoneId],
    }));
  };

  const getVehicleIcon = (type) => {
    const found = VEHICLE_TYPES.find(v => v.value === type);
    return found ? found.icon : FaCar;
  };

  const getVehicleLabel = (type) => {
    const found = VEHICLE_TYPES.find(v => v.value === type);
    return found ? found.label : type;
  };

  const getRateDisplay = (rate) => {
    const t = rate.rateType;
    if (t === 'hourly') return `${rate.hourlyRate || 0}/hr`;
    if (t === 'flat' || t === 'daily' || t === 'monthly') return `${rate.flatRate || 0} ${t}`;
    if (t === 'tiered') return `${(rate.tiers || []).length} tiers`;
    return t;
  };

  const getRateTypeBadge = (type) => {
    const map = {
      hourly: { bg: '#dbeafe', text: '#1e40af', label: 'Hourly' },
      flat: { bg: '#fef3c7', text: '#92400e', label: 'Flat' },
      tiered: { bg: '#ede9fe', text: '#5b21b6', label: 'Tiered' },
      daily: { bg: '#dcfce7', text: '#166534', label: 'Daily' },
      monthly: { bg: '#fce7f3', text: '#9d174d', label: 'Monthly' },
    };
    return map[type] || { bg: '#f1f5f9', text: '#475569', label: type };
  };

  // Input style
  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1px solid #d1d5db', fontSize: 13, boxSizing: 'border-box',
    outline: 'none', transition: 'border-color 0.2s',
  };

  const labelStyle = {
    fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block',
  };

  const selectStyle = {
    ...inputStyle, backgroundColor: '#fff', cursor: 'pointer',
  };

  // No restaurant
  if (!restaurantId) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: BG, minHeight: '100vh' }}>
        <FaCar size={40} style={{ color: '#d1d5db', marginBottom: 16 }} />
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#374151', marginBottom: 8 }}>No Restaurant Selected</h2>
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>Please log in with a valid account to manage parking rates.</p>
        <Link href="/parking" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px',
          background: PRIMARY, color: '#fff', borderRadius: 10, textDecoration: 'none',
          fontWeight: 600, fontSize: 14
        }}>
          <FaArrowLeft size={12} /> Back to Parking
        </Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: BG, minHeight: '100vh', padding: isMobile ? 16 : 24 }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center',
        flexDirection: isMobile ? 'column' : 'row', gap: 12, marginBottom: 24,
        maxWidth: 1200, margin: '0 auto 24px',
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
          <div>
          <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Parking Rates
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Manage pricing rules and rate structures for your parking facility
          </p>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 10, border: 'none',
            backgroundColor: PRIMARY, color: '#fff', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', transition: 'background-color 0.2s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = PRIMARY_DARK}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = PRIMARY}
        >
          <FaPlus size={13} /> Add Rate
        </button>
      </div>

      {/* Rate Cards */}
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: 16,
          }}>
            {[1, 2, 3].map(i => <ShimmerCard key={i} isMobile={isMobile} />)}
          </div>
        ) : rates.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            backgroundColor: '#fff', borderRadius: 16, border: '1px solid #e2e8f0',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', backgroundColor: PRIMARY_LIGHT,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <FaMoneyBillWave size={28} style={{ color: PRIMARY }} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: '0 0 8px' }}>
              No Rates Configured
            </h3>
            <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 20px' }}>
              Create your first parking rate to start managing pricing.
            </p>
            <button
              onClick={openCreateModal}
              style={{
                padding: '10px 24px', borderRadius: 10, border: 'none',
                backgroundColor: PRIMARY, color: '#fff', fontSize: 14, fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <FaPlus size={12} style={{ marginRight: 6 }} /> Create Rate
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: 16,
          }}>
            {rates.map((rate, idx) => {
              const VehicleIcon = getVehicleIcon(rate.vehicleType);
              const typeBadge = getRateTypeBadge(rate.rateType);
              return (
                <div
                  key={rate.id || rate._id || idx}
                  style={{
                    backgroundColor: '#fff', borderRadius: 14,
                    border: rate.isDefault ? `2px solid ${PRIMARY}` : '1px solid #e2e8f0',
                    padding: isMobile ? 16 : 20,
                    animation: `fadeIn 0.3s ease ${idx * 0.05}s both`,
                    position: 'relative', overflow: 'hidden',
                    transition: 'box-shadow 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                >
                  {/* Default ribbon */}
                  {rate.isDefault && (
                    <div style={{
                      position: 'absolute', top: 12, right: -28,
                      backgroundColor: PRIMARY, color: '#fff',
                      fontSize: 10, fontWeight: 700, padding: '3px 32px',
                      transform: 'rotate(45deg)', letterSpacing: 0.5,
                    }}>
                      DEFAULT
                    </div>
                  )}

                  {/* Header row */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    marginBottom: 14,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10, backgroundColor: PRIMARY_LIGHT,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <VehicleIcon size={18} style={{ color: PRIMARY }} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{
                          fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {rate.rateName || rate.name || 'Unnamed Rate'}
                        </h3>
                        <span style={{ fontSize: 12, color: '#64748b' }}>
                          {getVehicleLabel(rate.vehicleType)}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={() => openEditModal(rate)}
                        style={{
                          width: 32, height: 32, borderRadius: 8,
                          border: '1px solid #e2e8f0', backgroundColor: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', color: '#64748b', transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = PRIMARY_LIGHT; e.currentTarget.style.color = PRIMARY; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = '#64748b'; }}
                        title="Edit rate"
                      >
                        <FaEdit size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(rate)}
                        style={{
                          width: 32, height: 32, borderRadius: 8,
                          border: '1px solid #e2e8f0', backgroundColor: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', color: '#64748b', transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fee2e2'; e.currentTarget.style.color = '#dc2626'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = '#64748b'; }}
                        title="Delete rate"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Badges row */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '4px 10px', borderRadius: 20,
                      backgroundColor: typeBadge.bg, color: typeBadge.text,
                      fontSize: 11, fontWeight: 600,
                    }}>
                      <FaClock size={10} /> {typeBadge.label}
                    </span>
                    {rate.isDefault && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '4px 10px', borderRadius: 20,
                        backgroundColor: '#fef3c7', color: '#92400e',
                        fontSize: 11, fontWeight: 600,
                      }}>
                        <FaStar size={10} /> Default
                      </span>
                    )}
                    {(rate.nightSurcharge?.enabled) && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '4px 10px', borderRadius: 20,
                        backgroundColor: '#ede9fe', color: '#5b21b6',
                        fontSize: 11, fontWeight: 600,
                      }}>
                        <FaMoon size={9} /> Night
                      </span>
                    )}
                    {(rate.weekendSurcharge?.enabled) && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '4px 10px', borderRadius: 20,
                        backgroundColor: '#fce7f3', color: '#9d174d',
                        fontSize: 11, fontWeight: 600,
                      }}>
                        <FaCalendarAlt size={9} /> Weekend
                      </span>
                    )}
                  </div>

                  {/* Rate info */}
                  <div style={{
                    backgroundColor: BG, borderRadius: 10, padding: 12,
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <FaMoneyBillWave size={16} style={{ color: PRIMARY, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                        {getRateDisplay(rate)}
                      </div>
                      {rate.rateType === 'hourly' && rate.gracePeriodMinutes > 0 && (
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                          {rate.gracePeriodMinutes} min grace period
                          {rate.maxDailyRate ? ` \u00b7 Max ${rate.maxDailyRate}/day` : ''}
                        </div>
                      )}
                      {rate.rateType === 'tiered' && rate.tiers?.length > 0 && (
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                          {rate.tiers.map((t, i) => (
                            <span key={i}>
                              {i > 0 && ' \u2192 '}
                              {t.upToMinutes}min: {t.rate}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Zones */}
                  {rate.zoneIds?.length > 0 && (
                    <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      <span style={{ fontSize: 11, color: '#94a3b8', marginRight: 4 }}>Zones:</span>
                      {rate.zoneIds.map(zid => {
                        const zone = zones.find(z => (z.id || z._id) === zid);
                        return (
                          <span key={zid} style={{
                            padding: '2px 8px', borderRadius: 10,
                            backgroundColor: '#f1f5f9', color: '#475569',
                            fontSize: 11, fontWeight: 500,
                          }}>
                            {zone?.name || zone?.zoneName || zid}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: 16,
          }}
          onClick={() => !deleting && setDeleteConfirm(null)}
        >
          <div
            style={{
              backgroundColor: '#fff', borderRadius: 16, padding: 24,
              maxWidth: 400, width: '100%', textAlign: 'center',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              width: 52, height: 52, borderRadius: '50%', backgroundColor: '#fee2e2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <FaExclamationTriangle size={24} style={{ color: '#dc2626' }} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
              Delete Rate
            </h3>
            <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 20px' }}>
              Are you sure you want to delete <strong>{deleteConfirm.rateName || deleteConfirm.name}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                style={{
                  padding: '10px 20px', borderRadius: 10, border: '1px solid #d1d5db',
                  backgroundColor: '#fff', color: '#374151', fontSize: 14, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id || deleteConfirm._id)}
                disabled={deleting}
                style={{
                  padding: '10px 20px', borderRadius: 10, border: 'none',
                  backgroundColor: '#dc2626', color: '#fff', fontSize: 14, fontWeight: 600,
                  cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {deleting ? <FaSpinner size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <FaTrash size={12} />}
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center',
            zIndex: 1000, padding: isMobile ? 0 : 16,
          }}
          onClick={() => !saving && setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: isMobile ? '20px 20px 0 0' : 16,
              width: '100%', maxWidth: 560,
              maxHeight: isMobile ? '92vh' : '85vh',
              overflowY: 'auto',
              animation: 'fadeIn 0.25s ease',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '18px 24px', borderBottom: '1px solid #e2e8f0',
              position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 2,
              borderRadius: isMobile ? '20px 20px 0 0' : '16px 16px 0 0',
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {editingRate ? 'Edit Rate' : 'Create Rate'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  width: 32, height: 32, borderRadius: 8, border: 'none',
                  backgroundColor: '#f1f5f9', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b',
                }}
              >
                <FaTimes size={14} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 24 }}>
              {/* Rate Name */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Rate Name *</label>
                <input
                  type="text"
                  value={formData.rateName}
                  onChange={e => updateForm('rateName', e.target.value)}
                  placeholder="e.g. Standard Hourly Rate"
                  style={inputStyle}
                />
              </div>

              {/* Rate Name Arabic */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Rate Name (Arabic)</label>
                <input
                  type="text"
                  value={formData.rateNameAr}
                  onChange={e => updateForm('rateNameAr', e.target.value)}
                  placeholder="Arabic name (optional)"
                  dir="rtl"
                  style={inputStyle}
                />
              </div>

              {/* Vehicle Type & Rate Type row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: 12, marginBottom: 16,
              }}>
                <div>
                  <label style={labelStyle}>Vehicle Type</label>
                  <select
                    value={formData.vehicleType}
                    onChange={e => updateForm('vehicleType', e.target.value)}
                    style={selectStyle}
                  >
                    {VEHICLE_TYPES.map(v => (
                      <option key={v.value} value={v.value}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Rate Type</label>
                  <select
                    value={formData.rateType}
                    onChange={e => updateForm('rateType', e.target.value)}
                    style={selectStyle}
                  >
                    {RATE_TYPES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Conditional Rate Fields */}
              <div style={{
                backgroundColor: BG, borderRadius: 12, padding: 16, marginBottom: 16,
                border: '1px solid #e2e8f0',
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FaMoneyBillWave size={13} style={{ color: PRIMARY }} />
                  Rate Configuration
                </div>

                {formData.rateType === 'hourly' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Hourly Rate *</label>
                      <input
                        type="number"
                        value={formData.hourlyRate}
                        onChange={e => updateForm('hourlyRate', e.target.value)}
                        placeholder="0.00"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Minimum Charge</label>
                      <input
                        type="number"
                        value={formData.minimumCharge}
                        onChange={e => updateForm('minimumCharge', e.target.value)}
                        placeholder="0.00"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Grace Period (min)</label>
                      <input
                        type="number"
                        value={formData.gracePeriodMinutes}
                        onChange={e => updateForm('gracePeriodMinutes', e.target.value)}
                        placeholder="15"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Max Daily Rate</label>
                      <input
                        type="number"
                        value={formData.maxDailyRate}
                        onChange={e => updateForm('maxDailyRate', e.target.value)}
                        placeholder="Optional"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                )}

                {(formData.rateType === 'flat' || formData.rateType === 'daily' || formData.rateType === 'monthly') && (
                  <div>
                    <label style={labelStyle}>
                      {formData.rateType === 'flat' ? 'Flat Rate' : formData.rateType === 'daily' ? 'Daily Rate' : 'Monthly Rate'} *
                    </label>
                    <input
                      type="number"
                      value={formData.flatRate}
                      onChange={e => updateForm('flatRate', e.target.value)}
                      placeholder="0.00"
                      style={inputStyle}
                    />
                  </div>
                )}

                {formData.rateType === 'tiered' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Tier Rules</span>
                      <button
                        type="button"
                        onClick={addTier}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          padding: '4px 10px', borderRadius: 6, border: `1px solid ${PRIMARY}`,
                          backgroundColor: PRIMARY_LIGHT, color: PRIMARY,
                          fontSize: 11, fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        <FaPlus size={9} /> Add Tier
                      </button>
                    </div>
                    {formData.tiers.map((tier, idx) => (
                      <div key={idx} style={{
                        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
                      }}>
                        <div style={{ flex: 1 }}>
                          <input
                            type="number"
                            value={tier.upToMinutes}
                            onChange={e => updateTier(idx, 'upToMinutes', e.target.value)}
                            placeholder="Up to (min)"
                            style={{ ...inputStyle, fontSize: 12 }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <input
                            type="number"
                            value={tier.rate}
                            onChange={e => updateTier(idx, 'rate', e.target.value)}
                            placeholder="Rate"
                            style={{ ...inputStyle, fontSize: 12 }}
                          />
                        </div>
                        {formData.tiers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTier(idx)}
                            style={{
                              width: 28, height: 28, borderRadius: 6, border: 'none',
                              backgroundColor: '#fee2e2', color: '#dc2626',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', flexShrink: 0,
                            }}
                          >
                            <FaTimes size={10} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Night Surcharge */}
              <div style={{
                backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16,
                border: '1px solid #e2e8f0',
              }}>
                <div
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    cursor: 'pointer',
                  }}
                  onClick={() => updateForm('nightSurcharge', !formData.nightSurcharge)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FaMoon size={14} style={{ color: '#7c3aed' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Night Surcharge</span>
                  </div>
                  {formData.nightSurcharge
                    ? <FaToggleOn size={24} style={{ color: PRIMARY }} />
                    : <FaToggleOff size={24} style={{ color: '#cbd5e1' }} />
                  }
                </div>
                {formData.nightSurcharge && (
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 14,
                  }}>
                    <div>
                      <label style={labelStyle}>Start Hour</label>
                      <input
                        type="number"
                        min="0" max="23"
                        value={formData.nightStartHour}
                        onChange={e => updateForm('nightStartHour', e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>End Hour</label>
                      <input
                        type="number"
                        min="0" max="23"
                        value={formData.nightEndHour}
                        onChange={e => updateForm('nightEndHour', e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Multiplier</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.nightMultiplier}
                        onChange={e => updateForm('nightMultiplier', e.target.value)}
                        placeholder="1.5"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Weekend Surcharge */}
              <div style={{
                backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16,
                border: '1px solid #e2e8f0',
              }}>
                <div
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    cursor: 'pointer',
                  }}
                  onClick={() => updateForm('weekendSurcharge', !formData.weekendSurcharge)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FaCalendarAlt size={14} style={{ color: '#ec4899' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Weekend Surcharge</span>
                  </div>
                  {formData.weekendSurcharge
                    ? <FaToggleOn size={24} style={{ color: PRIMARY }} />
                    : <FaToggleOff size={24} style={{ color: '#cbd5e1' }} />
                  }
                </div>
                {formData.weekendSurcharge && (
                  <div style={{ marginTop: 14 }}>
                    <label style={labelStyle}>Multiplier</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.weekendMultiplier}
                      onChange={e => updateForm('weekendMultiplier', e.target.value)}
                      placeholder="1.25"
                      style={{ ...inputStyle, maxWidth: 180 }}
                    />
                  </div>
                )}
              </div>

              {/* Default Toggle */}
              <div style={{
                backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16,
                border: '1px solid #e2e8f0',
              }}>
                <div
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    cursor: 'pointer',
                  }}
                  onClick={() => updateForm('isDefault', !formData.isDefault)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FaStar size={14} style={{ color: '#f59e0b' }} />
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', display: 'block' }}>Default Rate</span>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>Applied when no other rate matches</span>
                    </div>
                  </div>
                  {formData.isDefault
                    ? <FaToggleOn size={24} style={{ color: PRIMARY }} />
                    : <FaToggleOff size={24} style={{ color: '#cbd5e1' }} />
                  }
                </div>
              </div>

              {/* Zone Selection */}
              {zones.length > 0 && (
                <div style={{
                  backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16,
                  border: '1px solid #e2e8f0',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FaLayerGroup size={13} style={{ color: PRIMARY }} />
                    Apply to Zones
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 10 }}>
                    Leave empty to apply to all zones
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {zones.map(zone => {
                      const zoneId = zone.id || zone._id;
                      const isSelected = formData.zoneIds.includes(zoneId);
                      return (
                        <button
                          key={zoneId}
                          type="button"
                          onClick={() => toggleZone(zoneId)}
                          style={{
                            padding: '6px 14px', borderRadius: 20,
                            border: `1.5px solid ${isSelected ? PRIMARY : '#d1d5db'}`,
                            backgroundColor: isSelected ? PRIMARY_LIGHT : '#fff',
                            color: isSelected ? PRIMARY_DARK : '#64748b',
                            fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 5,
                            transition: 'all 0.2s',
                          }}
                        >
                          {isSelected && <FaCheck size={9} />}
                          {zone.name || zone.zoneName || zoneId}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              display: 'flex', justifyContent: 'flex-end', gap: 10,
              padding: '16px 24px', borderTop: '1px solid #e2e8f0',
              position: 'sticky', bottom: 0, backgroundColor: '#fff',
              borderRadius: isMobile ? 0 : '0 0 16px 16px',
            }}>
              <button
                onClick={() => setShowModal(false)}
                disabled={saving}
                style={{
                  padding: '10px 20px', borderRadius: 10, border: '1px solid #d1d5db',
                  backgroundColor: '#fff', color: '#374151', fontSize: 14, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.rateName.trim()}
                style={{
                  padding: '10px 24px', borderRadius: 10, border: 'none',
                  backgroundColor: !formData.rateName.trim() ? '#94a3b8' : PRIMARY,
                  color: '#fff', fontSize: 14, fontWeight: 600,
                  cursor: saving || !formData.rateName.trim() ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={e => { if (formData.rateName.trim()) e.currentTarget.style.backgroundColor = PRIMARY_DARK; }}
                onMouseLeave={e => { if (formData.rateName.trim()) e.currentTarget.style.backgroundColor = PRIMARY; }}
              >
                {saving ? <FaSpinner size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <FaCheck size={12} />}
                {saving ? 'Saving...' : editingRate ? 'Update Rate' : 'Create Rate'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

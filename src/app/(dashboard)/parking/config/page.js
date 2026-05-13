'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FaCog, FaSave, FaSpinner, FaCheck, FaTimes, FaPlus, FaTrash,
  FaCar, FaClock, FaGlobe, FaMoneyBillWave, FaToggleOn, FaToggleOff,
  FaCamera, FaRobot, FaPrint, FaReceipt, FaImage, FaParking,
  FaLanguage, FaTag, FaCloudUploadAlt, FaArrowLeft
} from 'react-icons/fa';
import Link from 'next/link';
import apiClient from '../../../../lib/api';

const PRIMARY = '#0369a1';
const PRIMARY_DARK = '#075985';
const PRIMARY_LIGHT = '#e0f2fe';
const PRIMARY_BG = '#f0f9ff';

function Shimmer({ w = '100%', h = 20, r = 8, style = {} }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', ...style }} />;
}

const DEFAULT_CONFIG = {
  lotName: { en: '', ar: '' },
  address: { en: '', ar: '' },
  operatingHours: { start: '06:00', end: '23:00' },
  timezone: 'Asia/Dubai',
  currency: 'AED',
  slotTrackingMode: 'zone_capacity',
  vehicleTypes: [
    { key: 'sedan', label: 'Sedan', enabled: true },
    { key: 'suv', label: 'SUV', enabled: true },
    { key: 'truck', label: 'Truck', enabled: true },
    { key: 'motorcycle', label: 'Motorcycle', enabled: true },
    { key: 'bus', label: 'Bus', enabled: false },
  ],
  ticketPrefix: 'PKT',
  aiRecognition: false,
  vehiclePhoto: true,
  printLanguage: 'en',
  receiptHeader: { en: '', ar: '' },
  receiptFooter: { en: '', ar: '' },
  logo: null,
};

const TIMEZONES = [
  'Asia/Dubai',
  'Asia/Kuwait',
  'Asia/Riyadh',
  'Asia/Qatar',
  'Asia/Bahrain',
  'Asia/Muscat',
  'Asia/Kolkata',
  'Asia/Karachi',
  'Europe/London',
  'America/New_York',
];

const CURRENCIES = [
  { code: 'AED', label: 'AED - UAE Dirham' },
  { code: 'KWD', label: 'KWD - Kuwaiti Dinar' },
  { code: 'SAR', label: 'SAR - Saudi Riyal' },
  { code: 'QAR', label: 'QAR - Qatari Riyal' },
  { code: 'BHD', label: 'BHD - Bahraini Dinar' },
  { code: 'OMR', label: 'OMR - Omani Rial' },
  { code: 'INR', label: 'INR - Indian Rupee' },
  { code: 'USD', label: 'USD - US Dollar' },
  { code: 'EUR', label: 'EUR - Euro' },
  { code: 'GBP', label: 'GBP - British Pound' },
];

// ═════════════════════════════════════════════════════════
export default function ParkingConfigPage() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [toast, setToast] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [newVehicleType, setNewVehicleType] = useState('');
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  // ─── Responsive ───────────────────────────────────────
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ─── Toast helper ─────────────────────────────────────
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ─── Resolve restaurantId ──────────────────────────────
  const resolveRestaurantId = useCallback(async () => {
    let id = localStorage.getItem('selectedRestaurantId')
      || JSON.parse(localStorage.getItem('user') || '{}')?.restaurantId;
    if (!id) {
      try {
        const res = await apiClient.getRestaurants();
        const list = res?.restaurants || [];
        if (list.length > 0) {
          const r = list.find(r => r.id === res.defaultRestaurantId) || list[0];
          localStorage.setItem('selectedRestaurantId', r.id);
          id = r.id;
        }
      } catch {}
    }
    return id || null;
  }, []);

  // ─── Load config ──────────────────────────────────────
  const loadConfig = useCallback(async () => {
    try {
      const restaurantId = await resolveRestaurantId();
      if (!restaurantId) {
        setLoading(false);
        return;
      }
      const data = await apiClient.getParkingConfig(restaurantId);
      if (data.success && data.config) {
        setConfig(prev => ({ ...prev, ...data.config }));
        if (data.config.logo) {
          setLogoPreview(data.config.logo);
        }
      }
    } catch (e) {
      console.error('Failed to load parking config:', e);
      showToast('Failed to load configuration', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, resolveRestaurantId]);

  useEffect(() => { loadConfig(); }, [loadConfig]);

  // ─── Update field helper ──────────────────────────────
  const updateField = (path, value) => {
    setDirty(true);
    setConfig(prev => {
      const keys = path.split('.');
      const next = JSON.parse(JSON.stringify(prev));
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  // ─── Toggle helper ────────────────────────────────────
  const Toggle = ({ value, onChange, label }) => (
    <label style={{
      display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
      fontSize: 14, color: '#1e293b'
    }}>
      <div style={{
        width: 44, height: 24, borderRadius: 12, position: 'relative',
        background: value ? PRIMARY : '#cbd5e1', transition: 'background 0.2s',
        cursor: 'pointer', flexShrink: 0
      }} onClick={(e) => { e.preventDefault(); onChange(!value); }}>
        <div style={{
          width: 20, height: 20, borderRadius: '50%', background: '#fff',
          position: 'absolute', top: 2,
          left: value ? 22 : 2,
          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
        }} />
      </div>
      {label && <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>}
    </label>
  );

  // ─── Vehicle type management ──────────────────────────
  const toggleVehicleType = (index) => {
    setDirty(true);
    setConfig(prev => {
      const next = { ...prev };
      next.vehicleTypes = [...next.vehicleTypes];
      next.vehicleTypes[index] = { ...next.vehicleTypes[index], enabled: !next.vehicleTypes[index].enabled };
      return next;
    });
  };

  const addVehicleType = () => {
    const label = newVehicleType.trim();
    if (!label) return;
    const key = label.toLowerCase().replace(/\s+/g, '_');
    if (config.vehicleTypes.some(v => v.key === key)) {
      showToast('Vehicle type already exists', 'error');
      return;
    }
    setDirty(true);
    setConfig(prev => ({
      ...prev,
      vehicleTypes: [...prev.vehicleTypes, { key, label, enabled: true }]
    }));
    setNewVehicleType('');
  };

  const removeVehicleType = (index) => {
    setDirty(true);
    setConfig(prev => ({
      ...prev,
      vehicleTypes: prev.vehicleTypes.filter((_, i) => i !== index)
    }));
  };

  // ─── Logo upload ──────────────────────────────────────
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Logo must be under 2MB', 'error');
      return;
    }
    setLogoFile(file);
    setDirty(true);
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  // ─── Save config ──────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const restaurantId = await resolveRestaurantId();
      if (!restaurantId) {
        showToast('No restaurant ID found', 'error');
        return;
      }

      const payload = { ...config };
      if (logoFile) {
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(logoFile);
        });
        payload.logo = base64;
      }

      await apiClient.updateParkingConfig(restaurantId, payload);
      setDirty(false);
      setLogoFile(null);
      showToast('Configuration saved successfully');
    } catch (e) {
      console.error('Failed to save config:', e);
      showToast(e.message || 'Failed to save configuration', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ═════════════════════════════════════════════════════════
  return (
    <div style={{ padding: isMobile ? '16px 12px' : '24px 20px', maxWidth: 900, margin: '0 auto' }}>
      <style>{`
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(100%); } to { opacity: 1; transform: translateY(0); } }
        @keyframes toastIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .pk-input { width: 100%; padding: 10px 12px; border-radius: 10px; border: 1.5px solid #e2e8f0; font-size: 14px; color: #1e293b; background: #fff; box-sizing: border-box; transition: border 0.15s, box-shadow 0.15s; font-family: inherit; }
        .pk-input:focus { outline: none; border-color: ${PRIMARY}; box-shadow: 0 0 0 3px ${PRIMARY_LIGHT}; }
        .pk-btn { padding: 8px 16px; border-radius: 10px; border: none; font-weight: 600; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.15s; }
        .pk-btn:active { transform: scale(0.97); }
        .pk-card { background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.04); animation: fadeIn 0.3s ease; }
        .pk-label { font-size: 12px; font-weight: 600; color: #64748b; display: block; margin-bottom: 5px; }
        .pk-section { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
      `}</style>

      {/* ─── Toast ─── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, animation: 'toastIn 0.3s ease',
          padding: '12px 24px', borderRadius: 14,
          background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
          border: `1.5px solid ${toast.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
          color: toast.type === 'error' ? '#dc2626' : '#16a34a',
          fontSize: 14, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
        }}>
          {toast.type === 'error' ? <FaTimes size={14} /> : <FaCheck size={14} />}
          {toast.message}
        </div>
      )}

      {/* ─── Header ─── */}
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
            width: 44, height: 44, borderRadius: 12, background: PRIMARY_BG,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FaCog size={20} color={PRIMARY} />
          </div>
          <div>
            <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: '#1e293b', margin: 0 }}>Parking Configuration</h1>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
              {loading ? '' : 'Manage lot settings, vehicle types & printing'}
            </p>
          </div>
        </div>
        {!loading && (
          <button disabled={saving || !dirty} onClick={handleSave} className="pk-btn" style={{
            background: (!dirty || saving) ? '#94a3b8' : PRIMARY, color: '#fff',
            padding: '10px 20px', fontSize: 14, borderRadius: 12,
            opacity: (!dirty || saving) ? 0.7 : 1
          }}>
            {saving ? <FaSpinner size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <FaSave size={13} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      {/* ─── Loading Shimmer ─── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="pk-card" style={{ padding: 20 }}>
              <Shimmer w="30%" h={16} style={{ marginBottom: 16 }} />
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
                <Shimmer h={44} />
                <Shimmer h={44} />
              </div>
              {i <= 2 && (
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginTop: 12 }}>
                  <Shimmer h={44} />
                  <Shimmer h={44} />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ═══════════════════════════════════════════════════ */}
          {/* SECTION: Lot Identity */}
          {/* ═══════════════════════════════════════════════════ */}
          <div className="pk-card" style={{ padding: isMobile ? 16 : 20 }}>
            <div className="pk-section">
              <FaParking size={12} color="#94a3b8" /> Lot Identity
            </div>

            {/* Lot Name */}
            <div style={{ marginBottom: 14 }}>
              <label className="pk-label">Lot Name</label>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10 }}>
                <input
                  value={config.lotName?.en || ''}
                  onChange={e => updateField('lotName.en', e.target.value)}
                  placeholder="Lot name (English)"
                  className="pk-input"
                />
                <input
                  value={config.lotName?.ar || ''}
                  onChange={e => updateField('lotName.ar', e.target.value)}
                  placeholder="Lot name (Arabic)"
                  className="pk-input"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="pk-label">Address</label>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10 }}>
                <input
                  value={config.address?.en || ''}
                  onChange={e => updateField('address.en', e.target.value)}
                  placeholder="Address (English)"
                  className="pk-input"
                />
                <input
                  value={config.address?.ar || ''}
                  onChange={e => updateField('address.ar', e.target.value)}
                  placeholder="Address (Arabic)"
                  className="pk-input"
                  dir="rtl"
                />
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════ */}
          {/* SECTION: Operating Hours & Region */}
          {/* ═══════════════════════════════════════════════════ */}
          <div className="pk-card" style={{ padding: isMobile ? 16 : 20 }}>
            <div className="pk-section">
              <FaClock size={12} color="#94a3b8" /> Operating Hours & Region
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
              gap: isMobile ? 10 : 14
            }}>
              {/* Start Time */}
              <div>
                <label className="pk-label">Opens At</label>
                <input
                  type="time"
                  value={config.operatingHours?.start || '06:00'}
                  onChange={e => updateField('operatingHours.start', e.target.value)}
                  className="pk-input"
                />
              </div>

              {/* End Time */}
              <div>
                <label className="pk-label">Closes At</label>
                <input
                  type="time"
                  value={config.operatingHours?.end || '23:00'}
                  onChange={e => updateField('operatingHours.end', e.target.value)}
                  className="pk-input"
                />
              </div>

              {/* Timezone */}
              <div>
                <label className="pk-label">Timezone</label>
                <select
                  value={config.timezone || 'Asia/Dubai'}
                  onChange={e => updateField('timezone', e.target.value)}
                  className="pk-input"
                >
                  {TIMEZONES.map(tz => (
                    <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              {/* Currency */}
              <div>
                <label className="pk-label">Currency</label>
                <select
                  value={config.currency || 'AED'}
                  onChange={e => updateField('currency', e.target.value)}
                  className="pk-input"
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════ */}
          {/* SECTION: Slot Tracking & Ticket */}
          {/* ═══════════════════════════════════════════════════ */}
          <div className="pk-card" style={{ padding: isMobile ? 16 : 20 }}>
            <div className="pk-section">
              <FaTag size={12} color="#94a3b8" /> Slot Tracking & Ticket
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: isMobile ? 14 : 14
            }}>
              {/* Slot Tracking Mode */}
              <div>
                <label className="pk-label">Slot Tracking Mode</label>
                <div style={{
                  display: 'flex', borderRadius: 10, overflow: 'hidden',
                  border: '1.5px solid #e2e8f0'
                }}>
                  {[
                    { value: 'zone_capacity', label: 'Zone Capacity' },
                    { value: 'individual_slots', label: 'Individual Slots' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => updateField('slotTrackingMode', opt.value)}
                      style={{
                        flex: 1, padding: '10px 12px', border: 'none',
                        background: config.slotTrackingMode === opt.value ? PRIMARY : '#fff',
                        color: config.slotTrackingMode === opt.value ? '#fff' : '#64748b',
                        fontWeight: 600, fontSize: 13, cursor: 'pointer',
                        transition: 'all 0.15s', fontFamily: 'inherit'
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ticket Prefix */}
              <div>
                <label className="pk-label">Ticket Prefix</label>
                <input
                  value={config.ticketPrefix || ''}
                  onChange={e => updateField('ticketPrefix', e.target.value.toUpperCase())}
                  placeholder="e.g. PKT"
                  className="pk-input"
                  maxLength={6}
                  style={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}
                />
                <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 3, display: 'block' }}>
                  Preview: {config.ticketPrefix || 'PKT'}-000001
                </span>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════ */}
          {/* SECTION: Vehicle Types */}
          {/* ═══════════════════════════════════════════════════ */}
          <div className="pk-card" style={{ padding: isMobile ? 16 : 20 }}>
            <div className="pk-section">
              <FaCar size={12} color="#94a3b8" /> Vehicle Types
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {config.vehicleTypes.map((vt, index) => (
                <div key={vt.key} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 12,
                  background: vt.enabled ? PRIMARY_BG : '#f8fafc',
                  border: `1px solid ${vt.enabled ? PRIMARY_LIGHT : '#f1f5f9'}`,
                  transition: 'all 0.15s'
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: vt.enabled ? PRIMARY_LIGHT : '#e2e8f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <FaCar size={14} color={vt.enabled ? PRIMARY : '#94a3b8'} />
                  </div>
                  <span style={{
                    flex: 1, fontSize: 14, fontWeight: 600,
                    color: vt.enabled ? '#1e293b' : '#94a3b8'
                  }}>
                    {vt.label}
                  </span>
                  <Toggle
                    value={vt.enabled}
                    onChange={() => toggleVehicleType(index)}
                  />
                  <button
                    onClick={() => removeVehicleType(index)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: 6, borderRadius: 8, color: '#cbd5e1',
                      transition: 'color 0.15s'
                    }}
                    onMouseEnter={e => e.target.style.color = '#ef4444'}
                    onMouseLeave={e => e.target.style.color = '#cbd5e1'}
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add custom vehicle type */}
            <div style={{
              display: 'flex', gap: 8, marginTop: 12, alignItems: 'center'
            }}>
              <input
                value={newVehicleType}
                onChange={e => setNewVehicleType(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addVehicleType()}
                placeholder="Add custom vehicle type..."
                className="pk-input"
                style={{ flex: 1 }}
              />
              <button
                onClick={addVehicleType}
                disabled={!newVehicleType.trim()}
                className="pk-btn"
                style={{
                  background: newVehicleType.trim() ? PRIMARY : '#e2e8f0',
                  color: newVehicleType.trim() ? '#fff' : '#94a3b8',
                  padding: '10px 16px', borderRadius: 10, flexShrink: 0
                }}
              >
                <FaPlus size={11} /> Add
              </button>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════ */}
          {/* SECTION: AI & Photo Settings */}
          {/* ═══════════════════════════════════════════════════ */}
          <div className="pk-card" style={{ padding: isMobile ? 16 : 20 }}>
            <div className="pk-section">
              <FaRobot size={12} color="#94a3b8" /> AI & Photo Settings
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: 16
            }}>
              {/* AI Recognition */}
              <div style={{
                padding: '14px 16px', borderRadius: 12, background: '#f8fafc',
                border: '1px solid #f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: config.aiRecognition ? '#dbeafe' : '#e2e8f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <FaRobot size={16} color={config.aiRecognition ? '#2563eb' : '#94a3b8'} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>AI Plate Recognition</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>Auto-detect license plates</div>
                  </div>
                </div>
                <Toggle
                  value={config.aiRecognition}
                  onChange={v => updateField('aiRecognition', v)}
                />
              </div>

              {/* Vehicle Photo */}
              <div style={{
                padding: '14px 16px', borderRadius: 12, background: '#f8fafc',
                border: '1px solid #f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: config.vehiclePhoto ? '#dcfce7' : '#e2e8f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <FaCamera size={16} color={config.vehiclePhoto ? '#16a34a' : '#94a3b8'} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>Vehicle Photo</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>Capture photo on entry</div>
                  </div>
                </div>
                <Toggle
                  value={config.vehiclePhoto}
                  onChange={v => updateField('vehiclePhoto', v)}
                />
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════ */}
          {/* SECTION: Print & Receipt Settings */}
          {/* ═══════════════════════════════════════════════════ */}
          <div className="pk-card" style={{ padding: isMobile ? 16 : 20 }}>
            <div className="pk-section">
              <FaPrint size={12} color="#94a3b8" /> Print & Receipt Settings
            </div>

            {/* Print Language */}
            <div style={{ marginBottom: 16 }}>
              <label className="pk-label">Print Language</label>
              <div style={{
                display: 'flex', borderRadius: 10, overflow: 'hidden',
                border: '1.5px solid #e2e8f0', maxWidth: isMobile ? '100%' : 360
              }}>
                {[
                  { value: 'en', label: 'English' },
                  { value: 'ar', label: 'Arabic' },
                  { value: 'dual', label: 'Dual (EN + AR)' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateField('printLanguage', opt.value)}
                    style={{
                      flex: 1, padding: '10px 12px', border: 'none',
                      background: config.printLanguage === opt.value ? PRIMARY : '#fff',
                      color: config.printLanguage === opt.value ? '#fff' : '#64748b',
                      fontWeight: 600, fontSize: 13, cursor: 'pointer',
                      transition: 'all 0.15s', fontFamily: 'inherit'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Receipt Header */}
            <div style={{ marginBottom: 14 }}>
              <label className="pk-label">Receipt Header</label>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10 }}>
                <textarea
                  value={config.receiptHeader?.en || ''}
                  onChange={e => updateField('receiptHeader.en', e.target.value)}
                  placeholder="Receipt header text (English)"
                  className="pk-input"
                  rows={3}
                  style={{ resize: 'vertical', fontFamily: 'inherit' }}
                />
                <textarea
                  value={config.receiptHeader?.ar || ''}
                  onChange={e => updateField('receiptHeader.ar', e.target.value)}
                  placeholder="Receipt header text (Arabic)"
                  className="pk-input"
                  rows={3}
                  dir="rtl"
                  style={{ resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
            </div>

            {/* Receipt Footer */}
            <div>
              <label className="pk-label">Receipt Footer</label>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10 }}>
                <textarea
                  value={config.receiptFooter?.en || ''}
                  onChange={e => updateField('receiptFooter.en', e.target.value)}
                  placeholder="Receipt footer text (English)"
                  className="pk-input"
                  rows={3}
                  style={{ resize: 'vertical', fontFamily: 'inherit' }}
                />
                <textarea
                  value={config.receiptFooter?.ar || ''}
                  onChange={e => updateField('receiptFooter.ar', e.target.value)}
                  placeholder="Receipt footer text (Arabic)"
                  className="pk-input"
                  rows={3}
                  dir="rtl"
                  style={{ resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════ */}
          {/* SECTION: Logo Upload */}
          {/* ═══════════════════════════════════════════════════ */}
          <div className="pk-card" style={{ padding: isMobile ? 16 : 20 }}>
            <div className="pk-section">
              <FaImage size={12} color="#94a3b8" /> Logo
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 20,
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              {/* Preview */}
              <div style={{
                width: 100, height: 100, borderRadius: 16,
                border: '2px dashed #e2e8f0', background: '#f8fafc',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', flexShrink: 0
              }}>
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <FaCloudUploadAlt size={32} color="#cbd5e1" />
                )}
              </div>

              {/* Upload area */}
              <div style={{ flex: 1, width: isMobile ? '100%' : 'auto' }}>
                <label style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  padding: '20px 16px', borderRadius: 12,
                  border: '2px dashed #e2e8f0', background: '#f8fafc',
                  cursor: 'pointer', transition: 'border-color 0.15s',
                  textAlign: 'center'
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = PRIMARY}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                >
                  <FaCloudUploadAlt size={20} color={PRIMARY} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>
                    {logoPreview ? 'Change Logo' : 'Upload Logo'}
                  </span>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>PNG, JPG up to 2MB</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleLogoChange}
                    style={{ display: 'none' }}
                  />
                </label>

                {logoPreview && (
                  <button
                    onClick={() => {
                      setLogoPreview(null);
                      setLogoFile(null);
                      updateField('logo', null);
                    }}
                    className="pk-btn"
                    style={{
                      background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
                      marginTop: 8, fontSize: 12, padding: '6px 12px'
                    }}
                  >
                    <FaTrash size={10} /> Remove Logo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ─── Bottom Save Bar ─── */}
          {dirty && (
            <div style={{
              position: 'fixed', bottom: 0, left: 0, right: 0,
              padding: '12px 20px',
              background: '#fff', borderTop: '1px solid #e2e8f0',
              boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              zIndex: 100, animation: 'slideUp 0.3s ease'
            }}>
              <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
                You have unsaved changes
              </span>
              <button
                onClick={() => { loadConfig(); setDirty(false); }}
                className="pk-btn"
                style={{
                  background: '#fff', color: '#64748b', border: '1.5px solid #e2e8f0',
                  padding: '9px 16px'
                }}
              >
                <FaTimes size={12} /> Discard
              </button>
              <button
                disabled={saving}
                onClick={handleSave}
                className="pk-btn"
                style={{
                  background: saving ? '#94a3b8' : PRIMARY, color: '#fff',
                  padding: '9px 20px', opacity: saving ? 0.7 : 1
                }}
              >
                {saving ? <FaSpinner size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <FaCheck size={12} />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

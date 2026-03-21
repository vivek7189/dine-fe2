'use client';

import { useState } from 'react';
import { FaCog, FaClock, FaPlus, FaTrash, FaSave, FaSpinner, FaSun, FaMoon } from 'react-icons/fa';
import apiClient from '../../lib/api';
import { DEFAULT_SHIFT_SETTINGS, DAYS_FULL } from './constants';

export default function SettingsTab({ restaurantId, shiftSettings, setShiftSettings, isMobile }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const settings = shiftSettings || DEFAULT_SHIFT_SETTINGS;

  const update = (key, value) => {
    setShiftSettings({ ...settings, [key]: value });
    setSaved(false);
  };

  const updateShiftType = (index, field, value) => {
    const updated = [...(settings.shiftTypes || [])];
    updated[index] = { ...updated[index], [field]: value };
    update('shiftTypes', updated);
  };

  const addShiftType = () => {
    update('shiftTypes', [...(settings.shiftTypes || []), {
      name: 'New Shift', startTime: '09:00', endTime: '17:00',
      requiredEmployees: 2, requiredRoles: {}, color: '#6366f1'
    }]);
  };

  const removeShiftType = (index) => {
    update('shiftTypes', (settings.shiftTypes || []).filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!restaurantId) return;
    setSaving(true);
    try {
      await apiClient.updateShiftSettings(restaurantId, settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e5e7eb',
    fontSize: '14px', color: '#111827', backgroundColor: '#fafafa', outline: 'none'
  };

  const sectionStyle = {
    backgroundColor: 'white', borderRadius: '16px', padding: isMobile ? '16px' : '24px',
    border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: '20px'
  };

  const sectionTitle = (icon, title, subtitle) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '10px',
        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>{icon}</div>
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0 }}>{title}</h3>
        {subtitle && <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' }}>{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '800px' }}>
      {/* Operating Hours */}
      <div style={sectionStyle}>
        {sectionTitle(<FaClock size={16} color="white" />, 'Operating Hours', 'When your restaurant is open')}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '4px', display: 'block' }}>
              <FaSun size={10} style={{ marginRight: '4px' }} />Opens
            </label>
            <input type="time" value={settings.operatingHours?.start || '06:00'}
              onChange={e => update('operatingHours', { ...settings.operatingHours, start: e.target.value })}
              style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '4px', display: 'block' }}>
              <FaMoon size={10} style={{ marginRight: '4px' }} />Closes
            </label>
            <input type="time" value={settings.operatingHours?.end || '23:00'}
              onChange={e => update('operatingHours', { ...settings.operatingHours, end: e.target.value })}
              style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Shift Types */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          {sectionTitle(<FaCog size={16} color="white" />, 'Shift Types', 'Define your shift templates')}
          <button onClick={addShiftType} style={{
            padding: '8px 14px', borderRadius: '10px', border: 'none',
            background: '#f3f4f6', color: '#374151', fontSize: '13px', fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
          }}><FaPlus size={10} /> Add</button>
        </div>

        {(settings.shiftTypes || []).map((st, i) => (
          <div key={i} style={{
            padding: '16px', borderRadius: '12px', backgroundColor: '#fafafa',
            border: '1px solid #f1f5f9', marginBottom: '12px'
          }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
              <input type="color" value={st.color || '#6366f1'} onChange={e => updateShiftType(i, 'color', e.target.value)}
                style={{ width: '36px', height: '36px', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: 0 }} />
              <input type="text" value={st.name} onChange={e => updateShiftType(i, 'name', e.target.value)}
                placeholder="Shift name" style={{ ...inputStyle, flex: 1 }} />
              <button onClick={() => removeShiftType(i)} style={{
                padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: '#fee2e2',
                color: '#dc2626', cursor: 'pointer'
              }}><FaTrash size={12} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Start</label>
                <input type="time" value={st.startTime} onChange={e => updateShiftType(i, 'startTime', e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>End</label>
                <input type="time" value={st.endTime} onChange={e => updateShiftType(i, 'endTime', e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Staff needed</label>
                <input type="number" min={1} value={st.requiredEmployees || 2}
                  onChange={e => updateShiftType(i, 'requiredEmployees', Number(e.target.value))} style={inputStyle} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Staff Limits */}
      <div style={sectionStyle}>
        {sectionTitle(<FaClock size={16} color="white" />, 'Staff Limits', 'Maximum hours and rest requirements')}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '4px', display: 'block' }}>Max hours/day</label>
            <input type="number" min={1} max={24} value={settings.maxHoursPerDay || 8}
              onChange={e => update('maxHoursPerDay', Number(e.target.value))} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '4px', display: 'block' }}>Max hours/week</label>
            <input type="number" min={1} max={168} value={settings.maxHoursPerWeek || 40}
              onChange={e => update('maxHoursPerWeek', Number(e.target.value))} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '4px', display: 'block' }}>Min rest (hours)</label>
            <input type="number" min={0} max={24} value={settings.minRestHours || 8}
              onChange={e => update('minRestHours', Number(e.target.value))} style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Days Closed */}
      <div style={sectionStyle}>
        {sectionTitle(<FaCog size={16} color="white" />, 'Days Closed', 'Select days when restaurant is closed')}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {DAYS_FULL.map(day => {
            const closed = (settings.timeOff || []).includes(day.toLowerCase());
            return (
              <button key={day} onClick={() => {
                const dayLower = day.toLowerCase();
                const current = settings.timeOff || [];
                update('timeOff', closed ? current.filter(d => d !== dayLower) : [...current, dayLower]);
              }} style={{
                padding: '8px 16px', borderRadius: '20px', border: 'none',
                backgroundColor: closed ? '#fee2e2' : '#f3f4f6',
                color: closed ? '#dc2626' : '#374151',
                fontWeight: closed ? 600 : 500, fontSize: '13px', cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                {day.slice(0, 3)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      <button onClick={handleSave} disabled={saving} style={{
        width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
        background: saved ? '#22c55e' : saving ? '#e5e7eb' : 'linear-gradient(135deg, #ef4444, #dc2626)',
        color: 'white', fontWeight: 700, fontSize: '15px',
        cursor: saving ? 'not-allowed' : 'pointer',
        boxShadow: saving ? 'none' : '0 4px 12px rgba(239,68,68,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        transition: 'all 0.2s'
      }}>
        {saving ? <><FaSpinner size={14} className="animate-spin" /> Saving...</>
          : saved ? <><FaCog size={14} /> Saved!</>
          : <><FaSave size={14} /> Save Settings</>}
      </button>
    </div>
  );
}

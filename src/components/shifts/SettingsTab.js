'use client';

import { useState, useEffect } from 'react';
import { FaCog, FaClock, FaPlus, FaTrash, FaSave, FaSpinner, FaSun, FaMoon, FaBell, FaUsers, FaWhatsapp, FaMobileAlt } from 'react-icons/fa';
import apiClient from '../../lib/api';
import { DEFAULT_SHIFT_SETTINGS, DAYS_FULL, rotaRoles, titleCase } from './constants';

// WhatsApp template languages (Meta language codes). A template must be approved by Meta in each
// language it is sent in; when the chosen one isn't, the server sends the English template instead.
const WA_LANGUAGES = [
  ['en', 'English'], ['en_US', 'English (US)'], ['hi', 'Hindi'], ['ta', 'Tamil'], ['te', 'Telugu'], ['kn', 'Kannada'],
  ['ml', 'Malayalam'], ['mr', 'Marathi'], ['bn', 'Bengali'], ['gu', 'Gujarati'], ['pa', 'Punjabi'], ['ur', 'Urdu'],
  ['ar', 'Arabic'], ['sw', 'Swahili'], ['fr', 'French'], ['es', 'Spanish'], ['pt_BR', 'Portuguese (Brazil)'], ['id', 'Indonesian'],
];
const fmtWhen = (iso) => { try { return new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };

export default function SettingsTab({ restaurantId, shiftSettings, setShiftSettings, settingsLoaded = true, onRetryLoad, isMobile, staff = [] }) {
  const [newRole, setNewRole] = useState('');
  // Last WhatsApp result from the server (sent / sent in English / why it failed).
  const [waStatus, setWaStatus] = useState(null);
  useEffect(() => {
    if (!restaurantId) return;
    let alive = true;
    apiClient.getShiftSettings(restaurantId).then(r => { if (alive) setWaStatus(r?.whatsappStatus || null); }).catch(() => {});
    return () => { alive = false; };
  }, [restaurantId]);
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

  const notif = { ...DEFAULT_SHIFT_SETTINGS.notifications, ...(settings.notifications || {}) };
  const setNotif = (k, v) => update('notifications', { ...notif, [k]: v });
  const roles = rotaRoles(staff, settings.extraRoles);

  // Per-role requirement on a shift type, e.g. Dinner: waiter 2, cashier 1, cleaner 1.
  const setRoleCount = (i, role, count) => {
    const st = (settings.shiftTypes || [])[i] || {};
    const req = { ...(st.requiredRoles || {}) };
    if (count > 0) req[role] = count; else delete req[role];
    const total = Object.values(req).reduce((a, v) => a + (Number(v) || 0), 0);
    const updated = [...(settings.shiftTypes || [])];
    updated[i] = { ...st, requiredRoles: req, requiredEmployees: total || st.requiredEmployees || 1 };
    update('shiftTypes', updated);
  };
  const renameRole = (i, from, to) => {
    const st = (settings.shiftTypes || [])[i] || {};
    const req = { ...(st.requiredRoles || {}) };
    const n = req[from] || 1; delete req[from];
    if (to) req[to] = (req[to] || 0) + n;
    const updated = [...(settings.shiftTypes || [])];
    updated[i] = { ...st, requiredRoles: req };
    update('shiftTypes', updated);
  };

  const handleSave = async () => {
    if (!restaurantId) return;
    // Never save the placeholder defaults over settings that failed to load.
    if (!settingsLoaded) return;
    setSaving(true);
    try {
      const r = await apiClient.updateShiftSettings(restaurantId, settings);
      if (r?.settings) setShiftSettings(r.settings);
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
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Start</label>
                <input type="time" value={st.startTime} onChange={e => updateShiftType(i, 'startTime', e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>End</label>
                <input type="time" value={st.endTime} onChange={e => updateShiftType(i, 'endTime', e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Total staff</label>
                {Object.keys(st.requiredRoles || {}).length > 0 ? (
                  <div style={{ ...inputStyle, backgroundColor: '#f3f4f6', color: '#374151', fontWeight: 700 }}>{Object.values(st.requiredRoles).reduce((a, v) => a + (Number(v) || 0), 0)}</div>
                ) : (
                  <input type="number" min={1} value={st.requiredEmployees || 2}
                    onChange={e => updateShiftType(i, 'requiredEmployees', Number(e.target.value))} style={inputStyle} />
                )}
              </div>
            </div>

            {/* Staff needed per role */}
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#6b7280', marginBottom: '6px' }}>STAFF NEEDED PER ROLE</div>
              {Object.entries(st.requiredRoles || {}).map(([role, count]) => (
                <div key={role} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                  <select value={role} onChange={e => renameRole(i, role, e.target.value)} style={{ ...inputStyle, flex: 2 }}>
                    {[...new Set([...roles, role])].map(r => <option key={r} value={r}>{titleCase(r)}</option>)}
                  </select>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                    <button type="button" onClick={() => setRoleCount(i, role, (Number(count) || 0) - 1)} style={{ width: '32px', height: '36px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontWeight: 700 }}>−</button>
                    <div style={{ minWidth: '28px', textAlign: 'center', fontWeight: 700 }}>{count}</div>
                    <button type="button" onClick={() => setRoleCount(i, role, (Number(count) || 0) + 1)} style={{ width: '32px', height: '36px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontWeight: 700 }}>+</button>
                  </div>
                  <button type="button" onClick={() => setRoleCount(i, role, 0)} style={{ padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: '#fee2e2', color: '#dc2626', cursor: 'pointer' }}><FaTrash size={11} /></button>
                </div>
              ))}
              {(() => {
                const unused = roles.filter(r => !(st.requiredRoles || {})[r]);
                return unused.length > 0 && (
                  <select value="" onChange={e => e.target.value && setRoleCount(i, e.target.value, 1)}
                    style={{ ...inputStyle, width: 'auto', backgroundColor: 'white', color: '#374151', fontSize: '13px' }}>
                    <option value="">+ Add a role (e.g. {titleCase(unused[0])})</option>
                    {unused.map(r => <option key={r} value={r}>{titleCase(r)}</option>)}
                  </select>
                );
              })()}
            </div>
          </div>
        ))}
      </div>

      {/* Roles */}
      <div style={sectionStyle}>
        {sectionTitle(<FaUsers size={16} color="white" />, 'Roles', 'Roles come from your staff. Add ones you plan for but have not hired yet (e.g. Cleaner).')}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
          {roles.map(r => {
            const custom = (settings.extraRoles || []).includes(r);
            return (
              <span key={r} style={{ padding: '5px 10px', borderRadius: '14px', fontSize: '12.5px', fontWeight: 600, background: custom ? '#ecfccb' : '#f3f4f6', color: custom ? '#3f6212' : '#374151', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                {titleCase(r)}
                {custom && <button type="button" onClick={() => update('extraRoles', (settings.extraRoles || []).filter(x => x !== r))} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#65a30d', padding: 0, fontSize: '13px' }}>×</button>}
              </span>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input value={newRole} onChange={e => setNewRole(e.target.value)} placeholder="New role, e.g. Dishwasher" style={{ ...inputStyle, flex: 1 }} />
          <button type="button" onClick={() => { const r = newRole.trim().toLowerCase(); if (r) { update('extraRoles', [...new Set([...(settings.extraRoles || []), r])]); setNewRole(''); } }}
            style={{ padding: '8px 14px', borderRadius: '10px', border: 'none', background: '#f3f4f6', color: '#374151', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}><FaPlus size={10} /> Add</button>
        </div>
      </div>

      {/* Notifications */}
      <div style={sectionStyle}>
        {sectionTitle(<FaBell size={16} color="white" />, 'Send schedule to staff', 'When you publish or change a shift, staff are told on their phone')}
        {[
          ['push', <FaMobileAlt key="i" size={14} color="#2563eb" />, 'App notification', 'Free. Staff get it in the DineOpen app (Menu → My Shifts). Needs the latest app version.'],
          ['whatsapp', <FaWhatsapp key="i" size={15} color="#16a34a" />, 'WhatsApp message', 'Sent to the staff phone number. Uses your WhatsApp number (or DineOpen\'s). Meta charges per message, and the message template must be approved by Meta.'],
        ].map(([k, icon, title, desc]) => (
          <div key={k} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ paddingTop: '2px' }}>{icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{title}</div>
              <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.5 }}>{desc}</div>
              {k === 'whatsapp' && notif.whatsapp && (
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: '8px', marginTop: '8px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Approved template name</label>
                    <input value={notif.whatsappTemplate || ''} onChange={e => setNotif('whatsappTemplate', e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Language</label>
                    <select value={notif.whatsappLanguage || 'en'} onChange={e => setNotif('whatsappLanguage', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                      {WA_LANGUAGES.map(([code, name]) => <option key={code} value={code}>{name} ({code})</option>)}
                      {!WA_LANGUAGES.some(([c]) => c === (notif.whatsappLanguage || 'en')) && <option value={notif.whatsappLanguage}>{notif.whatsappLanguage}</option>}
                    </select>
                  </div>
                  <div style={{ gridColumn: '1 / -1', fontSize: '11.5px', color: '#6b7280', lineHeight: 1.5 }}>
                    Template body with 3 variables, e.g. <i>&quot;Hi {'{{1}}'}, {'{{2}}'}: {'{{3}}'}&quot;</i> — name, restaurant, shift details. Meta must approve the template in this language; if it isn&apos;t approved in it yet, the English template is sent instead. With no approved template at all, a plain message is tried (WhatsApp only delivers it if the staff member messaged you in the last 24 hours).
                  </div>
                  {(() => {
                    const st = waStatus || {};
                    const errNewer = st.lastErrorAt && (!st.lastOkAt || st.lastErrorAt > st.lastOkAt);
                    const noteRecent = !errNewer && st.lastNote && st.lastNoteAt && st.lastOkAt && st.lastNoteAt >= st.lastOkAt;
                    if (!st.lastErrorAt && !st.lastOkAt) return null;
                    const box = (bg, border, color, text) => (
                      <div style={{ gridColumn: '1 / -1', fontSize: '12px', lineHeight: 1.5, background: bg, border: `1px solid ${border}`, color, borderRadius: '8px', padding: '8px 10px' }}>{text}</div>
                    );
                    if (errNewer) return box('#fef2f2', '#fecaca', '#991b1b', <>Last WhatsApp message failed ({fmtWhen(st.lastErrorAt)}): {st.lastError}. Staff still get the app notification.</>);
                    if (noteRecent) return box('#fffbeb', '#fde68a', '#92400e', <>Last WhatsApp sent {fmtWhen(st.lastOkAt)} — {st.lastNote}. Ask for the template to be approved in this language to send it in that language.</>);
                    return box('#f0fdf4', '#bbf7d0', '#166534', <>Last WhatsApp sent {fmtWhen(st.lastOkAt)}{st.lastVia === 'text' ? ' as a plain message (delivered only if they messaged you in the last 24 hours)' : ''}.</>);
                  })()}
                </div>
              )}
            </div>
            <button type="button" onClick={() => setNotif(k, !notif[k])} style={{ width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer', backgroundColor: notif[k] ? '#22c55e' : '#d1d5db', position: 'relative', flexShrink: 0 }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '10px', backgroundColor: 'white', position: 'absolute', top: '2px', left: notif[k] ? '22px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px 0 0' }}>
          <FaClock size={14} color="#9333ea" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>Reminder before shift</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              Remind staff{' '}
              <select value={notif.reminderMinutes || 60} onChange={e => setNotif('reminderMinutes', Number(e.target.value))} style={{ padding: '2px 6px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                {[15, 30, 60, 90, 120].map(m => <option key={m} value={m}>{m} min</option>)}
              </select>{' '}before their shift starts
            </div>
          </div>
          <button type="button" onClick={() => setNotif('remindersEnabled', !notif.remindersEnabled)} style={{ width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer', backgroundColor: notif.remindersEnabled ? '#22c55e' : '#d1d5db', position: 'relative', flexShrink: 0 }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '10px', backgroundColor: 'white', position: 'absolute', top: '2px', left: notif.remindersEnabled ? '22px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
          </button>
        </div>
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

      {!settingsLoaded && (
        <div style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
          <span>Your saved shift settings didn&apos;t load, so saving is off (it would replace them with these defaults).</span>
          {onRetryLoad && (
            <button onClick={onRetryLoad} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #fca5a5', background: '#fff', color: '#b91c1c', fontWeight: 700, cursor: 'pointer' }}>Retry</button>
          )}
        </div>
      )}

      {/* Save Button */}
      <button onClick={handleSave} disabled={saving || !settingsLoaded} style={{
        width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
        background: saved ? '#22c55e' : (saving || !settingsLoaded) ? '#e5e7eb' : 'linear-gradient(135deg, #ef4444, #dc2626)',
        color: 'white', fontWeight: 700, fontSize: '15px',
        cursor: (saving || !settingsLoaded) ? 'not-allowed' : 'pointer',
        boxShadow: (saving || !settingsLoaded) ? 'none' : '0 4px 12px rgba(239,68,68,0.3)',
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

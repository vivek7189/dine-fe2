'use client';

import { useEffect, useState } from 'react';
import { FaUserShield, FaHeartbeat, FaBriefcase, FaPlus, FaTrash, FaSave, FaLock } from 'react-icons/fa';
import apiClient from '../lib/api';

/**
 * StaffProfile — a staff member's HR profile: personal & emergency contact, health, experience.
 * Self-contained (like StaffDocuments): loads / saves via /api/staff/:staffId/profile, owner / admin only.
 * Health details are confidential — they are never part of the staff list or other screens.
 */
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const CONDITIONS = [
  ['diabetes', 'Diabetes'], ['high_bp', 'High blood pressure'], ['high_cholesterol', 'High cholesterol'],
  ['asthma', 'Asthma'], ['heart', 'Heart condition'], ['thyroid', 'Thyroid'], ['epilepsy', 'Epilepsy'], ['kidney', 'Kidney condition'],
];
const EMPTY = {
  dateOfBirth: '', address: '',
  emergencyContact: { name: '', relation: '', phone: '' },
  health: { bloodGroup: '', conditions: [], otherConditions: '', medication: '', allergies: '' },
  experience: { totalYears: null, specialization: '', previous: [], notes: '' },
};
const merge = (p) => ({
  ...EMPTY, ...(p || {}),
  emergencyContact: { ...EMPTY.emergencyContact, ...((p && p.emergencyContact) || {}) },
  health: { ...EMPTY.health, ...((p && p.health) || {}) },
  experience: { ...EMPTY.experience, ...((p && p.experience) || {}) },
});

export default function StaffProfile({ staffId, canEdit = true, isMobile = false }) {
  const [profile, setProfile] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState(null); // { type: 'ok' | 'err', text }
  const [updatedAt, setUpdatedAt] = useState(null);

  useEffect(() => {
    if (!staffId) return;
    let alive = true;
    setLoading(true); setMsg(null); setDirty(false);
    apiClient.getStaffProfile(staffId)
      .then(r => { if (alive) { setProfile(merge(r?.profile)); setUpdatedAt(r?.updatedAt || null); } })
      .catch(err => { if (alive) setMsg({ type: 'err', text: err?.message || 'Could not load the profile.' }); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [staffId]);

  const set = (path, value) => {
    setProfile(prev => {
      const next = merge(prev);
      const keys = path.split('.');
      let o = next;
      for (let i = 0; i < keys.length - 1; i++) o = o[keys[i]];
      o[keys[keys.length - 1]] = value;
      return { ...next };
    });
    setDirty(true); setMsg(null);
  };
  const toggleCondition = (key) => {
    const cur = profile.health.conditions || [];
    set('health.conditions', cur.includes(key) ? cur.filter(c => c !== key) : [...cur, key]);
  };
  const setPrev = (i, field, value) => {
    const list = [...(profile.experience.previous || [])];
    list[i] = { ...list[i], [field]: value };
    set('experience.previous', list);
  };

  const save = async () => {
    setSaving(true); setMsg(null);
    try {
      const r = await apiClient.saveStaffProfile(staffId, profile);
      setProfile(merge(r?.profile)); setUpdatedAt(r?.updatedAt || null); setDirty(false);
      setMsg({ type: 'ok', text: 'Profile saved.' });
    } catch (err) {
      setMsg({ type: 'err', text: err?.message || 'Could not save the profile.' });
    } finally {
      setSaving(false);
    }
  };

  const box = { backgroundColor: '#f8fafc', padding: isMobile ? '12px' : '16px', borderRadius: '12px', border: '1px solid #f1f5f9', marginTop: '16px' };
  const input = { width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: canEdit ? '#fff' : '#f9fafb', boxSizing: 'border-box' };
  const label = { fontSize: 11, color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: 4 };
  const grid = { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10 };
  const section = (icon, title, extra) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0 8px', fontSize: 13, fontWeight: 700, color: '#374151' }}>
      {icon}{title}{extra}
    </div>
  );
  const field = (lbl, el) => <div><label style={label}>{lbl}</label>{el}</div>;
  const ro = !canEdit;

  return (
    <div style={box}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <h3 style={{ fontWeight: '600', color: '#1f2937', margin: 0, fontSize: isMobile ? '14px' : '16px' }}>Staff Profile</h3>
        {canEdit && (
          <button onClick={save} disabled={saving || loading || !dirty} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8, border: 'none', background: saving || !dirty ? '#93c5fd' : '#2563eb', color: '#fff', fontWeight: 700, fontSize: 12, cursor: saving || !dirty ? 'default' : 'pointer' }}>
            <FaSave size={11} /> {saving ? 'Saving…' : 'Save profile'}
          </button>
        )}
      </div>
      {updatedAt && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Last updated {new Date(updatedAt).toLocaleString()}</div>}
      {msg && <div style={{ background: msg.type === 'ok' ? '#f0fdf4' : '#fef2f2', color: msg.type === 'ok' ? '#166534' : '#b91c1c', padding: '6px 10px', borderRadius: 6, fontSize: 12, marginTop: 8 }}>{msg.text}</div>}

      {loading ? (
        <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 10 }}>Loading…</div>
      ) : (
        <>
          {section(<FaUserShield color="#2563eb" />, 'Personal & emergency contact')}
          <div style={grid}>
            {field('Date of birth', <input type="date" disabled={ro} value={profile.dateOfBirth || ''} onChange={e => set('dateOfBirth', e.target.value)} style={input} />)}
            {field('Address', <textarea disabled={ro} rows={2} value={profile.address || ''} onChange={e => set('address', e.target.value)} style={{ ...input, resize: 'vertical' }} />)}
            {field('Next of kin — name', <input disabled={ro} value={profile.emergencyContact.name} onChange={e => set('emergencyContact.name', e.target.value)} style={input} />)}
            {field('Relationship', <input disabled={ro} placeholder="e.g. Wife, Father" value={profile.emergencyContact.relation} onChange={e => set('emergencyContact.relation', e.target.value)} style={input} />)}
            {field('Next of kin — phone', <input disabled={ro} type="tel" value={profile.emergencyContact.phone} onChange={e => set('emergencyContact.phone', e.target.value)} style={input} />)}
          </div>

          {section(<FaHeartbeat color="#dc2626" />, 'Health', <span style={{ fontSize: 11, fontWeight: 500, color: '#9ca3af', display: 'inline-flex', alignItems: 'center', gap: 4 }}><FaLock size={9} /> Confidential — owner / admin only</span>)}
          <div style={grid}>
            {field('Blood group', (
              <select disabled={ro} value={profile.health.bloodGroup || ''} onChange={e => set('health.bloodGroup', e.target.value)} style={{ ...input, cursor: ro ? 'default' : 'pointer' }}>
                <option value="">Not known</option>
                {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            ))}
            {field('Allergies', <input disabled={ro} placeholder="e.g. Peanuts, Penicillin" value={profile.health.allergies} onChange={e => set('health.allergies', e.target.value)} style={input} />)}
          </div>
          <div style={{ marginTop: 10 }}>
            <label style={label}>Conditions</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {CONDITIONS.map(([key, name]) => {
                const on = (profile.health.conditions || []).includes(key);
                return (
                  <button key={key} type="button" disabled={ro} onClick={() => toggleCondition(key)}
                    style={{ padding: '5px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: ro ? 'default' : 'pointer', border: `1.5px solid ${on ? '#dc2626' : '#e5e7eb'}`, background: on ? '#fef2f2' : '#fff', color: on ? '#b91c1c' : '#374151' }}>
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ ...grid, marginTop: 10 }}>
            {field('Other conditions', <input disabled={ro} value={profile.health.otherConditions} onChange={e => set('health.otherConditions', e.target.value)} style={input} />)}
            {field('Medication', <input disabled={ro} placeholder="Regular medicines, dose" value={profile.health.medication} onChange={e => set('health.medication', e.target.value)} style={input} />)}
          </div>

          {section(<FaBriefcase color="#7c3aed" />, 'Experience')}
          <div style={grid}>
            {field('Total experience (years)', <input disabled={ro} type="number" min="0" max="60" step="0.5" value={profile.experience.totalYears ?? ''} onChange={e => set('experience.totalYears', e.target.value === '' ? null : Number(e.target.value))} style={input} />)}
            {field('Specialization', <input disabled={ro} placeholder="e.g. Tandoor, South Indian, Barista" value={profile.experience.specialization} onChange={e => set('experience.specialization', e.target.value)} style={input} />)}
          </div>
          <div style={{ marginTop: 10 }}>
            <label style={label}>Previous employment</label>
            {(profile.experience.previous || []).length === 0 && <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>None added.</div>}
            {(profile.experience.previous || []).map((p, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '2fr 1.5fr 1fr 1fr auto', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                <input disabled={ro} placeholder="Employer" value={p.employer || ''} onChange={e => setPrev(i, 'employer', e.target.value)} style={input} />
                <input disabled={ro} placeholder="Role" value={p.role || ''} onChange={e => setPrev(i, 'role', e.target.value)} style={input} />
                <input disabled={ro} type="month" title="From" value={p.from || ''} onChange={e => setPrev(i, 'from', e.target.value)} style={input} />
                <input disabled={ro} type="month" title="To" value={p.to || ''} onChange={e => setPrev(i, 'to', e.target.value)} style={input} />
                {canEdit && <button type="button" title="Remove" onClick={() => set('experience.previous', profile.experience.previous.filter((_, j) => j !== i))} style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid #e5e7eb', background: '#fff', color: '#b91c1c', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><FaTrash size={10} /></button>}
              </div>
            ))}
            {canEdit && (profile.experience.previous || []).length < 10 && (
              <button type="button" onClick={() => set('experience.previous', [...(profile.experience.previous || []), { employer: '', role: '', from: '', to: '' }])}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, border: '1px dashed #c4b5fd', background: '#faf5ff', color: '#6d28d9', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                <FaPlus size={10} /> Add previous job
              </button>
            )}
          </div>
          <div style={{ marginTop: 10 }}>
            {field('Notes', <textarea disabled={ro} rows={2} value={profile.experience.notes} onChange={e => set('experience.notes', e.target.value)} style={{ ...input, resize: 'vertical' }} />)}
          </div>
        </>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { FaUserShield, FaHeartbeat, FaBriefcase, FaPlus, FaTrash, FaSave, FaLock } from 'react-icons/fa';
import apiClient from '../lib/api';

/**
 * StaffProfile — a staff member's HR profile: personal & emergency contact, health, experience.
 * Self-contained (like StaffDocuments). `self` → the signed-in person's own (/api/staff/me/profile),
 * else `staffId` (/api/staff/:staffId/profile). What can be changed comes from the server
 * (access.edit: 'personal' | 'health' | 'experience' — utils/staffProfileAccess); `canEdit` can only
 * narrow it. Health details are confidential — never part of the staff list or other screens.
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

export default function StaffProfile({ staffId, self = false, canEdit = true, isMobile = false, title }) {
  const [profile, setProfile] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState(null); // { type: 'ok' | 'err', text }
  const [updatedAt, setUpdatedAt] = useState(null);
  const [editable, setEditable] = useState([]); // sections the server lets this viewer change

  useEffect(() => {
    if (!self && !staffId) return;
    let alive = true;
    setLoading(true); setMsg(null); setDirty(false); setEditable([]);
    (self ? apiClient.getMyStaffProfile() : apiClient.getStaffProfile(staffId))
      .then(r => { if (alive) { setProfile(merge(r?.profile)); setUpdatedAt(r?.updatedAt || null); setEditable(canEdit ? (r?.access?.edit || []) : []); } })
      .catch(err => { if (alive) setMsg({ type: 'err', text: err?.message || 'Could not load the profile.' }); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [staffId, self, canEdit]);
  const can = (section) => editable.includes(section);
  const anyEdit = editable.length > 0;

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
      const r = self ? await apiClient.saveMyStaffProfile(profile) : await apiClient.saveStaffProfile(staffId, profile);
      setProfile(merge(r?.profile)); setUpdatedAt(r?.updatedAt || null); setDirty(false);
      if (r?.access?.edit) setEditable(canEdit ? r.access.edit : []);
      setMsg({ type: 'ok', text: 'Profile saved.' });
    } catch (err) {
      setMsg({ type: 'err', text: err?.message || 'Could not save the profile.' });
    } finally {
      setSaving(false);
    }
  };

  const box = { backgroundColor: '#f8fafc', padding: isMobile ? '12px' : '16px', borderRadius: '12px', border: '1px solid #f1f5f9', marginTop: '16px' };
  const input = { width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#fff', boxSizing: 'border-box' };
  const label = { fontSize: 11, color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: 4 };
  const grid = { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10 };
  const section = (icon, title, extra) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0 8px', fontSize: 13, fontWeight: 700, color: '#374151' }}>
      {icon}{title}{extra}
    </div>
  );
  const field = (lbl, el) => <div><label style={label}>{lbl}</label>{el}</div>;
  const readOnlyNote = (section) => (!can(section) && anyEdit ? <span style={{ fontSize: 11, fontWeight: 500, color: '#9ca3af' }}>· view only</span> : null);

  return (
    <div style={box}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <h3 style={{ fontWeight: '600', color: '#1f2937', margin: 0, fontSize: isMobile ? '14px' : '16px' }}>{title || (self ? 'My Profile' : 'Staff Profile')}</h3>
        {anyEdit && (
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
          {section(<FaUserShield color="#2563eb" />, 'Personal & emergency contact', readOnlyNote('personal'))}
          <div style={grid}>
            {field('Date of birth', <input type="date" disabled={!can('personal')} value={profile.dateOfBirth || ''} onChange={e => set('dateOfBirth', e.target.value)} style={input} />)}
            {field('Address', <textarea disabled={!can('personal')} rows={2} value={profile.address || ''} onChange={e => set('address', e.target.value)} style={{ ...input, resize: 'vertical' }} />)}
            {field('Next of kin — name', <input disabled={!can('personal')} value={profile.emergencyContact.name} onChange={e => set('emergencyContact.name', e.target.value)} style={input} />)}
            {field('Relationship', <input disabled={!can('personal')} placeholder="e.g. Wife, Father" value={profile.emergencyContact.relation} onChange={e => set('emergencyContact.relation', e.target.value)} style={input} />)}
            {field('Next of kin — phone', <input disabled={!can('personal')} type="tel" value={profile.emergencyContact.phone} onChange={e => set('emergencyContact.phone', e.target.value)} style={input} />)}
          </div>

          {section(<FaHeartbeat color="#dc2626" />, 'Health', <span style={{ fontSize: 11, fontWeight: 500, color: '#9ca3af', display: 'inline-flex', alignItems: 'center', gap: 4 }}><FaLock size={9} /> Confidential — only {self ? 'you, the owner and your manager' : 'this person, the owner and their manager'} can see it</span>)}
          <div style={grid}>
            {field('Blood group', (
              <select disabled={!can('health')} value={profile.health.bloodGroup || ''} onChange={e => set('health.bloodGroup', e.target.value)} style={{ ...input, cursor: can('health') ? 'pointer' : 'default' }}>
                <option value="">Not known</option>
                {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            ))}
            {field('Allergies', <input disabled={!can('health')} placeholder="e.g. Peanuts, Penicillin" value={profile.health.allergies} onChange={e => set('health.allergies', e.target.value)} style={input} />)}
          </div>
          <div style={{ marginTop: 10 }}>
            <label style={label}>Conditions</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {CONDITIONS.map(([key, name]) => {
                const on = (profile.health.conditions || []).includes(key);
                return (
                  <button key={key} type="button" disabled={!can('health')} onClick={() => toggleCondition(key)}
                    style={{ padding: '5px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: can('health') ? 'pointer' : 'default', border: `1.5px solid ${on ? '#dc2626' : '#e5e7eb'}`, background: on ? '#fef2f2' : '#fff', color: on ? '#b91c1c' : '#374151' }}>
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ ...grid, marginTop: 10 }}>
            {field('Other conditions', <input disabled={!can('health')} value={profile.health.otherConditions} onChange={e => set('health.otherConditions', e.target.value)} style={input} />)}
            {field('Medication', <input disabled={!can('health')} placeholder="Regular medicines, dose" value={profile.health.medication} onChange={e => set('health.medication', e.target.value)} style={input} />)}
          </div>

          {section(<FaBriefcase color="#7c3aed" />, 'Experience', readOnlyNote('experience'))}
          <div style={grid}>
            {field('Total experience (years)', <input disabled={!can('experience')} type="number" min="0" max="60" step="0.5" value={profile.experience.totalYears ?? ''} onChange={e => set('experience.totalYears', e.target.value === '' ? null : Number(e.target.value))} style={input} />)}
            {field('Specialization', <input disabled={!can('experience')} placeholder="e.g. Tandoor, South Indian, Barista" value={profile.experience.specialization} onChange={e => set('experience.specialization', e.target.value)} style={input} />)}
          </div>
          <div style={{ marginTop: 10 }}>
            <label style={label}>Previous employment</label>
            {(profile.experience.previous || []).length === 0 && <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>None added.</div>}
            {(profile.experience.previous || []).map((p, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '2fr 1.5fr 1fr 1fr auto', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                <input disabled={!can('experience')} placeholder="Employer" value={p.employer || ''} onChange={e => setPrev(i, 'employer', e.target.value)} style={input} />
                <input disabled={!can('experience')} placeholder="Role" value={p.role || ''} onChange={e => setPrev(i, 'role', e.target.value)} style={input} />
                <input disabled={!can('experience')} type="month" title="From" value={p.from || ''} onChange={e => setPrev(i, 'from', e.target.value)} style={input} />
                <input disabled={!can('experience')} type="month" title="To" value={p.to || ''} onChange={e => setPrev(i, 'to', e.target.value)} style={input} />
                {can('experience') && <button type="button" title="Remove" onClick={() => set('experience.previous', profile.experience.previous.filter((_, j) => j !== i))} style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid #e5e7eb', background: '#fff', color: '#b91c1c', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><FaTrash size={10} /></button>}
              </div>
            ))}
            {can('experience') && (profile.experience.previous || []).length < 10 && (
              <button type="button" onClick={() => set('experience.previous', [...(profile.experience.previous || []), { employer: '', role: '', from: '', to: '' }])}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, border: '1px dashed #c4b5fd', background: '#faf5ff', color: '#6d28d9', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                <FaPlus size={10} /> Add previous job
              </button>
            )}
          </div>
          <div style={{ marginTop: 10 }}>
            {field('Notes', <textarea disabled={!can('experience')} rows={2} value={profile.experience.notes} onChange={e => set('experience.notes', e.target.value)} style={{ ...input, resize: 'vertical' }} />)}
          </div>
        </>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { FaTimes, FaIdCard } from 'react-icons/fa';
import apiClient from '../../../../lib/api';
import StaffProfile from '../../../../components/StaffProfile';

/**
 * Books → Appraisals → Staff profiles: pick a staff member and open their HR profile (personal,
 * next of kin, health, experience). The list holds only the people this user may open — the server
 * decides (owner / admin: everyone; managers: the staff they manage) — /api/staff-profiles/:rid.
 */
export default function StaffProfilesModal({ restaurantId, isMobile, onClose }) {
  const [list, setList] = useState(null);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState('');

  useEffect(() => {
    let alive = true;
    apiClient.getStaffProfilesList(restaurantId)
      .then(r => { if (!alive) return; const s = r?.staff || []; setList(s); if (s.length) setSelected(s[0].id); })
      .catch(e => { if (alive) { setList([]); setError(e?.message || 'Could not load staff.'); } });
    return () => { alive = false; };
  }, [restaurantId]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10003, padding: 12 }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 820, maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FaIdCard color="#2563eb" />
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#111827' }}>Staff profiles</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Personal details, next of kin, health and experience.</div>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ border: 'none', background: '#f3f4f6', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><FaTimes /></button>
        </div>
        <div style={{ padding: '12px 18px 18px', overflowY: 'auto' }}>
          {list === null ? (
            <div style={{ fontSize: 13, color: '#9ca3af' }}>Loading…</div>
          ) : error ? (
            <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '8px 12px', borderRadius: 8, fontSize: 13 }}>{error}</div>
          ) : list.length === 0 ? (
            <div style={{ fontSize: 13, color: '#6b7280' }}>No staff you can view.</div>
          ) : (
            <>
              <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: 4 }}>Staff member</label>
              <select value={selected} onChange={e => setSelected(e.target.value)} style={{ width: '100%', padding: '9px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}>
                {list.map(s => <option key={s.id} value={s.id}>{s.name || 'Staff'}{s.role ? ` · ${s.role}` : ''}{s.self ? ' (you)' : ''}{s.hasProfile ? '' : ' — not filled yet'}</option>)}
              </select>
              {selected && <StaffProfile key={selected} staffId={selected} isMobile={isMobile} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

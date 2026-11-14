'use client';

// Staff meetings (plan, agenda, minutes, reminders) on their own page — for a staff member the owner
// ticked "Staff Meetings" in Staff → Page access, who must not get the rest of Books (P&L, payroll).
// Owners and managers keep using Books → Meetings; this page works for them too. The server allows
// the same people (backend routes/staffMeetings.js isManager).
import { useEffect, useState } from 'react';
import apiClient from '../../../lib/api';
import MeetingsTab from '../books/components/MeetingsTab';

export default function MeetingsPage() {
  const [restaurantId, setRestaurantId] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    try { setRestaurantId(localStorage.getItem('selectedRestaurantId')); } catch { /* none */ }
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    const onRestaurant = (e) => { if (e.detail?.restaurantId) setRestaurantId(e.detail.restaurantId); };
    window.addEventListener('restaurantChanged', onRestaurant);
    return () => { window.removeEventListener('resize', onResize); window.removeEventListener('restaurantChanged', onRestaurant); };
  }, []);

  // The full staff list is owner-only; others get the active-staff list (names + roles for invites).
  useEffect(() => {
    if (!restaurantId) return;
    apiClient.getStaff(restaurantId)
      .then(r => r?.staff || [])
      .catch(() => apiClient.getWaiters(restaurantId).then(r => (r?.waiters || []).map(w => ({ ...w, status: 'active' }))))
      .then(list => setStaffList((list || []).filter(s => !s.status || s.status === 'active')))
      .catch(() => setStaffList([]));
  }, [restaurantId]);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: isMobile ? '16px' : '24px 32px' }}>
      <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 800, color: '#111827', margin: '0 0 16px' }}>Staff meetings</h1>
      {restaurantId && <MeetingsTab restaurantId={restaurantId} apiClient={apiClient} staffList={staffList} isMobile={isMobile} />}
    </div>
  );
}

'use client';

// My dates for the phone app (opened inside the app): birthday, wedding anniversary and important
// days (prayer, wedding, child birth…) so the manager can plan the rota around them.
import { useEffect, useState } from 'react';
import StaffDatesEditor from '../../../components/shifts/StaffDatesEditor';

export default function MobileMyDatesPage() {
  const [rid, setRid] = useState(null);
  useEffect(() => { try { setRid(localStorage.getItem('selectedRestaurantId')); } catch (_) {} }, []);
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 16 }}>
      <h1 style={{ fontSize: 21, fontWeight: 800, color: '#111827', margin: '4px 0 2px' }}>My dates</h1>
      <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 14px' }}>Your manager sees these when planning the rota, and gets a reminder the day before. To ask for leave, use Apply Leave.</p>
      {rid ? <StaffDatesEditor restaurantId={rid} self isMobile /> : <p style={{ fontSize: 13, color: '#6b7280' }}>Loading…</p>}
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

function formatTime12(t) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function getCurrentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function getStatusForNow(bookings) {
  const now = getCurrentTime();
  const current = bookings.find(b => b.startTime <= now && b.endTime > now);
  if (current) {
    return { type: 'in_use', booking: current };
  }
  // Find next booking
  const upcoming = bookings.filter(b => b.startTime > now).sort((a, b) => a.startTime.localeCompare(b.startTime));
  if (upcoming.length > 0) {
    return { type: 'available', nextBooking: upcoming[0] };
  }
  return { type: 'available', nextBooking: null };
}

// ═══════════════════════════════════════════════
// Display Board — designed for wall/tablet mount
// ═══════════════════════════════════════════════
export default function AvailabilityDisplayPage() {
  const { spaceId } = useParams();
  const [space, setSpace] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [operatingHours, setOperatingHours] = useState({ start: '08:00', end: '22:00' });
  const [clock, setClock] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  // Fetch data
  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/space-booking/availability/${spaceId}/today`);
      if (!res.ok) return;
      const data = await res.json();
      setSpace(data.space);
      setBookings(data.bookings || []);
      if (data.operatingHours) setOperatingHours(data.operatingHours);
    } catch (e) {
      console.error('Display board fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!spaceId) return;
    fetchData();
    // Refresh data every 60s
    const dataInterval = setInterval(fetchData, 60000);
    // Update clock every second
    const clockInterval = setInterval(() => setClock(new Date()), 1000);
    intervalRef.current = dataInterval;
    return () => {
      clearInterval(dataInterval);
      clearInterval(clockInterval);
    };
  }, [spaceId]);

  const status = getStatusForNow(bookings);
  const isAvailable = status.type === 'available';

  const timeStr = clock.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const dateStr = clock.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0f172a', display: 'flex',
        alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 20
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0f172a', color: '#fff',
      display: 'flex', flexDirection: 'column', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      overflow: 'hidden', userSelect: 'none'
    }}>
      {/* Top Bar — space name + clock */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 32px', borderBottom: '1px solid #1e293b'
      }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{space?.name || 'Meeting Room'}</div>
          <div style={{ fontSize: 14, color: '#64748b', marginTop: 2 }}>{dateStr}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 36, fontWeight: 300, fontVariantNumeric: 'tabular-nums', letterSpacing: 2 }}>
            {timeStr}
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <div style={{
        flex: '0 0 auto', padding: '32px 32px',
        background: isAvailable
          ? 'linear-gradient(135deg, #065f46 0%, #047857 100%)'
          : 'linear-gradient(135deg, #991b1b 0%, #dc2626 100%)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: 2 }}>
          {isAvailable ? 'AVAILABLE' : 'IN USE'}
        </div>
        <div style={{ fontSize: 18, marginTop: 8, opacity: 0.9 }}>
          {isAvailable
            ? (status.nextBooking
              ? `Next booking at ${formatTime12(status.nextBooking.startTime)}`
              : 'No more bookings today')
            : `Until ${formatTime12(status.booking.endTime)} — ${status.booking.name}${status.booking.company ? ` (${status.booking.company})` : ''}`
          }
        </div>
      </div>

      {/* Timeline */}
      <div style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>
        <div style={{ fontSize: 14, color: '#64748b', fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
          Today&apos;s Schedule
        </div>

        {bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#475569', fontSize: 16 }}>
            No bookings scheduled for today
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {bookings.map((b) => {
              const now = getCurrentTime();
              const isCurrent = b.startTime <= now && b.endTime > now;
              const isPast = b.endTime <= now;

              return (
                <div key={b.id} style={{
                  display: 'flex', alignItems: 'stretch', gap: 16,
                  padding: '14px 18px', borderRadius: 12,
                  background: isCurrent ? 'rgba(239,68,68,0.15)' : isPast ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)',
                  border: isCurrent ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  opacity: isPast ? 0.4 : 1, transition: 'all 0.3s'
                }}>
                  {/* Time strip */}
                  <div style={{
                    width: 4, borderRadius: 4, flexShrink: 0,
                    background: isCurrent ? '#ef4444' : isPast ? '#475569' : '#0d9488'
                  }} />
                  {/* Time */}
                  <div style={{ minWidth: 130 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                      {formatTime12(b.startTime)}
                    </div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>to {formatTime12(b.endTime)}</div>
                  </div>
                  {/* Details */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>{b.name}</div>
                    {b.company && <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{b.company}</div>}
                  </div>
                  {/* Status dot */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600,
                    color: isCurrent ? '#ef4444' : isPast ? '#475569' : '#0d9488'
                  }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: isCurrent ? '#ef4444' : isPast ? '#475569' : '#0d9488',
                      boxShadow: isCurrent ? '0 0 8px rgba(239,68,68,0.6)' : 'none',
                      animation: isCurrent ? 'pulse 2s infinite' : 'none'
                    }} />
                    {isCurrent ? 'NOW' : isPast ? 'DONE' : b.status === 'confirmed' ? 'CONFIRMED' : 'PENDING'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom QR hint */}
      <div style={{
        padding: '16px 32px', borderTop: '1px solid #1e293b',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 12, color: '#475569', fontSize: 13
      }}>
        Scan QR code or visit <span style={{ color: '#0d9488', fontWeight: 600 }}>/book-space/{spaceId}</span> to book this space
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

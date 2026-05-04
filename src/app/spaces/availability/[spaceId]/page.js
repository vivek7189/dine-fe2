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

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function getStatusForNow(bookings) {
  const now = getCurrentTime();
  const current = bookings.find(b => b.startTime <= now && b.endTime > now);
  if (current) {
    return { type: 'in_use', booking: current };
  }
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
    const dataInterval = setInterval(fetchData, 60000);
    const clockInterval = setInterval(() => setClock(new Date()), 1000);
    intervalRef.current = dataInterval;
    return () => {
      clearInterval(dataInterval);
      clearInterval(clockInterval);
    };
  }, [spaceId]);

  const status = getStatusForNow(bookings);
  const isAvailable = status.type === 'available';

  // Progress bar for current booking
  let progressPercent = 0;
  let minutesRemaining = 0;
  if (!isAvailable && status.booking) {
    const nowMin = timeToMinutes(getCurrentTime());
    const startMin = timeToMinutes(status.booking.startTime);
    const endMin = timeToMinutes(status.booking.endTime);
    const total = endMin - startMin;
    const elapsed = nowMin - startMin;
    progressPercent = total > 0 ? Math.min(100, Math.max(0, (elapsed / total) * 100)) : 0;
    minutesRemaining = Math.max(0, endMin - nowMin);
  }

  const timeStr = clock.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const dateStr = clock.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const frontendUrl = typeof window !== 'undefined' ? window.location.origin : 'https://dineopen.com';
  const bookingUrl = `${frontendUrl}/book-space/${spaceId}`;

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0f172a', display: 'flex',
        alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 20
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, border: '3px solid #1e293b', borderTopColor: '#0d9488',
            borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px'
          }} />
          Loading display board...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0f172a', color: '#fff',
      display: 'flex', flexDirection: 'column', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      overflow: 'hidden', userSelect: 'none'
    }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes glowRed {
          0%, 100% { box-shadow: 0 0 30px rgba(239,68,68,0.3); }
          50% { box-shadow: 0 0 60px rgba(239,68,68,0.5), 0 0 100px rgba(239,68,68,0.2); }
        }
        @keyframes glowGreen {
          0%, 100% { box-shadow: 0 0 30px rgba(16,185,129,0.2); }
          50% { box-shadow: 0 0 50px rgba(16,185,129,0.35), 0 0 80px rgba(16,185,129,0.15); }
        }
      `}</style>

      {/* Top Bar — space name + address + clock */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 32px', borderBottom: '1px solid #1e293b'
      }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{space?.name || 'Meeting Room'}</div>
          {space?.address && (
            <div style={{ fontSize: 14, color: '#64748b', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
              {space.address}{space.city ? `, ${space.city}` : ''}
            </div>
          )}
          <div style={{ fontSize: 14, color: '#475569', marginTop: 2 }}>{dateStr}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 36, fontWeight: 300, fontVariantNumeric: 'tabular-nums', letterSpacing: 2 }}>
            {timeStr}
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <div style={{
        flex: '0 0 auto', padding: '36px 32px',
        background: isAvailable
          ? 'linear-gradient(135deg, #065f46 0%, #047857 100%)'
          : 'linear-gradient(135deg, #991b1b 0%, #dc2626 100%)',
        textAlign: 'center',
        animation: isAvailable ? 'glowGreen 3s ease-in-out infinite' : 'glowRed 2.5s ease-in-out infinite'
      }}>
        <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: 4, lineHeight: 1.1 }}>
          {isAvailable ? 'AVAILABLE' : 'IN USE'}
        </div>
        <div style={{ fontSize: 18, marginTop: 10, opacity: 0.9 }}>
          {isAvailable
            ? (status.nextBooking
              ? `Next booking at ${formatTime12(status.nextBooking.startTime)}`
              : 'No more bookings today')
            : `Until ${formatTime12(status.booking.endTime)} — ${status.booking.name}${status.booking.company ? ` (${status.booking.company})` : ''}`
          }
        </div>
        {/* Time remaining + progress bar for current booking */}
        {!isAvailable && status.booking && (
          <div style={{ marginTop: 16, maxWidth: 400, margin: '16px auto 0' }}>
            <div style={{ fontSize: 14, fontWeight: 600, opacity: 0.85, marginBottom: 8 }}>
              {minutesRemaining > 0 ? `${minutesRemaining} min remaining` : 'Ending now'}
            </div>
            <div style={{
              height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.2)', overflow: 'hidden'
            }}>
              <div style={{
                height: '100%', borderRadius: 4,
                background: 'rgba(255,255,255,0.7)',
                width: `${progressPercent}%`,
                transition: 'width 1s linear'
              }} />
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', fontSize: 11, opacity: 0.6, marginTop: 4
            }}>
              <span>{formatTime12(status.booking.startTime)}</span>
              <span>{formatTime12(status.booking.endTime)}</span>
            </div>
          </div>
        )}
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

              // Per-booking progress
              let bookingProgress = 0;
              let bookingMinRemaining = 0;
              if (isCurrent) {
                const nowMin = timeToMinutes(now);
                const startMin = timeToMinutes(b.startTime);
                const endMin = timeToMinutes(b.endTime);
                const total = endMin - startMin;
                bookingProgress = total > 0 ? Math.min(100, Math.max(0, ((nowMin - startMin) / total) * 100)) : 0;
                bookingMinRemaining = Math.max(0, endMin - nowMin);
              }

              return (
                <div key={b.id} style={{
                  display: 'flex', alignItems: 'stretch', gap: 16,
                  padding: '14px 18px', borderRadius: 12,
                  background: isCurrent ? 'rgba(239,68,68,0.15)' : isPast ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)',
                  border: isCurrent ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  opacity: isPast ? 0.4 : 1, transition: 'all 0.3s',
                  position: 'relative', overflow: 'hidden'
                }}>
                  {/* Left accent bar */}
                  <div style={{
                    width: 6, borderRadius: 4, flexShrink: 0,
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
                    {/* Per-booking progress bar */}
                    {isCurrent && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{
                          height: 4, borderRadius: 2, background: 'rgba(239,68,68,0.2)', overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%', borderRadius: 2, background: '#ef4444',
                            width: `${bookingProgress}%`, transition: 'width 1s linear'
                          }} />
                        </div>
                        <div style={{ fontSize: 11, color: '#ef4444', marginTop: 3, fontWeight: 600 }}>
                          {bookingMinRemaining > 0 ? `${bookingMinRemaining} min remaining` : 'Ending now'}
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Status dot */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600,
                    color: isCurrent ? '#ef4444' : isPast ? '#475569' : '#0d9488',
                    alignSelf: 'flex-start', marginTop: 2
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

      {/* Bottom bar — booking URL + operating hours */}
      <div style={{
        padding: '16px 32px', borderTop: '1px solid #1e293b',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 16, color: '#475569', fontSize: 13, flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          Scan QR or visit <span style={{ color: '#0d9488', fontWeight: 600, fontFamily: 'monospace', fontSize: 12 }}>{bookingUrl}</span>
        </div>
        <div style={{ fontSize: 12, color: '#475569' }}>
          Open {formatTime12(operatingHours.start)} – {formatTime12(operatingHours.end)}
        </div>
      </div>
    </div>
  );
}

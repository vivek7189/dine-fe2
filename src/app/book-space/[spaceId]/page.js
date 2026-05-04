'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  FaCalendarAlt, FaClock, FaUser, FaPhone, FaEnvelope, FaBuilding,
  FaSpinner, FaCheck, FaChevronLeft, FaChevronRight, FaPlus, FaMinus,
  FaRupeeSign, FaStickyNote, FaExclamationTriangle, FaMapMarkerAlt,
  FaRedoAlt
} from 'react-icons/fa';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
const PRIMARY = '#0d9488';
const PRIMARY_DARK = '#0f766e';
const PRIMARY_LIGHT = '#ccfbf1';
const BG = '#f8fafc';

// ─── Helpers ────────────────────────────────────────────
function formatTime(t) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function generateSlots(start, end, durationMin) {
  const slots = [];
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let current = sh * 60 + sm;
  const endMin = eh * 60 + em;
  while (current + durationMin <= endMin) {
    const slotStart = `${String(Math.floor(current / 60)).padStart(2, '0')}:${String(current % 60).padStart(2, '0')}`;
    const slotEnd = `${String(Math.floor((current + durationMin) / 60)).padStart(2, '0')}:${String((current + durationMin) % 60).padStart(2, '0')}`;
    slots.push({ start: slotStart, end: slotEnd });
    current += durationMin;
  }
  return slots;
}

function isSlotBooked(slot, bookedSlots) {
  return bookedSlots.some(b => slot.start < b.endTime && slot.end > b.startTime);
}

function isSlotPast(slot, date) {
  const today = new Date().toISOString().split('T')[0];
  if (date > today) return false;
  if (date < today) return true;
  const now = new Date();
  const [h, m] = slot.start.split(':').map(Number);
  return h < now.getHours() || (h === now.getHours() && m <= now.getMinutes());
}

function formatDateNice(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

// ─── Shimmer ────────────────────────────────────────────
function Shimmer({ width, height, borderRadius = 8, style = {} }) {
  return (
    <div style={{
      width, height, borderRadius, background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
      backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
      ...style
    }} />
  );
}

// ─── Step Indicator (Labeled) ───────────────────────────
const STEP_LABELS = ['Time', 'Add-ons', 'Details', 'Review'];

function StepIndicator({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px 24px 8px', gap: 0 }}>
      {STEP_LABELS.map((label, i) => {
        const isCompleted = i < current;
        const isActive = i === current;
        const isFuture = i > current;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEP_LABELS.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 40 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: isCompleted ? PRIMARY : isActive ? PRIMARY : '#fff',
                border: `2px solid ${isFuture ? '#cbd5e1' : PRIMARY}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
                color: isCompleted || isActive ? '#fff' : '#94a3b8',
                transition: 'all 0.3s',
              }}>
                {isCompleted ? <FaCheck size={11} /> : i + 1}
              </div>
              <span style={{
                fontSize: 10, fontWeight: isActive ? 700 : 500, marginTop: 4,
                color: isActive ? PRIMARY : isCompleted ? '#475569' : '#94a3b8',
                textAlign: 'center', whiteSpace: 'nowrap',
              }}>{label}</span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div style={{
                flex: 1, height: 2, marginTop: 3,
                background: isCompleted ? PRIMARY : '#e2e8f0',
                borderRadius: 1, minWidth: 20,
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═════════════════════════════════════════════════════════
// Main Page
// ═════════════════════════════════════════════════════════
export default function BookSpacePage() {
  const { spaceId } = useParams();

  // Responsive
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 560);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Data
  const [space, setSpace] = useState(null);
  const [settings, setSettings] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selection
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlots, setSelectedSlots] = useState([]); // array of slot objects
  const [selectedAmenities, setSelectedAmenities] = useState({}); // { menuItemId: quantity }

  // Customer info
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [notes, setNotes] = useState('');

  // Flow
  const [step, setStep] = useState(0); // 0=slots, 1=amenities, 2=details, 3=review, 4=confirmed
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  // ─── Fetch availability ───────────────────────────────
  useEffect(() => {
    if (!spaceId) return;
    setLoading(true);
    setError(null);
    fetch(`${API_URL}/api/space-booking/availability/${spaceId}?date=${selectedDate}`)
      .then(r => { if (!r.ok) throw new Error('Space not found'); return r.json(); })
      .then(data => {
        setSpace(data.space);
        setSettings(data.settings);
        setBookedSlots(data.bookedSlots || []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [spaceId, selectedDate]);

  // ─── Fetch amenities (menu items) ────────────────────
  useEffect(() => {
    if (!spaceId) return;
    fetch(`${API_URL}/api/public/menu/${spaceId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.menuItems) {
          setAmenities(data.menuItems.filter(i => i.available !== false));
        }
      })
      .catch(() => {});
  }, [spaceId]);

  // ─── Computed values ──────────────────────────────────
  const slots = useMemo(() => {
    if (!settings) return [];
    return generateSlots(
      settings.operatingHours?.start || '08:00',
      settings.operatingHours?.end || '22:00',
      settings.slotDurationMinutes || 60
    );
  }, [settings]);

  const mergedTime = useMemo(() => {
    if (selectedSlots.length === 0) return null;
    const sorted = [...selectedSlots].sort((a, b) => a.start.localeCompare(b.start));
    return { start: sorted[0].start, end: sorted[sorted.length - 1].end };
  }, [selectedSlots]);

  const duration = useMemo(() => {
    if (!mergedTime) return 0;
    const [sh, sm] = mergedTime.start.split(':').map(Number);
    const [eh, em] = mergedTime.end.split(':').map(Number);
    return (eh + em / 60) - (sh + sm / 60);
  }, [mergedTime]);

  const spaceCharge = useMemo(() => {
    return Math.round((settings?.hourlyRate || 0) * duration * 100) / 100;
  }, [settings, duration]);

  const amenitiesTotal = useMemo(() => {
    return Object.entries(selectedAmenities).reduce((sum, [id, qty]) => {
      const item = amenities.find(a => a.id === id);
      return sum + (item?.price || 0) * qty;
    }, 0);
  }, [selectedAmenities, amenities]);

  const totalAmount = spaceCharge + amenitiesTotal;
  const advanceAmount = Math.round(totalAmount * (settings?.advancePercentage || 50) / 100 * 100) / 100;

  // ─── Slot selection (contiguous only) ─────────────────
  const toggleSlot = (slot) => {
    const isSelected = selectedSlots.some(s => s.start === slot.start);
    if (isSelected) {
      setSelectedSlots(prev => prev.filter(s => s.start !== slot.start));
    } else {
      if (selectedSlots.length === 0) {
        setSelectedSlots([slot]);
      } else {
        const allSlots = [...selectedSlots, slot].sort((a, b) => a.start.localeCompare(b.start));
        let contiguous = true;
        for (let i = 1; i < allSlots.length; i++) {
          if (allSlots[i].start !== allSlots[i - 1].end) {
            contiguous = false;
            break;
          }
        }
        if (contiguous) {
          setSelectedSlots(allSlots);
        } else {
          setSelectedSlots([slot]);
        }
      }
    }
  };

  // ─── Submit booking ───────────────────────────────────
  const handleSubmit = async () => {
    if (!mergedTime) return;
    setSubmitting(true);
    try {
      const body = {
        date: selectedDate,
        startTime: mergedTime.start,
        endTime: mergedTime.end,
        customerInfo: { name, phone, email, company },
        amenities: Object.entries(selectedAmenities)
          .filter(([, qty]) => qty > 0)
          .map(([menuItemId, quantity]) => ({ menuItemId, quantity })),
        notes
      };
      const res = await fetch(`${API_URL}/api/space-booking/book/${spaceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking failed');
      setBookingResult(data.booking);
      setStep(4);
    } catch (e) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Reset for new booking ────────────────────────────
  const handleBookAnother = () => {
    setStep(0);
    setSelectedSlots([]);
    setSelectedAmenities({});
    setName('');
    setPhone('');
    setEmail('');
    setCompany('');
    setNotes('');
    setBookingResult(null);
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // ─── Date navigation ──────────────────────────────────
  const changeDate = (delta) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    const today = new Date().toISOString().split('T')[0];
    const newDate = d.toISOString().split('T')[0];
    if (newDate >= today) {
      setSelectedDate(newDate);
      setSelectedSlots([]);
    }
  };

  // ─── Validation ───────────────────────────────────────
  const canProceedFromSlots = selectedSlots.length > 0;
  const canProceedFromDetails = name.trim() && phone.trim().length >= 10;

  const slotDur = settings?.slotDurationMinutes || 60;

  // ═════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════

  if (loading && !space) {
    return (
      <div style={{ minHeight: '100vh', background: BG }}>
        <style>{`@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>
        <div style={{ maxWidth: 580, margin: '0 auto', padding: '24px 16px' }}>
          <Shimmer width="100%" height={180} borderRadius={16} />
          <Shimmer width="60%" height={28} style={{ marginTop: 16 }} />
          <Shimmer width="40%" height={20} style={{ marginTop: 8 }} />
          <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {Array.from({ length: 9 }, (_, i) => (
              <Shimmer key={i} width="100%" height={52} borderRadius={10} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: 32 }}>
          <FaExclamationTriangle size={48} color="#ef4444" />
          <h2 style={{ marginTop: 16, fontSize: 20, color: '#1e293b' }}>Space Not Found</h2>
          <p style={{ color: '#64748b', marginTop: 8 }}>{error}</p>
        </div>
      </div>
    );
  }

  // ─── Confirmed step ───────────────────────────────────
  if (step === 4 && bookingResult) {
    return (
      <div style={{ minHeight: '100vh', background: BG }}>
        <style>{`
          @keyframes checkPop { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }
          @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
        <div style={{ maxWidth: 580, margin: '0 auto', padding: '48px 16px', textAlign: 'center' }}>
          <div style={{
            width: 88, height: 88, borderRadius: '50%',
            background: `linear-gradient(135deg, ${PRIMARY_LIGHT}, #99f6e4)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
            animation: 'checkPop 0.5s ease-out',
            boxShadow: `0 8px 24px rgba(13,148,136,0.25)`,
          }}>
            <FaCheck size={38} color={PRIMARY} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1e293b', margin: '0 0 8px', animation: 'fadeUp 0.4s ease-out 0.2s both' }}>Booking Submitted!</h1>
          <p style={{ color: '#64748b', fontSize: 15, margin: '0 0 28px', animation: 'fadeUp 0.4s ease-out 0.3s both' }}>
            {bookingResult.status === 'confirmed'
              ? 'Your booking is confirmed. You\'re all set!'
              : 'Your booking request has been submitted. You\'ll be contacted for confirmation.'}
          </p>
          <div style={{
            background: '#fff', borderRadius: 16, padding: 24, textAlign: 'left',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0',
            animation: 'fadeUp 0.4s ease-out 0.4s both'
          }}>
            <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Booking ID</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 20, fontFamily: 'monospace', background: '#f8fafc', padding: '6px 10px', borderRadius: 8, display: 'inline-block' }}>{bookingResult.id}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Date</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginTop: 2 }}>{formatDateNice(bookingResult.date)}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Time</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginTop: 2 }}>
                  {formatTime(bookingResult.startTime)} – {formatTime(bookingResult.endTime)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Total</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: PRIMARY, marginTop: 2 }}>₹{bookingResult.totalAmount}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Status</div>
                <div style={{
                  fontSize: 12, fontWeight: 600, display: 'inline-block', padding: '3px 12px', borderRadius: 20, marginTop: 4,
                  background: bookingResult.status === 'confirmed' ? '#dcfce7' : '#fef3c7',
                  color: bookingResult.status === 'confirmed' ? '#166534' : '#92400e'
                }}>
                  {bookingResult.status === 'confirmed' ? 'CONFIRMED' : 'PENDING APPROVAL'}
                </div>
              </div>
            </div>
          </div>

          {/* Book Another */}
          <button
            onClick={handleBookAnother}
            style={{
              marginTop: 24, padding: '12px 24px', borderRadius: 10,
              border: `1.5px solid ${PRIMARY}`, background: '#fff', color: PRIMARY,
              fontWeight: 600, fontSize: 14, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              animation: 'fadeUp 0.4s ease-out 0.5s both',
            }}
          >
            <FaRedoAlt size={12} /> Book Another Slot
          </button>
        </div>
      </div>
    );
  }

  // ─── Main flow ────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: BG }}>
      <style>{`
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input:focus { outline: none; border-color: ${PRIMARY} !important; box-shadow: 0 0 0 3px ${PRIMARY_LIGHT} !important; }
        textarea:focus { outline: none; border-color: ${PRIMARY} !important; box-shadow: 0 0 0 3px ${PRIMARY_LIGHT} !important; }
      `}</style>

      <div style={{ maxWidth: 580, margin: '0 auto', padding: '0 0 100px' }}>
        {/* ─── Hero Header ─── */}
        <div style={{
          background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%)`,
          padding: isMobile ? '28px 20px 24px' : '32px 28px 28px',
          color: '#fff', position: 'relative', overflow: 'hidden',
        }}>
          {space?.image && (
            <div style={{
              position: 'absolute', inset: 0, backgroundImage: `url(${space.image})`,
              backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.2,
            }} />
          )}
          <div style={{ position: 'relative' }}>
            <h1 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 700, margin: 0 }}>{space?.name || 'Book Space'}</h1>
            {space?.address && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 14, opacity: 0.9 }}>
                <FaMapMarkerAlt size={12} />
                <span>{space.address}{space.city ? `, ${space.city}` : ''}</span>
              </div>
            )}
            {space?.description && (
              <div style={{ marginTop: 6, fontSize: 13, opacity: 0.8, maxWidth: 440, lineHeight: 1.4 }}>
                {space.description}
              </div>
            )}
            {settings?.hourlyRate > 0 && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 14,
                background: 'rgba(255,255,255,0.2)', borderRadius: 20,
                padding: '6px 16px', fontSize: 15, fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(4px)',
              }}>
                <FaRupeeSign size={12} /> {settings.hourlyRate}/hr
                {slotDur !== 60 && <span style={{ fontWeight: 400, fontSize: 12, opacity: 0.85 }}>({slotDur}-min slots)</span>}
              </div>
            )}
          </div>
        </div>

        <StepIndicator current={step} />

        {/* ─── Step 0: Select Time Slots ─── */}
        {step === 0 && (
          <div style={{ padding: '0 16px' }}>
            {/* Date Picker */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#fff', borderRadius: 12, padding: '10px 16px', marginBottom: 16,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0'
            }}>
              <button onClick={() => changeDate(-1)} style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: '#64748b'
              }}><FaChevronLeft /></button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FaCalendarAlt color={PRIMARY} size={16} />
                <input type="date" value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => { setSelectedDate(e.target.value); setSelectedSlots([]); }}
                  style={{
                    border: 'none', fontSize: 15, fontWeight: 600, color: '#1e293b',
                    background: 'transparent', cursor: 'pointer'
                  }}
                />
              </div>
              <button onClick={() => changeDate(1)} style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: '#64748b'
              }}><FaChevronRight /></button>
            </div>

            {/* Slot Grid */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#475569', marginBottom: 10 }}>
                Select Time Slots <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: 12 }}>(tap consecutive slots)</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)', gap: 8 }}>
                {slots.map((slot) => {
                  const booked = isSlotBooked(slot, bookedSlots);
                  const past = isSlotPast(slot, selectedDate);
                  const selected = selectedSlots.some(s => s.start === slot.start);
                  const disabled = booked || past;

                  return (
                    <button key={slot.start} onClick={() => !disabled && toggleSlot(slot)}
                      disabled={disabled}
                      style={{
                        padding: '12px 6px', borderRadius: 10, border: '2px solid',
                        borderColor: selected ? PRIMARY : disabled ? '#e2e8f0' : '#cbd5e1',
                        background: selected ? PRIMARY_LIGHT : disabled ? '#f1f5f9' : '#fff',
                        color: selected ? PRIMARY_DARK : disabled ? '#94a3b8' : '#334155',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        fontSize: 13, fontWeight: 600, textAlign: 'center',
                        transition: 'all 0.15s', opacity: disabled ? 0.6 : 1,
                        position: 'relative',
                        transform: selected ? 'scale(1.03)' : 'scale(1)',
                      }}
                    >
                      {selected && (
                        <div style={{
                          position: 'absolute', top: -5, right: -5, width: 16, height: 16,
                          borderRadius: '50%', background: PRIMARY, display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                        }}>
                          <FaCheck size={8} color="#fff" />
                        </div>
                      )}
                      {formatTime(slot.start)}
                      <div style={{ fontSize: 10, fontWeight: 400, marginTop: 2, color: disabled ? '#94a3b8' : '#64748b' }}>
                        {booked ? 'Booked' : past ? 'Past' : `to ${formatTime(slot.end)}`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedSlots.length > 0 && (
              <div style={{
                background: PRIMARY_LIGHT, borderRadius: 12, padding: '12px 16px', marginTop: 12,
                fontSize: 14, color: PRIMARY_DARK, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
                border: `1px solid ${PRIMARY}22`,
              }}>
                <FaClock size={14} />
                {formatTime(mergedTime.start)} – {formatTime(mergedTime.end)} ({duration}h) • ₹{spaceCharge}
              </div>
            )}
          </div>
        )}

        {/* ─── Step 1: Amenities ─── */}
        {step === 1 && (
          <div style={{ padding: '0 16px' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Add Amenities</div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Optional — enhance your booking</div>

            {amenities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: 14, background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0' }}>
                No amenities available for this space
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {amenities.map(item => {
                  const qty = selectedAmenities[item.id] || 0;
                  return (
                    <div key={item.id} style={{
                      background: '#fff', borderRadius: 12, padding: '14px 16px',
                      border: qty > 0 ? `2px solid ${PRIMARY}` : '1px solid #e2e8f0',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      transition: 'border 0.15s, box-shadow 0.15s',
                      boxShadow: qty > 0 ? `0 0 0 3px ${PRIMARY}11` : 'none',
                    }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{item.name}</div>
                        <div style={{ fontSize: 13, color: '#64748b' }}>₹{item.price}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {qty > 0 && (
                          <button onClick={() => setSelectedAmenities(p => {
                            const n = { ...p };
                            if (n[item.id] <= 1) delete n[item.id]; else n[item.id]--;
                            return n;
                          })} style={{
                            width: 32, height: 32, borderRadius: '50%', border: `1.5px solid ${PRIMARY}`,
                            background: '#fff', color: PRIMARY, cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center'
                          }}><FaMinus size={10} /></button>
                        )}
                        {qty > 0 && (
                          <span style={{ fontWeight: 700, fontSize: 16, color: '#1e293b', minWidth: 24, textAlign: 'center' }}>
                            {qty}
                          </span>
                        )}
                        <button onClick={() => setSelectedAmenities(p => ({ ...p, [item.id]: (p[item.id] || 0) + 1 }))}
                          style={{
                            width: 32, height: 32, borderRadius: '50%', border: 'none',
                            background: PRIMARY, color: '#fff', cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center'
                          }}><FaPlus size={10} /></button>
                      </div>
                    </div>
                  );
                })}

                {/* Amenities running total */}
                {amenitiesTotal > 0 && (
                  <div style={{
                    display: 'flex', justifyContent: 'flex-end', marginTop: 4,
                  }}>
                    <div style={{
                      background: PRIMARY_LIGHT, borderRadius: 20, padding: '6px 16px',
                      fontSize: 13, fontWeight: 600, color: PRIMARY_DARK,
                    }}>
                      Add-ons total: ₹{amenitiesTotal}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── Step 2: Customer Details ─── */}
        {step === 2 && (
          <div style={{ padding: '0 16px' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>Your Details</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: FaUser, label: 'Full Name *', value: name, set: setName, type: 'text', placeholder: 'John Doe' },
                { icon: FaPhone, label: 'Phone Number *', value: phone, set: setPhone, type: 'tel', placeholder: '9876543210' },
                { icon: FaEnvelope, label: 'Email', value: email, set: setEmail, type: 'email', placeholder: 'john@company.com' },
                { icon: FaBuilding, label: 'Company / Unit', value: company, set: setCompany, type: 'text', placeholder: 'Floor 3, Unit 301' },
              ].map(({ icon: Icon, label, value, set, type, placeholder }) => (
                <div key={label}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon size={12} color={PRIMARY} /> {label}
                  </label>
                  <input type={type} value={value} onChange={e => set(e.target.value)} placeholder={placeholder}
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0',
                      fontSize: 15, color: '#1e293b', background: '#fff', boxSizing: 'border-box',
                      transition: 'border 0.15s, box-shadow 0.15s'
                    }}
                  />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FaStickyNote size={12} color={PRIMARY} /> Notes
                </label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special requirements..."
                  rows={3}
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0',
                    fontSize: 15, color: '#1e293b', background: '#fff', resize: 'vertical', fontFamily: 'inherit',
                    boxSizing: 'border-box', transition: 'border 0.15s, box-shadow 0.15s'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ─── Step 3: Review ─── */}
        {step === 3 && (
          <div style={{ padding: '0 16px' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>Review Booking</div>
            <div style={{
              background: '#fff', borderRadius: 16, overflow: 'hidden',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0',
            }}>
              {/* Mini header banner */}
              <div style={{
                background: `linear-gradient(135deg, ${PRIMARY}0a, ${PRIMARY}14)`,
                padding: '12px 18px', borderBottom: '1px solid #e2e8f0',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <FaCalendarAlt size={14} color={PRIMARY} />
                <span style={{ fontSize: 14, fontWeight: 600, color: PRIMARY_DARK }}>{space?.name}</span>
              </div>

              <div style={{ padding: 18 }}>
                {/* Time */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Date & Time</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', marginTop: 4 }}>{formatDateNice(selectedDate)}</div>
                    <div style={{ fontSize: 14, color: '#475569', marginTop: 2 }}>
                      {mergedTime && `${formatTime(mergedTime.start)} – ${formatTime(mergedTime.end)} (${duration}h)`}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Space Charge</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginTop: 4 }}>₹{spaceCharge}</div>
                  </div>
                </div>

                {/* Amenities */}
                {Object.keys(selectedAmenities).length > 0 && (
                  <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 8 }}>Amenities</div>
                    {Object.entries(selectedAmenities).map(([id, qty]) => {
                      const item = amenities.find(a => a.id === id);
                      if (!item) return null;
                      return (
                        <div key={id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#475569', marginBottom: 4 }}>
                          <span>{item.name} x {qty}</span>
                          <span style={{ fontWeight: 600 }}>₹{item.price * qty}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Customer */}
                <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px dashed #e2e8f0' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 6 }}>Contact</div>
                  <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 600 }}>{name}</div>
                  <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{phone}{email ? ` • ${email}` : ''}</div>
                  {company && <div style={{ fontSize: 13, color: '#64748b', marginTop: 1 }}>{company}</div>}
                </div>

                {/* Total */}
                <div style={{
                  background: `${PRIMARY}08`, borderRadius: 12, padding: '14px 16px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Total Amount</div>
                    {settings?.advancePercentage > 0 && settings?.advancePercentage < 100 && (
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Advance: ₹{advanceAmount} ({settings.advancePercentage}%)</div>
                    )}
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: PRIMARY }}>₹{totalAmount}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Bottom Navigation Bar ─── */}
      {step < 4 && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: '#fff', borderTop: '1px solid #e2e8f0', padding: '12px 16px',
          display: 'flex', gap: 10, maxWidth: 580, margin: '0 auto',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.06)'
        }}>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} style={{
              flex: '0 0 auto', padding: '12px 20px', borderRadius: 10,
              border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569',
              fontWeight: 600, fontSize: 15, cursor: 'pointer'
            }}>Back</button>
          )}
          {step < 3 ? (
            <button
              disabled={step === 0 && !canProceedFromSlots || step === 2 && !canProceedFromDetails}
              onClick={() => setStep(s => s + 1)}
              style={{
                flex: 1, padding: '12px 20px', borderRadius: 10, border: 'none',
                background: (step === 0 && !canProceedFromSlots) || (step === 2 && !canProceedFromDetails) ? '#cbd5e1' : PRIMARY,
                color: '#fff', fontWeight: 600, fontSize: 15,
                cursor: (step === 0 && !canProceedFromSlots) || (step === 2 && !canProceedFromDetails) ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s'
              }}
            >
              {step === 0 ? `Next — ${selectedSlots.length} slot${selectedSlots.length !== 1 ? 's' : ''}` :
               step === 1 ? `Next${amenitiesTotal > 0 ? ` — ₹${amenitiesTotal} added` : ''}` :
               'Review Booking'}
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              style={{
                flex: 1, padding: '12px 20px', borderRadius: 10, border: 'none',
                background: submitting ? '#94a3b8' : PRIMARY, color: '#fff',
                fontWeight: 600, fontSize: 15, cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background 0.15s'
              }}
            >
              {submitting ? <><FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</> : `Confirm Booking — ₹${totalAmount}`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

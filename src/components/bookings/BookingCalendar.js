'use client';

import { useState, useMemo } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const BOOKING_COLORS = {
  catering: '#10b981',
  advance_order: '#3b82f6',
  venue: '#ef4444',
};

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const days = [];

  // Fill leading empty cells
  for (let i = 0; i < startOffset; i++) {
    days.push(null);
  }

  for (let d = 1; d <= totalDays; d++) {
    days.push(new Date(year, month, d));
  }

  return days;
}

function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function isDateInRange(date, startDate, endDate) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  return d >= start && d <= end;
}

function formatTime(date) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  const m = minutes.toString().padStart(2, '0');
  return `${h}:${m} ${ampm}`;
}

function truncateText(text, maxLen) {
  if (!text) return '';
  return text.length > maxLen ? text.substring(0, maxLen) + '…' : text;
}

export default function BookingCalendar({ bookings = [], onDayClick, onBookingClick, isMobile }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  const days = useMemo(() => getMonthDays(year, month), [year, month]);

  const bookingsByDate = useMemo(() => {
    const map = {};
    bookings.forEach((booking) => {
      const start = new Date(booking.start_date || booking.startDate || booking.date);
      const end = new Date(booking.end_date || booking.endDate || booking.date);

      // Iterate through all days in the range
      const current = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());

      while (current <= endDay) {
        const key = `${current.getFullYear()}-${current.getMonth()}-${current.getDate()}`;
        if (!map[key]) map[key] = [];
        map[key].push({ ...booking, _displayTime: start });
        current.setDate(current.getDate() + 1);
      }
    });
    return map;
  }, [bookings]);

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthLabel = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const maxChips = isMobile ? 2 : 3;
  const chipNameMaxLen = isMobile ? 8 : 14;

  const styles = {
    container: {
      width: '100%',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: isMobile ? '12px' : '14px',
      background: '#ffffff',
      borderRadius: '12px',
      padding: isMobile ? '12px' : '20px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '16px',
      flexWrap: 'wrap',
      gap: '8px',
      paddingBottom: '12px',
      borderBottom: '2px solid #fef2f2',
    },
    navGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    navButton: {
      background: '#fff',
      border: '1px solid #fecaca',
      borderRadius: '6px',
      padding: '6px 10px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      color: '#ef4444',
    },
    todayButton: {
      background: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '6px',
      padding: '6px 12px',
      cursor: 'pointer',
      fontSize: isMobile ? '11px' : '13px',
      color: '#dc2626',
      fontWeight: 600,
    },
    monthLabel: {
      fontSize: isMobile ? '16px' : '20px',
      fontWeight: 600,
      color: '#1f2937',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      overflow: isMobile ? 'auto' : 'hidden',
      minWidth: isMobile ? '320px' : 'unset',
    },
    dayHeader: {
      padding: isMobile ? '6px 2px' : '10px 4px',
      textAlign: 'center',
      fontWeight: 600,
      fontSize: isMobile ? '11px' : '12px',
      color: '#6b7280',
      background: '#f9fafb',
      borderBottom: '1px solid #e5e7eb',
      textTransform: 'uppercase',
    },
    dayCell: {
      minHeight: isMobile ? '60px' : '90px',
      padding: isMobile ? '2px' : '4px',
      borderRight: '1px solid #f3f4f6',
      borderBottom: '1px solid #f3f4f6',
      cursor: 'pointer',
      verticalAlign: 'top',
      position: 'relative',
      transition: 'background 0.15s',
    },
    dayCellToday: {
      background: '#fef2f2',
    },
    dayCellHasBookings: {
      background: '#fafbfc',
    },
    dayNumber: {
      fontSize: isMobile ? '11px' : '13px',
      fontWeight: 500,
      color: '#374151',
      marginBottom: '2px',
      padding: '2px 4px',
    },
    dayNumberToday: {
      background: '#ef4444',
      color: '#ffffff',
      borderRadius: '50%',
      width: isMobile ? '20px' : '24px',
      height: isMobile ? '20px' : '24px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: isMobile ? '11px' : '12px',
      fontWeight: 600,
    },
    chip: {
      borderRadius: '4px',
      padding: isMobile ? '1px 3px' : '2px 4px',
      marginBottom: '2px',
      fontSize: isMobile ? '9px' : '11px',
      color: '#ffffff',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      cursor: 'pointer',
      lineHeight: 1.3,
    },
    moreLabel: {
      fontSize: isMobile ? '9px' : '10px',
      color: '#6b7280',
      paddingLeft: '4px',
    },
    emptyCell: {
      minHeight: isMobile ? '60px' : '90px',
      borderRight: '1px solid #f3f4f6',
      borderBottom: '1px solid #f3f4f6',
      background: '#fafafa',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.monthLabel}>{monthLabel}</span>
        <div style={styles.navGroup}>
          <button style={styles.todayButton} onClick={goToToday}>
            Today
          </button>
          <button style={styles.navButton} onClick={goToPrevMonth}>
            <FaChevronLeft />
          </button>
          <button style={styles.navButton} onClick={goToNextMonth}>
            <FaChevronRight />
          </button>
        </div>
      </div>

      <div style={styles.grid}>
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} style={styles.dayHeader}>
            {isMobile ? day.charAt(0) : day}
          </div>
        ))}

        {days.map((date, idx) => {
          if (!date) {
            return <div key={`empty-${idx}`} style={styles.emptyCell} />;
          }

          const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
          const dayBookings = bookingsByDate[key] || [];
          const isToday = isSameDay(date, today);
          const hasBookings = dayBookings.length > 0;

          const cellStyle = {
            ...styles.dayCell,
            ...(isToday ? styles.dayCellToday : {}),
            ...(!isToday && hasBookings ? styles.dayCellHasBookings : {}),
          };

          return (
            <div
              key={key}
              style={cellStyle}
              onClick={() => onDayClick && onDayClick(date)}
            >
              <div style={styles.dayNumber}>
                {isToday ? (
                  <span style={styles.dayNumberToday}>{date.getDate()}</span>
                ) : (
                  date.getDate()
                )}
              </div>

              {dayBookings.slice(0, maxChips).map((booking, bIdx) => {
                const bgColor = BOOKING_COLORS[booking.type] || '#6b7280';
                const startTime = new Date(booking._displayTime);
                const timeStr = formatTime(startTime);
                const name = booking.event_name || booking.eventName || booking.name || '';

                return (
                  <div
                    key={`${booking.id || bIdx}-${bIdx}`}
                    style={{ ...styles.chip, background: bgColor }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookingClick && onBookingClick(booking);
                    }}
                    title={`${name} - ${timeStr}`}
                  >
                    {truncateText(name, chipNameMaxLen)} {timeStr}
                  </div>
                );
              })}

              {dayBookings.length > maxChips && (
                <div style={styles.moreLabel}>
                  +{dayBookings.length - maxChips} more
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

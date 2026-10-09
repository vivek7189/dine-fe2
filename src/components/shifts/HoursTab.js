'use client';

// Scheduled (published rota, minus breaks) vs worked (attendance clock-in/out) per staff member.
import { useState, useEffect, useCallback } from 'react';
import { FaSpinner, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import apiClient from '../../lib/api';
import { formatDateISO, getWeekStart, getWeekEnd } from './constants';

export default function HoursTab({ restaurantId, isMobile }) {
  const [week, setWeek] = useState(new Date());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const start = formatDateISO(getWeekStart(week));
  const end = formatDateISO(getWeekEnd(week));

  const load = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true); setError('');
    try { const r = await apiClient.getShiftHoursReport(restaurantId, start, end); setRows(r?.rows || []); }
    catch (e) { setError(e?.message || 'Failed to load'); setRows([]); }
    finally { setLoading(false); }
  }, [restaurantId, start, end]);
  useEffect(() => { load(); }, [load]);

  const move = (n) => { const d = new Date(week); d.setDate(d.getDate() + n * 7); setWeek(d); };
  const th = { padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#6b7280', borderBottom: '2px solid #f1f5f9', whiteSpace: 'nowrap' };
  const td = { padding: '10px 12px', fontSize: '13px', color: '#111827', borderBottom: '1px solid #f9fafb' };
  const fmt = (h) => `${(Number(h) || 0).toFixed(1)}h`;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <button onClick={() => move(-1)} style={{ padding: '7px 10px', borderRadius: '9px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer' }}><FaChevronLeft size={11} /></button>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{start} → {end}</div>
        <button onClick={() => move(1)} style={{ padding: '7px 10px', borderRadius: '9px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer' }}><FaChevronRight size={11} /></button>
        <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: isMobile ? 0 : '8px' }}>Scheduled = published shifts minus breaks · Worked = Attendance clock-in to clock-out · Missed a punch-out? Fix it with <b>Edit</b> on the Attendance page (managers: last 48 h)</span>
      </div>
      {error && <div style={{ marginBottom: '12px', padding: '10px 14px', borderRadius: '12px', background: '#fef2f2', color: '#b91c1c', fontSize: '13px' }}>{error}</div>}
      <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', overflowX: 'auto' }}>
        {loading ? <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}><FaSpinner className="animate-spin" /></div> : rows.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>No published shifts or attendance this week.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }}>
            <thead><tr><th style={th}>Staff</th><th style={th}>Shifts</th><th style={th}>Scheduled</th><th style={th}>Worked</th><th style={th}>Difference</th><th style={th}>Late days</th></tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.staffId}>
                  <td style={{ ...td, fontWeight: 600 }}>{r.staffName || r.staffId}</td>
                  <td style={td}>{r.shifts}</td>
                  <td style={td}>{fmt(r.scheduledHours)}</td>
                  <td style={td}>{r.daysWorked ? fmt(r.workedHours) : <span style={{ color: '#9ca3af' }}>no clock-ins</span>}</td>
                  {/* Not on the rota this week → nothing to compare with (every hour showed as "overtime") */}
                  <td style={{ ...td, fontWeight: 700, color: !r.daysWorked || !r.shifts ? '#9ca3af' : r.difference > 0.25 ? '#b45309' : r.difference < -0.25 ? '#dc2626' : '#16a34a' }}>
                    {!r.daysWorked ? '—' : !r.shifts ? <span style={{ fontWeight: 500 }}>not on rota</span> : `${r.difference > 0 ? '+' : ''}${fmt(r.difference)}${r.difference > 0.25 ? ' overtime' : r.difference < -0.25 ? ' short' : ''}`}
                  </td>
                  <td style={td}>{r.lateDays || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

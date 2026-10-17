'use client';

// Cash short / extra per staff, from closed shifts (counted cash − expected cash at shift close).
// GET /api/shifts-cash/:restaurantId/cash-variance — owner / admin see everyone, staff only themselves.
// Used in Shifts & Cash (everyone, tap a person to open their shifts) and in Admin → Staff → a
// person's details (staffId set: just that person).
import { useState, useEffect, useMemo } from 'react';
import { FaSpinner, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import apiClient from '../../lib/api';
import { useCurrency } from '../../contexts/CurrencyContext';
import { fmtDateTime, restaurantToday, ymd } from '../../lib/restaurantTime';

const PERIODS = [
  { key: 'thisMonth', label: 'This month' },
  { key: 'lastMonth', label: 'Last month' },
  { key: 'last90', label: 'Last 90 days' },
];

function periodRange(key) {
  const today = restaurantToday();
  if (key === 'lastMonth') {
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1, 12);
    const end = new Date(today.getFullYear(), today.getMonth(), 0, 12);
    return { startDate: ymd(start), endDate: ymd(end) };
  }
  if (key === 'last90') {
    const start = new Date(today);
    start.setDate(start.getDate() - 89);
    return { startDate: ymd(start), endDate: ymd(today) };
  }
  return { startDate: ymd(new Date(today.getFullYear(), today.getMonth(), 1, 12)), endDate: ymd(today) };
}

const SHORT = '#dc2626';
const EXTRA = '#16a34a';
const MUTED = '#94a3b8';

const th = { textAlign: 'left', padding: '9px 8px', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px', borderBottom: '2px solid #f1f5f9' };
const td = { padding: '10px 8px', fontSize: '13px', color: '#334155', whiteSpace: 'nowrap', borderBottom: '1px solid #f8fafc' };

export default function CashShortExtra({ restaurantId, staffId = null, title = 'Cash short / extra', style }) {
  const { formatCurrency } = useCurrency();
  const [period, setPeriod] = useState('thisMonth');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(null); // staffId whose shifts are shown

  const range = useMemo(() => periodRange(period), [period]);

  useEffect(() => {
    if (!restaurantId) return undefined;
    let alive = true;
    setLoading(true);
    setError('');
    apiClient.getShiftCashVariance(restaurantId, { ...range, ...(staffId ? { staffId } : {}) })
      .then((r) => { if (alive) setData(r?.staff || []); })
      .catch((e) => { if (alive) setError(e?.message || 'Could not load'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [restaurantId, staffId, range]);

  const isExact = (n) => Math.abs(n) < 0.011; // a paisa of rounding = exact (same as the server)
  const signed = (n) => (isExact(n) ? formatCurrency(0) : `${n > 0 ? '+' : '−'}${formatCurrency(Math.abs(n))}`);
  const colorOf = (n) => (isExact(n) ? MUTED : n < 0 ? SHORT : EXTRA);
  const notCountedNote = (g) => (g.notCountedCount > 0
    ? `${g.notCountedCount} shift${g.notCountedCount === 1 ? '' : 's'} closed without counting cash (not in the totals)`
    : '');
  const single = !!staffId;
  const rows = data || [];
  const person = single ? rows[0] : null;

  const shiftList = (g) => (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={th}>Shift</th><th style={th}>Expected</th><th style={th}>Counted</th><th style={th}>Short / extra</th><th style={th}>Note</th>
        </tr>
      </thead>
      <tbody>
        {g.list.map((s) => (
          <tr key={s.id}>
            <td style={td}>{fmtDateTime(s.openedAt, 'en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }, '—')}</td>
            <td style={{ ...td, fontFamily: 'monospace' }}>{s.expectedCash != null ? formatCurrency(s.expectedCash) : '—'}</td>
            <td style={{ ...td, fontFamily: 'monospace' }}>{s.closingCash != null ? formatCurrency(s.closingCash) : '—'}</td>
            {s.notCounted ? (
              <td style={{ ...td, color: '#b45309', fontWeight: 600 }} title="Shift was closed without counting the cash, so it is not counted as short">
                Not counted
              </td>
            ) : (
              <td style={{ ...td, fontFamily: 'monospace', fontWeight: 700, color: colorOf(s.difference) }}>
                {signed(s.difference)} <span style={{ fontWeight: 500, fontSize: '11px' }}>{isExact(s.difference) ? 'exact' : s.difference < 0 ? 'short' : 'extra'}</span>
              </td>
            )}
            <td style={{ ...td, whiteSpace: 'normal', color: '#64748b', maxWidth: '220px' }}>{s.notes || ''}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div style={style}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0, flex: 1, minWidth: '160px' }}>{title}</h3>
        <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', borderRadius: '10px', padding: '3px' }}>
          {PERIODS.map((p) => (
            <button key={p.key} type="button" onClick={() => setPeriod(p.key)}
              style={{ border: 'none', cursor: 'pointer', borderRadius: '8px', padding: '5px 10px', fontSize: '12px', fontWeight: period === p.key ? 700 : 500,
                background: period === p.key ? 'white' : 'transparent', color: period === p.key ? '#0f172a' : '#64748b',
                boxShadow: period === p.key ? '0 1px 2px rgba(0,0,0,0.06)' : 'none' }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '24px', textAlign: 'center', color: MUTED, fontSize: '13px' }}><FaSpinner className="animate-spin" /> Loading…</div>
      ) : error ? (
        <div style={{ padding: '12px', color: SHORT, fontSize: '13px' }}>{error}</div>
      ) : rows.length === 0 ? (
        <div style={{ padding: '18px', textAlign: 'center', color: MUTED, fontSize: '13px' }}>No closed shifts in this period.</div>
      ) : single ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', marginBottom: '12px' }}>
            {[
              { label: 'Short', value: formatCurrency(person.shortTotal), sub: `${person.shortCount} shift${person.shortCount === 1 ? '' : 's'}`, color: person.shortTotal ? SHORT : MUTED },
              { label: 'Extra', value: formatCurrency(person.extraTotal), sub: `${person.extraCount} shift${person.extraCount === 1 ? '' : 's'}`, color: person.extraTotal ? EXTRA : MUTED },
              { label: 'Net', value: signed(person.net), sub: `${person.shifts} closed shift${person.shifts === 1 ? '' : 's'}`, color: colorOf(person.net) },
            ].map((c) => (
              <div key={c.label} style={{ background: 'white', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '10px 12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{c.label}</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: c.color, fontFamily: 'monospace' }}>{c.value}</div>
                <div style={{ fontSize: '11px', color: MUTED }}>{c.sub}</div>
              </div>
            ))}
          </div>
          {notCountedNote(person) && <div style={{ fontSize: '12px', color: '#b45309', marginBottom: '8px' }}>{notCountedNote(person)}</div>}
          <div style={{ overflowX: 'auto' }}>{shiftList(person)}</div>
        </>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Staff</th><th style={th}>Shifts</th><th style={th}>Short</th><th style={th}>Extra</th><th style={th}>Net</th><th style={th} />
              </tr>
            </thead>
            <tbody>
              {rows.map((g) => {
                const isOpen = open === g.staffId;
                return [
                  <tr key={g.staffId} onClick={() => setOpen(isOpen ? null : g.staffId)} style={{ cursor: 'pointer', background: isOpen ? '#f8fafc' : 'white' }}>
                    <td style={{ ...td, fontWeight: 600, color: '#0f172a' }}>
                      {g.name}
                      {g.role && <span style={{ marginLeft: '6px', fontSize: '11px', color: MUTED, fontWeight: 500, textTransform: 'capitalize' }}>{g.role}</span>}
                    </td>
                    <td style={td}>
                      {g.shifts}
                      {g.notCountedCount > 0 && <span title={notCountedNote(g)} style={{ marginLeft: '6px', fontSize: '11px', color: '#b45309' }}>({g.notCountedCount} not counted)</span>}
                    </td>
                    <td style={{ ...td, fontFamily: 'monospace', color: g.shortTotal ? SHORT : MUTED }}>
                      {formatCurrency(g.shortTotal)} <span style={{ fontSize: '11px', color: MUTED }}>({g.shortCount})</span>
                    </td>
                    <td style={{ ...td, fontFamily: 'monospace', color: g.extraTotal ? EXTRA : MUTED }}>
                      {formatCurrency(g.extraTotal)} <span style={{ fontSize: '11px', color: MUTED }}>({g.extraCount})</span>
                    </td>
                    <td style={{ ...td, fontFamily: 'monospace', fontWeight: 700, color: colorOf(g.net) }}>{signed(g.net)}</td>
                    <td style={{ ...td, textAlign: 'right', color: MUTED }}>{isOpen ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}</td>
                  </tr>,
                  isOpen && (
                    <tr key={`${g.staffId}-list`}>
                      <td colSpan={6} style={{ padding: '4px 8px 14px', background: '#f8fafc' }}>{shiftList(g)}</td>
                    </tr>
                  ),
                ];
              })}
            </tbody>
          </table>
          <div style={{ fontSize: '11.5px', color: MUTED, marginTop: '8px' }}>
            From closed shifts: counted cash minus expected cash. Shifts closed without counting are not added to short. Tap a person to see each shift.
          </div>
        </div>
      )}
    </div>
  );
}

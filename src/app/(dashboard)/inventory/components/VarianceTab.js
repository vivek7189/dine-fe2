'use client';

import { useState, useEffect, useCallback } from 'react';
import { FaBalanceScale, FaCalendarAlt, FaExclamationTriangle, FaClipboardCheck, FaChartLine } from 'react-icons/fa';
import apiClient from '../../../../lib/api';

const periodOptions = [
  { id: '7days', label: '7 Days' },
  { id: '30days', label: '30 Days' },
  { id: 'custom', label: 'Custom' },
];

const card = { backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' };
const fmtNum = (n) => (Number(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

function daysAgoISO(n) {
  const d = new Date(); d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export default function VarianceTab({ currentRestaurant, isMobile, formatCurrency }) {
  const fmt = formatCurrency || ((n) => `₹${fmtNum(n)}`);
  const [period, setPeriod] = useState('30days');
  const [startDate, setStartDate] = useState(daysAgoISO(30));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (p = period, s = startDate, e = endDate) => {
    if (!currentRestaurant?.id) return;
    setLoading(true); setError('');
    try {
      const params = p === 'custom' ? { startDate: s, endDate: e } : { startDate: daysAgoISO(p === '7days' ? 6 : 29), endDate: new Date().toISOString().slice(0, 10) };
      const res = await apiClient.getInventoryUsageVariance(currentRestaurant.id, params);
      setData(res || null);
    } catch (err) {
      setError(err?.message || 'Failed to load variance report');
      setData(null);
    } finally { setLoading(false); }
  }, [currentRestaurant, period, startDate, endDate]);

  useEffect(() => { load('30days'); /* eslint-disable-next-line */ }, [currentRestaurant?.id]);

  const onPeriod = (id) => { setPeriod(id); if (id !== 'custom') load(id); };

  const summary = data?.summary || {};
  const items = data?.items || [];
  const varColor = (v) => (Number(v) > 0 ? '#dc2626' : Number(v) < 0 ? '#059669' : '#6b7280');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header + period filter */}
      <div style={{ ...card, padding: isMobile ? '14px' : '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: 'linear-gradient(135deg, #059669, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FaBalanceScale size={16} color="white" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>Usage Variance</h3>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6b7280' }}>Expected usage (recipe × sales) vs your physical counts — where food cost is leaking.</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <FaCalendarAlt size={13} style={{ color: '#059669', flexShrink: 0 }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginRight: '4px' }}>Period:</span>
          {periodOptions.map((opt) => (
            <button key={opt.id} onClick={() => onPeriod(opt.id)} style={{
              padding: '6px 14px', borderRadius: '8px', border: 'none',
              backgroundColor: period === opt.id ? '#059669' : '#f3f4f6',
              color: period === opt.id ? 'white' : '#4b5563', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            }}>{opt.label}</button>
          ))}
          {period === 'custom' && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '12px', color: '#374151', outline: 'none' }} />
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>to</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '12px', color: '#374151', outline: 'none' }} />
              <button onClick={() => load('custom', startDate, endDate)} style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#059669', color: 'white', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Apply</button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ ...card, padding: '70px 20px', textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTop: '4px solid #059669', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 14px' }} />
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Loading variance report…</p>
        </div>
      ) : error ? (
        <div style={{ ...card, padding: '40px 20px', textAlign: 'center', color: '#dc2626', fontSize: '14px' }}>{error}</div>
      ) : (
        <>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '12px' }}>
            {[
              { label: 'Expected Usage Value', value: fmt(summary.totalExpectedValue || 0), color: '#111827' },
              { label: 'Variance (Loss) Value', value: fmt(summary.totalVarianceValue || 0), color: varColor(summary.totalVarianceValue) },
              { label: 'Variance %', value: summary.variancePct == null ? '—' : `${fmtNum(summary.variancePct)}%`, color: varColor(summary.totalVarianceValue) },
              { label: 'Items Tracked', value: fmtNum(summary.itemCount || 0), color: '#111827' },
            ].map((c, i) => (
              <div key={i} style={{ ...card, padding: '14px 16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{c.label}</div>
                <div style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: 700, color: c.color, marginTop: '6px' }}>{c.value}</div>
              </div>
            ))}
          </div>

          {/* No-counts prompt */}
          {data?.requiresStockCounts && (
            <div style={{ ...card, padding: '16px 18px', display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'linear-gradient(135deg, #fffbeb, #fefce8)', border: '1px solid #fde68a' }}>
              <FaClipboardCheck size={18} color="#d97706" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#92400e' }}>Do a physical stock count to see variance</div>
                <div style={{ fontSize: '12px', color: '#a16207', marginTop: '3px' }}>Variance is measured against a real count. Run a Stock Audit (Stock → count) in this period, and the shrinkage will show up here — item by item.</div>
              </div>
            </div>
          )}

          {/* Table */}
          {items.length === 0 ? (
            <div style={{ ...card, padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #059669, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <FaChartLine size={22} color="white" />
              </div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#374151' }}>No usage in this period</h3>
              <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#6b7280' }}>Once orders consume recipe ingredients, expected usage will appear here.</p>
            </div>
          ) : (
            <div style={{ ...card, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                      {['Item', 'Expected Usage', 'Count Adj.', 'Variance', 'Variance %', 'Loss Value'].map((h, i) => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: i === 0 ? 'left' : 'right', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((r, idx) => (
                      <tr key={r.inventoryItemId || idx} style={{ borderBottom: idx === items.length - 1 ? 'none' : '1px solid #f3f4f6' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: '#111827' }}>{r.name || '—'}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', color: '#374151', fontVariantNumeric: 'tabular-nums' }}>{fmtNum(r.expectedUsage)} {r.unit || ''}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', color: '#6b7280', fontVariantNumeric: 'tabular-nums' }}>{r.countAdjustment > 0 ? '+' : ''}{fmtNum(r.countAdjustment)}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: varColor(r.varianceQty), fontVariantNumeric: 'tabular-nums' }}>{r.varianceQty > 0 ? '−' : r.varianceQty < 0 ? '+' : ''}{fmtNum(Math.abs(r.varianceQty))} {r.unit || ''}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', color: varColor(r.varianceQty), fontVariantNumeric: 'tabular-nums' }}>{r.variancePct == null ? '—' : `${fmtNum(Math.abs(r.variancePct))}%`}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: varColor(r.varianceValue), fontVariantNumeric: 'tabular-nums' }}>{r.varianceValue ? fmt(Math.abs(r.varianceValue)) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0 4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FaExclamationTriangle size={10} color="#d97706" /> A positive variance = missing stock (over-portioning, waste, or theft) beyond what recipes account for. Negative = surplus found at count.
          </p>
        </>
      )}
    </div>
  );
}

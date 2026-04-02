'use client';

import { useState, useMemo } from 'react';
import { FaMoneyBillWave, FaCreditCard, FaUtensils, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Cell } from 'recharts';

const cardStyle = {
  backgroundColor: 'white', borderRadius: '14px', padding: '20px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6',
};

const PAYMENT_COLORS = { cash: '#059669', card: '#2563eb', upi: '#8b5cf6', online: '#f59e0b' };
const ORDER_COLORS = { 'dine-in': '#2563eb', takeaway: '#f59e0b', delivery: '#8b5cf6', pickup: '#059669' };

function CustomTooltip({ active, payload, label, formatCurrency }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ backgroundColor: 'white', padding: '10px 14px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', border: '1px solid #e5e7eb', fontSize: '12px' }}>
      <div style={{ fontWeight: 600, color: '#374151', marginBottom: '6px' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: p.color }} />
          <span style={{ color: '#6b7280' }}>{p.name}:</span>
          <span style={{ fontWeight: 600, color: '#111827' }}>{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function groupBreakdown(dailyBreakdown, view) {
  if (!dailyBreakdown || view === 'daily') return dailyBreakdown;
  const map = {};
  dailyBreakdown.forEach(day => {
    const d = new Date(day.date);
    let key;
    if (view === 'weekly') {
      const startOfYear = new Date(d.getFullYear(), 0, 1);
      const weekNum = Math.ceil(((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
      key = `W${String(weekNum).padStart(2, '0')} ${d.getFullYear()}`;
    } else {
      key = d.toLocaleString('en-IN', { month: 'short', year: 'numeric' });
    }
    if (!map[key]) map[key] = { date: key, orders: 0, revenue: 0, tax: 0 };
    map[key].orders += day.orders || 0;
    map[key].revenue += day.revenue || 0;
    map[key].tax += day.tax || 0;
  });
  return Object.values(map);
}

export default function RevenueTab({ revenueData, loadingRevenue, isMobile, formatCurrency }) {
  const [breakdownView, setBreakdownView] = useState('daily');
  if (loadingRevenue && !revenueData) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        Loading revenue...
      </div>
    );
  }

  if (!revenueData) {
    return <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af', fontSize: '14px' }}>No revenue data available.</div>;
  }

  const { totalRevenue, totalTax, totalDiscounts, refunds, orderCount, avgOrderValue, byPaymentMethod, byOrderType, dailyBreakdown, changePercent } = revenueData;

  const paymentData = Object.entries(byPaymentMethod || {}).map(([key, val]) => ({ name: key, value: val })).sort((a, b) => b.value - a.value);
  const orderTypeData = Object.entries(byOrderType || {}).map(([key, val]) => ({ name: key, value: val })).sort((a, b) => b.value - a.value);
  const maxPayment = paymentData.length ? Math.max(...paymentData.map(d => d.value)) : 0;
  const maxOrderType = orderTypeData.length ? Math.max(...orderTypeData.map(d => d.value)) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '12px' }}>
        {[
          { label: 'Total Revenue', value: formatCurrency(totalRevenue || 0), sub: changePercent !== undefined ? `${changePercent > 0 ? '+' : ''}${changePercent}% vs prev` : null, color: changePercent > 0 ? '#059669' : changePercent < 0 ? '#dc2626' : '#6b7280' },
          { label: 'Orders', value: orderCount || 0 },
          { label: 'Avg Order Value', value: formatCurrency(avgOrderValue || 0) },
          { label: 'Tax Collected', value: formatCurrency(totalTax || 0) },
          { label: 'Discounts', value: formatCurrency(totalDiscounts || 0) },
          { label: 'Refunds', value: formatCurrency(refunds || 0) },
        ].map((stat, i) => (
          <div key={i} style={{ ...cardStyle, padding: '14px 18px' }}>
            <div style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '6px' }}>{stat.label}</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#111827' }}>{stat.value}</div>
            {stat.sub && <div style={{ fontSize: '11px', fontWeight: 600, color: stat.color, marginTop: '2px' }}>{stat.sub}</div>}
          </div>
        ))}
      </div>

      {/* Revenue Trend */}
      <div style={cardStyle}>
        <div style={{ fontSize: '15px', fontWeight: 700, color: '#1f2937', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaMoneyBillWave size={14} style={{ color: '#2563eb' }} />
          Revenue Trend
        </div>
        {dailyBreakdown?.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={dailyBreakdown} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => { const d = new Date(v); return `${d.getDate()}/${d.getMonth() + 1}`; }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} width={45} />
              <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#2563eb" fill="url(#colorRev)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: '#9ca3af', fontSize: '13px' }}>No daily data available.</div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
        {/* Payment Method Breakdown */}
        <div style={cardStyle}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#1f2937', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaCreditCard size={14} style={{ color: '#2563eb' }} />
            By Payment Method
          </div>
          {paymentData.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {paymentData.map((item, i) => {
                const pct = maxPayment > 0 ? (item.value / maxPayment) * 100 : 0;
                const color = PAYMENT_COLORS[item.name] || '#6b7280';
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151', textTransform: 'capitalize' }}>{item.name}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{formatCurrency(item.value)}</span>
                    </div>
                    <div style={{ height: '6px', borderRadius: '3px', backgroundColor: '#e5e7eb', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', borderRadius: '3px', backgroundColor: color, transition: 'width 0.3s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '28px 16px', color: '#9ca3af', fontSize: '13px' }}>No payment data.</div>
          )}
        </div>

        {/* Order Type Breakdown */}
        <div style={cardStyle}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#1f2937', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaUtensils size={14} style={{ color: '#2563eb' }} />
            By Order Type
          </div>
          {orderTypeData.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {orderTypeData.map((item, i) => {
                const pct = maxOrderType > 0 ? (item.value / maxOrderType) * 100 : 0;
                const color = ORDER_COLORS[item.name] || '#6b7280';
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151', textTransform: 'capitalize' }}>{item.name}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{formatCurrency(item.value)}</span>
                    </div>
                    <div style={{ height: '6px', borderRadius: '3px', backgroundColor: '#e5e7eb', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', borderRadius: '3px', backgroundColor: color, transition: 'width 0.3s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '28px 16px', color: '#9ca3af', fontSize: '13px' }}>No order type data.</div>
          )}
        </div>
      </div>

      {/* Breakdown Table */}
      {dailyBreakdown?.length > 0 && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#1f2937' }}>
              {breakdownView === 'daily' ? 'Daily' : breakdownView === 'weekly' ? 'Weekly' : 'Monthly'} Breakdown
            </div>
            <div style={{ display: 'flex', gap: '2px', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '2px' }}>
              {['daily', 'weekly', 'monthly'].map(v => (
                <button key={v} onClick={() => setBreakdownView(v)} style={{
                  padding: '5px 12px', borderRadius: '6px', border: 'none', fontSize: '11px', fontWeight: 600,
                  cursor: 'pointer', textTransform: 'capitalize',
                  backgroundColor: breakdownView === v ? 'white' : 'transparent',
                  color: breakdownView === v ? '#2563eb' : '#64748b',
                  boxShadow: breakdownView === v ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                }}>{v}</button>
              ))}
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  {['Date', 'Orders', 'Revenue', 'Tax'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: h === 'Date' ? 'left' : 'right', fontWeight: 600, color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groupBreakdown(dailyBreakdown, breakdownView).map((day, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: '#374151' }}>
                      {breakdownView === 'daily' ? new Date(day.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : day.date}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#374151' }}>{day.orders || 0}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#111827' }}>{formatCurrency(day.revenue || 0)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#6b7280' }}>{formatCurrency(day.tax || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

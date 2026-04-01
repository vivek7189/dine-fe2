'use client';

import { FaMoneyBillWave, FaBoxes, FaReceipt, FaChartLine, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';

const cardStyle = {
  backgroundColor: 'white', borderRadius: '14px', padding: '20px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6',
};

function StatCard({ label, value, change, icon: Icon, color, bg, isMobile, formatCurrency, prefix = true }) {
  const isPositive = change > 0;
  const isNegative = change < 0;
  return (
    <div style={{ ...cardStyle, padding: isMobile ? '16px' : '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <span style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{label}</span>
        <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={14} color={color} />
        </div>
      </div>
      <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>
        {prefix ? formatCurrency(value || 0) : (value || 0)}
      </div>
      {change !== undefined && change !== null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: isPositive ? '#059669' : isNegative ? '#dc2626' : '#6b7280' }}>
          {isPositive ? <FaArrowUp size={9} /> : isNegative ? <FaArrowDown size={9} /> : null}
          {Math.abs(change)}% vs prev period
        </div>
      )}
    </div>
  );
}

function CustomTooltip({ active, payload, label, formatCurrency }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ backgroundColor: 'white', padding: '10px 14px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', border: '1px solid #e5e7eb', fontSize: '12px' }}>
      <div style={{ fontWeight: 600, color: '#374151', marginBottom: '6px' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: p.color }} />
          <span style={{ color: '#6b7280' }}>{p.name}:</span>
          <span style={{ fontWeight: 600, color: '#111827' }}>{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function OverviewTab({ overviewData, loadingOverview, isMobile, formatCurrency }) {
  if (loadingOverview && !overviewData) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        Loading overview...
      </div>
    );
  }

  if (!overviewData) {
    return <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af', fontSize: '14px' }}>No data available for this period.</div>;
  }

  const { revenue, cogs, expenses, profit, grossMargin, supplierDuesTotal, cashFlowData, topExpenseCategories, orderCount } = overviewData;

  const maxExpense = topExpenseCategories?.length ? Math.max(...topExpenseCategories.map(c => c.amount)) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px' }}>
        <StatCard label="Revenue" value={revenue?.total} change={revenue?.changePercent} icon={FaMoneyBillWave} color="#059669" bg="#ecfdf5" isMobile={isMobile} formatCurrency={formatCurrency} />
        <StatCard label="COGS" value={cogs?.total} icon={FaBoxes} color="#f59e0b" bg="#fffbeb" isMobile={isMobile} formatCurrency={formatCurrency} />
        <StatCard label="Expenses" value={expenses?.total} change={expenses?.changePercent} icon={FaReceipt} color="#ef4444" bg="#fef2f2" isMobile={isMobile} formatCurrency={formatCurrency} />
        <StatCard label="Net Profit" value={profit?.total} change={profit?.changePercent} icon={FaChartLine} color="#2563eb" bg="#eff6ff" isMobile={isMobile} formatCurrency={formatCurrency} />
      </div>

      {/* Quick Numbers Row */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '12px' }}>
        <div style={{ ...cardStyle, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>Gross Margin</span>
          <span style={{ fontSize: '16px', fontWeight: 700, color: (grossMargin || 0) >= 50 ? '#059669' : '#f59e0b' }}>{grossMargin || 0}%</span>
        </div>
        <div style={{ ...cardStyle, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>Orders</span>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>{orderCount || 0}</span>
        </div>
        <div style={{ ...cardStyle, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>Supplier Dues</span>
          <span style={{ fontSize: '16px', fontWeight: 700, color: (supplierDuesTotal || 0) > 0 ? '#ef4444' : '#059669' }}>{formatCurrency(supplierDuesTotal || 0)}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr', gap: '16px' }}>
        {/* Cash Flow Chart */}
        <div style={cardStyle}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#1f2937', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaChartLine size={14} style={{ color: '#2563eb' }} />
            Cash Flow
          </div>
          {cashFlowData?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={cashFlowData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => { const d = new Date(v); return `${d.getDate()}/${d.getMonth() + 1}`; }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} width={45} />
                <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#059669" fill="url(#colorRevenue)" strokeWidth={2} />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" fill="url(#colorExpenses)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: '#9ca3af', fontSize: '13px' }}>No cash flow data for this period.</div>
          )}
        </div>

        {/* Top Expense Categories */}
        <div style={cardStyle}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#1f2937', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaReceipt size={14} style={{ color: '#2563eb' }} />
            Top Expenses
          </div>
          {topExpenseCategories?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {topExpenseCategories.map((cat, i) => {
                const pct = maxExpense > 0 ? (cat.amount / maxExpense) * 100 : 0;
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151', textTransform: 'capitalize' }}>{cat.name}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{formatCurrency(cat.amount)}</span>
                    </div>
                    <div style={{ height: '6px', borderRadius: '3px', backgroundColor: '#e5e7eb', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', borderRadius: '3px', backgroundColor: '#2563eb', transition: 'width 0.3s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: '#9ca3af', fontSize: '13px' }}>No expenses recorded yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

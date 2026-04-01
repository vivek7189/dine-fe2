'use client';

import { FaBalanceScale, FaDownload, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const cardStyle = {
  backgroundColor: 'white', borderRadius: '14px', padding: '20px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6',
};

const CATEGORY_LABELS = {
  rent: 'Rent', utilities: 'Utilities', salaries: 'Salaries & Wages', marketing: 'Marketing',
  repairs: 'Repairs & Maintenance', supplies: 'Supplies', insurance: 'Insurance', licenses: 'Licenses & Permits',
  equipment: 'Equipment', miscellaneous: 'Miscellaneous',
};

function PnlRow({ label, value, formatCurrency, bold, indent, negative, color, border, large }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: `${large ? '14px' : '10px'} 0`,
      borderTop: border === 'top' ? '2px solid #1f2937' : 'none',
      borderBottom: border === 'bottom' ? '1px solid #e5e7eb' : 'none',
      marginLeft: indent ? '24px' : 0,
    }}>
      <span style={{
        fontSize: large ? '16px' : '14px',
        fontWeight: bold ? 700 : 400,
        color: color || (bold ? '#1f2937' : '#374151'),
      }}>
        {label}
      </span>
      <span style={{
        fontSize: large ? '18px' : '14px',
        fontWeight: bold ? 800 : 600,
        color: color || (negative ? '#dc2626' : '#111827'),
        fontVariantNumeric: 'tabular-nums',
      }}>
        {negative ? `(${formatCurrency(Math.abs(value || 0))})` : formatCurrency(value || 0)}
      </span>
    </div>
  );
}

function exportPnlCSV(pnlData, formatCurrency) {
  if (!pnlData) return;
  const { revenue, cogs, grossProfit, grossMargin, expenses, expensesByCategory, supplierCredits, netProfit, netMargin } = pnlData;
  const lines = [
    ['Profit & Loss Statement'],
    [],
    ['Revenue', revenue],
    ['Less: Cost of Goods Sold', -cogs],
    ['Gross Profit', grossProfit],
    [`Gross Margin`, `${grossMargin}%`],
    [],
    ['Less: Operating Expenses'],
    ...Object.entries(expensesByCategory || {}).map(([cat, amt]) => [`  ${CATEGORY_LABELS[cat] || cat}`, -amt]),
    ['Total Expenses', -expenses],
    [],
    ['Supplier Credits', supplierCredits],
    [],
    ['Net Profit', netProfit],
    [`Net Margin`, `${netMargin}%`],
  ];
  const csv = lines.map(row => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `profit-loss-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ProfitLossTab({ pnlData, loadingPnl, isMobile, formatCurrency }) {
  if (loadingPnl && !pnlData) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        Loading P&L...
      </div>
    );
  }

  if (!pnlData) {
    return <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af', fontSize: '14px' }}>No P&L data available.</div>;
  }

  const { revenue, cogs, grossProfit, grossMargin, expenses, expensesByCategory, supplierCredits, netProfit, netMargin, revenueChange, profitChange } = pnlData;

  const expenseEntries = Object.entries(expensesByCategory || {}).sort((a, b) => b[1] - a[1]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header with Export */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {revenueChange !== undefined && (
            <span style={{ fontSize: '12px', fontWeight: 600, color: revenueChange >= 0 ? '#059669' : '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {revenueChange >= 0 ? <FaArrowUp size={9} /> : <FaArrowDown size={9} />}
              Revenue {Math.abs(revenueChange)}% vs prev
            </span>
          )}
          {profitChange !== undefined && (
            <span style={{ fontSize: '12px', fontWeight: 600, color: profitChange >= 0 ? '#059669' : '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {profitChange >= 0 ? <FaArrowUp size={9} /> : <FaArrowDown size={9} />}
              Profit {Math.abs(profitChange)}% vs prev
            </span>
          )}
        </div>
        <button
          onClick={() => exportPnlCSV(pnlData, formatCurrency)}
          style={{
            padding: '9px 16px', backgroundColor: 'white', color: '#374151',
            border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '13px',
            fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          <FaDownload size={11} /> Export CSV
        </button>
      </div>

      {/* P&L Statement */}
      <div style={cardStyle}>
        <div style={{ fontSize: '15px', fontWeight: 700, color: '#1f2937', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaBalanceScale size={14} style={{ color: '#2563eb' }} />
          Profit & Loss Statement
        </div>

        <div style={{ maxWidth: '600px' }}>
          {/* Revenue */}
          <PnlRow label="Revenue" value={revenue} formatCurrency={formatCurrency} bold border="bottom" />

          {/* COGS */}
          <PnlRow label="Less: Cost of Goods Sold" value={cogs} formatCurrency={formatCurrency} negative />

          {/* Gross Profit */}
          <PnlRow label={`Gross Profit (${grossMargin || 0}%)`} value={grossProfit} formatCurrency={formatCurrency} bold border="top" color={(grossProfit || 0) >= 0 ? '#059669' : '#dc2626'} />

          {/* Spacer */}
          <div style={{ height: '12px' }} />

          {/* Operating Expenses */}
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '8px 0' }}>
            Less: Operating Expenses
          </div>
          {expenseEntries.length > 0 ? (
            expenseEntries.map(([cat, amount]) => (
              <PnlRow key={cat} label={CATEGORY_LABELS[cat] || cat} value={amount} formatCurrency={formatCurrency} indent negative />
            ))
          ) : (
            <div style={{ padding: '8px 0 8px 24px', fontSize: '13px', color: '#9ca3af' }}>No expenses recorded</div>
          )}
          <PnlRow label="Total Operating Expenses" value={expenses} formatCurrency={formatCurrency} bold negative border="top" />

          {/* Supplier Credits */}
          {(supplierCredits || 0) > 0 && (
            <>
              <div style={{ height: '8px' }} />
              <PnlRow label="Supplier Credits (Returns)" value={supplierCredits} formatCurrency={formatCurrency} color="#059669" />
            </>
          )}

          {/* Net Profit */}
          <div style={{ height: '8px' }} />
          <PnlRow
            label={`Net Profit (${netMargin || 0}%)`}
            value={netProfit}
            formatCurrency={formatCurrency}
            bold large border="top"
            color={(netProfit || 0) >= 0 ? '#059669' : '#dc2626'}
          />
        </div>
      </div>

      {/* Visual Comparison */}
      <div style={cardStyle}>
        <div style={{ fontSize: '15px', fontWeight: 700, color: '#1f2937', marginBottom: '16px' }}>Visual Breakdown</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={[{ name: 'Current Period', Revenue: revenue || 0, COGS: cogs || 0, Expenses: expenses || 0, Profit: netProfit || 0 }]} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} width={50} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="Revenue" fill="#059669" radius={[4, 4, 0, 0]} />
            <Bar dataKey="COGS" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Profit" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

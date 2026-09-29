'use client';

// Tax report for any country (Kenya VAT + catering levy, UAE VAT, sales tax…): each tax by its own
// name and rate as charged on the bills, for a month, with an Excel export. India uses the GST tab
// (GSTR-1 / 3B with the CGST+SGST split) instead.
import { useState, useEffect, useCallback } from 'react';
import { FaDownload, FaFileInvoice } from 'react-icons/fa';

const cardStyle = {
  backgroundColor: 'white', borderRadius: '14px', padding: '20px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6',
};
const inputStyle = {
  padding: '9px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
  fontSize: '13px', fontWeight: 600, color: '#334155', backgroundColor: 'white',
  cursor: 'pointer', outline: 'none',
};
const btnPrimary = {
  padding: '8px 16px', background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
  color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px',
  fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
  boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
};
const th = { padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' };
const td = { padding: '10px 12px', fontSize: '13px', color: '#111827', borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap' };

export default function TaxSummaryTab({ restaurantId, apiClient, isMobile, formatCurrency, taxLabel = 'Tax', currencyCode = '' }) {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!restaurantId || !month) return;
    setLoading(true); setError('');
    try {
      setData(await apiClient.getTaxSummary(restaurantId, month));
    } catch (e) {
      setData(null);
      setError(e?.message || 'Could not load the tax report');
    } finally {
      setLoading(false);
    }
  }, [restaurantId, month, apiClient]);

  useEffect(() => { load(); }, [load]);

  const monthLabel = (() => {
    const [y, m] = month.split('-');
    return new Date(y, m - 1).toLocaleString('en-GB', { month: 'long', year: 'numeric' });
  })();

  const exportExcel = async () => {
    if (!data) return;
    const XLSX = await import('xlsx');
    const cur = currencyCode ? ` (${currencyCode})` : '';
    const wb = XLSX.utils.book_new();
    const summary = [
      [`${taxLabel} report — ${monthLabel}`],
      [],
      ['Orders', data.totals.orders],
      [`Gross sales${cur}`, data.totals.grossSales],
      [`Total tax${cur}`, data.totals.totalTax],
      [`Net sales (excl. tax)${cur}`, data.totals.netSales],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summary), 'Summary');
    const taxes = [['Tax', 'Rate %', 'Included in price', 'Orders', `Tax amount${cur}`],
      ...data.taxes.map(t => [t.name, t.rate, t.inclusive ? 'Yes' : 'No', t.orders, t.taxAmount]),
      ['Total', '', '', '', data.totals.totalTax]];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(taxes), 'Taxes');
    const daily = [['Date', 'Orders', `Gross sales${cur}`, `Tax${cur}`, `Net sales${cur}`],
      ...data.daily.map(d => [d.date, d.orders, d.grossSales, d.tax, d.netSales])];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(daily), 'Daily');
    XLSX.writeFile(wb, `${String(taxLabel).toLowerCase().replace(/[^a-z0-9]+/g, '-')}-report-${month}.xlsx`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 700, color: '#111827' }}>
          <FaFileInvoice color="#2563eb" /> {taxLabel} report — {monthLabel}
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input type="month" value={month} onChange={e => setMonth(e.target.value)} style={inputStyle} />
          <button onClick={exportExcel} disabled={!data} style={{ ...btnPrimary, opacity: data ? 1 : 0.5 }}><FaDownload size={10} /> Export Excel</button>
        </div>
      </div>

      {error && <div style={{ ...cardStyle, color: '#b91c1c', fontSize: '13px' }}>{error}</div>}
      {loading && !data && <div style={{ ...cardStyle, textAlign: 'center', color: '#9ca3af' }}>Loading…</div>}

      {data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px' }}>
            {[
              ['Orders', String(data.totals.orders)],
              ['Gross sales', formatCurrency(data.totals.grossSales)],
              ['Total tax', formatCurrency(data.totals.totalTax)],
              ['Net sales (excl. tax)', formatCurrency(data.totals.netSales)],
            ].map(([label, value]) => (
              <div key={label} style={cardStyle}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>{label}</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#111827', marginTop: '6px' }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ ...cardStyle, padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Tax', 'Rate', 'Included in price', 'Orders', 'Tax amount'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>
                {data.taxes.length === 0 && <tr><td style={td} colSpan={5}>No tax on completed bills this month.</td></tr>}
                {data.taxes.map(t => (
                  <tr key={`${t.name}-${t.rate}-${t.inclusive}`}>
                    <td style={{ ...td, fontWeight: 600 }}>{t.name}</td>
                    <td style={td}>{t.rate}%</td>
                    <td style={td}>{t.inclusive ? 'Yes' : 'No'}</td>
                    <td style={td}>{t.orders}</td>
                    <td style={{ ...td, fontWeight: 700 }}>{formatCurrency(t.taxAmount)}</td>
                  </tr>
                ))}
                {data.taxes.length > 0 && (
                  <tr><td style={{ ...td, fontWeight: 800 }} colSpan={4}>Total</td><td style={{ ...td, fontWeight: 800 }}>{formatCurrency(data.totals.totalTax)}</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ ...cardStyle, padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Date', 'Orders', 'Gross sales', 'Tax', 'Net sales'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>
                {data.daily.map(d => (
                  <tr key={d.date}>
                    <td style={{ ...td, fontWeight: 600 }}>{d.date}</td>
                    <td style={td}>{d.orders}</td>
                    <td style={td}>{formatCurrency(d.grossSales)}</td>
                    <td style={td}>{formatCurrency(d.tax)}</td>
                    <td style={td}>{formatCurrency(d.netSales)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

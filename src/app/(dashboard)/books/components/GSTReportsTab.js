'use client';

import { useState, useEffect } from 'react';
import { FaFileInvoice, FaDownload, FaReceipt, FaListAlt } from 'react-icons/fa';

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

const SUB_TABS = [
  { key: 'gstr1', label: 'GSTR-1', icon: FaFileInvoice },
  { key: 'gstr3b', label: 'GSTR-3B', icon: FaReceipt },
  { key: 'hsn', label: 'HSN Summary', icon: FaListAlt },
];

export default function GSTReportsTab({ restaurantId, apiClient, isMobile, formatCurrency }) {
  const [subTab, setSubTab] = useState('gstr1');
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [gstr1Data, setGstr1Data] = useState(null);
  const [gstr3bData, setGstr3bData] = useState(null);
  const [hsnData, setHsnData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!restaurantId || !month) return;
    setLoading(true);
    try {
      if (subTab === 'gstr1') {
        const res = await apiClient.getGSTR1(restaurantId, month);
        setGstr1Data(res);
      } else if (subTab === 'gstr3b') {
        const res = await apiClient.getGSTR3B(restaurantId, month);
        setGstr3bData(res);
      } else if (subTab === 'hsn') {
        const res = await apiClient.getHSNSummary(restaurantId, month);
        setHsnData(res);
      }
    } catch (err) {
      console.error('GST fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [subTab, month, restaurantId]);

  const handleExport = async () => {
    try {
      const csv = await apiClient.exportGSTReport(restaurantId, subTab === 'gstr3b' ? 'gstr3b' : subTab === 'hsn' ? 'hsn' : 'gstr1', month);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${subTab}-${month}.csv`; a.click();
      URL.revokeObjectURL(url);
    } catch (err) { console.error('Export error:', err); }
  };

  const monthLabel = (() => {
    const [y, m] = month.split('-');
    return new Date(y, m - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
  })();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f1f5f9', borderRadius: '10px', padding: '3px' }}>
          {SUB_TABS.map(t => (
            <button key={t.key} onClick={() => setSubTab(t.key)}
              style={{
                padding: '8px 14px', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
                backgroundColor: subTab === t.key ? 'white' : 'transparent',
                color: subTab === t.key ? '#2563eb' : '#64748b',
                boxShadow: subTab === t.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}>
              <t.icon size={11} /> {t.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input type="month" value={month} onChange={e => setMonth(e.target.value)} style={inputStyle} />
          <button onClick={handleExport} style={btnPrimary}><FaDownload size={10} /> Export CSV</button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          Loading GST report...
        </div>
      ) : (
        <>
          {/* GSTR-1 */}
          {subTab === 'gstr1' && gstr1Data && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px' }}>
                {[
                  { label: 'Total Invoices', value: gstr1Data.summary?.totalInvoices || 0, prefix: false },
                  { label: 'Taxable Value', value: gstr1Data.summary?.totalTaxableValue || 0 },
                  { label: 'Total Tax', value: gstr1Data.summary?.totalTax || 0 },
                  { label: 'Invoice Value', value: gstr1Data.summary?.totalInvoiceValue || 0 },
                ].map(s => (
                  <div key={s.label} style={{ ...cardStyle, padding: '14px 18px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>{s.label}</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#111827' }}>{s.prefix === false ? s.value : formatCurrency(s.value)}</div>
                  </div>
                ))}
              </div>
              {/* Table */}
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 700, color: '#111827' }}>Outward Supplies — {monthLabel}</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                        {['Order#', 'Date', 'Customer', 'Type', 'Taxable', 'CGST', 'SGST', 'Total', 'Payment'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '8px 10px', fontWeight: 600, color: '#6b7280', fontSize: '10px', textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(gstr1Data.invoices || []).map((inv, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '8px 10px', fontWeight: 600, color: '#111827' }}>{inv.orderNumber}</td>
                          <td style={{ padding: '8px 10px', color: '#6b7280' }}>{inv.date ? new Date(inv.date).toLocaleDateString('en-IN') : ''}</td>
                          <td style={{ padding: '8px 10px', color: '#374151' }}>{inv.customerName}</td>
                          <td style={{ padding: '8px 10px' }}>
                            <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, backgroundColor: '#eff6ff', color: '#2563eb' }}>{inv.orderType}</span>
                          </td>
                          <td style={{ padding: '8px 10px', color: '#111827' }}>{formatCurrency(inv.taxableValue)}</td>
                          <td style={{ padding: '8px 10px', color: '#059669' }}>{formatCurrency(inv.cgst)}</td>
                          <td style={{ padding: '8px 10px', color: '#059669' }}>{formatCurrency(inv.sgst)}</td>
                          <td style={{ padding: '8px 10px', fontWeight: 700, color: '#111827' }}>{formatCurrency(inv.totalValue)}</td>
                          <td style={{ padding: '8px 10px', color: '#6b7280' }}>{inv.paymentMethod}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(!gstr1Data.invoices || gstr1Data.invoices.length === 0) && (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#9ca3af', fontSize: '13px' }}>No invoices found for {monthLabel}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* GSTR-3B */}
          {subTab === 'gstr3b' && gstr3bData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 700, color: '#111827' }}>GSTR-3B Summary — {monthLabel}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Outward */}
                  <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#166534', textTransform: 'uppercase', marginBottom: '10px' }}>3.1 Outward Supplies (Sales)</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      <div><div style={{ fontSize: '11px', color: '#6b7280' }}>Taxable Value</div><div style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>{formatCurrency(gstr3bData.outwardSupplies?.taxableValue)}</div></div>
                      <div><div style={{ fontSize: '11px', color: '#6b7280' }}>CGST</div><div style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>{formatCurrency(gstr3bData.outwardSupplies?.cgst)}</div></div>
                      <div><div style={{ fontSize: '11px', color: '#6b7280' }}>SGST</div><div style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>{formatCurrency(gstr3bData.outwardSupplies?.sgst)}</div></div>
                    </div>
                  </div>
                  {/* Inward */}
                  <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', marginBottom: '10px' }}>4. Input Tax Credit (Purchases)</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      <div><div style={{ fontSize: '11px', color: '#6b7280' }}>Taxable Value</div><div style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>{formatCurrency(gstr3bData.inwardSupplies?.taxableValue)}</div></div>
                      <div><div style={{ fontSize: '11px', color: '#6b7280' }}>CGST</div><div style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>{formatCurrency(gstr3bData.inwardSupplies?.cgst)}</div></div>
                      <div><div style={{ fontSize: '11px', color: '#6b7280' }}>SGST</div><div style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>{formatCurrency(gstr3bData.inwardSupplies?.sgst)}</div></div>
                    </div>
                  </div>
                  {/* Net */}
                  <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: '#fef3c7', border: '1px solid #fde68a' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', marginBottom: '10px' }}>6.1 Net Tax Payable</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      <div><div style={{ fontSize: '11px', color: '#6b7280' }}>Total Liability</div><div style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>{formatCurrency(gstr3bData.totalTaxLiability)}</div></div>
                      <div><div style={{ fontSize: '11px', color: '#6b7280' }}>ITC Available</div><div style={{ fontSize: '16px', fontWeight: 800, color: '#059669' }}>-{formatCurrency(gstr3bData.itcAvailable)}</div></div>
                      <div><div style={{ fontSize: '11px', color: '#6b7280' }}>Net Payable</div><div style={{ fontSize: '20px', fontWeight: 800, color: '#dc2626' }}>{formatCurrency(gstr3bData.netTaxPayable)}</div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* HSN Summary */}
          {subTab === 'hsn' && hsnData && (
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 700, color: '#111827' }}>HSN-wise Summary — {monthLabel}</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                      {['HSN Code', 'Description', 'Qty', 'Rate %', 'Taxable Value', 'CGST', 'SGST', 'Total Tax', 'Total Value'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '8px 10px', fontWeight: 600, color: '#6b7280', fontSize: '10px', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(hsnData.hsnSummary || []).map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '8px 10px', fontWeight: 700, color: '#2563eb' }}>{row.hsnCode}</td>
                        <td style={{ padding: '8px 10px', color: '#374151' }}>{row.description}</td>
                        <td style={{ padding: '8px 10px', color: '#111827' }}>{row.quantity}</td>
                        <td style={{ padding: '8px 10px', color: '#6b7280' }}>{row.rate}%</td>
                        <td style={{ padding: '8px 10px', color: '#111827' }}>{formatCurrency(row.taxableValue)}</td>
                        <td style={{ padding: '8px 10px', color: '#059669' }}>{formatCurrency(row.cgst)}</td>
                        <td style={{ padding: '8px 10px', color: '#059669' }}>{formatCurrency(row.sgst)}</td>
                        <td style={{ padding: '8px 10px', fontWeight: 600, color: '#111827' }}>{formatCurrency(row.totalTax)}</td>
                        <td style={{ padding: '8px 10px', fontWeight: 700, color: '#111827' }}>{formatCurrency(row.totalValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!hsnData.hsnSummary || hsnData.hsnSummary.length === 0) && (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#9ca3af', fontSize: '13px' }}>No HSN data found for {monthLabel}</div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

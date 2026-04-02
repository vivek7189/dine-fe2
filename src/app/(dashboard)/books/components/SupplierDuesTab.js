'use client';

import { useState } from 'react';
import { FaTruck, FaChevronDown, FaChevronUp, FaFileInvoice, FaExclamationTriangle, FaMoneyBillWave } from 'react-icons/fa';
import PaymentRecordModal from './PaymentRecordModal';

const cardStyle = {
  backgroundColor: 'white', borderRadius: '14px', padding: '20px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6',
};

function getAgingColor(ageDays) {
  if (ageDays <= 0) return '#059669';   // current - green
  if (ageDays <= 60) return '#f59e0b';  // 1-60 - amber
  if (ageDays <= 90) return '#f97316';  // 61-90 - orange
  return '#ef4444';                      // 90+ - red
}

function getStatusBadge(status) {
  const colors = { unpaid: '#ef4444', partial: '#f59e0b', paid: '#059669' };
  const color = colors[status] || '#6b7280';
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '99px', fontSize: '10px', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.03em',
      backgroundColor: `${color}18`, color,
    }}>
      {status}
    </span>
  );
}

export default function SupplierDuesTab({ supplierDuesData, loadingSupplierDues, isMobile, formatCurrency, handleRecordSupplierPayment }) {
  const [expandedSupplier, setExpandedSupplier] = useState(null);
  const [paymentInvoice, setPaymentInvoice] = useState(null);

  if (loadingSupplierDues && !supplierDuesData) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        Loading payables...
      </div>
    );
  }

  if (!supplierDuesData) {
    return <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af', fontSize: '14px' }}>No payables data available.</div>;
  }

  const { totalOwed, overdueAmount, suppliersCount, suppliers } = supplierDuesData;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '12px' }}>
        <div style={{ ...cardStyle, padding: '14px 18px' }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '6px' }}>Total Owed</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#111827' }}>{formatCurrency(totalOwed || 0)}</div>
        </div>
        <div style={{ ...cardStyle, padding: '14px 18px' }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '6px' }}>Overdue (90+ days)</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: (overdueAmount || 0) > 0 ? '#ef4444' : '#111827' }}>{formatCurrency(overdueAmount || 0)}</div>
        </div>
        <div style={{ ...cardStyle, padding: '14px 18px' }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '6px' }}>Suppliers with Dues</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#111827' }}>{suppliersCount || 0}</div>
        </div>
      </div>

      {/* Aging Table */}
      {suppliers?.length > 0 ? (
        <div style={cardStyle}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#1f2937', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaTruck size={14} style={{ color: '#2563eb' }} />
            Supplier Aging
          </div>

          {/* Table Header */}
          {!isMobile && (
            <div style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 40px',
              padding: '10px 14px', borderBottom: '2px solid #e5e7eb', marginBottom: '4px',
            }}>
              {['Supplier', 'Current', '1-60 Days', '61-90 Days', '90+ Days', 'Total', ''].map(h => (
                <div key={h} style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: h === 'Supplier' || h === '' ? 'left' : 'right' }}>{h}</div>
              ))}
            </div>
          )}

          {/* Supplier Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {suppliers.map((supplier) => {
              const isExpanded = expandedSupplier === supplier.supplierId;
              return (
                <div key={supplier.supplierId}>
                  <div
                    onClick={() => setExpandedSupplier(isExpanded ? null : supplier.supplierId)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr auto auto' : '2fr 1fr 1fr 1fr 1fr 1fr 40px',
                      padding: '12px 14px', backgroundColor: isExpanded ? '#eff6ff' : '#fafafa',
                      borderRadius: '10px', border: `1px solid ${isExpanded ? '#bfdbfe' : '#f3f4f6'}`,
                      cursor: 'pointer', transition: 'all 0.15s', alignItems: 'center',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '13px', color: '#1f2937' }}>{supplier.supplierName}</div>
                    {!isMobile && (
                      <>
                        <div style={{ textAlign: 'right', fontSize: '13px', color: '#059669', fontWeight: 600 }}>{formatCurrency(supplier.current || 0)}</div>
                        <div style={{ textAlign: 'right', fontSize: '13px', color: '#f59e0b', fontWeight: 600 }}>{formatCurrency(supplier.days31_60 || 0)}</div>
                        <div style={{ textAlign: 'right', fontSize: '13px', color: '#f97316', fontWeight: 600 }}>{formatCurrency(supplier.days61_90 || 0)}</div>
                        <div style={{ textAlign: 'right', fontSize: '13px', color: '#ef4444', fontWeight: 600 }}>{formatCurrency(supplier.days90plus || 0)}</div>
                      </>
                    )}
                    <div style={{ textAlign: 'right', fontSize: '14px', fontWeight: 700, color: '#111827' }}>{formatCurrency(supplier.totalOwed || 0)}</div>
                    <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                      {isExpanded ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                    </div>
                  </div>

                  {/* Expanded Invoice List */}
                  {isExpanded && supplier.invoices?.length > 0 && (
                    <div style={{ padding: '8px 0 8px 20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {supplier.invoices.map((inv) => (
                        <div key={inv.id} style={{
                          padding: '10px 14px', backgroundColor: 'white', borderRadius: '10px',
                          border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '12px',
                          flexWrap: 'wrap',
                        }}>
                          <FaFileInvoice size={12} style={{ color: '#9ca3af', flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: '120px' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                              {inv.invoiceNumber || 'No Invoice #'}
                            </div>
                            <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                              {inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                              {inv.dueDate && ` \u00B7 Due: ${new Date(inv.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', minWidth: '80px' }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{formatCurrency(inv.balance || 0)}</div>
                            <div style={{ fontSize: '11px', color: '#9ca3af' }}>of {formatCurrency(inv.totalAmount || 0)}</div>
                          </div>
                          {getStatusBadge(inv.paymentStatus)}
                          {inv.ageDays > 0 && (
                            <span style={{ fontSize: '10px', fontWeight: 600, color: getAgingColor(inv.ageDays) }}>
                              {inv.ageDays}d overdue
                            </span>
                          )}
                          {inv.paymentStatus !== 'paid' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setPaymentInvoice(inv); }}
                              style={{
                                padding: '5px 10px', borderRadius: '6px', border: '1px solid #a7f3d0',
                                backgroundColor: '#ecfdf5', color: '#059669', fontSize: '10px', fontWeight: 700,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap',
                              }}
                            >
                              <FaMoneyBillWave size={9} /> Pay
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', padding: '40px 16px', color: '#9ca3af' }}>
            <FaTruck size={24} style={{ marginBottom: '8px', opacity: 0.4 }} />
            <div style={{ fontSize: '14px' }}>No supplier dues found.</div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>All suppliers are paid up!</div>
          </div>
        </div>
      )}
      {/* Payment Modal */}
      <PaymentRecordModal
        invoice={paymentInvoice}
        onClose={() => setPaymentInvoice(null)}
        onSubmit={handleRecordSupplierPayment}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}

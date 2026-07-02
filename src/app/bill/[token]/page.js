'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

const r2 = (n) => Number(Number(n || 0).toFixed(2));

const formatDate = (val) => {
  if (!val) return '';
  let d;
  if (typeof val === 'string') d = new Date(val);
  else if (val._seconds) d = new Date(val._seconds * 1000);
  else if (typeof val.toDate === 'function') d = val.toDate();
  else d = new Date(val);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }) +
    ', ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
};

export default function PublicBillPage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/public/bill/${token}`)
      .then(res => {
        if (!res.ok) throw new Error(res.status === 404 ? 'Invoice not found' : 'Failed to load invoice');
        return res.json();
      })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [token]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#ef4444', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ margin: 0, fontSize: '14px' }}>Loading invoice...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <div style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🧾</div>
          <h2 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>Invoice Not Found</h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>{error || 'This invoice link may have expired or is invalid.'}</p>
        </div>
      </div>
    );
  }

  const { invoice: inv, restaurant: rest } = data;
  const cs = rest.currencySymbol || '₹';
  const items = inv.items || [];
  const itemsTotal = items.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0);
  const subtotal = r2(inv.subtotal || itemsTotal);
  const totalDiscount = r2((inv.discountAmount || 0) + (inv.manualDiscount || 0) + (inv.loyaltyDiscount || 0));
  const hasDiscount = totalDiscount > 0;
  const taxBreakdown = inv.taxBreakdown || [];
  const hasTax = (inv.taxAmount || 0) > 0;
  const hasServiceCharge = (inv.serviceChargeAmount || 0) > 0;
  const hasTip = (inv.tipAmount || 0) > 0;
  const hasRoundOff = inv.roundOffAmount && inv.roundOffAmount !== 0;
  const grandTotal = r2(inv.finalAmount);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Header bar */}
      <div style={{ backgroundColor: '#dc2626', padding: '16px 0', textAlign: 'center' }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: 'white', letterSpacing: '0.5px' }}>
          DineOpen
        </div>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '16px' }}>
        {/* Invoice card */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>

          {/* Restaurant header */}
          <div style={{ padding: '24px 20px 16px', textAlign: 'center', borderBottom: '1px dashed #e2e8f0' }}>
            {rest.logo && (
              <img src={rest.logo} alt="" style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover', margin: '0 auto 10px', display: 'block' }} />
            )}
            <h1 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>
              {rest.name}
            </h1>
            {rest.legalName && rest.legalName !== rest.name && (
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>{rest.legalName}</div>
            )}
            {rest.address && (
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{rest.address}</div>
            )}
            {rest.gstin && (
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>GSTIN: {rest.gstin}</div>
            )}
            {rest.fssai && (
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>FSSAI: {rest.fssai}</div>
            )}
          </div>

          {/* Order info */}
          <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#64748b' }}>
            <div>
              <span style={{ fontWeight: 600, color: '#1e293b' }}>Order #{inv.orderNumber}</span>
              {inv.tableNumber && <span style={{ marginLeft: '8px' }}>Table {inv.tableNumber}</span>}
            </div>
            <div style={{ textAlign: 'right' }}>
              {inv.orderType && inv.orderType !== 'dine-in' && (
                <span style={{ display: 'inline-block', padding: '2px 8px', backgroundColor: '#fef3c7', color: '#92400e', fontSize: '10px', fontWeight: 600, borderRadius: '6px', marginBottom: '2px', textTransform: 'capitalize' }}>
                  {inv.orderType.replace(/_/g, ' ')}
                </span>
              )}
            </div>
          </div>

          {/* Date */}
          <div style={{ padding: '8px 20px', fontSize: '12px', color: '#94a3b8', borderBottom: '1px solid #f1f5f9' }}>
            {formatDate(inv.completedAt || inv.createdAt)}
            {inv.customerName && <span style={{ float: 'right' }}>{inv.customerName}</span>}
          </div>

          {/* Items */}
          <div style={{ padding: '12px 20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <th style={{ textAlign: 'left', padding: '8px 0', fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Item</th>
                  <th style={{ textAlign: 'center', padding: '8px 0', fontSize: '11px', fontWeight: 600, color: '#94a3b8', width: '40px' }}>Qty</th>
                  <th style={{ textAlign: 'right', padding: '8px 0', fontSize: '11px', fontWeight: 600, color: '#94a3b8', width: '70px' }}>Price</th>
                  <th style={{ textAlign: 'right', padding: '8px 0', fontSize: '11px', fontWeight: 600, color: '#94a3b8', width: '80px' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} style={{ borderBottom: i < items.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                    <td style={{ padding: '10px 0', fontSize: '13px', color: '#1e293b', fontWeight: 500 }}>
                      {item.name}
                      {(item.selectedVariant?.name || item.variant) && <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 400 }}>{item.selectedVariant?.name || item.variant}</div>}
                    </td>
                    <td style={{ textAlign: 'center', fontSize: '13px', color: '#64748b' }}>{item.quantity || 1}</td>
                    <td style={{ textAlign: 'right', fontSize: '13px', color: '#64748b' }}>{cs}{r2(item.price)}</td>
                    <td style={{ textAlign: 'right', fontSize: '13px', color: '#1e293b', fontWeight: 600 }}>{cs}{r2((item.price || 0) * (item.quantity || 1))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div style={{ padding: '12px 20px 16px', borderTop: '1px dashed #e2e8f0' }}>
            {/* Subtotal */}
            <SummaryRow label="Subtotal" value={`${cs}${r2(subtotal)}`} />

            {/* Discounts */}
            {hasDiscount && (
              <>
                {(inv.discountAmount || 0) > 0 && (
                  <SummaryRow label={inv.selectedOfferName ? `Discount (${inv.selectedOfferName})` : 'Offer Discount'} value={`-${cs}${r2(inv.discountAmount)}`} color="#16a34a" />
                )}
                {(inv.manualDiscount || 0) > 0 && (
                  <SummaryRow label="Manual Discount" value={`-${cs}${r2(inv.manualDiscount)}`} color="#16a34a" />
                )}
                {(inv.loyaltyDiscount || 0) > 0 && (
                  <SummaryRow label="Loyalty Discount" value={`-${cs}${r2(inv.loyaltyDiscount)}`} color="#16a34a" />
                )}
              </>
            )}

            {/* Tax breakdown */}
            {hasTax && taxBreakdown.length > 0 ? (
              taxBreakdown.map((t, i) => (
                <SummaryRow key={i} label={`${t.name} (${t.rate}%)`} value={`${cs}${r2(t.amount)}`} />
              ))
            ) : hasTax ? (
              <SummaryRow label="Tax" value={`${cs}${r2(inv.taxAmount)}`} />
            ) : null}

            {hasServiceCharge && (
              <SummaryRow label={`Service Charge${inv.serviceChargeRate ? ` (${inv.serviceChargeRate}%)` : ''}`} value={`${cs}${r2(inv.serviceChargeAmount)}`} />
            )}
            {hasTip && <SummaryRow label="Tip" value={`${cs}${r2(inv.tipAmount)}`} />}
            {hasRoundOff && <SummaryRow label="Round Off" value={`${inv.roundOffAmount > 0 ? '' : '-'}${cs}${r2(Math.abs(inv.roundOffAmount))}`} />}

            {/* Grand Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0 4px', marginTop: '8px', borderTop: '2px solid #1e293b' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>Total</span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>{cs}{r2(grandTotal)}</span>
            </div>

            {/* Payment info */}
            <div style={{ marginTop: '12px', padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: '10px', fontSize: '13px', color: '#64748b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Payment</span>
                <span style={{ fontWeight: 600, color: '#1e293b', textTransform: 'capitalize' }}>{(inv.paymentMethod || 'cash').replace(/_/g, ' ')}</span>
              </div>
              {inv.splitPayments && inv.splitPayments.length > 1 && (
                <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #e2e8f0' }}>
                  {inv.splitPayments.map((sp, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '2px' }}>
                      <span style={{ textTransform: 'capitalize' }}>{(sp.method || sp.paymentMethod || '').replace(/_/g, ' ')}</span>
                      <span>{cs}{r2(sp.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
              {inv.cashReceived && inv.cashReceived > 0 && (
                <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #e2e8f0', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Cash Received</span><span>{cs}{r2(inv.cashReceived)}</span>
                  </div>
                  {inv.changeReturned > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                      <span>Change</span><span>{cs}{r2(inv.changeReturned)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: '16px 20px', borderTop: '1px dashed #e2e8f0', textAlign: 'center' }}>
            <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#64748b' }}>Thank you for your order! 🙏</p>
            {rest.phone && (
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Contact: {rest.phone}</p>
            )}
          </div>
        </div>

        {/* Powered by */}
        <div style={{ textAlign: 'center', padding: '16px 0 24px', fontSize: '11px', color: '#94a3b8' }}>
          Powered by <a href="https://www.dineopen.com" style={{ color: '#ef4444', fontWeight: 600, textDecoration: 'none' }}>DineOpen</a>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px' }}>
      <span style={{ color: '#64748b' }}>{label}</span>
      <span style={{ fontWeight: 500, color: color || '#1e293b' }}>{value}</span>
    </div>
  );
}

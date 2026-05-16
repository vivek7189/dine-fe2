'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaCalendarAlt, FaClock, FaUsers, FaMapMarkerAlt, FaPhone, FaEnvelope, FaMoneyBill, FaCheck, FaFileInvoice } from 'react-icons/fa';

const TYPE_LABELS = { catering: 'Catering', advance_order: 'Advance Order', venue: 'Venue Booking' };
const TYPE_COLORS = { catering: '#10b981', advance_order: '#3b82f6', venue: '#8b5cf6' };
const STATUS_COLORS = { confirmed: '#3b82f6', in_progress: '#f59e0b', completed: '#10b981', cancelled: '#ef4444' };

export default function BookingDetail({ booking, isOpen, onClose, onAddPayment, onComplete, onShareInvoice, formatCurrency, isMobile }) {
  if (!isOpen || !booking || typeof document === 'undefined') return null;

  const fc = formatCurrency || function(v) { return '₹' + (v || 0).toLocaleString(); };

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ background: '#fff', borderRadius: isMobile ? '16px 16px 0 0' : '12px', width: '100%', maxWidth: '600px', maxHeight: isMobile ? '90vh' : '85vh', overflow: 'auto' }}>
        {/* Header */}
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#1f2937' }}>{booking.bookingNumber}</h3>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600', background: TYPE_COLORS[booking.type] + '15', color: TYPE_COLORS[booking.type] }}>{TYPE_LABELS[booking.type]}</span>
              <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600', background: STATUS_COLORS[booking.status] + '15', color: STATUS_COLORS[booking.status] }}>{(booking.status || '').replace('_', ' ')}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><FaTimes size={18} /></button>
        </div>

        <div style={{ padding: '20px' }}>
          {/* Event Info */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: '#374151' }}>Event Details</h4>
            <div style={{ background: '#f9fafb', padding: '14px', borderRadius: '8px', display: 'grid', gap: '8px' }}>
              {booking.eventName && <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>{booking.eventName}</div>}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '13px', color: '#4b5563' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FaCalendarAlt size={11} /> {booking.eventDate}{booking.eventEndDate ? ' - ' + booking.eventEndDate : ''}</span>
                {booking.eventTime && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FaClock size={11} /> {booking.eventTime}{booking.eventEndTime ? ' - ' + booking.eventEndTime : ''}</span>}
                {booking.guestCount > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FaUsers size={11} /> {booking.guestCount} guests</span>}
              </div>
              {booking.venue && <div style={{ fontSize: '13px', color: '#6b7280' }}>Venue: <strong>{booking.venue.venueName}</strong>{booking.venue.section ? ' (' + booking.venue.section + ')' : ''}</div>}
              {booking.specialInstructions && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', fontStyle: 'italic' }}>{booking.specialInstructions}</div>}
            </div>
          </div>

          {/* Customer */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: '#374151' }}>Customer</h4>
            <div style={{ background: '#f9fafb', padding: '14px', borderRadius: '8px' }}>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937', marginBottom: '6px' }}>{booking.customer?.name || 'Unknown'}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '13px', color: '#4b5563' }}>
                {booking.customer?.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FaPhone size={10} /> {booking.customer.phone}</span>}
                {booking.customer?.email && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FaEnvelope size={10} /> {booking.customer.email}</span>}
              </div>
              {booking.customer?.address && (
                <div style={{ marginTop: '6px', fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                  <FaMapMarkerAlt size={10} style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>{[booking.customer.address.street, booking.customer.address.building, booking.customer.address.landmark, booking.customer.address.city, booking.customer.address.state, booking.customer.address.pincode].filter(Boolean).join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          {booking.items && booking.items.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: '#374151' }}>Items ({booking.items.length})</h4>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '600', color: '#6b7280' }}>Item</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '600', color: '#6b7280' }}>Price</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '600', color: '#6b7280' }}>Qty</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '600', color: '#6b7280' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {booking.items.map(function(item, i) {
                      return (
                        <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '8px 10px' }}>
                            <span style={{ fontWeight: '500', color: '#1f2937' }}>{item.name}</span>
                            {item.isCustom && <span style={{ marginLeft: '6px', fontSize: '10px', color: '#f59e0b', fontWeight: '600' }}>Custom</span>}
                            {item.notes && <div style={{ fontSize: '11px', color: '#6b7280', fontStyle: 'italic' }}>{item.notes}</div>}
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', color: '#4b5563' }}>{fc(item.price)}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', color: '#4b5563' }}>{item.quantity}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '600', color: '#1f2937' }}>{fc(item.price * item.quantity)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pricing Summary */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: '#374151' }}>Billing</h4>
            <div style={{ background: '#f9fafb', padding: '14px', borderRadius: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span style={{ color: '#6b7280' }}>Subtotal</span><span>{fc(booking.subtotal)}</span></div>
              {booking.discount && booking.discount.amount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#dc2626' }}><span>Discount ({booking.discount.type === 'percentage' ? booking.discount.value + '%' : 'Flat'})</span><span>-{fc(booking.discount.amount)}</span></div>
              )}
              {booking.taxAmount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span style={{ color: '#6b7280' }}>Tax</span><span>{fc(booking.taxAmount)}</span></div>}
              {booking.serviceCharge > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span style={{ color: '#6b7280' }}>Service Charge</span><span>{fc(booking.serviceCharge)}</span></div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #e5e7eb', fontWeight: '700', fontSize: '15px' }}><span>Total</span><span>{fc(booking.totalAmount)}</span></div>
            </div>
          </div>

          {/* Payment History */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: '#374151' }}>Payments</h4>
            {booking.payments && booking.payments.length > 0 ? (
              <div style={{ display: 'grid', gap: '6px' }}>
                {booking.payments.map(function(p, i) {
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f9fafb', borderRadius: '6px', fontSize: '13px' }}>
                      <div>
                        <span style={{ fontWeight: '600', color: '#059669' }}>{fc(p.amount)}</span>
                        <span style={{ marginLeft: '8px', color: '#6b7280' }}>{p.method}</span>
                        {p.note && <span style={{ marginLeft: '8px', color: '#9ca3af', fontSize: '11px' }}>({p.note})</span>}
                      </div>
                      <span style={{ fontSize: '11px', color: '#9ca3af' }}>{p.date ? new Date(p.date).toLocaleDateString() : ''}</span>
                    </div>
                  );
                })}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', fontSize: '13px', fontWeight: '600' }}>
                  <span>Balance Due</span>
                  <span style={{ color: booking.balanceAmount > 0 ? '#dc2626' : '#059669' }}>{fc(booking.balanceAmount)}</span>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>No payments recorded yet.</p>
            )}
          </div>

          {/* Actions */}
          {booking.status !== 'cancelled' && booking.status !== 'completed' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
              <button onClick={function() { onAddPayment(booking); }} style={{ padding: '9px 14px', borderRadius: '7px', border: '1px solid #d1d5db', background: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: '#374151' }}>
                <FaMoneyBill size={11} /> Add Payment
              </button>
              <button onClick={function() { onComplete(booking); }} style={{ padding: '9px 14px', borderRadius: '7px', border: 'none', background: '#059669', color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FaCheck size={11} /> Complete
              </button>
              <button onClick={function() { onShareInvoice(booking); }} style={{ padding: '9px 14px', borderRadius: '7px', border: '1px solid #d1d5db', background: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: '#374151' }}>
                <FaFileInvoice size={11} /> Invoice
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

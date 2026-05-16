'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaWhatsapp, FaEnvelope, FaDownload, FaPrint } from 'react-icons/fa';

export default function BookingInvoice({ invoice, isOpen, onClose, isMobile }) {
  const [sharing, setSharing] = useState(false);

  if (!isOpen || !invoice || typeof document === 'undefined') return null;

  function generateInvoiceText() {
    const lines = [];
    lines.push('='.repeat(40));
    lines.push(invoice.restaurant?.name || 'Restaurant');
    if (invoice.restaurant?.address) lines.push(invoice.restaurant.address);
    if (invoice.restaurant?.phone) lines.push('Ph: ' + invoice.restaurant.phone);
    if (invoice.restaurant?.gst) lines.push('GST: ' + invoice.restaurant.gst);
    lines.push('='.repeat(40));
    lines.push('BOOKING INVOICE');
    lines.push('Booking #: ' + (invoice.bookingNumber || ''));
    lines.push('Date: ' + (invoice.date || ''));
    lines.push('-'.repeat(40));
    lines.push('Customer: ' + (invoice.customer?.name || ''));
    if (invoice.customer?.phone) lines.push('Phone: ' + invoice.customer.phone);
    if (invoice.customer?.address) {
      const addr = invoice.customer.address;
      const parts = [addr.street, addr.building, addr.landmark, addr.city, addr.state, addr.pincode].filter(Boolean);
      if (parts.length) lines.push('Address: ' + parts.join(', '));
    }
    lines.push('-'.repeat(40));
    lines.push('Event: ' + (invoice.event?.name || ''));
    lines.push('Date: ' + (invoice.event?.date || '') + (invoice.event?.endDate ? ' to ' + invoice.event.endDate : ''));
    if (invoice.event?.time) lines.push('Time: ' + invoice.event.time + (invoice.event?.endTime ? ' - ' + invoice.event.endTime : ''));
    if (invoice.event?.guestCount) lines.push('Guests: ' + invoice.event.guestCount);
    if (invoice.event?.venue) lines.push('Venue: ' + invoice.event.venue);
    lines.push('-'.repeat(40));

    if (invoice.items && invoice.items.length > 0) {
      lines.push('ITEMS:');
      invoice.items.forEach(function(item, i) {
        lines.push((i + 1) + '. ' + item.name + ' x' + item.quantity + '  ₹' + (item.price * item.quantity));
      });
      lines.push('-'.repeat(40));
    }

    lines.push('Subtotal: ₹' + (invoice.subtotal || 0));
    if (invoice.discount && invoice.discount.amount > 0) {
      lines.push('Discount: -₹' + invoice.discount.amount);
    }
    if (invoice.taxAmount > 0) lines.push('Tax: ₹' + invoice.taxAmount);
    if (invoice.serviceCharge > 0) lines.push('Service Charge: ₹' + invoice.serviceCharge);
    lines.push('='.repeat(40));
    lines.push('TOTAL: ₹' + (invoice.totalAmount || 0));
    lines.push('Paid: ₹' + (invoice.paidAmount || 0));
    lines.push('Balance: ₹' + (invoice.balanceAmount || 0));
    lines.push('='.repeat(40));
    if (invoice.specialInstructions) lines.push('Note: ' + invoice.specialInstructions);
    lines.push('Thank you for your business!');

    return lines.join('\n');
  }

  function handleWhatsApp() {
    const text = generateInvoiceText();
    const phone = invoice.customer?.phone || '';
    const encoded = encodeURIComponent(text);
    const url = phone ? `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  }

  function handleEmail() {
    const text = generateInvoiceText();
    const subject = encodeURIComponent('Booking Invoice - ' + (invoice.bookingNumber || ''));
    const body = encodeURIComponent(text);
    const email = invoice.customer?.email || '';
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
  }

  function handleDownload() {
    const text = generateInvoiceText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoice.bookingNumber || 'booking'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handlePrint() {
    const text = generateInvoiceText();
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<pre style="font-family: monospace; font-size: 14px; padding: 20px;">' + text + '</pre>');
    printWindow.document.close();
    printWindow.print();
  }

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '500px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>Booking Invoice</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><FaTimes size={16} /></button>
        </div>

        {/* Invoice Preview */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          <pre style={{ margin: 0, fontSize: '12px', fontFamily: 'monospace', whiteSpace: 'pre-wrap', background: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb', lineHeight: '1.5' }}>
            {generateInvoiceText()}
          </pre>
        </div>

        {/* Share Actions */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
          <button onClick={handleWhatsApp} style={{ padding: '9px 16px', borderRadius: '7px', border: 'none', background: '#25d366', color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FaWhatsapp size={14} /> WhatsApp
          </button>
          <button onClick={handleEmail} style={{ padding: '9px 16px', borderRadius: '7px', border: 'none', background: '#3b82f6', color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FaEnvelope size={12} /> Email
          </button>
          <button onClick={handleDownload} style={{ padding: '9px 16px', borderRadius: '7px', border: '1px solid #d1d5db', background: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#374151' }}>
            <FaDownload size={11} /> Download
          </button>
          <button onClick={handlePrint} style={{ padding: '9px 16px', borderRadius: '7px', border: '1px solid #d1d5db', background: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#374151' }}>
            <FaPrint size={11} /> Print
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

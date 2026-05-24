'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import Breadcrumb from '../../../components/Breadcrumb';

// Lazy-load PDF generation (heavy bundle — only needed on download)
const PDFDownloadHelper = dynamic(() => import('./PDFDownloadHelper'), { ssr: false });

export default function InvoiceGeneratorClient() {
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantAddress, setRestaurantAddress] = useState('');
  const [restaurantPhone, setRestaurantPhone] = useState('');
  const [gstin, setGstin] = useState('');
  const [fssai, setFssai] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [invoiceNo, setInvoiceNo] = useState(`INV-${Date.now().toString().slice(-6)}`);
  const [items, setItems] = useState([{ name: '', qty: 1, price: 0 }]);
  const [gstRate, setGstRate] = useState(5);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [logo, setLogo] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);
  const invoiceRef = useRef(null);
  const logoInputRef = useRef(null);

  const addItem = () => setItems([...items, { name: '', qty: 1, price: 0 }]);
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx, field, value) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: field === 'name' ? value : Number(value) };
    setItems(updated);
  };

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const discountAmount = subtotal * (discount / 100);
  const taxableAmount = subtotal - discountAmount;
  const gstAmount = taxableAmount * (gstRate / 100);
  const totalAmount = taxableAmount + gstAmount;
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const handleGenerate = () => {
    if (!restaurantName.trim()) { alert('Please enter restaurant name'); return; }
    if (items.every(i => !i.name.trim())) { alert('Please add at least one item'); return; }
    setShowInvoice(true);
    setPdfReady(true);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Logo must be under 2MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setLogo(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handlePrint = () => {
    const content = invoiceRef.current;
    if (!content) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<html><head><title>Invoice - ${restaurantName}</title><style>
      body{font-family:'Helvetica Neue',Arial,sans-serif;padding:40px;max-width:800px;margin:0 auto;color:#1f2937}
      table{width:100%;border-collapse:collapse}
      th,td{padding:10px 12px;text-align:left}
      th{background:#f9fafb;font-weight:600;font-size:12px;text-transform:uppercase;color:#6b7280;border-bottom:2px solid #e5e7eb}
      td{border-bottom:1px solid #f3f4f6;font-size:13px}
      tr:nth-child(even){background:#fafafa}
      @media print{body{padding:20px}}
    </style></head><body>${content.innerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownloadPdf = useCallback(async () => {
    setGeneratingPdf(true);
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { InvoicePDFDoc } = await import('./PDFDownloadHelper');
      const invoiceData = {
        restaurantName, restaurantAddress, restaurantPhone, gstin, fssai,
        customerName: customerName || 'Walk-in', invoiceNo, today,
        items: items.filter(i => i.name.trim()),
        subtotal, discountAmount, discount, taxableAmount, gstRate, gstAmount, totalAmount,
        notes, logo,
      };
      const blob = await pdf(<InvoicePDFDoc data={invoiceData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${restaurantName.replace(/\s+/g, '-')}-${invoiceNo}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('PDF generation failed. Please try printing instead.');
    } finally {
      setGeneratingPdf(false);
    }
  }, [restaurantName, restaurantAddress, restaurantPhone, gstin, fssai, customerName, invoiceNo, today, items, subtotal, discountAmount, discount, taxableAmount, gstRate, gstAmount, totalAmount, notes, logo]);

  const fmt = (n) => '₹' + n.toFixed(2);

  const inputStyle = { width: '100%', padding: '11px 14px', border: '1px solid #d1d5db', borderRadius: '10px', fontSize: '14px', outline: 'none', transition: 'border-color 0.15s', backgroundColor: '#fff' };
  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' };

  const validItems = items.filter(i => i.name.trim());

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <CommonHeader />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Free Tools', href: '/tools/food-cost-calculator' }, { label: 'Invoice Generator' }]} />

      <div style={{ paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)', color: 'white', padding: '64px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
          <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 14px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '20px', fontSize: '13px', marginBottom: '20px', backdropFilter: 'blur(4px)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4ade80', display: 'inline-block' }} />
              Free Tool &bull; No Login Required
            </div>
            <h1 style={{ fontSize: '40px', fontWeight: '800', marginBottom: '16px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>Restaurant Invoice Generator</h1>
            <p style={{ fontSize: '18px', opacity: 0.92, maxWidth: '550px', margin: '0 auto', lineHeight: 1.6 }}>
              Create professional, GST-compliant restaurant invoices with your logo. Download PDF or print — no signup needed.
            </p>
          </div>
        </section>

        <section style={{ padding: '48px 20px' }}>
          <div style={{ maxWidth: '920px', margin: '0 auto' }}>
            {!showInvoice ? (
              <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '36px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '28px', color: '#111827' }}>Invoice Details</h3>

                {/* Logo Upload */}
                <div style={{ marginBottom: '28px' }}>
                  <label style={labelStyle}>Restaurant Logo</label>
                  <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={handleLogoUpload} style={{ display: 'none' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {logo ? (
                      <div style={{ position: 'relative' }}>
                        <img src={logo} alt="Logo" style={{ width: '72px', height: '72px', objectFit: 'contain', borderRadius: '12px', border: '2px solid #e5e7eb', padding: '4px', backgroundColor: '#fff' }} />
                        <button onClick={() => setLogo(null)} style={{ position: 'absolute', top: '-6px', right: '-6px', width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>×</button>
                      </div>
                    ) : (
                      <button onClick={() => logoInputRef.current?.click()} style={{ width: '72px', height: '72px', borderRadius: '12px', border: '2px dashed #d1d5db', backgroundColor: '#f9fafb', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#9ca3af', fontSize: '11px' }}>
                        <span style={{ fontSize: '24px', lineHeight: 1 }}>+</span>
                        Logo
                      </button>
                    )}
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>PNG, JPG or SVG. Max 2MB.<br />Shows on invoice & PDF.</div>
                  </div>
                </div>

                {/* Restaurant Info */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  <div>
                    <label style={labelStyle}>Restaurant Name *</label>
                    <input type="text" value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} placeholder="Spice Garden" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Address</label>
                    <input type="text" value={restaurantAddress} onChange={(e) => setRestaurantAddress(e.target.value)} placeholder="123 MG Road, Mumbai" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone</label>
                    <input type="tel" value={restaurantPhone} onChange={(e) => setRestaurantPhone(e.target.value)} placeholder="+91 98765 43210" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>GSTIN</label>
                    <input type="text" value={gstin} onChange={(e) => setGstin(e.target.value)} placeholder="27XXXXX1234X1ZX" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>FSSAI No.</label>
                    <input type="text" value={fssai} onChange={(e) => setFssai(e.target.value)} placeholder="12345678901234" style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  <div>
                    <label style={labelStyle}>Invoice Number</label>
                    <input type="text" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Customer Name</label>
                    <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Walk-in" style={inputStyle} />
                  </div>
                </div>

                {/* Items */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ ...labelStyle, marginBottom: '12px' }}>Items</label>
                  <div style={{ backgroundColor: '#f9fafb', borderRadius: '12px', padding: '16px', border: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 80px 120px 40px', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase' }}>Item Name</span>
                      <span style={{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase' }}>Qty</span>
                      <span style={{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase' }}>Price</span>
                      <span />
                    </div>
                    {items.map((item, idx) => (
                      <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 80px 120px 40px', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                        <input type="text" value={item.name} onChange={(e) => updateItem(idx, 'name', e.target.value)}
                          placeholder="e.g. Butter Chicken" style={{ ...inputStyle, backgroundColor: '#fff' }} />
                        <input type="number" value={item.qty} onChange={(e) => updateItem(idx, 'qty', e.target.value)}
                          min="1" placeholder="1" style={{ ...inputStyle, backgroundColor: '#fff', textAlign: 'center' }} />
                        <input type="number" value={item.price || ''} onChange={(e) => updateItem(idx, 'price', e.target.value)}
                          min="0" placeholder="₹0" style={{ ...inputStyle, backgroundColor: '#fff' }} />
                        {items.length > 1 ? (
                          <button onClick={() => removeItem(idx)} style={{ width: '36px', height: '36px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                        ) : <span />}
                      </div>
                    ))}
                    <button onClick={addItem} style={{ padding: '10px 18px', backgroundColor: '#fff', color: '#059669', border: '1px dashed #059669', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', marginTop: '4px' }}>
                      + Add Item
                    </button>
                  </div>
                </div>

                {/* GST & Discount */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <div>
                    <label style={labelStyle}>GST Rate</label>
                    <select value={gstRate} onChange={(e) => setGstRate(Number(e.target.value))} style={inputStyle}>
                      <option value={0}>No GST (0%)</option>
                      <option value={5}>5% GST</option>
                      <option value={12}>12% GST</option>
                      <option value={18}>18% GST</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Discount (%)</label>
                    <input type="number" value={discount || ''} onChange={(e) => setDiscount(Number(e.target.value))} min="0" max="100" placeholder="0" style={inputStyle} />
                  </div>
                </div>

                {/* Notes */}
                <div style={{ marginBottom: '28px' }}>
                  <label style={labelStyle}>Notes / Terms (Optional)</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Thank you for dining with us! Payment due on receipt." rows={3} style={{ ...inputStyle, resize: 'vertical', minHeight: '70px' }} />
                </div>

                {/* Summary */}
                <div style={{ padding: '24px', backgroundColor: '#f0fdf4', borderRadius: '14px', marginBottom: '28px', border: '1px solid #bbf7d0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                    <span style={{ color: '#374151' }}>Subtotal</span>
                    <span style={{ fontWeight: '600' }}>{fmt(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                      <span style={{ color: '#dc2626' }}>Discount ({discount}%)</span>
                      <span style={{ fontWeight: '600', color: '#dc2626' }}>-{fmt(discountAmount)}</span>
                    </div>
                  )}
                  {gstRate > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                      <span style={{ color: '#374151' }}>GST ({gstRate}%)</span>
                      <span style={{ fontWeight: '600' }}>{fmt(gstAmount)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #86efac', paddingTop: '14px', marginTop: '6px' }}>
                    <span style={{ fontSize: '20px', fontWeight: '800', color: '#111827' }}>Total</span>
                    <span style={{ fontSize: '20px', fontWeight: '800', color: '#059669' }}>{fmt(totalAmount)}</span>
                  </div>
                </div>

                <button onClick={handleGenerate} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 14px rgba(5,150,105,0.3)', transition: 'transform 0.1s', letterSpacing: '-0.01em' }}>
                  Generate Invoice
                </button>
              </div>
            ) : (
              <div>
                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
                  <button onClick={handleDownloadPdf} disabled={generatingPdf} style={{ padding: '12px 28px', background: generatingPdf ? '#6b7280' : 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: generatingPdf ? 'default' : 'pointer', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 8px rgba(5,150,105,0.25)' }}>
                    {generatingPdf ? (
                      <><span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} /> Generating...</>
                    ) : (
                      <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download PDF</>
                    )}
                  </button>
                  <button onClick={handlePrint} style={{ padding: '12px 28px', backgroundColor: '#fff', color: '#374151', border: '2px solid #d1d5db', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                    Print
                  </button>
                  <button onClick={() => setShowInvoice(false)} style={{ padding: '12px 28px', backgroundColor: '#fff', color: '#374151', border: '2px solid #d1d5db', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '15px' }}>
                    Edit Invoice
                  </button>
                </div>

                {/* Invoice Preview */}
                <div ref={invoiceRef} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '48px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '12px', paddingBottom: '20px', borderBottom: '3px solid #059669' }}>
                    {logo && (
                      <img src={logo} alt="Logo" style={{ width: '70px', height: '70px', objectFit: 'contain', borderRadius: '8px', flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, textAlign: logo ? 'left' : 'center' }}>
                      <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#111827', marginBottom: '4px', letterSpacing: '-0.01em' }}>{restaurantName}</h2>
                      {restaurantAddress && <p style={{ fontSize: '13px', color: '#6b7280', margin: '2px 0' }}>{restaurantAddress}</p>}
                      {restaurantPhone && <p style={{ fontSize: '13px', color: '#6b7280', margin: '2px 0' }}>{restaurantPhone}</p>}
                      <div style={{ display: 'flex', gap: '20px', marginTop: '8px', fontSize: '12px', color: '#6b7280', justifyContent: logo ? 'flex-start' : 'center', flexWrap: 'wrap' }}>
                        {gstin && <span style={{ backgroundColor: '#f3f4f6', padding: '2px 8px', borderRadius: '4px' }}>GSTIN: {gstin}</span>}
                        {fssai && <span style={{ backgroundColor: '#f3f4f6', padding: '2px 8px', borderRadius: '4px' }}>FSSAI: {fssai}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Invoice Meta */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', margin: '24px 0 20px', padding: '16px 20px', backgroundColor: '#f9fafb', borderRadius: '10px' }}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '4px' }}>Invoice</div>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>{invoiceNo}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{today}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '4px' }}>Bill To</div>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>{customerName || 'Walk-in'}</div>
                    </div>
                  </div>

                  {/* Items Table */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase' }}>#</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase' }}>Item</th>
                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb', fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase' }}>Qty</th>
                        <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e5e7eb', fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase' }}>Price</th>
                        <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e5e7eb', fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {validItems.map((item, idx) => (
                        <tr key={idx} style={{ backgroundColor: idx % 2 === 1 ? '#fafafa' : 'transparent' }}>
                          <td style={{ padding: '12px', fontSize: '13px', color: '#9ca3af', borderBottom: '1px solid #f3f4f6' }}>{idx + 1}</td>
                          <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500', color: '#111827', borderBottom: '1px solid #f3f4f6' }}>{item.name}</td>
                          <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: '#374151', borderBottom: '1px solid #f3f4f6' }}>{item.qty}</td>
                          <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px', color: '#374151', borderBottom: '1px solid #f3f4f6' }}>{fmt(item.price)}</td>
                          <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#111827', borderBottom: '1px solid #f3f4f6' }}>{fmt(item.qty * item.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Totals */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ width: '280px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px', color: '#374151' }}>
                        <span>Subtotal</span><span style={{ fontWeight: '600' }}>{fmt(subtotal)}</span>
                      </div>
                      {discount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px', color: '#dc2626' }}>
                          <span>Discount ({discount}%)</span><span style={{ fontWeight: '600' }}>-{fmt(discountAmount)}</span>
                        </div>
                      )}
                      {gstRate > 0 && (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', color: '#6b7280' }}>
                            <span>CGST ({gstRate / 2}%)</span><span>{fmt(gstAmount / 2)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', color: '#6b7280' }}>
                            <span>SGST ({gstRate / 2}%)</span><span>{fmt(gstAmount / 2)}</span>
                          </div>
                        </>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', fontSize: '18px', fontWeight: '800', backgroundColor: '#f0fdf4', borderRadius: '10px', marginTop: '12px', border: '1px solid #bbf7d0' }}>
                        <span style={{ color: '#111827' }}>Grand Total</span>
                        <span style={{ color: '#059669' }}>{fmt(totalAmount)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {notes && (
                    <div style={{ marginTop: '28px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '6px' }}>Notes</div>
                      <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>{notes}</p>
                    </div>
                  )}

                  {/* Footer */}
                  <div style={{ textAlign: 'center', marginTop: '36px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                      Thank you for dining with us!
                    </p>
                    <p style={{ fontSize: '11px', color: '#d1d5db', marginTop: '4px' }}>
                      Generated by <a href="https://dineopen.com" style={{ color: '#059669', textDecoration: 'none' }}>DineOpen.com</a>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section style={{ padding: '64px 20px', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '30px', fontWeight: '800', marginBottom: '16px', letterSpacing: '-0.02em' }}>Automate Your Billing with DineOpen</h2>
            <p style={{ fontSize: '16px', opacity: 0.92, marginBottom: '28px', lineHeight: 1.6 }}>Auto GST calculation, WhatsApp receipts, thermal printing, payment tracking — all built in.</p>
            <Link href="/pricing" style={{ display: 'inline-block', padding: '16px 36px', backgroundColor: 'white', color: '#059669', borderRadius: '10px', fontWeight: '700', textDecoration: 'none', fontSize: '16px', boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}>
              Start Free Trial
            </Link>
          </div>
        </section>

        <InternalLinks currentPath="/tools/restaurant-invoice-generator" variant="tool" />
      </div>
      <Footer />

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  );
}

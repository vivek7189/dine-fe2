'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import Breadcrumb from '../../../components/Breadcrumb';

export default function InvoiceGeneratorClient() {
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantAddress, setRestaurantAddress] = useState('');
  const [gstin, setGstin] = useState('');
  const [fssai, setFssai] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [invoiceNo, setInvoiceNo] = useState(`INV-${Date.now().toString().slice(-6)}`);
  const [items, setItems] = useState([{ name: '', qty: 1, price: 0 }]);
  const [gstRate, setGstRate] = useState(5);
  const [discount, setDiscount] = useState(0);
  const [showInvoice, setShowInvoice] = useState(false);
  const invoiceRef = useRef(null);

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
  };

  const handlePrint = () => {
    const content = invoiceRef.current;
    if (!content) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<html><head><title>Invoice - ${restaurantName}</title><style>body{font-family:Arial,sans-serif;padding:20px;max-width:800px;margin:0 auto}table{width:100%;border-collapse:collapse}th,td{padding:8px 12px;text-align:left;border-bottom:1px solid #e5e7eb}th{background:#f9fafb;font-weight:600}@media print{body{padding:0}}</style></head><body>${content.innerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const formatCurrency = (n) => '₹' + n.toFixed(2);

  const inputStyle = { width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' };
  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
      <CommonHeader />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Free Tools', href: '/tools/food-cost-calculator' }, { label: 'Invoice Generator' }]} />

      <div style={{ paddingTop: '80px' }}>
        <section style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '12px', marginBottom: '16px' }}>
              Free Tool &bull; No Login Required
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Restaurant Invoice Generator</h1>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>
              Create GST-compliant restaurant invoices instantly. Print or download — no signup needed.
            </p>
          </div>
        </section>

        <section style={{ padding: '40px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {!showInvoice ? (
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Invoice Details</h3>

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
                    <label style={labelStyle}>Customer Name (Optional)</label>
                    <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Walk-in" style={inputStyle} />
                  </div>
                </div>

                {/* Items */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ ...labelStyle, marginBottom: '12px' }}>Items</label>
                  {items.map((item, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 80px 120px 40px', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                      <input type="text" value={item.name} onChange={(e) => updateItem(idx, 'name', e.target.value)}
                        placeholder="Item name" style={inputStyle} />
                      <input type="number" value={item.qty} onChange={(e) => updateItem(idx, 'qty', e.target.value)}
                        min="1" placeholder="Qty" style={inputStyle} />
                      <input type="number" value={item.price || ''} onChange={(e) => updateItem(idx, 'price', e.target.value)}
                        min="0" placeholder="Price" style={inputStyle} />
                      {items.length > 1 && (
                        <button onClick={() => removeItem(idx)} style={{ padding: '8px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}>×</button>
                      )}
                    </div>
                  ))}
                  <button onClick={addItem} style={{ padding: '8px 16px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px dashed #d1d5db', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', marginTop: '8px' }}>
                    + Add Item
                  </button>
                </div>

                {/* GST & Discount */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <div>
                    <label style={labelStyle}>GST Rate (%)</label>
                    <select value={gstRate} onChange={(e) => setGstRate(Number(e.target.value))} style={inputStyle}>
                      <option value={0}>No GST</option>
                      <option value={5}>5% GST</option>
                      <option value={12}>12% GST</option>
                      <option value={18}>18% GST</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Discount (%)</label>
                    <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} min="0" max="100" style={inputStyle} />
                  </div>
                </div>

                {/* Summary */}
                <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#6b7280' }}>Subtotal</span>
                    <span style={{ fontWeight: '600' }}>{formatCurrency(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#dc2626' }}>Discount ({discount}%)</span>
                      <span style={{ fontWeight: '600', color: '#dc2626' }}>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  {gstRate > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#6b7280' }}>GST ({gstRate}%)</span>
                      <span style={{ fontWeight: '600' }}>{formatCurrency(gstAmount)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #e5e7eb', paddingTop: '12px', marginTop: '8px' }}>
                    <span style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>Total</span>
                    <span style={{ fontSize: '18px', fontWeight: '700', color: '#059669' }}>{formatCurrency(totalAmount)}</span>
                  </div>
                </div>

                <button onClick={handleGenerate} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '18px', fontWeight: '700', cursor: 'pointer' }}>
                  Generate Invoice
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                  <button onClick={handlePrint} style={{ padding: '12px 24px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                    Print Invoice
                  </button>
                  <button onClick={() => setShowInvoice(false)} style={{ padding: '12px 24px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                    Edit Invoice
                  </button>
                </div>

                {/* Invoice Preview */}
                <div ref={invoiceRef} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
                  <div style={{ textAlign: 'center', marginBottom: '24px', borderBottom: '2px solid #111827', paddingBottom: '20px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '4px' }}>{restaurantName}</h2>
                    {restaurantAddress && <p style={{ fontSize: '13px', color: '#6b7280' }}>{restaurantAddress}</p>}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
                      {gstin && <span>GSTIN: {gstin}</span>}
                      {fssai && <span>FSSAI: {fssai}</span>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '13px', color: '#374151' }}>
                    <div>
                      <strong>Invoice:</strong> {invoiceNo}<br />
                      <strong>Date:</strong> {today}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong>Customer:</strong> {customerName || 'Walk-in'}
                    </div>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f9fafb' }}>
                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', fontSize: '13px' }}>#</th>
                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', fontSize: '13px' }}>Item</th>
                        <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #e5e7eb', fontSize: '13px' }}>Qty</th>
                        <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #e5e7eb', fontSize: '13px' }}>Price</th>
                        <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #e5e7eb', fontSize: '13px' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.filter(i => i.name.trim()).map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: '10px', borderBottom: '1px solid #f3f4f6', fontSize: '13px' }}>{idx + 1}</td>
                          <td style={{ padding: '10px', borderBottom: '1px solid #f3f4f6', fontSize: '13px' }}>{item.name}</td>
                          <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #f3f4f6', fontSize: '13px' }}>{item.qty}</td>
                          <td style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #f3f4f6', fontSize: '13px' }}>{formatCurrency(item.price)}</td>
                          <td style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #f3f4f6', fontSize: '13px' }}>{formatCurrency(item.qty * item.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ width: '250px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}>
                        <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
                      </div>
                      {discount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', color: '#dc2626' }}>
                          <span>Discount ({discount}%)</span><span>-{formatCurrency(discountAmount)}</span>
                        </div>
                      )}
                      {gstRate > 0 && (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}>
                            <span>CGST ({gstRate / 2}%)</span><span>{formatCurrency(gstAmount / 2)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}>
                            <span>SGST ({gstRate / 2}%)</span><span>{formatCurrency(gstAmount / 2)}</span>
                          </div>
                        </>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '16px', fontWeight: '700', borderTop: '2px solid #111827', marginTop: '8px' }}>
                        <span>Grand Total</span><span>{formatCurrency(totalAmount)}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #e5e7eb', fontSize: '12px', color: '#9ca3af' }}>
                    Thank you for dining with us! &bull; Generated by DineOpen.com
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#059669', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Automate Your Billing with DineOpen</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px' }}>Auto GST calculation, WhatsApp receipts, thermal printing, payment tracking — all built in.</p>
            <Link href="/pricing" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#059669', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
              Start Free Trial
            </Link>
          </div>
        </section>

        <InternalLinks currentPath="/tools/restaurant-invoice-generator" variant="tool" />
      </div>
      <Footer />
    </div>
  );
}

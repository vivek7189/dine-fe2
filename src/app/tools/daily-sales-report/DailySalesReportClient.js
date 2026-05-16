'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import { FaPlus, FaTrash, FaPrint, FaChevronDown, FaChevronUp, FaCalendarAlt, FaChartBar, FaDownload } from 'react-icons/fa';

const currencyOptions = [
  { symbol: '\u20b9', label: '\u20b9 INR' },
  { symbol: '$', label: '$ USD' },
  { symbol: '\u00a3', label: '\u00a3 GBP' },
  { symbol: 'AED', label: 'AED' },
  { symbol: 'QAR', label: 'QAR' },
];

const paymentPresets = {
  '\u20b9': [
    { method: 'Cash', amount: 0 },
    { method: 'Card', amount: 0 },
    { method: 'UPI', amount: 0 },
    { method: 'PhonePe/Paytm', amount: 0 },
    { method: 'Online Aggregator', amount: 0 },
  ],
  '$': [
    { method: 'Cash', amount: 0 },
    { method: 'Credit Card', amount: 0 },
    { method: 'Debit Card', amount: 0 },
    { method: 'Apple Pay', amount: 0 },
    { method: 'Online', amount: 0 },
  ],
  '\u00a3': [
    { method: 'Cash', amount: 0 },
    { method: 'Credit Card', amount: 0 },
    { method: 'Debit Card', amount: 0 },
    { method: 'Apple Pay', amount: 0 },
    { method: 'Online', amount: 0 },
  ],
  'AED': [
    { method: 'Cash', amount: 0 },
    { method: 'Card', amount: 0 },
    { method: 'Samsung Pay', amount: 0 },
    { method: 'Apple Pay', amount: 0 },
    { method: 'Online', amount: 0 },
  ],
  'QAR': [
    { method: 'Cash', amount: 0 },
    { method: 'Card', amount: 0 },
    { method: 'Apple Pay', amount: 0 },
    { method: 'Online', amount: 0 },
  ],
};

const expenseCategories = ['Supplies', 'Staff', 'Maintenance', 'Marketing', 'Other'];

const faqData = [
  {
    q: 'What should a daily sales report include?',
    a: 'A comprehensive daily sales report should include sales broken down by channel (dine-in, takeaway, delivery), payment method breakdown (cash, card, UPI, online), cash reconciliation (opening cash, received, expenses, closing), a detailed expense log with categories, and a profit & loss summary showing net revenue and margin percentage.',
  },
  {
    q: 'How do I reconcile cash at the end of the day?',
    a: 'Cash reconciliation follows a simple formula: Opening Cash + Cash Received from Sales - Cash Expenses = Expected Closing Cash. Then compare the expected amount with the actual cash counted in the register. Any difference is your cash variance, which should be investigated if it exceeds acceptable limits.',
  },
  {
    q: 'What\'s a normal cash variance for restaurants?',
    a: 'A normal cash variance for restaurants is typically within plus or minus 0.1% of daily sales, or approximately plus or minus \u20b9200-500 for most Indian restaurants. Consistent variances above this threshold indicate potential issues with cash handling, incorrect change-giving, or pilferage that need to be addressed through better training or controls.',
  },
  {
    q: 'Should I track sales by payment method?',
    a: 'Yes, tracking sales by payment method is essential for accurate reconciliation, fee calculation, and financial planning. Different payment methods have different processing fees (UPI is free, cards charge 1-2%, aggregators charge 15-25%), and knowing your payment mix helps you understand true profitability and plan cash flow.',
  },
  {
    q: 'How long should I keep daily sales reports?',
    a: 'Record retention requirements vary by country: In India, you must keep financial records for 6 years under GST regulations. In the US, the IRS recommends 3-7 years depending on the type of record. In the UK, HMRC requires 5 years of business records. Digital records are acceptable in most jurisdictions.',
  },
];

const relatedTools = [
  { name: 'Profit Margin Calculator', href: '/tools/profit-margin-calculator', desc: 'Calculate food cost percentages and profit margins for menu items.' },
  { name: 'Food Cost Calculator', href: '/tools/food-cost-calculator', desc: 'Track and optimize your food costs for better profitability.' },
  { name: 'Break-Even Calculator', href: '/tools/break-even-calculator', desc: 'Find out how many orders you need to cover your costs.' },
  { name: 'GST Calculator', href: '/tools/gst-calculator', desc: 'Calculate GST on restaurant bills with inclusive and exclusive options.' },
];

function getTodayDate() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export default function DailySalesReportClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [currency, setCurrency] = useState('\u20b9');
  const [reportDate, setReportDate] = useState(getTodayDate());
  const [restaurantName, setRestaurantName] = useState('');
  const [openingCash, setOpeningCash] = useState(0);
  const [closingCash, setClosingCash] = useState(0);
  const [salesChannels, setSalesChannels] = useState([
    { name: 'Dine-in', amount: 0, orders: 0 },
    { name: 'Takeaway', amount: 0, orders: 0 },
    { name: 'Delivery (Swiggy/Zomato)', amount: 0, orders: 0 },
  ]);
  const [payments, setPayments] = useState(paymentPresets['\u20b9']);
  const [expenses, setExpenses] = useState([{ description: '', amount: 0, category: 'Supplies' }]);
  const [showReport, setShowReport] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('dineopen-daily-reports');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    setPayments(paymentPresets[currency] || paymentPresets['\u20b9']);
  }, [currency]);

  // Calculations
  const totalSales = salesChannels.reduce((sum, ch) => sum + (parseFloat(ch.amount) || 0), 0);
  const totalOrders = salesChannels.reduce((sum, ch) => sum + (parseInt(ch.orders) || 0), 0);
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
  const totalPayments = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const cashReceived = parseFloat(payments.find(p => p.method === 'Cash')?.amount) || 0;
  const expectedClosingCash = (parseFloat(openingCash) || 0) + cashReceived - totalExpenses;
  const cashVariance = (parseFloat(closingCash) || 0) - expectedClosingCash;
  const netRevenue = totalSales - totalExpenses;
  const profitMargin = totalSales > 0 ? (netRevenue / totalSales) * 100 : 0;

  const handleGenerateReport = () => {
    setShowReport(true);
    const reportData = {
      date: reportDate,
      totalSales,
      totalOrders,
      netRevenue,
      profitMargin,
    };
    const updatedHistory = [...history.filter(h => h.date !== reportDate), reportData]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-7);
    setHistory(updatedHistory);
    try {
      localStorage.setItem('dineopen-daily-reports', JSON.stringify(updatedHistory));
    } catch (e) {}
  };

  const handlePrint = () => {
    window.print();
  };

  const updateSalesChannel = (index, field, value) => {
    const updated = [...salesChannels];
    updated[index] = { ...updated[index], [field]: value };
    setSalesChannels(updated);
  };

  const addSalesChannel = () => {
    setSalesChannels([...salesChannels, { name: '', amount: 0, orders: 0 }]);
  };

  const removeSalesChannel = (index) => {
    if (salesChannels.length > 1) {
      setSalesChannels(salesChannels.filter((_, i) => i !== index));
    }
  };

  const updatePayment = (index, value) => {
    const updated = [...payments];
    updated[index] = { ...updated[index], amount: value };
    setPayments(updated);
  };

  const addExpense = () => {
    setExpenses([...expenses, { description: '', amount: 0, category: 'Supplies' }]);
  };

  const removeExpense = (index) => {
    if (expenses.length > 1) {
      setExpenses(expenses.filter((_, i) => i !== index));
    }
  };

  const updateExpense = (index, field, value) => {
    const updated = [...expenses];
    updated[index] = { ...updated[index], [field]: value };
    setExpenses(updated);
  };

  // Mini bar chart
  const renderTrendChart = () => {
    if (history.length === 0) return null;
    const maxSales = Math.max(...history.map(h => h.totalSales), 1);
    const barWidth = 100 / Math.max(history.length, 1);

    return (
      <div style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaChartBar style={{ color: '#16a34a' }} /> 7-Day Sales Trend
        </h3>
        <svg width="100%" height="160" viewBox="0 0 400 160" preserveAspectRatio="xMidYMid meet">
          {history.map((h, i) => {
            const barHeight = (h.totalSales / maxSales) * 120;
            const x = (i * (400 / history.length)) + 10;
            const barW = (400 / history.length) - 20;
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={130 - barHeight}
                  width={barW > 0 ? barW : 30}
                  height={barHeight}
                  fill="#16a34a"
                  rx="4"
                />
                <text
                  x={x + (barW > 0 ? barW / 2 : 15)}
                  y="150"
                  textAnchor="middle"
                  fontSize="10"
                  fill="#6b7280"
                >
                  {h.date.slice(5)}
                </text>
                <text
                  x={x + (barW > 0 ? barW / 2 : 15)}
                  y={125 - barHeight}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#111827"
                >
                  {currency}{Math.round(h.totalSales).toLocaleString()}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: isMobile ? '24px' : '32px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    marginBottom: '24px',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '16px',
    boxSizing: 'border-box',
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  };

  const thStyle = {
    textAlign: 'left',
    padding: '10px 12px',
    backgroundColor: '#f3f4f6',
    fontWeight: '600',
    color: '#374151',
    borderBottom: '2px solid #e5e7eb',
  };

  const tdStyle = {
    padding: '10px 12px',
    borderBottom: '1px solid #e5e7eb',
    color: '#374151',
  };

  return (
    <>
      <CommonHeader />

      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
        {/* Hero Section */}
        <section style={{ background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)', color: 'white', padding: isMobile ? '50px 20px 40px' : '70px 20px 50px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '4px 14px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '12px', marginBottom: '16px', letterSpacing: '0.5px' }}>
              Free Tool &bull; No Login Required
            </div>
            <h1 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '800', marginBottom: '16px', lineHeight: '1.2' }}>
              Restaurant Daily Sales Report Generator
            </h1>
            <p style={{ fontSize: isMobile ? '16px' : '18px', opacity: 0.95, maxWidth: '620px', margin: '0 auto', lineHeight: '1.6' }}>
              Track daily sales by channel, reconcile cash, log expenses, and generate professional end-of-day reports. Download as PDF.
            </p>
          </div>
        </section>

        {/* Tool Section */}
        <section style={{ padding: isMobile ? '30px 16px' : '50px 20px' }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>

            {/* Settings Row */}
            <div style={{ ...cardStyle }}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    style={inputStyle}
                  >
                    {currencyOptions.map(c => (
                      <option key={c.symbol} value={c.symbol}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}><FaCalendarAlt style={{ marginRight: '6px' }} />Report Date</label>
                  <input
                    type="date"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Restaurant Name</label>
                  <input
                    type="text"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    placeholder="Your Restaurant Name"
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Opening Cash ({currency})</label>
                  <input
                    type="number"
                    value={openingCash}
                    onChange={(e) => setOpeningCash(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Closing Cash ({currency})</label>
                  <input
                    type="number"
                    value={closingCash}
                    onChange={(e) => setClosingCash(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Sales Channels */}
            <div style={{ ...cardStyle }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>Sales by Channel</h2>
              {salesChannels.map((channel, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr auto', gap: '12px', marginBottom: '12px', alignItems: 'end' }}>
                  <div>
                    <label style={{ ...labelStyle, fontSize: '12px' }}>Channel</label>
                    <input
                      type="text"
                      value={channel.name}
                      onChange={(e) => updateSalesChannel(idx, 'name', e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ ...labelStyle, fontSize: '12px' }}>Amount ({currency})</label>
                    <input
                      type="number"
                      value={channel.amount}
                      onChange={(e) => updateSalesChannel(idx, 'amount', e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ ...labelStyle, fontSize: '12px' }}>Orders</label>
                    <input
                      type="number"
                      value={channel.orders}
                      onChange={(e) => updateSalesChannel(idx, 'orders', e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <button onClick={() => removeSalesChannel(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '12px', fontSize: '16px' }}>
                    <FaTrash />
                  </button>
                </div>
              ))}
              <button onClick={addSalesChannel} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px dashed #16a34a', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                <FaPlus /> Add Channel
              </button>
            </div>

            {/* Payment Methods */}
            <div style={{ ...cardStyle }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>Payment Breakdown</h2>
              {payments.map((payment, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>{payment.method}</span>
                  <input
                    type="number"
                    value={payment.amount}
                    onChange={(e) => updatePayment(idx, e.target.value)}
                    placeholder="0"
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>

            {/* Expenses */}
            <div style={{ ...cardStyle }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>Expenses</h2>
              {expenses.map((expense, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr auto', gap: '12px', marginBottom: '12px', alignItems: 'end' }}>
                  <div>
                    <label style={{ ...labelStyle, fontSize: '12px' }}>Description</label>
                    <input
                      type="text"
                      value={expense.description}
                      onChange={(e) => updateExpense(idx, 'description', e.target.value)}
                      placeholder="e.g. Vegetables from supplier"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ ...labelStyle, fontSize: '12px' }}>Category</label>
                    <select
                      value={expense.category}
                      onChange={(e) => updateExpense(idx, 'category', e.target.value)}
                      style={inputStyle}
                    >
                      {expenseCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ ...labelStyle, fontSize: '12px' }}>Amount ({currency})</label>
                    <input
                      type="number"
                      value={expense.amount}
                      onChange={(e) => updateExpense(idx, 'amount', e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <button onClick={() => removeExpense(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '12px', fontSize: '16px' }}>
                    <FaTrash />
                  </button>
                </div>
              ))}
              <button onClick={addExpense} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px dashed #16a34a', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                <FaPlus /> Add Expense
              </button>
            </div>

            {/* Generate Button */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <button
                onClick={handleGenerateReport}
                style={{ padding: '16px 48px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: '700', cursor: 'pointer' }}
              >
                Generate Report
              </button>
            </div>

            {/* 7-Day Trend */}
            {history.length > 0 && (
              <div style={{ ...cardStyle }}>
                {renderTrendChart()}
              </div>
            )}

            {/* Generated Report */}
            {showReport && (
              <div id="daily-report" style={{ ...cardStyle, border: '2px solid #16a34a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', marginBottom: '4px' }}>
                      {restaurantName || 'Daily Sales Report'}
                    </h2>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>
                      Date: {new Date(reportDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                    <FaDownload /> Download PDF
                  </button>
                </div>

                {/* Sales Summary Table */}
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>Sales Summary</h3>
                <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={thStyle}>Channel</th>
                        <th style={thStyle}>Orders</th>
                        <th style={thStyle}>Amount</th>
                        <th style={thStyle}>% of Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesChannels.map((ch, idx) => (
                        <tr key={idx}>
                          <td style={tdStyle}>{ch.name}</td>
                          <td style={tdStyle}>{parseInt(ch.orders) || 0}</td>
                          <td style={tdStyle}>{currency}{(parseFloat(ch.amount) || 0).toLocaleString()}</td>
                          <td style={tdStyle}>{totalSales > 0 ? ((parseFloat(ch.amount) || 0) / totalSales * 100).toFixed(1) : 0}%</td>
                        </tr>
                      ))}
                      <tr style={{ fontWeight: '700', backgroundColor: '#f0fdf4' }}>
                        <td style={tdStyle}>Total</td>
                        <td style={tdStyle}>{totalOrders}</td>
                        <td style={tdStyle}>{currency}{totalSales.toLocaleString()}</td>
                        <td style={tdStyle}>100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
                  Average Order Value: <strong>{currency}{avgOrderValue.toFixed(2)}</strong>
                </p>

                {/* Payment Breakdown Table */}
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>Payment Breakdown</h3>
                <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={thStyle}>Method</th>
                        <th style={thStyle}>Amount</th>
                        <th style={thStyle}>% of Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p, idx) => (
                        <tr key={idx}>
                          <td style={tdStyle}>{p.method}</td>
                          <td style={tdStyle}>{currency}{(parseFloat(p.amount) || 0).toLocaleString()}</td>
                          <td style={tdStyle}>{totalPayments > 0 ? ((parseFloat(p.amount) || 0) / totalPayments * 100).toFixed(1) : 0}%</td>
                        </tr>
                      ))}
                      <tr style={{ fontWeight: '700', backgroundColor: '#f0fdf4' }}>
                        <td style={tdStyle}>Total</td>
                        <td style={tdStyle}>{currency}{totalPayments.toLocaleString()}</td>
                        <td style={tdStyle}>100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Cash Reconciliation */}
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>Cash Reconciliation</h3>
                <div style={{ backgroundColor: '#f9fafb', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', fontSize: '14px' }}>
                    <span style={{ color: '#374151' }}>Opening Cash</span>
                    <span style={{ fontWeight: '600', textAlign: 'right' }}>{currency}{(parseFloat(openingCash) || 0).toLocaleString()}</span>
                    <span style={{ color: '#16a34a' }}>+ Cash Received</span>
                    <span style={{ fontWeight: '600', textAlign: 'right', color: '#16a34a' }}>+{currency}{cashReceived.toLocaleString()}</span>
                    <span style={{ color: '#ef4444' }}>- Cash Expenses</span>
                    <span style={{ fontWeight: '600', textAlign: 'right', color: '#ef4444' }}>-{currency}{totalExpenses.toLocaleString()}</span>
                    <span style={{ color: '#374151', borderTop: '2px solid #e5e7eb', paddingTop: '8px', marginTop: '8px' }}>= Expected Closing</span>
                    <span style={{ fontWeight: '700', textAlign: 'right', borderTop: '2px solid #e5e7eb', paddingTop: '8px', marginTop: '8px' }}>{currency}{expectedClosingCash.toLocaleString()}</span>
                    <span style={{ color: '#374151' }}>Actual Closing</span>
                    <span style={{ fontWeight: '600', textAlign: 'right' }}>{currency}{(parseFloat(closingCash) || 0).toLocaleString()}</span>
                    <span style={{ color: cashVariance >= 0 ? '#16a34a' : '#ef4444', fontWeight: '700' }}>Variance</span>
                    <span style={{ fontWeight: '700', textAlign: 'right', color: cashVariance >= 0 ? '#16a34a' : '#ef4444' }}>
                      {cashVariance >= 0 ? '+' : ''}{currency}{cashVariance.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Expenses Table */}
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>Expenses</h3>
                <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={thStyle}>Description</th>
                        <th style={thStyle}>Category</th>
                        <th style={thStyle}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((exp, idx) => (
                        <tr key={idx}>
                          <td style={tdStyle}>{exp.description || '-'}</td>
                          <td style={tdStyle}>{exp.category}</td>
                          <td style={tdStyle}>{currency}{(parseFloat(exp.amount) || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr style={{ fontWeight: '700', backgroundColor: '#fef2f2' }}>
                        <td style={tdStyle} colSpan={2}>Total Expenses</td>
                        <td style={tdStyle}>{currency}{totalExpenses.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* P&L Summary */}
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>P&L Summary</h3>
                <div style={{ backgroundColor: netRevenue >= 0 ? '#f0fdf4' : '#fef2f2', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', fontSize: '15px' }}>
                    <span style={{ color: '#374151' }}>Total Revenue</span>
                    <span style={{ fontWeight: '700', textAlign: 'right' }}>{currency}{totalSales.toLocaleString()}</span>
                    <span style={{ color: '#374151' }}>Total Expenses</span>
                    <span style={{ fontWeight: '600', textAlign: 'right', color: '#ef4444' }}>-{currency}{totalExpenses.toLocaleString()}</span>
                    <span style={{ color: '#111827', fontWeight: '700', borderTop: '2px solid #d1d5db', paddingTop: '12px', marginTop: '4px' }}>Net Profit</span>
                    <span style={{ fontWeight: '800', textAlign: 'right', color: netRevenue >= 0 ? '#16a34a' : '#ef4444', borderTop: '2px solid #d1d5db', paddingTop: '12px', marginTop: '4px', fontSize: '18px' }}>
                      {currency}{netRevenue.toLocaleString()}
                    </span>
                    <span style={{ color: '#6b7280' }}>Profit Margin</span>
                    <span style={{ fontWeight: '600', textAlign: 'right', color: profitMargin >= 0 ? '#16a34a' : '#ef4444' }}>
                      {profitMargin.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* SEO Content Section 1 */}
            <div style={{ ...cardStyle, marginTop: '40px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>Why Daily Sales Tracking Matters</h2>
              <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.8', marginBottom: '16px' }}>
                Daily sales tracking is the backbone of successful restaurant management. Without a clear picture of your daily revenue, expenses, and cash flow, you are essentially running your business blind. Restaurants that track their sales daily are far more likely to spot issues early, from declining foot traffic to rising food costs, and take corrective action before problems compound.
              </p>
              <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.8', marginBottom: '16px' }}>
                One of the biggest advantages of daily tracking is pattern recognition. Over time, you will see which days of the week are busiest, which channels drive the most revenue, and which payment methods your customers prefer. This data is invaluable for staffing decisions, inventory planning, and marketing campaigns.
              </p>
              <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.8', marginBottom: '16px' }}>
                Daily reports also create accountability. When your team knows that every rupee is tracked and reconciled, cash handling improves, waste decreases, and overall discipline increases. Many successful restaurant chains attribute their growth to disciplined daily reporting habits established from day one.
              </p>
              <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.8' }}>
                Finally, daily sales data is essential for tax compliance. In India, GST returns require accurate sales records. In the US and UK, tax authorities expect detailed financial records. A daily sales report serves as your primary source document for all these obligations, making year-end accounting significantly easier.
              </p>
            </div>

            {/* SEO Content Section 2 */}
            <div style={{ ...cardStyle }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>Restaurant Cash Management Tips</h2>
              <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.8', marginBottom: '16px' }}>
                Cash management remains one of the most challenging aspects of running a restaurant, even as digital payments grow. In India, cash still accounts for 30-40% of restaurant transactions, making proper cash handling procedures essential for profitability and loss prevention.
              </p>
              <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.8', marginBottom: '16px' }}>
                Start each day with a fixed opening cash float. This should be enough to make change for typical transactions but not so much that it creates security risks. For most Indian restaurants, an opening float of 3,000-5,000 rupees is sufficient. Count and verify this amount at shift start and document it.
              </p>
              <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.8', marginBottom: '16px' }}>
                Implement a strict no-access policy for the cash register. Only designated cashiers should handle the register, and every opening should be for a transaction. Random spot checks throughout the day help maintain discipline. If your restaurant uses multiple registers, reconcile each one independently.
              </p>
              <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.8' }}>
                At day end, count all cash, compare it against the POS or billing system total, and document any variance. Small variances (under 200 rupees) are common due to rounding, but consistent shortages indicate a problem. Bank your excess cash daily rather than keeping large amounts on premises overnight.
              </p>
            </div>

            {/* SEO Content Section 3 */}
            <div style={{ ...cardStyle }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>End-of-Day Procedures</h2>
              <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.8', marginBottom: '16px' }}>
                A well-structured end-of-day (EOD) procedure ensures nothing falls through the cracks and sets your restaurant up for success the next day. The best EOD procedures are documented, consistent, and take no more than 30-45 minutes to complete.
              </p>
              <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.8', marginBottom: '16px' }}>
                Begin your EOD process by closing all open orders in your POS system. Run the end-of-day report that shows total sales by channel, payment method breakdown, and any voids or discounts applied. Review voids and discounts for any unusual patterns that might indicate unauthorized use.
              </p>
              <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.8', marginBottom: '16px' }}>
                Next, reconcile all payment methods. Count cash and compare to the system total. Check card terminal batch totals against POS card sales. Verify UPI and online payment totals match your payment gateway dashboard. Document any discrepancies immediately while the details are fresh.
              </p>
              <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.8' }}>
                Finally, log all expenses incurred during the day, note any inventory items that need reordering, and record any incidents or customer complaints. This daily discipline creates an invaluable record that helps managers spot trends, resolve issues quickly, and maintain tight financial control over the business.
              </p>
            </div>

            {/* FAQ Section */}
            <div style={{ ...cardStyle }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '20px', textAlign: 'center' }}>Frequently Asked Questions</h2>
              {faqData.map((faq, idx) => (
                <div key={idx} style={{ borderBottom: idx < faqData.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '18px 0',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: '15px', fontWeight: '600', color: '#111827', paddingRight: '16px' }}>{faq.q}</span>
                    <span style={{ fontSize: '20px', color: '#9ca3af', flexShrink: 0, transform: openFaq === idx ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s ease' }}>+</span>
                  </button>
                  {openFaq === idx && (
                    <div style={{ paddingBottom: '18px' }}>
                      <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.7' }}>{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div style={{
              textAlign: 'center',
              padding: isMobile ? '32px 20px' : '48px 40px',
              backgroundColor: '#6366f1',
              borderRadius: '16px',
              color: 'white',
              marginBottom: '20px',
            }}>
              <h2 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: '700', marginBottom: '12px' }}>
                Automate Your Daily Reports with DineOpen POS
              </h2>
              <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px' }}>
                DineOpen POS generates daily sales reports automatically with real-time tracking, cash reconciliation, payment breakdowns, and 30-day trend analytics. No manual data entry needed.
              </p>
              <Link href="https://dineopen.com/login" style={{
                display: 'inline-block',
                padding: '14px 36px',
                backgroundColor: 'white',
                color: '#6366f1',
                borderRadius: '8px',
                fontWeight: '700',
                textDecoration: 'none',
                fontSize: '16px',
              }}>
                Start Free Trial
              </Link>
            </div>

            {/* Related Tools */}
            <div style={{ marginBottom: '40px', marginTop: '40px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '20px', textAlign: 'center' }}>Related Free Tools</h2>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '16px' }}>
                {relatedTools.map((tool, idx) => (
                  <Link key={idx} href={tool.href} style={{ textDecoration: 'none' }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: isMobile ? '24px' : '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center', transition: 'box-shadow 0.2s ease', cursor: 'pointer' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#16a34a', marginBottom: '8px' }}>{tool.name}</h3>
                      <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>{tool.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <InternalLinks currentPath="/tools/daily-sales-report" variant="tool" />
      <Footer />

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #daily-report, #daily-report * { visibility: visible; }
          #daily-report { position: absolute; left: 0; top: 0; width: 100%; }
          button { display: none !important; }
        }
      `}</style>
    </>
  );
}

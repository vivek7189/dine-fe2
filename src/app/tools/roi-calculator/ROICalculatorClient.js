'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import { FaCalculator, FaChartLine, FaArrowRight, FaCheck } from 'react-icons/fa';

export default function ROICalculatorClient() {
  const [currency, setCurrency] = useState('INR');
  const [monthlyRevenue, setMonthlyRevenue] = useState(500000);
  const [cardPercentage, setCardPercentage] = useState(40);
  const [currentPOS, setCurrentPOS] = useState('petpooja');
  const [outlets, setOutlets] = useState(1);
  const [showResults, setShowResults] = useState(false);

  const currencySymbols = { INR: '₹', USD: '$', GBP: '£', AED: 'AED ', SGD: 'SGD ', CAD: 'CAD ', AUD: 'AUD ' };
  const dineOpenPrices = { INR: 999, USD: 10, GBP: 8, AED: 149, SGD: 49, CAD: 39, AUD: 39 };

  const competitorData = {
    petpooja: { name: 'Petpooja', monthly: { INR: 2500, USD: 60, GBP: 50, AED: 200, SGD: 80, CAD: 60, AUD: 60 }, setup: { INR: 15000, USD: 200, GBP: 150, AED: 500, SGD: 300, CAD: 200, AUD: 200 }, txnFee: 0 },
    posist: { name: 'POSist', monthly: { INR: 4000, USD: 80, GBP: 65, AED: 250, SGD: 100, CAD: 80, AUD: 80 }, setup: { INR: 30000, USD: 400, GBP: 300, AED: 1000, SGD: 500, CAD: 400, AUD: 400 }, txnFee: 0 },
    square: { name: 'Square', monthly: { INR: 5000, USD: 60, GBP: 50, AED: 200, SGD: 80, CAD: 60, AUD: 60 }, setup: { INR: 0, USD: 0, GBP: 0, AED: 0, SGD: 0, CAD: 0, AUD: 0 }, txnFee: 2.6 },
    toast: { name: 'Toast', monthly: { INR: 6000, USD: 69, GBP: 55, AED: 220, SGD: 90, CAD: 69, AUD: 69 }, setup: { INR: 0, USD: 0, GBP: 0, AED: 0, SGD: 0, CAD: 0, AUD: 0 }, txnFee: 2.49 },
    lightspeed: { name: 'Lightspeed', monthly: { INR: 7000, USD: 69, GBP: 55, AED: 250, SGD: 100, CAD: 69, AUD: 69 }, setup: { INR: 0, USD: 0, GBP: 0, AED: 0, SGD: 0, CAD: 0, AUD: 0 }, txnFee: 2.6 },
    touchbistro: { name: 'TouchBistro', monthly: { INR: 6500, USD: 69, GBP: 55, AED: 230, SGD: 95, CAD: 69, AUD: 69 }, setup: { INR: 10000, USD: 150, GBP: 120, AED: 400, SGD: 200, CAD: 150, AUD: 150 }, txnFee: 2.6 },
    other: { name: 'Other POS', monthly: { INR: 3000, USD: 50, GBP: 40, AED: 180, SGD: 70, CAD: 50, AUD: 50 }, setup: { INR: 10000, USD: 150, GBP: 120, AED: 400, SGD: 200, CAD: 150, AUD: 150 }, txnFee: 0 },
  };

  const calculateSavings = () => {
    const competitor = competitorData[currentPOS];
    const cardVolume = (monthlyRevenue * cardPercentage) / 100;

    // Current POS costs (yearly)
    const currentMonthly = competitor.monthly[currency] * outlets;
    const currentSetup = competitor.setup[currency];
    const currentTxnFees = (cardVolume * competitor.txnFee / 100) * 12;
    const currentYearlyCost = (currentMonthly * 12) + currentSetup + currentTxnFees;

    // DineOpen costs (yearly) - no setup fee, no transaction fees
    const dineOpenYearly = dineOpenPrices[currency] * outlets * 12;

    const yearlySavings = currentYearlyCost - dineOpenYearly;
    const monthlySavings = yearlySavings / 12;
    const fiveYearSavings = yearlySavings * 5;

    return {
      currentMonthly,
      currentYearly: currentYearlyCost,
      currentTxnFees,
      dineOpenMonthly: dineOpenPrices[currency] * outlets,
      dineOpenYearly,
      yearlySavings,
      monthlySavings,
      fiveYearSavings,
      savingsPercent: Math.round((yearlySavings / currentYearlyCost) * 100),
    };
  };

  const results = calculateSavings();
  const sym = currencySymbols[currency];

  const formatNumber = (num) => {
    if (currency === 'INR') {
      return num.toLocaleString('en-IN');
    }
    return num.toLocaleString('en-US');
  };

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px', marginBottom: '20px' }}>
              <FaCalculator /> Free Tool
            </div>
            <h1 style={{ fontSize: '42px', fontWeight: '800', marginBottom: '16px' }}>
              Restaurant POS ROI Calculator
            </h1>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>
              Calculate how much you can save by switching to DineOpen. Enter your details below.
            </p>
          </div>
        </section>

        {/* Calculator */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '40px' }}>
              {/* Input Section */}
              <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Your Business Details</h2>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px' }}
                  >
                    <option value="INR">Indian Rupee (₹)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="GBP">British Pound (£)</option>
                    <option value="AED">UAE Dirham (AED)</option>
                    <option value="SGD">Singapore Dollar (SGD)</option>
                    <option value="CAD">Canadian Dollar (CAD)</option>
                    <option value="AUD">Australian Dollar (AUD)</option>
                  </select>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Monthly Revenue</label>
                  <input
                    type="number"
                    value={monthlyRevenue}
                    onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px' }}
                  />
                  <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Total monthly sales including all payment methods</p>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Card Payment Percentage: {cardPercentage}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={cardPercentage}
                    onChange={(e) => setCardPercentage(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                  <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Percentage of sales via card/digital payments</p>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Current POS System</label>
                  <select
                    value={currentPOS}
                    onChange={(e) => setCurrentPOS(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px' }}
                  >
                    <option value="petpooja">Petpooja</option>
                    <option value="posist">POSist</option>
                    <option value="square">Square</option>
                    <option value="toast">Toast</option>
                    <option value="lightspeed">Lightspeed</option>
                    <option value="touchbistro">TouchBistro</option>
                    <option value="other">Other POS</option>
                  </select>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Number of Outlets</label>
                  <input
                    type="number"
                    min="1"
                    value={outlets}
                    onChange={(e) => setOutlets(Number(e.target.value))}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px' }}
                  />
                </div>

                <button
                  onClick={() => setShowResults(true)}
                  style={{ width: '100%', padding: '16px', backgroundColor: '#059669', color: 'white', borderRadius: '8px', fontWeight: '700', fontSize: '16px', border: 'none', cursor: 'pointer' }}
                >
                  Calculate My Savings <FaChartLine style={{ marginLeft: '8px' }} />
                </button>
              </div>

              {/* Results Section */}
              <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Your Potential Savings</h2>

                <div style={{ marginBottom: '32px', padding: '24px', backgroundColor: '#d1fae5', borderRadius: '12px', textAlign: 'center' }}>
                  <p style={{ fontSize: '14px', color: '#065f46', marginBottom: '8px' }}>Annual Savings with DineOpen</p>
                  <p style={{ fontSize: '48px', fontWeight: '800', color: '#059669' }}>{sym}{formatNumber(Math.round(results.yearlySavings))}</p>
                  <p style={{ fontSize: '14px', color: '#065f46' }}>That&apos;s {results.savingsPercent}% less than {competitorData[currentPOS].name}</p>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>Cost Breakdown</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ padding: '16px', backgroundColor: '#fef2f2', borderRadius: '8px' }}>
                      <p style={{ fontSize: '12px', color: '#991b1b', marginBottom: '4px' }}>Current: {competitorData[currentPOS].name}</p>
                      <p style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626' }}>{sym}{formatNumber(Math.round(results.currentYearly))}/yr</p>
                      <p style={{ fontSize: '11px', color: '#991b1b' }}>{sym}{formatNumber(Math.round(results.currentMonthly))}/mo + fees</p>
                    </div>
                    <div style={{ padding: '16px', backgroundColor: '#ecfdf5', borderRadius: '8px' }}>
                      <p style={{ fontSize: '12px', color: '#065f46', marginBottom: '4px' }}>DineOpen</p>
                      <p style={{ fontSize: '24px', fontWeight: '700', color: '#059669' }}>{sym}{formatNumber(Math.round(results.dineOpenYearly))}/yr</p>
                      <p style={{ fontSize: '11px', color: '#065f46' }}>{sym}{formatNumber(Math.round(results.dineOpenMonthly))}/mo, no fees</p>
                    </div>
                  </div>
                </div>

                {results.currentTxnFees > 0 && (
                  <div style={{ padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px', marginBottom: '24px' }}>
                    <p style={{ fontSize: '14px', color: '#92400e' }}>
                      <strong>Transaction fees you&apos;ll save:</strong> {sym}{formatNumber(Math.round(results.currentTxnFees))}/year
                    </p>
                  </div>
                )}

                <div style={{ padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '8px', marginBottom: '24px' }}>
                  <p style={{ fontSize: '14px', color: '#374151' }}>
                    <strong>5-Year Savings:</strong> {sym}{formatNumber(Math.round(results.fiveYearSavings))}
                  </p>
                </div>

                <Link
                  href="https://dineopen.com/login"
                  style={{ display: 'block', width: '100%', padding: '16px', backgroundColor: '#059669', color: 'white', borderRadius: '8px', fontWeight: '700', fontSize: '16px', textDecoration: 'none', textAlign: 'center' }}
                >
                  Start Saving Today <FaArrowRight style={{ marginLeft: '8px' }} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* What You Get */}
        <section style={{ backgroundColor: 'white', padding: '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>
              What&apos;s Included with DineOpen
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {[
                'Complete POS System', 'AI Voice Ordering', 'QR Code Menus', 'Kitchen Display (KDS)',
                'Inventory Management', 'Loyalty & Rewards', 'Analytics & Reports', 'Delivery Integration',
                'Multi-Outlet Support', 'Waiter/Captain App', 'WhatsApp Notifications', '24/7 Support'
              ].map((feature, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                  <FaCheck style={{ color: '#059669', flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', color: '#374151' }}>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Internal Links */}
        <section style={{ padding: '60px 20px', backgroundColor: '#f3f4f6' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '32px' }}>
              Compare & Explore More
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
              {[
                { name: 'Compare All POS', href: '/compare' },
                { name: 'Petpooja Alternative', href: '/alternatives/petpooja' },
                { name: 'POSist Alternative', href: '/alternatives/posist' },
                { name: 'Square Alternative', href: '/alternatives/square' },
                { name: 'Break-Even Calculator', href: '/tools/break-even-calculator' },
                { name: 'Profit Margin Calculator', href: '/tools/profit-margin-calculator' },
              ].map((link) => (
                <Link key={link.href} href={link.href} style={{ padding: '12px 24px', backgroundColor: 'white', borderRadius: '8px', color: '#059669', textDecoration: 'none', fontWeight: '600', fontSize: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '60px 20px', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>
              Start Saving Today
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '24px' }}>
              7-day free trial. No credit card required. Cancel anytime.
            </p>
            <Link
              href="https://dineopen.com/login"
              style={{ display: 'inline-block', padding: '16px 32px', backgroundColor: 'white', color: '#059669', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}
            >
              Start Free Trial →
            </Link>
          </div>
        </section>
      </div>
      <InternalLinks currentPath="/tools/roi-calculator" variant="tool" />
      <Footer />
    </>
  );
}

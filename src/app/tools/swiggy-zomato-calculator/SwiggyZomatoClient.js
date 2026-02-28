'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';

export default function SwiggyZomatoClient() {
  const [platform, setPlatform] = useState('swiggy');
  const [orderValue, setOrderValue] = useState('500');
  const [commissionRate, setCommissionRate] = useState('22');
  const [foodCostPercent, setFoodCostPercent] = useState('30');
  const [monthlyOrders, setMonthlyOrders] = useState('500');
  const [packagingCost, setPackagingCost] = useState('15');

  const platformDefaults = {
    swiggy: { name: 'Swiggy', commission: 22, color: '#fc8019' },
    zomato: { name: 'Zomato', commission: 22, color: '#e23744' },
    magicpin: { name: 'Magicpin', commission: 15, color: '#8b5cf6' },
    direct: { name: 'Direct/WhatsApp', commission: 0, color: '#22c55e' },
  };

  const calculate = () => {
    const order = parseFloat(orderValue) || 0;
    const commission = parseFloat(commissionRate) || 0;
    const foodCost = parseFloat(foodCostPercent) || 0;
    const orders = parseInt(monthlyOrders) || 0;
    const packaging = parseFloat(packagingCost) || 0;

    if (order <= 0) return null;

    // Calculations
    const commissionAmount = order * (commission / 100);
    const gstOnCommission = commissionAmount * 0.18; // 18% GST on commission
    const totalPlatformFee = commissionAmount + gstOnCommission;
    const foodCostAmount = order * (foodCost / 100);
    const netRevenue = order - totalPlatformFee - foodCostAmount - packaging;
    const netMargin = (netRevenue / order) * 100;

    // Monthly
    const monthlyGross = order * orders;
    const monthlyCommission = totalPlatformFee * orders;
    const monthlyFoodCost = foodCostAmount * orders;
    const monthlyPackaging = packaging * orders;
    const monthlyNet = netRevenue * orders;

    // Direct comparison
    const directNet = order - foodCostAmount - packaging;
    const directMargin = (directNet / order) * 100;
    const lostToAggregator = totalPlatformFee;
    const monthlyLostToAggregator = lostToAggregator * orders;

    return {
      order,
      commissionAmount,
      gstOnCommission,
      totalPlatformFee,
      foodCostAmount,
      packaging,
      netRevenue,
      netMargin,
      monthlyGross,
      monthlyCommission,
      monthlyFoodCost,
      monthlyPackaging,
      monthlyNet,
      directNet,
      directMargin,
      lostToAggregator,
      monthlyLostToAggregator,
    };
  };

  const result = calculate();
  const platformData = platformDefaults[platform];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: `linear-gradient(135deg, ${platformData.color} 0%, ${platformData.color}dd 100%)`, color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Swiggy & Zomato Commission Calculator</h1>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>
              Calculate your actual profit after aggregator fees and commissions
            </p>
          </div>
        </section>

        {/* Calculator */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
              {/* Input */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Order Details</h3>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Platform
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {Object.entries(platformDefaults).map(([key, val]) => (
                      <button
                        key={key}
                        onClick={() => { setPlatform(key); setCommissionRate(val.commission.toString()); }}
                        style={{
                          padding: '10px 8px',
                          backgroundColor: platform === key ? val.color : '#f3f4f6',
                          color: platform === key ? 'white' : '#374151',
                          border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: '600'
                        }}
                      >
                        {val.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Average Order Value (₹)
                  </label>
                  <input
                    type="number"
                    value={orderValue}
                    onChange={(e) => setOrderValue(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}
                  />
                  <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>Typical: Swiggy/Zomato 18-25%, Magicpin 12-18%</p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Food Cost (%)
                  </label>
                  <input
                    type="number"
                    value={foodCostPercent}
                    onChange={(e) => setFoodCostPercent(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Packaging Cost per Order (₹)
                  </label>
                  <input
                    type="number"
                    value={packagingCost}
                    onChange={(e) => setPackagingCost(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Monthly Orders
                  </label>
                  <input
                    type="number"
                    value={monthlyOrders}
                    onChange={(e) => setMonthlyOrders(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}
                  />
                </div>
              </div>

              {/* Results */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Profit Analysis</h3>

                {result ? (
                  <>
                    {/* Per Order */}
                    <div style={{ marginBottom: '24px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Per Order Breakdown</p>
                      <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ color: '#6b7280', fontSize: '13px' }}>Order Value</span>
                          <span style={{ fontWeight: '600' }}>₹{result.order}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#dc2626' }}>
                          <span style={{ fontSize: '13px' }}>Commission ({commissionRate}%)</span>
                          <span>-₹{result.commissionAmount.toFixed(0)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#dc2626' }}>
                          <span style={{ fontSize: '13px' }}>GST on Commission (18%)</span>
                          <span>-₹{result.gstOnCommission.toFixed(0)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#6b7280' }}>
                          <span style={{ fontSize: '13px' }}>Food Cost ({foodCostPercent}%)</span>
                          <span>-₹{result.foodCostAmount.toFixed(0)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#6b7280' }}>
                          <span style={{ fontSize: '13px' }}>Packaging</span>
                          <span>-₹{result.packaging}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                          <span style={{ fontWeight: '700' }}>Net Profit</span>
                          <span style={{ fontWeight: '700', color: result.netRevenue > 0 ? '#22c55e' : '#dc2626', fontSize: '18px' }}>
                            ₹{result.netRevenue.toFixed(0)} ({result.netMargin.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Monthly */}
                    <div style={{ padding: '24px', background: `linear-gradient(135deg, ${platformData.color} 0%, ${platformData.color}dd 100%)`, borderRadius: '12px', color: 'white', textAlign: 'center', marginBottom: '24px' }}>
                      <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Monthly Net Profit</p>
                      <p style={{ fontSize: '36px', fontWeight: '800' }}>₹{(result.monthlyNet / 1000).toFixed(1)}K</p>
                      <p style={{ fontSize: '13px', opacity: 0.9 }}>from ₹{(result.monthlyGross / 1000).toFixed(0)}K gross ({monthlyOrders} orders)</p>
                    </div>

                    {/* Comparison */}
                    {platform !== 'direct' && (
                      <div style={{ padding: '16px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca', marginBottom: '20px' }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#dc2626', marginBottom: '8px' }}>Money Lost to Aggregator</p>
                        <p style={{ fontSize: '24px', fontWeight: '800', color: '#dc2626' }}>
                          ₹{(result.monthlyLostToAggregator / 1000).toFixed(1)}K/month
                        </p>
                        <p style={{ fontSize: '12px', color: '#991b1b', marginTop: '4px' }}>
                          ₹{result.lostToAggregator.toFixed(0)} per order in commission + GST
                        </p>
                      </div>
                    )}

                    <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                      <p style={{ fontSize: '13px', color: '#166534' }}>
                        <strong>Direct orders margin:</strong> {result.directMargin.toFixed(1)}% (₹{result.directNet.toFixed(0)}/order)
                      </p>
                      <p style={{ fontSize: '12px', color: '#166534', marginTop: '4px' }}>
                        Build direct ordering with QR menus and WhatsApp to save on commissions
                      </p>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    <p>Enter order value to calculate profit</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '60px 20px', backgroundColor: '#111827', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Reduce Aggregator Dependency</h2>
            <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '24px' }}>Build direct ordering with DineOpen QR menus, WhatsApp ordering, and loyalty programs.</p>
            <Link href="/tools/qr-menu-generator" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: '#ef4444', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
              Create Free QR Menu
            </Link>
          </div>
        </section>
      </div>
      <InternalLinks currentPath="/tools/swiggy-zomato-calculator" variant="tool" />
      <Footer />
    </>
  );
}

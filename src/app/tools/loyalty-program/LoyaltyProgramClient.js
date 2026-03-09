'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import Breadcrumb from '../../../components/Breadcrumb';

export default function LoyaltyProgramClient() {
  const [customers, setCustomers] = useState(500);
  const [avgOrder, setAvgOrder] = useState(400);
  const [visitsPerMonth, setVisitsPerMonth] = useState(2);
  const [repeatRate, setRepeatRate] = useState(30);
  const [rewardPercent, setRewardPercent] = useState(5);
  const [calculated, setCalculated] = useState(false);

  const currentMonthlyRevenue = customers * avgOrder * visitsPerMonth * (repeatRate / 100);
  const loyaltyVisitBoost = 1.4;
  const loyaltyRepeatBoost = Math.min(repeatRate * 1.5, 90);
  const projectedRevenue = customers * avgOrder * (visitsPerMonth * loyaltyVisitBoost) * (loyaltyRepeatBoost / 100);
  const rewardCost = projectedRevenue * (rewardPercent / 100);
  const netGain = projectedRevenue - currentMonthlyRevenue - rewardCost;
  const roiPercent = rewardCost > 0 ? ((netGain / rewardCost) * 100).toFixed(0) : 0;

  const formatCurrency = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
      <CommonHeader />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Free Tools', href: '/tools/food-cost-calculator' }, { label: 'Loyalty ROI Calculator' }]} />

      <div style={{ paddingTop: '80px' }}>
        <section style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '12px', marginBottom: '16px' }}>
              Free Calculator &bull; No Login Required
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Restaurant Loyalty Program ROI Calculator</h1>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>
              Calculate how much revenue a loyalty program can add to your restaurant. See your projected ROI instantly.
            </p>
          </div>
        </section>

        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Your Restaurant Details</h3>
                {[
                  { label: 'Total Customers / Month', value: customers, set: setCustomers, min: 50, max: 5000, step: 50 },
                  { label: 'Average Order Value (₹)', value: avgOrder, set: setAvgOrder, min: 100, max: 3000, step: 50 },
                  { label: 'Visits Per Customer / Month', value: visitsPerMonth, set: setVisitsPerMonth, min: 1, max: 10, step: 0.5 },
                  { label: 'Current Repeat Rate (%)', value: repeatRate, set: setRepeatRate, min: 5, max: 80, step: 1 },
                  { label: 'Reward Percentage (%)', value: rewardPercent, set: setRewardPercent, min: 1, max: 15, step: 1 },
                ].map((field, idx) => (
                  <div key={idx} style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      <span>{field.label}</span>
                      <span style={{ color: '#7c3aed' }}>{field.value}</span>
                    </label>
                    <input type="range" min={field.min} max={field.max} step={field.step} value={field.value}
                      onChange={(e) => field.set(Number(e.target.value))} style={{ width: '100%', accentColor: '#7c3aed' }} />
                  </div>
                ))}
                <button onClick={() => setCalculated(true)} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '18px', fontWeight: '700', cursor: 'pointer' }}>
                  Calculate ROI
                </button>
              </div>

              <div style={{ backgroundColor: calculated ? '#f5f3ff' : '#f9fafb', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Your Loyalty ROI</h3>
                {calculated ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Current Monthly Revenue</p>
                      <p style={{ fontSize: '24px', fontWeight: '700', color: '#374151' }}>{formatCurrency(currentMonthlyRevenue)}</p>
                    </div>
                    <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Projected Revenue (with Loyalty)</p>
                      <p style={{ fontSize: '24px', fontWeight: '700', color: '#059669' }}>{formatCurrency(projectedRevenue)}</p>
                    </div>
                    <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Reward Cost</p>
                      <p style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626' }}>-{formatCurrency(rewardCost)}</p>
                    </div>
                    <div style={{ padding: '20px', backgroundColor: '#7c3aed', borderRadius: '12px', color: 'white' }}>
                      <p style={{ fontSize: '13px', opacity: 0.9, marginBottom: '4px' }}>Net Revenue Gain / Month</p>
                      <p style={{ fontSize: '32px', fontWeight: '800' }}>{formatCurrency(netGain)}</p>
                      <p style={{ fontSize: '14px', marginTop: '8px', opacity: 0.9 }}>ROI: {roiPercent}% &bull; Annual Gain: {formatCurrency(netGain * 12)}</p>
                    </div>
                    <div style={{ padding: '16px', backgroundColor: '#ecfdf5', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                      <p style={{ fontSize: '14px', color: '#065f46', fontWeight: '600' }}>
                        A loyalty program could increase your repeat rate from {repeatRate}% to {Math.round(loyaltyRepeatBoost)}% and boost visits by 40%.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
                    <p style={{ fontSize: '48px', marginBottom: '16px' }}>📊</p>
                    <p>Adjust the sliders and click Calculate to see your loyalty program ROI</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#7c3aed', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Launch Your Loyalty Program Today</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px' }}>DineOpen includes built-in loyalty & rewards at no extra cost.</p>
            <Link href="/pricing" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#7c3aed', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
              Start Free Trial
            </Link>
          </div>
        </section>

        <InternalLinks currentPath="/tools/loyalty-program" variant="tool" />
      </div>
      <Footer />
    </div>
  );
}

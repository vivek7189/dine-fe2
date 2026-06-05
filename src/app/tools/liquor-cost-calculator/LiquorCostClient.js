'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';

export default function LiquorCostClient() {
  const [drinkType, setDrinkType] = useState('spirit');
  const [bottlePrice, setBottlePrice] = useState('');
  const [bottleSize, setBottleSize] = useState('750');
  const [pourSize, setPourSize] = useState('30');
  const [sellingPrice, setSellingPrice] = useState('');
  const [mixerCost, setMixerCost] = useState('');

  const bottleSizes = {
    '180': '180ml (Nip)',
    '375': '375ml (Half)',
    '500': '500ml',
    '750': '750ml (Full)',
    '1000': '1L (Litre)',
  };

  const pourSizes = {
    '30': '30ml (Small Peg)',
    '60': '60ml (Large Peg)',
    '90': '90ml (Double+)',
    '45': '45ml (Standard)',
  };

  const calculate = () => {
    const bottle = parseFloat(bottlePrice) || 0;
    const size = parseFloat(bottleSize) || 750;
    const pour = parseFloat(pourSize) || 30;
    const price = parseFloat(sellingPrice) || 0;
    const mixer = parseFloat(mixerCost) || 0;

    if (bottle <= 0) return null;

    const costPerMl = bottle / size;
    const costPerPour = costPerMl * pour;
    const totalCost = costPerPour + mixer;
    const poursPerBottle = Math.floor(size / pour);
    const revenuePerBottle = price * poursPerBottle;
    const profitPerBottle = revenuePerBottle - bottle - (mixer * poursPerBottle);
    const pourCostPercent = price > 0 ? (totalCost / price) * 100 : 0;
    const profitPerDrink = price - totalCost;
    const marginPercent = price > 0 ? (profitPerDrink / price) * 100 : 0;

    return {
      costPerMl,
      costPerPour,
      totalCost,
      poursPerBottle,
      revenuePerBottle,
      profitPerBottle,
      pourCostPercent,
      profitPerDrink,
      marginPercent,
      suggestedPrice20: totalCost / 0.20,
      suggestedPrice25: totalCost / 0.25,
      suggestedPrice30: totalCost / 0.30,
    };
  };

  const result = calculate();

  const getPourCostColor = (percent) => {
    if (percent <= 20) return '#22c55e';
    if (percent <= 25) return '#eab308';
    return '#ef4444';
  };

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Liquor Pour Cost Calculator</h1>
            <p style={{ fontSize: '18px', opacity: 0.9 }}>
              Calculate drink costs, pour sizes, and profit margins for your bar
            </p>
          </div>
        </section>

        {/* Calculator */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
              {/* Input */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Drink Details</h3>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Bottle Purchase Price (₹)
                  </label>
                  <input
                    type="number"
                    value={bottlePrice}
                    onChange={(e) => setBottlePrice(e.target.value)}
                    placeholder="e.g., 1500"
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Bottle Size
                  </label>
                  <select
                    value={bottleSize}
                    onChange={(e) => setBottleSize(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                  >
                    {Object.entries(bottleSizes).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Pour Size
                  </label>
                  <select
                    value={pourSize}
                    onChange={(e) => setPourSize(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                  >
                    {Object.entries(pourSizes).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Mixer/Garnish Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={mixerCost}
                    onChange={(e) => setMixerCost(e.target.value)}
                    placeholder="e.g., 20"
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Selling Price per Drink (₹)
                  </label>
                  <input
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    placeholder="e.g., 300"
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}
                  />
                </div>
              </div>

              {/* Results */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Cost Analysis</h3>

                {result ? (
                  <>
                    {/* Pour Cost % */}
                    {result.pourCostPercent > 0 && (
                      <div style={{ padding: '24px', backgroundColor: `${getPourCostColor(result.pourCostPercent)}15`, borderRadius: '12px', textAlign: 'center', marginBottom: '24px', border: `2px solid ${getPourCostColor(result.pourCostPercent)}` }}>
                        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Pour Cost Percentage</p>
                        <p style={{ fontSize: '42px', fontWeight: '800', color: getPourCostColor(result.pourCostPercent) }}>
                          {result.pourCostPercent.toFixed(1)}%
                        </p>
                        <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px' }}>
                          {result.pourCostPercent <= 20 ? '✅ Excellent margin' : result.pourCostPercent <= 25 ? '⚡ Acceptable' : '⚠️ Too high, increase price'}
                        </p>
                      </div>
                    )}

                    {/* Cost Breakdown */}
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
                        <span style={{ color: '#6b7280', fontSize: '14px' }}>Cost per ml</span>
                        <span style={{ fontWeight: '600' }}>₹{result.costPerMl.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
                        <span style={{ color: '#6b7280', fontSize: '14px' }}>Liquor cost per pour</span>
                        <span style={{ fontWeight: '600' }}>₹{result.costPerPour.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
                        <span style={{ color: '#6b7280', fontSize: '14px' }}>Total cost (+ mixer)</span>
                        <span style={{ fontWeight: '600' }}>₹{result.totalCost.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
                        <span style={{ color: '#6b7280', fontSize: '14px' }}>Pours per bottle</span>
                        <span style={{ fontWeight: '600' }}>{result.poursPerBottle}</span>
                      </div>
                      {result.profitPerDrink > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                          <span style={{ fontWeight: '600', fontSize: '15px' }}>Profit per drink</span>
                          <span style={{ fontWeight: '700', color: '#22c55e', fontSize: '18px' }}>₹{result.profitPerDrink.toFixed(0)}</span>
                        </div>
                      )}
                    </div>

                    {/* Suggested Pricing */}
                    <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Suggested Selling Prices</p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ padding: '8px 12px', backgroundColor: '#dcfce7', borderRadius: '6px', fontSize: '13px' }}>
                          20% cost: ₹{result.suggestedPrice20.toFixed(0)}
                        </span>
                        <span style={{ padding: '8px 12px', backgroundColor: '#fef9c3', borderRadius: '6px', fontSize: '13px' }}>
                          25% cost: ₹{result.suggestedPrice25.toFixed(0)}
                        </span>
                        <span style={{ padding: '8px 12px', backgroundColor: '#fee2e2', borderRadius: '6px', fontSize: '13px' }}>
                          30% cost: ₹{result.suggestedPrice30.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    <p>Enter bottle price to calculate costs</p>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div style={{ marginTop: '48px', backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#111827' }}>Bar Pour Cost Benchmarks</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                <div>
                  <h4 style={{ fontWeight: '600', marginBottom: '8px', color: '#22c55e' }}>Premium Bars (15-20%)</h4>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>High-end cocktail bars, fine dining. Focus on experience.</p>
                </div>
                <div>
                  <h4 style={{ fontWeight: '600', marginBottom: '8px', color: '#eab308' }}>Standard Bars (20-25%)</h4>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>Casual restaurants, pubs. Balance of value and margin.</p>
                </div>
                <div>
                  <h4 style={{ fontWeight: '600', marginBottom: '8px', color: '#ef4444' }}>High Volume (25-30%)</h4>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>Sports bars, clubs. Volume makes up for lower margin.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '60px 20px', backgroundColor: '#1e293b', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Track Bar Inventory Automatically</h2>
            <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '24px' }}>DineOpen tracks pours, monitors wastage, and alerts you to theft.</p>
            <Link href="/for/pubs-breweries" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: '#ef4444', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
              POS for Bars
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

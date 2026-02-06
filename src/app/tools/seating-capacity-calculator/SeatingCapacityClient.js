'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';

export default function SeatingCapacityClient() {
  const [area, setArea] = useState('');
  const [unit, setUnit] = useState('sqft');
  const [style, setStyle] = useState('casual');

  const layoutStyles = {
    fineDining: { name: 'Fine Dining', sqftPerSeat: 20, description: 'Spacious, elegant seating with privacy' },
    casual: { name: 'Casual Dining', sqftPerSeat: 15, description: 'Comfortable spacing for relaxed meals' },
    fastCasual: { name: 'Fast Casual', sqftPerSeat: 12, description: 'Efficient but comfortable layout' },
    qsr: { name: 'QSR / Fast Food', sqftPerSeat: 10, description: 'High-density, quick turnover seating' },
    cafe: { name: 'Cafe / Coffee Shop', sqftPerSeat: 14, description: 'Mix of tables and lounge seating' },
    bar: { name: 'Bar / Pub', sqftPerSeat: 12, description: 'Bar stools and standing areas' },
    banquet: { name: 'Banquet Hall', sqftPerSeat: 12, description: 'Event-style seating arrangements' },
  };

  const getAreaInSqft = () => {
    const areaNum = parseFloat(area) || 0;
    return unit === 'sqm' ? areaNum * 10.764 : areaNum;
  };

  const calculateCapacity = () => {
    const sqft = getAreaInSqft();
    if (sqft <= 0) return null;

    const styleData = layoutStyles[style];
    const diningArea = sqft * 0.60; // 60% for dining, 40% for kitchen/service
    const totalSeats = Math.floor(diningArea / styleData.sqftPerSeat);

    return {
      totalArea: sqft,
      diningArea: Math.round(diningArea),
      kitchenArea: Math.round(sqft * 0.25),
      serviceArea: Math.round(sqft * 0.15),
      seats: totalSeats,
      tables2: Math.floor(totalSeats * 0.3 / 2),
      tables4: Math.floor(totalSeats * 0.5 / 4),
      tables6: Math.floor(totalSeats * 0.2 / 6),
      sqftPerSeat: styleData.sqftPerSeat,
    };
  };

  const result = calculateCapacity();

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Restaurant Seating Capacity Calculator</h1>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>
              Calculate optimal seating capacity based on your restaurant area and layout style
            </p>
          </div>
        </section>

        {/* Calculator */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
              {/* Input */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Enter Details</h3>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Total Area
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="number"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="e.g., 1500"
                      style={{ flex: 1, padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}
                    />
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                    >
                      <option value="sqft">Sq. Ft</option>
                      <option value="sqm">Sq. M</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                    Restaurant Style
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.entries(layoutStyles).map(([key, val]) => (
                      <label
                        key={key}
                        style={{
                          display: 'flex', alignItems: 'center', padding: '12px',
                          backgroundColor: style === key ? '#7c3aed10' : '#f9fafb',
                          border: style === key ? '2px solid #7c3aed' : '1px solid #e5e7eb',
                          borderRadius: '8px', cursor: 'pointer'
                        }}
                      >
                        <input
                          type="radio"
                          name="style"
                          checked={style === key}
                          onChange={() => setStyle(key)}
                          style={{ marginRight: '12px' }}
                        />
                        <div>
                          <p style={{ fontWeight: '600', fontSize: '14px', color: '#111827' }}>{val.name}</p>
                          <p style={{ fontSize: '12px', color: '#6b7280' }}>{val.sqftPerSeat} sq ft per seat</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Results */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Capacity Analysis</h3>

                {result ? (
                  <>
                    {/* Main Result */}
                    <div style={{ padding: '24px', background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)', borderRadius: '12px', color: 'white', textAlign: 'center', marginBottom: '24px' }}>
                      <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Recommended Seating Capacity</p>
                      <p style={{ fontSize: '48px', fontWeight: '800' }}>{result.seats}</p>
                      <p style={{ fontSize: '14px', opacity: 0.9 }}>seats</p>
                    </div>

                    {/* Area Breakdown */}
                    <div style={{ marginBottom: '24px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Area Breakdown (Recommended)</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
                          <span style={{ fontSize: '14px', color: '#6b7280' }}>Dining Area (60%)</span>
                          <span style={{ fontWeight: '600' }}>{result.diningArea.toLocaleString()} sq ft</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
                          <span style={{ fontSize: '14px', color: '#6b7280' }}>Kitchen Area (25%)</span>
                          <span style={{ fontWeight: '600' }}>{result.kitchenArea.toLocaleString()} sq ft</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
                          <span style={{ fontSize: '14px', color: '#6b7280' }}>Service/Storage (15%)</span>
                          <span style={{ fontWeight: '600' }}>{result.serviceArea.toLocaleString()} sq ft</span>
                        </div>
                      </div>
                    </div>

                    {/* Table Mix */}
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Suggested Table Mix</p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                          <p style={{ fontSize: '24px', fontWeight: '700', color: '#7c3aed' }}>{result.tables2}</p>
                          <p style={{ fontSize: '12px', color: '#6b7280' }}>2-seater</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                          <p style={{ fontSize: '24px', fontWeight: '700', color: '#7c3aed' }}>{result.tables4}</p>
                          <p style={{ fontSize: '12px', color: '#6b7280' }}>4-seater</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                          <p style={{ fontSize: '24px', fontWeight: '700', color: '#7c3aed' }}>{result.tables6}</p>
                          <p style={{ fontSize: '12px', color: '#6b7280' }}>6-seater</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    <p>Enter your restaurant area to calculate seating capacity</p>
                  </div>
                )}
              </div>
            </div>

            {/* Info Section */}
            <div style={{ marginTop: '48px', backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#111827' }}>Seating Capacity Guidelines</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                <div>
                  <h4 style={{ fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Industry Standards</h4>
                  <ul style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.8', paddingLeft: '20px' }}>
                    <li>Fine Dining: 18-20 sq ft/seat</li>
                    <li>Casual Dining: 12-15 sq ft/seat</li>
                    <li>Fast Food: 8-12 sq ft/seat</li>
                    <li>Banquet: 10-12 sq ft/seat</li>
                  </ul>
                </div>
                <div>
                  <h4 style={{ fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Space Allocation</h4>
                  <ul style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.8', paddingLeft: '20px' }}>
                    <li>Dining: 50-60% of total area</li>
                    <li>Kitchen: 20-30% of total area</li>
                    <li>Service/Storage: 10-20%</li>
                    <li>Restrooms: 3-5% of total area</li>
                  </ul>
                </div>
                <div>
                  <h4 style={{ fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Fire Safety (India)</h4>
                  <ul style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.8', paddingLeft: '20px' }}>
                    <li>Min aisle width: 3 feet</li>
                    <li>Emergency exits based on capacity</li>
                    <li>Max 50 seats per exit</li>
                    <li>Check local NOC requirements</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '60px 20px', backgroundColor: '#7c3aed', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Plan Your Restaurant Layout with DineOpen</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px' }}>Our POS system includes table management and floor plan features.</p>
            <Link href="/products/table-management" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#7c3aed', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
              Explore Table Management
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

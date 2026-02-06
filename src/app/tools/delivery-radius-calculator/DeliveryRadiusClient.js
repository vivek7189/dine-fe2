'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';

export default function DeliveryRadiusClient() {
  const [maxTime, setMaxTime] = useState('30');
  const [prepTime, setPrepTime] = useState('15');
  const [avgSpeed, setAvgSpeed] = useState('25');
  const [trafficFactor, setTrafficFactor] = useState('moderate');
  const [foodType, setFoodType] = useState('hot');

  const trafficFactors = {
    light: { name: 'Light Traffic', factor: 1.0, description: 'Off-peak hours, suburbs' },
    moderate: { name: 'Moderate Traffic', factor: 0.7, description: 'Regular city traffic' },
    heavy: { name: 'Heavy Traffic', factor: 0.5, description: 'Peak hours, busy areas' },
  };

  const foodTypes = {
    hot: { name: 'Hot Food (Pizza, Biryani)', maxDeliveryTime: 25, quality: 'Best within 20 mins' },
    fried: { name: 'Fried Items (Momos, Fries)', maxDeliveryTime: 15, quality: 'Best within 10 mins' },
    room: { name: 'Room Temp OK (Desserts)', maxDeliveryTime: 45, quality: 'Flexible timing' },
    cold: { name: 'Cold Items (Ice Cream)', maxDeliveryTime: 20, quality: 'Needs insulated bags' },
  };

  const calculate = () => {
    const max = parseInt(maxTime) || 30;
    const prep = parseInt(prepTime) || 15;
    const speed = parseInt(avgSpeed) || 25;
    const traffic = trafficFactors[trafficFactor];
    const food = foodTypes[foodType];

    const deliveryTime = max - prep;
    if (deliveryTime <= 0) return null;

    const effectiveSpeed = speed * traffic.factor;
    const oneWayTime = deliveryTime / 2; // Account for return
    const maxDistance = (effectiveSpeed * oneWayTime) / 60; // km

    // Zones
    const zones = [
      { name: 'Premium Zone', radius: maxDistance * 0.5, deliveryFee: 0, time: Math.round(oneWayTime * 0.5) },
      { name: 'Standard Zone', radius: maxDistance * 0.75, deliveryFee: 30, time: Math.round(oneWayTime * 0.75) },
      { name: 'Extended Zone', radius: maxDistance, deliveryFee: 50, time: Math.round(oneWayTime) },
    ];

    const isQualityRisk = deliveryTime > food.maxDeliveryTime;

    return {
      deliveryTime,
      effectiveSpeed,
      maxDistance: maxDistance.toFixed(1),
      zones,
      food,
      isQualityRisk,
      roundTripTime: deliveryTime * 2,
      ordersPerHour: Math.floor(60 / (deliveryTime * 2 + 5)), // +5 for handoff
    };
  };

  const result = calculate();

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Delivery Radius Calculator</h1>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>
              Plan optimal delivery zones based on time, traffic, and food quality
            </p>
          </div>
        </section>

        {/* Calculator */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
              {/* Input */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Delivery Parameters</h3>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Max Order-to-Delivery Time (mins)
                  </label>
                  <input
                    type="number"
                    value={maxTime}
                    onChange={(e) => setMaxTime(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}
                  />
                  <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                    {[30, 40, 45, 60].map(t => (
                      <button
                        key={t}
                        onClick={() => setMaxTime(t.toString())}
                        style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: maxTime === t.toString() ? '#10b981' : '#f3f4f6', color: maxTime === t.toString() ? 'white' : '#6b7280', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        {t} min
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Average Prep Time (mins)
                  </label>
                  <input
                    type="number"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Average Vehicle Speed (km/h)
                  </label>
                  <input
                    type="number"
                    value={avgSpeed}
                    onChange={(e) => setAvgSpeed(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}
                  />
                  <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>Bike: 20-30 km/h, Car: 30-40 km/h in city</p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Traffic Conditions
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {Object.entries(trafficFactors).map(([key, val]) => (
                      <button
                        key={key}
                        onClick={() => setTrafficFactor(key)}
                        style={{
                          flex: 1, padding: '10px 8px',
                          backgroundColor: trafficFactor === key ? '#10b981' : '#f3f4f6',
                          color: trafficFactor === key ? 'white' : '#374151',
                          border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600'
                        }}
                      >
                        {val.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Food Type
                  </label>
                  <select
                    value={foodType}
                    onChange={(e) => setFoodType(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                  >
                    {Object.entries(foodTypes).map(([key, val]) => (
                      <option key={key} value={key}>{val.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Results */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Delivery Zone Analysis</h3>

                {result ? (
                  <>
                    <div style={{ padding: '24px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '12px', color: 'white', textAlign: 'center', marginBottom: '24px' }}>
                      <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Maximum Delivery Radius</p>
                      <p style={{ fontSize: '48px', fontWeight: '800' }}>{result.maxDistance} km</p>
                      <p style={{ fontSize: '13px', opacity: 0.9 }}>{result.deliveryTime} mins delivery time available</p>
                    </div>

                    {result.isQualityRisk && (
                      <div style={{ padding: '12px 16px', backgroundColor: '#fef3c7', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', color: '#92400e' }}>
                        ⚠️ <strong>Quality Alert:</strong> {result.food.name} is best delivered within {result.food.maxDeliveryTime} mins
                      </div>
                    )}

                    {/* Zones */}
                    <div style={{ marginBottom: '20px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Recommended Zones</p>
                      {result.zones.map((zone, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', borderBottom: '1px solid #e5e7eb' }}>
                          <div>
                            <p style={{ fontWeight: '600', color: '#111827' }}>{zone.name}</p>
                            <p style={{ fontSize: '12px', color: '#6b7280' }}>{zone.radius.toFixed(1)} km • ~{zone.time} min delivery</p>
                          </div>
                          <span style={{ padding: '4px 12px', backgroundColor: zone.deliveryFee === 0 ? '#dcfce7' : '#f3f4f6', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
                            {zone.deliveryFee === 0 ? 'Free' : `+₹${zone.deliveryFee}`}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', fontSize: '13px', color: '#6b7280' }}>
                      <p><strong>Effective Speed:</strong> {result.effectiveSpeed.toFixed(0)} km/h (with traffic)</p>
                      <p><strong>Round Trip Time:</strong> ~{result.roundTripTime} mins</p>
                      <p><strong>Orders per Rider/Hour:</strong> ~{result.ordersPerHour}</p>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    <p>Enter parameters to calculate delivery radius</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '60px 20px', backgroundColor: '#10b981', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Manage Delivery Orders with DineOpen</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px' }}>Integrated Swiggy & Zomato orders, rider tracking, and zone management.</p>
            <Link href="/for/cloud-kitchens" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#10b981', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
              POS for Cloud Kitchens
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

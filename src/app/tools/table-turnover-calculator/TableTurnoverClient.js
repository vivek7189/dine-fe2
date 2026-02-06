'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';

export default function TableTurnoverClient() {
  const [totalSeats, setTotalSeats] = useState('50');
  const [avgMealTime, setAvgMealTime] = useState('45');
  const [operatingHours, setOperatingHours] = useState('10');
  const [avgCheck, setAvgCheck] = useState('500');
  const [occupancy, setOccupancy] = useState('70');

  const calculate = () => {
    const seats = parseInt(totalSeats) || 0;
    const mealTime = parseInt(avgMealTime) || 45;
    const hours = parseInt(operatingHours) || 10;
    const check = parseFloat(avgCheck) || 0;
    const occ = parseInt(occupancy) || 70;

    if (seats <= 0 || hours <= 0) return null;

    const turnsPerDay = (hours * 60) / mealTime;
    const maxCoversPerDay = seats * turnsPerDay;
    const actualCovers = Math.floor(maxCoversPerDay * (occ / 100));
    const dailyRevenue = actualCovers * check;
    const monthlyRevenue = dailyRevenue * 30;

    // Improvement scenarios
    const scenarios = [
      { name: 'Current', turns: turnsPerDay, covers: actualCovers, revenue: dailyRevenue },
      { name: 'Reduce 10 min', turns: (hours * 60) / (mealTime - 10), covers: Math.floor(seats * ((hours * 60) / (mealTime - 10)) * (occ / 100)), revenue: 0 },
      { name: '80% Occupancy', turns: turnsPerDay, covers: Math.floor(maxCoversPerDay * 0.80), revenue: 0 },
      { name: 'Both', turns: (hours * 60) / (mealTime - 10), covers: Math.floor(seats * ((hours * 60) / (mealTime - 10)) * 0.80), revenue: 0 },
    ];
    scenarios.forEach(s => { s.revenue = s.covers * check; });

    return {
      seats,
      turnsPerDay: turnsPerDay.toFixed(1),
      maxCoversPerDay,
      actualCovers,
      dailyRevenue,
      monthlyRevenue,
      revenuePerSeat: dailyRevenue / seats,
      scenarios,
    };
  };

  const result = calculate();

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Table Turnover Calculator</h1>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>
              Maximize revenue by optimizing table turnover and seating efficiency
            </p>
          </div>
        </section>

        {/* Calculator */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
              {/* Input */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Restaurant Details</h3>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Total Seats
                  </label>
                  <input
                    type="number"
                    value={totalSeats}
                    onChange={(e) => setTotalSeats(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Average Meal Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={avgMealTime}
                    onChange={(e) => setAvgMealTime(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}
                  />
                  <div style={{ display: 'flex', gap: '4px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {[30, 45, 60, 90].map(t => (
                      <button
                        key={t}
                        onClick={() => setAvgMealTime(t.toString())}
                        style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: avgMealTime === t.toString() ? '#0ea5e9' : '#f3f4f6', color: avgMealTime === t.toString() ? 'white' : '#6b7280', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        {t} min
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Operating Hours/Day
                  </label>
                  <input
                    type="number"
                    value={operatingHours}
                    onChange={(e) => setOperatingHours(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Average Check Value (₹)
                  </label>
                  <input
                    type="number"
                    value={avgCheck}
                    onChange={(e) => setAvgCheck(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Average Occupancy: {occupancy}%
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    value={occupancy}
                    onChange={(e) => setOccupancy(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Results */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Revenue Analysis</h3>

                {result ? (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                      <div style={{ padding: '20px', backgroundColor: '#0ea5e915', borderRadius: '12px', textAlign: 'center' }}>
                        <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Table Turns/Day</p>
                        <p style={{ fontSize: '28px', fontWeight: '800', color: '#0ea5e9' }}>{result.turnsPerDay}</p>
                      </div>
                      <div style={{ padding: '20px', backgroundColor: '#22c55e15', borderRadius: '12px', textAlign: 'center' }}>
                        <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Daily Covers</p>
                        <p style={{ fontSize: '28px', fontWeight: '800', color: '#22c55e' }}>{result.actualCovers}</p>
                      </div>
                    </div>

                    <div style={{ padding: '24px', background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', borderRadius: '12px', color: 'white', textAlign: 'center', marginBottom: '24px' }}>
                      <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Estimated Monthly Revenue</p>
                      <p style={{ fontSize: '36px', fontWeight: '800' }}>₹{(result.monthlyRevenue / 100000).toFixed(1)}L</p>
                      <p style={{ fontSize: '13px', opacity: 0.9 }}>₹{result.dailyRevenue.toLocaleString()}/day</p>
                    </div>

                    {/* Improvement Scenarios */}
                    <div style={{ marginBottom: '20px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Improvement Scenarios</p>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#f3f4f6' }}>
                              <th style={{ padding: '10px', textAlign: 'left' }}>Scenario</th>
                              <th style={{ padding: '10px', textAlign: 'center' }}>Turns</th>
                              <th style={{ padding: '10px', textAlign: 'center' }}>Covers</th>
                              <th style={{ padding: '10px', textAlign: 'right' }}>Revenue</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.scenarios.map((s, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: i === 0 ? '#f9fafb' : 'white' }}>
                                <td style={{ padding: '10px', fontWeight: i === 0 ? '600' : '400' }}>{s.name}</td>
                                <td style={{ padding: '10px', textAlign: 'center' }}>{s.turns.toFixed(1)}</td>
                                <td style={{ padding: '10px', textAlign: 'center' }}>{s.covers}</td>
                                <td style={{ padding: '10px', textAlign: 'right', fontWeight: '600', color: s.revenue > result.dailyRevenue ? '#22c55e' : '#111827' }}>
                                  ₹{s.revenue.toLocaleString()}
                                  {s.revenue > result.dailyRevenue && (
                                    <span style={{ fontSize: '11px', marginLeft: '4px' }}>
                                      (+{Math.round(((s.revenue - result.dailyRevenue) / result.dailyRevenue) * 100)}%)
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', fontSize: '13px', color: '#6b7280' }}>
                      <p><strong>Revenue per seat:</strong> ₹{result.revenuePerSeat.toFixed(0)}/day</p>
                      <p><strong>Max theoretical covers:</strong> {result.maxCoversPerDay} (at 100% occupancy)</p>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    <p>Enter details to calculate revenue potential</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '60px 20px', backgroundColor: '#0ea5e9', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Track Table Turnover in Real-Time</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px' }}>DineOpen shows live table status and turnover analytics.</p>
            <Link href="/products/table-management" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#0ea5e9', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
              Explore Table Management
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

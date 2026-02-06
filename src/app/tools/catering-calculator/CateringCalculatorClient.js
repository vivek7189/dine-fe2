'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';

export default function CateringCalculatorClient() {
  const [guests, setGuests] = useState('100');
  const [mealType, setMealType] = useState('buffet');
  const [menuTier, setMenuTier] = useState('standard');
  const [serviceStyle, setServiceStyle] = useState('self');
  const [extras, setExtras] = useState({ dessert: true, drinks: true, starters: true, liveCounter: false });

  const mealTypes = {
    buffet: { name: 'Buffet', baseMultiplier: 1 },
    plated: { name: 'Plated/Served', baseMultiplier: 1.4 },
    stations: { name: 'Food Stations', baseMultiplier: 1.2 },
    cocktail: { name: 'Cocktail/Finger Food', baseMultiplier: 0.7 },
  };

  const menuTiers = {
    basic: { name: 'Basic', pricePerHead: 400, items: '2 Starters + 3 Main + 2 Dessert' },
    standard: { name: 'Standard', pricePerHead: 650, items: '4 Starters + 5 Main + 3 Dessert' },
    premium: { name: 'Premium', pricePerHead: 1000, items: '6 Starters + 8 Main + 4 Dessert' },
    luxury: { name: 'Luxury', pricePerHead: 1800, items: 'Unlimited + Live Counters + Imported' },
  };

  const serviceStyles = {
    self: { name: 'Self Service', multiplier: 1, staff: 'Minimal staff' },
    assisted: { name: 'Assisted Service', multiplier: 1.15, staff: '1 staff per 25 guests' },
    full: { name: 'Full Service', multiplier: 1.35, staff: '1 staff per 10 guests' },
  };

  const extraItems = {
    starters: { name: 'Welcome Starters', perHead: 80 },
    drinks: { name: 'Soft Drinks/Mocktails', perHead: 100 },
    dessert: { name: 'Dessert Counter', perHead: 120 },
    liveCounter: { name: 'Live Cooking Counter', perHead: 200 },
  };

  const calculate = () => {
    const guestCount = parseInt(guests) || 0;
    if (guestCount <= 0) return null;

    const tier = menuTiers[menuTier];
    const meal = mealTypes[mealType];
    const service = serviceStyles[serviceStyle];

    let perHead = tier.pricePerHead * meal.baseMultiplier * service.multiplier;

    // Add extras
    let extrasTotal = 0;
    Object.entries(extras).forEach(([key, enabled]) => {
      if (enabled && extraItems[key]) {
        extrasTotal += extraItems[key].perHead;
      }
    });
    perHead += extrasTotal;

    // Volume discount
    let discount = 0;
    if (guestCount >= 500) discount = 0.15;
    else if (guestCount >= 300) discount = 0.10;
    else if (guestCount >= 150) discount = 0.05;

    const subtotal = perHead * guestCount;
    const discountAmount = subtotal * discount;
    const afterDiscount = subtotal - discountAmount;
    const gst = afterDiscount * 0.05; // 5% GST on catering
    const total = afterDiscount + gst;

    const staffNeeded = serviceStyle === 'full' ? Math.ceil(guestCount / 10) :
                        serviceStyle === 'assisted' ? Math.ceil(guestCount / 25) :
                        Math.ceil(guestCount / 50);

    return {
      perHead: Math.round(perHead),
      guestCount,
      subtotal,
      discount,
      discountAmount,
      afterDiscount,
      gst,
      total,
      staffNeeded,
      extrasTotal,
    };
  };

  const result = calculate();

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Catering Quote Calculator</h1>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>
              Generate professional catering quotes based on menu, guests, and service style
            </p>
          </div>
        </section>

        {/* Calculator */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
              {/* Input */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Event Details</h3>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Number of Guests
                  </label>
                  <input
                    type="number"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    placeholder="e.g., 150"
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Meal Type
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {Object.entries(mealTypes).map(([key, val]) => (
                      <button
                        key={key}
                        onClick={() => setMealType(key)}
                        style={{
                          padding: '12px',
                          backgroundColor: mealType === key ? '#f59e0b' : '#f3f4f6',
                          color: mealType === key ? 'white' : '#374151',
                          border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px'
                        }}
                      >
                        {val.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Menu Tier
                  </label>
                  {Object.entries(menuTiers).map(([key, val]) => (
                    <label
                      key={key}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px',
                        backgroundColor: menuTier === key ? '#f59e0b15' : '#f9fafb',
                        border: menuTier === key ? '2px solid #f59e0b' : '1px solid #e5e7eb',
                        borderRadius: '8px', cursor: 'pointer', marginBottom: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input type="radio" checked={menuTier === key} onChange={() => setMenuTier(key)} />
                        <div>
                          <p style={{ fontWeight: '600', fontSize: '14px' }}>{val.name}</p>
                          <p style={{ fontSize: '11px', color: '#6b7280' }}>{val.items}</p>
                        </div>
                      </div>
                      <span style={{ fontWeight: '700', color: '#f59e0b' }}>₹{val.pricePerHead}</span>
                    </label>
                  ))}
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Service Style
                  </label>
                  <select
                    value={serviceStyle}
                    onChange={(e) => setServiceStyle(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                  >
                    {Object.entries(serviceStyles).map(([key, val]) => (
                      <option key={key} value={key}>{val.name} ({val.staff})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Add-ons
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {Object.entries(extraItems).map(([key, val]) => (
                      <label
                        key={key}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px',
                          backgroundColor: extras[key] ? '#f59e0b20' : '#f3f4f6',
                          border: extras[key] ? '1px solid #f59e0b' : '1px solid #e5e7eb',
                          borderRadius: '20px', cursor: 'pointer', fontSize: '13px'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={extras[key]}
                          onChange={(e) => setExtras({ ...extras, [key]: e.target.checked })}
                        />
                        {val.name} (+₹{val.perHead})
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quote */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Quote Summary</h3>

                {result ? (
                  <>
                    <div style={{ padding: '24px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', borderRadius: '12px', color: 'white', textAlign: 'center', marginBottom: '24px' }}>
                      <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>Per Head Cost</p>
                      <p style={{ fontSize: '42px', fontWeight: '800' }}>₹{result.perHead}</p>
                      <p style={{ fontSize: '13px', opacity: 0.9 }}>for {result.guestCount} guests</p>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
                        <span style={{ color: '#6b7280', fontSize: '14px' }}>Subtotal</span>
                        <span style={{ fontWeight: '600' }}>₹{result.subtotal.toLocaleString()}</span>
                      </div>
                      {result.discount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e5e7eb', color: '#22c55e' }}>
                          <span style={{ fontSize: '14px' }}>Volume Discount ({result.discount * 100}%)</span>
                          <span style={{ fontWeight: '600' }}>-₹{result.discountAmount.toLocaleString()}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
                        <span style={{ color: '#6b7280', fontSize: '14px' }}>GST (5%)</span>
                        <span style={{ fontWeight: '600' }}>₹{result.gst.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0' }}>
                        <span style={{ fontWeight: '700', fontSize: '16px' }}>Total Quote</span>
                        <span style={{ fontWeight: '800', fontSize: '24px', color: '#f59e0b' }}>₹{Math.round(result.total).toLocaleString()}</span>
                      </div>
                    </div>

                    <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', fontSize: '13px' }}>
                      <p style={{ marginBottom: '8px' }}><strong>Staff Required:</strong> ~{result.staffNeeded} service staff</p>
                      <p style={{ marginBottom: '8px' }}><strong>Menu:</strong> {menuTiers[menuTier].items}</p>
                      <p><strong>Service:</strong> {serviceStyles[serviceStyle].name}</p>
                    </div>

                    <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#fef3c7', borderRadius: '8px', fontSize: '12px', color: '#92400e' }}>
                      <strong>Note:</strong> This is an estimate. Actual prices may vary based on location, date, and specific requirements.
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    <p>Enter guest count to generate quote</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '60px 20px', backgroundColor: '#f59e0b', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Manage Catering Orders with DineOpen</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px' }}>Event calendar, custom menus, and payment tracking for caterers.</p>
            <Link href="/for/catering" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#f59e0b', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
              POS for Caterers
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaClipboardCheck, FaRupeeSign, FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';

export default function FSSAIFeeCalculatorClient() {
  const [turnover, setTurnover] = useState('');
  const [years, setYears] = useState(1);
  const [businessType, setBusinessType] = useState('restaurant');

  const getTurnoverValue = () => parseFloat(turnover) || 0;

  const getLicenseType = () => {
    const t = getTurnoverValue();
    if (t <= 12) return 'basic';
    if (t <= 2000) return 'state';
    return 'central';
  };

  const licenseDetails = {
    basic: {
      name: 'Basic Registration',
      turnoverRange: 'Up to ₹12 Lakh/year',
      feePerYear: 100,
      processingTime: '7-15 days',
      validity: '1-5 years',
      description: 'For small food businesses, petty retailers, and street vendors',
      color: '#059669',
    },
    state: {
      name: 'State License',
      turnoverRange: '₹12 Lakh - ₹20 Crore/year',
      feePerYear: 2000,
      lateFeeMultiplier: 5000, // for turnover > 20L
      processingTime: '30-60 days',
      validity: '1-5 years',
      description: 'For medium-sized food businesses operating within one state',
      color: '#0891b2',
    },
    central: {
      name: 'Central License',
      turnoverRange: 'Above ₹20 Crore/year',
      feePerYear: 7500,
      processingTime: '30-60 days',
      validity: '1-5 years',
      description: 'For large businesses, importers, and multi-state operations',
      color: '#7c3aed',
    },
  };

  const calculateFee = () => {
    const licenseType = getLicenseType();
    const license = licenseDetails[licenseType];
    let baseFee = license.feePerYear;

    // State license has variable fee based on turnover
    if (licenseType === 'state') {
      const t = getTurnoverValue();
      if (t > 20) baseFee = 5000; // Above 20L
    }

    const totalFee = baseFee * years;
    const consultantFee = licenseType === 'basic' ? 1500 : licenseType === 'state' ? 3500 : 7500;

    return {
      licenseType,
      baseFee,
      totalFee,
      consultantFee,
      grandTotal: totalFee + consultantFee,
    };
  };

  const result = calculateFee();
  const license = licenseDetails[result.licenseType];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>FSSAI License Fee Calculator</h1>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>
              Calculate the exact FSSAI license fee for your food business based on annual turnover.
            </p>
          </div>
        </section>

        {/* Calculator */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
              {/* Input */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Business Details</h3>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Annual Turnover (in Lakhs ₹)
                  </label>
                  <input
                    type="number"
                    value={turnover}
                    onChange={(e) => setTurnover(e.target.value)}
                    placeholder="e.g., 50 for ₹50 Lakh"
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}
                  />
                  <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Enter 50 for ₹50 Lakh, 200 for ₹2 Crore</p>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    License Duration (Years)
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3, 5].map(y => (
                      <button
                        key={y}
                        onClick={() => setYears(y)}
                        style={{
                          flex: 1, padding: '12px',
                          backgroundColor: years === y ? '#0891b2' : '#f3f4f6',
                          color: years === y ? 'white' : '#374151',
                          border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
                        }}
                      >
                        {y} Year{y > 1 ? 's' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Business Type
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                  >
                    <option value="restaurant">Restaurant / Cafe</option>
                    <option value="cloudkitchen">Cloud Kitchen</option>
                    <option value="catering">Catering Service</option>
                    <option value="sweetshop">Sweet Shop / Bakery</option>
                    <option value="foodtruck">Food Truck / Stall</option>
                    <option value="manufacturer">Food Manufacturer</option>
                  </select>
                </div>
              </div>

              {/* Result */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>License Details</h3>

                {/* License Type Badge */}
                <div style={{ padding: '20px', backgroundColor: `${license.color}15`, borderRadius: '12px', marginBottom: '20px', borderLeft: `4px solid ${license.color}` }}>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>You Need</p>
                  <p style={{ fontSize: '22px', fontWeight: '800', color: license.color }}>{license.name}</p>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{license.turnoverRange}</p>
                </div>

                {/* Fee Breakdown */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>Government Fee ({years} year{years > 1 ? 's' : ''})</span>
                    <span style={{ fontWeight: '600' }}>₹{result.totalFee.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>Consultant Fee (approx)</span>
                    <span style={{ fontWeight: '600' }}>₹{result.consultantFee.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                    <span style={{ fontWeight: '700', fontSize: '16px' }}>Estimated Total</span>
                    <span style={{ fontWeight: '800', fontSize: '20px', color: license.color }}>₹{result.grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Additional Info */}
                <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', fontSize: '13px', color: '#6b7280' }}>
                  <p style={{ marginBottom: '8px' }}><strong>Processing Time:</strong> {license.processingTime}</p>
                  <p><strong>Validity:</strong> {license.validity}</p>
                </div>
              </div>
            </div>

            {/* License Types Comparison */}
            <div style={{ marginTop: '48px', backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>FSSAI License Types Comparison</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f3f4f6' }}>
                      <th style={{ padding: '14px', textAlign: 'left', fontSize: '13px' }}>License Type</th>
                      <th style={{ padding: '14px', textAlign: 'center', fontSize: '13px' }}>Turnover</th>
                      <th style={{ padding: '14px', textAlign: 'center', fontSize: '13px' }}>Fee/Year</th>
                      <th style={{ padding: '14px', textAlign: 'center', fontSize: '13px' }}>Processing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(licenseDetails).map(([key, val]) => (
                      <tr key={key} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: result.licenseType === key ? `${val.color}10` : 'white' }}>
                        <td style={{ padding: '14px', fontWeight: '600', color: val.color }}>{val.name}</td>
                        <td style={{ padding: '14px', textAlign: 'center', fontSize: '14px' }}>{val.turnoverRange}</td>
                        <td style={{ padding: '14px', textAlign: 'center', fontSize: '14px' }}>₹{val.feePerYear.toLocaleString()}</td>
                        <td style={{ padding: '14px', textAlign: 'center', fontSize: '14px' }}>{val.processingTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '60px 20px', backgroundColor: '#0891b2', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Need Help with FSSAI Registration?</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px' }}>Read our complete guide on FSSAI license process, documents, and application.</p>
            <Link href="/resources/fssai-guide" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#0891b2', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
              Read FSSAI Guide
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

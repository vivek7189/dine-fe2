'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

export default function FireSafetyClient() {
  const equipment = [
    'Fire extinguishers (ABC type) - 1 per 200 sq ft',
    'Smoke detectors in kitchen and dining areas',
    'Emergency exit signs (illuminated)',
    'Fire alarm system',
    'Fire exit doors (outward opening)',
    'Fire-resistant kitchen hood and duct',
    'LPG leak detector (for gas kitchens)',
    'First aid kit',
  ];

  const process = [
    { step: 1, title: 'Apply Online', desc: 'Submit application on state fire department portal' },
    { step: 2, title: 'Document Submission', desc: 'Upload building plan, equipment list, NOC from building owner' },
    { step: 3, title: 'Pay Fees', desc: 'Fee based on restaurant area (₹2,000-10,000)' },
    { step: 4, title: 'Inspection', desc: 'Fire officer visits to verify equipment and exits' },
    { step: 5, title: 'Get NOC', desc: 'Certificate issued if compliant (valid 1-3 years)' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <div style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '42px', fontWeight: '800', marginBottom: '16px' }}>Fire Safety NOC for Restaurants</h1>
            <p style={{ fontSize: '20px', opacity: 0.95 }}>Requirements, equipment & inspection process</p>
          </div>
        </div>

        <div style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>Required Fire Safety Equipment</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {equipment.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                  <FaCheckCircle style={{ color: '#dc2626', flexShrink: 0 }} />
                  <span style={{ color: '#374151' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '60px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>NOC Process</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {process.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: '#dc2626', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', flexShrink: 0 }}>{item.step}</div>
                  <div style={{ flex: 1, padding: '12px 20px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{item.title}</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '40px 20px', backgroundColor: '#fef2f2' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <FaExclamationTriangle style={{ color: '#dc2626', fontSize: '24px', flexShrink: 0 }} />
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#991b1b', marginBottom: '8px' }}>Penalties</h3>
              <p style={{ color: '#7f1d1d' }}>Operating without Fire NOC can result in closure by authorities and fines up to ₹1 lakh. Insurance claims may be rejected in case of fire incidents.</p>
            </div>
          </div>
        </div>

        <div style={{ padding: '60px 20px', textAlign: 'center', background: 'linear-gradient(135deg, #111827 0%, #374151 100%)', color: 'white' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Stay Compliant with DineOpen</h2>
            <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '24px' }}>Track all your licenses, get expiry reminders, and stay audit-ready.</p>
            <Link href="https://app.dineopen.com/register" style={{ display: 'inline-block', padding: '14px 28px', backgroundColor: '#dc2626', color: 'white', borderRadius: '8px', fontWeight: '600', textDecoration: 'none' }}>Start Free Trial</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

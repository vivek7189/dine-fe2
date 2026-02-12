'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaCalendarAlt, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

export default function GstFilingClient() {
  const gstRates = [
    { item: 'Non-AC restaurants (dine-in)', rate: '5%', itc: 'No ITC' },
    { item: 'AC restaurants (dine-in)', rate: '5%', itc: 'No ITC' },
    { item: 'Restaurants in hotels (room ≤₹7,500)', rate: '5%', itc: 'No ITC' },
    { item: 'Restaurants in hotels (room >₹7,500)', rate: '18%', itc: 'ITC Available' },
    { item: 'Outdoor catering', rate: '5%', itc: 'No ITC' },
    { item: 'Cloud kitchens', rate: '5%', itc: 'No ITC' },
  ];

  const timeline = [
    { date: '11th', task: 'GSTR-1 Due', desc: 'Report outward supplies for previous month' },
    { date: '20th', task: 'GSTR-3B Due', desc: 'File summary return and pay tax' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <div style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '42px', fontWeight: '800', marginBottom: '16px' }}>GST Filing for Restaurants</h1>
            <p style={{ fontSize: '20px', opacity: 0.95 }}>Monthly compliance guide - GSTR-1, GSTR-3B, rates & ITC</p>
          </div>
        </div>

        <div style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>GST Rates for Restaurants</h2>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#7c3aed', color: 'white' }}>
                    <th style={{ padding: '16px', textAlign: 'left' }}>Restaurant Type</th>
                    <th style={{ padding: '16px', textAlign: 'center' }}>GST Rate</th>
                    <th style={{ padding: '16px', textAlign: 'center' }}>ITC Status</th>
                  </tr>
                </thead>
                <tbody>
                  {gstRates.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '16px', color: '#374151' }}>{item.item}</td>
                      <td style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#7c3aed' }}>{item.rate}</td>
                      <td style={{ padding: '16px', textAlign: 'center', color: item.itc === 'No ITC' ? '#dc2626' : '#059669' }}>{item.itc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={{ padding: '60px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>Monthly Filing Timeline</h2>
            <div style={{ display: 'grid', gap: '20px' }}>
              {timeline.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '20px', alignItems: 'center', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                  <div style={{ width: '60px', height: '60px', backgroundColor: '#7c3aed', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700' }}>{item.date}</div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>{item.task}</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '60px 20px', textAlign: 'center', background: 'linear-gradient(135deg, #111827 0%, #374151 100%)', color: 'white' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Automate GST Compliance</h2>
            <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '24px' }}>DineOpen generates GST-compliant bills and GSTR-1 ready reports automatically.</p>
            <Link href="https://app.dineopen.com/register" style={{ display: 'inline-block', padding: '14px 28px', backgroundColor: '#7c3aed', color: 'white', borderRadius: '8px', fontWeight: '600', textDecoration: 'none' }}>Start Free Trial</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

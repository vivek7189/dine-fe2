'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaCheckCircle } from 'react-icons/fa';

export default function ShopEstablishmentClient() {
  const stateWise = [
    { state: 'Maharashtra', fee: '₹200-500', validity: '1 year' },
    { state: 'Delhi', fee: '₹100-300', validity: 'Lifetime' },
    { state: 'Karnataka', fee: '₹200-500', validity: '5 years' },
    { state: 'Tamil Nadu', fee: '₹150-400', validity: '1 year' },
    { state: 'Gujarat', fee: '₹200-500', validity: '5 years' },
  ];

  const documents = ['Identity proof', 'Address proof of premises', 'Rent agreement', 'PAN card', 'Photographs', 'Employee list'];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <div style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '42px', fontWeight: '800', marginBottom: '16px' }}>Shop & Establishment Act</h1>
            <p style={{ fontSize: '20px', opacity: 0.95 }}>State-wise registration guide for restaurants</p>
          </div>
        </div>

        <div style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>State-wise Details</h2>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#2563eb', color: 'white' }}>
                    <th style={{ padding: '16px', textAlign: 'left' }}>State</th>
                    <th style={{ padding: '16px', textAlign: 'center' }}>Fee</th>
                    <th style={{ padding: '16px', textAlign: 'center' }}>Validity</th>
                  </tr>
                </thead>
                <tbody>
                  {stateWise.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '16px', fontWeight: '500' }}>{item.state}</td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>{item.fee}</td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>{item.validity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={{ padding: '60px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>Documents Required</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {documents.map((doc, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                  <FaCheckCircle style={{ color: '#2563eb' }} />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '60px 20px', textAlign: 'center', background: 'linear-gradient(135deg, #111827 0%, #374151 100%)', color: 'white' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Manage Staff Compliance</h2>
            <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '24px' }}>Track employee attendance, working hours, and generate compliance reports.</p>
            <Link href="https://app.dineopen.com/register" style={{ display: 'inline-block', padding: '14px 28px', backgroundColor: '#2563eb', color: 'white', borderRadius: '8px', fontWeight: '600', textDecoration: 'none' }}>Start Free Trial</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

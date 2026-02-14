'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaCheckCircle, FaFileAlt, FaRupeeSign, FaClock, FaExclamationTriangle, FaArrowRight } from 'react-icons/fa';

export default function FssaiRegistrationClient() {
  const licenseTypes = [
    {
      name: 'Basic Registration',
      turnover: 'Up to ₹12 Lakhs/year',
      fee: '₹100/year',
      validity: '1-5 years',
      for: 'Small eateries, food stalls, home-based food businesses',
    },
    {
      name: 'State License',
      turnover: '₹12 Lakhs - ₹20 Crores/year',
      fee: '₹2,000-5,000/year',
      validity: '1-5 years',
      for: 'Most restaurants, cafes, cloud kitchens, medium establishments',
    },
    {
      name: 'Central License',
      turnover: 'Above ₹20 Crores/year',
      fee: '₹7,500/year',
      validity: '1-5 years',
      for: 'Large chains, import/export, multi-state operations',
    },
  ];

  const documents = [
    'Photo ID proof (Aadhaar/PAN/Voter ID)',
    'Address proof of business premises',
    'Passport size photograph',
    'Food Safety Management Plan (for State/Central)',
    'List of food products to be handled',
    'NOC from Municipality/Panchayat',
    'Partnership deed/Company registration (if applicable)',
    'Water test report (for manufacturing)',
  ];

  const steps = [
    { step: 1, title: 'Create Account', desc: 'Register on FSSAI Food Licensing portal (foscos.fssai.gov.in)' },
    { step: 2, title: 'Choose License Type', desc: 'Select Basic, State, or Central based on turnover' },
    { step: 3, title: 'Fill Application', desc: 'Enter business details, food categories, premises info' },
    { step: 4, title: 'Upload Documents', desc: 'Upload all required documents in specified format' },
    { step: 5, title: 'Pay Fees', desc: 'Pay license fee online through portal' },
    { step: 6, title: 'Inspection', desc: 'Food Safety Officer may inspect premises (State/Central)' },
    { step: 7, title: 'Get License', desc: 'Download license after approval (15-60 days)' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '42px', fontWeight: '800', marginBottom: '16px' }}>
              FSSAI Registration for Restaurants
            </h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '24px' }}>
              Complete guide to food license registration in India - types, fees, documents & process
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '12px 20px', borderRadius: '8px' }}>
              <FaClock />
              <span>Updated for 2024-2025</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div style={{ backgroundColor: 'white', padding: '40px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="#types" style={{ padding: '12px 24px', backgroundColor: '#f3f4f6', borderRadius: '8px', color: '#111827', textDecoration: 'none', fontWeight: '500' }}>License Types</Link>
            <Link href="#documents" style={{ padding: '12px 24px', backgroundColor: '#f3f4f6', borderRadius: '8px', color: '#111827', textDecoration: 'none', fontWeight: '500' }}>Documents Required</Link>
            <Link href="#process" style={{ padding: '12px 24px', backgroundColor: '#f3f4f6', borderRadius: '8px', color: '#111827', textDecoration: 'none', fontWeight: '500' }}>Registration Process</Link>
            <Link href="/tools/fssai-fee-calculator" style={{ padding: '12px 24px', backgroundColor: '#059669', borderRadius: '8px', color: 'white', textDecoration: 'none', fontWeight: '500' }}>Fee Calculator →</Link>
          </div>
        </div>

        {/* License Types */}
        <div id="types" style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>
              Types of FSSAI License
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {licenseTypes.map((license, idx) => (
                <div key={idx} style={{ padding: '28px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: idx === 1 ? '2px solid #059669' : '1px solid #e5e7eb' }}>
                  {idx === 1 && <div style={{ backgroundColor: '#059669', color: 'white', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', marginBottom: '12px', display: 'inline-block' }}>Most Common</div>}
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>{license.name}</h3>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>Annual Turnover</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>{license.turnover}</div>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>License Fee</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#059669' }}>{license.fee}</div>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>Validity</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>{license.validity}</div>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '8px', marginTop: '16px' }}>
                    <div style={{ fontSize: '13px', color: '#065f46' }}>{license.for}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Documents */}
        <div id="documents" style={{ padding: '60px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>
              Documents Required
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {documents.map((doc, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                  <FaCheckCircle style={{ color: '#059669', flexShrink: 0 }} />
                  <span style={{ color: '#374151' }}>{doc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Process */}
        <div id="process" style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>
              Step-by-Step Registration Process
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {steps.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: '#059669', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', flexShrink: 0 }}>
                    {item.step}
                  </div>
                  <div style={{ flex: 1, padding: '12px 20px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{item.title}</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Warning */}
        <div style={{ padding: '40px 20px', backgroundColor: '#fef2f2' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <FaExclamationTriangle style={{ color: '#dc2626', fontSize: '24px', flexShrink: 0 }} />
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#991b1b', marginBottom: '8px' }}>Penalties for Non-Compliance</h3>
              <p style={{ color: '#7f1d1d', lineHeight: 1.6 }}>
                Operating without FSSAI license can result in fines up to ₹5 lakhs and imprisonment up to 6 months.
                Always display your FSSAI license number on bills, signage, and food packaging.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: '60px 20px', textAlign: 'center', background: 'linear-gradient(135deg, #111827 0%, #374151 100%)', color: 'white' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>
              Stay FSSAI Compliant with DineOpen
            </h2>
            <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '24px' }}>
              DineOpen automatically displays your FSSAI license on bills, tracks expiry dates, and keeps you audit-ready.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="https://dineopen.com/login" style={{ padding: '14px 28px', backgroundColor: '#059669', color: 'white', borderRadius: '8px', fontWeight: '600', textDecoration: 'none' }}>
                Start Free Trial
              </Link>
              <Link href="/tools/fssai-fee-calculator" style={{ padding: '14px 28px', backgroundColor: 'transparent', color: 'white', border: '2px solid white', borderRadius: '8px', fontWeight: '600', textDecoration: 'none' }}>
                Calculate FSSAI Fees
              </Link>
            </div>
          </div>
        </div>

        {/* Related */}
        <div style={{ padding: '40px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>Related Compliance Guides</h3>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/resources/gst-restaurants" style={{ padding: '10px 20px', backgroundColor: '#f3f4f6', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>GST for Restaurants</Link>
              <Link href="/resources/restaurant-licenses-india" style={{ padding: '10px 20px', backgroundColor: '#f3f4f6', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>Restaurant Licenses India</Link>
              <Link href="/resources/shop-establishment-act" style={{ padding: '10px 20px', backgroundColor: '#f3f4f6', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>Shop & Establishment Act</Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

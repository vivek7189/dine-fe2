'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaCheckCircle, FaFileAlt, FaClipboardCheck, FaBuilding, FaGlobe, FaExclamationTriangle, FaArrowRight } from 'react-icons/fa';

export default function FSSAIGuideClient() {
  const licenseTypes = [
    {
      type: 'Basic Registration',
      turnover: 'Up to ₹12 Lakh/year',
      validity: '1-5 years',
      fee: '₹100/year',
      suitable: 'Small eateries, food stalls, home-based food businesses',
      icon: <FaFileAlt />,
    },
    {
      type: 'State License',
      turnover: '₹12 Lakh - ₹20 Crore/year',
      validity: '1-5 years',
      fee: '₹2,000 - ₹5,000/year',
      suitable: 'Restaurants, cafes, medium-sized food businesses',
      icon: <FaBuilding />,
    },
    {
      type: 'Central License',
      turnover: 'Above ₹20 Crore/year',
      validity: '1-5 years',
      fee: '₹7,500/year',
      suitable: 'Large chains, importers, multi-state operations',
      icon: <FaGlobe />,
    },
  ];

  const documents = [
    { name: 'Form-B Application', required: true },
    { name: 'Photo ID (Aadhaar/PAN)', required: true },
    { name: 'Passport size photographs', required: true },
    { name: 'Proof of premises (Rent agreement/Ownership)', required: true },
    { name: 'Food Safety Management Plan', required: true },
    { name: 'List of food products to be handled', required: true },
    { name: 'Layout plan of the premises', required: true },
    { name: 'NOC from Municipality/Panchayat', required: true },
    { name: 'Water test report (for manufacturing)', required: false },
    { name: 'List of equipment used', required: false },
  ];

  const steps = [
    {
      number: '01',
      title: 'Determine Your License Type',
      description: 'Based on your annual turnover, decide if you need Basic Registration, State License, or Central License.',
      tip: 'Most new restaurants need State License (₹12L-20Cr turnover range).',
    },
    {
      number: '02',
      title: 'Create FSSAI Portal Account',
      description: 'Visit foscos.fssai.gov.in and create an account using your mobile number and email.',
      tip: 'Keep your phone handy for OTP verification.',
    },
    {
      number: '03',
      title: 'Fill Application Form',
      description: 'Complete Form-B with business details, food categories, and premises information.',
      tip: 'Be accurate about food categories - adding later requires modification.',
    },
    {
      number: '04',
      title: 'Upload Documents',
      description: 'Upload all required documents in PDF/JPG format. Ensure files are clear and readable.',
      tip: 'Keep file sizes under 1MB each for faster upload.',
    },
    {
      number: '05',
      title: 'Pay Fees Online',
      description: 'Pay the applicable fees via net banking, debit card, or credit card.',
      tip: 'Fees are non-refundable. Double-check application before paying.',
    },
    {
      number: '06',
      title: 'Inspection (if required)',
      description: 'For State/Central license, Food Safety Officer may visit for inspection.',
      tip: 'Keep premises clean and food safety practices in place.',
    },
    {
      number: '07',
      title: 'Receive License',
      description: 'License is issued within 60 days. Download from portal and display prominently.',
      tip: 'FSSAI license must be displayed at entrance of restaurant.',
    },
  ];

  const penalties = [
    { violation: 'Operating without license', penalty: 'Up to ₹5 Lakh fine + imprisonment up to 6 months' },
    { violation: 'Not displaying license', penalty: 'Up to ₹2 Lakh fine' },
    { violation: 'Selling unsafe food', penalty: 'Up to ₹10 Lakh fine + imprisonment up to 7 years' },
    { violation: 'False labeling', penalty: 'Up to ₹3 Lakh fine' },
    { violation: 'License expiry (operating with expired license)', penalty: 'Up to ₹5 Lakh fine' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: '24px', marginBottom: '24px' }}>
              <FaClipboardCheck /> Compliance Guide
            </div>
            <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.2 }}>
              FSSAI License for Restaurants
            </h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              Complete guide to food license registration in India. Types, documents, fees, process, and common mistakes to avoid.
            </p>
          </div>
        </section>

        {/* Quick Stats */}
        <section style={{ backgroundColor: 'white', padding: '48px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '32px', textAlign: 'center' }}>
            <div>
              <p style={{ fontSize: '42px', fontWeight: '800', color: '#0891b2', marginBottom: '4px' }}>60</p>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Days Processing Time</p>
            </div>
            <div>
              <p style={{ fontSize: '42px', fontWeight: '800', color: '#0891b2', marginBottom: '4px' }}>₹2-5K</p>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>State License Fee/Year</p>
            </div>
            <div>
              <p style={{ fontSize: '42px', fontWeight: '800', color: '#0891b2', marginBottom: '4px' }}>5</p>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Years Max Validity</p>
            </div>
            <div>
              <p style={{ fontSize: '42px', fontWeight: '800', color: '#0891b2', marginBottom: '4px' }}>100%</p>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Mandatory for Food Biz</p>
            </div>
          </div>
        </section>

        {/* License Types */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Types of FSSAI License
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {licenseTypes.map((license, idx) => (
                <div key={idx} style={{ padding: '32px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: idx === 1 ? '2px solid #0891b2' : '1px solid #e5e7eb' }}>
                  {idx === 1 && (
                    <div style={{ backgroundColor: '#0891b2', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', display: 'inline-block', marginBottom: '16px' }}>
                      Most Common for Restaurants
                    </div>
                  )}
                  <div style={{ width: '48px', height: '48px', backgroundColor: '#ecfeff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0891b2', fontSize: '20px', marginBottom: '16px' }}>
                    {license.icon}
                  </div>
                  <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{license.type}</h3>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                    <p><strong>Turnover:</strong> {license.turnover}</p>
                    <p><strong>Validity:</strong> {license.validity}</p>
                    <p><strong>Fee:</strong> {license.fee}</p>
                  </div>
                  <p style={{ fontSize: '14px', color: '#374151' }}><strong>Best for:</strong> {license.suitable}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Documents Required */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Documents Required
            </h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {documents.map((doc, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '10px' }}>
                  <FaCheckCircle style={{ color: doc.required ? '#0891b2' : '#9ca3af', flexShrink: 0 }} />
                  <span style={{ fontSize: '15px', color: '#374151' }}>{doc.name}</span>
                  {!doc.required && <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: 'auto' }}>Optional</span>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Step by Step Process */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Step-by-Step Registration Process
            </h2>
            <div style={{ display: 'grid', gap: '24px' }}>
              {steps.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '24px', padding: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: '#ecfeff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0891b2', fontSize: '18px', fontWeight: '800', flexShrink: 0 }}>
                    {step.number}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{step.title}</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>{step.description}</p>
                    <div style={{ padding: '10px 14px', backgroundColor: '#fef3c7', borderRadius: '8px', fontSize: '13px', color: '#92400e' }}>
                      <strong>Tip:</strong> {step.tip}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Penalties */}
        <section style={{ backgroundColor: '#fef2f2', padding: '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '32px' }}>
              <FaExclamationTriangle style={{ color: '#dc2626', fontSize: '28px' }} />
              <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827' }}>Penalties for Non-Compliance</h2>
            </div>
            <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', backgroundColor: 'white' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#fee2e2' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Violation</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Penalty</th>
                  </tr>
                </thead>
                <tbody>
                  {penalties.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '14px 16px', fontSize: '14px' }}>{item.violation}</td>
                      <td style={{ padding: '14px 16px', fontSize: '14px', color: '#dc2626', fontWeight: '500' }}>{item.penalty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>
              Ready to Start Your Restaurant?
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>
              Get your FSSAI license and set up your POS system to launch successfully.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/resources/startup-guide"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '18px 32px', backgroundColor: 'white', color: '#0891b2', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '16px' }}
              >
                Complete Startup Guide <FaArrowRight />
              </Link>
              <Link
                href="https://dineopen.com/login"
                style={{ display: 'inline-block', padding: '18px 32px', backgroundColor: 'transparent', border: '2px solid white', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '16px' }}
              >
                Try DineOpen Free
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaCheckCircle, FaPercent, FaFileInvoice, FaCalculator, FaQuestionCircle, FaArrowRight } from 'react-icons/fa';

export default function GSTRestaurantsClient() {
  const gstRates = [
    {
      rate: '5%',
      applicable: 'Standalone restaurants (no AC or no liquor)',
      itc: 'No ITC available',
      examples: 'Small eateries, dhabas, non-AC restaurants, takeaway outlets',
      highlight: true,
    },
    {
      rate: '5%',
      applicable: 'Restaurants inside hotels (room tariff < ₹7,500)',
      itc: 'No ITC available',
      examples: 'Budget hotel restaurants, mid-range hotel dining',
      highlight: false,
    },
    {
      rate: '18%',
      applicable: 'Restaurants inside hotels (room tariff ≥ ₹7,500)',
      itc: 'Full ITC available',
      examples: 'Luxury hotel restaurants, 5-star dining',
      highlight: false,
    },
    {
      rate: '18%',
      applicable: 'Outdoor catering services',
      itc: 'Full ITC available',
      examples: 'Wedding catering, corporate catering, event catering',
      highlight: false,
    },
    {
      rate: '5%',
      applicable: 'Cloud kitchens & food delivery',
      itc: 'No ITC available',
      examples: 'Delivery-only kitchens, aggregator-based food delivery',
      highlight: false,
    },
  ];

  const invoiceRequirements = [
    'Restaurant name, address, and GSTIN',
    'Invoice number (unique, sequential)',
    'Date of invoice',
    'Customer name (for B2B)',
    'HSN/SAC code for food items',
    'Taxable value and GST amount separately',
    'Place of supply',
    'Signature or digital signature',
  ];

  const filingSchedule = [
    { return: 'GSTR-1', due: '11th of next month', description: 'Outward supplies (sales)' },
    { return: 'GSTR-3B', due: '20th of next month', description: 'Summary return with tax payment' },
    { return: 'GSTR-9', due: '31st December', description: 'Annual return' },
    { return: 'GSTR-4', due: 'Quarterly', description: 'Composition scheme (if applicable)' },
  ];

  const faqs = [
    {
      question: 'Should I charge 5% or 18% GST at my restaurant?',
      answer: 'Most standalone restaurants charge 5% GST without ITC. If your restaurant is inside a hotel with room tariff ₹7,500 or above, you charge 18% with full ITC. For outdoor catering, it is always 18%.',
    },
    {
      question: 'What is Input Tax Credit (ITC) and should I care?',
      answer: 'ITC lets you offset GST paid on purchases against GST collected. At 5% GST, you cannot claim ITC. At 18%, you can. If your input costs are high (rent, equipment), 18% with ITC might be better.',
    },
    {
      question: 'Can I use composition scheme for my restaurant?',
      answer: 'Yes, if turnover is below ₹1.5 Crore. You pay 5% on turnover (1% for manufacturers). Simpler compliance but no ITC and cannot collect GST from customers.',
    },
    {
      question: 'How do I handle Swiggy/Zomato orders for GST?',
      answer: 'Aggregators deduct TCS (Tax Collected at Source) at 1%. You still charge 5% GST to customers. Reconcile TCS in your GSTR-3B.',
    },
    {
      question: 'Do I need to show GST separately on bills?',
      answer: 'Yes! GST must be shown separately on invoice. You can show inclusive price but breakup of taxable value and GST must be clear.',
    },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: '24px', marginBottom: '24px' }}>
              <FaPercent /> Tax Compliance Guide
            </div>
            <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.2 }}>
              GST for Restaurants in India
            </h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              Everything you need to know about GST - rates, input tax credit, composition scheme, invoicing, and filing. Updated for 2024.
            </p>
          </div>
        </section>

        {/* GST Rates Table */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              GST Rates for Different Restaurant Types
            </h2>
            <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', backgroundColor: 'white' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#7c3aed', color: 'white' }}>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600' }}>GST Rate</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Applicable To</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600' }}>ITC</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Examples</th>
                  </tr>
                </thead>
                <tbody>
                  {gstRates.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: item.highlight ? '#f5f3ff' : 'white' }}>
                      <td style={{ padding: '16px', textAlign: 'center', fontSize: '24px', fontWeight: '700', color: '#7c3aed' }}>{item.rate}</td>
                      <td style={{ padding: '16px', fontSize: '14px' }}>{item.applicable}</td>
                      <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', color: item.itc.includes('No') ? '#dc2626' : '#059669' }}>{item.itc}</td>
                      <td style={{ padding: '16px', fontSize: '13px', color: '#6b7280' }}>{item.examples}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Invoice Requirements */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '32px' }}>
              <FaFileInvoice style={{ color: '#7c3aed', fontSize: '28px' }} />
              <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827' }}>Invoice Requirements</h2>
            </div>
            <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '32px' }}>
              Every GST invoice must contain these elements:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              {invoiceRequirements.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', backgroundColor: '#f5f3ff', borderRadius: '10px' }}>
                  <FaCheckCircle style={{ color: '#7c3aed', flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', color: '#374151' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Filing Schedule */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              GST Filing Schedule
            </h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              {filingSchedule.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '20px 24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: '80px', textAlign: 'center' }}>
                    <span style={{ fontSize: '18px', fontWeight: '700', color: '#7c3aed' }}>{item.return}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>{item.description}</p>
                    <p style={{ fontSize: '13px', color: '#6b7280' }}>Due: {item.due}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '48px' }}>
              <FaQuestionCircle style={{ color: '#7c3aed', fontSize: '28px' }} />
              <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827' }}>Common GST Questions</h2>
            </div>
            <div style={{ display: 'grid', gap: '16px' }}>
              {faqs.map((faq, idx) => (
                <div key={idx} style={{ padding: '24px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>{faq.question}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.7 }}>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>
              Simplify GST Compliance
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>
              DineOpen automatically calculates GST, generates compliant invoices, and creates filing-ready reports.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/tools/gst-calculator"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '18px 32px', backgroundColor: 'white', color: '#7c3aed', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '16px' }}
              >
                <FaCalculator /> Try GST Calculator
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

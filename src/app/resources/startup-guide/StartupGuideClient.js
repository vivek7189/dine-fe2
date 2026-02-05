'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaCheckCircle, FaClipboardCheck, FaFileAlt, FaMapMarkerAlt, FaUtensils, FaUsers, FaBullhorn, FaRocket, FaArrowRight } from 'react-icons/fa';

export default function StartupGuideClient() {
  const steps = [
    {
      number: '01',
      title: 'Business Planning & Concept',
      duration: '2-4 weeks',
      icon: <FaFileAlt />,
      tasks: [
        'Define your restaurant concept (cuisine, style, target audience)',
        'Research your local market and competition',
        'Create a detailed business plan',
        'Calculate startup costs and arrange funding',
        'Choose a business structure (Proprietorship, LLP, Pvt Ltd)',
      ],
      tip: 'Use our free Business Plan Template to structure your planning.',
    },
    {
      number: '02',
      title: 'Legal & Licensing',
      duration: '4-8 weeks',
      icon: <FaClipboardCheck />,
      tasks: [
        'Register your business (GST, PAN, Shop Act)',
        'Apply for FSSAI Food License',
        'Get Fire Safety NOC',
        'Apply for Liquor License (if applicable)',
        'Get Health/Trade License from Municipal Corporation',
        'Signage License',
      ],
      tip: 'Start FSSAI application early - it can take 30-60 days.',
    },
    {
      number: '03',
      title: 'Location & Setup',
      duration: '4-12 weeks',
      icon: <FaMapMarkerAlt />,
      tasks: [
        'Scout and finalize location',
        'Negotiate lease terms',
        'Design layout and interior',
        'Kitchen equipment procurement',
        'Furniture, fixtures, and decor',
        'Utilities setup (electricity, water, gas)',
      ],
      tip: 'Location is critical. Prioritize foot traffic and visibility over rent savings.',
    },
    {
      number: '04',
      title: 'Menu & Suppliers',
      duration: '2-4 weeks',
      icon: <FaUtensils />,
      tasks: [
        'Finalize menu items and pricing',
        'Cost each dish and calculate margins',
        'Source reliable suppliers for ingredients',
        'Set up inventory management system',
        'Create recipes and portion standards',
        'Design and print menus',
      ],
      tip: 'Target 65-70% gross margin on food items.',
    },
    {
      number: '05',
      title: 'Team & Training',
      duration: '2-4 weeks',
      icon: <FaUsers />,
      tasks: [
        'Hire key positions (chef, manager, servers)',
        'Create job descriptions and salary structure',
        'Set up payroll and attendance system',
        'Train staff on menu, service, and hygiene',
        'Conduct mock service runs',
        'Set up POS and train on billing',
      ],
      tip: 'Train extensively on your POS system before opening day.',
    },
    {
      number: '06',
      title: 'Marketing & Launch',
      duration: '2-4 weeks',
      icon: <FaBullhorn />,
      tasks: [
        'Create social media presence',
        'Set up Google Business Profile',
        'Plan soft launch with friends/family',
        'List on Zomato, Swiggy, Dineout',
        'Plan opening promotion/event',
        'Collect customer feedback and iterate',
      ],
      tip: 'Soft launch for 1-2 weeks to work out kinks before grand opening.',
    },
  ];

  const licenses = [
    { name: 'FSSAI License', cost: '₹2,000 - ₹5,000', time: '30-60 days', required: true },
    { name: 'GST Registration', cost: 'Free', time: '7-15 days', required: true },
    { name: 'Shop & Establishment', cost: '₹500 - ₹2,000', time: '15-30 days', required: true },
    { name: 'Fire Safety NOC', cost: '₹5,000 - ₹15,000', time: '15-30 days', required: true },
    { name: 'Health/Trade License', cost: '₹1,000 - ₹5,000', time: '15-30 days', required: true },
    { name: 'Liquor License', cost: '₹5,00,000+', time: '60-90 days', required: false },
    { name: 'Music License (PPL/IPRS)', cost: '₹10,000 - ₹50,000/year', time: '7-15 days', required: false },
    { name: 'Signage License', cost: '₹500 - ₹5,000', time: '7-15 days', required: true },
  ];

  const costs = [
    { category: 'Interior & Setup', small: '₹5-10L', medium: '₹15-30L', large: '₹40-80L' },
    { category: 'Kitchen Equipment', small: '₹3-5L', medium: '₹8-15L', large: '₹20-40L' },
    { category: 'Furniture & Fixtures', small: '₹2-4L', medium: '₹6-12L', large: '₹15-30L' },
    { category: 'Licenses & Permits', small: '₹50K-1L', medium: '₹1-2L', large: '₹2-5L' },
    { category: 'Initial Inventory', small: '₹1-2L', medium: '₹3-5L', large: '₹8-15L' },
    { category: 'Marketing & Launch', small: '₹50K-1L', medium: '₹2-4L', large: '₹5-10L' },
    { category: 'Working Capital (3 months)', small: '₹3-5L', medium: '₹8-15L', large: '₹20-40L' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: '24px', marginBottom: '24px' }}>
              <FaRocket /> Complete Startup Guide
            </div>
            <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.2 }}>
              How to Open a Restaurant in India
            </h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              Step-by-step guide covering everything from concept to launch. Licenses, costs, timelines, and expert tips from 10,000+ restaurant owners.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/resources/business-plan" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#059669', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
                Get Business Plan Template
              </Link>
              <Link href="#steps" style={{ padding: '16px 32px', backgroundColor: 'transparent', border: '2px solid white', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
                See All Steps
              </Link>
            </div>
          </div>
        </section>

        {/* Timeline Overview */}
        <section style={{ backgroundColor: 'white', padding: '48px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '32px', textAlign: 'center' }}>
            <div>
              <p style={{ fontSize: '42px', fontWeight: '800', color: '#059669', marginBottom: '4px' }}>3-6</p>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Months to Launch</p>
            </div>
            <div>
              <p style={{ fontSize: '42px', fontWeight: '800', color: '#059669', marginBottom: '4px' }}>₹15-50L</p>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Typical Investment</p>
            </div>
            <div>
              <p style={{ fontSize: '42px', fontWeight: '800', color: '#059669', marginBottom: '4px' }}>8+</p>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Licenses Required</p>
            </div>
            <div>
              <p style={{ fontSize: '42px', fontWeight: '800', color: '#059669', marginBottom: '4px' }}>6</p>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Key Steps</p>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section id="steps" style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              6 Steps to Open Your Restaurant
            </h2>
            <div style={{ display: 'grid', gap: '32px' }}>
              {steps.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '24px', padding: '32px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <div style={{ flexShrink: 0 }}>
                    <div style={{ width: '64px', height: '64px', backgroundColor: '#d1fae5', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', fontSize: '24px', fontWeight: '800' }}>
                      {step.number}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111827' }}>{step.title}</h3>
                      <span style={{ padding: '4px 12px', backgroundColor: '#f3f4f6', borderRadius: '12px', fontSize: '12px', color: '#6b7280' }}>{step.duration}</span>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0' }}>
                      {step.tasks.map((task, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: '#374151', marginBottom: '10px' }}>
                          <FaCheckCircle style={{ color: '#10b981', marginTop: '2px', flexShrink: 0 }} /> {task}
                        </li>
                      ))}
                    </ul>
                    <div style={{ padding: '12px 16px', backgroundColor: '#fef3c7', borderRadius: '8px', fontSize: '14px', color: '#92400e' }}>
                      <strong>Pro Tip:</strong> {step.tip}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Licenses Table */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Required Licenses & Permits
            </h2>
            <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>License</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600' }}>Cost</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600' }}>Time</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600' }}>Required</th>
                  </tr>
                </thead>
                <tbody>
                  {licenses.map((license, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '14px 16px', fontWeight: '500' }}>{license.name}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: '14px' }}>{license.cost}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: '14px' }}>{license.time}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        {license.required ? (
                          <span style={{ color: '#dc2626', fontWeight: '600' }}>Yes</span>
                        ) : (
                          <span style={{ color: '#6b7280' }}>Optional</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Cost Breakdown */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Startup Cost Breakdown
            </h2>
            <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', backgroundColor: 'white' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Category</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600' }}>Small (20 covers)</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600' }}>Medium (40 covers)</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600' }}>Large (80+ covers)</th>
                  </tr>
                </thead>
                <tbody>
                  {costs.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '14px 16px', fontWeight: '500' }}>{item.category}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: '14px' }}>{item.small}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: '14px' }}>{item.medium}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: '14px' }}>{item.large}</td>
                    </tr>
                  ))}
                  <tr style={{ backgroundColor: '#d1fae5' }}>
                    <td style={{ padding: '14px 16px', fontWeight: '700' }}>Total Estimate</td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '700', color: '#059669' }}>₹15-25L</td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '700', color: '#059669' }}>₹45-85L</td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '700', color: '#059669' }}>₹1.1-2.2Cr</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#6b7280' }}>
              *Costs vary significantly by city and concept. Metro cities typically cost 30-50% more.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>
              Ready to Start Your Restaurant?
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>
              Get your free business plan template and start your journey today.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/resources/business-plan"
                style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#059669', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}
              >
                Get Business Plan Template
              </Link>
              <Link
                href="https://app.dineopen.com/register"
                style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'transparent', border: '2px solid white', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}
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

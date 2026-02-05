'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaFileAlt, FaChartLine, FaUsers, FaMapMarkerAlt, FaUtensils, FaRupeeSign, FaDownload, FaCheck, FaArrowRight } from 'react-icons/fa';

export default function BusinessPlanClient() {
  const sections = [
    {
      icon: <FaFileAlt size={24} />,
      title: 'Executive Summary',
      items: ['Restaurant concept & vision', 'Mission statement', 'Key financial highlights', 'Funding requirements'],
    },
    {
      icon: <FaUsers size={24} />,
      title: 'Market Analysis',
      items: ['Target customer demographics', 'Competitor analysis', 'Industry trends', 'SWOT analysis'],
    },
    {
      icon: <FaMapMarkerAlt size={24} />,
      title: 'Location Strategy',
      items: ['Site selection criteria', 'Foot traffic analysis', 'Lease considerations', 'Build-out requirements'],
    },
    {
      icon: <FaUtensils size={24} />,
      title: 'Menu & Operations',
      items: ['Menu concept & pricing', 'Kitchen workflow', 'Supplier relationships', 'Quality standards'],
    },
    {
      icon: <FaChartLine size={24} />,
      title: 'Marketing Plan',
      items: ['Brand positioning', 'Launch strategy', 'Digital marketing', 'Customer retention'],
    },
    {
      icon: <FaRupeeSign size={24} />,
      title: 'Financial Projections',
      items: ['Startup costs breakdown', 'Revenue forecasts (3 years)', 'Break-even analysis', 'Cash flow projections'],
    },
  ];

  const templates = [
    { type: 'Fine Dining', pages: '25-30', focus: 'Premium experience, wine program, chef credentials' },
    { type: 'Casual Dining', pages: '20-25', focus: 'Family-friendly, efficient turnover, value proposition' },
    { type: 'QSR/Fast Food', pages: '15-20', focus: 'Speed, scalability, franchise potential' },
    { type: 'Cafe/Coffee Shop', pages: '15-18', focus: 'Ambiance, loyalty programs, quick service' },
    { type: 'Cloud Kitchen', pages: '12-15', focus: 'Delivery-first, multi-brand, low overhead' },
  ];

  const faqs = [
    {
      q: 'Why do I need a restaurant business plan?',
      a: 'A business plan is essential for securing bank loans, attracting investors, getting FSSAI approval, and guiding your own decision-making. It forces you to think through every aspect of your business before investing lakhs.',
    },
    {
      q: 'How detailed should my financial projections be?',
      a: 'Include at least 3 years of projections. Break down startup costs, monthly operating expenses, revenue estimates, and calculate break-even point. Banks and investors will scrutinize these numbers.',
    },
    {
      q: 'What makes a restaurant business plan stand out?',
      a: 'Clear differentiation from competitors, realistic financials backed by research, deep understanding of your target customer, and a credible team. Avoid overly optimistic projections.',
    },
    {
      q: 'How long does it take to write a business plan?',
      a: 'A thorough business plan takes 2-4 weeks. Rush it and you\'ll miss critical details. Our template helps you work through each section systematically.',
    },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: '24px', marginBottom: '24px' }}>
              <FaDownload /> Free Download
            </div>
            <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.2 }}>
              Restaurant Business Plan Template
            </h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              Professional template used by 5,000+ restaurant owners. Includes financial projections, market analysis, and everything banks and investors want to see.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="https://app.dineopen.com/register" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#7c3aed', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <FaDownload /> Download Free Template
              </Link>
              <Link href="/tools/break-even-calculator" style={{ padding: '16px 32px', backgroundColor: 'transparent', border: '2px solid white', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
                Try Break-Even Calculator
              </Link>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              What&apos;s Included in the Template
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {sections.map((section, idx) => (
                <div key={idx} style={{ padding: '24px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: '#ede9fe', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed', marginBottom: '16px' }}>
                    {section.icon}
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>{section.title}</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {section.items.map((item, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                        <FaCheck style={{ color: '#10b981', flexShrink: 0 }} /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Templates by Type */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Templates for Every Restaurant Type
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              Choose the template that matches your concept
            </p>
            <div style={{ display: 'grid', gap: '16px' }}>
              {templates.map((template, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', backgroundColor: '#f9fafb', borderRadius: '12px', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{template.type}</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>{template.focus}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>{template.pages} pages</span>
                    <Link href="https://app.dineopen.com/register" style={{ padding: '10px 20px', backgroundColor: '#7c3aed', color: 'white', borderRadius: '6px', fontWeight: '600', textDecoration: 'none', fontSize: '14px' }}>
                      Download
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Financial Section Preview */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Financial Projections Sample
            </h2>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>Sample: Casual Dining Restaurant (40 covers)</h3>
              </div>
              <div style={{ padding: '24px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Category</th>
                      <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Monthly</th>
                      <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Yearly</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px' }}>Projected Revenue</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#059669' }}>₹12,00,000</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#059669' }}>₹1,44,00,000</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px' }}>Food Cost (30%)</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>₹3,60,000</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>₹43,20,000</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px' }}>Labor Cost (25%)</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>₹3,00,000</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>₹36,00,000</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px' }}>Rent & Utilities</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>₹2,00,000</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>₹24,00,000</td>
                    </tr>
                    <tr style={{ backgroundColor: '#f9fafb' }}>
                      <td style={{ padding: '12px', fontWeight: '600' }}>Net Profit</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#059669' }}>₹2,40,000</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#059669' }}>₹28,80,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Frequently Asked Questions
            </h2>
            <div style={{ display: 'grid', gap: '24px' }}>
              {faqs.map((faq, idx) => (
                <div key={idx} style={{ padding: '24px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>{faq.q}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.7 }}>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related Tools */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Free Tools to Help You Plan
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
              {[
                { title: 'Break-Even Calculator', desc: 'Find out when your restaurant becomes profitable', href: '/tools/break-even-calculator' },
                { title: 'Profit Margin Calculator', desc: 'Calculate food costs and profit margins', href: '/tools/profit-margin-calculator' },
                { title: 'Labor Cost Calculator', desc: 'Plan your staffing budget accurately', href: '/tools/labor-cost-calculator' },
                { title: 'Restaurant Name Generator', desc: 'Get creative name ideas for your concept', href: '/tools/restaurant-name-generator' },
              ].map((tool, idx) => (
                <Link key={idx} href={tool.href} style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', textDecoration: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', transition: 'transform 0.2s', display: 'block' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{tool.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>{tool.desc}</p>
                  <span style={{ fontSize: '14px', color: '#7c3aed', fontWeight: '600' }}>Try Free →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>
              Ready to Start Your Restaurant Journey?
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>
              Get your free business plan template and join 10,000+ restaurant owners using DineOpen.
            </p>
            <Link
              href="https://app.dineopen.com/register"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '18px 40px', backgroundColor: 'white', color: '#7c3aed', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}
            >
              <FaDownload /> Download Free Template
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

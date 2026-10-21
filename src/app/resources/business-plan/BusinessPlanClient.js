'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaCheck, FaCopy, FaPrint, FaMagic, FaArrowRight } from 'react-icons/fa';
import { PLAN_SECTIONS, STARTUP_RANGES, SAMPLE_PL, FAQS } from './planContent';

const inr = (n) => `${n < 0 ? '-' : ''}₹${Math.abs(n).toLocaleString('en-IN')}`;

const templateText = () =>
  ['RESTAURANT BUSINESS PLAN', '', ...PLAN_SECTIONS.flatMap((s) => [s.title.toUpperCase(), ...s.prompts.map((p) => `- ${p}:`), ''])].join('\n');

const card = { background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', padding: '24px' };
const h2 = { fontSize: '30px', fontWeight: 800, color: '#111827', marginBottom: '16px', lineHeight: 1.25 };
const section = { padding: '56px 20px' };
const wrap = { maxWidth: '900px', margin: '0 auto' };

export default function BusinessPlanClient() {
  const [copied, setCopied] = useState(false);

  const copyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(templateText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <style>{`@media print { .no-print { display: none !important; } body { background: white; } }`}</style>
      <div className="no-print"><CommonHeader /></div>
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section className="no-print" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)', color: 'white', padding: '64px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '860px', margin: '0 auto' }}>
            <h1 style={{ fontSize: 'clamp(30px, 5vw, 46px)', fontWeight: 800, marginBottom: '16px', lineHeight: 1.2 }}>
              Restaurant Business Plan Template (Free, India 2026)
            </h1>
            <p style={{ fontSize: '19px', opacity: 0.95, margin: '0 auto 28px', maxWidth: '680px' }}>
              A fill-in template with a worked example, startup costs by format and a profit sample. Copy it, print it, or let our generator write the first draft. No sign-up.
            </p>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/tools/business-plan-generator" style={{ padding: '15px 28px', backgroundColor: 'white', color: '#5b21b6', borderRadius: '10px', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <FaMagic /> Generate my plan free
              </Link>
              <a href="#template" style={{ padding: '15px 28px', border: '2px solid white', color: 'white', borderRadius: '10px', fontWeight: 700, textDecoration: 'none' }}>
                Use the template
              </a>
            </div>
          </div>
        </section>

        {/* Quick answer */}
        <section className="no-print" style={{ padding: '40px 20px 0' }}>
          <div style={{ ...wrap, background: '#fff7ed', border: '1px solid #fed7aa', borderLeft: '5px solid #ef4444', borderRadius: '12px', padding: '20px 24px' }}>
            <p style={{ margin: '0 0 8px', fontWeight: 800, fontSize: '18px', color: '#111827' }}>Quick answer: what goes into a restaurant business plan?</p>
            <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.7, color: '#1f2937' }}>
              Seven parts: <strong>executive summary, concept and menu, market and competition, location, operations and team, marketing, and a financial plan</strong> (startup cost, monthly profit, break-even). Banks and schemes like Mudra want to see realistic numbers and your own contribution.
            </p>
          </div>
        </section>

        {/* Startup cost by format */}
        <section className="no-print" style={section}>
          <div style={wrap}>
            <h2 style={h2}>How much will you need? Startup cost by format</h2>
            <p style={{ fontSize: '16px', color: '#4b5563', marginBottom: '20px' }}>Typical ranges in Indian cities. Each format links to a detailed cost guide.</p>
            <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px', minWidth: '420px' }}>
                <thead>
                  <tr style={{ background: '#111827', color: 'white' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Format</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Typical startup cost</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Guide</th>
                  </tr>
                </thead>
                <tbody>
                  {STARTUP_RANGES.map((r) => (
                    <tr key={r.format} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px 16px' }}>{r.format}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700 }}>{r.cost}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <Link href={r.guide} style={{ color: '#7c3aed', fontWeight: 600, textDecoration: 'none' }}>Read →</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* The template */}
        <section id="template" style={{ ...section, backgroundColor: 'white' }}>
          <div style={wrap}>
            <h2 style={h2}>The template: answer these points under each heading</h2>
            <div className="no-print" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
              <button onClick={copyTemplate} style={{ padding: '12px 20px', background: '#7c3aed', color: 'white', border: 0, borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                {copied ? <FaCheck /> : <FaCopy />} {copied ? 'Copied: paste into Word or Google Docs' : 'Copy template'}
              </button>
              <button onClick={() => window.print()} style={{ padding: '12px 20px', background: 'white', color: '#7c3aed', border: '2px solid #7c3aed', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <FaPrint /> Print / save as PDF
              </button>
            </div>
            <div style={{ display: 'grid', gap: '16px' }}>
              {PLAN_SECTIONS.map((s) => (
                <div key={s.title} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px 22px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: '0 0 10px' }}>{s.title}</h3>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#374151', fontSize: '16px', lineHeight: 1.7 }}>
                    {s.prompts.map((p) => <li key={p}>{p}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sample P&L */}
        <section style={section}>
          <div style={wrap}>
            <h2 style={h2}>Example financial plan: casual dining restaurant</h2>
            <p style={{ fontSize: '16px', color: '#4b5563', marginBottom: '20px' }}>
              About 40 seats, ₹12 lakh monthly revenue. A 12% net margin is realistic for casual dining in India (most restaurants land between 5% and 12%).
            </p>
            <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px', minWidth: '420px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Line</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Monthly</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Yearly</th>
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_PL.map((r) => (
                    <tr key={r.label} style={{ borderBottom: '1px solid #e5e7eb', background: r.note === 'total' ? '#f0fdf4' : 'white', fontWeight: r.note === 'total' ? 700 : 400 }}>
                      <td style={{ padding: '12px 16px' }}>{r.label}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>{inr(r.monthly)}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>{inr(r.monthly * 12)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="no-print" style={{ fontSize: '15px', color: '#4b5563', marginTop: '16px' }}>
              Plug in your own numbers with the <Link href="/tools/break-even-calculator" style={{ color: '#7c3aed', fontWeight: 600 }}>break-even calculator</Link> and the <Link href="/tools/profit-margin-calculator" style={{ color: '#7c3aed', fontWeight: 600 }}>profit margin calculator</Link>.
            </p>
          </div>
        </section>

        {/* Generator CTA */}
        <section className="no-print" style={{ padding: '0 20px 56px' }}>
          <div style={{ ...wrap, ...card, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', border: '2px solid #ede9fe' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>Want a first draft written for you?</h3>
              <p style={{ margin: 0, color: '#4b5563' }}>Enter your concept, city, seats and budget. The free generator writes all seven sections.</p>
            </div>
            <Link href="/tools/business-plan-generator" style={{ padding: '13px 22px', background: '#7c3aed', color: 'white', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Open the generator <FaArrowRight />
            </Link>
          </div>
        </section>

        {/* FAQs */}
        <section className="no-print" style={{ ...section, backgroundColor: 'white' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ ...h2, textAlign: 'center' }}>Frequently asked questions</h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              {FAQS.map((f) => (
                <div key={f.q} style={{ padding: '20px 22px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>{f.q}</h3>
                  <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: 1.7, margin: 0 }}>{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="no-print" style={{ padding: '56px 20px', background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '30px', fontWeight: 800, marginBottom: '12px' }}>Opening soon? Run it on DineOpen</h2>
            <p style={{ fontSize: '17px', opacity: 0.95, marginBottom: '24px' }}>
              Billing, KOT, inventory and daily profit reports on the phone or tablet you already have. ₹899/month, 7 days free.
            </p>
            <Link href="/login?utm_source=resources&utm_medium=cta&utm_campaign=business-plan" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '15px 34px', backgroundColor: 'white', color: '#5b21b6', borderRadius: '10px', fontWeight: 700, textDecoration: 'none' }}>
              Start free trial <FaArrowRight />
            </Link>
          </div>
        </section>
      </div>
      <div className="no-print"><Footer /></div>
    </>
  );
}

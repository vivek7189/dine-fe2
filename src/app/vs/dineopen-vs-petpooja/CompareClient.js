'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';

const comparisonData = [
  { feature: 'Monthly Price', dineopen: '₹300/month', petpooja: '₹1,000+/month', winner: 'dineopen' },
  { feature: 'Transaction Fees', dineopen: '0%', petpooja: '1.5-2%', winner: 'dineopen' },
  { feature: 'AI Voice Ordering', dineopen: '✓', petpooja: '✗', winner: 'dineopen' },
  { feature: 'AI Chat Assistant', dineopen: '✓', petpooja: '✗', winner: 'dineopen' },
  { feature: 'AI Menu Extraction', dineopen: '✓', petpooja: '✗', winner: 'dineopen' },
  { feature: 'Cloud POS', dineopen: '✓', petpooja: '✓', winner: 'tie' },
  { feature: 'GST Billing', dineopen: '✓', petpooja: '✓', winner: 'tie' },
  { feature: 'Zomato Integration', dineopen: '✓', petpooja: '✓', winner: 'tie' },
  { feature: 'Swiggy Integration', dineopen: '✓', petpooja: '✓', winner: 'tie' },
  { feature: 'Kitchen Display System', dineopen: '✓', petpooja: '✓', winner: 'tie' },
  { feature: 'Waiter App', dineopen: '✓', petpooja: '✓', winner: 'tie' },
  { feature: 'Inventory Management', dineopen: '✓', petpooja: '✓', winner: 'tie' },
  { feature: 'Loyalty Program', dineopen: '✓ Advanced', petpooja: 'Basic', winner: 'dineopen' },
  { feature: 'Multi-Location', dineopen: 'Unlimited (Blaze)', petpooja: 'Extra cost', winner: 'dineopen' },
  { feature: 'Offline Mode', dineopen: '✓', petpooja: '✓', winner: 'tie' },
  { feature: 'Free Trial', dineopen: '30 days', petpooja: '14 days', winner: 'dineopen' },
  { feature: 'Countries Supported', dineopen: '20+', petpooja: 'India only', winner: 'dineopen' },
  { feature: 'WhatsApp Ordering', dineopen: '✓', petpooja: '✗', winner: 'dineopen' },
];

const pricingScenarios = [
  {
    label: 'Small Restaurant',
    monthlyTxn: 300000,
    dineopen: { subscription: 300, feePercent: 0 },
    petpooja: { subscription: 1000, feePercent: 1.5 },
    outlets: 1,
  },
  {
    label: 'Mid-Size Restaurant',
    monthlyTxn: 800000,
    dineopen: { subscription: 300, feePercent: 0 },
    petpooja: { subscription: 1000, feePercent: 1.5 },
    outlets: 1,
  },
  {
    label: 'Chain (3 Outlets)',
    monthlyTxn: 2000000,
    dineopen: { subscription: 300, feePercent: 0 },
    petpooja: { subscription: 1000, feePercent: 1.5 },
    outlets: 3,
  },
];

function formatINR(num) {
  return '₹' + num.toLocaleString('en-IN');
}

export default function CompareClient() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <CommonHeader />

      {/* Hero Section */}
      <section style={{
        padding: '80px 20px 60px',
        background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f5e9 100%)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-block',
            backgroundColor: '#e3f2fd',
            color: '#1565c0',
            padding: '8px 20px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '24px',
          }}>
            Honest Side-by-Side Comparison
          </div>
          <h1 style={{
            fontSize: '42px',
            fontWeight: '800',
            color: '#111827',
            marginBottom: '20px',
            lineHeight: '1.2',
          }}>
            DineOpen vs Petpooja: Honest Comparison (2026)
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#4b5563',
            lineHeight: '1.7',
            maxWidth: '650px',
            margin: '0 auto 16px',
          }}>
            Both are solid restaurant POS platforms. We will let the facts speak — feature by feature, price by price — so you can decide which one fits your business.
          </p>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            fontStyle: 'italic',
          }}>
            No spin, no bashing. Just an honest breakdown.
          </p>
        </div>
      </section>

      {/* Quick Summary */}
      <section style={{ padding: '60px 20px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '30px', fontWeight: '800', textAlign: 'center', color: '#111827', marginBottom: '40px' }}>
            Quick Summary
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
            {/* DineOpen Card */}
            <div style={{
              border: '2px solid #2563eb',
              borderRadius: '16px',
              padding: '32px',
              backgroundColor: '#eff6ff',
            }}>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb', marginBottom: '16px' }}>DineOpen</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {[
                  '₹300/month starting price',
                  'AI-powered (voice ordering, chat, menu extraction)',
                  'Zero transaction fees',
                  'Available in 20+ countries',
                  '30-day free trial',
                ].map((item, i) => (
                  <li key={i} style={{ padding: '8px 0', color: '#374151', fontSize: '15px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#16a34a', fontWeight: '700', flexShrink: 0 }}>&#10003;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Petpooja Card */}
            <div style={{
              border: '2px solid #7c3aed',
              borderRadius: '16px',
              padding: '32px',
              backgroundColor: '#f5f3ff',
            }}>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#7c3aed', marginBottom: '16px' }}>Petpooja</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {[
                  '₹1,000+/month starting price',
                  'Established brand with large support team',
                  '1.5-2% transaction fees',
                  'India-focused platform',
                  '14-day free trial',
                ].map((item, i) => (
                  <li key={i} style={{ padding: '8px 0', color: '#374151', fontSize: '15px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#7c3aed', fontWeight: '700', flexShrink: 0 }}>&#10003;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature-by-Feature Comparison Table */}
      <section style={{ padding: '60px 20px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '30px', fontWeight: '800', textAlign: 'center', color: '#111827', marginBottom: '40px' }}>
            Feature-by-Feature Comparison
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
              <thead>
                <tr style={{ backgroundColor: '#111827' }}>
                  <th style={{ padding: '16px 20px', textAlign: 'left', color: '#ffffff', fontSize: '15px', fontWeight: '700' }}>Feature</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center', color: '#60a5fa', fontSize: '15px', fontWeight: '700' }}>DineOpen</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center', color: '#c4b5fd', fontSize: '15px', fontWeight: '700' }}>Petpooja</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, idx) => (
                  <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>{row.feature}</td>
                    <td style={{
                      padding: '14px 20px',
                      textAlign: 'center',
                      fontSize: '14px',
                      color: row.winner === 'dineopen' ? '#16a34a' : '#374151',
                      fontWeight: row.winner === 'dineopen' ? '700' : '400',
                    }}>
                      {row.dineopen}
                      {row.winner === 'dineopen' && <span style={{ marginLeft: '6px', color: '#16a34a' }}>&#10003;</span>}
                    </td>
                    <td style={{
                      padding: '14px 20px',
                      textAlign: 'center',
                      fontSize: '14px',
                      color: row.winner === 'petpooja' ? '#16a34a' : '#374151',
                      fontWeight: row.winner === 'petpooja' ? '700' : '400',
                    }}>
                      {row.petpooja}
                      {row.winner === 'petpooja' && <span style={{ marginLeft: '6px', color: '#16a34a' }}>&#10003;</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#9ca3af' }}>
            &#10003; Green checkmark indicates the winner in each category
          </p>
        </div>
      </section>

      {/* Where DineOpen Wins */}
      <section style={{ padding: '60px 20px', backgroundColor: '#eff6ff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '30px', fontWeight: '800', textAlign: 'center', color: '#111827', marginBottom: '12px' }}>
            Where DineOpen Wins
          </h2>
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '40px', fontSize: '16px' }}>
            Areas where DineOpen has a clear advantage
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {[
              { title: 'AI Features', desc: 'Voice ordering, chat assistant, and menu extraction that automate operations and reduce staff workload.' },
              { title: 'Zero Transaction Fees', desc: 'Keep 100% of your revenue. No hidden per-transaction charges eating into your margins.' },
              { title: 'Lower Price', desc: 'Starting at ₹300/month — less than a third of Petpooja, with more features included.' },
              { title: 'Global Availability', desc: 'Available in 20+ countries with multi-currency support. Not limited to India.' },
            ].map((card, i) => (
              <div key={i} style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #bfdbfe',
              }}>
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#2563eb', marginBottom: '8px' }}>{card.title}</h3>
                <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.6', margin: 0 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Where Petpooja Wins */}
      <section style={{ padding: '60px 20px', backgroundColor: '#f5f3ff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '30px', fontWeight: '800', textAlign: 'center', color: '#111827', marginBottom: '12px' }}>
            Where Petpooja Wins
          </h2>
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '40px', fontSize: '16px' }}>
            Credit where it is due — Petpooja has real strengths
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {[
              { title: 'Longer Track Record', desc: 'Petpooja has been in the market longer and has a proven track record with thousands of Indian restaurants.' },
              { title: 'Larger India Support Team', desc: 'A bigger on-ground support team across Indian cities for in-person setup and troubleshooting.' },
              { title: 'More Third-Party Integrations', desc: 'A wider ecosystem of third-party integrations built over years, including accounting and ERP tools.' },
              { title: 'Established Brand Recognition', desc: 'Well-known name in the Indian restaurant industry. Many restaurant owners already know and trust the brand.' },
            ].map((card, i) => (
              <div key={i} style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #ddd6fe',
              }}>
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#7c3aed', marginBottom: '8px' }}>{card.title}</h3>
                <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.6', margin: 0 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Breakdown */}
      <section style={{ padding: '60px 20px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '30px', fontWeight: '800', textAlign: 'center', color: '#111827', marginBottom: '12px' }}>
            Pricing Breakdown (1-Year Cost)
          </h2>
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '40px', fontSize: '16px' }}>
            Real cost including subscription and transaction fees over 12 months
          </p>
          <div style={{ display: 'grid', gap: '24px' }}>
            {pricingScenarios.map((s, i) => {
              const dineSub = s.dineopen.subscription * 12 * s.outlets;
              const dineFees = s.monthlyTxn * (s.dineopen.feePercent / 100) * 12;
              const dineTotal = dineSub + dineFees;
              const ppSub = s.petpooja.subscription * 12 * s.outlets;
              const ppFees = s.monthlyTxn * (s.petpooja.feePercent / 100) * 12;
              const ppTotal = ppSub + ppFees;
              const savings = ppTotal - dineTotal;

              return (
                <div key={i} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '28px',
                  backgroundColor: '#f9fafb',
                }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '20px' }}>
                    {s.label} <span style={{ fontWeight: '400', color: '#6b7280', fontSize: '15px' }}>({formatINR(s.monthlyTxn)}/month transactions{s.outlets > 1 ? `, ${s.outlets} outlets` : ''})</span>
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{
                      backgroundColor: '#eff6ff',
                      borderRadius: '10px',
                      padding: '20px',
                      border: '1px solid #bfdbfe',
                    }}>
                      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', fontWeight: '600' }}>DineOpen</p>
                      <p style={{ fontSize: '13px', color: '#374151', margin: '4px 0' }}>Subscription: {formatINR(dineSub)}/year</p>
                      <p style={{ fontSize: '13px', color: '#374151', margin: '4px 0' }}>Transaction fees: {formatINR(dineFees)}/year</p>
                      <p style={{ fontSize: '24px', fontWeight: '800', color: '#16a34a', marginTop: '12px', marginBottom: 0 }}>{formatINR(dineTotal)}<span style={{ fontSize: '14px', fontWeight: '400' }}>/year</span></p>
                    </div>
                    <div style={{
                      backgroundColor: '#f5f3ff',
                      borderRadius: '10px',
                      padding: '20px',
                      border: '1px solid #ddd6fe',
                    }}>
                      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', fontWeight: '600' }}>Petpooja</p>
                      <p style={{ fontSize: '13px', color: '#374151', margin: '4px 0' }}>Subscription: {formatINR(ppSub)}/year</p>
                      <p style={{ fontSize: '13px', color: '#374151', margin: '4px 0' }}>Transaction fees: {formatINR(ppFees)}/year</p>
                      <p style={{ fontSize: '24px', fontWeight: '800', color: '#dc2626', marginTop: '12px', marginBottom: 0 }}>{formatINR(ppTotal)}<span style={{ fontSize: '14px', fontWeight: '400' }}>/year</span></p>
                    </div>
                  </div>
                  <div style={{
                    marginTop: '16px',
                    backgroundColor: '#dcfce7',
                    borderRadius: '8px',
                    padding: '12px 20px',
                    textAlign: 'center',
                  }}>
                    <p style={{ fontSize: '16px', fontWeight: '700', color: '#15803d', margin: 0 }}>
                      Save {formatINR(savings)}/year with DineOpen
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Who Should Choose DineOpen */}
      <section style={{ padding: '60px 20px', backgroundColor: '#f0f9ff' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '30px', fontWeight: '800', textAlign: 'center', color: '#111827', marginBottom: '32px' }}>
            Who Should Choose DineOpen?
          </h2>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '32px',
            border: '1px solid #bfdbfe',
          }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                'New restaurants looking for a modern, affordable POS from day one',
                'Tech-savvy owners who want AI-powered automation (voice ordering, chat assistant)',
                'Restaurant chains that need unlimited multi-location support without extra fees',
                'Budget-conscious operators who want to eliminate transaction fees entirely',
                'Businesses expanding internationally — DineOpen works in 20+ countries',
                'Owners who want WhatsApp ordering to reach more customers',
              ].map((item, i) => (
                <li key={i} style={{
                  padding: '12px 0',
                  borderBottom: i < 5 ? '1px solid #f3f4f6' : 'none',
                  fontSize: '15px',
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}>
                  <span style={{ color: '#2563eb', fontWeight: '700', fontSize: '18px', flexShrink: 0 }}>&#10140;</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Who Should Choose Petpooja */}
      <section style={{ padding: '60px 20px', backgroundColor: '#faf5ff' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '30px', fontWeight: '800', textAlign: 'center', color: '#111827', marginBottom: '32px' }}>
            Who Should Choose Petpooja?
          </h2>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '32px',
            border: '1px solid #ddd6fe',
          }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                'Restaurants already on Petpooja with deep integrations they don\'t want to rebuild',
                'Businesses that need a large local on-ground support team across Indian cities',
                'Enterprises with custom needs requiring dedicated account management',
                'Owners who prefer an established, well-known brand with a long track record',
              ].map((item, i) => (
                <li key={i} style={{
                  padding: '12px 0',
                  borderBottom: i < 3 ? '1px solid #f3f4f6' : 'none',
                  fontSize: '15px',
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}>
                  <span style={{ color: '#7c3aed', fontWeight: '700', fontSize: '18px', flexShrink: 0 }}>&#10140;</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* The Verdict */}
      <section style={{ padding: '60px 20px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '30px', fontWeight: '800', color: '#111827', marginBottom: '24px' }}>
            The Verdict
          </h2>
          <div style={{
            backgroundColor: '#f9fafb',
            borderRadius: '16px',
            padding: '40px 32px',
            border: '1px solid #e5e7eb',
          }}>
            <p style={{ fontSize: '17px', color: '#374151', lineHeight: '1.8', margin: '0 0 16px 0' }}>
              If you want <strong>AI features, zero transaction fees, and modern tech at a lower price</strong>, DineOpen is the clear winner. It is built for the future of restaurant management with automation at its core.
            </p>
            <p style={{ fontSize: '17px', color: '#374151', lineHeight: '1.8', margin: '0 0 16px 0' }}>
              If you need an <strong>established India-focused brand with a large local support team</strong> and you are already deeply integrated into Petpooja's ecosystem, Petpooja remains a solid choice.
            </p>
            <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: '1.7', margin: 0, fontStyle: 'italic' }}>
              Either way, we recommend trying DineOpen's free 30-day trial. You can test everything risk-free and decide based on your own experience.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '80px 20px',
        background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '34px', fontWeight: '800', color: '#ffffff', marginBottom: '16px' }}>
            Try DineOpen Free for 30 Days
          </h2>
          <p style={{ fontSize: '18px', color: '#dbeafe', marginBottom: '32px', lineHeight: '1.6' }}>
            See the difference yourself. No credit card required. Full access to all features including AI voice ordering.
          </p>
          <Link
            href="https://dineopen.com/login"
            style={{
              display: 'inline-block',
              backgroundColor: '#ffffff',
              color: '#1e40af',
              padding: '16px 40px',
              borderRadius: '10px',
              fontSize: '18px',
              fontWeight: '800',
              textDecoration: 'none',
              transition: 'transform 0.2s',
            }}
          >
            Start Free Trial — See the Difference
          </Link>
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
            {['No credit card needed', '30-day full access', 'Cancel anytime'].map((item, i) => (
              <span key={i} style={{ color: '#bfdbfe', fontSize: '14px' }}>
                &#10003; {item}
              </span>
            ))}
          </div>
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link href="/pricing" style={{ color: '#93c5fd', fontSize: '14px', textDecoration: 'underline' }}>View Pricing</Link>
            <Link href="/products/ai-agent" style={{ color: '#93c5fd', fontSize: '14px', textDecoration: 'underline' }}>Explore AI Agent</Link>
            <Link href="/products/pos-software" style={{ color: '#93c5fd', fontSize: '14px', textDecoration: 'underline' }}>POS Software</Link>
            <Link href="/alternatives/petpooja" style={{ color: '#93c5fd', fontSize: '14px', textDecoration: 'underline' }}>Petpooja Alternative</Link>
            <Link href="/tools/roi-calculator" style={{ color: '#93c5fd', fontSize: '14px', textDecoration: 'underline' }}>ROI Calculator</Link>
          </div>
        </div>
      </section>

      <InternalLinks currentPath="/vs/dineopen-vs-petpooja" variant="alternative" />
      <Footer />
    </div>
  );
}
